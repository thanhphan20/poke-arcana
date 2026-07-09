export const prerender = false;

import type { APIRoute } from 'astro';
import { generate } from '../../lib/ai/chain';
import { buildSystemPrompt, buildUserPrompt } from '../../lib/ai/reading/prompt';
import { enrichSpread } from '../../lib/ai/reading/enrich';
import { validateReadingRequest } from '../../lib/ai/reading/validate';
import { ProviderChainExhausted } from '../../lib/ai/types';

export const config = { runtime: 'edge' };

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request', details: ['Request body must be valid JSON.'] }, 400);
  }

  const { errors, value } = validateReadingRequest(body);
  if (errors.length > 0 || !value) {
    return json({ error: 'invalid_request', details: errors }, 400);
  }

  const promptCards = enrichSpread(value.spread);
  const system = buildSystemPrompt();
  const user = buildUserPrompt(value.question, promptCards);

  try {
    const { provider, response } = await generate(system, user, value.spread.length);
    return json({ provider, cards: response.cards, synthesis: response.synthesis }, 200);
  } catch (err) {
    if (err instanceof ProviderChainExhausted) {
      return json({ error: 'provider_chain_exhausted', attempts: err.attempts }, 503);
    }
    return json({ error: 'provider_chain_exhausted', attempts: [] }, 503);
  }
};
