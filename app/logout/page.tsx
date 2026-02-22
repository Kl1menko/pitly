"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearSupabaseSessionCookies } from "@/lib/supabase/auth-cookies";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    clearSupabaseSessionCookies();
    supabase.auth.signOut().finally(() => {
      clearSupabaseSessionCookies();
      router.replace("/");
    });
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-neutral-700">
      Виходимо з акаунту…
    </div>
  );
}
