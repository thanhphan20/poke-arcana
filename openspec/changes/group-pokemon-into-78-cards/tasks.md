## 1. Major Arcana curation

- [x] 1.1 Add `MAJOR_ARCANA_ASSIGNMENT` (curated 22-entry legendary → Major card map) and `PSEUDO_LEGENDARY_IDS = [149]` to `src/lib/arcana/majorArcana.ts`; author the 22 thematic mappings (anchors: Mewtwo, Mew, box legendaries, Rayquaza→The World, Dragonite).
- [x] 1.2 Update the Major pass in `assignArcana()` (`src/lib/arcana/index.ts`) to build the eligible set (legendaries/mythicals ∪ promoted pseudo-legendaries) and assign via the curated map instead of `majorArcanaForRank`.
- [x] 1.3 Ensure promoted pseudo-legendaries are excluded from the Minor suit/rank pass.
- [x] 1.4 Throw a clear error when an eligible Pokémon is absent from the curated map, or when a mapped Major card has no matching Pokémon in the dataset.

## 2. 78-card grouping data

- [x] 2.1 Add a `TarotCard` group type (`{ arcana, slug, members }`) to `src/lib/arcana/types.ts` and a pure `groupIntoCards(cards)` helper (members ordered BST desc, id asc; 22 Major single-member + 56 Minor groups).
- [x] 2.2 In `scripts/sync-pokedex.ts`, write `src/data/generated/cards.json` (78 entries) alongside `pokemon.json` from the same in-memory result; assert exactly 22 Major (all populated) + 56 Minor before writing.
- [x] 2.3 Add a `tarotCards` content collection in `src/content.config.ts` loading `cards.json`.

## 3. Rendering

- [x] 3.1 Add a sprite-less "face" mode to `src/components/TarotCard.astro` (art only: suit symbol / rank / Major name).
- [x] 3.2 Rework `src/pages/deck/index.astro` + `src/components/DeckGrid.astro` to render the 78 cards (art faces) linking to `/card/{slug}`; keep Major/suit filter pills.
- [x] 3.3 Create `src/pages/card/[slug].astro` with `getStaticPaths` over the 78 cards: tarot art + metadata + member grid, each member linking to `/deck/{slug}`; handle zero-member cards gracefully.
- [x] 3.4 Fix the stale "151 / Gen 1" copy on the deck index (data is Gen 1-3 / 386).
- [x] 3.5 Leave `src/pages/deck/[slug].astro` per-Pokémon pages unchanged; confirm they still resolve.

## 4. Verify

- [x] 4.1 Run `bun run scripts/sync-pokedex.ts`; confirm `cards.json` has 78 entries — 22 Major all populated (Dragonite present), 56 Minor.
- [x] 4.2 Run `bun run build`; confirm success. Preview: deck shows 78 art cards; a Minor card drills into its member group; a Major shows its single legendary; per-Pokémon pages resolve.
- [x] 4.3 Spot-check curated Major mapping (Mewtwo, Mew, box legendaries land on intended cards).
- [x] 4.4 Run `openspec validate group-pokemon-into-78-cards --strict`.
