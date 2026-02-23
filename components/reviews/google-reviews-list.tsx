"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type GoogleReviewItem = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
    photoURI?: string;
  };
};

type Props = {
  reviews: GoogleReviewItem[];
  googleRating?: number | null;
  googleUserRatingCount?: number | null;
};

function renderStars(value: number) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rounded ? "text-amber-500" : "text-neutral-300"}>
      ★
    </span>
  ));
}

function formatReviewDate(value?: string) {
  if (!value) return "Дата невідома";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Дата невідома";
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export function GoogleReviewsList({ reviews, googleRating, googleUserRatingCount }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = reviews.length > 3;
  const visibleReviews = expanded || !hasMore ? reviews : reviews.slice(0, 3);

  return (
    <Card className="bg-white p-5 ring-1 ring-neutral-200">
      <div className="flex flex-wrap items-center gap-2">
        <MessageSquare className="h-5 w-5 text-neutral-700" />
        <h2 className="text-lg font-bold text-neutral-900">Відгуки Google</h2>
        {typeof googleUserRatingCount === "number" ? <Badge variant="outline">У Google: {googleUserRatingCount}</Badge> : null}
        {typeof googleRating === "number" ? (
          <Badge className="bg-amber-50 text-amber-800">Рейтинг Google: {googleRating.toFixed(1)}</Badge>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        Відгуки нижче показуються окремо від відгуків Pitly, щоб було видно джерело.
      </p>

      {visibleReviews.length ? (
        <div className="mt-4 space-y-3">
          {visibleReviews.map((review, index) => {
            const reviewText = review.text?.text || review.originalText?.text || "";
            const authorName = review.authorAttribution?.displayName || "Користувач Google";
            return (
              <div key={review.name || `g-review-${index}`} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/placeholders/user-avatar-gray.svg"
                      alt="Аватар користувача"
                      className="h-10 w-10 rounded-full border border-neutral-200 bg-white object-cover"
                      loading="lazy"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">{authorName}</p>
                        <Badge variant="outline">Google</Badge>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {review.relativePublishTimeDescription || formatReviewDate(review.publishTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-lg leading-none">{renderStars(review.rating ?? 0)}</div>
                </div>

                <p className="mt-3 text-sm text-neutral-700">{reviewText.trim() || "Текст відгуку відсутній."}</p>

              </div>
            );
          })}

          {hasMore ? (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Згорнути
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Показати всі ({reviews.length})
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-700">Відгуки Google для цього профілю зараз не завантажені або недоступні за API.</p>
        </div>
      )}
    </Card>
  );
}
