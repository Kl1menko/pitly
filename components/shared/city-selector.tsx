import { Select } from "@/components/ui/select";
import { type City } from "@/lib/types";

export function CitySelector({
  cities,
  value,
  onChange,
  placeholder = "Оберіть місто"
}: {
  cities: City[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const selectedSlug = value
    ? cities.find((c) => c.slug === value || c.id === value)?.slug ?? ""
    : "";
  return (
    <Select value={selectedSlug} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">{placeholder}</option>
      {cities.map((city) => (
        <option key={city.id} value={city.slug}>
          {city.name_ua}
        </option>
      ))}
    </Select>
  );
}
