// Phase Aspects Library - 16-Phase Aspect System with Waxing/Waning Analysis
// Based on angular separation from a focus planet

export interface PhaseAspectInfo {
  name: string;
  baseAngle: number;
  orb: number;
  phase: 'waxing' | 'waning';
  zone: 'inner' | 'outer';
  quadrant: 'Plan' | 'Embody' | 'Experience' | 'Know';
  keywords: string;
}

export interface PlanetPhaseResult {
  planet: string;
  symbol: string;
  separationDegrees: number;
  phaseAspect: PhaseAspectInfo;
  tags: string[];
  interpretation: string;
}

export interface PhaseWheelData {
  focusPlanet: string;
  focusSymbol: string;
  planets: PlanetPhaseResult[];
  waxingPlanets: PlanetPhaseResult[];
  waningPlanets: PlanetPhaseResult[];
  innerPlanets: PlanetPhaseResult[];
  outerPlanets: PlanetPhaseResult[];
  quadrantCounts: Record<'Plan' | 'Embody' | 'Experience' | 'Know', number>;
  dominantQuadrant: 'Plan' | 'Embody' | 'Experience' | 'Know';
}

// Planet symbols
export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Chiron: '⚷',
  NorthNode: '☊',
  Ascendant: 'AC',
  Midheaven: 'MC',
  Eris: '⯰',
};

// Speed order for determining waxing/waning (faster → slower)
// For two planets: if planet A is faster than B and A is ahead of B, A is waxing relative to B
export const PLANET_SPEED_ORDER: string[] = [
  'Moon',
  'Mercury',
  'Venus',
  'Sun',
  'Mars',
  'Jupiter',
  'Saturn',
  'Chiron',
  'Uranus',
  'Neptune',
  'Pluto',
  'Eris',
  'NorthNode',
];

// 16 Phase Aspects with their base angles
// Arranged counterclockwise from 0° (conjunction)
export const PHASE_ASPECTS: PhaseAspectInfo[] = [
  // WAXING (0-180): Give / Build
  { name: 'Conjunction', baseAngle: 0, orb: 15, phase: 'waxing', zone: 'inner', quadrant: 'Plan', keywords: 'fusion, seed, potential' },
  { name: 'Waxing Semi-Sextile', baseAngle: 30, orb: 15, phase: 'waxing', zone: 'inner', quadrant: 'Plan', keywords: 'adjustment, first steps' },
  { name: 'Waxing Semi-Square', baseAngle: 45, orb: 7.5, phase: 'waxing', zone: 'inner', quadrant: 'Plan', keywords: 'friction, activation' },
  { name: 'Waxing Sextile', baseAngle: 60, orb: 15, phase: 'waxing', zone: 'inner', quadrant: 'Plan', keywords: 'opportunity, skill-building' },
  { name: 'Waxing Square', baseAngle: 90, orb: 15, phase: 'waxing', zone: 'outer', quadrant: 'Embody', keywords: 'crisis of action, commitment' },
  { name: 'Waxing Trine', baseAngle: 120, orb: 15, phase: 'waxing', zone: 'outer', quadrant: 'Embody', keywords: 'flow, creative expression' },
  { name: 'Waxing Sesquiquadrate', baseAngle: 135, orb: 7.5, phase: 'waxing', zone: 'outer', quadrant: 'Embody', keywords: 'agitation, push forward' },
  { name: 'Waxing Quincunx', baseAngle: 150, orb: 15, phase: 'waxing', zone: 'outer', quadrant: 'Embody', keywords: 'adjustment, refinement' },
  
  // WANING (180-360): Take / Integrate
  { name: 'Opposition', baseAngle: 180, orb: 15, phase: 'waning', zone: 'outer', quadrant: 'Experience', keywords: 'awareness, culmination' },
  { name: 'Waning Quincunx', baseAngle: 210, orb: 15, phase: 'waning', zone: 'outer', quadrant: 'Experience', keywords: 'release, surrender' },
  { name: 'Waning Sesquiquadrate', baseAngle: 225, orb: 7.5, phase: 'waning', zone: 'outer', quadrant: 'Experience', keywords: 'tension to release' },
  { name: 'Waning Trine', baseAngle: 240, orb: 15, phase: 'waning', zone: 'outer', quadrant: 'Experience', keywords: 'wisdom, sharing gifts' },
  { name: 'Waning Square', baseAngle: 270, orb: 15, phase: 'waning', zone: 'inner', quadrant: 'Know', keywords: 'crisis of meaning, reorientation' },
  { name: 'Waning Sextile', baseAngle: 300, orb: 15, phase: 'waning', zone: 'inner', quadrant: 'Know', keywords: 'distribution, teaching' },
  { name: 'Waning Semi-Square', baseAngle: 315, orb: 7.5, phase: 'waning', zone: 'inner', quadrant: 'Know', keywords: 'final clearing' },
  { name: 'Waning Semi-Sextile', baseAngle: 330, orb: 15, phase: 'waning', zone: 'inner', quadrant: 'Know', keywords: 'completion, letting go' },
];

