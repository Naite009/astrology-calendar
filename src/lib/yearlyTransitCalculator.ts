// Yearly Transit Calculator - Calculates transits dynamically using ephemeris
// This replaces static PDF data with real-time calculations for any chart

import * as Astronomy from 'astronomy-engine';
import { NatalChart } from '@/hooks/useNatalChart';
import { signDegreesToLongitude } from './houseCalculations';
import { refineExactAspectTime } from './transitMath';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Planet bodies for astronomy-engine
const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

// Aspect definitions - wider orbs for outer planet transits
// Outer planets move slowly, so they stay in orb for extended periods
const ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 5, symbol: '☌' },
  { name: 'opposition', angle: 180, orb: 5, symbol: '☍' },
  { name: 'trine', angle: 120, orb: 4, symbol: '△' },
  { name: 'square', angle: 90, orb: 5, symbol: '□' },
  { name: 'sextile', angle: 60, orb: 3, symbol: '⚹' },
] as const;

export interface YearlyTransitEvent {
  id: string;
  date: Date;
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  aspectSymbol: string;
  orb: number;
  isExact: boolean;
  transitSign: string;
  transitDegree: number;
  natalSign: string;
  natalDegree: number;
  category: 'outer' | 'social' | 'personal';
  significance: 'major' | 'moderate' | 'minor';
  interpretation?: string;
}

export interface MonthSummary {
  month: number;
  year: number;
  transits: YearlyTransitEvent[];
  themes: string[];
}

// Get planetary longitude for a given date
const getPlanetLongitude = (planet: string, date: Date): number => {
  const body = PLANET_BODIES[planet];
  if (!body) return 0;
  
  try {
    const vector = Astronomy.GeoVector(body, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return ((ecliptic.elon % 360) + 360) % 360;
  } catch {
    return 0;
  }
};

// Get Chiron position (approximation using orbital mechanics)
const getChironLongitude = (date: Date): number => {
  const J2000 = new Date('2000-01-01T12:00:00Z');
  const d = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);
  const meanMotion = 360 / (50.42 * 365.25);
  return ((72.16 + d * meanMotion) % 360 + 360) % 360;
};

// Get longitude to sign/degree
const longitudeToSignDegree = (longitude: number): { sign: string; degree: number } => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = normalizedLon % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.floor(degree)
  };
};

// Get natal planet longitude from chart
const getNatalPlanetLongitude = (chart: NatalChart, planetName: string): number | null => {
  const planet = chart.planets[planetName as keyof typeof chart.planets];
  if (!planet?.sign) return null;
  return signDegreesToLongitude(planet.sign, planet.degree, planet.minutes || 0);
};

// Calculate angular distance
const angularDistance = (lon1: number, lon2: number): number => {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return diff;
};

// Get element for a zodiac sign
const getElement = (sign: string): 'fire' | 'earth' | 'air' | 'water' => {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  // const water = ['Cancer', 'Scorpio', 'Pisces'];
  if (fire.includes(sign)) return 'fire';
  if (earth.includes(sign)) return 'earth';
  if (air.includes(sign)) return 'air';
  return 'water';
};

// Validate that aspect makes sense based on element/modality rules
// This prevents false positives where orb math passes but signs don't geometrically align
const isValidAspectBySign = (
  transitSign: string, 
  natalSign: string, 
  aspectName: string
): boolean => {
  const signs = ZODIAC_SIGNS;
  const transitIdx = signs.indexOf(transitSign);
  const natalIdx = signs.indexOf(natalSign);
  if (transitIdx === -1 || natalIdx === -1) return true; // Can't validate, allow
  
  // Calculate sign distance (how many signs apart, shortest path)
  let signDiff = Math.abs(transitIdx - natalIdx);
  if (signDiff > 6) signDiff = 12 - signDiff;
  
  // Strict validation: aspects must match their geometric sign distance
  // Out-of-sign aspects (e.g., 29° Pisces to 1° Aries) are rare and require 
  // very tight orbs - we're stricter here to prevent false positives
  switch (aspectName) {
    case 'conjunction':
      // Conjunction: same sign, or adjacent with very tight orb (out-of-sign)
      return signDiff === 0 || signDiff === 1;
    case 'opposition':
      // Opposition: exactly 6 signs apart
      return signDiff === 6 || signDiff === 5; // Allow 5 for late/early degree situations
    case 'trine':
      // Trine: exactly 4 signs apart (same element: Fire-Fire, Earth-Earth, etc.)
      // Pisces (11) to Sagittarius (8) = 3 signs = NOT a trine
      // Aries (0) to Sagittarius (8) = 4 signs = IS a trine
      return signDiff === 4;
    case 'square':
      // Square: exactly 3 signs apart (same modality)
      return signDiff === 3;
    case 'sextile':
      // Sextile: exactly 2 signs apart
      return signDiff === 2;
    default:
      return true;
  }
};

