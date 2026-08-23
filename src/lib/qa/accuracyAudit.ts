/**
 * Chart math audit for the reference people.
 *
 * Every value the app produces is compared against a frozen expected value
 * that came from an independent source (JPL Horizons, IANA tzdata, Meeus).
 * This module never writes anything: it grades.
 */

import {
  calculateNatalChart,
  detectTimezoneFromLocation,
  calculateAscendant,
  calculatePlacidusHouseCusps,
} from '../astrology';
import { autoFillChartBodies } from '../chartAutoFill';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { ReferencePerson } from '@/test/fixtures/referencePeople';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const signIndexOf = (sign?: string | null): number =>
  sign ? SIGNS.indexOf(sign) : -1;

export const absLongitude = (
  p?: { sign?: string; degree?: number; minutes?: number; seconds?: number } | null,
): number | null => {
  const i = signIndexOf(p?.sign);
  if (i < 0) return null;
  return i * 30 + (p!.degree || 0) + (p!.minutes || 0) / 60 + (p!.seconds || 0) / 3600;
};

/** Shortest separation between two longitudes, in arc-minutes. */
export const arcminBetween = (a: number, b: number): number =>
  Math.abs(((a - b + 540) % 360) - 180) * 60;

/**
 * Tolerance in arc-minutes per body, with the reason it is what it is.
 * Tight bodies are exactly modelled, so anything past a few arc-minutes is a
 * real error. Wider bodies differ between ephemeris models by design.
 */
export const TOLERANCE_ARCMIN: Record<string, { limit: number; reason?: string }> = {
  Sun: { limit: 6 },
  Moon: { limit: 8 },
  Mercury: { limit: 6 },
  Venus: { limit: 6 },
  Mars: { limit: 6 },
  Jupiter: { limit: 6 },
  Saturn: { limit: 6 },
  Uranus: { limit: 6 },
  Neptune: { limit: 6 },
  Pluto: { limit: 8 },
  Chiron: { limit: 60, reason: 'Chiron is an orbital model, so sources differ by tens of arc-minutes.' },
  NorthNode: { limit: 120, reason: 'Reference value is the mean node; the app uses the true node, which swings up to 1.7 degrees either side.' },
  Ascendant: { limit: 30, reason: 'City-level coordinates and rounding to the minute both move the Ascendant slightly.' },
  Midheaven: { limit: 30, reason: 'Same coordinate rounding as the Ascendant.' },
};

export type MathStatus = 'pass' | 'close' | 'fail' | 'missing';

export interface BodyAudit {
  body: string;
  expected: number;
  actual: number | null;
  deltaArcmin: number | null;
  limit: number;
  status: MathStatus;
  note?: string;
}

export interface InvariantAudit {
  name: string;
  ok: boolean;
  detail: string;
}

export interface PersonMathAudit {
  id: string;
  name: string;
  birthLine: string;
  why: string;
  approximateTime: boolean;
  timezone: {
    expectedOffset: number;
    resolvedOffset: number | null;
    ok: boolean;
    detail: string;
  };
  bodies: BodyAudit[];
  invariants: InvariantAudit[];
  passCount: number;
  closeCount: number;
  failCount: number;
  /** 0..1 across bodies and invariants. */
  score: number;
  chart: NatalChart;
}

