## 1. Storage Module

- [x] 1.1 Create `src/lib/numerology-history.ts` mirroring
      `src/lib/natal-history.ts`'s exact shape: `STORAGE_KEY =
      'poke-arcana:numerology:v1'`, `SCHEMA_VERSION = 1`, `MAX_READINGS =
      20`, `newId()` (crypto.randomUUID with fallback), try/catch
      `readStore`/`writeStore`.
- [x] 1.2 Define `NumerologyReadingRecord { id, v, createdAt, name,
      birth: {year,month,day}, numbers: {lifePath,expression,soulUrge,
      personality}, weave?: {domain,provider,synthesis} | null }` and
      `NewNumerologyReading = Omit<NumerologyReadingRecord, 'id'|'v'|'createdAt'>`.
- [x] 1.3 Add `listNumerologyReadings()`, `getNumerologyReading(id)`,
      `saveNumerologyReading(reading: NewNumerologyReading): string`
      (prepends, evicts beyond `MAX_READINGS`), and
      `updateNumerologyReading(id, patch)` (merges a patch in place,
      preserving id/v/createdAt) — mirroring `natal-history.ts`'s four
      exports exactly.

## 2. Wire Auto-Save Into the Form

- [x] 2.1 In `NumerologyForm.astro`'s submit handler, after computing all
      four numbers (Life Path, Expression, Soul Urge, Personality), call
      `saveNumerologyReading({ name: fullName, birth: {year,month,day},
      numbers: {...}, weave: null })` and store the returned id in a
      `currentReadingId` variable scoped to the component's script.
- [x] 2.2 In `requestWeave()`, on a successful response, call
      `updateNumerologyReading(currentReadingId, { weave: { domain:
      selectedDomain, provider: data.provider, synthesis: data.synthesis
      } })` alongside the existing UI update.
- [x] 2.3 Reset `currentReadingId` to `null` at the start of each new
      form submission (before the new save), so a weave response can
      never be misattributed to a previous reading.

## 3. Shared Render Helpers

- [x] 3.1 Create `src/lib/numerology-render.ts` with
      `renderNumerologyReading(record: NumerologyReadingRecord):
      HTMLElement` building the number/title/keywords/strengths/
      challenges/breakdown content for Life Path plus number+title-only
      blocks for Expression/Soul Urge/Personality, using
      `getLifePathInfo`/`getArchetypeTitle`/`lifePathBreakdown` from
      `numerology.ts` as the source of truth (no duplicated content).
- [x] 3.2 Add `renderNumerologyWeave(weave: {domain,provider,synthesis}):
      HTMLElement` rendering the synthesis text, domain, and "✦ read by
      {provider} ✦" attribution, mirroring `renderNatalSynthesis`.
- [x] 3.3 Create `src/styles/numerology-reading.css` with the
      `.numerology-reading__*` global classes consumed by the render
      helpers, mirroring `natal-reading.css`'s structure and the site's
      gold/purple Cinzel/EB Garamond visual language.

## 4. History Page Integration

- [x] 4.1 In `src/pages/history/index.astro`, import
      `listNumerologyReadings`, `getNumerologyReading`, and the render
      helpers, plus the new stylesheet.
- [x] 4.2 Add a third `<template data-empty-numerology>` empty state
      (inviting the visitor to try `/numerology`), and add a
      "My Numerology Readings" section to `renderOverview`, listing
      readings via a `buildNumerologyList` helper (mirroring
      `buildDrawsList`/`buildNatalList`) showing name, birth date, and
      Life Path number, linking to `/history/?numerologyId={id}`.
- [x] 4.3 Add `renderNumerologyDetail(id, root, emptyTpl)` (mirroring
      `renderNatalDetail`) that looks up the record, shows a back link,
      header (name + birth date + saved-date), the rendered reading via
      `renderNumerologyReading`, and the weave panel via
      `renderNumerologyWeave` when present.
- [x] 4.4 Wire the `numerologyId` query param into the existing
      `id`/`natalId` dispatch logic at the top of the page script.

## 5. Verification

- [x] 5.1 Manually verify submitting the numerology form immediately
      creates a `localStorage` entry under `poke-arcana:numerology:v1`
      containing the name, birth date, and all four numbers. Verified:
      "José García" / June 29 1990 saved with lifePath 9, expression 7,
      soulUrge 22, personality 3, weave null.
- [x] 5.2 Manually verify requesting a weave narrative updates the same
      record (same id, same total count) rather than creating a new one.
      Verified: count stayed at 1, weave field populated with domain
      "love", provider "gemini", and the synthesis text in place.
- [x] 5.3 Manually verify `/history` shows a "My Numerology Readings"
      section listing the saved reading, and that opening it renders the
      full static result including the weave narrative if one was saved.
      Verified: list entry showed name/date/Life Path/AI badge; detail
      view rendered the full breakdown, strengths/challenges, all three
      extra numbers, and the woven synthesis with provider attribution.
- [x] 5.4 Manually verify the empty state renders when no numerology
      readings are saved (e.g. in a fresh browser profile / after clearing
      `localStorage`). Verified: "You have no saved numerology readings
      yet." + "Find Your Numbers" CTA.
- [x] 5.5 Manually verify saving 21 readings evicts the oldest, leaving
      exactly 20. Verified: seeded 20 records, submitted a 21st via the
      real UI, final count was 20 with the newest present and the oldest
      seed evicted.
