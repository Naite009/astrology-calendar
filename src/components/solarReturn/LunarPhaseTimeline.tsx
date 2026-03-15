import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import {
  computeLunarPhaseTimeline,
  detectTimelinePatterns,
  generateTimelineSummary,
  generateTransitionNarrative,
  TimelineEntry,
} from '@/lib/solarReturnLunarTimeline';
import { getMoonPhaseBlending } from '@/lib/solarReturnMoonData';

// ── Color mapping for phase stages ──────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  beginning: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  growth: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  action: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  refinement: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  culmination: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  sharing: 'bg-accent/20 text-accent-foreground border-accent/30',
  reevaluation: 'bg-secondary/30 text-secondary-foreground border-secondary/40',
  completion: 'bg-muted/40 text-muted-foreground border-muted-foreground/20',
};

const PHASE_DOT_COLORS: Record<string, string> = {
  beginning: 'bg-chart-1',
  growth: 'bg-chart-2',
  action: 'bg-chart-3',
  refinement: 'bg-chart-4',
  culmination: 'bg-chart-5',
  sharing: 'bg-accent',
  reevaluation: 'bg-secondary',
  completion: 'bg-muted-foreground',
};

const PHASE_ICONS: Record<string, string> = {
  'New Moon': '🌑',
  'Crescent': '🌒',
  'First Quarter': '🌓',
  'Gibbous': '🌔',
  'Full Moon': '🌕',
  'Disseminating': '🌖',
  'Last Quarter': '🌗',
  'Balsamic': '🌘',
};

