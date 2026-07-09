import type { ProviderAdapter } from '../types';
import { fetchJson } from '../http';
import { HttpError } from '../types';

const API_KEY = import.meta.env.GEMINI_API_KEY as string | undefined;
const MODEL = (import.meta.env.GEMINI_MODEL as string | undefined) ?? 'gemini-2.5-flash';

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export function createGeminiAdapter(responseSchema: object): ProviderAdapter {
  return {
    name: 'gemini',
    configured: Boolean(API_KEY),

    async send(system: string, user: string) {
      if (!API_KEY) throw new HttpError(401, 'GEMINI_API_KEY not configured');

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
      const body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      };

      const data = (await fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })) as GeminiResponse;

      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new HttpError(502, 'Gemini returned no content');
      return { raw };
    },
  };
}
