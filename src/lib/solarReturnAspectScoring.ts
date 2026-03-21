/**
 * Aspect Importance Scoring
 * 
 * Assigns importance (1-10), category (major|moderate|background),
 * isActivationTrigger, lifeArea, and peakMonths to every SR-to-natal aspect.
 */

export interface ScoredAspect {
  srPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  importance: number;         // 1-10
  category: 'major' | 'moderate' | 'background';
  isActivationTrigger: boolean;
  lifeArea: 'career' | 'relationship' | 'money' | 'emotional' | 'health' | 'identity' | 'spiritual' | 'mixed';
  peakMonths: string[];
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
  Conjunction: 10, Opposition: 8, Square: 8, Trine: 6, Sextile: 5,
  Quincunx: 4, 'Semi-Square': 3, Sesquiquadrate: 3, 'Semi-Sextile': 2,
  Quintile: 2, 'Bi-Quintile': 2,
};

const ANGULAR_TARGETS = ['Ascendant', 'MC', 'Descendant', 'IC'];
const ACTIVATION_TRIGGER_PLANETS = ['Sun', 'Moon', 'Mars', 'Saturn', 'Jupiter', 'Pluto', 'Uranus'];

// Life area mapping based on planet combinations
const PLANET_LIFE_AREA: Record<string, ScoredAspect['lifeArea']> = {
  Sun: 'identity', Moon: 'emotional', Mercury: 'career', Venus: 'relationship',
  Mars: 'health', Jupiter: 'money', Saturn: 'career', Uranus: 'identity',
  Neptune: 'spiritual', Pluto: 'identity', Chiron: 'health', NorthNode: 'spiritual',
  MC: 'career', Ascendant: 'identity', Juno: 'relationship', Ceres: 'emotional',
  Vesta: 'spiritual', Pallas: 'career', Lilith: 'emotional',
};

// Planet → approximate peak month offset from birthday
const PLANET_PEAK_MONTH: Record<string, number[]> = {
  Sun: [0, 6], Moon: [0, 3, 6, 9], Mercury: [1, 5, 9], Venus: [2, 7],
  Mars: [3, 8], Jupiter: [4, 10], Saturn: [5, 11],
};

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getLifeArea(srPlanet: string, natalPlanet: string): ScoredAspect['lifeArea'] {
  // Specific pair overrides
  if ((srPlanet === 'Venus' || natalPlanet === 'Venus') && (srPlanet === 'Mars' || natalPlanet === 'Mars')) return 'relationship';
  if ((srPlanet === 'Jupiter' || natalPlanet === 'Jupiter') && (srPlanet === 'Saturn' || natalPlanet === 'Saturn')) return 'career';
  if ((srPlanet === 'Moon' || natalPlanet === 'Moon') && (srPlanet === 'Saturn' || natalPlanet === 'Saturn')) return 'emotional';
  if (srPlanet === 'MC' || natalPlanet === 'MC') return 'career';
  if (srPlanet === 'Ascendant' || natalPlanet === 'Ascendant') return 'identity';
  // Use the SR planet's area as primary
  return PLANET_LIFE_AREA[srPlanet] || PLANET_LIFE_AREA[natalPlanet] || 'mixed';
}

function getPeakMonths(srPlanet: string, birthdayMonth: number): string[] {
  const offsets = PLANET_PEAK_MONTH[srPlanet] || [0];
  return offsets.map(offset => MONTHS_FULL[(birthdayMonth + offset) % 12]);
}

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
  birthdayMonth: number = 0,
): ScoredAspect[] {
  return aspects.map(a => {
    const srPlanet = a.planet1 || a.srPlanet || '';
    const natalPlanet = a.planet2 || a.natalPlanet || '';
    const aspectType = a.type || a.aspect || a.aspectType || '';
    const orb = a.orb ?? 5;

    const srWeight = PLANET_WEIGHT[srPlanet] || 2;
    const natalWeight = PLANET_WEIGHT[natalPlanet] || 2;
    const aspectWeight = ASPECT_WEIGHT[aspectType] || 3;
    const orbMod = orb <= 0.5 ? 2 : orb <= 1 ? 1.5 : orb <= 2 ? 1 : orb <= 3 ? 0.7 : 0.4;
    const angularBonus = ANGULAR_TARGETS.includes(natalPlanet) || ANGULAR_TARGETS.includes(srPlanet) ? 1.5 : 0;

    const raw = ((srWeight + natalWeight) / 2 * (aspectWeight / 10) * orbMod) + angularBonus;
    const importance = Math.max(1, Math.min(10, Math.round(raw)));
    const category: ScoredAspect['category'] = importance >= 7 ? 'major' : importance >= 4 ? 'moderate' : 'background';

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
      lifeArea: getLifeArea(srPlanet, natalPlanet),
      peakMonths: getPeakMonths(srPlanet, birthdayMonth),
      interpretation: a.interpretation,
    };
  }).sort((a, b) => b.importance - a.importance);
}

// ── Top Themes Generator ──

export interface TopTheme {
  theme: string;
  area: string;
  description: string;
  importance: number;
  drivers: string[];
}

export function generateTopThemes(scoredAspects: ScoredAspect[]): TopTheme[] {
  // Group major aspects by life area
  const areaGroups: Record<string, ScoredAspect[]> = {};
  for (const asp of scoredAspects.filter(a => a.category !== 'background')) {
    const area = asp.lifeArea;
    if (!areaGroups[area]) areaGroups[area] = [];
    areaGroups[area].push(asp);
  }

  const AREA_LABELS: Record<string, string> = {
    career: 'Career & Professional Growth',
    relationship: 'Love & Relationships',
    money: 'Money & Resources',
    emotional: 'Emotional Life & Inner World',
    health: 'Health & Physical Energy',
    identity: 'Identity & Personal Direction',
    spiritual: 'Spiritual Growth & Purpose',
    mixed: 'Multiple Life Areas',
  };

  const AREA_DESC: Record<string, (drivers: string[]) => string> = {
    career: (d) => `Your professional life is activated by ${d.join(' and ')}. Expect shifts in how you work and what you aim for.`,
    relationship: (d) => `Relationship dynamics intensify through ${d.join(' and ')}. Partnerships demand attention and honesty.`,
    money: (d) => `Financial patterns shift through ${d.join(' and ')}. Your relationship with money and value is evolving.`,
    emotional: (d) => `Your emotional landscape is reshaped by ${d.join(' and ')}. Feelings run deeper and demand processing.`,
    health: (d) => `Physical energy and wellbeing are influenced by ${d.join(' and ')}. Body awareness becomes important.`,
    identity: (d) => `Who you are is transforming through ${d.join(' and ')}. Others will notice the change before you do.`,
    spiritual: (d) => `Spiritual and purpose themes emerge through ${d.join(' and ')}. Trust the inner compass.`,
    mixed: (d) => `Multiple life areas activate simultaneously through ${d.join(' and ')}.`,
  };

  const themes: TopTheme[] = [];
  for (const [area, aspects] of Object.entries(areaGroups)) {
    const totalImportance = aspects.reduce((sum, a) => sum + a.importance, 0);
    const avgImportance = Math.round(totalImportance / aspects.length);
    const drivers = [...new Set(aspects.flatMap(a => [a.srPlanet, a.natalPlanet]))].slice(0, 3);
    const descFn = AREA_DESC[area] || AREA_DESC.mixed;

    themes.push({
      theme: AREA_LABELS[area] || area,
      area,
      description: descFn(drivers),
      importance: avgImportance,
      drivers,
    });
  }

  return themes.sort((a, b) => b.importance - a.importance).slice(0, 5);
}
