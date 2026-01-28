import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Phone } from "lucide-react";

import { PartnerCard } from "@/components/cards/partner-card";
import { MapView } from "@/components/maps/map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoServices } from "@/lib/data/demo";
import { getPartnerBySlug, getPartnersByCity } from "@/lib/supabase/queries";

type Props = {
  params: { partnerSlug: string };
};

export default async function StoDetailPage({ params }: Props) {
  const partner = await getPartnerBySlug("sto", params.partnerSlug);
  if (!partner) return notFound();

  const others = partner.city_id
    ? await getPartnersByCity({ type: "sto", cityId: partner.city_id, filters: { sort: "rating" } })
    : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{partner.name}</h1>
              {partner.verified && (
                <Badge variant="success" className="flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4" /> Перевірено
                </Badge>
              )}
            </div>
            <p className="flex items-center gap-2 text-neutral-600">
              <MapPin className="h-4 w-4" />
              {partner.address}
            </p>
            {partner.phone && (
              <p className="flex items-center gap-2 text-neutral-700">
                <Phone className="h-4 w-4" />
                {partner.phone}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {partner.rating_avg ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                ⭐ {partner.rating_avg.toFixed(1)} ({partner.rating_count ?? 0})
              </span>
            ) : null}
            <Button asChild size="lg">
              <Link href={`/request/repair?partner=${partner.id}&city=${partner.city_id}`}>Залишити заявку</Link>
            </Button>
          </div>
        </div>
        {partner.description && <p className="mt-3 text-neutral-700">{partner.description}</p>}

        {partner.services && (
          <div className="mt-4 flex flex-wrap gap-2">
            {partner.services.map((service) => {
              const key = typeof service === "string" ? service : service.id;
              const label =
                typeof service === "string"
                  ? demoServices.find((s) => s.slug === service || s.id === service)?.name_ua ?? service
                  : service.name_ua ?? service.id;
              return (
                <Badge key={key} variant="outline">
                  {label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <Card className="p-4">
        {partner.lat && partner.lng ? (
          <MapView lat={partner.lat} lng={partner.lng} label={partner.name} />
        ) : (
          <p className="text-sm text-neutral-600">Координати відсутні</p>
        )}
      </Card>

      {others.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold">Інші СТО поруч</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {others
              .filter((p) => p.slug !== partner.slug)
              .slice(0, 4)
              .map((p) => (
                <PartnerCard key={p.id} partner={p} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
