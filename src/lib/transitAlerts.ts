/**
 * Transit Alerts System
 * 
 * Detects when major transits are exact or approaching personal planets
 * and generates alerts for significant astrological events.
 */

import { getPlanetaryPositions, PlanetaryPositions } from './astrology';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Personal planets that receive alerts
const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant'];

// Outer planets that make significant transits
const TRANSIT_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'];

// Also include faster planets for near-term alerts
const FAST_TRANSIT_PLANETS = ['Mars', 'Venus', 'Mercury', 'Sun'];

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertType = 'exact' | 'approaching' | 'separating';

export interface AngleAspect {
  angle: 'AC' | 'IC' | 'DC' | 'MC';
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  isExact: boolean;
  motion: 'applying' | 'separating' | 'exact';
}

export interface TransitAlert {
  id: string;
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  alertType: AlertType;
  motion: 'applying' | 'separating' | 'exact';
  priority: AlertPriority;
  exactDate: Date | null;
  daysUntilExact: number | null;
  title: string;
  description: string;
  advice: string;
  transitSign: string;
  natalSign: string;
  isOuterPlanet: boolean;
  angleAspects: AngleAspect[]; // Also hitting these angles
}

// Aspect definitions
const ASPECT_DEFS = [
  { angle: 0, name: 'conjunction', symbol: '☌', orb: 8, alertOrb: 3 },
  { angle: 180, name: 'opposition', symbol: '☍', orb: 8, alertOrb: 3 },
  { angle: 90, name: 'square', symbol: '□', orb: 7, alertOrb: 2 },
  { angle: 120, name: 'trine', symbol: '△', orb: 8, alertOrb: 3 },
  { angle: 60, name: 'sextile', symbol: '⚹', orb: 6, alertOrb: 2 },
];

