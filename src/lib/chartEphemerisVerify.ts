/**
 * Independent ephemeris verification for imported charts.
 *
 * A drag-and-drop scan reads a picture. This module ignores the picture and
 * recomputes the same chart from birth date, birth time and birth place with
 * astronomy-engine, then compares the two. Nothing is ever overwritten here:
 * the result is a report the UI can render as green checks (double verified)
 * or flags (scan value disagrees with the ephemeris).
 */

import {
  calculateNatalChart,
  getCoordinatesFromLocation,
  detectTimezoneFromLocation,
  calculateAscendant,
  calculateVertex,
  calculatePartOfFortune,
} from './astrology';

/**
 * Region-level coordinates for places the city table does not know
 * (e.g. "NJ", "New Jersey"). Angles computed from these are approximate,
 * so the report labels them as such instead of claiming verification.
 */
const REGION_COORDINATES: Array<{ terms: string[]; lat: number; lon: number }> = [
  { terms: ['new jersey', ' nj', ',nj', 'newark', 'jersey city', 'paterson', 'trenton', 'edison', 'toms river', 'morristown', 'hackensack', 'princeton'], lat: 40.5, lon: -74.4 },
  { terms: ['new york state', ' ny', ',ny', 'albany', 'buffalo', 'rochester', 'syracuse', 'long island'], lat: 40.9, lon: -73.8 },
  { terms: ['connecticut', ' ct', ',ct', 'hartford', 'stamford', 'new haven'], lat: 41.6, lon: -72.7 },
  { terms: ['pennsylvania', ' pa', ',pa', 'allentown', 'harrisburg', 'scranton'], lat: 40.3, lon: -76.9 },
  { terms: ['massachusetts', ' ma', ',ma', 'worcester', 'springfield ma'], lat: 42.3, lon: -71.8 },
  { terms: ['maryland', ' md', ',md', 'rockville', 'annapolis'], lat: 39.0, lon: -76.8 },
  { terms: ['virginia', ' va', ',va', 'richmond', 'norfolk', 'arlington'], lat: 37.5, lon: -77.4 },
  { terms: ['new hampshire', 'vermont', 'maine', 'rhode island', 'providence'], lat: 43.5, lon: -71.6 },
  { terms: ['florida', ' fl', ',fl'], lat: 28.5, lon: -81.4 },
  { terms: ['ohio', ' oh', ',oh'], lat: 40.0, lon: -82.9 },
  { terms: ['texas', ' tx', ',tx'], lat: 31.0, lon: -97.5 },
  { terms: ['california', ' ca', ',ca'], lat: 36.8, lon: -119.4 },
  { terms: ['illinois', ' il', ',il'], lat: 40.0, lon: -89.0 },
];

const fallbackCoordinates = (location: string): { lat: number; lon: number } | null => {
  const l = ` ${location.toLowerCase().trim()} `;
  for (const region of REGION_COORDINATES) {
    if (region.terms.some((t) => l.includes(t))) return { lat: region.lat, lon: region.lon };
  }
  return null;
};

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export interface VerifyPosition {
  sign: string;
  degree: number;
  minutes?: number;
  isRetrograde?: boolean;
}

export type VerifyStatus = 'verified' | 'close' | 'mismatch' | 'missing' | 'unavailable';

export interface BodyVerification {
  body: string;
  label: string;
  entered: VerifyPosition | null;
  computed: VerifyPosition | null;
  /** Absolute difference in arc-minutes, when both sides exist. */
  deltaArcmin: number | null;
  status: VerifyStatus;
  /** Wider tolerance bodies (angles, slow asteroid models) get a note. */
  note?: string;
  retrogradeMismatch?: boolean;
}

export interface ChartVerification {
  ok: boolean;
  ranAt: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  /** Timezone offset in hours used for the recomputation. */
  timezoneOffset: number | null;
  coordinates: { lat: number; lon: number } | null;
  results: BodyVerification[];
  verifiedCount: number;
  mismatchCount: number;
  /** Why verification could not run at all. */
  blockedReason?: string;
}

const LABELS: Record<string, string> = {
  NorthNode: 'North Node',
  SouthNode: 'South Node',
  Lilith: 'Black Moon Lilith',
  PartOfFortune: 'Part of Fortune',
  Ascendant: 'Ascendant',
  Midheaven: 'Midheaven',
};

