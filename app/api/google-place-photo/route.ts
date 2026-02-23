import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return new Response("Google Places API key is not configured", { status: 500 });
  }

  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name || !/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
    return new Response("Invalid photo name", { status: 400 });
  }

  const maxWidthPxRaw = request.nextUrl.searchParams.get("maxWidthPx");
  const maxWidthPx = Number(maxWidthPxRaw);
  const width = Number.isFinite(maxWidthPx) && maxWidthPx > 0 ? Math.min(Math.floor(maxWidthPx), 1600) : 900;

  const googleUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(googleUrl, {
    headers: { Accept: "image/*" },
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!res.ok) {
    return new Response("Photo is unavailable", { status: res.status });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
