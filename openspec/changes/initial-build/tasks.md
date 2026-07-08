## 1. Project Scaffold

- [ ] 1.1 Scaffold Astro project with `bunx create-astro@latest` (minimal template), confirm `bun.lock` is produced and `bun run dev` boots
- [ ] 1.2 Wire Tailwind v4 via `@tailwindcss/vite` in `astro.config.mjs`, add `src/styles/global.css` with `@import "tailwindcss";` and a dark/mystical `@theme` block, import it in `BaseLayout.astro`
- [ ] 1.3 Add `.env.example` with `DEX_START`, `DEX_END`, `POKEAPI_BASE_URL`
- [ ] 1.4 Add `.gitignore` covering `node_modules/`, `dist/`, `.cache/`, `.env`

## 2. Arcana Assignment Module

- [ ] 2.1 Create `src/lib/arcana/types.ts` with `TypeName`, `Suit`, `ArcanaResult`, `PokemonRaw`, and the Zod schema used by the content collection
- [ ] 2.2 Create `src/lib/arcana/majorArcana.ts` with the 22 canonical Major Arcana names and `stableHash(id)`
- [ ] 2.3 Create `src/lib/arcana/suits.ts` with the full 18-type `TYPE_SUIT_TABLE` and `resolveSuit(types[])` weighted vote
- [ ] 2.4 Create `src/lib/arcana/ranks.ts` with the 14 rank names and percentile bucketing
- [ ] 2.5 Create `src/lib/arcana/index.ts` with `assignArcana(allPokemon)` run once over the full population

## 3. PokeAPI Data Pipeline

- [ ] 3.1 Create `scripts/sync-pokedex.ts`: read `DEX_START`/`DEX_END`/`POKEAPI_BASE_URL` from env, fetch `/pokemon/{id}` + `/pokemon-species/{id}` with a small concurrency pool and retry/backoff
- [ ] 3.2 Normalize fetched data into `PokemonRaw` records (id, name, slug, types, stats/BST, legendary/mythical flags, sprite, flavor text, genus)
- [ ] 3.3 Run `assignArcana()` over the full fetched set and merge results onto each record
- [ ] 3.4 Write `src/data/generated/pokemon.json` (sorted by id) and `src/data/generated/meta.json` (generatedAt, dexStart, dexEnd, count, source)
- [ ] 3.5 Fail loudly (non-zero exit, no partial overwrite) on any 404/fetch failure within the configured range
- [ ] 3.6 Add optional gitignored raw-response cache under `.cache/pokeapi/` for dev iteration
- [ ] 3.7 Add `bun run sync` script in `package.json`; run it for Gen 1 (1-151) and commit the generated JSON

## 4. Content Collection

- [ ] 4.1 Create `src/content.config.ts` defining the `pokemonCards` collection via the `file()` loader over `src/data/generated/pokemon.json`, validated by the schema from 2.1

## 5. Deck Browser Pages

- [ ] 5.1 Build `TarotCard.astro` and `CardBack.astro` components
- [ ] 5.2 Build `DeckGrid.astro` with suit/Major Arcana filter chips
- [ ] 5.3 Build `src/pages/deck/index.astro` using `getCollection('pokemonCards')`
- [ ] 5.4 Build `src/pages/deck/[slug].astro` with `getStaticPaths`, showing Major Arcana name (legendary/mythical) or suit+rank (minor), artwork, types, flavor text, genus

## 6. Card Reading Page

- [ ] 6.1 Build `src/components/spread/spread-reveal.ts` Web Component: Fisher–Yates shuffle, face-down→face-up flip via `rotateY` CSS transform, staggered reveal
- [ ] 6.2 Build `SpreadReveal.astro` inlining the minimal per-card JSON payload (id, slug, name, arcanaName, suit|majorNumber, thumbSprite)
- [ ] 6.3 Build `SpreadControls.astro` (Draw 1 / Draw 3 / Draw 10 buttons)
- [ ] 6.4 Build `src/pages/reading.astro` composing controls + reveal component

## 7. Landing Page & Layout

- [ ] 7.1 Build `BaseLayout.astro` (nav to `/deck` and `/reading`, dark/mystical theme)
- [ ] 7.2 Build `src/pages/index.astro` landing/hero page

## 8. Deployment

- [ ] 8.1 Confirm `astro.config.mjs` uses default static `output` with no Vercel adapter
- [ ] 8.2 Push to a branch, verify Vercel preview build uses `bun install`/`bun run build` and renders `/deck` and `/reading` correctly

## 9. Verification

- [ ] 9.1 `bun run sync` produces exactly 151 records; spot-check Mewtwo (#150, major) and Charizard (#6, dual-type suit resolution)
- [ ] 9.2 `bun run dev`: visually verify `/`, `/deck`, two `/deck/[slug]` pages (one major, one minor), `/reading`
- [ ] 9.3 Browser check: draw a 3-card spread, confirm shuffle + flip animation, confirm redraw produces a different result
- [ ] 9.4 `bun run build` completes with zero network calls; `bun run preview` serves the built output correctly
