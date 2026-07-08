import type { Suit, TypeName } from './types';

/** Vivid suit palette — used for UI chrome (nav, filter pills, legend glyphs, accents). */
export const SUIT_META: Record<Suit, { color: string; glyph: string; name: string; desc: string }> = {
  cups: { color: '#4fb6e0', glyph: '♆', name: 'Cups', desc: 'Water · feeling' },
  wands: { color: '#f0803c', glyph: '♦', name: 'Wands', desc: 'Fire · will' },
  swords: { color: '#b98cff', glyph: '⚔', name: 'Swords', desc: 'Air · mind' },
  pentacles: { color: '#6bbf7b', glyph: '✷', name: 'Pentacles', desc: 'Earth · body' },
};

/** Muted parchment palette — used on the ArcanaCard face itself (accent ink + vignette wash). */
export const SUIT_CARD_THEME: Record<Suit, { accent: string; wash: string }> = {
  cups: { accent: '#3f6f8f', wash: '#9fc4d8' },
  wands: { accent: '#b05a2c', wash: '#e0b58f' },
  swords: { accent: '#6a5a86', wash: '#c3b6d8' },
  pentacles: { accent: '#5d7a45', wash: '#b7cca0' },
};

export const MAJOR_CARD_THEME = { accent: '#9c7b34', wash: '#e3cf95' };
export const MAJOR_COLOR = '#e3cf95';

export const TYPE_COLOR: Record<TypeName, string> = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
  grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

export const ROMAN = [
  '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI',
] as const;

export const MAJOR_MEANING: Record<string, string> = {
  'The Fool': 'New beginnings, a leap of faith, boundless potential.',
  'The Magician': 'Willpower made manifest — the power to create.',
  'The High Priestess': 'Intuition, secrets, the veiled and the inner voice.',
  'The Empress': 'Abundance, nurture, the fertile creative force.',
  'The Emperor': 'Authority, structure, the steady rule of order.',
  'The Hierophant': 'Tradition, teaching, sacred knowledge passed down.',
  'The Lovers': 'Union, choice, harmony between opposing forces.',
  'The Chariot': 'Triumph through will, momentum, controlled force.',
  Strength: 'Courage, patience, the gentle taming of raw power.',
  'The Hermit': 'Solitude, inward search, the lantern in the dark.',
  'Wheel of Fortune': 'Cycles, fate turning, the pivot of destiny.',
  Justice: 'Balance, truth, cause meeting its consequence.',
  'The Hanged Man': 'Surrender, suspension, seeing from a new angle.',
  Death: 'Endings that clear the way for transformation.',
  Temperance: 'Alchemy, moderation, the blending of extremes.',
  'The Devil': 'Bondage, temptation, the shadow we must face.',
  'The Tower': 'Sudden upheaval, revelation, the fall before renewal.',
  'The Star': 'Hope, healing, serene faith after the storm.',
  'The Moon': 'Illusion, dream, the fear that walks at night.',
  'The Sun': 'Joy, vitality, radiant and uncomplicated success.',
  Judgement: 'Awakening, reckoning, the call to rise renewed.',
  'The World': 'Completion, wholeness, the journey come full circle.',
};

export const RANK_MEANING: Record<Suit, string> = {
  cups: 'The suit of Cups speaks of emotion, love, and the tides of the heart.',
  wands: 'The suit of Wands blazes with will, creation, and driving passion.',
  swords: 'The suit of Swords cuts to intellect, conflict, and hard truth.',
  pentacles: 'The suit of Pentacles grounds in the body, wealth, and the material world.',
};

export const SPREAD_POSITIONS: Record<number, string[]> = {
  1: ['The Card'],
  3: ['Past', 'Present', 'Future'],
  10: ['Present', 'Challenge', 'Foundation', 'Past', 'Crown', 'Future', 'Self', 'Environment', 'Hopes & Fears', 'Outcome'],
};

export const SPREAD_LABELS: Record<number, string> = { 1: 'One Card', 3: 'Three Cards', 10: 'Celtic Cross' };

/** Card-face parchment theme (accent ink + vignette wash) for any card. */
export function cardTheme(arcana: { kind: string; suit?: Suit }) {
  return arcana.kind === 'major' ? MAJOR_CARD_THEME : SUIT_CARD_THEME[arcana.suit ?? 'cups'];
}

/** Vivid UI accent color (nav/detail headings) for any card. */
export function uiAccent(arcana: { kind: string; suit?: Suit }) {
  return arcana.kind === 'major' ? MAJOR_COLOR : SUIT_META[arcana.suit ?? 'cups'].color;
}

/** Short divinatory meaning for a card's arcana. */
export function arcanaMeaning(arcana: { kind: string; name: string; suit?: Suit }) {
  return arcana.kind === 'major' ? (MAJOR_MEANING[arcana.name] ?? '') : (RANK_MEANING[arcana.suit ?? 'cups'] ?? '');
}
