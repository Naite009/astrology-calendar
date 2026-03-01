import { useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Briefcase, Target, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { MC_CAREER_DATA, MC_RULER_IN_HOUSE, SIGN_RULERS, MC_CAREER_SOURCE } from '@/lib/midheavenCareerData';

interface Props {
  chart: NatalChart;
  mcHouse?: number | null;
}

function getPlanetHouse(chart: NatalChart, planetName: string): number | null {
  if (!chart.planets || !chart.houseCusps) return null;
  const planet = chart.planets[planetName as keyof typeof chart.planets];
  if (!planet?.sign) return null;
  
  const ZODIAC = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC.indexOf(sign) * 30 + deg + (min / 60);
  
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (c?.sign) cusps.push(toLon(c.sign, c.degree, c.minutes ?? 0));
    else return null;
  }
  
  const lon = toLon(planet.sign, planet.degree, planet.minutes ?? 0);
  for (let i = 0; i < 12; i++) {
    const cur = cusps[i], next = cusps[(i + 1) % 12];
    const inH = next < cur ? (lon >= cur || lon < next) : (lon >= cur && lon < next);
    if (inH) return i + 1;
  }
  return null;
}

export function MidheavenCareerCard({ chart }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Get MC sign from house 10 cusp (primary), fallback to planets
  const mcSign = chart.houseCusps?.house10?.sign || chart.planets?.['Midheaven']?.sign || chart.planets?.['MC']?.sign;

  if (!mcSign) return null;

  const data = MC_CAREER_DATA[mcSign];
  if (!data) return null;

  // Find the MC ruler and its house
  const mcRuler = SIGN_RULERS[mcSign];
  const rulerHouse = mcRuler ? getPlanetHouse(chart, mcRuler) : null;
  const rulerInHouseText = rulerHouse ? MC_RULER_IN_HOUSE[rulerHouse] : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-colors">
        <Briefcase className="h-5 w-5 text-amber-600" />
        <div className="flex-1 text-left">
          <span className="text-sm font-medium">Your Path to Success — {mcSign} Midheaven</span>
          <p className="text-[11px] text-muted-foreground">Career gifts, Achilles heel & self-actualization</p>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {/* Key Principle */}
        <div className="p-4 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-amber-600" />
            <h4 className="text-sm font-medium">Key Principle</h4>
          </div>
          <p className="text-sm font-serif italic">{data.keyPrinciple}</p>
        </div>

        {/* Creating Success */}
        <Card className="border-green-200 dark:border-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400">Creating Success</h4>
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">{data.creatingSuccess}</p>
          </CardContent>
        </Card>

        {/* Achilles Heel */}
        <Card className="border-rose-200 dark:border-rose-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <h4 className="text-sm font-medium text-rose-700 dark:text-rose-400">Your Achilles Heel</h4>
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">{data.achillesHeel}</p>
          </CardContent>
        </Card>

        {/* Self-Actualization */}
        <Card className="border-violet-200 dark:border-violet-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <h4 className="text-sm font-medium text-violet-700 dark:text-violet-400">Self-Actualization</h4>
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">{data.selfActualization}</p>
          </CardContent>
        </Card>

        {/* Good Career Choices */}
        <div className="p-3 rounded-lg bg-secondary/40">
          <h4 className="text-xs font-medium mb-2">Good Career Choices</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.goodCareerChoices.map((career, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">{career}</span>
            ))}
          </div>
        </div>

        {/* MC Ruler Flow */}
        {mcRuler && rulerHouse && rulerInHouseText && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              Career Flow Formula
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </h4>
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-800">MC in {mcSign}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-800">Ruler: {mcRuler}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-800">House {rulerHouse}</span>
            </div>
            <p className="text-[11px] text-foreground/70">{rulerInHouseText}</p>
          </div>
        )}

        {/* Home Base */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Your "Home Base" — childhood conditioning & past lives
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-foreground/70">{data.homeBase}</p>
        </details>

        <p className="text-[10px] text-muted-foreground italic text-right">
          Source: {MC_CAREER_SOURCE}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
