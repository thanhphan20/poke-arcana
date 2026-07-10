## Context

`spread-reveal.ts` renders the arcana-front of a drawn card as a CSS-only card face — paper texture, flourish corners, a suit- or major-themed kicker, a banner with the arcana name, and a central `.arcana-card__vignette` containing purely decorative CSS elements (`.arcana-card__rays`, `.arcana-card__horizon`, `.arcana-card__glyph`). Because the vignette has no imagery, users treat the required second tap (which flips to the Pokémon front) as a broken step rather than intentional pacing.

The project already hosts Pokémon **sprites** on Vercel Blob (`spriteUrl` + `SPRITES_BASE` in `src/lib/sprites.ts`), a decision driven by scale: ~772 sprites, ~53MB, previously re-fetched per deploy (see `openspec/changes/cdn-sprites-static-build/design.md`). Tarot art is a different scale — 78 static, rarely-changing images, ~2.8MB after optimization — so that rationale does not transfer, and this change hosts them differently (see Decisions).

Arcana identity is already on every content record: `arcana.kind`, `arcana.name`, `arcana.majorNumber` (0–21, defined by the `MAJOR_ARCANA` array order), `arcana.suit`, and `arcana.rankIndex` (0–13). Rich per-card meanings already live, typed, in `src/lib/arcana/tarot-metadata.ts` (`MAJOR_ARCANA_METADATA` keyed by name, `MINOR_ARCANA_METADATA` keyed by suit + rank name from `RANKS`).

## Goals / Non-Goals

**Goals:**
- Give the arcana-front reveal a real image so the two-tap flow reads as pacing, not a bug.
- Serve the art with the least machinery that fits its scale: committed local assets, derivable paths, `onerror` fallback.
- Keep `spread-reveal.ts` component logic, animation timings, chrome layout, and the Pokémon-front markup untouched.
- Turn `card/[slug]` and `deck/[slug]` into real reference pages using the metadata already typed in the repo.
- Build stays network-free.

**Non-Goals:**
- Collapsing the two-tap flow into one tap.
- Changing `pokemonFrontHtml`, the sprite pipeline, or content-schema fields (beyond passing `rankIndex` through the reveal payload).
- Custom Pokémon-themed arcana illustrations (generic RWS chosen for scope).
- Responsive `srcset` / multiple resolutions per image (a single optimized WebP is served). WebP conversion + downscaling itself is in scope (see Decisions).
- Extending the Pokémon dataset with individual stats/abilities (needs a sync change + regen).
- Adopting the richer external-JSON metadata fields (fortune_telling, light/shadow, archetype, …). The typed `tarot-metadata.ts` stays the single source of truth.

## Decisions

### Decision: Commit the 78 images to `public/tarot/`, not Vercel Blob

Serve the art as same-origin static files under `public/tarot/`, committed to git, exactly like `favicon.svg` and `sprite-fallback.svg`.

- **Why**: The Blob decision existed to solve a 53MB / 772-file / per-deploy-fetch problem that 78 static JPGs (~3.6MB) simply don't have. Committing them is simpler, works offline in dev with zero config, needs no env var or Blob token, and lands the assets atomically with the code (no "deploy then upload" drift). It reuses the repo's existing convention for small static assets.
- **Trade-off**: ~3.6MB enters git history permanently, and re-touching images would grow history. Accepted because tarot art is static and rarely churns.
- **Alternatives**: (a) Vercel Blob like sprites — rejected, over-engineered for this scale, adds an env var and a runtime CDN dependency; (b) a slim manifest JSON in `public/` — rejected, still ships an asset read by nothing at runtime.

### Decision: Derivable local path scheme — `m{NN}.webp` (majors) and `{suit-letter}{NN}.webp` (minors)

`tarotArtUrl` returns `/tarot/m{majorNumber:02}.webp` for majors and `/tarot/{c|s|w|p}{rankIndex+1:02}.webp` for minors (`c`=cups, `s`=swords, `w`=wands, `p`=pentacles).

- **Why**: The scheme is fully derivable from data already on the record — no lookup table, no per-record URL, no JSON. `majorNumber` is defined by the `MAJOR_ARCANA` array index, so filenames stay in lockstep with what the runtime requests. `SUIT_LETTER` in `sprites.ts` and the suit order in the download script are the single point that must agree.
- **Alternatives**: (a) `tarot/major/{slug}.jpg` + `tarot/minor/{suit}/{rank}.jpg` (the earlier Blob design) — more human-readable but needs slug/rank-name derivation and doesn't match the source dataset's own `mNN`/`cNN` convention; (b) a numeric 1–78 map — needs a second identifier. Rejected.

### Decision: `tarotArtUrl(arcana)` in `src/lib/sprites.ts`

Add alongside `spriteUrl`. Accepts `{ kind: 'major', majorNumber } | { kind: 'minor', suit, rankIndex }` and returns the local path. No base constant, no env.

