## Context

`assignArcana()` ([src/lib/arcana/index.ts](../../../src/lib/arcana/index.ts)) already produces a many-to-one mapping: each Pokémon gets a tarot identity, and the Minor pass naturally groups Pokémon by suit (type vote) and rank (BST percentile). So the 56-card grouping is essentially already computed — it is just never *rendered* as 56 cards. The Major pass currently uses dex-order `rank % 22`, which is arbitrary and, with 21 legendaries in Gen 1-3, leaves one Major card empty.

The site renders one static page per Pokémon (`/deck/{slug}`) and a deck index listing all 386. There is no per-card view. Data is generated at build time by `scripts/sync-pokedex.ts` into a committed JSON read via Astro's `file()` content loader; the build never hits the network.

## Goals / Non-Goals

**Goals:**
- Present the deck as exactly 78 cards; Minor = groups, Major = single legendary.
- Replace arbitrary Major assignment with a curated thematic 1:1 map, filling all 22 slots (Dragonite promoted as the 22nd).
- Add `/card/{slug}` detail pages; keep per-Pokémon pages.
- Keep the data pipeline build-time and deterministic.

**Non-Goals:**
- Changing the Minor suit/rank algorithm (`suits.ts`, `ranks.ts` unchanged).
- Updating the reading/spread experience (`HomeDraw`, `spread/*`) — follow-up.
- Runtime data fetching or SSR.

## Decisions

**1. Derive the 78-card grouping rather than change the assignment core.**
Minor grouping already falls out of `assignArcana()`. Add a pure helper `groupIntoCards(cards: PokemonCard[]): CardGroup[]` that folds the per-Pokémon results into 78 `{ arcana, slug, members }` records, members ordered BST-desc then id-asc. *Alternative considered:* rewrite `assignArcana` to return cards directly — rejected; it would churn the tested per-Pokémon path and the existing content collection.

**2. Emit a companion `cards.json` alongside `pokemon.json`.**
`sync-pokedex.ts` writes `src/data/generated/cards.json` (78 entries) in addition to `pokemon.json`. A new Astro content collection `tarotCards` loads it. *Alternative:* compute the grouping inside each Astro page at build — rejected; duplicated logic across deck index and `/card/[slug]`, and harder to assert "exactly 78" in one place.

**3. Curated Major map lives in `majorArcana.ts` as data.**
Add `MAJOR_ARCANA_ASSIGNMENT: Record<MajorCardName, { name: string /* pokémon */ }>` (or Pokédex id) and `PSEUDO_LEGENDARY_IDS = [149]`. `assignArcana` Major pass: eligible set = legendaries/mythicals ∪ promoted pseudo-legendaries; each is placed on the card named in the curated map. This is a deliberate, documented exception to the "fully algorithmic" domain rule. *Alternative:* keep `rank % 22` with a hand-tuned override table — rejected; a full curated map is clearer for only 22 entries and avoids collision math.

**4. Fail loudly on unmapped legendaries.**
If the dataset contains an eligible Pokémon absent from the curated map, or a mapped Major card has no matching Pokémon, `sync-pokedex.ts` throws before writing (consistent with its existing "NOT overwritten" failure behavior).

**5. Sprite-less card face.**
Add a `face`/`sprite`-optional mode to `TarotCard.astro` so the deck grid and `/card/{slug}` header render art only. Sprites render in the member grid on the detail page.

## Risks / Trade-offs

- **Curated map drifts as the range widens** → the fail-loud check (Decision 4) forces the map to be updated deliberately; documented in the spec.
- **Empty Minor cards** if a suit is too small to fill all 14 ranks → the `/card/{slug}` page and grid must handle zero-member cards gracefully (show art, "no members yet"). Verify actual counts after sync.
- **Two generated files can desync** → both are written in one `sync-pokedex.ts` run from the same in-memory result; never edited by hand.
- **Breaking change to Major assignment** → per-Pokémon `arcana` values for legendaries change; acceptable since data is regenerated at build and not depended on externally.

## Migration Plan

1. Land algorithm + generator changes; run `bun run scripts/sync-pokedex.ts` to regenerate `pokemon.json` + `cards.json`.
2. Add the `tarotCards` collection and pages; rework deck index.
3. Verify counts (22 Major all filled incl. Dragonite; 56 Minor) and curated spot-checks.
Rollback: revert the change; generated files are rebuilt from the reverted code.

## Open Questions

- Exact 22-entry curated mapping (which legendary → which card) — to be authored in `majorArcana.ts` during implementation; iconic anchors agreed (Mewtwo, Mew, box legendaries, Rayquaza→The World).
