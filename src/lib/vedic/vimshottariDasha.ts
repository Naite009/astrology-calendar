/**
 * Vimshottari Dasha. The 120-year planetary period system, seeded from the
 * Moon's exact sidereal longitude at birth. Deterministic: no estimates, no AI.
 *
 * Birth balance rule (this is the part that is easy to get wrong):
 *   remaining fraction = (13 20' - degrees traveled in the birth nakshatra) / 13 20'
 *   balance years       = remaining fraction x full Vimshottari years of the nakshatra lord
 * The first mahadasha shown to the user therefore starts AT BIRTH and runs only
 * for that balance. Every later mahadasha is chained from the end of the balance.
 * Antardashas inside the first mahadasha are built from the notional (pre-birth)
 * start of the full period and then clipped at birth, which is the classical
 * method, so the sub-period the person is born into is correct.
 */

import { VedicPlanet } from './nakshatras';
import { getNakshatra, NAKSHATRA_SPAN } from './nakshatras';

export const DASHA_YEARS: Record<VedicPlanet, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const SEQUENCE: VedicPlanet[] = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DAYS_PER_YEAR = 365.2425;
const TOTAL_YEARS = 120;

export interface DashaPeriod {
  lord: VedicPlanet;
  start: Date;
  end: Date;
  /** Actual length of this period as displayed, in years. */
  years: number;
  /** Sub-periods, present on maha periods only */
  sub?: DashaPeriod[];
  subLord?: VedicPlanet;
  /** True on the first mahadasha, which is only the balance remaining at birth. */
  isBirthBalance?: boolean;
  /** Standard full length of the period, useful when years is a partial balance. */
  fullYears?: number;
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * DAYS_PER_YEAR * 86400000);
}

function rotate(start: VedicPlanet): VedicPlanet[] {
  const i = SEQUENCE.indexOf(start);
  return [...SEQUENCE.slice(i), ...SEQUENCE.slice(0, i)];
}

/** Antardashas of one mahadasha, proportional to each lord's Vimshottari years. */
function buildSubPeriods(lord: VedicPlanet, start: Date, totalYears: number): DashaPeriod[] {
  const order = rotate(lord);
  const out: DashaPeriod[] = [];
  let cursor = start;
  for (const sub of order) {
    const years = (DASHA_YEARS[sub] / TOTAL_YEARS) * totalYears;
    const end = addYears(cursor, years);
    out.push({ lord, subLord: sub, start: cursor, end, years });
    cursor = end;
  }
  return out;
}

export interface DashaSeed {
  moonLongitude: number;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  lord: VedicPlanet;
  /** Degrees traveled inside the birth nakshatra */
  degreesElapsed: number;
  degreesRemaining: number;
  elapsedFraction: number;
  remainingFraction: number;
  fullYears: number;
  balanceYears: number;
  /** Where the full period would have begun had it run untruncated */
  notionalStart: Date;
  balanceEnd: Date;
}

/**
 * The exact birth balance of the first mahadasha. Exposed on its own so the
 * dasha maths can be tested and QA-reported without rendering anything.
 */
export function computeDashaSeed(moonSiderealLongitude: number, birthMoment: Date): DashaSeed {
  const nak = getNakshatra(moonSiderealLongitude);
  const lord = nak.lord;
  const degreesElapsed = nak.degreeInNakshatra;
  const degreesRemaining = NAKSHATRA_SPAN - degreesElapsed;
  const elapsedFraction = degreesElapsed / NAKSHATRA_SPAN;
  const remainingFraction = 1 - elapsedFraction;
  const fullYears = DASHA_YEARS[lord];
  const balanceYears = fullYears * remainingFraction;
  return {
    moonLongitude: nak.longitude,
    nakshatra: nak.name,
    nakshatraIndex: nak.index,
    pada: nak.pada,
    lord,
    degreesElapsed,
    degreesRemaining,
    elapsedFraction,
    remainingFraction,
    fullYears,
    balanceYears,
    notionalStart: addYears(birthMoment, -(fullYears * elapsedFraction)),
    balanceEnd: addYears(birthMoment, balanceYears),
  };
}

