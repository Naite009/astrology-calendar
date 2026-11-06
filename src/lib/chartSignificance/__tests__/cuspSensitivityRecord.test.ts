import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { birthTimePolicy, buildCuspSensitivityRecord, chartForHouseReading, nearestHouseCusp, withProfileTimePrecision } from '../cuspSensitivityRecord';
import { solveBirthTimeSensitivity } from '../birthTimeSensitivity';
import { computeAngles, computeBody, houseForLongitude, signedCircularDelta, type BodyKey } from '@/lib/ephemerisEngine';
import { buildChartStoryMap } from '@/lib/interpretation/chartStoryMap';
import { buildReadingGuide } from '@/lib/readingGuide/readingGuideEngine';
import type { HouseSystem } from '@/lib/placidusHouses';

function fixture(time = '04:10', system: HouseSystem = 'placidus'): NatalChart {
  const input = { birthDate: '1974-08-30', birthTime: time, birthLocation: 'Livingston, New Jersey', latitude: 40.7959, longitude: -74.3149, timezoneId: 'America/New_York', placeSource: 'manual' as const, placeConfidence: 'high' as const, houseSystem: system };
  const c = calculateNatalFromInput(input);
  return { ...input, id: 'maria-test', name: 'Maria', planets: Object.fromEntries(Object.entries(c.positions).map(([key, p]) => [key, toStoredPosition(p)])), houseCusps: c.houseCusps ?? undefined };
}

describe('precision-aware reading policy', () => {
  const maria = fixture();
  it('existing profile approximate toggle selects ±30 without changing storage or overriding verified data', () => {
    const reading = withProfileTimePrecision(maria, true);
    if (!reading) throw new Error('Missing reading chart');
    expect(birthTimePolicy(reading).earlierMinutes).toBe(30);
    expect(maria.birthTimeReliability).toBeUndefined();
    expect(withProfileTimePrecision({ ...maria, birthTimeReliability: 'verified' }, true)?.birthTimeReliability).toBe('verified');
  });
  it('verified hospital time retains house 6 with no alternate despite cusp proximity', () => {
    const r = buildCuspSensitivityRecord({ ...maria, birthTimeReliability: 'verified' });
    expect(r.status).toBe('checked');
    expect(r.policy.earlierMinutes).toBe(0);
    const moon = r.bodies.find(b => b.body === 'Moon');
    expect(moon?.computedHouse).toBe(6);
    expect(moon?.alternateHouses).toEqual([]);
    expect(moon?.angleContacts.some(c => c.angle === 'Descendant')).toBe(true);
  });
  it('five-minute-rounded time uses ±5 and includes Maria Moon house 7', () => {
    const r = buildCuspSensitivityRecord({ ...maria, birthTimeReliability: 'rounded' });
    expect(r.status).toBe('checked');
    expect(r.policy).toMatchObject({ earlierMinutes: 5, laterMinutes: 5, provisional: true });
    expect(r.bodies.find(b => b.body === 'Moon')?.alternateHouses).toEqual([7]);
  });
  it('approximate time uses ±30 unless a supplied interval overrides it', () => {
    expect(birthTimePolicy({ ...maria, birthTimeReliability: 'approximate' })).toMatchObject({ earlierMinutes: 30, laterMinutes: 30 });
    expect(birthTimePolicy({ ...maria, birthTimeReliability: 'approximate', birthTimeUncertainty: { earlierMinutes: 2, laterMinutes: 8 } })).toMatchObject({ earlierMinutes: 2, laterMinutes: 8, provisional: false });
  });
  it('actual ±2 minute interval excludes the crossing at about 2 min 13 s', () => {
    const r = buildCuspSensitivityRecord({ ...maria, birthTimeUncertainty: { earlierMinutes: 2, laterMinutes: 2 } });
    expect(r.status).toBe('checked');
    expect(r.bodies.find(b => b.body === 'Moon')?.alternateHouses).toEqual([]);
  });
  it('asymmetric interval never includes a crossing outside its earlier side', () => {
    const r = buildCuspSensitivityRecord({ ...maria, birthTimeUncertainty: { earlierMinutes: 0.5, laterMinutes: 5 } });
    expect(r.status).toBe('checked');
    expect(r.bodies.find(b => b.body === 'Moon')?.crossings).toEqual([]);
  });
  it('unknown time removes houses and angles only from reading inputs, not storage', () => {
    const chart = { ...maria, birthTimeReliability: 'unknown' as const };
    const input = chartForHouseReading(chart);
    expect(buildCuspSensitivityRecord(chart).status).toBe('unknown-time');
    expect(input.houseCusps).toBeUndefined();
    expect(input.planets.Ascendant).toBeUndefined();
    expect(input.planets.Moon).toEqual(chart.planets.Moon);
    expect(chart.houseCusps?.house7).toBeTruthy();
    expect(buildChartStoryMap(chart).placements.Moon.house).toBeNull();
    expect(buildReadingGuide(chart).placements.every(p => p.house === null)).toBe(true);
  });
  it('does not silently change imported cusps when source math disagrees', () => {
    const h7 = maria.houseCusps?.house7;
    if (!h7) throw new Error('Missing cusp');
    const chart = { ...maria, houseCusps: { ...maria.houseCusps, house7: { ...h7, longitude: (h7.longitude ?? 0) + 1 } } } as NatalChart;
    const before = JSON.stringify(chart);
    expect(buildCuspSensitivityRecord(chart).status).toBe('source-mismatch');
    expect(JSON.stringify(chart)).toBe(before);
  });
  it('uses imported coordinates before stale saved coordinates', () => {
    const r = buildCuspSensitivityRecord({ ...maria, latitude: 10, longitude: 10, sourceLatitude: 40.7959, sourceLongitude: -74.3149 });
    expect(r.status).toBe('checked');
    expect(r.coordinates).toMatchObject({ latitude: 40.7959, longitude: -74.3149, source: 'source-coordinates' });
  });
  it('Walkthrough carries the same crossings and neutral policy record', () => {
    const r = buildCuspSensitivityRecord(maria);
    expect(buildReadingGuide(maria).birthTimeSensitivity).toEqual(r);
  });
  it('Maria saved imported coordinates solve 04:07:46.294 EDT, not the earlier approximate location', () => {
    const input = { ...maria, latitude: 40.8, longitude: -74.31666666666666, sourceLatitude: 40.8, sourceLongitude: -74.31666666666666 };
    const c = calculateNatalFromInput(input);
    const chart = { ...input, planets: Object.fromEntries(Object.entries(c.positions).map(([key, p]) => [key, toStoredPosition(p)])), houseCusps: c.houseCusps ?? undefined };
    const r = buildCuspSensitivityRecord(chart);
    expect(r.status).toBe('checked');
    expect(r.birthUtc).toBe('1974-08-30T08:10:00.000Z');
    const moon = r.bodies.find(b => b.body === 'Moon');
    expect(moon?.storedHouse).toBe(6);
    expect(moon?.crossings[0]?.utc.toISOString()).toBe('1974-08-30T08:07:46.294Z');
    expect(moon?.crossings[0]?.residualDegrees).toBeLessThan(0.00001);
  });
});

