import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IN_FILTER = 300;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function POST(request: Request) {
  let token: string;

  try {
    const body = await request.json();
    token = body?.token;
  } catch (err) {
    console.error("[submit] Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: wedding, error: findError } = await supabase
    .from("weddings")
    .select("id, status")
    .eq("access_token", token)
    .maybeSingle();

  if (findError) {
    console.error("[submit] Find failed:", {
      message: findError.message,
      details: findError.details,
      hint: findError.hint,
      code: findError.code,
    });
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (!wedding) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  // Every favorited / in-album photo must have a Print/Digital delivery choice
  // before the selection can be submitted.
  const { data: media } = await supabase
    .from("media")
    .select("id")
    .eq("wedding_id", wedding.id);

  const mediaIds = (media ?? []).map((m) => m.id);
  const missing: string[] = [];

  for (const ids of chunk(mediaIds, MAX_IN_FILTER)) {
    const { data: selections } = await supabase
      .from("selections")
      .select("media_id, favorited, in_album, delivery_type")
      .in("media_id", ids);

    for (const sel of selections ?? []) {
      if (
        (sel.favorited || sel.in_album) &&
        sel.delivery_type !== "print" &&
        sel.delivery_type !== "digital"
      ) {
        missing.push(sel.media_id);
      }
    }
  }

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "Some selected photos are missing a Print/Digital choice",
        missing,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("weddings")
    .update({ status: "submitted" })
    .eq("id", wedding.id)
    .select("id, status")
    .single();

  if (error) {
    console.error("[submit] Update failed:", {
      weddingId: wedding.id,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
