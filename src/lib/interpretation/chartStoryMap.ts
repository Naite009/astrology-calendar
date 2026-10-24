/**
 * CHART STORY MAP (deterministic, no AI).
 *
 * Builds connected evidence chains for a natal chart, so a reading can follow
 * one thread from an anchor (Rising, Midheaven, Sun, Moon) through its ruler
 * to that ruler's sign, house, condition and tightest real aspects. Every item
 * has a stable id that the written reading must cite. Nothing here is prose
 * interpretation; it is checked chart fact plus short plain glosses.
 */
import type { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { computeRankedAspects, type RankedAspect } from '@/lib/aspectRanking';
import { getHouseForLongitude, signDegreesToLongitude } from '@/lib/houseCalculations';
import { getEssentialDignity, isDignityAssigned } from '@/lib/essentialDignity';
import { computeMajorTransits, type MajorTransit } from '@/lib/transits/majorTransits';
import { getChartRulers, TRADITIONAL_RULER } from './chartRuler';
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
  aspect?: { a: string; b: string; type: string; orb: number; outOfSign: boolean };
}

export type StoryAnchor = 'Ascendant' | 'Midheaven' | 'Sun' | 'Moon' | 'Concentration';

export interface StoryChain {
  id: string;
  anchor: StoryAnchor;
  label: string;
  /** Evidence ids, in reading order. */
  steps: string[];
  bodies: string[];
}

