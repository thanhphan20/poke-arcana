import type { NumerologyPromptNumbers } from './prompt';
import { type ValidationError, isFiniteNumber } from '../validation';

const VALID_DOMAINS = new Set(['career', 'love', 'purpose']);

function isValidNumbers(v: unknown): v is NumerologyPromptNumbers {
  if (typeof v !== 'object' || v === null) return false;
  const n = v as Record<string, unknown>;
  return (
    isFiniteNumber(n.lifePath) &&
    isFiniteNumber(n.expression) &&
    isFiniteNumber(n.soulUrge) &&
    isFiniteNumber(n.personality)
  );
}

/** A numerology-weave request needs all four computed numbers and one of the three domains. */
export function validateNumerologyRequest(
  body: unknown,
): { errors: ValidationError[]; value?: { numbers: NumerologyPromptNumbers; domain: 'career' | 'love' | 'purpose' } } {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    return { errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const { numbers, domain } = body as Record<string, unknown>;

  if (!isValidNumbers(numbers)) {
    errors.push({
      field: 'numbers',
      message: 'numbers must include lifePath, expression, soulUrge, and personality as finite numbers.',
    });
  }

  if (typeof domain !== 'string' || !VALID_DOMAINS.has(domain)) {
    errors.push({ field: 'domain', message: 'domain must be one of "career", "love", or "purpose".' });
  }

  if (errors.length > 0) return { errors };

  return {
    errors: [],
    value: { numbers: numbers as NumerologyPromptNumbers, domain: domain as 'career' | 'love' | 'purpose' },
  };
}
