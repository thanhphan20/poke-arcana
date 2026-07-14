import { MAJOR_ARCANA_METADATA } from './tarot-metadata';
import { MAJOR_ARCANA } from './majorArcana';

/**
 * Simplified stick-figure asterism for each sign: `stars` are points in a
 * local 0..1 unit square, `lines` are index pairs into `stars` to connect.
 * These are decorative, stylized approximations of the traditional western
 * asterisms (sickle for Leo, teapot for Sagittarius, hook for Scorpio, ...) —
 * not astronomically precise star charts.
 */
interface ConstellationShape {
  stars: readonly (readonly [number, number])[];
  lines: readonly (readonly [number, number])[];
}

const CONSTELLATION_SHAPES: Record<string, ConstellationShape> = {
  Aries: {
    stars: [[0.1, 0.7], [0.35, 0.85], [0.55, 0.55], [0.75, 0.65], [0.95, 0.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  Taurus: {
    stars: [[0.15, 0.15], [0.4, 0.6], [0.6, 0.95], [0.85, 0.15], [0.35, 0.8]],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4]],
  },
  Gemini: {
    stars: [[0.1, 0.05], [0.15, 0.5], [0.2, 0.95], [0.55, 0], [0.6, 0.5], [0.65, 0.9]],
    lines: [[0, 1], [1, 2], [3, 4], [4, 5], [2, 5]],
  },
  Cancer: {
    stars: [[0.5, 0.1], [0.5, 0.5], [0.15, 0.9], [0.85, 0.9]],
    lines: [[0, 1], [1, 2], [1, 3]],
  },
  Leo: {
    stars: [[0.1, 0.55], [0.05, 0.3], [0.2, 0.1], [0.4, 0.05], [0.45, 0.3], [0.75, 0.35], [0.95, 0.15], [0.7, 0.6]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [5, 7]],
  },
  Virgo: {
    stars: [[0.15, 0.05], [0.4, 0.35], [0.65, 0.05], [0.4, 0.6], [0.55, 0.95]],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4]],
  },
  Libra: {
    stars: [[0.2, 0.7], [0.5, 0.15], [0.8, 0.7], [0.5, 0.95]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  Scorpio: {
    stars: [[0.1, 0.1], [0.2, 0.35], [0.35, 0.5], [0.5, 0.6], [0.65, 0.65], [0.8, 0.55], [0.9, 0.4], [0.85, 0.2]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  Sagittarius: {
    stars: [[0.15, 0.3], [0.15, 0.7], [0.4, 0.9], [0.7, 0.85], [0.85, 0.55], [0.65, 0.2], [0.35, 0.15]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [4, 0]],
  },
  Capricorn: {
    stars: [[0.05, 0.4], [0.3, 0.15], [0.6, 0.1], [0.9, 0.5], [0.55, 0.85], [0.25, 0.7]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  Aquarius: {
    stars: [[0.1, 0.1], [0.3, 0.35], [0.15, 0.55], [0.4, 0.75], [0.6, 0.6], [0.8, 0.85], [0.95, 0.65]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  Pisces: {
    stars: [[0.05, 0.2], [0.2, 0.35], [0.15, 0.55], [0.5, 0.75], [0.85, 0.55], [0.8, 0.35], [0.95, 0.2]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
};

/** The 12 zodiac signs, wheel-ordered (Aries → Pisces), with their glyph and date range. */
export const ZODIAC_WHEEL = [
  { sign: 'Aries', symbol: '♈', dateRange: 'Mar 21 – Apr 19' },
  { sign: 'Taurus', symbol: '♉', dateRange: 'Apr 20 – May 20' },
  { sign: 'Gemini', symbol: '♊', dateRange: 'May 21 – Jun 20' },
  { sign: 'Cancer', symbol: '♋', dateRange: 'Jun 21 – Jul 22' },
  { sign: 'Leo', symbol: '♌', dateRange: 'Jul 23 – Aug 22' },
  { sign: 'Virgo', symbol: '♍', dateRange: 'Aug 23 – Sep 22' },
  { sign: 'Libra', symbol: '♎', dateRange: 'Sep 23 – Oct 22' },
  { sign: 'Scorpio', symbol: '♏', dateRange: 'Oct 23 – Nov 21' },
  { sign: 'Sagittarius', symbol: '♐', dateRange: 'Nov 22 – Dec 21' },
  { sign: 'Capricorn', symbol: '♑', dateRange: 'Dec 22 – Jan 19' },
  { sign: 'Aquarius', symbol: '♒', dateRange: 'Jan 20 – Feb 18' },
  { sign: 'Pisces', symbol: '♓', dateRange: 'Feb 19 – Mar 20' },
] as const;

export interface ZodiacCard {
  sign: string;
  symbol: string;
  dateRange: string;
  cardName: string;
  majorNumber: number;
  uprightMeaning: string;
  keywords: string[];
  stars: readonly (readonly [number, number])[];
  lines: readonly (readonly [number, number])[];
}

// Tropical sun-sign date boundaries (month, day), matching the `dateRange`
// labels above. Capricorn wraps the new year, so it gets two entries.
const SIGN_DATE_RANGES: { sign: string; start: [number, number]; end: [number, number] }[] = [
  { sign: 'Capricorn', start: [1, 1], end: [1, 19] },
  { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
  { sign: 'Pisces', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', start: [3, 21], end: [4, 19] },
  { sign: 'Taurus', start: [4, 20], end: [5, 20] },
  { sign: 'Gemini', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', start: [6, 21], end: [7, 22] },
  { sign: 'Leo', start: [7, 23], end: [8, 22] },
  { sign: 'Virgo', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
  { sign: 'Capricorn', start: [12, 22], end: [12, 31] },
];

/** Tropical sun sign for a given month (1-12) and day of month. */
export function signForDate(month: number, day: number): string {
  const code = month * 100 + day;
  const range = SIGN_DATE_RANGES.find((r) => {
    const startCode = r.start[0] * 100 + r.start[1];
    const endCode = r.end[0] * 100 + r.end[1];
    return code >= startCode && code <= endCode;
  });
  if (!range) throw new Error(`No zodiac sign matches month ${month}, day ${day}.`);
  return range.sign;
}

/**
 * Re-projects each zodiac sign onto the one Major Arcana card whose
 * `astrology` field names that sign (10 of the 22 majors carry a ruling
 * planet instead, e.g. Mercury, and are skipped), and attaches its
 * decorative constellation stick-figure.
 */
export function getZodiacCards(): ZodiacCard[] {
  return ZODIAC_WHEEL.map(({ sign, symbol, dateRange }) => {
    const cardName = Object.keys(MAJOR_ARCANA_METADATA).find(
      (name) => MAJOR_ARCANA_METADATA[name].astrology === sign,
    );
    if (!cardName) {
      throw new Error(`No Major Arcana card has astrology "${sign}" in MAJOR_ARCANA_METADATA.`);
    }
    const meta = MAJOR_ARCANA_METADATA[cardName];
    const majorNumber = MAJOR_ARCANA.indexOf(cardName as (typeof MAJOR_ARCANA)[number]);
    const shape = CONSTELLATION_SHAPES[sign];

    return {
      sign, symbol, dateRange,
      cardName, majorNumber,
      uprightMeaning: meta.uprightMeaning,
      keywords: meta.keywords,
      stars: shape.stars,
      lines: shape.lines,
    };
  });
}
