import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const typeName = z.enum([
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]);

const suit = z.enum(['cups', 'wands', 'swords', 'pentacles']);

const arcana = z.object({
  kind: z.enum(['major', 'minor']),
  name: z.string(),
  majorNumber: z.number().int().min(0).max(21).optional(),
  suit: suit.optional(),
  rankIndex: z.number().int().min(0).max(13).optional(),
});

const pokemonCards = defineCollection({
  loader: file('src/data/generated/pokemon.json', { id: (entry) => String(entry.id) }),
  schema: z.object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    types: z.array(typeName),
    bst: z.number().int(),
    isLegendary: z.boolean(),
    isMythical: z.boolean(),
    sprite: z.string(),
    thumbSprite: z.string(),
    flavorText: z.string(),
    genus: z.string(),
    arcana,
  }),
});

export const collections = { pokemonCards };
