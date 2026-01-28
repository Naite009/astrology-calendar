// Structural Stress & Release Engine
// Provides trauma-informed interpretation of major life transits

import { NatalChart } from "@/hooks/useNatalChart";
import * as Astronomy from 'astronomy-engine';
import { 
  SATURN_IN_SIGN, 
  SATURN_IN_HOUSE, 
  PHASE_COPY, 
  AXIS_HEADLINES, 
  MEANING_DIAL_VARIANTS,
  CONTEXT_TAG_LABELS,
  MANIFESTATION_BY_HOUSE,
  ACTION_TEMPLATES
} from './structuralStressCopy';

// ============== INTERFACES ==============

export type TransitingPlanet = 'Saturn' | 'Pluto' | 'Uranus' | 'Mars' | 'NorthNode' | 'SouthNode';
export type AspectType = 'conjunction' | 'square' | 'opposition' | 'trine' | 'sextile';
export type PhaseLabel = 'Containment' | 'Structural Stress' | 'Release' | 'Activation' | 'Mixed';
export type MeaningDialMode = 'Insight' | 'Practical' | 'Emotional Support' | 'Shadow Work';

export interface TransitEvent {
  id: string;
  start_date: Date;
  end_date: Date;
  exact_dates: Date[];
  transiting_planet: TransitingPlanet;
  aspect_type: AspectType;
  natal_target: string;
  orb_max_used: number;
  house_activated: { transit: number; natal: number };
  axis_activated: string;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
}

export interface ChartSignature {
  saturn_sign: string;
  saturn_house: number;
  saturn_dispositor: { planet: string; sign: string; house: number };
  top_saturn_aspects: NatalAspect[];
  libra_stellium_flag: boolean;
  relationship_sensitivity_flag: boolean;
  authority_axis_flag: boolean;
}

export interface PhaseScores {
  containment_score: number;
  stress_score: number;
  release_score: number;
  trigger_score: number;
}

export interface GeneratedCopy {
  phase_summary: string;
  chart_explanation: string[];
  manifestations: string[];
  actions: string[];
  reflection_prompts: string[];
}

export interface StructuralWindow {
  window_id: string;
  date_range: { start: Date; end: Date };
  events: TransitEvent[];
  phase_scores: PhaseScores;
  phase_label: PhaseLabel;
  theme_badges: string[];
  axis_badge: string;
  user_context_tags: string[];
  meaning_dial_mode: MeaningDialMode;
  output_copy: GeneratedCopy;
  action_steps: string[];
}

export interface CycleSummary {
  cycle_type: 'saturn_return' | 'saturn_opposition' | 'uranus_opposition' | 'pluto_square';
  story_summary: string;
  lessons: string[];
  next_steps: string[];
}

export interface SaturnLensCard {
  title: string;
  body: string[];
  type: 'sign' | 'house' | 'dispositor';
}

// ============== CONSTANTS ==============

const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const ANGLES = ['Ascendant', 'MC', 'IC', 'Descendant'];
const OUTER_PLANETS: TransitingPlanet[] = ['Saturn', 'Pluto', 'Uranus'];

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune'
};

const AXIS_MAP: Record<number, string> = {
  1: '1st↔7th', 7: '1st↔7th',
  2: '2nd↔8th', 8: '2nd↔8th',
  3: '3rd↔9th', 9: '3rd↔9th',
  4: '4th↔10th', 10: '4th↔10th',
  5: '5th↔11th', 11: '5th↔11th',
  6: '6th↔12th', 12: '6th↔12th'
};

const HOUSE_THEMES: Record<number, string[]> = {
  1: ['identity', 'self-image', 'independence'],
  2: ['resources', 'self-worth', 'security'],
  3: ['communication', 'learning', 'siblings'],
  4: ['home', 'family', 'roots', 'safety'],
  5: ['creativity', 'romance', 'joy', 'children'],
  6: ['health', 'work', 'service', 'routines'],
  7: ['relationship', 'partnership', 'commitment'],
  8: ['intimacy', 'shared resources', 'transformation'],
  9: ['beliefs', 'travel', 'meaning', 'education'],
  10: ['career', 'authority', 'public role', 'status'],
  11: ['community', 'goals', 'friendships', 'ideals'],
  12: ['rest', 'spirituality', 'healing', 'unconscious']
};

