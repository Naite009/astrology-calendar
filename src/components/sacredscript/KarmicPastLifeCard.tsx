import { useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Skull, Clock } from 'lucide-react';
import { TWELFTH_HOUSE_PAST_LIVES, PLANETS_IN_12TH, KARMIC_SOURCE } from '@/lib/karmicAstrologyData';

interface Props {
  chart: NatalChart;
}

const SIGN_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function getHouse12Sign(chart: NatalChart): string | null {
  if (!chart.houseCusps || chart.houseCusps.length < 12) return null;
  const cusp12Deg = chart.houseCusps[11]; // 0-indexed, house 12 is index 11
  const signIndex = Math.floor(cusp12Deg / 30);
  return SIGN_ORDER[signIndex] || null;
}

function getPlanetsInHouse12(chart: NatalChart): string[] {
  if (!chart.planets || !chart.houseCusps || chart.houseCusps.length < 12) return [];
  const h12Start = chart.houseCusps[11];
  const h1Start = chart.houseCusps[0];
  const results: string[] = [];
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron'];
  
  for (const name of PLANETS) {
    const p = chart.planets[name];
    if (!p) continue;
    const deg = p.degree;
    if (h12Start < h1Start) {
      if (deg >= h12Start && deg < h1Start) results.push(name);
    } else {
      if (deg >= h12Start || deg < h1Start) results.push(name);
    }
  }
  return results;
}

export function KarmicPastLifeCard({ chart }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const h12Sign = getHouse12Sign(chart);
  const h12Planets = getPlanetsInHouse12(chart);

  const signData = h12Sign ? TWELFTH_HOUSE_PAST_LIVES[h12Sign] : null;
  const hasPlanets = h12Planets.length > 0;

  if (!signData && !hasPlanets) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-colors">
        <Clock className="h-5 w-5 text-purple-600" />
        <div className="flex-1 text-left">
          <span className="text-sm font-medium">Past Lives & Karmic Memory</span>
          <p className="text-[11px] text-muted-foreground">Your 12th House reveals past-life patterns{h12Sign ? ` — ${h12Sign}` : ''}</p>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {/* 12th House Sign Interpretation */}
        {signData && (
          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Skull className="h-4 w-4 text-purple-500" />
              {h12Sign} in the 12th House
            </h4>
            <p className="text-xs leading-relaxed mb-3">{signData.pastLifeDescription}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-2 rounded bg-secondary/40">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">Past-Life Occupation</p>
                <p className="text-xs">{signData.pastLifeOccupation}</p>
              </div>
              <div className="p-2 rounded bg-secondary/40">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">Subconscious Pattern</p>
                <p className="text-xs">{signData.subconscious}</p>
              </div>
            </div>
            <div className="mt-3 p-2 rounded bg-violet-100/50 dark:bg-violet-900/20">
              <p className="text-[10px] font-medium text-violet-600 mb-1">Karmic Advice</p>
              <p className="text-xs text-foreground/80">{signData.karmicAdvice}</p>
            </div>
          </div>
        )}

        {/* Planets in 12th House */}
        {hasPlanets && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Planets in Your 12th House</h4>
            {h12Planets.map(planet => {
              const pData = PLANETS_IN_12TH[planet];
              if (!pData) return null;
              return (
                <div key={planet} className="p-3 rounded-lg border bg-card">
                  <h5 className="text-xs font-medium mb-1">{planet} in the 12th House</h5>
                  <p className="text-[11px] text-foreground/70 mb-2">{pData.pastLife}</p>
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20">
                    <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Karmic Lesson</p>
                    <p className="text-[11px] italic">{pData.karmicLesson}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground italic text-right">
          Source: {KARMIC_SOURCE}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
