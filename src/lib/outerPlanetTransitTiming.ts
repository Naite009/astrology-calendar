/**
 * Outer Planet Transit Timing
 * 
 * For slow-moving planets (Pluto, Neptune, Uranus, Saturn), computes:
 * - Exact date(s) of aspect perfection (including retrograde passes)
 * - Dates when the orb crosses key thresholds (1°, 2°, 3°)
 * - Current orb and direction (applying/separating)
 */

import * as Astronomy from 'astronomy-engine';
import { getPlanetLongitudeExact, aspectOrb, normalizeLongitude } from './transitMath';

const BODY_MAP: Record<string, Astronomy.Body> = {
  Pluto: 'Pluto' as Astronomy.Body,
  Neptune: 'Neptune' as Astronomy.Body,
  Uranus: 'Uranus' as Astronomy.Body,
  Saturn: 'Saturn' as Astronomy.Body,
  Jupiter: 'Jupiter' as Astronomy.Body,
};

export interface OrbThreshold {
  orb: number;       // e.g. 1, 2, 3
  enterDate: Date | null;
  exitDate: Date | null;
}

export interface ExactPass {
  date: Date;
  orb: number;  // should be near 0
  label: string; // "1st pass", "2nd pass (℞)", "3rd pass"
}

export interface OuterTransitTiming {
  transitPlanet: string;
  natalPlanet: string;
  aspectName: string;
  aspectAngle: number;
  currentOrb: number;
  motion: 'applying' | 'separating';
  exactPasses: ExactPass[];
  orbThresholds: OrbThreshold[];  // sorted by orb ascending
}

// Scan window: Pluto moves ~1.5°/year, so ±18 months covers ~2.5° of motion
const SCAN_MONTHS_BY_PLANET: Record<string, number> = {
  Pluto: 24,
  Neptune: 18,
  Uranus: 14,
  Saturn: 8,
  Jupiter: 6,
};

/** Signed shortest distance from the transit longitude to the exact aspect point. */
const signedOffset = (lon: number, targetLon: number): number => {
  const d = normalizeLongitude(lon - targetLon);
  return d > 180 ? d - 360 : d;
};

/**
 * Find all dates where the transit planet is exactly on the aspect point,
 * including retrograde passes. Daily scan for sign changes of the offset,
 * then bisection to sub-second precision with a verified residual. A station
 * that never quite reaches the target is NOT reported as a pass.
 */
function findExactPasses(
  body: Astronomy.Body,
  natalLon: number,
  aspectAngle: number,
  center: Date,
  scanMonths: number,
): ExactPass[] {
  const startMs = center.getTime() - scanMonths * 30.44 * 86400000;
  const endMs = center.getTime() + scanMonths * 30.44 * 86400000;
  const DAY = 86400000;

  // Conjunctions/oppositions have one target point; other aspects two.
  const targets = aspectAngle === 0 || aspectAngle === 180
    ? [normalizeLongitude(natalLon + aspectAngle)]
    : [normalizeLongitude(natalLon + aspectAngle), normalizeLongitude(natalLon - aspectAngle)];

  const passes: ExactPass[] = [];
  for (const target of targets) {
    let prevMs = startMs;
    let prev = signedOffset(getPlanetLongitudeExact(body, new Date(prevMs)), target);
    for (let ms = startMs + DAY; ms <= endMs + DAY; ms += DAY) {
      const curMs = Math.min(ms, endMs);
      const cur = signedOffset(getPlanetLongitudeExact(body, new Date(curMs)), target);
      if (prev !== 0 && Math.sign(prev) !== Math.sign(cur) && Math.abs(cur - prev) < 30) {
        // Bracketed crossing: bisect to sub-second precision.
        let lo = prevMs, hi = curMs, flo = prev;
        for (let i = 0; i < 50 && hi - lo > 1; i++) {
          const mid = (lo + hi) / 2;
          const fm = signedOffset(getPlanetLongitudeExact(body, new Date(mid)), target);
          if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
        }
        const exactMs = (lo + hi) / 2;
        const residual = Math.abs(signedOffset(getPlanetLongitudeExact(body, new Date(exactMs)), target));
        if (residual <= 0.000001 && !passes.some(p => Math.abs(p.date.getTime() - exactMs) < 1000)) {
          passes.push({ date: new Date(exactMs), orb: residual, label: '' });
        }
      }
      prevMs = curMs; prev = cur;
      if (curMs >= endMs) break;
    }
  }

  passes.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Label passes by measured motion at each crossing.
  const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
  passes.forEach((p, i) => {
    const before = getPlanetLongitudeExact(body, new Date(p.date.getTime() - 3600000));
    const after = getPlanetLongitudeExact(body, new Date(p.date.getTime() + 3600000));
    const retro = signedOffset(after, before) < 0;
    p.label = passes.length === 1
      ? `Exact (${retro ? '℞' : 'direct'})`
      : `${ordinal(i + 1)} pass (${retro ? '℞' : 'direct'})`;
  });

  return passes;
}

