/**
 * The birth panchanga: the five limbs of the day someone arrived on.
 * A Jyotishi normally reads this before anything else.
 */

import { Panchanga, PANCHANGA_NOTE } from '@/lib/vedic/panchanga';
import { nakshatraAttributes, nakshatraDepth } from '@/lib/vedic/nakshatraDetail';
import { VedicTerm } from './VedicTerm';

interface Props {
  panchanga: Panchanga;
  name: string;
}

export const PanchangaCard = ({ panchanga, name }: Props) => {
  const { tithi, vara, nakshatra, yoga, karana } = panchanga;
  const attrs = nakshatraAttributes(nakshatra.name);
  const depth = nakshatraDepth(nakshatra);

  const rows: { label: string; term: string; value: string; note: string }[] = [
    { label: 'Lunar day', term: 'Tithi', value: `${tithi.name} (${tithi.paksha} paksha)`, note: tithi.plain },
    { label: 'Weekday', term: 'Vara', value: vara.name, note: vara.plain },
    { label: 'Lunar mansion', term: 'Nakshatra', value: `${nakshatra.name}, pada ${nakshatra.pada}`, note: `Ruled by ${nakshatra.lord}. ${depth.padaNote}` },
    { label: 'Day quality', term: 'Nitya Yoga', value: yoga.name, note: yoga.plain },
    { label: 'Half-day division', term: 'Karana', value: karana.name, note: karana.plain },
  ];

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">The Day You Arrived On</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        <VedicTerm term="Panchanga">Panchanga</VedicTerm>, the five limbs of the birth day
      </p>

      <p className="mb-4 text-sm leading-relaxed text-foreground/85">
        Before looking at any planet, a Jyotishi reads the day itself. {name} was born on a {vara.name} in the{' '}
        {tithi.paksha === 'Shukla' ? 'waxing' : 'waning'} half of the lunar month, on {tithi.name}, with the Moon in{' '}
        {nakshatra.name}. That combination sets the background tone the rest of the chart is read against.
      </p>

      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.term} className="rounded-md border border-border/70 p-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[11px] uppercase tracking-widest text-primary">{r.label}</span>
              <span className="text-[11px] text-muted-foreground">({r.term})</span>
              <span className="font-serif text-[15px]">{r.value}</span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground/85">{r.note}</p>
          </div>
        ))}
      </div>

      {attrs && (
        <div className="mt-4 rounded-md border border-border bg-secondary/15 p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Inside {nakshatra.name}, the layer most readings skip
          </p>
          <div className="mt-2 space-y-2 text-[13px] leading-relaxed">
            <p><span className="font-medium">Presiding deity, {attrs.deity}.</span> {attrs.deityPlain}.</p>
            <p><span className="font-medium">Temperament class.</span> {attrs.ganaPlain}</p>
            <p>
              <span className="font-medium">Animal nature, the {attrs.yoni} yoni.</span> Classically read as {attrs.yoniPlain}.
              It is a description of instinct under pressure, not a personality label.
            </p>
          </div>
        </div>
      )}

      <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {PANCHANGA_NOTE}
      </p>
    </section>
  );
};
