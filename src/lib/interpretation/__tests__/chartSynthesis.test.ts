import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { buildChartSynthesis } from '@/lib/interpretation/chartSynthesis';
import { generateNatalPortrait } from '@/lib/natalPortraitEngine';
import { buildReadingGuide } from '@/lib/readingGuide/readingGuideEngine';
import { findForbiddenPhrases } from '@/lib/interpretation/languagePolicy';
import { getHouseForLongitude, signDegreesToLongitude } from '@/lib/houseCalculations';
import { computeRankedAspects } from '@/lib/aspectRanking';
import { getChartRulers } from '@/lib/interpretation/chartRuler';

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

const ORDERED_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function equalHouseCusps(firstSign: string, degree: number, minutes = 0): NatalChart['houseCusps'] {
  const start = ORDERED_SIGNS.indexOf(firstSign);
  return Object.fromEntries(Array.from({ length: 12 }, (_, index) => [
    `house${index + 1}`,
    { sign: ORDERED_SIGNS[(start + index) % 12], degree, minutes },
  ]));
}

function bigThreeFixture(
  id: string,
  sun: [string, number, number],
  moon: [string, number, number],
  asc: [string, number, number],
): NatalChart {
  const supporting: Record<string, [string, number, number]> = {
    Mercury: ['Cancer', 12, 0], Venus: ['Taurus', 14, 0], Mars: ['Sagittarius', 16, 0],
    Jupiter: ['Capricorn', 18, 0], Saturn: ['Pisces', 20, 0], Uranus: ['Aquarius', 22, 0],
    Neptune: ['Aries', 24, 0], Pluto: ['Scorpio', 26, 0],
  };
  const entries = { Sun: sun, Moon: moon, Ascendant: asc, ...supporting };
  return {
    id, name: id, birthDate: '2000-01-01', birthTime: '12:00', birthLocation: 'Test',
    planets: Object.fromEntries(Object.entries(entries).map(([body, [sign, degree, minutes]]) => [body, { sign, degree, minutes }])),
    houseCusps: equalHouseCusps(asc[0], asc[1], asc[2]),
  } as NatalChart;
}

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

  it('keeps cross-surface element and modality counts on the same ten major planets', () => {
    for (const chart of cases) {
      const portrait = generateNatalPortrait(chart);
      const guide = buildReadingGuide(chart, { stageOverride: 'adult' });
      expect(guide.elements.counts).toEqual(portrait.lifePurpose.elementBreakdown);
      expect(guide.modalities.counts).toEqual(portrait.lifePurpose.modalityBreakdown);
      expect(Object.values(guide.elements.counts).reduce((sum, count) => sum + count, 0)).toBe(10);
      expect(guide.modalities.note).toMatch(/ten major planets \(10 placements\)/i);
    }
  });

  it('uses canonical cusp precision and late-degree positions without rounded-label recomputation', () => {
    const cuspChart = {
      ...harrison,
      planets: {
        ...harrison.planets,
        Sun: { sign: 'Taurus', degree: 0, minutes: 0 },
        Moon: { sign: 'Aries', degree: 29, minutes: 59 },
      },
      houseCusps: Object.fromEntries([
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
      ].map((sign, index) => [`house${index + 1}`, { sign, degree: 0, minutes: 0 }])),
    } as NatalChart;
    expect(getHouseForLongitude(signDegreesToLongitude('Taurus', 0, 0), cuspChart)).toBe(2);
    expect(getHouseForLongitude(signDegreesToLongitude('Aries', 29, 59), cuspChart)).toBe(1);
    const text = JSON.stringify(buildChartSynthesis(cuspChart));
    expect(text).toMatch(/Sun 0°00′ Taurus, 2nd house/i);
    expect(text).toMatch(/Moon 29°59′ Aries, 1st house/i);
  });

  it('classifies aspects by actual shortest-arc degrees and preserves out-of-sign majors', () => {
    const chart = {
      ...harrison,
      planets: {
        ...harrison.planets,
        Sun: { sign: 'Aries', degree: 29, minutes: 0 },
        Moon: { sign: 'Taurus', degree: 1, minutes: 0 },
      },
    } as NatalChart;
    const aspects = computeRankedAspects(chart);
    const sunMoon = aspects.find((aspect) => [aspect.a, aspect.b].includes('Sun') && [aspect.a, aspect.b].includes('Moon'));
    expect(sunMoon).toMatchObject({ aspect: 'conjunction', orb: 2, dissociate: true });
    expect(computeRankedAspects(harrison).find((aspect) =>
      [aspect.a, aspect.b].includes('Sun') && [aspect.a, aspect.b].includes('Chiron'))?.aspect).toBe('quincunx');
    expect(JSON.stringify(buildChartSynthesis(harrison))).not.toMatch(/Sun (opposition|opposite) Chiron/i);
  });

  it('uses traditional rulers first and current-chart placements for modern and non-modern signs', () => {
    expect(getChartRulers('Scorpio')).toMatchObject({ traditional: 'Mars', modern: 'Pluto' });
    expect(getChartRulers('Aquarius')).toMatchObject({ traditional: 'Saturn', modern: 'Uranus' });
    expect(getChartRulers('Pisces')).toMatchObject({ traditional: 'Jupiter', modern: 'Neptune' });
    expect(getChartRulers('Taurus')).toMatchObject({ traditional: 'Venus', modern: null });
    const text = JSON.stringify(buildChartSynthesis(harrison));
    expect(text).toMatch(/Mars 26°42′ Cancer, 9th house/i);
    expect(text).toMatch(/Pluto 3°12′ Aquarius, 3rd house/i);
  });

  it('does not promote two major planets to a stellium or count points as major planets', () => {
    const sparse = {
      ...harrison,
      planets: {
        Sun: { sign: 'Aries', degree: 2, minutes: 0 },
        Moon: { sign: 'Aries', degree: 18, minutes: 0 },
        Ascendant: { sign: 'Aries', degree: 0, minutes: 0 },
        NorthNode: { sign: 'Aries', degree: 8, minutes: 0 },
        Chiron: { sign: 'Aries', degree: 12, minutes: 0 },
      },
    } as NatalChart;
    expect(JSON.stringify(buildChartSynthesis(sparse))).not.toMatch(/stellium/i);
  });

  it('describes a two-sign Big Three accurately when no major Big Three aspect exists', () => {
    const chart = {
      id: 'two-sign-big-three', name: 'Two Sign Test', birthDate: '2000-01-01', birthTime: '12:00', birthLocation: 'Test',
      planets: {
        Sun: { sign: 'Aries', degree: 0, minutes: 0 },
        Moon: { sign: 'Aries', degree: 20, minutes: 0 },
        Ascendant: { sign: 'Virgo', degree: 12, minutes: 0 },
        Mercury: { sign: 'Cancer', degree: 8, minutes: 0 },
      },
      houseCusps: { ...harrison.houseCusps, house1: { sign: 'Virgo', degree: 12, minutes: 0 } },
    } as NatalChart;
    const bigThree = buildChartSynthesis(chart).dynamics.find((dynamic) => dynamic.id === 'big-three');
    expect(bigThree?.realLifeTranslation).toMatch(/Aries repeats through Sun and Moon/i);
    expect(bigThree?.realLifeTranslation).toMatch(/Fire-and-Cardinal/i);
    expect(bigThree?.realLifeTranslation).not.toMatch(/all three use different signs/i);
  });

  it('synthesizes an all-same-sign Big Three through sign, element, modality, and house contrast', () => {
    const libra = bigThreeFixture(
      'Triple Libra',
      ['Libra', 28, 11],
      ['Libra', 3, 33],
      ['Libra', 24, 56],
    );
    const reading = buildChartSynthesis(libra);
    const bigThree = reading.dynamics.find((dynamic) => dynamic.id === 'big-three');
    const text = JSON.stringify(bigThree);
    expect(text).toMatch(/Libra sits on all three core points/i);
    expect(text).toMatch(/Air-and-Cardinal emphasis/i);
    expect(text).toMatch(/Sun and Ascendant in the 1st house/i);
    expect(text).toMatch(/Moon in the 12th house/i);
    expect(reading.summary[0]).toMatch(/Sun 28°11′ Libra in the 1st house, Moon 3°33′ Libra in the 12th house, and Ascendant 24°56′ Libra in the 1st house/i);
  });

  it('names a shared Big Three element without inventing one repeated sign', () => {
    const air = bigThreeFixture(
      'Three Air Signs',
      ['Gemini', 10, 0],
      ['Libra', 14, 0],
      ['Aquarius', 18, 0],
    );
    const bigThree = buildChartSynthesis(air).dynamics.find((dynamic) => dynamic.id === 'big-three');
    expect(bigThree?.title).toBe('Air Connects the Big Three');
    expect(bigThree?.realLifeTranslation).toMatch(/Gemini, Libra, and Aquarius are all Air signs/i);
    expect(bigThree?.realLifeTranslation).toMatch(/Mutable, Cardinal, and Fixed|Cardinal, Fixed, and Mutable/i);
    expect(bigThree?.realLifeTranslation).not.toMatch(/repeats through/i);
  });

  it('names mixed Big Three elements and modalities instead of flattening them', () => {
    const mixed = bigThreeFixture(
      'Mixed Big Three',
      ['Taurus', 8, 0],
      ['Sagittarius', 16, 0],
      ['Cancer', 24, 0],
    );
    const bigThree = buildChartSynthesis(mixed).dynamics.find((dynamic) => dynamic.id === 'big-three');
    expect(bigThree?.title).toBe('A Mixed Big Three');
    expect(bigThree?.realLifeTranslation).toMatch(/mix Earth, Fire, and Water/i);
    expect(bigThree?.realLifeTranslation).toMatch(/Fixed, Mutable, and Cardinal|Cardinal, Fixed, and Mutable/i);
  });

  it('never emits the rejected sign-style Big Three templates', () => {
    const charts = [
      ...cases,
      bigThreeFixture('Triple Libra Guard', ['Libra', 28, 11], ['Libra', 3, 33], ['Libra', 24, 56]),
      bigThreeFixture('Air Guard', ['Gemini', 10, 0], ['Libra', 14, 0], ['Aquarius', 18, 0]),
      bigThreeFixture('Mixed Guard', ['Taurus', 8, 0], ['Sagittarius', 16, 0], ['Cancer', 24, 0]),
    ];
    for (const chart of charts) {
      const text = JSON.stringify(buildChartSynthesis(chart));
      expect(text).not.toMatch(/uses a (?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces) style/i);
      expect(text).not.toMatch(/emotional settling uses|first impressions use/i);
    }
  });

  it('does not select overlapping top dynamics that reuse two or more bodies', () => {
    const chart = {
      ...harrison,
      planets: {
        ...harrison.planets,
        Sun: { sign: 'Leo', degree: 2, minutes: 0 },
        Moon: { sign: 'Leo', degree: 14, minutes: 0 },
        Mercury: { sign: 'Leo', degree: 25, minutes: 0 },
        Ascendant: { sign: 'Leo', degree: 18, minutes: 0 },
      },
      houseCusps: { ...harrison.houseCusps, house1: { sign: 'Leo', degree: 18, minutes: 0 } },
    } as NatalChart;
    const ids = buildChartSynthesis(chart).dynamics.map((dynamic) => dynamic.id);
    expect(ids).toContain('big-three');
    expect(ids).not.toContain('sign-concentration');
  });

  it('keeps chart facts and ranking invariant when developmental wording changes', () => {
    const adult = buildChartSynthesis(ava, { stage: 'adult' });
    const teen = buildChartSynthesis(ava, { stage: 'teen' });
    expect(teen.dynamics.map(({ id, evidence, signal }) => ({ id, evidence, signal })))
      .toEqual(adult.dynamics.map(({ id, evidence, signal }) => ({ id, evidence, signal })));
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
      expect(text).not.toMatch(/steer the reading|section header|authoring|past life|trauma|diagnos|you always|guaranteed/i);
      expect(text).not.toMatch(/\bscore\b|probability|percent/i);
    }
  });
});