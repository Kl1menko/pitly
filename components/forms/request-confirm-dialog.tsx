"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  open: boolean;
  onClose: () => void;
  onSendGuest: () => void;
  onSendWithAccount: () => void;
  summary: { title: string; rows: { label: string; value?: string | number | null }[] };
};

export function RequestConfirmDialog({ open, onClose, onSendGuest, onSendWithAccount, summary }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <Card className="w-full max-w-xl space-y-4 p-6 shadow-2xl">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Перевірте заявку</p>
          <h3 className="text-2xl font-bold text-neutral-900">{summary.title}</h3>
        </div>
        <div className="space-y-2 text-sm text-neutral-800">
          {summary.rows
            .filter((r) => r.value)
            .map((row) => (
              <div key={row.label} className="flex justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-600">{row.label}</span>
                <span className="font-semibold text-neutral-900 text-right">{row.value}</span>
              </div>
            ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-2 text-neutral-800 hover:text-neutral-900 hover:bg-neutral-100/70"
          >
            ← Назад до редагування
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onSendWithAccount}
              className="bg-neutral-900 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Увійти / Зареєструватись і надіслати
            </Button>
            <Button
              variant="secondary"
              onClick={onSendGuest}
              className="border-neutral-400 text-neutral-900 hover:border-neutral-600 hover:text-neutral-950"
            >
              Надіслати без акаунту
            </Button>
          </div>
        </div>

        <div className="space-y-1.5 rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700">
          <p className="font-semibold text-neutral-800">Як надіслати?</p>
          <p>Без акаунту: отримаєте посилання в Telegram.</p>
          <p>З акаунтом: заявка збережеться в кабінеті, зможете стежити за статусом.</p>
        </div>
      </Card>
    </div>
  );
}
