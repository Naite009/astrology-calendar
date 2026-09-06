/**
 * Independent ephemeris verification for imported, scanned or typed charts.
 *
 * The chart is recomputed from birth date, birth time and birth place through
 * the shared pipeline (birthDataNormalization -> ephemerisEngine) and compared
 * to what the file or the user produced. Read-only: the report says what
 * agrees, what does not, and exactly which inputs (zone, offset, coordinates,
 * UTC instant, engine, conventions) were used, so a wrong time zone or a
 * region-level birthplace is visible instead of hidden inside a number.
 */

import {
  type BirthInput,
  type BirthMoment,
  type BirthAuditTrail,
  type DstFold,
  resolveBirthMoment,
  resolveBirthMomentSync,
  formatLocalDateTime,
} from './birthDataNormalization';
import { calculateNatalFromMoment, type NatalCalculation, type CalculatedPosition } from './natalChartCalculation';
import { circularSeparation, signPositionToLongitude, longitudeToSignPosition } from './ephemerisEngine';
import { formatUtcOffset } from './time/zonedTime';

export interface VerifyPosition {
  sign: string;
  degree: number;
  minutes?: number;
  seconds?: number;
  isRetrograde?: boolean;
}

export type VerifyStatus = 'verified' | 'close' | 'mismatch' | 'missing' | 'unavailable';

export interface BodyVerification {
  body: string;
  label: string;
  entered: VerifyPosition | null;
  computed: VerifyPosition | null;
  /** Unrounded computed longitude (degrees), for callers that want to reuse it. */
  computedLongitude: number | null;
  /** Smallest circular separation in arc-minutes, when both sides exist. */
  deltaArcmin: number | null;
  status: VerifyStatus;
  /** Definition, precision or availability note. */
  note?: string;
  retrogradeMismatch?: boolean;
  /** Angle-derived rows need a precise place; others only need the instant. */
  isAngle: boolean;
}

export type VerificationReadiness =
  | 'ready'
  | 'needs-fold'
  | 'nonexistent-time'
  | 'no-place'
  | 'no-date'
  | 'invalid'
  | 'legacy-offset';

export interface ChartVerification {
  ok: boolean;
  ranAt: string;
  readiness: VerificationReadiness;
  moment: BirthMoment;
  audit: BirthAuditTrail | null;
  /** Everything the user should read before trusting the comparison. */
  warnings: string[];
  results: BodyVerification[];
  cuspResults: BodyVerification[];
  verifiedCount: number;
  mismatchCount: number;
  /** Why no comparison could be made at all (readiness other than ready). */
  blockedReason?: string;
  /** For ambiguous fall-back times: both readings, so the UI can ask. */
  foldCandidates: Array<{ fold: DstFold; label: string }>;
  /** For nonexistent spring-forward times: the first valid clock time. */
  suggestedTime: string | null;
  /** Bodies may be copied into the chart (zone + instant are trustworthy). */
  canApplyBodies: boolean;
  /** Angles, houses, Vertex and Part of Fortune may be copied (precise place). */
  canApplyAngles: boolean;
  /** Why angle rows are unavailable, when they are. */
  anglesReason: string | null;
  calculation: NatalCalculation | null;
}

const LABELS: Record<string, string> = {
  NorthNode: 'North Node',
  SouthNode: 'South Node',
  Lilith: 'Black Moon Lilith',
  PartOfFortune: 'Part of Fortune',
  Ascendant: 'Ascendant',
  Midheaven: 'Midheaven',
};

/**
 * Tolerances in arc-minutes. Entered values are usually rounded to the
 * minute, and a scan can mis-read a digit, so a couple of minutes is
 * agreement, not error. Wider bands are explained in the note.
 */
