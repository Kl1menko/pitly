import { AuthPhoneOTP } from "@/components/forms/auth-phone-otp";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Вхід у кабінет",
  description: "Увійдіть за номером телефону через OTP."
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-4 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">Кабінет</p>
        <h1 className="text-3xl font-bold">Вхід</h1>
        <p className="text-neutral-600">Отримайте одноразовий код у SMS.</p>
      </div>
      <Card>
        <AuthPhoneOTP />
      </Card>
    </div>
  );
}
