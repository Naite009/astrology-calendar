import { useState } from 'react';
import { Clock, Zap, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { SRActivationData, TransitHit, ActivationWindow, MonthlyTheme } from '@/lib/solarReturnActivationWindows';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDate = (d: Date) => `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const formatShort = (d: Date) => `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;

const SIG_COLORS = {
  high: 'bg-red-500/10 text-red-600 border-red-200',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-200',
  low: 'bg-muted text-muted-foreground border-border',
};

interface Props {
  data: SRActivationData;
}

export const ActivationTimeline = ({ data }: Props) => {
  const [expandedSection, setExpandedSection] = useState<'windows' | 'monthly' | 'hits' | null>('windows');
  const [expandedWindow, setExpandedWindow] = useState<number | null>(null);

  const toggle = (s: 'windows' | 'monthly' | 'hits') =>
    setExpandedSection(prev => prev === s ? null : s);

  return (
    <div className="border border-border rounded-sm bg-card">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          Activation Windows — When Themes Peak
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Exact dates when transiting planets activate your Solar Return points
        </p>
      </div>

      {/* Peak Periods Summary */}
      {data.peakPeriods.length > 0 && (
        <div className="p-4 border-b border-border bg-primary/5">
          <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">
            🔥 Peak Event Windows
          </div>
          <div className="space-y-2">
            {data.peakPeriods.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-mono font-medium text-foreground whitespace-nowrap min-w-[120px]">
                  {p.dates}
                </span>
                <span className="text-xs text-muted-foreground">{p.theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activation Windows */}
      <div className="border-b border-border">
        <button
          onClick={() => toggle('windows')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <span className="text-xs uppercase tracking-widest font-medium text-foreground">
              Event Windows ({data.activationWindows.length})
            </span>
          </div>
          {expandedSection === 'windows' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expandedSection === 'windows' && (
          <div className="px-4 pb-4 space-y-2">
            {data.activationWindows.slice(0, 10).map((w, i) => (
              <div key={i} className="border border-border rounded-sm overflow-hidden">
                <button
                  onClick={() => setExpandedWindow(expandedWindow === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors text-left"
                >
                  <div>
                    <div className="text-xs font-medium text-foreground">{w.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatShort(w.startDate)} – {formatShort(w.endDate)} · Peak: {formatDate(w.peakDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IntensityBar intensity={w.intensity} />
                    {expandedWindow === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                </button>

                {expandedWindow === i && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border bg-muted/10">
                    <p className="text-xs text-muted-foreground mt-2">{w.theme}</p>
                    {w.triggers.map((t, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs">
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border ${SIG_COLORS[t.significance]}`}>
                          {t.significance}
                        </span>
                        <div>
                          <span className="font-medium text-foreground">
                            {t.transitPlanet} {t.aspect} {t.srTarget}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            — {formatDate(t.exactDate)} ({t.orb}° orb)
                          </span>
                          <p className="text-muted-foreground mt-0.5">{t.interpretation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Overview */}
      <div className="border-b border-border">
        <button
          onClick={() => toggle('monthly')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <span className="text-xs uppercase tracking-widest font-medium text-foreground">
              Monthly Activity Map
            </span>
          </div>
          {expandedSection === 'monthly' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expandedSection === 'monthly' && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {data.monthlyThemes.map((m, i) => (
                <div key={i} className="border border-border rounded-sm p-2.5 bg-background">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-medium text-foreground">
                      {m.monthLabel.slice(0, 3)} {m.year}
                    </span>
                    <IntensityDots intensity={m.intensity} />
                  </div>
                  {m.themes.length > 0 ? (
                    <div className="space-y-0.5">
                      {m.themes.slice(0, 2).map((t, j) => (
                        <div key={j} className="text-[10px] text-muted-foreground truncate">{t}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground/50 italic">Quiet month</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Transit Hits */}
      <div>
        <button
          onClick={() => toggle('hits')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-xs uppercase tracking-widest font-medium text-foreground">
            All Transit Hits ({data.transitHits.length})
          </span>
          {expandedSection === 'hits' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expandedSection === 'hits' && (
          <div className="px-4 pb-4 space-y-1">
            {data.transitHits.slice(0, 30).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-border/50 last:border-0">
                <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                  h.significance === 'high' ? 'bg-red-500' : h.significance === 'medium' ? 'bg-amber-500' : 'bg-muted-foreground/30'
                }`} />
                <span className="font-mono text-muted-foreground min-w-[70px]">{formatShort(h.exactDate)}</span>
                <span className="font-medium text-foreground">{h.transitPlanet} {h.aspect.slice(0, 4)}</span>
                <span className="text-muted-foreground">{h.srTarget}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const IntensityBar = ({ intensity }: { intensity: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`w-1.5 h-3 rounded-sm ${i < Math.ceil(intensity / 2) ? 'bg-primary' : 'bg-muted'}`} />
    ))}
  </div>
);

const IntensityDots = ({ intensity }: { intensity: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`w-1 h-1 rounded-full ${i < Math.ceil(intensity / 2) ? 'bg-primary' : 'bg-muted'}`} />
    ))}
  </div>
);
