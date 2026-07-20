# arcana-assignment Specification

## Purpose
TBD - created by archiving change initial-build. Update Purpose after archive.
## Requirements
### Requirement: Deterministic Major Arcana assignment
Every legendary or mythical Pokemon SHALL be assigned exactly one of the 22 canonical Major Arcana names, chosen by a stable hash of its own Pokedex ID modulo 22, so the assignment never changes when other Pokemon are added to or removed from the dataset.

#### Scenario: Same Pokemon, wider dataset
- **WHEN** a legendary Pokemon's Major Arcana is computed with a dataset of 151 Pokemon, and again with a dataset of 300 Pokemon
- **THEN** it resolves to the same Major Arcana name both times

#### Scenario: Two legendaries share an archetype
- **WHEN** two different legendary Pokemon's ID hashes resolve to the same value modulo 22
- **THEN** both are assigned that same Major Arcana name, and this is not treated as an error

### Requirement: Deterministic Minor Arcana suit assignment
Every non-legendary, non-mythical Pokemon SHALL be assigned exactly one of 4 suits (Cups, Wands, Swords, Pentacles) via a weighted vote over its type(s) against a fixed type-to-suit table covering all 18 Pokemon types, with the primary type weighted twice the secondary type.

#### Scenario: Single-typed Pokemon
- **WHEN** a Pokemon has only one type
- **THEN** its suit is exactly that type's entry in the type-to-suit table

#### Scenario: Dual-typed Pokemon with a dominant secondary type
- **WHEN** a dual-typed Pokemon's secondary type's suit differs from its primary type's suit
- **AND** the weighted vote is tied
- **THEN** the primary type's suit wins

### Requirement: Deterministic Minor Arcana rank assignment
Within each suit, every Minor Arcana Pokemon SHALL be assigned one of 14 ranks (Ace through Ten, then Page, Knight, Queen, King) based on its base-stat-total percentile computed within that suit's population only.

#### Scenario: Recomputing ranks after adding Pokemon to a suit
- **WHEN** new Pokemon are added to the dataset that fall into an existing suit
- **THEN** ranks for all Pokemon in that suit are recomputed from the new, larger population (this recomputation happens as part of rerunning the data pipeline, not incrementally)

#### Scenario: Single Pokemon in a suit
- **WHEN** a suit's population contains only one Pokemon
- **THEN** that Pokemon is assigned percentile 0 (Ace) rather than causing a division-by-zero error

