import type { NatalChart } from '@/hooks/useNatalChart';
import { prioritizedPlacementInteractions } from '@/lib/interpretation/placementInteractions';

export function PlacementInteractions({ chart }: { chart: NatalChart }) {
  const interactions = prioritizedPlacementInteractions(chart);
  if (!interactions.length) return null;
  return <section className="space-y-5 border-b border-border pb-5">
    <h2 className="font-serif text-xl text-foreground">Placements working together</h2>
    {interactions.map(item => <article key={item.id} className="border-l-2 border-primary pl-4 space-y-3">
      <h3 className="font-medium text-foreground">{item.title}</h3>
      <p className="text-xs text-muted-foreground">{item.evidence}</p>
      <div className="grid gap-3 sm:grid-cols-2">{item.contrast.map(line => <p key={line} className="text-sm text-muted-foreground">{line}</p>)}</div>
      <p className="text-sm text-foreground">{item.together}</p>
      <details><summary className="cursor-pointer text-xs text-primary">Expression, tension and integration</summary><div className="mt-3 space-y-2 text-sm text-muted-foreground"><p>{item.example}</p><p>{item.tension}</p><p>{item.integration}</p></div></details>
    </article>)}
  </section>;
}