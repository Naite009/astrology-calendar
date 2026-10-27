import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import type { NatalChart } from '@/hooks/useNatalChart';
export interface LunarReturnEvent {
  month: string;           // "Jan", "Feb", etc.
  monthIndex: number;      // 0-11 from birthday
  lunarReturnSign: string; // Moon returns to its natal sign
  emotionalTheme: string;  // what this reset brings
  intensity: number;       // 1-5
}

export interface MoonTransitCheckpoint {
  dayOffset: number;       // days from birthday
  sign: string;            // what sign Moon is transiting
  emotionalTone: string;   // brief emotional flavor
  dateLabel: string;       // approximate date
}

export interface LunarWeatherMonth {
  month: string;
  monthIndex: number;
  lunarReturn: LunarReturnEvent;
  checkpoints: MoonTransitCheckpoint[];
  overallTone: string;
  peakDay: number;         // day offset of highest intensity
  interpretation: string;  // narrative of what this month feels like emotionally
}

export interface LunarWeatherMap {
  natalMoonSign: string;
  months: LunarWeatherMonth[];
  yearPattern: string;     // overall emotional narrative
  emotionalPeaks: string[];  // months with highest intensity
  quietMonths: string[];     // months with lowest intensity
}


/** Deprecated average-calendar sign rotations are not computed lunar returns. Exact transit timelines remain separate. */
export function generateLunarWeatherMap(_analysis:SolarReturnAnalysis,_srChart:SolarReturnChart,natalChart:NatalChart):LunarWeatherMap {
 return {natalMoonSign:natalChart.planets.Moon?.sign||'',months:[],yearPattern:'',emotionalPeaks:[],quietMonths:[]};
}
