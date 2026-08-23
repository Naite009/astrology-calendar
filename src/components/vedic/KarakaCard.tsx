/**
 * The eight Jaimini chara karakas with the ranking shown openly, including
 * Rahu's reverse-counted effective degree, so the method is visible and not
 * something the reader has to trust blindly.
 */

import { KarakaAssignment, KARAKA_MEANING, KARAKA_METHOD_NOTE } from '@/lib/vedic/karakas';
import { formatDegree } from '@/lib/vedic/siderealChart';
import { Info } from 'lucide-react';

const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export const KarakaCard = ({ karakas, name }: { karakas: KarakaAssignment[]; name: string }) => {
  if (!karakas.length) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <header className="mb-4">
        <h3 className="font-serif text-xl">Jaimini Karakas</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Eight karaka method, ranked by degree
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          These are roles the chart assigns by degree, not personality labels for {name.split(' ')[0]}.
        </p>
      </header>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Karaka</th>
              <th className="px-3 py-2">Graha</th>
              <th className="px-3 py-2">Position</th>
              <th className="px-3 py-2">Ranking degree</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {karakas.map(k => (
              <tr key={k.karaka} className="align-top">
                <td className="px-3 py-2 font-medium text-foreground">{k.karaka}</td>
                <td className="px-3 py-2 text-foreground/90">
                  <span className="mr-1 text-primary">{GLYPH[k.planet]}</span>{k.planet}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDegree(k.degree)} {k.sign}{k.house ? `, house ${k.house}` : ''}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDegree(k.effectiveDegree)}
                  {k.reverseCounted && (
                    <span className="block text-[11px] text-primary">
                      reverse counted, thirty minus {formatDegree(k.degree)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2 rounded-md border border-border/70 bg-secondary/20 p-3">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-foreground/85">{KARAKA_METHOD_NOTE}</p>
      </div>

      <div className="mt-4 space-y-2">
        {karakas.slice(0, 3).map(k => (
          <p key={k.karaka} className="text-[13px] leading-relaxed text-foreground/85">
            <span className="font-medium">{k.karaka} ({k.planet}):</span> {KARAKA_MEANING[k.karaka]}
          </p>
        ))}
      </div>
    </section>
  );
};
