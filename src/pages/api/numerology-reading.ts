export const prerender = false;

import type { APIRoute } from 'astro';
import { generateNumerologyWeave } from '../../lib/ai/numerology/chain';
import { buildNumerologySystemPrompt, buildNumerologyUserPrompt } from '../../lib/ai/numerology/prompt';
import { validateNumerologyRequest } from '../../lib/ai/numerology/validate';
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

  const { errors, value } = validateNumerologyRequest(body);
  if (errors.length > 0 || !value) {
    return json({ error: 'invalid_request', details: errors }, 400);
  }

  const system = buildNumerologySystemPrompt(value.domain);
  const user = buildNumerologyUserPrompt(value.numbers, value.domain);

  try {
    const { provider, synthesis } = await generateNumerologyWeave(system, user);
    return json({ provider, synthesis }, 200);
  } catch (err) {
    if (err instanceof ProviderChainExhausted) {
      return json({ error: 'provider_chain_exhausted', attempts: err.attempts }, 503);
    }
    return json({ error: 'provider_chain_exhausted', attempts: [] }, 503);
  }
};