const fmtLon = (lon: number | null): string => {
  if (lon === null) return '—';
  const norm = ((lon % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(norm / 30)];
  const deg = norm % 30;
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${sign} ${d}\u00b0${String(m).padStart(2, '0')}'`;
};

export const formatLongitude = fmtLon;

export const formatArcmin = (v: number | null): string => {
  if (v === null) return '—';
  if (v < 60) return `${v.toFixed(1)}'`;
  return `${Math.floor(v / 60)}\u00b0${String(Math.round(v % 60)).padStart(2, '0')}'`;
};

/** Build the app's own chart for a reference person, exactly as the app would. */
export function buildReferenceChart(person: ReferencePerson): NatalChart {
  const resolved = detectTimezoneFromLocation(
    person.birthLocation,
    new Date(`${person.birthDate}T12:00:00Z`),
  );
  const offset = typeof resolved?.offset === 'number' ? resolved.offset : person.utcOffsetHours;

  const positions = calculateNatalChart(
    person.birthDate,
    person.birthTime,
    offset,
    person.birthLocation,
  ) as Record<string, { sign: string; degree: number; minutes: number; seconds: number; isRetrograde?: boolean }>;

  const planets: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(positions)) {
    if (value?.sign) planets[key] = value;
  }

  const base: NatalChart = {
    id: person.id,
    name: person.name,
    birthDate: person.birthDate,
    birthTime: person.birthTime,
    birthLocation: person.birthLocation,
    timezoneOffset: offset,
    planets: planets as NatalChart['planets'],
  } as NatalChart;

  return autoFillChartBodies(base);
}

const utcMoment = (person: ReferencePerson, offset: number): Date => {
  const [y, m, d] = person.birthDate.split('-').map(Number);
  const [hh, mm] = person.birthTime.split(':').map(Number);
  // Fractional offsets must go through the minutes argument: Date.UTC
  // truncates a fractional hour and would silently drop 30 minutes.
  return new Date(Date.UTC(y, m - 1, d, hh || 0, (mm || 0) - Math.round(offset * 60)));
};

