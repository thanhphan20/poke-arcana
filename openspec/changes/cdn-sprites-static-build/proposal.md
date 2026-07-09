## Why

Every Vercel build re-downloads ~772 Pokemon sprites (~53MB) from GitHub's raw
host into `public/sprites/`, which is slow, hits GitHub rate limits, and ships
53MB of images in each deployment. The generated Pokedex JSON is also gitignored,
so the build re-fetches ~772 records from PokeAPI on every deploy — violating the
existing `pokemon-data-pipeline` requirement that `astro build` perform no network
requests. Serving sprites from a real CDN and committing the generated data closes
both gaps at once.

## What Changes

- Sprites are uploaded once to a **Vercel Blob** store (via a maintainer-run script)
  and referenced from there at runtime, instead of being re-downloaded and self-hosted
  on every build. Deployment sprite payload drops from ~53MB to ~0MB.
- A single `SPRITES_BASE` constant plus a `spriteUrl(id, 'artwork' | 'thumb')` helper
  become the one source of truth for sprite URLs; the store base URL lives in one line.
- **BREAKING** (record shape): the generated data no longer stores `sprite` /
  `thumbSprite` string fields — URLs are derived from `id` at render time.
- A lightweight local placeholder is shown via `<img onerror>` when a CDN image fails.
- `src/data/generated/` is un-ignored and its JSON committed; the build command
  becomes just `astro build` (no network). `bun run sync` becomes a manual refresh.
- The sprite-download phase is removed from `scripts/sync-pokedex.ts` (drops
  `downloadImage`, `runCurl`, `GITHUB_AUTH_HEADER`, sprite-jobs loop, `GITHUB_TOKEN`).
- `public/sprites/` (~53MB) and its `.gitignore` entry are deleted.

## Capabilities

### New Capabilities
- `sprite-delivery`: how Pokemon sprite images reach the browser — Vercel Blob URLs
  derived from a single constant + helper, with a local fallback placeholder.

### Modified Capabilities
- `pokemon-data-pipeline`: the generated record no longer carries stored sprite-URL
  strings (derived from `id` instead); the sync script no longer downloads images;
  and the network-free-build + committed-data requirements are enforced by removing
  the build-time sync step.

## Impact

- **Code**: `scripts/sync-pokedex.ts` (remove sprite download), new sprite helper +
  `SPRITES_BASE` constant, `src/lib/arcana/types.ts` and `src/content.config.ts`
  (record/schema shape), and consumers `TarotCard.astro`, `SpreadReveal.astro`,
  `HomeDraw.astro`, `index.astro`, `spread-reveal.ts`.
- **Build/deploy**: `package.json` `build` script; `.gitignore` (un-ignore generated
  data, drop `public/sprites/`); ~1MB generated JSON newly committed; ~53MB
  `public/sprites/` deleted.
- **Runtime dependency**: card images now depend on Vercel Blob availability (mitigated
  by the local `onerror` placeholder).
- **Env**: `GITHUB_TOKEN` no longer used by the sync script; a new `BLOB_READ_WRITE_TOKEN`
  is needed only to run the one-time upload script.
- **New dependency**: `@vercel/blob` (used only by the upload script).
