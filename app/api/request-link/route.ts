import { NextResponse } from "next/server";
import crypto from "crypto";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = body?.requestId as string | undefined;
    const telegram = (body?.telegram as string | undefined)?.trim();

    if (!requestId || !telegram) {
      return NextResponse.json({ error: "requestId and telegram required" }, { status: 400 });
    }

    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + ONE_WEEK_MS).toISOString();

    const supabase = getSupabaseServiceRoleClient();
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
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegram.startsWith("@") ? telegram : `@${telegram}`,
            text: `Ваше посилання на заявку:\n${link}\n\nЗбережіть його, щоб повернутися до пропозицій без логіну.`,
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        });
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
