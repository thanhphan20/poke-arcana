## MODIFIED Requirements

### Requirement: Rank-based Major Arcana assignment
Every legendary or mythical Pokémon SHALL be assigned exactly one of the 22 canonical Major Arcana names based on its rank (sorted position by Pokédex ID) within the legendary/mythical population of the dataset, computed as `rank % 22`.

#### Scenario: Sequential assignment for sorted legendaries
- **GIVEN** a dataset containing legendary Pokémon with IDs [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251]
- **WHEN** the arcana assignment is computed
- **THEN** rank 0 (ID 144) → arcana slot 0 (The Fool), rank 1 (ID 145) → slot 1 (The Magician), ..., rank 10 (ID 251) → slot 10 (Wheel of Fortune)

#### Scenario: No collisions within dataset
- **GIVEN** a dataset with N legendary/mythical Pokémon where N ≤ 22
- **WHEN** all legendaries are assigned their Major Arcana
- **THEN** each legendary receives a unique arcana slot from 0 to N-1, with no duplicates

#### Scenario: Assignment changes when dataset grows
- **GIVEN** a dataset of Gen 1-3 legendaries (21 Pokémon)
- **WHEN** Gen 4 legendaries are added to the dataset (new IDs inserted between existing IDs)
- **THEN** the rank order changes and all legendaries receive new arcana assignments based on their new rank in the expanded sorted list

### Requirement: Deterministic Minor Arcana suit assignment
(No change from initial-build/specs/arcana-assignment/spec.md)

Every non-legendary, non-mythical Pokémon SHALL be assigned exactly one of 4 suits (Cups, Wands, Swords, Pentacles) via a weighted vote over its type(s) against a fixed type-to-suit table covering all 18 Pokémon types, with the primary type weighted twice the secondary type.

### Requirement: Deterministic Minor Arcana rank assignment
(No change from initial-build/specs/arcana-assignment/spec.md)

Within each suit, every Minor Arcana Pokémon SHALL be assigned one of 14 ranks (Ace through Ten, then Page, Knight, Queen, King) based on its base-stat-total percentile computed within that suit's population only.

## REMOVED Requirements

### ~~Requirement: Stable hash-based Major Arcana assignment~~
The original requirement for hash-based assignment with stability under dataset growth is **removed**. The new rank-based approach is deterministic within a dataset but not stable across dataset changes.
