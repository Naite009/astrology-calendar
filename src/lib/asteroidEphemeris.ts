/**
 * Slow bodies and Black Moon Lilith.
 *
 * Chiron, Ceres, Pallas, Juno, Vesta and Eris come from real JPL Horizons
 * samples (src/lib/ephemeris/asteroidLongitudes.ts, every 10 days from
 * 1920-01-01 to 2059-12-27, the last sample) interpolated with a Catmull-Rom cubic. Outside
 * that window there is NO fallback: the caller gets `available: false` (or an
 * exception from the strict helper). The earlier monthly tables plus
 * "orbital period" extrapolation were removed because they drifted by tens
 * of degrees and silently produced invented positions.
 *
 * Black Moon Lilith is the MEAN lunar apogee from the ELP-2000 mean elements
 * (valid for any date). The osculating/"true" Lilith is not offered; sources
 * that print it can differ from the mean value by up to 30 degrees.
 */

import { slowBodyLongitude, isInSlowBodyRange, type SlowBody } from './ephemeris/slowBodies';
import { ASTEROID_TABLE_START_MS, ASTEROID_TABLE_STEP_DAYS, ASTEROID_TABLE_SAMPLES } from './ephemeris/asteroidLongitudes';
import { meanLilithLongitude } from './ephemerisEngine';

export { meanLilithLongitude };

export type AsteroidBody = 'chiron' | 'lilith' | 'ceres' | 'pallas' | 'juno' | 'vesta' | 'eris';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SLOW_BODY_RANGE_START = new Date(ASTEROID_TABLE_START_MS);
export const SLOW_BODY_RANGE_END = new Date(ASTEROID_TABLE_START_MS + (ASTEROID_TABLE_SAMPLES - 1) * ASTEROID_TABLE_STEP_DAYS * 86400000);

const norm360 = (x: number) => ((x % 360) + 360) % 360;

const longitudeToPosition = (longitude: number): { sign: string; degree: number; minutes: number; seconds: number } => {
  const lon = norm360(longitude);
  const totalSeconds = Math.round(lon * 3600) % (360 * 3600);
  const signIndex = Math.floor(totalSeconds / (30 * 3600));
  const inSign = totalSeconds - signIndex * 30 * 3600;
  const degree = Math.floor(inSign / 3600);
  const minutes = Math.floor((inSign - degree * 3600) / 60);
  const seconds = inSign - degree * 3600 - minutes * 60;
  return { sign: ZODIAC_SIGNS[signIndex], degree, minutes, seconds };
};

/** Is this body computable for this date? Lilith always; the others only inside the JPL window. */
export const isAsteroidAvailable = (body: AsteroidBody, date: Date): boolean =>
  body === 'lilith' ? Number.isFinite(date.getTime()) : isInSlowBodyRange(date);

export const asteroidUnavailableReason = (body: AsteroidBody, date: Date): string | null => {
  if (isAsteroidAvailable(body, date)) return null;
  const from = SLOW_BODY_RANGE_START.getUTCFullYear();
  const to = SLOW_BODY_RANGE_END.getUTCFullYear();
  return `${body[0].toUpperCase()}${body.slice(1)} positions are only available for ${from}-${to} (JPL Horizons data). Not calculated for this date.`;
};

/** Longitude in degrees, or null when the date is outside the supported data. */
export const asteroidLongitude = (body: AsteroidBody, date: Date): number | null => {
  if (!Number.isFinite(date.getTime())) return null;
  if (body === 'lilith') return meanLilithLongitude(date);
  return slowBodyLongitude(body as SlowBody, date);
};

export interface AsteroidPosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  isRetrograde: boolean;
  longitude: number;
  /** "jpl-horizons-table" or "mean-elements". */
  source: 'jpl-horizons-table' | 'mean-elements';
}

export type AsteroidResult =
  | ({ available: true } & AsteroidPosition)
  | { available: false; reason: string };

/** Range-aware lookup. Never invents a position. */
export const getAsteroidPosition = (body: AsteroidBody, date: Date): AsteroidResult => {
  const reason = asteroidUnavailableReason(body, date);
  if (reason) return { available: false, reason };
  const lon = asteroidLongitude(body, date);
  if (lon === null) return { available: false, reason: `${body} lookup failed.` };

  let isRetrograde = false;
  if (body !== 'lilith') {
    const before = asteroidLongitude(body, new Date(date.getTime() - 12 * 3600000));
    const after = asteroidLongitude(body, new Date(date.getTime() + 12 * 3600000));
    if (before !== null && after !== null) {
      let diff = after - before;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      isRetrograde = diff < 0;
    }
  }

  return {
    available: true,
    ...longitudeToPosition(lon),
    isRetrograde,
    longitude: lon,
    source: body === 'lilith' ? 'mean-elements' : 'jpl-horizons-table',
  };
};

/**
 * Strict legacy helper: same shape callers have always used, but it THROWS
 * outside the supported window instead of returning an extrapolated guess.
 * Prefer getAsteroidPosition where an unavailable state can be shown.
 */
export const getAccurateAsteroidPosition = (
  body: AsteroidBody,
  date: Date,
): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde: boolean } => {
  const r = getAsteroidPosition(body, date);
  if (r.available === false) throw new RangeError(r.reason);
  return { sign: r.sign, degree: r.degree, minutes: r.minutes, seconds: r.seconds, isRetrograde: r.isRetrograde };
};
