/**
 * familyAstrology.ts — deterministic astrological compute that makes the family
 * readings actually astrology-driven instead of generic parenting advice.
 *
 * All math here. No interpretation. No AI. Output is fed to the AI prompt as
 * structured facts the model is required to cite.
 *
 * Modules:
 *   - moonPhaseAtBirth       (Sun→Moon angular separation, 8 phases)
 *   - sectOfChart            (day/night based on Sun's house)
 *   - rulershipChain         (traditional rulers of ASC / 4th / 10th)
 *   - retrogradeFlags        (Mercury/Mars/Saturn/Venus retrograde)
 *   - currentProfectedHouse  (annual profection by age)
 *   - parentActivationMap    (parent's Chiron/Saturn → child's Sun/Moon/Mars)
 *   - crossChartTSquares     (cross-chart T-squares from a list of aspects)
 *   - householdComposite     (circular midpoint composite for the whole group)
 */

import { NatalChart, NatalPlanetPosition } from "@/hooks/useNatalChart";
import { getEffectiveOrb } from "./aspectOrbs";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const TRADITIONAL_RULER: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const ASPECTS = [
  { name: "conjunction", angle: 0, symbol: "☌" },
  { name: "opposition", angle: 180, symbol: "☍" },
  { name: "trine", angle: 120, symbol: "△" },
  { name: "square", angle: 90, symbol: "□" },
  { name: "sextile", angle: 60, symbol: "⚹" },
] as const;

type Planets = Record<string, NatalPlanetPosition | undefined>;

function abs(p?: NatalPlanetPosition): number | null {
  if (!p?.sign) return null;
  const idx = ZODIAC_SIGNS.indexOf(p.sign);
  if (idx < 0) return null;
  return idx * 30 + (p.degree ?? 0) + (p.minutes ?? 0) / 60;
}

function houseCalc(chart: NatalChart): ((a: number) => number | null) | null {
  const cusps = chart.houseCusps;
  if (!cusps) return null;
  const longs: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = cusps[`house${i}` as keyof typeof cusps] as
      | { sign?: string; degree?: number; minutes?: number }
      | undefined;
    if (!c?.sign) return null;
    const idx = ZODIAC_SIGNS.indexOf(c.sign);
    if (idx < 0) return null;
    longs.push(idx * 30 + (c.degree ?? 0) + (c.minutes ?? 0) / 60);
  }
  return (a: number) => {
    for (let i = 0; i < 12; i++) {
      const next = (i + 1) % 12;
      let s = longs[i];
      let e = longs[next];
      if (e < s) e += 360;
      let d = a;
      if (d < s) d += 360;
      if (d >= s && d < e) return i + 1;
    }
    return 1;
  };
}

// ─── Moon phase at birth ────────────────────────────────────────────────────

export type MoonPhaseLabel =
  | "New" | "Crescent" | "First Quarter" | "Gibbous"
  | "Full" | "Disseminating" | "Last Quarter" | "Balsamic";

export interface MoonPhaseAtBirth {
  label: MoonPhaseLabel;
  separationDeg: number;
  /** Plain-language regulation cue the AI MUST cite. */
  regulationCue: string;
}

const PHASE_CUES: Record<MoonPhaseLabel, string> = {
  New: "starts fresh impulses without yet seeing where they lead; needs space to begin without explaining why",
  Crescent: "pushes against early resistance; needs encouragement to keep going when something feels hard",
  "First Quarter": "moves through challenge by force; can become combative under pressure and needs structured outlets",
  Gibbous: "refines, perfects, and self-criticizes; needs reassurance that effort is enough before completion",
  Full: "is highly visible and externally expressive; needs witness without judgment and tends toward big emotions",
  Disseminating: "wants to share what they've learned; needs an audience that listens rather than corrects",
  "Last Quarter": "questions inherited rules and rebels against authority for its own sake; needs reasoning, not commands",
  Balsamic: "carries an old-soul withdrawal and needs solitude to recharge; reads as detached but is processing deeply",
};

export function moonPhaseAtBirth(chart: NatalChart): MoonPhaseAtBirth | null {
  const planets = chart.planets as Planets;
  const sun = abs(planets.Sun);
  const moon = abs(planets.Moon);
  if (sun == null || moon == null) return null;
  let sep = (moon - sun + 360) % 360;
  let label: MoonPhaseLabel;
  if (sep < 45) label = "New";
  else if (sep < 90) label = "Crescent";
  else if (sep < 135) label = "First Quarter";
  else if (sep < 180) label = "Gibbous";
  else if (sep < 225) label = "Full";
  else if (sep < 270) label = "Disseminating";
  else if (sep < 315) label = "Last Quarter";
  else label = "Balsamic";
  return { label, separationDeg: +sep.toFixed(1), regulationCue: PHASE_CUES[label] };
}

