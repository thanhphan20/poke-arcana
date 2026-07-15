// Live city search backed by the free, key-less Open-Meteo Geocoding API.
// This is the one place in the app that sends anything (the typed city
// fragment) to a third party — everything else stays client-only.

export interface CityResult {
  id: number;
  label: string;
  lat: number;
  lng: number;
  /** IANA timezone identifier, e.g. "Asia/Ho_Chi_Minh". */
  tz: string;
}

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  admin1?: string;
  country?: string;
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
}

function buildLabel(r: OpenMeteoResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(', ');
}

/** Never throws — an empty array on any network/parse failure. */
export async function searchCities(query: string, signal?: AbortSignal): Promise<CityResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=vi&format=json`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];

    const data = (await res.json()) as OpenMeteoResponse;
    return (data.results ?? []).map((r) => ({
      id: r.id,
      label: buildLabel(r),
      lat: r.latitude,
      lng: r.longitude,
      tz: r.timezone,
    }));
  } catch {
    return [];
  }
}
