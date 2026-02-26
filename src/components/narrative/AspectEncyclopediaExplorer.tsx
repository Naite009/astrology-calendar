import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartSelector } from '@/components/ChartSelector';
import {
  ASPECTS_DATA, PATTERNS_DATA, CHART_SHAPES_DATA, STELLIUM_INFO,
  AspectData, PatternData,
} from '@/lib/aspectEncyclopedia';
import { NatalChart } from '@/hooks/useNatalChart';
import { detectChartPatterns } from '@/lib/chartPatterns';

const ZODIAC_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊', Lilith: '⚸',
};

const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC_ORDER.indexOf(sign) * 30 + deg + min / 60;

function findAspectsInChart(chart: NatalChart, targetDegrees: number, orb: number): Array<{ planet1: string; planet2: string; aspect: string; orb: number; p1Sign: string; p1Deg: number; p1House: number | null; p2Sign: string; p2Deg: number; p2House: number | null }> {
  const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
  const positions: Array<{ name: string; lon: number; sign: string; deg: number }> = [];
  for (const pn of planetNames) {
    const p = chart.planets[pn as keyof typeof chart.planets];
    if (!p?.sign) continue;
    positions.push({ name: pn, lon: toLon(p.sign, p.degree, p.minutes ?? 0), sign: p.sign, deg: p.degree });
  }

  const getHouse = (lon: number): number | null => {
    if (!chart.houseCusps) return null;
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
    return 1;
  };

  const results: typeof positions extends any ? ReturnType<typeof findAspectsInChart> : never = [];

  for (let i = 0; i < positions.length - 1; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      let diff = Math.abs(positions[i].lon - positions[j].lon);
      if (diff > 180) diff = 360 - diff;
      const actualOrb = Math.abs(diff - targetDegrees);
      if (actualOrb <= orb) {
        results.push({
          planet1: positions[i].name, planet2: positions[j].name,
          aspect: `${targetDegrees}°`, orb: Math.round(actualOrb * 10) / 10,
          p1Sign: positions[i].sign, p1Deg: Math.round(positions[i].deg),
          p1House: getHouse(positions[i].lon),
          p2Sign: positions[j].sign, p2Deg: Math.round(positions[j].deg),
          p2House: getHouse(positions[j].lon),
        });
      }
    }
  }
  return results;
}

