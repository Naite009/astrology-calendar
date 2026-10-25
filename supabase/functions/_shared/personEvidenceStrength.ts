/** Interpretive support index, not a probability or scientifically measured personality score. */
export interface StrengthContext {
  evidence: Record<string, { kind?: string; bodies: string[]; aspect?: { a: string; b: string; type: string; orb: number; derived?: boolean } }>;
  placements?: Record<string, { sign: string; longitude: number; house: number | null }>;
  houseRulers?: Record<number, { traditional: string; modern?: string }>;
}
export interface EvidenceStrength {
  score: number;
  level: 'background' | 'supported' | 'strong';
  independentFactors: string[];
  personalizedBodies: string[];
  components: { personal: number; background: number; houses: number; aspects: number; angularity: number; rulers: number; repetition: number };
}
const PERSONAL = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']);
export const SLOW_BODIES = ['Saturn', 'Uranus', 'Neptune', 'Pluto'];
const ANGLES = new Set(['Ascendant', 'Midheaven', 'Descendant', 'IC']);

export function scorePersonEvidence(ids: string[], ctx: StrengthContext): EvidenceStrength {
  const components = { personal: 0, background: 0, houses: 0, aspects: 0, angularity: 0, rulers: 0, repetition: 0 };
  const factors = new Set<string>(), personalized = new Set<string>(), bodies = new Set<string>(), areas = new Set<number>();
  const add = (key: string, component: keyof typeof components, weight: number) => {
    if (factors.has(key)) return;
    factors.add(key); components[component] += weight;
  };
  for (const id of new Set(ids)) {
    const e = ctx.evidence[id]; if (!e) continue;
    if (e.kind === 'placement' || e.kind === 'angle') {
      for (const b of e.bodies) {
        bodies.add(b);
        add(`sign:${b}`, PERSONAL.has(b) || ANGLES.has(b) ? 'personal' : 'background', PERSONAL.has(b) || ANGLES.has(b) ? 2 : 0.25);
        const h = ctx.placements?.[b]?.house;
        if (h && !ANGLES.has(b)) {
          add(`house:${b}`, 'houses', 2); personalized.add(b); areas.add(h);
          if ([1, 4, 7, 10].includes(h)) add(`angular:${b}`, 'angularity', 2);
        }
      }
    }
    if (e.aspect) {
      const a = e.aspect;
      // ASC conjunction and DSC opposition are one geometric fact, not two votes.
      const mirror = a.a === 'Descendant' || a.a === 'IC' || a.b === 'Descendant' || a.b === 'IC';
      const normalize = (b: string) => b === 'Descendant' ? 'Ascendant' : b === 'IC' ? 'Midheaven' : b;
      const type = mirror ? ({ opposition: 'conjunction', conjunction: 'opposition', trine: 'sextile', sextile: 'trine' }[a.type] ?? a.type) : a.type;
      const relevant = [a.a, a.b].some((b) => PERSONAL.has(b) || ANGLES.has(b) || ctx.houseRulers?.[1]?.traditional === b);
      const tightness = a.orb < 1 ? 1 : a.orb < 3 ? 0.75 : a.orb < 5 ? 0.4 : 0.15;
      add(`aspect:${[normalize(a.a), normalize(a.b)].sort().join(':')}:${type}`, 'aspects', (relevant ? 4 : 0.5) * tightness);
      if (relevant) for (const b of [a.a, a.b]) personalized.add(b);
      if (a.type === 'conjunction' && a.orb < 3 && [a.a, a.b].some((b) => ANGLES.has(b))) add(`angle-contact:${[normalize(a.a), normalize(a.b)].sort().join(':')}`, 'angularity', 2);
    }
    if (e.kind === 'rulership') {
      for (const b of e.bodies) {
        // A sign's dispositor alone does not personalize that slow planet.
        if (id.startsWith('rulership:dispositors-') || id.endsWith('-dispositor')) {
          add(`dispositor:${id.replace('rulership:dispositors-', '').replace('rulership:', '').replace('-dispositor', '')}`, 'rulers', 0.5);
          continue;
        }
        const ruled = Object.entries(ctx.houseRulers ?? {}).filter(([, r]) => r.traditional === b).map(([h]) => Number(h));
        if (!ruled.length) continue;
        add(`house-ruler:${b}`, 'rulers', ctx.houseRulers?.[1]?.traditional === b ? 3 : 1.5);
        personalized.add(b); for (const h of ruled) areas.add(h);
      }
    }
  }
  // A concentration summarizes placements, it cannot create extra independent votes.
  if (bodies.size >= 3 && areas.size >= 2) components.repetition = 1;
  const score = Math.round(Object.values(components).reduce((s, n) => s + n, 0) * 10) / 10;
  return { score, level: score >= 10 && factors.size >= 3 ? 'strong' : score >= 4 && factors.size >= 2 ? 'supported' : 'background', independentFactors: [...factors], personalizedBodies: [...personalized], components };
}