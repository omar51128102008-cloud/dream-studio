import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_CATEGORIES = [
  "Preparation",
  "Ceremony",
  "Reception",
  "Portraits",
  "Details",
  "Other",
];

async function ensureBucket(name: string, isPublic: boolean) {
  const admin = createAdminClient();
  const { data: existing, error } = await admin.storage.getBucket(name);
  if (existing) return;
  if (error && error.message.includes("not found")) {
    const { error: createError } = await admin.storage.createBucket(name, {
      public: isPublic,
    });
    if (createError) {
      console.error(`[upload] createBucket ${name} failed:`, createError);
      return;
    }
    console.log(`[upload] created bucket "${name}" (public=${isPublic})`);
  } else if (error) {
    console.error(`[upload] getBucket ${name} failed:`, error);
  }
}

export async function POST(
  request: Request,
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

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("studio_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (staffError) {
    console.error("[upload] staff lookup failed:", {
      message: staffError.message,
      details: staffError.details,
      hint: staffError.hint,
      code: staffError.code,
    });
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  if (!staff) {
    return NextResponse.json(
      { error: "No studio linked to this account" },
      { status: 403 }
    );
  }

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id, studio_id")
    .eq("id", weddingId)
    .maybeSingle();

  if (weddingError) {
    console.error("[upload] wedding lookup failed:", {
      message: weddingError.message,
      details: weddingError.details,
      hint: weddingError.hint,
      code: weddingError.code,
    });
    return NextResponse.json({ error: weddingError.message }, { status: 500 });
  }

  if (!wedding) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  if (wedding.studio_id !== staff.studio_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[upload] invalid multipart body:", err);
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const category = formData.get("category");
  if (typeof category !== "string" || !ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "category is required" },
      { status: 400 }
    );
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  await ensureBucket("originals", false);
  await ensureBucket("previews", true);

  const admin = createAdminClient();
  const results: Record<string, unknown>[] = [];
  const errors: { name: string; message: string }[] = [];

  for (const file of files) {
    const name = file.name;
    try {
      const original = Buffer.from(await file.arrayBuffer());

      const meta = await sharp(original).metadata();
      if (!meta.format || !["jpeg", "png", "webp", "heif", "tiff", "avif"].includes(meta.format)) {
        errors.push({ name, message: "Unsupported image type" });
        continue;
      }

      const id = randomUUID();
      const originalsPath = `weddings/${weddingId}/${id}.${meta.format}`;

      const { error: origError } = await admin.storage
        .from("originals")
        .upload(originalsPath, original, {
          contentType: file.type || `image/${meta.format}`,
        });

      if (origError) {
        errors.push({ name, message: origError.message });
        console.error("[upload] original upload failed:", origError);
        continue;
      }

      const preview = await sharp(original)
        .rotate()
        .resize({ width: 1500, withoutEnlargement: true })
        .flatten({ background: "#fff" })
        .jpeg({ quality: 80 })
        .toBuffer();

      const previewPath = `weddings/${weddingId}/${id}.jpg`;

      const { error: prevError } = await admin.storage
        .from("previews")
        .upload(previewPath, preview, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (prevError) {
        errors.push({ name, message: prevError.message });
        console.error("[upload] preview upload failed:", prevError);
        continue;
      }

      const { data, error: insertError } = await admin
        .from("media")
        .insert({
          wedding_id: weddingId,
          category,
          media_type: "image",
          storage_path: `originals/${originalsPath}`,
          preview_path: `previews/${previewPath}`,
        })
        .select("id, category, media_type, storage_path, preview_path")
        .single();

      if (insertError) {
        errors.push({ name, message: insertError.message });
        console.error("[upload] media insert failed:", insertError);
        continue;
      }

      results.push(data);
    } catch (err) {
      console.error(`[upload] failed to process ${name}:`, err);
      errors.push({ name, message: "Processing failed" });
    }
  }

  return NextResponse.json({ uploaded: results, errors });
}
