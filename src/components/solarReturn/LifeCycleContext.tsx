import { useMemo } from 'react';
import { Orbit } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import {
  computeLunarPhaseTimeline,
  TimelineEntry,
} from '@/lib/solarReturnLunarTimeline';

const PHASE_ICONS: Record<string, string> = {
  'New Moon': '🌑', 'Crescent': '🌒', 'First Quarter': '🌓', 'Gibbous': '🌔',
  'Full Moon': '🌕', 'Disseminating': '🌖', 'Last Quarter': '🌗', 'Balsamic': '🌘',
};

const DEVELOPMENTAL_MESSAGES: Record<string, string> = {
  'Beginning': 'You are at the start of a new chapter. This is the time to initiate, experiment, and trust the impulse to begin — even without a complete plan. What you plant now grows for years.',
  'Growth': 'You are building on something that started recently. Momentum is gathering but resistance is real. Keep pushing — the effort you invest now creates the traction for everything that follows.',
  'Action': 'You are at a decision point. External pressure is forcing you to commit, choose, or take a stand. This is not comfortable, but the tension is productive — it moves your life forward.',
  'Refinement': 'You are in the final preparation stage before results become visible. Adjust, improve, and perfect what you\'ve been developing. The big reveal is close.',
  'Culmination': 'You are at a peak. What you\'ve been building reaches its fullest expression. Relationships mirror your growth back to you. This is a year of results, visibility, and harvest.',
  'Sharing': 'You are distributing what you\'ve gathered. Your experience, knowledge, and creations are ready to benefit others. This is a generous, socially engaged year.',
  'Reevaluation': 'You are questioning what no longer fits. Structures, beliefs, and commitments that served you before may need to be released or fundamentally rebuilt.',
  'Completion': 'You are near the end of a larger cycle. This is a year to complete, release, and listen inwardly rather than forcing the next chapter before it is ready.',
};

function findNearest(entries: TimelineEntry[], currentYear: number, phase: string, direction: 'before' | 'after'): TimelineEntry | null {
  const filtered = entries.filter(e => e.phase === phase && (direction === 'before' ? e.year < currentYear : e.year > currentYear));
  if (filtered.length === 0) return null;
  return direction === 'before' ? filtered[filtered.length - 1] : filtered[0];
}

interface Props {
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export function LifeCycleContext({ natalChart, srChart }: Props) {
  const timeline = useMemo(() => {
    const sun = natalChart.planets.Sun;
    if (!sun) return [];
    return computeLunarPhaseTimeline(sun.sign, sun.degree, sun.minutes, natalChart.birthDate, srChart.solarReturnYear);
  }, [natalChart, srChart.solarReturnYear]);

  const currentEntry = timeline.find(e => e.isCurrent);
  if (!currentEntry || timeline.length === 0) return null;

  const cy = currentEntry.year;

  // Find similar phase years (same phase, before and after)
  const prevSimilar = findNearest(timeline, cy, currentEntry.phase, 'before');
  const nextSimilar = findNearest(timeline, cy, currentEntry.phase, 'after');

  // Find milestone years
  const prevNewMoon = findNearest(timeline, cy, 'New Moon', 'before');
  const nextNewMoon = findNearest(timeline, cy, 'New Moon', 'after');
  const prevFullMoon = findNearest(timeline, cy, 'Full Moon', 'before');
  const nextFullMoon = findNearest(timeline, cy, 'Full Moon', 'after');
  const prevBalsamic = findNearest(timeline, cy, 'Balsamic', 'before');
  const nextBalsamic = findNearest(timeline, cy, 'Balsamic', 'after');

  const devMessage = DEVELOPMENTAL_MESSAGES[currentEntry.cycleStage] || '';

  const formatYearAge = (entry: TimelineEntry | null) =>
    entry ? `${entry.year} (age ${entry.age})` : '—';

  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/30 px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Orbit className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Life-Cycle Context</h3>
            <p className="text-xs text-muted-foreground">
              {PHASE_ICONS[currentEntry.phase] || '☽'} {currentEntry.phase} — {currentEntry.cycleStage}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Where You Are Now — with highlighted current year */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Where You Are Now</p>
          <div className="bg-primary/5 border border-primary/10 rounded-sm p-3 mb-2">
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="text-primary">{PHASE_ICONS[currentEntry.phase] || '☽'} {currentEntry.year} — Age {currentEntry.age} — {currentEntry.phase}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This is your current position in the cycle, emphasizing {currentEntry.cycleStage.toLowerCase()}. You are in the {
                currentEntry.waxingOrWaning === 'waxing' ? 'building half' : 'releasing half'
              } of the cycle.
            </p>
          </div>
        </div>

        {/* Related Years */}
        {(prevSimilar || nextSimilar) && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Related Years</p>
            <p className="text-sm text-foreground leading-relaxed">
              Years with a similar developmental tone ({currentEntry.cycleStage.toLowerCase()}):
              {prevSimilar && <> previously in <strong>{formatYearAge(prevSimilar)}</strong></>}
              {prevSimilar && nextSimilar && ', and'}
              {nextSimilar && <> next in <strong>{formatYearAge(nextSimilar)}</strong></>}.
              {prevSimilar && <> Reflect on what was happening at age {prevSimilar.age} — similar themes are cycling back at a higher level.</>}
            </p>
          </div>
        )}

        {/* Cycle Milestones */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Cycle Milestones</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-muted/30 rounded-sm p-2.5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">🌑 New Beginning</p>
              <p className="text-xs text-foreground">
                Last: {formatYearAge(prevNewMoon)}
              </p>
              <p className="text-xs text-foreground">
                Next: {formatYearAge(nextNewMoon)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-sm p-2.5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">🌕 Culmination</p>
              <p className="text-xs text-foreground">
                Last: {formatYearAge(prevFullMoon)}
              </p>
              <p className="text-xs text-foreground">
                Next: {formatYearAge(nextFullMoon)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-sm p-2.5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">🌘 Completion</p>
              <p className="text-xs text-foreground">
                Last: {formatYearAge(prevBalsamic)}
              </p>
              <p className="text-xs text-foreground">
                Next: {formatYearAge(nextBalsamic)}
              </p>
            </div>
          </div>
        </div>

        {/* Developmental Message */}
        <div className="border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-widest text-primary mb-1.5">What This Means For You</p>
          <p className="text-sm font-serif text-foreground leading-relaxed italic">
            {devMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
