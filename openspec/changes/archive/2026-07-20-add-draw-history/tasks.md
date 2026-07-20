## 1. Storage module

- [x] 1.1 Create `src/lib/history.ts` defining `DrawRecord` (id, v, createdAt, question, spreadSize, cards[], template, ai?) and the storage key `poke-arcana:draws:v1`
- [x] 1.2 Implement `listDraws()` — defensive parse of the single JSON key, returns `[]` on missing/malformed/unknown-version data
- [x] 1.3 Implement `getDraw(id)` — returns the matching record or `null`
- [x] 1.4 Implement `saveDraw(record)` — assigns id + timestamp, prepends, evicts to keep newest 20, wraps `setItem` in try/catch, returns id
- [x] 1.5 Implement `updateDraw(id, patch)` — merges patch into the matching record in place (used to fold in the AI reading); no-op if id not found

## 2. Shared read-only renderer

- [x] 2.1 Extract the template-reading markup from `spread-reveal.ts` into a shared render helper that takes a serializable draw and returns DOM/markup
- [x] 2.2 Extend the helper to render the AI reading block only when the draw includes AI data
- [x] 2.3 Refactor `spread-reveal.ts` to render the live reading via the shared helper and verify the live reveal is visually unchanged

## 3. Save hooks in the reveal component

- [x] 3.1 In `showReadingPanel()`, build a serializable draw from `question`/`slots`/`spreadSize` + template reading, call `saveDraw()`, and retain the returned id on the instance
- [x] 3.2 In `renderFortune()`, call `updateDraw(id, { ai })` to fold the AI reading into the current draw's record
- [x] 3.3 In `resetReading()`/`setSpread()`, clear the retained draw id so the next completion creates a fresh record

## 4. History view

- [x] 4.1 Create `src/pages/history/index.astro` — static shell with heading, empty-state copy, and a per-browser "stored only in this browser" disclaimer
- [x] 4.2 Add a client script that reads `listDraws()` and renders the list newest-first (question, date, spread size, card names), plus an empty state when there are none
- [x] 4.3 Wire selecting a draw (via `?id=` or hash) to render it as a static result using the shared renderer, showing the AI reading only when present

## 5. Navigation & verification

- [x] 5.1 Add a History link to the site navigation
- [x] 5.2 Verify end-to-end: complete a draw → appears in History; generate an AI reading → same record enriched (count unchanged); open a saved draw → static result with no animation; exceed 20 draws → oldest evicted; corrupt the key → History shows empty state