export interface StoryTension {
  id: string;
  between: [string, string]; // chain ids
  fact: string;
  evidenceIds: string[];
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

export interface ChartStoryMap {
  version: 1;
  subject: { name: string; birthDate: string };
  evidence: Record<string, StoryEvidence>;
  chains: StoryChain[];
  tensions: StoryTension[];
  transits: StoryTransit[];
  /** Every real aspect the reading may name (non-wide, majors + tight quincunx). */
  allowedAspects: StoryEvidence['aspect'][];
}

const MAJOR = new Set(['conjunction', 'opposition', 'square', 'trine', 'sextile']);
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
const SECONDARY = new Set(['NorthNode', 'SouthNode', 'Chiron']);
const DISPLAY: Record<string, string> = { MC: 'Midheaven', NorthNode: 'North Node', SouthNode: 'South Node' };
export const displayBody = (b: string) => DISPLAY[b] ?? b;
const canon = (b: string) => (b === 'MC' ? 'Midheaven' : b);

function fmtDeg(degree: number, minutes = 0): string {
  let d = Math.floor(degree);
  let m = Math.round(minutes + (degree - d) * 60);
  if (m >= 60) { d += 1; m -= 60; }
  return `${d}°${String(m).padStart(2, '0')}′`;
}

interface Pos { body: string; sign: string; degree: number; minutes: number; lon: number; house: number | null; retro: boolean }

function positions(chart: NatalChart): Record<string, Pos> {
  const out: Record<string, Pos> = {};
  for (const body of [...PLANETS, 'NorthNode', 'Chiron']) {
    const p = (chart.planets as Record<string, NatalPlanetPosition | undefined>)[body];
    if (!p?.sign) continue;
    const lon = signDegreesToLongitude(p.sign, p.degree, p.minutes);
    out[body] = { body, sign: p.sign, degree: p.degree, minutes: p.minutes ?? 0, lon, house: getHouseForLongitude(lon, chart), retro: !!p.isRetrograde };
  }
  return out;
}

function aspectIdOf(a: RankedAspect): string {
  const [x, y] = [canon(a.a), canon(a.b)].sort();
  return `aspect:${x}-${a.aspect}-${y}`;
}

/** Real aspects only: majors within the allowed (non-wide) orb, plus quincunx under 3°. Lilith excluded. */
export function usableAspects(chart: NatalChart): RankedAspect[] {
  return computeRankedAspects(chart).filter((a) =>
    a.a !== 'Lilith' && a.b !== 'Lilith' && !(a.a === 'NorthNode' && a.b === 'SouthNode') && !(a.a === 'SouthNode' && a.b === 'NorthNode') &&
    ((MAJOR.has(a.aspect) && !a.isWide) || (a.aspect === 'quincunx' && a.orb < 3)),
  );
}

export function buildChartStoryMap(chart: NatalChart, opts: { now?: Date; transitDays?: number } = {}): ChartStoryMap {
  const evidence: Record<string, StoryEvidence> = {};
  const add = (e: StoryEvidence) => { evidence[e.id] = e; return e.id; };
  const pos = positions(chart);
  const aspects = usableAspects(chart);

  const placementId = (body: string): string | null => {
    const p = pos[body];
    if (!p) return null;
    const dig = isDignityAssigned(body) ? getEssentialDignity(body, p.sign) : 'NotAssigned';
    const digText = dig === 'Domicile' || dig === 'Exaltation' || dig === 'Detriment' || dig === 'Fall' ? `, traditional ${dig.toLowerCase()}` : '';
    return add({
      id: `placement:${body}`,
      kind: 'placement',
      fact: `${displayBody(body)} ${fmtDeg(p.degree, p.minutes)} ${p.sign}${p.house ? ` in the ${ordinalHouse(p.house)}` : ''}${p.retro ? ', retrograde' : ''}${digText}`,
      bodies: [body],
    });
  };

  const aspectEvidence = (a: RankedAspect): string => add({
    id: aspectIdOf(a),
    kind: 'aspect',
    fact: `${displayBody(a.a)} ${a.aspect} ${displayBody(a.b)} (${a.orb.toFixed(1)}° orb${a.dissociate ? ', out of sign: the degrees connect even though the signs do not' : ''})`,
    bodies: [canon(a.a), canon(a.b)],
    aspect: { a: canon(a.a), b: canon(a.b), type: a.aspect, orb: Math.round(a.orb * 10) / 10, outOfSign: a.dissociate },
  });

  const aspectsOf = (body: string, limit: number, exclude: string[] = []) =>
    aspects
      .filter((a) => (canon(a.a) === body || canon(a.b) === body) && !exclude.includes(canon(a.a) === body ? canon(a.b) : canon(a.a)))
      .sort((x, y) => x.orb - y.orb)
      .slice(0, limit);

  const occupants = (house: number) => PLANETS.filter((b) => pos[b]?.house === house);

  const chains: StoryChain[] = [];
  const pushChain = (c: StoryChain) => { if (c.steps.length) chains.push(c); };

  // ── Ascendant chain ──
  const ascCusp = chart.houseCusps?.house1;
  if (ascCusp?.sign) {
    const steps: string[] = [];
    const bodies = new Set<string>(['Ascendant']);
    steps.push(add({ id: 'angle:Ascendant', kind: 'angle', fact: `Ascendant (Rising) ${fmtDeg(ascCusp.degree, ascCusp.minutes)} ${ascCusp.sign}`, bodies: ['Ascendant'] }));
    for (const b of occupants(1)) { const id = placementId(b); if (id) { steps.push(id); bodies.add(b); } }
    for (const a of aspectsOf('Ascendant', 3)) { steps.push(aspectEvidence(a)); bodies.add(canon(a.a)); bodies.add(canon(a.b)); }
    const r = getChartRulers(ascCusp.sign);
    if (r && pos[r.traditional]) {
      steps.push(add({ id: 'rulership:chart-ruler', kind: 'rulership', fact: `${ascCusp.sign} rising makes ${r.traditional} the chart ruler (traditional rulership)${r.modern ? `, with ${r.modern} as modern co-ruler` : ''}`, bodies: [r.traditional] }));
      const pid = placementId(r.traditional); if (pid) steps.push(pid);
      bodies.add(r.traditional);
      for (const a of aspectsOf(r.traditional, 3, ['Ascendant'])) { steps.push(aspectEvidence(a)); bodies.add(canon(a.a)); bodies.add(canon(a.b)); }
      if (r.modern && pos[r.modern]) { const mid = placementId(r.modern); if (mid) { steps.push(mid); bodies.add(r.modern); } }
    }
    pushChain({ id: 'chain:rising', anchor: 'Ascendant', label: `${ascCusp.sign} Rising and its ruler`, steps: [...new Set(steps)], bodies: [...bodies] });
  }

  // ── Midheaven chain ──
  const mc = chart.houseCusps?.house10;
  if (mc?.sign) {
    const steps: string[] = [];
    const bodies = new Set<string>(['Midheaven']);
    steps.push(add({ id: 'angle:Midheaven', kind: 'angle', fact: `Midheaven (MC, the public and vocational direction) ${fmtDeg(mc.degree, mc.minutes)} ${mc.sign}`, bodies: ['Midheaven'] }));
    for (const b of occupants(10)) { const id = placementId(b); if (id) { steps.push(id); bodies.add(b); } }
    for (const a of aspectsOf('Midheaven', 4)) { steps.push(aspectEvidence(a)); bodies.add(canon(a.a)); bodies.add(canon(a.b)); }
    const ruler = TRADITIONAL_RULER[mc.sign];
    if (ruler && pos[ruler]) {
      steps.push(add({ id: 'rulership:mc-ruler', kind: 'rulership', fact: `${mc.sign} on the Midheaven makes ${ruler} the Midheaven ruler`, bodies: [ruler] }));
      const pid = placementId(ruler); if (pid) steps.push(pid);
      bodies.add(ruler);
      for (const a of aspectsOf(ruler, 2, ['Midheaven'])) { steps.push(aspectEvidence(a)); bodies.add(canon(a.a)); bodies.add(canon(a.b)); }
    }
    pushChain({ id: 'chain:midheaven', anchor: 'Midheaven', label: `${mc.sign} Midheaven and its ruler`, steps: [...new Set(steps)], bodies: [...bodies] });
  }

  // ── Sun and Moon chains ──
  for (const body of ['Sun', 'Moon'] as const) {
    if (!pos[body]) continue;
    const steps: string[] = [];
    const bodies = new Set<string>([body]);
    const pid = placementId(body); if (pid) steps.push(pid);
    for (const a of aspectsOf(body, 4)) { steps.push(aspectEvidence(a)); bodies.add(canon(a.a)); bodies.add(canon(a.b)); }
    const disp = TRADITIONAL_RULER[pos[body].sign];
    if (disp && disp !== body && pos[disp]) {
      steps.push(add({ id: `rulership:${body}-dispositor`, kind: 'rulership', fact: `${body} in ${pos[body].sign} is ruled by ${disp}`, bodies: [disp] }));
      const did = placementId(disp); if (did) steps.push(did);
      bodies.add(disp);
    }
    pushChain({ id: `chain:${body.toLowerCase()}`, anchor: body, label: `${body} in ${pos[body].sign}`, steps: [...new Set(steps)], bodies: [...bodies] });
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
    pushChain({ id: `chain:house-${house}`, anchor: 'Concentration', label: `${ordinalHouse(house)} house concentration`, steps, bodies: list });
  }
  for (const [sign, list] of bySign) {
    if (list.length < 3) continue;
    const steps = [add({ id: `concentration:sign-${sign}`, kind: 'concentration', fact: `${list.length} major planets in ${sign} (${list.join(', ')})`, bodies: list })];
    for (const b of list) { const id = placementId(b); if (id) steps.push(id); }
    pushChain({ id: `chain:sign-${sign}`, anchor: 'Concentration', label: `${sign} concentration`, steps, bodies: list });
  }

  // ── Element / modality balance (10 majors) ──
  const elem: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const mod: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const b of PLANETS) { const p = pos[b]; if (!p) continue; elem[SIGN_ELEMENT[p.sign]]++; mod[SIGN_MODALITY[p.sign]]++; }
  add({ id: 'balance:elements', kind: 'balance', fact: `Elements across the 10 major planets: Fire ${elem.Fire}, Earth ${elem.Earth}, Air ${elem.Air}, Water ${elem.Water}`, bodies: [] });
  add({ id: 'balance:modalities', kind: 'balance', fact: `Modalities across the 10 major planets: Cardinal ${mod.Cardinal}, Fixed ${mod.Fixed}, Mutable ${mod.Mutable}`, bodies: [] });

