import { describe, it, expect } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '../natalChartCalculation';
import { generateNatalPortrait } from '../natalPortraitEngine';
import { detectChartPatterns, detectMinorBodyPatterns } from '../chartPatterns';
import { calculateNatalDominantPlanets } from '../dominantPlanetsEngine';
import { ordinal, ordinalHouse } from '@/lib/interpretation/ordinals';
import { isStellium, splitBodies, describeBodyCount, MAJOR_PLANETS } from '@/lib/interpretation/bodyTaxonomy';
import { findForbiddenPhrases, sanitizeInterpretiveText } from '@/lib/interpretation/languagePolicy';
import { classifyPatternBodies, rankPatterns } from '@/lib/interpretation/patternClassification';

// Ava Kravitz: 2011-05-19 18:06, West Hills, California, United States.
const AVA_INPUT = {
  date: '2011-05-19',
  time: '18:06',
  latitude: 34.2011,
  longitude: -118.6317,
  timezoneId: 'America/Los_Angeles',
  placeName: 'West Hills, California, United States',
};

function buildAvaChart(): NatalChart {
  const calc = calculateNatalFromInput({
    localDate: AVA_INPUT.date,
    localTime: AVA_INPUT.time,
    latitude: AVA_INPUT.latitude,
    longitude: AVA_INPUT.longitude,
    timezoneId: AVA_INPUT.timezoneId,
    placeName: AVA_INPUT.placeName,
  } as any);

  const planets: Record<string, any> = {};
  for (const [key, pos] of Object.entries(calc.positions)) {
    const stored = toStoredPosition(pos as any);
    planets[key] = { ...stored, isRetrograde: stored.isRetrograde ?? false };
  }
  const houseCusps: Record<string, any> = {};
  if (calc.houseCusps) {
    for (let i = 1; i <= 12; i++) {
      const c = (calc.houseCusps as any)[`house${i}`];
      houseCusps[`house${i}`] = { sign: c.sign, degree: c.degree, minutes: c.minutes };
    }
  }
  if (calc.angles?.ascendant != null && houseCusps.house1) {
    planets.Ascendant = { ...houseCusps.house1, seconds: 0, isRetrograde: false };
  }

  return {
    id: 'ava-test',
    name: 'Ava Kravitz',
    birthDate: AVA_INPUT.date,
    birthTime: AVA_INPUT.time,
    birthLocation: AVA_INPUT.placeName,
    timezoneId: AVA_INPUT.timezoneId,
    latitude: AVA_INPUT.latitude,
    longitude: AVA_INPUT.longitude,
    placeName: AVA_INPUT.placeName,
    placeConfidence: 'high',
    placeSource: 'manual',
    planets,
    houseCusps,
  } as unknown as NatalChart;
}

const collectStrings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach(x => collectStrings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach(x => collectStrings(x, out));
  return out;
};

describe('ordinal grammar', () => {
  it('never produces 2th / 3th / 1th', () => {
    expect(ordinal(1)).toBe('1st');
    expect(ordinal(2)).toBe('2nd');
    expect(ordinal(3)).toBe('3rd');
    expect(ordinal(4)).toBe('4th');
    expect(ordinal(11)).toBe('11th');
    expect(ordinal(12)).toBe('12th');
    expect(ordinal(13)).toBe('13th');
    expect(ordinal(21)).toBe('21st');
    expect(ordinalHouse(2)).toBe('2nd House');
    expect(ordinalHouse(2, 'house')).toBe('2nd house');
  });
});

