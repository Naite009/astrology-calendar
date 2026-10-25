import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { buildChartStoryMap, PLANETS } from '@/lib/interpretation/chartStoryMap';
import { validatePersonReading, validationContextFor, findPlacementClaims, findRulerClaims, type PersonReading } from '@/lib/interpretation/personReadingValidator';
import { houseForLongitude, toAbsoluteLongitude } from '@/lib/houseForLongitude';
import { getHouseForLongitude } from '@/lib/houseCalculations';
import { computeRankedAspects } from '@/lib/aspectRanking';
import { buildRulerChain } from '@/lib/rulerChains';
import { TRADITIONAL_RULER } from '@/lib/interpretation/chartRuler';

function calculatedChart(input: { id: string; name: string; date: string; time: string; latitude: number; longitude: number; timezoneId: string; place: string }): NatalChart {
  const c = calculateNatalFromInput({ birthDate: input.date, birthTime: input.time, birthLocation: input.place, latitude: input.latitude, longitude: input.longitude, timezoneId: input.timezoneId, placeName: input.place, placeConfidence: 'high', placeSource: 'manual' } as never);
  const planets = Object.fromEntries(Object.entries(c.positions).map(([b, p]) => { const s = toStoredPosition(p); return [b, { ...s, isRetrograde: s.isRetrograde ?? false }]; }));
  const houseCusps = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`house${i + 1}`, c.houseCusps?.[`house${i + 1}` as keyof typeof c.houseCusps]]));
  return { id: input.id, name: input.name, birthDate: input.date, birthTime: input.time, birthLocation: input.place, latitude: input.latitude, longitude: input.longitude, timezoneId: input.timezoneId, planets, houseCusps } as NatalChart;
}

const gina = calculatedChart({ id: 'gina', name: 'Gina', date: '1985-11-08', time: '19:01', latitude: 40.7282, longitude: -73.7949, timezoneId: 'America/New_York', place: 'Queens, NY' });
const karina = calculatedChart({ id: 'karina', name: 'Karina', date: '1993-11-07', time: '11:30', latitude: -29.9027, longitude: -71.2519, timezoneId: 'America/Santiago', place: 'La Serena, Chile' });
const NOW = new Date('2026-10-24T12:00:00Z');
const cuspLon = (c: NatalChart, h: number) => toAbsoluteLongitude((c.houseCusps as Record<string, never>)[`house${h}`])!;
const sep = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };

describe('houses, cusps and angles', () => {
  for (const [name, chart] of [['Gina', gina], ['Karina', karina]] as const) {
    it(`${name}: all 12 Placidus cusps exist and opposite cusps are exactly 180° apart`, () => {
      for (let h = 1; h <= 6; h++) expect(Math.abs(sep(cuspLon(chart, h), cuspLon(chart, h + 6)) - 180)).toBeLessThan(0.02);
    });
    it(`${name}: story map Descendant/IC are the exact opposites of Ascendant/MC`, () => {
      const m = buildChartStoryMap(chart, { now: NOW });
      expect(sep(m.placements.Descendant.longitude, m.placements.Ascendant.longitude)).toBeCloseTo(180, 6);
      expect(sep(m.placements.IC.longitude, m.placements.Midheaven.longitude)).toBeCloseTo(180, 6);
      expect(Math.abs(m.placements.Ascendant.longitude - cuspLon(chart, 1))).toBeLessThan(1e-9);
      expect(Math.abs(m.placements.Midheaven.longitude - cuspLon(chart, 10))).toBeLessThan(1e-9);
    });
  }
  it('house lookup: on-cusp belongs to the new house, just before belongs to the previous one', () => {
    for (let h = 1; h <= 12; h++) {
      const c = cuspLon(gina, h);
      expect(houseForLongitude(gina, c)).toBe(h);
      expect(houseForLongitude(gina, (c - 0.001 + 360) % 360)).toBe(h === 1 ? 12 : h - 1);
    }
  });
  it('the two house helpers are one implementation (no silent 1st-house default)', () => {
    for (let lon = 0; lon < 360; lon += 0.5) expect(getHouseForLongitude(lon, gina)).toBe(houseForLongitude(gina, lon));
    const noCusps = { ...gina, houseCusps: { ...gina.houseCusps, house7: undefined } } as unknown as NatalChart;
    expect(getHouseForLongitude(100, noCusps)).toBeNull();
  });
});