// Transit interpretations for alerts
const TRANSIT_MESSAGES: Record<string, Record<string, { title: string; desc: string; advice: string }>> = {
  'Jupiter': {
    'Sun': { 
      title: 'Expansion & Opportunity', 
      desc: 'Jupiter brings growth, luck, and new horizons to your sense of self and life direction.',
      advice: 'Say yes to opportunities. Think bigger. Travel, learn, expand.'
    },
    'Moon': { 
      title: 'Emotional Abundance', 
      desc: 'Feelings of optimism and emotional generosity flow. Home and family may expand.',
      advice: 'Trust your emotional wisdom. Nurture yourself and others generously.'
    },
    'Venus': { 
      title: 'Love & Abundance', 
      desc: 'Romance, creativity, and financial luck are amplified. Beauty attracts.',
      advice: 'Pursue love, art, and pleasure. Invest in beauty and relationships.'
    },
    'Mars': { 
      title: 'Bold Action', 
      desc: 'Confidence and drive are super-charged. Great for ambitious projects.',
      advice: 'Take initiative on big goals. Channel energy into expansion.'
    },
    'default': { 
      title: 'Jupiter Transit', 
      desc: 'Expansion and growth energy activates this area of your chart.',
      advice: 'Be open to opportunities and think bigger.'
    }
  },
  'Saturn': {
    'Sun': { 
      title: 'Reality Check', 
      desc: 'Saturn tests your foundations and asks for maturity and responsibility.',
      advice: 'Face challenges with discipline. Build lasting structures.'
    },
    'Moon': { 
      title: 'Emotional Boundaries', 
      desc: 'Time to mature emotionally. May feel restricted but builds resilience.',
      advice: 'Set healthy boundaries. Face emotional realities with patience.'
    },
    'Venus': { 
      title: 'Love Lessons', 
      desc: 'Relationships tested for authenticity. Commitment or release.',
      advice: 'Be realistic about love. Commit to what\'s real.'
    },
    'default': { 
      title: 'Saturn Transit', 
      desc: 'Structure, discipline, and maturity are called for.',
      advice: 'Work hard, be patient, build foundations.'
    }
  },
  'Uranus': {
    'Sun': { 
      title: 'Liberation & Awakening', 
      desc: 'Radical changes to identity possible. Expect the unexpected.',
      advice: 'Embrace change. Be authentic. Freedom is calling.'
    },
    'Moon': { 
      title: 'Emotional Revolution', 
      desc: 'Sudden shifts in feelings, home, or habits. Liberation from old patterns.',
      advice: 'Allow emotional breakthroughs. Don\'t cling to the past.'
    },
    'Venus': { 
      title: 'Relationship Shake-Up', 
      desc: 'Love life electrified. New attractions or sudden changes in relationships.',
      advice: 'Stay flexible in love. Exciting changes are possible.'
    },
    'default': { 
      title: 'Uranus Transit', 
      desc: 'Revolutionary energy brings sudden changes and breakthroughs.',
      advice: 'Expect surprises. Be open to radical change.'
    }
  },
  'Neptune': {
    'Sun': { 
      title: 'Spiritual Awakening', 
      desc: 'Idealism heightens but boundaries blur. Creative and spiritual peak.',
      advice: 'Follow your dreams but stay grounded. Trust intuition.'
    },
    'Moon': { 
      title: 'Psychic Sensitivity', 
      desc: 'Heightened intuition and empathy. May feel emotionally porous.',
      advice: 'Protect your energy. Use creativity as outlet.'
    },
    'Venus': { 
      title: 'Romantic Dreams', 
      desc: 'Love feels magical but watch for illusion. Art and spirituality bloom.',
      advice: 'Enjoy romance but keep perspective. Create beauty.'
    },
    'default': { 
      title: 'Neptune Transit', 
      desc: 'Dreams, intuition, and spirituality are heightened.',
      advice: 'Trust your inner guidance but verify reality.'
    }
  },
  'Pluto': {
    'Sun': { 
      title: 'Deep Transformation', 
      desc: 'Profound identity shift. Death and rebirth of self-concept.',
      advice: 'Surrender to transformation. Reclaim your power.'
    },
    'Moon': { 
      title: 'Emotional Purge', 
      desc: 'Deep psychological work. Old emotional patterns die for renewal.',
      advice: 'Face shadows. Therapy and deep inner work are powerful now.'
    },
    'Venus': { 
      title: 'Intense Love', 
      desc: 'Obsessive or transformative relationships. Power dynamics surface.',
      advice: 'Examine relationship patterns. Transform through love.'
    },
    'default': { 
      title: 'Pluto Transit', 
      desc: 'Deep transformation and power dynamics are activated.',
      advice: 'Embrace death and rebirth. Release what no longer serves.'
    }
  },
  'default': {
    'default': { 
      title: 'Transit Active', 
      desc: 'A significant planetary transit is affecting your chart.',
      advice: 'Pay attention to themes related to these planets.'
    }
  }
};

/**
 * Convert natal position to ecliptic longitude
 */
function natalToLongitude(pos: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
}

/**
 * Get transit planet longitude from positions
 */
function getTransitLongitude(positions: PlanetaryPositions, planet: string): { longitude: number; sign: string } | null {
  const key = planet.toLowerCase() as keyof PlanetaryPositions;
  const pos = positions[key];
  if (!pos || typeof pos !== 'object' || !('signName' in pos)) return null;
  
  const signIndex = ZODIAC_SIGNS.indexOf(pos.signName);
  if (signIndex === -1) return null;
  
  return {
    longitude: signIndex * 30 + pos.degree,
    sign: pos.signName
  };
}

/**
 * Calculate angular difference (0-180)
 */
