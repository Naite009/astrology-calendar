/**
 * Pattern tiering: keeps the geometry intact while making sure minor bodies and
 * automatic (derived) geometry never carry the psychological weight of a
 * major-planet configuration.
 */

import {
  isMajorPlanet,
  containsAutomaticNodalOpposition,
  isDerivedPoint,
  isNodalPoint,
  splitBodies,
} from './bodyTaxonomy';

export type PatternTier = 'major' | 'nodal-axis' | 'secondary';

export interface PatternClassification {
  tier: PatternTier;
  /** Short label to show next to the pattern name. */
  tierLabel: string;
  /** Higher sorts first. */
  rankWeight: number;
  /** One-line, non-deterministic note about how much weight to give this. */
  weightNote: string;
  /** True when the backbone of the pattern is automatic/derived geometry. */
  usesDerivedGeometry: boolean;
}

export function classifyPatternBodies(bodies: string[]): PatternClassification {
  const names = bodies.filter(Boolean);
  const { major, additional } = splitBodies(names);
  const automaticNodes = containsAutomaticNodalOpposition(names);
  const derived = names.some(isDerivedPoint);

  if (automaticNodes) {
    return {
      tier: 'nodal-axis',
      tierLabel: 'Nodal-axis configuration',
      rankWeight: 10,
      weightNote:
        'The North Node and South Node are always exactly opposite each other, so that opposition is a given rather than evidence of a special configuration. Read this as a nodal-axis theme and give it less weight than a major-planet pattern.',
      usesDerivedGeometry: true,
    };
  }

  if (additional.length === 0) {
    return {
      tier: 'major',
      tierLabel: 'Major pattern',
      rankWeight: 100 + major.length,
      weightNote: 'Built entirely from major planets, so it is one of the load-bearing structures in the chart.',
      usesDerivedGeometry: false,
    };
  }

  const hasNode = names.some(isNodalPoint);
  return {
    tier: 'secondary',
    tierLabel: 'Secondary pattern',
    rankWeight: (derived ? 20 : 30) + major.length,
    weightNote: `Geometrically valid, but it depends on ${additional.join(', ')}${
      hasNode ? ' (a node)' : ''
    }. Treat it as supporting colour rather than a defining pattern.`,
    usesDerivedGeometry: derived,
  };
}

/** Sort any list of patterns so major-planet patterns come first. */
export function rankPatterns<T extends { planets: string[] }>(patterns: T[]): T[] {
  return [...patterns].sort(
    (a, b) => classifyPatternBodies(b.planets).rankWeight - classifyPatternBodies(a.planets).rankWeight,
  );
}

/**
 * A pattern qualifies as a MAJOR chart pattern only when every leg is a major planet.
 * Everything else is retained but labeled.
 */
export function isMajorPattern(bodies: string[]): boolean {
  return bodies.length > 0 && bodies.every(isMajorPlanet);
}
