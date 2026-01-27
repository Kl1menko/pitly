import { RequestRepairForm } from "@/components/forms/request-repair-form";
import { Card } from "@/components/ui/card";
import { getBrands, getCities, getServices } from "@/lib/supabase/queries";

export const metadata = {
  title: "Заявка на ремонт авто",
  description: "Опишіть проблему та отримайте дзвінок від СТО у вашому місті.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function RequestRepairPage() {
  const [cities, services, brands] = await Promise.all([getCities(), getServices(), getBrands()]);

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mb-4 space-y-2">
        <p className="text-sm font-semibold text-primary">Заявка</p>
        <h1 className="text-3xl font-bold">Ремонт авто</h1>
        <p className="text-neutral-600">Ми надішлемо заявку партнерам у вибраному місті.</p>
      </div>
      <Card>
        <RequestRepairForm cities={cities} services={services} brands={brands} />
      </Card>
    </div>
  );
}
