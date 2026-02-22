"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CityPickerModal } from "@/components/shared/city-picker-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getPreferredCitySlug, setPreferredCitySlug } from "@/lib/city/preference";
import { quizSymptoms, type QuizSymptomKey } from "@/lib/services/problem-quiz";
import { type CarBrand, type City } from "@/lib/types";

export function ProblemQuizWizard({
  cities,
  brands,
  initial
}: {
  cities: City[];
  brands: CarBrand[];
  initial?: { symptom?: string; city?: string; detail?: string; brand?: string };
}) {
  const router = useRouter();
  const [step, setStep] = useState(initial?.city && initial?.symptom ? 3 : 1);
  const [symptom, setSymptom] = useState<QuizSymptomKey | "">((initial?.symptom as QuizSymptomKey) || "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [citySlug, setCitySlug] = useState(initial?.city || getPreferredCitySlug() || "");
  const [cityModalOpen, setCityModalOpen] = useState(false);

  const selectedSymptom = quizSymptoms.find((item) => item.key === symptom);
  const selectedCity = citySlug ? cities.find((city) => city.slug === citySlug) : null;

  const submit = () => {
    if (!symptom || !citySlug) return;
    const params = new URLSearchParams();
    params.set("symptom", symptom);
    params.set("city", citySlug);
    if (detail.trim()) params.set("detail", detail.trim());
    if (brand) params.set("brand", brand);
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <>
      <Card className="space-y-4 border border-neutral-200/90 bg-white/90">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-neutral-500">Швидкий підбір за проблемою</p>
            <h2 className="text-xl font-bold text-neutral-900">Крок {step} з 3</h2>
          </div>
          <div className="text-xs text-neutral-500">60–90 секунд до результату</div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-neutral-900 transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-700">Що турбує?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {quizSymptoms.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSymptom(item.key);
                    setStep(2);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left ${
                    symptom === item.key ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className={`text-xs ${symptom === item.key ? "text-white/80" : "text-neutral-500"}`}>{item.shortHint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">{selectedSymptom?.followupLabel ?? "Уточніть проблему"}</p>
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Назад
              </Button>
            </div>
            <Input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Коротко: коли, після чого, які симптоми..." />
            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(3)} disabled={!symptom}>
                Далі
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">Місто та авто (марка — опційно)</p>
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                Назад
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="justify-start" onClick={() => setCityModalOpen(true)}>
                {selectedCity ? `Місто: ${selectedCity.name_ua}` : "Оберіть місто"}
              </Button>
              <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">Марка авто (опційно)</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
            <p className="text-xs text-neutral-500">Це не діагноз, а навігація: підкажемо напрямок і покажемо релевантні сервіси поруч.</p>
            <div className="flex flex-wrap justify-between gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/request/repair")}>
                Подати заявку (план Б)
              </Button>
              <Button type="button" onClick={submit} disabled={!symptom || !citySlug}>
                Показати результат
              </Button>
            </div>
          </div>
        )}
      </Card>

      <CityPickerModal
        cities={cities}
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        title="Оберіть місто для підбору сервісу"
        onSelect={(city) => {
          setPreferredCitySlug(city.slug);
          setCitySlug(city.slug);
          setCityModalOpen(false);
        }}
      />
    </>
  );
}
