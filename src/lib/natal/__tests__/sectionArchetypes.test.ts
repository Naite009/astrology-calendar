import { describe, it, expect } from 'vitest';
import { buildSectionArchetypes } from '../sectionArchetypes';
import { generateNatalPortrait } from '@/lib/natalPortraitEngine';
import type { NatalChart } from '@/hooks/useNatalChart';

const chart = {
  id: 'test-1',
  name: 'Archetype Test',
  birthDate: '1980-11-05',
  birthTime: '14:30',
  birthLocation: 'Boston, MA (US)',
  planets: {
    Sun: { sign: 'Scorpio', degree: 13, minutes: 12 },
    Moon: { sign: 'Leo', degree: 4, minutes: 40 },
    Mercury: { sign: 'Scorpio', degree: 2, minutes: 10 },
    Venus: { sign: 'Sagittarius', degree: 20, minutes: 5 },
    Mars: { sign: 'Capricorn', degree: 8, minutes: 30 },
    Jupiter: { sign: 'Virgo', degree: 11, minutes: 0 },
    Saturn: { sign: 'Virgo', degree: 24, minutes: 15 },
    Uranus: { sign: 'Scorpio', degree: 26, minutes: 0 },
    Neptune: { sign: 'Sagittarius', degree: 22, minutes: 0 },
    Pluto: { sign: 'Libra', degree: 21, minutes: 0 },
    Chiron: { sign: 'Taurus', degree: 3, minutes: 0 },
    NorthNode: { sign: 'Leo', degree: 14, minutes: 0 },
    Ascendant: { sign: 'Aquarius', degree: 18, minutes: 38 },
  },
  houseCusps: {
    house1: { sign: 'Aquarius', degree: 18, minutes: 38 },
  },
} as unknown as NatalChart;

describe('natal portrait section archetypes', () => {
  const portrait = generateNatalPortrait(chart);
  const archetypes = buildSectionArchetypes(portrait, chart);

  it('combines the Big Three into a one-or-two-word label', () => {
    expect(archetypes.lifePurpose.label).toBe('Magnetic Leader');
    expect(archetypes.lifePurpose.why).toContain('Sun in Scorpio');
    expect(archetypes.lifePurpose.why).toContain('Moon in Leo');
  });

  it('labels every major section', () => {
    for (const key of [
      'lifePurpose', 'topThemes', 'soulAgreements', 'relationship', 'career',
      'emotional', 'health', 'shadow', 'spiritual', 'houseEmphasis',
      'powerPortrait', 'dominantPlanets', 'patterns', 'lifetimeWisdom',
    ]) {
      expect(archetypes[key], `missing archetype for ${key}`).toBeTruthy();
      expect(archetypes[key].label.trim().split(/\s+/).length).toBeLessThanOrEqual(2);
      expect(archetypes[key].why.length).toBeGreaterThan(5);
    }
  });

  it('always names the placement behind the label', () => {
    expect(archetypes.powerPortrait.why).toContain('Mars in Capricorn');
    expect(archetypes.lifetimeWisdom.why).toContain('Saturn in Virgo');
    expect(archetypes.soulAgreements.why).toContain('North Node in Leo');
  });

  it('stays out of deterministic or clinical wording', () => {
    const all = Object.values(archetypes).map(a => `${a.label} ${a.why}`).join(' ').toLowerCase();
    for (const banned of ['always', 'never', 'destined', 'trauma', 'disorder', 'toxic', 'guaranteed']) {
      expect(all).not.toContain(banned);
    }
  });

  it('degrades gracefully when the chart is thin', () => {
    const thin = { ...chart, planets: { Sun: { sign: 'Scorpio', degree: 1, minutes: 0 }, Moon: { sign: 'Leo', degree: 1, minutes: 0 } } } as unknown as NatalChart;
    const thinPortrait = generateNatalPortrait(thin);
    const thinArchetypes = buildSectionArchetypes(thinPortrait, thin);
    expect(thinArchetypes.lifePurpose.label).toBe('Magnetic Leader');
    expect(thinArchetypes.patterns.label).toBe('Open Weave');
  });
});
