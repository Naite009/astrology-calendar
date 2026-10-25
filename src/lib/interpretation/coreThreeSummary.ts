import type { NatalChart } from '@/hooks/useNatalChart';

const ELEMENT: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};
const MODALITY: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};
const ELEMENT_MEANS: Record<string, string> = {
  Fire: 'acts first and learns by doing',
  Earth: 'trusts what is practical, proven, and real',
  Air: 'thinks things through by talking, comparing, and weighing people and ideas',
  Water: 'reads the feeling in a room before the facts',
};
const MODALITY_MEANS: Record<string, string> = {
  Cardinal: 'likes to start things and set the direction',
  Fixed: 'likes to hold steady and see things through',
  Mutable: 'likes to adjust and change course as things change',
};

export interface CoreThreeSummary {
  lines: { label: 'Sun' | 'Moon' | 'Rising'; sign: string; degree: string; element: string; modality: string }[];
  pattern: string; // e.g. "All Libra, all Air, all Cardinal"
  meaning: string;
}

export function buildCoreThreeSummary(chart: NatalChart): CoreThreeSummary | null {
  const sun = chart.planets?.Sun;
  const moon = chart.planets?.Moon;
  const asc = chart.houseCusps?.house1 ?? chart.planets?.Ascendant;
  if (!sun?.sign || !moon?.sign || !asc?.sign) return null;
  const raw = [['Sun', sun], ['Moon', moon], ['Rising', asc]] as const;
  const lines = raw.map(([label, p]) => ({
    label,
    sign: p.sign,
    degree: `${p.degree}°${String(p.minutes ?? 0).padStart(2, '0')}′`,
    element: ELEMENT[p.sign] ?? '?',
    modality: MODALITY[p.sign] ?? '?',
  }));
  const signs = new Set(lines.map((l) => l.sign));
  const els = new Set(lines.map((l) => l.element));
  const mods = new Set(lines.map((l) => l.modality));
  const part = (set: Set<string>, kind: string) =>
    set.size === 1 ? `all ${[...set][0]}` : set.size === 2 ? `two ${kind} share ${majority(lines.map((l) => kind === 'signs' ? l.sign : kind === 'elements' ? l.element : l.modality))}` : `three different ${kind}`;
  const pattern = cap([part(signs, 'signs'), part(els, 'elements'), part(mods, 'modalities')].join(', '));

  const el = els.size === 1 ? [...els][0] : majority(lines.map((l) => l.element));
  const mod = mods.size === 1 ? [...mods][0] : majority(lines.map((l) => l.modality));
  let meaning: string;
  if (signs.size === 1) {
    meaning = `This is a triple ${[...signs][0]} signature: identity, emotional needs and first impressions share a sign style. That does not make private feelings and visible behavior identical: their houses, rulers and aspects may pull in different directions. The shared ${el} emphasis suggests this person ${ELEMENT_MEANS[el]}; the shared ${mod} emphasis suggests this person ${MODALITY_MEANS[mod]}. The evidence below shows what reinforces or complicates that baseline.`;
  } else if (els.size === 1) {
    meaning = `Different signs, but all ${el}: this person ${ELEMENT_MEANS[el]}, in three different flavors. The core is consistent even when the surface looks varied.`;
  } else {
    meaning = `The Sun, Moon and Rising use different elements, so what this person shows, what they need, and what drives them can look like three different people. That mix is the key to reading them: ask which one is "driving" in a given situation.`;
  }
  return { lines, pattern, meaning };
}

function majority(vals: string[]): string {
  const c: Record<string, number> = {};
  vals.forEach((v) => (c[v] = (c[v] ?? 0) + 1));
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
