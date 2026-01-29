import { AuthPortal } from "@/components/forms/auth-portal";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Реєстрація партнера або клієнта",
  description: "Зареєструйтесь через email/пароль, SMS або Telegram/Viber код чи Google і заповніть профіль."
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Реєстрація</p>
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Створити акаунт</h1>
        <p className="text-sm text-neutral-600">Email/пароль, SMS або Telegram/Viber код, чи вхід через Google.</p>
      </div>
      <Card className="w-full max-w-xl border border-neutral-200/80 shadow-xl">
        <AuthPortal defaultMode="register" defaultRole="client" />
      </Card>
    </div>
  );
}
