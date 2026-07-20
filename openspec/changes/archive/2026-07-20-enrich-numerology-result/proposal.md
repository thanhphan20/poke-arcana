## Why

The Numerology result currently shows only one flat "description" paragraph
per Life Path number, which reads as vague next to the Tarot feature — each
Tarot card shows keywords, a core meaning, AND a separate Upright vs.
Reversed split. Numerology needs a comparable second angle, and the
calculation itself is currently a black box (a visitor sees only the final
number, with no way to see how their birth date produced it). Both are
small, deterministic, no-new-risk fixes that should ship before the larger
AI-driven follow-up (name-based numbers + AI-synthesized narrative) that
was scoped separately in this session's grilling.

## What Changes

- Add a Strengths vs. Challenges split to each of the 12
  `LIFE_PATH_INTERPRETATIONS` entries (1-9, 11, 22, 33), replacing the
  single flat `description` field with two distinct labeled angles —
  mirroring the structural shape of Tarot's Upright/Reversed split, not its
  literal reversed-card meaning.
- Add a visible calculation breakdown to the result panel showing how the
  Life Path number was derived from the submitted birth date (reduced
  month, reduced day, reduced year, their sum, and any further reduction
  steps), including surfacing when a component held at a master number
  (11/22/33) instead of reducing further.
- Result stays a single panel — no two-column Tarot-style layout.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `numerology`: the "Life Path Interpretation Content" requirement changes
  from a single description field to a Strengths/Challenges split; a new
  requirement is added for showing the calculation breakdown in the result
  display.

## Impact

- **Modified**: `src/lib/arcana/numerology.ts` (`LIFE_PATH_INTERPRETATIONS`
  shape changes from `{title, keywords, description}` to `{title, keywords,
  strengths, challenges}`; `lifePathNumber` gains a variant or companion
  that also returns the intermediate reduction values needed for display).
- **Modified**: `src/components/numerology/NumerologyForm.astro` (result
  panel rendering updates to show Strengths/Challenges and the breakdown).
- **No changes** to the birth date form's fields, the page route, or any
  API/network behavior — this remains fully client-side and stateless.
- **Out of scope** (deferred to the separate "Change B" follow-up): full
  name input, Expression/Soul Urge/Personality numbers, a domain selector,
  AI-generated narrative, any new API route, and persistence.