describe('body taxonomy and stellium rule', () => {
  it('counts major planets separately from additional bodies', () => {
    const split = splitBodies(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Eris']);
    expect(split.major).toEqual(['Mercury', 'Venus', 'Mars', 'Jupiter']);
    expect(split.additional).toEqual(['Eris']);
    expect(describeBodyCount(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Eris'])).toContain('Eris');
    expect(describeBodyCount(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Eris'])).toMatch(/4 major planets/);
  });

  it('requires three major planets for a stellium', () => {
    expect(isStellium(['Mercury', 'Venus', 'Mars'])).toBe(true);
    expect(isStellium(['Mercury', 'Venus', 'Eris'])).toBe(false);
    expect(isStellium(['Ceres', 'Pallas', 'Vesta', 'Lilith'])).toBe(false);
    expect(MAJOR_PLANETS).toHaveLength(10);
  });
});

describe('pattern classification', () => {
  it('treats the automatic node opposition as a nodal-axis configuration, not a major T-square', () => {
    const c = classifyPatternBodies(['Ceres', 'NorthNode', 'SouthNode']);
    expect(c.tier).toBe('nodal-axis');
    expect(c.tierLabel.toLowerCase()).toContain('nodal');
    expect(c.weightNote).toBeTruthy();
  });

  it('keeps a three-major-planet configuration major', () => {
    expect(classifyPatternBodies(['Saturn', 'Uranus', 'Pluto']).tier).toBe('major');
  });

  it('ranks major patterns above secondary and nodal-axis ones', () => {
    const ranked = rankPatterns([
      { planets: ['Ceres', 'NorthNode', 'SouthNode'] },
      { planets: ['Ceres', 'Lilith', 'Vesta'] },
      { planets: ['Saturn', 'Uranus', 'Pluto'] },
    ]);
    expect(ranked[0].planets).toContain('Saturn');
  });
});

describe("Ava Kravitz natal portrait regression", () => {
  const chart = buildAvaChart();

  it('keeps the core chart math intact', () => {
    expect(chart.planets.Sun?.sign).toBeTruthy();
    expect(chart.planets.Moon?.sign).toBeTruthy();
    expect(chart.houseCusps?.house1?.sign).toBeTruthy();
  });

  it('keeps a geometrically valid Saturn-Uranus-Pluto style major pattern if present', () => {
    const patterns = detectChartPatterns(chart);
    const tSquares = patterns.filter(p => /T-Square/i.test(p.name));
    // Geometry is not suppressed: any detected T-square keeps its planets.
    tSquares.forEach(p => expect(p.planets.length).toBeGreaterThanOrEqual(3));
    // No detected core pattern is built purely on the automatic nodal axis.
    patterns.forEach(p => {
      const nodal = p.planets.includes('NorthNode') && p.planets.includes('SouthNode');
      if (nodal) expect(p.tier).toBe('nodal-axis');
    });
  });

  it('labels minor-body patterns as secondary', () => {
    const minor = detectMinorBodyPatterns(chart);
    minor.forEach(p => {
      expect(p.tier === 'secondary' || p.tier === 'nodal-axis').toBe(true);
      expect(p.tierLabel).toBeTruthy();
    });
  });

  it('produces a portrait free of forbidden deterministic, medical and accusatory language', () => {
    const portrait = generateNatalPortrait(chart);
    const text = collectStrings(portrait).join('\n');
    const hits = findForbiddenPhrases(text);
    expect(hits).toEqual([]);
    expect(text).not.toMatch(/2th|3th|1th|21th/);
    expect(text.toLowerCase()).not.toContain('immune');
    expect(text.toLowerCase()).not.toContain('deepest wound');
    expect(text.toLowerCase()).not.toContain('wounded healer');
    expect(text.toLowerCase()).not.toContain('keeps you small');
    expect(text.toLowerCase()).not.toContain('lean toward the fear');
    expect(text.toLowerCase()).not.toContain('structural genius');
  });

  it('keeps house counts internally consistent and explains the taxonomy', () => {
    const portrait = generateNatalPortrait(chart);
    portrait.houseEmphasis.forEach(h => {
      const split = splitBodies(h.planets);
      expect(h.majorPlanets ?? split.major).toEqual(split.major);
      expect(h.additionalBodies ?? split.additional).toEqual(split.additional);
      if (h.isStellium) expect(split.major.length).toBeGreaterThanOrEqual(3);
      if (h.additionalBodies?.length) expect(h.countLabel).toContain(h.additionalBodies[0]);
    });
  });

  it('synthesises relationship guidance from more than Venus house', () => {
    const portrait = generateNatalPortrait(chart);
    const rel = portrait.relationshipBlueprint;
    expect(rel).toBeTruthy();
    const advice = rel.advice || '';
    expect(advice).toMatch(/Venus/);
    expect(advice).toMatch(/Mars|7th house/);
    expect(advice.toLowerCase()).not.toContain("that's where love shows up most naturally");
  });

  it('labels dominance as a relative index, not a percentage of the chart', () => {
    const report = calculateNatalDominantPlanets(chart);
    const top = report.rankings[0];
    expect(top.dominanceIndex).toBeGreaterThan(0);
    expect(top.indexLabel?.toLowerCase()).toContain('index');
    expect(report.indexExplainer?.toLowerCase()).toContain('relative');
    const text = collectStrings(report).join('\n');
    expect(findForbiddenPhrases(text)).toEqual([]);
  });
});

describe('language policy sanitizer', () => {
  it('rewrites accusatory and deterministic phrasing', () => {
    const out = sanitizeInterpretiveText(
      'This means you will dominate others, your deepest wound is here, and chronic stress is guaranteed.',
    );
    expect(findForbiddenPhrases(out)).toEqual([]);
  });
});
