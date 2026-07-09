## ADDED Requirements

### Requirement: Reading API endpoint

The system SHALL expose `POST /api/reading` that accepts a user's question plus a drawn spread and returns a structured tarot interpretation, running as a Vercel Edge Function without affecting the static-prerender status of any other route.

#### Scenario: Well-formed request returns 200

- **WHEN** a POST to `/api/reading` contains a valid `question` and `spread`
- **AND** at least one provider in the chain returns a schema-valid response
- **THEN** the endpoint MUST return HTTP 200 with `{ provider, cards, synthesis }`.

#### Scenario: Prerender preserved elsewhere

- **WHEN** the site is built with `bun run build`
- **THEN** `.vercel/output/config.json` MUST list `/api/reading` as the only server function
- **AND** `/`, `/deck`, `/deck/[slug]`, `/reading` MUST resolve to prerendered static HTML.

### Requirement: Input validation

The system SHALL reject malformed reading requests with HTTP 400 before invoking any provider, checking that `question` is a 1–200 char trimmed string, `spread` is an array of length 1, 3, or 10, and every card's `arcana` name matches a known Major or Minor Arcana identifier.

#### Scenario: Empty question rejected

- **WHEN** `question` is an empty string or whitespace-only
- **THEN** the endpoint MUST return HTTP 400 with `error: "invalid_request"` and MUST NOT contact any provider.

#### Scenario: Invalid spread size

- **WHEN** `spread` has length 2 or 5 or any value other than 1/3/10
- **THEN** the endpoint MUST return HTTP 400 with `error: "invalid_request"`.

#### Scenario: Unknown arcana rejected

- **WHEN** a card's `arcana.name` does not match any key in `MAJOR_ARCANA_METADATA` or any `<Suit> of <Rank>` combination
- **THEN** the endpoint MUST return HTTP 400 with `error: "invalid_request"`.

### Requirement: TOON-encoded prompt payload

The system SHALL encode the user prompt in TOON (Token-Oriented Object Notation) and SHALL include a one-line TOON legend in the system prompt so the model can parse it reliably.

#### Scenario: TOON encoding applied

- **WHEN** the API route builds the user prompt for any provider
- **THEN** the body sent to the provider MUST be TOON-encoded (not JSON)
- **AND** the system prompt MUST contain a legend describing the TOON format.

#### Scenario: Payload includes required fields

- **WHEN** encoding a card into TOON
- **THEN** each card entry MUST include `position`, `arcana_kind`, `arcana_name`, `arcana_keywords`, `upright_meaning`, `pokemon_name`, and `pokemon_flavor`.

### Requirement: Response schema

The system SHALL request and return a response conforming exactly to:
```
{
  cards: Array<{ position: string, arcana: string, pokemon: string, interpretation: string }>,
  synthesis: string
}
```
with `cards.length === spread.length` and every field non-empty.

#### Scenario: Card count matches spread

- **WHEN** the spread contains 3 cards
- **THEN** the response's `cards` array MUST contain exactly 3 entries in the same position order as the input.

#### Scenario: Non-empty interpretations required

- **WHEN** any `card.interpretation` or `synthesis` is an empty or whitespace-only string in the raw provider response
- **THEN** the attempt MUST be classified as `schema_validation_failed` and the chain MUST rotate.

### Requirement: Read-my-fortune UI trigger

The `/reading` page SHALL render a "Read my fortune" button that becomes visible only after every card in the current spread has been drawn, and SHALL leave the existing template-based reading panel in place until the user activates the button.

#### Scenario: Button hidden before all cards drawn

- **WHEN** the user has drawn fewer cards than the current spread size
- **THEN** the button MUST NOT be visible or focusable.

#### Scenario: Button visible after all cards drawn

- **WHEN** all cards in the spread have been drawn and their Pokémon revealed
- **THEN** the button MUST become visible
- **AND** the existing template-based reading panel MUST already be rendered so the user always sees a reading first.

#### Scenario: Activation triggers API call

- **WHEN** the user activates the button
- **THEN** the button MUST enter a loading state with a "listening" affordance
- **AND** the client MUST POST to `/api/reading` with the captured question and drawn spread.

### Requirement: Successful reading replaces template prose

On a successful `/api/reading` response, the client SHALL replace the per-card prose (`.rp-card__text`) and the synthesis text (`.rp-synthesis__text`) with the AI-generated content, preserving the surrounding DOM structure (titles, Pokémon witness lines, styling).

#### Scenario: Text replacement scoped to prose nodes

- **WHEN** the API returns a valid interpretation
- **THEN** each `.rp-card__text` MUST be replaced with the matching card's `interpretation`
- **AND** `.rp-synthesis__text` MUST be replaced with the `synthesis` field
- **AND** the "AI interpretation coming soon" note (`.rp-ai-note`) MUST be removed from the panel.

#### Scenario: Provider attribution shown

- **WHEN** the AI content is rendered
- **THEN** a subtle attribution note MUST be rendered indicating which provider answered (e.g. "read by gemini").

### Requirement: Graceful failure fallback

When `/api/reading` returns 503 or any client-side fetch failure occurs, the client SHALL leave the pre-rendered template reading intact and SHALL show a small inline notice indicating the AI reading is temporarily unavailable.

#### Scenario: 503 does not blank the reading

- **WHEN** the endpoint returns HTTP 503
- **THEN** the existing template-based reading panel MUST remain fully visible
- **AND** a short notice such as "The oracle is quiet — try again in a moment." MUST appear near the button
- **AND** the button MUST return to its enabled state so the user can retry.

#### Scenario: Network error identical fallback

- **WHEN** the fetch call itself rejects (offline, DNS, CORS)
- **THEN** the client MUST render the same fallback notice as for a 503.

### Requirement: Astro adapter configuration

The site SHALL configure `@astrojs/vercel` with `output: 'server'`, and every page route (excluding `/api/*`) SHALL export `const prerender = true` so that only the reading API runs at request time.

#### Scenario: Static routes stay static

- **WHEN** the site is built
- **THEN** every non-API route MUST be present in `.vercel/output/static/` as a prerendered HTML file.

#### Scenario: API route is a function

- **WHEN** the site is built
- **THEN** `/api/reading` MUST be present under `.vercel/output/functions/` and MUST be configured for the Edge runtime.

### Requirement: Build-time network-purity preserved

The system SHALL make zero outbound network calls during `astro build`. Provider API keys, endpoints, and models SHALL be read only inside the runtime API route, never during page prerender or component compilation.

#### Scenario: Build completes with no keys set

- **WHEN** `bun run build` runs in an environment with none of `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` set
- **THEN** the build MUST complete successfully and produce the same static output as when keys are set.
