import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HOUSES_DATA, QUADRANT_INFO, HEMISPHERE_INFO, ANGLE_INFO,
  INTERCEPTED_HOUSES_INFO, EMPTY_HOUSES_INFO, HouseData,
} from '@/lib/houseEncyclopedia';
import { NatalChart } from '@/hooks/useNatalChart';
import { HouseWheelVisualization } from './HouseWheelVisualization';

const ANGULARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Angular:  { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  Succedent: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  Cadent:   { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/30' },
};

const QUADRANT_COLORS = ['bg-rose-500/10 border-rose-500/30', 'bg-amber-500/10 border-amber-500/30', 'bg-sky-500/10 border-sky-500/30', 'bg-violet-500/10 border-violet-500/30'];

const ZODIAC_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_RULERS: Record<string, { planet: string; symbol: string }> = {
  Aries: { planet: 'Mars', symbol: '♂' }, Taurus: { planet: 'Venus', symbol: '♀' },
  Gemini: { planet: 'Mercury', symbol: '☿' }, Cancer: { planet: 'Moon', symbol: '☽' },
  Leo: { planet: 'Sun', symbol: '☉' }, Virgo: { planet: 'Mercury', symbol: '☿' },
  Libra: { planet: 'Venus', symbol: '♀' }, Scorpio: { planet: 'Pluto', symbol: '♇' },
  Sagittarius: { planet: 'Jupiter', symbol: '♃' }, Capricorn: { planet: 'Saturn', symbol: '♄' },
  Aquarius: { planet: 'Uranus', symbol: '♅' }, Pisces: { planet: 'Neptune', symbol: '♆' },
};

const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC_ORDER.indexOf(sign) * 30 + deg + min / 60;

function ordinal(n: number) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function findPlanetHouse(planetName: string, chart: NatalChart): number | null {
  const p = chart.planets[planetName as keyof typeof chart.planets];
  if (!p?.sign || !chart.houseCusps) return null;
  const lon = toLon(p.sign, p.degree, p.minutes ?? 0);
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (c?.sign) cusps.push(toLon(c.sign, c.degree, c.minutes ?? 0));
  }
  if (cusps.length < 12) return null;
  for (let i = 0; i < 12; i++) {
    const cur = cusps[i], next = cusps[(i + 1) % 12];
    const inH = next < cur ? (lon >= cur || lon < next) : (lon >= cur && lon < next);
    if (inH) return i + 1;
  }
  return null;
}

