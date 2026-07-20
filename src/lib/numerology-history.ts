// Client-side persistence of completed numerology readings in the
// visitor's own browser. No server, no accounts — a rolling window of
// recent readings in localStorage, mirroring natal-history.ts's store.
/* global crypto, localStorage */

const STORAGE_KEY = 'poke-arcana:numerology:v1';
const SCHEMA_VERSION = 1;
const MAX_READINGS = 20;

export interface NumerologyWeave {
  domain: 'career' | 'love' | 'purpose';
  provider: string;
  synthesis: string;
}

export interface NumerologyReadingRecord {
  id: string;
  v: number;
  createdAt: number;
  name: string;
  birth: { year: number; month: number; day: number };
  numbers: { lifePath: number; expression: number; soulUrge: number; personality: number };
  weave?: NumerologyWeave | null;
}

export type NewNumerologyReading = Omit<NumerologyReadingRecord, 'id' | 'v' | 'createdAt'>;

interface Store {
  v: number;
  readings: NumerologyReadingRecord[];
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

export function listNumerologyReadings(): NumerologyReadingRecord[] {
  return readStore().readings;
}

export function getNumerologyReading(id: string): NumerologyReadingRecord | null {
  return readStore().readings.find((r) => r.id === id) ?? null;
}

// Prepends the new reading (newest-first), evicts oldest beyond MAX_READINGS, returns its id.
export function saveNumerologyReading(reading: NewNumerologyReading): string {
  const record: NumerologyReadingRecord = {
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

// Merges a patch into an existing record in place (used to fold in the AI weave).
export function updateNumerologyReading(id: string, patch: Partial<NumerologyReadingRecord>): void {
  const store = readStore();
  const record = store.readings.find((r) => r.id === id);
  if (!record) return;
  Object.assign(record, patch, { id: record.id, v: record.v, createdAt: record.createdAt });
  writeStore(store);
}
