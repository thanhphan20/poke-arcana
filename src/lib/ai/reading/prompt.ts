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
    'This deck replaces every traditional tarot image with a Pokemon, so each card\'s Pokemon ' +
      'IS its illustration — the querent is reading a Pokemon-tarot deck, not tarot with a ' +
      'Pokemon mentioned as decoration. Every interpretation MUST make the symbolic link ' +
      'explicit: state, in your own words, why this specific Pokemon\'s nature or flavor text ' +
      'embodies this specific Arcana card\'s meaning — not just quote the flavor text alongside ' +
      'generic tarot prose. For example, don\'t write "...you draw The Fool. Pikachu\'s sparks ' +
      'build when many gather..." (two separate facts bolted together); write "Pikachu appears ' +
      'as The Fool because its untamed, spontaneous spark mirrors the card\'s own leap into the ' +
      'unknown" (one idea, fused).',
    'For each card, write a 2-4 sentence interpretation that answers the question through the ' +
      'lens of that card\'s position and traditional meaning, built around that fused symbolic ' +
      'link. Do not describe game mechanics, battle stats, or competitive strength — treat the ' +
      'Pokemon as a symbolic presence, the way a tarot reader would treat any card image.',
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
