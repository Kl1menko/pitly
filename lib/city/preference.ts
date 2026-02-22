const PREFERRED_CITY_KEY = "pitly_preferred_city";

export function getPreferredCitySlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(PREFERRED_CITY_KEY);
    return value || null;
  } catch {
    return null;
  }
}

export function setPreferredCitySlug(slug: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFERRED_CITY_KEY, slug);
  } catch {
    // no-op
  }
}

export { PREFERRED_CITY_KEY };
