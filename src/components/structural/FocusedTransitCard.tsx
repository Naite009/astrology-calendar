import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FocusedTransitWindow } from '@/lib/structuralStressEngine';

interface FocusedTransitCardProps {
  transit: FocusedTransitWindow;
  onClick: (date: Date) => void;
}

const PHASE_COLORS: Record<string, string> = {
  containment: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  stress: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  release: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  trigger: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30'
};

const PHASE_LABELS: Record<string, string> = {
  containment: 'Containment',
  stress: 'Stress',
  release: 'Release',
  trigger: 'Trigger'
};

export const FocusedTransitCard = ({ transit, onClick }: FocusedTransitCardProps) => {
  const formatDateRange = () => {
    const start = format(transit.startDate, 'MMM yyyy');
    const end = format(transit.endDate, 'MMM yyyy');
    return start === end ? start : `${start} – ${end}`;
  };

  return (
    <button
      onClick={() => onClick(transit.peakDate)}
      className="w-full text-left p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-all group"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        {/* Transit Title */}
        <div>
          <div className="font-medium">
            {transit.transitPlanet} {transit.aspectType} {transit.natalTarget}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDateRange()}
          </span>
        </div>

        {/* Status Badge */}
        <div className="flex gap-2">
          {transit.isCurrent && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
              Active Now
            </Badge>
          )}
          {transit.isPast && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Past
            </Badge>
          )}
          {transit.isUpcoming && (
            <Badge variant="outline" className="text-xs">
              Upcoming
            </Badge>
          )}
        </div>
      </div>

      {/* Phase and Axis */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge className={`${PHASE_COLORS[transit.phaseType]} border text-xs`}>
          {PHASE_LABELS[transit.phaseType]}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {transit.axis}
        </Badge>
        <span className="text-xs text-muted-foreground">
          House {transit.houseNatal}
        </span>
      </div>

      {/* Narrative Preview */}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {transit.narrative}
      </p>

      {/* Exact Dates */}
      {transit.exactDates.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {transit.exactDates.map((date, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-secondary rounded-full">
              ★ Exact: {format(date, 'MMM d, yyyy')}
            </span>
          ))}
        </div>
      )}

      {/* Click hint */}
      <p className="text-xs text-muted-foreground/60 mt-3 group-hover:text-muted-foreground transition-colors">
        Click to explore this transit →
      </p>
    </button>
  );
};
