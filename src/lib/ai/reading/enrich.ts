import { MAJOR_ARCANA_METADATA, MINOR_ARCANA_METADATA } from '../../arcana/tarot-metadata';
import { SUIT_META } from '../../arcana/meanings';
import type { Suit } from '../../arcana/types';
import type { PromptCard } from './prompt';
import type { RequestCardInput } from './validate';

const RANK_NAMES = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King',
] as const;

const SUIT_DISPLAY_TO_KEY: Record<string, Suit> = Object.fromEntries(
  (Object.entries(SUIT_META) as Array<[Suit, (typeof SUIT_META)[Suit]]>).map(([key, meta]) => [meta.name, key]),
);

function lookupMinor(name: string) {
  const [rank, suitDisplay] = name.split(' of ');
  if (!rank || !suitDisplay || !RANK_NAMES.includes(rank as (typeof RANK_NAMES)[number])) return null;
  const suitKey = SUIT_DISPLAY_TO_KEY[suitDisplay];
  if (!suitKey) return null;
  return MINOR_ARCANA_METADATA[suitKey]?.[rank] ?? null;
}

/**
 * Server trusts only its own committed tarot-meaning data, never client-supplied
 * text, so a client can't smuggle arbitrary content into the LLM prompt via
 * keywords/meanings — only via the (already-validated) arcana name and the
 * Pokemon's own name/flavor.
 */
export function enrichSpread(spread: RequestCardInput[]): PromptCard[] {
  return spread.map((card) => {
    const meta =
      card.arcana.kind === 'major'
        ? MAJOR_ARCANA_METADATA[card.arcana.name]
        : lookupMinor(card.arcana.name);

    return {
      position: card.position,
      arcanaKind: card.arcana.kind,
      arcanaName: card.arcana.name,
      arcanaKeywords: meta?.keywords ?? [],
      uprightMeaning: meta?.uprightMeaning ?? '',
      pokemonName: card.pokemon.name,
      pokemonFlavor: card.pokemon.flavor,
    };
  });
}
