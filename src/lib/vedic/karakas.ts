/**
 * Chara Karakas (Jaimini). The seven grahas plus Rahu are ranked by the degrees
 * they have travelled inside their sign. Highest becomes Atmakaraka, and the
 * ranking continues down to Darakaraka, the partner significator.
 *
 * Rahu is counted in reverse (30 minus its degree) because it moves backwards.
 */

import { VedicPlanet } from './nakshatras';
import { VedicChart } from './siderealChart';

export const KARAKA_ORDER = [
  'Atmakaraka', 'Amatyakaraka', 'Bhratrikaraka', 'Matrikaraka',
  'Pitrikaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka',
] as const;

export type KarakaName = typeof KARAKA_ORDER[number];

export const KARAKA_MEANING: Record<KarakaName, string> = {
  Atmakaraka: 'in Jaimini astrology, the planet with the highest relevant degree, traditionally treated as a major recurring developmental theme. Think of it as a subject life keeps asking you to study.',
  Amatyakaraka: 'an important capacity used in work and contribution. One of the tools you use to do something meaningful in the world.',
  Bhratrikaraka: 'siblings, courage and the people beside you',
  Matrikaraka: 'mother, care and how you were held',
  Pitrikaraka: 'father, authority and guidance',
  Putrakaraka: 'children, students and creative output',
  Gnatikaraka: 'obstacles, illness and the friction you grow through',
  Darakaraka: 'one indicator used for close partnership, and for the qualities encountered or developed through important one-to-one relationships.',
};

export interface KarakaAssignment {
  karaka: KarakaName;
  planet: VedicPlanet;
  degree: number;
  sign: string;
  house: number | null;
}

export function computeKarakas(chart: VedicChart): KarakaAssignment[] {
  const eligible: VedicPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];

  const ranked = eligible
    .map(name => {
      const b = chart.byName[name];
      if (!b) return null;
      const effective = name === 'Rahu' ? 30 - b.degree : b.degree;
      return { name, effective, body: b };
    })
    .filter((x): x is { name: VedicPlanet; effective: number; body: NonNullable<ReturnType<() => VedicChart['bodies'][number]>> } => !!x)
    .sort((a, b) => b.effective - a.effective);

  return ranked.slice(0, 8).map((entry, i) => ({
    karaka: KARAKA_ORDER[i],
    planet: entry.name,
    degree: entry.body.degree,
    sign: entry.body.sign,
    house: entry.body.house,
  }));
}

export function findKaraka(list: KarakaAssignment[], karaka: KarakaName): KarakaAssignment | undefined {
  return list.find(k => k.karaka === karaka);
}
