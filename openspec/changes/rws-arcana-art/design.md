## Context

`spread-reveal.ts` currently renders the arcana-front of a drawn card as a CSS-only card face — paper texture, flourish corners, a suit- or major-themed kicker, a banner with the arcana name, and a central `.arcana-card__vignette` containing purely decorative CSS elements (`.arcana-card__rays`, `.arcana-card__horizon`, and a single `.arcana-card__glyph` character). Because the vignette has no imagery, users reading the arcana state see essentially "just a name" and treat the required second tap (which flips to the Pokémon front) as a broken step rather than intentional pacing.

The project already established the pattern for hosting card imagery: Pokémon sprites were pulled out of the deployed repo and moved to Vercel Blob, addressed by a single `SPRITES_BASE` constant and a `spriteUrl(id, variant)` helper in `src/lib/sprites.ts`, uploaded once by `scripts/upload-sprites-to-blob.ts` at deterministic pathnames (`addRandomSuffix: false`), with `SPRITE_FALLBACK` wired via `<img onerror>` for graceful degradation. See `openspec/changes/cdn-sprites-static-build/design.md` for the full rationale — its constraints (no build-time network, no committed images beyond a small placeholder, single-constant base, id-derived URL) apply to this change too.

Arcana identity mapping already exists: `MAJOR_ARCANA_METADATA` is keyed by proper-cased names (`"The Fool"`, `"The Magician"`, …), `MINOR_ARCANA_METADATA` is keyed by suit + rank-name (`RANK_NAMES` = `Ace|Two|…|King`), and the card content records already carry `arcana.kind`, `arcana.name`, `arcana.suit`, and `arcana.rankIndex`. Nothing new needs to be derived at build time.

## Goals / Non-Goals

**Goals:**
- Give the arcana-front reveal state a real image so the two-tap flow reads as pacing, not a bug.
- Reuse the sprite-hosting pattern exactly: Vercel Blob, deterministic paths, single base constant, id-derived URL, `onerror` fallback.
- Keep `spread-reveal.ts` component logic, animation timings, chrome layout, and the Pokémon-front markup untouched.
- Build stays network-free; upload is a maintainer-run, one-off action.

**Non-Goals:**
- Collapsing the two-tap flow into one tap (explicitly out of scope per grilling).
- Changing `pokemonFrontHtml`, the sprite pipeline, or any content-schema fields.
- Custom Pokémon-themed arcana illustrations (generic RWS chosen for scope).
- Image optimization beyond what the existing sprite pipeline does (no WebP conversion, no responsive srcset).
- Changes to card chrome (paper, flourishes, banner, footer, kicker) or the `--accent`/`--wash` themes.

## Decisions

### Decision: Deterministic Blob paths — `tarot/major/{slug}.jpg` and `tarot/minor/{suit}/{rank}.jpg`

Upload all 78 images to Vercel Blob under a `tarot/` prefix with `addRandomSuffix: false`. Majors are keyed by a kebab-case slug of the arcana name (`the-fool`, `the-magician`, `wheel-of-fortune`, …). Minors are keyed by lowercase suit + lowercase rank name (`tarot/minor/cups/ace.jpg`, `tarot/minor/swords/king.jpg`).

- **Why**: Matches the sprite convention (`addRandomSuffix: false`, id/identity-derived path, no full URLs in content JSON). Suit/rank names are more readable than numeric indices when debugging a missing image (`tarot/minor/wands/knight.jpg` says exactly what should be there) and are stable — `RANK_NAMES` and the suit enum are frozen.
- **Alternatives considered**:
  - `tarot/minor/{suit}-{rank}.jpg` (flat): fewer directory levels but blob listings become harder to scan. Rejected — the nested layout matches how minors are conceptually grouped (by suit).
  - `tarot/{id}.jpg` with a numeric 1–78 mapping: parallel to sprite paths but requires a lookup table that duplicates data already in `MAJOR_ARCANA_METADATA`/`MINOR_ARCANA_METADATA`. Rejected — no reason to introduce a second identifier.

### Decision: JPG for all 78 images

