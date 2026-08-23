/**
 * The Western to Vedic bridge, placed high in the tab because it is the single
 * thing that prevents the most common misreading: thinking the sidereal sign
 * replaces the tropical one. Shows the arithmetic, then the rule.
 */

import { VedicChart, formatDegree } from '@/lib/vedic/siderealChart';
import { formatAyanamsa } from '@/lib/vedic/ayanamsa';
import { ArrowRight } from 'lucide-react';

export const ZodiacBridgeCard = ({ chart }: { chart: VedicChart }) => {
  const rows = chart.bodies
    .filter(b => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(b.name))
    .map(b => ({ name: b.name, from: b.tropicalSign, to: b.sign, degree: b.degree, moved: b.sign !== b.tropicalSign }));

  return (
    <section className="rounded-lg border border-primary/25 bg-primary/[0.04] p-5 md:p-6">
      <header className="mb-4">
        <h3 className="font-serif text-xl">Western and Vedic: the same sky, two rulers</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Read this before anything below it
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-4 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Western position</p>
          <p className="font-serif text-base">measured from the spring equinox</p>
        </div>
        <ArrowRight size={16} className="text-primary" />
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Minus the ayanamsa</p>
          <p className="font-serif text-base text-primary">{formatAyanamsa(chart.ayanamsa)}</p>
        </div>
        <ArrowRight size={16} className="text-primary" />
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Vedic position</p>
          <p className="font-serif text-base">measured from a fixed star reference</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map(r => (
          <div
            key={r.name}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-[13px] ${
              r.moved ? 'border-primary/30 bg-card' : 'border-border/60 bg-secondary/20'
            }`}
          >
            <span className="font-medium">{r.name}</span>
            <span className="text-muted-foreground">
              {r.from} <ArrowRight size={11} className="inline" /> <span className={r.moved ? 'text-primary' : ''}>{r.to}</span>{' '}
              {formatDegree(r.degree)}
            </span>
          </div>
        ))}
      </div>

      {chart.lagnaSign && (
        <p className="mt-3 rounded-md border border-border/60 bg-card p-3 text-[13px] leading-relaxed">
          Your rising sign converts the same way, and it matters more here than anywhere else, because the whole house
          structure in this tab is counted from it. Vedic lagna: {formatDegree(chart.lagnaDegree || 0)} {chart.lagnaSign}.
        </p>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-foreground/85">
        The planets did not move and the measuring stick changed. The Vedic sign does not replace your Western sign, and it
        is not a truer version of it. Each sign is read inside its own system with its own rules, so a sidereal Sun is read
        through its house, the houses it rules, its nakshatra, its dignity, the ruler of the sign it sits in and the period
        you are currently in, never as a standalone personality label.
      </p>
    </section>
  );
};
