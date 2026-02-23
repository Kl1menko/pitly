"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { writeSupabaseSessionCookies } from "@/lib/supabase/auth-cookies";
import { submitPendingRequestIfAny } from "@/lib/requests/pending-client";
import { Mail, Send as SendIcon, Chrome } from "lucide-react";

type Mode = "login" | "register";
type Channel = "email" | "telegram" | "google";

export function AuthMultichannel({ mode, role = "client" }: { mode: Mode; role?: "client" | "partner_sto" | "partner_shop" }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [telegramAuthToken, setTelegramAuthToken] = useState<string | null>(null);
  const [telegramBotUrl, setTelegramBotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmail = async () => {
    setLoading(true);
    setMessage(null);
    const fn =
      mode === "register"
        ? supabase.auth.signUp({
            email,
            password,
            options: { data: { role } }
          })
        : supabase.auth.signInWithPassword({ email, password });
    const { data, error } = await fn;
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session) {
      writeSupabaseSessionCookies(data.session);
      try {
        const pending = await submitPendingRequestIfAny();
        router.replace(pending.submitted ? "/thank-you" : "/dashboard");
      } catch (submitError) {
        console.error("pending request submit after email auth error", submitError);
        setMessage("Увійшли, але відкладену заявку не вдалось надіслати. Спробуйте ще раз у формі.");
        router.replace("/dashboard");
      }
      return;
    }
    setMessage("Успішно. Перевірте email для підтвердження (якщо увімкнено) і потім увійдіть.");
  };

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/telegram/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, role })
    });
    const payload = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage(payload?.error === "telegram_bot_not_configured" ? "Telegram-вхід поки не налаштовано." : "Не вдалося запустити Telegram-вхід.");
      return;
    }
    setTelegramAuthToken(payload?.token ?? null);
    setTelegramBotUrl(payload?.botUrl ?? null);
    setSent(true);
    setMessage("Відкрийте бота в Telegram, натисніть Start і введіть код із повідомлення.");
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/telegram/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: telegramAuthToken,
        code: otp,
        role
      })
    });
    const payload = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      const map: Record<string, string> = {
        bot_confirmation_required: "Спершу натисніть Start у боті Telegram, а потім введіть код.",
        invalid_code: "Невірний код. Перевірте повідомлення в Telegram.",
        code_expired: "Код протермінований. Запустіть Telegram-вхід ще раз.",
        telegram_user_missing: "Не знайдено підтвердження від Telegram. Спробуйте ще раз."
      };
      setMessage(map[payload?.error] ?? "Не вдалося підтвердити Telegram-вхід.");
      return;
    }
    setMessage(payload?.isNewUser ? "Акаунт створено. Входимо..." : "Підтверджено. Входимо...");
    if (payload?.redirectUrl) {
      window.location.href = payload.redirectUrl as string;
    }
  };

  const signInGoogle = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined }
    });
    setLoading(false);
    if (error) setMessage(error.message);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {(["email", "telegram", "google"] as Channel[]).map((ch) => {
          const active = channel === ch;
          const icon =
            ch === "email" ? <Mail className="h-4 w-4" /> : ch === "telegram" ? (
              <SendIcon className="h-4 w-4" />
            ) : (
              <Chrome className="h-4 w-4" />
            );
          const label = ch === "email" ? "Email" : ch === "telegram" ? "Telegram" : "Google";
          const hint =
            ch === "email"
              ? "Email + пароль"
              : ch === "telegram"
              ? "Отримаєте лінк"
              : "OAuth";
          return (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={cn(
                "flex min-h-[84px] items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900/10"
                  : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-900",
                    active ? "bg-white text-neutral-900" : "bg-neutral-100"
                  )}
                >
                  {icon}
                </span>
                <div className="min-w-0 text-left">
                  <p className="font-semibold leading-tight">{label}</p>
                  <p className={cn("mt-0.5 text-xs leading-tight", active ? "text-white/75" : "text-neutral-600")}>{hint}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {channel === "email" && (
        <div className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label>Пароль</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button onClick={handleEmail} disabled={loading || !email || !password}>
            {mode === "register" ? "Зареєструватись" : "Увійти"}
          </Button>
        </div>
      )}

      {channel === "telegram" && (
        <div className="space-y-3">
          {!sent && <p className="text-sm text-neutral-700">Запустіть Telegram-вхід, відкрийте бота і підтвердіть вхід через код.</p>}
          {telegramBotUrl && (
            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Відкрити бота в Telegram
            </a>
          )}
          {sent && (
            <div>
              <Label>Код із Telegram</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 цифр" />
            </div>
          )}
          <p className="text-xs text-neutral-600">
            Якщо ви вперше заходите через Telegram, ми автоматично створимо акаунт після підтвердження. Якщо вже були — просто підтвердимо вхід і впустимо в кабінет.
          </p>
          <div className="flex gap-2">
            {!sent ? (
              <Button onClick={sendOtp} disabled={loading}>
                Почати через Telegram
              </Button>
            ) : (
              <Button onClick={verifyOtp} disabled={loading || !otp || !telegramAuthToken}>
                Підтвердити і увійти
              </Button>
            )}
          </div>
        </div>
      )}

      {channel === "google" && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-700">
            {mode === "register" ? "Реєстрація" : "Вхід"} через Google. Після авторизації повернетеся у кабінет.
          </p>
          <Button onClick={signInGoogle} disabled={loading}>
            {mode === "register" ? "Продовжити з Google" : "Увійти з Google"}
          </Button>
        </div>
      )}

      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </div>
  );
}
