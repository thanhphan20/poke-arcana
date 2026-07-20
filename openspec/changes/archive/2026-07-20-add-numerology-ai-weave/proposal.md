## Why

Life Path alone (from Change A) is a single deterministic bucket shared by
roughly 1 in 12 visitors — any AI narrative built on it alone would be
identical for everyone with the same number, which isn't real
personalization. This change adds three name-based Pythagorean numbers
(Expression, Soul Urge, Personality) so there's actually enough distinct
signal per visitor to make an AI-synthesized "weave" narrative meaningful,
the same way Star Map's synthesis only works because it combines multiple
distinct chart points rather than one.

## What Changes

- Add a full birth name input to the numerology form.
- Compute three new Pythagorean numbers from that name — Expression
  (all letters), Soul Urge (vowels only), Personality (consonants only) —
  alongside the existing Life Path number.
- Display each new number with its number + archetype title only (no new
  Strengths/Challenges copy — that depth is reserved for the AI weave).
- Add a single-select domain chip row (Career / Love / Life Purpose).
- Add a "Weave My Numbers Together" button that POSTs the four numbers and
  the selected domain to a new `/api/numerology-reading` endpoint, which
  returns an AI-synthesized narrative — mirroring the existing
  `/api/natal-reading` provider-chain pattern exactly.
- No persistence of the name or any computed number — compute-and-discard,
  unchanged from the original numerology decision.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `numerology`: adds a name input requirement, three new number
  calculations, a domain selector, and an AI-synthesized weave narrative
  requirement — all additive to the existing Life Path behavior, which is
  unchanged.

## Impact

- **Modified**: `src/components/numerology/NumerologyForm.astro` (name
  input, three new number displays, domain chips, weave button/panel).
- **Modified**: `src/lib/arcana/numerology.ts` (adds Expression/Soul
  Urge/Personality calculation functions and a shared archetype-title
  table; Life Path's existing title now sources from that shared table).
- **New**: `src/pages/api/numerology-reading.ts` (edge API route).
- **New**: `src/lib/ai/numerology/{prompt,chain,schema,validate}.ts`
  (mirrors `src/lib/ai/natal/`'s structure and reuses the same provider
  adapters and `ProviderChainExhausted` error from `src/lib/ai/types.ts`
  and `src/lib/ai/chain.ts`).
- **No changes** to Life Path's existing calculation, Strengths/Challenges
  content, or calculation breakdown display (Change A) — those remain
  exactly as shipped.
- **Out of scope**: Personal Year/Pinnacle/Challenge numbers,
  compatibility/relationship numerology, an Arcana-card tie-in, any
  persistence of numerology data, and multi-select domains.
