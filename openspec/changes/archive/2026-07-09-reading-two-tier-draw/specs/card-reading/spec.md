## MODIFIED Requirements

### Requirement: Spread size selection
The system SHALL provide a `/reading` page where a visitor can choose to draw a 1, 3, or 10 card spread. A spread deals distinct **tarot cards** (arcana), drawn from the 78-card deck restricted to cards that have at least one Pokémon member.

#### Scenario: Choosing a 3-card spread
- **WHEN** a visitor clicks the "Draw 3" control
- **THEN** exactly 3 distinct tarot cards are selected from the non-empty tarot deck for this reading

#### Scenario: Empty tarot cards are never dealt
- **WHEN** any spread is drawn
- **THEN** no tarot card with zero Pokémon members appears in the spread

### Requirement: Randomized, non-repeating draw
Each draw SHALL select distinct tarot cards (no arcana appears twice in the same spread) via a shuffle over the non-empty tarot deck.

#### Scenario: Drawing a 10-card spread
- **WHEN** a visitor draws a 10-card spread
- **THEN** the 10 cards returned are all distinct tarot cards

#### Scenario: Redrawing
- **WHEN** a visitor draws again after a previous draw
- **THEN** the new draw is independently shuffled and may include a different set and order of tarot cards than the previous draw

### Requirement: Face-down to face-up reveal
Drawn cards SHALL render face-down initially and flip to face-up via a client-side animation, without a full page reload. The revealed face-up state shows the **arcana emblem** — the existing card frame with the Roman numeral (Major Arcana) or suit symbol (Minor Arcana) in place of a Pokémon sprite — and its arcana name.

#### Scenario: Revealing a drawn card
- **WHEN** a drawn card animates from face-down to face-up
- **THEN** it shows that card's arcana emblem and arcana name, with no specific Pokémon sprite yet

## ADDED Requirements

### Requirement: Second-tier Pokémon draw
Once a card is showing its arcana face, the visitor SHALL be able to draw one Pokémon for that card by tapping it. The card animates to reveal a single Pokémon selected at random from that card's members. The draw is per-card and independent of the other cards in the spread.

#### Scenario: Drawing a Pokémon from a revealed arcana card
- **WHEN** a visitor taps a card showing its arcana face
- **THEN** the card animates to reveal one Pokémon drawn at random from that card's members

#### Scenario: Card already showing a Pokémon
- **WHEN** a visitor taps a card that has already revealed its Pokémon
- **THEN** the card does not re-draw or flip back; it retains the Pokémon it revealed

#### Scenario: Reduced motion
- **WHEN** the visitor's system requests reduced motion
- **THEN** the arcana-to-Pokémon transition resolves without animation

### Requirement: Revealed Pokémon links to its detail page
A card that has revealed its Pokémon SHALL link to that Pokémon's detail page at `/card/[pokemon-slug]`.

#### Scenario: Following a revealed Pokémon
- **WHEN** a visitor activates a card that is showing its drawn Pokémon
- **THEN** the browser navigates to that Pokémon's page at `/card/[pokemon-slug]`
