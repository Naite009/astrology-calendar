import { LifeDomainScores } from '@/lib/solarReturnLifeDomainScores';
import { Briefcase, Heart, Activity, TrendingUp } from 'lucide-react';

interface Props {
  scores: LifeDomainScores;
}

const DOMAIN_ICONS: Record<string, typeof Briefcase> = {
  Career: Briefcase,
  Love: Heart,
  Health: Activity,
  Growth: TrendingUp,
};

const DOMAIN_COLORS: Record<string, string> = {
  Career: 'text-blue-500',
  Love: 'text-rose-500',
  Health: 'text-emerald-500',
  Growth: 'text-violet-500',
};

const BAR_COLORS: Record<string, string> = {
  Career: 'bg-blue-500',
  Love: 'bg-rose-500',
  Health: 'bg-emerald-500',
  Growth: 'bg-violet-500',
};

export const LifeDomainScoresCard = ({ scores }: Props) => {
  const domains = [scores.career, scores.love, scores.health, scores.growth];

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Life Domain Scores</div>
        <p className="text-[11px] text-muted-foreground">How strongly each area of life is activated this year</p>
      </div>

      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 divide-border">
        {domains.map((d) => {
          const Icon = DOMAIN_ICONS[d.domain] || TrendingUp;
          const color = DOMAIN_COLORS[d.domain] || 'text-primary';
          const barColor = BAR_COLORS[d.domain] || 'bg-primary';

          return (
            <div key={d.domain} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={color} />
                  <span className="text-sm font-medium text-foreground">{d.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif font-bold text-foreground">{d.score.toFixed(1)}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-medium ${color}`}>{d.label}</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${(d.score / 10) * 100}%` }}
                />
              </div>

              {/* Drivers */}
              {d.drivers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {d.drivers.map((dr, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{dr}</span>
                  ))}
                </div>
              )}

              {/* Advice */}
              <p className="text-[11px] text-muted-foreground leading-relaxed">{d.advice}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
