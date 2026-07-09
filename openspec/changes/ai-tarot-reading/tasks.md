## 1. Astro adapter + server-mode migration

- [ ] 1.1 Add `@astrojs/vercel` to `devDependencies` in `package.json` via `bun add -d @astrojs/vercel`.
- [ ] 1.2 Update `astro.config.mjs`: import `vercel` from `@astrojs/vercel/edge`, set `output: 'server'`, set `adapter: vercel()`.
- [ ] 1.3 Add `export const prerender = true` to `src/pages/index.astro`, `src/pages/reading.astro`, `src/pages/deck/index.astro`, `src/pages/deck/[slug].astro`, and any other page files under `src/pages/` that are not under `src/pages/api/`.
- [ ] 1.4 Run `bun run build` and confirm `.vercel/output/config.json` lists zero server functions (there is no API route yet, so this MUST still succeed with a fully-prerendered site).
- [ ] 1.5 Run `bun run dev` and confirm all existing pages still render identically to pre-change behavior.

## 2. TOON encoder

- [ ] 2.1 Choose a TOON library or write a ~40-line zero-dep encoder in `src/lib/ai/toon.ts`. Requirements: encode `Record<string, unknown>` → TOON string, arrays as `- `-prefixed items, nested objects as indented `key: value` blocks. Handle strings with embedded newlines by quoting.
- [ ] 2.2 Add a targeted spot-check: hardcode a sample payload (question + 3-card spread) and log both the TOON and equivalent JSON to eyeball the token savings.
- [ ] 2.3 Ensure the encoder has no Node-only imports (must run in Edge runtime).

## 3. Provider adapter interface

- [ ] 3.1 Create `src/lib/ai/types.ts` with the `ProviderAdapter` interface, `ProviderError` types (`NetworkError`, `TimeoutError`, `HttpError` with `status`), `Attempt` type, and the reading `Response` schema.
- [ ] 3.2 Create `src/lib/ai/schema.ts` exporting the reading JSON schema (both as a plain JSON Schema object and as a runtime validator function — hand-rolled, no zod dependency to stay Edge-light).

## 4. Provider adapters (one file per provider)

- [ ] 4.1 Create `src/lib/ai/providers/gemini.ts`. Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`. Auth: `?key={GEMINI_API_KEY}` query param. Use `responseMimeType: 'application/json'` + `responseSchema` in the request. Default model `gemini-2.5-flash`.
- [ ] 4.2 Create `src/lib/ai/providers/groq.ts`. Endpoint: `https://api.groq.com/openai/v1/chat/completions`. Auth: `Authorization: Bearer ${GROQ_API_KEY}`. Use `response_format: {type: 'json_object'}` (or `json_schema` if the chosen model supports it). Default model `llama-3.3-70b-versatile`.
- [ ] 4.3 Create `src/lib/ai/providers/openrouter.ts`. Endpoint: `https://openrouter.ai/api/v1/chat/completions`. Auth: `Authorization: Bearer ${OPENROUTER_API_KEY}` + `HTTP-Referer` header. Default model `meta-llama/llama-3.3-70b-instruct:free`.
- [ ] 4.4 Each adapter exposes `send(system, user)` returning `{ raw: string }`, throws `ProviderError` subclasses for classification. Each adapter has a 20-second per-attempt fetch timeout implemented via `AbortController`.
- [ ] 4.5 Each adapter reads its API key from `import.meta.env` and exports a `configured: boolean`. If the key is absent, `configured === false` and the module MUST NOT throw at import time.

## 5. Retry + fallback orchestrator

- [ ] 5.1 Create `src/lib/ai/chain.ts` exporting `generate(system, user, schema, opts)`.
- [ ] 5.2 Build the chain array at module load by filtering adapters by `configured === true` in ranked order `[gemini, groq, openrouter]`.
- [ ] 5.3 Implement per-provider retry loop: up to 3 attempts, exponential backoff `500ms → 1500ms → 4500ms`, retry only on `NetworkError | TimeoutError | HttpError(status >= 500)`.
- [ ] 5.4 On `HttpError(429 | 400 | 401 | 403)` or schema-validation failure, do NOT retry — record the attempt reason, break the retry loop, advance to next provider.
- [ ] 5.5 Response parsing helper: attempt `JSON.parse(raw)`; on failure, extract first `{...}` block via balanced-brace scan and re-parse; validate against the schema; on any failure classify as `schema_validation_failed`.
- [ ] 5.6 Return `{ provider, response, attempts }` on success or throw `ProviderChainExhausted(attempts)` when the chain is empty.

## 6. Reading domain layer

