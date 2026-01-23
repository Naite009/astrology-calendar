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
