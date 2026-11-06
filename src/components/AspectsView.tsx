import { useMemo, useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from '@/components/ChartSelector';
import { computeRankedAspects, ASPECT_SYMBOLS, AspectName } from '@/lib/aspectRanking';
import { buildAspectCopy } from '@/lib/aspectPersonalization';
import { Button } from '@/components/ui/button';
import { chartForHouseReading } from '@/lib/chartSignificance/cuspSensitivityRecord';

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

type Filter = 'all' | AspectName;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'conjunction', label: `${ASPECT_SYMBOLS.conjunction} Conjunction` },
  { key: 'opposition', label: `${ASPECT_SYMBOLS.opposition} Opposition` },
  { key: 'trine', label: `${ASPECT_SYMBOLS.trine} Trine` },
  { key: 'square', label: `${ASPECT_SYMBOLS.square} Square` },
  { key: 'sextile', label: `${ASPECT_SYMBOLS.sextile} Sextile` },
  { key: 'quincunx', label: `${ASPECT_SYMBOLS.quincunx} Quincunx` },
  { key: 'semisextile', label: `${ASPECT_SYMBOLS.semisextile} Semi-sextile` },
];

export function AspectsView({ userNatalChart, savedCharts }: Props) {
  const [selectedChartId, setSelectedChartId] = useState<string>(userNatalChart ? 'user' : '');
  const [filter, setFilter] = useState<Filter>('all');

  const selectedChart: NatalChart | null = useMemo(() => {
    if (selectedChartId === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartId) || null;
  }, [selectedChartId, userNatalChart, savedCharts]);

  const aspects = useMemo(() => {
    if (!selectedChart) return [];
    return computeRankedAspects(chartForHouseReading(selectedChart));
  }, [selectedChart]);

  const filtered = useMemo(
    () => filter === 'all' ? aspects : aspects.filter(a => a.aspect === filter),
    [aspects, filter],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-light tracking-widest text-foreground">
          Personalized Aspects
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
          {selectedChart?.name || 'Natal chart'}: measured contacts, strongest first. Wide contacts carry less weight. Sign relationships and degree-based aspects are separate facts.
        </p>
      </div>

      <ChartSelector
        userNatalChart={userNatalChart}
        savedCharts={savedCharts}
        selectedChartId={selectedChartId}
        onSelect={setSelectedChartId}
        label="Chart"
      />

      {!selectedChart && (
        <p className="text-sm text-muted-foreground py-8 text-center">Select a chart above.</p>
      )}

      {selectedChart && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => {
              const count = f.key === 'all'
                ? aspects.length
                : aspects.filter(a => a.aspect === f.key).length;
              return (
                <Button variant="outline" size="sm"
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${
                    filter === f.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {f.label} <span className="opacity-60">({count})</span>
                </Button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No aspects of this type in this chart within orb.</p>
          )}

          <div className="space-y-4">
            {filtered.map((ra, idx) => {
              const copy = buildAspectCopy(ra);
              return (
                <div
                  key={`${ra.a}-${ra.b}-${ra.aspect}-${idx}`}
                  className="border border-border rounded-sm p-5 bg-background space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        #{idx + 1}
                      </div>
                      <div className="font-serif text-base text-foreground leading-snug">
                        {copy.headline}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {copy.subline}
                      </div>
                    </div>
                    {ra.dissociate && (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-sm whitespace-nowrap">
                        Dissociate
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/90 italic leading-relaxed">
                    {copy.mechanic}
                  </p>

                  <p className="text-sm text-foreground leading-relaxed">
                    {copy.felt}
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-sm text-foreground">{copy.examples.map(line => <li key={line}>{line}</li>)}</ul>
                  <details className="border-t border-border pt-3"><summary className="cursor-pointer text-xs text-primary">Where this can strain</summary><p className="mt-2 text-sm text-muted-foreground">{copy.watchFor}</p></details>
                  <p className="text-xs text-muted-foreground">{copy.evidenceNote}</p>

                  {copy.dissociate && (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/5 border-l-2 border-amber-500/40 pl-3 py-2 leading-relaxed">
                      <span className="font-medium uppercase tracking-widest text-[10px] block mb-1">Signs versus measured degrees</span>
                      {copy.dissociate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
