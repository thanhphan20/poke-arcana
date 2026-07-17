## 1. Life Path Calculation Module

- [x] 1.1 Create `src/lib/arcana/numerology.ts` with a pure
      `lifePathNumber(year: number, month: number, day: number): number`
      function implementing the reduce-month/day/year-separately-then-sum
      method, halting reduction at 11, 22, or 33 at every step (component
      reduction and final sum reduction).
- [x] 1.2 Add a `digitSumReduce` helper (or equivalent) used by
      `lifePathNumber` that reduces a positive integer to a single digit
      unless it hits 11, 22, or 33 along the way.
- [x] 1.3 Add `LIFE_PATH_INTERPRETATIONS: Record<number, { title: string;
      keywords: string[]; description: string }>` covering all 12 keys (1-9,
      11, 22, 33), with static, hand-written copy for each.
- [x] 1.4 Add `getLifePathInfo(n: number)` accessor that looks up
      `LIFE_PATH_INTERPRETATIONS[n]` and throws if a value outside the valid
      set is passed (mirrors `cardNameForSign`'s throw-on-missing pattern in
      `zodiac.ts`).

## 2. Birth Date Form Component

- [x] 2.1 Create `src/components/numerology/NumerologyForm.astro` with
      month/day/year `<select>` inputs only, copying the markup/styling
      pattern from `BirthForm.astro`'s primary row (no hour/minute/city/name
      fields).
- [x] 2.2 Add the days-in-month clamping behavior (`syncDayOptions`
      equivalent) so the day select narrows/resets when the month changes,
      matching `BirthForm.astro`'s existing behavior.
- [x] 2.3 Add a client-side submit handler that calls `lifePathNumber`,
      looks up `getLifePathInfo`, and renders the number, title, keywords,
      and description into a result panel — no `fetch` call anywhere in this
      component.
- [x] 2.4 Style the result panel to match the site's existing card/reading
      visual language (gold/purple palette, Cinzel/EB Garamond fonts) used in
      `BirthForm.astro` and `StarMap.astro`.

## 3. Numerology Page

- [x] 3.1 Create `src/pages/numerology.astro` with `prerender = true`,
      using `BaseLayout`, a page title/kicker/lede matching the style of
      `star-map.astro`, and rendering `NumerologyForm`.
- [x] 3.2 Add brief on-page copy noting the calculation method (component
      reduction, not whole-date digit sum) so visitors who know a different
      convention understand why their number might differ.
- [x] 3.3 Add a nav link to `/numerology` wherever `/star-map` and
      `/reading` are currently linked (e.g. `BaseLayout.astro` or a shared
      nav component), so the new page is discoverable.

## 4. Verification

- [x] 4.1 Manually verify the master-number edge cases from the spec (a
      day of 29, and a full date whose component sum lands on 11/22/33)
      produce the expected un-reduced master number.
- [x] 4.2 Manually verify a representative spread of ordinary dates reduces
      to the correct single-digit Life Path number.
- [x] 4.3 Confirm the numerology page and form load and compute results in
      the browser with no network requests fired (per the deterministic,
      client-side-only design decision).
