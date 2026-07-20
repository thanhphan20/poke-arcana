## 1. Calculation Module Updates

- [x] 1.1 In `src/lib/arcana/numerology.ts`, change the `LifePathInfo`
      interface from `{ title, keywords, description }` to `{ title,
      keywords, strengths, challenges }`.
- [x] 1.2 Rewrite all 12 entries in `LIFE_PATH_INTERPRETATIONS` (1-9, 11,
      22, 33) with distinct `strengths` and `challenges` copy per number,
      replacing the existing single `description` paragraph for each.
- [x] 1.3 Add `lifePathBreakdown(year: number, month: number, day: number)`
      returning `{ reducedMonth, reducedDay, reducedYear, componentSum,
      finalNumber, sumWasReduced }`, built on the existing `digitSumReduce`
      helper (no duplicated reduction logic). `lifePathNumber` itself stays
      unchanged in signature and behavior.

## 2. Result Panel Updates

- [x] 2.1 In `src/components/numerology/NumerologyForm.astro`'s submit
      handler, call `lifePathBreakdown` alongside the existing
      `lifePathNumber`/`getLifePathInfo` calls.
- [x] 2.2 Replace the single description paragraph in the result markup
      with two labeled sections, "Strengths" and "Challenges", rendering
      `info.strengths` and `info.challenges` respectively.
- [x] 2.3 Add a calculation breakdown line to the result markup: always
      show `"{reducedMonth} + {reducedDay} + {reducedYear} → {componentSum}"`;
      additionally show `"→ {finalNumber}"` only when `sumWasReduced` is
      true.
- [x] 2.4 Style the Strengths/Challenges sections and breakdown line to
      match the existing result panel's visual language (gold/purple
      palette, Cinzel/EB Garamond fonts), keeping the panel single-column.

## 3. Verification

- [x] 3.1 Manually verify a date whose component sum needs no further
      reduction (January 1 2001 → "1 + 1 + 3 → 5") shows only the single
      breakdown line, with no redundant further-reduction arrow.
- [x] 3.2 Manually verify a date whose component sum needs further
      reduction (June 29 1990 → "6 + 11 + 1 → 18 → 9") shows both the
      component-sum line and the further-reduced final line, and that the
      day's master number (11) is visible in the breakdown rather than
      collapsed to 2.
- [x] 3.3 Manually verify a date whose final sum is itself a master number
      (September 13 1998 → "9 + 4 + 9 → 22") displays correctly with no
      further reduction line beyond the master-number sum.
- [x] 3.4 Confirm Strengths and Challenges sections render for all 12
      possible Life Path values with no missing content (spot-checked 4, 5,
      9, 11, 22, 33 in-browser; also confirmed a reduced-year master number
      — 1993 → 22 — displays correctly: "9 + 2 + 22 → 33"), and that no
      network requests fire on submit.
