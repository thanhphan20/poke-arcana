import type { ReadingCard, ReadingResponse } from './types';

/** JSON Schema for the reading response, parameterized by expected card count. */
export function readingJsonSchema(cardCount: number) {
  return {
    type: 'object',
    properties: {
      cards: {
        type: 'array',
        minItems: cardCount,
        maxItems: cardCount,
        items: {
          type: 'object',
          properties: {
            position: { type: 'string' },
            arcana: { type: 'string' },
            pokemon: { type: 'string' },
            interpretation: { type: 'string' },
          },
          required: ['position', 'arcana', 'pokemon', 'interpretation'],
        },
      },
      synthesis: { type: 'string' },
    },
    required: ['cards', 'synthesis'],
  } as const;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isReadingCard(v: unknown): v is ReadingCard {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    isNonEmptyString(c.position) &&
    isNonEmptyString(c.arcana) &&
    isNonEmptyString(c.pokemon) &&
    isNonEmptyString(c.interpretation)
  );
}

/** Validates a parsed candidate object against the reading response shape and expected card count. */
export function validateReadingResponse(candidate: unknown, cardCount: number): candidate is ReadingResponse {
  if (typeof candidate !== 'object' || candidate === null) return false;
  const obj = candidate as Record<string, unknown>;
  if (!isNonEmptyString(obj.synthesis)) return false;
  if (!Array.isArray(obj.cards) || obj.cards.length !== cardCount) return false;
  return obj.cards.every(isReadingCard);
}

/** Attempts JSON.parse, then falls back to extracting the first balanced {...} block. */
export function parseJsonLoose(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    // fall through to brace extraction
  }

  const start = raw.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) {
        const candidate = raw.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
