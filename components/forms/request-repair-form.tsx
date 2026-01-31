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
import { RequestConfirmDialog } from "@/components/forms/request-confirm-dialog";

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
  const params = useSearchParams() ?? new URLSearchParams();
  const cityParam = params.get("city") ?? "";
  const partnerParam = params.get("partner") ?? "";
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(repairRequestSchema),
    defaultValues: {
      city_id: cityParam ? cities.find((c) => c.slug === cityParam)?.id ?? "" : "",
      target_partner_id: partnerParam || "",
      problem_description: "",
      photos: [],
      contact_phone: "",
      contact_telegram: "",
      extra_services: [],
      services_multi: [],
      car_model_name: ""
    }
  });

  const handlePreview = async (values: FormValues) => {
    const fileList = (form.getValues("photos") as unknown as FileList) ?? [];
    let photoUrls: string[] = [];
    if (fileList && fileList.length > 0) {
      setUploading(true);
      const uploads = Array.from(fileList).map((file) => uploadPhoto(file));
      photoUrls = await Promise.all(uploads);
      setUploading(false);
    }
    setPendingPhotos(photoUrls);
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const sendRequest = async (values: FormValues) => {
    const supabase = getSupabaseBrowserClient();
    try {
      setUploading(true);
      const { data, error } = await supabase
        .from("requests")
        .insert({
          type: "repair",
          city_id: values.city_id,
          car_brand_id: values.car_brand_id || null,
          car_model_id: values.car_model_id || null,
          car_model_name: values.car_model_name || null,
          car_year: values.car_year || null,
          problem_description: values.problem_description,
          photos: pendingPhotos,
          contact_phone: values.contact_phone,
          contact_name: values.contact_name,
          target_partner_id: values.target_partner_id || null,
          service_id: values.services_multi?.[0] ?? null,
          extra_services: values.services_multi?.slice(1) ?? [],
          status: "new"
        })
        .select("id")
        .single();

      if (error) throw error;

      if (values.contact_telegram) {
        await fetch("/api/request-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: data?.id,
            telegram: values.contact_telegram
          })
        }).catch(() => null);
      }

      router.push("/thank-you");
    } catch (err) {
      console.error("request repair error", err);
      alert("Не вдалось надіслати. Перевірте дані або спробуйте пізніше.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handlePreview)} className="flex flex-col gap-4">
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
          <Label>Модель авто</Label>
          <Input placeholder="Наприклад: Civic, Octavia A7" {...form.register("car_model_name")} />
        </div>
        <div className="md:col-span-2">
          <Label>Послуги (можна кілька)</Label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto rounded-xl border border-neutral-200 p-3">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  value={service.id}
                  checked={form.watch("services_multi")?.includes(service.id) ?? false}
                  onChange={(e) => {
                    const current = form.getValues("services_multi") || [];
                    if (e.target.checked) {
                      form.setValue("services_multi", [...current, service.id]);
                    } else {
                      form.setValue("services_multi", current.filter((id) => id !== service.id));
                    }
                  }}
                />
                {service.name_ua}
              </label>
            ))}
          </div>
          {form.formState.errors.services_multi && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.services_multi.message as string}</p>
          )}
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
            <Label>Ім’я</Label>
            <Input placeholder="Ім’я" {...form.register("contact_name")} />
          </div>
          <div>
            <Label>Telegram (для посилання на пропозиції, опціонально)</Label>
            <Input placeholder="@username" {...form.register("contact_telegram")} />
            <p className="mt-1 text-xs text-neutral-500">
              Отримаєте посилання для перегляду пропозицій без реєстрації. Краще зареєструватися, щоб мати історію заявок та повний функціонал.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={uploading} className="gap-2 group">
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
        )}
        {uploading ? "Надсилаємо..." : "Надіслати заявку"}
      </Button>

      <RequestConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onSendGuest={() => {
          if (!pendingValues) return;
          setConfirmOpen(false);
          sendRequest(pendingValues);
        }}
        onSendWithAccount={() => {
          if (!pendingValues) return;
          localStorage.setItem("pitly_pending_request", JSON.stringify({ type: "repair", values: pendingValues }));
          window.location.href = "/register";
        }}
        summary={{
          title: "Заявка на ремонт",
          rows: [
            { label: "Місто", value: cities.find((c) => c.id === pendingValues?.city_id)?.name_ua },
            { label: "Марка", value: brands.find((b) => b.id === pendingValues?.car_brand_id)?.name },
            { label: "Модель", value: pendingValues?.car_model_name },
            { label: "Рік", value: pendingValues?.car_year },
            { label: "Послуг обрано", value: pendingValues?.services_multi?.length },
            { label: "Опис", value: pendingValues?.problem_description },
            { label: "Телефон", value: pendingValues?.contact_phone },
            { label: "Ім’я", value: pendingValues?.contact_name },
            { label: "Telegram", value: pendingValues?.contact_telegram }
          ]
        }}
      />
    </form>
  );
}
