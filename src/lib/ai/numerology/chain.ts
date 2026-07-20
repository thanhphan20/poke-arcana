import { runProviderChain } from '../chain';
import { synthesisJsonSchema, validateSynthesisResponse, type SynthesisResponse } from '../schema';
import type { Attempt } from '../types';

export interface NumerologyGenerateResult {
  provider: string;
  synthesis: string;
  attempts: Attempt[];
}

export async function generateNumerologyWeave(system: string, user: string): Promise<NumerologyGenerateResult> {
  const { provider, response, attempts } = await runProviderChain<SynthesisResponse>(
    synthesisJsonSchema(),
    validateSynthesisResponse,
    system,
    user,
  );
  return { provider, synthesis: response.synthesis, attempts };
}
