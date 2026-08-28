/**
 * Graha drishti: the way the nine grahas look at each other and at houses.
 *
 * Classical Parashari rules only, no Western aspect geometry:
 *  - Every graha casts a full glance on the 7th house from itself.
 *  - Mars adds the 4th and the 8th.
 *  - Jupiter adds the 5th and the 9th.
 *  - Saturn adds the 3rd and the 10th.
 *  - Rahu and Ketu are given the 5th, 7th and 9th, which is the widely used
 *    convention. It is labeled as a convention wherever it is displayed.
 *
 * Everything here is whole-sign counting, deterministic, and never estimated.
 */

import { VedicChart, VedicBody } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { signIndex, signFromIndex, SIGN_LORDS } from './vedicDignity';

export type DrishtiKind = 'full' | 'special';

export interface Drishti {
  from: VedicPlanet;
  /** Whole-sign distance, 1 is the graha's own sign */
  distance: number;
  kind: DrishtiKind;
  /** The sign being looked at */
  sign: string;
  /** House from the lagna, when a lagna exists */
  house: number | null;
  /** Plain reason this glance exists */
  rule: string;
}

export interface BodyDrishti {
  body: VedicPlanet;
  /** Glances this graha casts */
  casts: Drishti[];
  /** Grahas looking back at this graha's own sign */
  receives: { from: VedicPlanet; distance: number; kind: DrishtiKind; nature: 'benefic' | 'malefic' }[];
}

/** Natural benefics and malefics as Jyotish grades them, before any temporary status. */
export const NATURAL_NATURE: Record<VedicPlanet, 'benefic' | 'malefic'> = {
  Jupiter: 'benefic',
  Venus: 'benefic',
  Moon: 'benefic',
  Mercury: 'benefic',
  Sun: 'malefic',
  Mars: 'malefic',
  Saturn: 'malefic',
  Rahu: 'malefic',
  Ketu: 'malefic',
};

const SPECIAL: Partial<Record<VedicPlanet, number[]>> = {
  Mars: [4, 8],
  Jupiter: [5, 9],
  Saturn: [3, 10],
  Rahu: [5, 9],
  Ketu: [5, 9],
};

const SPECIAL_RULE: Partial<Record<VedicPlanet, string>> = {
  Mars: 'Mars additionally looks at the 4th and 8th from itself, which is why its pressure lands on home ground and on hidden matters.',
  Jupiter: 'Jupiter additionally looks at the 5th and 9th from itself, which is why its support reaches creativity, children, teaching and belief.',
  Saturn: 'Saturn additionally looks at the 3rd and 10th from itself, which is why its discipline lands on effort, courage and public work.',
  Rahu: 'By the commonly used convention Rahu is given the 5th, 7th and 9th glance. Classical texts are not unanimous on this.',
  Ketu: 'By the commonly used convention Ketu is given the 5th, 7th and 9th glance. Classical texts are not unanimous on this.',
};

function distanceBetweenSigns(fromSign: string, toSign: string): number {
  return ((signIndex(toSign) - signIndex(fromSign) + 12) % 12) + 1;
}

/** Every glance one graha casts. */
export function castsFrom(chart: VedicChart, body: VedicBody): Drishti[] {
  const out: Drishti[] = [];
  const own = signIndex(body.sign);
  const add = (distance: number, kind: DrishtiKind, rule: string) => {
    const sign = signFromIndex(own + (distance - 1));
    out.push({
      from: body.name,
      distance,
      kind,
      sign,
      house: chart.lagnaSign ? distanceBetweenSigns(chart.lagnaSign, sign) : null,
      rule,
    });
  };

  add(7, 'full', 'Every graha casts a full glance on the 7th sign from itself. This is the one aspect all of them share.');
  for (const d of SPECIAL[body.name] || []) {
    add(d, 'special', SPECIAL_RULE[body.name] || '');
  }
  return out;
}

