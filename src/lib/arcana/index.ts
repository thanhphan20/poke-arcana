import type { ArcanaResult, PokemonRaw, Suit } from './types';
import { majorArcanaFor } from './majorArcana';
import { resolveSuit, suitLabel } from './suits';
import { RANKS, rankIndexForPercentile } from './ranks';

export * from './types';
export { MAJOR_ARCANA, majorArcanaFor, stableHash } from './majorArcana';
export { TYPE_SUIT_TABLE, SUITS, resolveSuit, suitLabel } from './suits';
export { RANKS, rankIndexForPercentile } from './ranks';

/**
 * Assign every Pokemon a tarot identity. Must be run ONCE over the whole
 * population: Minor Arcana rank is a base-stat-total percentile within each
 * suit's population, so it cannot be computed per-item in isolation.
 *
 * Returns a Map keyed by Pokedex id.
 */
export function assignArcana(pokemon: PokemonRaw[]): Map<number, ArcanaResult> {
  const results = new Map<number, ArcanaResult>();

  for (const p of pokemon) {
    if (p.isLegendary || p.isMythical) {
      const { majorNumber, name } = majorArcanaFor(p.id);
      results.set(p.id, { kind: 'major', majorNumber, name });
    }
  }

  const bySuit = new Map<Suit, PokemonRaw[]>();
  for (const p of pokemon) {
    if (p.isLegendary || p.isMythical) continue;
    const suit = resolveSuit(p.types);
    const group = bySuit.get(suit) ?? [];
    group.push(p);
    bySuit.set(suit, group);
  }

  for (const [suit, group] of bySuit) {
    // Stable sort by BST, tie-broken by id so results are deterministic.
    const sorted = [...group].sort((a, b) => a.bst - b.bst || a.id - b.id);
    sorted.forEach((p, i) => {
      const percentile = sorted.length === 1 ? 0 : i / (sorted.length - 1);
      const rankIndex = rankIndexForPercentile(percentile);
      results.set(p.id, {
        kind: 'minor',
        suit,
        rankIndex,
        name: `${RANKS[rankIndex]} of ${suitLabel(suit)}`,
      });
    });
  }

  return results;
}
