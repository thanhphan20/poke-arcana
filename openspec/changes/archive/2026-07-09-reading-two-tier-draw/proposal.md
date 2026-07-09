## Why

The Reading page draws individual Pokémon cards directly, which skips the tarot layer entirely — a reading is meant to surface an *archetype* first (the arcana), and only then the creature that answers it. Now that Pokémon are grouped into the 78 tarot cards, the reading can mirror a real tarot draw: reveal the arcana, then let the creature emerge.

## What Changes

- **BREAKING**: The Reading spread deals from the **78 tarot cards** (`tarotCards`) instead of the 151 individual Pokémon (`pokemonCards`).
- Empty Minor arcana cards (rank buckets with zero Pokémon) are **excluded** from the draw pool, so every dealt card can produce a Pokémon.
- Each dealt card auto-reveals an **arcana emblem face** — the existing card frame with the Roman numeral (Major) or suit symbol (Minor) in place of a Pokémon sprite.
- **New second-tier draw**: tapping a revealed arcana card morphs it to reveal **one Pokémon drawn at random from that card's `members`**.
- The revealed Pokémon face becomes a **link to `/card/[pokemon-slug]`**.
- **Removed**: the flip-back-to-face-down toggle and the `/deck/[slug]` link on the arcana front.
- Unchanged: spread sizes (1/3/10), position labels, the no-meaning-text layout, and the Home draw.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `card-reading`: The draw pool becomes the 78 tarot cards (non-empty only) rather than the 151 Pokémon; reveal becomes a two-tier interaction (arcana emblem → tap → random member Pokémon); the revealed Pokémon links to its detail page; the flip-back toggle and arcana-front `/deck` link are removed.

## Impact

- `src/pages/reading.astro` — source collection `pokemonCards` → `tarotCards`, filter to non-empty, payload carries each card's `members` (id/name/slug).
- `src/components/spread/SpreadReveal.astro` — payload shape and styling for the arcana emblem face + revealed Pokémon.
- `src/components/spread/spread-reveal.ts` — draw over tarot cards, arcana emblem front, tap-to-draw second tier, morph animation (respecting `prefers-reduced-motion`), Pokémon-face link.
- No data-pipeline, build, or dependency changes; `cards.json` already carries `members`.
