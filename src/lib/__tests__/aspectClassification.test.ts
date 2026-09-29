import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { angularSeparation, classifyAspect } from '@/lib/aspects/classifyAspect';
import { MAJOR_ASPECTS, STANDARD_ASPECTS } from '@/lib/aspectOrbs';
import { computeAspects } from '@/lib/chartDecoderLogic';
import { buildReadingGuide, rankConnections, collectCoreBodies } from '@/lib/readingGuide/readingGuideEngine';
import { chartRulerNote, getChartRulers } from '@/lib/interpretation/chartRuler';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const abs = (sign: string, d: number) => SIGNS.indexOf(sign) * 30 + d;
const orb = () => 8;

// Harrison Bates, positions from the Astro.com screenshot the user supplied (fixture, not a DB read).
const P: Record<string, [string, number, number]> = {
  Sun: ['Virgo', 29, 34], Moon: ['Aquarius', 10, 22], Mercury: ['Libra', 18, 50], Venus: ['Scorpio', 6, 25],
  Mars: ['Cancer', 26, 42], Jupiter: ['Leo', 18, 2], Saturn: ['Aries', 12, 13], Uranus: ['Gemini', 5, 38],
  Neptune: ['Aries', 3, 5], Pluto: ['Aquarius', 3, 12], Chiron: ['Aries', 29, 50],
  NorthNode: ['Aquarius', 29, 35], SouthNode: ['Leo', 29, 35], Ascendant: ['Scorpio', 2, 49],
};
const CUSPS: [string, number, number][] = [['Scorpio',2,49],['Sagittarius',1,17],['Capricorn',3,51],['Aquarius',8,50],['Pisces',11,52],['Aries',9,53],['Taurus',2,49],['Gemini',1,17],['Cancer',3,51],['Leo',8,50],['Virgo',11,52],['Libra',9,53]];
const harrison: any = {
  id: 'hb', name: 'Harrison Bates', birthDate: '2026-09-22', birthTime: '09:40', birthLocation: 'Philadelphia',
  planets: Object.fromEntries(Object.entries(P).map(([k, [sign, degree, minutes]]) => [k, { sign, degree, minutes, seconds: 0 }])),
  houseCusps: Object.fromEntries(CUSPS.map(([sign, degree, minutes], i) => [`house${i + 1}`, { sign, degree, minutes }])),
};

describe('aspect type comes from separation only', () => {
  it('29°34 Virgo vs 29°50 Aries is a quincunx, never an opposition', () => {
    const sep = angularSeparation(abs('Virgo', 29 + 34 / 60), abs('Aries', 29 + 50 / 60));
    expect(sep).toBeCloseTo(149.73, 1);
    expect(classifyAspect(sep, STANDARD_ASPECTS, () => 3)?.name).toBe('quincunx');
    expect(classifyAspect(sep, MAJOR_ASPECTS, orb)).toBeNull();
  });

  it.each([
    ['Pisces', 29, 'Aries', 1, 'conjunction'],
    ['Aries', 29, 'Cancer', 1, 'sextile'],
    ['Gemini', 29, 'Libra', 1, 'square'],
    ['Aries', 29, 'Leo', 27, 'trine'],
    ['Aries', 2, 'Virgo', 1, 'quincunx'],
    ['Aries', 29, 'Scorpio', 1, 'opposition'],
    ['Aries', 1, 'Scorpio', 1, 'quincunx'],
    ['Pisces', 29, 'Aries', 29, 'semisextile'],
    ['Virgo', 29, 'Pisces', 29, 'opposition'],
    ['Virgo', 29, 'Aries', 1, 'opposition'],
    ['Pisces', 29.5, 'Aries', 0.5, 'conjunction'],
    ['Sagittarius', 29, 'Taurus', 1, 'trine'],
    ['Aquarius', 29, 'Gemini', 1, 'square'],
  ])('%s %d° vs %s %d° = %s (incl. out-of-sign)', (s1, d1, s2, d2, want) => {
    // both argument orders must agree
    expect(angularSeparation(abs(s2 as string, d2 as number), abs(s1 as string, d1 as number))).toBeCloseTo(angularSeparation(abs(s1 as string, d1 as number), abs(s2 as string, d2 as number)));
    const sep = angularSeparation(abs(s1 as string, d1 as number), abs(s2 as string, d2 as number));
    expect(classifyAspect(sep, STANDARD_ASPECTS, (n) => (n === 'quincunx' ? 3 : 8))?.name).toBe(want);
  });

  it('wraps across 0° Aries', () => {
    expect(angularSeparation(359, 1)).toBeCloseTo(2);
    expect(angularSeparation(1, 359)).toBeCloseTo(2);
  });

  it('Harrison Sun–Chiron is never an opposition on any natal surface', () => {
    const planets = Object.entries(P).map(([name, [sign, d, m]]) => ({ name, sign, degree: d + m / 60 })) as any;
    const sc = computeAspects(planets).find((a) => [a.planet1, a.planet2].sort().join() === 'Chiron,Sun');
    expect(sc?.aspectType).not.toBe('opposition');
    const conns = rankConnections(collectCoreBodies(harrison), 50);
    expect(conns.find((c) => [c.bodyA, c.bodyB].sort().join() === 'Chiron,Sun')).toBeUndefined();
    expect(JSON.stringify(buildReadingGuide(harrison))).not.toMatch(/Sun (opposition|opposite) Chiron|Chiron (opposition|opposite) Sun/);
  });
});

