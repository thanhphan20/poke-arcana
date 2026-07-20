/** JSON Schema for the numerology-weave response — a single prose paragraph. */
export function numerologyJsonSchema() {
  return {
    type: 'object',
    properties: {
      synthesis: { type: 'string' },
    },
    required: ['synthesis'],
  } as const;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export interface NumerologyResponse {
  synthesis: string;
}

export function validateNumerologyResponse(candidate: unknown): candidate is NumerologyResponse {
  if (typeof candidate !== 'object' || candidate === null) return false;
  return isNonEmptyString((candidate as Record<string, unknown>).synthesis);
}
