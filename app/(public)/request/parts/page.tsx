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
    <div className="mx-auto max-w-5xl px-4">
      <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-3xl bg-neutral-900 p-6 text-white md:flex-row md:items-center md:gap-8">
        <div className="space-y-2 md:w-1/2">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Заявка</p>
          <h1 className="text-3xl font-bold">Потрібні запчастини</h1>
          <p className="text-white/80">Опишіть деталь або VIN, магазини нададуть ціну та наявність.</p>
        </div>
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-neutral-800 md:h-56 md:w-1/2">
          <video
            src="/videos/video_car.mp4"
            poster="/images/img_banner.gif"
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/30 to-transparent" />
        </div>
      </div>
      <Card className="p-4 sm:p-6">
        <RequestPartsForm cities={cities} categories={categories} brands={brands} />
      </Card>
    </div>
  );
}
