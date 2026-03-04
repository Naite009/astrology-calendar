import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import * as Astronomy from 'astronomy-engine';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface RetrogradeInfo {
  start: Date;
  end: Date;
  sign: string;
  preStart: Date;
  postEnd: Date;
  cazimi?: Date; // Mercury-Sun exact conjunction during retrograde
  rxDegree?: number; // ecliptic longitude at station retrograde
  dDegree?: number; // ecliptic longitude at station direct
}

export interface RetrogradeStatus {
  isRetrograde: boolean;
  isShadow: boolean;
  shadowType?: 'pre' | 'post';
  retrogradeInfo?: RetrogradeInfo;
  daysRemaining?: number;
  percentComplete?: number;
}

export interface RetrogradeDisplay {
  mars: RetrogradeStatus;
  mercury: RetrogradeStatus;
  hasActivity: boolean;
}

// Cache for computed retrograde periods to avoid recalculation
let retrogradeCache: Map<string, RetrogradeInfo[]> = new Map();

// Clear cached retrograde data (call when precision has been improved)
export const clearRetrogradeCaches = () => { retrogradeCache = new Map(); };

// Force-clear on module load to pick up precision improvements
clearRetrogradeCaches();

// Check if a planet is retrograde on a specific date using astronomy-engine.
// `intervalHours` controls the comparison window; shorter = more precise near stations.
const isPlanetRetrograde = (body: Astronomy.Body, date: Date, intervalHours: number = 24): boolean => {
  try {
    const earlier = new Date(date.getTime() - intervalHours * 3600000);
    
    const todayVector = Astronomy.GeoVector(body, date, false);
    const earlierVector = Astronomy.GeoVector(body, earlier, false);
    
    const todayEcliptic = Astronomy.Ecliptic(todayVector);
    const earlierEcliptic = Astronomy.Ecliptic(earlierVector);
    
    // Handle wrap-around at 0/360
    let diff = todayEcliptic.elon - earlierEcliptic.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff < 0;
  } catch {
    return false;
  }
};

