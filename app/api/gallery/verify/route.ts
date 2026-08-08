import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let token: string;
  let pin: string;

  try {
    const body = await request.json();
    token = body?.token;
    pin = body?.pin;
  } catch (err) {
    console.error("[gallery-verify] Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof token !== "string" || !token || typeof pin !== "string" || !pin) {
    return NextResponse.json(
      { error: "token and pin are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("pin")
    .eq("access_token", token)
    .maybeSingle();

  if (error) {
    console.error("[gallery-verify] Find failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  if (!wedding || !wedding.pin || wedding.pin !== pin) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
