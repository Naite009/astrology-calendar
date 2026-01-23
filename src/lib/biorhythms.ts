/**
 * Biorhythm Calculation Library
 * 
 * Biorhythms are based on three inherent cycles that begin at birth:
 * - Physical (23 days): Energy, strength, endurance, coordination
 * - Emotional (28 days): Mood, sensitivity, creativity, intuition
 * - Intellectual (33 days): Analytical thinking, memory, communication
 * - Intuitive (38 days): Unconscious perception, instincts (optional extended cycle)
 */

export interface BiorhythmCycle {
  name: string;
  length: number;
  color: string;
  icon: string;
  description: string;
}

export interface BiorhythmValue {
  cycle: string;
  value: number; // -100 to +100
  state: BiorhythmState;
  color: string;
  icon: string;
}

export interface BiorhythmDay {
  date: Date;
  physical: number;
  emotional: number;
  intellectual: number;
  intuitive?: number;
  average: number;
  criticalCycles: string[];
  peakCycles: string[];
}

export interface CompatibilityResult {
  physical: number;      // 0-100% compatibility
  emotional: number;
  intellectual: number;
  overall: number;
  passion: number;       // Physical + Emotional average
  communication: number; // Intellectual + Emotional average  
  synergy: string;       // Description of the compatibility
  peakDays: { date: Date; score: number }[];  // Best days together
}

export type BiorhythmState = 'peak' | 'high' | 'neutral' | 'low' | 'critical';

export const BIORHYTHM_CYCLES: Record<string, BiorhythmCycle> = {
  physical: {
    name: 'Physical',
    length: 23,
    color: 'hsl(var(--destructive))',
    icon: '💪',
    description: 'Energy, strength, endurance, coordination, physical well-being'
  },
  emotional: {
    name: 'Emotional',
    length: 28,
    color: 'hsl(var(--primary))',
    icon: '💙',
    description: 'Mood, sensitivity, creativity, emotional stability, intuition'
  },
  intellectual: {
    name: 'Intellectual',
    length: 33,
    color: 'hsl(142 76% 36%)',
    icon: '🧠',
    description: 'Analytical thinking, memory, alertness, logical reasoning'
  },
  intuitive: {
    name: 'Intuitive',
    length: 38,
    color: 'hsl(270 60% 60%)',
    icon: '✨',
    description: 'Unconscious perception, instincts, spiritual sensitivity'
  }
};

/**
 * Calculate the biorhythm value for a specific cycle
 * @param birthDate - Date of birth
 * @param targetDate - Date to calculate for
 * @param cycleLength - Length of the cycle in days
 * @returns Value from -100 to +100
 */
export function calculateBiorhythm(birthDate: Date, targetDate: Date, cycleLength: number): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const birthTime = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()).getTime();
  const targetTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const daysSinceBirth = Math.floor((targetTime - birthTime) / msPerDay);
  const position = (2 * Math.PI * daysSinceBirth) / cycleLength;
  return Math.round(Math.sin(position) * 100);
}

/**
 * Get the state category for a biorhythm value
 */
export function getBiorhythmState(value: number): BiorhythmState {
  const absValue = Math.abs(value);
  
  // Critical: within 5% of zero crossing
  if (absValue <= 5) return 'critical';
  
  // Peak: above 80%
  if (value >= 80) return 'peak';
  
  // High: 40% to 80%
  if (value >= 40) return 'high';
  
  // Low: below -40%
  if (value <= -40) return 'low';
  
  // Neutral: everything else
  return 'neutral';
}

/**
 * Get a descriptive label for the state
 */
export function getStateLabel(state: BiorhythmState): string {
  switch (state) {
    case 'peak': return 'Peak';
    case 'high': return 'High';
    case 'neutral': return 'Moderate';
    case 'low': return 'Low';
    case 'critical': return 'Critical';
  }
}

/**
 * Get all biorhythm values for a specific date
 */
export function getAllBiorhythms(birthDate: Date, targetDate: Date, includeIntuitive = false): BiorhythmValue[] {
  const cycles = includeIntuitive 
    ? ['physical', 'emotional', 'intellectual', 'intuitive']
    : ['physical', 'emotional', 'intellectual'];
  
  return cycles.map(cycleKey => {
    const cycle = BIORHYTHM_CYCLES[cycleKey];
    const value = calculateBiorhythm(birthDate, targetDate, cycle.length);
    const state = getBiorhythmState(value);
    
    return {
      cycle: cycle.name,
      value,
      state,
      color: cycle.color,
      icon: cycle.icon
    };
  });
}

/**
 * Get biorhythm forecast for multiple days
 */
