/**
 * Ayanamsa selector. Lahiri is the default because it is what most Jyotishis
 * and most published ephemerides use, but the other schools are here because
 * they genuinely change fine-division placements, and because an older book
 * disagreeing with the app is usually an ayanamsa difference rather than an error.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AYANAMSA_MODE_LIST,
  AYANAMSA_SPECS,
  AyanamsaMode,
  ayanamsaNote,
  ayanamsaSpread,
  formatAyanamsa,
} from '@/lib/vedic/ayanamsa';

interface Props {
  mode: AyanamsaMode;
  onChange: (mode: AyanamsaMode) => void;
  birthMoment: Date;
  value: number;
}

export const AyanamsaSelector = ({ mode, onChange, birthMoment, value }: Props) => {
  const [open, setOpen] = useState(false);
  const spread = ayanamsaSpread(birthMoment, mode);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Ayanamsa</span>
        <div className="flex flex-wrap gap-1.5">
          {AYANAMSA_MODE_LIST.map(m => (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                m === mode
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary/40'
              }`}
            >
              {AYANAMSA_SPECS[m].label}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-muted-foreground">
          Applied: {formatAyanamsa(value)}
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
        >
          What is this
          <ChevronDown size={13} className={`${open ? 'rotate-180' : ''} transition-transform`} />
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
          <p className="text-[13px] leading-relaxed text-foreground/85">
            The ayanamsa is the gap between the tropical zodiac, measured from the spring equinox, and the sidereal
            zodiac, measured from the fixed stars. Subtracting it is what turns your Western chart into a Vedic one.
            Different schools set the anchor slightly differently, which mostly leaves signs alone and mostly changes
            the fine divisions such as D30, D45 and D60.
          </p>
          <p className="text-[13px] leading-relaxed">{ayanamsaNote(mode)}</p>
          <div className="grid gap-1.5">
            {spread.map(s => (
              <div key={s.mode} className="flex flex-wrap items-baseline gap-2 text-[12px]">
                <span className={s.mode === mode ? 'font-medium text-primary' : 'text-muted-foreground'}>
                  {s.label}
                </span>
                <span className="text-muted-foreground">{formatAyanamsa(s.value)}</span>
                <span className="text-muted-foreground">
                  {s.mode === mode
                    ? 'in use'
                    : `${s.arcminFromActive > 0 ? '+' : ''}${s.arcminFromActive} arc-minutes from the one in use`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
