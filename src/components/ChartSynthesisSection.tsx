import { ChevronDown, Sparkles } from 'lucide-react';
import type { ChartSynthesis } from '@/lib/interpretation/chartSynthesis';

export function ChartSynthesisSection({ synthesis }: { synthesis: ChartSynthesis }) {
  return (
    <section className="border border-primary/30 bg-card rounded-sm p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary">{synthesis.subtitle}</p>
          <h2 className="text-xl font-serif text-foreground">{synthesis.title}</h2>
        </div>
      </div>

      <div className="space-y-2">
        {synthesis.summary.map((sentence, index) => (
          <p key={`${index}-${sentence}`} className="text-sm leading-relaxed text-foreground">{sentence}</p>
        ))}
      </div>

      {synthesis.recognitionPoints.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">What this can look like</p>
          <ul className="list-disc space-y-1 pl-5">
            {synthesis.recognitionPoints.map((point) => (
              <li key={point} className="text-sm leading-relaxed text-foreground">{point}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground">
        <span className="font-medium">What helps:</span> {synthesis.whatHelps}
      </p>

      <details className="border-t border-border pt-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-primary">
          <ChevronDown className="h-3.5 w-3.5" /> Why these patterns lead
        </summary>
        <div className="mt-3 space-y-3">
          {synthesis.dynamics.map((dynamic) => (
            <div key={dynamic.id} className="rounded-sm border border-border bg-background/40 p-3 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{dynamic.title}</h3>
                <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{dynamic.signal}</span>
              </div>
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Evidence:</span> {dynamic.evidence}</p>
              <p className="text-xs text-foreground"><span className="font-medium">Why it matters:</span> {dynamic.whyItMatters}</p>
              <p className="text-xs text-foreground"><span className="font-medium">In ordinary life:</span> {dynamic.realLifeTranslation}</p>
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">What modifies it:</span> {dynamic.modifyingFactor}</p>
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Practical takeaway:</span> {dynamic.practicalTakeaway}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}