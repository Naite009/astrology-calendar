import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateTransitAlerts, TransitAlert } from '@/lib/transitAlerts';
import { format, addMonths } from 'date-fns';

interface Props {
  chart: NatalChart;
}

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', Ascendant: 'ASC', Midheaven: 'MC',
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: 'bg-primary/20 text-primary',
  opposition: 'bg-destructive/20 text-destructive',
  square: 'bg-destructive/15 text-destructive',
  trine: 'bg-green-500/20 text-green-700 dark:text-green-400',
  sextile: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
};

export function WhatsAheadPanel({ chart }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Scan the next 6 months in 7-day steps, collect outer-planet transits
  const upcomingTransits = useMemo(() => {
    const now = new Date();
    const end = addMonths(now, 6);
    const seen = new Set<string>();
    const results: (TransitAlert & { scanDate: Date })[] = [];

    const OUTER = ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Chiron'];

    for (let d = new Date(now); d <= end; d = new Date(d.getTime() + 7 * 86400000)) {
      const alerts = calculateTransitAlerts(chart, d);
      for (const a of alerts) {
        if (!OUTER.includes(a.transitPlanet)) continue;
        // Deduplicate by transit+natal+aspect
        const key = `${a.transitPlanet}-${a.natalPlanet}-${a.aspectType}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({ ...a, scanDate: d });
      }
    }

    // Sort: outer planets to personal points first, then by date
    const planetWeight: Record<string, number> = { Pluto: 6, Neptune: 5, Uranus: 4, Saturn: 3, Jupiter: 2, Chiron: 1 };
    const targetWeight: Record<string, number> = { Sun: 6, Moon: 5, Ascendant: 4, Mercury: 3, Venus: 2, Mars: 1 };

    return results
      .sort((a, b) => {
        const wA = (planetWeight[a.transitPlanet] || 0) + (targetWeight[a.natalPlanet] || 0);
        const wB = (planetWeight[b.transitPlanet] || 0) + (targetWeight[b.natalPlanet] || 0);
        if (wB !== wA) return wB - wA;
        return (a.exactDate?.getTime() || a.scanDate.getTime()) - (b.exactDate?.getTime() || b.scanDate.getTime());
      })
      .slice(0, 8);
  }, [chart]);

  if (upcomingTransits.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1 text-left">What's Ahead — Next 6 Months</span>
        <Badge variant="secondary" className="text-[10px] mr-2">{upcomingTransits.length} transits</Badge>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {upcomingTransits.map((t, i) => {
          const dateStr = t.exactDate
            ? format(t.exactDate, 'MMM d, yyyy')
            : `~${format(t.scanDate, 'MMM yyyy')}`;
          return (
            <div key={i} className="p-3 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {PLANET_GLYPHS[t.transitPlanet] || t.transitPlanet} {t.aspectSymbol} {PLANET_GLYPHS[t.natalPlanet] || t.natalPlanet}
                  </span>
                  <Badge variant="outline" className={`text-[10px] ${ASPECT_COLORS[t.aspectType] || ''}`}>
                    {t.aspectType}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{dateStr}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.transitPlanet} {t.aspectType} natal {t.natalPlanet} — {t.description}
              </p>
            </div>
          );
        })}
        <p className="text-[10px] text-muted-foreground italic px-1">
          Dates are approximate. Outer planet transits may be active for weeks or months around the exact date.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
