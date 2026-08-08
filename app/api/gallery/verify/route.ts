import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 15 * 60 * 1000; // count failures within the last 15 minutes
const MAX_ATTEMPTS = 5;
const RETENTION_MS = 60 * 60 * 1000; // prune recorded attempts older than 1 hour

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

  // Keep the table bounded.
  await supabase
    .from("pin_attempts")
    .delete()
    .lt("attempted_at", new Date(Date.now() - RETENTION_MS).toISOString());

  // Lock out once there have been too many failures within the window —
  // even if this attempt happens to have the correct PIN.
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("pin_attempts")
    .select("id", { count: "exact", head: true })
    .eq("access_token", token)
    .gte("attempted_at", since);

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

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
    await supabase.from("pin_attempts").insert({ access_token: token });
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  // A correct PIN resets the failure counter for this token.
  await supabase.from("pin_attempts").delete().eq("access_token", token);

  return NextResponse.json({ ok: true });
}
