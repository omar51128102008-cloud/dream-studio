import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GATE_COOKIE = "site_access";
const GATE_MAX_AGE = 60 * 60 * 24; // 24 hours
const GATE_PATH = "/gate";
const GATE_API = "/api/gate";

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* --- site-wide access gate --- */
  const isGatePage = pathname === GATE_PATH;
  const isGateApi = pathname === GATE_API || pathname.startsWith(`${GATE_API}/`);

  // No password configured -> gate disabled.
  const expected = process.env.SITE_ACCESS_PASSWORD;
  if (expected) {
    const cookie = request.cookies.get(GATE_COOKIE)?.value;
    const authed = cookie ? cookie === (await sha256Hex(expected)) : false;

    if (isGatePage) {
      if (authed) {
        const next = request.nextUrl.searchParams.get("next");
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          return NextResponse.redirect(new URL(next, request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (isGateApi) {
      return NextResponse.next();
    }

    if (!authed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const gateUrl = new URL(GATE_PATH, request.url);
      gateUrl.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(gateUrl);
    }
  }

  /* --- dashboard session auth --- */
  if (pathname.startsWith("/dashboard")) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute =
      pathname === "/dashboard/login" || pathname === "/dashboard/signup";
    const isProtected = pathname.startsWith("/dashboard");

    if (isProtected && !isAuthRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Match every route except Next.js internals and static files (those are
  // required for the gate page itself to load).
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
