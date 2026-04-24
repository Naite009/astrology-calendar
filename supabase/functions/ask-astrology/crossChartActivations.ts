// ============================================================================
// CROSS-CHART ACTIVATIONS — DETERMINISTIC PRECOMPUTER
// ============================================================================
// Purpose: Eliminate Call C aspect/orb fabrication and Asc/Desc confusion in
// relationship overlay readings.
//
// The model used to "discover" cross-chart aspects in prose, which produced
// constant errors:
//   • inventing aspects that don't exist
//   • stating wrong orbs
//   • calling the natal Descendant the natal Ascendant (or vice-versa)
//   • interchanging SR positions with natal positions
//
// This module computes the activation list ONCE in code from the actual chart
// data, and Call C interprets ONLY that pre-verified list. The model cannot
// fabricate aspects because it has no degree-comparison job to do.
//
// Orb policy (mirrors src/lib/aspectOrbs.ts — project standard, restated here
// because edge functions cannot import from src/):
//   Two standard planets: conj 8°, opp 7°, sq 7°, tri 7°, sext 5°
//   With a luminary (Sun/Moon): +2° to majors  (conj 10°, opp/sq/tri 9°, sext 7°)
//   With an angle (Asc/Desc/MC/IC): +1° to majors  (conj 9°, opp/sq/tri 8°, sext 6°)
//   Two points (Chiron, Node, etc.): −2° from base, floor 1°
// ============================================================================

import { ParsedPosition } from "./typesShared.ts";

// Inlined zodiac order (cannot import from src/)
const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

// Aspect tier mirrors aspectOrbs.ts. Lowercased keys.
type Tier = "luminary" | "angle" | "personal" | "social" | "outer" | "point";

const PLANET_TIERS: Record<string, Tier> = {
  sun: "luminary",
  moon: "luminary",
  ascendant: "angle",
  descendant: "angle",
  midheaven: "angle",
  mc: "angle",
  ic: "angle",
  mercury: "personal",
  venus: "personal",
  mars: "personal",
  jupiter: "social",
  saturn: "social",
  uranus: "outer",
  neptune: "outer",
  pluto: "outer",
  northnode: "point",
  "north node": "point",
  southnode: "point",
  "south node": "point",
  chiron: "point",
};

const TIER_RANK: Record<Tier, number> = {
  luminary: 5, angle: 4, personal: 3, social: 3, outer: 2, point: 1,
};

const ASPECTS: Array<{ name: string; angle: number; baseOrb: number }> = [
  { name: "conjunction", angle: 0,   baseOrb: 8 },
  { name: "opposition",  angle: 180, baseOrb: 7 },
  { name: "trine",       angle: 120, baseOrb: 7 },
  { name: "square",      angle: 90,  baseOrb: 7 },
  { name: "sextile",     angle: 60,  baseOrb: 5 },
];

const tierOf = (name: string): Tier =>
  PLANET_TIERS[name.trim().toLowerCase()] ?? "personal";

const effectiveOrb = (a: string, b: string, baseOrb: number): number => {
  const ta = tierOf(a);
  const tb = tierOf(b);
  const higher = TIER_RANK[ta] >= TIER_RANK[tb] ? ta : tb;
  if (higher === "luminary") return baseOrb + 2;
  if (higher === "angle")    return baseOrb + 1;
  if (higher === "point" && TIER_RANK[ta] <= 1 && TIER_RANK[tb] <= 1) {
    return Math.max(baseOrb - 2, 1);
  }
  return baseOrb;
};

const absDeg = (sign: string, degree: number, minutes: number): number => {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  if (idx < 0) return NaN;
  return idx * 30 + degree + (minutes || 0) / 60;
};

const angularSeparation = (a: number, b: number): number => {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
};

// Format degree as "12°51'"
const fmtDeg = (deg: number, min: number): string =>
  `${deg}°${String(min).padStart(2, "0")}'`;

// What we accept: parsed planet rows (same shape as parsePositionsFromContext)
// + four angle entries derived from house cusps in index.ts.
export interface ChartPoint {
  /** Canonical name as used in prose (e.g. "Venus", "Ascendant", "North Node") */
  name: string;
  sign: string;
  degree: number;
  minutes: number;
  /** House the planet falls in (planets only; angles get null) */
  house?: number | null;
  retrograde?: boolean;
}