interface Tolerance { verified: number; close: number; note?: string }
const TOLERANCES: Record<string, Tolerance> = {
  Sun: { verified: 2, close: 20 },
  Moon: { verified: 3, close: 20, note: 'Moves about 0.5 degrees per hour, so it exposes time zone mistakes first.' },
  Mercury: { verified: 2, close: 20 },
  Venus: { verified: 2, close: 20 },
  Mars: { verified: 2, close: 20 },
  Jupiter: { verified: 2, close: 20 },
  Saturn: { verified: 2, close: 20 },
  Uranus: { verified: 2, close: 20 },
  Neptune: { verified: 2, close: 20 },
  Pluto: { verified: 2, close: 20 },
  NorthNode: { verified: 3, close: 120, note: 'True (osculating) node. If the source printed the mean node, expect up to about 1.75 degrees of difference.' },
  SouthNode: { verified: 3, close: 120, note: 'Exactly opposite the North Node (true node).' },
  Chiron: { verified: 6, close: 30, note: 'JPL Horizons data, 1920-2060.' },
  Ceres: { verified: 6, close: 30, note: 'JPL Horizons data, 1920-2060.' },
  Pallas: { verified: 6, close: 30, note: 'JPL Horizons data, 1920-2060.' },
  Juno: { verified: 6, close: 30, note: 'JPL Horizons data, 1920-2060.' },
  Vesta: { verified: 6, close: 30, note: 'JPL Horizons data, 1920-2060.' },
  Eris: { verified: 6, close: 30, note: 'JPL Horizons data, 1920-2060.' },
  Lilith: { verified: 5, close: 60, note: 'Mean Black Moon Lilith. Sources that print the true (osculating) apogee can differ by many degrees.' },
  Ascendant: { verified: 10, close: 45, note: 'Moves about 1 degree every 4 minutes, so it depends on the exact minute and coordinates.' },
  Midheaven: { verified: 10, close: 45, note: 'Depends on the exact minute and longitude.' },
  Vertex: { verified: 10, close: 45, note: 'Depends on the exact minute and coordinates.' },
  PartOfFortune: { verified: 10, close: 45, note: 'Derived from Ascendant, Sun and Moon; day/night formula.' },
};
const DEFAULT_TOLERANCE: Tolerance = { verified: 6, close: 30 };

const VERIFY_ORDER = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus',
  'Neptune', 'Pluto', 'NorthNode', 'SouthNode', 'Chiron', 'Lilith', 'Ceres', 'Pallas',
  'Juno', 'Vesta', 'Eris', 'Ascendant', 'Midheaven', 'Vertex', 'PartOfFortune',
];
const ANGLE_BODIES = new Set(['Ascendant', 'Midheaven', 'Vertex', 'PartOfFortune']);

const MINUTE_ARC = 1 / 60;

export const formatPosition = (p?: VerifyPosition | null): string => {
  if (!p?.sign) return '—';
  const m = String(Math.round(p.minutes || 0)).padStart(2, '0');
  return `${p.sign} ${Math.floor(p.degree || 0)}\u00b0${m}'${p.isRetrograde ? ' \u211e' : ''}`;
};

export const formatDelta = (arcmin: number | null): string => {
  if (arcmin === null) return '';
  if (arcmin < 1) return `${Math.round(arcmin * 60)}"`;
  if (arcmin < 60) return `${Math.round(arcmin)}'`;
  const d = Math.floor(arcmin / 60);
  return `${d}\u00b0${String(Math.round(arcmin % 60)).padStart(2, '0')}'`;
};

const toVerifyPosition = (p: CalculatedPosition | { sign: string; degree: number; minutes: number; seconds: number }): VerifyPosition => ({
  sign: p.sign,
  degree: p.degree,
  minutes: p.minutes,
  seconds: p.seconds,
  ...('isRetrograde' in p && typeof p.isRetrograde === 'boolean' ? { isRetrograde: p.isRetrograde } : {}),
});

export interface VerifyInput extends BirthInput {
  planets?: Record<string, VerifyPosition | undefined>;
  houseCusps?: Record<string, VerifyPosition | undefined>;
}

const readinessFor = (moment: BirthMoment): VerificationReadiness => {
  switch (moment.status) {
    case 'ok':
      return moment.zone?.id === 'fixed-offset' ? 'legacy-offset' : 'ready';
    case 'needs-fold': return 'needs-fold';
    case 'nonexistent': return 'nonexistent-time';
    case 'no-place': return 'no-place';
    case 'no-date': return 'no-date';
    default: return 'invalid';
  }
};

const blockedReasonFor = (readiness: VerificationReadiness, moment: BirthMoment): string | undefined => {
  switch (readiness) {
    case 'ready': return undefined;
    case 'legacy-offset':
      return 'The birthplace could not be resolved, so only the saved fixed offset is known. Positions are shown for reference but nothing is marked verified until a recognizable town and country are entered.';
    case 'needs-fold':
      return moment.warnings[0] || 'That clock time happened twice (clocks fell back). Choose which one applies before verifying.';
    case 'nonexistent-time':
      return moment.warnings[0] || 'That clock time did not exist (clocks sprang forward). Correct the birth time before verifying.';
    case 'no-place':
      return moment.warnings[0] || 'Enter a recognizable birthplace (town and country) so the time zone can be determined.';
    case 'no-date':
      return 'Add the birth date to run verification.';
    default:
      return moment.warnings[0] || 'The birth data could not be interpreted.';
  }
};

