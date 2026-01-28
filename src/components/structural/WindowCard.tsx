import { StructuralWindow } from '@/lib/structuralStressEngine';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface WindowCardProps {
  window: StructuralWindow;
  onClick: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  Containment: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'Structural Stress': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  Release: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  Activation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  Mixed: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
};

const PHASE_BAR_COLORS: Record<string, string> = {
  containment: 'bg-blue-500',
  stress: 'bg-red-500',
  release: 'bg-emerald-500',
  trigger: 'bg-orange-500'
};

export const WindowCard = ({ window, onClick }: WindowCardProps) => {
  const { date_range, phase_label, phase_scores, theme_badges, axis_badge, events } = window;
  
  const totalScore = phase_scores.containment_score + phase_scores.stress_score + 
                     phase_scores.release_score + phase_scores.trigger_score;
  
  const getBarWidth = (score: number) => {
    if (totalScore === 0) return 0;
    return (score / totalScore) * 100;
  };

  const formatDateRange = () => {
    const start = format(date_range.start, 'MMM yyyy');
    const end = format(date_range.end, 'MMM yyyy');
    return start === end ? start : `${start} – ${end}`;
  };

  const transitPlanets = [...new Set(events.map(e => e.transiting_planet))];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-all group"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        {/* Date Range */}
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {formatDateRange()}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`${PHASE_COLORS[phase_label]} border`}>
              {phase_label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {transitPlanets.join(', ')}
            </span>
          </div>
        </div>

        {/* Axis Badge */}
        <Badge variant="outline" className="text-xs">
          {axis_badge}
        </Badge>
      </div>

      {/* Theme Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {theme_badges.map(badge => (
          <span 
            key={badge} 
            className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Phase Score Bars */}
      <div className="space-y-1.5">
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
          {phase_scores.containment_score > 0 && (
            <div 
              className={`${PHASE_BAR_COLORS.containment} transition-all`}
              style={{ width: `${getBarWidth(phase_scores.containment_score)}%` }}
              title={`Containment: ${phase_scores.containment_score}`}
            />
          )}
          {phase_scores.stress_score > 0 && (
            <div 
              className={`${PHASE_BAR_COLORS.stress} transition-all`}
              style={{ width: `${getBarWidth(phase_scores.stress_score)}%` }}
              title={`Stress: ${phase_scores.stress_score}`}
            />
          )}
          {phase_scores.release_score > 0 && (
            <div 
              className={`${PHASE_BAR_COLORS.release} transition-all`}
              style={{ width: `${getBarWidth(phase_scores.release_score)}%` }}
              title={`Release: ${phase_scores.release_score}`}
            />
          )}
          {phase_scores.trigger_score > 0 && (
            <div 
              className={`${PHASE_BAR_COLORS.trigger} transition-all`}
              style={{ width: `${getBarWidth(phase_scores.trigger_score)}%` }}
              title={`Trigger: ${phase_scores.trigger_score}`}
            />
          )}
        </div>
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Containment
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Stress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Release
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Trigger
          </span>
        </div>
      </div>

      {/* Click hint */}
      <p className="text-xs text-muted-foreground/60 mt-3 group-hover:text-muted-foreground transition-colors">
        Click to view detailed interpretation →
      </p>
    </button>
  );
};
