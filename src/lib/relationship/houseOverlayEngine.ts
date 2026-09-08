/**
 * CANONICAL synastry house overlays.
 *
 * A house overlay answers: "which area of B's life does A's planet land in?"
 * It must use B's actual house cusps whenever the chart stores them, because a
 * Placidus chart routinely puts a planet in a different house than whole-sign
 * counting from the Ascendant sign would.
 *
 * Whole-sign counting is only used when the chart genuinely uses whole-sign
 * houses or when cusp data is missing, and the fallback is labelled.
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { getHouseForLongitude, signDegreesToLongitude } from '@/lib/houseCalculations';
import { ordinal } from '@/lib/interpretation/ordinals';
import { CORE_SYNASTRY_BODIES, collectSynastryLongitudes } from './synastryEngine';
import { AgeStage } from '@/lib/readingGuide/ageContext';
import { houseArena } from '@/lib/readingGuide/ageContext';

export type OverlayMethod = 'cusps' | 'whole-sign' | 'whole-sign-fallback';

export interface HouseOverlayContact {
  body: string;
  bodyOwner: string;
  house: number;
  houseOwner: string;
  /** Which life area of the recipient's chart, in age-appropriate language. */
  arena: string;
  method: OverlayMethod;
  /** Direction-explicit sentence: "Ava's Moon falls in Max's 4th house". */
  statement: string;
  /** Note shown when the house could only be approximated. */
  approximationNote?: string;
}

const ZODIAC = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function hasFullCusps(chart: NatalChart): boolean {
  if (!chart.houseCusps) return false;
  for (let i = 1; i <= 12; i++) {
    const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (!cusp?.sign) return false;
  }
  return true;
}

function wholeSignHouse(longitude: number, chart: NatalChart): number | null {
  const asc = chart.houseCusps?.house1 ?? chart.planets?.Ascendant;
  if (!asc?.sign) return null;
  const ascIndex = ZODIAC.indexOf(asc.sign);
  if (ascIndex === -1) return null;
  const bodyIndex = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return ((bodyIndex - ascIndex + 12) % 12) + 1;
}

export interface OverlayResolution {
  house: number | null;
  method: OverlayMethod;
}

/** Resolve which of the recipient's houses a longitude falls in. */
export function resolveOverlayHouse(longitude: number, recipient: NatalChart): OverlayResolution {
  const declaredWholeSign = recipient.houseSystem === 'whole-sign';
  if (!declaredWholeSign && hasFullCusps(recipient)) {
    const house = getHouseForLongitude(longitude, recipient);
    if (house !== null) return { house, method: 'cusps' };
  }
  if (declaredWholeSign) {
    return { house: wholeSignHouse(longitude, recipient), method: 'whole-sign' };
  }
  return { house: wholeSignHouse(longitude, recipient), method: 'whole-sign-fallback' };
}

export interface OverlayOptions {
  /** Bodies to place. Defaults to the 10 planets + nodes + Chiron (no angles). */
  bodies?: string[];
  stage?: AgeStage;
  includeAdvancedBodies?: boolean;
}

const DEFAULT_OVERLAY_BODIES = CORE_SYNASTRY_BODIES.filter(
  (b) => b !== 'Ascendant' && b !== 'Midheaven'
);

/**
 * One direction: `donor`'s bodies placed in `recipient`'s houses.
 */
export function overlaysFor(
  donor: NatalChart,
  recipient: NatalChart,
  opts: OverlayOptions = {}
): HouseOverlayContact[] {
  const stage = opts.stage ?? 'adult';
  const bodies = opts.bodies ?? [...DEFAULT_OVERLAY_BODIES];
  const longitudes = collectSynastryLongitudes(donor, {
    includeAdvancedBodies: opts.includeAdvancedBodies,
  });
  const out: HouseOverlayContact[] = [];

  for (const body of bodies) {
    const lon = longitudes[body];
    if (lon === undefined) continue;
    const { house, method } = resolveOverlayHouse(lon, recipient);
    if (house === null) continue;
    out.push({
      body,
      bodyOwner: donor.name,
      house,
      houseOwner: recipient.name,
      arena: houseArena(house, stage),
      method,
      statement: `${donor.name}'s ${body} falls in ${recipient.name}'s ${ordinal(house)} house`,
      approximationNote:
        method === 'whole-sign-fallback'
          ? 'Exact house cusps are not stored for this chart, so this house is counted whole-sign from the Ascendant and is approximate.'
          : undefined,
    });
  }
  return out;
}

/** Both directions, in one list. */
export function calculateHouseOverlaysAccurate(
  chart1: NatalChart,
  chart2: NatalChart,
  opts: OverlayOptions = {}
): HouseOverlayContact[] {
  return [...overlaysFor(chart1, chart2, opts), ...overlaysFor(chart2, chart1, opts)];
}

/**
 * House clusters: where one person's bodies pile up in the other's chart.
 * Only the 10 planets count toward a cluster — nodes and Chiron never create one.
 */
const CLUSTER_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

export interface OverlayCluster {
  house: number;
  houseOwner: string;
  bodyOwner: string;
  bodies: string[];
  arena: string;
  method: OverlayMethod;
}

export function overlayClusters(overlays: HouseOverlayContact[], min = 2): OverlayCluster[] {
  const groups = new Map<string, OverlayCluster>();
  for (const o of overlays) {
    if (!CLUSTER_BODIES.includes(o.body)) continue;
    const key = `${o.bodyOwner}|${o.houseOwner}|${o.house}`;
    const existing = groups.get(key);
    if (existing) existing.bodies.push(o.body);
    else
      groups.set(key, {
        house: o.house,
        houseOwner: o.houseOwner,
        bodyOwner: o.bodyOwner,
        bodies: [o.body],
        arena: o.arena,
        method: o.method,
      });
  }
  return [...groups.values()]
    .filter((c) => c.bodies.length >= min)
    .sort((a, b) => b.bodies.length - a.bodies.length);
}
