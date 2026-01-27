import { AuthPhoneOTP } from "@/components/forms/auth-phone-otp";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Реєстрація партнера або клієнта",
  description: "Зареєструйтесь за телефоном, підтвердіть OTP і заповніть профіль."
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-4 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">Реєстрація</p>
        <h1 className="text-3xl font-bold">Створити акаунт</h1>
        <p className="text-neutral-600">Після входу доповніть свій профіль у кабінеті.</p>
      </div>
      <Card>
        <AuthPhoneOTP />
      </Card>
    </div>
  );
}
