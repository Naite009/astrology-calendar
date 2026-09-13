/**
 * Shared renderer for the symbolic ("karmic") summary.
 *
 * Every Synastry surface uses this component, so the old unexplained
 * "86 / 1 / 1 / 6" cards and the "Catalyst Connection" verdict cannot come back
 * on one screen while being fixed on another.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KarmicCategory, KarmicSummary } from '@/lib/relationship/karmicSummary';

function CategoryBlock({ category }: { category: KarmicCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{category.label}</p>
          <p className="text-sm text-muted-foreground mt-1">{category.plainMeaning}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Why this appears
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <ul className="mt-3 space-y-2 border-t pt-3">
          {category.evidence.map((e, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium">{e.contact}</span>{' '}
              <span className="text-muted-foreground">({e.orbText})</span>
              <span className="block text-xs text-muted-foreground">{e.note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function KarmicSummaryCard({ summary }: { summary: KarmicSummary }) {
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-secondary/30 border">
        <h4 className="font-medium mb-2">The Big Picture</h4>
        <p className="text-sm text-muted-foreground">{summary.bigPicture}</p>
      </div>

      {summary.categories.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">{summary.countsNote}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {summary.categories.map((cat) => (
              <CategoryBlock key={cat.key} category={cat} />
            ))}
          </div>
        </>
      )}

      {summary.symbolic && (
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{summary.symbolic.heading}</Badge>
            <span className="font-medium text-sm">{summary.symbolic.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">{summary.symbolic.explanation}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Derived from: {summary.symbolic.derivedFrom.join('; ')}.
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">{summary.symbolic.note}</p>
        </div>
      )}

      <div className="p-4 rounded-lg border bg-muted/30">
        <h4 className="font-medium text-sm mb-2">What this does not mean</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
          {summary.doesNotMean.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border bg-card">
        <button
          type="button"
          onClick={() => setGlossaryOpen((v) => !v)}
          aria-expanded={glossaryOpen}
          className="w-full flex items-center justify-between p-3 text-sm font-medium"
        >
          What these words mean in this app
          {glossaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {glossaryOpen && (
          <dl className="px-4 pb-4 space-y-2 text-sm">
            {summary.glossary.map((g) => (
              <div key={g.term}>
                <dt className="font-medium">{g.term}</dt>
                <dd className="text-muted-foreground">{g.meaning}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

export default KarmicSummaryCard;
