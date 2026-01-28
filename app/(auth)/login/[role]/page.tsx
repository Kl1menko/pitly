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
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-4 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">Кабінет</p>
        <h1 className="text-3xl font-bold">Вхід</h1>
        <p className="text-neutral-600">Обрано роль: {role === "client" ? "Клієнт" : role === "partner_sto" ? "Власник СТО" : "Продавець запчастин"}</p>
      </div>
      <Card>
        <AuthPortal defaultMode="login" defaultRole={role} />
      </Card>
    </div>
  );
}
