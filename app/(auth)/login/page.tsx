import Image from "next/image";
import { AuthPortal } from "@/components/forms/auth-portal";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Вхід у кабінет",
  description: "Увійдіть за email/паролем, телефоном або Google."
};

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900">
            <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" priority />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Кабінет</p>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Вхід до Pitly</h1>
          <p className="text-sm text-neutral-600">Email/пароль, код у SMS/месенджерах або Google Sign‑In.</p>
        </div>
        <Card className="w-full rounded-3xl border border-neutral-200/70 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-6">
          <AuthPortal defaultMode="login" defaultRole="client" />
        </Card>
      </div>
    </div>
  );
}
