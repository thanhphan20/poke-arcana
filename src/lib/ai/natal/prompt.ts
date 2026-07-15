import { encode } from '@toon-format/toon';

const TOON_LEGEND =
  'The request below is encoded as TOON (Token-Oriented Object Notation), a compact, ' +
  'lossless alternative to JSON: `key: value` per line, nested objects indented, and a ' +
  'uniform array of objects written as one header line `field[N]{a,b,c}:` followed by one ' +
  'comma-separated row per item. Interpret it exactly as the equivalent JSON object.';

export function buildNatalSystemPrompt(): string {
  return [
    'You are an astrologer-tarot reader speaking directly to the querent about their own birth chart.',
    TOON_LEGEND,
    'You will receive every placement in their chart (Sun, Moon, Rising if known, and the ' +
      'eight other classical/modern planets), each already mapped onto one of this deck\'s ' +
      'Major Arcana cards via its ruling zodiac sign, and that card\'s Pokemon (this deck ' +
      'replaces every tarot image with a Pokemon, so the Pokemon IS the card\'s illustration, ' +
      'not decoration bolted onto it).',
    'Write ONE flowing synthesis, 150-220 words, as continuous prose (no headers, no bullet ' +
      'list, no restating each placement in a rigid "X is in Y" format) that reads the whole ' +
      'chart together as a single portrait of this person — how their core self (Sun), inner ' +
      'emotional world (Moon), and the other placements interact, reinforce, or create tension ' +
      'with each other. Reference at least 4-5 of the specific Pokemon/cards by name, woven ' +
      'naturally into the sentence rather than listed — e.g. explain how the steady confidence ' +
      'of one placement\'s Pokemon tempers or clashes with the restless energy of another\'s, ' +
      'not "Your Sun is X and your Mars is Y."',
    'Do not describe game mechanics, battle stats, or competitive strength — treat each Pokemon ' +
      'as a symbolic presence the way a tarot reader would treat a card image. Translate any ' +
      'Pokemon nature into a plain-language temperament (calm, restless, protective, playful, ' +
      'watchful, methodical, elusive, and so on) before using it. Never use "evolve"/"evolution" ' +
      'or other game-specific vocabulary (battle, level, stats, ability, move, type, catch, ' +
      'breed, hatch) even metaphorically. Keep the register warm and empowering, addressing the ' +
      'querent about their own life.',
    'Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no ' +
      'preamble, no commentary outside the JSON: {"synthesis": string}',
  ].join('\n\n');
}

export interface NatalPromptPoint {
  label: string; // "Sun", "Moon", "Rising", "Mercury", ...
  sign: string;
  cardName: string;
  keywords: string[];
  uprightMeaning: string;
  pokemonName: string;
}

export function buildNatalUserPrompt(points: NatalPromptPoint[]): string {
  return encode({
    point_count: points.length,
    points: points.map((p) => ({
      label: p.label,
      sign: p.sign,
      card_name: p.cardName,
      // Joined into a single string — the tabular array form only accepts
      // scalar cell values (same convention as reading/prompt.ts).
      keywords: p.keywords.join('|'),
      upright_meaning: p.uprightMeaning,
      pokemon_name: p.pokemonName,
    })),
  });
}
