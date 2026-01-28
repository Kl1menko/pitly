"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { CitySelector } from "@/components/shared/city-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { type CarBrand, type City, type PartCategory } from "@/lib/types";
import { partsRequestSchema } from "@/lib/validators/requests";

type FormValues = z.infer<typeof partsRequestSchema>;

export function RequestPartsForm({
  cities,
  categories,
  brands
}: {
  cities: City[];
  categories: PartCategory[];
  brands: CarBrand[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const cityParam = params.get("city") ?? "";
  const partnerParam = params.get("partner") ?? "";
  const form = useForm<FormValues>({
    resolver: zodResolver(partsRequestSchema),
    defaultValues: {
      city_id: cityParam ? cities.find((c) => c.slug === cityParam)?.id ?? "" : "",
      part_query: "",
      contact_phone: "",
      target_partner_id: partnerParam || ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    const supabase = getSupabaseBrowserClient();
    try {
      const { error } = await supabase.from("requests").insert({
        type: "parts",
        city_id: values.city_id,
        car_brand_id: values.car_brand_id || null,
        car_model_id: values.car_model_id || null,
        car_year: values.car_year || null,
        part_category_id: values.part_category_id,
        part_query: values.part_query,
        contact_phone: values.contact_phone,
        contact_name: values.contact_name,
        target_partner_id: values.target_partner_id || null,
        status: "new"
      });
      if (error) throw error;
      router.push("/thank-you");
    } catch (err) {
      console.error("request parts error", err);
      alert("Не вдалось надіслати. Перевірте дані або спробуйте пізніше.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Місто</Label>
          <CitySelector cities={cities} value={form.watch("city_id")} onChange={(slug) => {
            const city = cities.find((c) => c.slug === slug || c.id === slug);
            form.setValue("city_id", city?.id ?? "");
          }} />
          {form.formState.errors.city_id && <p className="mt-1 text-sm text-red-500">{form.formState.errors.city_id.message}</p>}
        </div>
        <div>
          <Label>Марка авто</Label>
          <Select value={form.watch("car_brand_id") ?? ""} onChange={(e) => form.setValue("car_brand_id", e.target.value)}>
            <option value="">Будь-яка</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Категорія</Label>
          <Select
            value={form.watch("part_category_id") ?? ""}
            onChange={(e) => form.setValue("part_category_id", e.target.value)}
          >
            <option value="">Оберіть категорію</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_ua}
              </option>
            ))}
          </Select>
          {form.formState.errors.part_category_id && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.part_category_id.message}</p>
          )}
        </div>
        <div>
          <Label>Рік</Label>
          <Input type="number" placeholder="2018" {...form.register("car_year")} />
        </div>
      </div>

      <div>
        <Label>Опишіть деталь / артикул</Label>
        <Input placeholder="Наприклад: фільтр масляний 90915-YZZE1" {...form.register("part_query")} />
        {form.formState.errors.part_query && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.part_query.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Телефон</Label>
          <Input placeholder="+380..." {...form.register("contact_phone")} />
          {form.formState.errors.contact_phone && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.contact_phone.message}</p>
          )}
        </div>
        <div>
          <Label>Ім’я (необов’язково)</Label>
          <Input placeholder="Ім’я" {...form.register("contact_name")} />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-fit">
        <Loader2 className="mr-2 h-4 w-4 animate-spin opacity-0 transition group-disabled:opacity-100" />
        Надіслати запит
      </Button>
    </form>
  );
}
