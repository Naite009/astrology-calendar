import * as Astronomy from 'astronomy-engine';

// Shared angular math for transit calculations

export const normalizeLongitude = (lon: number): number => ((lon % 360) + 360) % 360;

// Minimal separation between two longitudes in degrees (0..180)
export const angularSeparation = (lon1: number, lon2: number): number => {
  let diff = Math.abs(normalizeLongitude(lon1) - normalizeLongitude(lon2));
  if (diff > 180) diff = 360 - diff;
  return diff;
};

export const aspectOrb = (transitLon: number, natalLon: number, aspectAngle: number): number => {
  const sep = angularSeparation(transitLon, natalLon);
  return Math.abs(sep - aspectAngle);
};

export const getPlanetLongitudeExact = (body: Astronomy.Body, date: Date): number => {
  const vector = Astronomy.GeoVector(body, date, false);
  const ecliptic = Astronomy.Ecliptic(vector);
  return normalizeLongitude(ecliptic.elon);
};

/**
 * Refine a rough "closest day" estimate to a precise timestamp using a local minimization.
 *
 * NOTE: this assumes the orb curve is locally unimodal around the provided seed date,
 * which is true for a single pass (direct or retrograde) when seeded near the local minimum.
 */
export const refineExactAspectTime = (params: {
  seedDate: Date;
  // window in hours around the seed date to search within
  windowHours?: number;
  // called to get the transiting longitude at a given time
  transitLongitudeAt: (date: Date) => number;
  natalLongitude: number;
  aspectAngle: number;
}): { date: Date; orb: number } => {
  const { seedDate, windowHours = 36, transitLongitudeAt, natalLongitude, aspectAngle } = params;

  const seedMs = seedDate.getTime();
  let lo = seedMs - windowHours * 60 * 60 * 1000;
  let hi = seedMs + windowHours * 60 * 60 * 1000;

  // Ternary search for the minimum orb within [lo, hi]
  for (let i = 0; i < 40; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;

    const orb1 = aspectOrb(transitLongitudeAt(new Date(m1)), natalLongitude, aspectAngle);
    const orb2 = aspectOrb(transitLongitudeAt(new Date(m2)), natalLongitude, aspectAngle);

    if (orb1 < orb2) {
      hi = m2;
    } else {
      lo = m1;
    }
  }

  const bestMs = (lo + hi) / 2;
  const bestDate = new Date(bestMs);
  const bestOrb = aspectOrb(transitLongitudeAt(bestDate), natalLongitude, aspectAngle);

  return { date: bestDate, orb: bestOrb };
};
