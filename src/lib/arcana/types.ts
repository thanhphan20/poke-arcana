export type TypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type Suit = 'cups' | 'wands' | 'swords' | 'pentacles';

export interface TarotMetadata {
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  element?: string;
  astrology?: string;
  numerology?: string;
  description: string;
}

export interface ArcanaResult {
  kind: 'major' | 'minor';
  /** Display name, e.g. "The Fool" or "Three of Cups". */
  name: string;
  /** 0-21, present only for Major Arcana. */
  majorNumber?: number;
  /** Present only for Minor Arcana. */
  suit?: Suit;
  /** 0-13 (Ace..King), present only for Minor Arcana. */
  rankIndex?: number;
  /** Tarot card metadata (meanings, keywords, etc.) */
  metadata?: TarotMetadata;
}

/** Minimal Pokemon shape the arcana algorithm needs as input. */
export interface PokemonRaw {
  id: number;
  /** Ordered: index 0 is the primary type. */
  types: TypeName[];
  /** Base-stat total. */
  bst: number;
  isLegendary: boolean;
  isMythical: boolean;
}

/** Final record shape written to src/data/generated/pokemon.json. */
export interface PokemonCard {
  id: number;
  name: string;
  slug: string;
  types: TypeName[];
  bst: number;
  isLegendary: boolean;
  isMythical: boolean;
  sprite: string;
  thumbSprite: string;
  flavorText: string;
  genus: string;
  arcana: ArcanaResult;
}

/**
 * One of the 78 tarot cards, grouping every Pokemon that shares that card's
 * arcana identity. Major cards have exactly one member; Minor cards have
 * zero or more. Written to src/data/generated/cards.json.
 */
export interface TarotCardGroup {
  slug: string;
  arcana: ArcanaResult;
  /** Ordered by base-stat total descending, then Pokedex id ascending. */
  members: PokemonCard[];
}
