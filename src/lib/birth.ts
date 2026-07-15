// Client-side persistence of the visitor's birth details, so their Sun/Moon/
// Rising signs can be re-highlighted on the star map on return visits. No
// server, no accounts.
/* global localStorage */

// v3: full { date, hour, minute, city } blob (v2 stored a bare YYYY-MM-DD
// string, before birth time + place were added for the Ascendant).
const STORAGE_KEY = 'poke-arcana:birth-date:v3';

export interface BirthCity {
  label: string;
  lat: number;
  lng: number;
  tz: string;
}

export interface BirthDetails {
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  city: BirthCity | null; // null when no city was selected — Sun+Moon only
}

export function getBirthDetails(): BirthDetails | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof (parsed as BirthDetails).date !== 'string'
    ) {
      return null;
    }
    return parsed as BirthDetails;
  } catch {
    return null;
  }
}

export function saveBirthDetails(details: BirthDetails): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    // Quota exceeded, private-mode restriction, or storage disabled — never break the page.
  }
}

export function clearBirthDetails(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
