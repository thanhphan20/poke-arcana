## ADDED Requirements

### Requirement: Spread size selection
The system SHALL provide a `/reading` page where a visitor can choose to draw a 1, 3, or 10 card spread.

#### Scenario: Choosing a 3-card spread
- **WHEN** a visitor clicks the "Draw 3" control
- **THEN** exactly 3 distinct Pokemon cards are selected from the full deck for this reading

### Requirement: Randomized, non-repeating draw
Each draw SHALL select distinct cards (no Pokemon appears twice in the same spread) via a shuffle over the full deck.

#### Scenario: Drawing a 10-card spread
- **WHEN** a visitor draws a 10-card spread
- **THEN** the 10 cards returned are all distinct Pokemon

#### Scenario: Redrawing
- **WHEN** a visitor draws again after a previous draw
- **THEN** the new draw is independently shuffled and may include a different set and order of cards than the previous draw

### Requirement: Face-down to face-up reveal
Drawn cards SHALL render face-down initially and flip to face-up (revealing sprite and arcana name) via a client-side animation, without a full page reload.

#### Scenario: Revealing a drawn card
- **WHEN** a visitor interacts with a face-down drawn card
- **THEN** it animates to face-up, showing that Pokemon's sprite and arcana name

### Requirement: No framework runtime for the reveal interaction
The draw/shuffle/reveal interaction SHALL be implemented as a vanilla-TypeScript Web Component (custom element), without introducing a React/Svelte/Vue island or its runtime.

#### Scenario: Inspecting the shipped JS for /reading
- **WHEN** the built `/reading` page's client-side script is inspected
- **THEN** it contains only the custom-element script (and any small supporting utility code), with no UI-framework runtime bundled
