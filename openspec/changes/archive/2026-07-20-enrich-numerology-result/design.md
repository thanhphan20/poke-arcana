## Context

The Numerology result panel ([NumerologyForm.astro](../../../src/components/numerology/NumerologyForm.astro))
currently renders a number, a title, three keywords, and one flat
`description` paragraph pulled from
[numerology.ts](../../../src/lib/arcana/numerology.ts)'s
`LIFE_PATH_INTERPRETATIONS`. Tarot's card detail page shows the same kind
of content across two axes (Upright/Reversed) plus an always-visible
attributes row, which is why the numerology result reads as thinner by
comparison. This change adds a second axis to the static content and makes
the arithmetic that produced the number visible, without touching the form,
the page route, or introducing any network call — the entire feature
remains a pure client-side computation.

## Goals / Non-Goals

**Goals:**
- Give each of the 12 Life Path results two distinct labeled angles
  (Strengths / Challenges) instead of one paragraph.
- Show the actual reduction arithmetic (component values, the sum, and any
  further reduction) in the result panel, so the final number is
  verifiable rather than asserted.
- Keep the change confined to content data, the calculation module's
  return shape, and the result panel's rendering.

**Non-Goals:**
- No new inputs (name, time, place) — birth date (month/day/year) remains
  the only input.
- No layout change to a two-column/Tarot-style page — single panel stays.
- No AI narrative, no new API route, no persistence — all deferred to the
  separate follow-up change scoped for name-based numbers.

## Decisions

**Replace `description` with `strengths` and `challenges` string fields.**
Rather than keep `description` and add two more fields (which would leave
three blocks of prose, one of them redundant with the other two), each of
the 12 `LIFE_PATH_INTERPRETATIONS` entries drops `description` in favor of
`strengths: string` and `challenges: string`. This mirrors the *shape* of
Tarot's `uprightMeaning`/`reversedMeaning` split (two distinct angles) —
not its semantics; a Life Path number doesn't reverse, so "Challenges" is
framed as the shadow side of that same number rather than an opposite
reading.

**Expose the reduction breakdown via a new `lifePathBreakdown` function
rather than overloading `lifePathNumber`.** `lifePathNumber` stays a plain
`(year, month, day) => number` — used wherever only the final number
matters. A new `lifePathBreakdown(year, month, day)` returns:
```
{
  reducedMonth: number; reducedDay: number; reducedYear: number;
  componentSum: number; // reducedMonth + reducedDay + reducedYear
  finalNumber: number;  // digitSumReduce(componentSum)
  sumWasReduced: boolean; // true if componentSum > 9 and finalNumber !== componentSum
}
```
Both functions are built on the same underlying `digitSumReduce` helper,
so there's no duplicated reduction logic — `lifePathBreakdown` simply
returns the intermediate values `lifePathNumber` currently discards.

**Breakdown display format: `"{month} + {day} + {year} → {componentSum}"`,
with a second `"→ {finalNumber}"` line only when `sumWasReduced`.** E.g. for
June 29 1990: `"6 + 11 + 1 → 18"` then `"→ 9"`. For a date whose component
sum is already ≤9 or already a master number, only the first line shows
(no redundant `"→ 9 → 9"`). This directly answers the "show the math"
requirement without requiring the visitor to know which components were
already-reduced vs. further-reduced — the numbers shown are always the
post-component-reduction values, so a `29` day appearing as `11` in the
breakdown itself communicates that a master number was held.

## Risks / Trade-offs

- **[Risk]** Changing `LIFE_PATH_INTERPRETATIONS`'s shape is a breaking
  change to that exported type → **Mitigation**: it's an internal module
  with a single consumer (`NumerologyForm.astro`), both updated in the same
  change; no external API surface exists for this data.
- **[Trade-off]** Writing Strengths/Challenges copy for all 12 values
  (instead of editing 12 existing paragraphs) is more copywriting than a
  minimal fix, but is what actually resolves "only one angle" — a longer
  single paragraph would not.
