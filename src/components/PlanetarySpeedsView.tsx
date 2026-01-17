// Planetary Speeds Reference View
// Shows how fast each celestial body moves through the zodiac

import { useState } from 'react';
import { CELESTIAL_BODY_SPEEDS, getCategoryLabel, CelestialBodySpeed } from '@/lib/planetDignities';
import { ChevronDown, ChevronUp, Clock, Gauge, Info, Zap } from 'lucide-react';

type SortField = 'name' | 'speed' | 'orbit' | 'category';
type SortDirection = 'asc' | 'desc';

export const PlanetarySpeedsView = () => {
  const [expandedBody, setExpandedBody] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('speed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(CELESTIAL_BODY_SPEEDS.map(b => b.category)))];

  // Filter and sort bodies
  const filteredBodies = CELESTIAL_BODY_SPEEDS
    .filter(b => filterCategory === 'all' || b.category === filterCategory)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'speed':
          comparison = b.degreesPerDay - a.degreesPerDay; // Fastest first
          break;
        case 'orbit':
          comparison = a.orbitalYears - b.orbitalYears;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSpeedBadge = (body: CelestialBodySpeed) => {
    if (body.degreesPerDay >= 1) {
      return <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">⚡ Fast</span>;
    } else if (body.degreesPerDay >= 0.01) {
      return <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">→ Moderate</span>;
    } else if (body.degreesPerDay > 0.001) {
      return <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">🐢 Slow</span>;
    } else if (body.degreesPerDay > 0) {
      return <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">🦥 Very Slow</span>;
    } else {
      return <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">📍 Fixed</span>;
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      luminaries: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
      personal: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      social: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      transpersonal: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
      points: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      asteroids: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
      tno: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30'
    };
    return colors[category] || 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl mb-2 flex items-center justify-center gap-3">
          <Gauge className="text-primary" size={28} />
          Planetary Speeds Reference
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Understanding how fast each celestial body moves helps you interpret transits.
          The Moon races through a sign in 2.5 days, while Sedna takes 950 years!
        </p>
      </div>

      {/* Speed Scale Visualization */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-card/80 to-card border border-border">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Zap size={18} className="text-primary" />
          Speed Scale: Fastest to Slowest
        </h3>
        <div className="relative h-12 rounded-lg bg-secondary/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            <div className="absolute left-[2%] flex flex-col items-center">
              <span className="text-2xl">☽</span>
              <span className="text-[10px] text-muted-foreground">Moon</span>
            </div>
            <div className="absolute left-[8%] flex flex-col items-center">
              <span className="text-lg">☿</span>
              <span className="text-[10px] text-muted-foreground">Mercury</span>
            </div>
            <div className="absolute left-[10%] flex flex-col items-center">
              <span className="text-lg">♀</span>
              <span className="text-[10px] text-muted-foreground">Venus</span>
            </div>
            <div className="absolute left-[12%] flex flex-col items-center">
              <span className="text-lg">☉</span>
              <span className="text-[10px] text-muted-foreground">Sun</span>
            </div>
            <div className="absolute left-[20%] flex flex-col items-center">
              <span className="text-lg">♂</span>
              <span className="text-[10px] text-muted-foreground">Mars</span>
            </div>
            <div className="absolute left-[35%] flex flex-col items-center">
              <span className="text-lg">♃</span>
              <span className="text-[10px] text-muted-foreground">Jupiter</span>
            </div>
            <div className="absolute left-[50%] flex flex-col items-center">
              <span className="text-lg">♄</span>
              <span className="text-[10px] text-muted-foreground">Saturn</span>
            </div>
            <div className="absolute left-[65%] flex flex-col items-center">
              <span className="text-lg">♅</span>
              <span className="text-[10px] text-muted-foreground">Uranus</span>
            </div>
            <div className="absolute left-[78%] flex flex-col items-center">
              <span className="text-lg">♆</span>
              <span className="text-[10px] text-muted-foreground">Neptune</span>
            </div>
            <div className="absolute left-[88%] flex flex-col items-center">
              <span className="text-lg">♇</span>
              <span className="text-[10px] text-muted-foreground">Pluto</span>
            </div>
            <div className="absolute left-[95%] flex flex-col items-center">
              <span className="text-xs">⯲</span>
              <span className="text-[10px] text-muted-foreground">Sedna</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>13°/day</span>
          <span>1°/day</span>
          <span>1°/month</span>
          <span>1°/year</span>
          <span>1°/decade</span>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Bodies' : getCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Sort by:</label>
          <div className="flex gap-1">
            {[
              { field: 'speed' as SortField, label: 'Speed' },
              { field: 'orbit' as SortField, label: 'Orbit' },
              { field: 'name' as SortField, label: 'Name' },
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  sortField === field
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {label}
                {sortField === field && (
                  <span className="ml-1">{sortDirection === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bodies Grid */}
      <div className="space-y-3">
        {filteredBodies.map((body) => (
          <div
            key={body.name}
            className={`rounded-xl border bg-gradient-to-r ${getCategoryColor(body.category)} transition-all duration-200`}
          >
            {/* Main Row */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedBody(expandedBody === body.name ? null : body.name)}
            >
              <div className="flex items-center gap-4">
                {/* Symbol */}
                <div className="text-3xl w-12 text-center">{body.symbol}</div>
                
                {/* Name & Category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{body.name}</h3>
                    {getSpeedBadge(body)}
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-secondary/50">
                      {getCategoryLabel(body.category)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{body.summary}</p>
                </div>
                
                {/* Speed Info */}
                <div className="text-right hidden sm:block">
                  <div className="font-mono text-sm">{body.averageSpeed}</div>
                  <div className="text-xs text-muted-foreground">{body.timeInSign} per sign</div>
                </div>
                
                {/* Orbital Period */}
                <div className="text-right hidden md:block">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={14} className="text-muted-foreground" />
                    <span>{body.orbitalPeriod}</span>
                  </div>
                </div>
                
                {/* Expand Button */}
                <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                  {expandedBody === body.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>
            
            {/* Expanded Details */}
            {expandedBody === body.name && (
              <div className="px-4 pb-4 pt-0 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Meaning</h4>
                      <p className="text-sm">{body.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Speed Note</h4>
                      <p className="text-sm text-muted-foreground">{body.speedNote}</p>
                    </div>
                    
                    {body.discovery && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Discovered:</span>
                        <span>{body.discovery}</span>
                      </div>
                    )}
                    
                    {body.diameter && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Diameter:</span>
                        <span>{body.diameter}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Stats */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground">Average Speed</div>
                        <div className="font-mono font-medium">{body.averageSpeed}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground">Time in Each Sign</div>
                        <div className="font-medium">{body.timeInSign}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground">Full Zodiac Orbit</div>
                        <div className="font-medium">{body.orbitalPeriod}</div>
                      </div>
                      {body.orbitalYears > 0 && body.orbitalYears < 1000 && (
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <div className="text-xs text-muted-foreground">Orbital Years</div>
                          <div className="font-medium">{body.orbitalYears.toFixed(2)} years</div>
                        </div>
                      )}
                    </div>
                    
                    {body.retrogradeFrequency && (
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground">Retrograde Pattern</div>
                        <div className="text-sm">
                          {body.retrogradeFrequency} • Duration: {body.retrogradeDuration}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Why Speed Matters */}
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Why This Matters for Your Chart</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {body.degreesPerDay >= 1 ? (
                          `${body.name} transits are brief but frequent. You'll experience ${body.name} aspects to your natal planets multiple times per year. These transits set the daily/weekly rhythm of life.`
                        ) : body.degreesPerDay >= 0.01 ? (
                          `${body.name} transits are significant life chapters. When ${body.name} aspects your natal planets, themes last months and mark memorable periods in your biography.`
                        ) : body.degreesPerDay > 0 ? (
                          `${body.name} is a generational marker. Its sign placement is shared by your entire age cohort. House placement and natal aspects are more personal to you.`
                        ) : (
                          `${body.name} is a calculated point fixed in your natal chart. Its influence is constant throughout your life based on its house and aspects.`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fun Facts Footer */}
      <div className="mt-8 p-6 rounded-xl bg-card border border-border">
        <h3 className="font-medium mb-4">⏱️ Quick Speed Facts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-xl">☽</span>
            <div>
              <strong>Why 365 vs 360?</strong>
              <p className="text-muted-foreground">The Sun moves ~0.986°/day, so 365.25 days × 0.986° ≈ 360°. The slight difference is why we have leap years!</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">♇</span>
            <div>
              <strong>Pluto's Wild Orbit</strong>
              <p className="text-muted-foreground">Pluto spends only 12 years in Scorpio but 30 years in Taurus due to its highly elliptical orbit.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">⯲</span>
            <div>
              <strong>Sedna's Journey</strong>
              <p className="text-muted-foreground">If Sedna started its orbit when the pyramids were built, it still wouldn't be halfway around!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};