export interface VerifiedActivation {
  /** "SR Venus", "SR Saturn", etc. */
  srPoint: string;
  /** "natal Ascendant", "natal Mercury", etc. */
  natalPoint: string;
  /** "conjunction" | "opposition" | "square" | "trine" | "sextile" */
  aspect: string;
  /** Orb in degrees, rounded to 1 decimal */
  orb: number;
  /** Allowed orb for this pair (for diagnostics / accuracy review) */
  allowedOrb: number;
  /** Is the SR point applying (moving toward exact)? null if unknown */
  applying: null;
  /** Human-readable position summaries — used by Call C and the reviewer */
  srPosition: string;   // e.g. "12°51' Aries"
  natalPosition: string; // e.g. "14°17' Aries (House 1)"
}

const NATAL_TARGETS_ORDER = [
  "Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto",
  "Chiron","North Node",
  "Ascendant","Descendant","Midheaven","IC",
];
const SR_SOURCES_ORDER = [
  "Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto",
  "Chiron","North Node",
];

/**
 * Build the four angle ChartPoints from a list of house cusps.
 * Asc=H1, IC=H4, Desc=H7, MC=H10.
 */
export const anglesFromCusps = (
  cusps: Array<{ house: number; sign: string; degree: number; minutes: number }>,
): ChartPoint[] => {
  const byHouse = new Map<number, { sign: string; degree: number; minutes: number }>();
  for (const c of cusps) byHouse.set(c.house, c);
  const out: ChartPoint[] = [];
  const map: Array<[number, string]> = [
    [1,  "Ascendant"],
    [4,  "IC"],
    [7,  "Descendant"],
    [10, "Midheaven"],
  ];
  for (const [h, name] of map) {
    const c = byHouse.get(h);
    if (!c) continue;
    out.push({ name, sign: c.sign, degree: c.degree, minutes: c.minutes ?? 0, house: null });
  }
  return out;
};

/**
 * Adapt the existing ParsedPosition shape to ChartPoint.
 * Filters to the canonical set we want to allow as targets/sources.
 */
export const planetsFromParsed = (
  positions: ParsedPosition[],
  allowList: string[],
): ChartPoint[] => {
  const lookup = new Map(positions.map((p) => [p.planet.trim().toLowerCase(), p]));
  const out: ChartPoint[] = [];
  for (const want of allowList) {
    const p = lookup.get(want.toLowerCase());
    if (!p) continue;
    out.push({
      name: want,
      sign: p.sign,
      degree: p.degree,
      minutes: p.minutes,
      house: p.house ?? null,
      retrograde: !!p.retrograde,
    });
  }
  return out;
};

export interface ComputeArgs {
  natalPositions: ParsedPosition[];
  srPositions: ParsedPosition[];
  natalCusps: Array<{ house: number; sign: string; degree: number; minutes: number }>;
}

/**
 * Compute every verified SR-to-natal activation, sorted by tightness ascending.
 * Returns at most 30 entries to keep the prompt lean (relationship readings
 * usually surface 6-15 hits; 30 is a hard ceiling).
 */
