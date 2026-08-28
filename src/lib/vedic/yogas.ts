/**
 * Yoga detection: the named classical combinations Jyotish actually reads.
 *
 * Every yoga returned carries the exact placements that triggered it, so the
 * reader can check the claim. Nothing fires on a single placement unless the
 * classical definition is itself a single placement (for example Panchamahapurusha
 * yogas, which are defined by one graha in one condition in a kendra).
 *
 * Strength is reported as evidence count, not as certainty, and every
 * description stays behavioral rather than predictive.
 */

import { VedicChart, VedicBody, houseLord } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { SIGN_LORDS, signIndex, signFromIndex } from './vedicDignity';
import { NATURAL_NATURE, mutualDrishti } from './drishti';
import { VargaChart, isVargottama } from './divisionalCharts';

export interface Yoga {
  key: string;
  name: string;
  /** Plain English name so it can be read without Sanskrit */
  plainName: string;
  category: 'character' | 'wealth' | 'status' | 'strain' | 'protection' | 'learning';
  /** The exact placements that triggered it */
  evidence: string[];
  /** What it tends to look like in behavior */
  meaning: string;
  /** How much weight to put on it */
  weight: 'strong' | 'moderate' | 'noted';
  /** The grahas the combination is built from, read out of the evidence. */
  planets?: VedicPlanet[];
  /** Average condition index of those grahas, 0-100, when conditions are supplied. */
  conditionIndex?: number | null;
  /** Whether the condition check raised, lowered or left the weight alone. */
  conditionEffect?: 'raised' | 'lowered' | 'unchanged';
  /** Plain sentence explaining what the condition check did to the weight. */
  conditionNote?: string;
}

const ALL_GRAHAS: VedicPlanet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
];

/** Which grahas a yoga is actually built from, taken from its own evidence lines. */
export function yogaPlanets(yoga: Yoga): VedicPlanet[] {
  const text = [yoga.name, ...yoga.evidence].join(' ');
  return ALL_GRAHAS.filter(g => new RegExp(`\\b${g}\\b`).test(text));
}

/**
 * A yoga is only as good as the grahas that make it. A Gaja Kesari built from a
 * combust Jupiter is not the same pattern as one built from a clean Jupiter, so
 * the condition index feeds back into the weight instead of sitting beside it.
 */