function HouseDetailModal({ house, open, onClose, chart }: { house: HouseData | null; open: boolean; onClose: () => void; chart: NatalChart | null }) {
  const planetsInHouse = useMemo(() => {
    if (!house || !chart?.planets || !chart?.houseCusps) return [];
    const results: string[] = [];
    const cusps: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const c = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
      if (c?.sign) cusps.push(toLon(c.sign, c.degree, c.minutes ?? 0));
    }
    if (cusps.length < 12) return [];
    const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
    for (const pn of planetNames) {
      const p = chart.planets[pn as keyof typeof chart.planets];
      if (!p?.sign) continue;
      const lon = toLon(p.sign, p.degree, p.minutes ?? 0);
      for (let i = 0; i < 12; i++) {
        const cur = cusps[i], next = cusps[(i + 1) % 12];
        const inHouse = next < cur ? (lon >= cur || lon < next) : (lon >= cur && lon < next);
        if (inHouse && i + 1 === house.number) { results.push(pn); break; }
      }
    }
    return results;
  }, [chart, house]);

  const rulerAnalysis = useMemo(() => {
    if (!house || !chart?.planets || !chart?.houseCusps) return null;
    const houseKey = `house${house.number}` as keyof typeof chart.houseCusps;
    const cuspData = chart.houseCusps[houseKey];
    if (!cuspData?.sign) return null;
    
    const cuspSign = cuspData.sign;
    const ruler = SIGN_RULERS[cuspSign];
    if (!ruler) return null;

    const rulerPlanet = chart.planets[ruler.planet as keyof typeof chart.planets];
    if (!rulerPlanet?.sign) return null;

    const rulerHouse = findPlanetHouse(ruler.planet, chart);
    if (!rulerHouse) return null;

    const rulerHouseData = HOUSES_DATA.find(h => h.number === rulerHouse);

    return {
      cuspSign,
      rulerPlanet: ruler.planet,
      rulerSymbol: ruler.symbol,
      rulerSign: rulerPlanet.sign,
      rulerHouse,
      rulerHouseName: rulerHouseData?.name || `House ${rulerHouse}`,
    };
  }, [house, chart, planetsInHouse]);

  if (!house) return null;
  const ac = ANGULARITY_COLORS[house.angularity];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-2xl font-mono">{house.number}</span>
            <span>{house.name}</span>
            <span className="text-sm text-muted-foreground font-normal">({house.nickname})</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${ac.bg} ${ac.text} ${ac.border} border`}>{house.angularity}</Badge>
              <Badge variant="outline">{house.houseType}</Badge>
              <Badge variant="outline">{house.naturalSign} · {house.rulerSymbol} {house.naturalRuler}</Badge>
              <Badge variant="outline">Q{house.quadrant}: {house.quadrantMantra}</Badge>
            </div>

            {/* Keywords */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5">🔑 KEYWORDS</p>
              <div className="flex flex-wrap gap-1">
                {house.keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{kw}</Badge>
                ))}
              </div>
            </div>

            {/* Life explanation */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">📋 WHAT THIS HOUSE RULES</p>
              <p className="text-sm leading-relaxed">{house.lifeExplanation}</p>
            </div>

            <p className="text-sm leading-relaxed">{house.core}</p>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">🫀 Body</p>
              <p className="text-sm">{house.bodyPart}</p>
            </div>

            {/* Personalized section when chart is selected */}
            {chart && rulerAnalysis && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground">⭐ YOUR {ordinal(house.number).toUpperCase()} HOUSE</p>
                
                {planetsInHouse.length > 0 ? (
                  <div>
                    <p className="text-xs mb-1.5">You have <strong>{planetsInHouse.length} planet{planetsInHouse.length > 1 ? 's' : ''}</strong> in your {ordinal(house.number)} house:</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {planetsInHouse.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your {ordinal(house.number)} house is ruled by <strong>{rulerAnalysis.cuspSign}</strong>, 
                      so {rulerAnalysis.rulerSymbol} <strong>{rulerAnalysis.rulerPlanet}</strong> (your house ruler) is in 
                      the <strong>{ordinal(rulerAnalysis.rulerHouse)} house</strong> in <strong>{rulerAnalysis.rulerSign}</strong>. 
                      This means the themes of your {house.name.toLowerCase()} are also channeled through your {rulerAnalysis.rulerHouseName.toLowerCase()} — look there for how this house expresses in practice.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs leading-relaxed">
                      You have <strong>no planets</strong> in your {ordinal(house.number)} house, 
                      but it's ruled by <strong>{rulerAnalysis.cuspSign}</strong>, 
                      and {rulerAnalysis.rulerSymbol} <strong>{rulerAnalysis.rulerPlanet}</strong> is in 
                      the <strong>{ordinal(rulerAnalysis.rulerHouse)} house</strong> in <strong>{rulerAnalysis.rulerSign}</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      This means the {house.name.toLowerCase()} themes in your life are not a major source of drama — they run on autopilot through {rulerAnalysis.cuspSign} energy. 
                      But to understand <em>how</em> this area actually plays out, look at where {rulerAnalysis.rulerSymbol} {rulerAnalysis.rulerPlanet} sits: 
                      in the {ordinal(rulerAnalysis.rulerHouse)} house ({rulerAnalysis.rulerHouseName}) in {rulerAnalysis.rulerSign}. 
                      That's where this house's energy is being <em>directed</em> — the {rulerAnalysis.rulerHouseName.toLowerCase()} colors how your {house.name.toLowerCase().replace('house of ', '')} functions.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] font-medium mb-1">🏠 EMPTY HOUSE</p>
                <p className="text-xs">{house.emptyHouse}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] font-medium mb-1">🔑 RULER GUIDANCE</p>
                <p className="text-xs">{house.rulerGuidance}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">📖 TEACHING</p>
              <p className="text-xs">{house.teaching}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">{house.angularityMeaning}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function HouseEncyclopediaExplorer({ chart }: { chart: NatalChart | null }) {
  const [selectedHouse, setSelectedHouse] = useState<HouseData | null>(null);

  const handleWheelClick = (houseNum: number) => {
    const house = HOUSES_DATA.find(h => h.number === houseNum);
    if (house) setSelectedHouse(house);
  };

  return (
    <div className="space-y-8">
      {/* Interactive House Wheel */}
      <HouseWheelVisualization chart={chart} onHouseClick={handleWheelClick} />

      {/* Hemispheres & Quadrants */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>◑</span> Hemispheres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(HEMISPHERE_INFO).map(([key, h]) => (
            <div key={key} className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs font-semibold mb-1">{h.name}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{h.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quadrants */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>◧</span> Quadrants</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUADRANT_INFO.map((q, i) => (
            <div key={q.number} className={`p-4 rounded-lg border ${QUADRANT_COLORS[i]}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold">Q{q.number}</span>
                <span className="text-sm font-medium">{q.name}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{q.mantra}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{q.description}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Houses {q.houses.join(', ')} · {q.hemisphere}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Four Angles */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>✦</span> The Four Angles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ANGLE_INFO.map(a => (
            <div key={a.abbreviation} className="p-3 rounded-lg border bg-primary/5 border-primary/10 text-center">
              <p className="text-lg font-bold text-primary">{a.abbreviation}</p>
              <p className="text-[10px] font-medium">{a.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 text-left">{a.meaning.slice(0, 120)}…</p>
            </div>
          ))}
        </div>
      </div>

      {/* Angularity System */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>⬡</span> Angular · Succedent · Cadent</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['Angular', 'Succedent', 'Cadent'] as const).map(type => {
            const ac = ANGULARITY_COLORS[type];
            const houses = HOUSES_DATA.filter(h => h.angularity === type);
            return (
              <div key={type} className={`p-3 rounded-lg border ${ac.bg} ${ac.border}`}>
                <p className={`text-sm font-semibold ${ac.text}`}>{type}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{houses[0].angularityMeaning.split('.')[0]}.</p>
                <div className="mt-2 flex gap-1">
                  {houses.map(h => <Badge key={h.number} variant="outline" className="text-[10px]">{h.number}</Badge>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Odd/Even Pattern */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>↔</span> Initiation (Odd) vs Consolidation (Even)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-muted/30">
            <p className="text-xs font-semibold mb-1">Odd Houses: INITIATION</p>
            <p className="text-[10px] text-muted-foreground">Houses 1, 3, 5, 7, 9, 11 — push outward, start things, generate energy. Active, yang, projective.</p>
          </div>
          <div className="p-3 rounded-lg border bg-muted/30">
            <p className="text-xs font-semibold mb-1">Even Houses: CONSOLIDATION</p>
            <p className="text-[10px] text-muted-foreground">Houses 2, 4, 6, 8, 10, 12 — absorb, process, stabilize what the odd houses started. Receptive, yin, integrative.</p>
          </div>
        </div>
      </div>

      {/* 12 Houses Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>🏛</span> The 12 Houses</h3>
        <p className="text-xs text-muted-foreground">Click any house to explore its full profile — meaning, body, empty house guidance, and ruler.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {HOUSES_DATA.map(house => {
            const ac = ANGULARITY_COLORS[house.angularity];
            return (
              <button
                key={house.number}
                onClick={() => setSelectedHouse(house)}
                className={`p-3 rounded-lg border ${ac.border} ${ac.bg} hover:shadow-md transition-all text-left cursor-pointer group`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold group-hover:scale-110 transition-transform">{house.number}</span>
                  <span className="text-lg">{house.rulerSymbol}</span>
                </div>
                <span className="text-xs font-medium block mt-1">{house.name}</span>
                <span className="text-[10px] text-muted-foreground block">{house.naturalSign}</span>
                <span className={`text-[9px] block mt-0.5 ${ac.text}`}>{house.angularity}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty Houses */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
        <h4 className="text-sm font-medium">🏚 {EMPTY_HOUSES_INFO.title}</h4>
        <p className="text-xs text-muted-foreground">{EMPTY_HOUSES_INFO.description}</p>
        <ul className="text-xs space-y-1 text-muted-foreground">
          {EMPTY_HOUSES_INFO.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
        </ul>
      </div>

      {/* Intercepted Houses */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
        <h4 className="text-sm font-medium">🔒 {INTERCEPTED_HOUSES_INFO.title}</h4>
        <p className="text-xs text-muted-foreground">{INTERCEPTED_HOUSES_INFO.description}</p>
        <ul className="text-xs space-y-1 text-muted-foreground">
          {INTERCEPTED_HOUSES_INFO.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
        </ul>
      </div>

      <HouseDetailModal house={selectedHouse} open={!!selectedHouse} onClose={() => setSelectedHouse(null)} chart={chart} />
    </div>
  );
}
