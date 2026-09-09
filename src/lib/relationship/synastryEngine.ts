/**
 * CANONICAL synastry aspect engine.
 *
 * Every relationship surface (screen sections, scoring, radar, PDF) must read its
 * aspects from here so the same contact is reported with the same aspect name,
 * the same orb, the same owners and the same direction everywhere.
 *
 * Rules:
 *  - Orbs come from the shared tiered orb table (src/lib/aspectOrbs.ts). There is
 *    no single wide orb for every body.
 *  - Longitudes come from the shared sign/degree/minute conversion.
 *  - Direction is preserved: `from` always belongs to chart1, `to` to chart2, and
 *    the full cross-product is scanned, so "Ava's Moon square Max's Saturn" and
 *    "Ava's Saturn square Max's Moon" are two distinct contacts.
 *  - Minor bodies / points are opt-in and are never marked as core contacts.
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { getEffectiveOrb, MAJOR_ASPECTS, STANDARD_ASPECTS } from '@/lib/aspectOrbs';
import { signDegreesToLongitude } from '@/lib/houseCalculations';
import { analyzeSignVsDegree, ZODIAC_ORDER, type SignVsDegreeAnalysis } from '@/lib/aspects/outOfSign';


/** The bodies a core relationship reading is allowed to use. */
export const CORE_SYNASTRY_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Ascendant',
  'Midheaven',
  'NorthNode',
  'SouthNode',
  'Chiron',
] as const;
export type CoreSynastryBody = (typeof CORE_SYNASTRY_BODIES)[number];

/** Optional advanced layer only. These may never drive a main conclusion or score. */
export const ADVANCED_SYNASTRY_BODIES = [
  'Ceres',
  'Pallas',
  'Juno',
  'Vesta',
  'Lilith',
  'PartOfFortune',
  'Vertex',
  'Eris',
  'Eros',
  'Psyche',
  'Amor',
] as const;

export const PERSONAL_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'] as const;

/** Relevance weight per body — used for ranking and scoring, never for orbs. */
const BODY_WEIGHT: Record<string, number> = {
  Sun: 1,
  Moon: 1,
  Ascendant: 0.9,
  Mercury: 0.85,
  Venus: 0.85,
  Mars: 0.85,
  Midheaven: 0.6,
  Jupiter: 0.7,
  Saturn: 0.7,
  Uranus: 0.45,
  Neptune: 0.45,
  Pluto: 0.45,
  NorthNode: 0.5,
  SouthNode: 0.4,
  Chiron: 0.4,
};
const ADVANCED_WEIGHT = 0.15;

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 1,
  opposition: 0.85,
  trine: 0.85,
  square: 0.85,
  sextile: 0.6,
  quincunx: 0.3,
  semisextile: 0.25,
};

export type AspectTone = 'flowing' | 'tense' | 'fusion' | 'adjusting';

export interface CrossAspect {
  /** Body belonging to chart1. */
  fromBody: string;
  fromOwner: string;
  /** Body belonging to chart2. */
  toBody: string;
  toOwner: string;
  aspect: string;
  symbol: string;
  /** Exact aspect angle (0/60/90/120/180…). */
  aspectAngle: number;
  /** Actual angular separation between the two bodies. */
  separation: number;
  /** Distance from exact, in degrees (1 decimal). */
  orb: number;
  /** Orb allowance that admitted this contact. */
  maxOrb: number;
  /** 0–1, 1 = exact. */
  closeness: number;
  tone: AspectTone;
  /** Relevance for ranking: body weight × aspect weight × closeness. */
  weight: number;
  /** False for minor bodies / points outside the core set. */
  isCoreContact: boolean;
  /** Sign of the chart1 body, and its degree within that sign. */
  fromSign: string;
  fromDegreeInSign: number;
  /** Sign of the chart2 body, and its degree within that sign. */
  toSign: string;
  toDegreeInSign: number;
  /**
   * Dual-layer sign-vs-degree analysis. `isOutOfSign` is true when the
   * sign-to-sign relationship is NOT the aspect the degrees make.
   */
  signVsDegree: SignVsDegreeAnalysis;
  /** Shorthand for UI badges. */
  isOutOfSign: boolean;
  /** "Ava's Moon square Max's Saturn (2.3°)" */
  label: string;
}


