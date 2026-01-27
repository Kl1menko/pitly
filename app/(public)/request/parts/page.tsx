import { RequestPartsForm } from "@/components/forms/request-parts-form";
import { Card } from "@/components/ui/card";
import { getBrands, getCities, getPartCategories } from "@/lib/supabase/queries";

export const metadata = {
  title: "Заявка на запчастину",
  description: "Надішліть запит на деталь, магазин зв’яжеться напряму.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function RequestPartsPage() {
  const [cities, categories, brands] = await Promise.all([getCities(), getPartCategories(), getBrands()]);

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mb-4 space-y-2">
        <p className="text-sm font-semibold text-primary">Заявка</p>
        <h1 className="text-3xl font-bold">Потрібні запчастини</h1>
        <p className="text-neutral-600">Магазини отримають вашу заявку та зателефонують.</p>
      </div>
      <Card>
        <RequestPartsForm cities={cities} categories={categories} brands={brands} />
      </Card>
    </div>
  );
}