The vignette is a filled rectangular region; alpha is not needed. Use JPG at a quality that balances fidelity and payload.

- **Why**: Simpler than PNG for photographic scan content; smaller payload per card; matches how RWS scans are typically distributed. Alpha isn't needed because the image fills the vignette container, whose surrounding chrome is opaque paper.
- **Alternative**: PNG — needed only if we later want to composite RWS art onto a non-opaque background. Rejected for v1.
- **Content-Type on upload**: `image/jpeg` (parallel to `image/png` in the sprite script).

### Decision: New helper `tarotArtUrl(arcana)` in `src/lib/sprites.ts`

Add alongside `spriteUrl`. Signature accepts the minimal arcana identity needed to derive a URL: `{ kind: 'major', name: string } | { kind: 'minor', suit: Suit, rankIndex: number }`. Internally maps `name → slug` (major) or `(suit, rankIndex) → suit/rank-name-lower` (minor) and returns `${TAROT_BASE}/tarot/…`.

- **Why**: Colocates URL derivation with `spriteUrl` — anyone adding a new image kind has one file to touch. The helper accepts the smallest subset of arcana identity the caller already has in `spread-reveal.ts` (via the JSON payload built in `SpreadReveal.astro`).
- **`TAROT_BASE`**: separate constant from `SPRITES_BASE`, sourced from `PUBLIC_TAROT_BASE` env at build time. Keeping them separate means the tarot store can be a different Blob store if needed, without cross-coupling; if they end up in the same store, both constants can reference the same URL — no code change required.
- **Alternative**: extend `spriteUrl(id, variant)` with a `variant: 'tarot-major' | 'tarot-minor'` union. Rejected — the input shape is different (arcana identity, not a numeric ID), forcing an awkward union at the call site.

### Decision: Reuse `SPRITE_FALLBACK` for tarot too, not a tarot-specific placeholder

Wire the existing `/sprite-fallback.svg` on the new `<img onerror>` in `emblemFrontHtml`.

- **Why**: One placeholder is one fewer asset to design and maintain. The fallback is a generic "image unavailable" mark, not Pokémon-specific — using it for tarot is honest. If UX complaints surface, a tarot-specific placeholder is a trivial follow-up (one new SVG, one new export from `sprites.ts`).
- **Alternative**: dedicated `TAROT_ART_FALLBACK`. Rejected as premature.

### Decision: Vignette markup — swap inner content only

In `emblemFrontHtml`, replace the three vignette children (`<div class="arcana-card__rays">`, `<div class="arcana-card__horizon">`, `<span class="arcana-card__glyph">…</span>`) with a single `<img class="arcana-card__art" src="${tarotArtUrl(arcana)}" alt="${arcanaName}" loading="lazy" onerror="…">`. The `.arcana-card__vignette` container itself, its border-radius, and all sibling chrome elements are untouched.

- **Why**: Minimizes visual and structural change to the card. The existing CSS on `.arcana-card__vignette` already provides the framed inset region; the new `<img>` inherits the frame naturally. A new `.arcana-card__art` class holds tarot-specific styling (`width: 100%; height: 100%; object-fit: cover;` and a subtle desaturation/blend to fit the theme if needed).
- **CSS location**: the new class is added to the same `<style>` block in `SpreadReveal.astro` that already scopes `arcana-card` styles, keeping this change to two files (`spread-reveal.ts` + `SpreadReveal.astro`) plus `sprites.ts` and the new upload script.
- **Alternative**: replace the whole `.arcana-card__vignette` with a bare `<img>`. Rejected — the vignette container carries the frame/inset styling that makes the card feel like a card.

### Decision: `loading="lazy"` and no explicit hover preload

Add `loading="lazy"` on the arcana `<img>` (mirroring `pokemonFrontHtml`). Do not add a preload on fan-card hover.

- **Why**: The image is inserted at flip time (after `pickFan`), so lazy-loading kicks in immediately and the network fetch overlaps with the ~800ms `FLIP_MS` flip animation — the image is almost always ready when the flip completes, at Blob CDN latency. Adding a hover-preload adds code complexity (attaching a preload link per fan card, or fetching to a hidden image) for a small perceived gain, and users draw only 1/3/10 cards from a 78-card fan, so preloading everything is wasteful.
- **Alternative**: preload the drawn card's arcana image the moment `pickFan` starts, before the flip animation. Reasonable follow-up if we measure a visible pop; kept out of scope for v1 to keep the diff small.

