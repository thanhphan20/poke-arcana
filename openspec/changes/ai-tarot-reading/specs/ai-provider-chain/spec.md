## ADDED Requirements

### Requirement: Provider-agnostic client interface

The system SHALL expose a single `generate(system, user, schema)` entry point that internally dispatches across ranked LLM providers, hiding per-provider request shapes, auth, and response formats behind a uniform contract.

#### Scenario: Uniform call site regardless of provider

- **WHEN** a caller invokes `generate(system, user, schema)` from the API route
- **THEN** the caller MUST NOT need to know which provider handled the request; only the final response object and the `provider` field indicating which one succeeded.

#### Scenario: Provider adapter isolation

- **WHEN** a new provider is added
- **THEN** the change MUST be scoped to a single adapter file conforming to the `ProviderAdapter` interface, with no edits required to the retry/fallback orchestrator.

### Requirement: Ranked fallback chain

The system SHALL attempt providers in a deterministic ranked order — `gemini` → `groq` → `openrouter` — advancing to the next provider only when the current one returns a non-retryable failure or exhausts its retry budget.

#### Scenario: Primary succeeds on first try

- **WHEN** Gemini returns a valid 200 response
- **THEN** the system MUST NOT contact Groq or OpenRouter for that request.

#### Scenario: Primary exhausts retries, fallback succeeds

- **WHEN** Gemini returns 5xx responses for every retry attempt
- **AND** Groq subsequently returns a valid 200 response
- **THEN** the system MUST return the Groq response with `provider: "groq"` and MUST NOT contact OpenRouter.

#### Scenario: All providers fail

- **WHEN** every configured provider exhausts its retries or returns a non-retryable failure
- **THEN** the system MUST return HTTP 503 with an `attempts` array summarizing why each provider failed, in order.

### Requirement: Per-provider retry policy for transient failures

The system SHALL retry the current provider up to 3 total attempts on transient failures (network errors, request timeout, HTTP 5xx) with exponential backoff (500ms, 1500ms, 4500ms).

#### Scenario: 5xx then success on retry

- **WHEN** a provider returns HTTP 502 on the first attempt
- **AND** returns HTTP 200 on the second attempt
- **THEN** the system MUST return the second-attempt response and MUST NOT rotate to the next provider.

#### Scenario: Retry budget exhausted

- **WHEN** a provider returns HTTP 500 on all 3 attempts
- **THEN** the system MUST record the attempts and rotate to the next provider in the chain.

#### Scenario: Network timeout is retryable

- **WHEN** a provider request exceeds the per-attempt timeout (default 20s)
- **THEN** the system MUST treat the attempt as retryable and, if retry budget remains, wait the backoff interval before the next attempt.

### Requirement: Reactive rate-limit and terminal-error rotation

The system SHALL treat HTTP 429, HTTP 401, HTTP 403, HTTP 400, and schema-validation failure as **non-retryable** — the current provider MUST be abandoned immediately and the chain MUST advance to the next provider without retry-waiting on the failed one.

#### Scenario: 429 rotates immediately

- **WHEN** Gemini returns HTTP 429
- **THEN** the system MUST NOT wait for any `Retry-After` header
- **AND** MUST immediately dispatch the request to Groq.

#### Scenario: Auth error rotates immediately

- **WHEN** Groq returns HTTP 401 or HTTP 403
- **THEN** the system MUST NOT retry Groq
- **AND** MUST advance to OpenRouter.

#### Scenario: Malformed response rotates

- **WHEN** a provider returns HTTP 200 whose body cannot be parsed into the requested schema (even after the prose-extraction fallback described below)
- **THEN** the system MUST record the attempt as `schema_validation_failed` and advance to the next provider.

### Requirement: No persisted rate-limit state

The system SHALL NOT persist rate-limit or cooldown state across requests. Each `/api/reading` invocation SHALL rediscover provider availability from scratch.

#### Scenario: Independent invocations

- **WHEN** invocation A rotates from Gemini to Groq at time T because Gemini 429s
- **AND** invocation B arrives at time T + 2 seconds
- **THEN** invocation B MUST attempt Gemini first, independently of invocation A's outcome.

### Requirement: Absent-key provider skipping

The system SHALL skip any provider whose API key environment variable is unset at module load time; the chain SHALL be composed only of providers whose keys are configured.

#### Scenario: Only Groq configured

- **WHEN** only `GROQ_API_KEY` is set (Gemini and OpenRouter keys are unset)
- **THEN** the chain MUST consist of `[groq]` and MUST NOT attempt calls to Gemini or OpenRouter.

#### Scenario: No providers configured

- **WHEN** no provider keys are set
- **THEN** the system MUST return HTTP 503 with an explanatory error at request time, without contacting any provider.

### Requirement: Structured-output enforcement

The system SHALL request structured JSON output from every provider via each provider's native mechanism (Gemini `responseSchema`, OpenAI-compatible `response_format: json_schema`, or model-appropriate fallback) and SHALL validate the returned body against the caller-supplied JSON schema before returning success.

#### Scenario: Native JSON schema succeeds

- **WHEN** a provider supports and honors `response_format: json_schema`
- **AND** the returned body parses and validates against the schema
- **THEN** the system MUST return the parsed object.

#### Scenario: Prose-wrapped JSON extraction

- **WHEN** a provider returns HTTP 200 with a body that is not directly parseable as JSON but contains a `{...}` block that parses and validates against the schema
- **THEN** the system MUST return the extracted object as success.

#### Scenario: Neither parse strategy succeeds

- **WHEN** neither direct-parse nor prose-extraction produces a schema-valid object
- **THEN** the system MUST classify the attempt as `schema_validation_failed` and rotate to the next provider.

### Requirement: Attempt trail in failure response

The system SHALL, on final failure, include an `attempts` array in the 503 response containing an entry per provider attempted with `provider` name and `reason` code (`5xx_retry_exhausted`, `network_timeout`, `429`, `401_403`, `bad_request`, `schema_validation_failed`, `no_key`).

#### Scenario: All three providers fail differently

- **WHEN** Gemini 429s, Groq exhausts retries with 500s, and OpenRouter returns unparseable content
- **THEN** the 503 body's `attempts` MUST be `[{provider:"gemini",reason:"429"},{provider:"groq",reason:"5xx_retry_exhausted"},{provider:"openrouter",reason:"schema_validation_failed"}]` in that exact order.
