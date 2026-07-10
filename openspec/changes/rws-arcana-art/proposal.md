## Why

After drawing a card from the fan, users see a CSS-built emblem front — paper texture, flourish corners, arcana name, and a single glyph in the center vignette — before tapping again to flip to the Pokémon. That intermediate arcana card reads as "empty" or "just a name," so the intentional two-phase pacing (arcana → Pokémon) feels like a broken step rather than dramatic reveal. Adding real Rider-Waite-Smith art in that vignette gives the arcana state a reason to exist visually.

## What Changes

- Replace ONLY the central `.arcana-card__vignette` contents in `emblemFrontHtml` (currently `.arcana-card__rays` + `.arcana-card__horizon` + `.arcana-card__glyph`) with a real public-domain Rider-Waite-Smith scan for that arcana. All surrounding card chrome (paper, flourish corners, kicker, banner with arcana name, footer, suit `--accent`/`--wash` theme) stays exactly as-is.
- Introduce a `tarotArtUrl(arcana)` helper alongside `spriteUrl` that derives a Vercel Blob URL from arcana identity (kind + name for majors; suit + rank for minors). No full URLs baked into content JSON.
- Add a maintainer-run upload script that pushes all 78 Rider-Waite-Smith images (22 major + 56 minor) to Vercel Blob at deterministic paths, mirroring the pattern already used for Pokémon sprites.
- Wire the shared `SPRITE_FALLBACK` `onerror` behavior on the new `<img>` so a missing scan degrades to a placeholder instead of a broken card face.
- Two-tap flow, `pokemonFrontHtml`, `spread-reveal.ts` component logic, animation timings, colors, fonts, and layout are unchanged.

Non-goals: collapsing the two-tap flow, changing the Pokémon-front card, commissioning custom Pokémon-arcana art, image optimization beyond what the sprite pipeline already does.

## Capabilities

### New Capabilities
- `tarot-art-assets`: Deterministic URL derivation, Vercel Blob hosting, and maintainer upload flow for the 78 Rider-Waite-Smith card images used in the arcana-reveal state. Covers the URL helper, Blob path scheme, upload script, and fallback behavior — mirroring the existing sprite-hosting capability but for tarot art rather than Pokémon sprites.
- `arcana-reveal-visual`: The visual contract for the arcana-front state of a drawn card — specifically that the central vignette displays a real Rider-Waite-Smith image for that arcana, that surrounding chrome is preserved, and that a missing image degrades to the shared placeholder. Scoped to what the UI must render; interaction (two-tap flow, animations) is not in scope of this capability.

### Modified Capabilities

None — no existing spec capabilities.

## Impact

- **Code**: `src/components/spread/spread-reveal.ts` (`emblemFrontHtml` vignette markup only), `src/lib/sprites.ts` or sibling module (new `tarotArtUrl` helper + tarot Blob base constant), `src/lib/arcana/*` (a small deterministic slug helper for minors if not already available).
- **New file**: a maintainer-run upload script under `scripts/` (naming per convention with `sync-pokedex.ts` and existing sprite upload).
- **Assets**: 78 new blobs in the Vercel Blob store at deterministic paths under a `tarot/…` prefix. No new committed images in `public/` beyond an optional tarot-specific placeholder (open question — may reuse `SPRITE_FALLBACK`).
- **Env / secrets**: uses the existing `BLOB_READ_WRITE_TOKEN` maintainer credential from the sprite upload script; no new secrets. Public Blob base URL added as a constant (public, safe to commit).
- **Build**: still network-free. The upload script is manual, run once per art refresh, and is not part of `astro build`.
- **Runtime**: one additional HTTP request per revealed card (arcana image), served from Vercel Blob's CDN, with `onerror` fallback.
- **Licensing**: Rider-Waite-Smith art is public domain in the US (published 1909). The specific scan set chosen must be verified for licensing before upload; noted as a task, not resolved in this proposal.