### Decision: Manual upload via the Vercel dashboard — no upload script

The maintainer uploads the 78 tarot images to Vercel Blob by hand through the Vercel dashboard, mirroring the local file layout. No `scripts/upload-tarot-art-to-blob.ts` is introduced; the previous `scripts/upload-sprites-to-blob.ts` is being removed under the same rationale.

- **Why**: Uploading is an infrequent, deliberate action; a script per asset type is unnecessary machinery when the dashboard exposes the same operation with visual confirmation. Deterministic pathnames still hold — the dashboard preserves the folder structure of the drag-dropped files.
- **How maintainer preserves the path scheme**: prepare a local directory with `major/{slug}.jpg` and `minor/{suit}/{rank}.jpg` layout, drag-drop into the Blob store under a `tarot/` prefix, so URLs come out as `${TAROT_BASE}/tarot/major/{slug}.jpg` and `${TAROT_BASE}/tarot/minor/{suit}/{rank}.jpg`.
- **Alternative (rejected)**: dedicated upload script paralleling the (now-removed) `upload-sprites-to-blob.ts`. Rejected because the sprite equivalent is being deleted for the same "manual is simpler" reason — introducing a new scripted flow would fight that direction.

## Risks / Trade-offs

- **Licensing of the specific scan set** → Rider-Waite-Smith is public domain in the US (published 1909), but individual scans may carry restoration/restoration-copyright claims from the source. **Mitigation**: task requires verifying the scan set's provenance and license before upload; document the source in the change notes.
- **Blob outage or image not yet uploaded** → arcana card face shows the placeholder. **Mitigation**: `SPRITE_FALLBACK` `onerror` wired the same way as sprites; the card chrome still renders correctly so the reveal isn't visibly broken, just less rich.
- **Visible pop when the flip completes** → possible if the CDN is slow and the flip finishes before the image loads. **Mitigation**: `loading="lazy"` starts the fetch as soon as the `<img>` is inserted, which happens roughly at the start of the flip; the ~800ms flip window is usually enough. If this proves noticeable, revisit hover-preload.
- **Two Blob base env vars** → mildly more configuration to keep in sync. **Mitigation**: kept as constants in `sprites.ts`, both public and safe to commit if we later decide to hardcode; docs updated as part of the tasks.
- **Alt text quality for screen readers** → using the arcana name (e.g., `"The Fool"`) as `alt` is minimal but truthful; a fuller description belongs in the arcana metadata, not the alt attribute of a decorative card face. Trade-off accepted.

## Migration Plan

1. Add `PUBLIC_TAROT_BASE` to `.env.example` (docs), then add `TAROT_BASE` + `tarotArtUrl(arcana)` in `src/lib/sprites.ts`.
2. Update `emblemFrontHtml` in `src/components/spread/spread-reveal.ts` to replace the vignette's three inner children with an `<img class="arcana-card__art">` wired to `tarotArtUrl(...)` and `SPRITE_FALLBACK`. Add the `.arcana-card__art` CSS to `SpreadReveal.astro`.
3. Maintainer: source a verified public-domain RWS scan set, arrange it locally as `major/{slug}.jpg` + `minor/{suit}/{rank}.jpg`, drag-drop into the Vercel Blob store under a `tarot/` prefix via the dashboard, set `PUBLIC_TAROT_BASE` in Vercel env and locally.
4. Smoke-check `bun run dev`: draw cards in all three spreads, verify each shows the correct RWS art, and confirm a deliberate 404 falls back to the placeholder.
5. `bun run build` must still succeed offline.

**Rollback**: revert the commit. The vignette returns to CSS-only rendering; no data migration is needed because content JSON is unchanged.

## Open Questions

- None outstanding — path scheme, format, fallback strategy, and preload strategy are all resolved above. The specific scan set is a task-level maintainer decision, not a design question.
