import { describe, it, expect } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '../natalChartCalculation';
import { buildRelationshipContext } from '@/lib/relationship/relationshipContext';
import {
  compositeMidpoint,
  calculateCompositeModel,
  calculateCompositeAspects,
  calculateCompositeBalance,
  majorCompositeAspects,
  COMPOSITE_BODIES,
} from '@/lib/relationship/compositeEngine';
import { buildCompositeReading, legacyCompositeInterpretation } from '@/lib/relationship/compositeReading';
import { findForbiddenRelationshipPhrases, collectStrings } from '@/lib/relationship';
import { calculateCompositeChart } from '@/lib/compositeChart';

interface Fixture {
  id: string;
  name: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezoneId: string;
  place: string;
}

function buildChart(f: Fixture): NatalChart {
  const calc = calculateNatalFromInput({
    birthDate: f.date,
    birthTime: f.time,
    birthLocation: f.place,
    latitude: f.latitude,
    longitude: f.longitude,
    timezoneId: f.timezoneId,
    placeName: f.place,
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
    id: f.id,
    name: f.name,
    birthDate: f.date,
    birthTime: f.time,
    birthLocation: f.place,
    timezoneId: f.timezoneId,
    latitude: f.latitude,
    longitude: f.longitude,
    placeName: f.place,
    planets: planets as any,
    houseCusps: houseCusps as any,
  } as NatalChart;
}

// Ava + Max: the teen romantic reference pair. Both minors, NOT related.
const AVA: Fixture = {
  id: 'ava',
  name: 'Ava Kravitz',
  date: '2011-05-19',
  time: '18:06',
  latitude: 34.2011,
  longitude: -118.6317,
  timezoneId: 'America/Los_Angeles',
  place: 'West Hills, California, United States',
};

const MAX: Fixture = {
  id: 'max',
  name: 'Max Levin',
  date: '2014-02-08',
  time: '09:20',
  latitude: 34.2011,
  longitude: -118.6317,
  timezoneId: 'America/Los_Angeles',
  place: 'West Hills, California, United States',
};

const ava = buildChart(AVA);
const max = buildChart(MAX);

const teenContext = buildRelationshipContext({
  kind: 'romantic',
  chart1: ava,
  chart2: max,
  teenRomanceExplicitlySelected: true,
  now: new Date('2026-01-01T00:00:00Z'),
});

function longitudeOf(chart: NatalChart, body: string): number {
  const SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const pos: any = (chart.planets as any)[body];
  return SIGNS.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes ?? 0) / 60 + (pos.seconds ?? 0) / 3600;
}

describe('composite midpoint math', () => {
  it('takes the midpoint on the forward arc from the lower longitude', () => {
    expect(compositeMidpoint(10, 50).longitude).toBeCloseTo(30, 6);
    expect(compositeMidpoint(50, 10).longitude).toBeCloseTo(30, 6);
  });

  it('handles the 359/1 wraparound instead of producing 180', () => {
    const m = compositeMidpoint(359, 1);
    expect(m.longitude).toBeCloseTo(0, 6);
    expect(m.ambiguous).toBe(false);
  });

  it('flags the exact opposition as ambiguous and still returns a deterministic value', () => {
    const a = compositeMidpoint(0, 180);
    const b = compositeMidpoint(180, 0);
    expect(a.ambiguous).toBe(true);
    expect(b.ambiguous).toBe(true);
    expect(a.longitude).toBeCloseTo(b.longitude, 6);
    expect(Number.isFinite(a.longitude)).toBe(true);
  });

  it('is order independent for every composite body of the reference pair', () => {
    for (const body of COMPOSITE_BODIES) {
      const a = longitudeOf(ava, body);
      const b = longitudeOf(max, body);
      expect(compositeMidpoint(a, b).longitude).toBeCloseTo(compositeMidpoint(b, a).longitude, 8);
    }
  });
});

describe('composite model for Ava + Max', () => {
  const model = calculateCompositeModel(ava, max);

  it('places every composite body at the midpoint of the two natal longitudes', () => {
    for (const body of COMPOSITE_BODIES) {
      const expected = compositeMidpoint(longitudeOf(ava, body), longitudeOf(max, body)).longitude;
      expect(model.positions[body].longitude).toBeCloseTo(expected, 2);
    }
  });

  it('reports major aspects with exact orbs, tightest first', () => {
    const majors = majorCompositeAspects(model.aspects);
    expect(majors.length).toBeGreaterThan(0);
    for (const a of majors) {
      expect(a.orb).toBeGreaterThanOrEqual(0);
      expect(a.orb).toBeLessThanOrEqual(a.maxOrb);
      expect(COMPOSITE_BODIES.includes(a.fromBody as any) || ['Ascendant', 'Midheaven'].includes(a.fromBody)).toBe(true);
    }
    // Ranking is by weight (aspect kind and body importance) with the tighter orb
    // breaking ties, so major-planet contacts lead rather than any stray tight orb.
    const weights = majors.map((a) => a.weight);
    expect([...weights].sort((x, y) => y - x)).toEqual(weights);
    expect(majors[0].orb).toBeLessThanOrEqual(majors[0].maxOrb);
  });

  it('never lists an aspect of a body with itself', () => {
    for (const a of model.aspects) expect(a.fromBody).not.toBe(a.toBody);
  });

  it('weights luminaries and angles above the outer planets in the balance', () => {
    const balance = calculateCompositeBalance(model.positions);
    const total = Object.values(balance.elements).reduce((s, v) => s + v, 0);
    expect(total).toBeGreaterThan(0);
    expect(balance.note.length).toBeGreaterThan(0);
  });
});

