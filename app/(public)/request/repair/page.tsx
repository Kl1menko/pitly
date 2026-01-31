import { Suspense } from "react";
import { SafeVideo } from "@/components/shared/safe-video";
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
    <div className="mx-auto max-w-5xl px-4">
      <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-3xl bg-neutral-900 p-6 text-white md:flex-row md:items-center md:gap-8">
        <div className="space-y-2 md:w-1/2">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Заявка</p>
          <h1 className="text-3xl font-bold">Ремонт авто</h1>
          <p className="text-white/80">Опишіть проблему та додайте фото — ми передамо заявку перевіреним СТО.</p>
        </div>
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-neutral-800 md:h-56 md:w-1/2">
          <SafeVideo src="/videos/video_car.mp4" poster="/images/img_banner.gif" roundedClassName="rounded-2xl" className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/30 to-transparent" />
        </div>
      </div>
      <Card className="p-4 sm:p-6">
        <Suspense fallback={<div className="text-neutral-600">Завантаження форми...</div>}>
          <RequestRepairForm cities={cities} services={services} brands={brands} />
        </Suspense>
      </Card>
    </div>
  );
}