const compareRow = (
  body: string,
  entered: VerifyPosition | null,
  computed: CalculatedPosition | { sign: string; degree: number; minutes: number; seconds: number; longitude: number } | null,
  isAngle: boolean,
  extraNote?: string,
): BodyVerification => {
  const label = LABELS[body] || body;
  const tol = TOLERANCES[body] || DEFAULT_TOLERANCE;
  const note = [extraNote, tol.note].filter(Boolean).join(' ') || undefined;

  if (!computed) {
    return { body, label, entered, computed: null, computedLongitude: null, deltaArcmin: null, status: 'unavailable', note, isAngle };
  }
  const computedPos = toVerifyPosition(computed);
  if (!entered) {
    return { body, label, entered: null, computed: computedPos, computedLongitude: computed.longitude, deltaArcmin: null, status: 'missing', note, isAngle };
  }

  const a = signPositionToLongitude(entered);
  if (a === null) {
    return { body, label, entered, computed: computedPos, computedLongitude: computed.longitude, deltaArcmin: null, status: 'unavailable', note: 'The entered sign could not be read.', isAngle };
  }
  // Circular separation on unrounded longitudes; wraps correctly across 0 Aries.
  const deltaArcmin = circularSeparation(a, computed.longitude) * 60;
  // Entered values carry minute precision at best; allow half a minute of rounding.
  const slack = entered.seconds === undefined ? 0.5 : 0;
  const status: VerifyStatus =
    deltaArcmin <= tol.verified + slack ? 'verified'
      : deltaArcmin <= tol.close ? 'close'
        : 'mismatch';

  const retrogradeMismatch =
    !isAngle && body !== 'Sun' && body !== 'Moon' && body !== 'Lilith' &&
    typeof entered.isRetrograde === 'boolean' &&
    typeof computedPos.isRetrograde === 'boolean' &&
    entered.isRetrograde !== computedPos.isRetrograde;

  return {
    body, label, entered, computed: computedPos, computedLongitude: computed.longitude,
    deltaArcmin, status, note, retrogradeMismatch: retrogradeMismatch || undefined, isAngle,
  };
};

/**
 * Compare a chart against a moment that has already been normalized. Pure.
 */
