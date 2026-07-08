/** 22 canonical Rider-Waite-Smith Major Arcana, in order (0..21). */
export const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
] as const;

/**
 * Well-mixed integer hash (murmur-style finalizer) keyed only on a Pokemon's
 * own Pokedex id. Keyed on id alone so the mapping is stable under dataset
 * growth: adding later generations never changes an existing Pokemon's arcana.
 */
export function stableHash(id: number): number {
  let h = (id ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = (h ^ (h >>> 16)) >>> 0;
  return h;
}

export function majorArcanaFor(pokedexId: number): { majorNumber: number; name: string } {
  const majorNumber = stableHash(pokedexId) % MAJOR_ARCANA.length;
  return { majorNumber, name: MAJOR_ARCANA[majorNumber] };
}
