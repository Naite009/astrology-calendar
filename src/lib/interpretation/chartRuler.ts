/**
 * Chart-ruler standard for natal interpretation.
 *
 * Traditional rulership (Sun..Saturn) is always the primary chart ruler.
 * For Scorpio, Aquarius and Pisces rising the modern ruler (Pluto, Uranus,
 * Neptune) is named as a modern co-ruler, never as the unquestioned ruler.
 * Every note explains what the placements could mean, never just "where to start".
 */
import { getPsychologicalFunction, getSignStyle, getHouseArena } from './psychologicalFunctions';
import { ordinalHouse } from './ordinals';

export const TRADITIONAL_RULER: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

export const MODERN_CORULER: Record<string, string> = {
  Scorpio: 'Pluto', Aquarius: 'Uranus', Pisces: 'Neptune',
};

export interface RulerPlacementInput { sign: string; house?: number | null }

export interface ChartRulerInfo {
  ascSign: string;
  traditional: string;
  modern: string | null;
}

export function getChartRulers(ascSign: string): ChartRulerInfo | null {
  const traditional = TRADITIONAL_RULER[ascSign];
  if (!traditional) return null;
  return { ascSign, traditional, modern: MODERN_CORULER[ascSign] ?? null };
}

const BODY_NAME: Record<string, string> = { NorthNode: 'North Node', SouthNode: 'South Node' };
const name = (b: string) => BODY_NAME[b] ?? b;

/** One plain-English sentence on what a ruler placement can mean in daily life. */
export function describeRulerPlacement(body: string, p: RulerPlacementInput): string {
  const fn = getPsychologicalFunction(body);
  const job = fn ? fn.shortFunction.toLowerCase().replace(/&/g, 'and') : 'this planet';
  const where = p.house ? ` in the ${ordinalHouse(p.house)}` : '';
  const arena = p.house ? `, most often around ${getHouseArena(p.house)}` : '';
  return `${name(body)} in ${p.sign}${where} suggests their ${job} tends to work in a way that is ${getSignStyle(p.sign)}${arena}.`;
}

export function chartRulerNote(
  ascSign: string,
  placements: { traditional?: RulerPlacementInput; modern?: RulerPlacementInput },
): string {
  const r = getChartRulers(ascSign);
  if (!r) return '';
  const parts: string[] = [];
  parts.push(
    r.modern
      ? `${ascSign} rising gives ${r.traditional} traditional rulership, with ${r.modern} as the modern co-ruler.`
      : `${ascSign} rising makes ${r.traditional} the chart ruler.`,
  );
  if (placements.traditional) parts.push(describeRulerPlacement(r.traditional, placements.traditional));
  if (r.modern && placements.modern) {
    parts.push(`As the modern co-ruler, ${describeRulerPlacement(r.modern, placements.modern)}`);
  }
  if (placements.traditional && r.modern && placements.modern) {
    parts.push(
      `Put together: the way they approach life is driven first by ${name(r.traditional)}'s job, with ${name(r.modern)} adding a second layer through ${placements.modern.house ? `the ${ordinalHouse(placements.modern.house)}` : placements.modern.sign}.`,
    );
  }
  return parts.join(' ');
}
