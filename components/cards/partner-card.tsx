import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoPartCategories, demoServices } from "@/lib/data/demo";
import { type Partner } from "@/lib/types";

export function PartnerCard({ partner, ctaHref }: { partner: Partner; ctaHref?: string }) {
  const detailHref = partner.type === "sto" ? `/sto/${partner.slug}` : `/shop/${partner.slug}`;

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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{partner.name}</h3>
            {partner.verified && <Badge variant="success">Перевірено</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
            <MapPin className="h-4 w-4" />
            {partner.address ?? "Адресу уточнити"}
          </p>
        </div>
        {partner.rating_avg ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {partner.rating_avg?.toFixed(1)}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-neutral-700 line-clamp-2">{partner.description}</p>
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
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={detailHref}>
            Перейти <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href={ctaHref ?? "/request/repair"}>Залишити заявку</Link>
        </Button>
      </div>
    </Card>
  );
}