// Get ecliptic longitude for a planet
const getPlanetLongitude = (body: Astronomy.Body, date: Date): number => {
  try {
    const vector = Astronomy.GeoVector(body, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return ecliptic.elon;
  } catch {
    return 0;
  }
};

// Get zodiac sign from ecliptic longitude
const getSignFromLongitude = (longitude: number): string => {
  const signIndex = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[signIndex];
};

// Get the sign a planet is in on a specific date
const getPlanetSign = (body: Astronomy.Body, date: Date): string => {
  try {
    return getSignFromLongitude(getPlanetLongitude(body, date));
  } catch {
    return 'Unknown';
  }
};

// Compute the instantaneous ecliptic longitude velocity (degrees/hour) at a given moment.
// Uses a symmetric finite-difference with a tiny delta for high accuracy near stations.
const getEclipticVelocity = (body: Astronomy.Body, date: Date, deltaMinutes: number = 5): number => {
  try {
    const halfDelta = deltaMinutes * 60000 / 2; // ms
    const before = new Date(date.getTime() - halfDelta);
    const after = new Date(date.getTime() + halfDelta);
    
    const lonBefore = getPlanetLongitude(body, before);
    const lonAfter = getPlanetLongitude(body, after);
    
    let diff = lonAfter - lonBefore;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff / (deltaMinutes / 60); // degrees per hour
  } catch {
    return 0;
  }
};

// Find retrograde station with high precision using velocity zero-crossing.
// Phase 1: daily sweep to find the 1-day window where velocity changes sign.
// Phase 2: binary search within that window for the velocity zero-crossing (~1 min precision).
const findStation = (
  body: Astronomy.Body, 
  startDate: Date, 
  endDate: Date, 
  lookingForRetrograde: boolean
): Date | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Phase 1 — coarse daily sweep looking for velocity sign change
  const current = new Date(start);
  let prevVelocity = getEclipticVelocity(body, current);
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;
  
  while (current <= end) {
    const prevTime = new Date(current);
    current.setDate(current.getDate() + 1);
    const nowVelocity = getEclipticVelocity(body, current);
    
    // Station retrograde: velocity goes from positive to negative
    if (lookingForRetrograde && prevVelocity >= 0 && nowVelocity < 0) {
      windowStart = prevTime;
      windowEnd = new Date(current);
      break;
    }
    // Station direct: velocity goes from negative to positive
    if (!lookingForRetrograde && prevVelocity < 0 && nowVelocity >= 0) {
      windowStart = prevTime;
      windowEnd = new Date(current);
      break;
    }
    
    prevVelocity = nowVelocity;
  }
  
  if (!windowStart || !windowEnd) return null;
  
  // Phase 2 — binary search within the window for velocity = 0 (~1 minute precision)
  let lo = windowStart.getTime();
  let hi = windowEnd.getTime();
  
  while (hi - lo > 60 * 1000) { // 1 minute precision
    const mid = lo + (hi - lo) / 2;
    const midVelocity = getEclipticVelocity(body, new Date(mid), 2); // 2-minute delta for precision
    
    if (lookingForRetrograde) {
      // Looking for where velocity crosses from positive to negative
      if (midVelocity > 0) {
        lo = mid;
      } else {
        hi = mid;
      }
    } else {
      // Looking for where velocity crosses from negative to positive
      if (midVelocity < 0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
  }
  
  return new Date(lo + (hi - lo) / 2);
};

// Find the date when a planet reaches a specific ecliptic longitude (searching forward)
// Uses daily scan + binary search for ~1 hour precision
const findDateForLongitude = (
  body: Astronomy.Body,
  targetLon: number,
  searchStart: Date,
  searchEnd: Date,
  direction: 'forward' | 'backward' = 'forward'
): Date | null => {
  const start = new Date(searchStart);
  const end = new Date(searchEnd);
  const current = new Date(start);
  
  // Normalize target to 0-360
  const normTarget = ((targetLon % 360) + 360) % 360;
  
  // Daily scan to find the crossing window
  let prevLon = getPlanetLongitude(body, current);
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;
  
  while (current <= end) {
    const prevTime = new Date(current);
    current.setDate(current.getDate() + 1);
    const nowLon = getPlanetLongitude(body, current);
    
    // Check if the planet crossed the target degree (handle 360/0 wrap)
    let prevDiff = normTarget - prevLon;
    if (prevDiff > 180) prevDiff -= 360;
    if (prevDiff < -180) prevDiff += 360;
    
    let nowDiff = normTarget - nowLon;
    if (nowDiff > 180) nowDiff -= 360;
    if (nowDiff < -180) nowDiff += 360;
    
    // Signs changed = crossed the degree (only match correct motion direction)
    const isForwardCrossing = prevDiff >= 0 && nowDiff < 0;
    const isBackwardCrossing = prevDiff <= 0 && nowDiff > 0;
    
    if ((direction === 'forward' && isForwardCrossing) ||
        (direction === 'backward' && isBackwardCrossing) ||
        (Math.abs(nowDiff) < 0.5 && Math.abs(prevDiff) > Math.abs(nowDiff))) {
      windowStart = prevTime;
      windowEnd = new Date(current);
      break;
    }
    
    prevLon = nowLon;
  }
  
  if (!windowStart || !windowEnd) return null;
  
  // Binary search within the 24-hour window
  let lo = windowStart.getTime();
  let hi = windowEnd.getTime();
  
  for (let i = 0; i < 30; i++) {
    const mid = lo + (hi - lo) / 2;
    const midLon = getPlanetLongitude(body, new Date(mid));
    let midDiff = normTarget - midLon;
    if (midDiff > 180) midDiff -= 360;
    if (midDiff < -180) midDiff += 360;
    
    if ((direction === 'forward' && midDiff >= 0) || (direction === 'backward' && midDiff <= 0)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  
  return new Date(lo + (hi - lo) / 2);
};

// Find cazimi (planet-Sun exact conjunction) during retrograde period
const findCazimi = (body: Astronomy.Body, retroStart: Date, retroEnd: Date): Date | null => {
  // Scan daily for minimum separation between planet and Sun
  const start = new Date(retroStart);
  const end = new Date(retroEnd);
  let minSep = 999;
  let minDate = start;
  const current = new Date(start);
  
  while (current <= end) {
    const planetLon = getPlanetLongitude(body, current);
    const sunLon = getPlanetLongitude(Astronomy.Body.Sun, current);
    let sep = Math.abs(planetLon - sunLon);
    if (sep > 180) sep = 360 - sep;
    
    if (sep < minSep) {
      minSep = sep;
      minDate = new Date(current);
    }
    current.setDate(current.getDate() + 1);
  }
  
  if (minSep > 5) return null; // No conjunction found
  
  // Binary search for exact cazimi within ±1 day of minimum
  let lo = minDate.getTime() - 24 * 3600000;
  let hi = minDate.getTime() + 24 * 3600000;
  
  for (let i = 0; i < 40; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    
    const sep1 = (() => {
      const pL = getPlanetLongitude(body, new Date(m1));
      const sL = getPlanetLongitude(Astronomy.Body.Sun, new Date(m1));
      let s = Math.abs(pL - sL); if (s > 180) s = 360 - s; return s;
    })();
    const sep2 = (() => {
      const pL = getPlanetLongitude(body, new Date(m2));
      const sL = getPlanetLongitude(Astronomy.Body.Sun, new Date(m2));
      let s = Math.abs(pL - sL); if (s > 180) s = 360 - s; return s;
    })();
    
    if (sep1 < sep2) hi = m2; else lo = m1;
  }
  
  return new Date(lo + (hi - lo) / 2);
};

// Compute retrograde periods for a given year range dynamically
const computeRetrogradePeriods = (
  body: Astronomy.Body,
  startYear: number,
  endYear: number,
): RetrogradeInfo[] => {
  const periods: RetrogradeInfo[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    let searchStart = new Date(yearStart);
    
    while (searchStart < yearEnd) {
      const retroStart = findStation(body, searchStart, yearEnd, true);
      if (!retroStart) break;
      
      const searchEnd = new Date(retroStart);
      searchEnd.setMonth(searchEnd.getMonth() + 6);
      
      const retroEnd = findStation(body, retroStart, searchEnd, false);
      if (!retroEnd) break;
      
      // Get sign(s)
      const startSign = getPlanetSign(body, retroStart);
      const endSign = getPlanetSign(body, retroEnd);
      const sign = startSign === endSign ? startSign : `${startSign}/${endSign}`;
      
      // Get exact degrees at stations
      const rxLon = getPlanetLongitude(body, retroStart);
      const dLon = getPlanetLongitude(body, retroEnd);
      
      // DEGREE-BASED SHADOW CALCULATION (matches Brennan methodology):
      // Pre-shadow starts when planet first crosses the direct-station degree (going forward)
      // Post-shadow ends when planet returns to the retrograde-station degree (going forward after direct)
      const preShadowSearchStart = new Date(retroStart);
      preShadowSearchStart.setMonth(preShadowSearchStart.getMonth() - 2);
      const preStart = findDateForLongitude(body, dLon, preShadowSearchStart, retroStart, 'forward');
      
      const postShadowSearchEnd = new Date(retroEnd);
      postShadowSearchEnd.setMonth(postShadowSearchEnd.getMonth() + 3);
      const postEnd = findDateForLongitude(body, rxLon, retroEnd, postShadowSearchEnd, 'forward');
      
      // Cazimi (Mercury/Venus only — inner planets)
      const cazimi = (body === Astronomy.Body.Mercury || body === Astronomy.Body.Venus)
        ? findCazimi(body, retroStart, retroEnd)
        : undefined;
      
      // Fallback to fixed days if degree search fails
      const fallbackPre = new Date(retroStart);
      fallbackPre.setDate(fallbackPre.getDate() - 14);
      const fallbackPost = new Date(retroEnd);
      fallbackPost.setDate(fallbackPost.getDate() + 20);
      
      periods.push({
        start: retroStart,
        end: retroEnd,
        sign,
        preStart: preStart || fallbackPre,
        postEnd: postEnd || fallbackPost,
        cazimi: cazimi || undefined,
        rxDegree: rxLon,
        dDegree: dLon,
      });
      
      searchStart = new Date(retroEnd);
      searchStart.setDate(searchStart.getDate() + 30);
    }
  }
  
  return periods;
};

// Get cached or compute retrograde periods
export const getRetrogradePeriods = (body: Astronomy.Body, forDate: Date): RetrogradeInfo[] => {
  const year = forDate.getFullYear();
  const startYear = year - 1;
  const endYear = year + 1;
  
  const cacheKey = `${body}_${startYear}_${endYear}`;
  
  if (retrogradeCache.has(cacheKey)) {
    return retrogradeCache.get(cacheKey)!;
  }
  
  const periods = computeRetrogradePeriods(body, startYear, endYear);
  retrogradeCache.set(cacheKey, periods);
  
  return periods;
};

// Get Mercury retrograde periods (dynamically computed)
export const getMercuryRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Mercury, forDate);
};

// Get Mars retrograde periods (dynamically computed)
export const getMarsRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Mars, forDate);
};

