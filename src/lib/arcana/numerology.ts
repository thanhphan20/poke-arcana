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

export interface LifePathBreakdown {
  reducedMonth: number;
  reducedDay: number;
  reducedYear: number;
  componentSum: number;
  finalNumber: number;
  sumWasReduced: boolean;
}

/** The intermediate reduction values behind `lifePathNumber`, for display. */
export function lifePathBreakdown(year: number, month: number, day: number): LifePathBreakdown {
  const reducedMonth = digitSumReduce(month);
  const reducedDay = digitSumReduce(day);
  const reducedYear = digitSumReduce(year);
  const componentSum = reducedMonth + reducedDay + reducedYear;
  const finalNumber = digitSumReduce(componentSum);
  return {
    reducedMonth, reducedDay, reducedYear,
    componentSum, finalNumber,
    sumWasReduced: finalNumber !== componentSum,
  };
}

/**
 * Archetype title per number, shared across Life Path, Expression, Soul
 * Urge, and Personality — a number's archetypal meaning is traditionally
 * constant regardless of which calculation produced it.
 */
export const NUMBER_ARCHETYPE_TITLES: Record<number, string> = {
  1: 'The Leader',
  2: 'The Peacemaker',
  3: 'The Communicator',
  4: 'The Builder',
  5: 'The Free Spirit',
  6: 'The Nurturer',
  7: 'The Seeker',
  8: 'The Powerhouse',
  9: 'The Humanitarian',
  11: 'The Intuitive (Master Number)',
  22: 'The Master Builder (Master Number)',
  33: 'The Master Teacher (Master Number)',
};

/** `NUMBER_ARCHETYPE_TITLES[n]`, throwing if `n` isn't a valid Pythagorean result. */
export function getArchetypeTitle(n: number): string {
  const title = NUMBER_ARCHETYPE_TITLES[n];
  if (!title) {
    throw new Error(`No archetype title exists for number ${n}.`);
  }
  return title;
}

export interface LifePathInfo {
  keywords: string[];
  strengths: string;
  challenges: string;
}