export function getBiorhythmForecast(birthDate: Date, startDate: Date, days: number): BiorhythmDay[] {
  const forecast: BiorhythmDay[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const physical = calculateBiorhythm(birthDate, date, BIORHYTHM_CYCLES.physical.length);
    const emotional = calculateBiorhythm(birthDate, date, BIORHYTHM_CYCLES.emotional.length);
    const intellectual = calculateBiorhythm(birthDate, date, BIORHYTHM_CYCLES.intellectual.length);
    const intuitive = calculateBiorhythm(birthDate, date, BIORHYTHM_CYCLES.intuitive.length);
    
    // Calculate average of main three cycles
    const average = Math.round((physical + emotional + intellectual) / 3);
    
    // Identify critical cycles (zero crossing)
    const criticalCycles: string[] = [];
    const peakCycles: string[] = [];
    
    if (Math.abs(physical) <= 5) criticalCycles.push('Physical');
    if (Math.abs(emotional) <= 5) criticalCycles.push('Emotional');
    if (Math.abs(intellectual) <= 5) criticalCycles.push('Intellectual');
    
    if (physical >= 80) peakCycles.push('Physical');
    if (emotional >= 80) peakCycles.push('Emotional');
    if (intellectual >= 80) peakCycles.push('Intellectual');
    
    forecast.push({
      date,
      physical,
      emotional,
      intellectual,
      intuitive,
      average,
      criticalCycles,
      peakCycles
    });
  }
  
  return forecast;
}

/**
 * Find critical days (when cycles cross zero) in a date range
 */
export function getCriticalDays(birthDate: Date, startDate: Date, days: number): { date: Date; cycles: string[] }[] {
  const forecast = getBiorhythmForecast(birthDate, startDate, days);
  return forecast
    .filter(day => day.criticalCycles.length > 0)
    .map(day => ({ date: day.date, cycles: day.criticalCycles }));
}

/**
 * Find double/triple critical days (when 2+ cycles are critical simultaneously)
 */
export function getDoubleCriticalDays(birthDate: Date, startDate: Date, days: number): { date: Date; cycles: string[] }[] {
  const criticalDays = getCriticalDays(birthDate, startDate, days);
  return criticalDays.filter(day => day.cycles.length >= 2);
}

/**
 * Find peak days (when cycles are at maximum)
 */
export function getPeakDays(birthDate: Date, startDate: Date, days: number): { date: Date; cycles: string[] }[] {
  const forecast = getBiorhythmForecast(birthDate, startDate, days);
  return forecast
    .filter(day => day.peakCycles.length > 0)
    .map(day => ({ date: day.date, cycles: day.peakCycles }));
}

/**
 * Get combined day quality score based on biorhythms
 */
export function getDayQuality(birthDate: Date, targetDate: Date): {
  score: number;
  label: string;
  recommendation: string;
} {
  const biorhythms = getAllBiorhythms(birthDate, targetDate);
  const average = biorhythms.reduce((sum, b) => sum + b.value, 0) / biorhythms.length;
  const hasCritical = biorhythms.some(b => b.state === 'critical');
  const peakCount = biorhythms.filter(b => b.state === 'peak').length;
  const lowCount = biorhythms.filter(b => b.state === 'low').length;
  
  if (hasCritical) {
    return {
      score: Math.round(average),
      label: 'Transition Day',
      recommendation: 'Cycles are crossing zero. Be mindful and flexible. Good for reflection.'
    };
  }
  
  if (peakCount >= 2) {
    return {
      score: Math.round(average),
      label: 'Power Day',
      recommendation: 'Multiple cycles at peak! Excellent for important activities and decisions.'
    };
  }
  
  if (lowCount >= 2) {
    return {
      score: Math.round(average),
      label: 'Rest Day',
      recommendation: 'Energy is lower than usual. Focus on routine tasks and self-care.'
    };
  }
  
  if (average >= 50) {
    return {
      score: Math.round(average),
      label: 'Good Day',
      recommendation: 'Positive energy flow. Good for productive activities.'
    };
  }
  
  if (average <= -50) {
    return {
      score: Math.round(average),
      label: 'Challenging Day',
      recommendation: 'Some resistance today. Pace yourself and avoid major decisions.'
    };
  }
  
  return {
    score: Math.round(average),
    label: 'Balanced Day',
    recommendation: 'Mixed energy. Trust your instincts for what feels right.'
  };
}

/**
 * Calculate the next occurrence of a specific cycle state
 */
