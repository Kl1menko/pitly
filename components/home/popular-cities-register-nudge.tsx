"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

const STORAGE_KEY = "pitly_home_register_nudge_seen_v2";
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const ALWAYS_SHOW_FOR_TEST = true;

function hasAuthCookie() {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie || "";
  return cookies.includes("sb-access-token=") || cookies.includes("sb:token=");
}

export function PopularCitiesRegisterNudge({ targetId = "popular-cities-section" }: { targetId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ALWAYS_SHOW_FOR_TEST) {
      const seenAtRaw = window.localStorage.getItem(STORAGE_KEY);
      if (seenAtRaw) {
        const seenAt = Number(seenAtRaw);
        if (Number.isFinite(seenAt) && Date.now() - seenAt < COOLDOWN_MS) return;
      }
    }
    if (hasAuthCookie()) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    let shown = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || shown) return;
        shown = true;
        if (!ALWAYS_SHOW_FOR_TEST) {
          window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
        }
        sileo.info({
          title: "Зареєструйтесь — так зручніше",
          description: "У кабінеті все збережеться в одному місці: заявки, відповіді партнерів і історія звернень.",
          button: {
            title: "Реєстрація",
            onClick: () => router.push("/register")
          }
        });
        observer.disconnect();
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [router, targetId]);

  return null;
}
