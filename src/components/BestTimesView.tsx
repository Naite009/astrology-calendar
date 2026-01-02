import { useState, useEffect } from 'react';
import { Clock, Sparkles, Info } from 'lucide-react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { calculateBestTimes, BestTimesCategory, BestTimeResult, CATEGORY_INFO, getTransitPositions } from '@/lib/bestTimes';

interface BestTimesViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartForTiming: string;
  setSelectedChartForTiming: (id: string) => void;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

// Convert sign + degree to absolute longitude (0-360)
const toAbsoluteLongitude = (sign: string, degree: number, minutes: number = 0): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + (minutes / 60);
};

// Convert longitude to SVG position on the wheel
// Traditional astrology: Aries 0° is at the left (9 o'clock), signs go counter-clockwise
const longitudeToPosition = (longitude: number, radius: number, centerX: number, centerY: number): { x: number; y: number } => {
  // In traditional astrology wheel: 0° Aries is at left (9 o'clock = 180° in SVG coords)
  // Signs progress counter-clockwise, so we negate the angle
  const svgAngle = (180 - longitude) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(svgAngle),
    y: centerY - radius * Math.sin(svgAngle)
  };
};

interface TransitPosition {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
}

interface AspectWheelProps {
  aspects: { planet1: string; planet2: string; type: string; symbol: string; angle: number }[];
  transitPositions: TransitPosition[];
  natalChart: NatalChart | null;
}

