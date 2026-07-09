/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SPRITES_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
