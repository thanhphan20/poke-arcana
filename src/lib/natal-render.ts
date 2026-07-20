// Shared builder + renderer for a natal/star-map reading's per-point cards.
// Used by both the live BirthForm result (star-map.ts) and the static
// history detail view so the two never drift.

import { cardInfoForSign } from './arcana/zodiac';
import type { PlanetKey } from './arcana/planets';
import type { NatalPromptPoint } from './ai/natal/prompt';

export const PLANET_ORDER: PlanetKey[] = [
  'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
];

const BIG_THREE_LABELS = new Set(['Sun', 'Moon', 'Rising']);

// Colorful inline SVGs (not keyboard glyphs) — colors match the star map's
// gold/silver/peach ring colors for the same three points.
const SUN_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="12" cy="12" r="5" fill="#f3dfa2"/>' +
  '<g stroke="#cba85a" stroke-width="2" stroke-linecap="round">' +
  '<line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/>' +
  '<line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/>' +
  '<line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/>' +
  '<line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>' +
  '</g></svg>';

const MOON_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M20 14.5A9 9 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="#dbe4ff" stroke="#a7b8f5" stroke-width="1"/>' +
  '</svg>';

const RISING_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M4 18h16" stroke="#e8915a" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M6 18a6 6 0 0 1 12 0" fill="#ffd9b8" stroke="#e8915a" stroke-width="1.5"/>' +
  '<path d="M12 3v7m0 0-3-3m3 3 3-3" stroke="#e8915a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

// Simplified vector icons for the 8 classical/modern planets — colorful and
// thematic rather than pixel-exact astrological glyphs.
const MERCURY_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M8 6a4 4 0 0 1 8 0" stroke="#8291a3" stroke-width="1.5"/>' +
  '<circle cx="12" cy="10" r="4" fill="#cfd8e3" stroke="#8291a3" stroke-width="1.5"/>' +
  '<line x1="12" y1="14" x2="12" y2="20" stroke="#8291a3" stroke-width="1.5"/>' +
  '<line x1="9" y1="17" x2="15" y2="17" stroke="#8291a3" stroke-width="1.5"/></svg>';

const VENUS_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="12" cy="9" r="5" fill="#ffcfe0" stroke="#d97ea9" stroke-width="1.5"/>' +
  '<line x1="12" y1="14" x2="12" y2="21" stroke="#d97ea9" stroke-width="1.5"/>' +
  '<line x1="8" y1="18" x2="16" y2="18" stroke="#d97ea9" stroke-width="1.5"/></svg>';

const MARS_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="10" cy="14" r="5" fill="#ff9a86" stroke="#c8402b" stroke-width="1.5"/>' +
  '<line x1="13" y1="11" x2="19" y2="5" stroke="#c8402b" stroke-width="1.5"/>' +
  '<path d="M14 5h5v5" stroke="#c8402b" stroke-width="1.5" fill="none"/></svg>';

const JUPITER_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M6 6c3 0 5 1.5 5 4s-2 3-4 3h9" stroke="#a98ce8" stroke-width="2" stroke-linecap="round" fill="none"/>' +
  '<line x1="16" y1="4" x2="16" y2="19" stroke="#a98ce8" stroke-width="2" stroke-linecap="round"/></svg>';

const SATURN_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<line x1="9" y1="4" x2="9" y2="18" stroke="#c9a86a" stroke-width="2" stroke-linecap="round"/>' +
  '<line x1="6" y1="8" x2="13" y2="8" stroke="#c9a86a" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M9 15c0 3 5 3 5-0.5s-3-3-4-1.5" stroke="#c9a86a" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

const URANUS_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="12" cy="17" r="2.6" fill="#9fe9e6" stroke="#3fb8b4" stroke-width="1.3"/>' +
  '<line x1="12" y1="14.5" x2="12" y2="6" stroke="#3fb8b4" stroke-width="1.5"/>' +
  '<line x1="6.5" y1="9" x2="17.5" y2="9" stroke="#3fb8b4" stroke-width="1.5"/>' +
  '<line x1="6.5" y1="5" x2="6.5" y2="12" stroke="#3fb8b4" stroke-width="1.5"/>' +
  '<line x1="17.5" y1="5" x2="17.5" y2="12" stroke="#3fb8b4" stroke-width="1.5"/></svg>';

const NEPTUNE_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<line x1="12" y1="5" x2="12" y2="20" stroke="#6f8fe8" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M7 6c0 4.5 3 6.5 5 6.5s5-2 5-6.5" stroke="#6f8fe8" stroke-width="2" stroke-linecap="round" fill="none"/>' +
  '<line x1="8.5" y1="17" x2="15.5" y2="17" stroke="#6f8fe8" stroke-width="2" stroke-linecap="round"/></svg>';

const PLUTO_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="12" cy="7" r="3" fill="#d3a3e8" stroke="#8a4bab" stroke-width="1.3"/>' +
  '<path d="M8 12a4 4 0 0 0 8 0" stroke="#8a4bab" stroke-width="1.5" fill="none"/>' +
  '<line x1="12" y1="12" x2="12" y2="20" stroke="#8a4bab" stroke-width="1.5"/>' +
  '<line x1="9" y1="17" x2="15" y2="17" stroke="#8a4bab" stroke-width="1.5"/></svg>';

