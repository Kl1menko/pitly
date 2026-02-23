"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, X } from "lucide-react";

const STORAGE_KEY = "pitly_home_register_nudge_seen_v2";
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const ALWAYS_SHOW_FOR_TEST = false;

function hasAuthCookie() {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie || "";
  return cookies.includes("sb-access-token=") || cookies.includes("sb:token=");
}

export function PopularCitiesRegisterNudge({ targetId = "popular-cities-section" }: { targetId?: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const markSeen = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const closeNudge = () => {
    markSeen();
    setVisible(false);
  };

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
        setVisible(true);
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

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] w-[min(92vw,360px)]">
      <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-5 pb-5 pt-4 text-white shadow-2xl ring-1 ring-white/10">
        <button
          type="button"
          aria-label="Закрити підказку"
          onClick={closeNudge}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/10">
            <CircleUserRound className="h-4 w-4" />
            <span>Зареєструйтесь — так зручніше</span>
          </div>
          <p className="text-sm leading-relaxed text-white/95">
            У кабінеті все збережеться в одному місці: заявки, відповіді партнерів і історія звернень.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              markSeen();
              setVisible(false);
              router.push("/register");
            }}
            className="inline-flex min-w-[168px] items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            Реєстрація
          </button>
        </div>
      </div>
    </div>
  );
}
