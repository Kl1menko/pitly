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
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { SiTelegram } from "react-icons/si";

type Mode = "login" | "register";
type Channel = "email" | "telegram" | "google";
type NoticeTone = "info" | "success" | "error";
type Notice = {
  tone: NoticeTone;
  title: string;
  text: string;
};

function noticeStyles(tone: NoticeTone) {
  if (tone === "success") {
    return {
      wrap: "border-emerald-200 bg-emerald-50 text-emerald-900",
      icon: "text-emerald-600",
      title: "text-emerald-900",
      text: "text-emerald-800"
    };
  }
  if (tone === "error") {
    return {
      wrap: "border-rose-200 bg-rose-50 text-rose-900",
      icon: "text-rose-600",
      title: "text-rose-900",
      text: "text-rose-800"
    };
  }
  return {
    wrap: "border-blue-200 bg-blue-50 text-blue-900",
    icon: "text-blue-600",
    title: "text-blue-900",
    text: "text-blue-800"
  };
}

function mapAuthErrorToNotice(message: string, mode: Mode): Notice {
  const lower = message.toLowerCase();
  if (lower.includes("email rate limit exceeded")) {
    return {
      tone: "error",
      title: "Забагато листів за короткий час",
      text: "Сервіс тимчасово обмежив відправку email. Зачекайте трохи та спробуйте ще раз, або увійдіть через Google."
    };
  }
  if (lower.includes("invalid api key")) {
    return {
      tone: "error",
      title: "Помилка налаштування авторизації",
      text: "Сервіс авторизації налаштований некоректно. Спробуйте пізніше або напишіть у підтримку."
    };
  }
  if (lower.includes("invalid login credentials")) {
    return {
      tone: "error",
      title: "Невірний email або пароль",
      text: "Перевірте введені дані та спробуйте ще раз. Якщо не пам’ятаєте пароль, використайте відновлення."
    };
  }
  if (lower.includes("email not confirmed")) {
    return {
      tone: "info",
      title: "Підтвердіть email",
      text: "Ми знайшли акаунт, але пошту ще не підтверджено. Відкрийте лист підтвердження і після цього увійдіть."
    };
  }
  return {
    tone: "error",
    title: mode === "register" ? "Не вдалося завершити реєстрацію" : "Не вдалося увійти",
    text: message
  };
}

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
  const [notice, setNotice] = useState<Notice | null>(null);

  const setErrorNotice = (message: string) => setNotice(mapAuthErrorToNotice(message, mode));

  const handleEmail = async () => {
    setLoading(true);
    setNotice(null);
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
      setErrorNotice(error.message);
      return;
    }
    if (data.session) {
      writeSupabaseSessionCookies(data.session);
      try {
        const pending = await submitPendingRequestIfAny();
        router.replace(pending.submitted ? "/thank-you" : "/dashboard");
      } catch (submitError) {
        console.error("pending request submit after email auth error", submitError);
        setNotice({
          tone: "info",
          title: "Вхід виконано",
          text: "Увійшли успішно, але відкладену заявку не вдалося надіслати автоматично. Ви зможете повторити це у формі."
        });
        router.replace("/dashboard");
      }
      return;
    }
    setNotice({
      tone: "success",
      title: "Акаунт створено",
      text: "Перевірте пошту та підтвердіть email (якщо підтвердження увімкнено). Після цього поверніться і увійдіть у кабінет."
    });
  };

  const sendOtp = async () => {
    setLoading(true);
    setNotice(null);
    const res = await fetch("/api/auth/telegram/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, role })
    });
    const payload = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setNotice({
        tone: "error",
        title: "Telegram-вхід недоступний",
        text: payload?.error === "telegram_bot_not_configured" ? "Telegram-вхід поки не налаштовано." : "Не вдалося запустити Telegram-вхід. Спробуйте ще раз трохи пізніше."
      });
      return;
    }
    setTelegramAuthToken(payload?.token ?? null);
    setTelegramBotUrl(payload?.botUrl ?? null);
    setSent(true);
    setNotice({
      tone: "info",
      title: "Telegram-вхід запущено",
      text: "Відкрийте бота, натисніть Start і введіть код із повідомлення в полі нижче."
    });
  };

  const verifyOtp = async () => {
    setLoading(true);
    setNotice(null);
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
      setNotice({
        tone: "error",
        title: "Не вдалося підтвердити Telegram-вхід",
        text: map[payload?.error] ?? "Спробуйте ще раз або оберіть інший спосіб входу."
      });
      return;
    }
    setNotice({
      tone: "success",
      title: payload?.isNewUser ? "Акаунт створено" : "Підтверджено",
      text: "Входимо в кабінет..."
    });
    if (payload?.redirectUrl) {
      window.location.href = payload.redirectUrl as string;
    }
  };

  const signInGoogle = async () => {
    setLoading(true);
    setNotice({
      tone: "info",
      title: "Переходимо до Google",
      text: "Виберіть акаунт Google. Після авторизації ви повернетеся на Pitly."
    });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined }
    });
    setLoading(false);
    if (error) setErrorNotice(error.message);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {(["email", "telegram", "google"] as Channel[]).map((ch) => {
          const active = channel === ch;
          const icon =
            ch === "email" ? <HiOutlineEnvelope className={cn("h-4 w-4", active ? "text-neutral-900" : "text-neutral-700")} /> : ch === "telegram" ? (
              <SiTelegram className={cn("h-4 w-4", active ? "text-sky-500" : "text-sky-600")} />
            ) : (
              <FcGoogle className="h-4 w-4" />
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
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-900",
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
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            {mode === "register"
              ? "Створіть акаунт за email і паролем. Якщо увімкнено підтвердження пошти, ми надішлемо лист з посиланням."
              : "Введіть email і пароль, які використовували під час реєстрації."}
          </div>
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
        <div className="space-y-3 text-center">
          {!sent && <p className="text-sm text-neutral-700">Запустіть Telegram-вхід, відкрийте бота і підтвердіть вхід через код.</p>}
          {telegramBotUrl && (
            <div className="flex justify-center">
              <a
                href={telegramBotUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
              >
                Відкрити бота в Telegram
              </a>
            </div>
          )}
          {sent && (
            <div className="text-left">
              <Label>Код із Telegram</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 цифр" />
            </div>
          )}
          <p className="text-xs text-neutral-600">
            Якщо ви вперше заходите через Telegram, ми автоматично створимо акаунт після підтвердження. Якщо вже були — просто підтвердимо вхід і впустимо в кабінет.
          </p>
          <div className="flex justify-center gap-2">
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
        <div className="space-y-3 text-center">
          <p className="text-sm text-neutral-700">
            {mode === "register" ? "Реєстрація" : "Вхід"} через Google. Після авторизації повернетеся у кабінет.
          </p>
          <div className="flex justify-center">
            <Button onClick={signInGoogle} disabled={loading}>
              {mode === "register" ? "Продовжити з Google" : "Увійти з Google"}
            </Button>
          </div>
        </div>
      )}

      {notice && (
        <div className={cn("rounded-xl border px-3 py-3", noticeStyles(notice.tone).wrap)}>
          <div className="flex items-start gap-2">
            {notice.tone === "success" ? (
              <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", noticeStyles(notice.tone).icon)} />
            ) : notice.tone === "error" ? (
              <AlertCircle className={cn("mt-0.5 h-4 w-4 shrink-0", noticeStyles(notice.tone).icon)} />
            ) : (
              <Info className={cn("mt-0.5 h-4 w-4 shrink-0", noticeStyles(notice.tone).icon)} />
            )}
            <div className="space-y-1">
              <p className={cn("text-sm font-semibold", noticeStyles(notice.tone).title)}>{notice.title}</p>
              <p className={cn("text-sm leading-relaxed", noticeStyles(notice.tone).text)}>{notice.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
