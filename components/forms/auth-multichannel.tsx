"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register";
type Channel = "email" | "phone" | "google";

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
      setMessage("Код надіслано у SMS");
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
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined }
    });
    setLoading(false);
    if (error) setMessage(error.message);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2 rounded-full bg-neutral-100 p-1 text-sm font-semibold">
        {(["email", "phone", "google"] as Channel[]).map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 transition",
              channel === ch ? "bg-neutral-900 text-white" : "text-neutral-700"
            )}
          >
            {ch === "email" && "Email"}
            {ch === "phone" && "Телефон"}
            {ch === "google" && "Google"}
          </button>
        ))}
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

      {channel === "phone" && (
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