export function verifyChartWithMoment(
  moment: BirthMoment,
  entered: { planets?: Record<string, VerifyPosition | undefined>; houseCusps?: Record<string, VerifyPosition | undefined> } = {},
): ChartVerification {
  const readiness = readinessFor(moment);
  const warnings = [...moment.warnings];
  const base: ChartVerification = {
    ok: false,
    ranAt: new Date().toISOString(),
    readiness,
    moment,
    audit: moment.audit,
    warnings,
    results: [],
    cuspResults: [],
    verifiedCount: 0,
    mismatchCount: 0,
    foldCandidates: moment.foldCandidates.map((c, i) => ({
      fold: (i === 0 ? 'earlier' : 'later') as DstFold,
      label: `${c.abbreviation} (${formatUtcOffset(c.offsetSeconds)}), UTC ${c.utc.toISOString().slice(11, 16)}`,
    })),
    suggestedTime: moment.suggestedLocal
      ? `${String(moment.suggestedLocal.hour).padStart(2, '0')}:${String(moment.suggestedLocal.minute).padStart(2, '0')}`
      : null,
    canApplyBodies: false,
    canApplyAngles: false,
    anglesReason: null,
    calculation: null,
  };

  const blockedReason = blockedReasonFor(readiness, moment);
  if (readiness !== 'ready' && readiness !== 'legacy-offset') {
    return { ...base, blockedReason };
  }

  const calc = calculateNatalFromMoment(moment);
  const planets = entered.planets || {};
  const results: BodyVerification[] = [];

  for (const body of VERIFY_ORDER) {
    const isAngle = ANGLE_BODIES.has(body);
    const enteredPos = planets[body]?.sign ? (planets[body] as VerifyPosition) : null;
    const computed = calc.positions[body] || null;
    if (isAngle && !computed) {
      results.push({
        body, label: LABELS[body] || body, entered: enteredPos, computed: null, computedLongitude: null,
        deltaArcmin: null, status: 'unavailable', note: calc.anglesReason || 'Not calculated.', isAngle,
      });
      continue;
    }
    if (!computed) {
      const reason = calc.unavailable.find(u => u.key === body)?.reason;
      results.push({
        body, label: LABELS[body] || body, entered: enteredPos, computed: null, computedLongitude: null,
        deltaArcmin: null, status: 'unavailable', note: reason || 'Not calculated.', isAngle,
      });
      continue;
    }
    const variantNote = computed.variant && body !== 'PartOfFortune' ? `Computed as ${computed.variant}.` : undefined;
    results.push(compareRow(body, enteredPos, computed, isAngle, variantNote));
  }

  // House cusps, when the caller has them and angles could be calculated.
  const cuspResults: BodyVerification[] = [];
  const cusps = entered.houseCusps || {};
  if (calc.houseCusps) {
    for (let h = 1; h <= 12; h++) {
      const key = `house${h}`;
      const enteredCusp = cusps[key]?.sign ? (cusps[key] as VerifyPosition) : null;
      const computedCusp = calc.houseCusps[key as keyof typeof calc.houseCusps];
      const row = compareRow(key, enteredCusp, computedCusp, true);
      row.label = h === 1 ? 'House 1 (Ascendant)' : h === 10 ? 'House 10 (Midheaven)' : `House ${h}`;
      row.note = `${calc.moment.audit?.houseSystem || 'Placidus'} cusp.`;
      cuspResults.push(row);
    }
  }

  // Apply gates. Bodies: a real zone with high confidence. Angles: also a precise place.
  const zoneTrusted = readiness === 'ready' && !!moment.zone && moment.zone.id !== 'fixed-offset' &&
    (!moment.place || moment.place.zoneConfidence !== 'low');
  const canApplyBodies = zoneTrusted && moment.status === 'ok';
  const canApplyAngles = canApplyBodies && !!calc.angles && !!moment.place && moment.place.confidence === 'high' && !moment.timeAssumed;

  if (readiness === 'legacy-offset') {
    // Everything computed from a fixed offset is reference only.
    for (const r of results) if (r.status === 'verified' || r.status === 'close') r.status = 'close';
  }

  const verifiedCount = results.filter(r => r.status === 'verified').length;
  const mismatchCount = results.filter(r => r.status === 'mismatch' || r.retrogradeMismatch).length
    + cuspResults.filter(r => r.status === 'mismatch').length;

  return {
    ...base,
    ok: readiness === 'ready' && mismatchCount === 0,
    blockedReason,
    results,
    cuspResults,
    verifiedCount,
    mismatchCount,
    canApplyBodies,
    canApplyAngles,
    anglesReason: calc.anglesReason,
    calculation: calc,
  };
}

/**
 * Synchronous verification: stored place metadata or the offline city table.
 * Use the async form from UI code so unknown towns can be geocoded.
 */
export function verifyChartAgainstEphemeris(input: VerifyInput): ChartVerification {
  const { planets, houseCusps, ...birth } = input;
  return verifyChartWithMoment(resolveBirthMomentSync(birth), { planets, houseCusps });
}

export async function verifyChartAgainstEphemerisAsync(
  input: VerifyInput,
  options: { network?: boolean; signal?: AbortSignal } = {},
): Promise<ChartVerification> {
  const { planets, houseCusps, ...birth } = input;
  return verifyChartWithMoment(await resolveBirthMoment(birth, options), { planets, houseCusps });
}

/** Human-readable local time line for the header, honest about precision. */
export const describeLocalBirthTime = (moment: BirthMoment): string => {
  if (!moment.local) return '';
  return formatLocalDateTime(moment.local, moment.timePrecision) + (moment.timeAssumed ? ' (noon assumed)' : '');
};

/** Convenience for callers that only have a longitude and want a row-like position. */
export const positionFromLongitude = (lon: number): VerifyPosition => {
  const p = longitudeToSignPosition(lon);
  return { sign: p.sign, degree: p.degree, minutes: p.minutes, seconds: p.seconds };
};

/** Rows that differ by more than half a minute count as real differences. */
export const isMeaningfulDelta = (deltaArcmin: number | null): boolean => deltaArcmin !== null && deltaArcmin > MINUTE_ARC * 30;
