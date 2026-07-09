import type { ProviderAdapter } from '../types';
import { fetchJson } from '../http';
import { HttpError } from '../types';

const API_KEY = import.meta.env.OPENROUTER_API_KEY as string | undefined;
const MODEL = (import.meta.env.OPENROUTER_MODEL as string | undefined) ?? 'meta-llama/llama-3.3-70b-instruct:free';

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export function createOpenRouterAdapter(): ProviderAdapter {
  return {
    name: 'openrouter',
    configured: Boolean(API_KEY),

    async send(system: string, user: string) {
      if (!API_KEY) throw new HttpError(401, 'OPENROUTER_API_KEY not configured');

      const data = (await fetchJson('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          'HTTP-Referer': 'https://poke-arcana.vercel.app',
          'X-Title': 'Poke-Arcana',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      })) as OpenRouterResponse;

      const raw = data.choices?.[0]?.message?.content;
      if (!raw) throw new HttpError(502, 'OpenRouter returned no content');
      return { raw };
    },
  };
}
