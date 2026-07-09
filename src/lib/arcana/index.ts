import type { ArcanaResult, PokemonCard, PokemonRaw, Suit, TarotCardGroup } from './types.js';
import { MAJOR_ARCANA, MAJOR_ARCANA_ASSIGNMENT, PSEUDO_LEGENDARY_IDS, majorArcanaForId } from './majorArcana.js';
import { resolveSuit, suitLabel } from './suits.js';
import { RANKS, rankIndexForPercentile } from './ranks.js';
import { MAJOR_ARCANA_METADATA, MINOR_ARCANA_METADATA } from './tarot-metadata.js';

export * from './types';
export { MAJOR_ARCANA, MAJOR_ARCANA_ASSIGNMENT, PSEUDO_LEGENDARY_IDS, majorArcanaForId } from './majorArcana';
export { TYPE_SUIT_TABLE, SUITS, resolveSuit, suitLabel } from './suits';
export { RANKS, rankIndexForPercentile } from './ranks';

/**
 * Assign every Pokemon a tarot identity. Must be run ONCE over the whole
 * population: Minor Arcana rank is a base-stat-total percentile within each
 * suit's population, so it cannot be computed per-item in isolation.
 *
 * Major Arcana uses a curated 1:1 map (MAJOR_ARCANA_ASSIGNMENT) over
 * legendaries/mythicals plus any promoted pseudo-legendaries
 * (PSEUDO_LEGENDARY_IDS). Every Major card must end up with exactly one
 * Pokemon, or the build fails loudly.
 *
 * Returns a Map keyed by Pokedex id.
 */
export function assignArcana(pokemon: PokemonRaw[]): Map<number, ArcanaResult> {
  const results = new Map<number, ArcanaResult>();

  const pseudoLegendaryIds = new Set(PSEUDO_LEGENDARY_IDS);
  const isMajorEligible = (p: PokemonRaw) => p.isLegendary || p.isMythical || pseudoLegendaryIds.has(p.id);

  const legendaries = pokemon.filter(isMajorEligible).sort((a, b) => a.id - b.id);

  const unmapped = legendaries.filter((p) => !MAJOR_ARCANA_ASSIGNMENT[p.id]);
  if (unmapped.length > 0) {
    throw new Error(
      `Major-eligible Pokemon with no curated Major Arcana mapping: ${unmapped.map((p) => p.id).join(', ')}. Add entries to MAJOR_ARCANA_ASSIGNMENT in majorArcana.ts.`,
    );
  }

  const assignedCards = new Set<string>();
  legendaries.forEach((p) => {
    const { majorNumber, name } = majorArcanaForId(p.id);
    if (assignedCards.has(name)) {
      throw new Error(
        `Major Arcana card "${name}" is assigned to more than one Pokemon. Check MAJOR_ARCANA_ASSIGNMENT for duplicate entries.`,
      );
    }
    assignedCards.add(name);
    results.set(p.id, {
      kind: 'major',
      majorNumber,
      name,
      metadata: MAJOR_ARCANA_METADATA[name],
    });
  });

  const missingCards = MAJOR_ARCANA.filter((name) => !assignedCards.has(name));
  if (missingCards.length > 0) {
    throw new Error(
      `Major Arcana card(s) with no assigned Pokemon: ${missingCards.join(', ')}. Every curated legendary/pseudo-legendary must be present in the dataset.`,
    );
  }

  const bySuit = new Map<Suit, PokemonRaw[]>();
  for (const p of pokemon) {
    if (isMajorEligible(p)) continue;
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
      const rankName = RANKS[rankIndex];
      results.set(p.id, {
        kind: 'minor',
        suit,
        rankIndex,
        name: `${rankName} of ${suitLabel(suit)}`,
        metadata: MINOR_ARCANA_METADATA[suit]?.[rankName],
      });
    });
  }

  return results;
}

function slugForArcana(arcana: ArcanaResult): string {
  return arcana.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Fold per-Pokemon arcana results into the 78 tarot cards. Major cards get
 * exactly one member; Minor cards get every Pokemon assigned that suit and
 * rank (possibly zero). Members are ordered by base-stat total descending,
 * then Pokedex id ascending.
 */
export function groupIntoCards(cards: PokemonCard[]): TarotCardGroup[] {
  const groups = new Map<string, TarotCardGroup>();

  MAJOR_ARCANA.forEach((name, majorNumber) => {
    const arcana: ArcanaResult = { kind: 'major', majorNumber, name };
    groups.set(name, { slug: slugForArcana(arcana), arcana, members: [] });
  });

  for (const suit of ['cups', 'wands', 'swords', 'pentacles'] as Suit[]) {
    RANKS.forEach((rankName, rankIndex) => {
      const name = `${rankName} of ${suitLabel(suit)}`;
      const arcana: ArcanaResult = { kind: 'minor', suit, rankIndex, name };
      groups.set(name, { slug: slugForArcana(arcana), arcana, members: [] });
    });
  }

  for (const card of cards) {
    const group = groups.get(card.arcana.name);
    if (!group) {
      throw new Error(`Pokemon #${card.id} (${card.name}) has arcana "${card.arcana.name}", which is not one of the 78 known cards.`);
    }
    group.members.push(card);
  }

  for (const group of groups.values()) {
    group.members.sort((a, b) => b.bst - a.bst || a.id - b.id);
  }

  return Array.from(groups.values());
}
