import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Simplified position for composite/davison (doesn't need full NatalPlanetPosition)
export interface CompositePosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds?: number;
  isRetrograde?: boolean;
}

export interface CompositeChart {
  chartType: 'composite';
  person1Name?: string;
  person2Name?: string;
  planets: Record<string, CompositePosition>;
  houseCusps?: Record<number, CompositePosition>;
  interceptedSigns?: string[];
}

export interface DavisonChart {
  chartType: 'davison';
  person1Name?: string;
  person2Name?: string;
  relationshipBirthDate: Date;
  relationshipBirthLocation: string;
  planets: Record<string, CompositePosition>;
  houseCusps?: Record<number, CompositePosition>;
  interceptedSigns?: string[];
}

export interface ChartComparisonGuide {
  whenToUse: {
    synastry: string;
    composite: string;
    davison: string;
  };
  whatTheyReveal: {
    synastry: string;
    composite: string;
    davison: string;
  };
  bestFor: {
    synastry: string[];
    composite: string[];
    davison: string[];
  };
}

export const CHART_COMPARISON_GUIDE: ChartComparisonGuide = {
  whenToUse: {
    synastry: "Use synastry to understand HOW two people interact with each other on a daily basis. Look at synastry first when meeting someone new to see the chemistry, triggers, and dynamics between you.",
    composite: "Use composite to understand WHAT the relationship is here to create or accomplish. Look at composite when you want to know the relationship's purpose, mission, and potential as a unified entity.",
    davison: "Use Davison to understand the SOUL/DESTINY of the relationship. Look at Davison when you want to know what the universe intends for this connection and its fated qualities."
  },
  whatTheyReveal: {
    synastry: "Person-to-person dynamics: attraction, conflicts, communication styles, emotional compatibility, sexual chemistry, and day-to-day interactions. Shows YOUR experience of THEM and vice versa.",
    composite: "The relationship as its own entity: shared values, collective purpose, how you function as a team, what you're building together, public image as a couple, and relationship strengths/challenges.",
    davison: "The relationship's fate and spiritual purpose: karmic mission, destined themes, soul-level intentions, evolutionary purpose, and what this relationship is meant to teach or transform."
  },
  bestFor: {
    synastry: [
      "Initial compatibility check when dating",
      "Understanding specific conflicts or attractions",
      "Seeing individual experiences within the relationship",
      "Analyzing who triggers what in whom",
      "Practical day-to-day dynamics"
    ],
    composite: [
      "Long-term relationship planning",
      "Business partnerships (what can we build together?)",
      "Understanding relationship goals and direction",
      "Seeing the relationship's public face",
      "Evaluating shared purpose and values",
      "Marriage/commitment decisions"
    ],
    davison: [
      "Spiritual/karmic relationship analysis",
      "Understanding why this person appeared in your life",
      "Seeing the 'fate' factor in the relationship",
      "Deep soul-contract analysis",
      "Twin flame/soulmate connections",
      "When timing of meeting feels significant"
    ]
  }
};

/**
 * Calculate Composite Chart (midpoint method)
 * Composite chart represents the relationship itself as a third entity
 */
export function calculateCompositeChart(
  chart1: NatalChart,
  chart2: NatalChart,
  person1Name?: string,
  person2Name?: string
): CompositeChart {
  const compositePlanets: any = {};

  // Calculate midpoints for all planets
  const planetNames = Object.keys(chart1.planets);
  
  planetNames.forEach(planetName => {
    const planet1 = chart1.planets[planetName];
    const planet2 = chart2.planets[planetName];

    if (planet1 && planet2) {
      compositePlanets[planetName] = calculateMidpoint(planet1, planet2);
    }
  });

  // Calculate composite house cusps
  const compositeHouseCusps: any = {};
  if (chart1.houseCusps && chart2.houseCusps) {
    for (let i = 1; i <= 12; i++) {
      const cusp1 = chart1.houseCusps[i];
      const cusp2 = chart2.houseCusps[i];
      if (cusp1 && cusp2) {
        compositeHouseCusps[i] = calculateMidpoint(cusp1, cusp2);
      }
    }
  }

  return {
    chartType: 'composite',
    planets: compositePlanets,
    houseCusps: compositeHouseCusps,
    person1Name,
    person2Name,
    interceptedSigns: [] // Would need calculation based on composite houses
  };
}

