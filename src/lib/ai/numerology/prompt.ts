import { encode } from '@toon-format/toon';

const DOMAIN_FRAMING: Record<'career' | 'love' | 'purpose', string> = {
  career: 'their work, ambition, and how they operate professionally',
  love: 'their relationships, how they connect with others, and what they need from a partner',
  purpose: 'their broader sense of meaning and what they\'re here to do with their life',
};

export function buildNumerologySystemPrompt(domain: 'career' | 'love' | 'purpose'): string {
  return [
    'You are a numerologist speaking directly to the querent about their own numbers.',
    'You will receive four Pythagorean numbers already computed for them: Life Path ' +
      '(from their birth date — their overall life direction), Expression/Destiny (from ' +
      'every letter of their full name — their natural talents), Soul Urge (from the vowels ' +
      'in their name — their inner motivation), and Personality (from the consonants in ' +
      'their name — the impression they give others). Each is a number 1-9 or a master ' +
      'number (11, 22, 33).',
    `Write ONE flowing synthesis, 150-220 words, as continuous prose (no headers, no bullet ` +
      `list, no restating each number in a rigid "X is Y" format) that reads all four numbers ` +
      `together as a single portrait, focused specifically on ${DOMAIN_FRAMING[domain]}. ` +
      'Explain how the four numbers reinforce or create tension with each other in that ' +
      'specific area of life — not a generic reading, one scoped to this lens.',
    'Keep the register warm and empowering, addressing the querent about their own life. ' +
      'Do not simply restate the number-to-archetype mapping already shown elsewhere on the ' +
      'page — synthesize how they interact.',
    'Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no ' +
      'preamble, no commentary outside the JSON: {"synthesis": string}',
  ].join('\n\n');
}

export interface NumerologyPromptNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

export function buildNumerologyUserPrompt(numbers: NumerologyPromptNumbers, domain: 'career' | 'love' | 'purpose'): string {
  return encode({
    domain,
    numbers: {
      life_path: numbers.lifePath,
      expression: numbers.expression,
      soul_urge: numbers.soulUrge,
      personality: numbers.personality,
    },
  });
}
