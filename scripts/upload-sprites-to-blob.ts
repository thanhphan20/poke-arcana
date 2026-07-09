import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { put } from '@vercel/blob';
import type { PokemonCard } from '../src/lib/arcana/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POKEMON_JSON = join(ROOT, 'src', 'data', 'generated', 'pokemon.json');

const SOURCE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const CONCURRENCY = 4;
const MAX_RETRIES = 4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type SpriteJob = { sourceUrl: string; pathname: string };

async function fetchImage(url: string): Promise<Buffer> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url);
    if (res.status === 404) throw new Error(`404 Not Found: ${url}`);
    if (res.status === 429) {
      const delay = 2 ** attempt * 3000;
      process.stderr.write(`  rate-limited fetching ${url}; waiting ${delay / 1000}s...\n`);
      await sleep(delay);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Failed to fetch after ${MAX_RETRIES} retries: ${url}`);
}

async function uploadJob(job: SpriteJob): Promise<void> {
  const bytes = await fetchImage(job.sourceUrl);
  await put(job.pathname, bytes, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/png',
  });
}

/** Run tasks with bounded concurrency. */
async function pool<T>(items: T[], limit: number, fn: (_item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  let failed = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        await fn(items[i]);
      } catch (err) {
        failed++;
        process.stderr.write(`  [warn] ${err instanceof Error ? err.message : err}\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  if (failed > 0) {
    console.warn(`\n⚠  ${failed} sprite(s) failed to upload. Re-run this script to retry — existing blobs are overwritten, not duplicated.`);
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set. Add it to .env after creating a Vercel Blob store.');
  }

  const cards: PokemonCard[] = JSON.parse(await readFile(POKEMON_JSON, 'utf8'));
  console.log(`Uploading sprites for ${cards.length} Pokemon to Vercel Blob ...`);

  const jobs: SpriteJob[] = cards.flatMap((c) => [
    {
      sourceUrl: `${SOURCE_BASE}/other/official-artwork/${c.id}.png`,
      pathname: `sprites/official-artwork/${c.id}.png`,
    },
    {
      sourceUrl: `${SOURCE_BASE}/${c.id}.png`,
      pathname: `sprites/thumbnails/${c.id}.png`,
    },
  ]);

  await pool(jobs, CONCURRENCY, uploadJob);

  console.log(`Done. Set SPRITES_BASE in src/lib/sprites.ts to your Blob store's public base URL.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
