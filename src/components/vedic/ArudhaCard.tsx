/**
 * Arudha padas: the gap between what a house holds and how it looks to others.
 */

import { Arudha, ARUDHA_NOTE } from '@/lib/vedic/arudha';
import { VedicTerm } from './VedicTerm';

interface Props {
  arudhas: Arudha[];
  name: string;
}

export const ArudhaCard = ({ arudhas, name }: Props) => {
  if (!arudhas.length) return null;
  const al = arudhas.find(a => a.house === 1);

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">How You Come Across Versus What Is Actually There</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        <VedicTerm term="Arudha">Arudha padas</VedicTerm>, the Jaimini image points
      </p>

      {al && (
        <p className="mb-4 text-sm leading-relaxed text-foreground/85">
          {name}, your public image lands in house {al.inHouse} while your actual first house is where you live from.
          When those two differ, people tend to describe you by the area of life your image sits in and miss the part you
          spend most of your energy on. That mismatch is normal and it is usually the reason feedback about you can feel
          slightly off.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {arudhas.map(a => (
          <div key={a.house} className="rounded-md border border-border/70 p-4">
            <p className="text-[11px] uppercase tracking-widest text-primary">{a.label}</p>
            <p className="mt-1 font-serif text-[15px]">{a.sign}, house {a.inHouse}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Derived through {a.lord}, the lord of house {a.house}</p>
            <p className="mt-2 text-[13px] leading-relaxed">{a.plain}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {ARUDHA_NOTE}
      </p>
    </section>
  );
};
