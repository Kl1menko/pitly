"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoOffers, demoRequests, demoCities, demoBrands, demoServices, demoPartCategories } from "@/lib/data/demo";
import { cn } from "@/lib/utils";
import { MapPin, RefreshCw, ChevronDown, Sparkles } from "lucide-react";

const partnerCityId = "city-kyiv";

type SortOption = "new" | "near" | "hot";

const templates = [
  {
    id: "oil",
    title: "Заміна масла",
    note: "Заміна масла + фільтр, огляд підвіски. Оригінал/аналог за вибором.",
    price: 1800,
    eta_days: 1
  },
  {
    id: "brake",
    title: "Гальмівні колодки",
    note: "Передні колодки, перевірка дисків, гарантія 3 міс.",
    price: 2400,
    eta_days: 1
  },
  {
    id: "diagnostic",
    title: "Діагностика ходової",
    note: "Комплексна діагностика, роздруківка переліку робіт.",
    price: 900,
    eta_days: 0
  }
];

export default function PartnerInboxPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | "repair" | "parts">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [onlyCity, setOnlyCity] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<SortOption>("new");
  const [offerModal, setOfferModal] = useState<{ open: boolean; requestId?: string }>({ open: false });
  const [price, setPrice] = useState("");
  const [eta, setEta] = useState("");
  const [comment, setComment] = useState("");
  const [opts, setOpts] = useState({ warranty: true, deliverParts: true, delivery: false });

  const requests = useMemo(() => {
    const filtered = demoRequests.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (serviceFilter !== "all") {
        if (r.type === "parts" && r.part_category_id !== serviceFilter) return false;
        if (r.type === "repair" && r.problem_description && !r.problem_description.toLowerCase().includes(serviceFilter.toLowerCase())) return false;
      }
      if (brandFilter !== "all" && r.car_brand_id && r.car_brand_id !== brandFilter) return false;
      if (onlyCity && r.city_id !== partnerCityId) return false;
      if (onlyNew && r.status !== "new" && r.status !== "published" && r.status !== "offers_collecting") return false;
      return true;
    });

    const withMeta = filtered.map((r) => {
      const offers = demoOffers.filter((o) => o.request_id === r.id);
      return { ...r, offersCount: offers.length, createdAt: new Date(r.created_at || Date.now()) };
    });

    return withMeta.sort((a, b) => {
      if (sort === "new") return b.createdAt.getTime() - a.createdAt.getTime();
      if (sort === "near") return Number(b.city_id === partnerCityId) - Number(a.city_id === partnerCityId);
      if (sort === "hot") return b.offersCount - a.offersCount;
      return 0;
    });
  }, [typeFilter, serviceFilter, brandFilter, onlyCity, onlyNew, sort]);

  const resetFilters = () => {
    setTypeFilter("all");
    setServiceFilter("all");
    setBrandFilter("all");
    setOnlyCity(false);
    setOnlyNew(false);
    setSort("new");
  };

  const openTemplate = (tpl: typeof templates[number], reqId: string) => {
    setOfferModal({ open: true, requestId: reqId });
    setPrice(String(tpl.price));
    setEta(String(tpl.eta_days));
    setComment(tpl.note);
  };

  const submitOffer = () => {
    setOfferModal({ open: false });
    setPrice("");
    setEta("");
    setComment("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Кабінет партнера</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Inbox заявок</h1>
          <p className="text-neutral-600 dark:text-neutral-300">Фільтруйте та швидко надсилайте пропозицію.</p>
        </div>
        <Button variant="secondary" size="sm" className="rounded-full px-4" onClick={resetFilters}>
          <RefreshCw className="mr-2 h-4 w-4" /> Скинути
        </Button>
      </div>

      <Card className="rounded-2xl border border-neutral-100 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <SelectPill label="Тип" value={typeFilter} onChange={(v)=>setTypeFilter(v as "all"|"repair"|"parts")} options={[
            { value: "all", label: "Усі" },
            { value: "repair", label: "Ремонт" },
            { value: "parts", label: "Запчастини" }
          ]} />
          <SelectPill label="Послуга/Категорія" value={serviceFilter} onChange={setServiceFilter} options={[
            { value: "all", label: "Будь-яка" },
            ...demoServices.slice(0,4).map(s=>({value:s.slug,label:s.name_ua})),
            ...demoPartCategories.slice(0,4).map(c=>({value:c.id,label:c.name_ua}))
          ]} />
          <SelectPill label="Марка" value={brandFilter} onChange={setBrandFilter} options={[
            { value: "all", label: "Будь-яка" },
            ...demoBrands.slice(0,6).map(b=>({value:b.id,label:b.name}))
          ]} />
          <SelectPill label="Сортування" value={sort} onChange={(v)=>setSort(v as SortOption)} options={[
            { value: "new", label: "Нові" },
            { value: "near", label: "Моє місто" },
            { value: "hot", label: "Найгарячіші" }
          ]} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ToggleChip active={onlyCity} onClick={()=>setOnlyCity(v=>!v)} label="Тільки моє місто" />
          <ToggleChip active={onlyNew} onClick={()=>setOnlyNew(v=>!v)} label="Тільки нові" />
        </div>
      </Card>

      <div className="grid gap-4">
        {requests.length === 0 && <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">За фільтрами поки нічого.</div>}
        {requests.map((req) => {
          const cityName = demoCities.find((c) => c.id === req.city_id)?.name_ua || req.city_id;
          const age = timeAgo(req.createdAt);
          const offersCount = demoOffers.filter((o) => o.request_id === req.id).length;
          const title = req.problem_description || req.part_query || "Заявка";
          return (
            <Card key={req.id} className="relative overflow-hidden rounded-2xl border border-neutral-100 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("rounded-full", req.type === "repair" ? "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-100" : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100")}>
                  {req.type === "repair" ? "Ремонт" : "Деталі"}
                </Badge>
                <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 dark:bg-white/5 dark:text-neutral-100">
                  <MapPin className="h-4 w-4" />
                  {cityName}
                </span>
                <Badge className="rounded-full bg-neutral-50 text-neutral-700 dark:bg-white/10 dark:text-neutral-200">Опубліковано {age}</Badge>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-base font-semibold text-neutral-900 dark:text-white">{title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                  {req.type === "parts" ? "Потрібні запчастини" : "Запит на ремонт / діагностику"}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200">Пропозицій: {offersCount}</span>
                {req.car_brand_id && <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200">{brandName(req.car_brand_id)}</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="rounded-full px-4" onClick={() => setOfferModal({ open: true, requestId: req.id })}>
                  Зробити пропозицію
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-neutral-300 px-4 text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800">
                  Пропустити
                </Button>
                <Button asChild variant="ghost" size="sm" className="rounded-full px-3 text-sm text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white">
                  <Link href={`/dashboard/requests/${req.id}`}>Детальніше</Link>
                </Button>
                <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Шаблони
                  {templates.slice(0,2).map((tpl)=>(
                    <button key={tpl.id} className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20" onClick={() => openTemplate(tpl, req.id)}>
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {offerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">Пропозиція</p>
                <h3 className="text-lg font-semibold">Заявка {offerModal.requestId}</h3>
              </div>
              <button onClick={() => setOfferModal({ open: false })} className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                Закрити
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Ціна / діапазон (грн)
                <input value={price} onChange={(e)=>setPrice(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" placeholder="наприклад 2500-3200" />
              </label>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Термін (дні)
                <input value={eta} onChange={(e)=>setEta(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" placeholder="сьогодні / завтра / 2" />
              </label>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Що входить
                <textarea value={comment} onChange={(e)=>setComment(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" placeholder="Коротко опишіть роботи, гарантію, запчастини" />
              </label>
              <div className="grid gap-2 sm:grid-cols-3 text-sm text-neutral-800 dark:text-neutral-200">
                <CheckboxRow checked={opts.warranty} onToggle={()=>setOpts(o=>({...o,warranty:!o.warranty}))} label="Є гарантія" />
                <CheckboxRow checked={opts.deliverParts} onToggle={()=>setOpts(o=>({...o,deliverParts:!o.deliverParts}))} label="Можемо привезти деталі" />
                <CheckboxRow checked={opts.delivery} onToggle={()=>setOpts(o=>({...o,delivery:!o.delivery}))} label="Доставка авто/деталей" />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                Шаблони:
                {templates.map((tpl)=>(
                  <button key={tpl.id} onClick={()=>openTemplate(tpl, offerModal.requestId!)} className="rounded-full bg-neutral-100 px-2 py-1 font-semibold text-neutral-800 hover:bg-neutral-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                    {tpl.title}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-full" onClick={submitOffer}>Надіслати</Button>
                <Button variant="ghost" className="rounded-full" onClick={()=>setOfferModal({open:false})}>Скасувати</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectPill({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-500" />
      </div>
    </div>
  );
}

function ToggleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-semibold transition",
        active ? "border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      )}
    >
      {label}
    </button>
  );
}

function CheckboxRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-neutral-900 dark:accent-white" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} хв тому`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} год тому`;
  const days = Math.floor(hours / 24);
  return `${days} дн тому`;
}

function brandName(id: string) {
  return demoBrands.find((b) => b.id === id)?.name ?? id;
}
