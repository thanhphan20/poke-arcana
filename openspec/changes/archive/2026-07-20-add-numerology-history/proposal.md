## Why

Every other reading feature in Poke-Arcana (Tarot draws, Star Map natal
charts) lets a visitor revisit past readings via a browser-local History
view. Numerology has been deliberately ephemeral (compute-and-discard) up
to this point — a decision made twice, once when the feature shipped and
again when the AI weave was added — but visitors now reasonably expect the
same "come back and see it again" behavior the other two features already
have, and there's no reason numerology alone should be the one feature
that forgets everything on reload.

## What Changes

- **BREAKING** (behavioral): numerology readings are no longer
  compute-and-discard — submitting the form now auto-saves a record to
  `localStorage`, reversing the prior no-persistence decision.
- Add a new `src/lib/numerology-history.ts` store, mirroring
  `src/lib/natal-history.ts`/`src/lib/history.ts`'s exact shape (versioned
  schema, rolling 20-record retention, graceful degradation on
  read/write failure).
- Auto-save on every successful "Reveal My Numbers" submit — full name,
  birth date, and all four computed numbers — with no separate save
  button, matching Star Map's existing auto-save behavior.
- When an AI weave narrative is generated afterward, fold it into the
  already-saved record in place (provider, domain, synthesis text) rather
  than creating a second record.
- Add a third section, "My Numerology Readings", to the existing
  `/history` page, listing saved readings newest-first and letting a
  visitor open one as a static result.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `numerology`: adds auto-save-on-submit, AI-weave enrichment of the saved
  record, rolling retention, versioned storage, and browsing/revisiting
  past readings via the History page — all additive to the existing
  calculation and display behavior, which is unchanged.

## Impact

- **New**: `src/lib/numerology-history.ts` (store — list/get/save/update).
- **New**: `src/lib/numerology-render.ts` (shared render helpers for a
  saved reading's numbers/breakdown/strengths-challenges and its weave
  synthesis, used by the History detail view).
- **New**: `src/styles/numerology-reading.css` (global styles for the
  render helper's output, mirroring `natal-reading.css`).
- **Modified**: `src/components/numerology/NumerologyForm.astro` (calls
  `saveNumerologyReading` on submit, `updateNumerologyReading` on a
  successful weave).
- **Modified**: `src/pages/history/index.astro` (adds the third
  "My Numerology Readings" section and a `?numerologyId=` detail route,
  alongside the existing draws/star-charts sections).
- **Privacy note**: this is the first Poke-Arcana feature to persist a
  visitor's name in `localStorage`. It remains browser-local only (no
  server, no accounts, no network transmission beyond the existing AI
  weave call) — the same privacy footing as existing birth-date/city
  persistence, just extended to a name.
