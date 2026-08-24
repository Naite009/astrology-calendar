/**
 * Named classical combinations with the exact placements behind each one.
 * Nothing is stated as a certainty and nothing predicts an event.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Yoga, YOGA_NOTE, YOGA_CONDITION_NOTE } from '@/lib/vedic/yogas';

interface Props {
  yogas: Yoga[];
  name: string;
}

const CATEGORY_LABEL: Record<Yoga['category'], { text: string; cls: string }> = {
  character: { text: 'Character', cls: 'bg-primary/15 text-primary' },
  wealth: { text: 'Resources', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  status: { text: 'Standing', cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  strain: { text: 'Pressure', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  protection: { text: 'Protective', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  learning: { text: 'Mind', cls: 'bg-primary/15 text-primary' },
};

const WEIGHT_LABEL: Record<Yoga['weight'], string> = {
  strong: 'Well supported in this chart',
  moderate: 'Present and worth reading',
  noted: 'Present, treat lightly',
};

export const YogaCard = ({ yogas, name }: Props) => {
  const [open, setOpen] = useState<string | null>(yogas[0]?.key ?? null);
  if (!yogas.length) return null;

  const strong = yogas.filter(y => y.weight === 'strong');

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">Named Patterns in This Chart</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        Classical combinations, with the placements that trigger each one
      </p>

      <p className="mb-4 text-sm leading-relaxed text-foreground/85">
        {strong.length
          ? `${name} has ${yogas.length} recognised combination${yogas.length > 1 ? 's' : ''} here, and ${strong.length === 1 ? 'one of them is' : `${strong.length} of them are`} strongly supported rather than technically present. Read the strong ones first and treat the rest as background texture.`
          : `${name} has ${yogas.length} recognised combination${yogas.length > 1 ? 's' : ''} here, none of them dominant. That is common, and it usually means the chart is read through its house lords and periods rather than through one headline pattern.`}
      </p>

      <div className="space-y-2">
        {yogas.map(y => {
          const isOpen = open === y.key;
          const cat = CATEGORY_LABEL[y.category];
          return (
            <div key={y.key} className="rounded-md border border-border">
              <button onClick={() => setOpen(isOpen ? null : y.key)} className="w-full p-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-[15px]">{y.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${cat.cls}`}>{cat.text}</span>
                  <span className="text-[11px] text-muted-foreground">{WEIGHT_LABEL[y.weight]}</span>
                  {y.conditionEffect === 'lowered' && (
                    <span className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      weakened by condition
                    </span>
                  )}
                  {y.conditionEffect === 'raised' && (
                    <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      strengthened by condition
                    </span>
                  )}
                  <ChevronDown size={14} className={`ml-auto ${isOpen ? 'rotate-180' : ''} transition-transform`} />
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">In plain English, {y.plainName}.</p>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-border/60 bg-secondary/15 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">What triggers it</p>
                    <ul className="mt-1 space-y-1">
                      {y.evidence.map((e, i) => (
                        <li key={i} className="text-[13px] leading-relaxed">{e}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-[13px] leading-relaxed">{y.meaning}</p>
                  {y.conditionNote && (
                    <p className="rounded-md border border-border/60 bg-background/50 p-3 text-[12px] leading-relaxed text-muted-foreground">
                      {y.conditionNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {YOGA_NOTE} {YOGA_CONDITION_NOTE}
      </p>
    </section>
  );
};
