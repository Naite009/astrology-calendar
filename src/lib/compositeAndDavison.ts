import { NatalChart } from '@/hooks/useNatalChart';

export interface CompositeChart extends NatalChart {
  chartType: 'composite';
  person1Name?: string;
  person2Name?: string;
}

export interface DavisonChart extends NatalChart {
  chartType: 'davison';
  person1Name?: string;
  person2Name?: string;
  relationshipBirthDate: Date;
  relationshipBirthLocation: string;
}

export interface ChartComparisonGuide {
  whenToUse: { synastry: string; composite: string; davison: string; };
  whatTheyReveal: { synastry: string; composite: string; davison: string; };
  bestFor: { synastry: string[]; composite: string[]; davison: string[]; };
}

export const CHART_COMPARISON_GUIDE: ChartComparisonGuide = {
  whenToUse: {
    synastry: "Use synastry to understand HOW two people interact daily.",
    composite: "Use composite to understand WHAT the relationship creates.",
    davison: "Use Davison to understand the SOUL/DESTINY of the relationship."
  },
  whatTheyReveal: {
    synastry: "Person-to-person dynamics: attraction, conflicts, chemistry.",
    composite: "The relationship as its own entity: shared values, purpose.",
    davison: "The relationship's fate and spiritual purpose."
  },
  bestFor: {
    synastry: ["Initial compatibility", "Understanding conflicts", "Day-to-day dynamics"],
    composite: ["Long-term planning", "Business partnerships", "Marriage decisions"],
    davison: ["Spiritual analysis", "Soul-contract analysis", "Twin flame connections"]
  }
};

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function calculateMidpoint(planet1: any, planet2: any): any {
  if (!planet1 || !planet2) return null;
  const signIndex1 = typeof planet1.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet1.sign) : planet1.sign;
  const signIndex2 = typeof planet2.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet2.sign) : planet2.sign;
  if (signIndex1 === -1 || signIndex2 === -1) return null;
  const pos1 = signIndex1 * 30 + planet1.degree + (planet1.minutes / 60) + ((planet1.seconds || 0) / 3600);
  const pos2 = signIndex2 * 30 + planet2.degree + (planet2.minutes / 60) + ((planet2.seconds || 0) / 3600);
  let midpoint1 = (pos1 + pos2) / 2;
  let midpoint2 = midpoint1 + 180;
  if (midpoint2 >= 360) midpoint2 -= 360;
  const diff1 = Math.min(Math.abs(pos1 - midpoint1), 360 - Math.abs(pos1 - midpoint1));
  const diff2 = Math.min(Math.abs(pos1 - midpoint2), 360 - Math.abs(pos1 - midpoint2));
  let finalMidpoint = diff1 <= diff2 ? midpoint1 : midpoint2;
  const signIndex = Math.floor(finalMidpoint / 30);
  const remainder = finalMidpoint - (signIndex * 30);
  const degree = Math.floor(remainder);
  const minutesDecimal = (remainder - degree) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  return { sign: ZODIAC_SIGNS[signIndex], degree, minutes, seconds, isRetrograde: planet1.isRetrograde && planet2.isRetrograde };
}

export function calculateCompositeChart(chart1: NatalChart, chart2: NatalChart, person1Name?: string, person2Name?: string): CompositeChart {
  const compositePlanets: any = {};
  Object.keys(chart1.planets).forEach(planetName => {
    const planet1 = chart1.planets[planetName];
    const planet2 = chart2.planets[planetName];
    if (planet1 && planet2) compositePlanets[planetName] = calculateMidpoint(planet1, planet2);
  });
  const compositeHouseCusps: any = {};
  if (chart1.houseCusps && chart2.houseCusps) {
    for (let i = 1; i <= 12; i++) {
      const cusp1 = chart1.houseCusps[i];
      const cusp2 = chart2.houseCusps[i];
      if (cusp1 && cusp2) compositeHouseCusps[i] = calculateMidpoint(cusp1, cusp2);
    }
  }
  return { chartType: 'composite', planets: compositePlanets, houseCusps: compositeHouseCusps, person1Name, person2Name, interceptedSigns: [] };
}

