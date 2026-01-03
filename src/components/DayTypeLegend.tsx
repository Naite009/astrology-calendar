import { DAY_TYPE_MAP } from "@/lib/astrology";

interface DayTypeLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DayTypeLegend = ({ isOpen, onClose }: DayTypeLegendProps) => {
  if (!isOpen) return null;

  const dayTypes = [
    { key: 'sun', ...DAY_TYPE_MAP.sun, planetSymbol: '☉' },
    { key: 'moon', ...DAY_TYPE_MAP.moon, planetSymbol: '☽' },
    { key: 'mercury', ...DAY_TYPE_MAP.mercury, planetSymbol: '☿' },
    { key: 'venus', ...DAY_TYPE_MAP.venus, planetSymbol: '♀' },
    { key: 'mars', ...DAY_TYPE_MAP.mars, planetSymbol: '♂' },
    { key: 'jupiter', ...DAY_TYPE_MAP.jupiter, planetSymbol: '♃' },
    { key: 'saturn', ...DAY_TYPE_MAP.saturn, planetSymbol: '♄' },
    { key: 'uranus', ...DAY_TYPE_MAP.uranus, planetSymbol: '♅' },
    { key: 'neptune', ...DAY_TYPE_MAP.neptune, planetSymbol: '♆' },
    { key: 'pluto', ...DAY_TYPE_MAP.pluto, planetSymbol: '♇' },
  ];

  const specialDays = [
    { label: 'Seed Day', emoji: '🌑', description: 'New Moon — new beginnings, set intentions', isLucky: true },
    { label: 'Peak Day', emoji: '🌕', description: 'Full Moon — emotional culmination, clarity', isLucky: false },
    { label: 'Rest Day', emoji: '🌘', description: 'Balsamic Moon — release, reflect, restore', isLucky: false },
  ];

  const luckIndicators = [
    { icon: '🍀', label: 'Lucky Day', description: 'Score 7-10: Harmonious aspects from benefic planets (Venus, Jupiter) to your chart' },
    { icon: '⚠️', label: 'Challenging Day', description: 'Score 0-3: Difficult aspects from malefic planets (Mars, Saturn, Pluto) — requires patience' },
    { icon: '○', label: 'Neutral Day', description: 'Score 4-6: Mixed or no major transits to your personal chart' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="font-serif text-2xl text-foreground">Day Types & Luck Guide</h2>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl"
            >
              ×
            </button>
          </div>

          {/* Personal vs Collective explanation */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-foreground mb-2">📍 Two Types of Day Labels</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">"Your [Day Type]"</strong> — Based on transits to YOUR natal chart. Shows which planet is most active in YOUR sky today.</p>
              <p><strong className="text-foreground">"(sky: [Day Type])"</strong> — The collective energy based on aspects in the general sky for everyone.</p>
            </div>
          </div>

          {/* Luck Indicators */}
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">🎲 Luck Indicators (Personal)</h3>
            <div className="space-y-2">
              {luckIndicators.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium text-foreground text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planetary Day Types */}
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">🪐 Planetary Day Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {dayTypes.map((day) => (
                <div key={day.key} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <span className="text-lg">{day.planetSymbol}</span>
                  <div>
                    <div className="font-medium text-foreground text-sm">{day.emoji} {day.label}</div>
                    <div className="text-xs text-muted-foreground">{day.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Lunar Days */}
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">🌙 Special Lunar Days</h3>
            <div className="space-y-2">
              {specialDays.map((day, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                  <span className="text-lg">{day.emoji}</span>
                  <div>
                    <div className="font-medium text-foreground text-sm">{day.label}</div>
                    <div className="text-xs text-muted-foreground">{day.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How Luck is Calculated */}
          <div className="p-4 bg-muted/50 rounded-lg text-sm">
            <h3 className="font-medium text-foreground mb-2">📊 How Your Luck Score is Calculated</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-emerald-600">+3 points:</strong> Venus/Jupiter trine or sextile to your natal planets</li>
              <li><strong className="text-emerald-600">+2 points:</strong> Venus/Jupiter conjunction OR Sun trine/sextile OR aspects to your natal Venus/Jupiter</li>
              <li><strong className="text-emerald-600">+1 point:</strong> Moon harmonious aspects, benefic aspects</li>
              <li><strong className="text-amber-600">-2 points:</strong> Mars/Saturn/Pluto squares or oppositions</li>
              <li><strong className="text-amber-600">-1 point:</strong> Malefic conjunctions</li>
            </ul>
            <p className="mt-3 text-muted-foreground">Base score is 5. Lucky = 7+, Challenging = 3 or less.</p>
          </div>
        </div>
      </div>
    </div>
  );
};