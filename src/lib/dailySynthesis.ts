/**
 * Daily Synthesis Library
 * 
 * Combines biorhythm data with astrological influences to create
 * a unified "Power Score" and cosmic weather assessment for each day.
 */

import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, getVoidOfCourseMoon, Aspect, MoonPhase } from './astrology';
import { getAllBiorhythms, getBiorhythmState, BIORHYTHM_CYCLES, BiorhythmValue } from './biorhythms';
import { calculateTransitAspects, TransitAspect } from './transitAspects';
import { NatalChart } from '@/hooks/useNatalChart';

export type CosmicWeather = 'Stormy' | 'Flowing' | 'Electric' | 'Grounded' | 'Dreamy' | 'Fiery' | 'Transformative';

export interface DailyPowerSummary {
  powerScore: number; // 0-100
  biorhythmContribution: {
    score: number;
    highlights: string[];
    hasCritical: boolean;
    peakCycles: string[];
  };
  astrologyContribution: {
    score: number;
    moonPhase: string;
    moonSign: string;
    moonIllumination: number;
    isVoidOfCourse: boolean;
    exactAspects: Aspect[];
    majorAspects: Aspect[];
    personalTransits?: TransitAspect[];
  };
  synthesis: string;
  bestFor: string[];
  cautions: string[];
  cosmicWeather: CosmicWeather;
}

export interface SecondaryCycle {
  name: string;
  value: number;
  components: string[];
  color: string;
  icon: string;
  description: string;
}

export interface RomanceReadiness {
  passionScore: number;       // P + E average
  heartOpenness: number;      // Emotional cycle
  magnetism: number;          // Physical cycle
  intuition: number;          // Intuitive cycle
  overallEnergy: number;      // Weighted combination
  bestActivities: string[];
  recommendation: string;
}

// Secondary cycle definitions combining primary cycles
export const SECONDARY_CYCLES = {
  mastery: {
    name: 'Mastery',
    components: ['emotional', 'intellectual'],
    color: 'hsl(280 70% 50%)',
    icon: '🎯',
    description: 'Learning and skill development - when Emotional + Intellectual align'
  },
  passion: {
    name: 'Passion',
    components: ['physical', 'emotional'],
    color: 'hsl(350 80% 55%)',
    icon: '🔥',
    description: 'Drive and enthusiasm - when Physical + Emotional align'
  },
  wisdom: {
    name: 'Wisdom',
    components: ['intellectual', 'intuitive'],
    color: 'hsl(220 70% 50%)',
    icon: '🦉',
    description: 'Deep insight and understanding - when Intellectual + Intuitive align'
  },
  awareness: {
    name: 'Awareness',
    components: ['physical', 'intuitive'],
    color: 'hsl(45 90% 50%)',
    icon: '👁️',
    description: 'Mind-body connection and presence - when Physical + Intuitive align'
  },
  aesthetic: {
    name: 'Aesthetic',
    components: ['emotional', 'intuitive'],
    color: 'hsl(300 60% 55%)',
    icon: '🎨',
    description: 'Creativity and beauty appreciation - when Emotional + Intuitive align'
  }
};

/**
 * Calculate secondary/composite biorhythm cycles
 */
export function getSecondaryCycles(birthDate: Date, targetDate: Date): SecondaryCycle[] {
  const primary = getAllBiorhythms(birthDate, targetDate, true);
  
  const getValueByName = (name: string): number => {
    const cycle = primary.find(c => c.cycle.toLowerCase() === name);
    return cycle?.value ?? 0;
  };

  return Object.entries(SECONDARY_CYCLES).map(([key, cycle]) => {
    const values = cycle.components.map(c => getValueByName(c));
    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    
    return {
      name: cycle.name,
      value: average,
      components: cycle.components,
      color: cycle.color,
      icon: cycle.icon,
      description: cycle.description
    };
  });
}

/**
 * Get solo romance readiness - personal romantic energy without a partner
 */
