import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IN_FILTER = 300;
const MAX_STORAGE_REMOVE = 1000;
const FOLDER = (weddingId: string) => `weddings/${weddingId}`;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function isMissing(error: { message?: string }): boolean {
  const msg = (error?.message ?? "").toLowerCase();
  return (
    msg.includes("not found") ||
    msg.includes("does not exist") ||
    msg.includes("no such object") ||
    msg.includes("bucket not found")
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: weddingId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("studio_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff) {
    return NextResponse.json(
      { error: "No studio linked to this account" },
      { status: 403 }
    );
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, studio_id")
    .eq("id", weddingId)
    .maybeSingle();

  if (!wedding) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  if (wedding.studio_id !== staff.studio_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // 1) Collect every file path for this wedding, from the media rows and a
  //    folder scan (catches any stray files not present in the DB).
  const { data: media, error: mediaError } = await admin
    .from("media")
    .select("id, storage_path, preview_path")
    .eq("wedding_id", weddingId);

  if (mediaError) {
    console.error("[wedding-delete] media lookup failed:", mediaError);
    return NextResponse.json(
      { error: `Failed to list media: ${mediaError.message}` },
      { status: 500 }
    );
  }

  const originalPaths = new Set<string>();
  const previewPaths = new Set<string>();
  const mediaIds: string[] = [];

  for (const item of media ?? []) {
    if (item.id) mediaIds.push(item.id);
    if (item.storage_path?.startsWith("originals/")) {
      originalPaths.add(item.storage_path.slice("originals/".length));
    }
    if (item.preview_path?.startsWith("previews/")) {
      previewPaths.add(item.preview_path.slice("previews/".length));
    }
  }

  const folder = FOLDER(weddingId);
  const { data: originalsInFolder } = await admin.storage
    .from("originals")
    .list(folder, { limit: MAX_STORAGE_REMOVE });
  for (const file of originalsInFolder ?? []) {
    originalPaths.add(`${folder}/${file.name}`);
  }

  const { data: previewsInFolder } = await admin.storage
    .from("previews")
    .list(folder, { limit: MAX_STORAGE_REMOVE });
  for (const file of previewsInFolder ?? []) {
    previewPaths.add(`${folder}/${file.name}`);
  }

  // 2) Best-effort storage cleanup. Missing files are tolerated and surfaced
  //    as warnings; the database deletes below never depend on this step.
  const warnings: string[] = [];

  async function removePaths(bucket: string, paths: Set<string>) {
    const list = [...paths];
    for (const batch of chunk(list, MAX_STORAGE_REMOVE)) {
      const { error } = await admin.storage.from(bucket).remove(batch);
      if (error && !isMissing(error)) {
        warnings.push(`${bucket}: ${error.message}`);
      }
    }
  }

  await removePaths("originals", originalPaths);
  await removePaths("previews", previewPaths);

  // 3) Delete all selections linked to this wedding's media.
  for (const ids of chunk(mediaIds, MAX_IN_FILTER)) {
    const { error } = await admin.from("selections").delete().in("media_id", ids);
    if (error) {
      console.error("[wedding-delete] selections delete failed:", error);
      return NextResponse.json(
        { error: `Failed to remove selections: ${error.message}` },
        { status: 500 }
      );
    }
  }

  // 4) Delete all media rows for this wedding.
  const { error: mediaDeleteError } = await admin
    .from("media")
    .delete()
    .eq("wedding_id", weddingId);

  if (mediaDeleteError) {
    console.error("[wedding-delete] media delete failed:", mediaDeleteError);
    return NextResponse.json(
      { error: `Failed to remove media records: ${mediaDeleteError.message}` },
      { status: 500 }
    );
  }

  // 5) Delete the wedding itself.
  const { error: weddingDeleteError } = await admin
    .from("weddings")
    .delete()
    .eq("id", weddingId);

  if (weddingDeleteError) {
    console.error("[wedding-delete] wedding delete failed:", weddingDeleteError);
    return NextResponse.json(
      { error: `Failed to remove wedding: ${weddingDeleteError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    deleted: weddingId,
    mediaCount: mediaIds.length,
    warnings,
  });
}
