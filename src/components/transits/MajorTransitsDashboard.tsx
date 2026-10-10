import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { NatalChart } from '@/hooks/useNatalChart';
import { computeMajorTransits, type MajorTransit } from '@/lib/transits/majorTransits';

type Horizon = 'now' | '3m' | '12m';
type SortMode = 'importance' | 'date';

const fmt = (d: Date) => format(d, 'MMM d, yyyy');

function TransitRow({ t }: { t: MajorTransit }) {
  return (
    <details className="rounded-sm border border-border bg-background/40 p-3 group">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-base font-medium text-foreground">{t.headline}</div>
            <div className="text-xs text-muted-foreground">
              {t.transitPlanet} now {t.transitPosition} · natal {t.targetLabel} {t.targetPosition} · orb {t.currentOrb.toFixed(2)}°
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Next exact</div>
            <div className="text-sm font-semibold text-primary">{t.nextExact ? fmt(t.nextExact) : 'No further exact pass'}</div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant={t.status === 'Exact' ? 'default' : 'secondary'}>{t.status}</Badge>
          <Badge variant="outline">{t.motion}</Badge>
          {t.isActiveNow && <Badge variant="outline">Active now</Badge>}
          <Badge variant="outline">{t.durationLabel}</Badge>
        </div>
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-relaxed text-foreground">
        <p>
          <span className="font-medium">Exact dates: </span>
          {t.passes.map((p) => `${p.label} ${fmt(p.date)}${p.isPast ? ' (past)' : ''}`).join(' · ')}
        </p>
        <p>
          <span className="font-medium">Active window: </span>
          {fmt(t.windowStart)} to {fmt(t.windowEnd)}{t.windowOpenEnded ? ' or later' : ''}
        </p>
        <p><span className="font-medium">Life area: </span>{t.lifeArea}</p>
        <p><span className="font-medium">What it means: </span>{t.meaning}</p>
        {t.axisNote && <p><span className="font-medium">The other end of the axis: </span>{t.axisNote}</p>}
        <p><span className="font-medium">What you may notice: </span>{t.watchFor}</p>
      </div>
    </details>
  );
}

export function MajorTransitsDashboard({ chart }: { chart: NatalChart | null }) {
  const [horizon, setHorizon] = useState<Horizon>('12m');
  const [sort, setSort] = useState<SortMode>('importance');
  const all = useMemo(() => computeMajorTransits(chart, { horizonDays: 365 }), [chart]);

  const shown = useMemo(() => {
    const now = Date.now();
    const limit = horizon === 'now' ? 0 : horizon === '3m' ? 91 : 365;
    const list = all.filter((t) => t.isActiveNow || (t.nextExact && t.nextExact.getTime() - now <= limit * 86400000));
    if (sort === 'date') {
      return [...list].sort((a, b) => (a.nextExact?.getTime() ?? Infinity) - (b.nextExact?.getTime() ?? Infinity));
    }
    return list;
  }, [all, horizon, sort]);

  if (!chart) return null;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-xl">Major Transits &amp; Exact Dates</CardTitle>
        <p className="text-xs text-muted-foreground">
          Jupiter, Saturn, Uranus, Neptune, and Pluto to {chart.name ? `${chart.name}'s` : 'your'} Sun, Moon, personal planets, and chart angles (ASC, MC, IC, DSC). Dates come from the ephemeris. Tap a row for details.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {(['now', '3m', '12m'] as Horizon[]).map((h) => (
            <Button key={h} size="sm" variant={horizon === h ? 'default' : 'outline'} onClick={() => setHorizon(h)}>
              {h === 'now' ? 'Now' : h === '3m' ? 'Next 3 months' : 'Next 12 months'}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setSort(sort === 'importance' ? 'date' : 'importance')}>
            Sort: {sort === 'importance' ? 'Most important' : 'Next exact date'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {shown.length === 0 && <p className="text-sm text-muted-foreground">No major slow-planet transits in this time range.</p>}
        {shown.map((t) => <TransitRow key={t.id} t={t} />)}
      </CardContent>
    </Card>
  );
}