export function getRomanceReadiness(birthDate: Date, targetDate: Date): RomanceReadiness {
  const biorhythms = getAllBiorhythms(birthDate, targetDate, true);
  
  const physical = biorhythms.find(b => b.cycle === 'Physical')?.value ?? 0;
  const emotional = biorhythms.find(b => b.cycle === 'Emotional')?.value ?? 0;
  const intuitive = biorhythms.find(b => b.cycle === 'Intuitive')?.value ?? 0;
  
  const passionScore = Math.round((physical + emotional) / 2);
  const heartOpenness = emotional;
  const magnetism = physical;
  const intuition = intuitive;
  
  // Weighted overall with emotional being most important for romance
  const overallEnergy = Math.round((passionScore * 0.4) + (emotional * 0.35) + (intuitive * 0.25));
  
  // Determine best activities based on cycle states
  const bestActivities: string[] = [];
  
  if (physical >= 60 && emotional >= 60) {
    bestActivities.push('Date night', 'Dancing', 'Physical intimacy');
  } else if (physical >= 60) {
    bestActivities.push('Active dates', 'Adventure', 'Meeting new people');
  }
  
  if (emotional >= 60) {
    bestActivities.push('Deep conversations', 'Emotional bonding', 'Romance movies');
  }
  
  if (intuitive >= 60) {
    bestActivities.push('Soulmate connections', 'Spiritual dates', 'Trust intuition');
  }
  
  if (emotional < 0 && physical < 0) {
    bestActivities.push('Self-care', 'Solo time', 'Rest and recharge');
  }
  
  if (bestActivities.length === 0) {
    bestActivities.push('Casual hangouts', 'Low-key activities', 'Friendly connections');
  }
  
  // Generate recommendation
  let recommendation = '';
  if (overallEnergy >= 70) {
    recommendation = 'Your romantic energy is high! You\'re magnetic and emotionally open - great day for love.';
  } else if (overallEnergy >= 40) {
    recommendation = 'Balanced romantic energy. Good for nurturing existing connections.';
  } else if (overallEnergy >= 0) {
    recommendation = 'Romantic energy is moderate. Focus on genuine connection over grand gestures.';
  } else if (emotional >= 30) {
    recommendation = 'Heart is open but physical energy is low. Best for emotional intimacy, not active dates.';
  } else if (physical >= 30) {
    recommendation = 'Physical attraction strong but emotional reserves low. Keep things light and fun.';
  } else {
    recommendation = 'Romance energy is in recovery mode. Best for self-love and recharging.';
  }
  
  return {
    passionScore,
    heartOpenness,
    magnetism,
    intuition,
    overallEnergy,
    bestActivities,
    recommendation
  };
}

/**
 * Get moon sign from moon phase data
 */
function getMoonSign(moonPhase: MoonPhase): string {
  // MoonPhase has sign in zodiacSign property based on the interface
  // We need to calculate moon sign from moon position
  // For now, derive from the moon's ecliptic longitude if available
  // The getMoonPhase function returns illumination and phase name
  // We'll need to calculate the moon sign separately
  const now = new Date();
  const positions = getPlanetaryPositions(now);
  return positions.moon?.sign || 'Unknown';
}

/**
 * Get cosmic weather type based on planetary influences
 */
function getCosmicWeather(aspects: Aspect[], moonSign: string, biorhythms: BiorhythmValue[]): CosmicWeather {
  // Check for challenging outer planet aspects
  const hasChallengingAspects = aspects.some(a => 
    (a.type === 'Square' || a.type === 'Opposition') && 
    (a.planet1 === 'Pluto' || a.planet2 === 'Pluto' || a.planet1 === 'Saturn' || a.planet2 === 'Saturn')
  );
  
  if (hasChallengingAspects) {
    return 'Transformative';
  }
  
  // Check for Uranus activity
  const hasUranusAspects = aspects.some(a => 
    a.planet1 === 'Uranus' || a.planet2 === 'Uranus'
  );
  if (hasUranusAspects) {
    return 'Electric';
  }
  
  // Check for Neptune/water sign moon
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
  if (waterSigns.includes(moonSign)) {
    return 'Dreamy';
  }
  
  // Check for fire sign moon or Mars aspects
  const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
  if (fireSigns.includes(moonSign)) {
    return 'Fiery';
  }
  
  // Check for earth sign moon
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  if (earthSigns.includes(moonSign)) {
    return 'Grounded';
  }
  
  // Check biorhythms for critical days
  const hasCritical = biorhythms.some(b => b.state === 'critical');
  if (hasCritical) {
    return 'Stormy';
  }
  
  // Default to flowing for air signs and harmonious aspects
  return 'Flowing';
}

