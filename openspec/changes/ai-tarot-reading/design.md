## Context

`/reading` currently renders a template-based prose paragraph per card and a canned synthesis. `spread-reveal.ts` already has a `TO SWAP IN AN AI PROVIDER` comment block explicitly reserving this spot for the future integration — this change fills that gap.

Constraints inherited from the current architecture:

- **Static-first.** Every other route (`/`, `/deck`, `/deck/[slug]`, plus the shell of `/reading`) must remain a prerendered HTML file. Adding SSR to those routes would be regression against the "zero runtime" design decision.
- **No network at build.** `astro build` still cannot make outbound calls. The provider chain lives at runtime only.
- **Vanilla Web Component boundary.** `<spread-reveal>` is deliberately framework-free. We do not import React/Svelte/Vue to render the AI response — a `fetch()` + DOM update inside the existing component (or a sibling script) is sufficient.
- **Free/cheap providers.** No paid tier assumptions. Any provider may 429 at any time; any may return a malformed response; any key may be absent.

Existing surface we reuse:

- `question` is already captured (`QuestionChips.astro` dispatches `question-change`; `SpreadReveal` stores it in `this.question`).
- Each drawn `Slot` carries `{ position, card.arcana (name/kind/suit/majorNumber/metadata), drawnMember (id/name/flavorText) }` — the exact payload the LLM needs.
- `MAJOR_ARCANA_METADATA` / `MINOR_ARCANA_METADATA` already contain `keywords`, `uprightMeaning`, `description` per card — no new tarot-meaning data source required.

## Goals / Non-Goals

**Goals:**

- Add a runtime API route that returns a real LLM-generated interpretation for a drawn spread + user question.
- Route requests through a **retry chain within each provider, fallback chain across providers**: Gemini → Groq → OpenRouter.
- Handle rate limits **reactively** (rotate provider on 429) without persisted cooldown state.
- Minimize input tokens using **TOON** encoding for the payload.
- Enforce a **structured JSON response** with a Zod-parseable schema (per-card + synthesis).
- Keep the free-tier constraint honest — no assumption that any single provider is available.
- Degrade gracefully — if all providers fail, the existing template-based prose still renders.

**Non-Goals:**

- Streaming responses (SSE). Excluded for v1 because it complicates the fallback path (a stream that dies mid-token is harder to rotate than a request that 429s on the wire).
- Persistent rate-limit state (Redis / Vercel KV). Excluded because free-tier traffic is low and per-instance discovery is cheap enough.
- Caching readings by input hash. Every reading includes a user question, so cache-hit rate would be ~0 without normalizing questions, which is more work than it's worth in v1.
- Bring-your-own-key mode. The user owns the keys server-side.
- Model quality tuning / prompt A/B testing. One prompt, one system message, ship.
- Response moderation. Users type their own questions; the LLM's own safety layers are considered sufficient for a personal tarot site.

## Decisions

### 1. Adapter: `@astrojs/vercel` with `output: 'server'`, per-page `prerender = true`

**Chosen:** Astro's server output mode, with all non-API routes explicitly marked `export const prerender = true`. Vercel deploys `/api/reading` as an Edge Function (via that route's own `export const config = { runtime: 'edge' }`) and everything else as static HTML. `@astrojs/vercel` v11 unified the old `/edge` and `/serverless` subpath adapters into one default export — the runtime is now selected per-route, not per-adapter-import.

**Alternatives:**

- `output: 'hybrid'` — Astro 7 folded hybrid into `server` mode with per-page opt-in. Not a real alternative anymore.
- Cloudflare Worker as a separate deploy — decoupled but adds a second deploy target and CORS headaches. Not worth the complexity for one endpoint.
- Client-side calls with user-supplied keys — rejected earlier in design ("skip this one" from the grill).

**Why:** Minimum architectural change. The API route is the one and only server-rendered surface; the rest of the site behaves exactly as it does today.

### 2. Provider chain topology

```
request → gemini (retry ×N) → 429/terminal → groq (retry ×N) → 429/terminal → openrouter (retry ×N) → 503
```

