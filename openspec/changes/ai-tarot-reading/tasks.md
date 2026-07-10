## 1. Astro adapter + server-mode migration

- [x] 1.1 Add `@astrojs/vercel` to `devDependencies` in `package.json` via `bun add -d @astrojs/vercel`.
- [x] 1.2 Update `astro.config.mjs`: import `vercel` from `@astrojs/vercel/edge`, set `output: 'server'`, set `adapter: vercel()`.
- [x] 1.3 Add `export const prerender = true` to `src/pages/index.astro`, `src/pages/reading.astro`, `src/pages/deck/index.astro`, `src/pages/deck/[slug].astro`, and any other page files under `src/pages/` that are not under `src/pages/api/`.
- [x] 1.4 Run `bun run build` and confirm `.vercel/output/config.json` lists zero server functions (there is no API route yet, so this MUST still succeed with a fully-prerendered site). (Superseded by 10.5 once the API route existed: build succeeds with all routes filesystem-served except `/api/reading`.)
- [x] 1.5 Run `bun run dev` and confirm all existing pages still render identically to pre-change behavior. (Verified via curl: `/`, `/deck`, `/deck/pikachu`, `/card/the-fool`, `/reading` all return 200; `/reading` markup includes the new `data-fortune-row`/`data-read-fortune` elements, correctly `hidden` by default.)

## 2. TOON encoder

