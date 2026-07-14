// Client-side persistence of the visitor's birth date, so their sun/moon
// signs can be re-highlighted on the star map on return visits. No server,
// no accounts.
/* global localStorage */

// v2: full YYYY-MM-DD (v1 stored MM-DD only, before the moon sign needed a year).
const STORAGE_KEY = 'poke-arcana:birth-date:v2';

/** Stored as `YYYY-MM-DD`. */
export function getBirthDate(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveBirthDate(isoDate: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, isoDate);
  } catch {
    // Quota exceeded, private-mode restriction, or storage disabled — never break the page.
  }
}

export function clearBirthDate(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
