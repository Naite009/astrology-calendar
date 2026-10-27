import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import type { NatalChart } from '@/hooks/useNatalChart';
import { solarReturnHouseMeaning } from './solarReturnClientMeaning';
import { buildYearStory } from './solarReturnYearStory';
export interface IdentityShift {
  headline: string;           // e.g. "From Protector to Pioneer"
  becomingNarrative: string;  // 3-5 sentence synthesis
  srSunSign: string;
  srSunHouse: number | null;
  srAscSign: string;
  northNodeSign: string;
  northNodeHouse: number | null;
  pillars: IdentityPillar[];
  tensionNote: string | null; // if SR Sun and Node are in tension
}

export interface IdentityPillar {
  label: string;       // "Purpose Direction", "Outer Presentation", "Soul Growth"
  placement: string;   // e.g. "Leo in the 10th"
  keyword: string;
  description: string;
}


export function generateIdentityShift(analysis: SolarReturnAnalysis, srChart: SolarReturnChart, _natalChart: NatalChart): IdentityShift {
 const story = buildYearStory(analysis), sunHouse = analysis.sunHouse.house;
 const ruler = analysis.yearlyTheme?.ascendantRuler;
 const pillars: IdentityPillar[] = sunHouse ? [{ label: 'Annual priority', placement: `Solar Return Sun in House ${sunHouse}`, keyword: 'Priorities', description: solarReturnHouseMeaning(sunHouse, 'Sun') }] : [];
 const rulerHouse = ruler ? analysis.planetSRHouses[ruler] : null;
 if (ruler && rulerHouse) pillars.push({label:'Solar Return ruler',placement:`Solar Return ${ruler} in House ${rulerHouse}`,keyword:'Choices',description:solarReturnHouseMeaning(rulerHouse,ruler)});
 return {headline:story.themes[0]?.title || 'Annual priorities', becomingNarrative:story.coreStory, srSunSign:srChart.planets.Sun?.sign || '',srSunHouse:sunHouse,srAscSign:srChart.houseCusps?.house1?.sign || '',northNodeSign:srChart.planets.NorthNode?.sign || '',northNodeHouse:analysis.nodesFocus?.house || null,pillars,tensionNote:null};
}
