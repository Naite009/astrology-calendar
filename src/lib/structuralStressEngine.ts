// Structural Stress & Release Engine
// Provides trauma-informed interpretation of major life transits
// Restructured for event-driven exploration with focused transit windows

import { NatalChart } from "@/hooks/useNatalChart";
import * as Astronomy from 'astronomy-engine';
import { 
  SATURN_IN_SIGN, 
  SATURN_IN_HOUSE, 
  PHASE_COPY, 
  AXIS_HEADLINES, 
  MEANING_DIAL_VARIANTS,
  MANIFESTATION_BY_HOUSE,
  ACTION_TEMPLATES,
  LIFE_EVENT_INTERPRETATIONS
} from './structuralStressCopy';

// ============== INTERFACES ==============

export type TransitingPlanet = 'Saturn' | 'Pluto' | 'Uranus' | 'Mars' | 'NorthNode' | 'SouthNode' | 'Neptune';
export type AspectType = 'conjunction' | 'square' | 'opposition' | 'trine' | 'sextile';
export type PhaseLabel = 'Containment' | 'Structural Stress' | 'Release' | 'Activation' | 'Mixed';
export type MeaningDialMode = 'Insight' | 'Practical' | 'Emotional Support' | 'Shadow Work';
export type LifeEventTag = 'relationship_began' | 'relationship_ended' | 'marriage' | 'breakup' | 'grief' | 'job_change' | 'relocation' | 'health_event' | 'identity_shift' | 'safety' | 'other';

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
  motion?: 'applying' | 'exact' | 'separating';
  orb_current?: number;
}

export interface ActiveTransit {
  planet: TransitingPlanet;
  aspectType: AspectType;
  natalTarget: string;
  exactDegree: number;
  transitingDegree: number;
  natalDegree: number;
  orb: number;
  motion: 'applying' | 'exact' | 'separating';
  houseTransit: number;
  houseNatal: number;
  axis: string;
  phaseContribution: 'containment' | 'stress' | 'release' | 'trigger';
  narrative: string;
}

export interface DateExplorerResult {
  date: Date;
  activeTransits: ActiveTransit[];
  phaseScores: PhaseScores;
  phaseLabel: PhaseLabel;
  summary: string;
  lifeEventContext?: LifeEventTag;
  contextualNarrative?: string;
}