export const computeCrossChartActivations = (args: ComputeArgs): VerifiedActivation[] => {
  const { natalPositions, srPositions, natalCusps } = args;

  // Build the natal target set: 12 planets/points + 4 angles.
  const natalPlanets = planetsFromParsed(natalPositions, [
    "Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto",
    "Chiron","North Node",
  ]);
  const natalAngles = anglesFromCusps(natalCusps);
  const natalTargets: ChartPoint[] = [...natalPlanets, ...natalAngles];

  // SR sources: 12 planets/points (no SR angles — those describe THIS year's
  // life arena, not natal-touching activations).
  const srSources = planetsFromParsed(srPositions, SR_SOURCES_ORDER);

  if (srSources.length === 0 || natalTargets.length === 0) return [];

  const hits: VerifiedActivation[] = [];

  for (const sr of srSources) {
    const srAbs = absDeg(sr.sign, sr.degree, sr.minutes);
    if (Number.isNaN(srAbs)) continue;
    for (const nt of natalTargets) {
      const ntAbs = absDeg(nt.sign, nt.degree, nt.minutes);
      if (Number.isNaN(ntAbs)) continue;
      const sep = angularSeparation(srAbs, ntAbs);
      let best: VerifiedActivation | null = null;
      for (const asp of ASPECTS) {
        const allowed = effectiveOrb(sr.name, nt.name, asp.baseOrb);
        const orb = Math.abs(sep - asp.angle);
        if (orb <= allowed) {
          if (!best || orb < best.orb) {
            best = {
              srPoint: `SR ${sr.name}`,
              natalPoint: `natal ${nt.name}`,
              aspect: asp.name,
              orb: Math.round(orb * 10) / 10,
              allowedOrb: allowed,
              applying: null,
              srPosition: fmtDeg(sr.degree, sr.minutes) + " " + sr.sign,
              natalPosition: nt.house != null
                ? `${fmtDeg(nt.degree, nt.minutes)} ${nt.sign}`
                : `${fmtDeg(nt.degree, nt.minutes)} ${nt.sign}`,
            };
          }
        }
      }
      if (best) hits.push(best);
    }
  }

  // Sort: tightest orb first, then by stable canonical order
  hits.sort((a, b) => {
    if (a.orb !== b.orb) return a.orb - b.orb;
    const aSr = SR_SOURCES_ORDER.indexOf(a.srPoint.replace(/^SR\s+/, ""));
    const bSr = SR_SOURCES_ORDER.indexOf(b.srPoint.replace(/^SR\s+/, ""));
    if (aSr !== bSr) return aSr - bSr;
    const aNt = NATAL_TARGETS_ORDER.indexOf(a.natalPoint.replace(/^natal\s+/, ""));
    const bNt = NATAL_TARGETS_ORDER.indexOf(b.natalPoint.replace(/^natal\s+/, ""));
    return aNt - bNt;
  });

  return hits.slice(0, 30);
};

/**
 * Render the activations as a fenced block to inject into Call C's user message.
 * Format is plain text, deterministic, easy for the model to read.
 */
export const renderActivationsBlock = (acts: VerifiedActivation[]): string => {
  if (acts.length === 0) {
    return `=========================================================
VERIFIED CROSS-CHART ACTIVATIONS — GROUND TRUTH (0 found)
=========================================================
No SR planet falls within standard aspect orb of any natal planet or angle this year. Write the overlay section honestly: state that there is "no significant cross-chart activation this year" and refocus on the strongest natal-driven theme already covered in the natal sections. Do not invent activations.`;
  }
  const lines = acts.map((a, i) => {
    return `  ${i + 1}. ${a.srPoint} ${a.aspect} ${a.natalPoint} (orb ${a.orb}°) — ${a.srPoint} at ${a.srPosition}; ${a.natalPoint} at ${a.natalPosition}`;
  }).join("\n");
  return `=========================================================
VERIFIED CROSS-CHART ACTIVATIONS — GROUND TRUTH (${acts.length} found)
=========================================================
${lines}

These ${acts.length} activation(s) are the COMPLETE and EXCLUSIVE set of cross-chart aspects that exist this year between the SR chart and the natal chart at standard orbs. They were calculated deterministically from the chart data, not inferred.`;
  };

/**
 * Build the rule block that goes alongside the activations in Call C.
 * Strict: no inventing, no stating orbs, no referencing points not in the list.
 */
export const buildActivationRulesBlock = (count: number): string => {
  return `=========================================================
RULES FOR USING THE VERIFIED ACTIVATIONS
=========================================================

You are writing INTERPRETATIONS of the ${count} verified activation(s) above. Follow these rules without exception:

1. Do NOT identify any new aspects. The list above is complete. If an aspect is not in the list, it does not exist for this reading. Do not write "SR X conjunct natal Y" unless that exact pair appears in the list.

2. Do NOT state orbs in your prose. The orbs are pre-verified and shown to the reader by the renderer. Writing "(2° orb)" is forbidden.

3. Do NOT reference any natal point that is not in the list. If natal Mars is not in any activation, do not write "this also touches natal Mars." Stay inside the verified set.

4. When you cite a position (sign, degree, house) for an SR or natal point, the value MUST come from the activation entry above (srPosition / natalPosition). Do not pull from memory or from another section.

5. Distinguish Ascendant from Descendant strictly. The list labels each angle by name. If the list says "natal Descendant," write "Descendant" — never "Ascendant." Same for MC vs IC.

6. If the list contains zero activations, write the section as: "No significant cross-chart activation this year" plus a single sentence redirecting the reader to the strongest natal theme. Do not invent activations to fill space.

7. The summary_box ("Relationship Strategy Summary") may reference the verified activations the same way — never invent new ones for the summary.`;
};