// Determine transit planet category
const getTransitCategory = (planet: string): 'outer' | 'social' | 'personal' => {
  if (['Pluto', 'Neptune', 'Uranus'].includes(planet)) return 'outer';
  if (['Saturn', 'Jupiter', 'Chiron'].includes(planet)) return 'social';
  return 'personal';
};

// Determine significance based on planet pair
const getSignificance = (transitPlanet: string, natalPlanet: string): 'major' | 'moderate' | 'minor' => {
  const outerPlanets = ['Pluto', 'Neptune', 'Uranus'];
  const socialPlanets = ['Saturn', 'Jupiter'];
  const innerLights = ['Sun', 'Moon', 'Ascendant', 'Midheaven'];
  
  // Outer planet to lights/angles = major
  if (outerPlanets.includes(transitPlanet) && innerLights.includes(natalPlanet)) return 'major';
  // Saturn/Jupiter to lights = major
  if (socialPlanets.includes(transitPlanet) && innerLights.includes(natalPlanet)) return 'major';
  // Outer to outer = moderate
  if (outerPlanets.includes(transitPlanet) && outerPlanets.includes(natalPlanet)) return 'moderate';
  // Social to personal = moderate
  if (socialPlanets.includes(transitPlanet)) return 'moderate';
  
  return 'minor';
};

// Calculate transits for a year
export const calculateYearTransits = (
  chart: NatalChart,
  year: number,
  options?: {
    includePersonal?: boolean; // Include Sun, Moon, Mercury, Venus, Mars transits
    transitPlanets?: string[]; // Override which transit planets to check
  }
): YearlyTransitEvent[] => {
  const transits: YearlyTransitEvent[] = [];
  const { includePersonal = false, transitPlanets } = options || {};
  
  // Default: outer and social planets for yearly overview (these are what's TRANSITING)
  const planetsToCheck = transitPlanets || (includePersonal 
    ? ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    : ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
  
  // Natal planets to check aspects against - PERSONAL POINTS ONLY for meaningful transits
  // We want outer planets transiting TO personal planets, not outer-to-outer
  const personalNatalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'Midheaven'];
  const allNatalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Midheaven', 'Chiron'];
  
  // Use personal points for outer planet transits, all planets if including personal transits
  const natalPlanets = includePersonal ? allNatalPlanets : personalNatalPlanets;
  
  // Get all natal longitudes
  const natalLongitudes: Record<string, number> = {};
  natalPlanets.forEach(planet => {
    const lon = getNatalPlanetLongitude(chart, planet);
    if (lon !== null) {
      natalLongitudes[planet] = lon;
    }
  });
  
  // Sample every day for slow planets, every 6 hours for fast planets
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Track found exact aspects to avoid duplicates
  const foundAspects = new Set<string>();
  
  // Iterate through the year
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    
    planetsToCheck.forEach(transitPlanet => {
      // Get transit planet position
      let transitLon: number;
      if (transitPlanet === 'Chiron') {
        transitLon = getChironLongitude(date);
      } else {
        transitLon = getPlanetLongitude(transitPlanet, date);
      }
      
      const transitSignDegree = longitudeToSignDegree(transitLon);
      
      // Check against each natal planet
      Object.entries(natalLongitudes).forEach(([natalPlanet, natalLon]) => {
        // Skip same planet unless it's meaningful
        if (transitPlanet === natalPlanet && !['Jupiter', 'Saturn'].includes(transitPlanet)) return;
        
        // Check each aspect
        ASPECTS.forEach(aspectDef => {
          const distance = angularDistance(transitLon, natalLon);
          const diff = Math.abs(distance - aspectDef.angle);
          
          // For exact pass detection, use tighter orb
          if (diff <= aspectDef.orb) {
            const natalSignDegree = longitudeToSignDegree(natalLon);
            
            // CRITICAL: Validate that the aspect makes geometric sense
            // e.g., Neptune at 29° Pisces cannot trine Venus at 0° Sagittarius
            // (Pisces and Sagittarius are 3 signs apart = square, not 4 = trine)
            if (!isValidAspectBySign(transitSignDegree.sign, natalSignDegree.sign, aspectDef.name)) {
              return; // Skip this false positive
            }
            
            const aspectKey = `${transitPlanet}-${aspectDef.name}-${natalPlanet}-${date.getMonth()}`;
            
            // Check if this is closer than any previous detection this month
            const existingKey = Array.from(foundAspects).find(k => 
              k.startsWith(`${transitPlanet}-${aspectDef.name}-${natalPlanet}`)
            );
            
            if (!existingKey || diff < 0.5) {
              const isExact = diff < 0.5;
              
              transits.push({
                id: `${transitPlanet}-${natalPlanet}-${aspectDef.name}-${date.toISOString()}`,
                date: new Date(date),
                transitPlanet,
                natalPlanet,
                aspect: aspectDef.name,
                aspectSymbol: aspectDef.symbol,
                orb: diff,
                isExact,
                transitSign: transitSignDegree.sign,
                transitDegree: transitSignDegree.degree,
                natalSign: natalSignDegree.sign,
                natalDegree: natalSignDegree.degree,
                category: getTransitCategory(transitPlanet),
                significance: getSignificance(transitPlanet, natalPlanet),
              });
              
              if (isExact) {
                foundAspects.add(aspectKey);
              }
            }
          }
        });
      });
    });
  }
  
  // Deduplicate by finding the closest pass for each unique aspect
  const deduped = deduplicateTransits(transits);

  // Refine each pass to an exact timestamp (not just the closest day)
  const refined = deduped.map((t) => {
    // Recompute natal longitude precisely (includes minutes when present)
    const natalLon = natalLongitudes[t.natalPlanet];
    if (typeof natalLon !== 'number') return t;

    const aspectDef = ASPECTS.find(a => a.name === t.aspect);
    if (!aspectDef) return t;

    const transitLongitudeAt = (date: Date) => {
      if (t.transitPlanet === 'Chiron') {
        return getChironLongitude(date);
      }
      const body = PLANET_BODIES[t.transitPlanet];
      if (!body) return 0;
      return getPlanetLongitude(t.transitPlanet, date);
    };

    const { date, orb } = refineExactAspectTime({
      seedDate: t.date,
      transitLongitudeAt,
      natalLongitude: natalLon,
      aspectAngle: aspectDef.angle,
    });

    const transitSignDegree = longitudeToSignDegree(transitLongitudeAt(date));
    const natalSignDegree = longitudeToSignDegree(natalLon);

    return {
      ...t,
      date,
      orb,
      isExact: orb < 0.05,
      transitSign: transitSignDegree.sign,
      transitDegree: transitSignDegree.degree,
      natalSign: natalSignDegree.sign,
      natalDegree: natalSignDegree.degree,
    };
  });

  return refined.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Deduplicate transits to find exact passes
