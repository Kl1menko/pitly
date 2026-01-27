"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPhoneOTP() {
  const supabase = getSupabaseBrowserClient();
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
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
    else setMessage("Успішний вхід");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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
            Увійти
          </Button>
        )}
      </div>
      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </div>
  );
}
