import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

const PIN_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";

function generatePin(): string {
  const bytes = randomBytes(24);
  let pin = "";
  for (let i = 0; i < 24; i++) {
    pin += PIN_CHARSET[bytes[i] % PIN_CHARSET.length];
  }
  return pin;
}

export async function POST(request: Request) {
  let clientNames: string;
  let eventDate: string;

  try {
    const body = await request.json();
    clientNames = body?.client_names;
    eventDate = body?.event_date;
  } catch (err) {
    console.error("[weddings] Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof clientNames !== "string" || !clientNames.trim()) {
    return NextResponse.json(
      { error: "client_names is required" },
      { status: 400 }
    );
  }

  if (typeof eventDate !== "string" || !eventDate) {
    return NextResponse.json(
      { error: "event_date is required" },
      { status: 400 }
    );
  }

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
    console.error("[weddings] Staff lookup failed:", {
      userId: user.id,
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

  const access_token = randomBytes(16).toString("base64url");
  const pin = generatePin();

  const { data, error } = await supabase
    .from("weddings")
    .insert({
      studio_id: staff.studio_id,
      client_names: clientNames.trim(),
      event_date: eventDate,
      status: "upcoming",
      access_token,
      pin,
    })
    .select("id, client_names, event_date, status, access_token, pin")
    .single();

  if (error) {
    console.error("[weddings] Insert failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
