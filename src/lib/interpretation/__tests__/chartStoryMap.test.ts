import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { buildChartStoryMap } from '@/lib/interpretation/chartStoryMap';
import { validatePersonReading, validationContextFor, findAspectMentions, cleanPersonText, type PersonReading } from '@/lib/interpretation/personReadingValidator';

function calculatedChart(input: { id: string; name: string; date: string; time: string; latitude: number; longitude: number; timezoneId: string; place: string }): NatalChart {
  const c = calculateNatalFromInput({ birthDate: input.date, birthTime: input.time, birthLocation: input.place, latitude: input.latitude, longitude: input.longitude, timezoneId: input.timezoneId, placeName: input.place, placeConfidence: 'high', placeSource: 'manual' } as never);
  const planets = Object.fromEntries(Object.entries(c.positions).map(([b, p]) => { const s = toStoredPosition(p); return [b, { ...s, isRetrograde: s.isRetrograde ?? false }]; }));
  const houseCusps = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`house${i + 1}`, c.houseCusps?.[`house${i + 1}` as keyof typeof c.houseCusps]]));
  return { id: input.id, name: input.name, birthDate: input.date, birthTime: input.time, birthLocation: input.place, latitude: input.latitude, longitude: input.longitude, timezoneId: input.timezoneId, planets, houseCusps } as NatalChart;
}

const ava = calculatedChart({ id: 'ava', name: 'Ava', date: '2011-05-19', time: '18:06', latitude: 34.2011, longitude: -118.6317, timezoneId: 'America/Los_Angeles', place: 'West Hills, CA' });
const karina = calculatedChart({ id: 'karina', name: 'Karina', date: '1993-11-07', time: '11:30', latitude: -29.9027, longitude: -71.2519, timezoneId: 'America/Santiago', place: 'La Serena, Chile' });

const HARRISON: Record<string, [string, number, number]> = {
  Sun: ['Virgo', 29, 34], Moon: ['Aquarius', 10, 22], Mercury: ['Libra', 18, 50], Venus: ['Scorpio', 6, 25],
  Mars: ['Cancer', 26, 42], Jupiter: ['Leo', 18, 2], Saturn: ['Aries', 12, 13], Uranus: ['Gemini', 5, 38],
  Neptune: ['Aries', 3, 5], Pluto: ['Aquarius', 3, 12], Chiron: ['Aries', 29, 50], NorthNode: ['Aquarius', 29, 35],
};
const HC: [string, number, number][] = [['Scorpio', 2, 49], ['Sagittarius', 1, 17], ['Capricorn', 3, 51], ['Aquarius', 8, 50], ['Pisces', 11, 52], ['Aries', 9, 53], ['Taurus', 2, 49], ['Gemini', 1, 17], ['Cancer', 3, 51], ['Leo', 8, 50], ['Virgo', 11, 52], ['Libra', 9, 53]];
const harrison = {
  id: 'h', name: 'Harrison', birthDate: '2026-09-22', birthTime: '09:40', birthLocation: 'Philadelphia',
  planets: Object.fromEntries(Object.entries(HARRISON).map(([b, [sign, degree, minutes]]) => [b, { sign, degree, minutes, seconds: 0 }])),
  houseCusps: Object.fromEntries(HC.map(([sign, degree, minutes], i) => [`house${i + 1}`, { sign, degree, minutes }])),
} as NatalChart;

const NOW = new Date('2026-10-24T12:00:00Z');

