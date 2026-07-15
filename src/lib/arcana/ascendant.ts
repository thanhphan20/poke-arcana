import { ZODIAC_WHEEL } from './zodiac';

// Ascendant (rising sign) from an exact birth instant + place — standard,
// public-domain sidereal-time formulas (same self-contained-math spirit as
// moon.ts), no ephemeris library.

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Julian Day for an exact UTC instant (fractional day, not noon-only). */
function julianDayFromDate(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const dayFraction =
    date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + b - 1524.5;
}

/**
 * Resolves a local wall-clock birth time in an IANA zone to the UTC instant
 * it refers to, using the browser/runtime's own built-in tz database (so
 * historical DST for `tz` is handled correctly) — no timezone library.
 */
export function utcInstantFromLocal(
  year: number, month: number, day: number, hour: number, minute: number, tz: string,
): Date {
  // First guess: treat the wall-clock values as if they were already UTC.
  const guessMs = Date.UTC(year, month - 1, day, hour, minute);

  // What does that UTC instant look like as a wall-clock in `tz`? The gap
  // between the two tells us tz's UTC offset at (approximately) that moment.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(guessMs));

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const hour24 = get('hour') === 24 ? 0 : get('hour');
  const asUtcMs = Date.UTC(get('year'), get('month') - 1, get('day'), hour24, get('minute'), get('second'));

  const offsetMs = asUtcMs - guessMs;
  return new Date(guessMs - offsetMs);
}

const OBLIQUITY_DEG = 23.4392911; // mean obliquity of the ecliptic (J2000) — decorative precision, not observatory-grade.

/** Ascendant ecliptic longitude (degrees, 0-360) for a UTC instant and geographic place. */
export function ascendantLongitude(date: Date, lat: number, lng: number): number {
  const jd = julianDayFromDate(date);
  const T = (jd - 2451545.0) / 36525;

  // Greenwich Mean Sidereal Time (degrees).
  const gmst = norm360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000,
  );
  const lst = norm360(gmst + lng); // east longitude positive

  const ramc = toRad(lst);
  const eps = toRad(OBLIQUITY_DEG);
  const latRad = toRad(lat);

  const asc = Math.atan2(-Math.cos(ramc), Math.sin(ramc) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps));
  return norm360((asc * 180) / Math.PI);
}

export interface BirthPlace {
  lat: number;
  lng: number;
  tz: string;
}

/** Tropical rising sign for an exact birth date, time, and place. */
export function risingSignForBirth(
  year: number, month: number, day: number, hour: number, minute: number, city: BirthPlace,
): string {
  const utc = utcInstantFromLocal(year, month, day, hour, minute, city.tz);
  const longitude = ascendantLongitude(utc, city.lat, city.lng);
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_WHEEL[index].sign;
}
