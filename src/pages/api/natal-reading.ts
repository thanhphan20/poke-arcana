export const prerender = false;

import type { APIRoute } from 'astro';
import { generateNatalSynthesis } from '../../lib/ai/natal/chain';
import { buildNatalSystemPrompt, buildNatalUserPrompt } from '../../lib/ai/natal/prompt';
import { validateNatalRequest } from '../../lib/ai/natal/validate';
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

  const { errors, value } = validateNatalRequest(body);
  if (errors.length > 0 || !value) {
    return json({ error: 'invalid_request', details: errors }, 400);
  }

  const system = buildNatalSystemPrompt();
  const user = buildNatalUserPrompt(value.points);

  try {
    const { provider, synthesis } = await generateNatalSynthesis(system, user);
    return json({ provider, synthesis }, 200);
  } catch (err) {
    if (err instanceof ProviderChainExhausted) {
      return json({ error: 'provider_chain_exhausted', attempts: err.attempts }, 503);
    }
    return json({ error: 'provider_chain_exhausted', attempts: [] }, 503);
  }
};
