/**
 * Proves the downstream calculators (Vedic sidereal chart, Human Design,
 * astrocartography) all read the same normalized UTC instant that the natal
 * pipeline uses, instead of rebuilding it from a stored numeric offset.
 */

import { describe, it, expect } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { birthMomentOf } from '@/lib/chartAutoFill';
import { buildBirthMoment } from '@/lib/vedic/siderealChart';
import { resolveBirthMomentSync } from '@/lib/birthDataNormalization';
import { localToUtc, zoneOffsetSeconds } from '@/lib/time/zonedTime';
import { lookupTimezone, getTimezoneInfoForDate, localInstantForZone } from '@/lib/timezoneUtils';
import { getEasternDateAtTime } from '@/lib/cosmicWeatherSkyBlock';

const westHills = {
  id: 'test-west-hills',
  name: 'Regression Chart',
  birthDate: '2011-05-19',
  birthTime: '18:06',
  birthLocation: 'West Hills, California',
} as unknown as NatalChart;

describe('Downstream calculators share the normalized birth instant', () => {
  it('the shared pipeline resolves West Hills to 2011-05-20T01:06:00Z', () => {
    const moment = resolveBirthMomentSync({
      birthDate: westHills.birthDate,
      birthTime: westHills.birthTime,
      birthLocation: westHills.birthLocation,
    });
    expect(moment.status).toBe('ok');
    expect(moment.utc?.toISOString()).toBe('2011-05-20T01:06:00.000Z');
  });

  it('the Vedic sidereal chart uses that exact instant', () => {
    const shared = birthMomentOf(westHills);
    expect(shared).not.toBeNull();
    expect(buildBirthMoment(westHills).getTime()).toBe(shared!.getTime());
  });

  it('the Vedic builder does not fall back to a browser-local reading', () => {
    // A naive `new Date(y, m, d, hh, mm)` would land on the machine's own zone.
    const naive = new Date(2011, 4, 19, 18, 6).getTime();
    const shared = buildBirthMoment(westHills).getTime();
    const utcAsLocal = Date.UTC(2011, 4, 19, 18, 6);
    expect(shared).not.toBe(utcAsLocal);
    if (naive !== 1305853560000) expect(shared).not.toBe(naive);
  });

  it('a half-hour zone survives every layer (Mumbai +05:30)', () => {
    const chart = {
      ...westHills,
      birthDate: '1988-11-02',
      birthTime: '04:20',
      birthLocation: 'Mumbai, India',
    } as unknown as NatalChart;
    const shared = birthMomentOf(chart);
    expect(shared?.toISOString()).toBe('1988-11-01T22:50:00.000Z');
    expect(buildBirthMoment(chart).getTime()).toBe(shared!.getTime());
  });
});

describe('timezoneUtils reads the zone database, not a fixed table', () => {
  it('West Hills resolves Pacific time and PDT at the birth moment', () => {
    const result = lookupTimezone('West Hills, California', '2011-05-19', '18:06');
    expect(result?.timezone).toBe('America/Los_Angeles');
    expect(result?.offset).toBe(-7);
    expect(result?.label).toContain('PDT');
  });

  it('the same city in January reports PST', () => {
    const result = lookupTimezone('West Hills, California', '2011-01-19', '18:06');
    expect(result?.offset).toBe(-8);
    expect(result?.label).toContain('PST');
  });

  it('a fractional zone is labelled with minutes, not a decimal', () => {
    const info = getTimezoneInfoForDate('Asia/Kathmandu', '1995-06-01', '09:15');
    expect(info.offset).toBeCloseTo(5.75, 5);
    expect(info.label).toContain('UTC+5:45');
  });

  it('nonsense text resolves nothing instead of defaulting to a city', () => {
    expect(lookupTimezone('Qqzzx Nowhere Land', '2000-01-01')).toBeNull();
  });

  it('localInstantForZone converts once and matches the zone rules', () => {
    const instant = localInstantForZone('America/Los_Angeles', '2011-05-19', '18:06');
    expect(instant?.toISOString()).toBe('2011-05-20T01:06:00.000Z');
    expect(zoneOffsetSeconds('America/Los_Angeles', instant!.getTime()) / 3600).toBe(-7);
  });

  it('a spring-forward clock reading is nudged to the first real time, not shifted backwards', () => {
    const gap = localToUtc('America/New_York', { year: 2021, month: 3, day: 14, hour: 2, minute: 30, second: 0 }, 'earlier');
    expect(gap.status).toBe('nonexistent');
    const instant = localInstantForZone('America/New_York', '2021-03-14', '02:30');
    expect(instant).not.toBeNull();
    expect(zoneOffsetSeconds('America/New_York', instant!.getTime()) / 3600).toBe(-4);
  });
});

describe('Eastern wall-clock helper follows tzdata', () => {
  it('midnight ET in summer is 04:00 UTC and in winter 05:00 UTC', () => {
    expect(getEasternDateAtTime(new Date(2026, 6, 15), 0, 0).toISOString()).toBe('2026-07-15T04:00:00.000Z');
    expect(getEasternDateAtTime(new Date(2026, 0, 15), 0, 0).toISOString()).toBe('2026-01-15T05:00:00.000Z');
  });

  it('the spring-forward morning resolves without inventing 02:30 EST', () => {
    const d = getEasternDateAtTime(new Date(2026, 2, 8), 2, 30);
    expect(zoneOffsetSeconds('America/New_York', d.getTime()) / 3600).toBe(-4);
  });
});
