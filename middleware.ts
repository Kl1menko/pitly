import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

function decodeCookieValue(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractAccessToken(req: NextRequest) {
  const direct = decodeCookieValue(req.cookies.get("sb-access-token")?.value);
  if (direct) return direct;

  const legacy = decodeCookieValue(req.cookies.get("sb:token")?.value);
  if (!legacy) return "";
  try {
    const parsed = JSON.parse(legacy);
    if (typeof parsed?.access_token === "string") return parsed.access_token;
  } catch {
    return legacy;
  }
  return "";
}

async function hasValidSession(req: NextRequest) {
  const accessToken = extractAccessToken(req);
  if (!accessToken || !supabaseUrl || !supabaseAnonKey) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  return !error && Boolean(data.user);
}

function redirectToLogin(req: NextRequest) {
  const redirectUrl = new URL("/login", req.url);
  const res = NextResponse.redirect(redirectUrl);
  for (const name of ["sb-access-token", "sb-refresh-token", "sb:token"]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return res;
}

export async function middleware(req: NextRequest) {
  if (!supabaseReady) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const demo = req.nextUrl.searchParams.get("demo");
    const demoCookie = req.cookies.get("pitly_demo")?.value;
    if (demo === "client" || demo === "partner") {
      const res = NextResponse.next();
      res.cookies.set("pitly_demo", demo, { path: "/", maxAge: 60 * 60 }); // 1h demo session
      return res;
    }
    if (demoCookie === "client" || demoCookie === "partner") {
      return NextResponse.next();
    }

    const valid = await hasValidSession(req);
    if (!valid) {
      return redirectToLogin(req);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
