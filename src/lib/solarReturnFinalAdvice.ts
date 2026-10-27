import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { buildYearSummary } from './solarReturnYearSummary';
export interface FinalAdvice {
  leanInto: string[];
  avoid: string[];
  bestTiming: string[];
  mostIntenseMonths: string[];
  howToUseThisYear: string;
  closingMessage: string;
}


export function buildFinalAdvice(analysis:SolarReturnAnalysis,natalChart:NatalChart,srChart:SolarReturnChart):FinalAdvice {
 const summary=buildYearSummary(analysis,natalChart,srChart);
 return {leanInto:[],avoid:[],bestTiming:[],mostIntenseMonths:[],howToUseThisYear:summary.coreTheme,closingMessage:''};
}
