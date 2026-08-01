import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_KEYS = ["favorited", "in_album", "client_note"] as const;

type SelectionPatch = Partial<
  Record<(typeof ALLOWED_KEYS)[number], boolean | string | null>
>;

export async function POST(request: Request) {
  let mediaId: string;
  let patch: SelectionPatch;

  try {
    const body = await request.json();
    mediaId = body?.mediaId;
    patch = body?.patch ?? {};
  } catch (err) {
    console.error("[selections] Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof mediaId !== "string" || !mediaId) {
    return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
  }

  const update: SelectionPatch = {};
  for (const key of ALLOWED_KEYS) {
    if (patch[key] !== undefined) {
      update[key] = patch[key];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existing, error: selectError } = await supabase
    .from("selections")
    .select("id")
    .eq("media_id", mediaId)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    console.error("[selections] Select failed:", {
      mediaId,
      message: selectError.message,
      details: selectError.details,
      hint: selectError.hint,
      code: selectError.code,
    });
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  let result;
  if (existing) {
    result = await supabase
      .from("selections")
      .update(update)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("selections")
      .insert({ media_id: mediaId, ...update })
      .select()
      .single();
  }

  const { data, error } = result;

  if (error) {
    console.error("[selections] Write failed:", {
      mediaId,
      update,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
