import { mkdir, rename, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPRITES_DIR = join(ROOT, 'public', 'sprites');

const DEX_START = Number(process.env.DEX_START ?? 1);
const DEX_END = Number(process.env.DEX_END ?? 151);
const IMAGE_RETRIES = 4;

// A GitHub PAT (any classic token, no scopes needed) raises the raw.githubusercontent.com
// rate limit from ~60 to 5 000 req/hour — set GITHUB_TOKEN in .env to enable.
const GITHUB_AUTH_HEADER: string[] = process.env.GITHUB_TOKEN
  ? ['-H', `Authorization: token ${process.env.GITHUB_TOKEN}`]
  : [];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function runCurl(args: string[]): Promise<{ exitCode: number; stdout: string }> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    const proc = spawn('curl', args);
    proc.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => resolve({ exitCode: code ?? 1, stdout }));
  });
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  if (!url || existsSync(destPath)) return;
  // Bun's built-in fetch is rate-limited by GitHub's CDN via TLS fingerprinting;
  // curl (with optional auth) bypasses this. We write to a temp file and check the
  // HTTP status via -w "%{http_code}" to stdout so a 429 body isn't treated as success.
  for (let attempt = 0; attempt <= IMAGE_RETRIES; attempt++) {
    const tmp = `${destPath}.tmp`;
    const { exitCode, stdout } = await runCurl([
      '-sL', '--max-time', '60', ...GITHUB_AUTH_HEADER, '--output', tmp, '-w', '%{http_code}', url,
    ]);
    const status = parseInt(stdout.trim(), 10);
    if (exitCode !== 0) {
      await unlink(tmp).catch(() => {});
      if (attempt < IMAGE_RETRIES) { await sleep(2 ** attempt * 500); continue; }
      throw new Error(`curl exited ${exitCode} for ${url}`);
    }
    if (status === 404) { await unlink(tmp).catch(() => {}); return; }
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
    await rename(tmp, destPath);
    return;
  }
  throw new Error(`Failed to download after ${IMAGE_RETRIES} retries: ${url}`);
}

async function main() {
  if (!Number.isInteger(DEX_START) || !Number.isInteger(DEX_END) || DEX_START < 1 || DEX_END < DEX_START) {
    throw new Error(`Invalid range: DEX_START=${DEX_START} DEX_END=${DEX_END}`);
  }

  await mkdir(join(SPRITES_DIR, 'official-artwork'), { recursive: true });
  await mkdir(join(SPRITES_DIR, 'thumbnails'), { recursive: true });

  const ids = Array.from({ length: DEX_END - DEX_START + 1 }, (_, i) => DEX_START + i);
  console.log(`Downloading sprites for Pokemon #${DEX_START}-${DEX_END} to public/sprites/ ...`);

  type SpriteJob = { remoteUrl: string; destPath: string };
  const spriteJobs: SpriteJob[] = ids.flatMap((id) => [
    {
      remoteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      destPath: join(SPRITES_DIR, 'official-artwork', `${id}.png`),
    },
    {
      remoteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      destPath: join(SPRITES_DIR, 'thumbnails', `${id}.png`),
    },
  ]);

  // Serial downloads (concurrency 1) to stay well under GitHub's rate limits.
  // Failures are warnings, not fatal — re-run to fill in any gaps.
  let downloadFailed = 0;
  for (const job of spriteJobs) {
    try {
      await downloadImage(job.remoteUrl, job.destPath);
    } catch (err) {
      downloadFailed++;
      process.stderr.write(`  [warn] ${err instanceof Error ? err.message : err}\n`);
    }
    await sleep(100);
  }

  const count = DEX_END - DEX_START + 1;
  if (downloadFailed > 0) {
    console.warn(`\n⚠  ${downloadFailed} sprite(s) failed to download (rate limit?). Re-run to retry — already-downloaded files are skipped.`);
  }
  console.log(`\n✓ Sprites saved to public/sprites/ (${count} artwork + ${count} thumbnails)`);
  console.log('  Upload to Vercel Blob manually via the dashboard, preserving the sprites/official-artwork/{id}.png and sprites/thumbnails/{id}.png layout.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
