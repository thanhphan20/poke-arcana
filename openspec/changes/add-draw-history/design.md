## Context

Poke-Arcana is a static Astro 7 site with no SSR, no database, and no auth. The draw/reveal UI is a single vanilla-TS Web Component (`src/components/spread/spread-reveal.ts`). Readings come in two layers: a free, deterministic **template reading** (`buildReadingPanel`) rendered on spread completion, and an optional **AI reading** (`renderFortune`) fetched from `POST /api/reading` when the visitor clicks "Read My Fortune". The AI reading is non-deterministic and costs an API call, so it cannot be regenerated identically — it must be captured, not recomputed.

At reveal time the component already holds everything needed to persist a draw: `this.question`, `this.slots` (position, arcana kind/name, drawn member name/slug/flavor), `this.spreadSize`, and the AI payload passed to `renderFortune(data)`. No new network calls or server state are required.

## Goals / Non-Goals

**Goals:**
- Persist completed draws per-browser with zero backend and nothing for the visitor to manage.
- Preserve the valuable AI reading across refreshes when one was generated.
- Provide a read-only History view to revisit past draws as static results.
- Reuse one reading-render path so live reveal and history stay visually identical and don't drift.
- Honor the project's preference for `.astro` markup over `.ts` string-builders in the new view.

**Non-Goals:**
- Cross-device sync, sharing links, accounts, or any server-side persistence.
- Replaying the draw/shuffle/flip animation from a saved draw.
- Editing or annotating saved draws.

## Decisions

**1. Storage: single `localStorage` key holding a JSON array, versioned.**
One key (e.g. `poke-arcana:draws:v1`) stores `{ v: 1, draws: DrawRecord[] }`. A single key makes list/upsert/evict trivial and keeps the ~5MB budget easy to reason about (20 records of a few KB each is well under quota). Alternative — one key per draw — was rejected: it complicates enumeration and eviction for no benefit at this scale. The `v` tag lets a future format bump be detected and old/foreign data discarded rather than crashing.

**2. Persistence module `src/lib/history.ts` with a narrow API.** `saveDraw(record) -> id`, `updateDraw(id, patch)`, `listDraws()`, `getDraw(id)`. All reads defensively parse and return `[]`/`null` on any error; all writes are wrapped in try/catch so a quota or private-mode failure never breaks the reveal. Eviction (keep newest 20) happens inside `saveDraw`. Keeping storage logic out of the Web Component keeps the component focused and the storage unit-testable.

**3. Save timing: upsert keyed by a per-session draw id.** `saveDraw` is called from `showReadingPanel()` (spread complete) and returns/stores an id the component keeps for the current draw. `renderFortune()` then calls `updateDraw(id, { ai })` to fold the AI reading into the same record — never a second record. Resetting/starting a new spread clears the held id so the next completion creates a fresh record.

**4. Shared read-only renderer.** Extract the reading-panel markup currently private to `spread-reveal.ts` into a shared function that takes a plain serializable draw and returns the DOM/markup for the template reading (and, if present, the AI reading). The live component and the History detail both call it. This is the anti-drift decision and directly serves the "static result matches the live result" requirement. Because the extracted renderer must run against arbitrary saved data on the client, it stays a small TS render helper; the History **page shell** is `.astro`.

**5. History view is an `.astro` page + thin client script.** `src/pages/history/index.astro` provides the static shell, empty-state copy, and the per-browser disclaimer; a small client script reads `listDraws()` and renders the list, and opens a selected draw via the shared renderer. `localStorage` is client-only, so the list is necessarily hydrated on the client — the `.astro` shell keeps markup declarative and JS minimal, matching project convention. Draw selection uses a query param or hash (e.g. `?id=...`) so a specific draw is linkable within the same browser.

## Risks / Trade-offs

- **Per-browser only** → Inherent to the no-database constraint. Mitigation: state it plainly in the History UI so a wiped/incognito/other-device history is expected, not a bug.
- **Schema drift breaking old records** → Mitigation: the `v` tag; unrecognized versions are treated as empty history rather than parsed.
- **Quota exhaustion** → Mitigation: hard cap of 20 with oldest-eviction, plus try/catch so even an unexpected write failure is silent to the visitor.
- **Renderer extraction regressing the live reveal** → Mitigation: the live component calls the exact same extracted function; verify the live reveal is visually unchanged after refactor before adding the history path.
- **Sensitive question text stored in plaintext** → Accepted: it lives only in the visitor's own browser, is never transmitted or shared, and the visitor chose to include it.

## Migration Plan

Additive only — no existing data or specs change. Ship the storage module and save hooks first (safe no-op if reads fail), then the shared renderer refactor (verify live reveal parity), then the History page and nav link. Rollback is removing the new files, the two hook calls, and the nav link; no stored data migration is needed since the feature is self-contained.
