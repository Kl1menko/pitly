import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Phone } from "lucide-react";

import { PartnerCard } from "@/components/cards/partner-card";
import { MapView } from "@/components/maps/map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          <Button asChild size="lg">
            <Link href={`/request/repair?partner=${partner.slug}`}>Залишити заявку</Link>
          </Button>
        </div>
        {partner.description && <p className="mt-3 text-neutral-700">{partner.description}</p>}

        {partner.services && (
          <div className="mt-4 flex flex-wrap gap-2">
            {partner.services.map((service) => (
              <Badge key={service} variant="outline">
                {service}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <MapView lat={partner.lat ?? undefined} lng={partner.lng ?? undefined} label={partner.name} />

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
