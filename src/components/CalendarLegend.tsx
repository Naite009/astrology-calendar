import { DAY_TYPE_MAP } from "@/lib/astrology";
import { Info } from "lucide-react";

interface CalendarLegendProps {
  onOpenFullLegend?: () => void;
}

export const CalendarLegend = ({ onOpenFullLegend }: CalendarLegendProps) => {
  // Most common day types users will see
  const keyDayTypes = [
    { key: 'sun', ...DAY_TYPE_MAP.sun, symbol: '☉' },
    { key: 'moon', ...DAY_TYPE_MAP.moon, symbol: '☽' },
    { key: 'venus', ...DAY_TYPE_MAP.venus, symbol: '♀' },
    { key: 'mars', ...DAY_TYPE_MAP.mars, symbol: '♂' },
    { key: 'jupiter', ...DAY_TYPE_MAP.jupiter, symbol: '♃' },
    { key: 'saturn', ...DAY_TYPE_MAP.saturn, symbol: '♄' },
  ];

  const luckIndicators = [
    { icon: '🍀', label: 'Lucky', description: 'Harmonious transits to your chart' },
    { icon: '⚠️', label: 'Challenging', description: 'Difficult aspects — go slow' },
  ];

  const colorMeanings = [
    { color: 'bg-emerald-100', label: 'Harmonious', description: 'Trines & sextiles active' },
    { color: 'bg-amber-100', label: 'Intense', description: 'Squares & oppositions active' },
    { color: 'bg-blue-100', label: 'Emotional', description: 'Moon-focused energy' },
    { color: 'bg-pink-100', label: 'Heart', description: 'Venus/love energy strong' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm font-medium text-foreground">Quick Key</h3>
        {onOpenFullLegend && (
          <button 
            onClick={onOpenFullLegend}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            <Info className="w-3 h-3" />
            Full guide
          </button>
        )}
      </div>

      {/* Day Type Labels */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Day Types</div>
        <div className="space-y-1">
          {keyDayTypes.map((day) => (
            <div key={day.key} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-center">{day.symbol}</span>
              <span className="font-medium text-foreground">{day.label}</span>
              <span className="text-muted-foreground hidden sm:inline">— {day.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Luck Indicators */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Your Luck</div>
        <div className="space-y-1">
          {luckIndicators.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-center">{item.icon}</span>
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground hidden sm:inline">— {item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Color Meanings */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Colors</div>
        <div className="grid grid-cols-2 gap-1">
          {colorMeanings.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal vs Sky */}
      <div className="pt-2 border-t border-border text-[10px] text-muted-foreground space-y-1">
        <div><span className="font-medium text-foreground">Your Day:</span> Transits to YOUR chart</div>
        <div><span className="font-medium text-foreground">sky:</span> What everyone feels</div>
      </div>
    </div>
  );
};
