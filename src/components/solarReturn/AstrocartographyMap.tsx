/**
 * Interactive Astrocartography Map — SVG-based heat map with world + US close-up views.
 * Clickable cities show angular planet details.
 */

import { useState, useMemo } from 'react';
import { Globe, MapPin, ChevronRight, Star, X, Maximize2, Minimize2 } from 'lucide-react';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateAstrocartography, SRAstrocartography, AstrocartoCity } from '@/lib/solarReturnAstrocartography';

// ─── Coordinate projection helpers ─────────────────────────────────

// Simple equirectangular projection
function projectWorld(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

function projectUS(lat: number, lng: number, w: number, h: number) {
  // Continental US focus: lat 24–50, lng -125–-66
  // Hawaii/Alaska get separate insets
  const minLat = 24, maxLat = 50, minLng = -125, maxLng = -66;
  const x = ((lng - minLng) / (maxLng - minLng)) * w;
  const y = ((maxLat - lat) / (maxLat - minLat)) * h;
  return { x, y };
}

// Hawaii inset projection
function projectHawaii(lat: number, lng: number, w: number, h: number) {
  const minLat = 18, maxLat = 23, minLng = -161, maxLng = -154;
  const insetW = w * 0.15;
  const insetH = h * 0.2;
  const insetX = w * 0.05;
  const insetY = h * 0.72;
  const x = insetX + ((lng - minLng) / (maxLng - minLng)) * insetW;
  const y = insetY + ((maxLat - lat) / (maxLat - minLat)) * insetH;
  return { x, y };
}

// Alaska inset projection
function projectAlaska(lat: number, lng: number, w: number, h: number) {
  const minLat = 55, maxLat = 72, minLng = -170, maxLng = -140;
  const insetW = w * 0.15;
  const insetH = h * 0.2;
  const insetX = w * 0.01;
  const insetY = h * 0.48;
  const x = insetX + ((lng - minLng) / (maxLng - minLng)) * insetW;
  const y = insetY + ((maxLat - lat) / (maxLat - minLat)) * insetH;
  return { x, y };
}

function isHawaii(lat: number, lng: number) {
  return lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154;
}

function isAlaska(lat: number, lng: number) {
  return lat >= 55 && lat <= 72 && lng >= -170 && lng <= -140;
}

function isContinentalUS(lat: number, lng: number) {
  return lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66;
}

function isInUSRegion(lat: number, lng: number) {
  return isContinentalUS(lat, lng) || isHawaii(lat, lng) || isAlaska(lat, lng);
}

// Rating → color
function ratingColor(rating: number): string {
  if (rating >= 7.5) return 'hsl(142, 71%, 45%)';  // green
  if (rating >= 5.5) return 'hsl(48, 96%, 53%)';   // gold
  if (rating >= 3.5) return 'hsl(25, 95%, 53%)';   // orange
  return 'hsl(0, 84%, 60%)';                        // red
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

  const astrocarto = useMemo(() => calculateAstrocartography(srChart, natalChart), [srChart, natalChart]);

  const cities = astrocarto.topCities;
  const bestCity = cities[0];
  const worstCity = cities[cities.length - 1];

  const visibleCities = useMemo(() => {
    if (view === 'us') {
      return cities.filter(c => isInUS(c.latitude, c.longitude));
    }
    return cities;
  }, [cities, view]);

  const mapW = 800;
  const mapH = view === 'us' ? 380 : 400;
  const project = view === 'us'
    ? (lat: number, lng: number) => projectUS(lat, lng, mapW, mapH)
    : (lat: number, lng: number) => projectWorld(lat, lng, mapW, mapH);

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

        {/* Best / Most Challenging summary */}
        {bestCity && worstCity && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="border border-green-500/30 rounded-sm p-3 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
              onClick={() => setSelectedCity(bestCity)}
            >
              <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-medium mb-1">Best City</p>
              <p className="text-lg font-medium text-foreground">{bestCity.city}, {bestCity.country}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating: {bestCity.rating}/10</p>
            </div>
            <div
              className="border border-amber-500/30 rounded-sm p-3 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
              onClick={() => setSelectedCity(worstCity)}
            >
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium mb-1">Most Challenging</p>
              <p className="text-lg font-medium text-foreground">{worstCity.city}, {worstCity.country}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating: {worstCity.rating}/10</p>
            </div>
          </div>
        )}

        {/* SVG Map */}
        <div className="border border-border rounded-sm overflow-hidden bg-secondary/30 relative">
          <svg
            viewBox={`0 0 ${mapW} ${mapH}`}
            className="w-full h-auto"
            style={{ minHeight: '250px' }}
          >
            {/* Grid lines */}
            {view === 'world' ? (
              <>
                {/* World grid */}
                {[-60, -30, 0, 30, 60].map(lat => {
                  const { y } = project(lat, 0);
                  return <line key={`lat${lat}`} x1={0} y1={y} x2={mapW} y2={y} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {[-120, -60, 0, 60, 120].map(lng => {
                  const { x } = project(0, lng);
                  return <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={mapH} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {/* Equator */}
                {(() => { const { y } = project(0, 0); return <line x1={0} y1={y} x2={mapW} y2={y} stroke="currentColor" className="text-border" strokeWidth={1} opacity={0.3} />; })()}
              </>
            ) : (
              <>
                {/* US grid */}
                {[25, 30, 35, 40, 45, 50, 55, 60, 65].map(lat => {
                  const { y } = project(lat, -120);
                  return <line key={`lat${lat}`} x1={0} y1={y} x2={mapW} y2={y} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
                {[-160, -150, -140, -130, -120, -110, -100, -90, -80, -70].map(lng => {
                  const { x } = project(40, lng);
                  return <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={mapH} stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray="4 4" />;
                })}
              </>
            )}

            {/* Heat glow behind high-rated cities */}
            <defs>
              {visibleCities.map(city => (
                <radialGradient key={`grad-${city.city}`} id={`glow-${city.city.replace(/\s/g, '')}`}>
                  <stop offset="0%" stopColor={ratingColor(city.rating)} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ratingColor(city.rating)} stopOpacity={0} />
                </radialGradient>
              ))}
            </defs>

            {visibleCities.map(city => {
              const { x, y } = project(city.latitude, city.longitude);
              const r = view === 'us' ? 35 : 25;
              return (
                <circle
                  key={`glow-c-${city.city}`}
                  cx={x} cy={y} r={r}
                  fill={`url(#glow-${city.city.replace(/\s/g, '')})`}
                />
              );
            })}

            {/* City dots */}
            {visibleCities.map(city => {
              const { x, y } = project(city.latitude, city.longitude);
              const isSelected = selectedCity?.city === city.city;
              const dotR = view === 'us' ? 6 : 4.5;
              return (
                <g
                  key={city.city}
                  className="cursor-pointer"
                  onClick={() => setSelectedCity(isSelected ? null : city)}
                >
                  {/* Outer ring for selected */}
                  {isSelected && (
                    <circle cx={x} cy={y} r={dotR + 4} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} opacity={0.7}>
                      <animate attributeName="r" values={`${dotR + 3};${dotR + 6};${dotR + 3}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={x} cy={y} r={dotR}
                    fill={ratingColor(city.rating)}
                    stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={0.9}
                  />
                  {/* Label */}
                  <text
                    x={x} y={y - (view === 'us' ? 10 : 8)}
                    textAnchor="middle"
                    className="fill-foreground"
                    fontSize={view === 'us' ? 10 : 8}
                    fontWeight={isSelected ? 600 : 400}
                    opacity={isSelected ? 1 : 0.7}
                  >
                    {city.city}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-sm px-3 py-1.5 border border-border/50">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Rating:</span>
            <span className="flex items-center gap-1 text-[9px]">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(142, 71%, 45%)' }} /> Excellent
            </span>
            <span className="flex items-center gap-1 text-[9px]">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(48, 96%, 53%)' }} /> Good
            </span>
            <span className="flex items-center gap-1 text-[9px]">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(25, 95%, 53%)' }} /> Mixed
            </span>
            <span className="flex items-center gap-1 text-[9px]">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(0, 84%, 60%)' }} /> Challenging
            </span>
          </div>
        </div>

        {/* View toggle hint */}
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
          <span className="text-[10px] text-muted-foreground">{visibleCities.length} locations</span>
        </div>
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {visibleCities.map(city => (
            <button
              key={city.city}
              onClick={() => setSelectedCity(selectedCity?.city === city.city ? null : city)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-secondary/50 ${
                selectedCity?.city === city.city ? 'bg-primary/5' : ''
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: ratingColor(city.rating) }}
              />
              <span className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{city.city}</span>
                <span className="text-xs text-muted-foreground ml-1">{city.country}</span>
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-sm border ${ratingBg(city.rating)}`}>
                {city.rating}
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

// ─── City Detail Card ───────────────────────────────────────────────

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

const CityDetailCard = ({ city, onClose }: { city: AstrocartoCity; onClose: () => void }) => (
  <div className="border border-primary/30 rounded-sm p-5 bg-card space-y-4 relative">
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
    >
      <X size={16} />
    </button>

    <div>
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={16} className="text-primary" />
        <h4 className="text-base font-medium text-foreground">{city.city}, {city.country}</h4>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-sm border ${ratingBg(city.rating)}`}
        >
          {city.rating}/10 — {ratingLabel(city.rating)}
        </span>
      </div>
    </div>

    <p className="text-sm text-muted-foreground leading-relaxed">{city.summary}</p>

    {city.angularPlanets.length > 0 && (
      <div className="space-y-2">
        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">What's Activated Here</h5>
        {city.angularPlanets.map((ap, i) => (
          <div key={i} className="flex items-start gap-3 border border-border/50 rounded-sm p-3 bg-secondary/30">
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
        ))}
      </div>
    )}
  </div>
);
