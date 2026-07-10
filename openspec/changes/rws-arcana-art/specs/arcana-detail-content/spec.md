## ADDED Requirements

### Requirement: Shared arcana metadata lookup

The system SHALL provide a single `arcanaMetadata(arcana)` helper that returns the typed per-card metadata for an arcana identity from `tarot-metadata.ts` — majors resolved by name, minors resolved by suit and rank (from `rankIndex`). Pages MUST use this helper rather than duplicating the lookup. Tarot metadata SHALL remain defined in TypeScript (not a runtime JSON asset).

#### Scenario: Major lookup
- **WHEN** `arcanaMetadata({ kind: 'major', name: 'The Fool' })` is called
- **THEN** it returns The Fool's metadata (keywords, upright/reversed meanings, description, and element/astrology/numerology)

#### Scenario: Minor lookup
- **WHEN** `arcanaMetadata({ kind: 'minor', suit: 'cups', rankIndex: 0 })` is called
- **THEN** it returns the Ace of Cups metadata (keywords, upright/reversed meanings, description)

### Requirement: Tarot card detail page shows full metadata and art

The `card/[slug]` page SHALL display, for the card's arcana: the Rider-Waite-Smith art, the keyword list, the per-card description, the upright and reversed meanings, and — for major arcana only — the element, astrology, and numerology attributes. Minor arcana MUST NOT render an empty attributes row.

#### Scenario: Major card detail
- **WHEN** a visitor opens the detail page for a major (e.g. The Fool)
- **THEN** the page shows the RWS art, keyword chips, description, upright and reversed meanings, and an element/astrology/numerology row

#### Scenario: Minor card detail
- **WHEN** a visitor opens the detail page for a minor (e.g. Ace of Cups)
- **THEN** the page shows the RWS art, keyword chips, description, and upright/reversed meanings, and does NOT render an element/astrology/numerology row

### Requirement: Pokémon detail page shows rarity, arcana link, and tie-in

The `deck/[slug]` page SHALL display a Legendary or Mythical badge for Pokémon flagged as such, a link to that Pokémon's tarot card detail page (`/card/{arcana-slug}`), and the arcana's keywords plus upright meaning.

#### Scenario: Legendary Pokémon
- **WHEN** a visitor opens the detail page for a Legendary or Mythical Pokémon
- **THEN** a rarity badge is shown, and the arcana box links to that Pokémon's tarot card page

#### Scenario: Non-legendary Pokémon
- **WHEN** a visitor opens the detail page for a Pokémon that is neither Legendary nor Mythical
- **THEN** no rarity badge is shown, and the arcana box still links to the tarot card page with the arcana keywords and upright meaning
