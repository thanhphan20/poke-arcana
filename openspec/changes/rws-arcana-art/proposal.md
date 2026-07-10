## Why

After drawing a card from the fan, users see a CSS-built emblem front — paper texture, flourish corners, arcana name, and a single glyph in the center vignette — before tapping again to flip to the Pokémon. That intermediate arcana card reads as "empty" or "just a name," so the intentional two-phase pacing (arcana → Pokémon) feels like a broken step rather than dramatic reveal. Adding real Rider-Waite-Smith art in that vignette gives the arcana state a reason to exist visually. The same art and the existing typed tarot metadata also let the `card/[slug]` and `deck/[slug]` detail pages become genuine reference pages instead of showing only a one-line generic meaning.

## What Changes

- Replace ONLY the central `.arcana-card__vignette` contents in `emblemFrontHtml` (`.arcana-card__rays` + `.arcana-card__horizon` + `.arcana-card__glyph`) with a real public-domain Rider-Waite-Smith `<img>` for that arcana. All surrounding card chrome (paper, flourish corners, kicker, banner with arcana name, footer, suit `--accent`/`--wash` theme) stays exactly as-is.
- Add a `tarotArtUrl(arcana)` helper alongside `spriteUrl` that derives a **local** `/tarot/…` path from arcana identity — `m{majorNumber}.jpg` for majors, `{suit-letter}{rankIndex+1}.jpg` for minors (c/s/w/p). No env var, no CDN base, no full URLs in content JSON.
- Commit the 78 Rider-Waite-Smith images (22 major + 56 minor) to `public/tarot/`, fetched once by a repo-run script `scripts/download-tarot-images.ts` from `github.com/krates98/tarotcardapi` and saved under the derivable `mNN.jpg` / `{suit}{NN}.jpg` scheme.
- Wire the shared `SPRITE_FALLBACK` `onerror` behavior on the new `<img>` so a missing scan degrades to a placeholder instead of a broken card face.
- Surface the existing typed metadata (`src/lib/arcana/tarot-metadata.ts`) on the detail pages via a new shared `arcanaMetadata(arcana)` lookup: `card/[slug]` gains the RWS art, description, upright/reversed meanings, keyword chips, and (majors) element/astrology/numerology; `deck/[slug]` gains a Legendary/Mythical badge, a cross-link to its tarot card, and the arcana's keywords + upright meaning.
- Two-tap flow, `pokemonFrontHtml`, `spread-reveal.ts` component logic, animation timings, colors, fonts, and layout are unchanged.

Non-goals: collapsing the two-tap flow, changing the Pokémon-front card, commissioning custom Pokémon-arcana art, image optimization (WebP/srcset), extending the Pokémon dataset (individual stats/abilities), and adopting the richer JSON metadata fields (fortune_telling, light/shadow, etc.) — the typed `tarot-metadata.ts` stays the single source of truth.

## Capabilities

### New Capabilities
- `tarot-art-assets`: Local hosting and deterministic URL derivation for the 78 Rider-Waite-Smith card images. Covers the `tarotArtUrl` helper's derivation rules, the `public/tarot/` commit convention, the download script that populates it, and the shared-placeholder fallback.
- `arcana-reveal-visual`: The visual contract for the arcana-front state of a drawn card — the central vignette displays a real Rider-Waite-Smith image for that arcana, surrounding chrome is preserved, and a missing image degrades to the placeholder. Scoped to what the reveal UI must render; interaction (two-tap flow, animations) preserved.
- `arcana-detail-content`: The content contract for the two detail pages — `card/[slug]` shows the RWS art plus the full per-card metadata, and `deck/[slug]` shows a rarity badge, a cross-link to its tarot card, and the arcana tie-in, all sourced from the typed `tarot-metadata.ts` via a shared lookup.

### Modified Capabilities

None — no existing spec capabilities.

## Impact

- **Code**: `src/components/spread/spread-reveal.ts` (`emblemFrontHtml` vignette markup + `SpreadArcana.rankIndex`), `src/components/spread/SpreadReveal.astro` (payload gains `rankIndex`), `src/lib/sprites.ts` (`tarotArtUrl` + `SUIT_LETTER`), `src/lib/arcana/tarot-metadata.ts` (shared `arcanaMetadata` helper), `src/lib/arcana/index.ts` (export `slugForArcana`), `src/pages/card/[slug].astro` and `src/pages/deck/[slug].astro`, `src/styles/global.css` (`.arcana-card__art`).
- **New files**: `scripts/download-tarot-images.ts` (repo-run image fetch).
- **Assets**: 78 JPGs (~3.6MB) committed to `public/tarot/`, served same-origin like `favicon.svg`. `public/tarot-images.json` was evaluated and deleted — 139KB shipped to visitors but read by nothing at runtime.
- **Env / secrets**: none. No `PUBLIC_TAROT_BASE`, no Blob token. (Contrast with the sprite pipeline, which stays on Vercel Blob.)
- **Build**: still network-free. The download script is manual, run once per art refresh, and is not part of `astro build`.
- **Runtime**: one additional same-origin HTTP request per revealed card (arcana image), with `onerror` fallback.
- **Licensing**: Rider-Waite-Smith art is public domain in the US (published 1909). Source scans come from `krates98/tarotcardapi`; provenance is recorded in the download script and commit message.
