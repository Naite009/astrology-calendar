import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ZODIAC_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC_ORDER.indexOf(sign) * 30 + deg + min / 60;

const GRID_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊',
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

interface Props {
  chart: NatalChart | null;
}

export function PersonalAspectGrid({ chart }: Props) {
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

  const activePlanets = GRID_PLANETS.filter(p => positions[p]);
  if (!chart || activePlanets.length === 0) {
    return (
      <div className="p-4 rounded-lg border bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">Select a chart to see your personal aspect grid.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2"><span>⊞</span> Personal Aspect Grid</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Every planet-to-planet aspect at a glance. Bright cells = tight orbs. Hover for details.
        </p>
      </div>

      <div className="overflow-x-auto">
        <TooltipProvider delayDuration={100}>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-9 h-9" />
                {activePlanets.map(p => (
                  <th key={p} className="w-9 h-9 text-center">
                    <span className="text-sm" title={p}>{PLANET_SYMBOLS[p]}</span>
                    <div className="text-[7px] text-muted-foreground leading-none mt-0.5">
                      {positions[p].deg}°{positions[p].sign.slice(0, 3)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activePlanets.map((rowP, ri) => (
                <tr key={rowP}>
                  <td className="w-9 h-9 text-center pr-1">
                    <span className="text-sm" title={rowP}>{PLANET_SYMBOLS[rowP]}</span>
                    <div className="text-[7px] text-muted-foreground leading-none mt-0.5">
                      {positions[rowP].deg}°{positions[rowP].sign.slice(0, 3)}
                    </div>
                  </td>
                  {activePlanets.map((colP, ci) => {
                    if (ci <= ri) {
                      return <td key={colP} className="w-9 h-9 bg-muted/20 border border-border/30" />;
                    }
                    const aspect = findAspect(positions[rowP].lon, positions[colP].lon);
                    if (!aspect) {
                      return <td key={colP} className="w-9 h-9 border border-border/30" />;
                    }
                    const opacity = aspect.exact ? 'opacity-100' : aspect.orb < 3 ? 'opacity-90' : aspect.orb < 5 ? 'opacity-70' : 'opacity-50';
                    return (
                      <td key={colP} className="w-9 h-9 border border-border/30 p-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-full h-full flex items-center justify-center ${aspect.color} ${opacity} cursor-default`}>
                              <span className={`text-sm font-bold ${aspect.textColor}`}>{aspect.symbol}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-semibold">{PLANET_SYMBOLS[rowP]} {rowP} {aspect.symbol} {PLANET_SYMBOLS[colP]} {colP}</p>
                            <p className="text-muted-foreground">{aspect.name} · Orb {aspect.orb}°{aspect.exact ? ' (exact!)' : ''}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>
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
