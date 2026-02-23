import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

async function sendTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN missing");
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`telegram_send_failed:${res.status}:${body}`);
  }
}

function extractStartToken(text?: string | null) {
  if (!text) return null;
  const match = text.match(/^\/start(?:\s+|%20)?tglogin_([A-Za-z0-9_-]+)$/i);
  return match?.[1] ?? null;
}

export async function POST(req: Request) {
  try {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (expectedSecret && headerSecret !== expectedSecret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const update = await req.json().catch(() => ({}));
    const message = update?.message;
    const text = message?.text as string | undefined;
    const token = extractStartToken(text);
    if (!message || !token) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat?.id ?? "");
    const telegramUserId = String(message.from?.id ?? "");
    const telegramUsername = message.from?.username ? String(message.from.username) : null;
    if (!chatId || !telegramUserId) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabaseServiceRoleClient();
    const { data: authToken, error: fetchError } = await supabase
      .from("telegram_auth_tokens")
      .select("id, code, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (fetchError || !authToken) {
      await sendTelegramMessage(chatId, "Схоже, посилання недійсне або вже протерміноване. Поверніться на сайт і спробуйте ще раз.");
      return NextResponse.json({ ok: true });
    }

    const expired = new Date(authToken.expires_at).getTime() < Date.now();
    if (expired || authToken.status === "consumed") {
      await sendTelegramMessage(chatId, "Цей код вже неактивний. Поверніться на сайт і згенеруйте новий.");
      await supabase.from("telegram_auth_tokens").update({ status: "expired" }).eq("id", authToken.id);
      return NextResponse.json({ ok: true });
    }

    const { error: updateError } = await supabase
      .from("telegram_auth_tokens")
      .update({
        status: "bot_confirmed",
        telegram_user_id: telegramUserId,
        telegram_username: telegramUsername,
        telegram_chat_id: chatId
      })
      .eq("id", authToken.id);

    if (updateError) {
      console.error("telegram webhook token update error", updateError);
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      chatId,
      `Код для входу в Pitly: ${authToken.code}\n\nВведіть його на сайті. Код дійсний ~10 хвилин.`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("telegram webhook error", e);
    return NextResponse.json({ ok: true });
  }
}