export const LIFE_PATH_INTERPRETATIONS: Record<number, LifePathInfo> = {
  1: {
    keywords: ['independent', 'driven', 'pioneering'],
    strengths:
      'You carve your own path rather than follow one. Ambitious and self-reliant, you\'re most alive when starting something no one else has tried, and you rally others through sheer conviction rather than asking permission.',
    challenges:
      'Independence can tip into isolation — asking for help or sharing credit doesn\'t come naturally. Watch for impatience with slower collaborators and a stubborn refusal to change course once you\'ve committed.',
  },
  2: {
    keywords: ['diplomatic', 'intuitive', 'cooperative'],
    strengths:
      'You read a room before you speak in it. Sensitive to others, drawn to partnership, and skilled at finding harmony where others see conflict, you make people feel heard.',
    challenges:
      'Keeping the peace can mean swallowing your own needs until resentment builds quietly. Watch for indecision when a choice might upset someone, and a tendency to over-personalize criticism.',
  },
  3: {
    keywords: ['expressive', 'creative', 'social'],
    strengths:
      'Words, color, and sound move through you easily. Optimistic and playful, you\'re happiest when creating or performing for others, and you lift the mood of any room you\'re in.',
    challenges:
      'Charm can become a way to avoid depth — scattering energy across too many ideas instead of finishing one. Watch for mood swings that read as flakiness, and a habit of deflecting hard feelings with a joke.',
  },
  4: {
    keywords: ['disciplined', 'practical', 'reliable'],
    strengths:
      'You trust structure over shortcuts. Methodical and hardworking, you\'re the one people count on to actually finish what was started, brick by brick.',
    challenges:
      'A love of process can calcify into rigidity — resisting a better way just because it\'s not the established one. Watch for workaholic tendencies and difficulty relaxing without guilt.',
  },
  5: {
    keywords: ['adventurous', 'adaptable', 'restless'],
    strengths:
      'Routine wears on you fast. Curious and energetic, you\'re built for variety, travel, and whatever hasn\'t happened yet, and you adapt to change faster than almost anyone.',
    challenges:
      'The pull toward novelty can undercut follow-through — commitments (and relationships) get abandoned once the excitement fades. Watch for impulsiveness with money, time, or promises.',
  },
  6: {
    keywords: ['caring', 'responsible', 'harmonious'],
    strengths:
      'You feel other people\'s needs as clearly as your own. Devoted to home, family, and community, you carry a strong pull toward service and make others feel taken care of.',
    challenges:
      'Caretaking can slide into control — deciding what\'s best for people instead of what they\'ve asked for. Watch for martyrdom, meddling, and difficulty letting others fail on their own terms.',
  },
  7: {
    keywords: ['analytical', 'introspective', 'wise'],
    strengths:
      'You need to understand the "why," not just the "what." Private and perceptive, you\'re drawn to research, spirituality, or solitude over small talk, and you see patterns others miss.',
    challenges:
      'The need for solitude can shade into isolation, and skepticism into detachment from people who just want to connect. Watch for overthinking a decision until the moment to act has passed.',
  },
  8: {
    keywords: ['ambitious', 'authoritative', 'goal-oriented'],
    strengths:
      'You think in outcomes and scale. Confident and business-minded, you\'re comfortable holding responsibility and material success alike, and you know how to get things built.',
    challenges:
      'A focus on results can crowd out the people delivering them — status and control take priority over connection. Watch for equating your worth with your output, and for steamrolling softer opinions.',
  },
  9: {
    keywords: ['compassionate', 'idealistic', 'generous'],
    strengths:
      'You see the bigger picture before the personal one. Empathetic and big-hearted, you\'re drawn to causes larger than any single life, and you give generously without keeping score.',
    challenges:
      'Giving without limits can leave you depleted, and idealism can curdle into disappointment with a world that won\'t match your vision. Watch for difficulty setting boundaries or receiving help yourself.',
  },
  11: {
    keywords: ['visionary', 'sensitive', 'inspiring'],
    strengths:
      'You carry the traits of a 2 amplified into something sharper. Deeply intuitive and idealistic, you\'re capable of inspiring others just by articulating what they could barely sense themselves.',
    challenges:
      'That heightened sensitivity cuts both ways — nervous energy, self-doubt, and overwhelm come easily when the vision outpaces what feels achievable. Watch for burning out chasing an ideal that keeps moving.',
  },
  22: {
    keywords: ['visionary', 'practical', 'ambitious'],
    strengths:
      'You carry the traits of a 4 amplified into something larger. Able to turn big, idealistic visions into lasting, real-world structures, you think at a scale most people find intimidating.',
    challenges:
      'The gap between the scale of your ambition and the practical steps to get there can be paralyzing. Watch for self-imposed pressure that turns into procrastination, or abandoning big plans out of fear of falling short.',
  },
  33: {
    keywords: ['devoted', 'compassionate', 'expressive'],
    strengths:
      'You carry the traits of a 6 amplified into something rarer. Deeply nurturing and focused on uplifting others, you give a kind of unconditional support few people are capable of sustaining.',
    challenges:
      'Self-sacrifice at this intensity is unsustainable without limits — resentment and exhaustion build when your own needs stay permanently last. Watch for taking on burdens that were never yours to carry.',
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

/** Standard Pythagorean letter-to-number table (Y is never treated as a vowel — see VOWELS below). */
const PYTHAGOREAN_LETTER_VALUES: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
function isVowel(letter: string): boolean {
  return VOWELS.has(letter);
}

/**
 * Splits a full name into normalized, letters-only parts: accented Latin
 * characters are reduced to their base letter (NFD-decompose + strip
 * combining marks), then anything still outside A-Z (hyphens, apostrophes,
 * non-Latin scripts) is dropped. Parts that normalize to nothing are
 * omitted, not returned as empty strings.
 */
export function normalizeName(fullName: string): string[] {
  return fullName
    .split(/\s+/)
    .map((part) =>
      part
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .replace(/[^A-Z]/g, ''),
    )
    .filter((part) => part.length > 0);
}

/** False only when every part of the name normalizes to zero usable A-Z letters. */
export function hasUsableLetters(fullName: string): boolean {
  return normalizeName(fullName).length > 0;
}

export interface NameNumberBreakdown {
  reducedParts: number[];
  componentSum: number;
  finalNumber: number;
  sumWasReduced: boolean;
}

/**
 * The name-number equivalent of `lifePathBreakdown`: each normalized name
 * part is scored letter-by-letter (only letters passing `letterFilter`
 * count), reduced independently, then the reduced parts are summed and
 * reduced again — the same component-reduce-then-sum shape as Life Path,
 * just operating on name-part letter-sums instead of date components.
 */
function reduceNameNumberBreakdown(
  nameParts: string[],
  letterFilter: (letter: string) => boolean,
): NameNumberBreakdown {
  const reducedParts = nameParts.map((part) => {
    let sum = 0;
    for (const letter of part) {
      if (letterFilter(letter)) sum += PYTHAGOREAN_LETTER_VALUES[letter] ?? 0;
    }
    return digitSumReduce(sum);
  });
  const componentSum = reducedParts.reduce((total, value) => total + value, 0);
  const finalNumber = digitSumReduce(componentSum);
  return { reducedParts, componentSum, finalNumber, sumWasReduced: finalNumber !== componentSum };
}

function reduceNameNumber(nameParts: string[], letterFilter: (letter: string) => boolean): number {
  return reduceNameNumberBreakdown(nameParts, letterFilter).finalNumber;
}

/** Pythagorean Expression (Destiny) number: every letter of the name counts. */
export function expressionNumber(fullName: string): number {
  return reduceNameNumber(normalizeName(fullName), () => true);
}

export function expressionBreakdown(fullName: string): NameNumberBreakdown {
  return reduceNameNumberBreakdown(normalizeName(fullName), () => true);
}

/** Pythagorean Soul Urge number: only vowels (A, E, I, O, U) count — Y is always a consonant. */
export function soulUrgeNumber(fullName: string): number {
  return reduceNameNumber(normalizeName(fullName), isVowel);
}

export function soulUrgeBreakdown(fullName: string): NameNumberBreakdown {
  return reduceNameNumberBreakdown(normalizeName(fullName), isVowel);
}

/** Pythagorean Personality number: only consonants count — Y included. */
export function personalityNumber(fullName: string): number {
  return reduceNameNumber(normalizeName(fullName), (letter) => !isVowel(letter));
}

export function personalityBreakdown(fullName: string): NameNumberBreakdown {
  return reduceNameNumberBreakdown(normalizeName(fullName), (letter) => !isVowel(letter));
}
