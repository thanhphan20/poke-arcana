## 1. URL helper

- [x] 1.1 Add `SUIT_LETTER` map + `tarotArtUrl(arcana)` to `src/lib/sprites.ts`, accepting `{ kind: 'major', majorNumber } | { kind: 'minor', suit, rankIndex }` and returning local `/tarot/m{NN}.jpg` (majors) / `/tarot/{suit-letter}{NN}.jpg` (minors). No Blob base, no env var.
- [x] 1.2 Remove the earlier `TAROT_BASE` / `PUBLIC_TAROT_BASE` plumbing from `src/lib/sprites.ts` and `.env.example`.

## 2. Arcana-front vignette markup

- [x] 2.1 In `src/components/spread/spread-reveal.ts`, import `tarotArtUrl` (reuse existing `SPRITE_FALLBACK`).
- [x] 2.2 Replace the three children of `.arcana-card__vignette` in `emblemFrontHtml` with `<img class="arcana-card__art" src="${tarotArtUrl(...)}" alt="${arcanaName}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">`.
- [x] 2.3 Thread `rankIndex` through `SpreadArcana` (spread-reveal.ts) and the JSON payload in `SpreadReveal.astro` so minors resolve to the right file.
- [x] 2.4 Add `.arcana-card__art` (absolute-inset, `object-fit: cover`) to the `arcana-card` styles in `src/styles/global.css`.
- [x] 2.5 Confirm `pokemonFrontHtml`, `cardBackHtml`, chrome, `FLIP_MS`, and the two-tap flow are untouched.

## 3. Image assets

- [x] 3.1 Add `scripts/download-tarot-images.ts` deriving `name → source` (from `krates98/tarotcardapi`, with the `TheLovers.jpg` / `thestrength.jpeg` overrides) and `name → target` (`mNN.jpg` / `{suit}NN.jpg`) from `MAJOR_ARCANA` + `RANKS`; skip existing files; fail loudly on a failed fetch.
- [x] 3.2 Register `download-tarot-images` in `package.json` scripts.
- [x] 3.3 Run the script; commit the 78 JPGs (~3.6MB) under `public/tarot/`.
- [x] 3.4 Delete `public/tarot-images.json` (139KB, shipped but unused at runtime).

## 4. Detail-page wiring

- [x] 4.1 Add `arcanaMetadata(arcana)` to `src/lib/arcana/tarot-metadata.ts` (majors by name; minors by suit + `RANKS[rankIndex]`).
- [x] 4.2 Export `slugForArcana` from `src/lib/arcana/index.ts`.
- [x] 4.3 `card/[slug]`: show RWS art + keyword chips + description + upright/reversed + element/astrology/numerology (majors only).
- [x] 4.4 `deck/[slug]`: Legendary/Mythical badge + cross-link to `/card/{slug}` + arcana keywords & upright meaning.

## 5. Verification

- [x] 5.1 `bun typecheck` passes (0 errors / 0 warnings).
- [x] 5.2 `astro build` prerenders every `card/[slug]` and `deck/[slug]` offline with no errors.
- [x] 5.3 Built HTML confirmed: major card page has `/tarot/mNN.jpg` + keywords + upright/reversed + attributes; minor card page has art + meanings and NO attributes row; a legendary's deck page has the badge + `/card/…` link + arcana keywords.
- [x] 5.4 Reveal flow functionally verified: arcana `<img>` gets the derived `/tarot/…` src, and an unreachable image falls back to `SPRITE_FALLBACK` with chrome intact.

## 6. Follow-ups (out of scope here)

- [ ] 6.1 Optional: tune `object-position` if any specific full-scan crops badly in the vignette.
- [ ] 6.2 Optional: a tarot-specific placeholder instead of reusing `SPRITE_FALLBACK`.
