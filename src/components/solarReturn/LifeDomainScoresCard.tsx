import { useState } from 'react';
import { LifeDomainScores, LifeDomainScore, DomainTone } from '@/lib/solarReturnLifeDomainScores';
import { Briefcase, Heart, Activity, TrendingUp, ChevronDown, ChevronUp, Shield, Flame, Sparkles, Shuffle } from 'lucide-react';

interface Props {
  scores: LifeDomainScores;
}

const DOMAIN_ICONS: Record<string, typeof Briefcase> = {
  Career: Briefcase,
  Love: Heart,
  Health: Activity,
  Growth: TrendingUp,
};

const TONE_CONFIG: Record<DomainTone, { color: string; barColor: string; icon: typeof Shield; label: string }> = {
  supportive: { color: 'text-emerald-600', barColor: 'bg-emerald-500', icon: Sparkles, label: 'Supportive' },
  challenging: { color: 'text-amber-600', barColor: 'bg-amber-500', icon: Shield, label: 'Challenging' },
  transformative: { color: 'text-violet-600', barColor: 'bg-violet-500', icon: Flame, label: 'Transformative' },
  mixed: { color: 'text-blue-600', barColor: 'bg-blue-500', icon: Shuffle, label: 'Mixed' },
  quiet: { color: 'text-muted-foreground', barColor: 'bg-muted-foreground', icon: Sparkles, label: 'Quiet' },
};

const NATURE_COLORS: Record<string, string> = {
  benefic: 'text-emerald-600',
  malefic: 'text-amber-600',
  outer: 'text-violet-600',
  'wound-healer': 'text-rose-500',
  luminary: 'text-yellow-600',
  neutral: 'text-muted-foreground',
};

function ordinal(n: number): string {
  if (n === 0) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const DomainCard = ({ d }: { d: LifeDomainScore }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = DOMAIN_ICONS[d.domain] || TrendingUp;
  const toneConfig = TONE_CONFIG[d.tone] || TONE_CONFIG.quiet;
  const ToneIcon = toneConfig.icon;

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={toneConfig.color} />
          <span className="text-sm font-medium text-foreground">{d.domain}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-serif font-bold text-foreground">{d.activityLevel.toFixed(1)}</span>
        </div>
      </div>

      {/* Tone badge + label */}
      <div className="flex items-center gap-1.5">
        <ToneIcon size={10} className={toneConfig.color} />
        <span className={`text-[10px] uppercase tracking-wider font-medium ${toneConfig.color}`}>
          {d.label}
        </span>
      </div>

      {/* Activity bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${toneConfig.barColor}`}
          style={{ width: `${(d.activityLevel / 10) * 100}%` }}
        />
      </div>

      {/* Drivers with nature tags */}
      {d.drivers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {d.drivers.slice(0, 5).map((dr, i) => (
            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-sm bg-muted ${NATURE_COLORS[dr.nature] || 'text-muted-foreground'}`}>
              {dr.planet}{dr.house > 0 ? ` ${ordinal(dr.house)}H` : ''} · {dr.effect}
            </span>
          ))}
        </div>
      )}

      {/* Advice */}
      <p className="text-[11px] text-muted-foreground leading-relaxed">{d.advice}</p>

      {/* Breakdown toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors active:scale-[0.97]"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Hide' : 'Show'} how this score was calculated
      </button>

      {expanded && d.breakdown && (
        <div className="mt-2 space-y-1.5 border-t border-border pt-2">
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
            Activity Breakdown — Where Each Point Comes From
          </div>
          {d.breakdown.map((b, i) => (
            <div key={i} className="flex gap-2 text-[11px]">
              <div className="flex-shrink-0 w-10 text-right font-mono">
                {b.points >= 0 ? (
                  <span className="text-emerald-600">+{b.points.toFixed(1)}</span>
                ) : (
                  <span className="text-amber-600">{b.points.toFixed(1)}</span>
                )}
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">{b.source}</span>
                {b.nature && (
                  <span className={`text-[9px] ml-1 ${NATURE_COLORS[b.nature]}`}>
                    [{b.nature}]
                  </span>
                )}
                <span className="text-muted-foreground"> — {b.reason}</span>
              </div>
            </div>
          ))}
          <div className="flex gap-2 text-[11px] border-t border-border pt-1.5 mt-1.5">
            <div className="flex-shrink-0 w-10 text-right font-mono font-bold text-foreground">
              ={d.activityLevel.toFixed(1)}
            </div>
            <div className="flex-1 font-medium text-foreground">
              Final activity level (capped at 10)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LifeDomainScoresCard = ({ scores }: Props) => {
  const domains = [scores.career, scores.love, scores.health, scores.growth];

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Life Domain Activity</div>
        <p className="text-[11px] text-muted-foreground">
          How much energy each area of life is getting this year — and whether that energy is supportive, demanding, or transformative.
          High activity doesn't mean "good" — it means that area won't be ignored.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 divide-border">
        {domains.map((d) => (
          <DomainCard key={d.domain} d={d} />
        ))}
      </div>
    </div>
  );
};
