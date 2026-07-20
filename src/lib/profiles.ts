// Client-side storage for reusable birth profiles ("Me", "Mom", a friend...),
// shared between the Star Map and Numerology forms so a birth date/time/place
// entered once can be picked again from either page. No server, no accounts.
/* global crypto, localStorage */

import type { BirthCity } from './birth';

const STORAGE_KEY = 'poke-arcana:profiles:v1';
const SCHEMA_VERSION = 1;
const MAX_PROFILES = 20;

export interface Profile {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  hour: number | null;
  minute: number | null;
  city: BirthCity | null;
  createdAt: number;
}

// hour/minute/city are optional on input: omit a key entirely to leave that
// field untouched on an existing profile (e.g. Numerology only knows the
// name+date, and shouldn't erase a birth time/city saved earlier from Star Map).
export interface ProfileInput {
  name: string;
  date: string;
  hour?: number | null;
  minute?: number | null;
  city?: BirthCity | null;
}

interface Store {
  v: number;
  profiles: Profile[];
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Any parse/version failure yields an empty store rather than throwing.
function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { v: SCHEMA_VERSION, profiles: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as Store).v !== SCHEMA_VERSION ||
      !Array.isArray((parsed as Store).profiles)
    ) {
      return { v: SCHEMA_VERSION, profiles: [] };
    }
    return parsed as Store;
  } catch {
    return { v: SCHEMA_VERSION, profiles: [] };
  }
}

function writeStore(store: Store): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // Quota exceeded, private-mode restriction, or storage disabled — never break the form.
    return false;
  }
}

export function listProfiles(): Profile[] {
  return readStore().profiles;
}

export function getProfile(id: string): Profile | null {
  return readStore().profiles.find((p) => p.id === id) ?? null;
}

// Upserts by name (case-insensitive): resaving the same person refreshes
// their profile instead of piling up duplicates. Newest-first, capped at
// MAX_PROFILES.
export function saveProfile(input: ProfileInput): string {
  const store = readStore();
  const existing = store.profiles.find(
    (p) => p.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
  );

  if (existing) {
    existing.name = input.name;
    existing.date = input.date;
    if ('hour' in input) existing.hour = input.hour ?? null;
    if ('minute' in input) existing.minute = input.minute ?? null;
    if ('city' in input) existing.city = input.city ?? null;
    writeStore(store);
    return existing.id;
  }

  const record: Profile = {
    id: newId(),
    createdAt: Date.now(),
    name: input.name,
    date: input.date,
    hour: input.hour ?? null,
    minute: input.minute ?? null,
    city: input.city ?? null,
  };
  store.profiles.unshift(record);
  if (store.profiles.length > MAX_PROFILES) store.profiles.length = MAX_PROFILES;
  writeStore(store);
  return record.id;
}

export function deleteProfile(id: string): void {
  const store = readStore();
  store.profiles = store.profiles.filter((p) => p.id !== id);
  writeStore(store);
}

export function profileLabel(profile: Profile): string {
  const [y, m, d] = profile.date.split('-').map(Number);
  let dateStr: string;
  try {
    dateStr = new Date(y, m - 1, d).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    dateStr = profile.date;
  }
  return `${profile.name} — ${dateStr}`;
}
