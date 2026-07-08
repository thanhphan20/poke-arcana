# Agent Instructions — Poke-Arcana

## What this project is

See [`spec.md`](./spec.md) for the project summary. It's a tarot-deck site built on Pokemon data, using Astro + Bun + Tailwind v4, deployed static to Vercel.

## Spec-driven workflow (OpenSpec)

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven development. Slash commands are installed under `.claude/commands/opsx/`:

- `/opsx:explore` — think through an idea before committing to a change
- `/opsx:propose "<idea>"` — create a new change (proposal + design + specs + tasks)
- `/opsx:apply` — implement a proposed change's tasks
- `/opsx:archive` — archive a completed change, folding its specs into `openspec/specs/`

Before implementing any new feature or behavior change, check `openspec/changes/` for an in-flight change and `openspec/specs/` for existing capability specs. Prefer proposing a change over jumping straight to code for anything beyond a trivial fix — the whole point is agreeing on requirements before writing code.

The current build is `openspec/changes/initial-build/` — read its `proposal.md`, `design.md`, and `specs/*/spec.md` before touching any of the areas they cover (data pipeline, arcana assignment, deck pages, reading page).

## Conventions

- **Package manager: Bun.** Use `bun install` / `bun run dev` / `bun run build` / `bun run sync`, not npm/yarn/pnpm.
- **No comments unless they explain a non-obvious constraint** (a hidden invariant, a workaround, a "why", not a "what").
- **kebab-case** for file and directory names.
- **Arcana assignment is deterministic, never hand-curated.** If a change proposes altering the algorithm (hash function, type→suit table, rank formula), it must go through `openspec/changes/` like any other spec change — don't quietly hardcode exceptions per-Pokemon.
- **The PokeAPI sync script is the only thing that touches the network.** `astro build` must never make network calls; if a change seems to require that, reconsider the design (see `design.md`'s rationale for why this project rejected a live Content Layer loader).
- **Prefer vanilla JS/Web Components over framework islands** for self-contained interactive widgets (see `card-reading` capability) — only reach for React/Svelte/Vue if a widget genuinely needs cross-component reactivity or shared state.

## Verification

Before considering a change done, follow the verification steps in the relevant change's `tasks.md` (data pipeline record counts/spot-checks, dev-server visual checks, browser interaction checks, `bun run build` with no network calls). For UI changes, actually drive the page in a browser — don't rely on typecheck/build success alone.
