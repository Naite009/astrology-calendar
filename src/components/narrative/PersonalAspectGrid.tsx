import { useMemo, useState } from 'react';
import * as Astronomy from 'astronomy-engine';
import { NatalChart } from '@/hooks/useNatalChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PLANET_DIGNITIES } from '@/lib/planetDignities';
import { TRADITIONAL_RULERS, EXALTATIONS, DETRIMENTS, FALLS } from '@/lib/chartDecoderLogic';
import { getPlanetLongitudeExact } from '@/lib/transitMath';

const ZODIAC_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC_ORDER.indexOf(sign) * 30 + deg + min / 60;
const lonToSign = (lon: number) => ZODIAC_ORDER[Math.floor(((lon % 360) + 360) % 360 / 30)];

const GRID_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊',
};

const TRANSIT_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const TRANSIT_BODIES: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon, Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus, Mars: Astronomy.Body.Mars, Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn, Uranus: Astronomy.Body.Uranus, Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const ASPECT_DEFS = [
  { name: 'Conjunction', symbol: '☌', degrees: 0, orb: 10, color: 'bg-violet-500', textColor: 'text-violet-100' },
  { name: 'Sextile', symbol: '⚹', degrees: 60, orb: 6, color: 'bg-emerald-500', textColor: 'text-emerald-100' },
  { name: 'Square', symbol: '□', degrees: 90, orb: 8, color: 'bg-rose-500', textColor: 'text-rose-100' },
  { name: 'Trine', symbol: '△', degrees: 120, orb: 8, color: 'bg-blue-500', textColor: 'text-blue-100' },
  { name: 'Opposition', symbol: '☍', degrees: 180, orb: 10, color: 'bg-amber-500', textColor: 'text-amber-100' },
  { name: 'Quincunx', symbol: '⚻', degrees: 150, orb: 3, color: 'bg-cyan-500', textColor: 'text-cyan-100' },
  { name: 'Semi-sextile', symbol: '⚺', degrees: 30, orb: 2, color: 'bg-teal-400', textColor: 'text-teal-100' },
  { name: 'Semi-square', symbol: '∠', degrees: 45, orb: 2, color: 'bg-orange-400', textColor: 'text-orange-100' },
  { name: 'Sesquiquadrate', symbol: '⊡', degrees: 135, orb: 2, color: 'bg-pink-400', textColor: 'text-pink-100' },
];

// Transit overlay uses tighter orbs
const TRANSIT_ASPECT_DEFS = [
  { name: 'Conjunction', symbol: '☌', degrees: 0, orb: 3 },
  { name: 'Sextile', symbol: '⚹', degrees: 60, orb: 2 },
  { name: 'Square', symbol: '□', degrees: 90, orb: 3 },
  { name: 'Trine', symbol: '△', degrees: 120, orb: 3 },
  { name: 'Opposition', symbol: '☍', degrees: 180, orb: 3 },
  { name: 'Quincunx', symbol: '⚻', degrees: 150, orb: 2 },
];

interface AspectHit {
  name: string;
  symbol: string;
  orb: number;
  color: string;
  textColor: string;
  exact: boolean;
}

function findAspect(lon1: number, lon2: number): AspectHit | null {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  for (const a of ASPECT_DEFS) {
    const actualOrb = Math.abs(diff - a.degrees);
    if (actualOrb <= a.orb) {
      return { name: a.name, symbol: a.symbol, orb: Math.round(actualOrb * 10) / 10, color: a.color, textColor: a.textColor, exact: actualOrb < 1 };
    }
  }
  return null;
}

interface TransitAspectHit {
  transitPlanet: string;
  natalPlanet: string;
  name: string;
  symbol: string;
  orb: number;
  exact: boolean;
}

function findTransitAspect(transitLon: number, natalLon: number): { name: string; symbol: string; orb: number; exact: boolean } | null {
  let diff = Math.abs(transitLon - natalLon);
  if (diff > 180) diff = 360 - diff;
  for (const a of TRANSIT_ASPECT_DEFS) {
    const actualOrb = Math.abs(diff - a.degrees);
    if (actualOrb <= a.orb) {
      return { name: a.name, symbol: a.symbol, orb: Math.round(actualOrb * 10) / 10, exact: actualOrb < 1 };
    }
  }
  return null;
}

type DignityLevel = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';

function getDignity(planet: string, sign: string): DignityLevel {
  // Check domicile via traditional rulers
  const rulerEntries = Object.entries(TRADITIONAL_RULERS);
  for (const [s, ruler] of rulerEntries) {
    if (ruler === planet && s === sign) return 'domicile';
  }
  // Check exaltation
  if (EXALTATIONS[planet] === sign) return 'exaltation';
  // Check detriment
  const det = DETRIMENTS[planet];
  if (det && det.includes(sign)) return 'detriment';
  // Check fall
  if (FALLS[planet] === sign) return 'fall';
  return 'peregrine';
}