- **Why**: Colocates all image-URL derivation in one module. The signature takes the minimal identity the callers already hold (`spread-reveal.ts` payload, and the detail pages' `arcana`). Majors key on `majorNumber` because that's what the filename encodes.

### Decision: Optimized WebP, reuse `SPRITE_FALLBACK`, swap vignette inner content only

- **WebP** for all 78 — filled rectangular region, no alpha needed. Each source scan is downscaled to ≤560px wide (the art never renders above ~340 CSS px; ~156px in the reveal) and re-encoded at quality 75 in the download script, since `public/` files are served as-is and can't go through `astro:assets`. This is where the size win comes from — the source JPGs are already small, so format conversion alone is a near no-op; downscale + q75 cuts the set from ~3.6MB to ~2.8MB (−22%). `srcset` was not worth it: the art loads at most ~10 images on a 10-card reading and one on a detail page, never in bulk.
- **Fallback**: wire the existing `/sprite-fallback.svg` on the `<img onerror>`; one placeholder, honest generic "image unavailable" mark. A tarot-specific placeholder is a trivial follow-up if wanted.
- **Vignette markup**: replace the three vignette children with a single `<img class="arcana-card__art" … loading="lazy" onerror="…">`; the `.arcana-card__vignette` frame and all sibling chrome are untouched. `.arcana-card__art` (absolute-inset, `object-fit: cover`) lives in `global.css` next to the other `arcana-card` styles. `object-fit: cover` crops the full RWS scan to fill the vignette — the card's own banner already shows the name, so cropping the scan's title band is acceptable.

### Decision: Repo-run download script, images committed — no upload step

`scripts/download-tarot-images.ts` fetches the 78 scans once from `github.com/krates98/tarotcardapi`, downscales + re-encodes each to WebP with `sharp`, and writes them to `public/tarot/` under the derivable names. It derives its `name → source-file` and `name → target-file` maps from `MAJOR_ARCANA` + `RANKS` (no external JSON), with two source-name overrides (`TheLovers.jpg`, `thestrength.jpeg`) because that repo's naming is irregular. Existing files are skipped, so re-runs are cheap.

- **Why**: Documents provenance and makes a refresh reproducible, while the committed images mean the build and production never fetch anything. The source repo's descriptive filenames are normalized to this project's `mNN`/`{suit}NN` scheme on save so the runtime needs no rename table.
- **Note**: `public/tarot-images.json` (a 139KB metadata blob that shipped in `public/` but was read by nothing at runtime) was deleted; the script no longer depends on it.

### Decision: Detail pages read the typed metadata via a shared `arcanaMetadata()` lookup

Add `arcanaMetadata(arcana)` to `tarot-metadata.ts` (majors by name; minors by suit + `RANKS[rankIndex]`) and export `slugForArcana` from `arcana/index.ts` for the deck→card link.

- **Why TS over a JSON data file**: the metadata is hand-authored, static, and consumed by 4+ modules. TypeScript gives compile-time key/field checking (`astro check`), tree-shaking, no runtime fetch/parse, and refactor safety. JSON only wins for generated/synced data (like `pokemon.json`) or non-developer editing — neither applies. This is also why the 139KB `public/` JSON was removed rather than adopted.
- **`card/[slug]`**: adds the RWS art (large, in the left column under the Pokémon card), keyword chips, the per-card `description` as the primary meaning, an upright/reversed block, and an element/astrology/numerology attributes row (majors only — minors lack those fields).
- **`deck/[slug]`**: adds a Legendary/Mythical badge (from existing `isLegendary`/`isMythical`, thematically tied to the Major Arcana), turns the arcana box into a cross-link to `/card/{slug}`, and surfaces the arcana's keywords + upright meaning. The generic one-line meaning is used only as a fallback when metadata is somehow absent, to avoid redundancy with the upright meaning.

### Decision: `loading="lazy"`, no hover preload

The `<img>` is inserted at flip time, so lazy-loading starts the same-origin fetch immediately and overlaps the ~800ms `FLIP_MS` window. A hover-preload adds complexity for little gain on same-origin assets. Revisit only if a visible pop is measured.

## Risks / Trade-offs

- **Git-history weight from committed images** → ~3.6MB now; grows if art is re-touched. Mitigated by the art being static; acceptable at this scale (`.git` was ~1.4M before).
- **`object-fit: cover` crops full RWS scans** → the scan's own title band may be cropped. Acceptable: the card banner already names the arcana, and the illustration is what matters in the vignette. `object-position` can be tuned later if a specific card crops badly.
- **Source-repo naming drift** → `krates98/tarotcardapi` uses irregular names (case, extension, extra "the"); handled by explicit overrides in the download script. If that repo moves/renames, the script fails loudly per-file (non-zero exit), not silently.
- **Licensing** → RWS art is US public domain (1909). Source provenance recorded in the script + commit; no restoration-copyright claim assumed.
- **Alt text quality** → arcana name (e.g. `"The Fool"`) as `alt` is minimal but truthful.

## Migration Plan

1. Add `tarotArtUrl` + `SUIT_LETTER` to `src/lib/sprites.ts` (drop the Blob `TAROT_BASE`/`PUBLIC_TAROT_BASE` path).
2. Update `emblemFrontHtml` to render the `<img class="arcana-card__art">`; thread `rankIndex` through `SpreadArcana` and the `SpreadReveal.astro` payload; add `.arcana-card__art` CSS.
3. Add `scripts/download-tarot-images.ts`; run it once to populate `public/tarot/` (78 files); commit the images. Delete `public/tarot-images.json`.
4. Add `arcanaMetadata()` to `tarot-metadata.ts`; export `slugForArcana` from `arcana/index.ts`.
5. Wire `card/[slug]` and `deck/[slug]` to the metadata + art.
6. Verify: `bun typecheck` clean; `astro build` prerenders every `card/[slug]` and `deck/[slug]` offline; drawn cards show the correct RWS art with the placeholder fallback intact.

**Rollback**: revert the commit. The vignette returns to CSS-only rendering and the detail pages to the generic meaning; no data migration needed (content JSON is unchanged).

## Open Questions

- None outstanding. Hosting (local `public/`), path scheme, format, fallback, source repo, and detail-page scope are all resolved above.