/** Fast-moving, exactly modelled bodies: tight tolerance. */
const TIGHT_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'NorthNode',
];

/** Bodies whose models or coordinate dependence justify a wider tolerance. */
const LOOSE_BODIES: Record<string, string> = {
  Chiron: 'Chiron uses an orbital model, small differences are normal.',
  Lilith: 'Mean Black Moon Lilith; sources differ between mean and true.',
  Ceres: 'Asteroid orbital model, small differences are normal.',
  Pallas: 'Asteroid orbital model, small differences are normal.',
  Juno: 'Asteroid orbital model, small differences are normal.',
  Vesta: 'Asteroid orbital model, small differences are normal.',
  Ascendant: 'Depends on exact coordinates and birth minute.',
  Vertex: 'Depends on exact coordinates and birth minute.',
  PartOfFortune: 'Derived from the Ascendant, so it inherits its tolerance.',
};

const VERIFY_ORDER = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus',
  'Neptune', 'Pluto', 'NorthNode', 'Chiron', 'Lilith', 'Ceres', 'Pallas',
  'Juno', 'Vesta', 'Ascendant', 'Vertex', 'PartOfFortune',
];

const absLon = (p?: VerifyPosition | null): number | null => {
  if (!p?.sign) return null;
  const i = SIGNS.indexOf(p.sign);
  if (i < 0) return null;
  return i * 30 + (p.degree || 0) + (p.minutes || 0) / 60;
};

/** Shortest separation between two ecliptic longitudes, in arc-minutes. */
const separationArcmin = (a: number, b: number): number => {
  const degrees = Math.abs(((a - b + 540) % 360) - 180);
  return degrees * 60;
};

export const formatPosition = (p?: VerifyPosition | null): string => {
  if (!p?.sign) return '—';
  const m = String(Math.round(p.minutes || 0)).padStart(2, '0');
  return `${p.sign} ${Math.floor(p.degree || 0)}\u00b0${m}'${p.isRetrograde ? ' \u211e' : ''}`;
};

export const formatDelta = (arcmin: number | null): string => {
  if (arcmin === null) return '';
  if (arcmin < 60) return `${Math.round(arcmin)}'`;
  const d = Math.floor(arcmin / 60);
  return `${d}\u00b0${String(Math.round(arcmin % 60)).padStart(2, '0')}'`;
};

export interface VerifyInput {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  timezoneOffset?: number | null;
  planets?: Record<string, VerifyPosition | undefined>;
}

/**
 * Recompute the chart from birth data and compare it to what was entered
 * or scanned. Read-only: callers decide what, if anything, to change.
 */
