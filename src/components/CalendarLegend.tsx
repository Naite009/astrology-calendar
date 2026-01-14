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
    { icon: '✦', label: 'Flowing', description: 'Harmonious transits to your chart', className: 'text-emerald-600' },
    { icon: '△', label: 'Growth', description: 'Challenging aspects — opportunity for growth', className: 'text-amber-600' },
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

      {/* HOW TO READ THE CALENDAR */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
        <div className="text-[11px] font-semibold text-foreground mb-2">📖 How to Read Each Day</div>
        <div className="text-[10px] text-muted-foreground space-y-2">
          <div>
            <span className="font-medium text-foreground">Background Colors:</span> Show which planets are making aspects in the sky that day. Two colors = two planets are active.
          </div>
          <div>
            <span className="font-medium text-foreground">Day Label</span> (e.g., "Transform & Heal"): Shows which planet is affecting YOUR chart most. Different people get different labels on the same day!
          </div>
          <div>
            <span className="font-medium text-foreground">"sky:" label:</span> What EVERYONE feels — the collective energy.
          </div>
        </div>
      </div>

      {/* Planet Colors - What the background colors mean */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Background Colors = Active Planets</div>
        <div className="grid grid-cols-2 gap-1">
          {allDayTypes.map((day) => (
            <div key={day.key} className="flex items-center gap-1.5 text-[10px]">
              <div 
                className="w-4 h-4 rounded-sm shrink-0 border border-foreground/10" 
                style={{ backgroundColor: day.color }}
              />
              <span className="text-foreground">{day.symbol} {day.key.charAt(0).toUpperCase() + day.key.slice(1)}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[10px]">
            <div 
              className="w-4 h-4 rounded-sm shrink-0 border border-foreground/10" 
              style={{ backgroundColor: PLANET_COLORS.balsamic }}
            />
            <span className="text-foreground">🌘 Balsamic Rest</span>
          </div>
        </div>
      </div>

      {/* Day Type Labels - What they recommend */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Day Labels = What to Focus On</div>
        <div className="space-y-1">
          {allDayTypes.map((day) => (
            <div key={day.key} className="text-[10px] flex items-start gap-1">
              <span className="shrink-0">{day.emoji}</span>
              <div>
                <span className="font-medium text-foreground">{day.label}:</span>
                <span className="text-muted-foreground ml-1">{day.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Lunar Phases */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Special Moon Phases</div>
        <div className="space-y-1">
          {specialPhases.map((phase, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              {phase.color ? (
                <div 
                  className="w-4 h-4 rounded-sm shrink-0 border border-foreground/10" 
                  style={{ backgroundColor: phase.color }}
                />
              ) : (
                <div className="w-4 h-4 flex items-center justify-center shrink-0 text-sm">{phase.emoji}</div>
              )}
              <span className="font-medium text-foreground">{phase.label}</span>
              <span className="text-muted-foreground">— {phase.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Luck Indicators */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Luck Indicators</div>
        <div className="space-y-1">
          {luckIndicators.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className={`w-4 text-center shrink-0 font-bold ${item.className}`}>{item.icon}</span>
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">— {item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Example */}
      <div className="pt-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground italic">
          <span className="font-medium text-foreground not-italic">Example:</span> A day with 
          <span className="inline-block w-3 h-3 mx-1 rounded-sm align-middle" style={{ backgroundColor: PLANET_COLORS.sun }} /> yellow + 
          <span className="inline-block w-3 h-3 mx-1 rounded-sm align-middle" style={{ backgroundColor: PLANET_COLORS.venus }} /> pink 
          means Sun & Venus are active in the sky. If YOUR label says "Transform & Heal" it means Pluto is hitting your personal chart that day.
        </div>
      </div>
    </div>
  );
};
