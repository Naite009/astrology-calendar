/**
 * Planet by planet deep dive. Each graha opens into sign, house, nakshatra,
 * dignity and lordship, written as recognizable behavior.
 */

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { PlacementDeepDive as Dive, ComboHit } from '@/lib/vedic/placementDeepDive';

const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const SANSKRIT: Record<string, string> = {
  Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangala', Mercury: 'Budha', Jupiter: 'Guru',
  Venus: 'Shukra', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu',
};

interface Props {
  dives: Dive[];
  combos: ComboHit[];
  name: string;
}

export const PlacementDeepDiveCard = ({ dives, combos, name }: Props) => {
  const [open, setOpen] = useState<string | null>(dives[0]?.planet || null);

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <header className="mb-4">
        <h3 className="font-serif text-xl text-foreground">Planet by Planet</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Every graha in sign, house and nakshatra
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Open any planet to see what it looks like in {name.split(' ')[0]}'s actual life, not in theory.
        </p>
      </header>

      {combos.length > 0 && (
        <div className="mb-5 rounded-md border border-primary/25 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary">
            <Sparkles size={12} />
            Signature combinations in this chart
          </div>
          <div className="space-y-3">
            {combos.map(c => (
              <div key={c.label}>
                <div className="text-[13px] font-medium text-foreground">{c.label}</div>
                <p className="text-[13px] leading-relaxed text-foreground/85">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {dives.map(d => {
          const isOpen = open === d.planet;
          return (
            <div key={d.planet}>
              <button
                onClick={() => setOpen(isOpen ? null : d.planet)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary/40"
              >
                <span className="w-5 shrink-0 text-center text-base text-primary">{GLYPH[d.planet]}</span>
                <span className="flex-1">
                  <span className="text-[14px] font-medium text-foreground">{d.planet}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {SANSKRIT[d.planet]}
                  </span>
                  <span className="block text-[12px] text-muted-foreground">{d.technical}</span>
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="space-y-3 bg-secondary/20 px-4 pb-4 pt-1 text-[14px] leading-[1.7] text-foreground/90">
                  <p className="text-[12px] uppercase tracking-widest text-muted-foreground">{d.role}</p>
                  <p>{d.signLine}</p>
                  {d.houseLine && <p>{d.houseLine}</p>}
                  {d.nakshatraLine && <p>{d.nakshatraLine}</p>}
                  {d.dignityLine && <p>{d.dignityLine}</p>}
                  {d.lordshipLine && <p className="text-foreground/75">{d.lordshipLine}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