const deduplicateTransits = (transits: YearlyTransitEvent[]): YearlyTransitEvent[] => {
  const grouped = new Map<string, YearlyTransitEvent[]>();
  
  transits.forEach(t => {
    const key = `${t.transitPlanet}-${t.aspect}-${t.natalPlanet}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(t);
  });
  
  const result: YearlyTransitEvent[] = [];
  
  grouped.forEach(group => {
    // Find local minima (exact passes)
    const passes: YearlyTransitEvent[] = [];
    
    for (let i = 1; i < group.length - 1; i++) {
      const prev = group[i - 1].orb;
      const curr = group[i].orb;
      const next = group[i + 1].orb;
      
      // Local minimum = exact pass
      if (curr <= prev && curr <= next) {
        passes.push({ ...group[i], isExact: curr < 0.5 });
      }
    }
    
    // If no local minima found, take the closest overall
    if (passes.length === 0 && group.length > 0) {
      const closest = group.reduce((min, t) => t.orb < min.orb ? t : min);
      passes.push({ ...closest, isExact: closest.orb < 0.5 });
    }
    
    result.push(...passes);
  });
  
  return result;
};

// Get transits for a specific month
export const getTransitsForMonth = (
  transits: YearlyTransitEvent[],
  month: number,
  year: number
): YearlyTransitEvent[] => {
  return transits.filter(t => 
    t.date.getMonth() === month && t.date.getFullYear() === year
  );
};

// Generate month themes based on transits
export const generateMonthThemes = (transits: YearlyTransitEvent[]): string[] => {
  const themes: string[] = [];
  
  // Check for major outer planet transits
  const hasPlutoTransit = transits.some(t => t.transitPlanet === 'Pluto' && t.significance === 'major');
  const hasNeptuneTransit = transits.some(t => t.transitPlanet === 'Neptune' && t.significance === 'major');
  const hasUranusTransit = transits.some(t => t.transitPlanet === 'Uranus' && t.significance === 'major');
  const hasSaturnTransit = transits.some(t => t.transitPlanet === 'Saturn' && t.significance === 'major');
  const hasJupiterTransit = transits.some(t => t.transitPlanet === 'Jupiter' && t.significance === 'major');
  
  if (hasPlutoTransit) themes.push('Deep Transformation');
  if (hasNeptuneTransit) themes.push('Spiritual Growth');
  if (hasUranusTransit) themes.push('Sudden Changes');
  if (hasSaturnTransit) themes.push('Structure & Discipline');
  if (hasJupiterTransit) themes.push('Expansion & Luck');
  
  if (themes.length === 0) themes.push('Integration Period');
  
  return themes;
};

// Get planet symbol
export const getTransitPlanetSymbol = (planet: string): string => {
  const symbols: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
    Chiron: '⚷', Ascendant: 'AC', Midheaven: 'MC', NorthNode: '☊'
  };
  return symbols[planet] || planet.charAt(0);
};

// Get key milestones for the year
export const getYearMilestones = (transits: YearlyTransitEvent[]): { date: Date; event: string; significance: string }[] => {
  return transits
    .filter(t => t.significance === 'major' && t.isExact)
    .map(t => ({
      date: t.date,
      event: `${t.transitPlanet} ${t.aspect} natal ${t.natalPlanet}`,
      significance: t.significance
    }));
};
