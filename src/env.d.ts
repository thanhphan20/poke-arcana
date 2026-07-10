/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SPRITES_BASE: string;
  readonly GEMINI_API_KEY?: string;
  readonly GEMINI_MODEL?: string;
  readonly GROQ_API_KEY?: string;
  readonly GROQ_MODEL?: string;
  readonly OPENROUTER_API_KEY?: string;
  readonly OPENROUTER_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
