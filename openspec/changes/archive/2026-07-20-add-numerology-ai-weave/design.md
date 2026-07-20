## Context

Change A gave Life Path two static angles (Strengths/Challenges) and a
visible calculation breakdown, but it's still one deterministic bucket out
of 12 possible values — any AI narrative keyed on it alone would be
identical for every visitor sharing that number. Star Map's "Weave My
Chart Together" AI synthesis only produces genuinely per-visitor output
because it combines up to 11 distinct chart points
([BirthForm.astro](../../../src/components/starmap/BirthForm.astro),
[natal-reading.ts](../../../src/pages/api/natal-reading.ts)). This change
gives Numerology the same kind of multi-signal input — three more
Pythagorean numbers derived from the birth name — so a weave narrative has
actual combinatorics behind it (12^4 = 20,736 possible number
combinations) rather than reading as a fancier static blurb.

## Goals / Non-Goals

**Goals:**
- Compute Expression, Soul Urge, and Personality numbers from a full birth
  name, using the standard Pythagorean letter table and the same
  component-reduce-then-sum pattern already established for Life Path.
- Give the AI weave real per-visitor variety by feeding it all four
  numbers plus a chosen domain.
- Reuse the natal-reading provider-chain architecture exactly (same
  adapters, same retry/backoff, same `ProviderChainExhausted` failure
  contract) rather than inventing a second pattern.
- Keep the three new numbers' static display minimal (number + archetype
  title) so the depth genuinely comes from the weave, not from another
  round of hand-written per-number prose.

**Non-Goals:**
- No Strengths/Challenges copy for Expression/Soul Urge/Personality.
- No persistence of the name or any computed number.
- No multi-select domains — exactly one of Career/Love/Life Purpose is
  active at a time.
- No Personal Year/Pinnacle/Challenge numbers, no compatibility
  numerology, no Arcana-card tie-in.

## Decisions

**Letter table and vowel/consonant split.** Standard Pythagorean table:
A/J/S=1, B/K/T=2, C/L/U=3, D/M/V=4, E/N/W=5, F/O/X=6, G/P/Y=7, H/Q/Z=8,
I/R=9. Vowels are exactly A, E, I, O, U — Y is always treated as a
consonant (the traditional "Y is sometimes a vowel" rule requires
syllable-level judgment calls that would need per-name heuristics; a flat
rule keeps every calculation reproducible and explainable).

**Per-name-part reduction, mirroring `lifePathNumber`.** Each of
Expression/Soul Urge/Personality reduces the *sum of applicable letter
values within each whitespace-separated name part* independently (digit-
sum reduction, holding at 11/22/33), then sums those per-part reduced
values and reduces the total the same way. This is structurally identical
to how `lifePathNumber` reduces month/day/year separately before summing
— one mental model for "how Poke-Arcana reduces numerology numbers,"
reused across every number type. Hyphens and apostrophes within a word are
stripped before scoring (so "O'Brien" and "Mary-Jane" score as
"OBRIEN"/"MARYJANE" rather than splitting into extra parts).

**Name normalization: NFD-strip, then drop non-Latin remainder.** Input is
run through `.normalize('NFD')`, combining marks (accents) are stripped
via a regex, then anything still outside A-Z (case-insensitive) is
removed. If a name part becomes empty after this (e.g. entirely CJK/
Cyrillic input), and EVERY part is empty, the form shows an inline
validation error and blocks submission — this is a client-side check
before any calculation runs, not a calculation-time throw.

**Shared archetype-title table, not four separate title sets.** A single
`NUMBER_ARCHETYPE_TITLES: Record<number, string>` (1-9, 11, 22, 33) — e.g.
`1: 'The Leader'` — is extracted and reused by Life Path, Expression, Soul
Urge, and Personality alike, since a number's archetypal meaning is
traditionally constant regardless of which calculation produced it.
`LIFE_PATH_INTERPRETATIONS`'s `title` field is removed in favor of looking
this table up by the computed number; `strengths`/`challenges` stay
Life-Path-specific (unchanged) since those remain the deep content this
change deliberately does not duplicate for the other three numbers.

**New `/api/numerology-reading` mirrors `/api/natal-reading` exactly.**
Same `export const config = { runtime: 'edge' }`, same
validate-body/build-prompt/call-chain/catch-`ProviderChainExhausted`-503
shape. A new `src/lib/ai/numerology/` module directory
(`schema.ts`, `prompt.ts`, `chain.ts`, `validate.ts`) mirrors
`src/lib/ai/natal/`'s four-file split file-for-file, reusing the shared
provider adapters (`src/lib/ai/providers/*`) and chain primitives
(`src/lib/ai/chain.ts`, `src/lib/ai/types.ts`) rather than duplicating
them. The request body is `{ numbers: { lifePath, expression, soulUrge,
personality }, domain: 'career' | 'love' | 'purpose' }`; the response
shape is `{ provider, synthesis }`, identical to natal-reading's.

**Domain selection arms the button; it doesn't call the API by itself.**
Clicking a domain chip only updates which domain will be sent — exactly
one active at a time (radio semantics, not checkboxes) — matching the
existing UX pattern where BirthForm computes signs immediately but the
synthesis call only fires on an explicit button press.

## Risks / Trade-offs

- **[Risk]** A visitor entering a name with no Latin-mappable characters
  gets blocked entirely from the new numbers → **Mitigation**: the error
  is scoped to the name field only; nothing prevents them from still using
  Life Path alone (Change A's flow is untouched).
- **[Risk]** Flattening Y to always-consonant will disagree with numerology
  guides that treat Y as a vowel in names like "Lynn" → **Mitigation**:
  the page copy already documents the calculation method (per Change A's
  precedent); this can note the Y-is-consonant rule explicitly so the
  discrepancy is explained, not silent.
- **[Trade-off]** Removing `title` from `LIFE_PATH_INTERPRETATIONS` in
  favor of the shared table is a breaking change to that exported shape,
  but it has a single internal consumer (`NumerologyForm.astro`), updated
  in the same change.
- **[Risk]** A fourth AI-narrative surface (after reading, natal, and now
  numerology) means a third near-identical provider-chain module to
  maintain → **Mitigation**: this design deliberately copies natal's
  structure file-for-file rather than inventing something new, so there is
  exactly one pattern to understand across all three, not three different
  ones.
