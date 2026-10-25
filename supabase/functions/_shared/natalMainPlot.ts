/** Deterministic structural story selection. These are evidence paths, not personality labels or probabilities. */
export interface PlotSource {
  evidence: Record<string, { id: string; kind?: string; bodies: string[]; fact?: string; aspect?: { a: string; b: string; type: string; orb: number; derived?: boolean } }>;
  placements?: Record<string, { sign: string; longitude: number; house: number | null }>;
  houseRulers?: Record<number, { traditional: string; modern?: string }>;
  chains: { id: string; steps: string[]; bodies: string[] }[];
  tensions: { id: string; fact: string; evidenceIds: string[]; mustAddress?: boolean }[];
}
export interface StructuralPriority {
  body: string;
  tier: 'primary' | 'secondary' | 'background';
  weight: number;
  reasons: string[];
  evidenceIds: string[];
}
export interface PlotTheme {
  id: string;
  structure: string;
  indicatorBodies: string[];
  indicatorCount: number;
  strength: 'meaningful' | 'main-story';
  weight: number;
  evidenceIds: string[];
  requiredEvidenceIds: string[];
  chainIds: string[];
  rulerPathIds: string[];
  contradictions: { id: string; fact: string; evidenceIds: string[] }[];
}
export interface NatalMainPlot {
  version: 1;
  hierarchy: StructuralPriority[];
  candidates: PlotTheme[];
  selectedThemeIds: string[];
  primaryThemeId: string | null;
  chartRuler: { body: string; evidenceIds: string[]; chainId: string | null } | null;
  baselineEvidenceIds: string[];
}
const MAJORS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const PERSONAL = new Set(MAJORS.slice(0, 5));
const ANGLES = new Set(['Ascendant', 'Midheaven', 'Descendant', 'IC']);
const primaryId = (b: string) => `${ANGLES.has(b) ? 'angle' : 'placement'}:${b}`;
const unique = (ids: string[]) => [...new Set(ids)];