function angleDiff(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Estimate days until exact aspect
 */
function estimateDaysUntilExact(
  transitPlanet: string,
  currentOrb: number,
  isApproaching: boolean
): number | null {
  if (!isApproaching) return null;
  
  // Average daily motion in degrees
  const dailyMotion: Record<string, number> = {
    'Sun': 1,
    'Moon': 13,
    'Mercury': 1.5,
    'Venus': 1.2,
    'Mars': 0.5,
    'Jupiter': 0.08,
    'Saturn': 0.03,
    'Uranus': 0.01,
    'Neptune': 0.006,
    'Pluto': 0.004,
    'Chiron': 0.02
  };
  
  const motion = dailyMotion[transitPlanet] || 0.1;
  return Math.round(currentOrb / motion);
}

/**
 * Determine alert priority based on planets and orb
 */
function determineAlertPriority(
  transitPlanet: string,
  natalPlanet: string,
  orb: number,
  isExact: boolean
): AlertPriority {
  const isOuter = TRANSIT_PLANETS.includes(transitPlanet);
  const isPersonal = ['Sun', 'Moon', 'Ascendant'].includes(natalPlanet);
  
  if (isExact && isOuter && isPersonal) return 'critical';
  if (isExact && isOuter) return 'high';
  if (orb <= 1 && isOuter) return 'high';
  if (orb <= 2 && isOuter) return 'medium';
  if (isExact) return 'medium';
  return 'low';
}

/**
 * Get transit message for planet pair
 */
function getTransitMessage(transitPlanet: string, natalPlanet: string): { title: string; desc: string; advice: string } {
  const planetMessages = TRANSIT_MESSAGES[transitPlanet] || TRANSIT_MESSAGES['default'];
  return planetMessages[natalPlanet] || planetMessages['default'];
}

/**
 * Get angle longitude from house cusps
 */
function getAngleLongitude(
  houseCusps: NatalChart['houseCusps'], 
  angle: 'AC' | 'IC' | 'DC' | 'MC'
): number | null {
  if (!houseCusps) return null;
  
  const houseKey = angle === 'AC' ? 'house1' :
                   angle === 'IC' ? 'house4' :
                   angle === 'DC' ? 'house7' :
                   angle === 'MC' ? 'house10' : null;
  
  if (!houseKey) return null;
  
  const cusp = houseCusps[houseKey as keyof typeof houseCusps];
  if (!cusp) return null;
  
  const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
  if (signIndex === -1) return null;
  
  return signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60;
}

/**
 * Find angle aspects for a transit planet
 */
function findAngleAspects(
  transitLongitude: number,
  futureTransitLongitude: number,
  houseCusps: NatalChart['houseCusps']
): AngleAspect[] {
  const aspects: AngleAspect[] = [];
  const angles: Array<'AC' | 'IC' | 'DC' | 'MC'> = ['AC', 'IC', 'DC', 'MC'];
  
  for (const angle of angles) {
    const angleLon = getAngleLongitude(houseCusps, angle);
    if (angleLon === null) continue;
    
    const currentDiff = angleDiff(transitLongitude, angleLon);
    const futureDiff = angleDiff(futureTransitLongitude, angleLon);
    
    for (const aspectDef of ASPECT_DEFS) {
      const currentOrb = Math.abs(currentDiff - aspectDef.angle);
      const futureOrb = Math.abs(futureDiff - aspectDef.angle);
      
      // Wider orb for angles - they're important
      if (currentOrb <= 3) {
        const isExact = currentOrb <= 0.5;
        const isApproaching = futureOrb < currentOrb;
        
        let motion: 'applying' | 'separating' | 'exact' = 'separating';
        if (isExact) motion = 'exact';
        else if (isApproaching) motion = 'applying';
        
        aspects.push({
          angle,
          aspectType: aspectDef.name,
          aspectSymbol: aspectDef.symbol,
          orb: Math.round(currentOrb * 100) / 100,
          isExact,
          motion
        });
      }
    }
  }
  
  return aspects;
}

/**
 * Calculate transit alerts for a natal chart
 */
export function calculateTransitAlerts(
  natalChart: NatalChart,
  date: Date = new Date()
): TransitAlert[] {
  const alerts: TransitAlert[] = [];
  const positions = getPlanetaryPositions(date);
  
  // Check both outer and fast transiting planets
  const allTransitPlanets = [...TRANSIT_PLANETS, ...FAST_TRANSIT_PLANETS];
  
  // Get future positions (1 day later) for motion detection
  const futureDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const futurePositions = getPlanetaryPositions(futureDate);
  
  for (const transitPlanet of allTransitPlanets) {
    const transitData = getTransitLongitude(positions, transitPlanet);
    const futureTransitData = getTransitLongitude(futurePositions, transitPlanet);
    if (!transitData || !futureTransitData) continue;
    
    // Find any angle aspects for this transit planet
    const angleAspects = findAngleAspects(
      transitData.longitude, 
      futureTransitData.longitude, 
      natalChart.houseCusps
    );
    
    // Check against personal natal planets
    for (const natalPlanetName of PERSONAL_PLANETS) {
      const natalPos = natalChart.planets[natalPlanetName as keyof typeof natalChart.planets];
      if (!natalPos) continue;
      
      const natalLon = natalToLongitude(natalPos);
      const currentDiff = angleDiff(transitData.longitude, natalLon);
      const futureDiff = angleDiff(futureTransitData.longitude, natalLon);
      
      // Check each aspect
      for (const aspectDef of ASPECT_DEFS) {
        const currentOrb = Math.abs(currentDiff - aspectDef.angle);
        const futureOrb = Math.abs(futureDiff - aspectDef.angle);
        
        // Only alert if within alert orb (tighter than aspect orb)
        if (currentOrb <= aspectDef.alertOrb) {
          const isExact = currentOrb <= 0.5;
          const isApproaching = futureOrb < currentOrb;
          const isSeparating = futureOrb > currentOrb;
          
          const alertType: AlertType = isExact ? 'exact' : isApproaching ? 'approaching' : 'separating';
          const motion: 'applying' | 'separating' | 'exact' = isExact ? 'exact' : isApproaching ? 'applying' : 'separating';
          const isOuterPlanet = TRANSIT_PLANETS.includes(transitPlanet);
          
          // Skip separating aspects for fast planets
          if (isSeparating && !isOuterPlanet) continue;
          
          const priority = determineAlertPriority(transitPlanet, natalPlanetName, currentOrb, isExact);
          const message = getTransitMessage(transitPlanet, natalPlanetName);
          const daysUntilExact = estimateDaysUntilExact(transitPlanet, currentOrb, isApproaching);
          
          // Calculate exact date estimate
          let exactDate: Date | null = null;
          if (daysUntilExact !== null) {
            exactDate = new Date(date.getTime() + daysUntilExact * 24 * 60 * 60 * 1000);
          } else if (isExact) {
            exactDate = date;
          }
          
          alerts.push({
            id: `${transitPlanet}-${natalPlanetName}-${aspectDef.name}`,
            transitPlanet,
            natalPlanet: natalPlanetName,
            aspectType: aspectDef.name,
            aspectSymbol: aspectDef.symbol,
            orb: Math.round(currentOrb * 100) / 100,
            alertType,
            motion,
            priority,
            exactDate,
            daysUntilExact,
            title: message.title,
            description: message.desc,
            advice: message.advice,
            transitSign: transitData.sign,
            natalSign: natalPos.sign,
            isOuterPlanet,
            angleAspects // Include angle connections
          });
        }
      }
    }
  }
  
  // Sort by priority and orb
  const priorityOrder: Record<AlertPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return alerts.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.orb - b.orb;
  });
}

/**
 * Get alert emoji based on priority and type
 */
export function getAlertEmoji(alert: TransitAlert): string {
  if (alert.alertType === 'exact') return '⚡';
  if (alert.priority === 'critical') return '🔴';
  if (alert.priority === 'high') return '🟠';
  if (alert.priority === 'medium') return '🟡';
  return '🔵';
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: AlertPriority): string {
  const labels: Record<AlertPriority, string> = {
    critical: 'Critical',
    high: 'Important',
    medium: 'Moderate',
    low: 'Minor'
  };
  return labels[priority];
}

/**
 * Get motion label
 */
export function getMotionLabel(motion: 'applying' | 'separating' | 'exact'): string {
  const labels = {
    applying: '↗ Applying',
    separating: '↘ Separating',
    exact: '⚡ Exact'
  };
  return labels[motion];
}
