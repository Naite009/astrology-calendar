import type { RankedAspect, AspectName } from './aspectRanking';
import { getCheckedNatalAspectReading } from './interpretation/psychologicalFunctions';

const PRETTY_NAME: Record<string, string> = { MC: 'Midheaven', NorthNode: 'North Node', SouthNode: 'South Node' };
const SYMBOL: Record<string, string> = { Sun: '☉', Moon: '☽', Ascendant: 'ASC', MC: 'MC', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', NorthNode: '☊', SouthNode: '☋', Chiron: '⚷', Lilith: '⚸' };
export const prettyName = (key: string) => PRETTY_NAME[key] || key;
export const planetSymbol = (key: string) => SYMBOL[key] || key;

export function dissociateExplanation(aspect: AspectName): string {
  return `This ${aspect} meets the degree-based orb limit, but the signs do not have the usual relationship for that aspect. Keep the measured contact separate from sign compatibility. Whether a line appears on a chart wheel depends on that program's aspect and drawing settings; a person's response cannot verify the geometry.`;
}

export interface AspectCopy {
  headline: string;
  subline: string;
  mechanic: string;
  felt: string;
  examples: string[];
  watchFor: string;
  evidenceNote: string;
  dissociate?: string;
}

/** Individual mechanism, not another whole-chart identity author. */
export function buildAspectCopy(ra: RankedAspect): AspectCopy {
  const label = (body: string, retro: boolean, sign: string, house: number | null) =>
    `${planetSymbol(body)} ${prettyName(body)}${retro ? ' Rx' : ''} in ${sign}${house ? ` (${house}H)` : ''}`;
  const meaning = getCheckedNatalAspectReading(ra);
  const totalMinutes = Math.round(ra.orb * 60);
  const retro = [ra.aRetro ? ra.a : '', ra.bRetro ? ra.b : ''].filter(Boolean);
  return {
    headline: `${label(ra.a, ra.aRetro, ra.aSign, ra.aHouse)}  ${ra.symbol}  ${label(ra.b, ra.bRetro, ra.bSign, ra.bHouse)}`,
    subline: `Orb ${Math.floor(totalMinutes / 60)}°${String(totalMinutes % 60).padStart(2, '0')}' (${ra.orb.toFixed(3)}°) · allowed ${ra.maxOrb}°${ra.isWide ? ' · wide, lower weight' : ''}${ra.dissociate ? ' · out of sign' : ''}`,
    mechanic: meaning.aspectDynamic,
    felt: meaning.signHouseContext,
    examples: meaning.howThisCanShowUp,
    watchFor: meaning.watchFor,
    evidenceNote: `Measured separation ${ra.separation.toFixed(3)}°; ${ra.aspect} target ${ra.exactAngle}°.${retro.length ? ` ${retro.join(' and ')} ${retro.length === 1 ? 'is' : 'are'} retrograde, a motion fact that does not prove emotional withdrawal or a life event.` : ''}`,
    dissociate: ra.dissociate ? dissociateExplanation(ra.aspect) : undefined,
  };
}