Two distinct failure modes, two distinct responses:

| Failure | Action |
|---|---|
| Network error, timeout, 5xx | Retry same provider. Exponential backoff: 500ms, 1.5s, 4.5s (×3 attempts total). |
| 429, 401/403, 400 (bad request), schema-validation failure | Do **not** retry. Rotate to next provider immediately. |
| All providers exhausted | Return HTTP 503 with `{ error: "provider_chain_exhausted", attempts: [...] }`. Client falls back to template prose. |

**Alternatives considered:**

- Retry on 429 with `Retry-After` — sound in general, wrong here. Gemini's free tier returns `Retry-After: 60`. Waiting 60s inside an Edge Function invocation blows the CPU-time budget and burns the user's patience. Rotate instead.
- Round-robin instead of ranked — makes quality inconsistent (Gemini > Groq > OpenRouter for prose quality in our informal test). Rank order is better UX.

### 3. Rate-limit strategy: reactive-only, no persisted cooldowns

Each invocation of `/api/reading` discovers rate-limit state fresh. If Gemini 429s at 12:00:00 for user A, user B at 12:00:02 will also hit Gemini first and also 429 before falling through. This is intentionally wasteful and intentionally simple.

**Why:** Vercel Edge Functions are stateless with no guaranteed instance affinity. In-memory cooldowns would only help *within* one instance for the seconds a user's session stays hot. Persisted cooldowns (Upstash Redis, Vercel KV) would help but add a paid dependency to a "free and cheap" project. The waste is one extra fetch per rate-limited request — acceptable.

### 4. Input encoding: TOON

