## Context

Two existing local-storage stores already solve this exact problem for
other features: [history.ts](../../../src/lib/history.ts) (Tarot draws)
and [natal-history.ts](../../../src/lib/natal-history.ts) (Star Map),
both consumed by the shared [history/index.astro](../../../src/pages/history/index.astro)
page as separate sections. Neither previously stored a name — natal
history stores `BirthDetails` (date/hour/minute/city). Numerology history
introduces the first stored name, decided in this session's grilling:
store it (needed to redisplay the exact reading and to label list
entries), and auto-save on submit (matching the existing pattern exactly,
rather than requiring a new opt-in step).

## Goals / Non-Goals

**Goals:**
- Reuse the established store shape exactly: versioned schema, rolling
  20-record retention cap, `newId()` via `crypto.randomUUID` with a
  fallback, try/catch around all `localStorage` access so a full or
  disabled store never breaks the reading flow.
- Auto-save immediately on a successful "Reveal My Numbers" submit, before
  any AI weave is requested — mirroring `BirthForm.astro`'s
  `saveNatalReading(...)` call.
- Fold a later AI weave result into the same record via an update call,
  never a second record — mirroring `updateNatalReading`.
- Extend the existing `/history` page with a third section rather than
  building a separate history page.

**Non-Goals:**
- No change to the calculation logic, the live form's immediate result
  display, or the AI weave request/response contract — this change is
  additive persistence only.
- No cross-device sync, accounts, or server-side storage — browser-local
  only, same as every other history store in this project.
- No retroactive saving of readings from before this change shipped —
  there is nothing to migrate since nothing was previously saved.

## Decisions

**New `numerology-history.ts`, not a shared generic store.** Mirrors
`natal-history.ts` field-for-field rather than trying to generalize a
single "reading history" abstraction across draws/natal/numerology. The
project has already chosen this per-feature-store pattern twice; a third
near-identical file keeps the pattern consistent and each store trivially
readable in isolation, rather than introducing a generic abstraction this
codebase doesn't otherwise use.

**Record shape:**
```ts
interface NumerologyReadingRecord {
  id: string;
  v: number;
  createdAt: number;
  name: string;
  birth: { year: number; month: number; day: number };
  numbers: { lifePath: number; expression: number; soulUrge: number; personality: number };
  weave?: { domain: 'career' | 'love' | 'purpose'; provider: string; synthesis: string } | null;
}
```
`birth` is a plain `{year,month,day}` rather than reusing Star Map's
`BirthDetails` (which carries hour/minute/city, irrelevant to Life Path).

**Save timing: immediately after computing all four numbers, before any
weave request.** This matches `saveNatalReading`'s call site exactly (save
first with `synthesis: null`-equivalent, i.e. `weave: null`, then
`updateNumerologyReading(id, { weave })` if the visitor requests and
receives a weave). If a visitor never requests a weave, the record is
still saved with just the four numbers — consistent with how a natal
reading is saved even if "Weave My Chart Together" is never clicked.

**Shared render helpers (`numerology-render.ts`), used only by the
History detail view.** Unlike `natal-render.ts` (which the live
`BirthForm.astro` result and the history detail view both call, since the
live result is built by constructing DOM nodes from scratch),
`NumerologyForm.astro`'s live result is static Astro markup with
`textContent` assignments — there's no DOM-construction code to share.
The render helper exists purely for the History detail view, but both it
and the live form read from the same `numerology.ts` source-of-truth
functions (`getLifePathInfo`, `getArchetypeTitle`), so the two can't drift
in content, even though the two don't literally share DOM-building code.

## Risks / Trade-offs

- **[Risk]** Storing a name is new territory for this project's privacy
  posture → **Mitigation**: already surfaced and confirmed explicitly this
  session; the `/history` page already discloses "Saved only in this
  browser," which continues to apply unchanged.
- **[Trade-off]** Auto-save with no opt-in means a visitor who enters
  someone else's name (e.g. checking a friend's numbers) has that name
  persisted in their own browser without an explicit prompt → accepted,
  since this matches the existing Star Map behavior exactly and the
  History page's "clear your data" framing already sets that expectation.
- **[Risk]** A visitor who submits many different names/dates without
  ever clearing history will accumulate entries for people other than
  themselves → **Mitigation**: the existing 20-record rolling cap already
  bounds this, same as the other two stores.
