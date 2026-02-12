import * as Astronomy from 'astronomy-engine';
import { longitudeToZodiac } from './astrology';

// Major aspects for VOC Moon calculation - using tighter orbs for precision
const MAJOR_ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 3 },
  { name: 'sextile', angle: 60, orb: 3 },
  { name: 'square', angle: 90, orb: 3 },
  { name: 'trine', angle: 120, orb: 3 },
  { name: 'opposition', angle: 180, orb: 3 },
];

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
};

// Global cache for VOC details to avoid repeated heavy calculations
const VOC_CACHE = new Map<string, ReturnType<typeof getVOCMoonDetails>>();

// Get moon longitude at a specific time
const getMoonLongitude = (date: Date): number => {
  const geoMoon = Astronomy.GeoMoon(date);
  const ecliptic = Astronomy.Ecliptic(geoMoon);
  return ecliptic.elon;
};

// Get planet longitude at a specific time
const getPlanetLongitude = (body: Astronomy.Body, date: Date): number => {
  try {
    const vector = Astronomy.GeoVector(body, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return ecliptic.elon;
  } catch {
    return 0;
  }
};

// Get the zodiac sign the Moon is in (returns 0-11 for Aries-Pisces)
const getMoonSignIndex = (date: Date): number => {
  const moonLon = getMoonLongitude(date);
  return Math.floor(moonLon / 30);
};

// Get the zodiac sign name the Moon is in
const getMoonSign = (date: Date): string => {
  const moonLon = getMoonLongitude(date);
  return longitudeToZodiac(moonLon).signName;
};

interface AspectInfo {
  planet: string;
  aspectName: string;
  angle: number;
  orb: number;
  time: Date;
}

const planets: { name: string; body: Astronomy.Body }[] = [
  { name: 'Sun', body: Astronomy.Body.Sun },
  { name: 'Mercury', body: Astronomy.Body.Mercury },
  { name: 'Venus', body: Astronomy.Body.Venus },
  { name: 'Mars', body: Astronomy.Body.Mars },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  { name: 'Saturn', body: Astronomy.Body.Saturn },
  { name: 'Uranus', body: Astronomy.Body.Uranus },
  { name: 'Neptune', body: Astronomy.Body.Neptune },
  { name: 'Pluto', body: Astronomy.Body.Pluto },
];

// Check if Moon makes an aspect to any planet at exact time
const getMoonAspectsAtTime = (date: Date): AspectInfo[] => {
  const moonLon = getMoonLongitude(date);
  const aspects: AspectInfo[] = [];
  
  for (const planet of planets) {
    const planetLon = getPlanetLongitude(planet.body, date);
    
    for (const aspect of MAJOR_ASPECTS) {
      let diff = Math.abs(moonLon - planetLon);
      if (diff > 180) diff = 360 - diff;
      
      const orbDiff = Math.abs(diff - aspect.angle);
      if (orbDiff <= aspect.orb) {
        aspects.push({
          planet: planet.name,
          aspectName: aspect.name,
          angle: aspect.angle,
          orb: orbDiff,
          time: date,
        });
      }
    }
  }
  
  return aspects;
};

// Find when Moon NEXT changes sign (forward search)
export const findNextMoonSignChange = (startDate: Date): { time: Date; newSign: string } => {
  const startSign = getMoonSignIndex(startDate);
  let current = new Date(startDate);
  
  // Moon takes ~2.5 days per sign, search in 1-hour increments first
  for (let i = 0; i < 72; i++) { // Up to 3 days
    current = new Date(current.getTime() + 60 * 60 * 1000); // 1 hour
    if (getMoonSignIndex(current) !== startSign) {
      // Binary search for exact time
      let low = new Date(current.getTime() - 60 * 60 * 1000);
      let high = current;
      
      while (high.getTime() - low.getTime() > 60000) { // 1 minute precision
        const mid = new Date((low.getTime() + high.getTime()) / 2);
        if (getMoonSignIndex(mid) === startSign) {
          low = mid;
        } else {
          high = mid;
        }
      }
      
      return { time: high, newSign: getMoonSign(high) };
    }
  }
  
  return { time: current, newSign: getMoonSign(current) };
};

// Find all Moon aspects between two times, return sorted by time
// Uses a more thorough search to catch all aspects accurately
const findMoonAspectsBetween = (startTime: Date, endTime: Date): AspectInfo[] => {
  const aspects: AspectInfo[] = [];
  const foundAspects = new Map<string, AspectInfo>(); // Track unique aspects with best orb
  
  let current = new Date(startTime);
  // Use 15 minute steps for better accuracy (Moon moves ~0.5° per hour)
  const step = 15 * 60 * 1000;
  
  while (current.getTime() <= endTime.getTime()) {
    const moonLon = getMoonLongitude(current);
    
    for (const planet of planets) {
      const planetLon = getPlanetLongitude(planet.body, current);
      
      for (const aspect of MAJOR_ASPECTS) {
        let diff = Math.abs(moonLon - planetLon);
        if (diff > 180) diff = 360 - diff;
        
        const orbDiff = Math.abs(diff - aspect.angle);
        
        // Use tight orb (1°) to detect when aspect is very close to exact
        if (orbDiff <= 1) {
          const key = `${planet.name}-${aspect.name}`;
          const existing = foundAspects.get(key);
          
          if (!existing || orbDiff < existing.orb) {
            foundAspects.set(key, {
              planet: planet.name,
              aspectName: aspect.name,
              angle: aspect.angle,
              orb: orbDiff,
              time: new Date(current),
            });
          }
        }
      }
    }
    
    current = new Date(current.getTime() + step);
  }
  
  // Now refine each found aspect to find the exact time
  for (const [key, asp] of foundAspects) {
    const exactTime = findExactAspectTime(asp.time, asp, endTime);
    if (exactTime && exactTime.getTime() >= startTime.getTime() && exactTime.getTime() <= endTime.getTime()) {
      aspects.push({ ...asp, time: exactTime, orb: 0 });
    }
  }
  
  // Sort by time
  aspects.sort((a, b) => a.time.getTime() - b.time.getTime());
  return aspects;
};

// Find more precise time when aspect is exact using binary search for efficiency
const findExactAspectTime = (nearTime: Date, aspectInfo: AspectInfo, endTime: Date): Date | null => {
  const planet = planets.find(p => p.name === aspectInfo.planet);
  if (!planet) return nearTime;
  
  // Search +/- 1 hour from nearTime for initial pass
  const searchStart = new Date(Math.max(nearTime.getTime() - 60 * 60 * 1000, 0));
  const searchEnd = new Date(Math.min(nearTime.getTime() + 60 * 60 * 1000, endTime.getTime()));
  
  let bestTime = nearTime;
  let bestOrb = Infinity;
  
  // First pass: 2 minute steps
  let current = new Date(searchStart);
  while (current.getTime() <= searchEnd.getTime()) {
    const moonLon = getMoonLongitude(current);
    const planetLon = getPlanetLongitude(planet.body, current);
    let diff = Math.abs(moonLon - planetLon);
    if (diff > 180) diff = 360 - diff;
    const orb = Math.abs(diff - aspectInfo.angle);
    if (orb < bestOrb) {
      bestOrb = orb;
      bestTime = new Date(current);
    }
    current = new Date(current.getTime() + 2 * 60 * 1000);
  }
  
  // Second pass: 15 second steps around best time for precision
  const fineStart = new Date(bestTime.getTime() - 5 * 60 * 1000);
  const fineEnd = new Date(bestTime.getTime() + 5 * 60 * 1000);
  
  current = new Date(fineStart);
  while (current.getTime() <= fineEnd.getTime()) {
    const moonLon = getMoonLongitude(current);
    const planetLon = getPlanetLongitude(planet.body, current);
    let diff = Math.abs(moonLon - planetLon);
    if (diff > 180) diff = 360 - diff;
    const orb = Math.abs(diff - aspectInfo.angle);
    if (orb < bestOrb) {
      bestOrb = orb;
      bestTime = new Date(current);
    }
    current = new Date(current.getTime() + 15 * 1000); // 15 seconds
  }
  
  return bestTime;
};

export interface VOCMoonDetails {
  isVOC: boolean;
  isCurrentlyVOC: boolean;
  start?: Date;
  end?: Date;
  lastAspect?: {
    planet: string;
    aspectName: string;
    symbol: string;
    time: Date;
  };
  moonEntersSign?: string;
  durationMinutes?: number;
  displayStart?: Date; // For display: clamped to day start if VOC started before
  displayEnd?: Date;   // For display: clamped to day end if VOC ends after
}

// Main function to get VOC Moon details for a specific date
export const getVOCMoonDetails = (date: Date): VOCMoonDetails => {
  // Cache key: round to nearest hour for reasonable caching (VOC periods are typically hours long)
  const cacheKey = new Date(Math.floor(date.getTime() / 3600000) * 3600000).toISOString();
  const cached = VOC_CACHE.get(cacheKey);
  if (cached) return cached;

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Strategy: Look back up to 3 days to find the Moon sign that's currently active
  // or was active at the start of this day
  const checkStart = new Date(dayStart.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  // Find sign changes that might create VOC periods overlapping this day
  let searchTime = new Date(checkStart);
  
  while (searchTime.getTime() < dayEnd.getTime()) {
    // Get current sign
    const currentSign = getMoonSign(searchTime);
    
    // Find when Moon leaves this sign
    const signChange = findNextMoonSignChange(searchTime);
    
    // Find all aspects Moon makes before leaving this sign
    const aspectsInSign = findMoonAspectsBetween(searchTime, signChange.time);
    
    // Determine VOC start time
    let vocStart: Date;
    let lastAspect: AspectInfo | null = null;
    
    if (aspectsInSign.length === 0) {
      // Moon is already VOC from the start of this sign
      vocStart = searchTime;
    } else {
      // VOC starts after the last aspect
      lastAspect = aspectsInSign[aspectsInSign.length - 1];
      vocStart = lastAspect.time;
    }
    
    const vocEnd = signChange.time;
    
    // Check if this VOC period overlaps with our target day
    if (vocStart.getTime() <= dayEnd.getTime() && vocEnd.getTime() >= dayStart.getTime()) {
      // This VOC period overlaps with the target day
      const durationMinutes = Math.round((vocEnd.getTime() - vocStart.getTime()) / 60000);
      
      // Calculate display times (clamped to day boundaries for display)
      const displayStart = vocStart.getTime() < dayStart.getTime() ? dayStart : vocStart;
      const displayEnd = vocEnd.getTime() > dayEnd.getTime() ? dayEnd : vocEnd;
      
      const now = new Date();
      const isCurrentlyVOC = now.getTime() >= vocStart.getTime() && now.getTime() <= vocEnd.getTime();
      
      const result: VOCMoonDetails = {
        isVOC: true,
        isCurrentlyVOC,
        start: vocStart,
        end: vocEnd,
        displayStart,
        displayEnd,
        lastAspect: lastAspect ? {
          planet: lastAspect.planet,
          aspectName: lastAspect.aspectName,
          symbol: ASPECT_SYMBOLS[lastAspect.aspectName] || '?',
          time: lastAspect.time,
        } : undefined,
        moonEntersSign: signChange.newSign,
        durationMinutes,
      };
      VOC_CACHE.set(cacheKey, result);
      return result;
    }
    
    // Move to the next sign
    searchTime = new Date(signChange.time.getTime() + 60000); // 1 minute after sign change
  }
  
  // No VOC period overlaps with this day
  const noVocResult: VOCMoonDetails = { isVOC: false, isCurrentlyVOC: false };
  VOC_CACHE.set(cacheKey, noVocResult);
  return noVocResult;
};

// Quick check if a specific time is during VOC
export const isTimeVOC = (date: Date): boolean => {
  const details = getVOCMoonDetails(date);
  if (!details.isVOC || !details.start || !details.end) return false;
  return date.getTime() >= details.start.getTime() && date.getTime() <= details.end.getTime();
};

// Format VOC duration
export const formatVOCDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Format time for display
export const formatVOCTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
