import { useMemo, useState } from 'react';
import { Heart, Flame, Brain, Moon, Sparkles, ChevronDown, ChevronUp, Star, Users, Plus, Info } from 'lucide-react';
import { generateSynastryReport, getAspectSymbol, getCategoryEmoji, SynastryAspect, SynastryReport } from '@/lib/synastry';
import { NatalChart } from '@/hooks/useNatalChart';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDirectionalInterpretation } from '@/data/directionalAspectData';
import { DirectionalAspectCard } from '@/components/synastry/DirectionalAspectCard';
import { RelationshipContext } from '@/types/directionalAspects';

interface SynastryAnalysisCardProps {
  chart1: NatalChart | null;
  chart2: NatalChart | null;
  availableCharts?: NatalChart[];
  onChartSelect?: (chart1Id: string, chart2Id: string) => void;
}

// Quick compare person - just birth date
interface QuickPerson {
  name: string;
  birthDate: string;
}

const ScoreGauge = ({ 
  label, 
  score, 
  icon, 
  color 
}: { 
  label: string; 
  score: number; 
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="flex items-center gap-2">
    <div className={`p-1.5 rounded-full ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium truncate">{label}</span>
        <span className="text-xs font-bold">{score}%</span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  </div>
);

const AspectRow = ({ 
  aspect, 
  relationshipContext,
  personAName,
  personBName 
}: { 
  aspect: SynastryAspect; 
  relationshipContext?: RelationshipContext;
  personAName?: string;
  personBName?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get directional interpretation if available
  const directionalInterp = useMemo(() => {
    if (!relationshipContext) return null;
    return getDirectionalInterpretation(
      aspect.planet1,
      aspect.aspectType,
      aspect.planet2,
      relationshipContext
    );
  }, [aspect, relationshipContext]);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-2">
            <span className="text-sm">{getCategoryEmoji(aspect.category)}</span>
            <div>
              <p className="text-sm font-medium">
                {aspect.planet1} {getAspectSymbol(aspect.aspectType)} {aspect.planet2}
              </p>
              <p className="text-xs text-muted-foreground">
                {aspect.planet1Owner}'s {aspect.planet1} • {aspect.planet2Owner}'s {aspect.planet2}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={aspect.isHarmonious ? 'default' : 'secondary'}
              className={`text-xs ${aspect.isHarmonious ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}
            >
              {aspect.aspectType} ({aspect.orb}°)
            </Badge>
            {directionalInterp && (
              <Badge variant="outline" className="text-[10px] px-1.5">
                ↔️ Who feels what
              </Badge>
            )}
            {isOpen ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2 pb-2 space-y-3">
          <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg">
            {aspect.interpretation}
          </p>
          
          {/* Directional Aspect Card */}
          {directionalInterp && personAName && personBName && (
            <DirectionalAspectCard
              interpretation={directionalInterp}
              context={relationshipContext!}
              personAName={personAName}
              personBName={personBName}
            />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const SynastryAnalysisCard = ({ 
  chart1, 
  chart2, 
  availableCharts = [],
  onChartSelect
}: SynastryAnalysisCardProps) => {
  const [showAllAspects, setShowAllAspects] = useState(false);
  const [showQuickCompare, setShowQuickCompare] = useState(false);
  const [quickPerson, setQuickPerson] = useState<QuickPerson>({ name: '', birthDate: '' });
  const [selectedChart1, setSelectedChart1] = useState<string>(chart1?.id || '');
  const [selectedChart2, setSelectedChart2] = useState<string>(chart2?.id || '');
  
  // Create a temporary chart from quick compare data
  const quickCompareChart = useMemo((): NatalChart | null => {
    if (!quickPerson.name || !quickPerson.birthDate) return null;
    return {
      id: 'quick-compare',
      name: quickPerson.name,
      birthDate: quickPerson.birthDate,
      birthTime: '12:00', // Noon default
      birthLocation: 'Unknown',
      planets: {} // Will use basic calculations
    };
  }, [quickPerson]);
  
  // Determine which charts to compare
  const effectiveChart1 = availableCharts.find(c => c.id === selectedChart1) || chart1;
  const effectiveChart2 = quickCompareChart || availableCharts.find(c => c.id === selectedChart2) || chart2;
  
  const report = useMemo(() => {
    if (!effectiveChart1 || !effectiveChart2) return null;
    return generateSynastryReport(effectiveChart1, effectiveChart2);
  }, [effectiveChart1, effectiveChart2]);
  
  // Empty state with chart selector
  if (!effectiveChart1 || !effectiveChart2 || !report) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <div className="flex items-center gap-2 text-purple-500 mb-3">
          <Heart size={18} />
          <h3 className="font-medium">Synastry Analysis</h3>
        </div>
        
        {availableCharts.length >= 2 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Choose two people to compare:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedChart1} onValueChange={setSelectedChart1}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Person 1" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {availableCharts.map(c => (
                    <SelectItem key={c.id} value={c.id} disabled={c.id === selectedChart2}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedChart2} onValueChange={setSelectedChart2}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Person 2" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {availableCharts.map(c => (
                    <SelectItem key={c.id} value={c.id} disabled={c.id === selectedChart1}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add another chart to compare, or enter quick birth data:
            </p>
            
            <div className="p-3 rounded-lg bg-background border border-border space-y-2">
              <div>
                <Label className="text-xs">Name</Label>
                <Input 
                  placeholder="Their name"
                  value={quickPerson.name}
                  onChange={e => setQuickPerson(p => ({ ...p, name: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Birth Date</Label>
                <Input 
                  type="date"
                  value={quickPerson.birthDate}
                  onChange={e => setQuickPerson(p => ({ ...p, birthDate: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Info size={12} />
                      <span>Birth date gives basic compatibility. Add full chart for accuracy.</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Birth date only:</strong> Shows planetary aspects (Venus, Mars, Sun, Moon at noon).<br/><br/>
                      <strong>With birth time:</strong> Adds Moon sign accuracy, Ascendant, and house overlays.<br/><br/>
                      <strong>With location:</strong> Adds house cusps for deepest analysis.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (!report) return null;
  
  // Separate aspects by category
  const passionAspects = report.aspects.filter(a => a.category === 'passion');
  const emotionalAspects = report.aspects.filter(a => a.category === 'emotional');
  const karmicAspects = report.aspects.filter(a => a.category === 'karmic' || a.category === 'growth');
  
  return (
    <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      {/* Header with Chart Selectors */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Synastry Analysis</h3>
            {availableCharts.length >= 2 ? (
              <div className="flex items-center gap-1 mt-1">
                <Select value={selectedChart1 || effectiveChart1?.id} onValueChange={setSelectedChart1}>
                  <SelectTrigger className="h-6 text-xs px-2 py-0 w-auto min-w-[80px] bg-background">
                    <SelectValue placeholder={effectiveChart1?.name} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {availableCharts.map(c => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === selectedChart2} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">&</span>
                <Select value={selectedChart2 || effectiveChart2?.id} onValueChange={setSelectedChart2}>
                  <SelectTrigger className="h-6 text-xs px-2 py-0 w-auto min-w-[80px] bg-background">
                    <SelectValue placeholder={effectiveChart2?.name} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {availableCharts.map(c => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === selectedChart1} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {effectiveChart1?.name} & {effectiveChart2?.name}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {report.overallScore}%
          </div>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
      </div>
      
      {/* Quick Compare Toggle */}
      {!quickCompareChart && (
        <button
          onClick={() => setShowQuickCompare(!showQuickCompare)}
          className="mb-3 text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
        >
          <Plus size={12} />
          Compare with someone else
        </button>
      )}
      
      {showQuickCompare && !quickCompareChart && (
        <div className="mb-4 p-3 rounded-lg bg-background border border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Name</Label>
              <Input 
                placeholder="Their name"
                value={quickPerson.name}
                onChange={e => setQuickPerson(p => ({ ...p, name: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Birth Date</Label>
              <Input 
                type="date"
                value={quickPerson.birthDate}
                onChange={e => setQuickPerson(p => ({ ...p, birthDate: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Just birth date works! Add full chart later for Moon sign & house accuracy.
          </p>
        </div>
      )}
      
      {quickCompareChart && (
        <button
          onClick={() => setQuickPerson({ name: '', birthDate: '' })}
          className="mb-3 text-xs text-amber-600 hover:text-amber-700"
        >
          ✕ Clear quick compare
        </button>
      )}
      
      {/* Summary */}
      <div className="mb-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-purple-100 dark:border-purple-900/30">
        <p className="text-sm">{report.summary}</p>
      </div>
      
      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ScoreGauge 
          label="Passion" 
          score={report.passionScore} 
          icon={<Flame size={14} className="text-white" />}
          color="bg-red-400"
        />
        <ScoreGauge 
          label="Emotional" 
          score={report.emotionalScore} 
          icon={<Heart size={14} className="text-white" />}
          color="bg-pink-400"
        />
        <ScoreGauge 
          label="Mental" 
          score={report.mentalScore} 
          icon={<Brain size={14} className="text-white" />}
          color="bg-blue-400"
        />
        <ScoreGauge 
          label="Karmic" 
          score={report.karmicScore} 
          icon={<Moon size={14} className="text-white" />}
          color="bg-purple-400"
        />
      </div>
      
      {/* Strengths & Challenges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {report.strengths.length > 0 && (
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">✨ Strengths</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {report.strengths.slice(0, 3).map((s, i) => (
                <li key={i} className="truncate">{s.split(':')[0]}</li>
              ))}
            </ul>
          </div>
        )}
        {report.challenges.length > 0 && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">⚡ Growth Areas</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {report.challenges.slice(0, 3).map((c, i) => (
                <li key={i} className="truncate">{c.split(':')[0]}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Soul Contract */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">🌙 Soul Contract</p>
        <p className="text-sm text-foreground">{report.soulContract}</p>
      </div>
      
      {/* Major Aspects */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Key Connections</h4>
          <button 
            onClick={() => setShowAllAspects(!showAllAspects)}
            className="text-xs text-primary hover:underline"
          >
            {showAllAspects ? 'Show less' : `Show all ${report.aspects.length}`}
          </button>
        </div>
        
        <ScrollArea className={showAllAspects ? 'h-64' : 'h-auto'}>
          <div className="space-y-1">
            {/* Show passion aspects first */}
            {passionAspects.slice(0, showAllAspects ? undefined : 2).map((aspect, i) => (
              <AspectRow key={`passion-${i}`} aspect={aspect} relationshipContext="romance" personAName={effectiveChart1?.name} personBName={effectiveChart2?.name} />
            ))}
            
            {/* Emotional aspects */}
            {emotionalAspects.slice(0, showAllAspects ? undefined : 2).map((aspect, i) => (
              <AspectRow key={`emotional-${i}`} aspect={aspect} relationshipContext="romance" personAName={effectiveChart1?.name} personBName={effectiveChart2?.name} />
            ))}
            
            {/* Karmic aspects */}
            {karmicAspects.slice(0, showAllAspects ? undefined : 1).map((aspect, i) => (
              <AspectRow key={`karmic-${i}`} aspect={aspect} relationshipContext="romance" personAName={effectiveChart1?.name} personBName={effectiveChart2?.name} />
            ))}
            
            {/* Rest of aspects when expanded */}
            {showAllAspects && report.aspects
              .filter(a => !passionAspects.includes(a) && !emotionalAspects.includes(a) && !karmicAspects.includes(a))
              .map((aspect, i) => (
                <AspectRow key={`other-${i}`} aspect={aspect} relationshipContext="romance" personAName={effectiveChart1?.name} personBName={effectiveChart2?.name} />
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
