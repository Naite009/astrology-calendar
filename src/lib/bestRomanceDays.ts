/**
 * Best Romance Days Calculator
 * 
 * Identifies the top romantic days in a given period by combining
 * biorhythm romance readiness with astrological indicators.
 */

import { getRomanceReadiness } from './dailySynthesis';
import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, Aspect } from './astrology';
import { getCompatibility } from './biorhythms';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';

export interface RomanceDay {
  date: Date;
  score: number;
  rating: 1 | 2 | 3 | 4 | 5;
  highlights: string[];
  moonPhase: string;
  moonSign: string;
  venusAspects: Aspect[];
  biorhythmEnergy: number;
  bestFor: string[];
  romanticMood: 'passionate' | 'dreamy' | 'playful' | 'deep' | 'sensual' | 'adventurous';
}

export interface BestRomanceDaysResult {
  topDays: RomanceDay[];
  period: { start: Date; end: Date };
  recommendation: string;
}

// Signs that enhance romance
const ROMANTIC_MOON_SIGNS = {
  'Libra': { boost: 15, mood: 'harmonious', activities: ['Romantic dinner', 'Partnership talks'] },
  'Taurus': { boost: 12, mood: 'sensual', activities: ['Sensual experiences', 'Quality time'] },
  'Leo': { boost: 10, mood: 'passionate', activities: ['Grand gestures', 'Creative dates'] },
  'Cancer': { boost: 10, mood: 'nurturing', activities: ['Home dates', 'Emotional bonding'] },
  'Pisces': { boost: 8, mood: 'dreamy', activities: ['Spiritual connection', 'Fantasy'] },
  'Scorpio': { boost: 8, mood: 'intense', activities: ['Deep intimacy', 'Transformation'] },
  'Sagittarius': { boost: 5, mood: 'adventurous', activities: ['Adventure dates', 'Travel'] },
  'Gemini': { boost: 3, mood: 'playful', activities: ['Fun activities', 'Communication'] },
  'Aries': { boost: 5, mood: 'passionate', activities: ['Spontaneous dates', 'Physical activity'] },
  'Aquarius': { boost: 0, mood: 'unconventional', activities: ['Unique experiences'] },
  'Capricorn': { boost: -2, mood: 'practical', activities: ['Long-term planning'] },
  'Virgo': { boost: -3, mood: 'analytical', activities: ['Acts of service'] }
};

// Venus aspects that boost romance
const VENUS_ASPECT_BOOSTS: Record<string, Record<string, Record<string, number>>> = {
  'Venus': {
    'Moon': { conjunction: 15, trine: 12, sextile: 8, opposition: 5, square: 2 },
    'Mars': { conjunction: 20, trine: 15, sextile: 10, opposition: 12, square: 8 },
    'Jupiter': { conjunction: 12, trine: 10, sextile: 7, opposition: 5, square: 3 },
    'Neptune': { conjunction: 10, trine: 8, sextile: 5, opposition: 3, square: 0 },
    'Pluto': { conjunction: 8, trine: 6, sextile: 4, opposition: 5, square: 3 },
    'Sun': { conjunction: 8, trine: 6, sextile: 4, opposition: 3, square: 2 }
  }
};

/**
 * Calculate romance score for a single day
 */
