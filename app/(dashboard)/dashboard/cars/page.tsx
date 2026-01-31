"use client";

import { useState } from "react";
import { PlusCircle, Wrench } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoCars } from "@/lib/data/demo";

export default function DashboardCarsPage() {
  const [cars] = useState(demoCars);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-600">Гараж</p>
          <h1 className="text-2xl font-bold text-neutral-900">Мої авто</h1>
          <p className="text-neutral-600">Зберігайте авто, щоб заявки заповнювались швидше.</p>
        </div>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Додати авто
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cars.map((car) => (
          <Card key={car.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Авто</p>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {car.brand} {car.model} {car.year ? `· ${car.year}` : ""}
                </h3>
                {car.vin && <p className="text-xs text-neutral-500">VIN: {car.vin}</p>}
              </div>
              <Button variant="secondary" size="sm">
                Редагувати
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-neutral-700">
              <Info label="Пробіг" value={car.mileage_km ? `${car.mileage_km.toLocaleString()} км` : "—"} />
              <Info label="Останній сервіс" value={car.last_service ?? "—"} />
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              {car.notes || "Додайте нотатки про роботи, витрати та ТО."}
            </div>

            <Button variant="ghost" size="sm" className="text-neutral-700">
              <Wrench className="mr-2 h-4 w-4" />
              Створити заявку для цього авто
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
