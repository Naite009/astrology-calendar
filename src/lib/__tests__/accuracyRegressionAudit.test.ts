/**
 * Regression guard for the independent accuracy audit.
 *
 * Each block pins a bug that was actually found in the code and fixed:
 *  1. Slow-body table edges: clamped Catmull-Rom neighbours bent the curve in
 *     the first and last 10-day segment (Vesta was 22' off on 1920-01-04).
 *  2. Solar arc: the progressed day was floored to whole years (up to 1° of
 *     arc lost) and the birth instant was read in the browser's zone.
 *  3. Davison: birth dates were parsed as UTC midnight, throwing away the
 *     birth time and zone entirely.
 *  4. Human Design: an unknown zone with no numeric offset silently produced
 *     an invalid instant instead of refusing.
 *
 * Reference longitudes are apparent geocentric ecliptic-of-date values from
 * JPL Horizons (Vesta = 4;, Ceres = 1;, Chiron = 2060;), fetched during the
 * audit. Tolerances are in arc-minutes.
 */

import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import type { NatalChart } from '@/hooks/useNatalChart';
import { slowBodyLongitude } from '@/lib/ephemeris/slowBodies';
import { SLOW_BODY_RANGE_START, SLOW_BODY_RANGE_END, asteroidLongitude } from '@/lib/asteroidEphemeris';
import { calculateSolarArc, calculateSolarArcChart } from '@/lib/solarArcDirections';
import { calculateDavisonChart } from '@/lib/compositeChart';
import { calculateHumanDesignChart, recomputeLegacyHdChart, getGateFromLongitude, HD_CALC_VERSION } from '@/lib/humanDesignCalculator';
import { birthMomentOf } from '@/lib/chartAutoFill';
import { resolveBirthMomentSync } from '@/lib/birthDataNormalization';
import { calculateNatalFromMoment } from '@/lib/natalChartCalculation';

const arcmin = (a: number, b: number): number => {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d * 60;
};

const utc = (iso: string): Date => new Date(iso);

const sunLongitude = (date: Date): number =>
  Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, date, true)).elon;

describe('Slow-body table edges (JPL Horizons reference)', () => {
  it('covers exactly 1920-01-01 through 2059-12-27 (the last sample)', () => {
    expect(SLOW_BODY_RANGE_START.toISOString()).toBe('1920-01-01T00:00:00.000Z');
    expect(SLOW_BODY_RANGE_END.toISOString()).toBe('2059-12-27T00:00:00.000Z');
    expect(asteroidLongitude('vesta', utc('2059-12-27T00:00:00Z'))).not.toBeNull();
    expect(asteroidLongitude('vesta', utc('2059-12-27T00:00:01Z'))).toBeNull();
    expect(asteroidLongitude('vesta', utc('1919-12-31T23:59:59Z'))).toBeNull();
  });

  it('Vesta in the first segment matches JPL within 1 arc-minute (was 22 arc-minutes)', () => {
    // Off-grid instants inside the very first 10-day segment.
    expect(arcmin(slowBodyLongitude('vesta', utc('1920-01-03T12:00:00Z'))!, 232.7337701)).toBeLessThan(1);
    expect(arcmin(slowBodyLongitude('vesta', utc('1920-01-04T12:00:00Z'))!, 233.2210283)).toBeLessThan(1);
    expect(arcmin(slowBodyLongitude('vesta', utc('1920-01-04T18:00:00Z'))!, 233.3426904)).toBeLessThan(1);
  });

  it('Ceres in the first segment matches JPL within 1 arc-minute (was 10 arc-minutes)', () => {
    expect(arcmin(slowBodyLongitude('ceres', utc('1920-01-04T12:00:00Z'))!, 358.7723493)).toBeLessThan(1);
  });

  it('Vesta in the last segment matches JPL within 1 arc-minute', () => {
    expect(arcmin(slowBodyLongitude('vesta', utc('2059-12-24T12:00:00Z'))!, 51.9201747)).toBeLessThan(1);
    expect(arcmin(slowBodyLongitude('vesta', utc('2059-12-26T18:00:00Z'))!, 51.6956696)).toBeLessThan(1);
    expect(arcmin(slowBodyLongitude('vesta', utc('2059-12-27T00:00:00Z'))!, 51.6730337)).toBeLessThan(1);
  });

  it('interpolates through a retrograde station without overshoot (Chiron, June 2011)', () => {
    const d9 = slowBodyLongitude('chiron', utc('2011-06-09T00:00:00Z'))!;
    const d10 = slowBodyLongitude('chiron', utc('2011-06-10T00:00:00Z'))!;
    const d11 = slowBodyLongitude('chiron', utc('2011-06-11T00:00:00Z'))!;
    expect(arcmin(d9, 335.4847446)).toBeLessThan(0.6);
    expect(arcmin(d10, 335.4840554)).toBeLessThan(0.6);
    expect(arcmin(d11, 335.4823952)).toBeLessThan(0.6);
    // Around the station the daily motion is under 0.1 arc-minute; the
    // interpolant must not invent motion there.
    expect(arcmin(d9, d11)).toBeLessThan(0.6);
  });

  it('holds mid-table accuracy on a fast day-to-day Vesta stretch (Jan 1988)', () => {
    expect(arcmin(slowBodyLongitude('vesta', utc('1988-01-25T00:00:00Z'))!, 120.6872059)).toBeLessThan(1);
    expect(arcmin(slowBodyLongitude('vesta', utc('1988-01-26T00:00:00Z'))!, 120.4222086)).toBeLessThan(1);
  });
});

