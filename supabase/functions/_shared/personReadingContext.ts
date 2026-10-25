/**
 * Builds the person-reading ValidationContext from a serialized chart story map.
 * Shared by the browser and the natal-person-reading edge function so both
 * gates check exactly the same evidence.
 */
import type { ValidationContext } from './personReadingValidator.ts';
import { buildNatalMainPlot } from './natalMainPlot.ts';

export interface SerializedStoryMap {
  version?: number;
  evidence: Record<string, { id: string; kind?: string; bodies: string[]; aspect?: { a: string; b: string; type: string; orb: number; derived?: boolean } }>;
  chains: { id: string; steps: string[]; bodies: string[] }[];
  tensions: { id: string; fact: string; evidenceIds: string[]; mustAddress?: boolean }[];
  transits: { id: string }[];
  allowedAspects: ({ a: string; b: string; type: string; orb?: number } | undefined)[];
  placements?: Record<string, { sign: string; longitude: number; house: number | null }>;
  houseRulers?: Record<number, { traditional: string; modern?: string }>;
}

export function contextFromStoryMap(map: SerializedStoryMap): ValidationContext {
  const evidenceChains: Record<string, string[]> = {};
  for (const c of map.chains) for (const s of c.steps) (evidenceChains[s] ??= []).push(c.id);
  const evidenceBodies: Record<string, string[]> = {};
  for (const [id, e] of Object.entries(map.evidence)) evidenceBodies[id] = e.bodies ?? [];
  const v2 = (map.version ?? 1) >= 2;
  return {
    evidenceIds: Object.keys(map.evidence),
    chainIds: map.chains.map((c) => c.id),
    transitIds: map.transits.map((t) => t.id),
    allowedAspects: map.allowedAspects.filter(Boolean) as ValidationContext['allowedAspects'],
    placements: map.placements,
    houseRulers: map.houseRulers,
    evidenceChains: v2 ? evidenceChains : undefined,
    evidenceBodies: v2 ? evidenceBodies : undefined,
    mustAddress: map.tensions.filter((t) => t.mustAddress).map((t) => ({ id: t.id, fact: t.fact, keyEvidenceId: t.evidenceIds[t.evidenceIds.length - 1] })),
    requireFullSignature: v2,
    strengthContext: { evidence: map.evidence, placements: map.placements, houseRulers: map.houseRulers },
    requireConclusionEvidence: (map.version ?? 1) >= 3,
    mainPlot: (map.version ?? 1) >= 4 ? buildNatalMainPlot(map) : undefined,
  };
}