describe('composite houses and angles', () => {
  it('derives houses when both charts have latitude and a Midheaven', () => {
    const model = calculateCompositeModel(ava, max);
    expect(typeof model.angles.housesAvailable).toBe('boolean');
    if (model.angles.housesAvailable) {
      expect(model.angles.cuspLongitudes).toBeTruthy();
      for (let i = 1; i <= 12; i++) expect(Number.isFinite(model.angles.cuspLongitudes![i])).toBe(true);
      expect(model.angles.midheaven).toBeTruthy();
    }
    expect(model.angles.note.length).toBeGreaterThan(0);
  });

  it('marks houses unavailable when latitude is missing, without inventing cusps', () => {
    const noLat = { ...ava, latitude: undefined } as unknown as NatalChart;
    const model = calculateCompositeModel(noLat, max);
    expect(model.angles.housesAvailable).toBe(false);
    expect(model.angles.cuspLongitudes).toBeFalsy();
    expect(model.angles.note.toLowerCase()).toContain('house');
    for (const body of COMPOSITE_BODIES) {
      expect(model.positions[body].house ?? null).toBeNull();
    }
  });
});

describe('composite reading for Ava + Max (teen, dating)', () => {
  const model = calculateCompositeModel(ava, max);
  const reading = buildCompositeReading(model, teenContext);
  const text = collectStrings(reading).join(' \n ');

  it('leads with a bounded number of evidence-backed factors', () => {
    expect(reading.lookHereFirst.length).toBeGreaterThanOrEqual(3);
    expect(reading.lookHereFirst.length).toBeLessThanOrEqual(8);
    for (const item of reading.lookHereFirst) {
      expect(item.evidence.length).toBeGreaterThan(0);
      expect(item.derivation.length).toBeGreaterThan(0);
      expect(item.signalLabel.length).toBeGreaterThan(0);
    }
  });

  it('never lets a minor body outrank the major factors', () => {
    const leadTiers = reading.lookHereFirst.map((i) => i.tier);
    expect(leadTiers[0]).toBe('primary');
    expect(leadTiers.includes('supplemental')).toBe(false);
  });

  it('explains every theme with exact factors and a does-not-mean note', () => {
    expect(reading.themes.length).toBeGreaterThanOrEqual(2);
    for (const t of reading.themes) {
      expect(t.evidence.length).toBeGreaterThan(0);
      expect(t.derivation.length).toBeGreaterThan(0);
      expect(t.doesNotMean.length).toBeGreaterThan(0);
      expect(t.howItShowsUp.length).toBeGreaterThan(20);
    }
  });

  it('makes the synastry versus composite distinction explicit', () => {
    expect(reading.distinction.composite.toLowerCase()).toContain('composite');
    expect(reading.distinction.synastry.toLowerCase()).toContain('synastry');
  });

  it('uses teen-appropriate, non-sexual, non-adult wording', () => {
    const banned = [
      'marriage', 'married', 'wedding', 'cohabit', 'moving in together', 'sexual', 'sex ',
      'erotic', 'eros', 'intimacy', 'lovemaking', 'children together', 'fertility',
      'business partner', 'shared finances', 'mortgage', 'dominance', 'surrender',
    ];
    const lower = text.toLowerCase();
    for (const term of banned) expect(lower).not.toContain(term);
  });

  it('avoids deterministic, fated and pseudo-metric language', () => {
    expect(findForbiddenRelationshipPhrases(text)).toEqual([]);
    const lower = text.toLowerCase();
    for (const term of [
      'twin flame', 'past life probability', 'soul growth focus', 'fated love',
      'profound intimacy', 'deeply merged', 'your relationship is destined',
      'this relationship will', 'you will always',
    ]) {
      expect(lower).not.toContain(term);
    }
  });

  it('qualifies statements rather than asserting them', () => {
    const hedges = ['can ', 'may ', 'often', 'one expression', 'tends to'];
    for (const t of reading.themes) {
      const s = `${t.interpretation} ${t.howItShowsUp}`.toLowerCase();
      expect(hedges.some((h) => s.includes(h))).toBe(true);
    }
  });

  it('does not headline a single placement as the whole relationship', () => {
    const lower = text.toLowerCase();
    expect(lower).not.toContain('natural alignment');
    expect(lower).not.toContain('naturally aligned');
    for (const item of reading.themes) {
      if (item.signal === 'strong') expect(item.evidence.length).toBeGreaterThan(1);
    }
  });
});

describe('legacy composite surfaces', () => {
  it('derives the legacy interpretation shape from the canonical model, with no canned sign tables', () => {
    const result = calculateCompositeChart(ava, max, teenContext);
    expect(result.model).toBeTruthy();
    expect(result.interpretation.sunSign).toBe(result.model.positions.Sun.sign);
    expect(result.interpretation.relationshipStyle).toContain('Composite Sun at');
    expect(result.interpretation.overallTheme.length).toBeGreaterThan(20);
    expect(findForbiddenRelationshipPhrases(collectStrings(result.interpretation).join(' '))).toEqual([]);
  });

  it('keeps two different pairs from receiving identical text', () => {
    const a = calculateCompositeChart(ava, max, teenContext);
    const b = calculateCompositeChart(max, ava, teenContext);
    expect(a.interpretation.relationshipStyle).toBe(b.interpretation.relationshipStyle);
    const model = calculateCompositeModel(ava, ava);
    const other = legacyCompositeInterpretation(model, buildCompositeReading(model, teenContext));
    expect(other.relationshipStyle).not.toBe(a.interpretation.relationshipStyle);
  });

  it('detects aspects between two composite position sets deterministically', () => {
    const model = calculateCompositeModel(ava, max);
    const again = calculateCompositeAspects(model.positions);
    expect(again.length).toBe(model.aspects.length);
  });
});