// Get Jupiter retrograde periods (dynamically computed)
export const getJupiterRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Jupiter, forDate);
};

// Get Saturn retrograde periods (dynamically computed)
export const getSaturnRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Saturn, forDate);
};

// Get Uranus retrograde periods (dynamically computed)
export const getUranusRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Uranus, forDate);
};

// Get Neptune retrograde periods (dynamically computed)
export const getNeptuneRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Neptune, forDate);
};

// Get Pluto retrograde periods (dynamically computed)
export const getPlutoRetrogrades = (forDate: Date): RetrogradeInfo[] => {
  return getRetrogradePeriods(Astronomy.Body.Pluto, forDate);
};

// Get all planet retrograde periods for a date
export const getAllRetrogradePeriods = (forDate: Date): Record<string, RetrogradeInfo[]> => {
  return {
    Mercury: getMercuryRetrogrades(forDate),
    Mars: getMarsRetrogrades(forDate),
    Jupiter: getJupiterRetrogrades(forDate),
    Saturn: getSaturnRetrogrades(forDate),
    Uranus: getUranusRetrogrades(forDate),
    Neptune: getNeptuneRetrogrades(forDate),
    Pluto: getPlutoRetrogrades(forDate),
  };
};

// Get station dates with degrees for a planet (for display in transit tables)
export interface StationInfo {
  year: number;
  retrograde: { date: Date; degree: string; sign: string };
  direct: { date: Date; degree: string; sign: string };
}

