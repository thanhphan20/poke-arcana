import type { Suit } from './arcana/types';

/**
 * Public base URL of the Vercel Blob store holding uploaded sprites (see
 * scripts/upload-sprites-to-blob.ts). Set via PUBLIC_SPRITES_BASE in .env.
 */
const SPRITES_BASE = import.meta.env.PUBLIC_SPRITES_BASE;

export type SpriteVariant = 'artwork' | 'thumb';

export function spriteUrl(id: number, variant: SpriteVariant): string {
  return variant === 'artwork'
    ? `${SPRITES_BASE}/sprites/official-artwork/${id}.png`
    : `${SPRITES_BASE}/sprites/thumbnails/${id}.png`;
}

export const SPRITE_FALLBACK = '/sprite-fallback.svg';

// Rider-Waite-Smith card art is committed under public/tarot/ (populated by
// scripts/download-tarot-images.ts). Filenames follow tarot-images.json:
// majors are m{majorNumber}.jpg; minors are {suit-letter}{rankIndex+1}.jpg.
const SUIT_LETTER: Record<Suit, string> = {
  cups: 'c',
  swords: 's',
  wands: 'w',
  pentacles: 'p',
};

export type TarotArtIdentity =
  | { kind: 'major'; majorNumber: number }
  | { kind: 'minor'; suit: Suit; rankIndex: number };

export function tarotArtUrl(arcana: TarotArtIdentity): string {
  if (arcana.kind === 'major') {
    return `/tarot/m${String(arcana.majorNumber).padStart(2, '0')}.jpg`;
  }
  return `/tarot/${SUIT_LETTER[arcana.suit]}${String(arcana.rankIndex + 1).padStart(2, '0')}.jpg`;
}
