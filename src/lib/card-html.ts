import { cardTheme, ROMAN, SUIT_META } from './arcana/meanings';
import type { Suit } from './arcana/types';
import { spriteUrl, tarotArtUrl, SPRITE_FALLBACK } from './sprites';

// Shared card-face markup for the two vanilla Web Components that build DOM in
// the browser at runtime — the reading reveal (spread-reveal.ts) and the home
// draw (HomeDraw.astro). They can't consume an Astro component (those render
// only at build time), so this keeps their markup in one place instead of two.
// The build-time surfaces (deck grid, detail pages) use the TarotCard.astro
// component directly and do NOT go through here.

export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface CardArcana {
  kind: 'major' | 'minor';
  name: string;
  majorNumber?: number;
  suit?: Suit;
  rankIndex?: number;
}

/**
 * Which image fills the vignette:
 * - `art`    → the Rider-Waite-Smith scan (arcana reveal, first tap)
 * - `sprite` → the Pokémon official artwork (Pokémon reveal, home draw)
 */
export type ArcanaFace = 'art' | 'sprite';

interface PaperOpts {
  arcana: CardArcana;
  face: ArcanaFace;
  /** Required for the `sprite` face. */
  pokemon?: { id: number; name: string };
}

export function arcanaCardThemeStyle(arcana: { kind: string; suit?: Suit }): string {
  const t = cardTheme(arcana);
  return `--accent:${t.accent}; --wash:${t.wash};`;
}

function kickerFor(arcana: CardArcana): string {
  return arcana.kind === 'major'
    ? (ROMAN[arcana.majorNumber ?? 0] ?? '✦')
    : (SUIT_META[arcana.suit ?? 'cups']?.glyph ?? '✦');
}

function vignetteHtml({ arcana, face, pokemon }: PaperOpts): string {
  if (face === 'art') {
    const url =
      arcana.kind === 'major'
        ? tarotArtUrl({ kind: 'major', majorNumber: arcana.majorNumber ?? 0 })
        : tarotArtUrl({ kind: 'minor', suit: arcana.suit ?? 'cups', rankIndex: arcana.rankIndex ?? 0 });
    return `<img class="arcana-card__art" src="${escHtml(url)}" alt="${escHtml(arcana.name)}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">`;
  }

  const decor = '<div class="arcana-card__rays"></div><div class="arcana-card__horizon"></div>';
  // sprite face
  const sprite = pokemon ?? { id: 0, name: arcana.name };
  return `${decor}<img class="arcana-card__sprite" src="${escHtml(spriteUrl(sprite.id, 'artwork'))}" alt="${escHtml(sprite.name)}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">`;
}

function footerHtml({ arcana, face, pokemon }: PaperOpts): string {
  if (face === 'art') {
    return `<div class="arcana-card__footer"><span class="arcana-card__name">${escHtml(arcana.name)}</span></div>`;
  }
  const name = pokemon?.name ?? arcana.name;
  const id = `№ ${String(pokemon?.id ?? 0).padStart(3, '0')}`;
  return `<div class="arcana-card__footer"><span class="arcana-card__name">${escHtml(name)}</span><span class="arcana-card__id">${escHtml(id)}</span></div>`;
}

/** Inner `.arcana-card__paper` markup. Callers supply the `.arcana-card` wrapper (div or link). */
export function arcanaCardPaperHtml(opts: PaperOpts): string {
  return (
    '<div class="arcana-card__paper">' +
    '<div class="arcana-card__grain"></div>' +
    '<div class="arcana-card__keyline"></div>' +
    '<span class="arcana-card__flourish" style="top:5px;left:7px">✦</span>' +
    '<span class="arcana-card__flourish" style="top:5px;right:7px">✦</span>' +
    '<span class="arcana-card__flourish" style="bottom:5px;left:7px">✦</span>' +
    '<span class="arcana-card__flourish" style="bottom:5px;right:7px">✦</span>' +
    `<div class="arcana-card__kicker">${escHtml(kickerFor(opts.arcana))}</div>` +
    `<div class="arcana-card__vignette">${vignetteHtml(opts)}</div>` +
    '<div class="arcana-card__banner">' +
    '<span class="arcana-card__star">✦</span>' +
    `<span class="arcana-card__arcana">${escHtml(opts.arcana.name)}</span>` +
    '<span class="arcana-card__star">✦</span>' +
    '</div>' +
    footerHtml(opts) +
    '</div>'
  );
}

/** The shared card-back face (shown before a flip). */
export function cardBackHtml(): string {
  return '<div class="card-back"><div class="card-back__field"><div class="card-back__ring"><span class="card-back__sigil">✦</span></div></div></div>';
}
