// Venus Star Point System - Dynamically Computed from Ephemeris
import * as Astronomy from 'astronomy-engine';

export interface VenusStarPoint {
  date: Date;
  type: 'inferior' | 'superior';
  degree: number;
  sign: string;
  specialNotes?: string;
  companions?: { planet: string; degree: number }[];
}

export interface VenusCycleStatus {
  phase: 'morning' | 'evening';
  phaseName: string;
  progressPercent: number;
  daysInCycle: number;
  totalCycleDays: number;
  lastStarPoint: VenusStarPoint;
  nextStarPoint: VenusStarPoint;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const getSignFromLon = (lon: number): string => ZODIAC_SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)];
const getDegInSign = (lon: number): number => Math.floor(((lon % 360) + 360) % 360 % 30);

// Compute Venus-Sun elongation on a date (positive = Venus east of Sun)
const venusElongation = (date: Date): number => {
  try {
    const sunV = Astronomy.GeoVector(Astronomy.Body.Sun, date, false);
    const venV = Astronomy.GeoVector(Astronomy.Body.Venus, date, false);
    const sunE = Astronomy.Ecliptic(sunV);
    const venE = Astronomy.Ecliptic(venV);
    let diff = venE.elon - sunE.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  } catch { return 0; }
};

// Find Venus-Sun conjunctions (star points) by searching for elongation zero-crossings
const starPointCache: Map<string, VenusStarPoint[]> = new Map();

const computeVenusStarPoints = (startYear: number, endYear: number): VenusStarPoint[] => {
  const cacheKey = `${startYear}_${endYear}`;
  if (starPointCache.has(cacheKey)) return starPointCache.get(cacheKey)!;
  
  const points: VenusStarPoint[] = [];
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const current = new Date(start);
  
  let prevElong = venusElongation(current);
  
  while (current <= end) {
    current.setDate(current.getDate() + 1);
    const nowElong = venusElongation(current);
    
    // Zero crossing = conjunction
    if ((prevElong > 0 && nowElong <= 0) || (prevElong < 0 && nowElong >= 0)) {
      // Refine to nearest hour
      let bestDate = new Date(current);
      let bestAbs = Math.abs(nowElong);
      const dayBefore = new Date(current);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      for (let h = 0; h < 24; h++) {
        const test = new Date(dayBefore);
        test.setHours(test.getHours() + h);
        const e = Math.abs(venusElongation(test));
        if (e < bestAbs) { bestAbs = e; bestDate = new Date(test); }
      }
      
      // Determine inferior vs superior:
      // At inferior conjunction, Venus is between Earth and Sun (closer, appears smaller elongation swing)
      // Check Venus distance - inferior = closer to Earth
      try {
        const venVec = Astronomy.GeoVector(Astronomy.Body.Venus, bestDate, false);
        const dist = Math.sqrt(venVec.x ** 2 + venVec.y ** 2 + venVec.z ** 2);
        const type: 'inferior' | 'superior' = dist < 1.0 ? 'inferior' : 'superior';
        
        const sunV = Astronomy.GeoVector(Astronomy.Body.Sun, bestDate, false);
        const sunE = Astronomy.Ecliptic(sunV);
        const lon = sunE.elon;
        
        points.push({
          date: bestDate,
          type,
          degree: getDegInSign(lon),
          sign: getSignFromLon(lon),
        });
      } catch { /* skip */ }
    }
    
    prevElong = nowElong;
  }
  
  starPointCache.set(cacheKey, points);
  return points;
};

// Get Venus Star Points for display (computed dynamically from ephemeris)
export const VENUS_STAR_POINTS: VenusStarPoint[] = computeVenusStarPoints(2020, 2032);

// Check if a date is a Venus Star Point day (within 1 day)
export function isVenusStarPointDay(date: Date): VenusStarPoint | null {
  const dateStr = date.toDateString();
  for (const sp of VENUS_STAR_POINTS) {
    if (sp.date.toDateString() === dateStr) return sp;
    // Also check 1 day before/after for close dates
    const dayBefore = new Date(sp.date);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayAfter = new Date(sp.date);
    dayAfter.setDate(dayAfter.getDate() + 1);
    if (dayBefore.toDateString() === dateStr || dayAfter.toDateString() === dateStr) {
      return sp;
    }
  }
  return null;
}