/** Grade one reference person's chart math. */
export function auditPersonMath(person: ReferencePerson): PersonMathAudit {
  const chart = buildReferenceChart(person);
  const resolvedOffset = typeof chart.timezoneOffset === 'number' ? chart.timezoneOffset : null;
  const tzOk = resolvedOffset !== null && Math.abs(resolvedOffset - person.utcOffsetHours) < 0.01;

  const moment = utcMoment(person, resolvedOffset ?? person.utcOffsetHours);
  const midheaven = (() => {
    try {
      const cusps = calculatePlacidusHouseCusps(moment, person.lat, person.lon) as unknown as Record<string, { sign: string; degree: number; minutes: number }>;
      return absLongitude(cusps.house10);
    } catch {
      return null;
    }
  })();
  const ascendant = (() => {
    try {
      return absLongitude(calculateAscendant(moment, person.lat, person.lon));
    } catch {
      return null;
    }
  })();

  const bodies: BodyAudit[] = [];
  for (const [body, expected] of Object.entries(person.expected)) {
    const tol = TOLERANCE_ARCMIN[body] ?? { limit: 60 };
    let actual: number | null;
    if (body === 'Midheaven') actual = midheaven;
    else if (body === 'Ascendant') actual = ascendant ?? absLongitude(chart.planets.Ascendant);
    else actual = absLongitude((chart.planets as Record<string, { sign: string; degree: number; minutes: number } | undefined>)[body]);

    if (actual === null) {
      bodies.push({ body, expected, actual: null, deltaArcmin: null, limit: tol.limit, status: 'missing', note: tol.reason });
      continue;
    }
    const delta = arcminBetween(expected, actual);
    const status: MathStatus =
      delta <= tol.limit ? 'pass' : delta <= tol.limit * 3 ? 'close' : 'fail';
    bodies.push({ body, expected, actual, deltaArcmin: delta, limit: tol.limit, status, note: tol.reason });
  }

  // ── Invariants that must hold no matter what the expected values say ──────
  const invariants: InvariantAudit[] = [];
  const cusps = chart.houseCusps as Record<string, { sign: string; degree: number; minutes: number }> | undefined;
  const cuspLons: Array<number | null> = [];
  for (let i = 1; i <= 12; i++) cuspLons.push(absLongitude(cusps?.[`house${i}`]));

  const h1 = cuspLons[0];
  const h7 = cuspLons[6];
  invariants.push({
    name: 'Ascendant and Descendant are opposite',
    ok: h1 !== null && h7 !== null && Math.abs(arcminBetween(h1, (h7 + 180) % 360)) < 6,
    detail: h1 === null || h7 === null ? 'House 1 or 7 missing.' : `1st ${fmtLon(h1)}, 7th ${fmtLon(h7)}`,
  });

  const h10 = cuspLons[9];
  const h4 = cuspLons[3];
  invariants.push({
    name: 'Midheaven and IC are opposite',
    ok: h10 !== null && h4 !== null && Math.abs(arcminBetween(h10, (h4 + 180) % 360)) < 6,
    detail: h10 === null || h4 === null ? 'House 10 or 4 missing.' : `10th ${fmtLon(h10)}, 4th ${fmtLon(h4)}`,
  });

  const ordered = cuspLons.every((v) => v !== null) && cuspLons.every((v, i) => {
    if (i === 0) return true;
    const prev = cuspLons[i - 1]!;
    const span = ((v! - prev) % 360 + 360) % 360;
    return span > 0.01 && span < 180;
  });
  invariants.push({
    name: 'House cusps run forward in zodiacal order',
    ok: ordered,
    detail: ordered ? 'All twelve cusps ascend.' : 'A cusp is out of order or missing.',
  });

  const nn = absLongitude(chart.planets.NorthNode);
  const sn = absLongitude(chart.planets.SouthNode);
  invariants.push({
    name: 'North and South Node are exactly opposite',
    ok: nn !== null && sn !== null && arcminBetween(nn, (sn + 180) % 360) < 2,
    detail: nn === null || sn === null ? 'A node is missing.' : `${fmtLon(nn)} / ${fmtLon(sn)}`,
  });

  const signsDerived = Object.entries(chart.planets).every(([, p]) => {
    const pos = p as { sign?: string; degree?: number } | undefined;
    if (!pos?.sign) return true;
    const lon = absLongitude(pos);
    if (lon === null) return false;
    return SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)] === pos.sign;
  });
  invariants.push({
    name: 'Every body\u2019s sign matches its own longitude',
    ok: signsDerived,
    detail: signsDerived ? 'No sign / degree mismatch.' : 'A body carries a sign that its degree does not support.',
  });

  const vertex = absLongitude(chart.planets.Vertex);
  const vertexOk = vertex === null || h7 === null
    ? true
    : arcminBetween(vertex, h1 ?? 0) > 60;
  invariants.push({
    name: 'Vertex is not the Antivertex (never equal to the Ascendant)',
    ok: vertexOk,
    detail: vertex === null ? 'No Vertex computed.' : `Vertex ${fmtLon(vertex)}`,
  });

  invariants.push({
    name: 'Timezone and daylight saving resolved correctly',
    ok: tzOk,
    detail: `expected ${person.utcOffsetHours >= 0 ? '+' : ''}${person.utcOffsetHours}h, app used ${resolvedOffset === null ? 'none' : `${resolvedOffset >= 0 ? '+' : ''}${resolvedOffset}h`}`,
  });

  const passCount = bodies.filter((b) => b.status === 'pass').length;
  const closeCount = bodies.filter((b) => b.status === 'close').length;
  const failCount = bodies.filter((b) => b.status === 'fail' || b.status === 'missing').length;
  const invariantPass = invariants.filter((i) => i.ok).length;
  const score = (passCount + closeCount * 0.5 + invariantPass) / (bodies.length + invariants.length);

  return {
    id: person.id,
    name: person.name,
    birthLine: `${person.birthDate} ${person.birthTime} ${person.birthLocation} (${person.timezone})`,
    why: person.why,
    approximateTime: person.approximateTime,
    timezone: {
      expectedOffset: person.utcOffsetHours,
      resolvedOffset,
      ok: tzOk,
      detail: tzOk ? 'Matches tzdata.' : 'Offset disagrees with tzdata, so every position shifts.',
    },
    bodies,
    invariants,
    passCount,
    closeCount,
    failCount,
    score,
    chart,
  };
}