/**
 * Get activity recommendations based on combined biorhythm and astrology
 */
function getBestActivities(
  biorhythms: BiorhythmValue[], 
  moonSign: string, 
  aspects: Aspect[]
): string[] {
  const activities: string[] = [];
  
  const physical = biorhythms.find(b => b.cycle === 'Physical');
  const emotional = biorhythms.find(b => b.cycle === 'Emotional');
  const intellectual = biorhythms.find(b => b.cycle === 'Intellectual');
  
  // Physical peak activities
  if (physical && physical.state === 'peak') {
    activities.push('Exercise', 'Physical challenges', 'Sports');
  }
  
  // Emotional peak activities
  if (emotional && emotional.state === 'peak') {
    activities.push('Creative projects', 'Social events', 'Relationship talks');
  }
  
  // Intellectual peak activities
  if (intellectual && intellectual.state === 'peak') {
    activities.push('Study', 'Strategic planning', 'Problem solving');
  }
  
  // Venus aspects
  const hasVenusAspect = aspects.some(a => a.planet1 === 'Venus' || a.planet2 === 'Venus');
  if (hasVenusAspect && emotional && emotional.value > 0) {
    activities.push('Romance', 'Art appreciation', 'Beauty rituals');
  }
  
  // Mercury aspects
  const hasMercuryAspect = aspects.some(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury');
  if (hasMercuryAspect && intellectual && intellectual.value > 0) {
    activities.push('Important conversations', 'Writing', 'Learning');
  }
  
  // Jupiter aspects
  const hasJupiterAspect = aspects.some(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter');
  if (hasJupiterAspect) {
    activities.push('Big decisions', 'Expansion', 'Travel planning');
  }
  
  // Moon sign based activities
  switch (moonSign) {
    case 'Aries':
      activities.push('Starting new projects');
      break;
    case 'Taurus':
      activities.push('Financial planning', 'Comfort');
      break;
    case 'Gemini':
      activities.push('Networking', 'Communication');
      break;
    case 'Cancer':
      activities.push('Home activities', 'Family time');
      break;
    case 'Leo':
      activities.push('Self-expression', 'Creativity');
      break;
    case 'Virgo':
      activities.push('Organization', 'Health routines');
      break;
    case 'Libra':
      activities.push('Partnerships', 'Aesthetics');
      break;
    case 'Scorpio':
      activities.push('Deep research', 'Transformation');
      break;
    case 'Sagittarius':
      activities.push('Adventure', 'Philosophy');
      break;
    case 'Capricorn':
      activities.push('Career moves', 'Long-term planning');
      break;
    case 'Aquarius':
      activities.push('Innovation', 'Group activities');
      break;
    case 'Pisces':
      activities.push('Meditation', 'Artistic pursuits');
      break;
  }
  
  // Remove duplicates and limit
  return [...new Set(activities)].slice(0, 5);
}

/**
 * Get cautions based on biorhythm criticals and challenging aspects
 */
function getCautions(
  biorhythms: BiorhythmValue[],
  aspects: Aspect[],
  isVoidOfCourse: boolean
): string[] {
  const cautions: string[] = [];
  
  // Critical cycles
  biorhythms.forEach(b => {
    if (b.state === 'critical') {
      cautions.push(`${b.cycle} cycle at zero crossing`);
    } else if (b.state === 'low') {
      cautions.push(`Low ${b.cycle.toLowerCase()} energy`);
    }
  });
  
  // Void of course moon
  if (isVoidOfCourse) {
    cautions.push('Void of Course Moon - avoid new starts');
  }
  
  // Challenging aspects
  aspects.forEach(a => {
    if (a.type === 'Square' || a.type === 'Opposition') {
      if (a.planet1 === 'Mars' || a.planet2 === 'Mars') {
        cautions.push('Mars tension - watch for conflict');
      }
      if (a.planet1 === 'Saturn' || a.planet2 === 'Saturn') {
        cautions.push('Saturn restriction - patience needed');
      }
    }
  });
  
  return [...new Set(cautions)].slice(0, 4);
}

/**
 * Generate synthesis sentence combining biorhythm and astrology
 */
function generateSynthesis(
  biorhythms: BiorhythmValue[],
  moonPhase: string,
  moonSign: string,
  aspects: Aspect[],
  cosmicWeather: CosmicWeather
): string {
  const peakCycles = biorhythms.filter(b => b.state === 'peak').map(b => b.cycle.toLowerCase());
  const criticalCycles = biorhythms.filter(b => b.state === 'critical').map(b => b.cycle.toLowerCase());
  const average = biorhythms.reduce((sum, b) => sum + b.value, 0) / biorhythms.length;
  
  // Find most significant aspect
  const significantAspect = aspects.find(a => 
    a.planet1 === 'Venus' || a.planet1 === 'Mars' || a.planet1 === 'Jupiter' ||
    a.planet2 === 'Venus' || a.planet2 === 'Mars' || a.planet2 === 'Jupiter'
  );
  
  let synthesis = '';
  
  if (peakCycles.length >= 2) {
    synthesis = `Power day! ${peakCycles.join(' and ')} cycles peak under the ${moonPhase.toLowerCase()} in ${moonSign}.`;
  } else if (peakCycles.length === 1) {
    synthesis = `${peakCycles[0].charAt(0).toUpperCase() + peakCycles[0].slice(1)} energy peaks as the Moon transits ${moonSign}.`;
  } else if (criticalCycles.length > 0) {
    synthesis = `Transition day. ${criticalCycles.join(' and ')} cycling through zero - time for reflection under ${moonSign} Moon.`;
  } else if (average >= 50) {
    synthesis = `Positive flow with the ${moonPhase.toLowerCase()} Moon in ${moonSign}. Cosmic weather: ${cosmicWeather}.`;
  } else if (average <= -30) {
    synthesis = `Lower energy cycle under ${moonSign} Moon. Pace yourself and honor the ${cosmicWeather.toLowerCase()} energy.`;
  } else {
    synthesis = `Balanced day with ${moonSign} Moon energy. ${cosmicWeather} cosmic weather supports steady progress.`;
  }
  
  // Add aspect color if significant
  if (significantAspect) {
    const aspectVerb = significantAspect.type === 'Conjunction' ? 'meets' :
                       significantAspect.type === 'Trine' ? 'flows with' :
                       significantAspect.type === 'Square' ? 'challenges' :
                       significantAspect.type === 'Opposition' ? 'opposes' : 'aspects';
    synthesis += ` ${significantAspect.planet1} ${aspectVerb} ${significantAspect.planet2}.`;
  }
  
  return synthesis;
}

/**
 * Get complete daily power summary combining biorhythms and astrology
 */
export function getDailyPowerSummary(
  birthDate: Date | null,
  targetDate: Date,
  natalChart?: NatalChart | null
): DailyPowerSummary | null {
  if (!birthDate) return null;
  
  // Get biorhythm data
  const biorhythms = getAllBiorhythms(birthDate, targetDate, true);
  const bioAverage = biorhythms.reduce((sum, b) => sum + b.value, 0) / biorhythms.length;
  const normalizedBioScore = Math.round(((bioAverage + 100) / 200) * 100);
  const hasCritical = biorhythms.some(b => b.state === 'critical');
  const peakCycles = biorhythms.filter(b => b.state === 'peak').map(b => b.cycle);
  
  // Get astrology data
  const moonPhase = getMoonPhase(targetDate);
  const planets = getPlanetaryPositions(targetDate);
  const aspects = calculateDailyAspects(planets);
  const voc = getVoidOfCourseMoon(moonPhase);
  
  // Get moon sign from planetary positions
  const moonSign = planets.moon?.sign || 'Unknown';
  
  // Get exact aspects (within 1 degree orb)
  const exactAspects = aspects.filter(a => parseFloat(a.orb) <= 1);
  
  // Calculate astrology score based on aspects quality
  let astroScore = 50; // baseline
  aspects.forEach(a => {
    if (a.type === 'Trine' || a.type === 'Sextile') {
      astroScore += 5;
    } else if (a.type === 'Conjunction') {
      astroScore += 3;
    } else if (a.type === 'Square' || a.type === 'Opposition') {
      astroScore -= 3;
    }
  });
  if (voc.isVOC) astroScore -= 10;
  astroScore = Math.max(0, Math.min(100, astroScore));
  
  // Get personal transits if natal chart provided
  let personalTransits: TransitAspect[] | undefined;
  if (natalChart) {
    personalTransits = calculateTransitAspects(targetDate, planets, natalChart);
  }
  
  // Calculate combined power score
  const powerScore = Math.round((normalizedBioScore * 0.6) + (astroScore * 0.4));
  
  // Determine cosmic weather
  const cosmicWeather = getCosmicWeather(aspects, moonSign, biorhythms);
  
  // Build highlights
  const bioHighlights: string[] = [];
  if (peakCycles.length >= 2) {
    bioHighlights.push(`Double peak: ${peakCycles.join(' + ')}`);
  } else if (peakCycles.length === 1) {
    bioHighlights.push(`${peakCycles[0]} at peak`);
  }
  if (hasCritical) {
    bioHighlights.push('Critical transition day');
  }
  if (bioAverage >= 60) {
    bioHighlights.push('High overall energy');
  }
  
  return {
    powerScore,
    biorhythmContribution: {
      score: normalizedBioScore,
      highlights: bioHighlights,
      hasCritical,
      peakCycles
    },
    astrologyContribution: {
      score: astroScore,
      moonPhase: String(moonPhase.phase),
      moonSign,
      moonIllumination: moonPhase.illumination,
      isVoidOfCourse: voc.isVOC,
      exactAspects,
      majorAspects: aspects.slice(0, 5),
      personalTransits
    },
    synthesis: generateSynthesis(biorhythms, String(moonPhase.phase), moonSign, aspects, cosmicWeather),
    bestFor: getBestActivities(biorhythms, moonSign, aspects),
    cautions: getCautions(biorhythms, aspects, voc.isVOC),
    cosmicWeather
  };
}

/**
 * Get cosmic weather icon
 */
export function getCosmicWeatherIcon(weather: CosmicWeather): string {
  switch (weather) {
    case 'Stormy': return '⛈️';
    case 'Flowing': return '🌊';
    case 'Electric': return '⚡';
    case 'Grounded': return '🌿';
    case 'Dreamy': return '🌙';
    case 'Fiery': return '🔥';
    case 'Transformative': return '🦋';
  }
}

/**
 * Get cosmic weather color
 */
export function getCosmicWeatherColor(weather: CosmicWeather): string {
  switch (weather) {
    case 'Stormy': return 'hsl(var(--muted-foreground))';
    case 'Flowing': return 'hsl(200 80% 50%)';
    case 'Electric': return 'hsl(45 100% 50%)';
    case 'Grounded': return 'hsl(142 76% 36%)';
    case 'Dreamy': return 'hsl(280 70% 60%)';
    case 'Fiery': return 'hsl(15 90% 55%)';
    case 'Transformative': return 'hsl(330 70% 50%)';
  }
}

