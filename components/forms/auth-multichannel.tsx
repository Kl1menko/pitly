"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Mail, Smartphone, Send as SendIcon, MessageCircle, Chrome } from "lucide-react";

type Mode = "login" | "register";
type Channel = "email" | "phone" | "telegram" | "viber" | "google";

export function AuthMultichannel({ mode, role = "client" }: { mode: Mode; role?: "client" | "partner_sto" | "partner_shop" }) {
  const supabase = getSupabaseBrowserClient();
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const channelLabel = useMemo(() => {
    switch (channel) {
      case "phone":
        return "SMS";
      case "telegram":
        return "Telegram";
      case "viber":
        return "Viber";
      default:
        return "SMS";
    }
  }, [channel]);

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
    const { error } = await fn;
    setLoading(false);
    setMessage(error ? error.message : "Успішно, можна перейти до кабінету.");
  };

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      setSent(true);
      setMessage(`Код надіслано (${channelLabel}). Якщо не отримали у месенджері — перевірте SMS.`);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      await supabase.auth.updateUser({ data: { role } });
      setMessage("Успішний вхід");
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
      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {(["email", "phone", "telegram", "viber", "google"] as Channel[]).map((ch) => {
          const active = channel === ch;
          const icon =
            ch === "email" ? <Mail className="h-4 w-4" /> : ch === "phone" ? (
              <Smartphone className="h-4 w-4" />
            ) : ch === "telegram" ? (
              <SendIcon className="h-4 w-4" />
            ) : ch === "viber" ? (
              <MessageCircle className="h-4 w-4" />
            ) : (
              <Chrome className="h-4 w-4" />
            );
          const label =
            ch === "email" ? "Email + пароль" : ch === "phone" ? "SMS" : ch === "telegram" ? "Telegram" : ch === "viber" ? "Viber" : "Google";
          const hint =
            ch === "email"
              ? "Класичний вхід"
              : ch === "phone"
              ? "Код на номер"
              : ch === "telegram"
              ? "Отримаєте лінк"
              : ch === "viber"
              ? "Код у Viber"
              : "OAuth";
          return (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition",
                active ? "border-neutral-900 bg-neutral-900 text-white shadow-sm" : "border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-neutral-900", active ? "bg-white text-neutral-900" : "bg-white")}>
                  {icon}
                </span>
                <div className="text-left">
                  <p className="font-semibold leading-tight">{label}</p>
                  <p className={cn("text-xs", active ? "text-white/80" : "text-neutral-600")}>{hint}</p>
                </div>
              </div>
              <span className={cn("text-xs uppercase tracking-[0.08em]", active ? "text-white/80" : "text-neutral-500")}>Обрати</span>
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

      {["phone", "telegram", "viber"].includes(channel) && (
        <div className="space-y-3">
          <div>
            <Label>Телефон</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." />
          </div>
          {sent && (
            <div>
              <Label>OTP код</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 цифр" />
            </div>
          )}
          <p className="text-xs text-neutral-600">Надішлемо код у {channelLabel}. За замовчуванням приходить SMS на цей номер.</p>
          <div className="flex gap-2">
            {!sent ? (
              <Button onClick={sendOtp} disabled={loading || !phone}>
                Надіслати код
              </Button>
            ) : (
              <Button onClick={verifyOtp} disabled={loading || !otp}>
                Підтвердити
              </Button>
            )}
          </div>
        </div>
      )}

      {channel === "google" && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-700">Вхід через Google. Після авторизації повернетеся у кабінет.</p>
          <Button onClick={signInGoogle} disabled={loading}>
            Увійти з Google
          </Button>
        </div>
      )}

      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </div>
  );
}
