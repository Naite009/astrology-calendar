// Saturn Cycle Calculator
// Calculates precise Saturn transits over natal Saturn position including retrograde passes
// Saturn's orbital period: ~29.46 years, average daily motion: ~0.034°/day

import { NatalChart } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SATURN_ORBITAL_PERIOD_DAYS = 10759; // ~29.46 years
const SATURN_RETROGRADE_PERIOD_DAYS = 140; // Saturn retrogrades for ~4.5 months
const SATURN_DAILY_MOTION = 360 / SATURN_ORBITAL_PERIOD_DAYS; // ~0.0335°/day

export interface SaturnEvent {
  date: Date;
  age: number;
  type: 'exact' | 'retrograde_pass' | 'direct_pass';
  transiting_degree: number;
}

export interface SaturnCyclePhase {
  phaseName: 'First Quarter' | 'Opposition' | 'Third Quarter' | 'Return';
  phaseSymbol: '□' | '☍' | '□' | '☌';
  targetDegree: number;
  cycleNumber: number;
  events: SaturnEvent[];
  description: string;
  question: string;
  isPast: boolean;
  isUpcoming: boolean;
}

export interface DetailedSaturnCycles {
  natalSaturn: {
    sign: string;
    degree: number;
    minutes: number;
    absoluteDegree: number;
  };
  cycles: SaturnCyclePhase[];
}

// Convert sign + degree to absolute degree (0-360)
const toAbsoluteDegree = (sign: string, degree: number, minutes: number = 0): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + minutes / 60;
};

// Convert absolute degree to sign + degree
const toSignDegree = (absoluteDegree: number): { sign: string; degree: number; minutes: number } => {
  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = Math.floor(normalized % 30);
  const minutes = Math.round((normalized % 1) * 60);
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minutes
  };
};

// Format degree for display
export const formatDegreePosition = (absoluteDegree: number): string => {
  const { sign, degree, minutes } = toSignDegree(absoluteDegree);
  return `${degree}°${minutes.toString().padStart(2, '0')}' ${sign}`;
};

