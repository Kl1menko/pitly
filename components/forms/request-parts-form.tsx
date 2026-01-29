"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";

import { CitySelector } from "@/components/shared/city-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { type CarBrand, type City, type PartCategory } from "@/lib/types";
import { partsRequestSchema } from "@/lib/validators/requests";
import { useState } from "react";
import { RequestConfirmDialog } from "@/components/forms/request-confirm-dialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(partsRequestSchema),
    defaultValues: {
      city_id: cityParam ? cities.find((c) => c.slug === cityParam)?.id ?? "" : "",
      target_partner_id: partnerParam || "",
      part_categories: [],
      part_query: "",
      car_model_name: "",
      car_year: undefined,
      car_brand_id: undefined,
      car_model_id: undefined,
      contact_name: "",
      delivery_needed: false,
      contact_phone: "",
      contact_telegram: ""
    }
  });

  const handlePreview = async (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const sendRequest = async (values: FormValues) => {
    const supabase = getSupabaseBrowserClient();
    try {
      const { data, error } = await supabase
        .from("requests")
        .insert({
          type: "parts",
          city_id: values.city_id,
          car_brand_id: values.car_brand_id || null,
          car_model_id: values.car_model_id || null,
          car_model_name: values.car_model_name || null,
          car_year: values.car_year || null,
          part_category_id: values.part_categories?.[0],
          extra_part_categories: values.part_categories?.slice(1) ?? [],
          part_query: values.part_query,
          contact_phone: values.contact_phone,
          contact_name: values.contact_name,
          target_partner_id: values.target_partner_id || null,
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
      console.error("request parts error", err);
      alert("Не вдалось надіслати. Перевірте дані або спробуйте пізніше.");
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
          <Input placeholder="Наприклад: Focus Mk3" {...form.register("car_model_name")} />
        </div>
        <div className="md:col-span-2">
          <Label>Категорії (можна кілька)</Label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto rounded-xl border border-neutral-200 p-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  value={category.id}
                  checked={form.watch("part_categories")?.includes(category.id) ?? false}
                  onChange={(e) => {
                    const current = form.getValues("part_categories") || [];
                    if (e.target.checked) {
                      form.setValue("part_categories", [...current, category.id]);
                    } else {
                      form.setValue("part_categories", current.filter((id) => id !== category.id));
                    }
                  }}
                />
                {category.name_ua}
              </label>
            ))}
          </div>
          {form.formState.errors.part_categories && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.part_categories.message as string}</p>
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
          <Label>Ім’я</Label>
          <Input placeholder="Ім’я" {...form.register("contact_name")} />
        </div>
        <div className="md:col-span-2">
          <Label>Telegram (для посилання на пропозиції, опціонально)</Label>
          <Input placeholder="@username" {...form.register("contact_telegram")} />
          <p className="mt-1 text-xs text-neutral-500">
            Отримаєте посилання для перегляду пропозицій без реєстрації. Краще зареєструватися, щоб мати історію заявок та повний функціонал.
          </p>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-fit gap-2 group">
        {form.formState.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
        Надіслати запит
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
          localStorage.setItem("pitly_pending_request", JSON.stringify({ type: "parts", values: pendingValues }));
          window.location.href = "/register";
        }}
        summary={{
          title: "Заявка на запчастини",
          rows: [
            { label: "Місто", value: cities.find((c) => c.id === pendingValues?.city_id)?.name_ua },
            { label: "Марка", value: brands.find((b) => b.id === pendingValues?.car_brand_id)?.name },
            { label: "Модель", value: pendingValues?.car_model_name },
            {
              label: "Категорії",
              value: pendingValues?.part_categories?.length
                ? pendingValues.part_categories
                    .map((id) => categories.find((c) => c.id === id)?.name_ua || id)
                    .join(", ")
                : ""
            },
            { label: "Деталь", value: pendingValues?.part_query },
            { label: "Телефон", value: pendingValues?.contact_phone },
            { label: "Ім’я", value: pendingValues?.contact_name },
            { label: "Telegram", value: pendingValues?.contact_telegram }
          ]
        }}
      />
    </form>
  );
}