describe('aspects use full precision at orb boundaries', () => {
  const base = (marsLon: number) => ({
    id: 'x', name: 'X', birthDate: '2000-01-01', birthTime: '12:00', birthLocation: '',
    planets: {
      Mercury: { sign: 'Aries', degree: 0, minutes: 0, seconds: 0, longitude: 0 },
      Mars: { sign: 'Aries', degree: Math.floor(marsLon), minutes: Math.floor((marsLon % 1) * 60), seconds: 0, longitude: marsLon },
    },
  } as unknown as NatalChart);
  it('Mercury-Mars 7.99° is a conjunction, 8.01° (minutes alone say 8°00′) is not', () => {
    expect(computeRankedAspects(base(7.99)).some((a) => a.aspect === 'conjunction')).toBe(true);
    expect(computeRankedAspects(base(8.01)).some((a) => a.aspect === 'conjunction')).toBe(false);
  });
});

describe('ruler chains and dispositors', () => {
  it('every house chain follows traditional rulers step by step and terminates', () => {
    for (let h = 1; h <= 12; h++) {
      const rc = buildRulerChain(gina, h);
      expect(rc.traditionalRuler).toBe(TRADITIONAL_RULER[rc.cuspSign!]);
      rc.steps.forEach((s, i) => {
        expect(s.dispositor).toBe(TRADITIONAL_RULER[s.sign]);
        if (i > 0) expect(s.planet).toBe(rc.steps[i - 1].dispositor);
      });
      expect(['self-dispositor', 'loop']).toContain(rc.termination);
    }
  });
  it('story map has all 12 house rulers and a dispositor chain for every planet', () => {
    const m = buildChartStoryMap(gina, { now: NOW });
    expect(Object.keys(m.houseRulers)).toHaveLength(12);
    for (const p of PLANETS) expect(m.evidence[`rulership:dispositors-${p}`]?.fact).toMatch(/^Dispositor chain: /);
  });
});

describe('whole-chart story map', () => {
  it('every one of the 10 major planets has its own chain, not just the anchors', () => {
    const m = buildChartStoryMap(gina, { now: NOW });
    const ids = m.chains.map((c) => c.id);
    for (const p of PLANETS) expect(ids).toContain(p === 'Sun' || p === 'Moon' ? `chain:${p.toLowerCase()}` : `chain:planet-${p}`);
    expect(ids).toContain('chain:descendant');
    for (const c of m.chains) for (const s of c.steps) expect(m.evidence[s]).toBeTruthy();
  });
  it('Gina: Moon square Descendant (~0.2°) is a verified aspect object (missed in the prior relationship reading)', () => {
    const m = buildChartStoryMap(gina, { now: NOW });
    const a = m.allowedAspects.find((x) => [x.a, x.b].sort().join() === 'Descendant,Moon' && x.type === 'square');
    expect(a).toBeTruthy();
    expect(a!.orb).toBeLessThan(0.5);
    expect(m.placements.Moon.sign).toBe('Virgo');
  });
  it('salient contradictions are marked mustAddress only for aspects under 3°', () => {
    for (const chart of [gina, karina]) {
      const m = buildChartStoryMap(chart, { now: NOW });
      for (const t of m.tensions.filter((x) => x.mustAddress)) {
        const id = t.evidenceIds[t.evidenceIds.length - 1];
        expect(m.evidence[id].aspect!.orb).toBeLessThan(3);
      }
    }
  });
});

