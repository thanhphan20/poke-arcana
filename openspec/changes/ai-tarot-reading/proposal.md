## Why

The `/reading` page currently synthesizes a reading by stitching pre-authored strings — position context + upright meaning + Pokémon flavor — into fixed sentences. It reads the same every time because it is not actually *interpreting*: it is templating. Users have already asked their own question by then, and the response ignores it. Adding a real LLM interpretation step turns the reading from decoration into a genuine answer while preserving everything the site already does well (static-first architecture, deterministic data).

The provider layer must survive a hobby-tier constraint: we plan to run entirely on free/cheap tiers (Gemini free, Groq free, OpenRouter `:free` models), so any one provider is one 429 away from failure. A retry-then-fallback chain and reactive rate-limit handling are the whole reason this is a non-trivial change instead of a single `fetch()` call.

## What Changes

- Add `@astrojs/vercel` adapter with `output: 'server'` so a single API route can run on Vercel Edge; the rest of the site continues to prerender to static HTML.
- New `POST /api/reading` endpoint that accepts the question + drawn spread and returns a structured interpretation (per-card interpretation + overall synthesis) plus a prose synthesis string.
- New provider-chain module: Gemini (primary, 2–3 retries with exponential backoff on 5xx/timeout) → Groq (fallback, same retry policy) → OpenRouter (final fallback). On 429 or terminal error → rotate immediately. No cross-request cooldown state.
- Input payload encoded in [TOON](https://github.com/johannschopplich/toon) (Token-Oriented Object Notation) with a one-line schema hint in the system prompt to compensate for reduced TOON training coverage.
- Structured output requested via `response_format: json_schema` on providers that support it (Gemini, some Groq/OpenRouter models); JSON-in-prose fallback parser for providers that don't.
- New "Read my fortune" button on `/reading`, rendered as a sibling to the existing `<spread-reveal>` Web Component. It appears once all cards are drawn, POSTs to `/api/reading`, and injects the returned interpretation into the existing reading panel — replacing the current template-based prose from `buildReadingPanel()`.
- New env vars: `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` (all optional; a missing key skips that provider in the chain).

## Capabilities

### New Capabilities

- `ai-provider-chain`: A provider-agnostic LLM client that fans a single logical request across ranked providers with per-provider retry, cross-provider fallback, reactive rate-limit rotation, and structured-output validation.
- `ai-tarot-interpretation`: The reading domain layer — prompt construction from a drawn spread, TOON encoding of card + Pokémon context, JSON schema for the response, and the API route that wires it all together.

### Modified Capabilities

None. The `card-reading` capability spec still lives inside the in-flight `initial-build` change (not yet archived to `openspec/specs/`), so there is no durable spec to write a delta against. The UI integration behavior (Read-my-fortune button, loading/error states, template-prose fallback) is captured as scenarios inside `ai-tarot-interpretation` instead. Once `initial-build` archives, a follow-up change can fold these UI-side requirements back into `card-reading` if desired.

## Impact

- **Deployment model**: v1 deploys to Vercel with **no** adapter (`dist/` served flat). After this change, deploys use `@astrojs/vercel` with `output: 'server'` — Vercel still serves prerendered pages for `/`, `/deck`, `/deck/[slug]`, and the shell of `/reading`, but `/api/reading` runs on Edge. This is the first time the deployed site executes server-side code.
- **Build invariant preserved**: `astro build` continues to make zero network calls. Provider requests happen only at runtime inside the API route. The existing `sync-pokedex` script remains the only build-time network dependency.
- **New dependencies**: `@astrojs/vercel`, `@johannschopplich/toon` (or equivalent TOON encoder). No provider SDKs — we call the OpenAI-compatible REST endpoints directly via `fetch()` to keep the bundle small and the retry logic uniform.
- **Secrets**: three new Vercel env vars. None are exposed to the client. `.env.example` grows to document them.
- **UI**: `src/components/spread/spread-reveal.ts` — `buildReadingPanel()` is replaced by a fetch-and-render flow. `SpreadReveal.astro` gains a "Read my fortune" button element.
- **Failure surface**: if all three providers fail the API route returns HTTP 503 with a structured error; the client falls back to the current template-based prose so a reading is always visible.
