/**
 * CHART STORY MAP (deterministic, no AI).
 *
 * Whole-chart evidence graph for the Natal Portrait reading. It contains every
 * major planet, all four angles, all twelve house rulers, full traditional
 * dispositor chains, concentrations, element/modality balance and every real
 * aspect (with derived Descendant/IC contacts). Chains are ranked by salience
 * so the writer reads the strongest threads first, but nothing is hidden: a
 * planet that is not an anchor (Mercury, Saturn, Mars...) still has its own
 * chain. Tensions marked `mustAddress` are salient contradictions the reading
 * is required to deal with. Nothing here is prose interpretation.
 */
import type { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { computeRankedAspects, type RankedAspect } from '@/lib/aspectRanking';
import { houseForLongitude, toAbsoluteLongitude } from '@/lib/houseForLongitude';
import { getEssentialDignity, isDignityAssigned } from '@/lib/essentialDignity';
import { computeMajorTransits, type MajorTransit } from '@/lib/transits/majorTransits';
import { getChartRulers, TRADITIONAL_RULER, MODERN_CORULER } from './chartRuler';
import { ordinalHouse } from './ordinals';
import { SIGN_ELEMENT, SIGN_MODALITY } from '@/lib/aspects/outOfSign';

export type StoryEvidenceKind = 'angle' | 'placement' | 'rulership' | 'aspect' | 'concentration' | 'balance';

export interface StoryEvidence {
  id: string;
  kind: StoryEvidenceKind;
  /** Exact fact, e.g. "Saturn 4°12′ Aquarius in the 9th house". */
  fact: string;
  bodies: string[];
  /** Only for aspects. */
  aspect?: AllowedAspect;
}

export interface AllowedAspect { a: string; b: string; type: string; orb: number; outOfSign: boolean; derived?: boolean }

export type StoryAnchor = 'Ascendant' | 'Midheaven' | 'Sun' | 'Moon' | 'Concentration' | 'Planet';

export interface StoryChain {
  id: string;
  anchor: StoryAnchor;
  label: string;
  /** Evidence ids, in reading order. */
  steps: string[];
  bodies: string[];
  /** Higher = more central to this chart. */
  salience: number;
}

export interface StoryTension {
  id: string;
  between: [string, string]; // chain ids
  fact: string;
  evidenceIds: string[];
  salience: number;
  /** Salient contradiction the reading must address (validator enforces). */
  mustAddress: boolean;
}

export interface StoryTransit {
  id: string;
  headline: string;
  fact: string;
  status: string;
  nextExact: string | null;
  windowStart: string;
  windowEnd: string;
  isActiveNow: boolean;
  target: string;
  chainIds: string[];
  meaning: string;
}

export interface StoryPlacement { sign: string; longitude: number; house: number | null; retrograde: boolean }

export interface ChartStoryMap {
  version: 2;
  subject: { name: string; birthDate: string };
  evidence: Record<string, StoryEvidence>;
  chains: StoryChain[];
  tensions: StoryTension[];
  transits: StoryTransit[];
  /** Every real aspect the reading may name (majors within allowed orb, quincunx under 3°, derived DSC/IC). */
  allowedAspects: AllowedAspect[];
  /** Exact placement facts for validating sign/degree/house claims (planets and angles). */
  placements: Record<string, StoryPlacement>;
  /** House number -> traditional ruler (and modern co-ruler where one exists). */
  houseRulers: Record<number, { traditional: string; modern?: string }>;
}

const MAJOR = new Set(['conjunction', 'opposition', 'square', 'trine', 'sextile']);
export const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
const PERSONAL = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']);
const SECONDARY = new Set(['NorthNode', 'SouthNode', 'Chiron']);
const DISPLAY: Record<string, string> = { MC: 'Midheaven', NorthNode: 'North Node', SouthNode: 'South Node' };
export const displayBody = (b: string) => DISPLAY[b] ?? b;
const canon = (b: string) => (b === 'MC' ? 'Midheaven' : b);
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function fmtLon(lon: number): { sign: string; text: string } {
  const n = ((lon % 360) + 360) % 360;
  let si = Math.floor(n / 30);
  let d = Math.floor(n - si * 30);
  let m = Math.round((n - si * 30 - d) * 60);
  if (m >= 60) { d += 1; m -= 60; }
  if (d >= 30) { d -= 30; si = (si + 1) % 12; }
  return { sign: SIGNS[si], text: `${d}°${String(m).padStart(2, '0')}′` };
}

interface Pos { body: string; sign: string; lon: number; house: number | null; retro: boolean; cuspDistance: number | null; nextHouse: number | null }

function cuspLongitudes(chart: NatalChart): number[] | null {
  const out: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const l = toAbsoluteLongitude((chart.houseCusps as Record<string, NatalPlanetPosition | undefined> | undefined)?.[`house${i}`]);
    if (l == null) return null;
    out.push(l);
  }
  return out;
}

