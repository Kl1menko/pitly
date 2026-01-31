"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const supabase = getSupabaseBrowserClient();
  const [message, setMessage] = useState("Зачекайте, входимо...");

  useEffect(() => {
    const syncSession = async () => {
      const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
      const params = new URLSearchParams(hash);

      const error = params.get("error_description");
      if (error) {
        setMessage(`Помилка: ${error}`);
        return;
      }

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      // If tokens are present in the hash (implicit flow), set the session explicitly.
      if (access_token && refresh_token) {
        const { data, error: setError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (setError) {
          setMessage(`Помилка: ${setError.message}`);
          return;
        }
        writeCookies(data.session?.access_token, data.session?.refresh_token);
        redirectToDashboard();
        return;
      }

      // Fallback: maybe the session is already stored (PKCE/code flow).
      const { data, error: getError } = await supabase.auth.getSession();
      if (getError || !data.session) {
        setMessage(getError ? `Помилка: ${getError.message}` : "Сесію не знайдено.");
        return;
      }
      writeCookies(data.session.access_token, data.session.refresh_token);
      redirectToDashboard();
    };

    const writeCookies = (access?: string, refresh?: string) => {
      const maxAge = 60 * 60 * 24 * 7; // 7 днів
      if (access) document.cookie = `sb-access-token=${access}; path=/; max-age=${maxAge}; samesite=lax; secure`;
      if (refresh) document.cookie = `sb-refresh-token=${refresh}; path=/; max-age=${maxAge}; samesite=lax; secure`;
    };

    const redirectToDashboard = () => {
      window.location.replace("/dashboard");
    };

    syncSession();
  }, [supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="rounded-2xl bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-sm text-neutral-700">{message}</p>
      </div>
    </div>
  );
}
