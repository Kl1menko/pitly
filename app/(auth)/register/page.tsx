import { AuthPortal } from "@/components/forms/auth-portal";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Реєстрація партнера або клієнта",
  description: "Зареєструйтесь через email/пароль, телефон (OTP) або Google і заповніть профіль."
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-4 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">Реєстрація</p>
        <h1 className="text-3xl font-bold">Створити акаунт</h1>
        <p className="text-neutral-600">Email+пароль, телефон з OTP або Google. Після входу доповніть профіль.</p>
      </div>
      <Card>
        <AuthPortal defaultMode="register" defaultRole="client" />
      </Card>
    </div>
  );
}