// ─── Sect ───────────────────────────────────────────────────────────────────

export interface SectInfo {
  sect: "day" | "night";
  sunHouse: number | null;
  /** Which luminary leads regulation in this child. */
  leadingLuminary: "Sun" | "Moon";
}

export function sectOfChart(chart: NatalChart): SectInfo | null {
  const calc = houseCalc(chart);
  const planets = chart.planets as Planets;
  const sunAbs = abs(planets.Sun);
  if (!calc || sunAbs == null) return null;
  const h = calc(sunAbs);
  if (!h) return null;
  // Houses 7-12 are above the horizon → day chart
  const sect = h >= 7 && h <= 12 ? "day" : "night";
  return { sect, sunHouse: h, leadingLuminary: sect === "day" ? "Sun" : "Moon" };
}

// ─── House rulers chain ─────────────────────────────────────────────────────

export interface RulerLink {
  house: number;
  cuspSign: string;
  ruler: string;
  rulerSign: string | null;
  rulerHouse: number | null;
  rulerRetrograde: boolean;
}

export function rulershipChain(chart: NatalChart, houses: number[] = [1, 4, 10]): RulerLink[] {
  const cusps = chart.houseCusps;
  if (!cusps) return [];
  const calc = houseCalc(chart);
  const planets = chart.planets as Planets;
  const out: RulerLink[] = [];
  for (const h of houses) {
    const cusp = cusps[`house${h}` as keyof typeof cusps] as
      | { sign?: string }
      | undefined;
    if (!cusp?.sign) continue;
    const ruler = TRADITIONAL_RULER[cusp.sign];
    if (!ruler) continue;
    const rp = planets[ruler];
    const rAbs = abs(rp);
    out.push({
      house: h,
      cuspSign: cusp.sign,
      ruler,
      rulerSign: rp?.sign ?? null,
      rulerHouse: rAbs != null && calc ? calc(rAbs) : null,
      rulerRetrograde: !!rp?.isRetrograde,
    });
  }
  return out;
}

// ─── Retrograde flags ───────────────────────────────────────────────────────

export interface RetrogradeFlags {
  mercuryRx: boolean;
  marsRx: boolean;
  saturnRx: boolean;
  venusRx: boolean;
  /** Plain-language flags the AI must cite when present. */
  notes: string[];
}

export function retrogradeFlags(chart: NatalChart): RetrogradeFlags {
  const p = chart.planets as Planets;
  const f: RetrogradeFlags = {
    mercuryRx: !!p.Mercury?.isRetrograde,
    marsRx: !!p.Mars?.isRetrograde,
    saturnRx: !!p.Saturn?.isRetrograde,
    venusRx: !!p.Venus?.isRetrograde,
    notes: [],
  };
  if (f.mercuryRx) f.notes.push("Mercury retrograde at birth: processes internally before speaking; corrections must allow lag time before response.");
  if (f.marsRx) f.notes.push("Mars retrograde at birth: anger turns inward instead of outward; will withdraw or self-attack rather than confront.");
  if (f.saturnRx) f.notes.push("Saturn retrograde at birth: internalized authority is harsher than external authority; self-criticism precedes any criticism from a parent.");
  if (f.venusRx) f.notes.push("Venus retrograde at birth: receives affection awkwardly and may push away the very connection they want.");
  return f;
}

// ─── Annual profection ──────────────────────────────────────────────────────

export interface ProfectionInfo {
  ageYears: number;
  profectedHouse: number;
  cuspSign: string | null;
  yearLordPlanet: string | null;
  yearLordSign: string | null;
  yearLordHouse: number | null;
  /** Why this matters for parenting THIS year. */
  themeNote: string;
}

const PROFECTION_THEMES: Record<number, string> = {
  1: "self, body, identity — focus on physical safety and how the child shows up",
  2: "money, food, possessions, basic security — comfort and predictability matter most",
  3: "siblings, peers, daily talking, school — communication and short-trip routines lead",
  4: "home, parents, emotional foundation — the household tone is the year's theme",
  5: "creativity, play, romance, self-expression — joy and being seen lead",
  6: "health, routines, work, service — body and daily structure are the focus",
  7: "partnerships, close one-on-one relationships, fairness — friendships dominate",
  8: "shared resources, fears, loss, deep change — emotional intensity surfaces",
  9: "travel, beliefs, education, big picture — meaning-seeking leads",
  10: "public role, authority, achievement, reputation — performance pressure peaks",
  11: "friends, groups, hopes, future — peer-group identity matters most",
  12: "solitude, hidden things, sleep, retreat — privacy and rest are essential",
};