export function weighYogas(
  yogas: Yoga[],
  conditions: Array<{ body: VedicPlanet; index: number; band: 'strong' | 'workable' | 'strained' }>,
): Yoga[] {
  const byBody = new Map(conditions.map(c => [c.body, c]));
  const order: Yoga['weight'][] = ['strong', 'moderate', 'noted'];

  const scored = yogas.map((y): Yoga => {
    const planets = yogaPlanets(y);
    const found = planets.map(p => byBody.get(p)).filter((c): c is NonNullable<typeof c> => !!c);
    if (!found.length) {
      return { ...y, planets, conditionIndex: null, conditionEffect: 'unchanged' };
    }

    const avg = Math.round(found.reduce((a, c) => a + c.index, 0) / found.length);
    const strained = found.filter(c => c.band === 'strained').map(c => c.body);
    const strong = found.filter(c => c.band === 'strong').map(c => c.body);

    let weight = y.weight;
    let effect: Yoga['conditionEffect'] = 'unchanged';
    const idx = order.indexOf(weight);

    if (avg < 40 && idx < order.length - 1) {
      weight = order[idx + 1];
      effect = 'lowered';
    } else if (avg >= 70 && idx > 0) {
      weight = order[idx - 1];
      effect = 'raised';
    }

    const detail = strained.length
      ? `${list(strained)} ${strained.length > 1 ? 'are' : 'is'} in strained condition here`
      : strong.length
        ? `${list(strong)} ${strong.length > 1 ? 'are' : 'is'} in strong condition here`
        : 'the grahas involved are in workable condition';

    const note =
      effect === 'lowered'
        ? `Condition check: the grahas behind this pattern average ${avg} out of 100, and ${detail}, so the pattern is real but reads weaker than the textbook version. Treat it as something that needs support rather than something that runs by itself.`
        : effect === 'raised'
          ? `Condition check: the grahas behind this pattern average ${avg} out of 100, and ${detail}, so this one carries more weight than the same combination usually would.`
          : `Condition check: the grahas behind this pattern average ${avg} out of 100, and ${detail}, so the weight stands as classically described.`;

    return { ...y, planets, conditionIndex: avg, conditionEffect: effect, weight, conditionNote: note };
  });

  const rank = { strong: 0, moderate: 1, noted: 2 } as const;
  return scored.sort(
    (a, b) => rank[a.weight] - rank[b.weight] || (b.conditionIndex ?? 0) - (a.conditionIndex ?? 0),
  );
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

const houseOf = (b: VedicBody | undefined): number | null => (b?.house ?? null);

function lordOf(chart: VedicChart, house: number): { lord: VedicPlanet; body: VedicBody } | null {
  const hl = houseLord(chart, house);
  if (!hl) return null;
  const body = chart.byName[hl.lord];
  return body ? { lord: hl.lord, body } : null;
}

/* ---------------------------------------------------------------- */
/* Panchamahapurusha                                                */
/* ---------------------------------------------------------------- */

const MAHAPURUSHA: Record<string, { planet: VedicPlanet; name: string; plainName: string; meaning: string }> = {
  Mars: {
    planet: 'Mars', name: 'Ruchaka Yoga', plainName: 'the fighter pattern',
    meaning: 'Mars is both dignified and in a corner house, which classical texts read as unusual physical courage and the willingness to take the confrontation nobody else wants. It tends to show up as someone who moves first and apologizes later, and who gets restless without something to push against.',
  },
  Mercury: {
    planet: 'Mercury', name: 'Bhadra Yoga', plainName: 'the sharp-mind pattern',
    meaning: 'Mercury is dignified in a corner house, which classically indicates quick understanding and unusual skill with words, numbers or trade. It tends to look like someone who can explain a complicated thing quickly, and who gets impatient when others are slow.',
  },
  Jupiter: {
    planet: 'Jupiter', name: 'Hamsa Yoga', plainName: 'the counselor pattern',
    meaning: 'Jupiter is dignified in a corner house, which classically indicates someone people come to for judgement. It tends to look like being trusted with other people\'s decisions, and sometimes like taking on more advising than you asked for.',
  },
  Venus: {
    planet: 'Venus', name: 'Malavya Yoga', plainName: 'the grace pattern',
    meaning: 'Venus is dignified in a corner house, which classically indicates ease with beauty, comfort and relating. It tends to look like people finding you easy to be around, and like having a real need for surroundings that feel good rather than merely functional.',
  },
  Saturn: {
    planet: 'Saturn', name: 'Shasha Yoga', plainName: 'the endurance pattern',
    meaning: 'Saturn is dignified in a corner house, which classically indicates authority earned slowly rather than given. It tends to look like outlasting people, taking responsibility early, and finding it hard to let go of control once you have carried something.',
  },
};

function panchamahapurusha(chart: VedicChart): Yoga[] {
  const out: Yoga[] = [];
  for (const key of Object.keys(MAHAPURUSHA)) {
    const spec = MAHAPURUSHA[key];
    const b = chart.byName[spec.planet];
    if (!b || !b.house) continue;
    const dignified = b.dignity === 'exalted' || b.dignity === 'own sign' || b.dignity === 'moolatrikona';
    if (dignified && KENDRA.includes(b.house)) {
      out.push({
        key: `mahapurusha-${spec.planet}`,
        name: spec.name,
        plainName: spec.plainName,
        category: 'character',
        evidence: [`${spec.planet} is ${b.dignity} in ${b.sign} and sits in house ${b.house}, a corner house`],
        meaning: spec.meaning,
        weight: b.dignity === 'exalted' ? 'strong' : 'moderate',
      });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* Raja and Dhana yogas                                             */
/* ---------------------------------------------------------------- */

function rajaYogas(chart: VedicChart): Yoga[] {
  if (!chart.lagnaSign) return [];
  const out: Yoga[] = [];
  const seen = new Set<string>();

  for (const k of KENDRA) {
    for (const t of TRIKONA) {
      const a = lordOf(chart, k);
      const b = lordOf(chart, t);
      if (!a || !b || a.lord === b.lord) continue;
      const together = a.body.sign === b.body.sign;
      const mutual = mutualDrishti(a.body, b.body);
      if (!together && !mutual) continue;
      const pair = [a.lord, b.lord].sort().join('-');
      if (seen.has(pair)) continue;
      seen.add(pair);
      out.push({
        key: `raja-${pair}`,
        name: 'Raja Yoga',
        plainName: 'a rise-in-standing pattern',
        category: 'status',
        evidence: [
          `${a.lord} rules house ${k}, a corner house`,
          `${b.lord} rules house ${t}, a trine house`,
          together
            ? `both sit together in ${a.body.sign}`
            : `they look at each other by classical glance from ${a.body.sign} and ${b.body.sign}`,
        ],
        meaning: 'A corner-house lord and a trine-house lord are linked, which Jyotish reads as effort and support arriving in the same place. In behavior it usually shows as work that raises your standing rather than merely paying you, and it tends to activate during the periods of the two grahas involved rather than continuously.',
        weight: together ? 'strong' : 'moderate',
      });
    }
  }
  return out;
}

function dhanaYogas(chart: VedicChart): Yoga[] {
  if (!chart.lagnaSign) return [];
  const out: Yoga[] = [];
  const wealthHouses = [2, 11];
  const supportHouses = [1, 5, 9];

  for (const w of wealthHouses) {
    for (const s of supportHouses) {
      const a = lordOf(chart, w);
      const b = lordOf(chart, s);
      if (!a || !b || a.lord === b.lord) continue;
      if (a.body.sign !== b.body.sign && !mutualDrishti(a.body, b.body)) continue;
      out.push({
        key: `dhana-${w}-${s}`,
        name: 'Dhana Yoga',
        plainName: 'an earning pattern',
        category: 'wealth',
        evidence: [
          `${a.lord} rules house ${w}, an income house`,
          `${b.lord} rules house ${s}, a supporting house`,
          a.body.sign === b.body.sign ? `both sit in ${a.body.sign}` : `they exchange classical glances`,
        ],
        meaning: 'An income house lord is tied to a supporting house lord. Practically this points at money arriving through the area of life that house governs rather than through general luck, and it describes a route rather than an amount.',
        weight: a.body.sign === b.body.sign ? 'moderate' : 'noted',
      });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* Common named yogas                                               */
/* ---------------------------------------------------------------- */

function namedYogas(chart: VedicChart, navamsa?: VargaChart): Yoga[] {
  const out: Yoga[] = [];
  const moon = chart.byName.Moon;
  const sun = chart.byName.Sun;
  const jup = chart.byName.Jupiter;
  const mer = chart.byName.Mercury;
  const sat = chart.byName.Saturn;
  const mars = chart.byName.Mars;
  const ven = chart.byName.Venus;

  // Gaja Kesari: Jupiter in a corner house from the Moon.
  if (moon && jup && moon.house && jup.house) {
    const dist = ((signIndex(jup.sign) - signIndex(moon.sign) + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(dist)) {
      out.push({
        key: 'gaja-kesari',
        name: 'Gaja Kesari Yoga',
        plainName: 'the steady-nerve pattern',
        category: 'protection',
        evidence: [`Jupiter in ${jup.sign} sits ${dist === 1 ? 'with' : `${dist} signs from`} the Moon in ${moon.sign}, a corner relationship`],
        meaning: 'Jupiter holds a corner position from the Moon. Classically this is read as the mind having something to hold onto under pressure: perspective tends to return faster than it does for most people, and other people notice you are hard to panic.',
        weight: 'moderate',
      });
    }
  }

  // Chandra Mangala: Moon with Mars.
  if (moon && mars && moon.sign === mars.sign) {
    out.push({
      key: 'chandra-mangala',
      name: 'Chandra Mangala Yoga',
      plainName: 'the drive-and-feeling pattern',
      category: 'wealth',
      evidence: [`Moon and Mars are both in ${moon.sign}`],
      meaning: 'Feeling and drive sit in the same place, so emotion converts into action quickly. Classical texts connect it with earning through initiative. It also means irritation and motivation are hard to separate, and rest has to be deliberate.',
      weight: 'moderate',
    });
  }

  // Budhaditya: Sun with Mercury.
  if (sun && mer && sun.sign === mer.sign) {
    out.push({
      key: 'budhaditya',
      name: 'Budhaditya Yoga',
      plainName: 'the clear-thinking pattern',
      category: 'learning',
      evidence: [`Sun and Mercury are both in ${sun.sign}`],
      meaning: 'Identity and thinking run together, so what you understand and who you are tend to be the same thing. It usually shows as being good at explaining, and as taking disagreement about ideas more personally than expected.',
      weight: 'moderate',
    });
  }

  // Amala: only a benefic in the 10th from Moon or lagna.
  const tenthSign = chart.lagnaSign ? signFromIndex((signIndex(chart.lagnaSign) + 9) % 12) : null;
  if (tenthSign) {
    const inTenth = chart.bodies.filter(b => b.sign === tenthSign);
    if (inTenth.length && inTenth.every(b => NATURAL_NATURE[b.name] === 'benefic')) {
      out.push({
        key: 'amala',
        name: 'Amala Yoga',
        plainName: 'the clean-reputation pattern',
        category: 'status',
        evidence: [`only ${inTenth.map(b => b.name).join(' and ')} occupy the tenth house sign, ${tenthSign}`],
        meaning: 'The house of public work holds only gentle grahas. Jyotish reads it as a reputation that stays reasonably clean, largely because you dislike the feeling of having cut a corner, not because nothing ever goes wrong.',
        weight: 'noted',
      });
    }
  }

  // Kemadruma and its cancellation: nothing in the 2nd or 12th from the Moon.
  if (moon) {
    const mIdx = signIndex(moon.sign);
    const neighbors = [(mIdx + 1) % 12, (mIdx + 11) % 12].map(signFromIndex);
    const occupants = chart.bodies.filter(b => b.name !== 'Moon' && neighbors.includes(b.sign));
    if (!occupants.length) {
      const kendraFromMoon = chart.bodies.some(b => {
        if (b.name === 'Moon') return false;
        const d = ((signIndex(b.sign) - mIdx + 12) % 12) + 1;
        return [4, 7, 10].includes(d) && NATURAL_NATURE[b.name] === 'benefic';
      });
      out.push({
        key: 'kemadruma',
        name: kendraFromMoon ? 'Kemadruma Yoga, cancelled' : 'Kemadruma Yoga',
        plainName: kendraFromMoon ? 'the lonely-mind pattern, largely offset' : 'the lonely-mind pattern',
        category: 'strain',
        evidence: [
          `no graha sits in the signs either side of the Moon in ${moon.sign}`,
          ...(kendraFromMoon ? ['a benefic holds a corner position from the Moon, which classical texts treat as cancelling most of it'] : []),
        ],
        meaning: kendraFromMoon
          ? 'The Moon has no immediate neighbors, which classically suggests processing things alone, but a benefic in a corner from it takes most of the edge off. In practice it usually means you work things out internally first and then bring people in, rather than feeling genuinely unsupported.'
          : 'The Moon has no immediate neighbors. Classically this describes having to steady yourself without much surrounding help, which often shows up as processing privately and being slow to say when something is hard. It is a description of how support arrives, not a statement that support is absent.',
        weight: kendraFromMoon ? 'noted' : 'moderate',
      });
    }
  }

  // Sade-Sati style pressure marker in the natal chart: Saturn on the Moon.
  if (sat && moon) {
    const d = ((signIndex(sat.sign) - signIndex(moon.sign) + 12) % 12);
    if ([0, 1, 11].includes(d)) {
      out.push({
        key: 'saturn-moon',
        name: 'Saturn with or beside the Moon',
        plainName: 'the early-responsibility pattern',
        category: 'strain',
        evidence: [`Saturn in ${sat.sign} is ${d === 0 ? 'in the same sign as' : 'in the sign next to'} the Moon in ${moon.sign}`],
        meaning: 'Saturn sits on or beside the emotional significator from birth. Classically this describes growing up with more responsibility than comfort, so the usual result is high competence and a habit of assuming nobody is coming to help. This is about pattern, not about any specific hardship.',
        weight: d === 0 ? 'moderate' : 'noted',
      });
    }
  }

  // Vargottama grahas: strongest single durability mark.
  if (navamsa) {
    const vg = chart.bodies.filter(b => isVargottama(chart, navamsa, b.name));
    if (vg.length) {
      out.push({
        key: 'vargottama',
        name: 'Vargottama placement',
        plainName: 'a placement that repeats itself',
        category: 'character',
        evidence: vg.map(b => `${b.name} holds ${b.sign} in both the birth chart and the navamsa`),
        meaning: `${vg.map(b => b.name).join(', ')} ${vg.length > 1 ? 'keep' : 'keeps'} the same sign in the navamsa. Classical texts treat this as the clearest single sign of durability: what this graha does is consistent over a lifetime rather than situational, so it is usually one of the traits people would use to describe you without hesitating.`,
        weight: 'strong',
      });
    }
  }

  // Venus and Jupiter linked: the classic ease pairing.
  if (ven && jup && (ven.sign === jup.sign || mutualDrishti(ven, jup))) {
    out.push({
      key: 'venus-jupiter',
      name: 'Venus linked to Jupiter',
      plainName: 'the generosity pattern',
      category: 'protection',
      evidence: [ven.sign === jup.sign ? `Venus and Jupiter are both in ${ven.sign}` : `Venus in ${ven.sign} and Jupiter in ${jup.sign} exchange classical glances`],
      meaning: 'The two gentle grahas are connected, which usually shows as people wanting to help you and as you giving more than is strictly required. The cost is that saying no takes conscious effort.',
      weight: 'noted',
    });
  }

  return out;
}

/* ---------------------------------------------------------------- */
/* Public builder                                                   */
/* ---------------------------------------------------------------- */

export const YOGA_NOTE =
  'A yoga is a named combination, not a verdict. Classical texts describe hundreds, and most people have several that pull in different directions, which is normal and is why no single one is read on its own. Each pattern below lists the exact placements behind it so you can check it yourself.';

export function buildYogas(
  chart: VedicChart,
  navamsa?: VargaChart,
  conditions?: Array<{ body: VedicPlanet; index: number; band: 'strong' | 'workable' | 'strained' }>,
): Yoga[] {
  const all = [
    ...panchamahapurusha(chart),
    ...rajaYogas(chart),
    ...dhanaYogas(chart),
    ...namedYogas(chart, navamsa),
  ];
  if (conditions && conditions.length) return weighYogas(all, conditions).slice(0, 14);
  const order = { strong: 0, moderate: 1, noted: 2 } as const;
  return all
    .map(y => ({ ...y, planets: yogaPlanets(y), conditionIndex: null, conditionEffect: 'unchanged' as const }))
    .sort((a, b) => order[a.weight] - order[b.weight])
    .slice(0, 14);
}

export const YOGA_CONDITION_NOTE =
  'Each pattern below is weighted by the condition of the grahas that build it, not just by whether the combination exists. The same named yoga can be a headline in one chart and a footnote in another, and the condition line under each one says which it is here.';

export { DUSTHANA };
