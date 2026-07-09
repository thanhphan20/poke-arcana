## 1. Data & payload

- [x] 1.1 Generate data locally with `bun run sync` so `src/data/generated/cards.json` exists for dev/verification
- [x] 1.2 In `src/pages/reading.astro`, switch `getCollection('pokemonCards')` → `getCollection('tarotCards')` and filter to cards where `members.length > 0`
- [x] 1.3 Build the spread payload so each card carries `slug`, `arcana` (kind/name/suit/majorNumber), and a trimmed `members` array of `{ id, name, slug }`

## 2. Arcana emblem face (first tier)

- [x] 2.1 In `spread-reveal.ts`, update the payload types (`SpreadCard`) to the new tarot-card shape with `members`
- [x] 2.2 Draw over the tarot deck: shuffle non-empty cards, deal N distinct cards (keep 1/3/10 sizes and position labels)
- [x] 2.3 Render the front face as the arcana emblem — reuse the `arcana-card` frame but replace the sprite `<img>` with the Roman numeral (Major, via `ROMAN`) or suit symbol (Minor); keep theme accent/wash from `MAJOR_CARD_THEME`/`SUIT_CARD_THEME`
- [x] 2.4 Auto-flip each dealt card from face-down to its arcana face with the existing stagger

## 3. Second-tier Pokémon draw

- [x] 3.1 Model each card's state as `facedown → arcana → pokemon`; track it per slot
- [x] 3.2 On tapping a card in the `arcana` state, pick one member at random from that card's `members` and render the Pokémon front face (existing sprite-based `arcana-card` markup)
- [x] 3.3 Morph via a second flip of the same card; resolve instantly under `prefers-reduced-motion`
- [x] 3.4 Make the revealed Pokémon front an `<a href="/card/[pokemon-slug]">`
- [x] 3.5 Retire the flip-back-to-face-down toggle and the `/deck/[slug]` link on the arcana front; taps on a card already in the `pokemon` state do not re-draw or flip back
- [x] 3.6 Add a subtle per-card hint (e.g. on the position label) cueing "tap to reveal" while a card is in the `arcana` state

## 4. Verification

- [x] 4.1 Run the dev server and verify: draw 1/3/10 → arcana emblems reveal → tapping each morphs to a Pokémon → Pokémon links to `/card/[slug]`
- [x] 4.2 Confirm no empty tarot card is ever dealt, and that drawn cards are distinct
- [x] 4.3 Verify reduced-motion resolves transitions without animation, and that the shipped `/reading` JS still contains no framework runtime
- [x] 4.4 Run `openspec validate reading-two-tier-draw --strict` and typecheck the build
