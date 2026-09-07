/**
 * Canonical body taxonomy for every interpretation surface.
 *
 * One rule, used everywhere:
 *  - MAJOR PLANETS  = the ten classical/modern planets. These carry psychological weight,
 *                     define stelliums, house counts, patterns, and top themes.
 *  - ADDITIONAL BODIES/POINTS = Chiron, nodes, asteroids, TNOs, Lilith, Part of Fortune,
 *                     Vertex, angles. They may colour a reading but never create a
 *                     stellium, never inflate a "planet count", and are always labeled.
 */

export const MAJOR_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

export type MajorPlanet = typeof MAJOR_PLANETS[number];

const MAJOR_SET = new Set<string>(MAJOR_PLANETS);

/** Angles are structural, not bodies. Treated as additional points for counting. */
export const CHART_ANGLES = ['Ascendant', 'Descendant', 'MC', 'IC', 'DC'] as const;

/** Derived points whose geometry is automatic (never independent pattern evidence). */
export const DERIVED_POINTS = ['SouthNode', 'Descendant', 'IC', 'DC', 'PartOfFortune', 'Vertex'] as const;

const DERIVED_SET = new Set<string>(DERIVED_POINTS);

export type BodyClass = 'major' | 'additional';

export function isMajorPlanet(name: string): boolean {
  return MAJOR_SET.has(name);
}

export function classifyBody(name: string): BodyClass {
  return MAJOR_SET.has(name) ? 'major' : 'additional';
}

export function isDerivedPoint(name: string): boolean {
  return DERIVED_SET.has(name);
}

export function isNodalPoint(name: string): boolean {
  return name === 'NorthNode' || name === 'SouthNode';
}

/** True when the set contains BOTH nodes, i.e. an automatic 180° opposition. */
export function containsAutomaticNodalOpposition(names: string[]): boolean {
  return names.includes('NorthNode') && names.includes('SouthNode');
}

export function splitBodies(names: string[]): { major: string[]; additional: string[] } {
  return {
    major: names.filter(isMajorPlanet),
    additional: names.filter((n) => !isMajorPlanet(n)),
  };
}

/** The app-wide stellium rule: three or more MAJOR planets in the same house/sign. */
export const STELLIUM_MIN_MAJOR_PLANETS = 3;

export function isStellium(names: string[]): boolean {
  return names.filter(isMajorPlanet).length >= STELLIUM_MIN_MAJOR_PLANETS;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * A single, non-contradictory way to describe how many bodies sit somewhere.
 * e.g. ["Mercury","Venus","Mars","Jupiter","Eris"] -> "4 major planets + Eris"
 */
export function describeBodyCount(names: string[]): string {
  const { major, additional } = splitBodies(names);
  if (major.length === 0 && additional.length === 0) return 'no planets';
  const parts: string[] = [];
  if (major.length) parts.push(plural(major.length, 'major planet'));
  if (additional.length) {
    parts.push(major.length ? additional.join(', ') : `${plural(additional.length, 'additional body')} (${additional.join(', ')})`);
  }
  return parts.join(' + ');
}