**Chosen:** Encode the prompt payload (question + cards) as [TOON](https://github.com/johannschopplich/toon). Include a one-line schema legend in the system prompt so the model can parse it reliably:

```
The user's request is encoded as TOON. Format: `key: value` per line;
nested objects indented; arrays as `- ` items. Interpret it as JSON.
```

Implemented with the official [`@toon-format/toon`](https://github.com/toon-format/toon) npm package (zero runtime deps, ESM, ships types) rather than a hand-rolled encoder — no reason to reimplement a spec-driven format a maintained library already covers correctly, including edge cases (quoting, delimiter escaping, strict-mode validation) a first-pass hand implementation would miss.

**Alternatives:**

- Hand-rolled encoder — briefly implemented, then discarded in favor of the official package once its existence was confirmed on npm. Reinventing a spec'd format inside this repo would mean maintaining our own quoting/escaping edge cases forever.
- Plain JSON — baseline. ~30-50% more tokens for this payload. Marginal on 1 card, meaningful on Celtic Cross (10 cards × ~120 tokens of meta each).
- YAML — similar savings to TOON but with lookahead parsing quirks that some LLMs mis-handle. TOON is stricter and simpler.
- Prose ("The user drew The Fool in the past position…") — reads well to a human, uses *more* tokens than JSON, and burdens the model with parsing English rather than data.

**Risk:** LLMs are trained mostly on JSON. TOON is newer. → Mitigation: the schema legend in the system prompt. If output quality degrades vs JSON in dev testing, fall back to JSON (this is one line to change).

### 5. Output shape: structured JSON with prose fields

```ts
{
  cards: Array<{
    position: string;          // "Past" | "Present" | "Future" | ...
    arcana: string;            // "The Fool", "Three of Cups", ...
    pokemon: string;           // "pikachu"
    interpretation: string;    // 2-4 sentence prose per card
  }>,
  synthesis: string;           // 3-5 sentence overall interpretation
}
```

Requested via `response_format: { type: 'json_schema', json_schema: {...} }` on providers that advertise support:

- Gemini: `responseSchema` (native).
- Groq: OpenAI-compat `response_format`; supported on `llama-3.3-70b-versatile` and similar. Falls back to JSON-in-prose otherwise.
- OpenRouter: forwards per-model; unreliable, treat as prose.

**Parser** normalizes both cases: (1) attempt `JSON.parse` on the raw response body; (2) on failure, extract the first `{...}` block via regex and re-parse. If both fail, mark the attempt as `schema_validation_failed` and rotate to next provider.

### 6. Prompt structure

**System prompt** (static, ~220 tokens):
- Persona: "You are a tarot reader speaking to the querent."
- Data format: TOON legend (see above).
- **Explicit symbolic-link requirement**: the Pokemon IS this deck's illustration for that card, not a decoration mentioned alongside it — every per-card interpretation must state, in the model's own words, *why* that Pokemon's nature/flavor text embodies that specific Arcana card's meaning. The prompt includes a contrastive example (bad: two facts bolted together; good: one fused idea) because a plain instruction ("mention the Pokemon") reliably produced juxtaposition rather than synthesis in testing — an early version of this prompt asked the model to "weave together" the Pokemon and the card, and Gemini still produced "you draw The Fool. Pikachu's sparks fly when many gather..." style output that names both facts without connecting them.
- Task: interpret each card in context of its position and the Pokémon that appeared, then synthesize.
- Constraints: exact JSON output, no markdown, no preamble.

**User prompt** (dynamic, TOON-encoded):
- `question`: string
- `spread_size`: 1 | 3 | 10
- `cards`: array of `{ position, arcana_kind, arcana_name, arcana_keywords, upright_meaning, pokemon_name, pokemon_flavor }`

Pokémon `flavorText` gives the reading its Poké-Arcana flavor without which the LLM would output generic tarot prose (which defeats the whole project). Traditional `keywords` + `upright_meaning` ground the interpretation so it stays tarot-accurate rather than pure Pokémon fanfic.

### 7. Provider-specific request adapters

One tiny adapter per provider (~30 lines each) exposing a uniform interface:

```ts
interface ProviderAdapter {
  name: 'gemini' | 'groq' | 'openrouter';
  send(system: string, user: string, schema: JSONSchema): Promise<{ raw: string; usage?: Usage }>;
  isRetryable(err: ProviderError): boolean;   // 5xx / network / timeout
  isFatal(err: ProviderError): boolean;       // 429 / 4xx auth/bad-req → rotate
}
```

Providers are configured via env only; missing key → provider is dropped from the chain at module load. This makes local dev with just `GROQ_API_KEY` set a valid configuration.

### 8. Model selection per provider

Free-tier defaults, all overridable by env (`GEMINI_MODEL`, `GROQ_MODEL`, `OPENROUTER_MODEL`):

- **Gemini:** `gemini-2.5-flash` — free tier, fast, native JSON schema.
- **Groq:** `llama-3.3-70b-versatile` — free tier, extremely fast, good JSON adherence.
- **OpenRouter:** `meta-llama/llama-3.3-70b-instruct:free` — free tier, forgiving, worst quality but always available.

### 9. UI wiring

- `SpreadReveal.astro` adds a hidden `<button data-read-fortune>` element that is `hidden` until all cards are drawn, plus a separate hidden `<div data-ai-reading>` container placed after the fortune row.
- `spread-reveal.ts` — the existing `showReadingPanel()` renders the *template* panel immediately (unchanged), then reveals the "Read my fortune" button. On click: disable button, show a loading state ("The oracle is listening…"), POST to `/api/reading`.
- **On success, the AI response is appended as its own distinct section — it never mutates the template panel.** An earlier version of this design overwrote `.rp-card__text`/`.rp-synthesis__text` in place; that was reverted after user feedback that replacing the existing reading felt like it discarded work rather than adding to it. `renderFortune()` now builds a fresh DOM tree (`.ai-card`, `.ai-synthesis`, `.ai-attribution` — visually distinct from the template's `.rp-*` classes) and reveals it via `data-ai-reading`, leaving every node inside `data-reading-panel` untouched.
- On 503 from `/api/reading`: leave both the template panel and the (still-hidden) AI section alone, and show a small inline notice: "The oracle is quiet — try again in a moment."

This keeps the *first* reading instant (template prose renders while the user reads the cards) and makes the AI reading an opt-in second act. It also means a total provider outage is invisible unless the user clicks the button — good failure mode for hobby infra.

### 10. Client → server contract

`POST /api/reading` request body (JSON, not TOON — the server does the TOON encoding for the LLM):

```json
{
  "question": "string, max 200 chars",
  "spread": [
    { "position": "Past",    "arcana": {...}, "pokemon": {"name": "...", "flavor": "..."} },
    ...
  ]
}
```

Response `200`:

```json
{
  "provider": "gemini" | "groq" | "openrouter",
  "cards": [{ "position": "...", "arcana": "...", "pokemon": "...", "interpretation": "..." }],
  "synthesis": "..."
}
```

Response `503`:

```json
{
  "error": "provider_chain_exhausted",
  "attempts": [
    { "provider": "gemini", "reason": "429" },
    { "provider": "groq", "reason": "5xx_retry_exhausted" },
    { "provider": "openrouter", "reason": "schema_validation_failed" }
  ]
}
```

### 11. Input validation

Server-side, before any provider call:

- `question`: string, 1–200 chars, trimmed.
- `spread`: array, length 1 / 3 / 10.
- Each card's `arcana` matches a known arcana name (validate against `MAJOR_ARCANA_METADATA` / `MINOR_ARCANA_METADATA` keys).

Rejection returns HTTP 400 with `{ error: 'invalid_request', details: [...] }`. This is a cheap early exit before we burn provider quota on malformed input.

## Risks / Trade-offs

- **[TOON quality regression]** LLMs may interpret TOON worse than JSON on some cards. → Mitigation: the schema legend in system prompt; dev-time A/B check (send the same 5 spreads in TOON vs JSON, compare outputs); one-line rollback if quality drops.

- **[Provider quota exhaustion for all users at once]** A viral moment could burn Gemini's daily free quota in an hour, then Groq's, then OpenRouter's. → Mitigation: 503 with graceful degradation to template prose. Users still see *a* reading. Optionally, add rate limiting per client IP in a follow-up change if this becomes a real problem.

- **[Vercel Edge runtime incompatibilities]** Some npm packages don't work on Edge (no Node APIs). TOON encoder and provider adapters must be Edge-compatible. → Mitigation: prefer zero-dep implementations. Verify at build time via `astro build` (Astro warns on Edge-incompatible imports).

- **[Prompt injection via user question]** A user could paste "ignore previous instructions and…". → Mitigation: system prompt uses XML-tag delimiters around the user question; we accept that a determined user can jailbreak the tarot reader into any topic — this is a personal site, not a compliance boundary.

- **[Cost creep past free tier]** If we hit paid tier on Gemini/Groq unexpectedly. → Mitigation: no paid tier keys installed on Vercel until explicitly wanted; providers with only paid tier and no configured key are simply absent from the chain.

- **[Astro server-mode migration]** Switching from static-only to server-mode changes deploy config. → Mitigation: staged in `astro.config.mjs` with explicit per-page `prerender = true`; verified by inspecting `.vercel/output/config.json` after build (only `/api/*` routes should be functions).

## Migration Plan

Single deploy — no phased rollout needed for a hobby site.

1. Land the change on a preview branch; deploy to a Vercel preview URL.
2. Verify with keys set: `/api/reading` returns 200 with real content.
3. Verify with keys unset: `/api/reading` returns 503 and the UI shows the template fallback + graceful notice.
4. Verify build: `bun run build` completes without network calls (assert by watching network with keys unset or by unplugging).
5. Merge to main; production Vercel deploy picks up the env vars set at the project level.
6. Rollback: revert the merge commit. Static-only deploy restores automatically because the pre-change config produces static output.

## Open Questions

- Should we log provider attempts + reasons to Vercel logs (yes — read-only, no PII) or to an analytics endpoint (out of scope for v1)?
- If Groq offers a smaller / faster model that's Good Enough, do we prefer it over 70B for reading latency? Punt to post-launch based on real timing.
