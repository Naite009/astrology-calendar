import { useMemo, useState } from 'react';
import { Heart, Flame, Brain, Moon, Sparkles, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { generateSynastryReport, getAspectSymbol, getCategoryEmoji, SynastryAspect, SynastryReport } from '@/lib/synastry';
import { NatalChart } from '@/hooks/useNatalChart';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SynastryAnalysisCardProps {
  chart1: NatalChart | null;
  chart2: NatalChart | null;
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

const AspectRow = ({ aspect }: { aspect: SynastryAspect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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
            {isOpen ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2 pb-2">
          <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg">
            {aspect.interpretation}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const SynastryAnalysisCard = ({ chart1, chart2 }: SynastryAnalysisCardProps) => {
  const [showAllAspects, setShowAllAspects] = useState(false);
  
  const report = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return generateSynastryReport(chart1, chart2);
  }, [chart1, chart2]);
  
  if (!chart1 || !chart2) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <div className="flex items-center gap-2 text-purple-500 mb-2">
          <Heart size={18} />
          <h3 className="font-medium">Synastry Analysis</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select two charts to see their astrological compatibility
        </p>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Synastry Analysis</h3>
            <p className="text-xs text-muted-foreground">
              {chart1.name} & {chart2.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {report.overallScore}%
          </div>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
      </div>
      
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
              <AspectRow key={`passion-${i}`} aspect={aspect} />
            ))}
            
            {/* Emotional aspects */}
            {emotionalAspects.slice(0, showAllAspects ? undefined : 2).map((aspect, i) => (
              <AspectRow key={`emotional-${i}`} aspect={aspect} />
            ))}
            
            {/* Karmic aspects */}
            {karmicAspects.slice(0, showAllAspects ? undefined : 1).map((aspect, i) => (
              <AspectRow key={`karmic-${i}`} aspect={aspect} />
            ))}
            
            {/* Rest of aspects when expanded */}
            {showAllAspects && report.aspects
              .filter(a => !passionAspects.includes(a) && !emotionalAspects.includes(a) && !karmicAspects.includes(a))
              .map((aspect, i) => (
                <AspectRow key={`other-${i}`} aspect={aspect} />
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
