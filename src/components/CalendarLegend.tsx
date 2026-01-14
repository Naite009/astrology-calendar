import { DAY_TYPE_MAP } from "@/lib/astrology";
import { Info } from "lucide-react";

interface CalendarLegendProps {
  onOpenFullLegend?: () => void;
}

// Exact planet colors from PLANET_COLORS in astrology.ts
const PLANET_COLORS = {
  mars: '#C74E4E',      // Red-orange
  venus: '#E8D5CC',     // Soft pink/beige
  sun: '#F4D03F',       // Golden yellow
  moon: '#7FA3C7',      // Grayish blue
  mercury: '#E8A558',   // Orange
  jupiter: '#9B7EBD',   // Purple
  saturn: '#8B7355',    // Brown
  uranus: '#5DADE2',    // Bright blue
  neptune: '#A9CCE3',   // Light blue
  pluto: '#5D6D7E',     // Dark gray-blue
  balsamic: '#D4C5E8',  // Lavender
};

export const CalendarLegend = ({ onOpenFullLegend }: CalendarLegendProps) => {
  // All day types with their actual colors
  const allDayTypes = [
    { key: 'sun', ...DAY_TYPE_MAP.sun, symbol: '☉', color: PLANET_COLORS.sun },
    { key: 'moon', ...DAY_TYPE_MAP.moon, symbol: '☽', color: PLANET_COLORS.moon },
    { key: 'mercury', ...DAY_TYPE_MAP.mercury, symbol: '☿', color: PLANET_COLORS.mercury },
    { key: 'venus', ...DAY_TYPE_MAP.venus, symbol: '♀', color: PLANET_COLORS.venus },
    { key: 'mars', ...DAY_TYPE_MAP.mars, symbol: '♂', color: PLANET_COLORS.mars },
    { key: 'jupiter', ...DAY_TYPE_MAP.jupiter, symbol: '♃', color: PLANET_COLORS.jupiter },
    { key: 'saturn', ...DAY_TYPE_MAP.saturn, symbol: '♄', color: PLANET_COLORS.saturn },
    { key: 'uranus', ...DAY_TYPE_MAP.uranus, symbol: '♅', color: PLANET_COLORS.uranus },
    { key: 'neptune', ...DAY_TYPE_MAP.neptune, symbol: '♆', color: PLANET_COLORS.neptune },
    { key: 'pluto', ...DAY_TYPE_MAP.pluto, symbol: '♇', color: PLANET_COLORS.pluto },
  ];

  const luckIndicators = [
    { icon: '🍀', label: 'Lucky', description: 'Harmonious transits to your chart' },
    { icon: '⚠️', label: 'Challenging', description: 'Difficult aspects — go slow' },
  ];

  // Special lunar phases
  const specialPhases = [
    { emoji: '🌑', label: 'Plant Seeds', description: 'New Moon — new beginnings' },
    { emoji: '🌕', label: 'Harvest', description: 'Full Moon — clarity & results' },
    { emoji: '🌘', label: 'Rest & Release', color: PLANET_COLORS.balsamic, description: 'Balsamic — let go, recharge' },
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

      {/* Day Type Labels with Colors */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Day Types & Colors</div>
        <div className="space-y-1.5">
          {allDayTypes.map((day) => (
            <div key={day.key} className="flex items-center gap-2 text-xs">
              <div 
                className="w-5 h-5 rounded-sm shrink-0 border border-foreground/10" 
                style={{ backgroundColor: day.color }}
                title={day.key}
              />
              <span className="w-4 text-center shrink-0">{day.symbol}</span>
              <span className="font-medium text-foreground">{day.emoji} {day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Special Lunar Phases */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Special Phases</div>
        <div className="space-y-1.5">
          {specialPhases.map((phase, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {phase.color ? (
                <div 
                  className="w-5 h-5 rounded-sm shrink-0 border border-foreground/10" 
                  style={{ backgroundColor: phase.color }}
                />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center shrink-0">{phase.emoji}</div>
              )}
              <span className="font-medium text-foreground">{phase.label}</span>
              <span className="text-muted-foreground hidden sm:inline">— {phase.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Luck Indicators */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Your Luck</div>
        <div className="space-y-1">
          {luckIndicators.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-5 text-center shrink-0">{item.icon}</span>
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground hidden sm:inline">— {item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal vs Sky */}
      <div className="pt-3 border-t border-border text-[11px] text-muted-foreground space-y-1.5">
        <div><span className="font-medium text-foreground">Your Day:</span> Transits to YOUR chart</div>
        <div><span className="font-medium text-foreground">sky:</span> What everyone feels</div>
        <div className="text-[10px] italic mt-2">Colors show dominant planetary energy</div>
      </div>
    </div>
  );
};