function calculateDayRomanceScore(
  date: Date,
  birthDate: Date | null,
  partnerBirthDate: Date | null
): RomanceDay {
  let score = 50; // Base score
  const highlights: string[] = [];
  let bestFor: string[] = [];
  
  // Get moon data
  const moonPhase = getMoonPhase(date);
  const planets = getPlanetaryPositions(date);
  const aspects = calculateDailyAspects(planets);
  const moonSign = planets.moon?.sign || 'Unknown';
  
  // Moon phase bonuses
  if (moonPhase.phaseName === 'Full Moon') {
    score += 10;
    highlights.push('Full Moon illuminates romance');
  } else if (moonPhase.phaseName === 'New Moon') {
    score += 5;
    highlights.push('New Moon for new beginnings');
  } else if (moonPhase.phaseName === 'Waxing Crescent' || moonPhase.phaseName === 'Waxing Gibbous') {
    score += 3;
    highlights.push('Growing moon builds connection');
  }
  
  // Moon sign bonuses
  const moonInfo = ROMANTIC_MOON_SIGNS[moonSign as keyof typeof ROMANTIC_MOON_SIGNS];
  if (moonInfo) {
    score += moonInfo.boost;
    if (moonInfo.boost >= 8) {
      highlights.push(`Moon in ${moonSign}: ${moonInfo.mood} energy`);
    }
    bestFor = [...bestFor, ...moonInfo.activities];
  }
  
  // Venus aspects
  const venusAspects = aspects.filter(a => 
    a.planet1 === 'Venus' || a.planet2 === 'Venus'
  );
  
  venusAspects.forEach(aspect => {
    const otherPlanet = aspect.planet1 === 'Venus' ? aspect.planet2 : aspect.planet1;
    const boosts = VENUS_ASPECT_BOOSTS['Venus'][otherPlanet];
    if (boosts) {
      const aspectType = aspect.type.toLowerCase();
      const boost = boosts[aspectType] || 0;
      score += boost;
      
      if (boost >= 10) {
        highlights.push(`Venus ${aspect.type.toLowerCase()} ${otherPlanet}`);
      }
    }
  });
  
  // Mars aspects (passion)
  const marsVenusAspect = aspects.find(a => 
    (a.planet1 === 'Mars' && a.planet2 === 'Venus') ||
    (a.planet1 === 'Venus' && a.planet2 === 'Mars')
  );
  if (marsVenusAspect) {
    score += 15;
    highlights.push('Mars-Venus: peak passion day');
    bestFor.push('Physical intimacy');
  }
  
  // Biorhythm component (solo or compatibility)
  let biorhythmEnergy = 50;
  
  if (birthDate && partnerBirthDate) {
    // Compatibility mode
    const compat = getCompatibility(birthDate, partnerBirthDate, date);
    biorhythmEnergy = compat.passion;
    const bioBoost = (biorhythmEnergy - 50) * 0.4;
    score += bioBoost;
    
    if (compat.passion >= 70) {
      highlights.push('High biorhythm passion sync');
    }
    if (compat.emotional >= 70) {
      highlights.push('Emotional rhythms aligned');
    }
  } else if (birthDate) {
    // Solo mode
    const romance = getRomanceReadiness(birthDate, date);
    biorhythmEnergy = romance.overallEnergy;
    const bioBoost = (biorhythmEnergy - 50) * 0.3;
    score += bioBoost;
    
    if (romance.overallEnergy >= 70) {
      highlights.push('Personal romantic energy peaks');
    }
    if (romance.magnetism >= 70) {
      highlights.push('High magnetism for attraction');
    }
  }
  
  // Normalize score
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine rating (1-5 stars)
  let rating: 1 | 2 | 3 | 4 | 5;
  if (score >= 80) rating = 5;
  else if (score >= 70) rating = 4;
  else if (score >= 55) rating = 3;
  else if (score >= 40) rating = 2;
  else rating = 1;
  
  // Determine romantic mood
  let romanticMood: RomanceDay['romanticMood'] = 'playful';
  if (marsVenusAspect || moonSign === 'Scorpio') {
    romanticMood = 'passionate';
  } else if (moonSign === 'Pisces' || moonSign === 'Cancer') {
    romanticMood = 'dreamy';
  } else if (moonSign === 'Taurus') {
    romanticMood = 'sensual';
  } else if (moonSign === 'Sagittarius' || moonSign === 'Aries') {
    romanticMood = 'adventurous';
  } else if (moonSign === 'Scorpio' || moonSign === 'Capricorn') {
    romanticMood = 'deep';
  }
  
  // Ensure unique best activities
  bestFor = [...new Set(bestFor)].slice(0, 4);
  if (bestFor.length === 0) {
    bestFor = ['Quality time', 'Casual date'];
  }
  
  return {
    date,
    score,
    rating,
    highlights: highlights.slice(0, 4),
    moonPhase: moonPhase.phaseName,
    moonSign,
    venusAspects,
    biorhythmEnergy,
    bestFor,
    romanticMood
  };
}

/**
 * Get the top 5 best romance days in the next N days
 */
export function getBestRomanceDays(
  birthDate: Date | null,
  partnerBirthDate: Date | null = null,
  startDate: Date = new Date(),
  days: number = 30
): BestRomanceDaysResult {
  const allDays: RomanceDay[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setHours(12, 0, 0, 0); // Normalize to noon
    
    const dayScore = calculateDayRomanceScore(date, birthDate, partnerBirthDate);
    allDays.push(dayScore);
  }
  
  // Sort by score descending
  allDays.sort((a, b) => b.score - a.score);
  
  // Take top 5
  const topDays = allDays.slice(0, 5);
  
  // Sort top days by date for display
  topDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Generate recommendation
  let recommendation = '';
  const bestDay = allDays[0];
  if (bestDay.score >= 80) {
    recommendation = `${format(bestDay.date, 'EEEE, MMMM d')} is your ideal romance day! Mark your calendar.`;
  } else if (bestDay.score >= 65) {
    recommendation = `Good romantic energy ahead. ${format(bestDay.date, 'MMMM d')} looks especially promising.`;
  } else {
    recommendation = `Moderate romantic energy this period. Focus on building connection gradually.`;
  }
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  
  return {
    topDays,
    period: { start: startDate, end: endDate },
    recommendation
  };
}

/**
 * Get mood emoji
 */
export function getMoodEmoji(mood: RomanceDay['romanticMood']): string {
  const emojis: Record<string, string> = {
    passionate: '🔥',
    dreamy: '✨',
    playful: '🎭',
    deep: '🌙',
    sensual: '🌹',
    adventurous: '⚡'
  };
  return emojis[mood] || '💕';
}

/**
 * Get rating display (stars)
 */
export function getRatingStars(rating: 1 | 2 | 3 | 4 | 5): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}