// Interpretation templates
const WAXING_TEMPLATES: Record<string, string> = {
  Sun: 'Your identity is in a building phase—you are actively shaping who you become through conscious choice.',
  Moon: 'Emotional patterns here are developing—you are learning new ways to nurture and feel safe.',
  Mercury: 'Communication skills are emerging—ideas want to be built into something tangible.',
  Venus: 'Values and relating styles are forming—attraction and beauty are active pursuits.',
  Mars: 'Drive and initiative are in construction—you are building courage and assertive capacity.',
  Jupiter: 'Faith and expansion are growing—opportunities are being cultivated, not harvested yet.',
  Saturn: 'Structure is being laid—discipline and mastery are works in progress.',
  Uranus: 'Liberation is an active project—freedom is being won through effort.',
  Neptune: 'Ideals are crystallizing—dreams are being shaped into vision.',
  Pluto: 'Transformation is underway—power is being claimed consciously.',
  Chiron: 'Healing is in the building phase—the wound is being understood and integrated.',
  NorthNode: 'Soul growth is active—you are stepping toward unfamiliar territory.',
};

const WANING_TEMPLATES: Record<string, string> = {
  Sun: 'Your identity carries wisdom here—you share presence that was earned, not invented.',
  Moon: 'Emotional intelligence is mature—you understand needs from experience, not theory.',
  Mercury: 'Communication holds depth—words carry meaning shaped by lived understanding.',
  Venus: 'Values are refined—attraction comes from knowing what truly matters.',
  Mars: 'Drive is purposeful—action comes from wisdom, not raw impulse.',
  Jupiter: 'Faith has been tested—expansion is grounded in real experience.',
  Saturn: 'Structure is internalized—discipline is second nature, not struggle.',
  Uranus: 'Freedom is integrated—individuality flows naturally.',
  Neptune: 'Ideals have been refined—spirituality is practical and embodied.',
  Pluto: 'Power is transmuted—transformation has become a gift to share.',
  Chiron: 'Healing becomes teaching—the wound is a source of wisdom for others.',
  NorthNode: 'Soul lessons are being integrated—growth becomes natural expression.',
};

const QUADRANT_MEANINGS = {
  Plan: 'idea/intent—this energy operates in the planning and conceptual phase',
  Embody: 'action/building—this energy is actively being put into form',
  Experience: 'exposure/feedback—this energy is in the world, receiving response',
  Know: 'meaning/closure—this energy is being synthesized and understood',
};

/**
 * Calculate the angular separation between two planets (0-360)
 * Uses counter-clockwise direction from focus planet
 */
export function calculateSeparation(focusDegree: number, otherDegree: number): number {
  let separation = otherDegree - focusDegree;
  if (separation < 0) separation += 360;
  return separation;
}

/**
 * Get the absolute degree of a planet (0-360) from sign + degree
 */
export function getAbsoluteDegree(sign: string, degree: number): number {
  const signOrder = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = signOrder.indexOf(sign);
  if (signIndex === -1) return degree;
  return signIndex * 30 + degree;
}

/**
 * Find which phase aspect a given separation falls into
 */
