## Why

Poke-Arcana currently offers two divination surfaces — the Tarot deck and the
Star Map (Western astrology) — but no numerology reading. Numerology is a
natural third pillar: unlike the astrology feature, a Life Path number needs
only a birth date and pure arithmetic, so it can ship as a small, fully
deterministic feature with no AI provider dependency, no new PII collection,
and no build-time data sync.

## What Changes

- Add a new `/numerology` page (prerendered, sibling to `/star-map` and
  `/reading`) where a visitor enters their birth date and receives their
  Life Path number (1-9, 11, 22, or 33) plus a static interpretation.
- Add a Pythagorean Life Path calculation module: reduce a birth date's
  digits via digit-sum reduction, halting early at master numbers 11, 22,
  and 33 per standard numerology rules.
- Add a date-only birth-date input component, following the existing
  `BirthForm.astro` interaction pattern but collecting only a date (no
  time, no place, no name).
- Add static interpretation copy for all 12 possible Life Path results.
- No API route and no AI synthesis chain in v1 — the calculation runs
  client/build-side as plain arithmetic. The module boundary between
  "compute the number" and "render an interpretation" is kept separate so
  an AI-narrative fast-follow (mirroring the Star Map natal-reading
  pattern) can be added later without reworking the calculator.

## Capabilities

### New Capabilities
- `numerology`: Deterministic Pythagorean Life Path number calculation
  from a birth date, a date-only input form, and static per-number
  interpretation content, surfaced on a new `/numerology` page.

### Modified Capabilities
(none — this change is additive and does not alter existing Tarot or Star
Map behavior)

## Impact

- **New files**: a `/numerology` Astro page, a birth-date-only form
  component, a Life Path calculation module (plain TypeScript, no
  framework), and an interpretation content module/table.
- **No changes** to existing Tarot deck, Star Map, or natal-reading API
  code — this is purely additive.
- **No new dependencies**: no AI provider, no external API, no database.
- **Out of scope for this change** (explicitly deferred, not silently
  dropped): name-based numbers (Expression/Destiny, Soul Urge,
  Personality), Personal Year/Pinnacle/Challenge numbers,
  compatibility/relationship numerology, an Arcana-card tie-in for
  numerology results, AI-synthesized narrative readings, and any
  history/persistence of results.
