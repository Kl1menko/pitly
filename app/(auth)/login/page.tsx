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
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <Card className="relative overflow-hidden rounded-3xl border-none bg-neutral-900 p-6 text-white shadow-2xl lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_35%)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 ring-2 ring-neutral-800">
              <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" priority />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Кабінет</p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Вхід до Pitly</h1>
            </div>
          </div>
          <p className="relative mt-4 max-w-xl text-sm text-white/80 sm:text-base">
            Обирайте зручний спосіб — email/пароль, код у месенджері або Google. Дані синхронізуються між ролями клієнта та партнера.
          </p>
          <div className="relative mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <p className="font-semibold text-white">Клієнти</p>
              <p className="text-white/70">Історія заявок, чат з партнерами та зберігання авто.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <p className="font-semibold text-white">Партнери</p>
              <p className="text-white/70">Стрічка заявок, відповіді на запити та статуси замовлень.</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-neutral-200/70 bg-white/80 p-4 shadow-2xl backdrop-blur sm:p-6">
          <div className="mb-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Авторизація</p>
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Обрати спосіб входу</h2>
            <p className="text-sm text-neutral-600">Є email/пароль, код у SMS/месенджерах або Google Sign‑In.</p>
          </div>
          <AuthPortal defaultMode="login" defaultRole="client" />
        </Card>
      </div>
    </div>
  );
}
