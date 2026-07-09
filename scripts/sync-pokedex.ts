import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assignArcana, groupIntoCards } from '../src/lib/arcana/index';
import type { PokemonCard, PokemonRaw, TypeName } from '../src/lib/arcana/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src', 'data', 'generated');
const CACHE_DIR = join(ROOT, '.cache', 'pokeapi');

const DEX_START = Number(process.env.DEX_START ?? 1);
const DEX_END = Number(process.env.DEX_END ?? 151);
const BASE_URL = process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2';
const CONCURRENCY = 8;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url: string, cacheKey: string): Promise<any> {
  const cachePath = join(CACHE_DIR, `${cacheKey}.json`);
  if (existsSync(cachePath)) {
    return JSON.parse(await readFile(cachePath, 'utf8'));
  }
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) throw new Error(`404 Not Found: ${url}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const json = await res.json();
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(cachePath, JSON.stringify(json), 'utf8');
      return json;
    } catch (err) {
      lastErr = err;
      if (String(err).includes('404')) throw err; // don't retry a hard miss
      if (attempt < MAX_RETRIES) await sleep(2 ** attempt * 400);
    }
  }
  throw lastErr;
}

function cleanFlavor(text: string): string {
  return text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchPokemon(id: number): Promise<PokemonRaw & Omit<PokemonCard, 'arcana'>> {
  const pokemon = await fetchJson(`${BASE_URL}/pokemon/${id}`, `pokemon-${id}`);
  const species = await fetchJson(`${BASE_URL}/pokemon-species/${id}`, `species-${id}`);

  const types: TypeName[] = [...pokemon.types]
    .sort((a: any, b: any) => a.slot - b.slot)
    .map((t: any) => t.type.name as TypeName);

  const bst: number = pokemon.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);

  const flavorEntry = (species.flavor_text_entries as any[]).find(
    (e) => e.language.name === 'en',
  );
  const genusEntry = (species.genera as any[]).find((g) => g.language.name === 'en');

  const sprite: string =
    pokemon.sprites?.other?.['official-artwork']?.front_default ??
    pokemon.sprites?.front_default ??
    '';

  return {
    id,
    name: pokemon.name,
    slug: pokemon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    types,
    bst,
    isLegendary: species.is_legendary === true,
    isMythical: species.is_mythical === true,
    sprite,
    thumbSprite: pokemon.sprites?.front_default ?? sprite,
    flavorText: flavorEntry ? cleanFlavor(flavorEntry.flavor_text) : '',
    genus: genusEntry ? genusEntry.genus : '',
  };
}

/** Run tasks with bounded concurrency, preserving input order in the output. */
async function pool<T, R>(items: T[], limit: number, fn: (_item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  if (!Number.isInteger(DEX_START) || !Number.isInteger(DEX_END) || DEX_START < 1 || DEX_END < DEX_START) {
    throw new Error(`Invalid range: DEX_START=${DEX_START} DEX_END=${DEX_END}`);
  }

  const ids = Array.from({ length: DEX_END - DEX_START + 1 }, (_, i) => DEX_START + i);
  console.log(`Fetching Pokemon #${DEX_START}-${DEX_END} from ${BASE_URL} ...`);

  const records = await pool(ids, CONCURRENCY, fetchPokemon);

  const arcana = assignArcana(records);
  const cards: PokemonCard[] = records
    .map((r) => {
      const a = arcana.get(r.id);
      if (!a) throw new Error(`No arcana computed for #${r.id} (${r.name})`);
      return { ...r, arcana: a };
    })
    .sort((a, b) => a.id - b.id);

  const tarotCards = groupIntoCards(cards);
  const majorCount = tarotCards.filter((c) => c.arcana.kind === 'major').length;
  const minorCount = tarotCards.filter((c) => c.arcana.kind === 'minor').length;
  if (tarotCards.length !== 78 || majorCount !== 22 || minorCount !== 56) {
    throw new Error(
      `Expected 78 tarot cards (22 Major + 56 Minor), got ${tarotCards.length} (${majorCount} Major, ${minorCount} Minor).`,
    );
  }
  const emptyMajors = tarotCards.filter((c) => c.arcana.kind === 'major' && c.members.length === 0);
  if (emptyMajors.length > 0) {
    throw new Error(`Major Arcana card(s) with no assigned Pokemon: ${emptyMajors.map((c) => c.arcana.name).join(', ')}.`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'pokemon.json'), JSON.stringify(cards, null, 2), 'utf8');
  await writeFile(join(OUT_DIR, 'cards.json'), JSON.stringify(tarotCards, null, 2), 'utf8');
  await writeFile(
    join(OUT_DIR, 'meta.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dexStart: DEX_START,
        dexEnd: DEX_END,
        count: cards.length,
        source: BASE_URL,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(
    `Wrote ${cards.length} Pokemon across 78 tarot cards (${majorCount} Major, ${minorCount} Minor) to src/data/generated/`,
  );
}

main().catch((err) => {
  console.error('\nSync failed — pokemon.json was NOT overwritten.');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
