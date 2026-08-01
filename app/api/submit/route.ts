import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
