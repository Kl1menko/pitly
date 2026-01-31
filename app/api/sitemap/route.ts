import { NextResponse } from "next/server";

import { demoCities, allDemoPartners } from "@/lib/data/demo";

export async function GET() {
  const urls = [
    "",
    "/cities",
    "/how-it-works",
    ...demoCities.flatMap((city) => [`/${city.slug}/sto`, `/${city.slug}/shops`]),
    ...allDemoPartners.map((p) => (p.type === "sto" ? `/sto/${p.slug}` : `/shop/${p.slug}`))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url>
<loc>${process.env.SITE_URL || "http://localhost:3000"}${u}</loc>
<changefreq>daily</changefreq>
<priority>0.7</priority>
</url>`
  )
  .join("")}
</urlset>`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
