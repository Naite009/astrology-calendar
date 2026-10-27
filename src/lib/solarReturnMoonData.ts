import { solarReturnHouseDetail, solarReturnHouseMeaning } from './solarReturnClientMeaning';
export const srMoonInHouseDeep: Record<number,{title:string;overview:string;emotionalTheme:string;focus:string;caution:string}>=Object.fromEntries(Array.from({length:12},(_,i)=>{const h=i+1,d=solarReturnHouseDetail(h,'Moon');return [h,{title:d?.title||'',overview:d?.overview||'',emotionalTheme:d?.experience||'',focus:d?.focus||'',caution:d?.caution||''}]}));
// Pair-only predictions lacked source layers, orbs and house context. Use verified contacts instead.
export const srMoonAspects: Record<string,{hard:string;soft:string}>={};
// ─── SR Moon Phase Meaning ──────────────────────────────────────────
export const srMoonPhaseInterp: Record<string, { theme: string; description: string }> = {
  'New Moon': { theme: 'Starting Point', description: 'The Solar Return Moon is within 45 degrees ahead of the Sun (Rudhyar New phase). Instinct may run ahead of a plan, so it can help to notice what you want to begin before explaining why.' },
  'Crescent': { theme: 'Early Effort', description: 'The Solar Return Moon is 45 to 90 degrees ahead of the Sun (Rudhyar Crescent phase). Recent beginnings may need steady effort while older habits still pull, so notice which plans keep their meaning after the first push.' },
  'First Quarter': { theme: 'Concrete Choices', description: 'The Solar Return Moon is 90 to 135 degrees ahead of the Sun (Rudhyar First Quarter phase). Plans may ask for concrete decisions and visible effort. Friction between what you want and what is practical can sharpen priorities rather than signal failure.' },
  'Gibbous': { theme: 'Refinement', description: 'The Solar Return Moon is 135 to 180 degrees ahead of the Sun (Rudhyar Gibbous phase). Attention may go to adjusting and improving what already exists before showing it more widely.' },
  'Full Moon': { theme: 'Seeing Clearly', description: 'The Solar Return Moon is 180 to 225 degrees from the Sun (Rudhyar Full phase). Results and other people\'s responses may be easier to see, which can make relationships a useful mirror for what you have been building.' },
  'Disseminating': { theme: 'Sharing What You Learned', description: 'The Solar Return Moon is 225 to 270 degrees from the Sun (Rudhyar Disseminating phase). Explaining, teaching or passing on what experience has shown you may feel more natural.' },
  'Last Quarter': { theme: 'Reorienting', description: 'The Solar Return Moon is 270 to 315 degrees from the Sun (Rudhyar Last Quarter phase). Routines or beliefs that once fit may be questioned. Sorting what to keep from what to change is the practical work.' },
  'Balsamic': { theme: 'Completing', description: 'The Solar Return Moon is 315 to 360 degrees from the Sun (Rudhyar Balsamic phase). Finishing, reflecting and leaving room between commitments may matter more. This does not predict isolation or low energy.' },
};
// Legacy astronomical-appearance keys map to the same cycle descriptions.
srMoonPhaseInterp['Waxing Crescent'] = srMoonPhaseInterp['Crescent'];
srMoonPhaseInterp['Waxing Gibbous'] = srMoonPhaseInterp['Gibbous'];
srMoonPhaseInterp['Waning Gibbous'] = srMoonPhaseInterp['Disseminating'];
srMoonPhaseInterp['Waning Crescent'] = srMoonPhaseInterp['Balsamic'];

export interface MoonPhaseBlending {
  cycleStage: string;
  themeLabel: string;
  releasing: string;
  emerging: string;
  areaClosing: string;
  newDirection: string;
}


export function getMoonPhaseBlending(phase:string,_moonSign:string,_sunSign:string,moonHouse:number|null,sunHouse:number|null):MoonPhaseBlending {
 return {cycleStage:srMoonPhaseInterp[phase]?.theme||phase,themeLabel:srMoonPhaseInterp[phase]?.theme||'',releasing:'',emerging:'',areaClosing:solarReturnHouseMeaning(moonHouse,'Moon'),newDirection:solarReturnHouseMeaning(sunHouse,'Sun')};
}
export const srMoonAngularity=(angularity:'angular'|'succedent'|'cadent'|null,house:number):{position:string;meaning:string}=>({position:angularity==='angular'?'Conjunct an angle':`House ${house}${angularity?` (${angularity})`:''}`,meaning:solarReturnHouseMeaning(house,'Moon')});
