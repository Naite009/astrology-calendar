/**
 * The one calculation engine for every celestial body, angle and house cusp.
 *
 * Inputs are always a true UTC instant plus (for angles) precise coordinates.
 * No zone math, no place guessing, no date parsing happens here; that is the
 * job of birthDataNormalization.ts, which hands this module a BirthMoment.
 *
 * Sources
 *   Sun .. Pluto, Moon      astronomy-engine (VSOP87 / ELP-2000 based),
 *                           apparent geocentric longitude, true ecliptic and
 *                           equinox of date, aberration and light time applied.
 *   North / South Node      true (osculating) node from the Moon's instantaneous
 *                           orbital plane, reduced to the ecliptic of date.
 *                           The mean node is available as an explicit variant.
 *   Chiron, Ceres, Pallas,
 *   Juno, Vesta, Eris       JPL Horizons samples (1920-2060), cubic interpolated.
 *                           Outside that window the body is reported as
 *                           unavailable; nothing is extrapolated.
 *   Black Moon Lilith       mean lunar apogee (ELP-2000 mean elements).
 *                           The osculating ("true") Lilith is not offered.
 *   Angles and houses       apparent sidereal time and true obliquity of date
 *                           from astronomy-engine, via placidusHouses.ts.
 *
 * Every longitude is tropical. Sidereal charts subtract an ayanamsa on top.
 */

import * as Astronomy from 'astronomy-engine';
import { slowBodyLongitude, isInSlowBodyRange, trueNodeLongitude as trueNodeOfDate, type SlowBody } from './ephemeris/slowBodies';
import { ASTEROID_TABLE_START_MS, ASTEROID_TABLE_STEP_DAYS, ASTEROID_TABLE_SAMPLES } from './ephemeris/asteroidLongitudes';
import {
  siderealBasis,
  houseCuspsFromBasis,
  type HouseSystem,
  type HouseCuspSet,
  HOUSE_SYSTEM_LABELS,
} from './placidusHouses';

// ── Engine identity (shown in the audit trail) ─────────────────────────────

export const ENGINE_INFO = {
  name: 'astronomy-engine',
  version: '2.1.19',
  planets: 'astronomy-engine 2.1.19: apparent geocentric longitude, true ecliptic and equinox of date',
  slowBodies: 'JPL Horizons samples every 10 days, 1920-01-01 to 2060-01-01, Catmull-Rom interpolation',
  node: 'True (osculating) node from the Moon\'s orbital plane, ecliptic of date',
  lilith: 'Mean lunar apogee (ELP-2000 mean elements)',
  angles: 'Apparent sidereal time and true obliquity of date',
} as const;

export const SLOW_BODY_RANGE = {
  startMs: ASTEROID_TABLE_START_MS,
  endMs: ASTEROID_TABLE_START_MS + (ASTEROID_TABLE_SAMPLES - 1) * ASTEROID_TABLE_STEP_DAYS * 86400000,
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

export type BodyKey =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'
  | 'Uranus' | 'Neptune' | 'Pluto'
  | 'NorthNode' | 'SouthNode'
  | 'Chiron' | 'Ceres' | 'Pallas' | 'Juno' | 'Vesta' | 'Eris'
  | 'Lilith';

export const PLANET_KEYS: BodyKey[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];
export const SLOW_BODY_KEYS: BodyKey[] = ['Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta', 'Eris'];
export const ALL_BODY_KEYS: BodyKey[] = [
  ...PLANET_KEYS, 'NorthNode', 'SouthNode', ...SLOW_BODY_KEYS, 'Lilith',
];

export type BodySource = 'astronomy-engine' | 'jpl-horizons-table' | 'mean-elements';

export interface BodyPosition {
  key: BodyKey;
  /** Tropical ecliptic longitude, degrees 0-360. Never rounded. */
  longitude: number;
  /** Ecliptic latitude in degrees where the source provides it. */
  latitude?: number;
  /** Daily motion in degrees (negative when retrograde). */
  speed: number;
  retrograde: boolean;
  source: BodySource;
  /** Definition that can differ between ephemerides ("true node", "mean apogee"). */
  variant?: string;
}

export type BodyResult =
  | ({ ok: true } & BodyPosition)
  | { ok: false; key: BodyKey; reason: string };

export interface EphemerisSettings {
  zodiac: 'tropical';
  houseSystem: HouseSystem;
  nodeVariant: 'true' | 'mean';
  lilithVariant: 'mean';
}

export const DEFAULT_SETTINGS: EphemerisSettings = {
  zodiac: 'tropical',
  houseSystem: 'placidus',
  nodeVariant: 'true',
  lilithVariant: 'mean',
};

export interface SignPosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  longitude: number;
}

export const ZODIAC_SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

// ── Angle helpers (shared, wrap-safe) ──────────────────────────────────────

export const norm360 = (x: number): number => ((x % 360) + 360) % 360;

/** Signed shortest difference a - b in degrees, in (-180, 180]. */
export const signedCircularDelta = (a: number, b: number): number => {
  const d = norm360(a - b);
  return d > 180 ? d - 360 : d;
};