export interface FocusedTransitWindow {
  id: string;
  transitPlanet: TransitingPlanet;
  aspectType: AspectType;
  natalTarget: string;
  startDate: Date;
  endDate: Date;
  exactDates: Date[];
  peakDate: Date;
  houseNatal: number;
  axis: string;
  phaseType: 'containment' | 'stress' | 'release' | 'trigger';
  narrative: string;
  isPast: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
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
const OUTER_PLANETS: TransitingPlanet[] = ['Saturn', 'Pluto', 'Uranus', 'Neptune'];

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

const TRANSIT_NARRATIVES: Record<TransitingPlanet, { phase: 'containment' | 'stress' | 'release' | 'trigger'; narrative: (aspect: AspectType, target: string) => string }> = {
  Saturn: {
    phase: 'containment',
    narrative: (aspect, target) => {
      const aspectVerb = aspect === 'conjunction' ? 'meets' : aspect === 'opposition' ? 'confronts' : 'challenges';
      return `Saturn ${aspectVerb} your natal ${target}. This is a period of commitment pressure, responsibility, and structural demands. What you build now must be sustainable. What isn't built properly will be tested.`;
    }
  },
  Pluto: {
    phase: 'stress',
    narrative: (aspect, target) => {
      const intensity = aspect === 'conjunction' ? 'total transformation' : aspect === 'opposition' ? 'power confrontation' : 'deep pressure';
      return `Pluto brings ${intensity} to your ${target}. Power dynamics, control themes, or buried patterns surface. This isn't punishment—it's exposure. What's been unsustainable reveals itself.`;
    }
  },
  Uranus: {
    phase: 'release',
    narrative: (aspect, target) => {
      const action = aspect === 'conjunction' ? 'awakens' : aspect === 'opposition' ? 'liberates through confrontation' : 'disrupts';
      return `Uranus ${action} your ${target}. Sudden clarity, restlessness, or a quiet internal switch: "I'm done." What's authentic pushes against what's merely habitual.`;
    }
  },
  Neptune: {
    phase: 'release',
    narrative: (aspect, target) => `Neptune dissolves boundaries around your ${target}. Confusion, spiritual opening, or loss of previous certainties. What seemed solid becomes permeable.`
  },
  Mars: {
    phase: 'trigger',
    narrative: (aspect, target) => `Mars activates your ${target}. Events that force clarity, confrontation that was brewing, or energy that demands expression. This is about decisive action.`
  },
  NorthNode: {
    phase: 'trigger',
    narrative: (aspect, target) => `The North Node highlights your ${target} as part of your growth direction. Fated-feeling encounters or opportunities that align with your developmental path.`
  },
  SouthNode: {
    phase: 'trigger',
    narrative: (aspect, target) => `The South Node touches your ${target}. Patterns from the past resurface—sometimes as release, sometimes as regression. What are you ready to let go of?`
  }
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

function calculateAspect(deg1: number, deg2: number, maxOrbs?: Partial<Record<AspectType, number>>): { type: AspectType | null; orb: number } {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;

  const defaultOrbs = {
    conjunction: 8,
    opposition: 8,
    square: 7,
    trine: 7,
    sextile: 5
  };

  const orbs = { ...defaultOrbs, ...maxOrbs };

  const aspects: { type: AspectType; angle: number }[] = [
    { type: 'conjunction', angle: 0 },
    { type: 'opposition', angle: 180 },
    { type: 'square', angle: 90 },
    { type: 'trine', angle: 120 },
    { type: 'sextile', angle: 60 }
  ];

  for (const aspect of aspects) {
    const orb = Math.abs(diff - aspect.angle);
    if (orb <= orbs[aspect.type]) {
      return { type: aspect.type, orb };
    }
  }

  return { type: null, orb: 999 };
}

function isHardAspect(type: AspectType): boolean {
  return type === 'conjunction' || type === 'square' || type === 'opposition';
}

function getTransitingPlanetPosition(planet: TransitingPlanet, date: Date): number {
  if (planet === 'NorthNode' || planet === 'SouthNode') {
    const refDate = new Date('2020-01-01');
    const refPosition = 98.68;
    const daysSinceRef = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
    const movement = (daysSinceRef / 365.25) * 19.35;
    let pos = (refPosition - movement) % 360;
    if (pos < 0) pos += 360;
    return planet === 'SouthNode' ? (pos + 180) % 360 : pos;
  }

  const body = Astronomy.Body[planet as keyof typeof Astronomy.Body];
  if (!body) return 0;

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

function determineMotion(transitDegree: number, natalDegree: number, aspectAngle: number): 'applying' | 'exact' | 'separating' {
  let diff = transitDegree - natalDegree;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  const targetDiff = aspectAngle;
  const currentDiff = Math.abs(diff);
  const orb = Math.abs(currentDiff - targetDiff);
  
  if (orb < 0.5) return 'exact';
  
  // For outer planets, if the current diff is less than target, we're applying
  // This is simplified - full retrograde detection would require checking direction
  return currentDiff < targetDiff ? 'applying' : 'separating';
}

// ============== CHART SIGNATURE EXTRACTION ==============

export function extractChartSignature(chart: NatalChart): ChartSignature {
  const saturn = chart.planets.Saturn;
  const saturnSign = saturn?.sign || 'Unknown';
  const saturnDegree = getPlanetAbsoluteDegree(saturn);
  const saturnHouse = chart.houseCusps ? getHouseFromDegree(saturnDegree, chart.houseCusps) : 1;

  const dispositorPlanet = SIGN_RULERS[saturnSign] || 'Saturn';
  const dispositorData = chart.planets[dispositorPlanet as keyof typeof chart.planets];
  const dispositorSign = dispositorData?.sign || 'Unknown';
  const dispositorDegree = getPlanetAbsoluteDegree(dispositorData);
  const dispositorHouse = chart.houseCusps ? getHouseFromDegree(dispositorDegree, chart.houseCusps) : 1;

  const saturnAspects: NatalAspect[] = [];
  const targetPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Ascendant'];
  
  for (const target of targetPlanets) {
    const targetData = chart.planets[target as keyof typeof chart.planets];
    if (!targetData || !targetData.sign) continue;
    
    const targetDeg = getPlanetAbsoluteDegree(targetData);
    const { type, orb } = calculateAspect(saturnDegree, targetDeg);
    
    if (type) {
      saturnAspects.push({ planet1: 'Saturn', planet2: target, aspect: type, orb });
    }
  }

  saturnAspects.sort((a, b) => a.orb - b.orb);

  let libraCount = 0;
  for (const [, planet] of Object.entries(chart.planets)) {
    if (planet && planet.sign === 'Libra') libraCount++;
  }

  const house7 = chart.houseCusps?.house7;
  const h7Ruler = house7 ? SIGN_RULERS[house7.sign] : null;
  const venus = chart.planets.Venus;
  const moon = chart.planets.Moon;
  
  const relationshipSensitive = 
    libraCount >= 2 ||
    venus?.sign === 'Libra' ||
    moon?.sign === 'Libra' ||
    (h7Ruler && chart.planets[h7Ruler as keyof typeof chart.planets]);

  const authorityAxis = 
    saturnHouse === 10 || saturnHouse === 4 ||
    saturnAspects.some(a => a.planet2 === 'MC');

  return {
    saturn_sign: saturnSign,
    saturn_house: saturnHouse,
    saturn_dispositor: { planet: dispositorPlanet, sign: dispositorSign, house: dispositorHouse },
    top_saturn_aspects: saturnAspects.slice(0, 5),
    libra_stellium_flag: libraCount >= 3,
    relationship_sensitivity_flag: !!relationshipSensitive,
    authority_axis_flag: authorityAxis
  };
}

// ============== DATE EXPLORER - Get transits for a specific date ==============

export function getTransitsForDate(
  chart: NatalChart,
  targetDate: Date,
  orbs: { outer: number; mars: number } = { outer: 5, mars: 3 }
): ActiveTransit[] {
  const activeTransits: ActiveTransit[] = [];
  const transitPlanets: TransitingPlanet[] = ['Saturn', 'Pluto', 'Uranus', 'Neptune', 'Mars', 'NorthNode'];
  const natalTargets = [...PERSONAL_PLANETS, 'Saturn', 'Ascendant', 'MC'];

  for (const transitPlanet of transitPlanets) {
    const transitDegree = getTransitingPlanetPosition(transitPlanet, targetDate);
    const maxOrb = transitPlanet === 'Mars' ? orbs.mars : orbs.outer;

    for (const natalTarget of natalTargets) {
      const natalData = chart.planets[natalTarget as keyof typeof chart.planets];
      if (!natalData || !natalData.sign) continue;

      const natalDegree = getPlanetAbsoluteDegree(natalData);
      const natalHouse = chart.houseCusps ? getHouseFromDegree(natalDegree, chart.houseCusps) : 1;
      const transitHouse = chart.houseCusps ? getHouseFromDegree(transitDegree, chart.houseCusps) : 1;

      const { type, orb } = calculateAspect(transitDegree, natalDegree, {
        conjunction: maxOrb,
        opposition: maxOrb,
        square: maxOrb - 1,
        trine: maxOrb - 2,
        sextile: maxOrb - 2
      });

      if (type && isHardAspect(type)) {
        const aspectAngle = type === 'conjunction' ? 0 : type === 'opposition' ? 180 : 90;
        const motion = determineMotion(transitDegree, natalDegree, aspectAngle);
        const transitInfo = TRANSIT_NARRATIVES[transitPlanet];

        activeTransits.push({
          planet: transitPlanet,
          aspectType: type,
          natalTarget,
          exactDegree: natalDegree,
          transitingDegree: transitDegree,
          natalDegree,
          orb,
          motion,
          houseTransit: transitHouse,
          houseNatal: natalHouse,
          axis: AXIS_MAP[natalHouse] || '1st↔7th',
          phaseContribution: transitInfo.phase,
          narrative: transitInfo.narrative(type, natalTarget)
        });
      }
    }
  }

  // Sort by importance: tight orbs + outer planets to personal points
  return activeTransits.sort((a, b) => {
    const aWeight = (a.orb * -1) + (OUTER_PLANETS.includes(a.planet) ? 10 : 0) + (PERSONAL_PLANETS.includes(a.natalTarget) ? 5 : 0);
    const bWeight = (b.orb * -1) + (OUTER_PLANETS.includes(b.planet) ? 10 : 0) + (PERSONAL_PLANETS.includes(b.natalTarget) ? 5 : 0);
    return bWeight - aWeight;
  });
}

// ============== EXPLORE A DATE - Full analysis for a specific moment ==============

export function exploreDateWithContext(
  chart: NatalChart,
  targetDate: Date,
  lifeEvent?: LifeEventTag
): DateExplorerResult {
  const activeTransits = getTransitsForDate(chart, targetDate);
  const phaseScores = calculatePhaseScoresFromTransits(activeTransits);
  const phaseLabel = determinePhaseLabel(phaseScores);

  let summary = '';
  if (activeTransits.length === 0) {
    summary = 'No major structural transits are active on this date. Outer planets are not forming hard aspects to your personal points.';
  } else {
    const dominant = activeTransits[0];
    const phaseWord = phaseLabel === 'Mixed' ? 'complex pressure' : phaseLabel.toLowerCase();
    summary = `${dominant.planet} ${dominant.aspectType} your ${dominant.natalTarget} dominates this period. This creates ${phaseWord} dynamics—${dominant.motion === 'applying' ? 'building toward' : dominant.motion === 'exact' ? 'at peak intensity' : 'releasing from'} exactitude.`;
  }

  let contextualNarrative: string | undefined;
  if (lifeEvent && activeTransits.length > 0) {
    const eventInterpretation = LIFE_EVENT_INTERPRETATIONS[lifeEvent];
    if (eventInterpretation) {
      const dominantPhase = activeTransits[0].phaseContribution;
      contextualNarrative = eventInterpretation[dominantPhase] || eventInterpretation.default;
    }
  }

  return {
    date: targetDate,
    activeTransits,
    phaseScores,
    phaseLabel,
    summary,
    lifeEventContext: lifeEvent,
    contextualNarrative
  };
}

function calculatePhaseScoresFromTransits(transits: ActiveTransit[]): PhaseScores {
  let containment = 0, stress = 0, release = 0, trigger = 0;

  for (const transit of transits) {
    const isPersonal = PERSONAL_PLANETS.includes(transit.natalTarget) || ANGLES.includes(transit.natalTarget);
    const tightness = transit.orb < 2 ? 3 : transit.orb < 4 ? 2 : 1;
    const personalBonus = isPersonal ? 2 : 0;

    switch (transit.phaseContribution) {
      case 'containment':
        containment += tightness + personalBonus;
        break;
      case 'stress':
        stress += tightness + personalBonus + 1; // Pluto gets extra weight
        break;
      case 'release':
        release += tightness + personalBonus;
        break;
      case 'trigger':
        trigger += tightness;
        break;
    }
  }

  return { containment_score: containment, stress_score: stress, release_score: release, trigger_score: trigger };
}

// ============== FOCUSED TRANSIT WINDOWS - Individual transits, not clusters ==============

export function generateFocusedTransitWindows(
  chart: NatalChart,
  yearsBack: number = 3,
  yearsForward: number = 3
): FocusedTransitWindow[] {
  const windows: FocusedTransitWindow[] = [];
  const transitPlanets: TransitingPlanet[] = ['Saturn', 'Pluto', 'Uranus'];
  const natalTargets = [...PERSONAL_PLANETS, 'Saturn', 'Ascendant'];

  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - yearsBack);
  const endDate = new Date(today);
  endDate.setFullYear(today.getFullYear() + yearsForward);

  for (const transitPlanet of transitPlanets) {
    for (const natalTarget of natalTargets) {
      const natalData = chart.planets[natalTarget as keyof typeof chart.planets];
      if (!natalData || !natalData.sign) continue;

      const natalDegree = getPlanetAbsoluteDegree(natalData);
      const natalHouse = chart.houseCusps ? getHouseFromDegree(natalDegree, chart.houseCusps) : 1;

      // Scan for each aspect type
      for (const aspectType of ['conjunction', 'opposition', 'square'] as AspectType[]) {
        const aspectAngle = aspectType === 'conjunction' ? 0 : aspectType === 'opposition' ? 180 : 90;
        const targetDegree = (natalDegree + aspectAngle) % 360;

        // Find when this transit happens
        const transitEvents = findTransitPasses(transitPlanet, targetDegree, startDate, endDate);
        
        if (transitEvents.length > 0) {
          const firstPass = transitEvents[0];
          const lastPass = transitEvents[transitEvents.length - 1];
          const peakDate = transitEvents.find(e => e.type === 'exact')?.date || firstPass.date;
          
          const transitInfo = TRANSIT_NARRATIVES[transitPlanet];

          windows.push({
            id: `${transitPlanet}-${aspectType}-${natalTarget}-${firstPass.date.getTime()}`,
            transitPlanet,
            aspectType,
            natalTarget,
            startDate: firstPass.date,
            endDate: lastPass.date,
            exactDates: transitEvents.filter(e => e.type === 'exact').map(e => e.date),
            peakDate,
            houseNatal: natalHouse,
            axis: AXIS_MAP[natalHouse] || '1st↔7th',
            phaseType: transitInfo.phase,
            narrative: transitInfo.narrative(aspectType, natalTarget),
            isPast: lastPass.date < today,
            isCurrent: firstPass.date <= today && lastPass.date >= today,
            isUpcoming: firstPass.date > today
          });
        }
      }
    }
  }

  // Sort by date
  return windows.sort((a, b) => a.peakDate.getTime() - b.peakDate.getTime());
}

function findTransitPasses(
  planet: TransitingPlanet,
  targetDegree: number,
  startDate: Date,
  endDate: Date
): { date: Date; type: 'exact' | 'retrograde_pass' | 'direct_pass' }[] {
  const events: { date: Date; type: 'exact' | 'retrograde_pass' | 'direct_pass' }[] = [];
  
  const getSide = (lon: number, target: number): number => {
    let diff = lon - target;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  };

  let currentDate = new Date(startDate);
  let previousLongitude = getTransitingPlanetPosition(planet, currentDate);
  let previousSide = getSide(previousLongitude, targetDegree);

  while (currentDate <= endDate) {
    const currentLongitude = getTransitingPlanetPosition(planet, currentDate);
    const currentSide = getSide(currentLongitude, targetDegree);

    if (previousSide * currentSide < 0) {
      // Binary search for exact crossing
      let lowDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      let highDate = new Date(currentDate);
      
      for (let i = 0; i < 8; i++) {
        const midTime = (lowDate.getTime() + highDate.getTime()) / 2;
        const midDate = new Date(midTime);
        const midLon = getTransitingPlanetPosition(planet, midDate);
        const midSide = getSide(midLon, targetDegree);
        
        if (midSide * previousSide > 0) {
          lowDate = midDate;
        } else {
          highDate = midDate;
        }
      }

      const exactDate = new Date((lowDate.getTime() + highDate.getTime()) / 2);
      const isMovingForward = currentSide > previousSide;
      
      let type: 'exact' | 'retrograde_pass' | 'direct_pass';
      if (events.length === 0) {
        type = 'exact';
      } else if (!isMovingForward) {
        type = 'retrograde_pass';
      } else {
        type = 'direct_pass';
      }

      events.push({ date: exactDate, type });
    }

    previousLongitude = currentLongitude;
    previousSide = currentSide;
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return events;
}

// ============== LEGACY SUPPORT - clusterEventsIntoWindows (for backward compatibility) ==============

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

        current.setDate(current.getDate() + (transitPlanet === 'Mars' ? 1 : 7));
      }
    }
  }

  return events.sort((a, b) => a.start_date.getTime() - b.start_date.getTime());
}

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
      currentWindow.push(event);
      if (event.end_date > windowEnd) {
        windowEnd = event.end_date;
      }
    } else {
      if (currentWindow.length > 0 && windowStart && windowEnd) {
        windows.push(createWindow(currentWindow, windowStart, windowEnd));
      }
      windowStart = event.start_date;
      windowEnd = event.end_date;
      currentWindow = [event];
    }
  }

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

