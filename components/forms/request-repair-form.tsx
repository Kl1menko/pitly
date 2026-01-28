"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Upload } from "lucide-react";
import { z } from "zod";

import { CitySelector } from "@/components/shared/city-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadPhoto } from "@/lib/supabase/storage";
import { type CarBrand, type City, type Service } from "@/lib/types";
import { repairRequestSchema } from "@/lib/validators/requests";

type FormValues = z.infer<typeof repairRequestSchema>;

export function RequestRepairForm({
  cities,
  services,
  brands
}: {
  cities: City[];
  services: Service[];
  brands: CarBrand[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const cityParam = params.get("city") ?? "";
  const partnerParam = params.get("partner") ?? "";
  const [uploading, setUploading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(repairRequestSchema),
    defaultValues: {
      city_id: cityParam ? cities.find((c) => c.slug === cityParam)?.id ?? "" : "",
      target_partner_id: partnerParam || "",
      problem_description: "",
      photos: [],
      contact_phone: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    const supabase = getSupabaseBrowserClient();
    try {
      setUploading(true);
      const fileList = (form.getValues("photos") as unknown as FileList) ?? [];
      let photoUrls: string[] = [];
      if (fileList && fileList.length > 0) {
        const uploads = Array.from(fileList).map((file) => uploadPhoto(file));
        photoUrls = await Promise.all(uploads);
      }

      const { error } = await supabase.from("requests").insert({
        type: "repair",
        city_id: values.city_id,
        car_brand_id: values.car_brand_id || null,
        car_model_id: values.car_model_id || null,
        car_year: values.car_year || null,
        problem_description: values.problem_description,
        photos: photoUrls,
        contact_phone: values.contact_phone,
        contact_name: values.contact_name,
        target_partner_id: values.target_partner_id || null,
        status: "new"
      });

      if (error) throw error;
      router.push("/thank-you");
    } catch (err) {
      console.error("request repair error", err);
      alert("Не вдалось надіслати. Перевірте дані або спробуйте пізніше.");
    } finally {
      setUploading(false);
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
          <Label>Послуга</Label>
          <Select value={form.watch("service_id") ?? ""} onChange={(e) => form.setValue("service_id", e.target.value)}>
            <option value="">Не вибрано</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name_ua}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Рік</Label>
          <Input type="number" placeholder="2015" {...form.register("car_year")} />
        </div>
      </div>

      <div>
        <Label>Опишіть проблему</Label>
        <Textarea placeholder="Що трапилось? Шум, вібрація, помилки тощо." {...form.register("problem_description")} />
        {form.formState.errors.problem_description && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.problem_description.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Фото (опційно)</Label>
          <Input type="file" multiple accept="image/*" {...form.register("photos")} />
        </div>
        <div className="grid gap-2">
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
      </div>

      <Button type="submit" size="lg" disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Надсилаємо...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" /> Надіслати заявку
          </>
        )}
      </Button>
    </form>
  );
}
