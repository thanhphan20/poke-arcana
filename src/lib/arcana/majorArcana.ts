/** 22 canonical Rider-Waite-Smith Major Arcana, in order (0..21). */
export const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
] as const;

/**
 * Assign a Major Arcana name to the Nth legendary/mythical Pokémon (sorted by
 * Pokédex ID). Rank is the 0-based position of this Pokémon within the sorted
 * legendary population; arcana slot = rank % 22, ensuring no collisions when
 * the population size is ≤ 22.
 */
export function majorArcanaForRank(rank: number): { majorNumber: number; name: string } {
  const majorNumber = rank % MAJOR_ARCANA.length;
  return { majorNumber, name: MAJOR_ARCANA[majorNumber] };
}
