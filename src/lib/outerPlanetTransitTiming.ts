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

/**
 * Find all dates where the transit planet's orb to the natal point reaches a local minimum
 * (i.e., exact passes, including retrogrades).
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
  const stepMs = 3 * 86400000; // 3-day steps

  // Sample orb over the window
  const samples: { ms: number; orb: number }[] = [];
  for (let ms = startMs; ms <= endMs; ms += stepMs) {
    const lon = getPlanetLongitudeExact(body, new Date(ms));
    samples.push({ ms, orb: aspectOrb(lon, natalLon, aspectAngle) });
  }

  // Find local minima where orb < 1° (candidate exact passes)
  const passes: ExactPass[] = [];
  for (let i = 1; i < samples.length - 1; i++) {
    if (samples[i].orb < samples[i - 1].orb && samples[i].orb < samples[i + 1].orb && samples[i].orb < 2) {
      // Refine with ternary search
      let lo = samples[i - 1].ms;
      let hi = samples[i + 1].ms;
      for (let iter = 0; iter < 30; iter++) {
        const m1 = lo + (hi - lo) / 3;
        const m2 = hi - (hi - lo) / 3;
        const o1 = aspectOrb(getPlanetLongitudeExact(body, new Date(m1)), natalLon, aspectAngle);
        const o2 = aspectOrb(getPlanetLongitudeExact(body, new Date(m2)), natalLon, aspectAngle);
        if (o1 < o2) hi = m2; else lo = m1;
      }
      const bestMs = (lo + hi) / 2;
      const bestOrb = aspectOrb(getPlanetLongitudeExact(body, new Date(bestMs)), natalLon, aspectAngle);
      if (bestOrb < 0.5) {
        passes.push({ date: new Date(bestMs), orb: bestOrb, label: '' });
      }
    }
  }

  // Label passes
  if (passes.length === 1) {
    passes[0].label = 'Exact';
  } else {
    passes.forEach((p, i) => {
      if (i === 0) p.label = '1st pass (direct)';
      else if (i === passes.length - 1) p.label = `${i + 1}${i === 1 ? 'nd' : 'rd'} pass (direct)`;
      else p.label = `${i + 1}${i === 1 ? 'nd' : 'rd'} pass (℞)`;
    });
  }

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

  const cacheKey = `${transitPlanet}-${natalPlanetName}-${aspectName}-${Math.round(natalLongitude)}`;
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
