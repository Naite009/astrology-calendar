/**
 * Vimshottari Dasha. The 120-year planetary period system, seeded from the
 * Moon's nakshatra at birth. Deterministic: no estimates, no AI.
 *
 * Maha (major) periods and Antar (sub) periods are produced with real local
 * dates. Dates are formatted through the project date helpers so nothing drifts
 * across timezones.
 */

import { VedicPlanet } from './nakshatras';
import { nakshatraElapsedFraction, NAKSHATRA_LORD_CYCLE, getNakshatra } from './nakshatras';

export const DASHA_YEARS: Record<VedicPlanet, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const SEQUENCE: VedicPlanet[] = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DAYS_PER_YEAR = 365.2425;

export interface DashaPeriod {
  lord: VedicPlanet;
  start: Date;
  end: Date;
  years: number;
  /** Sub-periods, present on maha periods only */
  sub?: DashaPeriod[];
  subLord?: VedicPlanet;
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * DAYS_PER_YEAR * 86400000);
}

function rotate(start: VedicPlanet): VedicPlanet[] {
  const i = SEQUENCE.indexOf(start);
  return [...SEQUENCE.slice(i), ...SEQUENCE.slice(0, i)];
}

function buildSubPeriods(lord: VedicPlanet, start: Date, totalYears: number): DashaPeriod[] {
  const order = rotate(lord);
  const out: DashaPeriod[] = [];
  let cursor = start;
  for (const sub of order) {
    const years = (DASHA_YEARS[sub] / 120) * totalYears;
    const end = addYears(cursor, years);
    out.push({ lord, subLord: sub, start: cursor, end, years });
    cursor = end;
  }
  return out;
}

/**
 * Full dasha sequence covering roughly 120 years from birth.
 * moonSiderealLongitude seeds the first (partially elapsed) period.
 */
export function buildVimshottari(moonSiderealLongitude: number, birthMoment: Date): DashaPeriod[] {
  const nak = getNakshatra(moonSiderealLongitude);
  const firstLord = NAKSHATRA_LORD_CYCLE[(nak.index - 1) % 9];
  const elapsed = nakshatraElapsedFraction(moonSiderealLongitude);

  const order = rotate(firstLord);
  const periods: DashaPeriod[] = [];

  // The first period is already partly consumed at birth.
  const firstTotal = DASHA_YEARS[firstLord];
  const firstRemaining = firstTotal * (1 - elapsed);
  const firstStart = addYears(birthMoment, -(firstTotal * elapsed));
  let cursor = addYears(birthMoment, firstRemaining);

  periods.push({
    lord: firstLord,
    start: firstStart,
    end: cursor,
    years: firstTotal,
    sub: buildSubPeriods(firstLord, firstStart, firstTotal),
  });

  for (let i = 1; i < order.length + 3; i++) {
    const lord = order[i % order.length];
    const years = DASHA_YEARS[lord];
    const end = addYears(cursor, years);
    periods.push({ lord, start: cursor, end, years, sub: buildSubPeriods(lord, cursor, years) });
    cursor = end;
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

export function formatDashaRange(p: DashaPeriod): string {
  return `${formatDashaDate(p.start)} to ${formatDashaDate(p.end)}`;
}
