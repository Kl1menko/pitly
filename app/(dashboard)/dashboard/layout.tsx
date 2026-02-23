import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSupabaseServerClient, supabaseReady } from "@/lib/supabase/server";

function decodeCookieValue(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractAccessTokenFromCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const direct = decodeCookieValue(cookieStore.get("sb-access-token")?.value);
  if (direct) return direct;

  const legacy = decodeCookieValue(cookieStore.get("sb:token")?.value);
  if (!legacy) return "";
  try {
    const parsed = JSON.parse(legacy);
    if (typeof parsed?.access_token === "string") return parsed.access_token;
  } catch {
    return legacy;
  }
  return "";
}

function extractRefreshTokenFromCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return decodeCookieValue(cookieStore.get("sb-refresh-token")?.value);
}

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  if (supabaseReady) {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("pitly_demo")?.value;
    if (demoCookie !== "client" && demoCookie !== "partner") {
      const accessToken = extractAccessTokenFromCookies(cookieStore);
      const refreshToken = extractRefreshTokenFromCookies(cookieStore);
      if (!accessToken && !refreshToken) {
        redirect("/login");
      }

      const supabase = getSupabaseServerClient();
      if (accessToken) {
        const { data, error } = await supabase.auth.getUser(accessToken);
        if (!error && data.user) {
          return <DashboardLayout>{children}</DashboardLayout>;
        }
      }

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (!error && data.user) {
          return <DashboardLayout>{children}</DashboardLayout>;
        }
      }

      redirect("/login");
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
