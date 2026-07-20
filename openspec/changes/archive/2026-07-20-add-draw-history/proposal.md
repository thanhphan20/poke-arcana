## Why

Every tarot reading a visitor completes is lost the instant they navigate away or refresh — including the AI reading, which costs an API call and cannot be reproduced (readings are non-deterministic). Visitors have no way to revisit a draw they found meaningful. We want to preserve draws for the same visitor to revisit, without introducing accounts, a database, or any server-side state to manage — matching the project's static, zero-backend architecture.

## What Changes

- Auto-save each completed spread to the visitor's browser (`localStorage`) the moment the spread is complete — no button, nothing to manage.
- Persist the full result: the question, drawn cards (position, arcana, Pokémon), the template reading, and the AI reading **when one was generated** (folded into the saved record in place if the visitor later clicks "Read My Fortune").
- Keep a rolling window of the **20 most recent** draws, auto-evicting the oldest when full to stay within the `localStorage` quota.
- Add a **History page** where the same visitor browses past draws (question, date, spread size, card names) and opens any one as a **static result** — no animation replay.
- Add a navigation entry point to reach History.
- Records are versioned so a future schema change degrades gracefully instead of crashing on old data.

Non-goals (explicitly out of scope): cross-device sync, sharing draws with others, user accounts, and any server-side persistence.

## Capabilities

### New Capabilities
- `draw-history`: Client-side persistence and retrieval of completed tarot draws in the browser, and a read-only history view for revisiting them.

### Modified Capabilities
<!-- No existing spec's requirements change; the spread reveal gains a save hook but its own behavior contract is unchanged. -->

## Impact

- **New code**: a browser storage module (`src/lib/history.ts`), a History page (`src/pages/history/index.astro` + thin client script), and a shared read-only reading renderer extracted from the existing reveal so both the live reveal and history reuse one markup path.
- **Modified code**: `src/components/spread/spread-reveal.ts` gains save/enrich hooks at spread completion and after an AI reading renders; site navigation gains a History link.
- **Dependencies**: none added — `localStorage` only.
- **Constraints**: honors the project's Astro-markup-over-string-builder preference for the new view; persistence is per-browser only (clearing site data / incognito / another device loses history), surfaced to the visitor in the History UI.
