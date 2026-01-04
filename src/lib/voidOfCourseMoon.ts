import * as Astronomy from 'astronomy-engine';
import { getPlanetaryPositions, PlanetaryPositions, longitudeToZodiac } from './astrology';

// Aspect types for VOC Moon calculation
const MAJOR_ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 6 },
  { name: 'square', angle: 90, orb: 6 },
  { name: 'trine', angle: 120, orb: 6 },
  { name: 'opposition', angle: 180, orb: 8 },
];

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

// Check if Moon makes an aspect to any planet
interface AspectInfo {
  planet: string;
  aspectName: string;
  angle: number;
  orb: number;
}

const getMoonAspects = (date: Date): AspectInfo[] => {
  const moonLon = getMoonLongitude(date);
  const aspects: AspectInfo[] = [];
  
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
        });
      }
    }
  }
  
  return aspects;
};

// Get the zodiac sign the Moon is in
const getMoonSign = (date: Date): string => {
  const moonLon = getMoonLongitude(date);
  return longitudeToZodiac(moonLon).signName;
};

// Find when Moon changes sign
const findMoonSignChange = (startDate: Date, direction: 'forward' | 'backward' = 'forward'): Date => {
  const startSign = getMoonSign(startDate);
  let current = new Date(startDate);
  const increment = direction === 'forward' ? 30 : -30; // 30 minutes
  
  // Search in increments
  for (let i = 0; i < 150; i++) { // Up to 75 hours (Moon moves ~12°/day, sign = 30°)
    current = new Date(current.getTime() + increment * 60 * 1000);
    if (getMoonSign(current) !== startSign) {
      // Binary search for exact time
      let low = new Date(current.getTime() - Math.abs(increment) * 60 * 1000);
      let high = current;
      
      while (high.getTime() - low.getTime() > 60000) { // 1 minute precision
        const mid = new Date((low.getTime() + high.getTime()) / 2);
        if (getMoonSign(mid) === startSign) {
          low = mid;
        } else {
          high = mid;
        }
      }
      
      return direction === 'forward' ? high : low;
    }
  }
  
  return current;
};

// Find last Moon aspect in current sign (looking backward from sign change)
const findLastMoonAspect = (signChangeTime: Date, startOfDay: Date): { time: Date; aspect: AspectInfo } | null => {
  let current = new Date(signChangeTime.getTime() - 60000); // Start 1 min before sign change
  const moonSign = getMoonSign(startOfDay);
  
  // Work backward from sign change
  while (current.getTime() > startOfDay.getTime() - 24 * 60 * 60 * 1000) {
    const aspects = getMoonAspects(current);
    
    // Check if we're still in the same sign
    if (getMoonSign(current) !== moonSign) {
      current = new Date(current.getTime() - 15 * 60 * 1000);
      continue;
    }
    
    if (aspects.length > 0) {
      // Find the tightest aspect (lowest orb)
      const tightestAspect = aspects.reduce((min, asp) => asp.orb < min.orb ? asp : min, aspects[0]);
      
      // Search for exact aspect time (orb = 0)
      let searchStart = new Date(current.getTime() - 30 * 60 * 1000);
      let searchEnd = new Date(current.getTime() + 30 * 60 * 1000);
      
      // Binary search for exactness
      while (searchEnd.getTime() - searchStart.getTime() > 60000) {
        const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
        const midAspects = getMoonAspects(mid);
        const sameAspect = midAspects.find(a => a.planet === tightestAspect.planet && a.aspectName === tightestAspect.aspectName);
        
        if (sameAspect && sameAspect.orb < tightestAspect.orb) {
          // Getting closer to exact
          return { time: mid, aspect: sameAspect };
        }
        
        searchStart = mid;
      }
      
      return { time: current, aspect: tightestAspect };
    }
    
    current = new Date(current.getTime() - 15 * 60 * 1000); // Check every 15 minutes
  }
  
  return null;
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
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
};

// Main function to get VOC Moon details for a date
export const getVOCMoonDetails = (date: Date): VOCMoonDetails => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Find when Moon changes sign (looking forward from start of day)
  const signChangeTime = findMoonSignChange(startOfDay, 'forward');
  
  // If sign change is after end of day, check if there's a sign change earlier
  if (signChangeTime.getTime() > endOfDay.getTime()) {
    // Moon doesn't change signs today - check if there's a VOC period starting today
    const currentSign = getMoonSign(startOfDay);
    const nextSignChange = findMoonSignChange(startOfDay, 'forward');
    
    // Find last aspect before this sign change
    const lastAspect = findLastMoonAspect(nextSignChange, startOfDay);
    
    if (lastAspect && lastAspect.time.getTime() >= startOfDay.getTime() && lastAspect.time.getTime() <= endOfDay.getTime()) {
      // VOC starts today but ends after today
      const nextSign = getMoonSign(nextSignChange);
      return {
        isVOC: true,
        isCurrentlyVOC: new Date().getTime() > lastAspect.time.getTime() && new Date().getTime() < nextSignChange.getTime(),
        start: lastAspect.time,
        end: nextSignChange,
        lastAspect: {
          planet: lastAspect.aspect.planet,
          aspectName: lastAspect.aspect.aspectName,
          symbol: ASPECT_SYMBOLS[lastAspect.aspect.aspectName] || '?',
          time: lastAspect.time,
        },
        moonEntersSign: nextSign,
        durationMinutes: Math.round((nextSignChange.getTime() - lastAspect.time.getTime()) / 60000),
      };
    }
    
    // Check if VOC started yesterday and continues through today
    const previousDay = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
    const prevLastAspect = findLastMoonAspect(nextSignChange, previousDay);
    
    if (prevLastAspect && prevLastAspect.time.getTime() < startOfDay.getTime() && nextSignChange.getTime() > startOfDay.getTime()) {
      const nextSign = getMoonSign(nextSignChange);
      return {
        isVOC: true,
        isCurrentlyVOC: new Date().getTime() < nextSignChange.getTime(),
        start: prevLastAspect.time,
        end: nextSignChange,
        lastAspect: {
          planet: prevLastAspect.aspect.planet,
          aspectName: prevLastAspect.aspect.aspectName,
          symbol: ASPECT_SYMBOLS[prevLastAspect.aspect.aspectName] || '?',
          time: prevLastAspect.time,
        },
        moonEntersSign: nextSign,
        durationMinutes: Math.round((nextSignChange.getTime() - prevLastAspect.time.getTime()) / 60000),
      };
    }
    
    return { isVOC: false, isCurrentlyVOC: false };
  }
  
  // Moon changes sign today - find the last aspect before the sign change
  const lastAspect = findLastMoonAspect(signChangeTime, startOfDay);
  
  if (lastAspect && lastAspect.time.getTime() >= startOfDay.getTime() - 24 * 60 * 60 * 1000) {
    const nextSign = getMoonSign(signChangeTime);
    return {
      isVOC: true,
      isCurrentlyVOC: new Date().getTime() > lastAspect.time.getTime() && new Date().getTime() < signChangeTime.getTime(),
      start: lastAspect.time,
      end: signChangeTime,
      lastAspect: {
        planet: lastAspect.aspect.planet,
        aspectName: lastAspect.aspect.aspectName,
        symbol: ASPECT_SYMBOLS[lastAspect.aspect.aspectName] || '?',
        time: lastAspect.time,
      },
      moonEntersSign: nextSign,
      durationMinutes: Math.round((signChangeTime.getTime() - lastAspect.time.getTime()) / 60000),
    };
  }
  
  return { isVOC: false, isCurrentlyVOC: false };
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
