// Client-side persistence of completed star-map (natal) readings in the
// visitor's own browser. No server, no accounts — a rolling window of recent
// readings in localStorage, mirroring history.ts's draw store.
/* global crypto, localStorage */

import type { BirthDetails } from './birth';
import type { NatalPromptPoint } from './ai/natal/prompt';

const STORAGE_KEY = 'poke-arcana:natal:v1';
const SCHEMA_VERSION = 1;
const MAX_READINGS = 20;

export interface NatalSynthesis {
  provider: string;
  synthesis: string;
}

export interface NatalReadingRecord {
  id: string;
  v: number;
  createdAt: number;
  birth: BirthDetails;
  points: NatalPromptPoint[];
  synthesis?: NatalSynthesis | null;
}

export type NewNatalReading = Omit<NatalReadingRecord, 'id' | 'v' | 'createdAt'>;

interface Store {
  v: number;
  readings: NatalReadingRecord[];
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
    if (!raw) return { v: SCHEMA_VERSION, readings: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as Store).v !== SCHEMA_VERSION ||
      !Array.isArray((parsed as Store).readings)
    ) {
      return { v: SCHEMA_VERSION, readings: [] };
    }
    return parsed as Store;
  } catch {
    return { v: SCHEMA_VERSION, readings: [] };
  }
}

function writeStore(store: Store): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // Quota exceeded, private-mode restriction, or storage disabled — never break the reading.
    return false;
  }
}

export function listNatalReadings(): NatalReadingRecord[] {
  return readStore().readings;
}

export function getNatalReading(id: string): NatalReadingRecord | null {
  return readStore().readings.find((r) => r.id === id) ?? null;
}

// Prepends the new reading (newest-first), evicts oldest beyond MAX_READINGS, returns its id.
export function saveNatalReading(reading: NewNatalReading): string {
  const record: NatalReadingRecord = {
    id: newId(),
    v: SCHEMA_VERSION,
    createdAt: Date.now(),
    ...reading,
  };
  const store = readStore();
  store.readings.unshift(record);
  if (store.readings.length > MAX_READINGS) store.readings.length = MAX_READINGS;
  writeStore(store);
  return record.id;
}

// Merges a patch into an existing record in place (used to fold in the AI synthesis).
export function updateNatalReading(id: string, patch: Partial<NatalReadingRecord>): void {
  const store = readStore();
  const record = store.readings.find((r) => r.id === id);
  if (!record) return;
  Object.assign(record, patch, { id: record.id, v: record.v, createdAt: record.createdAt });
  writeStore(store);
}
