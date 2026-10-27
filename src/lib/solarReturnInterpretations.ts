/** Compatibility exports for current UI/PDF consumers. No legacy prediction tables. */
import { solarReturnHouseMeaning, solarReturnHouseDetail, solarReturnOverlayMeaning } from './solarReturnClientMeaning';
const houses = Array.from({ length: 12 }, (_, i) => i + 1);
const bodies = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron'];
export const srSunInHouse: Record<number, { title: string; overview: string; experience: string; focus: string; caution: string }> = Object.fromEntries(houses.map(h => [h, solarReturnHouseDetail(h, 'Sun')]));
export const srMoonInHouse: Record<number, string> = Object.fromEntries(houses.map(h => [h, solarReturnHouseMeaning(h, 'Moon')]));
// Sign alone cannot establish a client's emotional behavior. House/aspect synthesis carries that interpretation.
export const srMoonInSign: Record<string, string> = {};
export const srOverlayNarrative = solarReturnOverlayMeaning;
export const srPlanetInHouse: Record<string, Record<number, string>> = Object.fromEntries(bodies.map(p => [p, Object.fromEntries(houses.map(h => [h, solarReturnHouseMeaning(h, p)]))]));
// Without an actual house/angle context, do not infer a life area or event from angularity alone.
export const angularPlanetMeaning: Record<string, string> = Object.fromEntries(bodies.map(p => [p, 'You may notice that your choices receive more attention from other people; check the actual house placement for the part of life involved.']));
export const srMCInHouse: Record<number, string> = Object.fromEntries(houses.map(h => [h, solarReturnOverlayMeaning('Sun', 10, h)]));
// Pair-only tables lacked chart layers, houses and orbs. Current callers use verified aspect synthesis instead.
export const srSunAspectInterps: Record<string, Record<string, string>> = {};

export const rulerConditionNarrative = (dignity: string | undefined, isRetrograde: boolean | undefined, ruler = 'The chart ruler'): string => {
  const parts: string[] = [];
  if (dignity === 'Domicile') parts.push(`${ruler} is in its own sign (traditional domicile), so its themes may be easier to act on directly.`);
  else if (dignity === 'Exaltation') parts.push(`${ruler} is in its traditional exaltation, which may make its themes feel well supported.`);
  else if (dignity === 'Detriment') parts.push(`${ruler} is in its traditional detriment, so its themes may take more deliberate adjustment.`);
  else if (dignity === 'Fall') parts.push(`${ruler} is in its traditional fall, so its themes may need more patience and support.`);
  if (isRetrograde) parts.push(`${ruler} is retrograde at the Solar Return moment, which may point to revisiting or reworking its themes before pushing them outward.`);
  return parts.join(' ');
};

