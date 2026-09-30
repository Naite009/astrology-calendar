import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { buildChartSynthesis } from '@/lib/interpretation/chartSynthesis';
import { generateNatalPortrait } from '@/lib/natalPortraitEngine';
import { buildReadingGuide } from '@/lib/readingGuide/readingGuideEngine';
import { findForbiddenPhrases } from '@/lib/interpretation/languagePolicy';

function calculatedChart(input: {
  id: string; name: string; date: string; time: string; latitude: number; longitude: number; timezoneId: string; place: string;
}): NatalChart {
  const calculated = calculateNatalFromInput({
    birthDate: input.date,
    birthTime: input.time,
    birthLocation: input.place,
    latitude: input.latitude,
    longitude: input.longitude,
    timezoneId: input.timezoneId,
    placeName: input.place,
    placeConfidence: 'high',
    placeSource: 'manual',
  } as never);
  const planets = Object.fromEntries(Object.entries(calculated.positions).map(([body, position]) => {
    const stored = toStoredPosition(position);
    return [body, { ...stored, isRetrograde: stored.isRetrograde ?? false }];
  }));
  const houseCusps = Object.fromEntries(Array.from({ length: 12 }, (_, index) => {
    const cusp = calculated.houseCusps?.[`house${index + 1}` as keyof typeof calculated.houseCusps];
    return [`house${index + 1}`, cusp];
  }));
  return {
    id: input.id, name: input.name, birthDate: input.date, birthTime: input.time,
    birthLocation: input.place, latitude: input.latitude, longitude: input.longitude,
    timezoneId: input.timezoneId, planets, houseCusps,
  } as NatalChart;
}

const ava = calculatedChart({
  id: 'ava-synthesis', name: 'Ava Kravitz', date: '2011-05-19', time: '18:06',
  latitude: 34.2011, longitude: -118.6317, timezoneId: 'America/Los_Angeles',
  place: 'West Hills, California, United States',
});

const max = calculatedChart({
  id: 'max-synthesis', name: 'Max Levin', date: '2011-01-21', time: '11:47',
  latitude: 39.9526, longitude: -75.1652, timezoneId: 'America/New_York',
  place: 'Philadelphia, Pennsylvania, United States',
});

const HARRISON_POSITIONS: Record<string, [string, number, number]> = {
  Sun: ['Virgo', 29, 34], Moon: ['Aquarius', 10, 22], Mercury: ['Libra', 18, 50], Venus: ['Scorpio', 6, 25],
  Mars: ['Cancer', 26, 42], Jupiter: ['Leo', 18, 2], Saturn: ['Aries', 12, 13], Uranus: ['Gemini', 5, 38],
  Neptune: ['Aries', 3, 5], Pluto: ['Aquarius', 3, 12], Chiron: ['Aries', 29, 50],
  NorthNode: ['Aquarius', 29, 35], SouthNode: ['Leo', 29, 35], Ascendant: ['Scorpio', 2, 49],
};
const HARRISON_CUSPS: [string, number, number][] = [
  ['Scorpio', 2, 49], ['Sagittarius', 1, 17], ['Capricorn', 3, 51], ['Aquarius', 8, 50],
  ['Pisces', 11, 52], ['Aries', 9, 53], ['Taurus', 2, 49], ['Gemini', 1, 17],
  ['Cancer', 3, 51], ['Leo', 8, 50], ['Virgo', 11, 52], ['Libra', 9, 53],
];
const harrison = {
  id: 'harrison-synthesis', name: 'Harrison Bates', birthDate: '2026-09-22', birthTime: '09:40', birthLocation: 'Philadelphia',
  planets: Object.fromEntries(Object.entries(HARRISON_POSITIONS).map(([body, [sign, degree, minutes]]) => [body, { sign, degree, minutes, seconds: 0 }])),
  houseCusps: Object.fromEntries(HARRISON_CUSPS.map(([sign, degree, minutes], index) => [`house${index + 1}`, { sign, degree, minutes }])),
} as NatalChart;

describe('shared high-level chart synthesis', () => {
  const cases = [ava, max, harrison];

  it('creates distinct, prioritized readings for three different chart structures', () => {
    const readings = cases.map((chart) => buildChartSynthesis(chart, { stage: 'teen' }));
    const signatures = readings.map((reading) => JSON.stringify(reading));
    expect(new Set(signatures).size).toBe(3);
    for (const reading of readings) {
      expect(reading.dynamics.length).toBeGreaterThanOrEqual(2);
      expect(reading.dynamics.length).toBeLessThanOrEqual(4);
      expect(reading.summary.length).toBeGreaterThanOrEqual(5);
      expect(reading.summary.length).toBeLessThanOrEqual(8);
      expect(reading.recognitionPoints).toHaveLength(3);
      expect(reading.dynamics.every((dynamic) => /°|rising|count|major planet/i.test(dynamic.evidence))).toBe(true);
      expect(reading.dynamics.every((dynamic) => dynamic.modifyingFactor.length > 30)).toBe(true);
    }
  });

  it('uses the same synthesis model in Natal Portrait and Chart Walkthrough', () => {
    expect(generateNatalPortrait(ava).synthesis).toEqual(buildChartSynthesis(ava));
    expect(buildReadingGuide(ava, { stageOverride: 'teen', now: new Date('2026-09-30T00:00:00Z') }).synthesis)
      .toEqual(buildChartSynthesis(ava, { stage: 'teen' }));
  });

  it('keeps Harrison geometry and Scorpio rulership accurate', () => {
    const reading = buildChartSynthesis(harrison);
    const text = JSON.stringify(reading);
    expect(text).toMatch(/Mars the traditional chart ruler|Mars is the traditional chart ruler|makes Mars the traditional chart ruler/i);
    expect(text).toMatch(/Pluto.*modern co-ruler/i);
    expect(text).not.toMatch(/Sun (opposition|opposite) Chiron|Chiron (opposition|opposite) Sun/i);
  });

  it('contains no internal authoring language, unsupported history, or unsafe claims', () => {
    for (const chart of cases) {
      const text = JSON.stringify(buildChartSynthesis(chart, { stage: 'teen' }));
      expect(findForbiddenPhrases(text)).toEqual([]);
      expect(text).not.toMatch(/steer the reading|section header|authoring|past life|trauma|diagnos|always|guaranteed/i);
      expect(text).not.toMatch(/\bscore\b|probability|percent/i);
    }
  });
});