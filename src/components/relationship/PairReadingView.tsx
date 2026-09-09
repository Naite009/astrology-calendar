/**
 * Canonical relationship reading surface.
 *
 * Renders the output of `buildPairReading` only. It never computes aspects,
 * houses or scores itself, so screen, PDF and any future export all show the
 * same numbers and the same context-appropriate wording.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { PairReading, ReadingItem } from '@/lib/relationship';
import { ordinal } from '@/lib/interpretation/ordinals';

const STRENGTH_LABEL: Record<ReadingItem['strength'], string> = {
  strong: 'Strong signal',
  moderate: 'Moderate signal',
  'single-contact': 'Single contact',
};

const ItemCard = ({ item }: { item: ReadingItem }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h5 className="font-medium text-sm">{item.title}</h5>
        <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
          {STRENGTH_LABEL[item.strength]}
        </Badge>
      </div>
      <p className="text-sm text-foreground/90">{item.statement}</p>
      {item.growthEdge && (
        <p className="text-sm text-muted-foreground mt-1">{item.growthEdge}</p>
      )}
      {item.directional && (
        <div className="mt-2 rounded-md border border-border/70 bg-secondary/20 p-2 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium">
              {item.directional.aspectLine} · {item.directional.orbLine}
            </p>
            {item.directional.isOutOfSign && (
              <Badge variant="outline" className="text-[10px] whitespace-nowrap border-amber-500/60 text-amber-600 dark:text-amber-400">
                Out of sign
              </Badge>
            )}
          </div>
          {item.directional.positionsLine && (
            <p className="text-[11px] text-muted-foreground">{item.directional.positionsLine}</p>
          )}
          {item.directional.isOutOfSign && (
            <div className="rounded border border-amber-500/30 bg-amber-500/5 p-2 space-y-1">
              <p className="text-[11px] text-foreground/90">{item.directional.signLine}</p>
              <p className="text-[11px] text-foreground/90">{item.directional.degreeLine}</p>
              <p className="text-[11px] text-foreground/90">{item.directional.synthesisLine}</p>
            </div>
          )}

          <div className="grid gap-1 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium">{item.directional.a.roleLine}</p>
              <p className="text-[11px] text-muted-foreground">{item.directional.a.feels}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium">{item.directional.b.roleLine}</p>
              <p className="text-[11px] text-muted-foreground">{item.directional.b.feels}</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">How it can work well: </span>
            {item.directional.worksWell}
          </p>
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">Possible friction / growth edge: </span>
            {item.directional.growthEdge}
          </p>
          <p className="text-[11px] text-foreground/90">
            <span className="font-medium">In one line: </span>
            {item.directional.summary}
          </p>
        </div>
      )}
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="mt-2 text-xs text-primary flex items-center gap-1">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Why this reading
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 space-y-1">
            {item.evidence.map((e, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {e}</li>
            ))}
          </ul>
          {item.say && (
            <p className="mt-2 text-xs italic text-foreground/80">Say it like this: “{item.say}”</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const PairReadingView = ({ reading }: { reading: PairReading }) => {
  const { context, score, sections, symbolic, clusters } = reading;
  const [showSymbolic, setShowSymbolic] = useState(false);

  return (
    <div className="space-y-6">
      {/* Context banner — the reading always states how it was framed */}
      <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-1">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-primary" />
          <span className="text-sm font-medium">{context.label}</span>
          {context.involvesMinor && (
            <Badge variant="outline" className="text-[10px]">
              {context.stage === 'child' ? 'Child-appropriate' : 'Teen-appropriate'} wording
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{context.contextNote}</p>
        <p className="text-xs text-muted-foreground">
          {context.people.map((p) => `${p.name}${p.age !== null ? ` (${p.age})` : ''}`).join(' · ')}
        </p>
      </div>

      {/* Context-specific indices. Neutral mode has no headline number. */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h4 className="font-serif text-lg">{score.label}</h4>
          {score.overall !== null && (
            <span className="text-2xl font-bold text-primary">{score.overall}</span>
          )}
        </div>
        {score.overall === null && (
          <p className="text-xs text-muted-foreground">
            No single headline number is shown in neutral mode: romance, friendship, work and family
            measure different things, so averaging them together would be meaningless. Pick a specific
            context above if you want one index.
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {score.dimensions.map((d) => (
            <div key={d.key} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between text-sm">
                <span>{d.label}</span>
                <span className="font-medium">{d.score}</span>
              </div>
              <Progress value={d.score} className="h-1.5 my-2" />
              <p className="text-xs text-muted-foreground">{d.meaning}</p>
              {d.evidence.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {d.evidence.slice(0, 3).map((e, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground">• {e}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{score.disclaimer}</p>
        <p className="text-xs text-muted-foreground">{score.weightingNote}</p>
      </div>

      {/* Reading sections in context order */}
      {sections
        .filter((s) => s.key !== 'bottomLine')
        .map((section) => (
          <div key={section.key} className="space-y-2">
            <h4 className="font-serif text-lg">{section.title}</h4>
            {section.intro && <p className="text-xs text-muted-foreground">{section.intro}</p>}
            {section.items.length > 0 ? (
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <ItemCard key={i} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{section.emptyNote}</p>
            )}
          </div>
        ))}

      {clusters.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-serif text-lg">Where the emphasis lands</h4>
          {clusters.map((c, i) => (
            <div key={i} className="p-3 rounded-lg border border-border bg-card">
              <p className="text-sm font-medium">
                {c.bodyOwner}&rsquo;s planets in {c.houseOwner}&rsquo;s {ordinal(c.house)} house
              </p>
              <p className="text-xs text-muted-foreground">{c.arena}</p>
              <p className="text-sm mt-1">
                {c.bodies.join(', ')} land here, which puts repeated emphasis on this area of life
                {c.method !== 'cusps' ? ' (houses approximated by whole sign — no stored cusps)' : ''}.
              </p>

            </div>
          ))}
        </div>
      )}

      {/* Symbolic layer is opt-in and clearly labelled */}
      <Collapsible open={showSymbolic} onOpenChange={setShowSymbolic}>
        <CollapsibleTrigger className="w-full p-3 rounded-lg border border-border bg-card flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            {symbolic.heading}
          </span>
          {showSymbolic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          <p className="text-xs text-muted-foreground">{symbolic.note}</p>
          {symbolic.items.map((item, i) => (
            <ItemCard key={i} item={item} />
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Bottom line */}
      <div className="p-4 rounded-lg border border-primary/40 bg-primary/5 space-y-2">
        <h4 className="font-serif text-lg">Bottom line</h4>
        <p className="text-sm">{reading.bottomLine}</p>
      </div>

      <p className="text-[11px] text-muted-foreground">{reading.methodNote}</p>
    </div>
  );
};

export default PairReadingView;
