# Poke-Arcana — Project Spec

A tarot deck reimagined with Pokemon: every Pokemon takes the place of one of the 78 traditional tarot cards, browsable as a deck and drawable as a reading.

This file is a human-readable summary. The authoritative, structured spec lives in [OpenSpec](https://github.com/Fission-AI/OpenSpec) format under `openspec/` — see `openspec/changes/initial-build/` for the full proposal, design, capability specs, and task list driving the current build. Once `initial-build` is implemented and archived, its capability specs become the durable source of truth under `openspec/specs/`.

## Stack

- **Astro 7** — static output only, no SSR/auth/DB
- **Bun** — package manager and script runner
- **TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Vercel** — static deploy, no adapter needed for v1

## Scope (v1)

Gen 1 Pokemon only (Pokedex #1–151). The data pipeline and arcana-assignment algorithm are both parameterized/deterministic so widening to later generations is a config change and a script rerun — not a redesign.

## Core Capabilities

| Capability | What it covers |
|---|---|
| `pokemon-data-pipeline` | Build-time script that fetches PokeAPI data for a configurable ID range and writes a committed JSON dataset. `astro build` never touches the network. |
| `arcana-assignment` | Deterministic logic mapping each Pokemon to a Major Arcana name (legendary/mythical) or a Minor Arcana suit + rank (everyone else), computed from the Pokemon's own data plus its population. |
| `deck-browser` | `/deck` grid + `/deck/[slug]` detail pages presenting every Pokemon as a tarot card. |
| `card-reading` | `/reading` page: draw a 1/3/10 card spread with shuffle + flip-reveal, implemented as a vanilla Web Component (no framework island). |

Full requirements and scenarios for each capability: `openspec/changes/initial-build/specs/<capability>/spec.md`.

## Key Design Decisions

See `openspec/changes/initial-build/design.md` for full rationale. Summary:

- **Sync script, not a live Content Layer loader** — Minor Arcana rank needs a percentile over the *whole* fetched population, which is a batch computation, not a per-item stream. The sync script runs offline/manually; `astro build` only reads its committed JSON output.
- **Major Arcana via stable hash of Pokedex ID** — stays fixed as the dataset grows; sequential assignment would reshuffle prior generations' mappings on every expansion.
- **Suit via weighted type vote** (primary type ×2, secondary ×1) over a fixed 18-type → 4-suit table.
- **Web Component, not a React/Svelte/Vue island**, for the draw/reveal interaction — shuffle/flip state is local to one component instance, so a framework runtime buys nothing.
- **No `@astrojs/vercel` adapter for v1** — a fully static site doesn't need it; Vercel zero-config-detects `dist/` + Bun via `bun.lock`.

## Working in This Repo

See [`AGENTS.md`](./AGENTS.md) for conventions and the OpenSpec workflow used to propose and implement changes.