const westHills = {
  id: 'audit-west-hills',
  name: 'West Hills',
  birthDate: '2011-05-19',
  birthTime: '18:06',
  birthLocation: 'West Hills, California',
  planets: {
    Sun: { sign: 'Taurus', degree: 28, minutes: 32 },
    Moon: { sign: 'Capricorn', degree: 2, minutes: 45 },
  },
} as unknown as NatalChart;

const newYorkWinter = {
  id: 'audit-new-york',
  name: 'New York',
  birthDate: '1980-01-15',
  birthTime: '23:30',
  birthLocation: 'New York, New York',
  planets: {
    Sun: { sign: 'Capricorn', degree: 24, minutes: 40 },
    Moon: { sign: 'Aries', degree: 10, minutes: 0 },
  },
} as unknown as NatalChart;

describe('Solar arc directions', () => {
  it('keeps the fractional progressed day (no whole-year flooring)', () => {
    const birth = utc('2011-05-20T01:06:00Z');
    // 20.5 years later: the arc should reflect 20.5 progressed days, not 20.
    const now = new Date(birth.getTime() + 20.5 * 365.25 * 86_400_000);
    const arc = calculateSolarArc(birth, now);

    const expected = ((sunLongitude(new Date(birth.getTime() + 20.5 * 86_400_000)) - sunLongitude(birth)) % 360 + 360) % 360;
    const floored = ((sunLongitude(new Date(birth.getTime() + 20 * 86_400_000)) - sunLongitude(birth)) % 360 + 360) % 360;

    expect(arcmin(arc, expected)).toBeLessThan(0.05);
    // The old flooring bug would have been half a degree short here.
    expect(arcmin(arc, floored)).toBeGreaterThan(25);
  });

  it('reads the birth instant from the shared normalization, not the browser zone', () => {
    const shared = birthMomentOf(westHills)!;
    expect(shared.toISOString()).toBe('2011-05-20T01:06:00.000Z');
    const now = utc('2031-05-20T01:06:00Z');
    const chart = calculateSolarArcChart(westHills, now)!;
    expect(chart).not.toBeNull();
    expect(arcmin(chart.solarArc, calculateSolarArc(shared, now))).toBeLessThan(0.001);
    // Age is measured from the true instant, so exactly 20 years to the minute.
    expect(Math.abs(chart.ageInYears - 20)).toBeLessThan(0.0002);
  });

  it('returns null rather than guessing when the record cannot be normalized', () => {
    const noDate = { ...westHills, birthDate: '' } as unknown as NatalChart;
    expect(calculateSolarArcChart(noDate, new Date())).toBeNull();
  });
});

