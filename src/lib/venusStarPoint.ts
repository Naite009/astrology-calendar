// Venus Star Point System - Complete Data and Calculations

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

// Accurate Venus Star Point dates 2020-2032
export const VENUS_STAR_POINTS: VenusStarPoint[] = [
  { date: new Date('2020-06-03'), type: 'inferior', degree: 13, sign: 'Gemini' },
  { date: new Date('2021-03-26'), type: 'superior', degree: 5, sign: 'Aries' },
  { date: new Date('2022-01-08'), type: 'inferior', degree: 18, sign: 'Capricorn' },
  { date: new Date('2022-10-22'), type: 'superior', degree: 29, sign: 'Libra' },
  { date: new Date('2023-08-13'), type: 'inferior', degree: 20, sign: 'Leo' },
  { date: new Date('2024-06-04'), type: 'inferior', degree: 14, sign: 'Gemini' },
  { 
    date: new Date('2025-03-23'), 
    type: 'inferior', 
    degree: 3, 
    sign: 'Aries',
    specialNotes: 'New Venus cycle begins. Opposes Libra stelliums - awareness activation!'
  },
  { 
    date: new Date('2026-01-06'), 
    type: 'superior', 
    degree: 16, 
    sign: 'Capricorn',
    specialNotes: 'TRIPLE CONJUNCTION with Sun & Mars - happens every 32 years!',
    companions: [
      { planet: 'Sun', degree: 16 },
      { planet: 'Mars', degree: 18 }
    ]
  },
  { 
    date: new Date('2026-10-23'), 
    type: 'inferior', 
    degree: 0, 
    sign: 'Scorpio',
    specialNotes: 'First Scorpio star point in new era'
  },
  { date: new Date('2027-03-10'), type: 'superior', degree: 20, sign: 'Pisces' },
  { date: new Date('2027-08-04'), type: 'inferior', degree: 12, sign: 'Leo' },
  { date: new Date('2028-05-16'), type: 'superior', degree: 26, sign: 'Taurus' },
  { date: new Date('2029-03-29'), type: 'inferior', degree: 9, sign: 'Aries' },
  { date: new Date('2030-01-11'), type: 'superior', degree: 21, sign: 'Capricorn' },
  { date: new Date('2030-10-29'), type: 'inferior', degree: 5, sign: 'Scorpio' },
  { date: new Date('2031-08-12'), type: 'superior', degree: 19, sign: 'Leo' },
  { date: new Date('2032-06-02'), type: 'inferior', degree: 12, sign: 'Gemini' },
];

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
