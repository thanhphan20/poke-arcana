## Why

The deck currently renders one tile per Pokémon (386 for Gen 1-3), so the site shows hundreds of near-duplicate tiles rather than a coherent tarot deck — dozens of Pokémon share a single card identity (e.g. ~12 are all "Ace of Pentacles"). A tarot deck is 78 cards; the app should present exactly that. The 56 Minor cards become groups of Pokémon, and the 22 Major cards each become a single legendary/mythical.

## What Changes

- The deck index renders **78 tarot cards** (22 Major + 56 Minor) instead of one tile per Pokémon.
- Each Minor card is backed by a **group** of Pokémon (its members); each Major card is backed by a **single** legendary/mythical.
- **BREAKING** (data/algorithm): Major Arcana assignment changes from dex-order `rank % 22` to a **curated thematic 1:1 map** of legendary → Major card.
- Gen 1-3 has only 21 legendaries/mythicals for 22 Major slots, so **Dragonite (#149)** is promoted as the 22nd "special" Pokémon to fill the deck.
- New **`/card/{slug}`** page per card: tarot art + metadata, plus the member Pokémon (group for Minors, single legendary for Majors), each linking to its existing per-Pokémon page.
- Deck grid tiles show **pure tarot art** (suit symbol / rank / Major name) — no Pokémon sprite on the face; sprites appear only on drill-in.
- Per-Pokémon `/deck/{slug}` pages are **kept** (additive change), linked from card detail.
- Fix stale "151 / Gen 1" copy on the deck index (data is actually Gen 1-3 / 386).

## Capabilities

### New Capabilities
- `card-deck`: The 78-card tarot deck presentation — grouping Pokémon under cards, the deck grid of art-only card faces, and the per-card `/card/{slug}` detail page listing member Pokémon.
- `major-arcana-curation`: Curated thematic assignment of each legendary/mythical to a specific Major Arcana card, plus pseudo-legendary promotion (Dragonite) to fill the 22-card set 1:1.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/. -->

## Impact

- **Algorithm/data**: `src/lib/arcana/index.ts` (`assignArcana` Major pass), `src/lib/arcana/majorArcana.ts` (curated map + pseudo-legendary), `scripts/sync-pokedex.ts` (emit 78-card grouping / companion data). Minor suit + BST-percentile logic (`suits.ts`, `ranks.ts`) unchanged.
- **Rendering**: new `src/pages/card/[slug].astro`; reworked `src/pages/deck/index.astro` + `src/components/DeckGrid.astro`; `src/components/TarotCard.astro` gains a sprite-less face variant. `src/pages/deck/[slug].astro` unchanged.
- **Out of scope**: the reading/spread experience (`HomeDraw`, `spread/*`) keeps drawing individual Pokémon; a follow-up change will align it to the 78-card model.
