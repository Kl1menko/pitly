"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { type CarBrand, type Service } from "@/lib/types";

function useQueryArray(param: string, searchParams: URLSearchParams) {
  const raw = searchParams.get(param);
  return raw ? raw.split(",").filter(Boolean) : [];
}

export function StoFilters({
  services,
  brands
}: {
  services: Service[];
  brands: CarBrand[];
}) {
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeServices = useQueryArray("services", searchParams);
  const activeBrand = searchParams.get("brand") ?? "";
  const verified = searchParams.get("verified") === "1";
  const sort = searchParams.get("sort") ?? "";

  const apply = (next: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleService = (slug: string) => {
    const set = new Set(activeServices);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    apply({ services: Array.from(set) });
  };

  const panel = (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-neutral-800">Послуги</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {services.map((service) => (
            <label key={service.slug} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
              <Checkbox checked={activeServices.includes(service.slug)} onChange={() => toggleService(service.slug)} />
              {service.name_ua}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-neutral-800">Марка авто</p>
          <Select value={activeBrand} onChange={(e) => apply({ brand: e.target.value || null })}>
            <option value="">Будь-яка</option>
            {brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Checkbox checked={verified} onChange={(e) => apply({ verified: e.target.checked ? "1" : null })} />
          Перевірені
        </label>
        <div>
          <p className="text-sm font-semibold text-neutral-800">Сортування</p>
          <Select value={sort} onChange={(e) => apply({ sort: e.target.value || null })}>
            <option value="">За замовчуванням</option>
            <option value="rating">Рейтинг</option>
            <option value="new">Нові</option>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Каталог</p>
          <h3 className="text-lg font-bold text-neutral-900">Фільтри</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Налаштувати
        </Button>
      </div>
      <div className="hidden md:block">{panel}</div>
      {open && <div className="md:hidden">{panel}</div>}
      <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
        <Filter className="h-4 w-4" />
        Активно: {activeServices.length} послуг, {activeBrand ? `бренд ${activeBrand}` : "будь-яка марка"}
      </div>
    </div>
  );
}
