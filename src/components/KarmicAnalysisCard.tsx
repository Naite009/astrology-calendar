import { useState } from 'react';
import { Moon, Sparkles, Clock, Target, Heart, AlertTriangle, ChevronDown, ChevronUp, Flame, Users, Zap, Star, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type KarmicType = 'completion' | 'new_contract' | 'soul_family' | 'catalyst' | 'twin_flame' | 'karmic_lesson';

export interface KarmicIndicator {
  type: 'south_node' | 'north_node' | 'saturn' | 'pluto' | 'chiron' | 'twelfth_house' | 'eighth_house' | 'vertex';
  planet1: string;
  planet2: string;
  aspect?: string;
  weight: number;
  interpretation: string;
  theme: 'past_life' | 'soul_growth' | 'karmic_debt' | 'transformation' | 'healing' | 'fated';
}

export interface KarmicTimeline {
  likely_duration: string;
  key_lessons: string[];
  completion_indicators: string[];
}

export interface KarmicAnalysis {
  totalKarmicScore: number;
  pastLifeProbability: number;
  karmicType: KarmicType;
  indicators: KarmicIndicator[];
  dangerFlags: string[];
  healingOpportunities: string[];
  soulPurpose: string;
  recommendedApproach: string;
  timeline: KarmicTimeline;
}

interface KarmicAnalysisCardProps {
  analysis: KarmicAnalysis;
  chart1Name: string;
  chart2Name: string;
}

const karmicTypeConfig: Record<KarmicType, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  description: string;
}> = {
  twin_flame: {
    label: 'Twin Flame',
    icon: <Flame size={20} />,
    color: 'text-purple-600 dark:text-purple-400',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Mirror souls designed for radical transformation and awakening'
  },
  completion: {
    label: 'Karmic Completion',
    icon: <Target size={20} />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgGradient: 'from-indigo-500/20 to-blue-500/20',
    description: 'Past life patterns seeking resolution and release'
  },
  catalyst: {
    label: 'Catalyst Connection',
    icon: <Zap size={20} />,
    color: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    description: 'Intense transformation through temporary but powerful connection'
  },
  soul_family: {
    label: 'Soul Family',
    icon: <Users size={20} />,
    color: 'text-green-600 dark:text-green-400',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    description: 'Supportive souls traveling together across lifetimes'
  },
  karmic_lesson: {
    label: 'Karmic Lesson',
    icon: <Compass size={20} />,
    color: 'text-blue-600 dark:text-blue-400',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    description: 'Specific soul lessons meant to be mastered through this connection'
  },
  new_contract: {
    label: 'New Soul Contract',
    icon: <Star size={20} />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgGradient: 'from-cyan-500/20 to-teal-500/20',
    description: 'Fresh soul agreement without heavy karmic baggage'
  }
};

const themeIcons: Record<KarmicIndicator['theme'], React.ReactNode> = {
  past_life: <Moon size={14} />,
  soul_growth: <Sparkles size={14} />,
  karmic_debt: <Target size={14} />,
  transformation: <Zap size={14} />,
  healing: <Heart size={14} />,
  fated: <Star size={14} />
};

const themeColors: Record<KarmicIndicator['theme'], string> = {
  past_life: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  soul_growth: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  karmic_debt: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  transformation: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  healing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  fated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
};