// Proper astrological wheel visualization
const AspectWheel = ({ aspects, transitPositions, natalChart }: AspectWheelProps) => {
  const centerX = 150;
  const centerY = 150;
  const outerRadius = 140;
  const signRadius = 125;
  const transitRadius = 95;
  const natalRadius = 65;
  const innerRadius = 40;

  const getAspectColor = (type: string) => {
    switch (type) {
      case 'conjunction': return 'hsl(142, 76%, 36%)'; // green
      case 'trine': return 'hsl(217, 91%, 60%)'; // blue
      case 'sextile': return 'hsl(263, 70%, 50%)'; // purple
      case 'square': return 'hsl(0, 84%, 60%)'; // red
      case 'opposition': return 'hsl(25, 95%, 53%)'; // orange
      default: return 'hsl(220, 9%, 46%)';
    }
  };

  // Build natal positions from chart
  const natalPositions: TransitPosition[] = [];
  if (natalChart?.planets) {
    const planetKeys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
    planetKeys.forEach(key => {
      const pos = natalChart.planets[key];
      if (pos && pos.sign) {
        natalPositions.push({
          name: key,
          longitude: toAbsoluteLongitude(pos.sign, pos.degree, pos.minutes),
          sign: pos.sign,
          degree: pos.degree
        });
      }
    });
  }

  // Find transit position for aspect lines
  const getTransitPos = (name: string) => transitPositions.find(p => p.name === name);

  return (
    <div className="relative">
      <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
        {/* Outer circle */}
        <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" className="stroke-border" strokeWidth="1" />
        
        {/* Sign segments background */}
        <circle cx={centerX} cy={centerY} r={signRadius} fill="none" className="stroke-border/50" strokeWidth="30" />
        
        {/* Sign division lines */}
        {Array.from({ length: 12 }).map((_, i) => {
          const startAngle = (180 - i * 30) * (Math.PI / 180);
          const x1 = centerX + (signRadius - 15) * Math.cos(startAngle);
          const y1 = centerY - (signRadius - 15) * Math.sin(startAngle);
          const x2 = centerX + outerRadius * Math.cos(startAngle);
          const y2 = centerY - outerRadius * Math.sin(startAngle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border/30" strokeWidth="1" />
          );
        })}

        {/* Zodiac symbols - positioned in center of each 30° segment */}
        {ZODIAC_SYMBOLS.map((symbol, i) => {
          // Center of each sign segment (15° into the sign)
          const signCenterLon = i * 30 + 15;
          const pos = longitudeToPosition(signCenterLon, signRadius, centerX, centerY);
          return (
            <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" 
                  className="fill-muted-foreground text-xs font-medium">
              {symbol}
            </text>
          );
        })}

        {/* Inner circles */}
        <circle cx={centerX} cy={centerY} r={transitRadius + 15} fill="none" className="stroke-border/20" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={natalRadius + 15} fill="none" className="stroke-border/20" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={innerRadius} fill="none" className="stroke-border/10" strokeWidth="1" />

        {/* Aspect lines between transit planets */}
        {aspects.map((aspect, i) => {
          const p1 = getTransitPos(aspect.planet1);
          const p2 = getTransitPos(aspect.planet2);
          if (!p1 || !p2) return null;
          
          const pos1 = longitudeToPosition(p1.longitude, transitRadius - 10, centerX, centerY);
          const pos2 = longitudeToPosition(p2.longitude, transitRadius - 10, centerX, centerY);
          
          return (
            <line
              key={i}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={getAspectColor(aspect.type)}
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeDasharray={aspect.type === 'square' || aspect.type === 'opposition' ? '3,3' : 'none'}
            />
          );
        })}

        {/* Transit planets (outer ring) */}
        {transitPositions.map((planet) => {
          const pos = longitudeToPosition(planet.longitude, transitRadius, centerX, centerY);
          return (
            <g key={`transit-${planet.name}`}>
              <circle cx={pos.x} cy={pos.y} r="12" className="fill-primary/20 stroke-primary" strokeWidth="1" />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" 
                    className="fill-primary text-xs font-bold">
                {PLANET_SYMBOLS[planet.name]}
              </text>
            </g>
          );
        })}

        {/* Natal planets (inner ring) - only if natal chart exists */}
        {natalPositions.map((planet) => {
          const pos = longitudeToPosition(planet.longitude, natalRadius, centerX, centerY);
          return (
            <g key={`natal-${planet.name}`}>
              <circle cx={pos.x} cy={pos.y} r="10" className="fill-secondary stroke-foreground/50" strokeWidth="1" />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" 
                    className="fill-foreground text-[10px]">
                {PLANET_SYMBOLS[planet.name]}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text x={centerX} y={centerY - 8} textAnchor="middle" className="fill-muted-foreground text-[8px] uppercase tracking-wider">
          {natalChart ? 'Transit' : 'Today'}
        </text>
        <text x={centerX} y={centerY + 8} textAnchor="middle" className="fill-muted-foreground text-[8px] uppercase tracking-wider">
          {natalChart ? '+ Natal' : ''}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-2 text-[10px]">
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
            <span className="text-muted-foreground">Transit (current)</span>
          </div>
          {natalChart && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-secondary border border-foreground/50"></div>
              <span className="text-muted-foreground">Natal (birth)</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: getAspectColor('conjunction') }}></div>
            <span className="text-muted-foreground">☌ Conjunction</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: getAspectColor('trine') }}></div>
            <span className="text-muted-foreground">△ Trine</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: getAspectColor('sextile') }}></div>
            <span className="text-muted-foreground">⚹ Sextile</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: getAspectColor('square') }}></div>
            <span className="text-muted-foreground">□ Square</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: getAspectColor('opposition') }}></div>
            <span className="text-muted-foreground">☍ Opposition</span>
          </div>
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
  const [transitPositions, setTransitPositions] = useState<{ name: string; longitude: number; sign: string; degree: number }[]>([]);

  // Get the active chart for display
  const activeChart = selectedChartForTiming === 'user'
    ? userNatalChart
    : selectedChartForTiming === 'general'
    ? null
    : savedCharts.find(c => c.id === selectedChartForTiming) || null;

  // Import getCurrentAspects and getTransitPositions dynamically
  useEffect(() => {
    import('@/lib/bestTimes').then(({ getCurrentAspects, getTransitPositions }) => {
      const date = selectedTime?.date || new Date();
      const aspects = getCurrentAspects(date);
      const positions = getTransitPositions(date);
      setCurrentAspects(aspects);
      setTransitPositions(positions);
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
              <AspectWheel aspects={currentAspects} transitPositions={transitPositions} natalChart={activeChart} />
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
