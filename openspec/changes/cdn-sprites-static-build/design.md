## Context

The build command is `bun run scripts/sync-pokedex.ts && astro build`. Because
`src/data/generated/` and `public/sprites/` are both gitignored, every Vercel build
runs the sync script, which (a) fetches ~772 JSON records from PokeAPI and (b)
downloads ~772 sprite images (~53MB) serially from `raw.githubusercontent.com` with a
100ms delay between each — the source of the GitHub rate-limit failures fixed in
commit c968f13. Those 53MB then ship in the deployment.

The existing `pokemon-data-pipeline` spec already mandates that `astro build` perform
no network requests and that the generated JSON be committed — the current
implementation drifted from that intent. This change realigns with it and moves sprite
hosting off the deployment entirely.

Sprite paths are currently baked into the generated JSON as `/sprites/official-artwork/{id}.png`
and consumed directly as `<img src={card.sprite}>` in `TarotCard.astro`,
`SpreadReveal.astro`, `HomeDraw.astro`, `index.astro`, and `spread-reveal.ts`.

Decisions below were settled in a grilling session with the maintainer.

## Goals / Non-Goals

**Goals:**
- Reduce deployed sprite payload from ~53MB to ~0MB.
- Make Vercel builds network-free (no PokeAPI, no GitHub) and fast/reproducible.
- Keep the sprite base URL in a single editable location.
- Degrade gracefully when a sprite image is unavailable.

**Non-Goals:**
- Image optimization (WebP/AVIF, resizing) — unnecessary once images are off the deploy.
- Runtime retry logic or per-sprite health checks — over-engineering for cosmetic assets.
- Changing the arcana assignment, card grouping, or PokeAPI data fields (beyond sprites).

## Decisions

### Decision: Upload sprites to Vercel Blob, not a GitHub-proxy CDN
Serve sprites from a Vercel Blob store (`https://<store>.public.blob.vercel-storage.com/...`),
uploaded once by a maintainer-run script, rather than self-hosting or proxying GitHub.
- **Why**: jsDelivr's `gh` GitHub-proxy mode was the original choice, but it clones the
  **entire** source repo to serve any file and hard-caps that at 50MB combined size.
  `PokeAPI/sprites` is far larger than 50MB, so most artwork 403'd with "Package size
  exceeded" — confirmed non-deterministically failing for arbitrary IDs (e.g. #6, #94, #25)
  regardless of which commit was pinned. `raw.githack.com` (a similar per-file GitHub proxy)
  avoids the size cap but rate-limits under load and its own terms discourage production
  use. Vercel Blob has no such size cap, is a real CDN, and needs no per-file GitHub proxy.
- **Alternatives**: (a) jsDelivr `gh` mode — ruled out, see above; (b) `raw.githack.com` —
  ruled out, rate-limited/not for production; (c) `raw.githubusercontent.com` directly at
  runtime — works per-visitor (rate limits are per-IP, not per our server) but isn't a real
  CDN and GitHub discourages hotlinking it; (d) self-host in the deploy — the original
  problem this change exists to solve.
- **Trade-off**: requires a one-time upload step (maintainer-run script) against a Vercel
  Blob store instead of just referencing an existing public mirror.

### Decision: Deterministic pathnames, no random suffix
Upload with `addRandomSuffix: false` so each blob's pathname is `sprites/official-artwork/{id}.png`
/ `sprites/thumbnails/{id}.png` — deterministic and derivable from `id` alone.
- **Why**: Preserves the single-constant-base + `id`-derived-URL design; without this,
  Blob's default random suffix per upload would force storing full URLs per record again.
- **Trade-off**: re-uploading the same pathname overwrites the existing blob (acceptable —
  uploads are an explicit, infrequent maintenance action).

### Decision: One constant + `spriteUrl(id, variant)` helper
Define `SPRITES_BASE` (the Blob store's public base URL) and `spriteUrl(id, 'artwork' | 'thumb')`
in one module; derive URLs from `id` at render. Drop `sprite`/`thumbSprite` from the
record shape and content schema.
- **Why**: Single source of truth for the store base; re-pointing to a different store
  needs no data regeneration. `id` is already on every record, so the helper is trivial
  and shrinks the JSON.
- **Alternative**: bake full URLs into the JSON — duplicates the base across hundreds of
  records and forces a full regenerate if the store ever changes.
- **Path mapping**: `artwork` → `sprites/official-artwork/{id}.png`;
  `thumb` → `sprites/thumbnails/{id}.png`.

### Decision: Commit generated data; drop sync from the build
Un-ignore `src/data/generated/`, commit `cards.json` / `pokemon.json` / `meta.json`
(~1MB text), and change `build` to just `astro build`. `sync` stays as a manual script.
- **Why**: The dataset is frozen; re-deriving on every deploy buys nothing and adds
  network-failure risk. This satisfies the existing "no-network build / committed data"
  requirement.
- **Alternative**: keep sync in build — leaves ~772 PokeAPI calls per deploy.

### Decision: Local `onerror` placeholder
A small local placeholder asset wired via `onerror` on each sprite `<img>`.
- **Why**: A missing card face reads as badly broken in a tarot UI, and every image now
  depends on a third party. A local placeholder keeps the fallback CDN-independent.
- **Scope**: one shared placeholder; no retries.

## Risks / Trade-offs

- **Vercel Blob runtime dependency** → mitigated by the local `onerror` placeholder; a
  Blob outage degrades to placeholders, not a broken app. Vercel Blob is backed by a real
  CDN with high uptime.
- **Committed generated JSON can drift from the sync script's output** → acceptable; the
  data is frozen for v1, `meta.json` records provenance, and regeneration is a documented
  manual step.
- **A `thumb` sprite may be missing for IDs lacking a front_default** → covered by the same
  `onerror` placeholder; the previous code already tolerated missing sprites.
- **Removing `GITHUB_TOKEN` plumbing** → safe; it was only used for the now-deleted
  download phase.
- **Upload script needs a `BLOB_READ_WRITE_TOKEN`** → a one-time maintainer credential,
  not part of the build; kept out of version control via `.env`.

## Migration Plan

1. Add the `SPRITES_BASE` constant + `spriteUrl` helper and the local placeholder asset.
2. Update record/schema types to drop `sprite`/`thumbSprite`; update all consumers to
   call `spriteUrl(id, …)` and add the `onerror` fallback.
3. Remove the sprite-download phase from `scripts/sync-pokedex.ts`; re-run `bun run sync`
   to regenerate JSON in the new shape.
4. Add a maintainer-run upload script that fetches each sprite and uploads it to Vercel
   Blob at a deterministic pathname; run it once against a real store to populate it.
5. Un-ignore `src/data/generated/`, delete `public/sprites/` and its `.gitignore` entry,
   change `build` to `astro build`, and commit the regenerated JSON.
6. Verify `astro build` succeeds offline and the site renders sprites from Vercel Blob.

**Rollback**: revert the commit; the previous sync-in-build + self-hosted flow returns.

## Open Questions

- None outstanding — the CDN choice (Vercel Blob) and placeholder asset are finalized.