const DIGNITY_CONFIG: Record<DignityLevel, { label: string; abbr: string; className: string; emoji: string }> = {
  domicile:   { label: 'Domicile', abbr: 'DOM', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', emoji: '🏠' },
  exaltation: { label: 'Exalted',  abbr: 'EXA', className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',     emoji: '⭐' },
  detriment:  { label: 'Detriment',abbr: 'DET', className: 'bg-rose-500/20 text-rose-300 border-rose-500/40',         emoji: '⬇' },
  fall:       { label: 'Fall',     abbr: 'FAL', className: 'bg-red-500/20 text-red-300 border-red-500/40',            emoji: '💔' },
  peregrine:  { label: 'Peregrine',abbr: 'PER', className: 'bg-muted/40 text-muted-foreground border-border/40',      emoji: '—' },
};

interface Props {
  chart: NatalChart | null;
}

export function PersonalAspectGrid({ chart }: Props) {
  const [showTransits, setShowTransits] = useState(true);

  const positions = useMemo(() => {
    if (!chart?.planets) return {};
    const map: Record<string, { lon: number; sign: string; deg: number }> = {};
    for (const pn of GRID_PLANETS) {
      const p = chart.planets[pn as keyof typeof chart.planets];
      if (!p?.sign) continue;
      map[pn] = { lon: toLon(p.sign, p.degree, p.minutes ?? 0), sign: p.sign, deg: Math.round(p.degree) };
    }
    return map;
  }, [chart]);

  // Compute current transit positions
  const transitPositions = useMemo(() => {
    const now = new Date();
    const map: Record<string, { lon: number; sign: string; deg: number }> = {};
    for (const pn of TRANSIT_PLANETS) {
      try {
        const body = TRANSIT_BODIES[pn];
        if (body === undefined || body === null) continue;
        const lon = getPlanetLongitudeExact(body, now);
        const sign = lonToSign(lon);
        const degInSign = lon % 30;
        map[pn] = { lon, sign, deg: Math.round(degInSign) };
      } catch { /* skip */ }
    }
    return map;
  }, []);

  // Find all transit-to-natal aspects
  const transitAspects = useMemo(() => {
    const hits: TransitAspectHit[] = [];
    if (!showTransits) return hits;
    for (const tp of TRANSIT_PLANETS) {
      const tPos = transitPositions[tp];
      if (!tPos) continue;
      for (const np of GRID_PLANETS) {
        const nPos = positions[np];
        if (!nPos) continue;
        const hit = findTransitAspect(tPos.lon, nPos.lon);
        if (hit) {
          hits.push({ transitPlanet: tp, natalPlanet: np, ...hit });
        }
      }
    }
    return hits;
  }, [transitPositions, positions, showTransits]);

  // Index transit aspects by natal planet for quick lookup
  const transitsByNatal = useMemo(() => {
    const map: Record<string, TransitAspectHit[]> = {};
    for (const h of transitAspects) {
      if (!map[h.natalPlanet]) map[h.natalPlanet] = [];
      map[h.natalPlanet].push(h);
    }
    return map;
  }, [transitAspects]);

  const activePlanets = GRID_PLANETS.filter(p => positions[p]);
  if (!chart || activePlanets.length === 0) {
    return (
      <div className="p-4 rounded-lg border bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">Select a chart to see your personal aspect grid.</p>
      </div>
    );
  }

  const dignities = activePlanets.map(p => ({ planet: p, dignity: getDignity(p, positions[p].sign) }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2"><span>⊞</span> Personal Aspect Grid</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Planet-to-planet aspects at a glance. Bright cells = tight orbs. Dignity badges show essential strength.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="transit-toggle" checked={showTransits} onCheckedChange={setShowTransits} />
          <Label htmlFor="transit-toggle" className="text-xs cursor-pointer">Transit Overlay</Label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <TooltipProvider delayDuration={100}>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-9 h-9" />
                {/* Dignity header row */}
                <th className="w-9 h-9" />
                {activePlanets.map(p => {
                  const d = getDignity(p, positions[p].sign);
                  const cfg = DIGNITY_CONFIG[d];
                  return (
                    <th key={p} className="w-9 h-9 text-center px-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <span className="text-sm" title={p}>{PLANET_SYMBOLS[p]}</span>
                            <div className="text-[7px] text-muted-foreground leading-none mt-0.5">
                              {positions[p].deg}°{positions[p].sign.slice(0, 3)}
                            </div>
                            <div className={`text-[7px] mt-0.5 px-1 py-0 rounded border ${cfg.className} inline-block leading-tight`}>
                              {cfg.abbr}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-semibold">{PLANET_SYMBOLS[p]} {p} in {positions[p].sign}</p>
                          <p>{cfg.emoji} {cfg.label}</p>
                          {d === 'domicile' && <p className="text-muted-foreground">At home — strongest expression</p>}
                          {d === 'exaltation' && <p className="text-muted-foreground">Elevated — honored expression</p>}
                          {d === 'detriment' && <p className="text-muted-foreground">Uncomfortable — must work harder</p>}
                          {d === 'fall' && <p className="text-muted-foreground">Weakened — growth through struggle</p>}
                          {d === 'peregrine' && <p className="text-muted-foreground">Neutral — no special dignity</p>}
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activePlanets.map((rowP, ri) => {
                const rowD = getDignity(rowP, positions[rowP].sign);
                const rowCfg = DIGNITY_CONFIG[rowD];
                const rowTransits = transitsByNatal[rowP] || [];
                return (
                  <tr key={rowP}>
                    {/* Row header: dignity badge */}
                    <td className="w-9 h-9 text-center pr-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <span className="text-sm" title={rowP}>{PLANET_SYMBOLS[rowP]}</span>
                            <div className="text-[7px] text-muted-foreground leading-none mt-0.5">
                              {positions[rowP].deg}°{positions[rowP].sign.slice(0, 3)}
                            </div>
                            <div className={`text-[7px] mt-0.5 px-1 py-0 rounded border ${rowCfg.className} inline-block leading-tight`}>
                              {rowCfg.abbr}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          <p className="font-semibold">{PLANET_SYMBOLS[rowP]} {rowP} in {positions[rowP].sign}</p>
                          <p>{rowCfg.emoji} {rowCfg.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    {/* Transit indicator column */}
                    <td className="w-5 h-9 p-0">
                      {showTransits && rowTransits.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs max-w-[200px]">
                            <p className="font-semibold mb-1">Active Transits to {rowP}:</p>
                            {rowTransits.map((t, i) => (
                              <p key={i} className="text-muted-foreground">
                                {PLANET_SYMBOLS[t.transitPlanet]} {t.transitPlanet} {t.symbol} {t.name} ({t.orb}°{t.exact ? ' exact!' : ''})
                              </p>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                    {/* Aspect cells */}
                    {activePlanets.map((colP, ci) => {
                      if (ci <= ri) {
                        return <td key={colP} className="w-9 h-9 bg-muted/20 border border-border/30" />;
                      }
                      const aspect = findAspect(positions[rowP].lon, positions[colP].lon);
                      // Check if either planet is currently being activated by transit
                      const rowActivated = showTransits && (transitsByNatal[rowP]?.length ?? 0) > 0;
                      const colActivated = showTransits && (transitsByNatal[colP]?.length ?? 0) > 0;
                      const bothActivated = rowActivated && colActivated;

                      if (!aspect) {
                        return (
                          <td key={colP} className={`w-9 h-9 border border-border/30 ${bothActivated ? 'bg-yellow-500/10' : ''}`} />
                        );
                      }
                      const opacity = aspect.exact ? 'opacity-100' : aspect.orb < 3 ? 'opacity-90' : aspect.orb < 5 ? 'opacity-70' : 'opacity-50';
                      return (
                        <td key={colP} className={`w-9 h-9 border border-border/30 p-0 relative`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`w-full h-full flex items-center justify-center ${aspect.color} ${opacity} cursor-default`}>
                                <span className={`text-sm font-bold ${aspect.textColor}`}>{aspect.symbol}</span>
                                {bothActivated && (
                                  <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[250px]">
                              <p className="font-semibold">{PLANET_SYMBOLS[rowP]} {rowP} {aspect.symbol} {PLANET_SYMBOLS[colP]} {colP}</p>
                              <p className="text-muted-foreground">{aspect.name} · Orb {aspect.orb}°{aspect.exact ? ' (exact!)' : ''}</p>
                              {bothActivated && (
                                <p className="text-yellow-400 mt-1 font-medium">⚡ Both planets activated by current transits!</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TooltipProvider>
      </div>

      {/* Transit overlay summary */}
      {showTransits && transitAspects.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 space-y-2">
          <h4 className="text-xs font-semibold flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            Active Transit Aspects (right now)
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {transitAspects
              .sort((a, b) => a.orb - b.orb)
              .slice(0, 12)
              .map((t, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`text-[10px] cursor-default ${t.exact ? 'border-yellow-400 text-yellow-300' : 'border-border'}`}>
                      t.{PLANET_SYMBOLS[t.transitPlanet]} {t.symbol} n.{PLANET_SYMBOLS[t.natalPlanet]} {t.orb}°
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <p>Transit {t.transitPlanet} {t.name} natal {t.natalPlanet}</p>
                    <p className="text-muted-foreground">Orb: {t.orb}°{t.exact ? ' — exact!' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
        </div>
      )}

      {/* Dignity summary bar */}
      <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
        <h4 className="text-xs font-semibold">Essential Dignity Overview</h4>
        <div className="flex flex-wrap gap-1.5">
          {dignities
            .filter(d => d.dignity !== 'peregrine')
            .map(d => {
              const cfg = DIGNITY_CONFIG[d.dignity];
              return (
                <Badge key={d.planet} variant="outline" className={`text-[10px] ${cfg.className}`}>
                  {cfg.emoji} {PLANET_SYMBOLS[d.planet]} {d.planet} — {cfg.label}
                </Badge>
              );
            })}
          {dignities.filter(d => d.dignity !== 'peregrine').length === 0 && (
            <span className="text-[10px] text-muted-foreground">All planets peregrine (no special dignities)</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {ASPECT_DEFS.slice(0, 6).map(a => (
          <span key={a.name} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-sm ${a.color} inline-flex items-center justify-center`}>
              <span className={`text-[8px] ${a.textColor}`}>{a.symbol}</span>
            </span>
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}
