## Context

The Reading page (`/reading`) uses a vanilla Web Component (`spread-reveal.ts`) that receives all 151 Pokémon from `reading.astro` as a JSON payload, shuffles them, deals N, and flip-reveals each. Each revealed card is an `<a href="/deck/[slug]">` and clicking a revealed card toggles it back to face-down.

The data layer already groups Pokémon into 78 tarot cards (`cards.json`, `tarotCards` collection), where each card carries an ordered `members` array. Major cards have exactly one member; Minor cards have zero or more (rank buckets are BST percentiles within a suit, so some are empty). This change reworks the reading interaction to draw the arcana first, then a Pokémon within it, matching a real tarot draw.

Constraints: static Astro output, no runtime data fetching, no framework island (vanilla custom element only), Gen 1 only.

## Goals / Non-Goals

**Goals:**
- Reading deals arcana cards (78-card deck, non-empty only), then draws a Pokémon per card.
- Reuse the existing card frame and flip machinery; add a second-tier reveal rather than a new component.
- Keep the whole interaction client-side in the existing Web Component; no new dependencies.

**Non-Goals:**
- Changing the Home draw (`HomeDraw`), the deck browser, or the data pipeline.
- Re-rolling a different member, exploring all members, or showing arcana meaning text in the spread.
- Reversed-card meanings or any change to arcana assignment.

## Decisions

### Draw pool = non-empty tarot cards
`reading.astro` switches `getCollection('pokemonCards')` → `getCollection('tarotCards')` and filters to `members.length > 0` before serializing. The payload for each card carries `slug`, `arcana` (kind/name/suit/majorNumber), and a trimmed `members` array (`id`, `name`, `slug`) — enough to render the emblem face and to pick + render a member client-side.
- *Alternative considered:* keep the 151-Pokémon pool and look up the group at draw time. Rejected — the component would need both datasets and a reverse index; dealing arcana directly is simpler and matches the spec.
- *Alternative considered:* include empty cards with a disabled "silent card" state. Rejected in grilling — excluding them guarantees every dealt card can draw a Pokémon and needs no empty-state design.

### Arcana emblem face reuses the card frame
The first-tier face is the existing `arcana-card` frame with the vignette's Pokémon `<img>` replaced by the arcana glyph (Roman numeral for Major via `ROMAN`, suit symbol for Minor). Theme accent/wash come from the existing `MAJOR_CARD_THEME` / `SUIT_CARD_THEME` maps keyed by the card's arcana.
- *Alternative considered:* a plain card-back until the Pokémon is drawn. Rejected — loses the arcana identity during the middle step.

### Tap advances a one-directional state machine
Each card is a small state machine: `facedown → (auto) arcana → (tap) pokemon`. The document-level click handler already used for draw/spread controls dispatches per-card taps. Once in `pokemon`, further taps do nothing (the front is now a link). This retires the old flip-back toggle.
- The member is chosen with `Math.random()` over the card's `members` at tap time and is final for that card in the reading.

### Morph = second flip of the same card
Reuse the existing 3D flip: the card's front face swaps from arcana emblem to the Pokémon face and the card flips again to present it. Reduced motion resolves the transition instantly (mirrors the existing `REDUCED_MOTION` handling). The revealed Pokémon front is an `<a href="/card/[pokemon-slug]">`.
- *Alternative considered:* a per-card "Draw Pokémon" button. Rejected in grilling — tap-to-morph reuses the flip mechanic and is more tactile; discoverability handled with a subtle hint on the arcana label.

## Risks / Trade-offs

- **Some Minor arcana never appear in a reading** (empty buckets excluded) → accepted trade-off; the deck browser still shows all 78 cards.
- **Discoverability of the second tap** (users may not know to tap the arcana card) → mitigate with the per-card position/hint label cueing "tap to reveal".
- **Sprites use the fallback SVG in local dev** because `SPRITES_BASE` is a placeholder on this branch → flow logic is fully verifiable regardless; real artwork is out of scope here.
- **`cards.json` must be generated** (`bun run sync`) before local verification since generated data is gitignored → one-time setup step, not a code risk.

## Migration Plan

Pure front-end interaction change on a static site; no data or API migration. Ship by merging the branch. Rollback = revert the branch; no persisted state or external contracts are affected.
