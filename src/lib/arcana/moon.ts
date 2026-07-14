import { ZODIAC_WHEEL } from './zodiac';

// A small, self-contained approximation of the Moon's ecliptic longitude
// (Meeus-style truncated periodic series — public-domain astronomical math,
// not a copied text). Accurate to roughly a degree, which is plenty to place
// a decorative "moon sign" — same spirit as the stylized constellation art
// elsewhere on the star map, not an observatory-grade ephemeris.

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Julian Day for a UTC calendar date, evaluated at noon (no birth time available). */
function julianDayUTC(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + 0.5;
}

/** Moon's apparent ecliptic longitude (degrees, 0-360) for a UTC calendar date. */
export function moonEclipticLongitude(year: number, month: number, day: number): number {
  const jd = julianDayUTC(year, month, day);
  const T = (jd - 2451545.0) / 36525;

  const Lp = norm360(218.3164477 + 481267.88123421 * T); // mean longitude
  const D = norm360(297.8501921 + 445267.1114034 * T); // mean elongation from the Sun
  const M = norm360(357.5291092 + 35999.0502909 * T); // Sun's mean anomaly
  const Mp = norm360(134.9633964 + 477198.8675055 * T); // Moon's mean anomaly

  const d = toRad(D);
  const m = toRad(M);
  const mp = toRad(Mp);

  // Largest periodic correction terms for longitude (degrees).
  const correction =
    6.289 * Math.sin(mp) -
    1.274 * Math.sin(2 * d - mp) +
    0.658 * Math.sin(2 * d) -
    0.186 * Math.sin(m) -
    0.059 * Math.sin(2 * d - 2 * mp) -
    0.057 * Math.sin(2 * d - m - mp) +
    0.053 * Math.sin(2 * d + mp) +
    0.046 * Math.sin(2 * d - m) +
    0.041 * Math.sin(mp - m) -
    0.035 * Math.sin(d) -
    0.031 * Math.sin(mp + m);

  return norm360(Lp + correction);
}

/** Tropical moon sign for a UTC calendar date (noon UTC, no birth time available). */
export function moonSignForDate(year: number, month: number, day: number): string {
  const longitude = moonEclipticLongitude(year, month, day);
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_WHEEL[index].sign;
}
