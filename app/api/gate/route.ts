import { NextResponse } from "next/server";

const COOKIE_NAME = "site_access";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  let password = "";

  try {
    const body = await request.json();
    if (typeof body?.password === "string") password = body.password;
  } catch (err) {
    console.error("[gate] Invalid JSON body:", err);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const expected = process.env.SITE_ACCESS_PASSWORD;
  if (!expected || password.length === 0 || password !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await sha256Hex(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    expires: new Date(Date.now() + COOKIE_MAX_AGE * 1000),
  });
  return res;
}
