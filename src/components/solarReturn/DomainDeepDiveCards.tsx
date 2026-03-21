import { useState } from 'react';
import {
  DomainDeepDive, DomainHouseSnapshot, DomainPlanetHit,
} from '@/lib/solarReturnDomainDeepDive';
import {
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

interface Props {
  domains: DomainDeepDive[];
}

const TONE_COLORS: Record<string, string> = {
  supportive: 'text-emerald-600 dark:text-emerald-400',
  challenging: 'text-orange-600 dark:text-orange-400',
  mixed: 'text-amber-600 dark:text-amber-400',
  transformative: 'text-purple-600 dark:text-purple-400',
};

const TONE_LABELS: Record<string, string> = {
  supportive: 'Supportive',
  challenging: 'Demanding',
  mixed: 'Complex',
  transformative: 'Transformative',
};

const TONE_BG: Record<string, string> = {
  supportive: 'bg-emerald-50 dark:bg-emerald-950/30',
  challenging: 'bg-orange-50 dark:bg-orange-950/30',
  mixed: 'bg-amber-50 dark:bg-amber-950/30',
  transformative: 'bg-purple-50 dark:bg-purple-950/30',
};

const HitBadge = ({ hit }: { hit: DomainPlanetHit }) => (
  <div className="flex items-center gap-2 text-[11px] py-1.5">
    <span className="font-semibold text-foreground w-16 text-right">{hit.planet}</span>
    <span className="text-[9px] text-muted-foreground w-20">{hit.sign}{hit.house ? ` / H${hit.house}` : ''}</span>
    <span className={`flex-1 ${TONE_COLORS[hit.tone]}`}>{hit.role}</span>
  </div>
);

const HouseCard = ({ house }: { house: DomainHouseSnapshot }) => (
  <div className="p-3 border border-border/50 rounded-sm space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-foreground">{house.label}</span>
      {house.sign && <span className="text-[10px] text-muted-foreground">{house.sign} cusp</span>}
    </div>
    {house.planets.length > 0 ? (
      <div className="flex gap-1.5 flex-wrap">
        {house.planets.map(p => (
          <span key={p} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">{p}</span>
        ))}
      </div>
    ) : (
      <p className="text-[10px] text-muted-foreground italic">No planets — quiet zone</p>
    )}
    <p className="text-[10px] text-muted-foreground leading-relaxed">{house.interpretation}</p>
  </div>
);

const DomainCard = ({ domain }: { domain: DomainDeepDive }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border border-border rounded-sm overflow-hidden ${TONE_BG[domain.tone]}`}>
      {/* Header */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{domain.emoji}</span>
            <h4 className="text-sm font-semibold text-foreground">{domain.title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium ${TONE_COLORS[domain.tone]}`}>
              {TONE_LABELS[domain.tone]}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-3 rounded-[1px] ${
                    i < domain.activityLevel
                      ? domain.tone === 'supportive' ? 'bg-emerald-500'
                        : domain.tone === 'challenging' ? 'bg-orange-500'
                        : domain.tone === 'transformative' ? 'bg-purple-500'
                        : 'bg-amber-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-[13px] font-medium text-foreground">{domain.synthesis.headline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{domain.synthesis.paragraph}</p>

        {/* Practical advice */}
        <div className="space-y-1 pt-1">
          {domain.synthesis.practicalAdvice.map((a, i) => (
            <div key={i} className="flex gap-2 text-[11px]">
              <span className="text-primary flex-shrink-0">→</span>
              <span className="text-foreground">{a}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors pt-1"
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {open ? 'Hide' : 'Show'} house breakdown & planet details
        </button>
      </div>

      {/* Expandable detail */}
      {open && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {/* Houses */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">House Breakdown</p>
            <div className="grid gap-2">
              {domain.houses.map(h => <HouseCard key={h.houseNumber} house={h} />)}
            </div>
          </div>

          {/* Key planets */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Planets</p>
            <div className="divide-y divide-border/30">
              {domain.keyPlanets.map((hit, i) => <HitBadge key={i} hit={hit} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DomainDeepDiveCards = ({ domains }: Props) => (
  <div className="space-y-4">
    <div className="border-b border-border pb-3">
      <h3 className="text-base font-semibold text-foreground">Life Area Deep Dives</h3>
      <p className="text-[11px] text-muted-foreground mt-1">
        Each card synthesizes multiple houses to show the full picture for that life area — not just one house in isolation.
      </p>
    </div>
    {domains.map(d => <DomainCard key={d.id} domain={d} />)}
  </div>
);
