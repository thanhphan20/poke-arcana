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

// Exported so other prompt chains (e.g. natal/chain.ts) can reuse the same
// retry/classification policy without duplicating it.
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

export const RETRY_BACKOFF_MS = BACKOFF_MS;
export const MAX_PROVIDER_ATTEMPTS = MAX_ATTEMPTS_PER_PROVIDER;

/**
 * Attempts a single provider with retry-on-transient-failure. Returns the
 * raw response text on success, or throws to signal the chain should
 * rotate to the next provider (recording why via the returned Attempt).
 */
async function tryProvider(
  adapter: ProviderAdapter,
  system: string,
  user: string,
  cardCount: number,
): Promise<ReadingResponse | Attempt> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
    try {
      const { raw } = await adapter.send(system, user);
      const parsed = parseJsonLoose(raw);
      if (!parsed || !validateReadingResponse(parsed, cardCount)) {
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

function isAttempt(x: ReadingResponse | Attempt): x is Attempt {
  return 'reason' in x;
}

export async function generate(system: string, user: string, cardCount: number): Promise<GenerateResult> {
  const schema = readingJsonSchema(cardCount);
  const adapters = [createGeminiAdapter(schema), createGroqAdapter(), createOpenRouterAdapter()];

  const attempts: Attempt[] = [];
  const chain = adapters.filter((a) => a.configured);

  if (chain.length === 0) {
    throw new ProviderChainExhausted([{ provider: 'none', reason: 'no_key' }]);
  }

  for (const adapter of chain) {
    const result = await tryProvider(adapter, system, user, cardCount);
    if (isAttempt(result)) {
      attempts.push(result);
      continue;
    }
    return { provider: adapter.name, response: result, attempts };
  }

  throw new ProviderChainExhausted(attempts);
}
