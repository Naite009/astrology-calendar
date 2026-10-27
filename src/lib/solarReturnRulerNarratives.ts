import { solarReturnHouseMeaning } from './solarReturnClientMeaning';
/** Signs remain exact placement labels in callers; sign alone does not establish behavioral history. */
export function generatePlotNarrative(rulerPlanet: string, _srSign: string, srHouse: number | null): string { return solarReturnHouseMeaning(srHouse,rulerPlanet); }
export function generateSettingNarrative(rulerPlanet: string, _natalSign: string, natalHouse: number | null): string { return solarReturnHouseMeaning(natalHouse,rulerPlanet); }
