import Image from "next/image";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AuthPortal } from "@/components/forms/auth-portal";

const map: Record<string, "client" | "partner_sto" | "partner_shop"> = {
  client: "client",
  "service-owner": "partner_sto",
  "parts-seller": "partner_shop",
  sto: "partner_sto",
  shop: "partner_shop"
};

export const metadata = {
  title: "Вхід у кабінет",
  description: "Увійдіть або зареєструйтесь у Pitly."
};

export default function LoginRolePage({ params }: { params: { role: string } }) {
  const role = map[params.role];
  if (!role) return notFound();

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900">
            <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" priority />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Кабінет</p>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Вхід</h1>
          <p className="text-sm text-neutral-600">
            Роль: {role === "client" ? "Клієнт" : role === "partner_sto" ? "Власник СТО" : "Продавець запчастин"}. Можна змінити після авторизації.
          </p>
        </div>
        <Card className="w-full rounded-3xl border border-neutral-200/70 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-6">
          <AuthPortal defaultMode="login" defaultRole={role} />
        </Card>
      </div>
    </div>
  );
}