/**
 * Calculate Davison Chart (midpoint in time and space)
 * Davison chart represents the relationship's 'birth' moment
 */
export function calculateDavisonChart(
  chart1: NatalChart,
  chart2: NatalChart,
  birthDate1: Date,
  birthDate2: Date,
  birthLat1: number,
  birthLon1: number,
  birthLat2: number,
  birthLon2: number,
  person1Name?: string,
  person2Name?: string
): DavisonChart {
  // Calculate midpoint in time
  const time1 = birthDate1.getTime();
  const time2 = birthDate2.getTime();
  const midpointTime = new Date((time1 + time2) / 2);

  // Calculate midpoint in space
  const midpointLat = (birthLat1 + birthLat2) / 2;
  const midpointLon = (birthLon1 + birthLon2) / 2;

  // This would need to call your existing chart calculation function
  // with the midpoint date/time/location to generate a real chart
  // For now, returning structure:

  return {
    chartType: 'davison',
    relationshipBirthDate: midpointTime,
    relationshipBirthLocation: `${midpointLat.toFixed(2)}°, ${midpointLon.toFixed(2)}°`,
    planets: {}, // Would be calculated using midpointTime and midpoint location
    houseCusps: {},
    person1Name,
    person2Name,
    interceptedSigns: []
  };
}

/**
 * Calculate midpoint between two planetary positions
 * Handles both short way and long way around the zodiac
 */
function calculateMidpoint(planet1: any, planet2: any): any {
  // Convert to absolute degrees (0-360)
  const pos1 = planet1.sign * 30 + planet1.degree + (planet1.minutes / 60) + (planet1.seconds / 3600);
  const pos2 = planet2.sign * 30 + planet2.degree + (planet2.minutes / 60) + (planet2.seconds / 3600);

  // Calculate both possible midpoints
  let midpoint1 = (pos1 + pos2) / 2;
  let midpoint2 = midpoint1 + 180;

  // Normalize
  if (midpoint2 >= 360) midpoint2 -= 360;

  // Choose the midpoint that creates the shorter arc
  const diff1 = Math.min(Math.abs(pos1 - midpoint1), 360 - Math.abs(pos1 - midpoint1));
  const diff2 = Math.min(Math.abs(pos1 - midpoint2), 360 - Math.abs(pos1 - midpoint2));

  let finalMidpoint = diff1 <= diff2 ? midpoint1 : midpoint2;

  // Convert back to sign/degree/minutes/seconds
  const sign = Math.floor(finalMidpoint / 30);
  const remainder = finalMidpoint - (sign * 30);
  const degree = Math.floor(remainder);
  const minutesDecimal = (remainder - degree) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);

  // Handle retrograde (composite planet is retrograde if both natal planets are)
  const isRetrograde = planet1.isRetrograde && planet2.isRetrograde;

  return {
    sign,
    degree,
    minutes,
    seconds,
    isRetrograde
  };
}

/**
 * Analyze composite chart for relationship purpose and themes
 */
export interface CompositeAnalysis {
  relationshipPurpose: string;
  coreTheme: string;
  strengths: string[];
  challenges: string[];
  publicImage: string;
  emotionalTone: string;
  communicationStyle: string;
  sharedGoals: string;
  longevityIndicators: string[];
  whenToUseThisChart: string;
}

export function analyzeCompositeChart(composite: CompositeChart): CompositeAnalysis {
  const sun = composite.planets.Sun;
  const moon = composite.planets.Moon;
  const venus = composite.planets.Venus;
  const saturn = composite.planets.Saturn;

  return {
    relationshipPurpose: getCompositeSunPurpose(sun),
    coreTheme: getCompositeTheme(composite),
    strengths: getCompositeStrengths(composite),
    challenges: getCompositeChallenges(composite),
    publicImage: getCompositePublicImage(sun),
    emotionalTone: getCompositeMoonTone(moon),
    communicationStyle: getCompositeCommunication(composite),
    sharedGoals: getCompositeGoals(composite),
    longevityIndicators: getCompositeLongevity(composite),
    whenToUseThisChart: "Use this chart to understand what you're building together, how you function as a team, and what the relationship's collective purpose is. Look here for shared values, public image, and long-term potential."
  };
}

