/**
 * Top of the Vedic tab: the plain-English one-minute read, the Western vs
 * Vedic note, the Vedic big three with their actual Jyotish jobs, and the
 * repeating themes with an expandable "Why?" evidence trail.
 *
 * Nothing here states a theme without at least two independent placements
 * behind it, and every conclusion can be traced back to the chart.
 */

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { VedicChart, formatDegree } from '@/lib/vedic/siderealChart';
import { VedicTheme } from '@/lib/vedic/themeSynthesis';
import { OneMinute } from '@/lib/vedic/themeSynthesis';
import { VedicTerm } from './VedicTerm';

interface Props {
  chart: VedicChart;
  oneMinute: OneMinute;
  themes: VedicTheme[];
}

const STATE_LABEL: Record<VedicTheme['state'], { text: string; cls: string }> = {
  repeated: { text: 'Repeated theme', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  'adds-layer': { text: 'Adds another layer', cls: 'bg-primary/15 text-primary' },
  tension: { text: 'Apparent tension', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
};

export const VedicOverview = ({ chart, oneMinute, themes }: Props) => {
  const [open, setOpen] = useState<string | null>(null);
  const moon = chart.byName.Moon;
  const sun = chart.byName.Sun;
  const shifted = chart.bodies.filter(b => b.sign !== b.tropicalSign);

  return (
    <div className="space-y-6">
      {/* 1. One minute */}
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <h3 className="font-serif text-xl">This Vedic Chart in One Minute</h3>
        <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Plain English first, technical detail further down
        </p>
        <div className="space-y-3">
          {oneMinute.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-foreground/90">{p}</p>
          ))}
        </div>
      </section>

      {/* 2. Western vs Vedic */}
      <section className="rounded-lg border border-border bg-secondary/20 p-5 md:p-6">
        <h3 className="font-serif text-lg">Western and Vedic: why some signs change</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          Both charts start from the same birth sky. The Western zodiac measures from the spring equinox and the Vedic
          zodiac measures from a fixed star reference, and the current gap between them, the{' '}
          <VedicTerm term="Ayanamsa" />, is about twenty four degrees. That is why a placement can sit one sign back here.
        </p>
        {shifted.length > 0 && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            In this chart {shifted.map(b => `${b.name} moves from ${b.tropicalSign} to ${b.sign}`).join(', ')}.
            {sun && sun.sign !== sun.tropicalSign && (
              <> Read that as two positions in two different zodiac systems: the Western Sun is {sun.tropicalSign} and the
              sidereal Sun is {sun.sign}, each interpreted inside its own framework. Neither one cancels the other, and
              nobody is secretly a different sign.</>
            )}
          </p>
        )}
      </section>

      {/* 3. Vedic big three */}
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <h3 className="font-serif text-xl">Your Vedic Big Three</h3>
        <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Three different jobs, not three personality labels
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border/70 p-4">
            <p className="text-[11px] uppercase tracking-widest text-primary">
              <VedicTerm term="Lagna">Lagna (rising)</VedicTerm>
            </p>
            <p className="mt-1 font-serif text-lg">
              {chart.lagnaSign ? `${formatDegree(chart.lagnaDegree || 0)} ${chart.lagnaSign}` : 'Needs a birth time'}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Sets the entire house structure and the first impression people meet. In Jyotish this matters more than the
              Sun sign.
            </p>
          </div>
          <div className="rounded-md border border-border/70 p-4">
            <p className="text-[11px] uppercase tracking-widest text-primary">Moon</p>
            <p className="mt-1 font-serif text-lg">
              {moon ? `${formatDegree(moon.degree)} ${moon.sign}` : 'Not on this chart'}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              The mind and emotional processing, and the timer for the whole{' '}
              <VedicTerm term="Vimshottari" /> period system.
              {moon && <> Its <VedicTerm term="Nakshatra" /> is {moon.nakshatra.name}, <VedicTerm term="Pada" /> {moon.nakshatra.pada}.</>}
            </p>
          </div>
          <div className="rounded-md border border-border/70 p-4">
            <p className="text-[11px] uppercase tracking-widest text-primary">Sun</p>
            <p className="mt-1 font-serif text-lg">
              {sun ? `${formatDegree(sun.degree)} ${sun.sign}` : 'Not on this chart'}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Authority, vitality and where responsibility is carried. Read through its house and rulership rather than as
              a personality label.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Repeating themes */}
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <h3 className="font-serif text-xl">Your Repeating Themes</h3>
        <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Only shown when several independent placements point the same way
        </p>

        {themes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Not enough placement data on this chart yet to establish a repeated theme. Add the remaining bodies and an exact
            birth time and these will appear.
          </p>
        )}

        <div className="space-y-3">
          {themes.map(t => {
            const isOpen = open === t.key;
            const badge = STATE_LABEL[t.state];
            return (
              <div key={t.key} className="rounded-md border border-border">
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">{t.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t.plain}</p>
                  <button
                    onClick={() => setOpen(isOpen ? null : t.key)}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-primary"
                  >
                    Why? <ChevronDown size={13} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t border-border/60 bg-secondary/15 p-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Vedic evidence</p>
                      <ul className="mt-2 space-y-2">
                        {t.vedic.map((e, i) => (
                          <li key={i} className="text-[13px] leading-relaxed">
                            <span className="font-medium">{e.fact}.</span>{' '}
                            <span className="text-muted-foreground">{e.why}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Western evidence</p>
                      {t.western.length ? (
                        <ul className="mt-2 space-y-2">
                          {t.western.map((e, i) => (
                            <li key={i} className="text-[13px] leading-relaxed">
                              <span className="font-medium">{e.fact}.</span>{' '}
                              <span className="text-muted-foreground">{e.why}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-[13px] text-muted-foreground">
                          Nothing in the tropical chart independently emphasizes this, so it is not claimed as agreement.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 rounded-md border border-border/60 bg-card p-3">
                      <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                      <p className="text-[13px] leading-relaxed">{t.synthesis}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
