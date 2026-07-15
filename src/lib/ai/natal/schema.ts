/** JSON Schema for the natal-synthesis response — a single prose paragraph, not per-card entries. */
export function natalJsonSchema() {
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

export interface NatalResponse {
  synthesis: string;
}

export function validateNatalResponse(candidate: unknown): candidate is NatalResponse {
  if (typeof candidate !== 'object' || candidate === null) return false;
  return isNonEmptyString((candidate as Record<string, unknown>).synthesis);
}
