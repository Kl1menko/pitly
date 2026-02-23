import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

const TOKEN_TTL_MINUTES = 10;

function randomCode() {
  return String(crypto.randomInt(100000, 999999));
}

function randomToken() {
  return crypto.randomBytes(18).toString("base64url");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "register" ? "register" : "login";
    const role = ["client", "partner_sto", "partner_shop"].includes(body?.role) ? body.role : "client";

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      return NextResponse.json({ error: "telegram_bot_not_configured" }, { status: 500 });
    }

    const token = randomToken();
    const code = randomCode();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase.from("telegram_auth_tokens").insert({
      token,
      code,
      mode,
      role,
      expires_at: expiresAt
    });
    if (error) {
      console.error("telegram auth start insert error", error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    const botUrl = `https://t.me/${botUsername}?start=tglogin_${token}`;
    return NextResponse.json({
      ok: true,
      token,
      botUrl,
      expiresAt
    });
  } catch (e) {
    console.error("telegram auth start error", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}

