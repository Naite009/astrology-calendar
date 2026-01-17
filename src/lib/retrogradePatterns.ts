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
const retrogradeCache: Map<string, RetrogradeInfo[]> = new Map();

// Check if a planet is retrograde on a specific date using astronomy-engine
const isPlanetRetrograde = (body: Astronomy.Body, date: Date): boolean => {
  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayVector = Astronomy.GeoVector(body, date, false);
    const yesterdayVector = Astronomy.GeoVector(body, yesterday, false);
    
    const todayEcliptic = Astronomy.Ecliptic(todayVector);
    const yesterdayEcliptic = Astronomy.Ecliptic(yesterdayVector);
    
    // Handle wrap-around at 0/360
    let diff = todayEcliptic.elon - yesterdayEcliptic.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff < 0;
  } catch {
    return false;
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
    const vector = Astronomy.GeoVector(body, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return getSignFromLongitude(ecliptic.elon);
  } catch {
    return 'Unknown';
  }
};

// Find retrograde station (when planet goes retrograde or direct)
const findStation = (
  body: Astronomy.Body, 
  startDate: Date, 
  endDate: Date, 
  lookingForRetrograde: boolean
): Date | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Search day by day
  const current = new Date(start);
  let prevRetrograde = isPlanetRetrograde(body, current);
  
  while (current <= end) {
    current.setDate(current.getDate() + 1);
    const nowRetrograde = isPlanetRetrograde(body, current);
    
    if (lookingForRetrograde && !prevRetrograde && nowRetrograde) {
      return new Date(current);
    }
    if (!lookingForRetrograde && prevRetrograde && !nowRetrograde) {
      return new Date(current);
    }
    
    prevRetrograde = nowRetrograde;
  }
  
  return null;
};

// Compute retrograde periods for a given year range dynamically
const computeRetrogradePeriods = (
  body: Astronomy.Body,
  startYear: number,
  endYear: number,
  avgRetrosPerYear: number = 3,
  shadowDays: number = 14
): RetrogradeInfo[] => {
  const periods: RetrogradeInfo[] = [];
  
  // Calculate for each year
  for (let year = startYear; year <= endYear; year++) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    let searchStart = new Date(yearStart);
    
    // Find all retrograde periods in this year
    while (searchStart < yearEnd) {
      // Find the next retrograde station
      const retroStart = findStation(body, searchStart, yearEnd, true);
      
      if (!retroStart) break;
      
      // Find when it goes direct again (search up to 6 months for Mars)
      const searchEnd = new Date(retroStart);
      searchEnd.setMonth(searchEnd.getMonth() + 6);
      
      const retroEnd = findStation(body, retroStart, searchEnd, false);
      
      if (!retroEnd) break;
      
      // Get the sign(s) during retrograde
      const startSign = getPlanetSign(body, retroStart);
      const endSign = getPlanetSign(body, retroEnd);
      const sign = startSign === endSign ? startSign : `${startSign}/${endSign}`;
      
      // Calculate shadow periods
      const preStart = new Date(retroStart);
      preStart.setDate(preStart.getDate() - shadowDays);
      
      const postEnd = new Date(retroEnd);
      postEnd.setDate(postEnd.getDate() + shadowDays);
      
      periods.push({
        start: retroStart,
        end: retroEnd,
        sign,
        preStart,
        postEnd
      });
      
      // Move search forward past this retrograde period
      searchStart = new Date(retroEnd);
      searchStart.setDate(searchStart.getDate() + 30); // Skip ahead to avoid re-finding same period
    }
  }
  
  return periods;
};

// Get cached or compute retrograde periods
export const getRetrogradePeriods = (body: Astronomy.Body, forDate: Date): RetrogradeInfo[] => {
  const year = forDate.getFullYear();
  const startYear = year - 1; // Include previous year for shadow periods
  const endYear = year + 1; // Include next year for shadow periods
  
  const cacheKey = `${body}_${startYear}_${endYear}`;
  
  if (retrogradeCache.has(cacheKey)) {
    return retrogradeCache.get(cacheKey)!;
  }
  
  // Configure based on planet
  let shadowDays = 14;
  if (body === Astronomy.Body.Mars) {
    shadowDays = 30; // Mars has longer shadow periods
  }
  
  const periods = computeRetrogradePeriods(body, startYear, endYear, 3, shadowDays);
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

// Format date for display
export const formatRetrogradeDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