export interface CrossAspectOptions {
  /** Include Ceres/Juno/Eros/Part of Fortune etc. Default false. */
  includeAdvancedBodies?: boolean;
  /** Include quincunx / semisextile. Default false. */
  includeMinorAspects?: boolean;
}

function toneFor(aspect: string): AspectTone {
  if (aspect === 'conjunction') return 'fusion';
  if (aspect === 'trine' || aspect === 'sextile') return 'flowing';
  if (aspect === 'square' || aspect === 'opposition') return 'tense';
  return 'adjusting';
}

function bodyWeight(body: string): number {
  return BODY_WEIGHT[body] ?? ADVANCED_WEIGHT;
}

/** Longitudes of every usable body in a chart, keyed by canonical body name. */
export function collectSynastryLongitudes(
  chart: NatalChart,
  opts: CrossAspectOptions = {}
): Record<string, number> {
  const out: Record<string, number> = {};
  const names: string[] = [
    ...CORE_SYNASTRY_BODIES,
    ...(opts.includeAdvancedBodies ? ADVANCED_SYNASTRY_BODIES : []),
  ];

  for (const name of names) {
    if (name === 'Ascendant') {
      // Ascendant source of truth: house 1 cusp, then the stored Ascendant body.
      const cusp = chart.houseCusps?.house1;
      const asc = cusp ?? chart.planets?.Ascendant;
      if (asc?.sign) out.Ascendant = signDegreesToLongitude(asc.sign, asc.degree, asc.minutes);
      continue;
    }
    if (name === 'Midheaven') {
      const mc = chart.houseCusps?.house10;
      if (mc?.sign) out.Midheaven = signDegreesToLongitude(mc.sign, mc.degree, mc.minutes);
      continue;
    }
    const pos = chart.planets?.[name as keyof typeof chart.planets];
    if (pos?.sign) out[name] = signDegreesToLongitude(pos.sign, pos.degree, pos.minutes);
  }

  // Derive the South Node opposite the North Node when it is not stored.
  if (out.NorthNode !== undefined && out.SouthNode === undefined) {
    out.SouthNode = (out.NorthNode + 180) % 360;
  }
  return out;
}
/** Longitude → sign name plus decimal degree inside that sign. */
export function signPosition(longitude: number): { sign: string; degree: number } {
  const norm = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(norm / 30) % 12;
  return { sign: ZODIAC_ORDER[idx], degree: norm - idx * 30 };
}


