import Image from "next/image";
import Link from "next/link";
import { Info, MailCheck, ShieldCheck } from "lucide-react";
import { AuthPortal } from "@/components/forms/auth-portal";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Вхід у кабінет",
  description: "Увійдіть за email/паролем, телефоном або Google."
};

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-12">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900">
            <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" priority />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Кабінет</p>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Вхід до Pitly</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Увійдіть у свій акаунт, щоб продовжити роботу із заявками, переглянути відповіді партнерів та історію звернень.
          </p>
        </div>
        <Card className="w-full rounded-3xl border border-neutral-200/70 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-6">
          <AuthPortal defaultMode="login" defaultRole="client" />
        </Card>

        <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">
          <Card className="group rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-900">Безпечно</p>
                <p className="text-xs leading-relaxed text-neutral-700">
                  Використовуйте email/пароль або Google для швидкого входу.
                </p>
              </div>
            </div>
          </Card>

          <Card className="group rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                <MailCheck className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-900">Пошта не підтверджена?</p>
                <p className="text-xs leading-relaxed text-neutral-700">
                  Після реєстрації спершу відкрийте лист підтвердження, а потім увійдіть.
                </p>
              </div>
            </div>
          </Card>

          <Card className="group rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-200">
                <Info className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-900">Ще немає акаунта?</p>
                <p className="text-xs leading-relaxed text-neutral-700">
                  <Link href="/register" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800">
                    Зареєструватися
                  </Link>{" "}
                  можна за хвилину.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
