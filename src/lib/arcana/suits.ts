import type { Suit, TypeName } from './types';

/**
 * Every one of the 18 Pokemon types maps to exactly one of the 4 tarot suits.
 * Elemental grouping, with the remaining types folded into the nearest thematic suit:
 *   Cups      — water/emotion, extended to ice, ghost, fairy (spirit & enchantment)
 *   Wands     — fire/energy, extended to fighting, dragon (primal drive)
 *   Swords    — air-conflict, mapped to flying/electric/psychic, extended to poison, dark
 *   Pentacles — earth/material, mapped to ground/rock/grass/steel, extended to normal, bug
 */
export const TYPE_SUIT_TABLE: Record<TypeName, Suit> = {
  water: 'cups', ice: 'cups', ghost: 'cups', fairy: 'cups',
  fire: 'wands', fighting: 'wands', dragon: 'wands',
  flying: 'swords', electric: 'swords', psychic: 'swords', poison: 'swords', dark: 'swords',
  ground: 'pentacles', rock: 'pentacles', grass: 'pentacles', steel: 'pentacles',
  normal: 'pentacles', bug: 'pentacles',
};

export const SUITS: Suit[] = ['cups', 'wands', 'swords', 'pentacles'];

export function suitLabel(suit: Suit): string {
  return suit[0].toUpperCase() + suit.slice(1);
}

/**
 * Weighted vote over a Pokemon's type(s): primary type counts double, secondary
 * counts once. Ties resolve to the primary type's suit.
 */
export function resolveSuit(types: TypeName[]): Suit {
  const weights: Record<Suit, number> = { cups: 0, wands: 0, swords: 0, pentacles: 0 };
  types.forEach((t, i) => {
    weights[TYPE_SUIT_TABLE[t]] += i === 0 ? 2 : 1;
  });
  const max = Math.max(...SUITS.map((s) => weights[s]));
  const primarySuit = TYPE_SUIT_TABLE[types[0]];
  if (weights[primarySuit] === max) return primarySuit;
  return SUITS.find((s) => weights[s] === max)!;
}