describe('Davison relationship chart', () => {
  it('averages the two true birth instants (time + historical zone), not UTC midnights', () => {
    const a = birthMomentOf(westHills)!;
    const b = birthMomentOf(newYorkWinter)!;
    expect(a.toISOString()).toBe('2011-05-20T01:06:00.000Z');
    expect(b.toISOString()).toBe('1980-01-16T04:30:00.000Z'); // 23:30 EST

    const davison = calculateDavisonChart(westHills, newYorkWinter);
    expect(davison.momentQuality).toBe('exact');
    expect(davison.momentNote).toBeUndefined();
    expect(davison.averagedDate.getTime()).toBe((a.getTime() + b.getTime()) / 2);

    // The old code averaged Date.parse("YYYY-MM-DD") values; that midpoint is
    // hours away and moves the Davison Moon by degrees.
    const oldMidpoint = (Date.parse(westHills.birthDate) + Date.parse(newYorkWinter.birthDate)) / 2;
    expect(Math.abs(davison.averagedDate.getTime() - oldMidpoint)).toBeGreaterThan(60 * 60 * 1000);
  });

  it('flags date-only precision when one chart cannot be normalized', () => {
    const unknownPlace = {
      ...newYorkWinter,
      id: 'audit-unknown',
      name: 'Unknown Place',
      birthLocation: 'Nowhere In Particular',
      timezoneId: undefined,
      latitude: undefined,
      longitude: undefined,
    } as unknown as NatalChart;
    expect(birthMomentOf(unknownPlace)).toBeNull();

    const davison = calculateDavisonChart(westHills, unknownPlace);
    expect(davison.momentQuality).toBe('date-only');
    expect(davison.momentNote).toContain('Unknown Place');
    expect(Number.isFinite(davison.averagedDate.getTime())).toBe(true);
  });
});