/**
 * Analyze Davison chart for soul-level relationship destiny
 */
export interface DavisonAnalysis {
  relationshipDestiny: string;
  karmicPurpose: string;
  fatedThemes: string[];
  spiritualLessons: string[];
  soulContract: string;
  evolutionaryIntent: string;
  whenToUseThisChart: string;
}

export function analyzeDavisonChart(davison: DavisonChart): DavisonAnalysis {
  return {
    relationshipDestiny: getDavisonDestiny(davison),
    karmicPurpose: getDavisonKarmicPurpose(davison),
    fatedThemes: getDavisonFatedThemes(davison),
    spiritualLessons: getDavisonLessons(davison),
    soulContract: getDavisonSoulContract(davison),
    evolutionaryIntent: getDavisonEvolution(davison),
    whenToUseThisChart: "Use this chart to understand the spiritual/karmic purpose of the relationship, what the universe intends for this connection, and the soul-level lessons you're meant to learn together. This shows the 'fate' factor."
  };
}

// Composite interpretation helpers
function getCompositeSunPurpose(sun: any): string {
  if (!sun) return "Purpose unclear without Sun position";
  
  const signPurposes = {
    0: "This relationship exists to birth new identity and leadership together. You're here to create something bold and original.",
    1: "This relationship exists to build something stable and valuable. You're here to create security and tangible results together.",
    2: "This relationship exists to communicate, learn, and connect. You're here to share ideas and facilitate exchange.",
    3: "This relationship exists to create emotional security and nurture. You're here to build a safe haven together.",
    4: "This relationship exists to create, celebrate, and shine. You're here to bring joy and creative expression into the world.",
    5: "This relationship exists to serve, heal, and improve. You're here to be useful and refine systems together.",
    6: "This relationship exists to create balance, beauty, and partnership. You're here to model healthy relating.",
    7: "This relationship exists to transform, merge, and empower. You're here to facilitate deep change together.",
    8: "This relationship exists to explore, expand, and teach. You're here to seek truth and meaning together.",
    9: "This relationship exists to achieve, build structures, and leave a legacy. You're here to accomplish something lasting.",
    10: "This relationship exists to innovate, liberate, and create community. You're here to break new ground together.",
    11: "This relationship exists to heal, transcend, and create art/spirituality. You're here to dissolve boundaries and serve something greater."
  };

  return signPurposes[sun.sign] || "This relationship has a unique collective purpose.";
}

function getCompositeTheme(composite: CompositeChart): string {
  // Would analyze dominant elements, modes, house emphasis
  return "Composite chart theme analysis - would examine element balance, house emphasis, and major aspects";
}

function getCompositeStrengths(composite: CompositeChart): string[] {
  // Would look for supportive aspects, well-placed planets
  return [
    "Example: Strong composite Venus - natural harmony",
    "Example: Composite Jupiter in beneficial aspect - growth together"
  ];
}

function getCompositeChallenges(composite: CompositeChart): string[] {
  // Would look for challenging aspects, difficult placements
  return [
    "Example: Composite Saturn square Moon - emotional distance to overcome",
    "Example: Composite Mars-Pluto hard aspect - power struggles to navigate"
  ];
}

function getCompositePublicImage(sun: any): string {
  return "How the relationship appears to others and its public role/identity";
}

function getCompositeMoonTone(moon: any): string {
  if (!moon) return "Emotional tone unclear";
  return "The emotional atmosphere and security needs of the relationship as a whole";
}

function getCompositeCommunication(composite: CompositeChart): string {
  // Would analyze composite Mercury
  return "How you communicate as a unit and your shared mental processes";
}

function getCompositeGoals(composite: CompositeChart): string {
  // Would analyze composite MC, Saturn, Jupiter
  return "What you're working toward building together and shared ambitions";
}

function getCompositeLongevity(composite: CompositeChart): string[] {
  const saturn = composite.planets.Saturn;
  // Would look for Saturn placements, fixed sign emphasis, etc.
  return [
    "Composite Saturn strength indicates commitment capacity",
    "Fixed sign emphasis suggests staying power",
    "Outer planet contacts show transformative potential over time"
  ];
}