/** Which grahas are looking at a given sign, and with what nature. */
export function receivedBy(chart: VedicChart, sign: string) {
  const out: BodyDrishti['receives'] = [];
  for (const other of chart.bodies) {
    if (other.sign === sign) continue;
    const d = distanceBetweenSigns(other.sign, sign);
    const special = SPECIAL[other.name] || [];
    if (d === 7 || special.includes(d)) {
      out.push({
        from: other.name,
        distance: d,
        kind: d === 7 ? 'full' : 'special',
        nature: NATURAL_NATURE[other.name],
      });
    }
  }
  return out;
}

export function buildDrishti(chart: VedicChart): BodyDrishti[] {
  return chart.bodies.map(b => ({
    body: b.name,
    casts: castsFrom(chart, b),
    receives: receivedBy(chart, b.sign),
  }));
}

/** Which grahas look at a house counted from the lagna. */
export function drishtiOnHouse(chart: VedicChart, house: number) {
  if (!chart.lagnaSign) return [];
  const sign = signFromIndex(signIndex(chart.lagnaSign) + (house - 1));
  return receivedBy(chart, sign);
}

/**
 * Drik bala style summary for one graha: how much benefic versus malefic
 * attention its sign is receiving. Used to scale how strongly a statement is
 * allowed to be made, never presented as a numeric score on its own.
 */
export function drishtiBalance(chart: VedicChart, body: VedicBody): {
  benefics: VedicPlanet[];
  malefics: VedicPlanet[];
  verdict: 'supported' | 'pressured' | 'mixed' | 'unaspected';
  plain: string;
} {
  const rec = receivedBy(chart, body.sign);
  const benefics = rec.filter(r => r.nature === 'benefic').map(r => r.from);
  const malefics = rec.filter(r => r.nature === 'malefic').map(r => r.from);

  let verdict: 'supported' | 'pressured' | 'mixed' | 'unaspected';
  if (!rec.length) verdict = 'unaspected';
  else if (benefics.length && !malefics.length) verdict = 'supported';
  else if (malefics.length && !benefics.length) verdict = 'pressured';
  else verdict = 'mixed';

  const plain = {
    supported: `${body.name} is looked at only by ${benefics.join(' and ')}, which classically eases how this part of life operates.`,
    pressured: `${body.name} is looked at only by ${malefics.join(' and ')}, which classically adds pressure and delay to this part of life rather than removing it.`,
    mixed: `${body.name} is looked at by ${benefics.join(' and ')} and also by ${malefics.join(' and ')}, so this part of life tends to run hot and cold rather than one way.`,
    unaspected: `No graha casts a classical glance on ${body.name}, so it tends to operate on its own terms without much help or much interference.`,
  }[verdict];

  return { benefics, malefics, verdict, plain };
}

/** Mutual glance between two grahas, which classical texts weigh heavily. */
export function mutualDrishti(a: VedicBody, b: VedicBody): boolean {
  const dAB = distanceBetweenSigns(a.sign, b.sign);
  const dBA = distanceBetweenSigns(b.sign, a.sign);
  const looks = (from: VedicBody, d: number) => d === 7 || (SPECIAL[from.name] || []).includes(d);
  return looks(a, dAB) && looks(b, dBA);
}

/** Parivartana, the mutual exchange of signs between two house lords. */
export function signExchanges(chart: VedicChart): { a: VedicPlanet; b: VedicPlanet; plain: string }[] {
  const out: { a: VedicPlanet; b: VedicPlanet; plain: string }[] = [];
  for (let i = 0; i < chart.bodies.length; i++) {
    for (let j = i + 1; j < chart.bodies.length; j++) {
      const a = chart.bodies[i];
      const b = chart.bodies[j];
      if (a.name === 'Rahu' || a.name === 'Ketu' || b.name === 'Rahu' || b.name === 'Ketu') continue;
      if (SIGN_LORDS[a.sign] === b.name && SIGN_LORDS[b.sign] === a.name) {
        out.push({
          a: a.name,
          b: b.name,
          plain: `${a.name} and ${b.name} have swapped signs. Classical texts call this parivartana, an exchange, and read the two areas they govern as permanently wired into each other.`,
        });
      }
    }
  }
  return out;
}
