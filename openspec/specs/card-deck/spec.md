# card-deck Specification

## Purpose
TBD - created by archiving change group-pokemon-into-78-cards. Update Purpose after archive.
## Requirements
### Requirement: Deck presents exactly 78 tarot cards
The deck index SHALL render exactly 78 tarot cards — 22 Major Arcana and 56 Minor Arcana (4 suits × 14 ranks) — rather than one tile per Pokémon. Every Gen 1-3 Pokémon SHALL belong to exactly one card; no Pokémon is discarded.

#### Scenario: Deck index shows 78 cards
- **WHEN** a user opens the deck index page
- **THEN** exactly 78 card tiles are rendered
- **AND** 22 are Major Arcana and 56 are Minor Arcana

#### Scenario: Every Pokémon is assigned to a card
- **WHEN** the card grouping is built from the Pokémon dataset
- **THEN** each Pokémon appears as a member of exactly one card
- **AND** no card list omits any Pokémon in the dataset

### Requirement: Minor cards are groups, Major cards are single Pokémon
Each of the 56 Minor cards SHALL be backed by a group of zero or more member Pokémon (those whose suit and BST-percentile rank match the card). Each of the 22 Major cards SHALL be backed by exactly one legendary/mythical (or promoted pseudo-legendary) Pokémon.

#### Scenario: Minor card exposes its member group
- **WHEN** a Minor card is built
- **THEN** its members are all Pokémon assigned that suit and rank
- **AND** members are ordered deterministically by base-stat total descending, then Pokédex ID ascending

#### Scenario: Major card holds a single Pokémon
- **WHEN** a Major card is built
- **THEN** it references exactly one Pokémon

### Requirement: Card faces show tarot art only
Deck grid tiles SHALL display pure tarot art (suit symbol / rank / Major name) with no Pokémon sprite on the card face. Pokémon sprites SHALL appear only on the card detail (drill-in) view.

#### Scenario: Grid tile has no sprite
- **WHEN** the deck grid renders a card tile
- **THEN** the tile shows tarot styling and the card name
- **AND** no Pokémon sprite is present on the tile

### Requirement: Per-card detail page
The system SHALL provide a `/card/{slug}` page for each of the 78 cards, showing the card's tarot art and metadata (keywords, meanings) plus its member Pokémon. Each member SHALL link to its existing per-Pokémon `/deck/{slug}` page.

#### Scenario: Minor card detail lists members
- **WHEN** a user opens the detail page of a Minor card
- **THEN** the tarot art and card metadata are shown
- **AND** every member Pokémon is listed with a link to its per-Pokémon page

#### Scenario: Major card detail shows its legendary
- **WHEN** a user opens the detail page of a Major card
- **THEN** the single assigned legendary/mythical is shown with a link to its per-Pokémon page

### Requirement: Per-Pokémon pages preserved
Existing per-Pokémon `/deck/{slug}` pages SHALL remain available and resolvable for every Pokémon in the dataset.

#### Scenario: Per-Pokémon page still resolves
- **WHEN** a user navigates to `/deck/{slug}` for any Pokémon
- **THEN** that Pokémon's detail page renders as before

