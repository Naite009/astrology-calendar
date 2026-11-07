import type { NatalChart } from '@/hooks/useNatalChart';
import { buildSymbolicDevelopment } from '@/lib/interpretation/symbolicDevelopment';
import { getHouseLivedInterpretation } from '@/lib/interpretation/psychologicalFunctions';

export function KarmicPastLifeCard({ chart }: { chart: NatalChart }) {
  const reading = buildSymbolicDevelopment(chart);
  return <details className="space-y-3">
    <summary className="cursor-pointer font-medium">Optional past-life symbolism</summary>
    <p className="text-sm text-muted-foreground mt-3">Spiritual / esoteric interpretation, not a chart fact. Past lives and karma are beliefs, not a biography calculated from a chart. No past occupation, inherited trauma or debt is inferred here.</p>
    <p className="text-sm">You might use an old-story image to reflect on a habit you want to change now. What do you repeat in private, and what would you choose differently today?</p>
    <p className="text-sm">{getHouseLivedInterpretation(12)?.question}</p>
    {reading.privateFactors.length > 0 && <p className="text-xs text-primary">Measured 12th-house placements: {reading.privateFactors.map(p => `${p.body} in ${p.sign}`).join(', ')}.</p>}
  </details>;
}
