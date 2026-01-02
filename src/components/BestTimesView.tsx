import { useState, useEffect } from 'react';
import { Clock, Sparkles, Info } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateBestTimes, BestTimesCategory, BestTimeResult, CATEGORY_INFO } from '@/lib/bestTimes';

interface BestTimesViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartForTiming: string;
  setSelectedChartForTiming: (id: string) => void;
}

// Simple aspect wheel visualization
const AspectWheel = ({ aspects }: { aspects: { planet1: string; planet2: string; type: string; symbol: string; angle: number }[] }) => {
  const PLANET_SYMBOLS: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
  };

  const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  // Position planets around the wheel based on a simplified layout
  const planetPositions: Record<string, { angle: number; x: number; y: number }> = {};
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const radius = 85;
  const centerX = 120;
  const centerY = 120;

  planets.forEach((planet, i) => {
    const angle = (i * (360 / planets.length) - 90) * (Math.PI / 180);
    planetPositions[planet] = {
      angle: i * (360 / planets.length),
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const getAspectColor = (type: string) => {
    switch (type) {
      case 'conjunction': return '#22c55e';
      case 'trine': return '#3b82f6';
      case 'sextile': return '#8b5cf6';
      case 'square': return '#ef4444';
      case 'opposition': return '#f97316';
      default: return '#6b7280';
    }
  };

  return (
    <div className="relative">
      <svg width="240" height="240" className="mx-auto">
        {/* Zodiac wheel background */}
        <circle cx={centerX} cy={centerY} r="110" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="20" />
        <circle cx={centerX} cy={centerY} r="100" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r="70" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        
        {/* Zodiac sign markers */}
        {ZODIAC_SYMBOLS.map((sign, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = centerX + 105 * Math.cos(angle);
          const y = centerY + 105 * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" 
                  className="fill-muted-foreground text-[8px]">
              {sign}
            </text>
          );
        })}

        {/* Aspect lines */}
        {aspects.map((aspect, i) => {
          const p1 = planetPositions[aspect.planet1];
          const p2 = planetPositions[aspect.planet2];
          if (!p1 || !p2) return null;
          
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={getAspectColor(aspect.type)}
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeDasharray={aspect.type === 'square' || aspect.type === 'opposition' ? '4,4' : 'none'}
            />
          );
        })}

        {/* Planet positions */}
        {planets.map((planet) => {
          const pos = planetPositions[planet];
          return (
            <g key={planet}>
              <circle cx={pos.x} cy={pos.y} r="16" className="fill-background stroke-border" strokeWidth="1" />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" 
                    className="fill-foreground text-sm font-medium">
                {PLANET_SYMBOLS[planet]}
              </text>
            </g>
          );
        })}

        {/* Aspect symbol in center */}
        {aspects.length > 0 && (
          <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" 
                className="fill-primary text-2xl font-bold">
            {aspects[0]?.symbol || ''}
          </text>
        )}
      </svg>

      {/* Aspect legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-muted-foreground">☌ Conjunction</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-muted-foreground">△ Trine</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-purple-500"></div>
          <span className="text-muted-foreground">⚹ Sextile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500 border-dashed"></div>
          <span className="text-muted-foreground">□ Square</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-orange-500 border-dashed"></div>
          <span className="text-muted-foreground">☍ Opposition</span>
        </div>
      </div>
    </div>
  );
};

// Aspect explanation component
const AspectExplainer = ({ aspects }: { aspects: { planet1: string; planet2: string; type: string; symbol: string; description: string }[] }) => {
  const PLANET_MEANINGS: Record<string, string> = {
    Sun: 'vitality, identity, purpose',
    Moon: 'emotions, instincts, habits',
    Mercury: 'communication, thinking, learning',
    Venus: 'love, beauty, values',
    Mars: 'action, energy, drive',
    Jupiter: 'expansion, luck, growth',
    Saturn: 'discipline, structure, limits',
  };

  if (aspects.length === 0) return null;

  return (
    <div className="space-y-3">
      {aspects.slice(0, 5).map((aspect, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-secondary/50">
          <span className="text-2xl">{aspect.symbol}</span>
          <div className="flex-1">
            <div className="font-medium text-foreground">
              {aspect.planet1} {aspect.symbol} {aspect.planet2}
            </div>
            <div className="text-sm text-muted-foreground">
              {aspect.description}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-primary">{aspect.planet1}</span> ({PLANET_MEANINGS[aspect.planet1]}) 
              {' '}meets{' '}
              <span className="text-primary">{aspect.planet2}</span> ({PLANET_MEANINGS[aspect.planet2]})
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const BestTimesView = ({
  userNatalChart,
  savedCharts,
  selectedChartForTiming,
  setSelectedChartForTiming,
}: BestTimesViewProps) => {
  const [category, setCategory] = useState<BestTimesCategory>('love');
  const [bestTimes, setBestTimes] = useState<BestTimeResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedTime, setSelectedTime] = useState<BestTimeResult | null>(null);
  const [currentAspects, setCurrentAspects] = useState<{ planet1: string; planet2: string; type: string; symbol: string; angle: number; description: string }[]>([]);

  // Import getCurrentAspects dynamically
  useEffect(() => {
    import('@/lib/bestTimes').then(({ getCurrentAspects }) => {
      const aspects = getCurrentAspects(selectedTime?.date || new Date());
      setCurrentAspects(aspects);
    });
  }, [selectedTime]);

  useEffect(() => {
    const chart = selectedChartForTiming === 'user'
      ? userNatalChart
      : selectedChartForTiming === 'general'
      ? null
      : savedCharts.find(c => c.id === selectedChartForTiming);

    setIsCalculating(true);

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const startDate = new Date();
      // Round to nearest hour for cleaner times
      startDate.setMinutes(0, 0, 0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const times = calculateBestTimes(category, chart ?? null, startDate, endDate);
      setBestTimes(times);
      setIsCalculating(false);
      
      // Auto-select first time for visualization
      if (times.length > 0) {
        setSelectedTime(times[0]);
      }
    }, 100);
  }, [category, selectedChartForTiming, userNatalChart, savedCharts]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-primary" size={28} />
        <h2 className="font-serif text-2xl font-light text-foreground">Best Times Calculator</h2>
      </div>

      {/* Chart Selector */}
      <div className="mb-6 p-4 rounded-sm bg-secondary">
        <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
          Calculate for:
        </label>
        <select
          value={selectedChartForTiming}
          onChange={e => setSelectedChartForTiming(e.target.value)}
          className="w-full md:w-auto border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="general">Collective Astrology</option>
          {userNatalChart && <option value="user">Your Chart ({userNatalChart.name})</option>}
          {savedCharts.map(chart => (
            <option key={chart.id} value={chart.id}>{chart.name}</option>
          ))}
        </select>
        {selectedChartForTiming === 'general' && (
          <p className="text-xs text-muted-foreground mt-2">
            ✨ Using current planetary transits and aspects. Add a natal chart in the <strong>Charts</strong> tab for personalized timing.
          </p>
        )}
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(CATEGORY_INFO) as BestTimesCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm transition-all ${
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <span>{CATEGORY_INFO[cat].emoji}</span>
            <span>{CATEGORY_INFO[cat].label}</span>
          </button>
        ))}
      </div>

      {/* Aspect Visualization Panel */}
      {selectedTime && currentAspects.length > 0 && (
        <div className="mb-8 p-6 rounded-sm border border-border bg-background">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-primary" />
            <h3 className="font-serif text-lg text-foreground">
              What the Aspects Mean
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Aspects are angular relationships between planets. When planets form favorable angles, their energies combine harmoniously.
            Here's what's happening at{' '}
            <strong>
              {selectedTime.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </strong>:
          </p>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Aspect Wheel */}
            <div className="flex flex-col items-center">
              <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
                Current Planetary Aspects
              </h4>
              <AspectWheel aspects={currentAspects} />
            </div>
            
            {/* Aspect Explanations */}
            <div>
              <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
                Active Aspects Explained
              </h4>
              <AspectExplainer aspects={currentAspects} />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          Best Times for {CATEGORY_INFO[category].label}
        </h3>

        {isCalculating ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-pulse">Calculating optimal times...</div>
          </div>
        ) : bestTimes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No highly favorable times found in the next 30 days for this category.
          </div>
        ) : (
          <div className="space-y-3">
            {bestTimes.map((time, i) => (
              <button
                key={i}
                onClick={() => setSelectedTime(time)}
                className={`w-full text-left rounded-sm border p-4 transition-all ${
                  selectedTime?.date.getTime() === time.date.getTime()
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 hover:border-primary/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 text-lg font-medium">{time.rating}</span>
                    <span className="font-medium text-foreground">
                      {time.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {time.date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: 'America/New_York',
                      })}{' '}
                      ET
                    </span>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded-sm">
                    Score: {time.score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {time.reasons.map((reason, j) => (
                    <span
                      key={j}
                      className={`text-xs px-2 py-1 rounded-sm ${
                        reason.includes('avoid') || reason.includes('Void')
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 rounded-sm bg-secondary text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>How it works:</strong> Best times are calculated based on:
        </p>
        <ul className="list-disc list-inside space-y-1">
          {selectedChartForTiming === 'general' ? (
            <>
              <li>Aspects between transiting planets (Venus-Jupiter, Sun-Mars, etc.)</li>
              <li>Planet positions in favorable signs for each category</li>
            </>
          ) : (
            <li>Favorable transiting planet aspects to your natal chart</li>
          )}
          <li>Moon sign compatibility with the activity</li>
          <li>Moon phase (waxing = building, waning = releasing)</li>
          <li>Avoiding void-of-course Moon periods</li>
          <li>Mercury retrograde considerations (for travel)</li>
        </ul>
      </div>
    </div>
  );
};