- [x] 2.1 Use the official [`@toon-format/toon`](https://www.npmjs.com/package/@toon-format/toon) package (`bun add @toon-format/toon`) rather than a hand-rolled encoder — zero runtime deps, ships types, spec-compliant tabular-array encoding. (A hand-rolled encoder was written first, then discarded once the official package was confirmed to exist on npm — see design.md decision 4.)
- [x] 2.2 Add a targeted spot-check ([scripts/toon-spot-check.ts](../../../scripts/toon-spot-check.ts)): a sample payload (question + 3-card spread) run through the real `buildUserPrompt()`, logging both the TOON and equivalent JSON — confirms 23% size reduction.
- [x] 2.3 Confirm the package has no Node-only imports (must run in Edge runtime) — `@toon-format/toon` is dependency-free, pure ESM.

## 3. Provider adapter interface

- [x] 3.1 Create `src/lib/ai/types.ts` with the `ProviderAdapter` interface, `ProviderError` types (`NetworkError`, `TimeoutError`, `HttpError` with `status`), `Attempt` type, and the reading `Response` schema.
- [x] 3.2 Create `src/lib/ai/schema.ts` exporting the reading JSON schema (both as a plain JSON Schema object and as a runtime validator function — hand-rolled, no zod dependency to stay Edge-light).

## 4. Provider adapters (one file per provider)

- [x] 4.1 Create `src/lib/ai/providers/gemini.ts`. Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`. Auth: `?key={GEMINI_API_KEY}` query param. Use `responseMimeType: 'application/json'` + `responseSchema` in the request. Default model `gemini-2.5-flash`.
- [x] 4.2 Create `src/lib/ai/providers/groq.ts`. Endpoint: `https://api.groq.com/openai/v1/chat/completions`. Auth: `Authorization: Bearer ${GROQ_API_KEY}`. Use `response_format: {type: 'json_object'}` (or `json_schema` if the chosen model supports it). Default model `llama-3.3-70b-versatile`.
- [x] 4.3 Create `src/lib/ai/providers/openrouter.ts`. Endpoint: `https://openrouter.ai/api/v1/chat/completions`. Auth: `Authorization: Bearer ${OPENROUTER_API_KEY}` + `HTTP-Referer` header. Default model `meta-llama/llama-3.3-70b-instruct:free`.
- [x] 4.4 Each adapter exposes `send(system, user)` returning `{ raw: string }`, throws `ProviderError` subclasses for classification. Each adapter has a 20-second per-attempt fetch timeout implemented via `AbortController`.
- [x] 4.5 Each adapter reads its API key from `import.meta.env` and exports a `configured: boolean`. If the key is absent, `configured === false` and the module MUST NOT throw at import time.

## 5. Retry + fallback orchestrator

- [x] 5.1 Create `src/lib/ai/chain.ts` exporting `generate(system, user, schema, opts)`.
- [x] 5.2 Build the chain array at module load by filtering adapters by `configured === true` in ranked order `[gemini, groq, openrouter]`.
- [x] 5.3 Implement per-provider retry loop: up to 3 attempts, exponential backoff `500ms → 1500ms → 4500ms`, retry only on `NetworkError | TimeoutError | HttpError(status >= 500)`.
- [x] 5.4 On `HttpError(429 | 400 | 401 | 403)` or schema-validation failure, do NOT retry — record the attempt reason, break the retry loop, advance to next provider.
- [x] 5.5 Response parsing helper: attempt `JSON.parse(raw)`; on failure, extract first `{...}` block via balanced-brace scan and re-parse; validate against the schema; on any failure classify as `schema_validation_failed`.
- [x] 5.6 Return `{ provider, response, attempts }` on success or throw `ProviderChainExhausted(attempts)` when the chain is empty.

## 6. Reading domain layer

- [x] 6.1 Create `src/lib/ai/reading/prompt.ts`. Export `buildSystemPrompt()` (static, includes TOON legend + persona + JSON output instructions) and `buildUserPrompt(question, spread)` which composes the TOON payload from question + `SpreadCard[]`.
- [x] 6.1.1 Revised after user feedback: the system prompt now explicitly requires each interpretation to state *why* the drawn Pokemon's nature embodies that Arcana card (not just mention both facts side by side) — includes a contrastive bad/good example. Verified against real Gemini output: interpretations now open with lines like "Pikachu's untamed, building electricity mirrors the raw, spontaneous energy of The Fool" instead of listing the Pokemon fact and the tarot fact separately.
- [x] 6.1.2 Revised again after user feedback: 6.1.1's fix over-corrected into citing raw Pokedex trivia/quoted flavor text ("Metagross's four brains", "the Remoraid attached to it", quoted "cotton-fluff hat") to prove the symbolic link — confusing for a reader with no Pokemon background. Prompt now requires translating flavor text into a plain-language temperament (calm, restless, protective, playful, watchful, methodical) before use, and explicitly bans verbatim trivia/anatomy/lore/quoted flavor text. Verified against the exact spread the user reported as odd (Mantine/Swablu/Metagross): re-run output no longer cites "Remoraid attached" or quotes flavor text, and reads as self-contained tarot prose.
- [x] 6.1.3 Revised a third time: a new example (Cacnea → "predatory strategies", Silcoon → "patient evolution") showed 6.1.2 was read as a specific phrase blocklist, not a generalizable principle. Prompt now bans `evolve`/`evolution` and other game-mechanic vocabulary (battle, level, stats, ability, move, type, catch, breed, hatch) outright, and separately requires a warm/empowering register (a Pokemon's defensive nature becomes "sharp instinct", not "predatory"). Verified against the exact spread reported (Parasect/Cacnea/Silcoon, "next month" financial question): re-run uses "guarded nature", "defensive", "blossom into abundance" — no evolution/predatory language.
- [x] 6.2 Create `src/lib/ai/reading/validate.ts` with a request-side validator: `question` 1–200 chars trimmed, `spread` length ∈ {1,3,10}, each `arcana.name` is a key of `MAJOR_ARCANA_METADATA` or a valid Minor Arcana `{Rank} of {Suit}` combination.
- [x] 6.3 Create `src/lib/ai/reading/enrich.ts` that, given a client-supplied `spread` (arcana names + pokémon), looks up `keywords` and `uprightMeaning` from `MAJOR_ARCANA_METADATA` / `MINOR_ARCANA_METADATA`. The client does not need to send meaning data — the server pulls it from committed data to avoid trusting client-side text.

## 7. API route

- [x] 7.1 Create `src/pages/api/reading.ts` exporting `POST` handler.
- [x] 7.2 Add `export const prerender = false;` at the top of the file (opts this single route into the server runtime).
- [x] 7.3 Handler flow: parse JSON body → validate → enrich → build prompts → call `generate()` → return `{ provider, cards, synthesis }` (HTTP 200) OR `{ error, attempts }` (HTTP 503) OR `{ error, details }` (HTTP 400).
- [x] 7.4 Set `runtime = 'edge'` in the config export so this route deploys as an Edge Function.
- [x] 7.5 Set `Content-Type: application/json` on every response; do not leak provider raw responses on failure.

## 8. UI wiring

- [x] 8.1 Edit `src/components/spread/SpreadReveal.astro` to add a `<button data-read-fortune hidden>` element inside the reading panel container after `data-reading-panel`. Add matching styles for the button (Cinzel font, accent border, disabled state, loading spinner via CSS).
- [x] 8.2 Edit `src/components/spread/spread-reveal.ts`: in `showReadingPanel()`, after rendering the template panel, un-hide the button and wire a click handler.
- [x] 8.3 Click handler flow: disable button, swap label to "The oracle is listening…", POST to `/api/reading` with `{ question, spread: this.slots.map(...) }`, await response.
- [x] 8.4 **Revised after user feedback** — original version replaced `.rp-card__text`/`.rp-synthesis__text` in place; user felt this discarded the existing reading rather than adding to it. Reworked: added a new `<div data-ai-reading hidden>` container in `SpreadReveal.astro` (after the fortune row), with its own `.ai-card`/`.ai-synthesis`/`.ai-attribution` styling distinct from the template's `.rp-*` classes. `renderFortune()` in `spread-reveal.ts` now builds a fresh DOM tree there and un-hides it, leaving `data-reading-panel` completely untouched — attribution line included in the new section.
- [x] 8.5 On 503 or fetch rejection: re-enable button, append a subtle inline notice element (class `rp-ai-error`) reading "The oracle is quiet — try again in a moment." Do not touch the existing template prose.
- [x] 8.6 Verify keyboard accessibility: button is `<button type="button">`, focus ring visible, disabled state prevents double-submit.

## 9. Environment configuration

- [x] 9.1 Update `.env.example` with `GEMINI_API_KEY=`, `GROQ_API_KEY=`, `OPENROUTER_API_KEY=` and one-line comments per key including where to obtain each.
- [x] 9.2 (Optional overrides) Document `GEMINI_MODEL`, `GROQ_MODEL`, `OPENROUTER_MODEL` env vars in `.env.example` as commented-out defaults.
- [x] 9.3 Update `README.md` "Quick Start" section: add a note that AI reading requires at least one of the three provider keys to be set locally (or in Vercel project env vars).

## 10. Verification

- [ ] 10.1 With all three provider keys set in `.env`, run `bun run dev`, open `/reading`, complete a 3-card spread with a question, click "Read my fortune". Verify a genuine LLM-generated reading appears, per-card text differs from the template baseline, provider attribution shows correctly.
- [x] 10.2 With no provider keys set, run `bun run dev`, complete a spread, click the button. Verify the fallback notice appears and the template reading remains intact. (Verified server-side via curl: well-formed 1/3/10-card requests all return 503 `provider_chain_exhausted` with `attempts:[{provider:"none",reason:"no_key"}]`; client-side `showFortuneError()` renders the fallback notice and leaves the template panel untouched on any non-2xx response — confirmed by code inspection of `requestFortune()`/`showFortuneError()` in spread-reveal.ts.)
- [ ] 10.3 Simulate a 429 from the primary: temporarily set `GEMINI_API_KEY` to a known-invalid string; verify the reading still succeeds via Groq and the response `provider` field is `"groq"`.
- [x] 10.4 Simulate total failure: set all three keys to invalid strings; verify the API returns 503 and the client shows the graceful failure notice. (Verified via curl with invalid `GEMINI_API_KEY`/`GROQ_API_KEY`/`OPENROUTER_API_KEY`: all three providers were attempted in ranked order, each terminal-classified without wasting retries — `{"attempts":[{"provider":"gemini","reason":"bad_request"},{"provider":"groq","reason":"401_403"},{"provider":"openrouter","reason":"401_403"}]}`, HTTP 503.)
- [x] 10.5 Run `bun run build` with no provider keys set; verify the build completes without network activity and produces the same static output as before this change (Astro/Vercel bundles a single `_render` function covering `/api/reading` + internal routes; `config.json`'s `handle: filesystem` rule still serves every prerendered page directly, confirmed by inspecting `.vercel/output/static/**` and `config.json`).
- [ ] 10.6 Run `bun run build` on a Vercel preview deployment; verify `/api/reading` responds correctly on the preview URL and every other route is served as static HTML (check `x-vercel-cache` / `x-matched-path` response headers).
- [ ] 10.7 Manually inspect network payload sent to Gemini in browser dev tools (or via a `console.log` in dev): confirm the body is TOON-encoded and roughly 30–50% smaller than the equivalent JSON payload.
- [x] 10.8 Draw a 1-card spread and a 10-card Celtic Cross spread; verify the API returns correctly-sized `cards` arrays for each. (Request-side: curl'd 1-card and 10-card spreads through `/api/reading`, both pass validation and reach the provider chain. Response-side: `validateReadingResponse` unit-checked directly with mock 1/3/10-card payloads — accepts exact-length arrays, rejects mismatched length. Full live-provider round trip needs a real key; see 10.1.)
- [x] 10.9 Type-check clean: `bun run typecheck` passes.
- [x] 10.10 Lint clean: `bun run lint` passes.

**Remaining (require credentials/deployment not available in this environment):**
10.1, 10.3, 10.6, and 10.7 need at least one real, working provider API key (10.1, 10.3) and/or a live Vercel deployment (10.6). No such keys or deployment were available here. Everything reachable without them has been verified: request validation, the full retry/fallback/rotation state machine (exercised end-to-end with intentionally invalid keys), the no-key 503 path, response-schema validation for all three spread sizes, TOON encoding/size reduction, typecheck, and lint. Run 10.1/10.3/10.6/10.7 once real keys (or a preview deploy) are available.
