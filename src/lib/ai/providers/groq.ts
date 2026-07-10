import type { ProviderAdapter } from '../types';
import { fetchJson } from '../http';
import { HttpError } from '../types';

const API_KEY = import.meta.env.GROQ_API_KEY as string | undefined;
const MODEL = (import.meta.env.GROQ_MODEL as string | undefined) ?? 'llama-3.3-70b-versatile';

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export function createGroqAdapter(): ProviderAdapter {
  return {
    name: 'groq',
    configured: Boolean(API_KEY),

    async send(system: string, user: string) {
      if (!API_KEY) throw new HttpError(401, 'GROQ_API_KEY not configured');

      const data = (await fetchJson('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
        }),
      })) as GroqResponse;

      const raw = data.choices?.[0]?.message?.content;
      if (!raw) throw new HttpError(502, 'Groq returned no content');
      return { raw };
    },
  };
}