function positions(chart: NatalChart): Record<string, Pos> {
  const out: Record<string, Pos> = {};
  const cusps = cuspLongitudes(chart);
  for (const body of [...PLANETS, 'NorthNode', 'Chiron']) {
    const p = (chart.planets as Record<string, NatalPlanetPosition | undefined>)[body];
    if (!p?.sign) continue;
    const lon = toAbsoluteLongitude(p)!;
    const house = houseForLongitude(chart, lon);
    let cuspDistance: number | null = null, nextHouse: number | null = null;
    if (cusps && house) {
      // Distance to the nearest cusp (its own or the next) for near-cusp warnings.
      const own = cusps[house - 1], next = cusps[house % 12];
      const dOwn = ((lon - own) % 360 + 360) % 360;
      const dNext = ((next - lon) % 360 + 360) % 360;
      if (dNext < dOwn) { cuspDistance = dNext; nextHouse = (house % 12) + 1; } else { cuspDistance = dOwn; nextHouse = house === 1 ? 12 : house - 1; }
    }
    out[body] = { body, sign: p.sign, lon, house, retro: !!p.isRetrograde, cuspDistance, nextHouse };
  }
  return out;
}

function aspectIdOf(a: { a: string; b: string; type: string }): string {
  const [x, y] = [canon(a.a), canon(a.b)].sort();
  return `aspect:${x}-${a.type}-${y}`;
}

/** Real aspects only: majors within the allowed (non-wide) orb, plus quincunx under 3°. Lilith excluded. */
export function usableAspects(chart: NatalChart): RankedAspect[] {
  return computeRankedAspects(chart).filter((a) =>
    a.a !== 'Lilith' && a.b !== 'Lilith' && !(a.a === 'NorthNode' && a.b === 'SouthNode') && !(a.a === 'SouthNode' && a.b === 'NorthNode') &&
    // Ascendant–MC geometry is a property of the house system, not an aspect.
    !([a.a, a.b].includes('Ascendant') && [a.a, a.b].includes('MC')) &&
    ((MAJOR.has(a.aspect) && !a.isWide) || (a.aspect === 'quincunx' && a.orb < 3)),
  );
}

/** A contact to the Ascendant/Midheaven implies the matching contact to the opposite angle. */
const MIRROR: Record<string, string> = { conjunction: 'opposition', opposition: 'conjunction', square: 'square', trine: 'sextile', sextile: 'trine' };

