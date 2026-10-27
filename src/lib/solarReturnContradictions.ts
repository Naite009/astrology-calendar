import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
export interface ContradictionResolution {
  title: string;          // e.g. "Visibility vs Privacy"
  tension: string;        // "You may feel pulled between X and Y because..."
  synthesis: string;      // how to integrate both
  resolution: string;     // practical daily-life advice for working with both sides
  placement1: string;     // e.g. "Sun in 10th House"
  placement2: string;     // e.g. "Moon in 12th House"
  category: 'house-axis' | 'element-clash' | 'planet-tension' | 'mode-conflict';
}


/** House/sign differences alone do not establish a lived conflict. Exact contacts remain in the aspect section. */
export function detectContradictions(_analysis: SolarReturnAnalysis, _srChart: SolarReturnChart): ContradictionResolution[] { return []; }