export function separationBetween(lonA: number, lonB: number): number {
  let diff = Math.abs(lonA - lonB) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * All cross-chart contacts, ranked by relevance (strongest first).
 * `from*` is always chart1, `to*` is always chart2.
 */
export function calculateCrossAspects(
  chart1: NatalChart,
  chart2: NatalChart,
  opts: CrossAspectOptions = {}
): CrossAspect[] {
  const lon1 = collectSynastryLongitudes(chart1, opts);
  const lon2 = collectSynastryLongitudes(chart2, opts);
  const aspectDefs = opts.includeMinorAspects ? STANDARD_ASPECTS : MAJOR_ASPECTS;
  const coreSet = new Set<string>(CORE_SYNASTRY_BODIES);

  const out: CrossAspect[] = [];

  for (const [bodyA, lA] of Object.entries(lon1)) {
    for (const [bodyB, lB] of Object.entries(lon2)) {
      const separation = separationBetween(lA, lB);
      for (const def of aspectDefs) {
        const maxOrb = getEffectiveOrb(bodyA, bodyB, def.name);
        const orb = Math.abs(separation - def.angle);
        if (orb > maxOrb) continue;
        const closeness = Math.max(0, 1 - orb / maxOrb);
        const weight =
          ((bodyWeight(bodyA) + bodyWeight(bodyB)) / 2) *
          (ASPECT_WEIGHT[def.name] ?? 0.5) *
          (0.45 + 0.55 * closeness);
        const rounded = Math.round(orb * 10) / 10;
        const posA = signPosition(lA);
        const posB = signPosition(lB);
        const signVsDegree = analyzeSignVsDegree({
          labelA: `${chart1.name}'s ${bodyA}`,
          signA: posA.sign,
          degreeA: posA.degree,
          labelB: `${chart2.name}'s ${bodyB}`,
          signB: posB.sign,
          degreeB: posB.degree,
          aspect: def.name,
          aspectAngle: def.angle,
          separation,
          orb,
        });
        out.push({
          fromBody: bodyA,
          fromOwner: chart1.name,
          toBody: bodyB,
          toOwner: chart2.name,
          aspect: def.name,
          symbol: def.symbol,
          aspectAngle: def.angle,
          separation: Math.round(separation * 100) / 100,
          orb: rounded,
          maxOrb,
          closeness: Math.round(closeness * 100) / 100,
          tone: toneFor(def.name),
          weight: Math.round(weight * 1000) / 1000,
          isCoreContact: coreSet.has(bodyA) && coreSet.has(bodyB),
          fromSign: posA.sign,
          fromDegreeInSign: posA.degree,
          toSign: posB.sign,
          toDegreeInSign: posB.degree,
          signVsDegree,
          isOutOfSign: signVsDegree.isOutOfSign,
          label: `${chart1.name}'s ${bodyA} ${def.name} ${chart2.name}'s ${bodyB} (${rounded.toFixed(1)}° orb${
            signVsDegree.isOutOfSign ? ', out of sign' : ''
          })`,
        });

        break; // one aspect per pair: the tightest definition wins
      }
    }
  }

  return out.sort((a, b) => b.weight - a.weight);
}

/** Core contacts only — what scores and main conclusions are allowed to use. */
export function coreAspects(aspects: CrossAspect[]): CrossAspect[] {
  return aspects.filter((a) => a.isCoreContact);
}

export function involves(a: CrossAspect, ...bodies: string[]): boolean {
  return bodies.includes(a.fromBody) || bodies.includes(a.toBody);
}

export function involvesBoth(a: CrossAspect, groupA: string[], groupB: string[]): boolean {
  return (
    (groupA.includes(a.fromBody) && groupB.includes(a.toBody)) ||
    (groupB.includes(a.fromBody) && groupA.includes(a.toBody))
  );
}

/** Human-readable, direction-explicit description. */
export function describeAspect(a: CrossAspect): string {
  const oos = a.isOutOfSign ? ', out of sign' : '';
  return `${a.fromOwner}'s ${a.fromBody} ${a.fromDegreeInSign !== undefined ? `${Math.floor(a.fromDegreeInSign)}° ${a.fromSign} ` : ''}${a.aspect} ${a.toOwner}'s ${a.toBody}${
    a.toSign ? ` ${Math.floor(a.toDegreeInSign)}° ${a.toSign}` : ''
  } (${a.orb.toFixed(1)}° orb${oos})`;
}


/**
 * Nodal-axis geometry check: North/South Node contacts to the *same* body are
 * automatic mirrors of each other and are not independent evidence.
 */
export function isAutomaticNodalMirror(a: CrossAspect): boolean {
  const nodes = ['NorthNode', 'SouthNode'];
  return nodes.includes(a.fromBody) && nodes.includes(a.toBody);
}

/** Top N core contacts, with automatic nodal mirrors dropped. */
export function rankTopContacts(aspects: CrossAspect[], limit = 5): CrossAspect[] {
  return coreAspects(aspects)
    .filter((a) => !isAutomaticNodalMirror(a))
    .slice(0, limit);
}