const LABEL_INFO: Record<string, { icon: string; hint: string }> = {
  Sun: { icon: SUN_ICON, hint: 'who you are at your core' },
  Moon: { icon: MOON_ICON, hint: 'your inner emotional world' },
  Rising: { icon: RISING_ICON, hint: 'the first impression you give' },
  Mercury: { icon: MERCURY_ICON, hint: 'how you think and communicate' },
  Venus: { icon: VENUS_ICON, hint: 'what you love and value' },
  Mars: { icon: MARS_ICON, hint: 'how you act and go after what you want' },
  Jupiter: { icon: JUPITER_ICON, hint: 'where you grow and find luck' },
  Saturn: { icon: SATURN_ICON, hint: 'your discipline and hard-won lessons' },
  Uranus: { icon: URANUS_ICON, hint: 'where you break the mold' },
  Neptune: { icon: NEPTUNE_ICON, hint: 'your dreams and intuition' },
  Pluto: { icon: PLUTO_ICON, hint: 'where you transform and grow powerful' },
};

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Maps raw computed signs onto this deck's cards, in Big-Three-then-planets
// order — the single source of truth consumed for both display and storage.
export function buildNatalPoints(
  sunSign: string, moonSign: string, risingSign: string | null,
  planetSigns: Record<PlanetKey, string>,
): NatalPromptPoint[] {
  const labeled: Array<{ label: string; sign: string }> = [
    { label: 'Sun', sign: sunSign },
    { label: 'Moon', sign: moonSign },
  ];
  if (risingSign) labeled.push({ label: 'Rising', sign: risingSign });
  for (const key of PLANET_ORDER) labeled.push({ label: capitalize(key), sign: planetSigns[key] });

  return labeled.map(({ label, sign }) => {
    const info = cardInfoForSign(sign);
    return {
      label, sign, cardName: info.cardName,
      keywords: info.keywords, uprightMeaning: info.uprightMeaning, pokemonName: info.pokemonName,
    };
  });
}

// Groups points that land on the same sign into one card (preserving input
// order) instead of repeating an identical card line per point.
function groupBySign(points: NatalPromptPoint[]): NatalPromptPoint[][] {
  const order: string[] = [];
  const groups = new Map<string, NatalPromptPoint[]>();
  for (const p of points) {
    if (!groups.has(p.sign)) {
      groups.set(p.sign, []);
      order.push(p.sign);
    }
    groups.get(p.sign)!.push(p);
  }
  return order.map((sign) => groups.get(sign)!);
}

function buildReadingCard(group: NatalPromptPoint[], size: 'big' | 'compact'): HTMLElement {
  const card = document.createElement('div');
  card.className = `natal-reading__card natal-reading__card--${size}`;

  const badge = document.createElement('span');
  badge.className = 'natal-reading__card-badge';
  badge.innerHTML = group.map((p) => LABEL_INFO[p.label]?.icon ?? '').join('');

  const body = document.createElement('div');
  body.className = 'natal-reading__card-body';

  const head = document.createElement('p');
  head.className = 'natal-reading__card-head';

  const nameEl = document.createElement('span');
  nameEl.className = 'natal-reading__card-point';
  nameEl.textContent = group.map((p) => p.label).join(' & ');

  const hintEl = document.createElement('span');
  hintEl.className = 'natal-reading__card-hint';
  hintEl.textContent = LABEL_INFO[group[0].label]?.hint ?? '';

  // A real text-node separator (not just a CSS gap) so copy/pasted text
  // doesn't jam "Sun & Venuswho you are..." together.
  head.append(nameEl, document.createTextNode(' — '), hintEl);

  const cardLine = document.createElement('p');
  cardLine.className = 'natal-reading__card-sign';
  cardLine.textContent = `${group[0].sign} → ${group[0].cardName} (${group[0].pokemonName})`;

  const meaning = document.createElement('p');
  meaning.className = 'natal-reading__card-meaning';
  meaning.textContent = group[0].uprightMeaning;

  body.append(head, cardLine, meaning);
  card.append(badge, body);
  return card;
}

function buildSection(title: string, groups: NatalPromptPoint[][], size: 'big' | 'compact'): HTMLElement {
  const section = document.createElement('section');
  section.className = 'natal-reading__section';

  const heading = document.createElement('h3');
  heading.className = 'natal-reading__section-title';
  heading.textContent = title;

  const grid = document.createElement('div');
  grid.className = `natal-reading__grid natal-reading__grid--${size}`;
  for (const group of groups) grid.appendChild(buildReadingCard(group, size));

  section.append(heading, grid);
  return section;
}

export function renderNatalReading(points: NatalPromptPoint[]): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'natal-reading';

  const bigThree = points.filter((p) => BIG_THREE_LABELS.has(p.label));
  const planets = points.filter((p) => !BIG_THREE_LABELS.has(p.label));

  wrap.appendChild(buildSection('The Big Three', groupBySign(bigThree), 'big'));
  if (planets.length) wrap.appendChild(buildSection('Your Planets', groupBySign(planets), 'compact'));

  return wrap;
}

export function renderNatalSynthesis(synthesis: { provider: string; synthesis: string }): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'natal-reading__synthesis';

  const label = document.createElement('p');
  label.className = 'natal-reading__synthesis-label';
  label.textContent = '✦ Your Chart, Woven Together ✦';

  const text = document.createElement('p');
  text.className = 'natal-reading__synthesis-text';
  text.textContent = synthesis.synthesis;

  const attribution = document.createElement('p');
  attribution.className = 'natal-reading__synthesis-attribution';
  attribution.textContent = `✦ read by ${synthesis.provider} ✦`;

  panel.append(label, text, attribution);
  return panel;
}
