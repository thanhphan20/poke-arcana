import { createGeminiAdapter } from '../providers/gemini';
import { createGroqAdapter } from '../providers/groq';
import { createOpenRouterAdapter } from '../providers/openrouter';
import { parseJsonLoose } from '../schema';
import { isRetryable, classifyTerminal, sleep, RETRY_BACKOFF_MS, MAX_PROVIDER_ATTEMPTS } from '../chain';
import { numerologyJsonSchema, validateNumerologyResponse, type NumerologyResponse } from './schema';
import { HttpError, ProviderChainExhausted, type Attempt, type ProviderAdapter } from '../types';

async function tryProvider(adapter: ProviderAdapter, system: string, user: string): Promise<NumerologyResponse | Attempt> {
  for (let attempt = 0; attempt < MAX_PROVIDER_ATTEMPTS; attempt++) {
    try {
      const { raw } = await adapter.send(system, user);
      const parsed = parseJsonLoose(raw);
      if (!parsed || !validateNumerologyResponse(parsed)) {
        return { provider: adapter.name, reason: 'schema_validation_failed' };
      }
      return parsed;
    } catch (err) {
      if (!isRetryable(err)) {
        return { provider: adapter.name, reason: classifyTerminal(err) };
      }
      if (attempt === MAX_PROVIDER_ATTEMPTS - 1) {
        return {
          provider: adapter.name,
          reason: err instanceof HttpError ? '5xx_retry_exhausted' : 'network_timeout',
        };
      }
      await sleep(RETRY_BACKOFF_MS[attempt]);
    }
  }
  return { provider: adapter.name, reason: '5xx_retry_exhausted' };
}

function isAttempt(x: NumerologyResponse | Attempt): x is Attempt {
  return 'reason' in x;
}

export interface NumerologyGenerateResult {
  provider: string;
  synthesis: string;
  attempts: Attempt[];
}

export async function generateNumerologyWeave(system: string, user: string): Promise<NumerologyGenerateResult> {
  const schema = numerologyJsonSchema();
  const adapters = [createGeminiAdapter(schema), createGroqAdapter(), createOpenRouterAdapter()];

  const attempts: Attempt[] = [];
  const chain = adapters.filter((a) => a.configured);

  if (chain.length === 0) {
    throw new ProviderChainExhausted([{ provider: 'none', reason: 'no_key' }]);
  }

  for (const adapter of chain) {
    const result = await tryProvider(adapter, system, user);
    if (isAttempt(result)) {
      attempts.push(result);
      continue;
    }
    return { provider: adapter.name, synthesis: result.synthesis, attempts };
  }

  throw new ProviderChainExhausted(attempts);
}