export const getStationDates = (body: Astronomy.Body, forDate: Date): StationInfo[] => {
  const periods = getRetrogradePeriods(body, forDate);
  return periods.map(p => {
    const rxSign = getPlanetSign(body, p.start);
    const dSign = getPlanetSign(body, p.end);
    
    // Get exact degree at station
    const rxLon = (() => {
      try {
        const v = Astronomy.GeoVector(body, p.start, false);
        const e = Astronomy.Ecliptic(v);
        return e.elon % 30;
      } catch { return 0; }
    })();
    const dLon = (() => {
      try {
        const v = Astronomy.GeoVector(body, p.end, false);
        const e = Astronomy.Ecliptic(v);
        return e.elon % 30;
      } catch { return 0; }
    })();
    
    const fmtDeg = (d: number) => {
      const deg = Math.floor(d);
      const min = Math.floor((d - deg) * 60);
      return `${deg}°${String(min).padStart(2,'0')}'`;
    };
    
    return {
      year: p.start.getFullYear(),
      retrograde: { date: p.start, degree: `${fmtDeg(rxLon)} ${rxSign}`, sign: rxSign },
      direct: { date: p.end, degree: `${fmtDeg(dLon)} ${dSign}`, sign: dSign },
    };
  });
};

// Compute planet ingresses (sign changes) dynamically for a date range
export interface IngressInfo {
  planet: string;
  date: Date;
  fromSign: string;
  toSign: string;
}

export const computeIngresses = (body: Astronomy.Body, planetName: string, startDate: Date, endDate: Date): IngressInfo[] => {
  const ingresses: IngressInfo[] = [];
  const current = new Date(startDate);
  let prevSign = getPlanetSign(body, current);
  
  while (current <= endDate) {
    current.setDate(current.getDate() + 1);
    const nowSign = getPlanetSign(body, current);
    if (nowSign !== prevSign && nowSign !== 'Unknown' && prevSign !== 'Unknown') {
      ingresses.push({ planet: planetName, date: new Date(current), fromSign: prevSign, toSign: nowSign });
    }
    prevSign = nowSign;
  }
  return ingresses;
};

// Check if date is during retrograde
export const getRetrogradeStatus = (date: Date, retrogrades: RetrogradeInfo[]): RetrogradeStatus => {
  const time = date.getTime();
  
  for (const retro of retrogrades) {
    const startTime = retro.start.getTime();
    const endTime = retro.end.getTime();
    const preStartTime = retro.preStart.getTime();
    const postEndTime = retro.postEnd.getTime();
    
    // Check if in retrograde
    if (time >= startTime && time <= endTime) {
      const totalDays = (endTime - startTime) / (1000 * 60 * 60 * 24);
      const daysIn = (time - startTime) / (1000 * 60 * 60 * 24);
      const daysRemaining = Math.ceil(totalDays - daysIn);
      
      return {
        isRetrograde: true,
        isShadow: false,
        retrogradeInfo: retro,
        daysRemaining,
        percentComplete: Math.round((daysIn / totalDays) * 100),
      };
    }
    
    // Check pre-shadow
    if (time >= preStartTime && time < startTime) {
      return {
        isRetrograde: false,
        isShadow: true,
        shadowType: 'pre',
        retrogradeInfo: retro,
      };
    }
    
    // Check post-shadow
    if (time > endTime && time <= postEndTime) {
      return {
        isRetrograde: false,
        isShadow: true,
        shadowType: 'post',
        retrogradeInfo: retro,
      };
    }
  }
  
  return { isRetrograde: false, isShadow: false };
};

