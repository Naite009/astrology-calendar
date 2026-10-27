import { solarReturnHouseDetail } from './solarReturnClientMeaning';
export interface SRPlanetHouseDeep {
  title: string;
  overview: string;
  practical: string;
  caution: string;
  source?: string;
}


const bank = (planet: string): Record<number, SRPlanetHouseDeep> => Object.fromEntries(Array.from({ length: 12 }, (_, i) => {
  const h = i + 1, detail = solarReturnHouseDetail(h, planet);
  return [h, { title: detail?.title || '', overview: detail?.overview || '', practical: detail?.experience || '', caution: detail?.focus || '' }];
}));
export const srJupiterInHouseDeep = bank('Jupiter');
export const srMercuryInHouseDeep = bank('Mercury');
export const srVenusInHouseDeep = bank('Venus');
export const srMarsInHouseDeep = bank('Mars');
export const srSaturnInHouseDeep = bank('Saturn');
export const srUranusInHouseDeep = bank('Uranus');
export const srNeptuneInHouseDeep = bank('Neptune');
export const srPlutoInHouseDeep = bank('Pluto');