export function buildChartStoryMap(chart: NatalChart, opts: { now?: Date; transitDays?: number } = {}): ChartStoryMap {
  const evidence: Record<string, StoryEvidence> = {};
  const add = (e: StoryEvidence) => { evidence[e.id] = e; return e.id; };
  const pos = positions(chart);
  const aspects = usableAspects(chart);
  const ascCusp = chart.houseCusps?.house1;
  const mc = chart.houseCusps?.house10;
  const ascLon = toAbsoluteLongitude(ascCusp);
  const mcLon = toAbsoluteLongitude(mc);
  const chartRuler = ascCusp?.sign ? getChartRulers(ascCusp.sign) : null;

  // ── Allowed aspects, including derived Descendant / IC contacts ──
  const allowedAspects: AllowedAspect[] = [];
  const allowedById = new Map<string, AllowedAspect>();
  for (const a of aspects) {
    const x: AllowedAspect = { a: canon(a.a), b: canon(a.b), type: a.aspect, orb: Math.round(a.orb * 100) / 100, outOfSign: a.dissociate };
    allowedAspects.push(x); allowedById.set(aspectIdOf(x), x);
    for (const [angle, mirror] of [['Ascendant', 'Descendant'], ['Midheaven', 'IC']] as const) {
      if ((x.a === angle || x.b === angle) && MIRROR[x.type]) {
        const other = x.a === angle ? x.b : x.a;
        if (other === 'Ascendant' || other === 'Midheaven') continue;
        const d: AllowedAspect = { a: other, b: mirror, type: MIRROR[x.type], orb: x.orb, outOfSign: false, derived: true };
        allowedAspects.push(d); allowedById.set(aspectIdOf(d), d);
      }
    }
  }

  const placementId = (body: string): string | null => {
    const p = pos[body];
    if (!p) return null;
    const dig = isDignityAssigned(body) ? getEssentialDignity(body, p.sign) : 'NotAssigned';
    const digText = dig === 'Domicile' || dig === 'Exaltation' || dig === 'Detriment' || dig === 'Fall' ? `, traditional ${dig.toLowerCase()}` : '';
    const cusp = p.cuspDistance != null && p.cuspDistance < 1 && p.nextHouse
      ? `; within ${p.cuspDistance.toFixed(1)}° of the ${ordinalHouse(p.nextHouse)} cusp, so the house is birth-time sensitive`
      : '';
    return add({
      id: `placement:${body}`,
      kind: 'placement',
      fact: `${displayBody(body)} ${fmtLon(p.lon).text} ${p.sign}${p.house ? ` in the ${ordinalHouse(p.house)}` : ''}${p.retro ? ', retrograde' : ''}${digText}${cusp}`,
      bodies: [body],
    });
  };

  const aspectEvidence = (x: AllowedAspect): string => add({
    id: aspectIdOf(x),
    kind: 'aspect',
    fact: `${displayBody(x.a)} ${x.type} ${displayBody(x.b)} (${x.orb.toFixed(1)}° orb${x.outOfSign ? ', out of sign: the degrees connect even though the signs do not' : ''}${x.derived ? `, same contact seen from the opposite angle` : ''})`,
    bodies: [x.a, x.b],
    aspect: x,
  });

  const aspectsOf = (body: string, limit: number, exclude: string[] = []) =>
    allowedAspects
      .filter((a) => (a.a === body || a.b === body) && !exclude.includes(a.a === body ? a.b : a.a))
      .sort((x, y) => x.orb - y.orb)
      .slice(0, limit);

  const occupants = (house: number) => PLANETS.filter((b) => pos[b]?.house === house);

  // ── House rulers (all 12) with full dispositor chains ──
  const houseRulers: Record<number, { traditional: string; modern?: string }> = {};
  const housesRuledBy: Record<string, number[]> = {};
  for (let h = 1; h <= 12; h++) {
    const cusp = (chart.houseCusps as Record<string, NatalPlanetPosition | undefined> | undefined)?.[`house${h}`];
    if (!cusp?.sign || !TRADITIONAL_RULER[cusp.sign]) continue;
    const trad = TRADITIONAL_RULER[cusp.sign];
    houseRulers[h] = { traditional: trad, ...(MODERN_CORULER[cusp.sign] ? { modern: MODERN_CORULER[cusp.sign] } : {}) };
    (housesRuledBy[trad] ??= []).push(h);
    const p = pos[trad];
    add({
      id: `rulership:house-${h}`,
      kind: 'rulership',
      fact: `${ordinalHouse(h)} cusp ${fmtLon(toAbsoluteLongitude(cusp)!).text} ${cusp.sign}, ruled by ${trad}${p ? ` (${fmtLon(p.lon).text} ${p.sign}${p.house ? `, ${ordinalHouse(p.house)}` : ''})` : ''}${houseRulers[h].modern ? `; modern co-ruler ${houseRulers[h].modern}` : ''}`,
      bodies: [trad],
    });
  }
  const dispositorChainId = (body: string): string | null => {
    const p = pos[body]; if (!p) return null;
    const steps: string[] = [body];
    const seen = new Set([body]);
    let cur = body, end = 'unavailable';
    for (let i = 0; i < 12; i++) {
      const next = TRADITIONAL_RULER[pos[cur]?.sign ?? ''];
      if (!next || !pos[next]) break;
      if (next === cur) { end = `ends at ${cur}, which rules its own sign (final dispositor)`; break; }
      if (seen.has(next)) { end = `loops back to ${next} (mutual dispositors, no single final ruler)`; steps.push(next); break; }
      steps.push(next); seen.add(next); cur = next;
    }
    if (steps.length < 2 && end === 'unavailable') return null;
    const chainText = steps.map((b) => `${b}${pos[b] ? ` in ${pos[b].sign}${pos[b].house ? ` (${ordinalHouse(pos[b].house!)})` : ''}` : ''}`).join(' → ');
    return add({ id: `rulership:dispositors-${body}`, kind: 'rulership', fact: `Dispositor chain: ${chainText}; ${end}`, bodies: steps });
  };

  const chains: StoryChain[] = [];
  const pushChain = (c: StoryChain) => { if (c.steps.length) chains.push({ ...c, steps: [...new Set(c.steps)], bodies: [...new Set(c.bodies)] }); };
  const addAspects = (steps: string[], bodies: string[], list: AllowedAspect[]) => { for (const a of list) { steps.push(aspectEvidence(a)); bodies.push(a.a, a.b); } };

  // ── Angles ──
  if (ascCusp?.sign && ascLon != null) {
    const steps: string[] = []; const bodies: string[] = ['Ascendant'];
    steps.push(add({ id: 'angle:Ascendant', kind: 'angle', fact: `Ascendant (Rising) ${fmtLon(ascLon).text} ${ascCusp.sign}`, bodies: ['Ascendant'] }));
    add({ id: 'angle:Descendant', kind: 'angle', fact: `Descendant (7th cusp, partnership angle) ${fmtLon(ascLon + 180).text} ${fmtLon(ascLon + 180).sign}`, bodies: ['Descendant'] });
    for (const b of occupants(1)) { const id = placementId(b); if (id) { steps.push(id); bodies.push(b); } }
    addAspects(steps, bodies, aspectsOf('Ascendant', 3));
    if (chartRuler && pos[chartRuler.traditional]) {
      steps.push(add({ id: 'rulership:chart-ruler', kind: 'rulership', fact: `${ascCusp.sign} rising makes ${chartRuler.traditional} the chart ruler (traditional rulership)${chartRuler.modern ? `, with ${chartRuler.modern} as modern co-ruler` : ''}`, bodies: [chartRuler.traditional] }));
      const pid = placementId(chartRuler.traditional); if (pid) steps.push(pid);
      bodies.push(chartRuler.traditional);
      addAspects(steps, bodies, aspectsOf(chartRuler.traditional, 3, ['Ascendant']));
      const dc = dispositorChainId(chartRuler.traditional); if (dc) steps.push(dc);
      if (chartRuler.modern && pos[chartRuler.modern]) { const mid = placementId(chartRuler.modern); if (mid) { steps.push(mid); bodies.push(chartRuler.modern); } }
    }
    pushChain({ id: 'chain:rising', anchor: 'Ascendant', label: `${ascCusp.sign} Rising and its ruler`, steps, bodies, salience: 10 });
    // Partnership angle: occupants of the 7th, DSC contacts, 7th ruler.
    const dSteps: string[] = ['angle:Descendant']; const dBodies: string[] = ['Descendant'];
    for (const b of occupants(7)) { const id = placementId(b); if (id) { dSteps.push(id); dBodies.push(b); } }
    addAspects(dSteps, dBodies, aspectsOf('Descendant', 3));
    if (houseRulers[7]) { dSteps.push('rulership:house-7'); const pid = placementId(houseRulers[7].traditional); if (pid) dSteps.push(pid); dBodies.push(houseRulers[7].traditional); }
    pushChain({ id: 'chain:descendant', anchor: 'Ascendant', label: `${fmtLon(ascLon + 180).sign} Descendant and the 7th-house ruler`, steps: dSteps, bodies: dBodies, salience: 5 + occupants(7).length * 2 });
  }
  if (mc?.sign && mcLon != null) {
    const steps: string[] = []; const bodies: string[] = ['Midheaven'];
    steps.push(add({ id: 'angle:Midheaven', kind: 'angle', fact: `Midheaven (MC, the public and vocational direction) ${fmtLon(mcLon).text} ${mc.sign}`, bodies: ['Midheaven'] }));
    add({ id: 'angle:IC', kind: 'angle', fact: `IC (4th cusp, home and private base) ${fmtLon(mcLon + 180).text} ${fmtLon(mcLon + 180).sign}`, bodies: ['IC'] });
    for (const b of occupants(10)) { const id = placementId(b); if (id) { steps.push(id); bodies.push(b); } }
    addAspects(steps, bodies, aspectsOf('Midheaven', 4));
    const ruler = TRADITIONAL_RULER[mc.sign];
    if (ruler && pos[ruler]) {
      steps.push(add({ id: 'rulership:mc-ruler', kind: 'rulership', fact: `${mc.sign} on the Midheaven makes ${ruler} the Midheaven ruler`, bodies: [ruler] }));
      const pid = placementId(ruler); if (pid) steps.push(pid);
      bodies.push(ruler);
      addAspects(steps, bodies, aspectsOf(ruler, 2, ['Midheaven']));
    }
    pushChain({ id: 'chain:midheaven', anchor: 'Midheaven', label: `${mc.sign} Midheaven and its ruler`, steps, bodies, salience: 8 });
  }

  // ── Planet chains: every one of the 10 majors (Sun/Moon keep their legacy ids) ──
  const tightCount = (body: string) => allowedAspects.filter((a) => !a.derived && (a.a === body || a.b === body) && a.orb < 2).length;
  for (const body of PLANETS) {
    const p = pos[body]; if (!p) continue;
    const steps: string[] = []; const bodies: string[] = [body];
    const pid = placementId(body); if (pid) steps.push(pid);
    const disp = TRADITIONAL_RULER[p.sign];
    if (disp && disp !== body && pos[disp]) {
      steps.push(add({ id: `rulership:${body}-dispositor`, kind: 'rulership', fact: `${body} in ${p.sign} is ruled by ${disp}`, bodies: [disp] }));
      const did = placementId(disp); if (did) steps.push(did);
      bodies.push(disp);
    }
    const ruled = housesRuledBy[body] ?? [];
    if (ruled.length) steps.push(add({ id: `rulership:${body}-rules`, kind: 'rulership', fact: `${body} rules the ${ruled.map((h) => ordinalHouse(h)).join(' and the ')} (traditional rulership of those cusps)`, bodies: [body] }));
    const dc = dispositorChainId(body); if (dc) steps.push(dc);
    addAspects(steps, bodies, aspectsOf(body, PERSONAL.has(body) ? 5 : 3));
    let salience = 1 + tightCount(body) * 2 + ruled.length;
    if (body === 'Sun' || body === 'Moon') salience += 6;
    if (chartRuler?.traditional === body) salience += 6;
    if (p.house && [1, 4, 7, 10].includes(p.house)) salience += 3;
    if (PERSONAL.has(body)) salience += 1;
    const dig = isDignityAssigned(body) ? getEssentialDignity(body, p.sign) : 'NotAssigned';
    if (dig !== 'NotAssigned' && dig !== 'Peregrine' && String(dig) !== 'None') salience += 1;
    const id = body === 'Sun' || body === 'Moon' ? `chain:${body.toLowerCase()}` : `chain:planet-${body}`;
    const label = `${body} in ${p.sign}${p.house ? ` in the ${ordinalHouse(p.house)}` : ''}`;
    pushChain({ id, anchor: body === 'Sun' || body === 'Moon' ? body : 'Planet', label, steps, bodies, salience });
  }

  // ── Concentrations (3+ major planets in one house or sign) ──
  const byHouse = new Map<number, string[]>();
  const bySign = new Map<string, string[]>();
  for (const b of PLANETS) {
    const p = pos[b]; if (!p) continue;
    if (p.house) byHouse.set(p.house, [...(byHouse.get(p.house) ?? []), b]);
    bySign.set(p.sign, [...(bySign.get(p.sign) ?? []), b]);
  }
  for (const [house, list] of byHouse) {
    if (list.length < 3) continue;
    const steps = [add({ id: `concentration:house-${house}`, kind: 'concentration', fact: `${list.length} major planets in the ${ordinalHouse(house)} (${list.join(', ')}); the app counts 3+ major planets as a house concentration`, bodies: list })];
    for (const b of list) { const id = placementId(b); if (id) steps.push(id); }
    if (houseRulers[house]) steps.push(`rulership:house-${house}`);
    pushChain({ id: `chain:house-${house}`, anchor: 'Concentration', label: `${ordinalHouse(house)} concentration`, steps, bodies: list, salience: 6 + list.length });
  }
  for (const [sign, list] of bySign) {
    if (list.length < 3) continue;
    const steps = [add({ id: `concentration:sign-${sign}`, kind: 'concentration', fact: `${list.length} major planets in ${sign} (${list.join(', ')})`, bodies: list })];
    for (const b of list) { const id = placementId(b); if (id) steps.push(id); }
    pushChain({ id: `chain:sign-${sign}`, anchor: 'Concentration', label: `${sign} concentration`, steps, bodies: list, salience: 6 + list.length });
  }
  // Big Three repetition (same sign / element / modality across Sun, Moon, Rising).
  if (ascCusp?.sign && pos.Sun && pos.Moon) {
    const three = [pos.Sun.sign, pos.Moon.sign, ascCusp.sign];
    const sameSign = new Set(three).size === 1;
    const sameEl = new Set(three.map((s) => SIGN_ELEMENT[s])).size === 1;
    const sameMod = new Set(three.map((s) => SIGN_MODALITY[s])).size === 1;
    if (sameSign || sameEl || sameMod) {
      const parts = [sameSign && `all three in ${three[0]}`, sameEl && `all ${SIGN_ELEMENT[three[0]]}`, sameMod && `all ${SIGN_MODALITY[three[0]]}`].filter(Boolean).join(', ');
      const id = add({ id: 'concentration:big-three', kind: 'concentration', fact: `Sun ${pos.Sun.sign}, Moon ${pos.Moon.sign}, Rising ${ascCusp.sign}: ${parts}. This is Big Three emphasis, separate from the ten-planet counts`, bodies: ['Sun', 'Moon', 'Ascendant'] });
      pushChain({ id: 'chain:big-three', anchor: 'Concentration', label: 'Big Three repetition', steps: [id, 'placement:Sun', 'placement:Moon', 'angle:Ascendant'].filter((x) => evidence[x]), bodies: ['Sun', 'Moon', 'Ascendant'], salience: sameSign ? 12 : 7 });
    }
  }

  // ── Element / modality balance (10 majors) ──
  const elem: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const mod: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const b of PLANETS) { const p = pos[b]; if (!p) continue; elem[SIGN_ELEMENT[p.sign]]++; mod[SIGN_MODALITY[p.sign]]++; }
  add({ id: 'balance:elements', kind: 'balance', fact: `Elements across the 10 major planets: Fire ${elem.Fire}, Earth ${elem.Earth}, Air ${elem.Air}, Water ${elem.Water}`, bodies: [] });
  add({ id: 'balance:modalities', kind: 'balance', fact: `Modalities across the 10 major planets: Cardinal ${mod.Cardinal}, Fixed ${mod.Fixed}, Mutable ${mod.Mutable}`, bodies: [] });

  // ── Tensions ──
  const tensions: StoryTension[] = [];
  const chainFor = (body: string) => chains.find((c) => c.id === (body === 'Sun' || body === 'Moon' ? `chain:${body.toLowerCase()}` : `chain:planet-${body}`))
    ?? (body === 'Ascendant' || body === 'Descendant' ? chains.find((c) => c.id === 'chain:rising') : undefined)
    ?? (body === 'Midheaven' || body === 'IC' ? chains.find((c) => c.id === 'chain:midheaven') : undefined);
  // Element/modality clashes between the Big Three and MC.
  const anchorList: [string, string | undefined][] = [['chain:rising', ascCusp?.sign], ['chain:sun', pos.Sun?.sign], ['chain:moon', pos.Moon?.sign], ['chain:midheaven', mc?.sign]];
  const CLASH: Record<string, string[]> = { Fire: ['Water', 'Earth'], Earth: ['Air', 'Fire'], Air: ['Earth', 'Water'], Water: ['Fire', 'Air'] };
  for (let i = 0; i < anchorList.length; i++) for (let j = i + 1; j < anchorList.length; j++) {
    const [ia, sa] = anchorList[i], [ib, sb] = anchorList[j];
    const A = chains.find((c) => c.id === ia), B = chains.find((c) => c.id === ib);
    if (!A || !B || !sa || !sb) continue;
    const parts: string[] = [];
    if (CLASH[SIGN_ELEMENT[sa]]?.includes(SIGN_ELEMENT[sb])) parts.push(`${SIGN_ELEMENT[sa]} (${sa}) against ${SIGN_ELEMENT[sb]} (${sb})`);
    const ma = SIGN_MODALITY[sa], mb = SIGN_MODALITY[sb];
    if (ma !== mb && (ma === 'Mutable' || mb === 'Mutable') && (ma === 'Fixed' || mb === 'Fixed')) parts.push(`${ma} ${sa} wants ${ma === 'Mutable' ? 'variety and adjustment' : 'continuity'}, ${mb} ${sb} wants ${mb === 'Mutable' ? 'variety and adjustment' : 'continuity'}`);
    if (!parts.length) continue;
    tensions.push({ id: `tension:${A.id.slice(6)}-${B.id.slice(6)}`, between: [A.id, B.id], fact: `${A.label} vs ${B.label}: ${parts.join('; ')}`, evidenceIds: [A.steps[0], B.steps[0]], salience: 3, mustAddress: false });
  }
  // Hard aspects (square / opposition / tight quincunx) involving personal planets, the chart ruler or angles.
  const coreBodies = new Set<string>([...PERSONAL, 'Ascendant', 'Midheaven', ...(chartRuler ? [chartRuler.traditional] : [])]);
  for (const a of allowedAspects) {
    if (a.derived) continue;
    if (!['square', 'opposition', 'quincunx'].includes(a.type)) continue;
    if (!coreBodies.has(a.a) && !coreBodies.has(a.b)) continue;
    const A = chainFor(a.a), B = chainFor(a.b);
    if (!A || !B) continue;
    const id = aspectEvidence(a);
    let salience = (A.salience + B.salience) / 2 + (3 - Math.min(a.orb, 3)) * 2 + (a.type === 'quincunx' ? -2 : 0);
    if ((a.a === 'Sun' || a.a === 'Moon') && (a.b === 'Sun' || a.b === 'Moon')) salience += 3;
    tensions.push({ id: `tension:${id.slice(7)}`, between: [A.id, B.id], fact: `${displayBody(a.a)} ${a.type} ${displayBody(a.b)} (${a.orb.toFixed(1)}° orb): ${displayBody(a.a)} and ${displayBody(a.b)} want different things and have to be negotiated`, evidenceIds: [A.steps[0], B.steps[0], id], salience, mustAddress: false });
  }
  tensions.sort((x, y) => y.salience - x.salience);
  // The strongest contradictions (aspect-based, orb under 3°) must be addressed.
  tensions.filter((t) => t.evidenceIds.some((e) => e.startsWith('aspect:') && (evidence[e]?.aspect?.orb ?? 99) < 3)).slice(0, 2).forEach((t) => { t.mustAddress = true; });

  // ── Current major transits linked to chains ──
  const now = opts.now ?? new Date();
  const horizon = opts.transitDays ?? 180;
  let raw: MajorTransit[] = [];
  try { raw = computeMajorTransits(chart, { now, horizonDays: horizon }); } catch { raw = []; }
  const transits: StoryTransit[] = raw
    .filter((t) => t.isActiveNow || (t.nextExact && t.nextExact.getTime() - now.getTime() < horizon * 86400000))
    .map((t) => {
      const target = t.target === 'MC' ? 'Midheaven' : t.target;
      return {
        id: `transit:${t.transitPlanet}-${t.aspect}-${target}`,
        headline: `${t.transitPlanet} ${t.aspect} natal ${displayBody(target)}`,
        fact: `Transiting ${t.transitPlanet} at ${t.transitPosition} ${t.aspect} natal ${displayBody(target)} at ${t.targetPosition} (${t.currentOrb.toFixed(1)}° now, ${t.status.toLowerCase()}, ${t.motion.toLowerCase()})`,
        status: t.status,
        nextExact: t.nextExact ? t.nextExact.toISOString().slice(0, 10) : null,
        windowStart: t.windowStart.toISOString().slice(0, 10),
        windowEnd: t.windowEnd.toISOString().slice(0, 10),
        isActiveNow: t.isActiveNow,
        target,
        chainIds: chains.filter((c) => c.bodies.includes(target)).map((c) => c.id),
        meaning: t.meaning,
      };
    })
    .filter((t) => t.chainIds.length > 0)
    .slice(0, 8);

  const placements: Record<string, StoryPlacement> = {};
  for (const [b, p] of Object.entries(pos)) placements[b] = { sign: p.sign, longitude: p.lon, house: p.house, retrograde: p.retro };
  if (ascLon != null) { placements.Ascendant = { sign: fmtLon(ascLon).sign, longitude: ascLon, house: 1, retrograde: false }; placements.Descendant = { sign: fmtLon(ascLon + 180).sign, longitude: (ascLon + 180) % 360, house: 7, retrograde: false }; }
  if (mcLon != null) { placements.Midheaven = { sign: fmtLon(mcLon).sign, longitude: mcLon, house: 10, retrograde: false }; placements.IC = { sign: fmtLon(mcLon + 180).sign, longitude: (mcLon + 180) % 360, house: 4, retrograde: false }; }

  const kept = chains.filter((c) => !c.bodies.every((b) => SECONDARY.has(b)));
  // Anchors first in fixed order, then everything else by salience.
  const ORDER = ['chain:rising', 'chain:midheaven', 'chain:sun', 'chain:moon'];
  kept.sort((x, y) => {
    const ix = ORDER.indexOf(x.id), iy = ORDER.indexOf(y.id);
    if (ix >= 0 || iy >= 0) return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    return y.salience - x.salience;
  });

  return {
    version: 2,
    subject: { name: chart.name, birthDate: chart.birthDate },
    evidence,
    chains: kept,
    tensions: tensions.slice(0, 8),
    transits,
    allowedAspects,
    placements,
    houseRulers,
  };
}

/** Kept for callers that only need an aspect id. */
export const storyAspectId = aspectIdOf;

/** Stable short hash of the chart data the map depends on, for caching. */
export function storyMapChartHash(chart: NatalChart): string {
  const src = JSON.stringify([2, chart.birthDate, chart.birthTime, chart.planets, chart.houseCusps]);
  let h = 5381;
  for (let i = 0; i < src.length; i++) h = ((h << 5) + h + src.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

