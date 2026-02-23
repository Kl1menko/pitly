"use client";

import { useMemo, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { writeSupabaseSessionCookies } from "@/lib/supabase/auth-cookies";
import { submitPendingRequestIfAny } from "@/lib/requests/pending-client";

export default function AuthCallbackPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("Зачекайте, входимо...");

  useEffect(() => {
    const syncSession = async () => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get("code");
      const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
      const params = new URLSearchParams(hash);

      const error = params.get("error_description");
      if (error) {
        setMessage(`Помилка: ${error}`);
        return;
      }

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      // PKCE flow (common for OAuth providers)
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setMessage(`Помилка: ${exchangeError.message}`);
          return;
        }
        writeSupabaseSessionCookies(data.session);
        await redirectAfterPendingSubmit();
        return;
      }

      // If tokens are present in the hash (implicit flow), set the session explicitly.
      if (access_token && refresh_token) {
        const { data, error: setError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (setError) {
          setMessage(`Помилка: ${setError.message}`);
          return;
        }
        writeSupabaseSessionCookies(data.session);
        await redirectAfterPendingSubmit();
        return;
      }

      // Fallback: maybe the session is already stored (PKCE/code flow).
      const { data, error: getError } = await supabase.auth.getSession();
      if (getError || !data.session) {
        setMessage(getError ? `Помилка: ${getError.message}` : "Сесію не знайдено.");
        return;
      }
      writeSupabaseSessionCookies(data.session);
      await redirectAfterPendingSubmit();
    };

    const redirectAfterPendingSubmit = async () => {
      try {
        const pending = await submitPendingRequestIfAny();
        window.location.replace(pending.submitted ? "/thank-you" : "/dashboard");
      } catch (submitError) {
        console.error("pending request submit after oauth callback error", submitError);
        window.location.replace("/dashboard");
      }
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
