import { AuthPortal } from "@/components/forms/auth-portal";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Вхід у кабінет",
  description: "Увійдіть за email/паролем, телефоном або Google."
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-4 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">Кабінет</p>
        <h1 className="text-3xl font-bold">Вхід</h1>
        <p className="text-neutral-600">Email + пароль, телефон з OTP або Google.</p>
      </div>
      <Card>
        <AuthPortal defaultMode="login" defaultRole="client" />
      </Card>
    </div>
  );
}
