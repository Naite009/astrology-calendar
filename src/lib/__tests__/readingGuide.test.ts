import { describe, it, expect } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '../natalChartCalculation';
import { buildReadingGuide, collectCoreBodies, rankConnections } from '../readingGuide/readingGuideEngine';
import { buildAgeContext, calculateAgeYears, stageForAge } from '../readingGuide/ageContext';
import { CORE_BODIES } from '../readingGuide/factorMeanings';
import { findForbiddenPhrases } from '@/lib/interpretation/languagePolicy';

// Ava Kravitz: 2011-05-19 18:06, West Hills, California, United States.
const AVA = {
  date: '2011-05-19',
  time: '18:06',
  latitude: 34.2011,
  longitude: -118.6317,
  timezoneId: 'America/Los_Angeles',
  placeName: 'West Hills, California, United States',
};

function buildAvaChart(): NatalChart {
  const calc = calculateNatalFromInput({
    birthDate: AVA.date,
    birthTime: AVA.time,
    birthLocation: AVA.placeName,
    latitude: AVA.latitude,
    longitude: AVA.longitude,
    timezoneId: AVA.timezoneId,
    placeName: AVA.placeName,
    placeConfidence: 'high',
    placeSource: 'manual',
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
  if (houseCusps.house1) planets.Ascendant = { ...houseCusps.house1, seconds: 0, isRetrograde: false };

  return {
    id: 'ava-reading-guide',
    name: 'Ava Kravitz',
    birthDate: AVA.date,
    birthTime: AVA.time,
    birthLocation: AVA.placeName,
    timezoneId: AVA.timezoneId,
    latitude: AVA.latitude,
    longitude: AVA.longitude,
    placeName: AVA.placeName,
    planets: planets as any,
    houseCusps: houseCusps as any,
  } as NatalChart;
}

// A fixed "now" so the age stage is deterministic: Ava is 15 → Teen.
const NOW = new Date('2026-09-07T00:00:00Z');

describe('Reading Guide — age / developmental context', () => {
  it('calculates whole years and maps them to a stage', () => {
    expect(calculateAgeYears('2011-05-19', NOW)).toBe(15);
    expect(stageForAge(15)).toBe('teen');
    expect(stageForAge(8)).toBe('child');
    expect(stageForAge(41)).toBe('adult');
  });

  it('derives Teen from Ava’s birth date and honours an override', () => {
    expect(buildAgeContext('2011-05-19', null, NOW)).toMatchObject({ stage: 'teen', source: 'birthdate', years: 15 });
    expect(buildAgeContext('2011-05-19', 'adult', NOW)).toMatchObject({ stage: 'adult', source: 'override' });
  });
});

describe('Reading Guide — Ava Kravitz', () => {
  const chart = buildAvaChart();
  const guide = buildReadingGuide(chart, { now: NOW });

  it('runs at Teen level from the birth date', () => {
    expect(guide.age.stage).toBe('teen');
    expect(guide.age.years).toBe(15);
  });

  it('uses only the core bodies — no asteroids or extra points', () => {
    const used = new Set(collectCoreBodies(chart).map((p) => p.body));
    for (const body of used) expect(CORE_BODIES).toContain(body as any);
    expect(used.has('Eris' as any)).toBe(false);
    expect(used.has('PartOfFortune' as any)).toBe(false);
  });

  it('ranks Start Here with the Big Three first', () => {
    expect(guide.startHere[0].id).toBe('big-three');
    const importances = guide.startHere.map((i) => i.importance);
    expect([...importances].sort((a, b) => b - a)).toEqual(importances);
  });

  it('reads low Water as a processing pattern, never as missing emotion', () => {
    // eslint-disable-next-line no-console
    console.log('ELEMENTS', guide.elements.counts, guide.elements.low);
    expect(guide.elements.low).toContain('Water');
    const water = guide.elements.lowReadings.find((r) => r.element === 'Water')!;
    expect(water.lines.join(' ')).toMatch(/not be the first thing put into words/i);
    const all = [water.headline, ...water.lines, water.note].join(' ');
    expect(all).not.toMatch(/lack(s|ing)? emotion|unemotional|cold/i);
    expect(water.note).toMatch(/pattern/i);
  });

  it('blends Earth emphasis and the 6th-house concentration into a named theme', () => {
    expect(guide.elements.dominant).toContain('Earth');
    const cluster = guide.houseClusters.find((c) => c.house === 6);
    expect(cluster).toBeTruthy();
    expect(cluster!.bodies.length).toBeGreaterThanOrEqual(3);
    expect(cluster!.arena).toMatch(/routine|practice|skill-building/i);

    const earthBlend = guide.blends.find((b) =>
      b.factors.some((f) => /Earth emphasis/.test(f.label))
    );
    expect(earthBlend).toBeTruthy();
    expect(earthBlend!.name.length).toBeGreaterThan(3);
    expect(earthBlend!.strength).toBe('Strong');
  });

  it('makes the reasoning chain visible and ends with a "Together →" line', () => {
    for (const card of guide.blends) {
      expect(card.chain.length).toBeGreaterThanOrEqual(3);
      expect(card.chain[card.chain.length - 1]).toMatch(/^Together →/);
      expect(card.factors.length).toBeGreaterThanOrEqual(1);
      expect(card.whatToSay.length).toBeGreaterThan(20);
      expect(card.askThis.endsWith('?')).toBe(true);
      expect(['Strong', 'Moderate', 'Single-placement']).toContain(card.strength);
    }
  });

  it('grades signal strength by how many independent factors support it', () => {
    for (const card of [...guide.blends, ...guide.personalGroups, ...guide.growth]) {
      if (card.supportCount >= 4) expect(card.strength).toBe('Strong');
      else if (card.supportCount >= 2) expect(card.strength).toBe('Moderate');
      else expect(card.strength).toBe('Single-placement');
    }
  });

  it('keeps house concentrations to the ten planets', () => {
    for (const cluster of guide.houseClusters) {
      expect(cluster.bodies).not.toContain('Ascendant');
      expect(cluster.bodies).not.toContain('North Node');
      expect(cluster.bodies).not.toContain('South Node');
      expect(cluster.bodies).not.toContain('Chiron');
    }
  });

  it('never lists the automatic node opposition as a top connection', () => {
    for (const c of guide.topConnections) {
      expect([c.a, c.b].sort().join('|')).not.toBe('North Node|South Node');
      expect(c.orb).toBeGreaterThanOrEqual(0);
    }
    expect(guide.topConnections.length).toBeLessThanOrEqual(5);
  });

  it('computes real aspects with real orbs (no invented connections)', () => {
    const placements = collectCoreBodies(chart);
    for (const c of rankConnections(placements, 5)) {
      const a = placements.find((p) => p.label === c.a)!;
      const b = placements.find((p) => p.label === c.b)!;
      let sep = Math.abs(a.absDeg - b.absDeg);
      if (sep > 180) sep = 360 - sep;
      const angle = { conjunction: 0, opposition: 180, trine: 120, square: 90, sextile: 60 }[c.aspect as string]!;
      expect(Math.abs(Math.abs(sep - angle) - c.orb)).toBeLessThan(0.15);
    }
  });

  it('only elevates an outer planet when it has a personal hook', () => {
    for (const card of guide.outerPlanets.elevated) {
      expect(card.why).toMatch(/chart ruler|angular|tightly connected/i);
    }
    if (!guide.outerPlanets.elevated.length) {
      expect(guide.outerPlanets.secondaryNote).toMatch(/background/i);
    }
  });

  it('frames the nodes as familiar strengths plus a stretch', () => {
    expect(guide.nodes).toBeTruthy();
    const text = [guide.nodes!.name, guide.nodes!.whatToSay, guide.nodes!.why].join(' ');
    expect(text).toMatch(/already|familiar|practis/i);
    expect(text).not.toMatch(/destiny|karmic debt|fate|must/i);
    expect(guide.nodes!.why).toMatch(/geometry rather than evidence/i);
  });

  it('gives an age-appropriate spoken synthesis', () => {
    expect(guide.story.length).toBeGreaterThan(120);
    // Teen framing: no adult career/marriage/finance claims, no medical claims.
    expect(guide.story).not.toMatch(/\bcareer\b|\bmarriage\b|\bspouse\b|\bfinances\b|\bdiagnos/i);
    expect(guide.story).toMatch(/not.*fixed|tendencies/i);
  });

  it('passes the shared interpretation language policy everywhere', () => {
    const flat = JSON.stringify(guide);
    expect(findForbiddenPhrases(flat)).toEqual([]);
    expect(flat).not.toMatch(/you lack|will definitely|guaranteed|toxic|narcissist|manipulative/i);
  });
});

describe('Reading Guide — child and adult framing', () => {
  const chart = buildAvaChart();

  it('speaks about the child in the third person for a guardian', () => {
    const guide = buildReadingGuide(chart, { stageOverride: 'child', now: NOW });
    expect(guide.age.stage).toBe('child');
    expect(guide.blends[0].whatToSay).toMatch(/\bthey\b|\btheir\b/i);
    expect(guide.story).not.toMatch(/\bcareer\b|\bmarriage\b/i);
  });

  it('allows adult life context when the stage is adult', () => {
    const guide = buildReadingGuide(chart, { stageOverride: 'adult', now: NOW });
    expect(guide.age.stage).toBe('adult');
    const tenth = guide.houseClusters.find((c) => c.house === 10);
    if (tenth) expect(tenth.arena).toMatch(/career|public|direction/i);
    expect(findForbiddenPhrases(JSON.stringify(guide))).toEqual([]);
  });
});