/**
 * Find when the orb first enters and last exits a given threshold.
 */
function findOrbThresholdDates(
  body: Astronomy.Body,
  natalLon: number,
  aspectAngle: number,
  threshold: number,
  center: Date,
  scanMonths: number,
): OrbThreshold {
  const startMs = center.getTime() - scanMonths * 30.44 * 86400000;
  const endMs = center.getTime() + scanMonths * 30.44 * 86400000;
  const stepMs = 86400000; // 1-day steps for threshold detection

  let enterMs: number | null = null;
  let exitMs: number | null = null;
  let wasInside = false;

  for (let ms = startMs; ms <= endMs; ms += stepMs) {
    const lon = getPlanetLongitudeExact(body, new Date(ms));
    const orb = aspectOrb(lon, natalLon, aspectAngle);
    const isInside = orb <= threshold;

    if (isInside && !wasInside && enterMs === null) {
      enterMs = ms;
    }
    if (!isInside && wasInside) {
      exitMs = ms;
    }
    wasInside = isInside;
  }

  // If still inside at end of scan
  if (wasInside && exitMs === null) {
    exitMs = endMs;
  }

  return {
    orb: threshold,
    enterDate: enterMs ? new Date(enterMs) : null,
    exitDate: exitMs ? new Date(exitMs) : null,
  };
}

/**
 * Compute full timing data for a slow outer-planet transit aspect.
 * Cached per transit to avoid redundant astronomy-engine calls.
 */
const timingCache = new Map<string, OuterTransitTiming>();

export function getOuterTransitTiming(
  transitPlanet: string,
  natalPlanetName: string,
  natalLongitude: number,
  aspectName: string,
  aspectAngle: number,
  referenceDate: Date,
): OuterTransitTiming | null {
  const body = BODY_MAP[transitPlanet];
  if (!body) return null;

  // Full-precision key: two natal points within the same rounded degree have
  // different exact dates, and the reference date changes the scan window.
  const cacheKey = `${transitPlanet}-${natalPlanetName}-${aspectName}-${natalLongitude.toFixed(6)}-${referenceDate.getTime()}`;
  const cached = timingCache.get(cacheKey);
  if (cached) return cached;

  const scanMonths = SCAN_MONTHS_BY_PLANET[transitPlanet] || 12;

  // Current orb + direction
  const nowLon = getPlanetLongitudeExact(body, referenceDate);
  const currentOrb = aspectOrb(nowLon, natalLongitude, aspectAngle);

  // Check direction: is it applying or separating?
  const soonLon = getPlanetLongitudeExact(body, new Date(referenceDate.getTime() + 86400000));
  const soonOrb = aspectOrb(soonLon, natalLongitude, aspectAngle);
  const motion: 'applying' | 'separating' = soonOrb < currentOrb ? 'applying' : 'separating';

  // Find exact passes
  const exactPasses = findExactPasses(body, natalLongitude, aspectAngle, referenceDate, scanMonths);

  // Find orb thresholds: 1°, 2°, 3°
  const orbThresholds = [1, 2, 3].map(threshold =>
    findOrbThresholdDates(body, natalLongitude, aspectAngle, threshold, referenceDate, scanMonths)
  );

  const result: OuterTransitTiming = {
    transitPlanet,
    natalPlanet: natalPlanetName,
    aspectName,
    aspectAngle,
    currentOrb,
    motion,
    exactPasses,
    orbThresholds,
  };

  timingCache.set(cacheKey, result);
  return result;
}
