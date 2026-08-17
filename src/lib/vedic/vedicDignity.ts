/**
 * Vedic (Jyotish) essential dignity. Kept deliberately separate from the
 * Western dignity tables so the two systems never bleed into each other.
 *
 * Only the nine Jyotish grahas are graded. Uranus, Neptune and Pluto are not
 * part of this system and are never labelled here.
 */

import { VedicPlanet } from './nakshatras';

export type VedicDignity = 'exalted' | 'debilitated' | 'own sign' | 'moolatrikona' | 'neutral';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export const SIGN_LORDS: Record<string, VedicPlanet> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const EXALTED: Partial<Record<VedicPlanet, string>> = {
  Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn', Mercury: 'Virgo',
  Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra', Rahu: 'Taurus', Ketu: 'Scorpio',
};

const DEBILITATED: Partial<Record<VedicPlanet, string>> = {
  Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer', Mercury: 'Pisces',
  Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries', Rahu: 'Scorpio', Ketu: 'Taurus',
};

const OWN_SIGNS: Partial<Record<VedicPlanet, string[]>> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'], Jupiter: ['Sagittarius', 'Pisces'],
  Venus: ['Taurus', 'Libra'], Saturn: ['Capricorn', 'Aquarius'],
};

export function vedicDignity(planet: VedicPlanet, sign: string): VedicDignity {
  if (EXALTED[planet] === sign) return 'exalted';
  if (DEBILITATED[planet] === sign) return 'debilitated';
  if ((OWN_SIGNS[planet] || []).includes(sign)) return 'own sign';
  return 'neutral';
}

/** Short plain-language gloss for the chart-logic box. */
export function dignityGloss(dignity: VedicDignity): string {
  switch (dignity) {
    case 'exalted': return 'works at full strength here';
    case 'own sign': return 'is on home ground here';
    case 'debilitated': return 'works uphill here and matures late';
    case 'moolatrikona': return 'has strong footing here';
    default: return 'is neither strengthened nor weakened by sign';
  }
}

export const VEDIC_SIGNS = SIGNS;

export function signIndex(sign: string): number {
  return SIGNS.indexOf(sign);
}

export function signFromIndex(i: number): string {
  return SIGNS[((i % 12) + 12) % 12];
}

/** Whole-sign house of a planet, counted from the lagna (rising) sign. */
export function wholeSignHouse(planetSign: string, lagnaSign: string): number | null {
  const p = signIndex(planetSign);
  const l = signIndex(lagnaSign);
  if (p === -1 || l === -1) return null;
  return ((p - l + 12) % 12) + 1;
}
