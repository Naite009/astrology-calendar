import { solarReturnHouseDetail } from './solarReturnClientMeaning';
import { PLANET_SYMBOLS } from './solarReturnConstants';
export interface ActionGuidance {
  placement: string;        // e.g. "Mars in SR 10th House"
  planetSymbol: string;
  leanInto: string;
  avoid: string;
  bestUse: string;
  timing?: string;          // optional timing note
}


export function generateActionGuidance(planetSRHouses: Record<string, number | null>, srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }>): ActionGuidance[] {
 return ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].flatMap(planet => {
  const house = planetSRHouses[planet]; if (!house) return [];
  const detail = solarReturnHouseDetail(house, planet); if (!detail) return [];
  return [{ placement: `Solar Return ${planet} in House ${house}${srPlanets[planet]?.sign ? ` (${srPlanets[planet].sign})` : ''}${srPlanets[planet]?.isRetrograde ? ' ℞' : ''}`, planetSymbol: PLANET_SYMBOLS[planet] || planet, leanInto: detail.experience, avoid: detail.caution, bestUse: detail.focus }];
 });
}
