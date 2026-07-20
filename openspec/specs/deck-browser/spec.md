# deck-browser Specification

## Purpose
TBD - created by archiving change initial-build. Update Purpose after archive.
## Requirements
### Requirement: Deck grid page
The system SHALL provide a `/deck` page listing every Pokemon in the generated dataset as a tarot card, showing at minimum its sprite, name, and arcana name (Major Arcana name, or "Rank of Suit" for Minor Arcana).

#### Scenario: Visiting the deck page
- **WHEN** a visitor navigates to `/deck`
- **THEN** they see one card per Pokemon in the generated dataset, with no pagination gap (all 151 Gen-1 entries present for v1)

### Requirement: Deck filtering by suit or Major Arcana
The deck grid SHALL support filtering to show only Major Arcana cards, or only cards of a specific Minor Arcana suit.

#### Scenario: Filtering to one suit
- **WHEN** a visitor selects the "Cups" filter
- **THEN** only Minor Arcana cards with suit Cups are shown

### Requirement: Individual card detail page
The system SHALL provide a `/deck/[slug]` page per Pokemon showing its full artwork, arcana identity, type(s), flavor text, and genus.

#### Scenario: Visiting a Major Arcana Pokemon's detail page
- **WHEN** a visitor navigates to the detail page of a legendary Pokemon
- **THEN** the page shows its Major Arcana name and does not show a suit/rank (since it has neither)

#### Scenario: Visiting a Minor Arcana Pokemon's detail page
- **WHEN** a visitor navigates to the detail page of a non-legendary Pokemon
- **THEN** the page shows its suit and rank (e.g. "Three of Wands") and does not show a Major Arcana number