export function currentProfectedHouse(chart: NatalChart, ageYears: number): ProfectionInfo | null {
  if (!isFinite(ageYears) || ageYears < 0) return null;
  const cusps = chart.houseCusps;
  if (!cusps) return null;
  const calc = houseCalc(chart);
  const planets = chart.planets as Planets;
  const profectedHouse = (ageYears % 12) + 1;
  const cusp = cusps[`house${profectedHouse}` as keyof typeof cusps] as { sign?: string } | undefined;
  const cuspSign = cusp?.sign ?? null;
  const ruler = cuspSign ? TRADITIONAL_RULER[cuspSign] : null;
  const rp = ruler ? planets[ruler] : undefined;
  const rAbs = abs(rp);
  return {
    ageYears,
    profectedHouse,
    cuspSign,
    yearLordPlanet: ruler ?? null,
    yearLordSign: rp?.sign ?? null,
    yearLordHouse: rAbs != null && calc ? calc(rAbs) : null,
    themeNote: PROFECTION_THEMES[profectedHouse] ?? "",
  };
}

// ─── Parent activation map ──────────────────────────────────────────────────

export interface ParentActivationHit {
  parentPlanet: string; // Chiron or Saturn (or 12th-house planet)
  parentSign?: string;
  childPlanet: string; // Sun / Moon / Mars
  childSign?: string;
  aspect: string;
  symbol: string;
  orb: number;
  /** What this hit tends to ACTIVATE in the parent (not the child). */
  parentTrigger: string;
}

const ACTIVATION_TRIGGERS: Record<string, string> = {
  "Chiron→Sun": "the parent's old fear of not being good enough gets touched whenever the child shines",
  "Chiron→Moon": "the parent's unhealed sensitivity gets touched whenever the child is upset",
  "Chiron→Mars": "the parent's old shame about anger or assertion gets touched whenever the child pushes back",
  "Saturn→Sun": "the parent's inner critic activates and tightens around the child's confidence",
  "Saturn→Moon": "the parent's emotional shutdown response activates whenever the child needs comfort",
  "Saturn→Mars": "the parent's controlling reflex activates whenever the child acts impulsively",
};

function bestAspectBetween(d1: number, d2: number, p1: string, p2: string) {
  let diff = Math.abs(d1 - d2);
  if (diff > 180) diff = 360 - diff;
  for (const a of ASPECTS) {
    const orb = Math.abs(diff - a.angle);
    const allowed = getEffectiveOrb(p1, p2, a.name);
    if (orb <= allowed) return { name: a.name, symbol: a.symbol, orb };
  }
  return null;
}

export function parentActivationMap(parent: NatalChart, child: NatalChart): ParentActivationHit[] {
  const pp = parent.planets as Planets;
  const cp = child.planets as Planets;
  const hits: ParentActivationHit[] = [];
  const parentTriggers = ["Chiron", "Saturn"];
  const childTargets = ["Sun", "Moon", "Mars"];
  for (const pPlanet of parentTriggers) {
    for (const cPlanet of childTargets) {
      const d1 = abs(pp[pPlanet]);
      const d2 = abs(cp[cPlanet]);
      if (d1 == null || d2 == null) continue;
      const asp = bestAspectBetween(d1, d2, pPlanet, cPlanet);
      if (!asp) continue;
      // Hard aspects only for activation map
      if (!["conjunction", "opposition", "square"].includes(asp.name)) continue;
      hits.push({
        parentPlanet: pPlanet,
        parentSign: pp[pPlanet]?.sign,
        childPlanet: cPlanet,
        childSign: cp[cPlanet]?.sign,
        aspect: asp.name,
        symbol: asp.symbol,
        orb: +asp.orb.toFixed(2),
        parentTrigger: ACTIVATION_TRIGGERS[`${pPlanet}→${cPlanet}`] ?? "",
      });
    }
  }
  return hits.sort((a, b) => a.orb - b.orb);
}

// ─── Cross-chart T-squares ─────────────────────────────────────────────────

export interface CrossChartTSquare {
  apex: { name: string; planet: string; sign?: string };
  endA: { name: string; planet: string; sign?: string };
  endB: { name: string; planet: string; sign?: string };
  orb: number; // average orb of the three legs
}

interface MemberLite {
  name: string;
  planets: Planets;
}

