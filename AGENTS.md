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

Recent completed changes (see their `proposal.md` and `design.md` for full context):
- `openspec/changes/rws-arcana-art/` — Rider-Waite-Smith art on revealed cards and detail pages
- `openspec/changes/ai-tarot-reading/` — Multi-provider LLM interpretation with automatic fallback
- `openspec/changes/add-draw-history/` — Browser-local storage of past 20 draws with history page

The initial build is `openspec/changes/initial-build/` — read its `proposal.md`, `design.md`, and `specs/*/spec.md` for context on the core architecture (data pipeline, arcana assignment, deck pages, reading mechanics).

## Conventions

- **Package manager: Bun.** Use `bun install` / `bun run dev` / `bun run build` / `bun run sync`, not npm/yarn/pnpm.
- **No comments unless they explain a non-obvious constraint** (a hidden invariant, a workaround, a "why", not a "what").
- **kebab-case** for file and directory names.
- **Arcana assignment is deterministic, never hand-curated.** If a change proposes altering the algorithm (hash function, type→suit table, rank formula), it must go through `openspec/changes/` like any other spec change — don't quietly hardcode exceptions per-Pokemon.
- **The PokeAPI sync script is the only thing that touches the network at build time.** `astro build` must never make network calls; if a change seems to require that, reconsider the design. **Exception:** The `/api/reading` endpoint (on Vercel Edge) makes runtime calls to LLM providers as the sole server-side code in the stack.
- **Prefer vanilla JS/Web Components over framework islands** for self-contained interactive widgets (see `card-reading` capability) — only reach for React/Svelte/Vue if a widget genuinely needs cross-component reactivity or shared state.
- **Rider-Waite-Smith art is committed to `public/tarot/`** and served same-origin. Download script (`scripts/download-tarot-images.ts`) is manual, not part of the build. Use `tarotArtUrl(arcana)` helper in `src/lib/sprites.ts` to derive URLs.
- **Browser history uses `localStorage`** with schema versioning. See `src/lib/history.ts` for the persistence module and version-check fallback for graceful schema migration.

## API Keys & LLM Providers

The `/api/reading` endpoint chains Gemini (primary) → Groq (fallback) → OpenRouter (final fallback) with automatic 429 rate-limit rotation and exponential backoff. Each provider key is optional; set any of `GEMINI_API_KEY`, `GROQ_API_KEY`, or `OPENROUTER_API_KEY` in `.env` (local) or Vercel project settings. Without any key, the `/reading` page still works and falls back to template-based prose.

## Verification

Before considering a change done, follow the verification steps in the relevant change's `tasks.md` (data pipeline record counts/spot-checks, dev-server visual checks, browser interaction checks, `bun run build` with no network calls). For UI changes, actually drive the page in a browser — don't rely on typecheck/build success alone. For server changes, test the Edge route in preview mode with at least one API key set.
