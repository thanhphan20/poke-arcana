# pokemon-data-pipeline Specification

## Purpose
TBD - created by archiving change initial-build. Update Purpose after archive.
## Requirements
### Requirement: Build-time PokeAPI sync
The system SHALL provide a standalone script that fetches Pokemon data from PokeAPI for a configurable Pokedex ID range and writes the result to a committed JSON file, independent of `astro build`. `astro build` SHALL NOT perform any network requests.

#### Scenario: Running the sync script for Gen 1
- **WHEN** a maintainer runs the sync script with `DEX_START=1` and `DEX_END=151`
- **THEN** the script fetches `/pokemon/{id}` and `/pokemon-species/{id}` for every ID from 1 to 151 and writes `src/data/generated/pokemon.json` containing exactly 151 records

#### Scenario: Widening the ID range
- **WHEN** a maintainer changes `DEX_END` to a higher value and reruns the sync script
- **THEN** the script fetches the newly-included IDs and regenerates `pokemon.json` with the larger record set, without any code changes to the script itself

#### Scenario: A build runs with no network access
- **WHEN** `astro build` is run in an environment with no network access
- **THEN** the build completes successfully using only the already-committed `src/data/generated/pokemon.json`

### Requirement: Normalized Pokemon record shape
Each record in the generated dataset SHALL include: Pokedex id, name, slug, type(s) in order, base-stat total, legendary flag, mythical flag, official-artwork sprite URL, English flavor text (control characters stripped), English genus, and its computed arcana assignment.

#### Scenario: A legendary Pokemon's record
- **WHEN** the sync script processes a Pokemon whose species data has `is_legendary: true`
- **THEN** the resulting record has `isLegendary: true` and an `arcana` field of kind `major`

### Requirement: Sync failure on incomplete data
The sync script SHALL fail with a non-zero exit code and a clear error message if any ID within the configured range returns a 404 or otherwise cannot be fetched, rather than silently producing a shorter dataset.

#### Scenario: A gap in the ID range
- **WHEN** an ID within `[DEX_START, DEX_END]` returns a 404 from PokeAPI
- **THEN** the script exits non-zero and prints which ID failed, and `pokemon.json` is not overwritten

### Requirement: Generation provenance metadata
The sync script SHALL write a `meta.json` alongside `pokemon.json` recording the generation timestamp, the ID range used, the record count, and the data source URL.

#### Scenario: Inspecting when data was last generated
- **WHEN** a developer opens `src/data/generated/meta.json`
- **THEN** they can see the ISO timestamp, `dexStart`, `dexEnd`, `count`, and source of the currently-committed `pokemon.json`

