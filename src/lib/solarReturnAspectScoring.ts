/**
 * Aspect Importance Scoring
 * 
 * Assigns importance (1-10), category (major|moderate|background),
 * and isActivationTrigger to every SR-to-natal aspect.
 */

export interface ScoredAspect {
  srPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  importance: number;         // 1-10
  category: 'major' | 'moderate' | 'background';
  isActivationTrigger: boolean;
  interpretation?: string;
}

// Planets ranked by significance in SR context
const PLANET_WEIGHT: Record<string, number> = {
  Sun: 10, Moon: 9, Ascendant: 10, MC: 9,
  Saturn: 8, Pluto: 8, Jupiter: 7, Mars: 7, Venus: 6, Mercury: 5,
  Uranus: 7, Neptune: 6, NorthNode: 6, Chiron: 5,
  SouthNode: 4, Juno: 3, Ceres: 3, Pallas: 2, Vesta: 2, Lilith: 2, Eris: 1,
};

// Aspect type weight
const ASPECT_WEIGHT: Record<string, number> = {
  Conjunction: 10,
  Opposition: 8,
  Square: 8,
  Trine: 6,
  Sextile: 5,
  Quincunx: 4,
  'Semi-Square': 3,
  Sesquiquadrate: 3,
  'Semi-Sextile': 2,
  Quintile: 2,
  'Bi-Quintile': 2,
};

// Angular targets get a boost
const ANGULAR_TARGETS = ['Ascendant', 'MC', 'Descendant', 'IC'];

// Planets that trigger events when transited
const ACTIVATION_TRIGGER_PLANETS = ['Sun', 'Moon', 'Mars', 'Saturn', 'Jupiter', 'Pluto', 'Uranus'];

export function scoreAspects(
  aspects: Array<{
    planet1?: string;
    srPlanet?: string;
    planet2?: string;
    natalPlanet?: string;
    type?: string;
    aspect?: string;
    aspectType?: string;
    orb?: number;
    interpretation?: string;
  }>,
): ScoredAspect[] {
  return aspects.map(a => {
    const srPlanet = a.planet1 || a.srPlanet || '';
    const natalPlanet = a.planet2 || a.natalPlanet || '';
    const aspectType = a.type || a.aspect || a.aspectType || '';
    const orb = a.orb ?? 5;

    // Base score from planet weights
    const srWeight = PLANET_WEIGHT[srPlanet] || 2;
    const natalWeight = PLANET_WEIGHT[natalPlanet] || 2;
    const aspectWeight = ASPECT_WEIGHT[aspectType] || 3;

    // Orb modifier: tighter = more important
    const orbMod = orb <= 0.5 ? 2 : orb <= 1 ? 1.5 : orb <= 2 ? 1 : orb <= 3 ? 0.7 : 0.4;

    // Angular target bonus
    const angularBonus = ANGULAR_TARGETS.includes(natalPlanet) || ANGULAR_TARGETS.includes(srPlanet) ? 1.5 : 0;

    // Raw score (normalize to 1-10)
    const raw = ((srWeight + natalWeight) / 2 * (aspectWeight / 10) * orbMod) + angularBonus;
    const importance = Math.max(1, Math.min(10, Math.round(raw)));

    // Category
    const category: 'major' | 'moderate' | 'background' =
      importance >= 7 ? 'major' : importance >= 4 ? 'moderate' : 'background';

    // Is activation trigger — conjunctions/oppositions to angles or luminaries by outer planets
    const isActivationTrigger =
      ACTIVATION_TRIGGER_PLANETS.includes(srPlanet) &&
      (ANGULAR_TARGETS.includes(natalPlanet) || ['Sun', 'Moon'].includes(natalPlanet)) &&
      ['Conjunction', 'Opposition', 'Square'].includes(aspectType) &&
      orb <= 3;

    return {
      srPlanet,
      natalPlanet,
      aspect: aspectType,
      orb,
      importance,
      category,
      isActivationTrigger,
      interpretation: a.interpretation,
    };
  }).sort((a, b) => b.importance - a.importance);
}
