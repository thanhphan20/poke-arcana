## Context

Poke-Arcana has two existing divination surfaces: the Tarot deck (algorithmic
Pokemon-to-card assignment, computed at build time from static Pokedex data)
and the Star Map (Western astrology — sun/moon/rising/planet signs computed
client-side from a birth-date-and-time form, with an optional AI-synthesized
narrative via `/api/natal-reading`).

Numerology is the third surface. Unlike Star Map, the only requirement in
scope (Life Path number) is a pure function of the birth date — no
ephemeris-style lookup tables, no geocoding, no name input, and no server
round-trip are needed to produce it. This mirrors the *shape* of Star Map's
client-side sign calculation (`computeSigns` in
[BirthForm.astro](../../../src/components/starmap/BirthForm.astro)) rather
than the *shape* of its AI synthesis path.

## Goals / Non-Goals

**Goals:**
- Compute a Pythagorean Life Path number (1-9, 11, 22, 33) from a birth date
  entirely client-side, with zero network calls.
- Reuse the existing month/day/year `<select>` interaction pattern from
  `BirthForm.astro`, trimmed to only those three fields.
- Present the result with static, pre-written interpretation copy for each
  of the 12 possible outcomes.
- Keep the "calculate the number" function and "look up its interpretation"
  function in separate, independently testable modules, so a future
  AI-narrative fast-follow can call the calculator and layer a synthesis
  step on top, the way `natal-reading.ts` layers synthesis on top of sign
  calculation, without changing the calculator itself.

**Non-Goals:**
- No name-based numbers (Expression/Destiny, Soul Urge, Personality) — these
  need a full-name input and a letter-to-number/vowel-consonant policy that
  is explicitly out of scope for this change.
- No Personal Year, Pinnacle, or Challenge numbers.
- No compatibility/relationship numerology.
- No Arcana-card tie-in for the Life Path result.
- No AI-synthesized narrative, no `/api/*` route, no provider chain.
- No persistence of the entered birth date or computed result across visits
  (Star Map persists birth details via `src/lib/birth.ts` for its rising-sign
  and synthesis features; numerology has no equivalent need since there's
  nothing async or expensive to avoid recomputing).

## Decisions

**Reduction algorithm — reduce month, day, and year separately, then sum
and reduce again.** Two common Life Path methods exist: (a) sum every digit
of the full date at once, or (b) reduce month/day/year to single digits (or
master numbers) independently, then add those three results and reduce the
sum. Method (b) is used here because it's the more widely-taught standard
and it's what most readers checking their own number by hand will expect to
match. At every reduction step (including the three component reductions
and the final sum), a running value of 11, 22, or 33 halts further
reduction — master numbers are never collapsed to 2, 4, or 6.

**No name field at all, not even hidden/optional.** The Life-Path-only v1
scope means a name is never read. Rather than reuse `BirthForm.astro`
wholesale (which includes hour/minute/city fields for rising-sign math that
have no meaning here), build a new, smaller form component with only
month/day/year selects, copying the select markup/styling pattern but
without the time/city/synthesis portions.

**Calculation lives in `src/lib/arcana/numerology.ts`, mirroring
`zodiac.ts`.** A pure function `lifePathNumber(year, month, day): number`
plus a static `LIFE_PATH_INTERPRETATIONS: Record<number, {title, keywords,
description}>` map and a `getLifePathInfo(n)` accessor, matching the
existing `signForDate` / `cardInfoForSign` split between "compute" and
"look up static content."

**Page is prerendered (`prerender = true`), matching `star-map.astro`.**
The page itself is static; only the form's submit handler runs client-side,
same as Star Map.

## Risks / Trade-offs

- **[Risk]** Two different Life Path reduction conventions exist in the
  wild; a visitor familiar with the single-digit-sum method could get a
  number that doesn't match this tool → **Mitigation**: document the method
  briefly in the page copy (e.g., "Life Path, calculated the traditional
  way: month, day, and year reduced separately, then combined") so the
  discrepancy is explained rather than silent.
- **[Risk]** Master-number handling is the most common source of bugs in
  hand-rolled Life Path calculators (e.g., collapsing 29 → 11 → stopping,
  vs. continuing to 2) → **Mitigation**: the spec's scenarios enumerate the
  master-number edge cases explicitly so they're covered by tests, not left
  to implementation judgment.
- **[Trade-off]** Not persisting the entered date means a visitor who
  navigates away loses their result and must re-enter their birth date —
  acceptable since there's no expensive recomputation or API call being
  saved by persisting it, unlike Star Map's synthesis result.