export function verifyChartAgainstEphemeris(input: VerifyInput): ChartVerification {
  const birthDate = (input.birthDate || '').trim();
  const birthTime = (input.birthTime || '').trim();
  const birthLocation = (input.birthLocation || '').trim();

  const base: ChartVerification = {
    ok: false,
    ranAt: new Date().toISOString(),
    birthDate,
    birthTime,
    birthLocation,
    timezoneOffset: null,
    coordinates: null,
    results: [],
    verifiedCount: 0,
    mismatchCount: 0,
  };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return { ...base, blockedReason: 'Add the birth date (YYYY-MM-DD) to run verification.' };
  }

  let coordinates = birthLocation ? getCoordinatesFromLocation(birthLocation) : null;
  let coordsApproximate = false;
  if (!coordinates && birthLocation) {
    const fallback = fallbackCoordinates(birthLocation);
    if (fallback) {
      coordinates = fallback;
      coordsApproximate = true;
    }
  }
  let offset = typeof input.timezoneOffset === 'number' ? input.timezoneOffset : null;
  if (birthLocation) {
    const [y, m, d] = birthDate.split('-').map(Number);
    const detected = detectTimezoneFromLocation(birthLocation, new Date(y, m - 1, d));
    if (detected) {
      offset = detected.offset;
    } else if (offset === null) {
      // Region-level lookup (handles "NJ", "New Jersey", state-only entries)
      const zone = lookupTimezone(birthLocation, birthDate);
      if (zone?.timezone) offset = getTimezoneInfoForDate(zone.timezone, birthDate).offset;
    }
  }

  let computed: Record<string, VerifyPosition> = {};
  try {
    computed = calculateNatalChart(birthDate, birthTime || '12:00', offset ?? 0, birthLocation) as any;
  } catch {
    return { ...base, coordinates, timezoneOffset: offset, blockedReason: 'The ephemeris recomputation failed for this birth data.' };
  }

  // Angles when the city table did not know the place but a region did.
  if (coordinates && coordsApproximate && birthTime) {
    try {
      const [y, m, d] = birthDate.split('-').map(Number);
      const [hh, mm] = birthTime.split(':').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d, (hh || 0) - (offset ?? 0), mm || 0));
      const asc = calculateAscendant(date, coordinates.lat, coordinates.lon);
      if (asc?.sign) computed.Ascendant = asc;
      const vtx = calculateVertex(date, coordinates.lat, coordinates.lon);
      if (vtx?.sign) computed.Vertex = vtx;
      const ascLon = absLon(asc);
      const sunLon = absLon(computed.Sun);
      const moonLon = absLon(computed.Moon);
      if (ascLon !== null && sunLon !== null && moonLon !== null) {
        const pof = calculatePartOfFortune(ascLon, sunLon, moonLon, date, coordinates.lat);
        if (pof?.sign) computed.PartOfFortune = pof;
      }
    } catch {
      // leave the angles unavailable
    }
  }

  const entered = input.planets || {};
  const results: BodyVerification[] = [];

  for (const body of VERIFY_ORDER) {
    const enteredPos = entered[body]?.sign ? (entered[body] as VerifyPosition) : null;
    const computedPos = computed[body]?.sign ? computed[body] : null;
    const label = LABELS[body] || body;
    const needsAnglesBody = body === 'Ascendant' || body === 'Vertex' || body === 'PartOfFortune';
    const note = needsAnglesBody && coordsApproximate
      ? 'Computed from region-level coordinates, so treat it as a sanity check, not an exact value.'
      : LOOSE_BODIES[body];

    // Angles and derived points need a birth time and known coordinates.
    const needsAngles = body === 'Ascendant' || body === 'Vertex' || body === 'PartOfFortune';
    if (needsAngles && (!birthTime || !coordinates)) {
      results.push({
        body, label, entered: enteredPos, computed: null, deltaArcmin: null,
        status: 'unavailable',
        note: !birthTime ? 'Needs an exact birth time.' : 'Birth place not recognised, so coordinates are unknown.',
      });
      continue;
    }

    if (!computedPos) {
      results.push({ body, label, entered: enteredPos, computed: null, deltaArcmin: null, status: 'unavailable', note });
      continue;
    }

    if (!enteredPos) {
      results.push({ body, label, entered: null, computed: computedPos, deltaArcmin: null, status: 'missing', note });
      continue;
    }

    const a = absLon(enteredPos);
    const b = absLon(computedPos);
    if (a === null || b === null) {
      results.push({ body, label, entered: enteredPos, computed: computedPos, deltaArcmin: null, status: 'unavailable', note });
      continue;
    }

    const delta = separationArcmin(a, b);
    const tight = TIGHT_BODIES.includes(body);
    // Tolerances: entered values are usually rounded to whole minutes, and a
    // scan can round degrees, so a few arc-minutes is agreement, not error.
    const approxAngle = needsAnglesBody && coordsApproximate;
    const verifyLimit = approxAngle ? 0 : tight ? 12 : 90;
    const closeLimit = approxAngle ? 600 : tight ? 60 : 240;
    const status: VerifyStatus =
      enteredPos.sign !== computedPos.sign && delta > closeLimit
        ? 'mismatch'
        : delta <= verifyLimit
          ? 'verified'
          : delta <= closeLimit
            ? 'close'
            : 'mismatch';

    const retroMismatch =
      body !== 'Sun' && body !== 'Moon' &&
      typeof enteredPos.isRetrograde === 'boolean' &&
      typeof computedPos.isRetrograde === 'boolean' &&
      enteredPos.isRetrograde !== computedPos.isRetrograde;

    results.push({
      body, label, entered: enteredPos, computed: computedPos,
      deltaArcmin: delta,
      status,
      note,
      retrogradeMismatch: retroMismatch || undefined,
    });
  }

  const verifiedCount = results.filter(r => r.status === 'verified').length;
  const mismatchCount = results.filter(r => r.status === 'mismatch' || r.retrogradeMismatch).length;

  return {
    ...base,
    ok: mismatchCount === 0,
    timezoneOffset: offset,
    coordinates,
    results,
    verifiedCount,
    mismatchCount,
  };
}