// Get current Venus cycle status
export function getVenusCycleStatus(date: Date): VenusCycleStatus {
  const now = date.getTime();
  
  // Find the last and next star points
  let lastSP: VenusStarPoint | null = null;
  let nextSP: VenusStarPoint | null = null;
  
  for (let i = 0; i < VENUS_STAR_POINTS.length; i++) {
    const sp = VENUS_STAR_POINTS[i];
    if (sp.date.getTime() <= now) {
      lastSP = sp;
    } else if (!nextSP) {
      nextSP = sp;
    }
  }
  
  // Fallback if we're before all dates or after all dates
  if (!lastSP) lastSP = VENUS_STAR_POINTS[0];
  if (!nextSP) nextSP = VENUS_STAR_POINTS[VENUS_STAR_POINTS.length - 1];
  
  const cycleDays = Math.floor((nextSP.date.getTime() - lastSP.date.getTime()) / (1000 * 60 * 60 * 24));
  const daysIn = Math.floor((now - lastSP.date.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.max(0, (daysIn / cycleDays) * 100));
  
  // Determine phase: after inferior = morning star, after superior = evening star
  const phase: 'morning' | 'evening' = lastSP.type === 'inferior' ? 'morning' : 'evening';
  const phaseName = phase === 'morning' 
    ? 'Morning Star (Phosphorus) — Internal Refinement'
    : 'Evening Star (Hesperus) — External Expression';
  
  return {
    phase,
    phaseName,
    progressPercent: Math.round(progressPercent),
    daysInCycle: Math.max(0, daysIn),
    totalCycleDays: cycleDays,
    lastStarPoint: lastSP,
    nextStarPoint: nextSP,
  };
}

// Calculate personal significance score
export function calculateVenusStarPointSignificance(
  starPoint: VenusStarPoint, 
  natalChart: { positions?: Record<string, { longitude: number; sign: string }> }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  if (!natalChart.positions) return { score: 20, reasons: ['Venus cycles affect everyone'] };
  
  // Check for Venus-ruled rising/stellium
  const hasLibraAsc = natalChart.positions.ascendant?.sign === 'Libra';
  const hasTaurusAsc = natalChart.positions.ascendant?.sign === 'Taurus';
  
  if (hasLibraAsc || hasTaurusAsc) {
    score += 25;
    reasons.push(`Venus rules your chart (${hasLibraAsc ? 'Libra' : 'Taurus'} rising) — all star points significant!`);
  }
  
  // Count Libra/Taurus planets
  let venusRuledCount = 0;
  for (const [planet, pos] of Object.entries(natalChart.positions)) {
    if (pos.sign === 'Libra' || pos.sign === 'Taurus') venusRuledCount++;
  }
  if (venusRuledCount >= 3) {
    score += 15;
    reasons.push(`${venusRuledCount} planets in Venus-ruled signs (Libra/Taurus stellium)`);
  }
  
  // Check aspects to natal planets
  const starPointLong = getSignLongitude(starPoint.sign) + starPoint.degree;
  
  for (const [planet, pos] of Object.entries(natalChart.positions)) {
    if (!pos.longitude) continue;
    const orb = Math.abs(pos.longitude - starPointLong) % 360;
    const normalizedOrb = orb > 180 ? 360 - orb : orb;
    
    // Conjunction (0°)
    if (normalizedOrb <= 5) {
      score += 20;
      reasons.push(`☌ Conjunct your natal ${planet} (${Math.round(normalizedOrb)}° orb)`);
    }
    // Square (90°)
    else if (Math.abs(normalizedOrb - 90) <= 5) {
      score += 15;
      reasons.push(`□ Square your natal ${planet} (${Math.round(Math.abs(normalizedOrb - 90))}° orb)`);
    }
    // Opposition (180°)
    else if (Math.abs(normalizedOrb - 180) <= 5) {
      score += 18;
      reasons.push(`☍ Opposition your natal ${planet} (${Math.round(Math.abs(normalizedOrb - 180))}° orb)`);
    }
    // Trine (120°)
    else if (Math.abs(normalizedOrb - 120) <= 5) {
      score += 12;
      reasons.push(`△ Trine your natal ${planet} (${Math.round(Math.abs(normalizedOrb - 120))}° orb)`);
    }
    // Sextile (60°)
    else if (Math.abs(normalizedOrb - 60) <= 5) {
      score += 8;
      reasons.push(`⚹ Sextile your natal ${planet} (${Math.round(Math.abs(normalizedOrb - 60))}° orb)`);
    }
  }
  
  // Triple conjunction bonus
  if (starPoint.companions && starPoint.companions.length > 0) {
    score += 25;
    reasons.push(`🌟 RARE: Triple conjunction with ${starPoint.companions.map(c => c.planet).join(' & ')}!`);
  }
  
  return { score: Math.min(100, score), reasons };
}

function getSignLongitude(sign: string): number {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs.indexOf(sign) * 30;
}

// Get sign symbol
export function getSignSymbol(sign: string): string {
  const symbols: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
  };
  return symbols[sign] || sign;
}

// Journal prompts by phase
export const VENUS_JOURNAL_PROMPTS = {
  inferior: [
    "What values no longer serve me?",
    "What relationships need releasing or deepening?",
    "Where have I lost touch with my self-worth?",
    "What does my heart truly want?",
  ],
  morningstar: [
    "How am I developing my values internally?",
    "What do I need to feel worthy?",
    "How can I love myself better?",
    "What relationship patterns am I healing?",
  ],
  superior: [
    "What has matured in my relationships since the last star point?",
    "What values have solidified?",
    "What commitments am I ready to make?",
    "How have I integrated Venus lessons?",
  ],
  eveningstar: [
    "How am I expressing my values outwardly?",
    "What relationships am I actively cultivating?",
    "How am I beautifying my environment?",
    "Where am I attracting abundance?",
  ],
};