function calculatePhaseScores(events: TransitEvent[]): PhaseScores {
  let containment = 0, stress = 0, release = 0, trigger = 0;

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
      case 'Neptune':
        release += isHard ? 2 : 1;
        break;
      case 'Mars':
        trigger += 2;
        if (events.some(e => e.transiting_planet !== 'Mars' && 
            Math.abs((e.exact_dates[0]?.getTime() || 0) - (event.exact_dates[0]?.getTime() || 0)) < 7 * 24 * 60 * 60 * 1000)) {
          trigger += 2;
        }
        break;
      case 'NorthNode':
      case 'SouthNode':
        trigger += 2;
        break;
    }
  }

  return { containment_score: containment, stress_score: stress, release_score: release, trigger_score: trigger };
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

  const phaseSummary = `${phase.body} ${axisHeadline ? axisHeadline.question : ''} ${modeVariant.tone}`;

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

  const manifestations: string[] = [];
  for (const event of window.events.slice(0, 3)) {
    const houseMani = MANIFESTATION_BY_HOUSE[event.house_activated.natal];
    if (houseMani) {
      manifestations.push(houseMani[Math.floor(Math.random() * houseMani.length)]);
    }
  }

  const actions = [...ACTION_TEMPLATES[window.phase_label]];
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

// ============== MAIN ENTRY POINT ==============

export function generateStructuralAnalysis(
  chart: NatalChart,
  yearsBack: number = 5,
  yearsForward: number = 5
): {
  signature: ChartSignature;
  windows: StructuralWindow[];
  saturnCards: SaturnLensCard[];
  focusedWindows: FocusedTransitWindow[];
} {
  const signature = extractChartSignature(chart);
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - yearsBack);
  const endDate = new Date(today);
  endDate.setFullYear(today.getFullYear() + yearsForward);

  const events = detectTransitEvents(chart, startDate, endDate);
  const windows = clusterEventsIntoWindows(events);

  for (const window of windows) {
    window.output_copy = generateWindowCopy(window, signature, window.meaning_dial_mode);
    window.action_steps = window.output_copy.actions;
  }

  const saturnCards = generateSaturnLensCards(signature);
  const focusedWindows = generateFocusedTransitWindows(chart, yearsBack, yearsForward);

  return { signature, windows, saturnCards, focusedWindows };
}