export function crossChartTSquares(members: { name: string; chart: NatalChart }[]): CrossChartTSquare[] {
  const tracked = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn", "Chiron"];
  const ml: MemberLite[] = members.map((m) => ({ name: m.name, planets: m.chart.planets as Planets }));
  // Build all cross-member planet positions
  type Pt = { name: string; planet: string; sign?: string; deg: number };
  const pts: Pt[] = [];
  for (const m of ml) {
    for (const pl of tracked) {
      const d = abs(m.planets[pl]);
      if (d == null) continue;
      pts.push({ name: m.name, planet: pl, sign: m.planets[pl]?.sign, deg: d });
    }
  }
  function asp(d1: number, d2: number, p1: string, p2: string, target: number) {
    let diff = Math.abs(d1 - d2);
    if (diff > 180) diff = 360 - diff;
    const orb = Math.abs(diff - target);
    const allowed = getEffectiveOrb(p1, p2, target === 90 ? "square" : "opposition");
    return orb <= allowed ? orb : null;
  }
  const tsquares: CrossChartTSquare[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      // require opposition
      if (pts[i].name === pts[j].name) continue; // must be cross-chart
      const oppOrb = asp(pts[i].deg, pts[j].deg, pts[i].planet, pts[j].planet, 180);
      if (oppOrb == null) continue;
      for (let k = 0; k < pts.length; k++) {
        if (k === i || k === j) continue;
        // apex must be a different person than at least one end (cross-chart pattern)
        const apex = pts[k];
        if (apex.name === pts[i].name && apex.name === pts[j].name) continue;
        const sqA = asp(apex.deg, pts[i].deg, apex.planet, pts[i].planet, 90);
        const sqB = asp(apex.deg, pts[j].deg, apex.planet, pts[j].planet, 90);
        if (sqA == null || sqB == null) continue;
        tsquares.push({
          apex: { name: apex.name, planet: apex.planet, sign: apex.sign },
          endA: { name: pts[i].name, planet: pts[i].planet, sign: pts[i].sign },
          endB: { name: pts[j].name, planet: pts[j].planet, sign: pts[j].sign },
          orb: +(((oppOrb + sqA + sqB) / 3)).toFixed(2),
        });
      }
    }
  }
  // dedupe roughly on apex+ends planet keys
  const seen = new Set<string>();
  const out: CrossChartTSquare[] = [];
  for (const t of tsquares.sort((a, b) => a.orb - b.orb)) {
    const k = [
      `${t.apex.name}-${t.apex.planet}`,
      ...[`${t.endA.name}-${t.endA.planet}`, `${t.endB.name}-${t.endB.planet}`].sort(),
    ].join("|");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= 4) break;
  }
  return out;
}

// ─── Household composite (circular midpoint chart) ─────────────────────────

export interface CompositeChart {
  Sun?: { sign: string; degree: number };
  Moon?: { sign: string; degree: number };
  Mercury?: { sign: string; degree: number };
  Venus?: { sign: string; degree: number };
  Mars?: { sign: string; degree: number };
  Jupiter?: { sign: string; degree: number };
  Saturn?: { sign: string; degree: number };
  Ascendant?: { sign: string; degree: number };
}

function circularMean(degs: number[]): number | null {
  if (!degs.length) return null;
  let x = 0, y = 0;
  for (const d of degs) {
    const r = (d * Math.PI) / 180;
    x += Math.cos(r);
    y += Math.sin(r);
  }
  if (x === 0 && y === 0) return null;
  let m = (Math.atan2(y, x) * 180) / Math.PI;
  if (m < 0) m += 360;
  return m;
}

function toSignDeg(absDeg: number): { sign: string; degree: number } {
  const idx = Math.floor(absDeg / 30) % 12;
  return { sign: ZODIAC_SIGNS[idx], degree: +(absDeg % 30).toFixed(1) };
}

export function householdComposite(members: { chart: NatalChart }[]): CompositeChart {
  const out: CompositeChart = {};
  const planets: (keyof CompositeChart)[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Ascendant"];
  for (const pl of planets) {
    const degs: number[] = [];
    for (const m of members) {
      const p = (m.chart.planets as Planets)[pl as string];
      const d = abs(p);
      if (d != null) degs.push(d);
    }
    const mean = circularMean(degs);
    if (mean != null) out[pl] = toSignDeg(mean);
  }
  return out;
}

// ─── Validator: forbidden symbolic phrases ─────────────────────────────────

const FORBIDDEN_SYMBOLIC = [
  /\bneeds? freedom\b/gi,
  /\bcraves? validation\b/gi,
  /\bvalues? harmony\b/gi,
  /\bseeks? adventure\b/gi,
  /\bwants? to be seen\b/gi,
  /\byearns? for\b/gi,
  /\bsoul[- ]chosen\b/gi,
  /\bdivine\b/gi,
  /\bsacred\b/gi,
];

export function stripForbiddenSymbolic(text: string): string {
  let out = text;
  for (const re of FORBIDDEN_SYMBOLIC) out = out.replace(re, "");
  // collapse double spaces from removals
  return out.replace(/\s{2,}/g, " ").replace(/ ,/g, ",").trim();
}

export function containsForbiddenSymbolic(text: string): boolean {
  return FORBIDDEN_SYMBOLIC.some((re) => re.test(text));
}
