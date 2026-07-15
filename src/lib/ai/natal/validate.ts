import type { NatalPromptPoint } from './prompt';

export interface ValidationError {
  field: string;
  message: string;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => typeof s === 'string');
}

function isValidPoint(v: unknown): v is NatalPromptPoint {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    isNonEmptyString(p.label) &&
    isNonEmptyString(p.sign) &&
    isNonEmptyString(p.cardName) &&
    isStringArray(p.keywords) &&
    isNonEmptyString(p.uprightMeaning) &&
    isNonEmptyString(p.pokemonName)
  );
}

/** A natal-chart request needs at least Sun+Moon and no more than the 11 total points this app computes. */
export function validateNatalRequest(body: unknown): { errors: ValidationError[]; value?: { points: NatalPromptPoint[] } } {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    return { errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const points = (body as Record<string, unknown>).points;
  if (!Array.isArray(points) || points.length < 2 || points.length > 11) {
    errors.push({ field: 'points', message: 'points must be an array of 2-11 chart placements.' });
    return { errors };
  }

  if (!points.every(isValidPoint)) {
    errors.push({
      field: 'points',
      message: 'Each point needs label, sign, cardName, keywords (string[]), uprightMeaning, pokemonName.',
    });
    return { errors };
  }

  return { errors: [], value: { points: points as NatalPromptPoint[] } };
}
