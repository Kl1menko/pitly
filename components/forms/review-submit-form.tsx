"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  partnerId: string;
};

export function ReviewSubmitForm({ partnerId }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!mounted) return;
        setIsLoggedIn(Boolean(data.user));
      })
      .catch(() => {
        if (!mounted) return;
        setIsLoggedIn(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          setError("Щоб залишити відгук, потрібно увійти в акаунт.");
          return;
        }

        const payload = {
          partner_id: partnerId,
          client_profile_id: userData.user.id,
          rating,
          comment: comment.trim() || null
        };
        const { error: insertError } = await supabase.from("reviews").insert(payload);
        if (insertError) {
          setError(insertError.message.includes("duplicate") ? "Відгук уже додано." : "Не вдалося надіслати відгук.");
          return;
        }

        setComment("");
        setRating(5);
        setMessage("Дякуємо! Відгук надіслано на модерацію.");
      } catch {
        setError("Сталася помилка під час надсилання відгуку.");
      }
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Залишити відгук на Pitly</p>
          <p className="text-xs text-neutral-500">Відгук публікується після модерації.</p>
        </div>
        {!isLoggedIn ? (
          <Link href="/login" className="text-xs font-semibold text-neutral-700 hover:text-neutral-900">
            Увійти / реєстрація
          </Link>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Оцінка</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={[
                  "rounded-full border px-3 py-1 text-sm font-semibold transition",
                  rating === value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700"
                ].join(" ")}
              >
                {value}★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Коментар</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Що сподобалось, як виконали роботу, чи будете рекомендувати..."
            className="min-h-[100px] bg-white"
            maxLength={1500}
          />
          <p className="mt-1 text-right text-xs text-neutral-500">{comment.length}/1500</p>
        </div>

        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Надсилаємо..." : "Надіслати відгук"}
        </Button>
      </form>
    </div>
  );
}