/**
 * Full mahadasha sequence starting at birth. The first entry is the balance of
 * the birth nakshatra lord's period; the rest follow the fixed Vimshottari order.
 */
export function buildVimshottari(moonSiderealLongitude: number, birthMoment: Date): DashaPeriod[] {
  const seed = computeDashaSeed(moonSiderealLongitude, birthMoment);
  const order = rotate(seed.lord);
  const periods: DashaPeriod[] = [];

  // First mahadasha: starts at birth, runs for the remaining balance only.
  const firstSubs = buildSubPeriods(seed.lord, seed.notionalStart, seed.fullYears)
    .filter(s => s.end > birthMoment)
    .map(s => (s.start < birthMoment ? { ...s, start: new Date(birthMoment), years: (s.end.getTime() - birthMoment.getTime()) / (DAYS_PER_YEAR * 86400000) } : s));

  periods.push({
    lord: seed.lord,
    start: new Date(birthMoment),
    end: seed.balanceEnd,
    years: seed.balanceYears,
    fullYears: seed.fullYears,
    isBirthBalance: true,
    sub: firstSubs,
  });

  // Chain the remaining periods from the exact end of the birth balance.
  let cursor = seed.balanceEnd;
  for (let i = 1; i < order.length; i++) {
    const lord = order[i];
    const years = DASHA_YEARS[lord];
    const end = addYears(cursor, years);
    periods.push({ lord, start: cursor, end, years, fullYears: years, sub: buildSubPeriods(lord, cursor, years) });
    cursor = end;
  }

  // One more turn of the first lord closes the 120-year cycle, so a long life
  // is still covered after a short birth balance.
  const wrapYears = seed.fullYears - seed.balanceYears;
  if (wrapYears > 0.01) {
    periods.push({
      lord: seed.lord,
      start: cursor,
      end: addYears(cursor, wrapYears),
      years: wrapYears,
      fullYears: seed.fullYears,
      sub: buildSubPeriods(seed.lord, cursor, seed.fullYears).filter(s => s.start < addYears(cursor, wrapYears)),
    });
  }

  return periods;
}

export interface CurrentDasha {
  maha: DashaPeriod;
  antar: DashaPeriod | null;
  /** 0-1 progress through the maha period */
  progress: number;
}

export function findCurrentDasha(periods: DashaPeriod[], when: Date = new Date()): CurrentDasha | null {
  const maha = periods.find(p => when >= p.start && when < p.end);
  if (!maha) return null;
  const antar = maha.sub?.find(s => when >= s.start && when < s.end) || null;
  const progress = (when.getTime() - maha.start.getTime()) / (maha.end.getTime() - maha.start.getTime());
  return { maha, antar, progress: Math.min(1, Math.max(0, progress)) };
}

export function formatDashaDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDashaDateExact(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDashaRange(p: DashaPeriod): string {
  return `${formatDashaDate(p.start)} to ${formatDashaDate(p.end)}`;
}

/** Age at a given date, in whole years. Used to keep the timeline human-scaled. */
export function ageAt(birthMoment: Date, when: Date): number {
  return Math.floor((when.getTime() - birthMoment.getTime()) / (DAYS_PER_YEAR * 86400000));
}

/** "age 41 to 61", clamped so the birth-balance period reads as "from birth". */
export function formatAgeRange(p: DashaPeriod, birthMoment: Date): string {
  const from = ageAt(birthMoment, p.start);
  const to = ageAt(birthMoment, p.end);
  return from <= 0 ? `birth to age ${to}` : `age ${from} to ${to}`;
}

export function formatYears(years: number): string {
  if (years >= 2) return `${years.toFixed(1)} years`;
  const months = years * 12;
  if (months >= 1.5) return `${months.toFixed(1)} months`;
  return `${Math.round(months * 30.44)} days`;
}
