// Client-side persistence of completed draws in the visitor's own browser.
// No server, no accounts — a rolling window of recent readings in localStorage.
/* global crypto, localStorage */

const STORAGE_KEY = 'poke-arcana:draws:v1';
const SCHEMA_VERSION = 1;
const MAX_DRAWS = 20;

export interface DrawCard {
  position: string;
  arcanaName: string;
  pokemonName: string;
  pokemonSlug: string;
  pokemonFlavor: string;
  description: string;
  uprightMeaning: string;
}

export interface AiReadingCard {
  position: string;
  arcana: string;
  pokemon: string;
  interpretation: string;
}

export interface AiReading {
  provider: string;
  cards: AiReadingCard[];
  synthesis: string;
}

export interface DrawRecord {
  id: string;
  v: number;
  createdAt: number;
  question: string;
  spreadSize: number;
  cards: DrawCard[];
  ai?: AiReading | null;
}

export type NewDraw = Omit<DrawRecord, 'id' | 'v' | 'createdAt'>;

interface Store {
  v: number;
  draws: DrawRecord[];
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
    if (!raw) return { v: SCHEMA_VERSION, draws: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as Store).v !== SCHEMA_VERSION ||
      !Array.isArray((parsed as Store).draws)
    ) {
      return { v: SCHEMA_VERSION, draws: [] };
    }
    return parsed as Store;
  } catch {
    return { v: SCHEMA_VERSION, draws: [] };
  }
}

function writeStore(store: Store): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // Quota exceeded, private-mode restriction, or storage disabled — never break the reveal.
    return false;
  }
}

export function listDraws(): DrawRecord[] {
  return readStore().draws;
}

export function getDraw(id: string): DrawRecord | null {
  return readStore().draws.find((d) => d.id === id) ?? null;
}

// Prepends the new draw (newest-first), evicts oldest beyond MAX_DRAWS, returns its id.
export function saveDraw(draw: NewDraw): string {
  const record: DrawRecord = {
    id: newId(),
    v: SCHEMA_VERSION,
    createdAt: Date.now(),
    ...draw,
  };
  const store = readStore();
  store.draws.unshift(record);
  if (store.draws.length > MAX_DRAWS) store.draws.length = MAX_DRAWS;
  writeStore(store);
  return record.id;
}

// Merges a patch into an existing record in place (used to fold in the AI reading).
export function updateDraw(id: string, patch: Partial<DrawRecord>): void {
  const store = readStore();
  const record = store.draws.find((d) => d.id === id);
  if (!record) return;
  Object.assign(record, patch, { id: record.id, v: record.v, createdAt: record.createdAt });
  writeStore(store);
}