export function getPhaseAspectForSeparation(separation: number): PhaseAspectInfo {
  // Find the closest aspect by midpoint boundaries
  for (let i = 0; i < PHASE_ASPECTS.length; i++) {
    const current = PHASE_ASPECTS[i];
    const next = PHASE_ASPECTS[(i + 1) % PHASE_ASPECTS.length];
    
    // Calculate the boundary between this aspect and the next
    const currentAngle = current.baseAngle;
    let nextAngle = next.baseAngle;
    if (nextAngle < currentAngle) nextAngle += 360;
    
    const midpoint = (currentAngle + nextAngle) / 2;
    const lowerBound = i === 0 ? 360 - (360 - PHASE_ASPECTS[PHASE_ASPECTS.length - 1].baseAngle + currentAngle) / 2 : currentAngle - (currentAngle - PHASE_ASPECTS[i - 1].baseAngle) / 2;
    
    // Simpler approach: use orb-based matching
    const diff = Math.abs(separation - currentAngle);
    const diffWrapped = Math.min(diff, 360 - diff);
    
    if (diffWrapped <= current.orb) {
      return current;
    }
  }
  
  // Fallback: find closest
  let closest = PHASE_ASPECTS[0];
  let minDiff = 360;
  
  for (const aspect of PHASE_ASPECTS) {
    const diff = Math.abs(separation - aspect.baseAngle);
    const diffWrapped = Math.min(diff, 360 - diff);
    if (diffWrapped < minDiff) {
      minDiff = diffWrapped;
      closest = aspect;
    }
  }
  
  return closest;
}

/**
 * Generate interpretation for a planet in a phase
 */
export function generatePhaseInterpretation(
  planet: string,
  phaseAspect: PhaseAspectInfo,
  focusPlanet: string
): string {
  const template = phaseAspect.phase === 'waxing' 
    ? WAXING_TEMPLATES[planet] 
    : WANING_TEMPLATES[planet];
  
  if (!template) {
    const verb = phaseAspect.phase === 'waxing' ? 'builds toward' : 'integrates with';
    return `${planet} ${verb} ${focusPlanet}—${phaseAspect.keywords}.`;
  }
  
  return template;
}

/**
 * Main function: compute full phase wheel data
 */
export function computePhaseWheelData(
  focusPlanetName: string,
  planets: Array<{ name: string; sign: string; degree: number }>
): PhaseWheelData {
  const focusPlanet = planets.find(p => p.name === focusPlanetName);
  if (!focusPlanet) {
    return {
      focusPlanet: focusPlanetName,
      focusSymbol: PLANET_SYMBOLS[focusPlanetName] || '?',
      planets: [],
      waxingPlanets: [],
      waningPlanets: [],
      innerPlanets: [],
      outerPlanets: [],
      quadrantCounts: { Plan: 0, Embody: 0, Experience: 0, Know: 0 },
      dominantQuadrant: 'Plan',
    };
  }

  const focusDegree = getAbsoluteDegree(focusPlanet.sign, focusPlanet.degree);
  const results: PlanetPhaseResult[] = [];

  for (const planet of planets) {
    if (planet.name === focusPlanetName) continue;
    
    const planetDegree = getAbsoluteDegree(planet.sign, planet.degree);
    const separation = calculateSeparation(focusDegree, planetDegree);
    const phaseAspect = getPhaseAspectForSeparation(separation);
    
    const tags = [
      phaseAspect.phase === 'waxing' ? 'Give' : 'Take',
      phaseAspect.zone === 'inner' ? 'Inner' : 'Outer',
      phaseAspect.quadrant,
    ];
    
    results.push({
      planet: planet.name,
      symbol: PLANET_SYMBOLS[planet.name] || '?',
      separationDegrees: Math.round(separation * 10) / 10,
      phaseAspect,
      tags,
      interpretation: generatePhaseInterpretation(planet.name, phaseAspect, focusPlanetName),
    });
  }

  // Sort by separation
  results.sort((a, b) => a.separationDegrees - b.separationDegrees);

  // Categorize
  const waxingPlanets = results.filter(p => p.phaseAspect.phase === 'waxing');
  const waningPlanets = results.filter(p => p.phaseAspect.phase === 'waning');
  const innerPlanets = results.filter(p => p.phaseAspect.zone === 'inner');
  const outerPlanets = results.filter(p => p.phaseAspect.zone === 'outer');

  // Count quadrants
  const quadrantCounts: Record<'Plan' | 'Embody' | 'Experience' | 'Know', number> = {
    Plan: 0,
    Embody: 0,
    Experience: 0,
    Know: 0,
  };
  
  for (const p of results) {
    quadrantCounts[p.phaseAspect.quadrant]++;
  }

  // Find dominant
  const dominantQuadrant = (Object.entries(quadrantCounts) as [keyof typeof quadrantCounts, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    focusPlanet: focusPlanetName,
    focusSymbol: PLANET_SYMBOLS[focusPlanetName] || '?',
    planets: results,
    waxingPlanets,
    waningPlanets,
    innerPlanets,
    outerPlanets,
    quadrantCounts,
    dominantQuadrant,
  };
}

// Export quadrant meanings for UI
export { QUADRANT_MEANINGS };
