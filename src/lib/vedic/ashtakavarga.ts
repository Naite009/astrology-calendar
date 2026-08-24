/**
 * Ashtakavarga: the classical Parashari point system.
 *
 * Each of the seven grahas earns benefic points (bindus) in each sign, awarded
 * from eight reference points: the seven grahas themselves plus the Lagna.
 * Bhinnashtakavarga (BAV) is one graha's own 12-sign score. Sarvashtakavarga
 * (SAV) is the sum of the seven BAVs per sign, and it is the single most
 * practical filter in Jyotish for judging which signs and houses actually
 * deliver when a planet transits them.
 *
 * Tables: Brihat Parashara Hora Shastra, Chapter 66. Every planet's eight rows
 * reconcile to the canonical totals (Sun 48, Moon 49, Mars 39, Mercury 54,
 * Jupiter 56, Venus 52, Saturn 39), grand total 337. Verified against a source
 * citing BPHS verse numbers directly, because free transcriptions of these
 * tables are commonly corrupted.
 *
 * All math is deterministic. No AI is involved.
 */

import { VedicChart } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { signFromIndex, signIndex } from './vedicDignity';

export type AshtakaPlanet = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
type Reference = AshtakaPlanet | 'Lagna';

export const ASHTAKA_PLANETS: AshtakaPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Houses counted from each reference point that receive a bindu.
 * 1 means the same sign as the reference point.
 */
const BAV_TABLES: Record<AshtakaPlanet, Record<Reference, number[]>> = {
  // BPHS 66.43-45, total 48
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12],
  },
  // BPHS 66.46-48, total 49
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 9, 10, 11],
    Mars: [2, 3, 5, 6, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 2, 4, 7, 8, 10, 11],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11],
  },
  // BPHS 66.49-50, total 39
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11],
  },
  // BPHS 66.51-52, total 54
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  // BPHS 66.53-55, total 56
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  // BPHS 66.56-58, total 52
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 4, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  // BPHS 66.59-60, total 39
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
  },
};

/** Canonical totals, used as a self-check so a corrupted table can never ship silently. */
export const BAV_TOTALS: Record<AshtakaPlanet, number> = {
  Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39,
};

export const SAV_GRAND_TOTAL = 337;
export const SAV_AVERAGE_PER_SIGN = SAV_GRAND_TOTAL / 12; // ~28.08

export type SavBand = 'strong' | 'average' | 'weak';

export interface BavChart {
  planet: AshtakaPlanet;
  /** Bindus per sign, index 0 = Aries. */
  bySignIndex: number[];
  /** Bindus in the sign the graha itself occupies at birth. */
  ownSignBindus: number | null;
  total: number;
}

export interface SavSign {
  sign: string;
  signIndex: number;
  /** Whole-sign house from the lagna, when a birth time exists. */
  house: number | null;
  bindus: number;
  band: SavBand;
  /** Which grahas contributed the most points to this sign. */
  topContributors: AshtakaPlanet[];
}

export interface AshtakavargaReport {
  bav: BavChart[];
  sav: SavSign[];
  /** Sorted strongest first. */
  strongestSigns: SavSign[];
  weakestSigns: SavSign[];
  /** Plain-language read of what the high and low signs mean in practice. */
  plain: string[];
  /** True when every BAV reconciles to its classical total. */
  verified: boolean;
}

export const ASHTAKAVARGA_NOTE =
  'Ashtakavarga is a scoring layer, not a second chart. Each planet hands out points to the twelve signs from eight ' +
  'different reference points, and the totals show where the chart has support and where it runs thin. It is used ' +
  'mainly for timing: the same transit lands very differently in a sign holding 33 points than in one holding 21.';

export function savBand(bindus: number): SavBand {
  if (bindus >= 30) return 'strong';
  if (bindus >= 25) return 'average';
  return 'weak';
}

