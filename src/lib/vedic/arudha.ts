/**
 * Arudha padas (Jaimini). The arudha of a house is the image of that house:
 * how it shows up to other people, as distinct from what it actually is.
 *
 * Rule: count from the house sign to its lord's sign, then count the same
 * number forward again from the lord's sign. If the result falls on the house
 * itself or the 7th from it, take the 10th from that result instead.
 */

import { VedicChart } from './siderealChart';
import { signIndex, signFromIndex, SIGN_LORDS } from './vedicDignity';
import { VedicPlanet } from './nakshatras';

export interface Arudha {
  house: number;
  label: string;
  /** The sign the image lands on */
  sign: string;
  /** House from the lagna where the image lands */
  inHouse: number;
  lord: VedicPlanet;
  plain: string;
}

const LABELS: Record<number, { label: string; plain: (h: number) => string }> = {
  1: {
    label: 'Arudha Lagna (AL), your public image',
    plain: h => `Your public image sits in house ${h} of your chart. Jyotish reads this as the area of life people associate you with, which is not always the area you feel you live in. What lands here is the reputation, not the private reality.`,
  },
  2: {
    label: 'Arudha of the 2nd (A2), your perceived resources',
    plain: h => `How wealthy or resourced people assume you are is coloured by house ${h}. This is perception rather than the actual balance.`,
  },
  7: {
    label: 'Arudha of the 7th (A7 or Darapada), the perceived partnership',
    plain: h => `How your relationships appear from outside is coloured by house ${h}. This describes the visible shape of partnership, not its private quality.`,
  },
  10: {
    label: 'Arudha of the 10th (A10), your perceived work',
    plain: h => `The work people think you do sits in house ${h}. It can differ from the work that actually pays or the work you care about.`,
  },
  12: {
    label: 'Upapada (UL), the image of the partnership itself',
    plain: h => `The Upapada falls in house ${h}. Classical texts use it for the visible standing of a marriage or long partnership. It is used descriptively here and never to predict whether a relationship lasts.`,
  },
};

export function arudhaFor(chart: VedicChart, house: number): Arudha | null {
  if (!chart.lagnaSign) return null;
  const lagnaIdx = signIndex(chart.lagnaSign);
  const houseSignIdx = (lagnaIdx + (house - 1)) % 12;
  const houseSign = signFromIndex(houseSignIdx);
  const lord = SIGN_LORDS[houseSign];
  const lordBody = chart.byName[lord];
  if (!lordBody) return null;

  const lordSignIdx = signIndex(lordBody.sign);
  const count = ((lordSignIdx - houseSignIdx + 12) % 12) + 1;
  let resultIdx = (lordSignIdx + (count - 1)) % 12;

  // Exception: never the house itself, never the 7th from it.
  const fromHouse = ((resultIdx - houseSignIdx + 12) % 12) + 1;
  if (fromHouse === 1 || fromHouse === 7) resultIdx = (resultIdx + 9) % 12;

  const sign = signFromIndex(resultIdx);
  const inHouse = ((resultIdx - lagnaIdx + 12) % 12) + 1;
  const meta = LABELS[house] || {
    label: `Arudha of house ${house}`,
    plain: (h: number) => `The image of house ${house} falls in house ${h}.`,
  };

  return {
    house,
    label: meta.label,
    sign,
    inHouse,
    lord,
    plain: meta.plain(inHouse),
  };
}

export const ARUDHA_NOTE =
  'An arudha is an image, not a fact. Jaimini technique separates what a house actually contains from how that part of life appears to other people. When the two disagree, that gap is usually the interesting part, and it is not a contradiction in the chart.';

export function buildArudhas(chart: VedicChart): Arudha[] {
  return [1, 2, 7, 10, 12]
    .map(h => arudhaFor(chart, h))
    .filter((a): a is Arudha => !!a);
}
