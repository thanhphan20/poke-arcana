/** 14 Minor Arcana ranks per suit, weakest (Ace) to strongest (King). */
export const RANKS = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King',
] as const;

/**
 * Map a percentile in [0,1] to one of the 14 ranks. 14 equal-width buckets;
 * the top edge (percentile === 1) clamps to King rather than overflowing.
 */
export function rankIndexForPercentile(percentile: number): number {
  return Math.min(RANKS.length - 1, Math.floor(percentile * RANKS.length));
}
