/**
 * Interactive Astrocartography Map — SVG-based heat map with world + US close-up views.
 * Clickable cities show angular planet details.
 */

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Globe, MapPin, ChevronRight, Star, X, Maximize2, Minimize2 } from 'lucide-react';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateAstrocartography, SRAstrocartography, AstrocartoCity, AstrocartoIntention, INTENTION_LABELS, INTENTION_EMOJIS } from '@/lib/solarReturnAstrocartography';

// ─── Coordinate projection helpers ─────────────────────────────────

function projectWorld(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

function projectUS(lat: number, lng: number, w: number, h: number) {
  const minLat = 24, maxLat = 50, minLng = -125, maxLng = -66;
  const x = ((lng - minLng) / (maxLng - minLng)) * w;
  const y = ((maxLat - lat) / (maxLat - minLat)) * h;
  return { x, y };
}

function projectHawaii(lat: number, lng: number, w: number, h: number) {
  const minLat = 18, maxLat = 23, minLng = -161, maxLng = -154;
  const insetW = w * 0.15, insetH = h * 0.2, insetX = w * 0.05, insetY = h * 0.72;
  return { x: insetX + ((lng - minLng) / (maxLng - minLng)) * insetW, y: insetY + ((maxLat - lat) / (maxLat - minLat)) * insetH };
}

function projectAlaska(lat: number, lng: number, w: number, h: number) {
  const minLat = 55, maxLat = 72, minLng = -170, maxLng = -140;
  const insetW = w * 0.15, insetH = h * 0.2, insetX = w * 0.01, insetY = h * 0.48;
  return { x: insetX + ((lng - minLng) / (maxLng - minLng)) * insetW, y: insetY + ((maxLat - lat) / (maxLat - minLat)) * insetH };
}

function isHawaii(lat: number, lng: number) { return lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154; }
function isAlaska(lat: number, lng: number) { return lat >= 55 && lat <= 72 && lng >= -170 && lng <= -140; }
function isContinentalUS(lat: number, lng: number) { return lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66; }
function isInUSRegion(lat: number, lng: number) { return isContinentalUS(lat, lng) || isHawaii(lat, lng) || isAlaska(lat, lng); }

function ratingColor(rating: number): string {
  if (rating >= 7.5) return 'hsl(142, 71%, 45%)';
  if (rating >= 5.5) return 'hsl(48, 96%, 53%)';
  if (rating >= 3.5) return 'hsl(25, 95%, 53%)';
  return 'hsl(0, 84%, 60%)';
}

function ratingBg(rating: number): string {
  if (rating >= 7.5) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
  if (rating >= 5.5) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
  if (rating >= 3.5) return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
  return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
}

function ratingLabel(rating: number): string {
  if (rating >= 8) return 'Excellent';
  if (rating >= 6.5) return 'Very good';
  if (rating >= 5) return 'Good';
  if (rating >= 3.5) return 'Mixed';
  return 'Challenging';
}

// ─── Types ──────────────────────────────────────────────────────────

interface Props {
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

type ViewMode = 'world' | 'us';

// ─── Component ──────────────────────────────────────────────────────

export const AstrocartographyMap = ({ srChart, natalChart }: Props) => {
  const [view, setView] = useState<ViewMode>('world');
  const [selectedCity, setSelectedCity] = useState<AstrocartoCity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [intention, setIntention] = useState<AstrocartoIntention>('overall');

  const astrocarto = useMemo(() => calculateAstrocartography(srChart, natalChart), [srChart, natalChart]);

  // Helper to get the active rating for a city based on selected intention
  const cityRating = (c: AstrocartoCity) => c.intentionRatings?.[intention] ?? c.rating;

  // Sort cities by the active intention rating
  const cities = useMemo(() => {
    return [...astrocarto.topCities].sort((a, b) => cityRating(b) - cityRating(a));
  }, [astrocarto.topCities, intention]);

  // Use the stable best/worst from the calculation engine (not array position)
  // Best/worst cities based on current intention filter
  const bestCity = useMemo(() => {
    if (intention === 'overall' && astrocarto.bestBeneficCity) {
      const name = astrocarto.bestBeneficCity.split(',')[0].trim();
      return cities.find(c => c.city === name) || cities[0];
    }
    // For intention filters, best = highest intention rating
    return cities[0];
  }, [cities, astrocarto.bestBeneficCity, intention]);

  const worstCity = useMemo(() => {
    if (intention === 'overall' && astrocarto.worstMaleficCity) {
      const name = astrocarto.worstMaleficCity.split(',')[0].trim();
      return cities.find(c => c.city === name) || cities[cities.length - 1];
    }
    return cities[cities.length - 1];
  }, [cities, astrocarto.worstMaleficCity, intention]);

  // Cities that MUST appear on the map when present
  const MUST_SHOW = new Set([
    'Philadelphia', 'Washington DC', 'Boulder', 'Ann Arbor',
    'Bloomington', 'Miami', 'Charlotte',
  ]);

  // Geographic diversity filter — prevent overlapping labels
  const visibleCities = useMemo(() => {
    let filtered = cities;
    if (view === 'us') {
      filtered = cities.filter(c => isInUSRegion(c.latitude, c.longitude));
    }

    // Always include must-show cities first
    const mustShow = filtered.filter(c => MUST_SHOW.has(c.city));
    const rest = filtered.filter(c => !MUST_SHOW.has(c.city));

    // Prioritize green-rated cities (>=7.5) for current intention so travel-worthy spots appear
    const greenCities = rest.filter(c => cityRating(c) >= 7.5);
    const otherCities = rest.filter(c => cityRating(c) < 7.5);
    const prioritizedRest = [...greenCities, ...otherCities];

    const selected: AstrocartoCity[] = [...mustShow];
    const minDist = view === 'us' ? 1.5 : 6;
    
    for (const city of prioritizedRest) {
      const tooClose = selected.some(s => {
        const dlat = Math.abs(s.latitude - city.latitude);
        const dlng = Math.abs(s.longitude - city.longitude);
        return dlat < minDist && dlng < minDist;
      });
      if (!tooClose) {
        selected.push(city);
      }
      if (selected.length >= (view === 'us' ? 22 : 20)) break;
    }
    return selected;
  }, [cities, view]);

  const allVisibleCities = useMemo(() => {
    if (view === 'us') {
      return cities.filter(c => isInUSRegion(c.latitude, c.longitude));
    }
    return cities;
  }, [cities, view]);

  const mapW = 800;
  const mapH = view === 'us' ? 500 : 400;
  
  const projectCity = (lat: number, lng: number) => {
    if (view === 'us') {
      if (isHawaii(lat, lng)) return projectHawaii(lat, lng, mapW, mapH);
      if (isAlaska(lat, lng)) return projectAlaska(lat, lng, mapW, mapH);
      return projectUS(lat, lng, mapW, mapH);
    }
    return projectWorld(lat, lng, mapW, mapH);
  };

  // Label collision avoidance — try more positions, prefer side labels for dense areas
  const labelPositions = useMemo(() => {
    const positions: Record<string, { dx: number; dy: number; anchor: string }> = {};
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const estimateWidth = (name: string) => name.length * (view === 'us' ? 5.2 : 4.2);
    
    // Sort must-show cities first so they get priority label positions
    const sortedCities = [...visibleCities].sort((a, b) => {
      const aM = MUST_SHOW.has(a.city) ? 0 : 1;
      const bM = MUST_SHOW.has(b.city) ? 0 : 1;
      return aM - bM;
    });
    
    for (const city of sortedCities) {
      const { x, y } = projectCity(city.latitude, city.longitude);
      const w = estimateWidth(city.city);
      
      // 6 candidate positions: right, left, above, below, upper-right, lower-left
      const candidates = [
        { dx: (view === 'us' ? 8 : 7), dy: 0, anchor: 'start' },
        { dx: -(view === 'us' ? 8 : 7), dy: 0, anchor: 'end' },
        { dx: 0, dy: -(view === 'us' ? 10 : 8), anchor: 'middle' },
        { dx: 0, dy: (view === 'us' ? 14 : 11), anchor: 'middle' },
        { dx: (view === 'us' ? 8 : 7), dy: -(view === 'us' ? 8 : 6), anchor: 'start' },
        { dx: -(view === 'us' ? 8 : 7), dy: (view === 'us' ? 8 : 6), anchor: 'end' },
      ];
      
      let best = candidates[0];
      for (const c of candidates) {
        const lx = x + c.dx - (c.anchor === 'middle' ? w / 2 : c.anchor === 'end' ? w : 0);
        const ly = y + c.dy;
        const collision = placed.some(p => 
          Math.abs(p.x - lx) < (p.w + w) / 2 + 3 && Math.abs(p.y - ly) < 9
        );
        if (!collision) { best = c; break; }
      }
      
      const lx = x + best.dx - (best.anchor === 'middle' ? w / 2 : best.anchor === 'end' ? w : 0);
      placed.push({ x: lx + w / 2, y: y + best.dy, w, h: 9 });
      positions[city.city] = best;
    }
    return positions;
  }, [visibleCities, view, mapW, mapH]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
            <Globe size={16} className="text-primary" />
            Astrocartography — Where to Celebrate
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => { setView('world'); setSelectedCity(null); }}
              className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm border transition-colors ${
                view === 'world'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              World
            </button>
            <button
              onClick={() => { setView('us'); setSelectedCity(null); }}
              className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm border transition-colors ${
                view === 'us'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              USA Close-Up
            </button>
          </div>
        </div>

        {/* Intention filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(Object.keys(INTENTION_LABELS) as AstrocartoIntention[]).map(key => (
            <button
              key={key}
              onClick={() => setIntention(key)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-widest rounded-sm border transition-colors ${
                intention === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {INTENTION_EMOJIS[key]} {INTENTION_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Best / Most Challenging summary */}
        {bestCity && worstCity && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="border border-green-500/30 rounded-sm p-3 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
              onClick={() => setSelectedCity(bestCity)}
            >
              <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-medium mb-1">{intention !== 'overall' ? `Best for ${INTENTION_LABELS[intention]}` : 'Best City'}</p>
              <p className="text-lg font-medium text-foreground">{bestCity.city}, {bestCity.country}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating: {cityRating(bestCity)}/10{intention !== 'overall' ? ` for ${INTENTION_LABELS[intention]}` : ''}</p>
            </div>
            <div
              className="border border-amber-500/30 rounded-sm p-3 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
              onClick={() => setSelectedCity(worstCity)}
            >
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium mb-1">Most Challenging</p>
              <p className="text-lg font-medium text-foreground">{worstCity.city}, {worstCity.country}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating: {cityRating(worstCity)}/10</p>
            </div>
          </div>
        )}

        {/* SVG Map */}
        <div className="border border-border rounded-sm overflow-hidden bg-secondary/30 relative">
          <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full h-auto" style={{ minHeight: '250px' }}>
            {/* Grid lines */}
            {view === 'world' ? (
              <>
                {[-60, -30, 0, 30, 60].map(lat => {
                  const { y } = projectCity(lat, 0);
                  return <line key={`lat${lat}`} x1={0} y1={y} x2={mapW} y2={y} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {[-120, -60, 0, 60, 120].map(lng => {
                  const { x } = projectCity(0, lng);
                  return <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={mapH} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {(() => { const { y } = projectCity(0, 0); return <line x1={0} y1={y} x2={mapW} y2={y} stroke="currentColor" className="text-border" strokeWidth={1} opacity={0.3} />; })()}
              </>
            ) : (
              <>
                {[25, 30, 35, 40, 45, 50].map(lat => {
                  const { y } = projectUS(lat, -100, mapW, mapH);
                  return <line key={`lat${lat}`} x1={0} y1={y} x2={mapW} y2={y} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {[-120, -110, -100, -90, -80, -70].map(lng => {
                  const { x } = projectUS(40, lng, mapW, mapH);
                  return <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={mapH} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {(() => {
                  const tl = projectHawaii(23, -161, mapW, mapH);
                  const br = projectHawaii(18, -154, mapW, mapH);
                  return <rect x={tl.x - 4} y={tl.y - 4} width={br.x - tl.x + 8} height={br.y - tl.y + 8} fill="none" stroke="currentColor" className="text-border" strokeWidth={1} strokeDasharray="3 3" rx={2} />;
                })()}
                <text x={mapW * 0.05} y={mapH * 0.71} className="fill-muted-foreground" fontSize={8} opacity={0.5}>HAWAII</text>
                {(() => {
                  const tl = projectAlaska(72, -170, mapW, mapH);
                  const br = projectAlaska(55, -140, mapW, mapH);
                  return <rect x={tl.x - 4} y={tl.y - 4} width={br.x - tl.x + 8} height={br.y - tl.y + 8} fill="none" stroke="currentColor" className="text-border" strokeWidth={1} strokeDasharray="3 3" rx={2} />;
                })()}
                <text x={mapW * 0.01} y={mapH * 0.47} className="fill-muted-foreground" fontSize={8} opacity={0.5}>ALASKA</text>
              </>
            )}

            {/* Heat glow */}
            <defs>
              {visibleCities.map(city => (
                <radialGradient key={`grad-${city.city}`} id={`glow-${city.city.replace(/\s/g, '')}`}>
                  <stop offset="0%" stopColor={ratingColor(cityRating(city))} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={ratingColor(cityRating(city))} stopOpacity={0} />
                </radialGradient>
              ))}
            </defs>

            {visibleCities.map(city => {
              const { x, y } = projectCity(city.latitude, city.longitude);
              return <circle key={`glow-c-${city.city}`} cx={x} cy={y} r={view === 'us' ? 30 : 25} fill={`url(#glow-${city.city.replace(/\s/g, '')})`} />;
            })}

            {/* City dots + labels */}
            {visibleCities.map(city => {
              const { x, y } = projectCity(city.latitude, city.longitude);
              const isSelected = selectedCity?.city === city.city;
              const dotR = view === 'us' ? 5 : 4;
              const lp = labelPositions[city.city] || { dx: 0, dy: -10, anchor: 'middle' };
              return (
                <g key={city.city} className="cursor-pointer" onClick={() => setSelectedCity(isSelected ? null : city)}>
                  {isSelected && (
                    <circle cx={x} cy={y} r={dotR + 4} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} opacity={0.7}>
                      <animate attributeName="r" values={`${dotR + 3};${dotR + 6};${dotR + 3}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={x} cy={y} r={dotR} fill={ratingColor(cityRating(city))} stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--background))'} strokeWidth={isSelected ? 2 : 1} opacity={0.9} />
                  <text x={x + lp.dx} y={y + lp.dy} textAnchor={lp.anchor} className="fill-foreground" fontSize={view === 'us' ? 9 : 7} fontWeight={isSelected ? 600 : 400} opacity={isSelected ? 1 : 0.65}>
                    {city.city}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-sm px-3 py-1.5 border border-border/50">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Rating:</span>
            <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(142, 71%, 45%)' }} /> Excellent</span>
            <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(48, 96%, 53%)' }} /> Good</span>
            <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(25, 95%, 53%)' }} /> Mixed</span>
            <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(0, 84%, 60%)' }} /> Challenging</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-2 uppercase tracking-widest">
          {view === 'world' ? 'Click USA Close-Up for detailed US cities including Hawaii' : 'Click a city dot to see what energy that location activates'}
        </p>
      </div>

      {/* Selected city detail card */}
      {selectedCity && (
        <CityDetailCard city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}

      {/* City list */}
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="bg-secondary px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {view === 'us' ? 'US' : 'All'} Cities by Rating
          </span>
          <span className="text-[10px] text-muted-foreground">{allVisibleCities.length} locations</span>
        </div>
        <div className="px-3 py-2 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {allVisibleCities.filter(c => !searchQuery || c.city.toLowerCase().includes(searchQuery.toLowerCase()) || c.country.toLowerCase().includes(searchQuery.toLowerCase())).map(city => (
            <button
              key={city.city}
              onClick={() => setSelectedCity(selectedCity?.city === city.city ? null : city)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-secondary/50 ${
                selectedCity?.city === city.city ? 'bg-primary/5' : ''
              }`}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ratingColor(cityRating(city)) }} />
              <span className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{city.city}</span>
                <span className="text-xs text-muted-foreground ml-1">{city.country}</span>
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-sm border ${ratingBg(cityRating(city))}`}>
                {cityRating(city)}
              </span>
              <ChevronRight size={14} className="text-muted-foreground/40 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      {astrocarto.interpretation && (
        <div className="border border-border rounded-sm p-4 bg-card">
          <p className="text-sm text-muted-foreground leading-relaxed">{astrocarto.interpretation}</p>
        </div>
      )}
    </div>
  );
};

// ─── Deep Interpretation Data ───────────────────────────────────────

const ANGLE_LABELS: Record<string, string> = {
  ASC: 'Rising (Identity & Approach)',
  MC: 'Midheaven (Career & Public Life)',
  DSC: 'Setting (Relationships)',
  IC: 'Nadir (Home & Roots)',
};

const PLANET_PLAIN: Record<string, string> = {
  Sun: 'Your vitality and purpose',
  Moon: 'Your emotions and comfort',
  Mercury: 'Your communication and thinking',
  Venus: 'Your love and aesthetic sense',
  Mars: 'Your drive and assertiveness',
  Jupiter: 'Your growth and opportunities',
  Saturn: 'Your discipline and responsibility',
  Uranus: 'Your freedom and surprises',
  Neptune: 'Your dreams and intuition',
  Pluto: 'Your transformation and power',
};

const DEEP: Record<string, Record<string, { vibe: string; bestFor: string[]; watchFor: string[]; dayToDay: string }>> = {
  Sun: {
    ASC: { vibe: 'You feel like the main character. People notice you, remember your name, treat you as important.', bestFor: ['Personal reinvention', 'Starting a business', 'Leadership roles'], watchFor: ['Ego inflation', 'Burnout from visibility'], dayToDay: 'You wake up purposeful. People approach with opportunities. You feel seen everywhere.' },
    MC: { vibe: 'Career supercharged. Public reputation soars, bosses notice you, professional goals materialize fast.', bestFor: ['Promotions', 'Public speaking', 'Building authority'], watchFor: ['Work-life imbalance', 'Overidentifying with career'], dayToDay: 'Work feels meaningful. Milestones happen. Recognition comes without trying.' },
    DSC: { vibe: 'Powerful partnerships form. You attract confident, sometimes dominant, partners.', bestFor: ['Meeting a life partner', 'Business partnerships'], watchFor: ['Losing yourself in someone\'s vision', 'Power struggles'], dayToDay: 'Significant people enter your life. One-on-one connections feel fated.' },
    IC: { vibe: 'Focus turns inward — home, family, emotional foundation. Purpose through private life.', bestFor: ['Home renovation', 'Family healing', 'Inner work'], watchFor: ['Feeling invisible professionally'], dayToDay: 'Home feels like sanctuary. Family time prioritized. External validation matters less.' },
  },
  Moon: {
    ASC: { vibe: 'Emotional antenna fully extended. You feel everything deeply — yours and everyone else\'s.', bestFor: ['Therapy/healing work', 'Creative expression', 'Psychic development'], watchFor: ['Emotional overwhelm', 'Absorbing others\' moods'], dayToDay: 'Your face shows every feeling. People come to you for comfort. Tears flow easily.' },
    MC: { vibe: 'Emotional life becomes visible. Career involves nurturing, food, homes, or caring for others.', bestFor: ['Counseling', 'Real estate', 'Hospitality'], watchFor: ['Emotionally exposed at work', 'Reputation fluctuating'], dayToDay: 'Work feels personal. Instincts guide decisions. Public responds to authenticity.' },
    DSC: { vibe: 'Relationships deeply emotional. Partners who nurture you or need nurturing.', bestFor: ['Moving in together', 'Starting a family', 'Deep bonding'], watchFor: ['Codependency', 'Emotionally needy partners'], dayToDay: 'You crave closeness. Partners become family. Emotional conversations natural.' },
    IC: { vibe: 'Moon\'s home court. Emotional security peaks. Profoundly rooted, connected to ancestry.', bestFor: ['Healing childhood wounds', 'Buying a home', 'Recovery'], watchFor: ['Becoming too insular', 'Regressing into old patterns'], dayToDay: 'Home is your refueling station. Cooking, nesting feel sacred. Dreams vivid.' },
  },
  Venus: {
    ASC: { vibe: 'Ultimate magnetism. You radiate beauty, charm, social grace without effort. Love finds you.', bestFor: ['Dating', 'Social events', 'Beauty/fashion', 'Networking'], watchFor: ['Overindulgence', 'Vanity', 'Superficial attention'], dayToDay: 'You look and feel beautiful. Compliments flow. Social invitations pile up.' },
    MC: { vibe: 'Professional life blessed by charm and creativity. Success through diplomacy, art, or luxury.', bestFor: ['Creative careers', 'Negotiations', 'Public relations'], watchFor: ['Liked but not respected', 'Coasting on charm'], dayToDay: 'Work feels pleasurable. Colleagues friendly. Environments aesthetically pleasing.' },
    DSC: { vibe: 'The classic love line. Single? Meet someone here. Partnered? Romance deepens.', bestFor: ['Finding love', 'Honeymoon', 'Marriage'], watchFor: ['Idealizing a partner', 'Avoiding conflict'], dayToDay: 'Romance in the air. Partners affectionate. Social life revolves around beauty.' },
    IC: { vibe: 'Home becomes beautiful sanctuary. Comfort, décor, soul-feeding spaces.', bestFor: ['Home decorating', 'Hosting', 'Family reconciliation'], watchFor: ['Overspending on home', 'Becoming a homebody'], dayToDay: 'Living space feels like a magazine. Elaborate meals. Fresh flowers. Peace at home.' },
  },
  Mars: {
    ASC: { vibe: 'Raw energy pours through. Bolder, competitive — but prone to anger and confrontation.', bestFor: ['Athletic training', 'Bold ventures', 'Physical challenges'], watchFor: ['Anger management', 'Injuries', 'Aggression'], dayToDay: 'You wake up wired. Arguments come easily. Physical activity essential.' },
    MC: { vibe: 'Career ambition on fire. You fight for what you want — but burnout and politics are risks.', bestFor: ['Competitive industries', 'Entrepreneurship', 'Career battles'], watchFor: ['Professional enemies', 'Burnout', 'Too aggressive'], dayToDay: 'Work pace relentless. Competition motivates. Victories feel hard-won.' },
    DSC: { vibe: 'Relationships become battlegrounds or passionately intense. Chemistry OR fights.', bestFor: ['Passionate affairs', 'Standing up for yourself'], watchFor: ['Domestic arguments', 'Controlling partners', 'Legal disputes'], dayToDay: 'Partners push buttons. Arguments frequent. Sexual energy high.' },
    IC: { vibe: 'Home restless, sometimes combative. Renovations, family arguments, feeling unsettled.', bestFor: ['Home renovation', 'Building projects'], watchFor: ['Family fights', 'Plumbing/electrical issues', 'Insomnia'], dayToDay: 'House under construction — literally or emotionally. Restless nights.' },
  },
  Jupiter: {
    ASC: { vibe: 'Optimistic, generous, lucky. Opportunities arrive on their own. Seen as wise and warm.', bestFor: ['Travel', 'Teaching', 'Publishing', 'Legal matters'], watchFor: ['Overcommitting', 'Weight gain', 'Overconfidence'], dayToDay: 'You smile more. Strangers helpful. Lucky breaks happen. Philosophical contentment.' },
    MC: { vibe: 'The single best career placement. Expansion, recognition, raises, opportunities pour in.', bestFor: ['Job offers', 'Promotions', 'Starting a business'], watchFor: ['Overpromising', 'Growing too fast'], dayToDay: 'Career doors open. Mentors appear. Growth effortless. Income increases.' },
    DSC: { vibe: 'Partnerships bring growth and abundance. Generous, wise, or wealthy partners.', bestFor: ['Business partnerships', 'Marriage', 'Meeting mentors'], watchFor: ['Giving too much', 'Partners who overpromise'], dayToDay: 'Relationships expand your world. Generosity flows both ways.' },
    IC: { vibe: 'Home and family expand. Bigger house, more gatherings, emotional abundance.', bestFor: ['Buying a home', 'Family celebrations', 'Hosting'], watchFor: ['Overspending', 'Family taking advantage'], dayToDay: 'Home feels abundant. Fridge full. Family gatherings joyful.' },
  },
  Saturn: {
    ASC: { vibe: 'Life feels heavier. Responsibilities mount. You appear older, more serious. Foundational year.', bestFor: ['Building discipline', 'Serious regimens', 'Long-term commitments'], watchFor: ['Depression', 'Isolation', 'Feeling old'], dayToDay: 'More weight on shoulders. People respect but don\'t approach casually.' },
    MC: { vibe: 'Career demands accountability. No shortcuts. What you build now lasts.', bestFor: ['Long-term career planning', 'Management', 'Credentialing'], watchFor: ['Setbacks', 'Feeling unappreciated', 'Imposter syndrome'], dayToDay: 'Work demanding but real. Respect earned through effort.' },
    DSC: { vibe: 'Relationships tested. Commitments solidified or broken. Partnership reality hits.', bestFor: ['Getting real', 'Ending what doesn\'t work', 'Serious commitments'], watchFor: ['Loneliness', 'Feeling unloved', 'Cold partners'], dayToDay: 'Partners hold you accountable. Fun scarce. You learn commitment.' },
    IC: { vibe: 'Home and family weigh on you. Obligations, repairs, emotional foundations need work.', bestFor: ['Family obligations', 'Home repairs', 'Boundaries'], watchFor: ['Family burdens', 'Feeling trapped', 'Grief'], dayToDay: 'House needs work. Parents need attention. You face your upbringing.' },
  },
  Uranus: {
    ASC: { vibe: 'Electric, ready to reinvent. Sudden changes to appearance, lifestyle, identity.', bestFor: ['Self-reinvention', 'Breaking free', 'Tech projects'], watchFor: ['Impulsive decisions', 'Alienating people'], dayToDay: 'Every day different. Change hair, clothes, opinions. Old friends barely recognize you.' },
    MC: { vibe: 'Career takes unexpected turns — sudden changes, unconventional paths, tech breakthroughs.', bestFor: ['Tech startups', 'Freelancing', 'Career pivots'], watchFor: ['Sudden job loss', 'Unreliable income'], dayToDay: 'Work unpredictable. Opportunities appear and vanish. Career zigzags.' },
    DSC: { vibe: 'Relationships need space, freedom, excitement — or they break. Unusual partners.', bestFor: ['Open-minded dating', 'Non-traditional relationships'], watchFor: ['Commitment-phobia', 'Partners ghosting'], dayToDay: 'Partners surprise constantly. Rules keep changing. Need excitement or you bolt.' },
    IC: { vibe: 'Home disrupted — sudden moves, unexpected roommates, emotional breakthroughs.', bestFor: ['Moving cities', 'Smart home upgrades', 'Breaking patterns'], watchFor: ['Displacement', 'Feeling ungrounded'], dayToDay: 'House changes constantly. Might move twice. Breakthroughs without warning.' },
  },
  Neptune: {
    ASC: { vibe: 'Boundaries dissolve. More empathic, artistic, spiritual — but susceptible to confusion.', bestFor: ['Artistic pursuits', 'Spiritual retreats', 'Meditation'], watchFor: ['Identity confusion', 'Being used', 'Escapism'], dayToDay: 'Reality dreamy. Pick up everyone\'s energy. Art moves you to tears. Need more sleep.' },
    MC: { vibe: 'Career infused with creativity and spirituality — but direction feels foggy.', bestFor: ['Music/film/art', 'Spiritual teaching', 'Healing'], watchFor: ['Professional confusion', 'Deception at work'], dayToDay: 'Work inspired but unclear. Dream big, struggle with execution.' },
    DSC: { vibe: 'Relationships soulful, fated — but confusing. Idealize partners, miss red flags.', bestFor: ['Soulmate experiences', 'Spiritual partnerships'], watchFor: ['Partner deception', 'Codependency', 'Fantasy over reality'], dayToDay: 'Partners feel like destiny. Love transcendent but can\'t always tell what\'s real.' },
    IC: { vibe: 'Home becomes dream sanctuary — or place of confusion and emotional fog.', bestFor: ['Meditation space', 'Living near water', 'Dream journaling'], watchFor: ['Water damage', 'Family boundary issues', 'Escapism'], dayToDay: 'Home magical or confusing. Lose things. Vivid dreams.' },
  },
  Pluto: {
    ASC: { vibe: 'Deep personal transformation. Shed an identity. Power dynamics visible everywhere.', bestFor: ['Therapy', 'Power reclamation', 'Shadow work'], watchFor: ['Power struggles', 'Obsessive behavior', 'Control'], dayToDay: 'People love or fear you. Nothing surface-level. Deep truths confronted.' },
    MC: { vibe: 'Career undergoes radical transformation. Institutional power — gain it or be crushed.', bestFor: ['Career transformation', 'Power positions', 'Investigation'], watchFor: ['Power plays', 'Betrayal by authority'], dayToDay: 'Work feels like power game. Office politics intense. Rise or face rebirth.' },
    DSC: { vibe: 'Relationships transformative, obsessive, intense. Power dynamics magnified.', bestFor: ['Couples therapy', 'Relationship shadows', 'Sexual healing'], watchFor: ['Obsession', 'Jealousy', 'Manipulation'], dayToDay: 'Partners trigger deepest wounds. Nothing casual. Love feels like life or death.' },
    IC: { vibe: 'Foundations excavated and rebuilt. Family secrets surface. Childhood demands change.', bestFor: ['Family therapy', 'Genealogy', 'Psychological work'], watchFor: ['Family crises', 'Home power struggles'], dayToDay: 'Emotional basement ripped open. Family dynamics shift dramatically.' },
  },
  Mercury: {
    ASC: { vibe: 'Mind sharp, communication peaks. Articulate, curious, quick-witted.', bestFor: ['Writing', 'Public speaking', 'Learning', 'Networking'], watchFor: ['Overthinking', 'Nervous energy', 'Scattered focus'], dayToDay: 'Ideas flow constantly. Conversations stimulating. Read more, write more.' },
    MC: { vibe: 'Career success through communication — writing, teaching, speaking, media.', bestFor: ['Publishing', 'Teaching', 'Media', 'Sales'], watchFor: ['Being "all talk"', 'Communication mishaps'], dayToDay: 'Emails, meetings, presentations dominate. Words carry professional weight.' },
    DSC: { vibe: 'Intellectual partnerships flourish. Partners who stimulate your mind.', bestFor: ['Meeting intellectual equals', 'Writing collaborations'], watchFor: ['All talk no depth', 'Mental without emotional'], dayToDay: 'Talk for hours with partners. Intellectual chemistry defines relationships.' },
    IC: { vibe: 'Mental activity at home. Working from home, studying, family conversations.', bestFor: ['Remote work', 'Home study', 'Journaling'], watchFor: ['Mental restlessness', 'Insomnia'], dayToDay: 'Home desk becomes command central. Books pile up. Mind never fully rests.' },
  },
};

// ─── City Detail Card ───────────────────────────────────────────────

const CityDetailCard = ({ city, onClose }: { city: AstrocartoCity; onClose: () => void }) => (
  <div className="border border-primary/30 rounded-sm p-5 bg-card space-y-4 relative">
    <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
      <X size={16} />
    </button>

    <div>
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={16} className="text-primary" />
        <h4 className="text-base font-medium text-foreground">{city.city}, {city.country}</h4>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-sm border ${ratingBg(city.rating)}`}>
        {city.rating}/10 — {ratingLabel(city.rating)}
      </span>
    </div>

    {/* Intention ratings breakdown */}
    {city.intentionRatings && (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {(Object.keys(INTENTION_LABELS) as AstrocartoIntention[]).filter(k => k !== 'overall').map(key => (
          <div key={key} className="border border-border/50 rounded-sm p-2 bg-secondary/20 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">{INTENTION_EMOJIS[key]} {INTENTION_LABELS[key].split(' ')[0]}</p>
            <p className="text-sm font-medium" style={{ color: ratingColor(city.intentionRatings[key]) }}>
              {city.intentionRatings[key]}
            </p>
          </div>
        ))}
      </div>
    )}

    <p className="text-sm text-muted-foreground leading-relaxed">{city.summary}</p>

    {city.angularPlanets.length > 0 && (
      <div className="space-y-3">
        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">What's Activated Here</h5>
        {city.angularPlanets.map((ap, i) => {
          const deep = DEEP[ap.planet]?.[ap.angle];
          return (
            <div key={i} className="border border-border/50 rounded-sm bg-secondary/30 overflow-hidden">
              <div className="flex items-start gap-3 p-3">
                <span
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: ratingColor(
                    ['Venus', 'Jupiter', 'Sun'].includes(ap.planet) ? 8 :
                    ['Saturn', 'Mars', 'Pluto'].includes(ap.planet) ? 3 : 5.5
                  ) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {PLANET_PLAIN[ap.planet] || ap.planet} — on the {ANGLE_LABELS[ap.angle] || ap.angle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Orb: {ap.orb}° — {ap.orb <= 3 ? 'very strong influence' : ap.orb <= 5 ? 'strong influence' : 'moderate influence'}
                  </p>
                </div>
              </div>

              {deep && (
                <div className="px-3 pb-3 space-y-3 border-t border-border/30 pt-3 ml-5">
                  <p className="text-sm text-foreground/90 leading-relaxed italic">"{deep.vibe}"</p>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground/80">Day-to-day feel:</span> {deep.dayToDay}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-medium mb-1">Best For</p>
                      <ul className="space-y-0.5">
                        {deep.bestFor.map((item, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium mb-1">Watch For</p>
                      <ul className="space-y-0.5">
                        {deep.watchFor.map((item, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);