- [ ] 6.1 Create `src/lib/ai/reading/prompt.ts`. Export `buildSystemPrompt()` (static, includes TOON legend + persona + JSON output instructions) and `buildUserPrompt(question, spread)` which composes the TOON payload from question + `SpreadCard[]`.
- [ ] 6.2 Create `src/lib/ai/reading/validate.ts` with a request-side validator: `question` 1–200 chars trimmed, `spread` length ∈ {1,3,10}, each `arcana.name` is a key of `MAJOR_ARCANA_METADATA` or a valid Minor Arcana `{Rank} of {Suit}` combination.
- [ ] 6.3 Create `src/lib/ai/reading/enrich.ts` that, given a client-supplied `spread` (arcana names + pokémon), looks up `keywords` and `uprightMeaning` from `MAJOR_ARCANA_METADATA` / `MINOR_ARCANA_METADATA`. The client does not need to send meaning data — the server pulls it from committed data to avoid trusting client-side text.

## 7. API route

- [ ] 7.1 Create `src/pages/api/reading.ts` exporting `POST` handler.
- [ ] 7.2 Add `export const prerender = false;` at the top of the file (opts this single route into the server runtime).
- [ ] 7.3 Handler flow: parse JSON body → validate → enrich → build prompts → call `generate()` → return `{ provider, cards, synthesis }` (HTTP 200) OR `{ error, attempts }` (HTTP 503) OR `{ error, details }` (HTTP 400).
- [ ] 7.4 Set `runtime = 'edge'` in the config export so this route deploys as an Edge Function.
- [ ] 7.5 Set `Content-Type: application/json` on every response; do not leak provider raw responses on failure.

## 8. UI wiring

- [ ] 8.1 Edit `src/components/spread/SpreadReveal.astro` to add a `<button data-read-fortune hidden>` element inside the reading panel container after `data-reading-panel`. Add matching styles for the button (Cinzel font, accent border, disabled state, loading spinner via CSS).
- [ ] 8.2 Edit `src/components/spread/spread-reveal.ts`: in `showReadingPanel()`, after rendering the template panel, un-hide the button and wire a click handler.
- [ ] 8.3 Click handler flow: disable button, swap label to "The oracle is listening…", POST to `/api/reading` with `{ question, spread: this.slots.map(...) }`, await response.
- [ ] 8.4 On 200: replace each slot's `.rp-card__text` `textContent` with the matching `card.interpretation`, replace `.rp-synthesis__text` with `synthesis`, remove `.rp-ai-note`, append a small "read by <provider>" attribution line.
- [ ] 8.5 On 503 or fetch rejection: re-enable button, append a subtle inline notice element (class `rp-ai-error`) reading "The oracle is quiet — try again in a moment." Do not touch the existing template prose.
- [ ] 8.6 Verify keyboard accessibility: button is `<button type="button">`, focus ring visible, disabled state prevents double-submit.

## 9. Environment configuration

- [ ] 9.1 Update `.env.example` with `GEMINI_API_KEY=`, `GROQ_API_KEY=`, `OPENROUTER_API_KEY=` and one-line comments per key including where to obtain each.
- [ ] 9.2 (Optional overrides) Document `GEMINI_MODEL`, `GROQ_MODEL`, `OPENROUTER_MODEL` env vars in `.env.example` as commented-out defaults.
- [ ] 9.3 Update `README.md` "Quick Start" section: add a note that AI reading requires at least one of the three provider keys to be set locally (or in Vercel project env vars).

## 10. Verification

- [ ] 10.1 With all three provider keys set in `.env`, run `bun run dev`, open `/reading`, complete a 3-card spread with a question, click "Read my fortune". Verify a genuine LLM-generated reading appears, per-card text differs from the template baseline, provider attribution shows correctly.
- [ ] 10.2 With no provider keys set, run `bun run dev`, complete a spread, click the button. Verify the fallback notice appears and the template reading remains intact.
- [ ] 10.3 Simulate a 429 from the primary: temporarily set `GEMINI_API_KEY` to a known-invalid string; verify the reading still succeeds via Groq and the response `provider` field is `"groq"`.
- [ ] 10.4 Simulate total failure: set all three keys to invalid strings; verify the API returns 503 and the client shows the graceful failure notice.
- [ ] 10.5 Run `bun run build` with no provider keys set; verify the build completes without network activity and produces the same static output as before this change (plus one function under `.vercel/output/functions/api/reading.func`).
- [ ] 10.6 Run `bun run build` on a Vercel preview deployment; verify `/api/reading` responds correctly on the preview URL and every other route is served as static HTML (check `x-vercel-cache` / `x-matched-path` response headers).
- [ ] 10.7 Manually inspect network payload sent to Gemini in browser dev tools (or via a `console.log` in dev): confirm the body is TOON-encoded and roughly 30–50% smaller than the equivalent JSON payload.
- [ ] 10.8 Draw a 1-card spread and a 10-card Celtic Cross spread; verify the API returns correctly-sized `cards` arrays for each.
- [ ] 10.9 Type-check clean: `bun run typecheck` passes.
- [ ] 10.10 Lint clean: `bun run lint` passes.
