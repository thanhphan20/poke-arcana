import { createGeminiAdapter } from './providers/gemini';
import { createGroqAdapter } from './providers/groq';
import { createOpenRouterAdapter } from './providers/openrouter';
import { parseJsonLoose, validateReadingResponse, readingJsonSchema } from './schema';
import {
  HttpError,
  ProviderChainExhausted,
  type Attempt,
  type FailureReason,
  type GenerateResult,
  type ProviderAdapter,
  type ReadingResponse,
} from './types';

const MAX_ATTEMPTS_PER_PROVIDER = 3;
const BACKOFF_MS = [500, 1500, 4500];

export function isRetryable(err: unknown): boolean {
  if (err instanceof HttpError) return err.status >= 500;
  // NetworkError and TimeoutError are always retryable.
  return !(err instanceof HttpError);
}

export function classifyTerminal(err: unknown): FailureReason {
  if (err instanceof HttpError) {
    if (err.status === 429) return '429';
    if (err.status === 401 || err.status === 403) return '401_403';
    if (err.status >= 400 && err.status < 500) return 'bad_request';
  }
  return '5xx_retry_exhausted';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAttempt<T extends object>(x: T | Attempt): x is Attempt {
  return 'reason' in x;
}

/**
 * Attempts a single provider with retry-on-transient-failure, validating the
 * parsed response against the caller-supplied type guard. Returns the parsed
 * response on success, or an Attempt describing why this provider was skipped.
 */
async function tryProvider<T extends object>(
  adapter: ProviderAdapter,
  system: string,
  user: string,
  validate: (candidate: unknown) => candidate is T,
): Promise<T | Attempt> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
    try {
      const { raw } = await adapter.send(system, user);
      const parsed = parseJsonLoose(raw);
      if (!parsed || !validate(parsed)) {
        return { provider: adapter.name, reason: 'schema_validation_failed' };
      }
      return parsed;
    } catch (err) {
      if (!isRetryable(err)) {
        return { provider: adapter.name, reason: classifyTerminal(err) };
      }
      if (attempt === MAX_ATTEMPTS_PER_PROVIDER - 1) {
        return {
          provider: adapter.name,
          reason: err instanceof HttpError ? '5xx_retry_exhausted' : 'network_timeout',
        };
      }
      await sleep(BACKOFF_MS[attempt]);
    }
  }
  // Unreachable, but satisfies control-flow analysis.
  return { provider: adapter.name, reason: '5xx_retry_exhausted' };
}

/**
 * Runs a caller-supplied JSON schema + type guard through the shared
 * provider fallback chain (Gemini -> Groq -> OpenRouter), retrying transient
 * failures and rotating providers on validation or terminal errors. Every
 * prompt chain (reading, natal, numerology) shares this so the retry/fallback
 * policy lives in exactly one place.
 */
export async function runProviderChain<T extends object>(
  jsonSchema: object,
  validate: (candidate: unknown) => candidate is T,
  system: string,
  user: string,
): Promise<{ provider: string; response: T; attempts: Attempt[] }> {
  const adapters = [createGeminiAdapter(jsonSchema), createGroqAdapter(), createOpenRouterAdapter()];

  const attempts: Attempt[] = [];
  const chain = adapters.filter((a) => a.configured);

  if (chain.length === 0) {
    throw new ProviderChainExhausted([{ provider: 'none', reason: 'no_key' }]);
  }

  for (const adapter of chain) {
    const result = await tryProvider(adapter, system, user, validate);
    if (isAttempt(result)) {
      attempts.push(result);
      continue;
    }
    return { provider: adapter.name, response: result, attempts };
  }

  throw new ProviderChainExhausted(attempts);
}

export async function generate(system: string, user: string, cardCount: number): Promise<GenerateResult> {
  const { provider, response, attempts } = await runProviderChain<ReadingResponse>(
    readingJsonSchema(cardCount),
    (candidate): candidate is ReadingResponse => validateReadingResponse(candidate, cardCount),
    system,
    user,
  );
  return { provider, response, attempts };
}