describe('own-cusp label and other near-cusp/system comparisons', () => {
  it('names own starting cusp 7, not cusp 6 or 8, just past the boundary', () => {
    expect(nearestHouseCusp(180.4, 7, Array.from({ length: 12 }, (_, i) => i * 30))).toEqual({ cusp: 7, distance: expect.closeTo(0.4, 8) });
    expect(nearestHouseCusp(179.6, 6, Array.from({ length: 12 }, (_, i) => i * 30)).cusp).toBe(7);
    const chart = fixture('04:07');
    const map = buildChartStoryMap(chart, { now: new Date('2026-11-06T12:00:00Z') });
    expect(map.placements.Moon.house).toBe(7);
    const checked = buildCuspSensitivityRecord(chart).bodies.find(b => b.body === 'Moon');
    expect(checked?.nearestCusp).toBe(7);
    // Test the structured cusp computation rather than asserting UI copy.
    expect(checked?.cuspDistanceDegrees).toBeLessThan(1);
  });
  const coords = { latitude: 40.7959, longitude: -74.3149 };
  for (const body of ['Sun', 'Venus'] as BodyKey[]) {
    it(`${body}: recomputes both sides of a near-cusp boundary in each supported system`, () => {
      const utc = new Date('1974-08-30T08:10:00Z');
      for (const system of ['placidus', 'equal', 'porphyry', 'whole-sign'] as HouseSystem[]) {
        const initial = solveBirthTimeSensitivity(body, utc, coords, system, 180);
        const crossing = initial.earlier ?? initial.later;
        if (!crossing) throw new Error(`${body} has no boundary in ${system}`);
        const nearby = new Date(crossing.utc.getTime() + 60_000);
        const solved = solveBirthTimeSensitivity(body, nearby, coords, system, 2);
        const close = solved.earlier;
        if (!close) throw new Error(`Missing near boundary ${body} ${system}`);
        expect(close.offsetSeconds).toBeCloseTo(-60, 1);
        expect(close.residualDegrees).toBeLessThan(0.00001);
        const at = computeBody(body, close.utc);
        if (!at.ok) throw new Error('Missing body');
        const a = computeAngles(close.utc, coords.latitude, coords.longitude, system);
        if (system !== 'whole-sign') expect(Math.abs(signedCircularDelta(at.longitude, a.cusps[close.cusp]))).toBeLessThan(0.00001);
        else expect(close.boundaryKind).toBe('rising-sign');
        const houses = [-1000, 1000].map(ms => {
          const t = new Date(close.utc.getTime() + ms);
          const b = computeBody(body, t);
          if (!b.ok) throw new Error('Missing body');
          return houseForLongitude(b.longitude, computeAngles(t, coords.latitude, coords.longitude, system).cusps);
        });
        expect(houses[0]).not.toBe(houses[1]);
        console.log('Near-cusp QA', body, system, close.utc.toISOString(), houses, close.residualDegrees);
      }
    });
  }
  it('Maria comparison retains distinct house systems instead of changing Placidus to match a reading', () => {
    const houses = ['placidus', 'equal', 'porphyry', 'whole-sign'].map(system => {
      const r = buildCuspSensitivityRecord(fixture('04:10', system as HouseSystem));
      expect(r.status).toBe('checked');
      expect(r.systemUsed).toBe(system);
      const moon = r.bodies.find(b => b.body === 'Moon');
      console.log('Maria system QA', system, moon?.computedHouse, moon?.crossings.map(c => c.offsetSeconds));
      return moon?.computedHouse;
    });
    expect(houses).toEqual([6, 6, 6, 7]);
  });
});