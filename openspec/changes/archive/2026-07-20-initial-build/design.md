## Context

Greenfield project — no existing code, no existing specs to reconcile with. The interesting design questions are all about how build-time data flows from PokeAPI into a fully static Astro site with zero runtime network dependency, and how a many-to-few mapping (hundreds/thousands of Pokemon onto 78 tarot archetypes) stays deterministic as the Pokedex range grows.

## Goals / Non-Goals

**Goals:**
- Zero network calls during `astro build` or at runtime — all Pokemon data is resolved ahead of time.
- Widening from Gen 1 to later generations requires only an ID-range config change and a rerun of the sync script, never a change to the arcana logic itself.
- The interactive reading page ships the smallest reasonable JS payload for what is fundamentally a shuffle + CSS flip.

**Non-Goals:**
- No user accounts, saved readings, or server-side state of any kind.
- No hand-curated arcana assignments — thematic "this Pokemon *should* be The Tower" judgment calls are explicitly traded for a formula that scales.
- No SSR/ISR; a static site is sufficient since the dataset only changes when a maintainer reruns the sync script.

## Decisions

**Data pipeline is a standalone script, not a live Content Layer loader.**
Astro 5+'s Content Layer supports custom loaders that fetch remote data inside `load()`. We reject that here because Minor Arcana rank is a percentile *within the whole fetched suit population* — a batch computation over the complete dataset, not a per-item transform a streaming loader callback is built for. A loader would have to buffer the entire population internally to compute percentiles anyway, which is just the sync script's job done less legibly, and it would also put PokeAPI on the critical path of every Vercel build. Instead: `scripts/sync-pokedex.ts` runs manually/offline, computes arcana over the full set, and writes committed JSON that the built-in `file()` loader reads. Trade-off: a maintainer must remember to rerun+commit when the ID range changes (documented in README).

**Arcana suit from a weighted type vote, not primary-type-only.**
Many Pokemon are dual-typed, and a naive primary-type-only mapping would make the secondary type invisible to the suit assignment even when it's thematically dominant (e.g., a primarily-Normal-type with a strong secondary typing). A weighted vote (primary type counts 2x, secondary 1x) still privileges the primary type on ties but lets a strong secondary type flip the suit when it truly dominates the type table's grouping.

**Major Arcana number from a stable hash of Pokedex ID, not sequential assignment.**
Sequential assignment (1st legendary → The Fool, 2nd → The Magician, ...) would mean every future generation reshuffles *all* prior legendary→arcana assignments as new legendaries are inserted by Pokedex order. A hash keyed only on each Pokemon's own ID is stable under insertion — adding Gen 2 never changes what Gen 1's legendaries are already mapped to. Collisions (multiple Pokemon sharing a Major Arcana number) are accepted as thematic echoes, not treated as errors.

**Interactivity as a vanilla Web Component, not a framework island.**
The draw/shuffle/reveal state (which indices got drawn, which are flipped) lives entirely inside one component instance with no cross-component reactivity requirement. A React/Svelte/Vue island would ship an entire framework runtime to manage state a plain class field and `classList.toggle` handles natively. This matches Astro's own guidance to prefer vanilla JS/Web Components for self-contained interactive widgets.

**Tailwind v4 via `@tailwindcss/vite`, not `@astrojs/tailwind`.**
`@astrojs/tailwind` is the Tailwind v3-era integration and is not compatible with v4's CSS-first, Vite-native architecture. Wiring the Vite plugin directly is the current supported path.

**No `@astrojs/vercel` adapter for v1.**
The site has no SSR/ISR/Image-Optimization requirement that would need it. Vercel's static-site zero-config detection (via `dist/` + committed `bun.lock`) is sufficient. Adding the adapter later is additive and non-breaking if Vercel-specific features are wanted.

## Risks / Trade-offs

- [Stale generated data] Maintainer forgets to rerun `bun run sync` after widening `DEX_START`/`DEX_END` → site silently keeps serving the old range. **Mitigation**: `meta.json` records the range and generation timestamp used to produce `pokemon.json`; README calls out the manual step explicitly.
- [PokeAPI rate limiting/downtime during sync] → **Mitigation**: sync script uses a small concurrency pool (~8-10) with retry/backoff, and a gitignored `.cache/pokeapi/` of raw per-ID responses so repeated local runs during algorithm iteration don't re-hit the network.
- [Major Arcana collisions look arbitrary at small N] With only ~5 Gen-1 legendaries/mythicals spread across 22 Major Arcana slots, most slots will be empty in v1 and collisions are unlikely yet — this only becomes visually interesting once more generations are added. **Mitigation**: none needed for v1; document that this is expected to fill in over time, not a bug.
- [Weighted type vote produces a "wrong-feeling" suit for some dual-types] Elemental grouping is inherently a simplification of 18 types into 4 buckets. **Mitigation**: accepted as a stated trade-off in the proposal; the table can be tuned later without touching the pipeline's structure.

## Migration Plan

N/A — first change, no prior state to migrate from or roll back to. Rollback is simply not merging/deploying.

## Open Questions

None blocking v1. Deferred to future changes: whether to eventually add a `@astrojs/vercel` adapter for image optimization, and whether Major Arcana collisions should get dedicated "shared archetype" detail pages once more generations are added.