interface Props {
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

/** Balsamic "Ending & Emerging" detail panel */
function BalsamicDetailPanel({ entry }: { entry: TimelineEntry }) {
  // Use the blending engine for sign-level releasing/emerging narratives
  // We don't have house data for computed years, so pass null
  const blending = getMoonPhaseBlending(
    'Balsamic',
    entry.moonSign,
    entry.sunSign,
    null,
    null,
  );

  const isBridge = entry.moonSign !== entry.sunSign;

  return (
    <div className="space-y-3 pt-2 border-t border-border/50">
      <p className="text-[10px] uppercase tracking-widest font-medium text-primary">
        What Is Ending and What Is Emerging
      </p>

      {isBridge && (
        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
          This year bridges two different psychological territories — a threshold year where one completed chapter dissolves while another quietly forms.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Releasing */}
        <div className="bg-secondary/20 rounded-sm p-2.5 space-y-1">
          <p className="text-[9px] uppercase tracking-widest font-medium text-muted-foreground">
            Releasing · {entry.moonSign} ☽
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {blending.releasing}
          </p>
          <p className="text-[10px] text-muted-foreground/70 italic mt-1">
            The Moon sign describes the psychological style, identity, or emotional pattern that is dissolving.
          </p>
        </div>

        {/* Emerging */}
        <div className="bg-accent/20 rounded-sm p-2.5 space-y-1">
          <p className="text-[9px] uppercase tracking-widest font-medium text-muted-foreground">
            Emerging · {entry.sunSign} ☉
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {blending.emerging}
          </p>
          <p className="text-[10px] text-muted-foreground/70 italic mt-1">
            The Sun sign describes the spiritual orientation and inner calling quietly forming.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        This is not a year to force momentum. It is a year to trust release, inner work, and preparation for the next cycle.
      </p>
    </div>
  );
}

export function LunarPhaseTimeline({ natalChart, srChart }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const timeline = useMemo(() => {
    const sun = natalChart.planets.Sun;
    if (!sun) return [];
    return computeLunarPhaseTimeline(
      sun.sign,
      sun.degree,
      sun.minutes,
      natalChart.birthDate,
      srChart.solarReturnYear,
    );
  }, [natalChart, srChart.solarReturnYear]);

  const patterns = useMemo(() => detectTimelinePatterns(timeline), [timeline]);
  const summary = useMemo(() => generateTimelineSummary(timeline, srChart.solarReturnYear), [timeline, srChart.solarReturnYear]);

  const currentEntry = timeline.find(e => e.isCurrent);
  const currentIdx = timeline.findIndex(e => e.isCurrent);
  const prevEntry = currentIdx > 0 ? timeline[currentIdx - 1] : undefined;
  const transition = currentEntry ? generateTransitionNarrative(prevEntry, currentEntry) : '';

  // Show a compact window around current year unless expanded
  const visibleEntries = expanded
    ? timeline
    : timeline.filter(e => Math.abs(e.year - srChart.solarReturnYear) <= 5);

  const detailEntry = selectedYear !== null
    ? timeline.find(e => e.year === selectedYear)
    : null; // Don't auto-select current — it already has the highlight card

  if (timeline.length === 0) return null;

  return (
    <div className="border border-border rounded-sm bg-muted/10 space-y-4">
      {/* Header */}
      <div className="p-4 pb-0">
        <p className="text-[10px] uppercase tracking-widest font-medium text-primary">
          29-Year Lunar Phase Timeline
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Current Phase Highlight */}
      {currentEntry && (
        <div className="mx-4 p-3 border border-primary/20 rounded-sm bg-primary/5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{PHASE_ICONS[currentEntry.phase] || '☽'}</span>
            <div>
              <p className="text-sm font-serif text-foreground">
                {currentEntry.year} — {currentEntry.phase}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-primary font-medium">
                {currentEntry.cycleStage} · Age {currentEntry.age}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{currentEntry.shortMeaning}</p>
          {transition && (
            <p className="text-xs text-muted-foreground/80 italic leading-relaxed">{transition}</p>
          )}
          {/* Balsamic special panel for current year */}
          {currentEntry.phase === 'Balsamic' && (
            <BalsamicDetailPanel entry={currentEntry} />
          )}
        </div>
      )}

      {/* Visual Timeline Strip */}
      <div className="px-4">
        <div className="flex items-center gap-[2px] overflow-x-auto py-2 scrollbar-thin">
          {visibleEntries.map((entry) => {
            const dotColor = PHASE_DOT_COLORS[entry.colorLabel] || 'bg-muted-foreground';
            const isSelected = selectedYear === entry.year;
            const isCurr = entry.isCurrent;
            return (
              <button
                key={entry.year}
                onClick={() => setSelectedYear(isSelected ? null : entry.year)}
                className={`
                  flex flex-col items-center gap-1 px-1 py-1 rounded-sm transition-all min-w-[32px]
                  ${isCurr ? 'ring-1 ring-primary bg-primary/10' : ''}
                  ${isSelected ? 'bg-accent/20' : 'hover:bg-muted/30'}
                  ${entry.isMajorTransition ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                `}
                title={`${entry.year} — ${entry.phase} (${entry.cycleStage})`}
              >
                <span className="text-[9px] text-muted-foreground">{entry.year.toString().slice(2)}</span>
                <span className={`w-3 h-3 rounded-full ${dotColor} ${isCurr ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`} />
                {entry.isMajorTransition && (
                  <Sparkles className="w-2 h-2 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Show fewer years' : `Show all ${timeline.length} years`}
        </button>
      </div>

      {/* Detail Card for Selected Year */}
      {detailEntry && (
        <div className={`mx-4 p-3 rounded-sm border space-y-2 ${PHASE_COLORS[detailEntry.colorLabel] || 'bg-muted/20 border-border'}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{PHASE_ICONS[detailEntry.phase] || '☽'}</span>
            <div>
              <p className="text-sm font-serif">{detailEntry.year} — {detailEntry.phase}</p>
              <p className="text-[10px] uppercase tracking-widest font-medium">
                {detailEntry.cycleStage} · Age {detailEntry.age}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed">{detailEntry.shortMeaning}</p>
          <div className="flex items-center gap-2 text-[10px]">
            <span>☽ {detailEntry.moonSign}</span>
            <ArrowRight className="w-3 h-3" />
            <span>☉ {detailEntry.sunSign}</span>
            <span className="ml-auto opacity-60">{detailEntry.phaseAngle}°</span>
          </div>
          {detailEntry.patternTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {detailEntry.patternTags.map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-background/50 border border-border/50">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Balsamic Ending/Emerging panel for any clicked Balsamic year */}
          {detailEntry.phase === 'Balsamic' && (
            <BalsamicDetailPanel entry={detailEntry} />
          )}
        </div>
      )}

      {/* Pattern Detection Panel — All 8 phases */}
      <div className="px-4 pb-4 space-y-3">
        <p className="text-[10px] uppercase tracking-widest font-medium text-primary">Recurring Patterns — Every Year Since Birth</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'New Beginnings', years: patterns.newCycleYears, bg: 'bg-chart-1/10', text: 'text-chart-1' },
            { label: 'Growth Years', years: patterns.crescentYears, bg: 'bg-chart-2/10', text: 'text-chart-2' },
            { label: 'Action & Decision', years: patterns.actionYears, bg: 'bg-chart-3/10', text: 'text-chart-3' },
            { label: 'Refinement', years: patterns.refinementYears, bg: 'bg-chart-4/10', text: 'text-chart-4' },
            { label: 'Culmination', years: patterns.culminationYears, bg: 'bg-chart-5/10', text: 'text-chart-5' },
            { label: 'Sharing & Teaching', years: patterns.sharingYears, bg: 'bg-accent/10', text: 'text-accent-foreground' },
            { label: 'Reevaluation', years: patterns.turningPointYears, bg: 'bg-secondary/20', text: 'text-secondary-foreground' },
            { label: 'Release & Completion', years: patterns.releaseYears, bg: 'bg-muted/30', text: 'text-muted-foreground' },
          ].filter(p => p.years.length > 0).map(p => (
            <div key={p.label} className={`${p.bg} rounded-sm p-2 space-y-1`}>
              <p className={`text-[9px] uppercase tracking-widest font-medium ${p.text}`}>{p.label}</p>
              <p className="text-xs text-foreground">{p.years.join(', ')}</p>
            </div>
          ))}
        </div>

        {/* Phase Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 border-t border-border">
          {[
            { label: 'Beginning', color: 'bg-chart-1' },
            { label: 'Growth', color: 'bg-chart-2' },
            { label: 'Action', color: 'bg-chart-3' },
            { label: 'Refinement', color: 'bg-chart-4' },
            { label: 'Culmination', color: 'bg-chart-5' },
            { label: 'Sharing', color: 'bg-accent' },
            { label: 'Reevaluation', color: 'bg-secondary' },
            { label: 'Completion', color: 'bg-muted-foreground' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              <span className="text-[9px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