  // ── Tensions between anchors ──
  const tensions: StoryTension[] = [];
  const anchorSign = (c: StoryChain): string | null => {
    if (c.anchor === 'Ascendant') return ascCusp?.sign ?? null;
    if (c.anchor === 'Midheaven') return mc?.sign ?? null;
    if (c.anchor === 'Sun' || c.anchor === 'Moon') return pos[c.anchor]?.sign ?? null;
    return null;
  };
  const anchors = chains.filter((c) => c.anchor !== 'Concentration');
  const CLASH: Record<string, string[]> = { Fire: ['Water', 'Earth'], Earth: ['Air', 'Fire'], Air: ['Earth', 'Water'], Water: ['Fire', 'Air'] };
  for (let i = 0; i < anchors.length; i++) {
    for (let j = i + 1; j < anchors.length; j++) {
      const A = anchors[i], B = anchors[j];
      const sa = anchorSign(A), sb = anchorSign(B);
      if (!sa || !sb) continue;
      const parts: string[] = [];
      if (CLASH[SIGN_ELEMENT[sa]]?.includes(SIGN_ELEMENT[sb])) parts.push(`${SIGN_ELEMENT[sa]} (${sa}) against ${SIGN_ELEMENT[sb]} (${sb})`);
      const ma = SIGN_MODALITY[sa], mb = SIGN_MODALITY[sb];
      if (ma !== mb && (ma === 'Mutable' || mb === 'Mutable') && (ma === 'Fixed' || mb === 'Fixed')) parts.push(`${ma} ${sa} wants ${ma === 'Mutable' ? 'variety and adjustment' : 'continuity'}, ${mb} ${sb} wants ${mb === 'Mutable' ? 'variety and adjustment' : 'continuity'}`);
      // Hard aspect directly between the two anchors' key bodies.
      const keyA = A.anchor === 'Concentration' ? null : A.anchor;
      const keyB = B.anchor === 'Concentration' ? null : B.anchor;
      const hard = aspects.find((a) => ['square', 'opposition'].includes(a.aspect) && ((canon(a.a) === keyA && canon(a.b) === keyB) || (canon(a.a) === keyB && canon(a.b) === keyA)));
      const evidenceIds = [A.steps[0], B.steps[0]];
      if (hard) { parts.push(`${displayBody(canon(hard.a))} ${hard.aspect} ${displayBody(canon(hard.b))} (${hard.orb.toFixed(1)}°)`); evidenceIds.push(aspectEvidence(hard)); }
      if (!parts.length) continue;
      tensions.push({ id: `tension:${A.id.slice(6)}-${B.id.slice(6)}`, between: [A.id, B.id], fact: `${A.label} vs ${B.label}: ${parts.join('; ')}`, evidenceIds });
    }
  }
  // Hard aspects between the chart ruler / Sun / Moon and Saturn or outer planets.
  const ruler = ascCusp?.sign ? getChartRulers(ascCusp.sign)?.traditional : undefined;
  for (const core of [...new Set(['Sun', 'Moon', ruler].filter(Boolean) as string[])]) {
    for (const a of aspectsOf(core, 6)) {
      if (!['square', 'opposition'].includes(a.aspect)) continue;
      const other = canon(a.a) === core ? canon(a.b) : canon(a.a);
      if (!['Saturn', 'Uranus', 'Neptune', 'Pluto', 'Mars'].includes(other)) continue;
      const id = aspectEvidence(a);
      if (tensions.some((t) => t.evidenceIds.includes(id))) continue;
      const chainA = chains.find((c) => c.bodies.includes(core));
      const chainB = chains.find((c) => c !== chainA && c.bodies.includes(other)) ?? chainA;
      if (!chainA || !chainB) continue;
      tensions.push({ id: `tension:${id.slice(7)}`, between: [chainA.id, chainB.id], fact: `${displayBody(core)} ${a.aspect} ${displayBody(other)} (${a.orb.toFixed(1)}°): two needs pulling against each other`, evidenceIds: [id] });
    }
  }

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

  const allowedAspects = Object.values(evidence).filter((e) => e.aspect).map((e) => e.aspect!);
  // Also allow any other real aspect so the writer can mention it accurately.
  for (const a of aspects) {
    const id = aspectIdOf(a);
    if (!evidence[id]) allowedAspects.push({ a: canon(a.a), b: canon(a.b), type: a.aspect, orb: Math.round(a.orb * 10) / 10, outOfSign: a.dissociate });
  }

  return {
    version: 1,
    subject: { name: chart.name, birthDate: chart.birthDate },
    evidence,
    chains: chains.filter((c) => !c.bodies.every((b) => SECONDARY.has(b))),
    tensions: tensions.slice(0, 6),
    transits,
    allowedAspects,
  };
}

/** Stable short hash of the chart data the map depends on, for caching. */
export function storyMapChartHash(chart: NatalChart): string {
  const src = JSON.stringify([chart.birthDate, chart.birthTime, chart.planets, chart.houseCusps?.house1, chart.houseCusps?.house10]);
  let h = 5381;
  for (let i = 0; i < src.length; i++) h = ((h << 5) + h + src.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