/** Smallest angular separation between two longitudes, 0-180 degrees. */
export const circularSeparation = (a: number, b: number): number => Math.abs(signedCircularDelta(a, b));

/** Sign, degree, minute, second for display. Rounds only here. */
export const longitudeToSignPosition = (longitude: number): SignPosition => {
  const lon = norm360(longitude);
  // Round to the nearest arc-second first so 29°59'59.6" does not print as 29°59'60".
  const totalSeconds = Math.round(lon * 3600) % (360 * 3600);
  const signIndex = Math.floor(totalSeconds / (30 * 3600));
  const inSign = totalSeconds - signIndex * 30 * 3600;
  const degree = Math.floor(inSign / 3600);
  const minutes = Math.floor((inSign - degree * 3600) / 60);
  const seconds = inSign - degree * 3600 - minutes * 60;
  return { sign: ZODIAC_SIGN_NAMES[signIndex], degree, minutes, seconds, longitude: lon };
};

/** Absolute longitude from a sign + degree + minutes (+ seconds) record. */
export const signPositionToLongitude = (
  pos: { sign: string; degree: number; minutes?: number; seconds?: number } | null | undefined,
): number | null => {
  if (!pos || !pos.sign) return null;
  const idx = ZODIAC_SIGN_NAMES.findIndex(s => s.toLowerCase() === String(pos.sign).toLowerCase());
  if (idx < 0) return null;
  const deg = Number(pos.degree) || 0;
  const min = Number(pos.minutes) || 0;
  const sec = Number(pos.seconds) || 0;
  return norm360(idx * 30 + deg + min / 60 + sec / 3600);
};

// ── Bodies ─────────────────────────────────────────────────────────────────

const ASTRONOMY_BODY: Partial<Record<BodyKey, Astronomy.Body>> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const SLOW_BODY: Partial<Record<BodyKey, SlowBody>> = {
  Chiron: 'chiron', Ceres: 'ceres', Pallas: 'pallas', Juno: 'juno', Vesta: 'vesta', Eris: 'eris',
};

/** Apparent geocentric ecliptic longitude and latitude of date for a major body. */
const planetEcliptic = (body: Astronomy.Body, utc: Date): { elon: number; elat: number } => {
  const time = Astronomy.MakeTime(utc);
  if (body === Astronomy.Body.Moon) {
    const m = Astronomy.EclipticGeoMoon(time);
    return { elon: m.lon, elat: m.lat };
  }
  const vec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  return { elon: ecl.elon, elat: ecl.elat };
};

const julianCenturiesTT = (utc: Date): number => {
  const time = Astronomy.MakeTime(utc);
  return time.tt / 36525; // astronomy-engine measures tt in days from J2000
};

/** Mean ascending node of the Moon (ELP-2000 mean elements). */
export const meanNodeLongitude = (utc: Date): number => {
  const T = julianCenturiesTT(utc);
  return norm360(125.0445479 + T * (-1934.1362891 + T * (0.0020754 + T * (1 / 467441 - T / 60616000))));
};

/** Mean lunar apogee = Black Moon Lilith (mean). Perigee + 180. */
export const meanLilithLongitude = (utc: Date): number => {
  const T = julianCenturiesTT(utc);
  const perigee = 83.3532465 + T * (4069.0137287 + T * (-0.01032 + T * (-1 / 80053 + T / 18999000)));
  return norm360(perigee + 180);
};

/** True (osculating) ascending node, ecliptic and equinox of date (see slowBodies.ts). */
export const trueNodeLongitude = (utc: Date): number => {
  const lon = trueNodeOfDate(utc);
  if (lon === null) throw new Error('True node calculation failed.');
  return lon;
};

const speedFrom = (lonAt: (d: Date) => number, utc: Date, halfWindowHours = 1): number => {
  const h = halfWindowHours * 3600000;
  const a = lonAt(new Date(utc.getTime() - h));
  const b = lonAt(new Date(utc.getTime() + h));
  return signedCircularDelta(b, a) / (2 * halfWindowHours / 24);
};

