## MODIFIED Requirements

### Requirement: Normalized Pokemon record shape
Each record in the generated dataset SHALL include: Pokedex id, name, slug, type(s) in
order, base-stat total, legendary flag, mythical flag, English flavor text (control
characters stripped), English genus, and its computed arcana assignment. The record
SHALL NOT store sprite-URL strings; sprite URLs are derived from the record's Pokedex
id at render time (see the `sprite-delivery` capability).

#### Scenario: A legendary Pokemon's record
- **WHEN** the sync script processes a Pokemon whose species data has `is_legendary: true`
- **THEN** the resulting record has `isLegendary: true` and an `arcana` field of kind `major`

#### Scenario: A record carries no sprite URL
- **WHEN** the sync script writes a Pokemon record
- **THEN** the record contains no `sprite` or `thumbSprite` field, and its sprite images are resolvable purely from its `id`

### Requirement: Build-time PokeAPI sync
The system SHALL provide a standalone script that fetches Pokemon data from PokeAPI for
a configurable Pokedex ID range and writes the result to a committed JSON file,
independent of `astro build`. The script SHALL NOT download or self-host sprite images.
`astro build` SHALL NOT perform any network requests, and the build command SHALL NOT
invoke the sync script; regenerating and committing the JSON is a manual maintenance step.

#### Scenario: Running the sync script for Gen 1
- **WHEN** a maintainer runs the sync script with `DEX_START=1` and `DEX_END=151`
- **THEN** the script fetches `/pokemon/{id}` and `/pokemon-species/{id}` for every ID from 1 to 151 and writes `src/data/generated/pokemon.json` containing exactly 151 records, and downloads no image files

#### Scenario: Widening the ID range
- **WHEN** a maintainer changes `DEX_END` to a higher value and reruns the sync script
- **THEN** the script fetches the newly-included IDs and regenerates `pokemon.json` with the larger record set, without any code changes to the script itself

#### Scenario: A build runs with no network access
- **WHEN** `astro build` is run in an environment with no network access
- **THEN** the build completes successfully using only the already-committed `src/data/generated/pokemon.json`, because the build command does not run the sync script

#### Scenario: Generated data is committed
- **WHEN** the repository is cloned fresh and `astro build` is run without first running the sync script
- **THEN** the build succeeds because `src/data/generated/` is tracked in version control and not gitignored