// ── Prose validation (Part C) ──
const map = buildChartStoryMap(gina, { now: NOW });
const ctx = { ...validationContextFor(map), requireConclusionEvidence: false };
const must = map.tensions.filter((t) => t.mustAddress).map((t) => t.evidenceIds[t.evidenceIds.length - 1]);
function reading(over: Partial<PersonReading['signatures'][number]> = {}, text = 'She may notice this.'): PersonReading {
  const sig = (name: string) => ({
    name, plainMeaning: 'She may want closeness and fairness, yet when depending on someone feels shaky she can quietly take the job back.',
    chainIds: ['chain:rising', 'chain:moon'], evidenceIds: ['angle:Ascendant', 'placement:Moon', 'rulership:Moon-dispositor'],
    howItWorks: text, inWork: text, inRelationships: text, underStress: text,
    tension: text, tensionEvidenceIds: must.length ? must : ['placement:Moon'], healthyExpression: text, ...over,
    conclusionEvidence: Object.fromEntries(['plainMeaning', 'howItWorks', 'inWork', 'inRelationships', 'underStress', 'tension', 'healthyExpression'].map((f) => [f, ['angle:Ascendant', 'placement:Moon', 'rulership:Moon-dispositor']])),
  });
  return { headline: text, centralTension: text, signatures: [sig('The A'), sig('The B'), sig('The C')], collisions: [], whenLost: text, whatSteadies: text, transitsNow: [], clientQuestions: ['Does this fit?'] };
}
const fails = (r: PersonReading, needle: string) => validatePersonReading(r, ctx).some((e) => e.includes(needle));

