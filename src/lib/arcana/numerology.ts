const MASTER_NUMBERS = new Set([11, 22, 33]);

function sumDigits(n: number): number {
  return String(n)
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

/** Reduces a positive integer to a single digit, halting early at a master number (11, 22, 33). */
export function digitSumReduce(n: number): number {
  let value = n;
  while (value > 9 && !MASTER_NUMBERS.has(value)) {
    value = sumDigits(value);
  }
  return value;
}

/**
 * Pythagorean Life Path number: month, day, and year are each reduced
 * independently, then the three reduced values are summed and reduced
 * again — the standard component-reduction method, distinct from summing
 * every digit of the full date at once.
 */
export function lifePathNumber(year: number, month: number, day: number): number {
  const reducedMonth = digitSumReduce(month);
  const reducedDay = digitSumReduce(day);
  const reducedYear = digitSumReduce(year);
  return digitSumReduce(reducedMonth + reducedDay + reducedYear);
}

export interface LifePathInfo {
  title: string;
  keywords: string[];
  description: string;
}

export const LIFE_PATH_INTERPRETATIONS: Record<number, LifePathInfo> = {
  1: {
    title: 'The Leader',
    keywords: ['independent', 'driven', 'pioneering'],
    description:
      'You carve your own path rather than follow one. Life Path 1 is the initiator — ambitious, self-reliant, and most alive when starting something no one else has tried.',
  },
  2: {
    title: 'The Peacemaker',
    keywords: ['diplomatic', 'intuitive', 'cooperative'],
    description:
      'You read a room before you speak in it. Life Path 2 is the mediator — sensitive to others, drawn to partnership, and skilled at finding harmony where others see conflict.',
  },
  3: {
    title: 'The Communicator',
    keywords: ['expressive', 'creative', 'social'],
    description:
      'Words, color, and sound move through you easily. Life Path 3 is the natural storyteller — optimistic, playful, and happiest when creating or performing for others.',
  },
  4: {
    title: 'The Builder',
    keywords: ['disciplined', 'practical', 'reliable'],
    description:
      'You trust structure over shortcuts. Life Path 4 is the foundation-layer — methodical, hardworking, and the one people count on to actually finish what was started.',
  },
  5: {
    title: 'The Free Spirit',
    keywords: ['adventurous', 'adaptable', 'restless'],
    description:
      'Routine wears on you fast. Life Path 5 is the change-seeker — curious, energetic, and built for variety, travel, and whatever hasn’t happened yet.',
  },
  6: {
    title: 'The Nurturer',
    keywords: ['caring', 'responsible', 'harmonious'],
    description:
      'You feel other people’s needs as clearly as your own. Life Path 6 is the caretaker — devoted to home, family, and community, with a strong pull toward service.',
  },
  7: {
    title: 'The Seeker',
    keywords: ['analytical', 'introspective', 'wise'],
    description:
      'You need to understand the "why," not just the "what." Life Path 7 is the thinker — private, perceptive, and drawn to research, spirituality, or solitude over small talk.',
  },
  8: {
    title: 'The Powerhouse',
    keywords: ['ambitious', 'authoritative', 'goal-oriented'],
    description:
      'You think in outcomes and scale. Life Path 8 is the achiever — confident, business-minded, and comfortable holding responsibility and material success alike.',
  },
  9: {
    title: 'The Humanitarian',
    keywords: ['compassionate', 'idealistic', 'generous'],
    description:
      'You see the bigger picture before the personal one. Life Path 9 is the giver — empathetic, big-hearted, and drawn to causes larger than any single life.',
  },
  11: {
    title: 'The Intuitive (Master Number)',
    keywords: ['visionary', 'sensitive', 'inspiring'],
    description:
      'You carry the traits of a 2 amplified into something sharper. Life Path 11 is the illuminator — deeply intuitive, idealistic, and capable of inspiring others, though the heightened sensitivity cuts both ways.',
  },
  22: {
    title: 'The Master Builder (Master Number)',
    keywords: ['visionary', 'practical', 'ambitious'],
    description:
      'You carry the traits of a 4 amplified into something larger. Life Path 22 is the master builder — able to turn big, idealistic visions into lasting, real-world structures.',
  },
  33: {
    title: 'The Master Teacher (Master Number)',
    keywords: ['devoted', 'compassionate', 'expressive'],
    description:
      'You carry the traits of a 6 amplified into something rarer. Life Path 33 is the master teacher — deeply nurturing, self-sacrificing, and focused on uplifting others above yourself.',
  },
};

/** `LIFE_PATH_INTERPRETATIONS[n]`, throwing if `n` isn't a valid Life Path result. */
export function getLifePathInfo(n: number): LifePathInfo {
  const info = LIFE_PATH_INTERPRETATIONS[n];
  if (!info) {
    throw new Error(`No interpretation exists for Life Path number ${n}.`);
  }
  return info;
}
