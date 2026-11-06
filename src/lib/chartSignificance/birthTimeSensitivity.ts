/**
 * Birth-time sensitivity solver.
 *
 * Recomputes the chart at shifted birth instants and solves the exact moment a
 * body changes house (outward minute scan + bisection), then verifies that the
 * body sits on the crossed cusp. Never projects from average motion.
 */
import { computeAngles, computeBody, houseForLongitude, norm360, signedCircularDelta, type BodyKey } from '@/lib/ephemerisEngine';
import type { HouseSystem } from '@/lib/placidusHouses';

export interface HouseCrossing {
  direction: 'earlier' | 'later';
  /** Signed offset from the recorded birth instant, in seconds. */
  offsetSeconds: number;
  utc: Date;
  fromHouse: number;
  toHouse: number;
  /** Cusp number crossed (the starting cusp of the later house in zodiac order). */
  cusp: number;
  /** |body - cusp| at the solved instant, degrees. */
  residualDegrees: number;
}

export interface BirthTimeSensitivity {
  body: string;
  house: number;
  houseSystemUsed: HouseSystem;
  earlier: HouseCrossing | null;
  later: HouseCrossing | null;
  searchWindowMinutes: number;
}

const houseAt = (key: BodyKey, utc: Date, lat: number, lon: number, system: HouseSystem) => {
  const b = computeBody(key, utc);
  if (!b.ok) throw new Error(`Cannot compute ${key}`);
  const a = computeAngles(utc, lat, lon, system);
  return { house: houseForLongitude(b.longitude, a.cusps), lon: b.longitude, cusps: a.cusps, system: a.systemUsed };
};

export function solveBirthTimeSensitivity(
  body: BodyKey,
  birthUtc: Date,
  coords: { latitude: number; longitude: number },
  houseSystem: HouseSystem = 'placidus',
  searchWindowMinutes = 120,
): BirthTimeSensitivity {
  const { latitude: lat, longitude: lng } = coords;
  const base = houseAt(body, birthUtc, lat, lng, houseSystem);
  const t0 = birthUtc.getTime();

  const solve = (sign: -1 | 1): HouseCrossing | null => {
    let prevMs = t0;
    for (let m = 1; m <= searchWindowMinutes; m++) {
      const ms = t0 + sign * m * 60_000;
      const h = houseAt(body, new Date(ms), lat, lng, houseSystem).house;
      if (h !== base.house) {
        let inMs = prevMs, outMs = ms;
        while (Math.abs(outMs - inMs) > 250) {
          const mid = (inMs + outMs) / 2;
          if (houseAt(body, new Date(mid), lat, lng, houseSystem).house === base.house) inMs = mid; else outMs = mid;
        }
        const utc = new Date(Math.round((inMs + outMs) / 2));
        const after = houseAt(body, new Date(outMs), lat, lng, houseSystem);
        const at = houseAt(body, utc, lat, lng, houseSystem);
        const fromHouse = base.house, toHouse = after.house;
        const forward = (fromHouse % 12) + 1 === toHouse;
        const cusp = forward ? toHouse : fromHouse;
        const residualDegrees = Math.abs(signedCircularDelta(at.lon, norm360(at.cusps[cusp])));
        return { direction: sign < 0 ? 'earlier' : 'later', offsetSeconds: (utc.getTime() - t0) / 1000, utc, fromHouse, toHouse, cusp, residualDegrees };
      }
      prevMs = ms;
    }
    return null;
  };

  return { body, house: base.house, houseSystemUsed: base.system, earlier: solve(-1), later: solve(1), searchWindowMinutes };
}

export function describeCrossing(c: HouseCrossing): string {
  const s = Math.round(Math.abs(c.offsetSeconds));
  const mm = Math.floor(s / 60), ss = s % 60;
  return `moves to house ${c.toHouse} if born ${mm} min ${ss} s ${c.direction}`;
}
