## ADDED Requirements

### Requirement: Curated legendary-to-Major-card mapping
Major Arcana assignment SHALL use a curated, thematic 1:1 map from a specific legendary/mythical Pokémon to a specific Major Arcana card, replacing the dex-order `rank % 22` assignment. The map SHALL cover all 22 Major Arcana cards. This is a deliberate exception to the otherwise fully-algorithmic assignment rule.

#### Scenario: Each Major card maps to its curated Pokémon
- **WHEN** arcana is assigned over the dataset
- **THEN** each of the 22 Major Arcana cards is assigned the single Pokémon named in the curated map
- **AND** no two Major cards are assigned the same Pokémon

#### Scenario: Iconic legendaries land on intended cards
- **WHEN** the curated map is applied to Gen 1-3
- **THEN** iconic legendaries resolve to their intended cards (e.g. Mewtwo, Mew, and box legendaries appear on the cards specified in the curated map)

### Requirement: Pseudo-legendary promotion fills the deck
Because the Gen 1-3 legendary/mythical population (21) is smaller than the 22 Major cards, the system SHALL promote exactly one pseudo-legendary — Dragonite (#149) — into the Major Arcana eligible set so all 22 Major cards are filled 1:1. Promoted Pokémon SHALL NOT also appear as a Minor card member.

#### Scenario: All 22 Major cards populated
- **WHEN** arcana is assigned over Gen 1-3
- **THEN** all 22 Major Arcana cards have exactly one assigned Pokémon
- **AND** Dragonite is one of the assigned Major Pokémon

#### Scenario: Promoted Pokémon is not double-counted
- **WHEN** Dragonite is promoted to a Major card
- **THEN** Dragonite does not also appear as a member of any Minor card

### Requirement: Deterministic and range-tolerant assignment
Major assignment SHALL remain deterministic. When the Pokédex range widens to include legendaries not present in the curated map, the build SHALL fail loudly (or fall back to a documented deterministic rule) rather than silently produce collisions or unassigned Major cards.

#### Scenario: Unmapped legendary is surfaced
- **WHEN** the dataset contains a legendary/mythical not present in the curated map
- **THEN** the sync/build step reports the unmapped Pokémon rather than silently mis-assigning it
