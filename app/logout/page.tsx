"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.signOut().finally(() => {
      router.replace("/");
    });
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-neutral-700">
      Виходимо з акаунту…
    </div>
  );
}
