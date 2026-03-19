import { LunarWeatherMap } from '@/lib/solarReturnLunarWeather';
import { Moon, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
  weather: LunarWeatherMap;
}

const INTENSITY_COLORS = [
  'bg-muted',
  'bg-blue-200',
  'bg-blue-300',
  'bg-amber-300',
  'bg-amber-400',
  'bg-rose-400',
];

export const LunarWeatherCard = ({ weather }: Props) => {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1 flex items-center gap-1.5">
          <Moon size={12} /> Lunar Emotional Weather Map
        </div>
        <p className="text-[11px] text-muted-foreground">
          Your emotional rhythm mapped month by month — natal Moon in {weather.natalMoonSign}
        </p>
      </div>

      {/* Year pattern summary */}
      <div className="p-4 bg-muted/20 border-b border-border">
        <p className="text-[11px] text-foreground leading-relaxed">{weather.yearPattern}</p>
      </div>

      {/* Intensity heat strip */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Emotional Intensity by Month</div>
        <div className="flex gap-0.5">
          {weather.months.map((m, i) => (
            <button
              key={i}
              onClick={() => setExpandedMonth(expandedMonth === i ? null : i)}
              className={`flex-1 flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all hover:ring-1 hover:ring-primary/30 ${expandedMonth === i ? 'ring-1 ring-primary' : ''}`}
            >
              <div
                className={`w-full h-6 rounded-sm ${INTENSITY_COLORS[m.lunarReturn.intensity] || INTENSITY_COLORS[2]}`}
              />
              <span className="text-[8px] text-muted-foreground">{m.month}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-muted-foreground">← Quieter</span>
          <span className="text-[8px] text-muted-foreground">More Intense →</span>
        </div>
      </div>

      {/* Expanded month detail */}
      {expandedMonth !== null && (
        <div className="p-4 bg-muted/10 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{weather.months[expandedMonth].month}</div>
              <div className="text-[10px] text-muted-foreground">{weather.months[expandedMonth].overallTone}</div>
            </div>
            <button onClick={() => setExpandedMonth(null)}>
              <ChevronUp size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Lunar Return */}
          <div className="bg-card p-3 rounded-sm border border-border">
            <div className="text-[9px] uppercase tracking-widest text-primary font-medium mb-1 flex items-center gap-1">
              <Droplets size={10} /> Lunar Return — Moon in {weather.natalMoonSign}
            </div>
            <p className="text-[11px] text-foreground leading-relaxed">{weather.months[expandedMonth].lunarReturn.emotionalTheme}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[9px] text-muted-foreground">Intensity:</span>
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className={`w-2 h-2 rounded-full ${j < weather.months[expandedMonth].lunarReturn.intensity ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>

          {/* Moon transit checkpoints (show first 6 for space) */}
          <div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Moon Transit Checkpoints (~2.5 day shifts)</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {weather.months[expandedMonth].checkpoints.slice(0, 8).map((cp, j) => (
                <div key={j} className="p-1.5 bg-muted/30 rounded text-center">
                  <div className="text-[9px] font-medium text-foreground">{cp.sign}</div>
                  <div className="text-[8px] text-muted-foreground">{cp.emotionalTone}</div>
                  <div className="text-[7px] text-muted-foreground/60">{cp.dateLabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Peaks and quiet */}
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-3">
          <div className="text-[9px] uppercase tracking-widest text-amber-600 font-medium mb-1">Emotional Peaks</div>
          <div className="text-[11px] text-foreground">
            {weather.emotionalPeaks.length > 0 ? weather.emotionalPeaks.join(', ') : 'Evenly distributed'}
          </div>
        </div>
        <div className="p-3">
          <div className="text-[9px] uppercase tracking-widest text-blue-500 font-medium mb-1">Quieter Months</div>
          <div className="text-[11px] text-foreground">
            {weather.quietMonths.length > 0 ? weather.quietMonths.join(', ') : 'Generally active'}
          </div>
        </div>
      </div>
    </div>
  );
};
