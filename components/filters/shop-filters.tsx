"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PackageSearch, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { type CarBrand, type PartCategory } from "@/lib/types";

function useQueryArray(param: string, searchParams: URLSearchParams) {
  const raw = searchParams.get(param);
  return raw ? raw.split(",").filter(Boolean) : [];
}

export function ShopFilters({
  categories,
  brands
}: {
  categories: PartCategory[];
  brands: CarBrand[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeCategories = useQueryArray("categories", searchParams);
  const activeBrand = searchParams.get("brand") ?? "";
  const verified = searchParams.get("verified") === "1";
  const delivery = searchParams.get("delivery") === "1";

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

  const toggleCategory = (slug: string) => {
    const set = new Set(activeCategories);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    apply({ categories: Array.from(set) });
  };

  const panel = (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-neutral-800">Категорії</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((category) => (
            <label key={category.slug} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
              <Checkbox checked={activeCategories.includes(category.slug)} onChange={() => toggleCategory(category.slug)} />
              {category.name_ua}
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
          <Checkbox checked={delivery} onChange={(e) => apply({ delivery: e.target.checked ? "1" : null })} />
          Доставка
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Checkbox checked={verified} onChange={(e) => apply({ verified: e.target.checked ? "1" : null })} />
          Перевірені
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Фільтри</h3>
        <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Налаштувати
        </Button>
      </div>
      <div className="hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:block">{panel}</div>
      {open && <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:hidden">{panel}</div>}
      <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
        <PackageSearch className="h-4 w-4" />
        {activeCategories.length} категорій, {activeBrand ? `бренд ${activeBrand}` : "будь-яка марка"}
      </div>
    </div>
  );
}
