"use client";

"use client";

import { Suspense, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoServices, demoPartCategories, demoBrands } from "@/lib/data/demo";
import { cn } from "@/lib/utils";

type PartnerType = "sto" | "shop";

const tips = [
  { id: "cover", text: "Додайте обкладинку або фото сервісу" },
  { id: "hours", text: "Заповніть графік роботи" },
  { id: "guarantee", text: "Вкажіть гарантію та умови" },
  { id: "pricing", text: "Ціни “від” по ключових роботах" },
  { id: "delivery", text: "Доставка/оплата для магазину" }
];

export const dynamic = "force-dynamic";

export default function DashboardProfilePage() {
  return (
    <Suspense fallback={<div className="text-neutral-600">Завантаження профілю...</div>}>
      <DashboardProfileContent />
    </Suspense>
  );
}

function DashboardProfileContent() {
  const [partnerType, setPartnerType] = useState<PartnerType>("sto");
  const [services, setServices] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [guarantee, setGuarantee] = useState(false);
  const [delivery, setDelivery] = useState({ np: false, courier: false });
  const [original, setOriginal] = useState({ oem: true, analog: true });

  const completion = useMemo(() => {
    let score = 40;
    if (services.length > 0 || categories.length > 0) score += 15;
    if (brands.length > 0) score += 10;
    if (guarantee) score += 10;
    if (delivery.np || delivery.courier) score += 10;
    if (original.oem || original.analog) score += 5;
    return Math.min(100, score);
  }, [services, categories, brands, guarantee, delivery, original]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Профіль партнера</p>
          <h1 className="text-2xl font-bold">Редагування профілю</h1>
          <p className="text-neutral-600">Заповніть ключові поля — від цього залежає вибір клієнтів.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
          <div className="text-sm">
            <p className="text-neutral-500">Індекс заповненості</p>
            <p className="text-lg font-semibold text-neutral-900">{completion}%</p>
          </div>
          <div className="h-3 w-28 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-neutral-900" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      <Card className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("rounded-full px-3 py-2 text-sm", partnerType === "sto" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800")} onClick={() => setPartnerType("sto")}>
            СТО
          </Badge>
          <Badge className={cn("rounded-full px-3 py-2 text-sm", partnerType === "shop" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800")} onClick={() => setPartnerType("shop")}>
            Магазин запчастин
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Назва компанії" placeholder="DriveTech / PartLab" />
          <Field label="Місто" placeholder="Київ" />
          <Field label="Адреса" placeholder="вул. Прикладна, 10" className="md:col-span-2" />
          <Field label="Телефон" placeholder="+380..." />
          <Field label="Telegram" placeholder="@username" />
          <Field label="Графік роботи" placeholder="Пн-Пт 9:00-19:00, Сб 10:00-16:00" />
          <Field label="Сайт (опц.)" placeholder="https://..." />
          <div className="md:col-span-2">
            <Label>Опис</Label>
            <Textarea placeholder="Коротко про послуги, досвід, гарантії, спеціалізацію" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label>Фото / обкладинка</Label>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              Завантажте JPG/PNG до 5 МБ (демо-заглушка)
              <Button size="sm">Обрати файл</Button>
            </div>
          </div>
        </div>
      </Card>

      {partnerType === "sto" ? (
        <Card className="space-y-4 p-4 md:p-6">
          <SectionTitle title="Послуги та ціни" />
          <Chips label="Послуги" items={demoServices.slice(0, 8).map((s) => ({ id: s.id, label: s.name_ua }))} selected={services} onToggle={toggleSetter(setServices)} />
          <div className="grid gap-3 md:grid-cols-3">
            {["Діагностика", "Гальма", "Підвіска"].map((item) => (
              <Field key={item} label={`${item} від`} placeholder="Ціна від, грн" />
            ))}
          </div>
          <ToggleRow label="Гарантія на роботи" checked={guarantee} onChange={setGuarantee} />
          <Chips label="Працюємо з марками" items={demoBrands.slice(0, 10).map((b) => ({ id: b.id, label: b.name }))} selected={brands} onToggle={toggleSetter(setBrands)} />
          <Field label="Сертифікати (посилання або текст)" placeholder="Напр. ISO, Bosch Service, фото сертифікатів" className="md:col-span-2" />
        </Card>
      ) : (
        <Card className="space-y-4 p-4 md:p-6">
          <SectionTitle title="Магазин запчастин" />
          <Chips
            label="Категорії деталей"
            items={demoPartCategories.slice(0, 8).map((c) => ({ id: c.id, label: c.name_ua }))}
            selected={categories}
            onToggle={toggleSetter(setCategories)}
          />
          <Chips label="Марки авто" items={demoBrands.slice(0, 10).map((b) => ({ id: b.id, label: b.name }))} selected={brands} onToggle={toggleSetter(setBrands)} />
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleRow label="Доставка Нова Пошта" checked={delivery.np} onChange={(v) => setDelivery((prev) => ({ ...prev, np: v }))} />
            <ToggleRow label="Кур'єр по місту" checked={delivery.courier} onChange={(v) => setDelivery((prev) => ({ ...prev, courier: v }))} />
            <Field label="Строк відправки" placeholder="Сьогодні / 1 день" />
            <Field label="Оплата" placeholder="Карта / накладений / готівка" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleRow label="Оригінал (OEM)" checked={original.oem} onChange={(v) => setOriginal((p) => ({ ...p, oem: v }))} />
            <ToggleRow label="Аналоги" checked={original.analog} onChange={(v) => setOriginal((p) => ({ ...p, analog: v }))} />
          </div>
        </Card>
      )}

      <Card className="space-y-3 p-4 md:p-5">
        <SectionTitle title="Підказки, що додати" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-[11px]">+</span>
              {t.text}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button className="rounded-full px-5">Зберегти профіль (демо)</Button>
        <Button variant="secondary" className="rounded-full px-5">
          Переглянути як клієнт
        </Button>
      </div>
    </div>
  );
}

function Field({ label, placeholder, className }: { label: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input placeholder={placeholder} className="mt-1" />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>;
}

function Chips({
  label,
  items,
  selected,
  onToggle
}: {
  label: string;
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-800">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-semibold transition",
                active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toggleSetter(setter: (cb: (prev: string[]) => string[]) => void) {
  return (id: string) =>
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-neutral-900" />
    </label>
  );
}
