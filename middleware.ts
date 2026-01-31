import { NextResponse, type NextRequest } from "next/server";

const supabaseReady = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function middleware(req: NextRequest) {
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
    const hasSession = req.cookies.has("sb-access-token") || req.cookies.has("sb-refresh-token") || req.cookies.has("sb:token");
    if (!hasSession) {
      const redirectUrl = new URL("/login", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
