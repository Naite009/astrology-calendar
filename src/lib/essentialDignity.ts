/**
 * Canonical essential dignity — the single source of truth.
 *
 * Traditional dignity is assigned only to the seven visible planets.
 * Uranus, Neptune and Pluto are NOT assigned domicile, exaltation,
 * detriment or fall. Anything asking for their dignity gets
 * 'NotAssigned', which callers should render as a note or omit entirely.
 */

export type Dignity = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine' | 'NotAssigned';

/** The seven planets traditional dignity applies to. */
export const DIGNITY_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

export const DOMICILE_SIGNS: Record<string, string[]> = {
  Sun: ['Leo'],
  Moon: ['Cancer'],
  Mercury: ['Gemini', 'Virgo'],
  Venus: ['Taurus', 'Libra'],
  Mars: ['Aries', 'Scorpio'],
  Jupiter: ['Sagittarius', 'Pisces'],
  Saturn: ['Capricorn', 'Aquarius'],
};

export const EXALTATION_SIGNS: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};

export const DETRIMENT_SIGNS: Record<string, string[]> = {
  Sun: ['Aquarius'],
  Moon: ['Capricorn'],
  Mercury: ['Sagittarius', 'Pisces'],
  Venus: ['Aries', 'Scorpio'],
  Mars: ['Taurus', 'Libra'],
  Jupiter: ['Gemini', 'Virgo'],
  Saturn: ['Cancer', 'Leo'],
};

export const FALL_SIGNS: Record<string, string> = {
  Sun: 'Libra', Moon: 'Scorpio', Mercury: 'Pisces', Venus: 'Virgo',
  Mars: 'Cancer', Jupiter: 'Capricorn', Saturn: 'Aries',
};

const TRADITIONAL = new Set<string>(DIGNITY_PLANETS as readonly string[]);

/** Traditional rulers only, used for chart rulership questions. */
export const TRADITIONAL_RULER: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

export function isDignityAssigned(planet: string): boolean {
  return TRADITIONAL.has(planet);
}

export function getEssentialDignity(planet: string, sign: string): Dignity {
  if (!TRADITIONAL.has(planet)) return 'NotAssigned';
  if (!sign) return 'Peregrine';
  if (DOMICILE_SIGNS[planet]?.includes(sign)) return 'Domicile';
  if (EXALTATION_SIGNS[planet] === sign) return 'Exaltation';
  if (DETRIMENT_SIGNS[planet]?.includes(sign)) return 'Detriment';
  if (FALL_SIGNS[planet] === sign) return 'Fall';
  return 'Peregrine';
}

/** Short user-facing label. Returns '' when dignity does not apply. */
export function dignityLabel(planet: string, sign: string): string {
  const d = getEssentialDignity(planet, sign);
  if (d === 'NotAssigned') return '';
  if (d === 'Peregrine') return 'no essential dignity (peregrine)';
  return d.toLowerCase();
}

/** Sentence-level note. Safe to print for any planet. */
export function dignityNote(planet: string, sign: string): string {
  const d = getEssentialDignity(planet, sign);
  switch (d) {
    case 'Domicile': return `${planet} in ${sign} is in domicile, its own sign, so it operates at full strength.`;
    case 'Exaltation': return `${planet} in ${sign} is exalted, so it operates with extra authority.`;
    case 'Detriment': return `${planet} in ${sign} is in detriment, so it works in unfamiliar territory and has to try harder.`;
    case 'Fall': return `${planet} in ${sign} is in fall, so it works against its own grain.`;
    case 'Peregrine': return `${planet} in ${sign} has no essential dignity, which is neutral rather than weak.`;
    default: return `${planet} is not assigned traditional essential dignity, so its sign is read for tone rather than strength.`;
  }
}
