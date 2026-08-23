/**
 * Graha condition: the classical strength read.
 *
 * Shows the condition index for each of the nine grahas with every component
 * that produced it, so the number is never a black box.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PlanetCondition, CONDITION_INDEX_NOTE } from '@/lib/vedic/strength';
import { VedicTerm } from './VedicTerm';

interface Props {
  conditions: PlanetCondition[];
}

const BAND_STYLE: Record<PlanetCondition['band'], { label: string; cls: string; bar: string }> = {
  strong: { label: 'Works easily', cls: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' },
  workable: { label: 'Works with effort', cls: 'text-primary', bar: 'bg-primary' },
  strained: { label: 'Needs support', cls: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' },
};

export const PlanetConditionCard = ({ conditions }: Props) => {
  const [open, setOpen] = useState<string | null>(null);
  if (!conditions.length) return null;

  const strongest = conditions[0];
  const weakest = conditions[conditions.length - 1];

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">How Strong Each Planet Actually Is</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        Condition, not personality. A placement can promise something and still lack the strength to deliver it easily
      </p>

      <p className="mb-4 text-sm leading-relaxed text-foreground/85">
        In Jyotish a placement is only half the story. The other half is whether that graha is in a condition to act.{' '}
        {strongest.body} is currently the best placed function in this chart and {weakest.body} the most strained, which
        means things that run through {strongest.body} tend to come easily while anything depending on {weakest.body}{' '}
        usually needs a deliberate plan rather than instinct.
      </p>

      <div className="space-y-2">
        {conditions.map(c => {
          const style = BAND_STYLE[c.band];
          const isOpen = open === c.body;
          return (
            <div key={c.body} className="rounded-md border border-border">
              <button
                onClick={() => setOpen(isOpen ? null : c.body)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span className="w-20 shrink-0 font-serif text-[15px]">{c.body}</span>
                <span className="w-28 shrink-0 text-[12px] text-muted-foreground">
                  {c.sign}{c.house ? `, h${c.house}` : ''}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span className={`block h-full rounded-full ${style.bar}`} style={{ width: `${c.index}%` }} />
                </span>
                <span className={`w-32 shrink-0 text-right text-[12px] font-medium ${style.cls}`}>
                  {style.label}
                </span>
                <ChevronDown size={14} className={isOpen ? 'rotate-180 shrink-0 transition-transform' : 'shrink-0 transition-transform'} />
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-border/60 bg-secondary/15 p-4">
                  {c.components.map((comp, i) => (
                    <div key={i}>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{comp.label}</p>
                      <p className="text-[13px] leading-relaxed">{comp.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {CONDITION_INDEX_NOTE} The classical name for the full version is{' '}
        <VedicTerm term="Shadbala">Shadbala</VedicTerm>, and this is deliberately not called that.
      </p>
    </section>
  );
};