describe('chart ruler standard', () => {
  it('Scorpio rising: Mars traditional, Pluto modern co-ruler, with meaning', () => {
    expect(getChartRulers('Scorpio')).toEqual({ ascSign: 'Scorpio', traditional: 'Mars', modern: 'Pluto' });
    const g = buildReadingGuide(harrison);
    expect(g.chartRuler?.ruler).toBe('Mars');
    expect(g.chartRuler?.modernRuler).toBe('Pluto');
    const note = g.chartRuler!.note;
    expect(note).toMatch(/Mars traditional rulership/);
    expect(note).toMatch(/Pluto as the modern co-ruler/);
    expect(note).toMatch(/Mars in Cancer in the 9th/);
    expect(note).toMatch(/Pluto in Aquarius in the 3rd/);
    expect(note).not.toMatch(/steer|worth noting early|important place to start|good place to/i);
  });
  it('non-modern signs name one ruler', () => {
    expect(chartRulerNote('Leo', { traditional: { sign: 'Aries', house: 9 } })).toMatch(/^Leo rising makes Sun the chart ruler\./);
  });
  it('no filler "where to start" phrases in walkthrough source', () => {
    const src = ['src/lib/readingGuide/readingGuideEngine.ts', 'src/lib/readingGuide/aspectPairLibrary.ts', 'src/components/ReadingGuideView.tsx', 'src/components/NatalPortraitView.tsx', 'src/lib/interpretation/shorthandDescriptor.ts']
      .map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    expect(src).not.toMatch(/steer the reading|steers the whole chart|worth noting early|an important place to start|a good place to (start|steer)/i);
  });
});

describe('canonical engines agree', () => {
  it('computeAspects picks the tightest aspect and keeps out-of-sign opposition', () => {
    const planets = Object.entries(P).map(([name, [sign, d, m]]) => ({ name, sign, degree: d + m / 60, retrograde: false, house: null })) as any;
    const all = computeAspects(planets);
    const find = (a: string, b: string) => all.find((x) => [x.planet1, x.planet2].sort().join() === [a, b].sort().join());
    expect(find('Chiron', 'Ascendant')?.aspectType).toBe('opposition'); // 29°50 Aries vs 2°49 Scorpio ~ 177°
    expect(find('Sun', 'Chiron')?.aspectType === 'opposition').toBe(false);
    for (const a of all) {
      const pa = P[a.planet1], pb = P[a.planet2];
      const sep = angularSeparation(abs(pa[0], pa[1] + pa[2] / 60), abs(pb[0], pb[1] + pb[2] / 60));
      const angle = { conjunction: 0, semisextile: 30, sextile: 60, square: 90, trine: 120, quincunx: 150, opposition: 180 }[a.aspectType as string]!;
      expect(Math.abs(Math.abs(sep - angle) - a.orb)).toBeLessThan(0.02);
    }
  });
  it('Aquarius and Pisces rising teach both rulers', () => {
    expect(getChartRulers('Aquarius')).toMatchObject({ traditional: 'Saturn', modern: 'Uranus' });
    expect(getChartRulers('Pisces')).toMatchObject({ traditional: 'Jupiter', modern: 'Neptune' });
    expect(getChartRulers('Taurus')).toMatchObject({ traditional: 'Venus', modern: null });
  });
});

describe('source copy sweep', () => {
  const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) return /__tests__|qa$|integrations/.test(p) ? [] : walk(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
  const GUARD = /never|avoid|ban|forbid|not as|rather than|instead|regex/i;
  const SKIP = /evidenceStandard|languagePolicy|interpretationStandards|relationshipLanguage|symbolicFraming/;
  it('no fate, obsession, soul-curriculum or steer-the-reading wording in user copy', () => {
    const bad: string[] = [];
    for (const f of walk('src')) {
      if (SKIP.test(f)) continue;
      fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
        if (GUARD.test(l)) return;
        if (/(?<!')\bfated\b(?!Theme|Themes|Area|'|:)|\bobsessive\b|soul curriculum|soul-level|sexual chemistry|steer the reading|work as one unit|you('re| are) meant to be\b/i.test(l)) bad.push(`${f}:${i + 1}`);
      });
    }
    expect(bad).toEqual([]);
  });
});
