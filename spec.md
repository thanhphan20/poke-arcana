# Poke-Arcana — Project Spec

A tarot deck reimagined with Pokemon: every Pokemon takes the place of one of the 78 traditional tarot cards, browsable as a deck and drawable as a reading.

This file is a human-readable summary. The authoritative, structured spec lives in [OpenSpec](https://github.com/Fission-AI/OpenSpec) format under `openspec/` — see `openspec/changes/initial-build/` for the full proposal, design, capability specs, and task list driving the current build. Once `initial-build` is implemented and archived, its capability specs become the durable source of truth under `openspec/specs/`.

## Stack

- **Astro 7** — mostly static (prerendered pages), with server adapter for API routes
- **Bun** — package manager and script runner
- **TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Vercel** — static prerendering for pages + Edge runtime for `/api/*` routes; powered by `@astrojs/vercel` adapter

## Scope (v1)

Gen 1 Pokemon only (Pokedex #1–151). The data pipeline and arcana-assignment algorithm are both parameterized/deterministic so widening to later generations is a config change and a script rerun — not a redesign.

## Core Capabilities

| Capability | What it covers |
|---|---|
| `pokemon-data-pipeline` | Build-time script that fetches PokeAPI data for a configurable ID range and writes a committed JSON dataset. `astro build` never touches the network. |
| `arcana-assignment` | Deterministic logic mapping each Pokemon to a Major Arcana name (legendary/mythical) or a Minor Arcana suit + rank (everyone else), computed from the Pokemon's own data plus its population. |
| `deck-browser` | `/deck` grid and `/deck/[slug]` Pokémon detail pages presenting every Pokemon as a tarot card. |
| `arcana-detail-content` | `/card/[slug]` arcana detail pages showing Rider-Waite-Smith art, meanings, keywords, and metadata. |
| `card-reading` | `/reading` page: draw a 1/3/10 card spread with shuffle + flip-reveal, implemented as a vanilla Web Component (no framework island). |
| `arcana-reveal-visual` | Arcana-front state of a drawn card displays real Rider-Waite-Smith image; surrounding chrome preserved. |
| `ai-tarot-interpretation` | Optional LLM-powered reading generation (Vercel Edge route) with multi-provider chain (Gemini → Groq → OpenRouter) and fallback template. |
| `draw-history` | Browser-local storage of past 20 draws; revisit them on `/history` without animation replay. |
| `tarot-art-assets` | Committed Rider-Waite-Smith WebP images (78 cards, ~2.8MB) served locally; deterministic URL derivation. |

Full requirements and scenarios: each capability has a spec under `openspec/changes/<change>/specs/` (archived) or `openspec/specs/` (durable specs).

## Key Design Decisions

See the relevant change proposal for full rationale:

**Core (initial-build):**
- **Sync script, not a live Content Layer loader** — Minor Arcana rank needs a percentile over the *whole* fetched population, which is a batch computation, not a per-item stream. The sync script runs offline/manually; `astro build` only reads its committed JSON output.
- **Major Arcana via stable hash of Pokedex ID** — stays fixed as the dataset grows; sequential assignment would reshuffle prior generations' mappings on every expansion.
- **Suit via weighted type vote** (primary type ×2, secondary ×1) over a fixed 18-type → 4-suit table.
- **Web Component, not a React/Svelte/Vue island**, for the draw/reveal interaction — shuffle/flip state is local to one component instance, so a framework runtime buys nothing.

**Rider-Waite-Smith art (rws-arcana-art):**
- **Committed WebP images, not a CDN** — Rider-Waite-Smith art is public domain; hosting locally (78 images, ~2.8MB) keeps the site fully deployable offline and eliminates external API/CDN dependencies.
- **Deterministic URL derivation** — `m{majorNumber}.webp` for majors, `{suit-letter}{rankIndex+1}.webp` for minors, derived at build time so the vignette rendering is trivial.

**AI readings (ai-tarot-reading):**
- **Multi-provider chain with automatic fallback** — Gemini → Groq → OpenRouter. Survives hobby-tier free quotas (429 errors trigger immediate rotation). No cross-request state; stateless retry+fallback per request.
- **Server adapter for API route only** — 99% of the site remains prerendered static; only `/api/reading` runs on Vercel Edge. Build-time network-free invariant preserved.

**History (add-draw-history):**
- **Browser localStorage, no backend** — Maintains the zero-backend architecture. 20-draw rolling window with schema versioning for graceful degradation on schema changes.

## Working in This Repo

See [`AGENTS.md`](./AGENTS.md) for conventions and the OpenSpec workflow used to propose and implement changes.