// Get retrograde display info for both Mars and Mercury - NOW DYNAMIC!
export const getRetrogradeDisplay = (date: Date): RetrogradeDisplay => {
  const mercuryRetros = getMercuryRetrogrades(date);
  const marsRetros = getMarsRetrogrades(date);
  
  const mars = getRetrogradeStatus(date, marsRetros);
  const mercury = getRetrogradeStatus(date, mercuryRetros);
  
  return {
    mars,
    mercury,
    hasActivity: mars.isRetrograde || mars.isShadow || mercury.isRetrograde || mercury.isShadow,
  };
};

// Convert natal position to longitude
const natalPositionToLongitude = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + position.degree + position.minutes / 60 + (position.seconds || 0) / 3600;
};

// Get personal chart activation during retrograde
export const getRetrogradeChartActivation = (
  retrogradeInfo: RetrogradeInfo,
  planet: 'Mars' | 'Mercury',
  natalChart: NatalChart
): string[] => {
  const activations: string[] = [];
  
  // Get the signs involved
  const signs = retrogradeInfo.sign.split('/');
  
  // Check which natal planets are in those signs
  for (const [planetName, position] of Object.entries(natalChart.planets)) {
    if (!position) continue;
    
    if (signs.includes(position.sign)) {
      activations.push(`Your natal ${planetName} in ${position.sign} is directly activated by this ${planet} retrograde.`);
    }
  }
  
  // Add house activation based on retrograde sign
  if (natalChart.houseCusps) {
    for (const [houseName, cusp] of Object.entries(natalChart.houseCusps)) {
      if (!cusp) continue;
      if (signs.includes(cusp.sign)) {
        const houseNum = houseName.replace('house', '');
        activations.push(`${planet} retrograde activates your ${houseNum}th house matters.`);
      }
    }
  }
  
  return activations;
};

// Mars retrograde guidance
export const MARS_RETROGRADE_GUIDANCE = {
  whatToExpect: [
    "Energy turns inward - review how you take action",
    "Past conflicts may resurface for resolution",
    "Passion and drive need redirection",
    "Physical energy may feel depleted or misdirected",
    "Old anger or frustration may arise",
  ],
  bestActivities: [
    "Finish projects already in progress",
    "Review your goals and ambitions",
    "Reassess how you assert yourself",
    "Heal old wounds around anger or competition",
    "Strategic planning (but don't launch yet)",
    "Physical therapy or healing practices",
  ],
  avoid: [
    "Starting major new projects",
    "Initiating conflicts or confrontations",
    "Signing up for competitive ventures",
    "Major surgery (if elective)",
    "Impulsive physical activities",
    "Starting a new exercise regimen",
  ],
};

// Mercury retrograde guidance
export const MERCURY_RETROGRADE_GUIDANCE = {
  whatToExpect: [
    "Communication mishaps and misunderstandings",
    "Technology glitches and malfunctions",
    "Travel delays and scheduling issues",
    "Past contacts may reappear",
    "Hidden information comes to light",
  ],
  bestActivities: [
    "Review and revise documents",
    "Reconnect with old friends",
    "Edit and polish creative work",
    "Research and gather information",
    "Back up all digital data",
    "Revisit abandoned projects",
    "Reflect on past decisions",
  ],
  avoid: [
    "Signing contracts or legal documents",
    "Buying electronics or vehicles",
    "Starting new communication projects",
    "Making major decisions based on new info",
    "Launching websites or apps",
    "Important presentations (if possible)",
  ],
};

// Format date for display (date only)
export const formatRetrogradeDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format date + exact time in user's local timezone for station precision
export const formatRetrogradeDateWithTime = (date: Date): string => {
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return `${dateStr} at ${timeStr}`;
};

// Get days until retrograde ends
export const getDaysUntilEnd = (endDate: Date, currentDate: Date): number => {
  return Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
};

// Get all upcoming retrogrades for a planet within next N months
export const getUpcomingRetrogrades = (
  body: Astronomy.Body,
  fromDate: Date,
  monthsAhead: number = 24
): RetrogradeInfo[] => {
  const endDate = new Date(fromDate);
  endDate.setMonth(endDate.getMonth() + monthsAhead);
  
  const periods = getRetrogradePeriods(body, fromDate);
  
  // Filter to only future retrogrades
  return periods.filter(p => p.start >= fromDate && p.start <= endDate);
};
