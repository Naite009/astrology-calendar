import { useMemo, useState } from 'react';
import { Heart, Users, ChevronDown, ChevronUp, Calendar, Info } from 'lucide-react';
import { calculateCompositeChart, calculateDavisonChart, getPlanetSymbol, CompositeChart, DavisonChart } from '@/lib/compositeChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

type ChartMethod = 'composite' | 'davison';

interface CompositeChartCardProps {
  chart1: NatalChart | null;
  chart2: NatalChart | null;
}

const PlanetRow = ({ planet, sign, degree }: { planet: string; sign: string; degree: number }) => (
  <div className="flex items-center justify-between py-1 px-2 rounded bg-secondary/30">
    <div className="flex items-center gap-2">
      <span className="text-lg">{getPlanetSymbol(planet)}</span>
      <span className="text-sm font-medium">{planet}</span>
    </div>
    <div className="text-sm text-muted-foreground">
      {degree}° {sign}
    </div>
  </div>
);

const MethodToggle = ({ 
  method, 
  onMethodChange 
}: { 
  method: ChartMethod; 
  onMethodChange: (m: ChartMethod) => void;
}) => (
  <TooltipProvider>
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary/50">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onMethodChange('composite')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              method === 'composite' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary'
            }`}
          >
            Composite
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-xs">Midpoint method: calculates the midpoint between each planet pair</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onMethodChange('davison')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              method === 'davison' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary'
            }`}
          >
            Davison
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-xs">Averaged birth data: calculates positions for the midpoint in time and space</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);

export const CompositeChartCard = ({ chart1, chart2 }: CompositeChartCardProps) => {
  const [showPlanets, setShowPlanets] = useState(false);
  const [method, setMethod] = useState<ChartMethod>('composite');
  
  const composite = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return calculateCompositeChart(chart1, chart2);
  }, [chart1, chart2]);
  
  const davison = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return calculateDavisonChart(chart1, chart2);
  }, [chart1, chart2]);
  
  const activeChart = method === 'composite' ? composite : davison;
  
  if (!chart1 || !chart2) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
        <div className="flex items-center gap-2 text-indigo-500 mb-2">
          <Users size={18} />
          <h3 className="font-medium">Relationship Chart</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select two charts to see your relationship's combined energy
        </p>
      </div>
    );
  }
  
  if (!activeChart) return null;
  
  const { interpretation } = activeChart;
  
  return (
    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {method === 'composite' ? 'Composite' : 'Davison'} Chart
            </h3>
            <p className="text-xs text-muted-foreground">
              {chart1.name} + {chart2.name}
            </p>
          </div>
        </div>
        <MethodToggle method={method} onMethodChange={setMethod} />
      </div>
      
      {/* Davison Date Info */}
      {method === 'davison' && davison && (
        <div className="mb-4 p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 flex items-center gap-2">
          <Calendar size={14} className="text-violet-500" />
          <p className="text-xs text-muted-foreground">
            Relationship "birth": <span className="font-medium text-foreground">{format(davison.averagedDate, 'MMMM d, yyyy')}</span>
          </p>
        </div>
      )}
      
      {/* Planet Signs */}
      <div className="flex gap-1 mb-4">
        <Badge variant="outline" className="text-xs">
          ☉ {interpretation.sunSign}
        </Badge>
        <Badge variant="outline" className="text-xs">
          ☽ {interpretation.moonSign}
        </Badge>
        <Badge variant="outline" className="text-xs">
          ♀ {interpretation.venusSign}
        </Badge>
        <Badge variant="outline" className="text-xs">
          ♂ {interpretation.marsSign}
        </Badge>
      </div>
      
      {/* Overall Theme */}
      <div className="mb-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-indigo-100 dark:border-indigo-900/30">
        <p className="text-sm font-medium">{interpretation.overallTheme}</p>
      </div>
      
      {/* Key Interpretations */}
      <div className="grid gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/30">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
            <span>☉</span> Relationship Style ({interpretation.sunSign})
          </p>
          <p className="text-sm text-foreground">{interpretation.relationshipStyle}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900/30">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
            <span>☽</span> Emotional Core ({interpretation.moonSign})
          </p>
          <p className="text-sm text-foreground">{interpretation.emotionalCore}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
            <p className="text-xs font-medium text-pink-700 dark:text-pink-300 mb-1">
              ♀ Love ({interpretation.venusSign})
            </p>
            <p className="text-xs text-muted-foreground">{interpretation.loveLanguage}</p>
          </div>
          
          <div className="p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
              ♂ Passion ({interpretation.marsSign})
            </p>
            <p className="text-xs text-muted-foreground">{interpretation.passionStyle}</p>
          </div>
        </div>
      </div>
      
      {/* Strengths & Challenges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {interpretation.strengths.length > 0 && (
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">✨ Strengths</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {interpretation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.challenges.length > 0 && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">⚡ Growth Areas</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {interpretation.challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Collapsible Planet Positions */}
      <Collapsible open={showPlanets} onOpenChange={setShowPlanets}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 transition-colors">
            {showPlanets ? 'Hide' : 'Show'} {method} planet positions
            {showPlanets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {Object.entries(activeChart.planets).map(([planet, pos]) => (
              <PlanetRow key={planet} planet={planet} sign={pos.sign} degree={pos.degree} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
