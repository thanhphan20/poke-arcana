/**
 * Public base URL of the Vercel Blob store holding uploaded sprites (see
 * scripts/upload-sprites-to-blob.ts). Replace after creating the store and
 * running the upload script.
 */
const SPRITES_BASE = 'https://REPLACE_WITH_BLOB_STORE_BASE_URL.public.blob.vercel-storage.com';

export type SpriteVariant = 'artwork' | 'thumb';

export function spriteUrl(id: number, variant: SpriteVariant): string {
  return variant === 'artwork'
    ? `${SPRITES_BASE}/sprites/official-artwork/${id}.png`
    : `${SPRITES_BASE}/sprites/thumbnails/${id}.png`;
}

export const SPRITE_FALLBACK = '/sprite-fallback.svg';