export const computeBody = (
  key: BodyKey,
  utc: Date,
  settings: EphemerisSettings = DEFAULT_SETTINGS,
): BodyResult => {
  if (!(utc instanceof Date) || !Number.isFinite(utc.getTime())) {
    return { ok: false, key, reason: 'No valid UTC instant.' };
  }

  try {
    const astro = ASTRONOMY_BODY[key];
    if (astro !== undefined) {
      const { elon, elat } = planetEcliptic(astro, utc);
      const speed = key === 'Sun' || key === 'Moon'
        ? speedFrom(d => planetEcliptic(astro, d).elon, utc)
        : speedFrom(d => planetEcliptic(astro, d).elon, utc, 12);
      return {
        ok: true, key, longitude: norm360(elon), latitude: elat, speed,
        retrograde: key !== 'Sun' && key !== 'Moon' && speed < 0,
        source: 'astronomy-engine',
      };
    }

    if (key === 'NorthNode' || key === 'SouthNode') {
      const useMean = settings.nodeVariant === 'mean';
      const lonAt = useMean ? meanNodeLongitude : trueNodeLongitude;
      const north = lonAt(utc);
      const lon = key === 'NorthNode' ? north : norm360(north + 180);
      const speed = speedFrom(lonAt, utc, 12);
      return {
        ok: true, key, longitude: lon, speed, retrograde: speed < 0,
        source: useMean ? 'mean-elements' : 'astronomy-engine',
        variant: useMean ? 'mean node' : 'true node',
      };
    }

    if (key === 'Lilith') {
      const lon = meanLilithLongitude(utc);
      const speed = speedFrom(meanLilithLongitude, utc, 12);
      return { ok: true, key, longitude: lon, speed, retrograde: false, source: 'mean-elements', variant: 'mean apogee' };
    }

    const slow = SLOW_BODY[key];
    if (slow) {
      if (!isInSlowBodyRange(utc)) {
        const from = new Date(SLOW_BODY_RANGE.startMs).getUTCFullYear();
        const to = new Date(SLOW_BODY_RANGE.endMs).getUTCFullYear();
        return { ok: false, key, reason: `${key} is only available for ${from}-${to} (JPL Horizons table). Not calculated for this date.` };
      }
      const lon = slowBodyLongitude(slow, utc);
      if (lon === null) return { ok: false, key, reason: `${key} table lookup failed.` };
      const speed = speedFrom(d => slowBodyLongitude(slow, d) ?? lon, utc, 12);
      return { ok: true, key, longitude: lon, speed, retrograde: speed < 0, source: 'jpl-horizons-table' };
    }

    return { ok: false, key, reason: `Unknown body "${key}".` };
  } catch (err) {
    return { ok: false, key, reason: err instanceof Error ? err.message : 'Calculation failed.' };
  }
};

export const computeBodies = (
  utc: Date,
  keys: BodyKey[] = ALL_BODY_KEYS,
  settings: EphemerisSettings = DEFAULT_SETTINGS,
): Record<BodyKey, BodyResult> => {
  const out = {} as Record<BodyKey, BodyResult>;
  for (const k of keys) out[k] = computeBody(k, utc, settings);
  return out;
};

// ── Angles, houses, derived points ─────────────────────────────────────────

export interface AnglesResult extends HouseCuspSet {
  descendant: number;
  ic: number;
  antivertex: number;
  houseSystemLabel: string;
}

export const computeAngles = (
  utc: Date,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = 'placidus',
): AnglesResult => {
  const basis = siderealBasis(utc, longitude);
  const set = houseCuspsFromBasis(basis, latitude, houseSystem);
  return {
    ...set,
    descendant: norm360(set.ascendant + 180),
    ic: norm360(set.mc + 180),
    antivertex: norm360(set.vertex + 180),
    houseSystemLabel: HOUSE_SYSTEM_LABELS[set.systemUsed],
  };
};

/**
 * Day chart when the Sun is above the horizon: houses 7-12, which in
 * longitude terms is the half-circle from the Descendant round to the
 * Ascendant (asc + 180 .. asc + 360).
 */
export const isDayChart = (ascendant: number, sunLongitude: number): boolean =>
  norm360(sunLongitude - ascendant) >= 180;

export const partOfFortuneLongitude = (ascendant: number, sun: number, moon: number): { longitude: number; sect: 'day' | 'night' } => {
  const day = isDayChart(ascendant, sun);
  const lon = day ? ascendant + moon - sun : ascendant + sun - moon;
  return { longitude: norm360(lon), sect: day ? 'day' : 'night' };
};

/** Which house (1-12) a longitude falls in for a set of cusps (index 1..12). */
export const houseForLongitude = (longitude: number, cusps: number[]): number => {
  const lon = norm360(longitude);
  for (let h = 1; h <= 12; h++) {
    const start = cusps[h];
    const end = cusps[h === 12 ? 1 : h + 1];
    const span = norm360(end - start);
    const into = norm360(lon - start);
    if (into < span || span === 0) return h;
  }
  return 12;
};

// ── Whole-chart convenience ────────────────────────────────────────────────

export interface ChartComputation {
  utc: Date;
  settings: EphemerisSettings;
  bodies: Record<BodyKey, BodyResult>;
  /** Null when no precise coordinates were supplied. */
  angles: AnglesResult | null;
  partOfFortune: { longitude: number; sect: 'day' | 'night' } | null;
}

export const computeChart = (
  utc: Date,
  coords: { latitude: number; longitude: number } | null,
  settings: EphemerisSettings = DEFAULT_SETTINGS,
  keys: BodyKey[] = ALL_BODY_KEYS,
): ChartComputation => {
  const bodies = computeBodies(utc, keys, settings);
  let angles: AnglesResult | null = null;
  let partOfFortune: ChartComputation['partOfFortune'] = null;
  if (coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) {
    angles = computeAngles(utc, coords.latitude, coords.longitude, settings.houseSystem);
    const sun = bodies.Sun;
    const moon = bodies.Moon;
    if (sun?.ok && moon?.ok) partOfFortune = partOfFortuneLongitude(angles.ascendant, sun.longitude, moon.longitude);
  }
  return { utc, settings, bodies, angles, partOfFortune };
};
