import { useEffect, useMemo, useRef, useState } from 'react';
import type { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from './ChartSelector';
import { buildReadingGuide, type ReadingGuide } from '@/lib/readingGuide/readingGuideEngine';
import { STAGE_LABELS, type AgeStage } from '@/lib/readingGuide/ageContext';
import { buildSelectableCharts, resolveSelectedChart } from '@/lib/charts/chartSelection';
import { formatDateMMDDYYYY } from '@/lib/localDate';
import { downloadSectionJson } from '@/lib/sectionExport';
import { Button } from '@/components/ui/button';
import { PractitionerWalkthroughSections } from '@/components/PractitionerWalkthroughSections';
import { Compass, Download } from 'lucide-react';

interface ReadingGuideViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const ReadingGuideView = ({ userNatalChart, savedCharts }: ReadingGuideViewProps) => {
  const allCharts = useMemo(
    () => buildSelectableCharts(userNatalChart, savedCharts),
    [userNatalChart, savedCharts]
  );
  const [selectedChartId, setSelectedChartId] = useState<string>(() => allCharts[0]?.id ?? '');
  const [stageOverride, setStageOverride] = useState<AgeStage | null>(null);
  const knownIdsRef = useRef<string[] | null>(null);

  useEffect(() => {
    const ids = allCharts.map((chart) => chart.id).filter(Boolean);
    const previous = knownIdsRef.current;
    knownIdsRef.current = ids;
    if (!ids.length) {
      if (selectedChartId) setSelectedChartId('');
      return;
    }
    const added = previous ? ids.filter((id) => !previous.includes(id)) : [];
    if (previous && added.length === 1) {
      setSelectedChartId(added[0]);
      setStageOverride(null);
      return;
    }
    if (!selectedChartId || !ids.includes(selectedChartId)) {
      setSelectedChartId(ids[0]);
      setStageOverride(null);
    }
  }, [allCharts, selectedChartId]);

  const selectedChart = useMemo(
    () => resolveSelectedChart(allCharts, selectedChartId),
    [allCharts, selectedChartId]
  );

  const selectChart = (id: string) => {
    const nextId = id === 'user' ? (userNatalChart?.id || '') : id;
    setSelectedChartId(nextId);
    setStageOverride(null);
  };

  const guide: ReadingGuide | null = useMemo(
    () => (selectedChart ? buildReadingGuide(selectedChart, { stageOverride }) : null),
    [selectedChart, stageOverride]
  );

  if (!allCharts.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Compass size={48} className="mx-auto mb-4 opacity-30" />
        <p>Add a natal chart first to use the Chart Walkthrough.</p>
      </div>
    );
  }
  if (!guide || !selectedChart) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {allCharts.length > 1 && (
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedChartId === userNatalChart?.id ? 'user' : selectedChartId}
          onSelect={selectChart}
          label="Select Chart"
        />
      )}

      {/* Header + age context */}
      <div className="border-b border-border pb-5 space-y-3">
        <div className="flex flex-wrap items-start gap-3">
          <Compass size={24} className="text-primary mt-0.5" />
          <div className="min-w-0">
            <h2 className="text-xl font-serif tracking-wide text-foreground">{guide.subject.name}: Chart Walkthrough</h2>
            <p className="text-xs text-muted-foreground">
              {guide.subject.birthDate ? formatDateMMDDYYYY(guide.subject.birthDate) : ''}
              {guide.subject.birthTime ? ` at ${guide.subject.birthTime}` : ''}
              {guide.subject.birthLocation ? ` • ${guide.subject.birthLocation}` : ''}
            </p>
          </div>
          <Button
            onClick={() =>
              downloadSectionJson(
                `${guide.subject.name || 'chart'} Chart Walkthrough`,
                {
                  exportedAt: new Date().toISOString(),
                  subject: guide.subject,
                  ageContext: guide.age,
                  schemaVersion: 2,
                  placements: guide.placements,
                  walkthrough: guide.practitioner,
                },
              )
            }
            title="Download this walkthrough as a JSON data file"
            variant="outline" size="sm" className="ml-auto shrink-0 text-xs"
          >
            <Download size={13} />
            Download JSON
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Reading level{guide.age.years != null ? ` · age ${guide.age.years}` : ''}:
          </span>
          {(['child', 'teen', 'adult'] as AgeStage[]).map((s) => (
            <Button
              variant="outline" size="sm" aria-pressed={guide.age.stage === s}
              key={s}
              onClick={() => setStageOverride(stageOverride === s ? null : s)}
              className={`rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-widest transition-colors ${
                guide.age.stage === s
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {STAGE_LABELS[s]}
            </Button>
          ))}
          <span className="text-[10px] text-muted-foreground">
            {guide.age.source === 'override' ? 'manual override' : 'from birth date'}
          </span>
        </div>
      </div>

      <PractitionerWalkthroughSections reading={guide.practitioner} />
    </div>
  );
};
