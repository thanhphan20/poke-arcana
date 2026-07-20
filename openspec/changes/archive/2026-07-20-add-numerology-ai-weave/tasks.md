## 1. Shared Archetype Titles & Name Normalization

- [x] 1.1 In `src/lib/arcana/numerology.ts`, extract
      `NUMBER_ARCHETYPE_TITLES: Record<number, string>` (1-9, 11, 22, 33)
      from the existing `LIFE_PATH_INTERPRETATIONS` titles, and remove the
      `title` field from `LifePathInfo`/`LIFE_PATH_INTERPRETATIONS` in
      favor of looking titles up from this shared table by number.
- [x] 1.2 Update `NumerologyForm.astro`'s result rendering to source the
      Life Path title from `NUMBER_ARCHETYPE_TITLES` instead of
      `info.title`.
- [x] 1.3 Add a name-normalization helper (e.g. `normalizeNamePart`) that
      applies `.normalize('NFD')`, strips combining-mark diacritics via
      regex, uppercases, and removes any remaining non-A-Z characters
      (also stripping hyphens/apostrophes within a word).
- [x] 1.4 Add a `PYTHAGOREAN_LETTER_VALUES: Record<string, number>` table
      (A/J/S=1 ... I/R=9) and `VOWELS = new Set(['A','E','I','O','U'])`
      (Y excluded, always a consonant).

## 2. Name-Based Number Calculations

- [x] 2.1 Add a generic `reduceNameNumber(nameParts: string[], letterFilter:
      (letter: string) => boolean): number` that, per name part, sums the
      Pythagorean values of letters passing `letterFilter`, reduces each
      part's sum via `digitSumReduce`, then sums and reduces the parts the
      same way `lifePathNumber` sums and reduces month/day/year.
- [x] 2.2 Add `expressionNumber(fullName: string): number` (letterFilter:
      all letters), `soulUrgeNumber(fullName: string): number`
      (letterFilter: vowels only), and `personalityNumber(fullName:
      string): number` (letterFilter: consonants, including Y), each
      splitting the normalized name on whitespace into parts before
      calling `reduceNameNumber`.
- [x] 2.3 Add breakdown variants (`expressionBreakdown`,
      `soulUrgeBreakdown`, `personalityBreakdown`) analogous to
      `lifePathBreakdown`, returning per-part reduced values, the sum, the
      final number, and whether further reduction occurred.
- [x] 2.4 Add a name-validity check (e.g. `hasUsableLetters(fullName:
      string): boolean`) returning false when every name part normalizes
      to an empty string, for use by the form's client-side validation.

## 3. AI Weave Module (mirrors `src/lib/ai/natal/`)

- [x] 3.1 Create `src/lib/ai/numerology/schema.ts`: JSON schema + response
      type/validator for `{ synthesis: string }`, mirroring
      `src/lib/ai/natal/schema.ts` exactly.
- [x] 3.2 Create `src/lib/ai/numerology/prompt.ts`: `buildNumerologySystemPrompt()`
      (an AI numerology-reader persona, explaining the four numbers and
      instructing a 150-220 word prose synthesis scoped to the selected
      domain — Career, Love, or Life Purpose) and
      `buildNumerologyUserPrompt(numbers, domain)` encoding the four
      numbers and domain via the same TOON `encode()` helper used in
      `natal/prompt.ts`.
- [x] 3.3 Create `src/lib/ai/numerology/chain.ts`: `generateNumerologyWeave(system,
      user)` mirroring `generateNatalSynthesis` — same adapter list
      (Gemini/Groq/OpenRouter), same retry/backoff via `tryProvider`, same
      `ProviderChainExhausted` throw when the chain is exhausted.
- [x] 3.4 Create `src/lib/ai/numerology/validate.ts`: `validateNumerologyRequest(body)`
      checking `numbers.{lifePath,expression,soulUrge,personality}` are
      all numbers and `domain` is one of `'career' | 'love' | 'purpose'`.

## 4. API Route

- [x] 4.1 Create `src/pages/api/numerology-reading.ts`: `export const
      config = { runtime: 'edge' }`, POST handler that validates the body
      via `validateNumerologyRequest`, builds prompts via `prompt.ts`,
      calls `generateNumerologyWeave`, returns `{ provider, synthesis }` on
      success, and on `ProviderChainExhausted` returns 503 with
      `{ error: 'provider_chain_exhausted', attempts }` — mirroring
      `natal-reading.ts`'s structure exactly.

## 5. Form UI

- [x] 5.1 Add a full-name text input to `NumerologyForm.astro`, with an
      inline error message (hidden by default) shown when
      `hasUsableLetters` returns false on submit, blocking calculation.
- [x] 5.2 On successful submit, compute and display Expression, Soul
      Urge, and Personality alongside Life Path, each showing its number
      and `NUMBER_ARCHETYPE_TITLES` title only (no Strengths/Challenges
      for these three).
- [x] 5.3 Add a single-select domain chip row (Career / Love / Life
      Purpose) with radio-button semantics (exactly one active), enabled
      once all four numbers are computed.
- [x] 5.4 Add a "Weave My Numbers Together" button (disabled until a
      domain is selected) that POSTs to `/api/numerology-reading` with the
      four numbers and selected domain, showing a loading label while in
      flight.
- [x] 5.5 Add a synthesis result panel (synthesized text + "✦ read by
      {provider} ✦" attribution, matching `BirthForm.astro`'s pattern) and
      an error state with retry-oriented copy shown on `ProviderChainExhausted`
      (503) or network failure, re-enabling the weave button.
- [x] 5.6 Style all new elements (name input, error message, new number
      displays, domain chips, weave button/panel) to match the existing
      gold/purple Cinzel/EB Garamond visual language, keeping the panel
      single-column.

## 6. Verification

- [x] 6.1 Manually verify a name with accented Latin characters (e.g.
      "José García") transliterates and computes all three new numbers
      correctly. Verified: Life Path 9, Expression 7, Soul Urge 22,
      Personality 3 for June 29 1990 / "José García".
- [x] 6.2 Manually verify a name that normalizes to zero usable letters
      shows the inline error and blocks computation. Verified with an
      all-Japanese name — inline error shown, result panel stayed hidden.
- [x] 6.3 Manually verify a name part whose letter-sum reduces to a
      master number (11/22/33) holds that value rather than reducing
      further, for at least one of Expression/Soul Urge/Personality.
      Verified: "José García"'s Soul Urge held 11 at both name-part level
      (JOSE and GARCIA each summed to 11) and the final sum (22).
- [x] 6.4 Manually verify the domain chip row enforces single-select
      (choosing a new domain deactivates the previous one) and that
      selecting a domain alone fires no network request. Verified via
      network log — zero requests until the weave button itself is
      pressed.
- [x] 6.5 Manually verify a successful weave call end-to-end (or, if no
      provider API keys are configured in the dev environment, verify the
      `ProviderChainExhausted` error path renders the retry-oriented error
      state correctly). A provider (Gemini) is configured in this dev
      environment — verified a real 200 OK response with a Career-scoped
      synthesis referencing all four numbers correctly, and the weave
      section correctly hid itself after success.
- [x] 6.6 Confirm no name, date, or computed number is persisted anywhere
      (no localStorage/cookie writes) after submission or after a weave
      call. Verified: reloading the page reset all fields to blank, and
      `localStorage` was empty.
