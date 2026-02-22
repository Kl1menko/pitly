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

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  if (supabaseReady) {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("pitly_demo")?.value;
    if (demoCookie !== "client" && demoCookie !== "partner") {
      const accessToken = extractAccessTokenFromCookies(cookieStore);
      if (!accessToken) {
        redirect("/login");
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data.user) {
        redirect("/login");
      }
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