export const SAV_BAND_MEANING: Record<SavBand, string> = {
  strong:
    'Above the classical average. Effort put into this area of life tends to return something, and planets crossing ' +
    'this sign usually produce workable results rather than friction.',
  average:
    'Around the classical average, so outcomes here track your effort fairly closely. Nothing is stacked for or ' +
    'against you.',
  weak:
    'Below the classical average. This area tends to need more preparation and more patience than it seems to deserve, ' +
    'and transits through this sign are usually better used for maintenance than for launching something new.',
};

const HOUSE_LIFE_AREA: Record<number, string> = {
  1: 'your body, health and how you start things',
  2: 'income, savings and what you say',
  3: 'effort, siblings, skills and short trips',
  4: 'home, family and inner steadiness',
  5: 'children, creative output and study',
  6: 'work routines, competition and health upkeep',
  7: 'partnership and one-to-one dealings',
  8: 'shared money, endings and deep change',
  9: 'belief, teachers, travel and luck',
  10: 'career and public standing',
  11: 'gains, networks and long-range goals',
  12: 'rest, letting go, foreign places and inner life',
};

/**
 * Builds the full Ashtakavarga report from a sidereal chart.
 * Requires the seven classical grahas. The Lagna row is skipped when the
 * chart has no birth time, and that is stated rather than faked.
 */