export const KarmicAnalysisCard = ({ analysis, chart1Name, chart2Name }: KarmicAnalysisCardProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('purpose');
  const config = karmicTypeConfig[analysis.karmicType];
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Group indicators by theme
  const indicatorsByTheme = analysis.indicators.reduce((acc, ind) => {
    if (!acc[ind.theme]) acc[ind.theme] = [];
    acc[ind.theme].push(ind);
    return acc;
  }, {} as Record<string, KarmicIndicator[]>);
  
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${config.bgGradient} overflow-hidden`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-background/80 ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h3 className={`text-xl font-semibold ${config.color}`}>
                {config.label} Connection
              </h3>
              <Badge variant="secondary" className="font-mono">
                {analysis.pastLifeProbability}% Past Life Probability
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
        
        {/* Karmic Score */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-background/60 border">
            <div className="text-xs text-muted-foreground mb-1">Karmic Intensity</div>
            <div className="flex items-center gap-2">
              <Progress value={Math.min(100, analysis.totalKarmicScore)} className="flex-1 h-2" />
              <span className="font-mono text-sm">{analysis.totalKarmicScore}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background/60 border">
            <div className="text-xs text-muted-foreground mb-1">Connection Depth</div>
            <div className="flex items-center gap-2">
              <Progress value={analysis.pastLifeProbability} className="flex-1 h-2" />
              <span className="font-mono text-sm">{analysis.pastLifeProbability}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Soul Purpose Section */}
      <Collapsible open={expandedSection === 'purpose'} onOpenChange={() => toggleSection('purpose')}>
        <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles size={16} className="text-primary" />
            Soul Purpose & Timeline
          </div>
          {expandedSection === 'purpose' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 py-4 border-t bg-background/30 space-y-4">
          {/* Soul Purpose */}
          <div className="p-4 rounded-lg bg-background/80 border">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Target size={14} className="text-primary" />
              Why You Met
            </h4>
            <p className="text-sm text-muted-foreground">{analysis.soulPurpose}</p>
          </div>
          
          {/* Timeline */}
          <div className="p-4 rounded-lg bg-background/80 border">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              Timeline: {analysis.timeline.likely_duration}
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Key Lessons</div>
                <ul className="space-y-1">
                  {analysis.timeline.key_lessons.map((lesson, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Completion Signs</div>
                <ul className="space-y-1">
                  {analysis.timeline.completion_indicators.map((sign, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Recommended Approach */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-medium text-sm mb-2">💡 Recommended Approach</h4>
            <p className="text-sm text-muted-foreground">{analysis.recommendedApproach}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Indicators Section */}
      <Collapsible open={expandedSection === 'indicators'} onOpenChange={() => toggleSection('indicators')}>
        <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Moon size={16} className="text-purple-500" />
            Karmic Indicators ({analysis.indicators.length})
          </div>
          {expandedSection === 'indicators' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 py-4 border-t bg-background/30">
          <Tabs defaultValue={Object.keys(indicatorsByTheme)[0] || 'all'} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 mb-4">
              {Object.entries(indicatorsByTheme).map(([theme, inds]) => (
                <TabsTrigger 
                  key={theme} 
                  value={theme}
                  className="text-xs flex items-center gap-1"
                >
                  {themeIcons[theme as keyof typeof themeIcons]}
                  <span className="hidden md:inline capitalize">{theme.replace('_', ' ')}</span>
                  <span className="text-muted-foreground">({inds.length})</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(indicatorsByTheme).map(([theme, inds]) => (
              <TabsContent key={theme} value={theme}>
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {inds.map((indicator, i) => (
                      <div key={i} className="p-3 rounded-lg bg-background/80 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={themeColors[indicator.theme]}>
                            {indicator.type.replace('_', ' ')}
                          </Badge>
                          {indicator.aspect && (
                            <span className="text-xs text-muted-foreground">
                              {indicator.planet1} {indicator.aspect} {indicator.planet2}
                            </span>
                          )}
                          <span className="ml-auto text-xs text-muted-foreground">
                            Weight: {indicator.weight}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{indicator.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Healing & Danger Flags Section */}
      {(analysis.healingOpportunities.length > 0 || analysis.dangerFlags.length > 0) && (
        <Collapsible open={expandedSection === 'healing'} onOpenChange={() => toggleSection('healing')}>
          <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Heart size={16} className="text-pink-500" />
              Healing & Growth Areas
            </div>
            {expandedSection === 'healing' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 py-4 border-t bg-background/30 space-y-4">
            {/* Healing Opportunities */}
            {analysis.healingOpportunities.length > 0 && (
              <div className="p-4 rounded-lg bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
                <h4 className="font-medium text-sm mb-2 text-pink-700 dark:text-pink-300">
                  💚 Healing Opportunities
                </h4>
                <ul className="space-y-1">
                  {analysis.healingOpportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-pink-700 dark:text-pink-300">
                      • {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Danger Flags */}
            {analysis.dangerFlags.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-sm mb-2 text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Areas to Watch
                </h4>
                <ul className="space-y-1">
                  {analysis.dangerFlags.map((flag, i) => (
                    <li key={i} className="text-sm text-amber-700 dark:text-amber-300">
                      • {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default KarmicAnalysisCard;