function AspectDetailModal({ aspect, open, onClose, chart }: { aspect: AspectData | null; open: boolean; onClose: () => void; chart: NatalChart | null }) {
  const chartAspects = useMemo(() => {
    if (!chart || !aspect) return [];
    return findAspectsInChart(chart, aspect.degrees, aspect.orb);
  }, [chart, aspect]);

  if (!aspect) return null;

  const natureColor = aspect.nature === 'Harmonious' ? 'text-emerald-600' : aspect.nature === 'Dynamic' ? 'text-rose-600' : 'text-amber-600';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-3xl">{aspect.symbol}</span>
            <span>{aspect.name}</span>
            <span className="text-sm text-muted-foreground font-normal">({aspect.degrees}°)</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{aspect.type}</Badge>
              <Badge className={natureColor} variant="outline">{aspect.nature}</Badge>
              <Badge variant="outline">Orb: ±{aspect.orb}°</Badge>
            </div>

            <p className="text-sm leading-relaxed">{aspect.core}</p>

            {/* Waxing vs Waning */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">🌓 WAXING vs WANING</p>
              <p className="text-xs leading-relaxed">{aspect.waxingVsWaning}</p>
            </div>

            {/* Personal vs Outer */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">🌐 PERSONAL vs OUTER PLANETS</p>
              <p className="text-xs leading-relaxed">{aspect.personalVsOuter}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ GIFT</p>
                <p className="text-xs">{aspect.gift}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ CHALLENGE</p>
                <p className="text-xs">{aspect.challenge}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">📖 TEACHING</p>
              <p className="text-xs">{aspect.teaching}</p>
            </div>

            {/* Personalized: aspects in YOUR chart */}
            {chart && chartAspects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <span>⭐</span> {aspect.name}s In Your Chart
                </h4>
                {chartAspects.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{PLANET_SYMBOLS[a.planet1] || ''} {a.planet1}</span>
                      <span className="text-muted-foreground">{a.p1Deg}° {a.p1Sign}{a.p1House ? ` (${a.p1House}${getOrd(a.p1House)} house)` : ''}</span>
                      <span className="text-primary font-bold">{aspect.symbol}</span>
                      <span>{PLANET_SYMBOLS[a.planet2] || ''} {a.planet2}</span>
                      <span className="text-muted-foreground">{a.p2Deg}° {a.p2Sign}{a.p2House ? ` (${a.p2House}${getOrd(a.p2House)} house)` : ''}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Orb: {a.orb}°</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {getPersonalizedDescription(a.planet1, a.planet2, aspect)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {chart && chartAspects.length === 0 && (
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">No {aspect.name.toLowerCase()}s found in the selected chart.</p>
              </div>
            )}

            {!chart && (
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">Select a chart above to see your personal {aspect.name.toLowerCase()}s.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function PatternDetailModal({ pattern, open, onClose }: { pattern: PatternData | null; open: boolean; onClose: () => void }) {
  if (!pattern) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-2xl">{pattern.symbol}</span>
            <span>{pattern.name}</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{pattern.description}</p>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] font-medium mb-1">COMPONENTS</p>
              <p className="text-xs">{pattern.components}</p>
            </div>
            <p className="text-sm leading-relaxed">{pattern.meaning}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ GIFT</p>
                <p className="text-xs">{pattern.gift}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ CHALLENGE</p>
                <p className="text-xs">{pattern.challenge}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">📖 TEACHING</p>
              <p className="text-xs">{pattern.teaching}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

const getOrd = (n: number) => n === 1 || n === 21 || n === 31 ? 'st' : n === 2 || n === 22 ? 'nd' : n === 3 || n === 23 ? 'rd' : 'th';

function getPersonalizedDescription(p1: string, p2: string, aspect: AspectData): string {
  const descs: Record<string, string> = {
    'Sun-Moon': aspect.nature === 'Harmonious'
      ? 'Your identity and emotions work together naturally — what you want and what you need are aligned.'
      : 'Your identity and emotional needs pull in different directions — creating inner tension between what you want and what you feel.',
    'Venus-Jupiter': 'Love and expansion combine — generosity, social warmth, and pleasure-seeking are amplified.',
    'Venus-Saturn': aspect.nature === 'Harmonious'
      ? 'Love becomes committed and enduring — you build lasting structures around what you value.'
      : 'Love meets restriction — fears of unworthiness, delayed partnerships, or relationships that feel heavy with duty.',
    'Mars-Saturn': aspect.nature === 'Harmonious'
      ? 'Disciplined energy — you can sustain effort over long periods and achieve through patience.'
      : 'Energy meets blockage — frustration, suppressed anger, or alternating between paralysis and explosive action.',
    'Sun-Saturn': aspect.nature === 'Harmonious'
      ? 'Identity finds structure — you mature early, take responsibility, and build authority over time.'
      : 'Identity meets limitation — self-doubt, father issues, or feeling like you must constantly prove your worth.',
    'Moon-Pluto': 'Emotional depth runs to the core — intense feelings, transformative emotional experiences, and a need for psychological truth.',
    'Venus-Pluto': 'Love becomes obsession — passionate, transformative relationships that change you permanently.',
    'Mars-Pluto': 'Will meets power — tremendous force when channeled, but can become domineering or manipulative.',
    'Sun-Pluto': 'Identity undergoes constant transformation — you reinvent yourself, confront power dynamics, and seek psychological truth.',
  };

  const key1 = `${p1}-${p2}`;
  const key2 = `${p2}-${p1}`;
  return descs[key1] || descs[key2] ||
    `${PLANET_SYMBOLS[p1] || ''} ${p1} and ${PLANET_SYMBOLS[p2] || ''} ${p2} are in ${aspect.name.toLowerCase()} — ${aspect.nature === 'Harmonious' ? 'flowing together with ease' : aspect.nature === 'Dynamic' ? 'creating dynamic tension that drives growth' : 'requiring constant adjustment and adaptation'}.`;
}

export function AspectEncyclopediaExplorer({
  userNatalChart,
  savedCharts,
}: {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}) {
  const [selectedAspect, setSelectedAspect] = useState<AspectData | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternData | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string>(userNatalChart ? 'user' : 'general');

  const activeChart = useMemo(() => {
    if (selectedChartId === 'general') return null;
    if (selectedChartId === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartId) || null;
  }, [selectedChartId, userNatalChart, savedCharts]);

  // Detect patterns in active chart
  const chartPatterns = useMemo(() => {
    if (!activeChart) return [];
    try { return detectChartPatterns(activeChart); } catch { return []; }
  }, [activeChart]);

  const ASPECT_COLORS: Record<string, string> = {
    'Neutral': 'bg-muted/50 border-border',
    'Harmonious': 'bg-emerald-500/10 border-emerald-500/30',
    'Dynamic': 'bg-rose-500/10 border-rose-500/30',
    'Complex': 'bg-amber-500/10 border-amber-500/30',
  };

  return (
    <div className="space-y-8">
      {/* Chart Selector */}
      <div>
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedChartId}
          onSelect={setSelectedChartId}
          includeGeneral={true}
          generalLabel="No chart (encyclopedia only)"
          label="Personalize to"
        />
      </div>

      {/* Major Aspects */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>✦</span> Major Aspects</h3>
        <p className="text-xs text-muted-foreground">Click any aspect to learn about it and see which planets form this aspect in your chart.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ASPECTS_DATA.map(aspect => (
            <button
              key={aspect.name}
              onClick={() => setSelectedAspect(aspect)}
              className={`p-3 rounded-lg border ${ASPECT_COLORS[aspect.nature]} hover:shadow-md transition-all text-center cursor-pointer group`}
            >
              <span className="text-3xl block group-hover:scale-110 transition-transform">{aspect.symbol}</span>
              <span className="text-xs font-medium block mt-1">{aspect.name}</span>
              <span className="text-[10px] text-muted-foreground block">{aspect.degrees}°</span>
            </button>
          ))}
        </div>
      </div>

      {/* Waxing vs Waning Explanation */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
        <h4 className="text-sm font-medium">🌓 Waxing vs Waning Aspects</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every aspect has TWO forms: <strong>waxing</strong> (the aspect as it forms after the conjunction — moving AWAY from 0°) and <strong>waning</strong> (the aspect as it forms on the return — moving BACK toward 0°). A waxing □ (first quarter) is a crisis of ACTION — "I must do something NOW." A waning □ (third quarter) is a crisis of CONSCIOUSNESS — "I must understand what this means." They feel fundamentally different even though they're both 90° aspects.
        </p>
      </div>

      {/* Aspect Patterns */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>⬡</span> Aspect Patterns</h3>
        <p className="text-xs text-muted-foreground">Click any pattern to learn about its meaning, gift, and challenge.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PATTERNS_DATA.map(pattern => (
            <button
              key={pattern.name}
              onClick={() => setSelectedPattern(pattern)}
              className="p-3 rounded-lg border bg-muted/30 hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">{pattern.symbol}</span>
                <span className="text-xs font-medium">{pattern.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{pattern.components}</p>
            </button>
          ))}
        </div>

        {/* Patterns found in chart */}
        {activeChart && chartPatterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <span>⭐</span> Patterns In Your Chart
            </h4>
            {chartPatterns.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.symbol}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{p.planets.join(', ')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stelliums */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
        <h4 className="text-sm font-medium">✦✦✦ {STELLIUM_INFO.title}</h4>
        <p className="text-xs text-muted-foreground">{STELLIUM_INFO.description}</p>
        <ul className="text-xs space-y-1 text-muted-foreground">
          {STELLIUM_INFO.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
        </ul>
      </div>

      {/* Chart Shapes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2"><span>◐</span> Chart Shapes</h3>
        <p className="text-xs text-muted-foreground">The overall distribution of planets around the zodiac wheel creates a recognizable shape that describes your fundamental approach to life.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CHART_SHAPES_DATA.map(shape => (
            <div key={shape.name} className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs font-semibold">{shape.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{shape.description}</p>
            </div>
          ))}
        </div>
      </div>

      <AspectDetailModal aspect={selectedAspect} open={!!selectedAspect} onClose={() => setSelectedAspect(null)} chart={activeChart} />
      <PatternDetailModal pattern={selectedPattern} open={!!selectedPattern} onClose={() => setSelectedPattern(null)} />
    </div>
  );
}
