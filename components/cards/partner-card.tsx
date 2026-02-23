import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoPartCategories, demoServices } from "@/lib/data/demo";
import { type Partner } from "@/lib/types";

function hhmmToMinutes(value?: string | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function getWeekdayKey(date = new Date()) {
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[date.getDay()];
}

function getOpenStatus(partner: Partner) {
  const day = partner.workHours?.[getWeekdayKey()];
  if (!day || day.isOpen === false) return { today: false, now: false };
  const open = hhmmToMinutes(day.open);
  const close = hhmmToMinutes(day.close);
  const today = open != null && close != null;
  if (!today) return { today: false, now: false };
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return { today: true, now: nowMin >= open && nowMin <= close };
}

function getTodayWorkHoursLabel(partner: Partner) {
  const day = partner.workHours?.[getWeekdayKey()];
  if (!day) return "Графік не вказано";
  if (day.isOpen === false) return "Зачинено сьогодні";
  if (!day.open || !day.close) return "Графік не вказано";
  if (day.open === "00:00" && (day.close === "23:59" || day.close === "24:00")) return "Цілодобово";
  return `Сьогодні: ${day.open}–${day.close}`;
}

function transliterateToUkr(value: string) {
  let text = value;
  const rules: Array<[RegExp, string]> = [
    [/shch/gi, "щ"],
    [/zh/gi, "ж"],
    [/kh/gi, "х"],
    [/ts/gi, "ц"],
    [/ch/gi, "ч"],
    [/sh/gi, "ш"],
    [/yu/gi, "ю"],
    [/ya/gi, "я"],
    [/ye/gi, "є"],
    [/yy/gi, "и"],
    [/a/gi, "а"],
    [/b/gi, "б"],
    [/v/gi, "в"],
    [/h/gi, "г"],
    [/g/gi, "ґ"],
    [/d/gi, "д"],
    [/e/gi, "е"],
    [/z/gi, "з"],
    [/y/gi, "й"],
    [/i/gi, "і"],
    [/j/gi, "й"],
    [/k/gi, "к"],
    [/l/gi, "л"],
    [/m/gi, "м"],
    [/n/gi, "н"],
    [/o/gi, "о"],
    [/p/gi, "п"],
    [/r/gi, "р"],
    [/s/gi, "с"],
    [/t/gi, "т"],
    [/u/gi, "у"],
    [/f/gi, "ф"],
    [/w/gi, "в"],
    [/x/gi, "кс"],
    [/q/gi, "к"],
    [/c/gi, "к"]
  ];
  for (const [pattern, replacement] of rules) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/'+/g, "");
}

function titleCaseWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeAddressPiece(value: string) {
  return value.toLowerCase().replace(/[^a-zа-яіїєґ0-9]+/gi, "");
}

function localizeStreetToken(value: string) {
  const hasRoadPrefix = /\b(a\/d|autodor|автодор)/i.test(value);
  const hasStreetSuffix = /\b(Street|St\.?)\b/i.test(value);
  let localized = value
    .replace(/\bA\/d\b/gi, "автодорога")
    .replace(/\bAutodoroga\b/gi, "автодорога")
    .replace(/\bStreet\b/gi, "вулиця")
    .replace(/\bSt\b\.?/gi, "вулиця")
    .replace(/\bAvenue\b/gi, "проспект")
    .replace(/\bAve\b\.?/gi, "проспект")
    .replace(/\bBoulevard\b/gi, "бульвар")
    .replace(/\bBlvd\b\.?/gi, "бульвар")
    .replace(/\bLane\b/gi, "провулок")
    .replace(/\bLn\b\.?/gi, "провулок");
  localized = titleCaseWords(transliterateToUkr(localized))
    .replace(/\bЛвів/g, "Львів")
    .replace(/\bлвів/g, "львів")
    .replace(/\bЛьвівска\b/g, "Львівська")
    .replace(/\bльвівска\b/g, "львівська")
    .replace(/Тска\b/g, "Цька")
    .replace(/тска\b/g, "цька")
    .replace(/Цка\b/g, "Цька")
    .replace(/цка\b/g, "цька")
    .replace(/Ска\b/g, "Ська")
    .replace(/ска\b/g, "ська")
    .replace(/\bКм\b/g, "км");
  if (hasStreetSuffix && /Вулиця\s*$/i.test(localized)) {
    localized = `вулиця ${localized.replace(/\s*Вулиця\s*$/i, "").trim()}`;
  }
  if (hasRoadPrefix && !/^автодорога /i.test(localized)) {
    localized = `автодорога ${localized.replace(/^Автодорога\s*/i, "").trim()}`;
  }
  return localized;
}

function localizeCityName(value: string) {
  const compact = value.toLowerCase().replace(/[^a-z']/g, "");
  const cityMap: Record<string, string> = {
    kyiv: "Київ",
    kiev: "Київ",
    lviv: "Львів",
    "l'viv": "Львів",
    dnipro: "Дніпро",
    odesa: "Одеса",
    odessa: "Одеса",
    kharkiv: "Харків",
    vinnytsia: "Вінниця",
    zaporizhzhia: "Запоріжжя",
    mykolaiv: "Миколаїв",
    chernihiv: "Чернігів",
    poltava: "Полтава"
  };
  return cityMap[compact] || titleCaseWords(transliterateToUkr(value));
}

function formatAddressShort(address?: string | null) {
  if (!address) return "Адресу уточнити";
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !/ukraine|область|oblast|^\d{5,6}$/i.test(p));
  if (!parts.length) return "Адресу уточнити";

  const uniqueParts = parts.filter((part, idx, arr) => {
    const current = normalizeAddressPiece(part);
    if (!current) return false;
    return arr.findIndex((other) => normalizeAddressPiece(other) === current) === idx;
  });

  const streetPart =
    uniqueParts.find((p) => /\b(st|street|ave|avenue|blvd|boulevard|ln|lane)\b/i.test(p)) ||
    uniqueParts.find((p) => /вул|вулиця|просп|бульвар|пров/i.test(p)) ||
    uniqueParts.find((p) => /\b(a\/d|autodor|автодор)\b/i.test(p)) ||
    uniqueParts[0];
  const cityPart =
    uniqueParts.find((p) =>
      /^(kyiv|kiev|lviv|l'viv|dnipro|odesa|odessa|kharkiv|vinnytsia|zaporizhzhia|mykolaiv|chernihiv|poltava)$/i.test(p)
    ) ||
    uniqueParts.find(
      (p) =>
        p !== streetPart &&
        !/\b(st|street|ave|avenue|blvd|boulevard|ln|lane)\b/i.test(p) &&
        !/\b(a\/d|autodor|автодор)\b/i.test(p) &&
        !/^\s*км\b/i.test(p) &&
        !/^\s*\d+[a-zа-яіїєґ/-]*\s*$/i.test(p)
    ) ||
    "";
  const numberPart =
    uniqueParts.find((p) => /\d/.test(p) && p !== streetPart && p.length <= 24) ||
    (streetPart.match(/\d+[A-Za-zА-Яа-я/-]*/)?.[0] ?? "");

  const streetLocalized = localizeStreetToken(streetPart);
  const streetHasKm = /\bкм\b/i.test(streetLocalized) || /\bkm\b/i.test(streetPart);
  const normalizedStreet = normalizeAddressPiece(streetLocalized);
  const normalizedNumber = numberPart ? normalizeAddressPiece(numberPart) : "";

  const pieces = [
    streetLocalized,
    streetHasKm || normalizedStreet === normalizedNumber ? "" : numberPart,
    cityPart ? localizeCityName(cityPart) : ""
  ]
    .filter(Boolean)
    .filter((part, idx, arr) => arr.findIndex((other) => normalizeAddressPiece(other) === normalizeAddressPiece(part)) === idx);

  return pieces.join(", ");
}

export function PartnerCard({ partner, ctaHref }: { partner: Partner; ctaHref?: string }) {
  const detailHref = partner.type === "sto" ? `/sto/${partner.slug}` : `/shop/${partner.slug}`;
  const openStatus = getOpenStatus(partner);
  const displayAddress = formatAddressShort(partner.address);
  const workHoursLabel = partner.type === "sto" ? getTodayWorkHoursLabel(partner) : null;

  const serviceLabel = (s: { id: string; name_ua?: string } | string) => {
    const key = typeof s === "string" ? s : s.id;
    if (typeof s !== "string" && s?.name_ua) return s.name_ua;
    return demoServices.find((svc) => svc.slug === key || svc.id === key)?.name_ua ?? key;
  };

  const categoryLabel = (c: { id: string; name_ua?: string } | string) => {
    const key = typeof c === "string" ? c : c.id;
    if (typeof c !== "string" && c?.name_ua) return c.name_ua;
    return demoPartCategories.find((cat) => cat.slug === key || cat.id === key)?.name_ua ?? key;
  };

  return (
    <Card className="flex flex-col gap-3 border border-neutral-200/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-900">{partner.name}</h3>
            {partner.verified && <Badge variant="success">Перевірено</Badge>}
            {partner.type === "sto" && partner.partsSalesEnabled && (
              <Badge className="bg-indigo-50 text-indigo-800">Є запчастини</Badge>
            )}
            {partner.type === "sto" && partner.onlineBookingEnabled && (
              <Badge className="bg-emerald-50 text-emerald-800">Онлайн-запис</Badge>
            )}
            {partner.type === "sto" && openStatus.now && (
              <Badge className="bg-green-50 text-green-800">Працює зараз</Badge>
            )}
            {partner.type === "sto" && !openStatus.now && openStatus.today && (
              <Badge className="bg-lime-50 text-lime-800">Сьогодні працює</Badge>
            )}
            {partner.type === "sto" && !partner.workHours && (
              <Badge className="bg-neutral-100 text-neutral-700">Графік не вказано</Badge>
            )}
            {partner.delivery_available && partner.type === "shop" && (
              <Badge className="bg-blue-50 text-blue-800">Доставка</Badge>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-neutral-600">
            <MapPin className="h-4 w-4" />
            {displayAddress}
            {partner.district ? <span className="text-neutral-400">• {partner.district}</span> : null}
          </p>
          {partner.type === "sto" && (
            <p className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-800">Години роботи:</span> {workHoursLabel}
            </p>
          )}
        </div>
        {partner.rating_avg ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {partner.rating_avg?.toFixed(1)}
          </span>
        ) : null}
      </div>

      {(partner.description || partner.verified) && (
        <p className="text-sm text-neutral-700 line-clamp-2">
          {partner.description || (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              Партнер Pitly
            </span>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {partner.services?.slice(0, 3).map((s) => (
          <Badge key={typeof s === "string" ? s : s.id} variant="outline">
            {serviceLabel(s)}
          </Badge>
        ))}
        {partner.categories?.slice(0, 3).map((c) => (
          <Badge key={typeof c === "string" ? c : c.id} variant="outline">
            {categoryLabel(c)}
          </Badge>
        ))}
        {partner.brands?.length ? (
          <Badge variant="outline">Бренди: {partner.brands.length}</Badge>
        ) : null}
        {partner.type === "sto" && partner.hasTowService ? <Badge variant="outline">Евакуатор</Badge> : null}
        {partner.type === "sto" && partner.mobileService ? <Badge variant="outline">Виїзд</Badge> : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="sm" className="flex-1 md:flex-none">
          <Link href={detailHref}>
            Перейти <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        {partner.type === "sto" && partner.onlineBookingEnabled && (
          <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none">
            <Link href={partner.bookingUrl || detailHref}>{partner.bookingMode === "external" ? "Запис онлайн" : "Записатись"}</Link>
          </Button>
        )}
        <Button asChild size="sm" className="flex-1 md:flex-none">
          <Link href={ctaHref ?? "/request/repair"}>Залишити заявку</Link>
        </Button>
      </div>
    </Card>
  );
}