describe('chart story map', () => {
  it('Harrison: Scorpio rising chain runs through Mars (traditional) with Pluto as co-ruler', () => {
    const map = buildChartStoryMap(harrison, { now: NOW });
    const rising = map.chains.find((c) => c.id === 'chain:rising')!;
    expect(rising).toBeTruthy();
    expect(map.evidence['rulership:chart-ruler'].fact).toContain('makes Mars the chart ruler');
    expect(map.evidence['rulership:chart-ruler'].fact).toContain('Pluto as modern co-ruler');
    expect(rising.steps).toContain('placement:Mars');
    expect(map.evidence['placement:Mars'].fact).toMatch(/Mars 26°42′ Cancer in the 9th house.*traditional fall/);
  });

  it('Harrison: Midheaven chain uses the Leo MC and its ruler the Sun', () => {
    const map = buildChartStoryMap(harrison, { now: NOW });
    expect(map.evidence['rulership:mc-ruler'].fact).toContain('makes Sun the Midheaven ruler');
    expect(map.chains.find((c) => c.id === 'chain:midheaven')!.steps).toContain('placement:Sun');
  });

  it('Harrison: Sun-Chiron is a quincunx, never an opposition, in the allowed aspects', () => {
    const map = buildChartStoryMap(harrison, { now: NOW });
    const sunChiron = map.allowedAspects.filter((a) => a && [a.a, a.b].sort().join() === 'Chiron,Sun');
    expect(sunChiron.every((a) => a!.type !== 'opposition')).toBe(true);
  });

  it('builds anchor chains and tensions for calculated charts (Ava, Karina)', () => {
    for (const chart of [ava, karina]) {
      const map = buildChartStoryMap(chart, { now: NOW });
      const ids = map.chains.map((c) => c.id);
      expect(ids).toEqual(expect.arrayContaining(['chain:rising', 'chain:midheaven', 'chain:sun', 'chain:moon']));
      for (const c of map.chains) for (const s of c.steps) expect(map.evidence[s]).toBeTruthy();
      for (const t of map.tensions) for (const id of t.evidenceIds) expect(map.evidence[id]).toBeTruthy();
    }
  });

  it('Karina: Capricorn rising makes Saturn the chart ruler', () => {
    const map = buildChartStoryMap(karina, { now: NOW });
    expect(map.evidence['rulership:chart-ruler'].fact).toContain('Capricorn rising makes Saturn the chart ruler');
  });

  it('every linked transit points at a chain that contains its target', () => {
    const map = buildChartStoryMap(karina, { now: NOW });
    for (const t of map.transits) {
      for (const cid of t.chainIds) expect(map.chains.find((c) => c.id === cid)!.bodies).toContain(t.target);
    }
  });
});

function sampleReading(map: ReturnType<typeof buildChartStoryMap>, text = 'You may notice this.'): PersonReading {
  const rising = map.chains.find((c) => c.id === 'chain:rising')!;
  const sig = (name: string) => ({ name, chainIds: [rising.id], evidenceIds: rising.steps.slice(0, 2), howItWorks: text, inWork: text, inRelationships: text, underStress: text, strength: text, stuckPoint: text });
  return { headline: text, centralTension: text, signatures: [sig('The A'), sig('The B'), sig('The C')], collisions: [], whenLost: text, whatSteadies: text, transitsNow: [], clientQuestions: ['Does this fit?'] };
}

describe('person reading validator', () => {
  const map = buildChartStoryMap(harrison, { now: NOW });
  const ctx = validationContextFor(map);

  it('accepts a reading that cites real evidence', () => {
    expect(validatePersonReading(sampleReading(map), ctx)).toEqual([]);
  });

  it('rejects an aspect that is not in the chart (Sun opposite Chiron)', () => {
    const errors = validatePersonReading(sampleReading(map, 'Your Sun opposite Chiron may feel strong.'), ctx);
    expect(errors.some((e) => e.includes('Aspect not in the chart'))).toBe(true);
  });

  it('rejects a cross-sign "tight" conjunction the chart does not have', () => {
    const errors = validatePersonReading(sampleReading(map, 'Mercury is tightly conjunct Mars.'), ctx);
    expect(errors.some((e) => e.includes('Aspect not in the chart'))).toBe(true);
  });

  it('rejects unknown evidence ids', () => {
    const r = sampleReading(map);
    r.signatures[0].evidenceIds = ['placement:Imaginary', 'angle:Ascendant'];
    expect(validatePersonReading(r, ctx).some((e) => e.includes('unknown evidence'))).toBe(true);
  });

  it('rejects fixed-fate and diagnostic wording', () => {
    expect(validatePersonReading(sampleReading(map, 'You are not meant for a single career.'), ctx).some((e) => e.startsWith('Fixed-fate'))).toBe(true);
    expect(validatePersonReading(sampleReading(map, 'This is trauma from childhood.'), ctx).some((e) => e.startsWith('Diagnostic'))).toBe(true);
  });

  it('parses aspect mentions and cleans dashes', () => {
    expect(findAspectMentions("Venus square your Saturn")[0]).toMatchObject({ a: 'Venus', b: 'Saturn', type: 'square' });
    expect(cleanPersonText('steady \u2014 then bold')).toBe('steady, then bold');
  });
});
