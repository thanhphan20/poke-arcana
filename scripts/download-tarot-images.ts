import { mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
import { MAJOR_ARCANA } from '../src/lib/arcana/majorArcana';
import { RANKS } from '../src/lib/arcana/ranks';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'tarot');

// Rider-Waite-Smith scans sourced from github.com/krates98/tarotcardapi.
// That repo names files descriptively (thefool.jpeg, aceofcups.jpeg); we save
// them under this project's derivable scheme (m00.webp / c01.webp / …) so the
// runtime lookup in src/lib/sprites.ts needs no rename table. The target names
// are derived from MAJOR_ARCANA order (which defines majorNumber) and RANKS,
// keeping them in lockstep with tarotArtUrl().
//
// Each source scan is downscaled (the art never renders wider than ~340 CSS px,
// so ~720px covers retina) and re-encoded to WebP before it is committed —
// public/ files are served as-is, so the optimization has to happen here rather
// than through astro:assets (which only processes imports from src/).
const SOURCE_BASE = 'https://raw.githubusercontent.com/krates98/tarotcardapi/main/images';

// The art never renders above ~340 CSS px (≈156px in the reveal), so 560px
// stays sharp even at ~1.75x on the largest surface while cutting real bytes.
const MAX_WIDTH = 560;
const WEBP_QUALITY = 75;

// Two files in the source repo don't follow the normalize(name)+".jpeg" rule.
const SOURCE_OVERRIDES: Record<string, string> = {
  'The Lovers': 'TheLovers.jpg',
  'Strength': 'thestrength.jpeg',
};

// Suit order + letter must match SUIT_LETTER in src/lib/sprites.ts.
const SUITS: { label: string; letter: string }[] = [
  { label: 'Cups', letter: 'c' },
  { label: 'Swords', letter: 's' },
  { label: 'Wands', letter: 'w' },
  { label: 'Pentacles', letter: 'p' },
];

const IMAGE_RETRIES = 4;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Job {
  name: string;
  img: string;
  source: string;
}

function sourceFileFor(name: string): string {
  return SOURCE_OVERRIDES[name] ?? `${name.toLowerCase().replace(/[^a-z]/g, '')}.jpeg`;
}

function buildJobs(): Job[] {
  const jobs: Job[] = [];
  MAJOR_ARCANA.forEach((name, majorNumber) => {
    jobs.push({ name, img: `m${String(majorNumber).padStart(2, '0')}.webp`, source: sourceFileFor(name) });
  });
  for (const { label, letter } of SUITS) {
    RANKS.forEach((rank, rankIndex) => {
      const name = `${rank} of ${label}`;
      jobs.push({ name, img: `${letter}${String(rankIndex + 1).padStart(2, '0')}.webp`, source: sourceFileFor(name) });
    });
  }
  return jobs;
}

function runCurl(args: string[]): Promise<{ exitCode: number; stdout: string }> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    const proc = spawn('curl', args);
    proc.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => resolve({ exitCode: code ?? 1, stdout }));
  });
}

async function fetchToFile(url: string, tmp: string): Promise<void> {
  for (let attempt = 0; attempt <= IMAGE_RETRIES; attempt++) {
    const { exitCode, stdout } = await runCurl([
      '-sL', '--max-time', '60', '--output', tmp, '-w', '%{http_code}', url,
    ]);
    const status = parseInt(stdout.trim(), 10);
    if (exitCode !== 0) {
      await unlink(tmp).catch(() => {});
      if (attempt < IMAGE_RETRIES) { await sleep(2 ** attempt * 500); continue; }
      throw new Error(`curl exited ${exitCode} for ${url}`);
    }
    if (status === 404) { await unlink(tmp).catch(() => {}); throw new Error(`404 Not Found: ${url}`); }
    if (status === 429) {
      await unlink(tmp).catch(() => {});
      const delay = 2 ** attempt * 3000;
      process.stderr.write(`  rate-limited; waiting ${delay / 1000}s…\n`);
      await sleep(delay);
      continue;
    }
    if (status < 200 || status >= 300) {
      await unlink(tmp).catch(() => {});
      if (attempt < IMAGE_RETRIES) { await sleep(2 ** attempt * 500); continue; }
      throw new Error(`HTTP ${status} for ${url}`);
    }
    return;
  }
  throw new Error(`Failed to fetch after ${IMAGE_RETRIES} retries: ${url}`);
}

async function downloadAndOptimize(url: string, destPath: string): Promise<void> {
  if (existsSync(destPath)) return;
  const tmp = `${destPath}.src`;
  await fetchToFile(url, tmp);
  try {
    await sharp(tmp)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(destPath);
  } finally {
    await unlink(tmp).catch(() => {});
  }
}

async function main() {
  const jobs = buildJobs();
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`Downloading + optimizing ${jobs.length} tarot images to public/tarot/ (WebP, ≤${MAX_WIDTH}px, q${WEBP_QUALITY}) ...`);
  let failed = 0;
  for (const job of jobs) {
    const url = `${SOURCE_BASE}/${job.source}`;
    const dest = join(OUT_DIR, job.img);
    try {
      await downloadAndOptimize(url, dest);
      console.log(`  ✓ ${job.name} -> ${job.img}`);
    } catch (err) {
      failed++;
      process.stderr.write(`  [fail] ${job.name} (${job.source}): ${err instanceof Error ? err.message : err}\n`);
    }
    await sleep(80);
  }

  console.log(`\nDone. ${jobs.length - failed}/${jobs.length} optimized into public/tarot/`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
