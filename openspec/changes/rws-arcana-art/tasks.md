## 1. URL helper and constants

- [x] 1.1 Add `TAROT_BASE` constant in `src/lib/sprites.ts`, sourced from `import.meta.env.PUBLIC_TAROT_BASE`.
- [x] 1.2 Add kebab-case slug helper for major arcana names (`"The Fool"` → `the-fool`) in `src/lib/sprites.ts` (small local function; not exported unless another caller needs it).
- [x] 1.3 Export `tarotArtUrl(arcana)` from `src/lib/sprites.ts` accepting `{ kind: 'major', name } | { kind: 'minor', suit, rankIndex }`, returning `${TAROT_BASE}/tarot/major/{slug}.jpg` for majors and `${TAROT_BASE}/tarot/minor/{suit}/{rank}.jpg` for minors (rank resolved from `RANK_NAMES` lowercased).
- [x] 1.4 Add `PUBLIC_TAROT_BASE` to `.env.example` (or repo docs equivalent) with a comment explaining it points to the Blob store's public base URL.

## 2. Arcana-front vignette markup

- [x] 2.1 In `src/components/spread/spread-reveal.ts`, import `tarotArtUrl` (and reuse existing `SPRITE_FALLBACK`).
- [x] 2.2 Replace the three children of `.arcana-card__vignette` inside `emblemFrontHtml` (`.arcana-card__rays`, `.arcana-card__horizon`, `.arcana-card__glyph`) with a single `<img class="arcana-card__art" src="${tarotArtUrl(...)}" alt="${arcanaName}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">`.
- [x] 2.3 Confirm `pokemonFrontHtml`, `cardBackHtml`, chrome (paper/flourishes/kicker/banner/footer), the flip timing (`FLIP_MS`), and the two-tap flow are all untouched.
- [x] 2.4 Add `.arcana-card__art { width: 100%; height: 100%; object-fit: cover; display: block; }` (or equivalent) to the arcana-card styles — locate the existing `arcana-card` CSS block and add there.

## 3. Maintainer asset upload (manual, out-of-band)

- [ ] 3.1 Source a public-domain Rider-Waite-Smith scan set (verify licensing — 1909 US public domain, but confirm scan provenance has no restoration-copyright claim). Document the source in the commit message.
- [ ] 3.2 Prepare 78 JPG files locally, named to match the target Blob pathnames: `major/{slug}.jpg` for the 22 majors (slug from `MAJOR_ARCANA_METADATA` keys, kebab-cased) and `minor/{suit}/{rank}.jpg` for the 56 minors (suit ∈ cups/wands/swords/pentacles; rank ∈ ace/two/…/king).
- [ ] 3.3 Upload the 78 files to the Vercel Blob store manually via the Vercel dashboard under a `tarot/` prefix, preserving the directory layout so pathnames come out as `tarot/major/{slug}.jpg` and `tarot/minor/{suit}/{rank}.jpg`. Ensure each blob's public URL matches `${PUBLIC_TAROT_BASE}/tarot/…`.
- [ ] 3.4 Set `PUBLIC_TAROT_BASE` in local `.env` and in Vercel project env vars (Preview + Production).

## 4. Verification

- [ ] 4.1 `bun run dev`: draw a 1-card, 3-card, and 10-card spread; verify each drawn card's arcana-front shows the correct RWS image inside the existing vignette frame, with chrome (paper/flourishes/banner name/footer) unchanged.
- [ ] 4.2 Second-tap still flips to the Pokémon front unchanged.
- [ ] 4.3 Temporarily point `PUBLIC_TAROT_BASE` at an invalid URL and confirm the arcana vignette falls back to `SPRITE_FALLBACK` while the surrounding chrome and banner name remain intact.
- [ ] 4.4 `bun run build` completes offline (no network) and produces a working static site.
- [x] 4.5 `bun typecheck` / lint (whatever the project's normal checks are) pass.
