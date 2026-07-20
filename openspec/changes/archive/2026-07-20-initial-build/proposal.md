## Why

Poke-Arcana doesn't exist yet — this is the first change for the project. We want a tarot deck reimagined with Pokemon: every Pokemon takes the place of one of the 78 traditional tarot cards, browsable as a deck and drawable as a reading. Starting now, scoped to Gen 1, with an assignment mechanism that scales to later generations without redesign.

## What Changes

- Add a build-time data pipeline that fetches Gen 1 Pokemon (#1-151) from PokeAPI and writes a committed JSON dataset — no network access during `astro build`.
- Add a deterministic arcana-assignment algorithm: Legendary/Mythical Pokemon become Major Arcana; all others become Minor Arcana with a suit (from type) and rank (from base-stat-total percentile within that suit).
- Add a browsable deck encyclopedia (`/deck`, `/deck/[slug]`) showing every included Pokemon as a tarot card with its assigned arcana meaning.
- Add an interactive reading experience (`/reading`) where a visitor draws a 1/3/10 card spread with a shuffle and flip-reveal animation, implemented as a vanilla Web Component (no UI framework runtime).
- Scaffold the Astro 7 + Bun + Tailwind v4 project itself (config, layout, styles) as the foundation all of the above sits on.

## Capabilities

### New Capabilities
- `pokemon-data-pipeline`: build-time script that fetches Pokemon data from PokeAPI for a configurable Pokedex ID range and writes a committed, schema-validated JSON dataset consumed by Astro's Content Layer.
- `arcana-assignment`: deterministic logic that assigns each Pokemon a tarot identity (Major Arcana name, or Minor Arcana suit + rank) purely from its own data (legendary/mythical flag, types, base stats) plus the population it's computed over.
- `deck-browser`: static pages presenting the full set of Pokemon-as-tarot-cards as a filterable grid and individual card detail pages.
- `card-reading`: client-side draw/shuffle/reveal interaction for pulling a 1, 3, or 10 card spread from the deck.

### Modified Capabilities
(none — this is the first change)

## Impact

- New Astro project at the repo root (`astro.config.mjs`, `src/`, `scripts/`, `public/`).
- New dependency on PokeAPI (https://pokeapi.co) as a build-time-only data source.
- New committed generated-data artifacts (`src/data/generated/pokemon.json`, `meta.json`) that must be regenerated and re-committed whenever the Pokedex ID range changes.
- No runtime backend, database, or auth — fully static output deployed to Vercel.
