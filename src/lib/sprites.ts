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
