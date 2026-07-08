# Poké-Arcana

A tarot deck reimagined with Pokémon — every Pokémon is a tarot card. Browse the full deck, or draw a spread and read the cards.

Built with **Astro 7** (static), **Bun**, **Tailwind v4**. Deployed static to Vercel. See [`spec.md`](./spec.md) for the project spec and [`AGENTS.md`](./AGENTS.md) for conventions and the [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflow.

## Getting started

```bash
bun install
bun run dev        # dev server at http://localhost:4321
bun run build      # static build to dist/ (no network access needed)
bun run preview    # serve the built output
```

## How Pokémon become tarot cards

Assignment is **deterministic** — derived from each Pokémon's own data, never hand-curated — so widening the roster never requires re-curation. See `src/lib/arcana/`.

- **Legendary / Mythical → Major Arcana.** One of the 22 archetypes, chosen by a stable hash of the Pokédex ID (stable under roster growth).
- **Everyone else → Minor Arcana.** Suit comes from a weighted vote over the Pokémon's type(s) against a fixed 18-type → 4-suit table (Cups / Wands / Swords / Pentacles). Rank (Ace…King) is the Pokémon's base-stat-total percentile within its suit.

## Data pipeline

Pokémon data is fetched from [PokéAPI](https://pokeapi.co) at **build time by a standalone script**, not during `astro build` and never at runtime. The script writes a committed dataset that Astro's Content Layer reads:

```bash
bun run sync       # fetches the DEX_START..DEX_END range and regenerates src/data/generated/
```

The range is set via env (see [`.env.example`](./.env.example)); v1 ships Gen 1 (#1–151).

> **Important:** `bun run sync` is a manual, committed step. `astro build` does **not** re-fetch PokéAPI. Whenever you change `DEX_START`/`DEX_END`, rerun `bun run sync` and commit the regenerated `src/data/generated/pokemon.json` and `meta.json`.

## Routes

- `/` — landing
- `/deck` — the full deck, filterable by suit / Major Arcana
- `/deck/[slug]` — individual card detail
- `/reading` — draw a 1 / 3 / 10 card spread with a shuffle + flip reveal (a vanilla Web Component, no framework runtime)
