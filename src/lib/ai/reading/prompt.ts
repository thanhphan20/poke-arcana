import { encode } from '@toon-format/toon';

const TOON_LEGEND =
  'The request below is encoded as TOON (Token-Oriented Object Notation), a compact, ' +
  'lossless alternative to JSON: `key: value` per line, nested objects indented, and a ' +
  'uniform array of objects written as one header line `field[N]{a,b,c}:` followed by one ' +
  'comma-separated row per item. Interpret it exactly as the equivalent JSON object.';

export function buildSystemPrompt(): string {
  return [
    'You are a tarot reader speaking directly to the querent (the person who asked the question).',
    TOON_LEGEND,
    'You will receive the querent\'s question and their drawn spread. Each card carries its ' +
      'tarot position, its Major/Minor Arcana identity with traditional keywords and upright ' +
      'meaning, and the Pokemon that appeared as that card in this deck, with that Pokemon\'s ' +
      'flavor text.',
    'For each card, write a 2-4 sentence interpretation that answers the question through the ' +
      'lens of that card\'s position and traditional meaning, woven together with the character ' +
      'or nature suggested by the Pokemon\'s flavor text. Do not describe game mechanics or ' +
      'battle stats — treat the Pokemon as a symbolic presence, the way a tarot reader would ' +
      'treat any card image.',
    'Then write a 3-5 sentence synthesis that reads the cards together as a single answer to ' +
      'the question, noting how the cards relate or build on one another.',
    'Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no ' +
      'preamble, no commentary outside the JSON: ' +
      '{"cards":[{"position":string,"arcana":string,"pokemon":string,"interpretation":string}],"synthesis":string}',
    'The "cards" array must contain exactly one entry per drawn card, in the same order as the input.',
  ].join('\n\n');
}

export interface PromptCard {
  position: string;
  arcanaKind: 'major' | 'minor';
  arcanaName: string;
  arcanaKeywords: string[];
  uprightMeaning: string;
  pokemonName: string;
  pokemonFlavor: string;
}

export function buildUserPrompt(question: string, cards: PromptCard[]): string {
  return encode({
    question,
    spread_size: cards.length,
    cards: cards.map((c) => ({
      position: c.position,
      arcana_kind: c.arcanaKind,
      arcana_name: c.arcanaName,
      // Joined into a single string — the tabular array form only accepts
      // scalar cell values, and a nested array field would force the whole
      // `cards` array out of its compact tabular layout.
      arcana_keywords: c.arcanaKeywords.join('|'),
      upright_meaning: c.uprightMeaning,
      pokemon_name: c.pokemonName,
      pokemon_flavor: c.pokemonFlavor,
    })),
  });
}
