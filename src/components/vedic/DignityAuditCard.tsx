/**
 * Dignity, read the way Jyotish actually reads it: never in isolation. Each
 * exalted or debilitated graha is shown as classical fact, then traditional
 * meaning, then this app's interpretation, with the cancellation conditions
 * (neecha bhanga) or the limiting qualifiers listed explicitly.
 */

import { DignityAudit } from '@/lib/vedic/dignityMitigation';

const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export const DignityAuditCard = ({ audits }: { audits: DignityAudit[] }) => {
  if (!audits.length) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <header className="mb-4">
        <h3 className="font-serif text-xl">Dignity in Context</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Exaltation and debilitation, then what modifies them
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          A debilitated graha is not automatically a weak one, and an exalted graha is not automatically an easy one.
          Classical practice checks the sign ruler, the angles and the divisional charts before deciding.
        </p>
      </header>

      <div className="space-y-4">
        {audits.map(a => (
          <div key={a.planet} className="rounded-md border border-border">
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-secondary/25 px-4 py-3">
              <span className="text-base text-primary">{GLYPH[a.planet]}</span>
              <span className="text-[14px] font-medium">{a.planet}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                  a.dignity === 'exalted'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                }`}
              >
                {a.dignity}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {a.sign}{a.house ? `, house ${a.house}` : ''}
              </span>
            </div>

            <div className="space-y-3 p-4 text-[13px] leading-relaxed">
              <p>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Classical fact</span>
                <br />
                {a.fact}
              </p>
              <p>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Traditional interpretation</span>
                <br />
                {a.tradition}
              </p>
              <p className="text-foreground/85">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">This app's interpretation</span>
                <br />
                {a.modern}
              </p>

              <p className="text-muted-foreground">{a.dispositorLine}</p>

              {a.mitigations.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Neecha bhanga, conditions that cancel or soften the debility
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {a.mitigations.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              {a.qualifiers.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Conditions that limit this placement
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {a.qualifiers.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              {a.support.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Divisional support</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {a.support.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              <p className="rounded-md border border-primary/25 bg-primary/5 p-3 text-foreground/90">{a.verdict}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