describe('person reading validator: evidence integrity', () => {
  const moon = map.placements.Moon;
  const moonDeg = Math.floor(moon.longitude % 30);
  const wrongSign = moon.sign === 'Virgo' ? 'Libra' : 'Virgo';
  it('accepts a reading that cites real evidence correctly', () => {
    expect(validatePersonReading(reading({ howItWorks: `Because the Moon sits at ${moonDeg}° ${moon.sign} in the ${moon.house}th house, she may sort feelings by fixing details.` }), ctx)).toEqual([]);
  });
  it('fails a wrong sign', () => expect(fails(reading({ howItWorks: `The Moon in ${wrongSign} may feel calm.` }), 'Wrong sign')).toBe(true));
  it('fails a wrong degree', () => expect(fails(reading({ howItWorks: `The Moon at ${(moonDeg + 5) % 30}° ${moon.sign} may feel calm.` }), 'Wrong degree')).toBe(true));
  it('fails a wrong house', () => expect(fails(reading({ howItWorks: `The Moon in the ${moon.house === 3 ? 4 : 3}rd house may feel calm.` }), 'Wrong house')).toBe(true));
  it('fails a wrong house ruler', () => {
    const real = map.houseRulers[7].traditional;
    const wrong = real === 'Venus' ? 'Mars' : 'Venus';
    expect(fails(reading({ howItWorks: `The 7th house ruler ${wrong} may shape partners.` }), 'Wrong ruler')).toBe(true);
    expect(validatePersonReading(reading({ howItWorks: `The 7th house ruler ${real} may shape partners.` }), ctx).filter((e) => e.includes('ruler'))).toEqual([]);
  });
  it('fails a wrong orb on a real aspect', () => expect(fails(reading({ howItWorks: 'The Moon square Descendant (3.0° orb) may stand out.' }), 'Wrong orb')).toBe(true));
  it('fails "X and Y are square" when no such aspect object exists', () => {
    const none = ['Mercury', 'Jupiter'];
    const exists = map.allowedAspects.some((a) => [a.a, a.b].sort().join() === none.sort().join() && a.type === 'square');
    if (!exists) expect(fails(reading({ howItWorks: 'Mercury and Jupiter are square, so she may overpromise.' }), 'Aspect not in the chart')).toBe(true);
  });
  it('fails "exactly" for an orb of 1° or more', () => {
    const wide = map.allowedAspects.find((a) => !a.derived && a.orb >= 1.5 && a.a !== 'Midheaven' && a.b !== 'Midheaven' && a.a !== 'Ascendant' && a.b !== 'Ascendant')!;
    expect(fails(reading({ howItWorks: `${wide.a} exactly ${wide.type === 'opposition' ? 'opposite' : wide.type} ${wide.b} may show.` }), '"exact" used')).toBe(true);
  });
  it('fails a signature supported by only one chain', () => {
    expect(fails(reading({ chainIds: ['chain:moon'], evidenceIds: ['placement:Moon', 'rulership:Moon-dispositor'] }), 'independent')).toBe(true);
    expect(fails(reading({ evidenceIds: ['angle:Ascendant', 'placement:Moon'] }), 'at least 3 concrete')).toBe(true);
  });
  it('fails a large life-purpose claim resting on weak evidence', () => {
    expect(fails(reading({ healthyExpression: 'Saturn in her chart means she is here to change the world.' }), 'life-purpose')).toBe(true);
  });
  it('fails when a salient mustAddress contradiction is ignored', () => {
    if (!must.length) return;
    expect(fails(reading({ tensionEvidenceIds: ['placement:Moon'] }), 'Ignores a salient contradiction')).toBe(true);
  });
  it('requires the plain-language synthesis sentence under every name', () => {
    expect(fails(reading({ plainMeaning: '' }), 'plain-language meaning')).toBe(true);
  });
  it('does not treat transit sentences as natal placement claims', () => {
    const r = reading();
    r.transitsNow = [];
    r.signatures[0].underStress = 'Right now transiting Saturn moving through the 7th may slow decisions.';
    expect(validatePersonReading(r, ctx).filter((e) => e.includes('Saturn'))).toEqual([]);
  });
  it('parsers attribute claims to the right body', () => {
    expect(findPlacementClaims('Sun 28° Libra, ruled by Venus in Scorpio')).toEqual(expect.arrayContaining([
      expect.objectContaining({ body: 'Sun', sign: 'Libra', degree: 28 }), expect.objectContaining({ body: 'Venus', sign: 'Scorpio' }),
    ]));
    expect(findRulerClaims('Mars rules the 7th')[0]).toMatchObject({ body: 'Mars', house: 7 });
    expect(findRulerClaims('Saturn, her chart ruler, is strong')[0]).toMatchObject({ body: 'Saturn', house: 1 });
  });
  it('catches loose and hyphenated aspect claims, spelled ordinals, "tight" and third-person fate wording', () => {
    const notReal = ['Mercury', 'Neptune'].sort().join();
    if (!map.allowedAspects.some((a) => [a.a, a.b].sort().join() === notReal && a.type === 'conjunction')) {
      expect(fails(reading({ howItWorks: 'Mercury in its sign is closely conjunct dreamy Neptune.' }), 'Aspect not in the chart')).toBe(true);
      expect(fails(reading({ howItWorks: 'The Mercury-Neptune conjunction may blur facts.' }), 'Aspect not in the chart')).toBe(true);
    }
    expect(findPlacementClaims('Saturn sits in the tenth house')[0]).toMatchObject({ body: 'Saturn', house: 10 });
    expect(findPlacementClaims('Saturn came first in the first place')).toEqual([]);
    expect(fails(reading({ underStress: 'She will snap.' }), 'Fixed-fate')).toBe(true);
  });
});

