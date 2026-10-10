import { describe, it, expect } from 'vitest';
import { computeMajorTransits, findExactHits, realExactPasses } from '@/lib/transits/majorTransits';
import { calculateTransitAspects, getNatalAngleTargets } from '@/lib/transitAspects';
import { getPlanetLongitudeExact } from '@/lib/transitMath';
import * as Astronomy from 'astronomy-engine';
import type { NatalChart } from '@/hooks/useNatalChart';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const pos = (lon: number) => ({ sign: SIGNS[Math.floor(lon / 30)], degree: Math.floor(lon % 30), minutes: Math.round(((lon % 30) % 1) * 60) % 60, seconds: 0, isRetrograde: false });

/** Chart whose IC sits exactly where Saturn will be on `date`. */
function chartWithIcAt(icLon: number): NatalChart {
  const asc = (icLon + 90) % 360; // quadrant-ish layout: IC = house4
  const cusps: Record<string, unknown> = {};
  for (let i = 0; i < 12; i++) {
    // equal houses from ASC going counter-clockwise; house4 = ASC + 90
    cusps[`house${i + 1}`] = pos((asc - 90 + 90 * 0 + i * 30 + 270) % 360);
  }
  cusps.house1 = pos(asc);
  cusps.house4 = pos(icLon);
  cusps.house7 = pos((asc + 180) % 360);
  cusps.house10 = pos((icLon + 180) % 360);
  return {
    id: 't', name: 'Test', birthDate: '1990-01-01', birthTime: '12:00', birthLocation: 'X',
    planets: { Sun: pos(10), Moon: pos(200) },
    houseCusps: cusps,
  } as unknown as NatalChart;
}

describe('chart angles as transit targets', () => {
  it('derives ASC/IC/DSC/MC from house cusps 1/4/7/10', () => {
    const c = chartWithIcAt(100);
    const names = getNatalAngleTargets(c).map(a => `${a.name}:${a.sign}`);
    expect(names).toContain('IC:Cancer');
    expect(names).toContain('Midheaven:Capricorn');
    expect(names).toContain('Ascendant:Libra');
    expect(names).toContain('Descendant:Aries');
  });

  it('calculateTransitAspects surfaces outer-planet hits to IC and MC', () => {
    const date = new Date(Date.UTC(2026, 4, 1));
    const sat = getPlanetLongitudeExact(Astronomy.Body.Saturn, date);
    const c = chartWithIcAt(sat);
    const sp = { signName: SIGNS[Math.floor(sat / 30)], degree: sat % 30 };
    const aspects = calculateTransitAspects(date, { saturn: sp } as never, c);
    expect(aspects.some(a => a.transitPlanet === 'Saturn' && a.natalPlanet === 'IC' && a.aspect === 'conjunction')).toBe(true);
    expect(aspects.some(a => a.transitPlanet === 'Saturn' && a.natalPlanet === 'Midheaven' && a.aspect === 'opposition')).toBe(true);
    expect(aspects.find(a => a.natalPlanet === 'IC')?.natalHouse).toBe(4);
  });
});

describe('major transits dashboard engine', () => {
  it('finds real exact passes without inventing three', () => {
    const now = new Date(Date.UTC(2026, 0, 1));
    const sat = getPlanetLongitudeExact(Astronomy.Body.Saturn, new Date(Date.UTC(2026, 5, 1)));
    const passes = realExactPasses('Saturn', sat, 0, now, 500);
    expect(passes.length).toBeGreaterThanOrEqual(1);
    for (const p of passes) {
      expect(Math.abs(((getPlanetLongitudeExact(Astronomy.Body.Saturn, p.date) - sat + 540) % 360) - 180)).toBeLessThan(0.01);
    }
  });

  it('reports Saturn conjunct IC with axis note and non-deterministic copy', () => {
    const now = new Date(Date.UTC(2026, 2, 1));
    const sat = getPlanetLongitudeExact(Astronomy.Body.Saturn, new Date(Date.UTC(2026, 4, 1)));
    const list = computeMajorTransits(chartWithIcAt(sat), { now });
    const t = list.find(x => x.id === 'Saturn-conjunction-IC');
    expect(t).toBeTruthy();
    expect(t!.headline).toBe('♄ Saturn ☌ IC');
    expect(t!.nextExact).not.toBeNull();
    expect(t!.axisNote).toMatch(/opposite the MC/);
    expect(t!.meaning).toMatch(/not a punishment/);
    expect(JSON.stringify(t)).not.toMatch(/death|lose your home|collapse/i);
    // Ranking: angle conjunction ranks above trines/sextiles
    expect(list.indexOf(t!)).toBeLessThan(list.findIndex(x => x.aspect === 'sextile') === -1 ? Infinity : list.findIndex(x => x.aspect === 'sextile'));
  });

  it('labels multiple passes by real motion direction', () => {
    const lonAt = (ms: number) => getPlanetLongitudeExact(Astronomy.Body.Jupiter, new Date(ms));
    const start = Date.UTC(2025, 0, 1);
    const hits = findExactHits('Jupiter', lonAt(Date.UTC(2025, 10, 11)) , start, start + 600 * 86400000, lonAt);
    for (const h of hits) expect(['Direct', 'Retrograde']).toContain(h.motion);
  });
});