// ============== HELPER FUNCTIONS ==============

function getHouseFromDegree(degree: number, houseCusps: Record<string, { sign: string; degree: number; minutes: number }>): number {
  const cusps = Object.entries(houseCusps)
    .map(([key, value]) => {
      const houseNum = parseInt(key.replace('house', ''));
      const signIndex = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(value.sign);
      const absoluteDegree = signIndex * 30 + value.degree + value.minutes / 60;
      return { house: houseNum, degree: absoluteDegree };
    })
    .sort((a, b) => a.house - b.house);

  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i].degree;
    const nextCusp = cusps[(i + 1) % 12].degree;
    
    if (nextCusp < currentCusp) {
      // Wraps around 360
      if (degree >= currentCusp || degree < nextCusp) {
        return cusps[i].house;
      }
    } else {
      if (degree >= currentCusp && degree < nextCusp) {
        return cusps[i].house;
      }
    }
  }
  return 1;
}

function getPlanetAbsoluteDegree(planet: { sign: string; degree: number; minutes: number }): number {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(planet.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + planet.degree + (planet.minutes || 0) / 60;
}

function calculateAspect(deg1: number, deg2: number): { type: AspectType | null; orb: number } {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;

  const aspects: { type: AspectType; angle: number; maxOrb: number }[] = [
    { type: 'conjunction', angle: 0, maxOrb: 8 },
    { type: 'opposition', angle: 180, maxOrb: 8 },
    { type: 'square', angle: 90, maxOrb: 7 },
    { type: 'trine', angle: 120, maxOrb: 7 },
    { type: 'sextile', angle: 60, maxOrb: 5 }
  ];

  for (const aspect of aspects) {
    const orb = Math.abs(diff - aspect.angle);
    if (orb <= aspect.maxOrb) {
      return { type: aspect.type, orb };
    }
  }

  return { type: null, orb: 999 };
}

function isHardAspect(type: AspectType): boolean {
  return type === 'conjunction' || type === 'square' || type === 'opposition';
}

// ============== CHART SIGNATURE EXTRACTION ==============

export function extractChartSignature(chart: NatalChart): ChartSignature {
  const saturn = chart.planets.Saturn;
  const saturnSign = saturn?.sign || 'Unknown';
  const saturnDegree = getPlanetAbsoluteDegree(saturn);
  const saturnHouse = chart.houseCusps ? getHouseFromDegree(saturnDegree, chart.houseCusps) : 1;

  // Find Saturn's dispositor
  const dispositorPlanet = SIGN_RULERS[saturnSign] || 'Saturn';
  const dispositorData = chart.planets[dispositorPlanet as keyof typeof chart.planets];
  const dispositorSign = dispositorData?.sign || 'Unknown';
  const dispositorDegree = getPlanetAbsoluteDegree(dispositorData);
  const dispositorHouse = chart.houseCusps ? getHouseFromDegree(dispositorDegree, chart.houseCusps) : 1;

  // Find top Saturn aspects
  const saturnAspects: NatalAspect[] = [];
  const targetPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Ascendant'];
  
  for (const target of targetPlanets) {
    const targetData = chart.planets[target as keyof typeof chart.planets];
    if (!targetData || !targetData.sign) continue;
    
    const targetDeg = getPlanetAbsoluteDegree(targetData);
    const { type, orb } = calculateAspect(saturnDegree, targetDeg);
    
    if (type) {
      saturnAspects.push({
        planet1: 'Saturn',
        planet2: target,
        aspect: type,
        orb
      });
    }
  }

  // Sort by orb (tightest first)
  saturnAspects.sort((a, b) => a.orb - b.orb);

  // Check for Libra stellium (3+ planets in Libra)
  let libraCount = 0;
  for (const [, planet] of Object.entries(chart.planets)) {
    if (planet && planet.sign === 'Libra') libraCount++;
  }

  // Check relationship sensitivity (7th house ruler, Venus, Moon emphasis)
  const house7 = chart.houseCusps?.house7;
  const h7Ruler = house7 ? SIGN_RULERS[house7.sign] : null;
  const venus = chart.planets.Venus;
  const moon = chart.planets.Moon;
  
  const relationshipSensitive = 
    libraCount >= 2 ||
    venus?.sign === 'Libra' ||
    moon?.sign === 'Libra' ||
    (h7Ruler && chart.planets[h7Ruler as keyof typeof chart.planets]);

  // Check authority axis (Saturn in 10th, MC aspects, 4th/10th emphasis)
  const authorityAxis = 
    saturnHouse === 10 || saturnHouse === 4 ||
    saturnAspects.some(a => a.planet2 === 'MC');

  return {
    saturn_sign: saturnSign,
    saturn_house: saturnHouse,
    saturn_dispositor: {
      planet: dispositorPlanet,
      sign: dispositorSign,
      house: dispositorHouse
    },
    top_saturn_aspects: saturnAspects.slice(0, 5),
    libra_stellium_flag: libraCount >= 3,
    relationship_sensitivity_flag: !!relationshipSensitive,
    authority_axis_flag: authorityAxis
  };
}

// ============== TRANSIT DETECTION ==============

function getTransitingPlanetPosition(planet: TransitingPlanet, date: Date): number {
  const body = planet === 'NorthNode' || planet === 'SouthNode' 
    ? null 
    : Astronomy.Body[planet as keyof typeof Astronomy.Body];
  
  if (!body) {
    // For nodes, approximate calculation
    // North Node moves retrograde ~19.35° per year
    const refDate = new Date('2020-01-01');
    const refPosition = 98.68; // Cancer 8° = 98.68° absolute
    const daysSinceRef = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
    const movement = (daysSinceRef / 365.25) * 19.35;
    let pos = (refPosition - movement) % 360;
    if (pos < 0) pos += 360;
    return planet === 'SouthNode' ? (pos + 180) % 360 : pos;
  }

  try {
    const time = Astronomy.MakeTime(date);
    const observer = new Astronomy.Observer(0, 0, 0);
    const equator = Astronomy.Equator(body, time, observer, false, false);
    const ecliptic = Astronomy.Ecliptic(equator.vec);
    let lon = ecliptic.elon;
    if (lon < 0) lon += 360;
    return lon;
  } catch {
    return 0;
  }
}

export function detectTransitEvents(
  chart: NatalChart,
  startDate: Date,
  endDate: Date
): TransitEvent[] {
  const events: TransitEvent[] = [];
  const transitPlanets: TransitingPlanet[] = ['Saturn', 'Pluto', 'Uranus', 'Mars', 'NorthNode'];
  const natalTargets = [...PERSONAL_PLANETS, 'Saturn', 'Ascendant'];

  for (const transitPlanet of transitPlanets) {
    for (const natalTarget of natalTargets) {
      const natalData = chart.planets[natalTarget as keyof typeof chart.planets];
      if (!natalData || !natalData.sign) continue;

      const natalDegree = getPlanetAbsoluteDegree(natalData);
      const natalHouse = chart.houseCusps ? getHouseFromDegree(natalDegree, chart.houseCusps) : 1;

      // Scan month by month
      const current = new Date(startDate);
      let inAspect = false;
      let aspectStart: Date | null = null;
      let aspectType: AspectType | null = null;
      let exactDates: Date[] = [];
      let maxOrb = 0;

      while (current <= endDate) {
        const transitDegree = getTransitingPlanetPosition(transitPlanet, current);
        const { type, orb } = calculateAspect(transitDegree, natalDegree);

        if (type && isHardAspect(type)) {
          if (!inAspect) {
            inAspect = true;
            aspectStart = new Date(current);
            aspectType = type;
            exactDates = [];
            maxOrb = orb;
          }
          if (orb < 1) {
            exactDates.push(new Date(current));
          }
          if (orb > maxOrb) maxOrb = orb;
        } else if (inAspect && aspectStart && aspectType) {
          // Aspect ended
          const transitHouse = chart.houseCusps 
            ? getHouseFromDegree(getTransitingPlanetPosition(transitPlanet, aspectStart), chart.houseCusps)
            : 1;

          events.push({
            id: `${transitPlanet}-${natalTarget}-${aspectStart.getTime()}`,
            start_date: aspectStart,
            end_date: new Date(current),
            exact_dates: exactDates.length > 0 ? exactDates : [new Date((aspectStart.getTime() + current.getTime()) / 2)],
            transiting_planet: transitPlanet,
            aspect_type: aspectType,
            natal_target: natalTarget,
            orb_max_used: maxOrb,
            house_activated: { transit: transitHouse, natal: natalHouse },
            axis_activated: AXIS_MAP[natalHouse] || '1st↔7th'
          });

          inAspect = false;
          aspectStart = null;
          aspectType = null;
        }

        // Advance by 7 days for outer planets, 1 day for Mars
        current.setDate(current.getDate() + (transitPlanet === 'Mars' ? 1 : 7));
      }
    }
  }

  return events.sort((a, b) => a.start_date.getTime() - b.start_date.getTime());
}

// ============== WINDOW CLUSTERING ==============

export function clusterEventsIntoWindows(events: TransitEvent[]): StructuralWindow[] {
  if (events.length === 0) return [];

  const windows: StructuralWindow[] = [];
  let currentWindow: TransitEvent[] = [];
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;

  for (const event of events) {
    if (!windowStart) {
      windowStart = event.start_date;
      windowEnd = event.end_date;
      currentWindow = [event];
    } else if (windowEnd && event.start_date.getTime() - windowEnd.getTime() <= 14 * 24 * 60 * 60 * 1000) {
      // Within 14 days of previous end - cluster together
      currentWindow.push(event);
      if (event.end_date > windowEnd) {
        windowEnd = event.end_date;
      }
    } else {
      // Gap too large - close current window and start new one
      if (currentWindow.length > 0 && windowStart && windowEnd) {
        windows.push(createWindow(currentWindow, windowStart, windowEnd));
      }
      windowStart = event.start_date;
      windowEnd = event.end_date;
      currentWindow = [event];
    }
  }

  // Don't forget the last window
  if (currentWindow.length > 0 && windowStart && windowEnd) {
    windows.push(createWindow(currentWindow, windowStart, windowEnd));
  }

  return windows;
}

function createWindow(events: TransitEvent[], start: Date, end: Date): StructuralWindow {
  const scores = calculatePhaseScores(events);
  const phaseLabel = determinePhaseLabel(scores);
  const primaryAxis = events[0]?.axis_activated || '1st↔7th';
  const themeBadges = extractThemeBadges(events);

  return {
    window_id: `window-${start.getTime()}`,
    date_range: { start, end },
    events,
    phase_scores: scores,
    phase_label: phaseLabel,
    theme_badges: themeBadges.slice(0, 4),
    axis_badge: primaryAxis,
    user_context_tags: [],
    meaning_dial_mode: 'Insight',
    output_copy: {
      phase_summary: '',
      chart_explanation: [],
      manifestations: [],
      actions: [],
      reflection_prompts: []
    },
    action_steps: []
  };
}

// ============== PHASE SCORING ==============

function calculatePhaseScores(events: TransitEvent[]): PhaseScores {
  let containment = 0;
  let stress = 0;
  let release = 0;
  let trigger = 0;

  for (const event of events) {
    const isHard = isHardAspect(event.aspect_type);
    const isPersonal = PERSONAL_PLANETS.includes(event.natal_target) || ANGLES.includes(event.natal_target);
    const isAxisCritical = ['4th↔10th', '1st↔7th', '2nd↔8th'].includes(event.axis_activated);

    switch (event.transiting_planet) {
      case 'Saturn':
        containment += isHard ? 3 : 1;
        if (isPersonal) containment += 2;
        if (isAxisCritical) containment += 1;
        break;
      case 'Pluto':
        stress += isHard ? 4 : 2;
        if (isPersonal) stress += 3;
        if (event.axis_activated === '2nd↔8th') stress += 2;
        break;
      case 'Uranus':
        release += isHard ? 3 : 1;
        if (isPersonal) release += 2;
        if (isAxisCritical) release += 1;
        break;
      case 'Mars':
        trigger += 2;
        if (events.some(e => e.transiting_planet !== 'Mars' && 
            Math.abs(e.exact_dates[0]?.getTime() - event.exact_dates[0]?.getTime()) < 7 * 24 * 60 * 60 * 1000)) {
          trigger += 2; // Mars activating other transits
        }
        break;
      case 'NorthNode':
      case 'SouthNode':
        trigger += 2;
        break;
    }
  }

  return {
    containment_score: containment,
    stress_score: stress,
    release_score: release,
    trigger_score: trigger
  };
}

function determinePhaseLabel(scores: PhaseScores): PhaseLabel {
  const { containment_score, stress_score, release_score, trigger_score } = scores;
  const total = containment_score + stress_score + release_score + trigger_score;
  
  if (total === 0) return 'Mixed';

  const containmentRatio = containment_score / total;
  const stressRatio = stress_score / total;
  const releaseRatio = release_score / total;
  const triggerRatio = trigger_score / total;

  if (containmentRatio > 0.4) return 'Containment';
  if (stressRatio > 0.4) return 'Structural Stress';
  if (releaseRatio > 0.4) return 'Release';
  if (triggerRatio > 0.4) return 'Activation';

  return 'Mixed';
}

function extractThemeBadges(events: TransitEvent[]): string[] {
  const themes = new Set<string>();

  for (const event of events) {
    const houseThemes = HOUSE_THEMES[event.house_activated.natal];
    if (houseThemes) {
      houseThemes.forEach(t => themes.add(t));
    }
  }

  return Array.from(themes);
}

// ============== COPY GENERATION ==============

export function generateWindowCopy(
  window: StructuralWindow,
  chartSignature: ChartSignature,
  mode: MeaningDialMode
): GeneratedCopy {
  const phase = PHASE_COPY[window.phase_label];
  const modeVariant = MEANING_DIAL_VARIANTS[mode];
  const axisHeadline = AXIS_HEADLINES[window.axis_badge];

  // Phase summary
  const phaseSummary = `${phase.body} ${axisHeadline ? axisHeadline.question : ''} ${modeVariant.tone}`;

  // Chart-specific explanation
  const chartExplanation: string[] = [];
  const uniqueAxes = new Set(window.events.map(e => e.axis_activated));
  const uniqueTargets = new Set(window.events.map(e => e.natal_target));

  chartExplanation.push(`• Houses activated: ${Array.from(new Set(window.events.flatMap(e => [e.house_activated.transit, e.house_activated.natal]))).join(', ')}`);
  chartExplanation.push(`• Axis tension: ${Array.from(uniqueAxes).join(', ')}`);
  chartExplanation.push(`• Natal points affected: ${Array.from(uniqueTargets).join(', ')}`);
  
  if (chartSignature.relationship_sensitivity_flag && window.axis_badge.includes('7th')) {
    chartExplanation.push(`• Your chart shows relationship sensitivity (Libra/Venus emphasis) - partnership themes may be amplified`);
  }
  if (chartSignature.authority_axis_flag && window.axis_badge.includes('10th')) {
    chartExplanation.push(`• Your Saturn placement emphasizes authority dynamics - career/public role themes may be heightened`);
  }

  // Manifestations
  const manifestations: string[] = [];
  for (const event of window.events.slice(0, 3)) {
    const houseMani = MANIFESTATION_BY_HOUSE[event.house_activated.natal];
    if (houseMani) {
      manifestations.push(houseMani[Math.floor(Math.random() * houseMani.length)]);
    }
  }

  // Actions
  const actions = [...ACTION_TEMPLATES[window.phase_label]];

  // Reflection prompts based on mode
  const reflectionPrompts = modeVariant.prompts;

  return {
    phase_summary: phaseSummary,
    chart_explanation: chartExplanation,
    manifestations: [...new Set(manifestations)].slice(0, 4),
    actions: actions.slice(0, 3),
    reflection_prompts: reflectionPrompts
  };
}

// ============== SATURN LENS CARDS ==============

export function generateSaturnLensCards(signature: ChartSignature): SaturnLensCard[] {
  const cards: SaturnLensCard[] = [];

  // Sign card
  const signData = SATURN_IN_SIGN[signature.saturn_sign];
  if (signData) {
    cards.push({
      title: `Saturn in ${signature.saturn_sign} asks...`,
      body: [
        signData.asks,
        `What would mature ${signData.quality} look like when no one is applauding?`,
        `What rules or fears have been running this part of your life—and which ones are outdated?`
      ],
      type: 'sign'
    });
  }

  // House card
  const houseData = SATURN_IN_HOUSE[signature.saturn_house];
  if (houseData) {
    cards.push({
      title: `Saturn in the ${signature.saturn_house}${getOrdinalSuffix(signature.saturn_house)} House asks...`,
      body: [
        houseData.asks,
        `What boundary would make ${houseData.domain} safer, simpler, or more sustainable?`,
        `What responsibility in ${houseData.domain} are you ready to own—and what is not yours?`
      ],
      type: 'house'
    });
  }

  // Dispositor card
  cards.push({
    title: `Saturn reports to ${signature.saturn_dispositor.planet}...`,
    body: [
      `Your Saturn growth happens through ${signature.saturn_dispositor.planet} themes—especially in ${SATURN_IN_HOUSE[signature.saturn_dispositor.house]?.domain || 'this area of life'}.`,
      `When you're stuck, look at ${signature.saturn_dispositor.planet}: that's where the "how" of Saturn gets unlocked.`,
      `If ${signature.saturn_dispositor.planet} is stressed by transit, Saturn lessons feel heavier; if supported, they feel clearer.`
    ],
    type: 'dispositor'
  });

  return cards;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ============== CYCLE SUMMARY ==============

export function generateCycleSummary(
  windows: StructuralWindow[],
  cycleType: CycleSummary['cycle_type']
): CycleSummary {
  const totalContainment = windows.reduce((sum, w) => sum + w.phase_scores.containment_score, 0);
  const totalStress = windows.reduce((sum, w) => sum + w.phase_scores.stress_score, 0);
  const totalRelease = windows.reduce((sum, w) => sum + w.phase_scores.release_score, 0);

  let storyType = 'restructuring';
  if (totalRelease > totalContainment && totalRelease > totalStress) {
    storyType = 'liberation';
  } else if (totalStress > totalContainment) {
    storyType = 'transformation';
  }

  const stories: Record<string, string> = {
    restructuring: `This cycle emphasized building sustainable structures and accepting necessary limits. The pressure came from commitment and duty themes.`,
    liberation: `This cycle pushed toward freedom and authenticity. The pressure came from outgrown structures that could no longer contain your evolution.`,
    transformation: `This cycle demanded deep change and release of control. The pressure came from unsustainable patterns reaching their natural end.`
  };

  const lessons: Record<string, string[]> = {
    restructuring: [
      'Commitment requires choice, not just obligation',
      'Boundaries protect what matters most',
      'Sustainable structures serve life, not constrain it'
    ],
    liberation: [
      'Authenticity sometimes requires disruption',
      'Freedom and responsibility are not opposites',
      'Some structures must break for growth to happen'
    ],
    transformation: [
      'What cannot be sustained will transform',
      'Power shared is power increased',
      'Endings enable beginnings'
    ]
  };

  const nextSteps: Record<string, string[]> = {
    restructuring: [
      'Identify which structures serve you and which deplete you',
      'Practice saying no without guilt',
      'Build support systems before crisis demands them'
    ],
    liberation: [
      'Notice where you still feel trapped and name it',
      'Experiment with small freedoms before big changes',
      'Trust your restlessness as information'
    ],
    transformation: [
      'Allow grief for what has ended',
      'Claim your power in one specific area',
      'Build new foundations on cleared ground'
    ]
  };

  return {
    cycle_type: cycleType,
    story_summary: stories[storyType],
    lessons: lessons[storyType],
    next_steps: nextSteps[storyType]
  };
}

// ============== MAIN ENTRY POINT ==============

export function generateStructuralAnalysis(
  chart: NatalChart,
  yearsBack: number = 5,
  yearsForward: number = 5
): {
  signature: ChartSignature;
  windows: StructuralWindow[];
  saturnCards: SaturnLensCard[];
} {
  const signature = extractChartSignature(chart);
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - yearsBack);
  const endDate = new Date(today);
  endDate.setFullYear(today.getFullYear() + yearsForward);

  const events = detectTransitEvents(chart, startDate, endDate);
  const windows = clusterEventsIntoWindows(events);

  // Generate copy for each window
  for (const window of windows) {
    window.output_copy = generateWindowCopy(window, signature, window.meaning_dial_mode);
    window.action_steps = window.output_copy.actions;
  }

  const saturnCards = generateSaturnLensCards(signature);

  return { signature, windows, saturnCards };
}
