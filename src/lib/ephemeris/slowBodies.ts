/**
 * Accurate positions for the slow bodies (Chiron, Ceres, Pallas, Juno, Vesta,
 * Eris) and the true lunar node.
 *
 * Chiron and the main-belt asteroids are read from real JPL Horizons samples
 * (see asteroidLongitudes.ts) and interpolated with a Catmull-Rom cubic, which
 * holds accuracy to roughly one arc-minute, including through retrograde
 * stations. Outside the table window the caller gets null so the UI can say
 * "outside the ephemeris range" instead of showing an invented degree.
 *
 * The true node is derived from the Moon's instantaneous orbital plane, which
 * is what modern chart services print as "Node" (the mean node can differ by
 * up to about 1.8 degrees).
 */

import * as Astronomy from 'astronomy-engine';
import {
  ASTEROID_TABLES,
  ASTEROID_TABLE_START_MS,
  ASTEROID_TABLE_STEP_DAYS,
  ASTEROID_TABLE_SAMPLES,
} from './asteroidLongitudes';

export type SlowBody = 'chiron' | 'ceres' | 'pallas' | 'juno' | 'vesta' | 'eris';

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const WIDTH = 3;
const OFFSET = 20000;
const STEP_MS = ASTEROID_TABLE_STEP_DAYS * 86400000;

const decoded = new Map<string, Float64Array>();

/** Unwrapped longitudes in degrees for one body, decoded once and cached. */
const seriesFor = (body: SlowBody): Float64Array | null => {
  const cached = decoded.get(body);
  if (cached) return cached;
  const table = ASTEROID_TABLES[body];
  if (!table) return null;

  const values = new Float64Array(ASTEROID_TABLE_SAMPLES);
  let arcmin = table.baseArcmin;
  values[0] = arcmin / 60;
  for (let i = 1; i < ASTEROID_TABLE_SAMPLES; i++) {
    const chunk = table.deltas.slice((i - 1) * WIDTH, i * WIDTH);
    let n = 0;
    for (let c = 0; c < chunk.length; c++) n = n * 36 + DIGITS.indexOf(chunk[c]);
    arcmin += n - OFFSET;
    values[i] = arcmin / 60;
  }
  decoded.set(body, values);
  return values;
};

const catmullRom = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    ((2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};

export const isInSlowBodyRange = (date: Date): boolean => {
  const t = date.getTime();
  return t >= ASTEROID_TABLE_START_MS && t <= ASTEROID_TABLE_START_MS + (ASTEROID_TABLE_SAMPLES - 1) * STEP_MS;
};

/** Ecliptic longitude in degrees (0-360), or null outside the table window. */
export const slowBodyLongitude = (body: SlowBody, date: Date): number | null => {
  const values = seriesFor(body);
  if (!values) return null;
  const x = (date.getTime() - ASTEROID_TABLE_START_MS) / STEP_MS;
  if (!isFinite(x) || x < 0 || x > ASTEROID_TABLE_SAMPLES - 1) return null;

  const last = ASTEROID_TABLE_SAMPLES - 1;
  const i = Math.min(Math.floor(x), last - 1);
  const t = x - i;
  const p1 = values[i];
  const p2 = values[i + 1];
  // In the first and last 10-day segment there is no neighbour on one side.
  // Clamping to the end sample bent the curve badly there (Vesta was 22' off
  // on 1920-01-04 against JPL); a quadratic phantom point keeps the local
  // curvature and holds the edges to the same half arc-minute as the rest.
  const p0 = i >= 1 ? values[i - 1] : 3 * p1 - 3 * p2 + values[i + 2];
  const p3 = i + 2 <= last ? values[i + 2] : 3 * p2 - 3 * p1 + values[i - 1];
  const lon = catmullRom(p0, p1, p2, p3, t);
  return ((lon % 360) + 360) % 360;
};

/**
 * True (osculating) North Node longitude in degrees, ecliptic and equinox of
 * date. The Moon's position and velocity are rotated from the J2000 equator
 * into the true ecliptic of date first; an earlier version rotated by the
 * fixed J2000 obliquity, which left the node in the J2000 frame and drifted
 * by precession (about 0.84 arc-minutes per year away from 2000).
 */
export const trueNodeLongitude = (date: Date): number | null => {
  try {
    const time = Astronomy.MakeTime(date);
    const rot = Astronomy.Rotation_EQJ_ECT(time);
    const at = (ms: number) => Astronomy.RotateVector(rot, Astronomy.GeoMoon(Astronomy.MakeTime(new Date(ms))));

    const step = 0.02 * 86400000; // milliseconds
    const before = at(date.getTime() - step);
    const after = at(date.getTime() + step);
    const mid = at(date.getTime());

    const v = { x: after.x - before.x, y: after.y - before.y, z: after.z - before.z };

    // Orbit normal, then the ascending node direction in the ecliptic plane.
    const n = {
      x: mid.y * v.z - mid.z * v.y,
      y: mid.z * v.x - mid.x * v.z,
    };

    const lon = Math.atan2(n.x, -n.y) * 180 / Math.PI;
    return ((lon % 360) + 360) % 360;
  } catch {
    return null;
  }
};