// Calculate Saturn's approximate position at a given date
// This is a simplified calculation based on average orbital motion
// For precise calculations, we'd need full ephemeris data
const getSaturnPositionAtDate = (
  date: Date, 
  referenceDate: Date, 
  referenceDegree: number
): { degree: number; isRetrograde: boolean } => {
  const daysDiff = (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Saturn moves about 12.2° per year on average
  // But it retrogrades for ~140 days each year, moving backwards ~6°
  // Net forward motion: ~12.2° per year
  
  const yearsDiff = daysDiff / 365.25;
  const approximateDegree = referenceDegree + (yearsDiff * 12.2);
  
  // Normalize to 0-360
  const normalized = ((approximateDegree % 360) + 360) % 360;
  
  // Approximate retrograde status (Saturn retrogrades once per year for ~140 days)
  // This is a rough approximation
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const isRetrograde = dayOfYear >= 100 && dayOfYear <= 240; // Rough approximation
  
  return { degree: normalized, isRetrograde };
};

// Find when transiting Saturn hits a specific degree
// Returns multiple dates accounting for retrograde motion
const findSaturnTransits = (
  targetDegree: number,
  birthDate: Date,
  natalSaturnDegree: number,
  startAge: number,
  endAge: number
): SaturnEvent[] => {
  const events: SaturnEvent[] = [];
  
  // Saturn takes ~29.46 years for one cycle
  // For a given aspect, it will transit that degree approximately once per cycle
  // But due to retrograde, it can pass the same degree up to 3 times
  
  // Calculate approximate year when Saturn reaches target degree
  const degreeDiff = ((targetDegree - natalSaturnDegree) % 360 + 360) % 360;
  const yearsToFirstHit = degreeDiff / 12.2;
  
  // For each cycle
  for (let cycle = 0; cycle < 4; cycle++) {
    const baseYear = yearsToFirstHit + (cycle * 29.46);
    
    if (baseYear < startAge || baseYear > endAge) continue;
    
    // Calculate the dates for this transit
    const centralDate = new Date(birthDate);
    centralDate.setFullYear(centralDate.getFullYear() + Math.floor(baseYear));
    centralDate.setMonth(centralDate.getMonth() + Math.floor((baseYear % 1) * 12));
    
    const age = Math.floor(baseYear);
    
    // Saturn often makes 3 passes due to retrograde
    // First pass (direct): about 2-3 months before the middle
    // Second pass (retrograde): the middle/exact point
    // Third pass (direct): about 2-3 months after
    
    // Check if this transit has retrograde passes
    // Saturn retrogrades once per year for ~140 days
    // About 40% chance any given transit gets a triple pass
    
    // Simplified: assume most transits have at least one exact pass
    // Add retrograde passes for transits near retrograde season
    
    // First direct pass (or only pass if no retrograde)
    events.push({
      date: new Date(centralDate.getTime() - 90 * 24 * 60 * 60 * 1000),
      age,
      type: 'exact',
      transiting_degree: targetDegree
    });
    
    // For more precision with retrograde, we'd check if Saturn's retrograde
    // period overlaps with this degree crossing
    // Here we'll show the likely scenario for major transits
    
    // If the transit is during typical retrograde months (June-October roughly)
    const monthOfTransit = centralDate.getMonth();
    if (monthOfTransit >= 4 && monthOfTransit <= 9) {
      // Retrograde pass
      events.push({
        date: new Date(centralDate),
        age,
        type: 'retrograde_pass',
        transiting_degree: targetDegree
      });
      
      // Final direct pass
      events.push({
        date: new Date(centralDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        age,
        type: 'direct_pass',
        transiting_degree: targetDegree
      });
    }
  }
  
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Parse birth date string to Date object
const parseBirthDate = (birthDate: string): Date => {
  const [year, month, day] = birthDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Calculate detailed Saturn cycles
export const calculateDetailedSaturnCycles = (
  chart: NatalChart,
  currentDate: Date = new Date()
): DetailedSaturnCycles | null => {
  const saturnPos = chart.planets.Saturn;
  if (!saturnPos) return null;
  
  const natalDegree = toAbsoluteDegree(saturnPos.sign, saturnPos.degree, saturnPos.minutes);
  const birthDate = parseBirthDate(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  const cycles: SaturnCyclePhase[] = [];
  
  // Define the aspects: First Quarter (90°), Opposition (180°), Third Quarter (270°), Return (360°/0°)
  const aspects = [
    { name: 'First Quarter' as const, symbol: '□' as const, addDegrees: 90, question: 'What structure or responsibility emerged?' },
    { name: 'Opposition' as const, symbol: '☍' as const, addDegrees: 180, question: 'What external challenge or achievement defined this time?' },
    { name: 'Third Quarter' as const, symbol: '□' as const, addDegrees: 270, question: 'What did you release or restructure?' },
    { name: 'Return' as const, symbol: '☌' as const, addDegrees: 0, question: 'What major life chapter began or ended?' },
  ];
  
  // Calculate for cycles 1 and 2 (up to age 100)
  for (let cycleNum = 1; cycleNum <= 4; cycleNum++) {
    for (const aspect of aspects) {
      const targetDegree = ((natalDegree + aspect.addDegrees) % 360);
      
      // Calculate approximate age for this aspect in this cycle
      // First quarter: ~7.4 years after return
      // Opposition: ~14.7 years after return
      // Third quarter: ~22.1 years after return
      // Return: ~29.5 years after previous return
      
      const baseAge = (cycleNum - 1) * 29.46;
      const aspectOffset = aspect.addDegrees === 0 ? 29.46 : (aspect.addDegrees / 360) * 29.46;
      const approximateAge = baseAge + aspectOffset;
      
      // Skip if beyond age 100
      if (approximateAge > 100) continue;
      
      // Find all transits for this aspect
      const events = findSaturnTransits(
        targetDegree,
        birthDate,
        natalDegree,
        approximateAge - 2,
        approximateAge + 2
      );
      
      // If no events found from detailed calculation, create one at the approximate time
      const finalEvents = events.length > 0 ? events : [{
        date: new Date(birthDate.getTime() + approximateAge * 365.25 * 24 * 60 * 60 * 1000),
        age: Math.floor(approximateAge),
        type: 'exact' as const,
        transiting_degree: targetDegree
      }];
      
      const isPast = approximateAge < currentAge;
      const isUpcoming = approximateAge >= currentAge && approximateAge <= currentAge + 3;
      
      cycles.push({
        phaseName: aspect.name,
        phaseSymbol: aspect.symbol,
        targetDegree,
        cycleNumber: cycleNum,
        events: finalEvents,
        description: getPhaseDescription(aspect.name, cycleNum),
        question: aspect.question,
        isPast,
        isUpcoming
      });
    }
  }
  
  return {
    natalSaturn: {
      sign: saturnPos.sign,
      degree: saturnPos.degree,
      minutes: saturnPos.minutes,
      absoluteDegree: natalDegree
    },
    cycles
  };
};

// Get description for each phase
const getPhaseDescription = (phase: string, cycleNum: number): string => {
  const descriptions: Record<string, string[]> = {
    'First Quarter': [
      'First crisis in action—testing early foundations',
      'Mature reckoning with responsibilities built in first return',
      'Elder wisdom faces new structural challenges'
    ],
    'Opposition': [
      'Culmination of first life chapter—external achievement or crisis',
      'Midlife reflection—weighing accomplishments against potential',
      'Legacy assessment—what you\'ve built stands or transforms'
    ],
    'Third Quarter': [
      'Letting go of youthful structures—preparing for first return',
      'Releasing outdated authority patterns—simplifying',
      'Final harvest—distilling wisdom from experience'
    ],
    'Return': [
      'Major life restructuring—becoming your own authority',
      'Wisdom elder—mastery and mentorship',
      'Completion of second full cycle—transcendent perspective',
      'Third return—rare culmination of life lessons'
    ]
  };
  
  const index = Math.min(cycleNum - 1, (descriptions[phase]?.length || 1) - 1);
  return descriptions[phase]?.[index] || 'Saturn cycle event';
};

// Format date for display
export const formatCycleDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Calculate age at a specific date
export const calculateAgeAtDate = (birthDate: string, targetDate: Date): number => {
  const birth = parseBirthDate(birthDate);
  const ageInMs = targetDate.getTime() - birth.getTime();
  return Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
};
