/**
 * Centralized planet-specific orb system
 * 
 * Traditional approach: luminaries (Sun/Moon) get wider orbs because they
 * dominate the chart. The Ascendant/MC get slightly wider than average planets.
 * Outer planets get tighter orbs for transits (they move slowly, so exact = stronger).
 *
 * Tiers:
 *   Luminary  (Sun, Moon)        — widest
 *   Angle     (Ascendant, MC, DSC, IC)  — wide
 *   Personal  (Mercury, Venus, Mars)    — standard
 *   Social    (Jupiter, Saturn)         — standard
 *   Outer     (Uranus, Neptune, Pluto)  — slightly tighter for transits
 *   Point     (NorthNode, SouthNode, Chiron, Vertex, etc.) — tight
 */

export type PlanetTier = 'luminary' | 'angle' | 'personal' | 'social' | 'outer' | 'point';

const PLANET_TIERS: Record<string, PlanetTier> = {
  sun: 'luminary',
  moon: 'luminary',
  ascendant: 'angle',
  descendant: 'angle',
  midheaven: 'angle',
  mc: 'angle',
  ic: 'angle',
  mercury: 'personal',
  venus: 'personal',
  mars: 'personal',
  jupiter: 'social',
  saturn: 'social',
  uranus: 'outer',
  neptune: 'outer',
  pluto: 'outer',
  northnode: 'point',
  'north node': 'point',
  southnode: 'point',
  'south node': 'point',
  chiron: 'point',
  vertex: 'point',
  lilith: 'point',
  juno: 'point',
  pallas: 'point',
  vesta: 'point',
  ceres: 'point',
  eros: 'point',
  amor: 'point',
  hygiea: 'point',
};

function getTier(planet: string): PlanetTier {
  return PLANET_TIERS[planet.toLowerCase()] || 'personal';
}

// Tier priority for orb widening (higher = wider orbs)
const TIER_RANK: Record<PlanetTier, number> = {
  luminary: 5,
  angle: 4,
  personal: 3,
  social: 3,
  outer: 2,
  point: 1,
};

/**
 * Base orbs per aspect (for two standard-tier planets).
 * When a luminary/angle is involved, these get widened.
 */
const BASE_ORBS: Record<string, number> = {
  conjunction: 8,
  opposition: 7,
  trine: 7,
  square: 7,
  sextile: 5,
  quincunx: 3,
  semisextile: 2,
  'semi-sextile': 2,
};

/**
 * Get the effective orb for an aspect between two bodies.
 * The orb is determined by the "brighter" (higher-tier) body.
 * 
 * Rules:
 * - If either body is a luminary → widen by +2° (major) or +1° (minor)
 * - If either body is an angle → widen by +1°
 * - If both are points → tighten by -1°
 * - Minor aspects (quincunx, semisextile) max out at 3° even for luminaries
 */
export function getEffectiveOrb(
  planet1: string,
  planet2: string,
  aspectName: string
): number {
  const tier1 = getTier(planet1);
  const tier2 = getTier(planet2);
  const higherTier = TIER_RANK[tier1] >= TIER_RANK[tier2] ? tier1 : tier2;
  
  const base = BASE_ORBS[aspectName.toLowerCase()] ?? 6;
  const isMinor = ['quincunx', 'semisextile', 'semi-sextile'].includes(aspectName.toLowerCase());

  let orb = base;

  if (higherTier === 'luminary') {
    orb += isMinor ? 1 : 2; // Sun/Moon: 10° conjunction, 9° opp/tri/sq, 7° sextile, 4° quincunx
  } else if (higherTier === 'angle') {
    orb += isMinor ? 0 : 1; // ASC/MC: 9° conjunction, 8° opp/tri/sq, 6° sextile
  } else if (higherTier === 'point' && TIER_RANK[tier1] <= 1 && TIER_RANK[tier2] <= 1) {
    orb = Math.max(orb - 2, 1); // Two points together: very tight
  }

  return orb;
}

/**
 * Quick check: is the angular separation within orb for this aspect?
 */
export function isWithinOrb(
  angularSeparation: number,
  aspectAngle: number,
  planet1: string,
  planet2: string,
  aspectName: string
): boolean {
  const diff = Math.abs(angularSeparation - aspectAngle);
  return diff <= getEffectiveOrb(planet1, planet2, aspectName);
}

/**
 * Standard aspect definitions — use these instead of duplicating everywhere.
 * Orb here is the BASE orb; call getEffectiveOrb() for planet-specific widening.
 */
export const STANDARD_ASPECTS = [
  { name: 'conjunction', angle: 0, baseOrb: 8, symbol: '☌', nature: 'fusion' as const },
  { name: 'opposition', angle: 180, baseOrb: 7, symbol: '☍', nature: 'tension' as const },
  { name: 'trine', angle: 120, baseOrb: 7, symbol: '△', nature: 'flow' as const },
  { name: 'square', angle: 90, baseOrb: 7, symbol: '□', nature: 'tension' as const },
  { name: 'sextile', angle: 60, baseOrb: 5, symbol: '⚹', nature: 'opportunity' as const },
  { name: 'quincunx', angle: 150, baseOrb: 3, symbol: '⚻', nature: 'adjustment' as const },
  { name: 'semisextile', angle: 30, baseOrb: 2, symbol: '⚺', nature: 'subtle' as const },
] as const;

/**
 * Major aspects only (no minor).
 */
export const MAJOR_ASPECTS = STANDARD_ASPECTS.filter(
  a => !['quincunx', 'semisextile'].includes(a.name)
);

/**
 * For transit-specific contexts where outer planets should use tighter orbs.
 * This adjusts the base orb down for slow-movers.
 */
export function getTransitOrb(
  transitPlanet: string,
  natalPlanet: string,
  aspectName: string
): number {
  const baseOrb = getEffectiveOrb(transitPlanet, natalPlanet, aspectName);
  const transitTier = getTier(transitPlanet);
  
  // Outer planet transits: tighten slightly since they stay in orb for months
  if (transitTier === 'outer') {
    return Math.max(baseOrb - 2, 2);
  }
  // Social planet transits: tighten by 1
  if (transitTier === 'social') {
    return Math.max(baseOrb - 1, 2);
  }
  return baseOrb;
}