export function buildAshtakavarga(chart: VedicChart): AshtakavargaReport | null {
  const refIndex: Partial<Record<Reference, number>> = {};
  for (const p of ASHTAKA_PLANETS) {
    const body = chart.byName[p as VedicPlanet];
    if (!body) return null;
    refIndex[p] = signIndex(body.sign);
  }
  if (chart.lagnaSign) refIndex.Lagna = signIndex(chart.lagnaSign);

  const bav: BavChart[] = [];
  let verified = true;

  for (const planet of ASHTAKA_PLANETS) {
    const bySignIndex = new Array(12).fill(0);
    const rows = BAV_TABLES[planet];
    let expected = 0;

    for (const ref of Object.keys(rows) as Reference[]) {
      const houses = rows[ref];
      expected += houses.length;
      const base = refIndex[ref];
      if (base === undefined) continue; // no lagna, no lagna row
      for (const h of houses) bySignIndex[(base + h - 1) % 12] += 1;
    }

    if (expected !== BAV_TOTALS[planet]) verified = false;

    const own = chart.byName[planet as VedicPlanet];
    bav.push({
      planet,
      bySignIndex,
      ownSignBindus: own ? bySignIndex[signIndex(own.sign)] : null,
      total: bySignIndex.reduce((a, b) => a + b, 0),
    });
  }

  const lagnaIdx = chart.lagnaSign ? signIndex(chart.lagnaSign) : null;

  const sav: SavSign[] = [];
  for (let i = 0; i < 12; i++) {
    const bindus = bav.reduce((sum, b) => sum + b.bySignIndex[i], 0);
    const contributors = [...bav]
      .sort((a, b) => b.bySignIndex[i] - a.bySignIndex[i])
      .slice(0, 2)
      .filter(b => b.bySignIndex[i] >= 5)
      .map(b => b.planet);
    sav.push({
      sign: signFromIndex(i),
      signIndex: i,
      house: lagnaIdx === null ? null : ((i - lagnaIdx + 12) % 12) + 1,
      bindus,
      band: savBand(bindus),
      topContributors: contributors,
    });
  }

  const ranked = [...sav].sort((a, b) => b.bindus - a.bindus);
  const strongestSigns = ranked.slice(0, 3);
  const weakestSigns = ranked.slice(-3).reverse();

  const plain: string[] = [];
  const top = strongestSigns[0];
  const low = weakestSigns[0];

  plain.push(
    `Across the twelve signs this chart spreads ${SAV_GRAND_TOTAL} points, so an average sign holds about 28. ` +
    `${top.sign} holds ${top.bindus}, the highest here${top.house ? `, and that is your ${ordinal(top.house)} house, covering ${HOUSE_LIFE_AREA[top.house]}` : ''}. ` +
    `${low.sign} holds ${low.bindus}, the lowest${low.house ? `, which is your ${ordinal(low.house)} house, covering ${HOUSE_LIFE_AREA[low.house]}` : ''}.`
  );

  plain.push(
    top.house
      ? `In practice that means ${HOUSE_LIFE_AREA[top.house]} tends to be the part of life where your effort compounds, ` +
        `and it is usually the smartest place to spend a good transit. ${HOUSE_LIFE_AREA[low.house!].charAt(0).toUpperCase()}${HOUSE_LIFE_AREA[low.house!].slice(1)} ` +
        `tends to need more setup, more help and more time than it looks like it should, which is worth planning for rather than reading as failure.`
      : `Without a birth time the houses cannot be attached to these signs, so read this as sign strength only. Adding an exact ` +
        `birth time will map each score onto an actual area of life.`
  );

  plain.push(
    `The scores matter most for timing. When a slow planet moves through a high-scoring sign, its period usually produces ` +
    `something you can point to. When it moves through a low-scoring sign, the same period tends to ask for maintenance, ` +
    `repair and rest instead. None of this is fixed fortune, and a low score is not a warning of harm.`
  );

  return { bav, sav, strongestSigns, weakestSigns, plain, verified };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Looks up the SAV score for a transiting sign, used by the gochara read. */
export function savForSign(report: AshtakavargaReport | null, sign: string): SavSign | null {
  if (!report) return null;
  return report.sav.find(s => s.sign === sign) || null;
}

/** Looks up a specific graha's own bindus in a sign, the finer transit filter. */
export function bavForTransit(
  report: AshtakavargaReport | null,
  planet: VedicPlanet,
  sign: string
): number | null {
  if (!report) return null;
  const row = report.bav.find(b => b.planet === (planet as AshtakaPlanet));
  if (!row) return null;
  return row.bySignIndex[signIndex(sign)];
}

/** SAV row for a whole-sign house, when the chart has a birth time. */
export function savForHouse(report: AshtakavargaReport | null, house: number): SavSign | null {
  if (!report) return null;
  return report.sav.find(s => s.house === house) || null;
}

/**
 * The sentence the money, career and partnership sections use so the bindu
 * scores actually feed the reading instead of sitting in their own card.
 * Returns null when there is no birth time, because the houses cannot be placed.
 */
export function binduSupportSentence(
  report: AshtakavargaReport | null,
  houses: number[],
  topic: string,
): string | null {
  if (!report) return null;
  const rows = houses.map(h => savForHouse(report, h)).filter((r): r is SavSign => !!r);
  if (!rows.length) return null;

  const parts = rows.map(
    r => `your ${ordinal(r.house!)} house (${r.sign}) holds ${r.bindus} points`,
  );
  const best = [...rows].sort((a, b) => b.bindus - a.bindus)[0];
  const worst = [...rows].sort((a, b) => a.bindus - b.bindus)[0];

  const verdict =
    best.bindus >= 30
      ? `The ${ordinal(best.house!)} house is the supported one at ${best.bindus}, so ${topic} tends to respond best when routed through ${HOUSE_LIFE_AREA[best.house!]}.`
      : best.bindus >= 25
        ? `Nothing here is stacked either way, so ${topic} tracks your effort fairly closely rather than being helped or hindered by the chart.`
        : `All of these sit below the classical average, which reads as ${topic} needing more preparation and more patience than it looks like it should, not as a limit on what is possible.`;

  const caution =
    rows.length > 1 && worst.bindus < 25 && worst.house !== best.house
      ? ` The ${ordinal(worst.house!)} house is the thin one at ${worst.bindus}, so plans that depend mainly on ${HOUSE_LIFE_AREA[worst.house!]} usually need a second support built in.`
      : '';

  return `Ashtakavarga check. Across the 337 points in the chart an average house holds about 28, and ${parts.join(', ')}. ${verdict}${caution} These scores matter most for timing: the same transit through a high-scoring house produces something you can point to, and through a low-scoring one usually asks for maintenance instead.`;
}
