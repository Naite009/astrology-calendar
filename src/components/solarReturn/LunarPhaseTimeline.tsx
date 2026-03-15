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
import { getMoonPhaseBlending, srMoonPhaseInterp } from '@/lib/solarReturnMoonData';

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

      {/* Lunar Phase of the Year — Clean Card */}
      {currentEntry && (() => {
        const PHASE_ORDER = ['New Moon', 'Crescent', 'First Quarter', 'Gibbous', 'Full Moon', 'Disseminating', 'Last Quarter', 'Balsamic'];
        const phaseNum = PHASE_ORDER.indexOf(currentEntry.phase) + 1;
        const futureEntries = timeline.filter(e => e.year > currentEntry.year && e.phase !== currentEntry.phase);
        const nextShiftEntry = futureEntries.length > 0 ? futureEntries[0] : null;
        const yearsUntilNext = nextShiftEntry ? nextShiftEntry.year - currentEntry.year : null;

        const blending = getMoonPhaseBlending(
          currentEntry.phase,
          currentEntry.moonSign,
          currentEntry.sunSign,
          null,
          null,
        );

        return (
        <div className="mx-4 border border-primary/20 rounded-sm bg-card overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">{PHASE_ICONS[currentEntry.phase] || '☽'}</span>
              <div>
                <p className="text-sm font-serif text-foreground">
                  Lunar Phase of the Year
                </p>
                <p className="text-xs text-primary font-medium">
                  {currentEntry.phase} — {currentEntry.cycleStage}
                  <span className="ml-2 text-muted-foreground font-normal">Phase {phaseNum} of 8</span>
                </p>
              </div>
            </div>
            {yearsUntilNext !== null && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {yearsUntilNext === 1 ? 'Next phase shift in 1 year' : `Next phase shift in ${yearsUntilNext} years`}
                {nextShiftEntry && ` → ${nextShiftEntry.cycleStage}`}
              </p>
            )}
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-4">
            {/* Overview */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Overview</p>
              <p className="text-xs text-foreground leading-relaxed">{currentEntry.shortMeaning}</p>
              {transition && (
                <p className="text-xs text-muted-foreground/80 italic leading-relaxed mt-1">{transition}</p>
              )}
            </div>

            {/* What is completing */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What Is Completing</p>
              <p className="text-xs text-foreground leading-relaxed">
                Your {currentEntry.moonSign} Moon points to what is being released this year: {blending.releasing}. These patterns have served their purpose and are naturally dissolving.
              </p>
            </div>

            {/* What is emerging */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What Is Emerging</p>
              <p className="text-xs text-foreground leading-relaxed">
                Your {currentEntry.sunSign} Sun reveals the deeper direction forming: {blending.emerging}. This may feel subtle now but will become clearer in the years ahead.
              </p>
            </div>

            {/* Theme of the year */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Theme of the Year</p>
              <p className="text-xs text-foreground leading-relaxed">
                {blending.themeLabel}. The {currentEntry.cycleStage.toLowerCase()} stage of the lunar cycle means this year is about {
                  currentEntry.cycleStage === 'Beginning' ? 'planting new seeds and trusting fresh instincts — even when you can\'t see the outcome yet' :
                  currentEntry.cycleStage === 'Growth' ? 'pushing through early resistance and building momentum — the effort is real but so is the traction' :
                  currentEntry.cycleStage === 'Action' ? 'making decisive moves and committing to a path — hesitation costs more than imperfection' :
                  currentEntry.cycleStage === 'Refinement' ? 'fine-tuning what\'s almost ready — small adjustments now prevent bigger corrections later' :
                  currentEntry.cycleStage === 'Culmination' ? 'harvesting what you\'ve built — results become visible and relationships reach turning points' :
                  currentEntry.cycleStage === 'Sharing' ? 'teaching and giving back — what you\'ve learned becomes valuable to others' :
                  currentEntry.cycleStage === 'Reevaluation' ? 'questioning what no longer works — old structures need to be released or rebuilt' :
                  'releasing and resting — this is preparation, not failure. The next beginning is forming in the quiet'
                }.
              </p>
            </div>

            {/* Expandable Learn More */}
            {(() => {
              const phaseInterpKeys: Record<string, string> = {
                'New Moon': 'New Moon', 'Crescent': 'Waxing Crescent', 'First Quarter': 'First Quarter',
                'Gibbous': 'Waxing Gibbous', 'Full Moon': 'Full Moon', 'Disseminating': 'Waning Gibbous',
                'Last Quarter': 'Last Quarter', 'Balsamic': 'Waning Crescent',
              };
              const deepInterp = srMoonPhaseInterp[phaseInterpKeys[currentEntry.phase] || currentEntry.phase];
              if (!deepInterp) return null;
              return (
                <details className="pt-2 border-t border-border/50">
                  <summary className="text-[10px] uppercase tracking-widest text-primary cursor-pointer hover:text-primary/80 transition-colors">
                    Learn more about the {currentEntry.phase} phase
                  </summary>
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{deepInterp.theme}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{deepInterp.description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-secondary/20 rounded-sm p-2">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Moon Sign: {currentEntry.moonSign}</p>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          The Moon sign describes the emotional style active during this phase — specifically: {blending.releasing}.
                        </p>
                      </div>
                      <div className="bg-accent/10 rounded-sm p-2">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Sun Sign: {currentEntry.sunSign}</p>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          The Sun sign describes the spiritual orientation — specifically: {blending.emerging}.
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 italic">
                      Phase angle: {currentEntry.phaseAngle}° · {currentEntry.waxingOrWaning === 'waxing' ? 'Waxing (building energy)' : 'Waning (releasing energy)'}
                    </p>
                  </div>
                </details>
              );
            })()}
          </div>
        </div>
        );
      })()}

      {/* Universal Phase Sequence Legend */}
      <div className="mx-4 p-3 bg-secondary/20 rounded-sm">
        <p className="text-[9px] uppercase tracking-widest font-medium text-muted-foreground mb-2">
          Universal Cycle Order — Every Life Follows This Sequence
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
          {[
            { icon: '🌑', num: 1, phase: 'New Moon', stage: 'Beginning' },
            { icon: '🌒', num: 2, phase: 'Crescent', stage: 'Growth' },
            { icon: '🌓', num: 3, phase: '1st Quarter', stage: 'Action' },
            { icon: '🌔', num: 4, phase: 'Gibbous', stage: 'Refinement' },
            { icon: '🌕', num: 5, phase: 'Full Moon', stage: 'Culmination' },
            { icon: '🌖', num: 6, phase: 'Disseminating', stage: 'Sharing' },
            { icon: '🌗', num: 7, phase: 'Last Quarter', stage: 'Reevaluation' },
            { icon: '🌘', num: 8, phase: 'Balsamic', stage: 'Completion' },
          ].map(p => {
            const isCurrent = currentEntry?.phase === (p.num === 3 ? 'First Quarter' : p.phase);
            return (
              <div key={p.num} className={`flex flex-col items-center text-center p-1.5 rounded-sm ${isCurrent ? 'bg-primary/10 ring-1 ring-primary' : ''}`}>
                <span className="text-sm">{p.icon}</span>
                <span className={`text-[8px] font-bold mt-0.5 ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{p.num}. {p.stage}</span>
                <span className="text-[7px] text-muted-foreground leading-tight">{p.phase}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
          Each phase lasts ~3.5 years. The full cycle repeats every ~29.5 years. Your starting point is determined by your natal Sun–Moon angle.
        </p>
      </div>

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
                title={`${entry.year} — ${entry.phase} (${entry.cycleStage}) · ${entry.phaseAngle}°`}
              >
                <span className="text-[9px] text-muted-foreground">{entry.year}</span>
                <span className="text-sm leading-none">{PHASE_ICONS[entry.phase] || '☽'}</span>
                <span className="text-[7px] text-muted-foreground/60">{entry.phaseAngle}°</span>
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

      {/* Detail Card for Selected Year — Full Phase Card */}
      {detailEntry && (() => {
        const PHASE_ORDER = ['New Moon', 'Crescent', 'First Quarter', 'Gibbous', 'Full Moon', 'Disseminating', 'Last Quarter', 'Balsamic'];
        const phaseNum = PHASE_ORDER.indexOf(detailEntry.phase) + 1;
        const blending = getMoonPhaseBlending(detailEntry.phase, detailEntry.moonSign, detailEntry.sunSign, null, null);

        // Map phase names to srMoonPhaseInterp keys
        const phaseInterpKeys: Record<string, string> = {
          'New Moon': 'New Moon', 'Crescent': 'Waxing Crescent', 'First Quarter': 'First Quarter',
          'Gibbous': 'Waxing Gibbous', 'Full Moon': 'Full Moon', 'Disseminating': 'Waning Gibbous',
          'Last Quarter': 'Last Quarter', 'Balsamic': 'Waning Crescent',
        };
        const deepInterp = srMoonPhaseInterp[phaseInterpKeys[detailEntry.phase] || detailEntry.phase];

        return (
          <div className="mx-4 border border-border rounded-sm bg-card overflow-hidden">
            {/* Header */}
            <div className={`px-4 py-3 border-b border-border/50 ${PHASE_COLORS[detailEntry.colorLabel] || 'bg-muted/20'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{PHASE_ICONS[detailEntry.phase] || '☽'}</span>
                <div>
                  <p className="text-sm font-serif text-foreground">
                    {detailEntry.year} — {detailEntry.phase}
                  </p>
                  <p className="text-xs font-medium">
                    {detailEntry.cycleStage} · Age {detailEntry.age}
                    <span className="ml-2 text-muted-foreground font-normal">Phase {phaseNum} of 8</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Overview</p>
                <p className="text-xs text-foreground leading-relaxed">{detailEntry.shortMeaning}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What Is Completing</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Your {detailEntry.moonSign} Moon points to what is being released: {blending.releasing}. These patterns have served their purpose and are naturally dissolving.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What Is Emerging</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Your {detailEntry.sunSign} Sun reveals the deeper direction forming: {blending.emerging}. This may feel subtle now but will become clearer in the years ahead.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Theme of the Year</p>
                <p className="text-xs text-foreground leading-relaxed">
                  {blending.themeLabel}. The {detailEntry.cycleStage.toLowerCase()} stage means this year is about {
                    detailEntry.cycleStage === 'Beginning' ? 'planting new seeds and trusting fresh instincts — even when you can\'t see the outcome yet' :
                    detailEntry.cycleStage === 'Growth' ? 'pushing through early resistance and building momentum — the effort is real but so is the traction' :
                    detailEntry.cycleStage === 'Action' ? 'making decisive moves and committing to a path — hesitation costs more than imperfection' :
                    detailEntry.cycleStage === 'Refinement' ? 'fine-tuning what\'s almost ready — small adjustments now prevent bigger corrections later' :
                    detailEntry.cycleStage === 'Culmination' ? 'harvesting what you\'ve built — results become visible and relationships reach turning points' :
                    detailEntry.cycleStage === 'Sharing' ? 'teaching and giving back — what you\'ve learned becomes valuable to others' :
                    detailEntry.cycleStage === 'Reevaluation' ? 'questioning what no longer works — old structures need to be released or rebuilt' :
                    'releasing and resting — this is preparation, not failure. The next beginning is forming in the quiet'
                  }.
                </p>
              </div>

              {detailEntry.patternTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {detailEntry.patternTags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-muted/50 border border-border/50 text-muted-foreground">
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Expandable Learn More */}
              {deepInterp && (
                <details className="pt-2 border-t border-border/50">
                  <summary className="text-[10px] uppercase tracking-widest text-primary cursor-pointer hover:text-primary/80 transition-colors">
                    Learn more about the {detailEntry.phase} phase
                  </summary>
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{deepInterp.theme}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{deepInterp.description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-secondary/20 rounded-sm p-2">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Moon Sign: {detailEntry.moonSign}</p>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          The Moon sign describes the emotional style and psychological pattern active during this phase — specifically: {blending.releasing}.
                        </p>
                      </div>
                      <div className="bg-accent/10 rounded-sm p-2">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Sun Sign: {detailEntry.sunSign}</p>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          The Sun sign describes the spiritual orientation and life direction — specifically: {blending.emerging}.
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 italic">
                      Phase angle: {detailEntry.phaseAngle}° · {detailEntry.waxingOrWaning === 'waxing' ? 'Waxing (building energy)' : 'Waning (releasing energy)'}
                    </p>
                  </div>
                </details>
              )}
            </div>
          </div>
        );
      })()}

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
