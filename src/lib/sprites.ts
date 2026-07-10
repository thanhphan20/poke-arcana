import type { Suit } from './arcana/types';

/**
 * Public base URL of the Vercel Blob store holding uploaded sprites (see
 * scripts/upload-sprites-to-blob.ts). Set via PUBLIC_SPRITES_BASE in .env.
 */
const SPRITES_BASE = import.meta.env.PUBLIC_SPRITES_BASE;

/**
 * Public base URL of the Vercel Blob store holding uploaded Rider-Waite-Smith
 * tarot art (see scripts/upload-tarot-art-to-blob.ts). Set via
 * PUBLIC_TAROT_BASE in .env. May point to the same store as SPRITES_BASE or a
 * separate one.
 */
const TAROT_BASE = import.meta.env.PUBLIC_TAROT_BASE;

export type SpriteVariant = 'artwork' | 'thumb';

export function spriteUrl(id: number, variant: SpriteVariant): string {
  return variant === 'artwork'
    ? `${SPRITES_BASE}/sprites/official-artwork/${id}.png`
    : `${SPRITES_BASE}/sprites/thumbnails/${id}.png`;
}

export const SPRITE_FALLBACK = '/sprite-fallback.svg';

// Rank names indexed 0..13; must stay aligned with ArcanaResult.rankIndex.
const RANK_NAMES = [
  'ace', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king',
] as const;

function slugifyMajor(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export type TarotArtIdentity =
  | { kind: 'major'; name: string }
  | { kind: 'minor'; suit: Suit; rankIndex: number };

export function tarotArtUrl(arcana: TarotArtIdentity): string {
  // Without a configured store, skip issuing a request to `undefined/tarot/…`
  // (which some browsers hang on instead of firing onerror) and go straight
  // to the placeholder.
  if (!TAROT_BASE) return SPRITE_FALLBACK;
  if (arcana.kind === 'major') {
    return `${TAROT_BASE}/tarot/major/${slugifyMajor(arcana.name)}.jpg`;
  }
  const rank = RANK_NAMES[arcana.rankIndex] ?? 'ace';
  return `${TAROT_BASE}/tarot/minor/${arcana.suit}/${rank}.jpg`;
}
