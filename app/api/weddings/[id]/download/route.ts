import { NextResponse } from "next/server";
import path from "node:path";
import { PassThrough, Readable } from "node:stream";
import archiver from "archiver";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function downloadPhotos(
  weddingId: string,
  allowedIds: string[] | null
): Promise<NextResponse> {
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

  const { data: media } = await supabase
    .from("media")
    .select("id, category, storage_path")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  const mediaIds = (media ?? []).map((m) => m.id);

  const { data: selections } = await supabase
    .from("selections")
    .select("media_id, favorited, in_album, delivery_type")
    .in("media_id", mediaIds);

  const selectionByMedia = new Map(
    (selections ?? []).map((s) => [s.media_id, s])
  );

  const allowed = new Set(allowedIds ?? []);

  const items = (media ?? []).filter((m) => {
    const sel = selectionByMedia.get(m.id);
    const isSelected = sel?.favorited || sel?.in_album;
    if (!isSelected) return false;
    return allowedIds === null || allowed.has(m.id);
  });

  if (items.length === 0) {
    return NextResponse.json(
      { error: "No selected photos to download" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const archive = archiver("zip", { zlib: { level: 6 } });
  const passthrough = new PassThrough();

  archive.on("error", (err: Error) => {
    console.error("[download] archive error:", err);
    passthrough.destroy(err);
  });

  archive.pipe(passthrough);

  const counters = new Map<string, number>();

  for (const item of items) {
    const category = item.category ?? "Other";
    const index = (counters.get(category) ?? 0) + 1;
    counters.set(category, index);

    const sel = selectionByMedia.get(item.id);
    const deliveryType = sel?.delivery_type;
    const folder = deliveryType === "print" ? "Print" : "Digital";

    const ext = path
      .extname(item.storage_path ?? "")
      .toLowerCase()
      .replace(/^\./, "");
    const base = `${category}-${String(index).padStart(2, "0")}`;
    const name = ext ? `${folder}/${base}.${ext}` : `${folder}/${base}`;

    const storagePath = (item.storage_path ?? "").replace(/^originals\//, "");
    if (!storagePath) continue;

    const { data, error } = await admin.storage
      .from("originals")
      .download(storagePath);

    if (error || !data) {
      console.error(
        `[download] failed to fetch original ${storagePath}:`,
        error?.message
      );
      continue;
    }

    archive.append(Readable.fromWeb(data.stream() as never), { name });
  }

  await archive.finalize();

  return new NextResponse(Readable.toWeb(passthrough) as never, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="wedding-${weddingId}-selected-photos.zip"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return downloadPhotos(id, null);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { mediaIds?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mediaIds =
    Array.isArray(body.mediaIds) && body.mediaIds.length > 0
      ? body.mediaIds.filter((x): x is string => typeof x === "string")
      : null;

  return downloadPhotos(id, mediaIds);
}
