import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let mediaId: string;

  try {
    const body = await request.json();
    mediaId = body?.mediaId;
  } catch (err) {
    console.error("[favorites] Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof mediaId !== "string" || !mediaId) {
    return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing, error: selectError } = await supabase
    .from("selections")
    .select("id, favorited")
    .eq("media_id", mediaId)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    console.error("[favorites] Select failed:", {
      mediaId,
      message: selectError.message,
      details: selectError.details,
      hint: selectError.hint,
      code: selectError.code,
    });
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const favorited = !existing?.favorited;

  let result;
  if (existing) {
    result = await supabase
      .from("selections")
      .update({ favorited })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("selections")
      .insert({ media_id: mediaId, favorited })
      .select()
      .single();
  }

  const { data, error } = result;

  if (error) {
    console.error("[favorites] Write failed:", {
      mediaId,
      favorited,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
