## 1. Sprite URL helper

- [x] 1.1 Add a `SPRITES_BASE` constant (Vercel Blob store public base URL) and a `spriteUrl(id, variant)` helper in a single module (`src/lib/sprites.ts`) — placeholder value until the real store exists (see task 7)
- [x] 1.2 Implement `spriteUrl(id: number, variant: 'artwork' | 'thumb'): string` — `artwork` → `${SPRITES_BASE}/sprites/official-artwork/${id}.png`, `thumb` → `${SPRITES_BASE}/sprites/thumbnails/${id}.png`
- [x] 1.3 Add a small local placeholder asset (`public/sprite-fallback.svg`) for the `onerror` fallback

## 2. Record shape & schema

- [x] 2.1 Remove `sprite` and `thumbSprite` from the record/type definitions in `src/lib/arcana/types.ts`
- [x] 2.2 Remove `sprite`/`thumbSprite` from the content schema in `src/content.config.ts`
- [x] 2.3 Stop writing `sprite`/`thumbSprite` fields in `scripts/sync-pokedex.ts` (`fetchPokemon` return shape)

## 3. Sync script cleanup

- [x] 3.1 Remove the sprite-download phase and helpers from `scripts/sync-pokedex.ts`: `downloadImage`, `runCurl`, `GITHUB_AUTH_HEADER`, `IMAGE_RETRIES`, `SPRITES_DIR`, the `spriteJobs` loop, and the download warning
- [x] 3.2 Remove `GITHUB_TOKEN` usage/documentation tied to the download phase
- [x] 3.3 Re-run `bun run sync` to regenerate `src/data/generated/*.json` in the new shape

## 4. Consumers (render via helper + fallback)

- [x] 4.1 Update `src/components/TarotCard.astro` to build the sprite src via `spriteUrl(card.id, 'artwork')` and add an `onerror` fallback to the placeholder
- [x] 4.2 Update `src/components/spread/SpreadReveal.astro` and `src/components/spread/spread-reveal.ts`
- [x] 4.3 Update `src/components/home/HomeDraw.astro`
- [x] 4.4 Update `src/pages/index.astro`
- [x] 4.5 Grep for remaining `card.sprite` / `thumbSprite` / `/sprites/` references and update them (found and fixed `src/pages/card/[slug].astro`)

## 5. Build & repo config

- [x] 5.1 Change the `build` script in `package.json` to `astro build` (drop the sync step)
- [x] 5.2 Un-ignore `src/data/generated/` in `.gitignore`; remove the `public/sprites/` entry
- [x] 5.3 Delete the local `public/sprites/` directory (~53MB)
- [ ] 5.4 Commit the regenerated `src/data/generated/*.json`

## 6. Vercel Blob upload (one-time maintainer step)

- [ ] 6.1 Add `@vercel/blob` as a dependency
- [ ] 6.2 Write a standalone upload script (e.g. `scripts/upload-sprites-to-blob.ts`) that, for every id in `src/data/generated/pokemon.json`, fetches the artwork/thumbnail image and uploads it via `put()` with `addRandomSuffix: false` to `sprites/official-artwork/{id}.png` and `sprites/thumbnails/{id}.png`
- [ ] 6.3 Maintainer creates a Vercel Blob store and adds `BLOB_READ_WRITE_TOKEN` to `.env`
- [ ] 6.4 Run the upload script against the real store; capture the store's public base URL
- [ ] 6.5 Set `SPRITES_BASE` in `src/lib/sprites.ts` to the real store base URL

## 7. Verify

- [x] 7.1 Run `bun run typecheck` and `bun run lint` — no errors from the shape change
- [x] 7.2 Run `astro build` with no network access; confirm it succeeds using committed JSON
- [ ] 7.3 Run `bun run dev` / preview and confirm cards render sprites from Vercel Blob and the placeholder shows when a URL is forced to fail
- [x] 7.4 Confirm `dist/` contains no `sprites/` directory and no Pokemon sprite files
