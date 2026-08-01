import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function stripPrefix(
  path: string | null | undefined,
  prefix: string
): string | undefined {
  if (!path) return undefined;
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

function isMissing(error: { message?: string }): boolean {
  const msg = (error?.message ?? "").toLowerCase();
  return (
    msg.includes("not found") ||
    msg.includes("does not exist") ||
    msg.includes("no such object")
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const { id: weddingId, mediaId } = await params;

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

  const { data: mediaItem, error: mediaError } = await supabase
    .from("media")
    .select("id, storage_path, preview_path")
    .eq("id", mediaId)
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (mediaError) {
    console.error("[media-delete] media lookup failed:", mediaError);
    return NextResponse.json({ error: mediaError.message }, { status: 500 });
  }

  if (!mediaItem) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  // 1) Remove any client selections for this photo first (no orphans left behind).
  const { error: selectionsError } = await admin
    .from("selections")
    .delete()
    .eq("media_id", mediaId);

  if (selectionsError) {
    console.error("[media-delete] selections delete failed:", selectionsError);
    return NextResponse.json(
      { error: `Failed to remove selections: ${selectionsError.message}` },
      { status: 500 }
    );
  }

  // 2) Remove the media row itself.
  const { error: mediaDeleteError } = await admin
    .from("media")
    .delete()
    .eq("id", mediaId);

  if (mediaDeleteError) {
    console.error("[media-delete] media delete failed:", mediaDeleteError);
    return NextResponse.json(
      { error: `Failed to remove media record: ${mediaDeleteError.message}` },
      { status: 500 }
    );
  }

  // 3) Best-effort storage cleanup. Missing files are tolerated; genuine
  //    errors are surfaced as warnings instead of failing the delete, so the
  //    database is never left pointing at a deleted photo.
  const warnings: string[] = [];
  const storageJobs: { label: string; bucket: string; path?: string }[] = [
    {
      label: "original",
      bucket: "originals",
      path: stripPrefix(mediaItem.storage_path, "originals/"),
    },
    {
      label: "preview",
      bucket: "previews",
      path: stripPrefix(mediaItem.preview_path, "previews/"),
    },
  ];

  for (const job of storageJobs) {
    if (!job.path) continue;
    const { error } = await admin.storage.from(job.bucket).remove([job.path]);
    if (error && !isMissing(error)) {
      warnings.push(`${job.label} file cleanup failed: ${error.message}`);
    }
  }

  return NextResponse.json({ ok: true, deleted: mediaId, warnings });
}
