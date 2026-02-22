'use client';

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";
const LEGACY_COOKIE = "sb:token";

type SessionTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
};

function baseCookieAttrs(maxAge: number) {
  const attrs = [`path=/`, `max-age=${maxAge}`, `samesite=lax`];
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attrs.push("secure");
  }
  return attrs.join("; ");
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${baseCookieAttrs(maxAge)}`;
}

export function writeSupabaseSessionCookies(session?: SessionTokens | null) {
  if (!session?.access_token && !session?.refresh_token) return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  if (session.access_token) setCookie(ACCESS_COOKIE, session.access_token, maxAge);
  if (session.refresh_token) setCookie(REFRESH_COOKIE, session.refresh_token, maxAge);
}

export function clearSupabaseSessionCookies() {
  const expired = "path=/; max-age=0; samesite=lax";
  document.cookie = `${ACCESS_COOKIE}=; ${expired}`;
  document.cookie = `${REFRESH_COOKIE}=; ${expired}`;
  document.cookie = `${LEGACY_COOKIE}=; ${expired}`;
}
