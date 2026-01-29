import { AuthPortal } from "@/components/forms/auth-portal";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Вхід у кабінет",
  description: "Увійдіть за email/паролем, телефоном або Google."
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-4 py-6 sm:py-10">
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900">
          <img
            src="/images/pitly.svg"
            alt="Pitly"
            className="h-8 w-8 animate-[bounce_1.5s_ease-in-out_infinite] motion-safe:translate-y-0"
            style={{ animationTimingFunction: "ease-in-out", animationDuration: "1.6s", animationTimingFunction: "cubic-bezier(0.4,0.0,0.4,1)" }}
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Кабінет</p>
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Вхід до Pitly</h1>
        <p className="text-sm text-neutral-600">Email/пароль, SMS або Telegram/Viber код, чи вхід через Google.</p>
      </div>
      <Card className="w-full max-w-xl border border-neutral-200/80 shadow-xl p-4 sm:p-6">
        <AuthPortal defaultMode="login" defaultRole="client" />
      </Card>
    </div>
  );
}
