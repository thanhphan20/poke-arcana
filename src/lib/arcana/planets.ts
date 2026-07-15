import { ZODIAC_WHEEL } from './zodiac';

// Geocentric ecliptic longitude for the 8 non-luminary classical/modern
// planets, via the standard low-precision Keplerian orbital elements
// (J2000.0 mean elements + per-Julian-century rates — the widely published
// NASA/JPL "approximate positions of the major planets" table). Good to
// roughly arc-minute level for Mercury-Saturn and somewhat coarser for the
// outer planets over recent centuries — plenty for a decorative zodiac sign,
// same spirit as moon.ts/ascendant.ts.

interface OrbitalElements {
  a: number; aDot: number; // semi-major axis (AU) and rate per century
  e: number; eDot: number; // eccentricity
  i: number; iDot: number; // inclination (deg)
  L: number; LDot: number; // mean longitude (deg)
  peri: number; periDot: number; // longitude of perihelion (deg)
  node: number; nodeDot: number; // longitude of ascending node (deg)
}

const EARTH: OrbitalElements = {
  a: 1.00000261, aDot: 0.00000562,
  e: 0.01671123, eDot: -0.00004392,
  i: -0.00001531, iDot: -0.01294668,
  L: 100.46457166, LDot: 35999.37244981,
  peri: 102.93768193, periDot: 0.32327364,
  node: 0.0, nodeDot: 0.0,
};

export type PlanetKey =
  | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