// Davison interpretation helpers
function getDavisonDestiny(davison: DavisonChart): string {
  return "The fated path this relationship is meant to walk - what the universe designed this connection to accomplish";
}

function getDavisonKarmicPurpose(davison: DavisonChart): string {
  // Would analyze Davison nodes, Saturn, Pluto
  return "The karmic mission and soul-level agreements that brought you together";
}

function getDavisonFatedThemes(davison: DavisonChart): string[] {
  // Would analyze Davison chart for significant patterns
  return [
    "Themes that will inevitably emerge in this relationship",
    "Destined experiences you'll share",
    "Fated lessons and growth areas"
  ];
}

function getDavisonLessons(davison: DavisonChart): string[] {
  return [
    "Soul lessons the relationship is meant to teach",
    "Evolutionary growth areas",
    "Spiritual development through this connection"
  ];
}

function getDavisonSoulContract(davison: DavisonChart): string {
  return "The spiritual agreement between your souls - what you promised to help each other with before incarnating";
}

function getDavisonEvolution(davison: DavisonChart): string {
  // Would analyze Davison chart evolution indicators
  return "How this relationship is meant to evolve you both spiritually and what consciousness levels it can help you reach";
}

/**
 * Comprehensive relationship analysis guide
 */
export interface RelationshipAnalysisWorkflow {
  step1_synastry: string;
  step2_karmic: string;
  step3_composite: string;
  step4_davison: string;
  integrationGuidance: string;
}

export const RELATIONSHIP_ANALYSIS_WORKFLOW: RelationshipAnalysisWorkflow = {
  step1_synastry: "START HERE: Run synastry first to see basic compatibility, chemistry, and day-to-day dynamics. This shows if you even LIKE each other's energy.",
  
  step2_karmic: "SAFETY CHECK: Run karmic analysis to identify any danger flags (Pluto-Venus squares, Saturn-Moon hard aspects, multiple 8th house overlays). Understand if this is past-life karma, soul growth, or potential trauma bonding.",
  
  step3_composite: "PURPOSE CHECK: If synastry is good and karmic analysis doesn't show red flags, look at composite chart to see what you can BUILD together. Does the relationship have a purpose that excites you? Shared values? Compatible goals?",
  
  step4_davison: "DESTINY CHECK: For deep spiritual connections or when timing feels significant, check Davison to understand the soul-level intentions. This reveals WHY this person appeared and what the universe wants you to accomplish together.",
  
  integrationGuidance: `
HOW TO INTEGRATE ALL FOUR PERSPECTIVES:

1. **Meeting Someone New**: Start with synastry + karmic analysis. If there are major red flags, proceed with extreme caution or don't proceed. Composite and Davison can wait.

2. **Existing Relationship Having Issues**: Check all four. Synastry shows the trigger points, karmic shows if you're stuck in old patterns, composite shows if you've lost sight of shared purpose, Davison shows if you're fighting destiny or aligned with it.

3. **Deciding to Commit**: Composite is most important here - does the relationship's purpose align with what you both want to build? Synastry shows if you can handle daily life together. Karmic shows what baggage you'll need to work through. Davison shows the spiritual significance.

4. **Karmic/Intense Connection**: Start with karmic analysis, then Davison to understand the soul contract. Synastry shows how to actually manage the connection. Composite shows what you're creating through the intensity.

5. **Business Partnership**: Composite is primary - what can you build together? Synastry shows if you'll get along day-to-day. Skip Davison unless it feels spiritually significant.

REMEMBER: 
- Synastry = HOW you relate (person to person)
- Karmic = WHY you met and WHAT to watch for (soul level)
- Composite = WHAT you're building (relationship as entity)
- Davison = DESTINY and soul contract (fated purpose)

All four together give you the complete picture.
`
};

export default {
  calculateCompositeChart,
  calculateDavisonChart,
  analyzeCompositeChart,
  analyzeDavisonChart,
  CHART_COMPARISON_GUIDE,
  RELATIONSHIP_ANALYSIS_WORKFLOW
};
