import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Clock3,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Wrench
} from "lucide-react";

import { PartnerCard } from "@/components/cards/partner-card";
import { ReviewSubmitForm } from "@/components/forms/review-submit-form";
import { MapView } from "@/components/maps/map-view";
import { GoogleReviewsList } from "@/components/reviews/google-reviews-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoServices } from "@/lib/data/demo";
import { getSupabaseServerClient, supabaseReady } from "@/lib/supabase/server";
import { getPartnerBySlug, getPartnersByCity } from "@/lib/supabase/queries";
import { type Partner } from "@/lib/types";

type Props = {
  params: { partnerSlug: string };
};

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  created_at?: string;
};

type GoogleReviewItem = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
    photoURI?: string;
  };
};

type GooglePlaceDetailsReviews = {
  reviews?: GoogleReviewItem[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  photos?: { name?: string; widthPx?: number; heightPx?: number }[];
};

const WEEKDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const WEEKDAY_LABELS: Record<(typeof WEEKDAY_ORDER)[number], string> = {
  mon: "Пн",
  tue: "Вт",
  wed: "Ср",
  thu: "Чт",
  fri: "Пт",
  sat: "Сб",
  sun: "Нд"
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "СТО";
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
    text = text.replace(pattern, (match) => {
      const isUpper = match.toUpperCase() === match && /[A-Z]/.test(match);
      if (isUpper) return replacement.toUpperCase();
      const isCapitalized = /[A-Z]/.test(match[0]) && match[0] === match[0].toUpperCase();
      return isCapitalized ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
    });
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

function localizeStreetToken(value: string) {
  const hasStreetSuffix = /\b(Street|St\.?)\b/i.test(value);
  const normalized = value
    .replace(/\bStreet\b/gi, "вул.")
    .replace(/\bSt\b\.?/gi, "вул.")
    .replace(/\bAvenue\b/gi, "просп.")
    .replace(/\bAve\b\.?/gi, "просп.")
    .replace(/\bBoulevard\b/gi, "б-р")
    .replace(/\bBlvd\b\.?/gi, "б-р")
    .replace(/\bLane\b/gi, "пров.")
    .replace(/\bLn\b\.?/gi, "пров.");
  let localized = titleCaseWords(transliterateToUkr(normalized));

  // Heuristics for common Ukrainian street adjective endings in transliterated names.
  localized = localized
    .replace(/\bЛвів/g, "Львів")
    .replace(/\bлвів/g, "львів")
    .replace(/Тска\b/g, "Цька")
    .replace(/тска\b/g, "цька")
    .replace(/Цка\b/g, "Цька")
    .replace(/цка\b/g, "цька")
    .replace(/Ска\b/g, "Ська")
    .replace(/ска\b/g, "ська")
    .replace(/Ский\b/g, "Ський")
    .replace(/ский\b/g, "ський")
    .replace(/Ского\b/g, "Ського")
    .replace(/ского\b/g, "ського");

  // "Horodotska St" -> "вулиця Городоцька"
  if (hasStreetSuffix && /Вул\.\s*$/i.test(localized)) {
    localized = `вулиця ${localized.replace(/\s*Вул\.\s*$/i, "").trim()}`;
  } else if (/^Вул\.\s+/i.test(localized)) {
    localized = localized.replace(/^Вул\.\s+/i, "вулиця ");
  }

  return localized;
}

function localizeCityName(value: string) {
  const compact = value.toLowerCase().replace(/[^a-z']/g, "");
  const map: Record<string, string> = {
    kyiv: "Київ",
    kiev: "Київ",
    "lviv": "Львів",
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
  return map[compact] || titleCaseWords(transliterateToUkr(value));
}

function formatUkrAddressShort(address?: string | null) {
  if (!address) return "Адресу не вказано";
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/ukraine|область|oblast|^\d{5,6}$/i.test(part));

  const streetPart =
    parts.find((part) => /\b(st|street|ave|avenue|blvd|boulevard|ln|lane)\b/i.test(part)) ||
    parts.find((part) => /вул|просп|б-р|пров/i.test(part)) ||
    parts[0] ||
    "";

  const cityPart =
    parts.find(
      (part) =>
        /^(kyiv|kiev|lviv|l'viv|dnipro|odesa|odessa|kharkiv|vinnytsia|zaporizhzhia|mykolaiv|chernihiv|poltava)$/i.test(
          part.trim()
        )
    ) ||
    parts.find(
      (part) =>
        /(kyiv|kiev|lviv|l'viv|dnipro|odesa|odessa|kharkiv|vinnytsia|zaporizhzhia|mykolaiv|chernihiv|poltava)/i.test(part) &&
        part !== streetPart &&
        !/\b(st|street|ave|avenue|blvd|boulevard|ln|lane)\b/i.test(part)
    ) ||
    parts.find((part) => part !== streetPart) ||
    "";

  const numberPart =
    parts.find((part) => /\d/.test(part) && part !== streetPart && part.length <= 24) ||
    (streetPart.match(/\d+[A-Za-zА-Яа-я/-]*/)?.[0] ?? "");

  const street = localizeStreetToken(streetPart);
  const city = localizeCityName(cityPart);
  return [street, numberPart, city].filter(Boolean).join(", ");
}

function renderStars(value: number) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={`star-${i}`} className={`h-4 w-4 ${i < rounded ? "fill-amber-500 text-amber-500" : "text-neutral-300"}`} />
  ));
}

function getWeekdayKey(date = new Date()) {
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[date.getDay()];
}

function getTodayWorkHoursText(partner: Partner) {
  const day = partner.workHours?.[getWeekdayKey()];
  if (!day) return "Графік не вказано";
  if (day.isOpen === false) return "Зачинено сьогодні";
  if (!day.open || !day.close) return "Графік не вказано";
  if (day.open === "00:00" && (day.close === "23:59" || day.close === "24:00")) return "Сьогодні: цілодобово";
  return `Сьогодні: ${day.open}–${day.close}`;
}

function getFullWeekWorkHoursRows(partner: Partner) {
  return WEEKDAY_ORDER.map((key) => {
    const day = partner.workHours?.[key];
    let value = "Не вказано";
    if (day?.isOpen === false) value = "Зачинено";
    else if (day?.open && day?.close) {
      value = day.open === "00:00" && (day.close === "23:59" || day.close === "24:00") ? "Цілодобово" : `${day.open}–${day.close}`;
    }
    return { key, label: WEEKDAY_LABELS[key], value, isToday: key === getWeekdayKey() };
  });
}

function serviceLabel(service: { id: string; name_ua?: string } | string) {
  const key = typeof service === "string" ? service : service.id;
  if (typeof service !== "string" && service.name_ua) return service.name_ua;
  return demoServices.find((s) => s.slug === key || s.id === key)?.name_ua ?? key;
}

function formatReviewDate(value?: string) {
  if (!value) return "Дата невідома";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Дата невідома";
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

async function getGooglePlaceReviews(placeId?: string | null): Promise<GooglePlaceDetailsReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey || !placeId) return null;

  const encodedPlaceId = encodeURIComponent(placeId);
  const url = `https://places.googleapis.com/v1/places/${encodedPlaceId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount,googleMapsUri,photos",
        "Accept-Language": "uk"
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!res.ok) {
      return null;
    }
    return (await res.json()) as GooglePlaceDetailsReviews;
  } catch {
    return null;
  }
}

export default async function StoDetailPage({ params }: Props) {
  const partner = await getPartnerBySlug("sto", params.partnerSlug);
  if (!partner) return notFound();

  const partnerExt = partner as Partner & {
    website?: string | null;
    telegram?: string | null;
    google_place_id?: string | null;
    google_types?: string[] | null;
  };

  let reviews: ReviewItem[] = [];
  let googleReviewsPayload: GooglePlaceDetailsReviews | null = null;
  if (supabaseReady) {
    const supabase = getSupabaseServerClient();
    const [{ data }, googlePayload] = await Promise.all([
      supabase
        .from("reviews")
        .select("id,rating,comment,created_at")
        .eq("partner_id", partner.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8),
      getGooglePlaceReviews(partnerExt.google_place_id)
    ]);
    reviews = (data as ReviewItem[] | null) ?? [];
    googleReviewsPayload = googlePayload;
  } else if (partnerExt.google_place_id) {
    googleReviewsPayload = await getGooglePlaceReviews(partnerExt.google_place_id);
  }

  const others = partner.city_id
    ? await getPartnersByCity({ type: "sto", cityId: partner.city_id, filters: { sort: "rating" } })
    : [];

  const importedFromGoogle = Boolean(partnerExt.google_place_id);
  const displayName = partner.name;
  const displayAddress = importedFromGoogle ? formatUkrAddressShort(partner.address) : partner.address ?? "Адресу не вказано";
  const reviewCount = reviews.length || (partner.rating_count ?? 0);
  const googleReviews = (googleReviewsPayload?.reviews ?? []).slice(0, 5);
  const googlePhotos = (googleReviewsPayload?.photos ?? []).filter((p) => p.name).slice(0, 6);
  const hasRating = typeof partner.rating_avg === "number" && partner.rating_avg > 0;
  const topServices = (partner.services ?? []).slice(0, 12);
  const todayWorkHoursText = getTodayWorkHoursText(partner);
  const fullWeekHours = getFullWeekWorkHoursRows(partner);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,224,71,0.16),transparent_45%),radial-gradient(circle_at_left,rgba(14,165,233,0.08),transparent_42%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-2xl font-bold text-white shadow-lg">
              {getInitials(displayName)}
            </div>
            <div className="space-y-3">
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
                  partner.verified ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                ].join(" ")}
              >
                <ShieldCheck className={`h-4.5 w-4.5 ${partner.verified ? "text-emerald-600" : "text-neutral-500"}`} />
                {partner.verified ? "Верифіковано Pitly" : "Не верифіковано Pitly"}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{displayName}</h1>
                {partner.verified ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4" /> Перевірено
                  </Badge>
                ) : null}
                {partner.onlineBookingEnabled ? <Badge className="bg-emerald-50 text-emerald-700">Онлайн-запис</Badge> : null}
              </div>

              <div className="grid gap-2 text-sm text-neutral-700">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  <span>{displayAddress}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  <span>{todayWorkHoursText}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 lg:w-[360px]">
            <Card className="bg-neutral-50 p-4 ring-1 ring-neutral-200">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Рейтинг</p>
              {hasRating ? (
                <>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-2xl font-bold text-neutral-900">{partner.rating_avg?.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5">{renderStars(partner.rating_avg ?? 0)}</div>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">Оцінок: {reviewCount}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-neutral-600">Поки немає оцінок</p>
              )}
            </Card>

            <Card className="bg-neutral-50 p-4 ring-1 ring-neutral-200">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Послуги</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">{partner.services?.length ?? 0}</p>
              <p className="mt-1 text-sm text-neutral-600">Категорії сервісу в профілі</p>
            </Card>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href={`/request/repair?partner=${partner.id}&city=${partner.city_id}`}>Залишити заявку</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="bg-white p-5 ring-1 ring-neutral-200">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-neutral-700" />
              <h2 className="text-lg font-bold text-neutral-900">Послуги</h2>
            </div>
            {topServices.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {topServices.map((service) => {
                  const key = typeof service === "string" ? service : service.id;
                  return (
                    <Badge key={key} variant="outline">
                      {serviceLabel(service)}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Послуги ще не заповнені. Ми оновимо профіль після модерації.</p>
            )}
          </Card>

          <Card className="bg-white p-5 ring-1 ring-neutral-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-neutral-700" />
              <h2 className="text-lg font-bold text-neutral-900">Відгуки Pitly</h2>
              {reviews.length ? <Badge variant="outline">{reviews.length}</Badge> : null}
            </div>

            {reviews.length ? (
              <div className="mt-4 space-y-3">
                {reviews.map((review, index) => (
                  <div key={review.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                        <span className="text-sm font-semibold text-neutral-900">{review.rating}/5</span>
                      </div>
                      <span className="text-xs text-neutral-500">{formatReviewDate(review.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700">
                      {review.comment?.trim() || "Клієнт залишив оцінку без текстового коментаря."}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">Відгук #{index + 1}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                <p className="text-sm text-neutral-700">
                  Поки що немає опублікованих відгуків. Можна залишити заявку та стати першим клієнтом, який оцінить сервіс.
                </p>
              </div>
            )}

            <ReviewSubmitForm partnerId={partner.id} />
          </Card>

          <GoogleReviewsList
            reviews={googleReviews}
            googleRating={googleReviewsPayload?.rating ?? null}
            googleUserRatingCount={googleReviewsPayload?.userRatingCount ?? null}
          />
        </div>

        <div className="space-y-6">
          <Card className="bg-white p-5 ring-1 ring-neutral-200">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-neutral-700" />
              <h2 className="text-lg font-bold text-neutral-900">Графік роботи</h2>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {fullWeekHours.map((row) => (
                <div
                  key={row.key}
                  className={[
                    "flex items-center justify-between rounded-xl px-3 py-2",
                    row.isToday ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200" : "bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200"
                  ].join(" ")}
                >
                  <span className={row.isToday ? "font-semibold" : "font-medium"}>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white p-5 ring-1 ring-neutral-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-neutral-700" />
              <h2 className="text-lg font-bold text-neutral-900">Фото місця</h2>
              {googlePhotos.length ? <Badge variant="outline">{googlePhotos.length}</Badge> : null}
            </div>
            {googlePhotos.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {googlePhotos.map((photo, index) => (
                  <a
                    key={photo.name}
                    href={`/api/google-place-photo?name=${encodeURIComponent(photo.name!)}&maxWidthPx=1600`}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-2xl ring-1 ring-neutral-200"
                  >
                    <img
                      src={`/api/google-place-photo?name=${encodeURIComponent(photo.name!)}&maxWidthPx=700`}
                      alt={`Фото сервісу ${displayName} ${index + 1}`}
                      loading="lazy"
                      className="h-32 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                <p className="text-sm text-neutral-700">Фото місця поки недоступні.</p>
              </div>
            )}
          </Card>

          <Card className="bg-white p-5 ring-1 ring-neutral-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-neutral-700" />
              <h2 className="text-lg font-bold text-neutral-900">Локація</h2>
            </div>
            <div className="mt-4">
              {partner.lat && partner.lng ? (
                <MapView lat={partner.lat} lng={partner.lng} label={displayName} height={300} />
              ) : (
                <p className="text-sm text-neutral-600">Координати відсутні</p>
              )}
            </div>
            <p className="mt-3 text-sm text-neutral-600">{displayAddress}</p>
          </Card>

          <Card className="bg-white p-5 ring-1 ring-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">Інформація про сервіс</h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-700">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-neutral-500" />
                <div>
                  <p className="font-semibold text-neutral-900">Статус на платформі</p>
                  <p>{partner.verified ? "Перевірений партнер" : "Профіль додано до каталогу, очікує повної верифікації"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 text-neutral-500" />
                <div>
                  <p className="font-semibold text-neutral-900">Графік роботи</p>
                  <p>{todayWorkHoursText}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 text-neutral-500" />
                <div>
                  <p className="font-semibold text-neutral-900">Опис</p>
                  <p>{partner.description?.trim() || "Опис сервісу буде додано після уточнення профілю."}</p>
                </div>
              </div>
              {partner.hasTowService || partner.mobileService ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-900">Додаткові опції</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {partner.hasTowService ? <Badge variant="outline">Евакуатор</Badge> : null}
                    {partner.mobileService ? <Badge variant="outline">Виїзне обслуговування</Badge> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      {others.length > 1 && (
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-neutral-900">Схожі СТО в цьому місті</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {others
              .filter((p) => p.slug !== partner.slug)
              .slice(0, 4)
              .map((p) => (
                <PartnerCard key={p.id} partner={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