export function getNextCycleEvent(
  birthDate: Date, 
  startDate: Date, 
  cycleKey: string, 
  targetState: BiorhythmState,
  maxDays = 60
): Date | null {
  const cycle = BIORHYTHM_CYCLES[cycleKey];
  if (!cycle) return null;
  
  for (let i = 1; i <= maxDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const value = calculateBiorhythm(birthDate, date, cycle.length);
    const state = getBiorhythmState(value);
    
    if (state === targetState) return date;
  }
  
  return null;
}

/**
 * ROMANTIC COMPATIBILITY BIORHYTHMS
 * 
 * Compatibility is calculated by comparing the phase alignment of two people's cycles.
 * When cycles are in sync (same phase), compatibility is high.
 * When cycles are opposite (180° out of phase), there can be friction but also attraction.
 */

/**
 * Calculate compatibility percentage between two birthdays for a specific cycle
 * Uses the cosine of the phase difference - 100% when in sync, 0% when 90° apart
 */
export function calculateCycleCompatibility(
  birthDate1: Date, 
  birthDate2: Date, 
  targetDate: Date, 
  cycleLength: number
): number {
  const value1 = calculateBiorhythm(birthDate1, targetDate, cycleLength);
  const value2 = calculateBiorhythm(birthDate2, targetDate, cycleLength);
  
  // Calculate phase difference
  // When both are at same value, compatibility is 100%
  // When opposite, it's 0% (but passion may be high)
  const diff = Math.abs(value1 - value2);
  const compatibility = Math.round(100 - (diff / 2)); // 0-200 range -> 0-100
  
  return Math.max(0, Math.min(100, compatibility));
}

/**
 * Get full romantic compatibility analysis between two people
 */
export function getCompatibility(
  birthDate1: Date,
  birthDate2: Date,
  targetDate: Date = new Date()
): CompatibilityResult {
  const physical = calculateCycleCompatibility(birthDate1, birthDate2, targetDate, BIORHYTHM_CYCLES.physical.length);
  const emotional = calculateCycleCompatibility(birthDate1, birthDate2, targetDate, BIORHYTHM_CYCLES.emotional.length);
  const intellectual = calculateCycleCompatibility(birthDate1, birthDate2, targetDate, BIORHYTHM_CYCLES.intellectual.length);
  
  const overall = Math.round((physical + emotional + intellectual) / 3);
  const passion = Math.round((physical + emotional) / 2);
  const communication = Math.round((intellectual + emotional) / 2);
  
  // Find peak compatibility days in next 30 days
  const peakDays: { date: Date; score: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(targetDate);
    date.setDate(date.getDate() + i);
    
    const p = calculateCycleCompatibility(birthDate1, birthDate2, date, BIORHYTHM_CYCLES.physical.length);
    const e = calculateCycleCompatibility(birthDate1, birthDate2, date, BIORHYTHM_CYCLES.emotional.length);
    const int = calculateCycleCompatibility(birthDate1, birthDate2, date, BIORHYTHM_CYCLES.intellectual.length);
    const dayScore = Math.round((p + e + int) / 3);
    
    if (dayScore >= 80) {
      peakDays.push({ date, score: dayScore });
    }
  }
  
  // Generate synergy description
  let synergy: string;
  if (overall >= 85) {
    synergy = 'Exceptional harmony! Your rhythms are deeply synchronized today.';
  } else if (overall >= 70) {
    synergy = 'Strong connection. Natural flow and mutual understanding.';
  } else if (overall >= 55) {
    synergy = 'Good balance. Some rhythms align well while others complement.';
  } else if (overall >= 40) {
    synergy = 'Mixed energy. Be patient and communicate clearly.';
  } else if (passion >= 60 && overall < 50) {
    synergy = 'Magnetic tension! Physical chemistry high but needs patience.';
  } else {
    synergy = 'Rhythms are out of sync today. Best for individual activities.';
  }
  
  return {
    physical,
    emotional,
    intellectual,
    overall,
    passion,
    communication,
    synergy,
    peakDays
  };
}

/**
 * Get compatibility forecast for multiple days
 */
export function getCompatibilityForecast(
  birthDate1: Date,
  birthDate2: Date,
  startDate: Date,
  days: number
): { date: Date; overall: number; physical: number; emotional: number; intellectual: number }[] {
  const forecast = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const physical = calculateCycleCompatibility(birthDate1, birthDate2, date, BIORHYTHM_CYCLES.physical.length);
    const emotional = calculateCycleCompatibility(birthDate1, birthDate2, date, BIORHYTHM_CYCLES.emotional.length);
    const intellectual = calculateCycleCompatibility(birthDate1, birthDate2, date, BIORHYTHM_CYCLES.intellectual.length);
    const overall = Math.round((physical + emotional + intellectual) / 3);
    
    forecast.push({ date, overall, physical, emotional, intellectual });
  }
  
  return forecast;
}
