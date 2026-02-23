import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function decodeCookieValue(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractAccessToken(req: NextRequest) {
  const direct = decodeCookieValue(req.cookies.get("sb-access-token")?.value);
  if (direct) return direct;
  const legacy = decodeCookieValue(req.cookies.get("sb:token")?.value);
  if (!legacy) return "";
  try {
    const parsed = JSON.parse(legacy);
    if (typeof parsed?.access_token === "string") return parsed.access_token;
  } catch {
    return legacy;
  }
  return "";
}

function makeRequestProof(requestId: string, contactPhone: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(`${requestId}:${contactPhone.trim()}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestId = body?.requestId as string | undefined;
    const telegram = (body?.telegram as string | undefined)?.trim();
    const requestProof = (body?.requestProof as string | undefined)?.trim();

    if (!requestId || !telegram) {
      return NextResponse.json({ error: "requestId and telegram required" }, { status: 400 });
    }

    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + ONE_WEEK_MS).toISOString();

    const supabase = getSupabaseServiceRoleClient();
    const accessToken = extractAccessToken(req);
    let authUserId: string | null = null;
    if (accessToken) {
      const { data } = await supabase.auth.getUser(accessToken);
      authUserId = data.user?.id ?? null;
    }

    const { data: requestRow, error: requestFetchError } = await supabase
      .from("requests")
      .select("id, client_profile_id, contact_phone")
      .eq("id", requestId)
      .maybeSingle();

    if (requestFetchError || !requestRow) {
      return NextResponse.json({ error: "request_not_found" }, { status: 404 });
    }

    const ownerAuthorized = Boolean(authUserId && requestRow.client_profile_id && requestRow.client_profile_id === authUserId);
    const proofAuthorized = Boolean(
      requestProof &&
        requestRow.contact_phone &&
        makeRequestProof(requestId, requestRow.contact_phone) &&
        requestProof === makeRequestProof(requestId, requestRow.contact_phone)
    );

    if (!ownerAuthorized && !proofAuthorized) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("request_links").insert({
      request_id: requestId,
      token,
      channel: "telegram",
      contact: telegram,
      expires_at: expiresAt
    });

    if (error) {
      console.error("request-link insert error", error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    // Send message via Telegram bot
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const configuredOrigin = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
    const requestOrigin = req.headers.get("origin") ?? new URL(req.url).origin;
    const origin = (configuredOrigin || requestOrigin).replace(/\/$/, "");
    const link = `${origin}/request/${requestId}?token=${token}`;

    if (botToken) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegram.startsWith("@") ? telegram : `@${telegram}`,
            text: `Ваше посилання на заявку:\n${link}\n\nЗбережіть його, щоб повернутися до пропозицій без логіну.`,
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        });
        if (!tgRes.ok) {
          const tgBody = await tgRes.text().catch(() => "");
          console.error("telegram send non-ok", tgRes.status, tgBody);
        }
      } catch (e) {
        console.error("telegram send error", e);
      }
    } else {
      console.warn("TELEGRAM_BOT_TOKEN missing; skipping send");
    }

    return NextResponse.json({ ok: true, link });
  } catch (e) {
    console.error("request-link API error", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