export function calculateDavisonChart(chart1: NatalChart, chart2: NatalChart, birthDate1: Date, birthDate2: Date, birthLat1: number, birthLon1: number, birthLat2: number, birthLon2: number, person1Name?: string, person2Name?: string): DavisonChart {
  const midpointTime = new Date((birthDate1.getTime() + birthDate2.getTime()) / 2);
  const midpointLat = (birthLat1 + birthLat2) / 2;
  const midpointLon = (birthLon1 + birthLon2) / 2;
  return { chartType: 'davison', relationshipBirthDate: midpointTime, relationshipBirthLocation: `${midpointLat.toFixed(2)}°, ${midpointLon.toFixed(2)}°`, planets: {}, houseCusps: {}, person1Name, person2Name, interceptedSigns: [] };
}

export interface CompositeAnalysis {
  relationshipPurpose: string; coreTheme: string; strengths: string[]; challenges: string[]; publicImage: string; emotionalTone: string; communicationStyle: string; sharedGoals: string; longevityIndicators: string[]; whenToUseThisChart: string;
}

export function analyzeCompositeChart(composite: CompositeChart): CompositeAnalysis {
  const sun = composite.planets.Sun;
  const signIndex = sun && typeof sun.sign === 'string' ? ZODIAC_SIGNS.indexOf(sun.sign) : -1;
  const purposes: Record<number, string> = {
    0: "Birth new identity and leadership together.", 1: "Build something stable and valuable.", 2: "Communicate, learn, and connect.",
    3: "Create emotional security and nurture.", 4: "Create, celebrate, and shine.", 5: "Serve, heal, and improve.",
    6: "Create balance, beauty, and partnership.", 7: "Transform, merge, and empower.", 8: "Explore, expand, and teach.",
    9: "Achieve, build structures, and leave legacy.", 10: "Innovate, liberate, and create community.", 11: "Heal, transcend, and create art/spirituality."
  };
  return {
    relationshipPurpose: purposes[signIndex] || "Unique collective purpose.",
    coreTheme: "Composite chart theme analysis",
    strengths: ["Strong composite Venus - natural harmony"],
    challenges: ["Composite Saturn aspects - distance to overcome"],
    publicImage: "How the relationship appears to others",
    emotionalTone: "Emotional atmosphere of the relationship",
    communicationStyle: "How you communicate as a unit",
    sharedGoals: "What you're building together",
    longevityIndicators: ["Saturn strength indicates commitment"],
    whenToUseThisChart: "Use to understand what you're building together."
  };
}

export interface DavisonAnalysis {
  relationshipDestiny: string; karmicPurpose: string; fatedThemes: string[]; spiritualLessons: string[]; soulContract: string; evolutionaryIntent: string; whenToUseThisChart: string;
}

export function analyzeDavisonChart(davison: DavisonChart): DavisonAnalysis {
  return {
    relationshipDestiny: "The fated path this relationship is meant to walk.",
    karmicPurpose: "The karmic mission that brought you together.",
    fatedThemes: ["Destined experiences you'll share"],
    spiritualLessons: ["Soul lessons the relationship teaches"],
    soulContract: "The spiritual agreement between your souls.",
    evolutionaryIntent: "How this relationship evolves you spiritually.",
    whenToUseThisChart: "Use to understand the spiritual/karmic purpose."
  };
}

export interface RelationshipAnalysisWorkflow {
  step1_synastry: string; step2_karmic: string; step3_composite: string; step4_davison: string; integrationGuidance: string;
}

export const RELATIONSHIP_ANALYSIS_WORKFLOW: RelationshipAnalysisWorkflow = {
  step1_synastry: "START HERE: Run synastry first to see basic compatibility.",
  step2_karmic: "SAFETY CHECK: Run karmic analysis to identify danger flags.",
  step3_composite: "PURPOSE CHECK: Look at composite to see what you can BUILD.",
  step4_davison: "DESTINY CHECK: Check Davison for soul-level intentions.",
  integrationGuidance: "Synastry = HOW you relate, Karmic = WHY you met, Composite = WHAT you're building, Davison = DESTINY."
};

export default { calculateCompositeChart, calculateDavisonChart, analyzeCompositeChart, analyzeDavisonChart, CHART_COMPARISON_GUIDE, RELATIONSHIP_ANALYSIS_WORKFLOW };
