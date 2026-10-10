import { describe, it, expect } from 'vitest';
import { autoFillChartBodies, ephemerisRetrogradeStatus } from '@/lib/chartAutoFill';
import { computeBodies, longitudeToSignPosition } from '@/lib/ephemerisEngine';
import { generateNatalPortrait } from '@/lib/natalPortraitEngine';
import { computeRankedAspects } from '@/lib/aspectRanking';
import { buildElementPsychology } from '@/lib/interpretation/elementBalance';
import type { NatalChart } from '@/hooks/useNatalChart';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function karina(): NatalChart {
  const utc = new Date(Date.UTC(1993, 10, 7, 14, 30));
  const keys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
  const r = computeBodies(utc, [...keys]);
  const planets: Record<string, unknown> = {};
  for (const k of keys) {
    const x = r[k];
    if (x.ok !== true) continue;
    const sp = longitudeToSignPosition(x.longitude);
    // Imported rows omit the retrograde marker on purpose.
    planets[k] = { sign: sp.sign, degree: sp.degree, minutes: sp.minutes, seconds: 0, isRetrograde: false };
  }
  const asc = 9 * 30 + 24 + 5 / 60;
  const houseCusps: Record<string, unknown> = {};
  for (let i = 0; i < 12; i++) {
    const lon = (asc + i * 30) % 360;
    houseCusps[`house${i + 1}`] = { sign: SIGNS[Math.floor(lon / 30)], degree: Math.floor(lon % 30), minutes: 5 };
  }
  return {
    id: 'karina', name: 'Karina Client', birthDate: '1993-11-07', birthTime: '11:30', birthLocation: 'La Serena, Chile',
    planets, houseCusps,
  } as unknown as NatalChart;
}

describe('Karina natal corrections', () => {
  it('derives Mercury retrograde from the ephemeris and never Sun/Moon', () => {
    const status = ephemerisRetrogradeStatus(karina());
    expect(status.Mercury).toBe(true);
    expect(status.Sun).toBeUndefined();
    const filled = autoFillChartBodies(karina());
    expect(filled.planets.Mercury?.isRetrograde).toBe(true);
    expect(filled.planets.Sun?.isRetrograde).toBeFalsy();
    expect(filled.planets.Moon?.isRetrograde).toBeFalsy();
  });

  it('labels and down-weights wide aspects by orb', () => {
    const ranked = computeRankedAspects(autoFillChartBodies(karina()));
    for (const a of ranked) expect(a.isWide).toBe(a.orb >= 7 || a.orb / a.maxOrb >= 0.75);
    const wide = ranked.filter(a => a.isWide);
    expect(wide.length).toBeGreaterThan(0);
  });

  it('removes deterministic and template copy', () => {
    const p = generateNatalPortrait(autoFillChartBodies(karina()));
    const text = JSON.stringify(p);
    for (const banned of ['receives ALL', 'must DO something', 'constant pressure', 'never fully goes away', 'learned skill, not natural talent', '6th house overload', 'runs the show', 'engine of your entire chart', 'wants to watches', 'The low count is modified']) {
      expect(text).not.toContain(banned);
    }
    expect(p.dominantPlanets.methodologyNote).toMatch(/this app's own scoring system/);
    expect(p.dominantPlanets.interpretation).toMatch(/^Using this app's dominance scoring system/);
    if (p.lifetimeWisdom.saturnHouse === 2) expect(p.lifetimeWisdom.saturnLesson).toMatch(/security and self-worth/);
  });

  it('writes concise element psychology with the sharper modality imbalance', () => {
    const text = buildElementPsychology({ Fire: 1, Earth: 2, Air: 3, Water: 4 }, { Cardinal: 4, Fixed: 6, Mutable: 0 }, [
      { body: 'Sun', sign: 'Scorpio', house: 10 }, { body: 'Jupiter', sign: 'Libra', house: 9 }, { body: 'Ascendant', sign: 'Capricorn', house: 1 },
    ] as never);
    expect(text).toContain('Water is the strongest element (4 of 10) but not overwhelmingly dominant');
    expect(text).toContain('Fixed 6, Mutable 0');
    expect(text).toMatch(/Scorpio adds depth/);
    expect(text).toMatch(/does not mean the quality is missing/);
  });
});