const PLANET_ELEMENTS: Record<PlanetKey, OrbitalElements> = {
  mercury: {
    a: 0.38709927, aDot: 0.00000037,
    e: 0.20563593, eDot: 0.00001906,
    i: 7.00497902, iDot: -0.00594749,
    L: 252.25032350, LDot: 149472.67411175,
    peri: 77.45779628, periDot: 0.16047689,
    node: 48.33076593, nodeDot: -0.12534081,
  },
  venus: {
    a: 0.72333566, aDot: 0.00000390,
    e: 0.00677672, eDot: -0.00004107,
    i: 3.39467605, iDot: -0.00078890,
    L: 181.97909950, LDot: 58517.81538729,
    peri: 131.60246718, periDot: 0.00268329,
    node: 76.67984255, nodeDot: -0.27769418,
  },
  mars: {
    a: 1.52371034, aDot: 0.00001847,
    e: 0.09339410, eDot: 0.00007882,
    i: 1.84969142, iDot: -0.00813131,
    L: -4.55343205, LDot: 19140.30268499,
    peri: -23.94362959, periDot: 0.44441088,
    node: 49.55953891, nodeDot: -0.29257343,
  },
  jupiter: {
    a: 5.20288700, aDot: -0.00011607,
    e: 0.04838624, eDot: -0.00013253,
    i: 1.30439695, iDot: -0.00183714,
    L: 34.39644051, LDot: 3034.74612775,
    peri: 14.72847983, periDot: 0.21252668,
    node: 100.47390909, nodeDot: 0.20469106,
  },
  saturn: {
    a: 9.53667594, aDot: -0.00125060,
    e: 0.05386179, eDot: -0.00050991,
    i: 2.48599187, iDot: 0.00193609,
    L: 49.95424423, LDot: 1222.49362201,
    peri: 92.59887831, periDot: -0.41897216,
    node: 113.66242448, nodeDot: -0.28867794,
  },
  uranus: {
    a: 19.18916464, aDot: -0.00196176,
    e: 0.04725744, eDot: -0.00004397,
    i: 0.77263783, iDot: -0.00242939,
    L: 313.23810451, LDot: 428.48202785,
    peri: 170.95427630, periDot: 0.40805281,
    node: 74.01692503, nodeDot: 0.04240589,
  },
  neptune: {
    a: 30.06992276, aDot: 0.00026291,
    e: 0.00859048, eDot: 0.00005105,
    i: 1.77004347, iDot: 0.00035372,
    L: -55.12002969, LDot: 218.45945325,
    peri: 44.96476227, periDot: -0.32241464,
    node: 131.78422574, nodeDot: -0.00508664,
  },
  pluto: {
    a: 39.48211675, aDot: -0.00031596,
    e: 0.24882730, eDot: 0.00005170,
    i: 17.14001206, iDot: 0.00004818,
    L: 238.92903833, LDot: 145.20780515,
    peri: 224.06891629, periDot: -0.04062942,
    node: 110.30393684, nodeDot: -0.01183482,
  },
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function norm180(deg: number): number {
  const d = norm360(deg);
  return d > 180 ? d - 360 : d;
}

function julianCenturiesUTC(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + 0.5; // noon UTC
  return (jd - 2451545.0) / 36525;
}

/** Solves Kepler's equation M = E - e*sin(E) (degrees) via Newton's method. */
function solveKepler(meanAnomalyDeg: number, e: number): number {
  const eStar = e * (180 / Math.PI);
  const M = norm180(meanAnomalyDeg);
  let E = M + eStar * Math.sin(toRad(M));
  for (let i = 0; i < 8; i++) {
    const dM = M - (E - eStar * Math.sin(toRad(E)));
    const dE = dM / (1 - e * Math.cos(toRad(E)));
    E += dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  return E;
}

/** Heliocentric ecliptic (J2000 mean-ecliptic) coordinates in AU, at `T` Julian centuries since J2000. */
function heliocentricPosition(el: OrbitalElements, T: number): { x: number; y: number; z: number } {
  const a = el.a + el.aDot * T;
  const e = el.e + el.eDot * T;
  const i = el.i + el.iDot * T;
  const L = el.L + el.LDot * T;
  const peri = el.peri + el.periDot * T;
  const node = el.node + el.nodeDot * T;

  const M = L - peri;
  const E = solveKepler(M, e);

  const xOrbit = a * (Math.cos(toRad(E)) - e);
  const yOrbit = a * Math.sqrt(1 - e * e) * Math.sin(toRad(E));

  const w = toRad(peri - node); // argument of perihelion
  const om = toRad(node);
  const inc = toRad(i);

  const cosW = Math.cos(w), sinW = Math.sin(w);
  const cosOm = Math.cos(om), sinOm = Math.sin(om);
  const cosI = Math.cos(inc), sinI = Math.sin(inc);

  const x =
    (cosW * cosOm - sinW * sinOm * cosI) * xOrbit +
    (-sinW * cosOm - cosW * sinOm * cosI) * yOrbit;
  const y =
    (cosW * sinOm + sinW * cosOm * cosI) * xOrbit +
    (-sinW * sinOm + cosW * cosOm * cosI) * yOrbit;
  const z = sinW * sinI * xOrbit + cosW * sinI * yOrbit;

  return { x, y, z };
}

/** Geocentric ecliptic longitude (degrees, 0-360) of `planet` for a UTC calendar date (noon UTC). */
export function planetEclipticLongitude(planet: PlanetKey, year: number, month: number, day: number): number {
  const T = julianCenturiesUTC(year, month, day);
  const p = heliocentricPosition(PLANET_ELEMENTS[planet], T);
  const earth = heliocentricPosition(EARTH, T);
  const x = p.x - earth.x;
  const y = p.y - earth.y;
  return norm360((Math.atan2(y, x) * 180) / Math.PI);
}

/** Apparent geocentric ecliptic longitude of the Sun (i.e. Earth + 180°) — used only for self-consistency checks against `signForDate`. */
export function sunEclipticLongitude(year: number, month: number, day: number): number {
  const T = julianCenturiesUTC(year, month, day);
  const earth = heliocentricPosition(EARTH, T);
  return norm360((Math.atan2(-earth.y, -earth.x) * 180) / Math.PI);
}

/** Tropical sign for a planet on a UTC calendar date (noon UTC — plenty of margin for these slower-moving planets). */
export function planetSignForDate(planet: PlanetKey, year: number, month: number, day: number): string {
  const longitude = planetEclipticLongitude(planet, year, month, day);
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_WHEEL[index].sign;
}