export function buildNatalMainPlot(source: PlotSource): NatalMainPlot {
  const { evidence, placements = {}, houseRulers = {} } = source;
  const exists = (ids: string[]) => unique(ids).filter(id => Boolean(evidence[id]));
  const ruler = houseRulers[1]?.traditional;
  const aspects = Object.values(evidence).filter(e => e.aspect && !e.aspect.derived);
  const occupants = (h: number) => MAJORS.filter(b => placements[b]?.house === h);
  const hierarchy: StructuralPriority[] = [...MAJORS, ...ANGLES].filter(b => placements[b]).map(body => {
    let weight = 0;
    const reasons: string[] = [], ids: string[] = [primaryId(body)];
    const reward = (n: number, reason: string, es: string[]) => { weight += n; reasons.push(reason); ids.push(...es); };
    if (body === ruler) reward(10, 'Traditional Ascendant ruler directs the chart', ['rulership:chart-ruler', `rulership:dispositors-${body}`]);
    if (body === 'Sun' || body === 'Moon') reward(8, body === 'Sun' ? 'Luminary: identity and chosen direction' : 'Luminary: emotional needs and regulation', []);
    if (ANGLES.has(body)) reward(6, 'Verified chart angle', []);
    if ([1, 4, 7, 10].includes(placements[body].house ?? 0) && !ANGLES.has(body)) reward(5, 'Angular house, not automatically an angle conjunction', [`angularity:${body}`]);
    const ruled = Object.entries(houseRulers).filter(([, r]) => r.traditional === body).map(([h]) => Number(h));
    for (const h of ruled) reward([1, 4, 7, 10].includes(h) || occupants(h).length >= 3 ? 3 : 1, `Carries house ${h}${occupants(h).length >= 3 ? ', strongly occupied' : ''}`, [`rulership:house-${h}`]);
    for (const e of aspects) {
      const a = e.aspect; if (!a || !e.bodies.includes(body)) continue;
      const other = a.a === body ? a.b : a.a;
      if (a.type === 'conjunction' && ANGLES.has(other) && a.orb < 3) reward(8, `Conjunct ${other}, ${a.orb.toFixed(2)}° orb`, [e.id]);
      else if (a.orb < 3 && (PERSONAL.has(other) || ANGLES.has(other) || other === ruler)) reward(a.orb < 1 ? 4 : 2, `Tight ${a.type} to ${other}, ${a.orb.toFixed(2)}° orb`, [e.id]);
    }
    for (const e of Object.values(evidence)) if (['concentration', 'configuration'].includes(e.kind ?? '') && e.bodies.includes(body)) reward(2, `Member of ${e.id}`, [e.id]);
    if (PERSONAL.has(body) && weight === 0) reward(1, 'Personal function, not independently a main story', []);
    return { body, weight, tier: weight >= 6 ? 'primary' as const : weight >= 2 ? 'secondary' as const : 'background' as const, reasons, evidenceIds: exists(ids) };
  }).sort((a, b) => b.weight - a.weight || a.body.localeCompare(b.body));
  const priority = new Map(hierarchy.map(h => [h.body, h]));
  const chainFor = (b: string) => source.chains.find(c => c.id === (b === 'Sun' || b === 'Moon' ? `chain:${b.toLowerCase()}` : `chain:planet-${b}`))
    ?? source.chains.find(c => c.id === ({ Ascendant: 'chain:rising', Descendant: 'chain:descendant', Midheaven: 'chain:midheaven', IC: 'chain:ic' }[b]));
  const candidates: PlotTheme[] = [];
  const add = (id: string, structure: string, rawBodies: string[], core: string[]) => {
    // Sign/house/condition/dispositor rows for one body are one structural indicator, not four votes.
    // Opposite angles also describe one axis.
    const normalized = (b: string) => b === 'Descendant' ? 'Ascendant' : b === 'IC' ? 'Midheaven' : b;
    const bodies = unique(rawBodies.filter(b => placements[b] && (PERSONAL.has(b) || ANGLES.has(b) || (priority.get(b)?.weight ?? 0) >= 2)))
      .filter((b, i, all) => all.findIndex(x => normalized(x) === normalized(b)) === i);
    if (bodies.length < 2) return;
    const paths = exists(bodies.map(b => `rulership:dispositors-${b}`));
    const rulers = exists(bodies.flatMap(b => Object.entries(houseRulers).filter(([, r]) => r.traditional === b).map(([h]) => `rulership:house-${h}`)));
    const linked = source.tensions.filter(t => t.evidenceIds.some(e => {
      const a = evidence[e]?.aspect; return a && [a.a, a.b].some(b => bodies.includes(b));
    })).sort((a, b) => Number(Boolean(b.mustAddress)) - Number(Boolean(a.mustAddress)) || a.id.localeCompare(b.id)).slice(0, 2);
    const requiredEvidenceIds = exists([...core, ...bodies.map(primaryId)]);
    // A repeated route needs its endpoint placements and tight contacts, not just a list of source names.
    const pathBodies = unique(paths.flatMap(id => evidence[id]?.bodies ?? []));
    const connectedBodies = unique([...bodies, ...pathBodies]);
    const connectedAspects = aspects.filter(e => (e.aspect?.orb ?? 99) < 3 && e.bodies.every(b => connectedBodies.includes(b)));
    const evidenceIds = exists([...requiredEvidenceIds, ...paths, ...rulers, ...pathBodies.map(primaryId), ...connectedAspects.map(e => e.id), ...linked.flatMap(t => t.evidenceIds)]);
    const weight = bodies.reduce((sum, b) => sum + Math.min(priority.get(b)?.weight ?? 0, 16), 0) + (bodies.length >= 3 ? 5 : 0);
    candidates.push({ id, structure, indicatorBodies: bodies, indicatorCount: bodies.length, strength: bodies.length >= 3 ? 'main-story' : 'meaningful', weight,
      requiredEvidenceIds, evidenceIds, rulerPathIds: paths, chainIds: unique(bodies.map(chainFor).filter(c => Boolean(c)).map(c => c?.id ?? '')),
      contradictions: linked.map(t => ({ id: t.id, fact: t.fact, evidenceIds: t.evidenceIds })) });
  };
  // Structural motifs only. No prefabricated psychological-theme menu.
  for (const e of Object.values(evidence)) {
    if (['concentration', 'configuration'].includes(e.kind ?? '')) add(`plot:${e.id}`, e.fact ?? e.id, e.bodies, [e.id]);
    const a = e.aspect;
    if (a && !a.derived && a.orb < 3 && e.bodies.some(b => PERSONAL.has(b) || ANGLES.has(b) || b === ruler)) add(`plot:${e.id}`, e.fact ?? e.id, e.bodies, [e.id]);
  }
  // Shared traditional dispositor paths are actual repeated routes, not more copies of one placement.
  const routes = new Map<string, string[]>();
  for (const b of MAJORS) {
    const path = evidence[`rulership:dispositors-${b}`]?.bodies;
    if (!path?.length) continue;
    const route = [...path]; if (route.length > 1 && route[route.length - 1] === route[route.length - 2]) route.pop();
    const end = route[route.length - 1];
    (routes.get(end) ?? (routes.set(end, []), routes.get(end)))?.push(b);
  }
  for (const [end, bs] of routes) if (bs.length >= 2) add(`plot:ruler-convergence-${end}`, `Independent planet paths converge on ${end}; follow each full path, including loops`, bs, bs.map(b => `rulership:dispositors-${b}`));
  const lum = ['Sun', 'Moon', 'Ascendant'].filter(b => placements[b]);
  if (lum.length >= 2 && new Set(lum.map(b => placements[b].house)).size >= 2) add('plot:luminary-house-contrast', 'Sun, Moon and presentation occupy different life arenas; preserve visible versus internal needs', lum, lum.map(primaryId));
  candidates.sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
  const selected: PlotTheme[] = [];
  // Cover a coherent range instead of selecting five versions of the same cluster.
  for (const theme of candidates) {
    const duplicate = selected.some(s => {
      const overlap = theme.indicatorBodies.filter(b => s.indicatorBodies.includes(b)).length;
      return overlap / Math.max(theme.indicatorBodies.length, s.indicatorBodies.length) >= 0.8;
    });
    if (!duplicate && selected.length < 5) selected.push(theme);
  }
  return { version: 1, hierarchy, candidates, selectedThemeIds: selected.map(t => t.id), primaryThemeId: selected[0]?.id ?? null,
    chartRuler: ruler ? { body: ruler, evidenceIds: exists(['angle:Ascendant', 'rulership:chart-ruler', primaryId(ruler), `condition:${ruler}`, `rulership:dispositors-${ruler}`, ...aspects.filter(e => e.bodies.includes(ruler) && (e.aspect?.orb ?? 99) < 3).map(e => e.id)]), chainId: chainFor(ruler)?.id ?? null } : null,
    baselineEvidenceIds: exists(['placement:Sun', 'placement:Moon', 'angle:Ascendant', 'concentration:big-three']) };
}