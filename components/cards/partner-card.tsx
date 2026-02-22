import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";

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

export function PartnerCard({ partner, ctaHref }: { partner: Partner; ctaHref?: string }) {
  const detailHref = partner.type === "sto" ? `/sto/${partner.slug}` : `/shop/${partner.slug}`;
  const openStatus = getOpenStatus(partner);

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
            {partner.delivery_available && partner.type === "shop" && (
              <Badge className="bg-blue-50 text-blue-800">Доставка</Badge>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-neutral-600">
            <MapPin className="h-4 w-4" />
            {partner.address ?? "Адресу уточнити"}
            {partner.district ? <span className="text-neutral-400">• {partner.district}</span> : null}
          </p>
        </div>
        {partner.rating_avg ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {partner.rating_avg?.toFixed(1)}
          </span>
        ) : null}
      </div>

      <p className="text-sm text-neutral-700 line-clamp-2">{partner.description || "Партнер Pitly"}</p>

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
