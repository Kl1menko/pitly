import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

function syntheticTelegramEmail(telegramUserId: string) {
  return `tg_${telegramUserId}@telegram.pitly.local`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body?.token ?? "").trim();
    const code = String(body?.code ?? "").trim();
    const role = ["client", "partner_sto", "partner_shop"].includes(body?.role) ? body.role : "client";
    const origin =
      req.headers.get("origin") ||
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (!token || !code) {
      return NextResponse.json({ error: "token_and_code_required" }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();
    const { data: authToken, error: tokenError } = await supabase
      .from("telegram_auth_tokens")
      .select("*")
      .eq("token", token)
      .eq("code", code)
      .maybeSingle();

    if (tokenError || !authToken) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }
    if (authToken.status !== "bot_confirmed") {
      return NextResponse.json({ error: "bot_confirmation_required" }, { status: 400 });
    }
    if (new Date(authToken.expires_at).getTime() < Date.now()) {
      await supabase.from("telegram_auth_tokens").update({ status: "expired" }).eq("id", authToken.id);
      return NextResponse.json({ error: "code_expired" }, { status: 400 });
    }
    if (!authToken.telegram_user_id) {
      return NextResponse.json({ error: "telegram_user_missing" }, { status: 400 });
    }

    const telegramUserId = String(authToken.telegram_user_id);
    const email = syntheticTelegramEmail(telegramUserId);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, telegram")
      .eq("telegram", telegramUserId)
      .maybeSingle();

    const isNewUser = !profile;
    let userIdToPatch: string | null = profile?.id ?? null;

    if (isNewUser) {
      const { data: createdUserData, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          role,
          auth_channel: "telegram"
        }
      });
      if (createUserError && !/already/i.test(createUserError.message)) {
        console.error("telegram verify createUser error", createUserError);
        return NextResponse.json({ error: "create_user_failed" }, { status: 500 });
      }
      userIdToPatch = createdUserData?.user?.id ?? null;
    }

    if (userIdToPatch) {
      await supabase
        .from("profiles")
        .update({
          role,
          telegram: telegramUserId
        })
        .eq("id", userIdToPatch);
    }

    const { data: magic, error: magicError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${origin}/auth/callback`
      }
    } as never);

    if (magicError) {
      console.error("telegram verify generateLink error", magicError);
      return NextResponse.json({ error: "magic_link_failed" }, { status: 500 });
    }

    await supabase
      .from("telegram_auth_tokens")
      .update({
        status: "consumed",
        consumed_at: new Date().toISOString()
      })
      .eq("id", authToken.id);

    const redirectUrl =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (magic as any)?.properties?.action_link ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (magic as any)?.action_link;

    if (!redirectUrl) {
      return NextResponse.json({ error: "missing_action_link" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      isNewUser,
      redirectUrl
    });
  } catch (e) {
    console.error("telegram auth verify error", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
