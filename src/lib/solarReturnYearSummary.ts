import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { buildYearStory } from './solarReturnYearStory';
import { solarReturnHouseMeaning } from './solarReturnClientMeaning';
export interface YearSummaryAdvice {
  leanInto: string[];
  beCarefulOf: string[];
  bestMonths: string[];
  mostIntenseMonths: string[];
}

export interface YearSummary {
  coreTheme: string;
  topOpportunities: string[];
  topChallenges: string[];
  focusAreas: string[];
  identityShift: string;
  relationshipTheme: string;
  careerMoneyTheme: string;
  emotionalTheme: string;
  advice: YearSummaryAdvice;
}


export function buildYearSummary(analysis:SolarReturnAnalysis,_natalChart:NatalChart,_srChart:SolarReturnChart):YearSummary {
 const story=buildYearStory(analysis);
 const topic=(houses:number[])=>story.themes.filter(t=>houses.includes(t.house)).map(t=>t.summary).slice(0,1).join(' ');
 return {coreTheme:story.coreStory,topOpportunities:story.themes.slice(0,3).map(t=>t.summary),topChallenges:[],focusAreas:story.themes.slice(0,3).map(t=>t.title),identityShift:solarReturnHouseMeaning(analysis.sunHouse.house,'Sun'),relationshipTheme:topic([5,7]),careerMoneyTheme:topic([2,8,10]),emotionalTheme:solarReturnHouseMeaning(analysis.moonHouse.house,'Moon'),advice:{leanInto:[],beCarefulOf:[],bestMonths:[],mostIntenseMonths:[]}};
}
