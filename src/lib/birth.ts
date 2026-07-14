// Client-side persistence of the visitor's birth date, so their sun sign can
// be re-highlighted on the star map on return visits. No server, no accounts.
/* global localStorage */

const STORAGE_KEY = 'poke-arcana:birth-date:v1';

/** Stored as `MM-DD` (year is irrelevant to a sun sign, and left out on purpose). */
export function getBirthDate(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveBirthDate(monthDay: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, monthDay);
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