describe('Human Design birth instant', () => {
  it('uses the zone id under that date\'s DST rules and ignores a wrong stored offset', () => {
    const chart = calculateHumanDesignChart('HD', '2011-05-19', '18:06', 'West Hills, California', 'America/Los_Angeles', -5);
    // Stored offset of -5 is wrong for this date; PDT (UTC-7) must win.
    expect(chart.personalityDateTime.toISOString()).toBe('2011-05-20T01:06:00.000Z');
    // Design instant is 88° of solar arc before birth.
    const designSun = sunLongitude(chart.designDateTime);
    const birthSun = sunLongitude(chart.personalityDateTime);
    expect(arcmin(((birthSun - designSun) % 360 + 360) % 360, 88)).toBeLessThan(0.1);
    const days = (chart.personalityDateTime.getTime() - chart.designDateTime.getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(86);
    expect(days).toBeLessThan(92);
  });

  it('refuses an unknown zone with no numeric offset instead of producing garbage', () => {
    expect(() =>
      calculateHumanDesignChart('HD', '2011-05-19', '18:06', 'Somewhere', 'Not/AZone', Number.NaN),
    ).toThrow(/not a known time zone/);
  });
});

describe('Node and Lilith definitions are carried with the numbers', () => {
  const base = { birthDate: '2011-05-19', birthTime: '18:06', birthLocation: 'West Hills, California' };

  it('a chart flagged as mean node is computed and labeled as mean node', () => {
    const trueCalc = calculateNatalFromMoment(resolveBirthMomentSync({ ...base, nodeVariant: 'true' }), ['NorthNode']);
    const meanCalc = calculateNatalFromMoment(resolveBirthMomentSync({ ...base, nodeVariant: 'mean' }), ['NorthNode']);
    expect(trueCalc.positions.NorthNode.variant).toBe('true node');
    expect(meanCalc.positions.NorthNode.variant).toBe('mean node');
    // The two definitions genuinely differ; that difference must never be
    // reported as an import error when the source said "Mean Node".
    const diff = arcmin(trueCalc.positions.NorthNode.longitude, meanCalc.positions.NorthNode.longitude);
    expect(diff).toBeGreaterThan(1);
    expect(diff).toBeLessThan(120);
  });

  it('the default is the true node and Lilith is always the mean apogee', () => {
    const moment = resolveBirthMomentSync(base);
    expect(moment.audit?.nodeVariant).toBe('True (osculating) node');
    expect(moment.audit?.lilithVariant).toContain('Mean');
    const calc = calculateNatalFromMoment(moment, ['Lilith']);
    expect(calc.positions.Lilith.variant).toMatch(/mean/i);
  });
});

describe('Stored Human Design charts from the old Sun frame are recomputed safely', () => {
  const fresh = () => calculateHumanDesignChart('Probe', '2011-05-19', '18:06', 'West Hills, CA', 'America/Los_Angeles', -7);

  const legacyLongitude = (d: Date) => {
    const t = Astronomy.MakeTime(d);
    return ((Astronomy.Ecliptic(Astronomy.SunPosition(t).vec).elon % 360) + 360) % 360;
  };

  it('new charts are stamped with the engine version', () => {
    const c = fresh();
    expect(c.calcSource).toBe('engine');
    expect(c.calcVersion).toBe(HD_CALC_VERSION);
    expect(recomputeLegacyHdChart(c).action).toBe('kept');
  });

  it('a legacy chart carrying the old Sun signature is recomputed', () => {
    const c = fresh();
    const legacy = getGateFromLongitude(legacyLongitude(c.personalityDateTime));
    const sunOk = c.personalityActivations.find(a => a.planet === 'Sun')!;
    // The old and new engines must disagree on this birth for the test to mean anything.
    expect(legacy.gate !== sunOk.gate || legacy.line !== sunOk.line).toBe(true);

    const { calcSource: _s, calcVersion: _v, ...rest } = c;
    const stored = {
      ...rest,
      personalityActivations: c.personalityActivations.map(a =>
        a.planet === 'Sun' ? { ...a, gate: legacy.gate, line: legacy.line } : a),
    } as typeof c;

    const outcome = recomputeLegacyHdChart(stored);
    expect(outcome.action).toBe('recomputed');
    const sun = outcome.chart.personalityActivations.find(a => a.planet === 'Sun')!;
    expect(sun.gate).toBe(sunOk.gate);
    expect(sun.line).toBe(sunOk.line);
    expect(outcome.chart.id).toBe(c.id);
    expect(outcome.chart.calcVersion).toBe(HD_CALC_VERSION);
  });

  it('a legacy chart whose Sun does not match the old engine is kept and marked imported', () => {
    const c = fresh();
    const { calcSource: _s, calcVersion: _v, ...rest } = c;
    const stored = {
      ...rest,
      personalityActivations: c.personalityActivations.map(a =>
        a.planet === 'Sun' ? { ...a, gate: 1, line: 1 } : a),
    } as typeof c;
    const outcome = recomputeLegacyHdChart(stored);
    expect(outcome.action).toBe('kept');
    expect(outcome.chart.calcSource).toBe('imported');
    expect(outcome.chart.personalityActivations.find(a => a.planet === 'Sun')!.gate).toBe(1);
  });

  it('imported charts and charts without a usable zone are never recomputed', () => {
    const c = fresh();
    expect(recomputeLegacyHdChart({ ...c, calcSource: 'imported', calcVersion: undefined }).action).toBe('kept');
    const { calcSource: _s, calcVersion: _v, ...rest } = c;
    const noZone = { ...rest, timezone: '', timezoneOffset: Number.NaN } as typeof c;
    const outcome = recomputeLegacyHdChart(noZone);
    expect(outcome.action).toBe('kept');
    expect(outcome.reason).toBe('unknown-zone');
  });
});