// Saved chart (triple Libra). Regression for defects seen in a generated sample.
const lauren = {"id":"user","name": "Lauren Newman", "planets": {"Sun": {"sign": "Libra", "degree": 28, "minutes": 11, "isRetrograde": false}, "Mars": {"sign": "Scorpio", "degree": 8, "minutes": 36, "isRetrograde": false}, "Moon": {"sign": "Libra", "degree": 3, "minutes": 33, "isRetrograde": false}, "Pluto": {"sign": "Libra", "degree": 12, "minutes": 14, "isRetrograde": false}, "Venus": {"sign": "Sagittarius", "degree": 0, "minutes": 54, "isRetrograde": false}, "Chiron": {"sign": "Aries", "degree": 29, "minutes": 38, "isRetrograde": true}, "Saturn": {"sign": "Leo", "degree": 15, "minutes": 36, "isRetrograde": false}, "Uranus": {"sign": "Scorpio", "degree": 6, "minutes": 53, "isRetrograde": false}, "Jupiter": {"sign": "Taurus", "degree": 29, "minutes": 34, "isRetrograde": true}, "Mercury": {"sign": "Libra", "degree": 16, "minutes": 56, "isRetrograde": false}, "Neptune": {"sign": "Sagittarius", "degree": 12, "minutes": 6, "isRetrograde": false}, "NorthNode": {"sign": "Scorpio", "degree": 3, "minutes": 32, "isRetrograde": false}}, "birthDate": "1976-10-21", "birthTime": "07:12", "houseCusps": {"house1": {"sign": "Libra", "degree": 24, "minutes": 56}, "house2": {"sign": "Scorpio", "degree": 22, "minutes": 57}, "house3": {"sign": "Sagittarius", "degree": 24, "minutes": 41}, "house4": {"sign": "Capricorn", "degree": 28, "minutes": 51}, "house5": {"sign": "Pisces", "degree": 1, "minutes": 56}, "house6": {"sign": "Aries", "degree": 0, "minutes": 53}, "house7": {"sign": "Aries", "degree": 24, "minutes": 56}, "house8": {"sign": "Taurus", "degree": 22, "minutes": 57}, "house9": {"sign": "Gemini", "degree": 24, "minutes": 41}, "house10": {"sign": "Cancer", "degree": 28, "minutes": 51}, "house11": {"sign": "Virgo", "degree": 1, "minutes": 56}, "house12": {"sign": "Libra", "degree": 0, "minutes": 53}}} as unknown as NatalChart;
describe('Lauren (triple Libra) whole-chart evidence', () => {
  const m = buildChartStoryMap(lauren, { now: NOW });
  const c = validationContextFor(m);
  it('Big Three repetition is evidence, and complicating factors are in the map', () => {
    expect(m.evidence['concentration:big-three'].fact).toMatch(/all three in Libra, all Air, all Cardinal/);
    expect(m.evidence['aspect:Mars-conjunction-Uranus']).toBeTruthy();
    expect(m.placements.Mars.house).toBe(1);
    expect(m.placements.Moon.house).toBe(12);
    expect(m.placements.Saturn.house).toBe(10);
    expect(m.houseRulers[1].traditional).toBe('Venus');
  });
  it('Ascendant-MC is never treated as an aspect or tension', () => {
    expect(m.allowedAspects.some((a) => [a.a, a.b].includes('Ascendant') && [a.a, a.b].includes('Midheaven'))).toBe(false);
  });
  it('rejects "exactly conjunct" for the 1.7° Mars-Uranus conjunction', () => {
    const r = reading({ howItWorks: 'Mars in its home sign of Scorpio exactly conjunct unpredictable Uranus.' });
    expect(validatePersonReading(r, c).some((e) => e.includes('"exact" used'))).toBe(true);
  });
});

describe('reinforcement clusters', () => {
  const m = buildChartStoryMap(lauren, { now: NOW });
  it('finds the verified Venus-Jupiter mutual reception and the 12th-house cluster, never invented ones', () => {
    const ids = m.reinforcements.map((r) => r.id);
    expect(ids).toContain('reinforce:mutual-Venus-Jupiter');
    expect(ids.some((i) => i === 'reinforce:house-12' || i === 'reinforce:house-1')).toBe(true);
    for (const r of m.reinforcements) for (const e of r.evidenceIds) expect(m.evidence[e]).toBeTruthy();
  });
});

describe('absolute behavioural wording seen in a live reading', () => {
  it.each(['Micromanagement will cause her to rebel.', 'She acts often irreversibly.', 'She demands absolute autonomy.', 'A massive concentration in Libra.'])('rejects "%s"', (t) => {
    expect(fails(reading({ inWork: t }), 'Fixed-fate')).toBe(true);
  });
});
