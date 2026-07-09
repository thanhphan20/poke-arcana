/**
 * Dev-only spot-check comparing TOON vs JSON size for a representative
 * 3-card reading payload. Run with `bun run scripts/toon-spot-check.ts`.
 */
import { encode } from '@toon-format/toon';
import { buildUserPrompt } from '../src/lib/ai/reading/prompt';

const cards = [
  {
    position: 'Past',
    arcanaKind: 'major' as const,
    arcanaName: 'The Fool',
    arcanaKeywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit', 'adventure'],
    uprightMeaning: 'New beginnings, optimism, trust in life, taking a leap of faith, embracing the unknown with open heart.',
    pokemonName: 'Pikachu',
    pokemonFlavor: 'When several of these Pokemon gather, their electricity could build and cause lightning storms.',
  },
  {
    position: 'Present',
    arcanaKind: 'minor' as const,
    arcanaName: 'Three of Cups',
    arcanaKeywords: ['celebration', 'friendship', 'creativity', 'collaboration', 'joy'],
    uprightMeaning: 'Celebration, friendship, creativity, collaboration, social gatherings bringing joy.',
    pokemonName: 'Vaporeon',
    pokemonFlavor: 'Lives close to water. Its long tail is ridged with a fin, which is often mistaken for a mermaid tail.',
  },
  {
    position: 'Future',
    arcanaKind: 'major' as const,
    arcanaName: 'The Star',
    arcanaKeywords: ['hope', 'faith', 'purpose', 'renewal', 'spirituality', 'healing'],
    uprightMeaning: 'Hope, faith, purpose, renewal, spirituality, healing, serenity after the storm.',
    pokemonName: 'Jigglypuff',
    pokemonFlavor: 'Its vocal cords can freely adjust the wavelength of its voice, which lulls the audience into a deep sleep.',
  },
];

const question = 'What am I empowered to do?';
const toon = buildUserPrompt(question, cards);

const json = JSON.stringify({
  question,
  spread_size: cards.length,
  cards: cards.map((c) => ({
    position: c.position,
    arcana_kind: c.arcanaKind,
    arcana_name: c.arcanaName,
    arcana_keywords: c.arcanaKeywords,
    upright_meaning: c.uprightMeaning,
    pokemon_name: c.pokemonName,
    pokemon_flavor: c.pokemonFlavor,
  })),
});

console.log('--- TOON ---');
console.log(toon);
console.log('--- JSON ---');
console.log(json);
console.log('--- sizes (chars) ---');
console.log({ toon: toon.length, json: json.length, savings: `${Math.round((1 - toon.length / json.length) * 100)}%` });

console.log('--- raw encode() sanity check ---');
console.log(encode({ a: [1, 2, 3], b: { c: 'd' } }));
