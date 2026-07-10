import { MAJOR_ARCANA_METADATA } from '../../arcana/tarot-metadata';
import { SUIT_META } from '../../arcana/meanings';

const RANK_NAMES = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King',
] as const;

const VALID_SPREAD_SIZES = new Set([1, 3, 10]);

const VALID_MINOR_NAMES = new Set(
  Object.values(SUIT_META).flatMap((suit) => RANK_NAMES.map((rank) => `${rank} of ${suit.name}`)),
);

export interface RequestCardInput {
  position: string;
  arcana: { kind: 'major' | 'minor'; name: string };
  pokemon: { name: string; flavor: string };
}

export interface ReadingRequestInput {
  question: string;
  spread: RequestCardInput[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export function isKnownArcanaName(name: string): boolean {
  return Boolean(MAJOR_ARCANA_METADATA[name]) || VALID_MINOR_NAMES.has(name);
}

/** Validates the raw request body shape before any provider is contacted. */
export function validateReadingRequest(body: unknown): { errors: ValidationError[]; value?: ReadingRequestInput } {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    return { errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }
  const b = body as Record<string, unknown>;

  const question = typeof b.question === 'string' ? b.question.trim() : '';
  if (!question || question.length > 200) {
    errors.push({ field: 'question', message: 'question must be a non-empty string of at most 200 characters.' });
  }

  const spread = b.spread;
  if (!Array.isArray(spread) || !VALID_SPREAD_SIZES.has(spread.length)) {
    errors.push({ field: 'spread', message: 'spread must be an array of length 1, 3, or 10.' });
    return { errors };
  }

  for (let i = 0; i < spread.length; i++) {
    const card = spread[i] as Record<string, unknown>;
    const arcana = card?.arcana as Record<string, unknown> | undefined;
    const pokemon = card?.pokemon as Record<string, unknown> | undefined;

    if (typeof card?.position !== 'string' || !card.position) {
      errors.push({ field: `spread[${i}].position`, message: 'position must be a non-empty string.' });
    }
    if (!arcana || (arcana.kind !== 'major' && arcana.kind !== 'minor') || typeof arcana.name !== 'string') {
      errors.push({ field: `spread[${i}].arcana`, message: 'arcana.kind and arcana.name are required.' });
    } else if (!isKnownArcanaName(arcana.name)) {
      errors.push({ field: `spread[${i}].arcana.name`, message: `Unknown arcana name "${arcana.name}".` });
    }
    if (!pokemon || typeof pokemon.name !== 'string' || typeof pokemon.flavor !== 'string') {
      errors.push({ field: `spread[${i}].pokemon`, message: 'pokemon.name and pokemon.flavor are required.' });
    }
  }

  if (errors.length > 0) return { errors };

  return {
    errors: [],
    value: { question, spread: spread as RequestCardInput[] },
  };
}
