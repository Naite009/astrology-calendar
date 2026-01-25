import { useState, useMemo } from 'react';
import { Moon, Sparkles, Clock, Target, Heart, AlertTriangle, ChevronDown, ChevronUp, Flame, Users, Zap, Star, Compass, Calculator, BookOpen, HelpCircle, Plus, Equal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const themeLabels: Record<KarmicIndicator['theme'], string> = {
  past_life: 'Past Life',
  soul_growth: 'Soul Growth',
  karmic_debt: 'Karmic Debt',
  transformation: 'Transformation',
  healing: 'Healing',
  fated: 'Fated'
};

const themeMeanings: Record<KarmicIndicator['theme'], string> = {
  past_life: 'These contacts suggest you\'ve known each other in previous incarnations. The familiarity, instant recognition, or comfort/discomfort you feel is rooted in shared soul history.',
  soul_growth: 'These contacts indicate this person helps push you toward your soul\'s evolutionary purpose. They support your North Node direction and help you become who you\'re meant to be.',
  karmic_debt: 'These contacts suggest unfinished business or lessons from past lives. Saturn contacts often indicate where you must earn trust, prove maturity, or work through restrictions.',
  transformation: 'These contacts indicate deep, irreversible change. Pluto contacts transform you at the core—for better or worse—and often involve power dynamics that must be consciously navigated.',
  healing: 'These contacts activate old wounds for potential healing. Chiron contacts bring the wounded healer dynamic—you may hurt each other or help each other heal, depending on consciousness.',
  fated: 'These contacts indicate destined meetings. Vertex contacts suggest this person was "meant" to appear in your life at this specific time for a specific purpose.'
};

// Explain what each indicator type means in plain English
const indicatorTypeMeanings: Record<string, string> = {
  south_node: 'South Node contacts indicate past life familiarity. This person feels like "home" because you\'ve been here before.',
  north_node: 'North Node contacts help you grow. This person pushes you toward your soul\'s purpose, even if it feels uncomfortable.',
  saturn: 'Saturn brings lessons of commitment, responsibility, and sometimes restriction. This is karmic debt being worked out.',
  pluto: 'Pluto brings transformation through intensity. This is about power, control, and deep psychological change.',
  chiron: 'Chiron brings healing through pain. This person touches your core wounds—and you touch theirs.',
  twelfth_house: '12th House overlays create psychic, hidden, or past-life connections. Often unconscious but deeply felt.',
  eighth_house: '8th House overlays create intense bonding around intimacy, shared resources, and transformation.',
  vertex: 'Vertex contacts mark fated, destined meetings. This person entered your life at exactly the right time.'
};

// Explain the thresholds for each karmic type
const karmicTypeThresholds: Record<KarmicType, string> = {
  twin_flame: 'Requires: 100+ total score AND 4+ past life indicators AND 3+ transformation indicators',
  completion: 'Requires: 5+ past life indicators (heavy past life emphasis)',
  catalyst: 'Requires: 4+ transformation indicators AND 60+ total score (intense but less past life)',
  soul_family: 'Requires: 2+ soul growth indicators OR 2+ fated indicators OR 40+ score with 1+ growth',
  karmic_lesson: 'Requires: 50+ total score AND 2+ past life indicators',
  new_contract: 'Requires: <30 total score AND 0 past life AND 0 growth AND 0 transformation indicators'
};

export const KarmicAnalysisCard = ({ analysis, chart1Name, chart2Name }: KarmicAnalysisCardProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('purpose');
  const [showTeaching, setShowTeaching] = useState(false);
  const config = karmicTypeConfig[analysis.karmicType];
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Group indicators by theme with point totals
  const themeBreakdown = useMemo(() => {
    const breakdown: Record<string, { indicators: KarmicIndicator[]; points: number }> = {};
    analysis.indicators.forEach(ind => {
      if (!breakdown[ind.theme]) {
        breakdown[ind.theme] = { indicators: [], points: 0 };
      }
      breakdown[ind.theme].indicators.push(ind);
      breakdown[ind.theme].points += ind.weight;
    });
    return breakdown;
  }, [analysis.indicators]);

  // Calculate counts for karmic type reasoning
  const themeCounts = useMemo(() => ({
    past_life: themeBreakdown.past_life?.indicators.length || 0,
    soul_growth: themeBreakdown.soul_growth?.indicators.length || 0,
    transformation: themeBreakdown.transformation?.indicators.length || 0,
    healing: themeBreakdown.healing?.indicators.length || 0,
    fated: themeBreakdown.fated?.indicators.length || 0,
    karmic_debt: themeBreakdown.karmic_debt?.indicators.length || 0,
  }), [themeBreakdown]);

  const pastLifePoints = themeBreakdown.past_life?.points || 0;
  
  // Generate the reasoning for why this karmic type was chosen
  const karmicTypeReasoning = useMemo(() => {
    const type = analysis.karmicType;
    const reasons: string[] = [];
    
    switch(type) {
      case 'twin_flame':
        reasons.push(`Total score (${analysis.totalKarmicScore}) is ≥100`);
        reasons.push(`Past life indicators (${themeCounts.past_life}) is ≥4`);
        reasons.push(`Transformation indicators (${themeCounts.transformation}) is ≥3`);
        break;
      case 'completion':
        reasons.push(`Past life indicators (${themeCounts.past_life}) is ≥5`);
        reasons.push('Heavy past life emphasis suggests unfinished business to complete');
        break;
      case 'catalyst':
        reasons.push(`Transformation indicators (${themeCounts.transformation}) is ≥4`);
        reasons.push(`Total score (${analysis.totalKarmicScore}) is ≥60`);
        reasons.push('High intensity without as much past life baggage = catalyst energy');
        break;
      case 'soul_family':
        if (themeCounts.soul_growth >= 2) {
          reasons.push(`Soul growth indicators (${themeCounts.soul_growth}) is ≥2`);
        }
        if (themeCounts.fated >= 2) {
          reasons.push(`Fated indicators (${themeCounts.fated}) is ≥2`);
        }
        if (analysis.totalKarmicScore >= 40 && themeCounts.soul_growth >= 1) {
          reasons.push(`Score (${analysis.totalKarmicScore}) ≥40 with ${themeCounts.soul_growth}+ growth indicator`);
        }
        reasons.push('Supportive connections that nurture mutual evolution');
        break;
      case 'karmic_lesson':
        reasons.push(`Total score (${analysis.totalKarmicScore}) is ≥50`);
        reasons.push(`Past life indicators (${themeCounts.past_life}) is ≥2`);
        reasons.push('Moderate karma with specific lessons to master');
        break;
      case 'new_contract':
        reasons.push(`Total score (${analysis.totalKarmicScore}) is <30`);
        reasons.push(`Past life indicators (${themeCounts.past_life}) is 0`);
        reasons.push('Minimal karmic baggage = fresh start together');
        break;
    }
    
    return reasons;
  }, [analysis.karmicType, analysis.totalKarmicScore, themeCounts]);
  
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

        {/* Learn How This Was Calculated Button */}
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTeaching(!showTeaching)}
            className="w-full flex items-center gap-2"
          >
            <BookOpen size={16} />
            {showTeaching ? 'Hide Calculation Details' : 'Learn How This Was Calculated'}
            {showTeaching ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>

      {/* TEACHING SECTION - Educational Breakdown */}
      {showTeaching && (
        <div className="px-6 pb-6 space-y-4">
          
          {/* 1. INDICATORS BREAKDOWN */}
          <div className="p-4 rounded-lg bg-background/80 border">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Calculator size={16} className="text-primary" />
              1. Indicators Breakdown
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Each astrological contact between your charts contributes points based on its karmic significance.
            </p>
            
            <ScrollArea className="max-h-72">
              <div className="space-y-2">
                {analysis.indicators.map((ind, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={themeColors[ind.theme]} variant="secondary">
                          {themeLabels[ind.theme]}
                        </Badge>
                        <span className="font-medium">
                          {ind.aspect 
                            ? `${ind.planet1} ${ind.aspect} ${ind.planet2}`
                            : `${ind.planet1} → ${ind.planet2}`
                          }
                        </span>
                      </div>
                      <Badge variant="outline" className="font-mono text-primary">
                        +{ind.weight} pts
                      </Badge>
                    </div>
                    
                    {/* What this means */}
                    <div className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">Why it matters: </span>
                      {indicatorTypeMeanings[ind.type] || 'Karmic connection detected.'}
                    </div>
                    
                    {/* Interpretation */}
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                      <span className="font-medium text-foreground">Interpretation: </span>
                      {ind.interpretation}
                    </div>
                  </div>
                ))}
                
                {analysis.indicators.length === 0 && (
                  <p className="text-sm text-muted-foreground">No karmic indicators detected.</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 2. SCORE CALCULATION */}
          <div className="p-4 rounded-lg bg-background/80 border">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Plus size={16} className="text-primary" />
              2. Score Calculation
            </h4>
            
            <div className="space-y-3">
              {/* Total Score */}
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-sm font-medium">
                  Total Karmic Score: <span className="font-mono text-primary">{analysis.totalKarmicScore} points</span> from {analysis.indicators.length} indicators
                </div>
              </div>
              
              {/* Theme Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(themeBreakdown).map(([theme, data]) => (
                  <div key={theme} className="p-2 rounded bg-muted/50 text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      {themeIcons[theme as keyof typeof themeIcons]}
                      <span className="capitalize">{theme.replace('_', ' ')}</span>
                    </div>
                    <div className="font-mono">
                      {data.points} pts ({data.indicators.length} indicators)
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Past Life Probability Formula */}
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground mb-2">
                  <HelpCircle size={12} className="inline mr-1" />
                  <span className="font-medium text-foreground">Past Life Probability Formula:</span>
                </div>
                <div className="font-mono text-sm flex items-center gap-2 flex-wrap">
                  <span>({pastLifePoints} past life pts</span>
                  <span>÷</span>
                  <span>80)</span>
                  <span>×</span>
                  <span>100</span>
                  <Equal size={14} />
                  <span className="font-bold text-primary">{analysis.pastLifeProbability}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  80 points is the baseline for "certain" past life connection. 
                  {analysis.pastLifeProbability < 30 && ' Your low score suggests a newer soul connection.'}
                  {analysis.pastLifeProbability >= 30 && analysis.pastLifeProbability < 60 && ' Your moderate score suggests some past life familiarity.'}
                  {analysis.pastLifeProbability >= 60 && ' Your high score strongly suggests past life history together.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. WHY THIS TYPE */}
          <div className="p-4 rounded-lg bg-background/80 border">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <HelpCircle size={16} className="text-primary" />
              3. Why "{config.label}"?
            </h4>
            
            <div className="space-y-3">
              {/* Current counts */}
              <div className="p-3 rounded-lg bg-muted/30 text-sm">
                <div className="font-medium mb-2">Your Indicator Counts:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>Past Life: <span className="font-mono">{themeCounts.past_life}</span></div>
                  <div>Soul Growth: <span className="font-mono">{themeCounts.soul_growth}</span></div>
                  <div>Transformation: <span className="font-mono">{themeCounts.transformation}</span></div>
                  <div>Healing: <span className="font-mono">{themeCounts.healing}</span></div>
                  <div>Fated: <span className="font-mono">{themeCounts.fated}</span></div>
                  <div>Karmic Debt: <span className="font-mono">{themeCounts.karmic_debt}</span></div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  {config.icon}
                  <span className={config.color}>Why you matched "{config.label}":</span>
                </div>
                <ul className="space-y-1 text-xs">
                  {karmicTypeReasoning.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Thresholds reference */}
              <div className="p-3 rounded-lg bg-muted/30 border text-xs">
                <div className="font-medium mb-2">All Karmic Type Thresholds:</div>
                <div className="space-y-1 text-muted-foreground">
                  {Object.entries(karmicTypeThresholds).map(([type, threshold]) => (
                    <div key={type} className={type === analysis.karmicType ? 'text-primary font-medium' : ''}>
                      <span className="capitalize">{type.replace('_', ' ')}</span>: {threshold}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. THEME MEANINGS REFERENCE */}
          <div className="p-4 rounded-lg bg-background/80 border">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              4. Theme Reference Guide
            </h4>
            <div className="grid gap-2">
              {Object.entries(themeMeanings).map(([theme, meaning]) => (
                <div key={theme} className="p-2 rounded bg-muted/30 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={themeColors[theme as keyof typeof themeColors]} variant="secondary">
                      {themeLabels[theme as keyof typeof themeLabels]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Indicators Section (Compact version for non-teaching mode) */}
      <Collapsible open={expandedSection === 'indicators'} onOpenChange={() => toggleSection('indicators')}>
        <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Moon size={16} className="text-purple-500" />
            Karmic Indicators ({analysis.indicators.length})
          </div>
          {expandedSection === 'indicators' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 py-4 border-t bg-background/30">
          <Tabs defaultValue={Object.keys(themeBreakdown)[0] || 'all'} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 mb-4">
              {Object.entries(themeBreakdown).map(([theme, data]) => (
                <TabsTrigger 
                  key={theme} 
                  value={theme}
                  className="text-xs flex items-center gap-1"
                >
                  {themeIcons[theme as keyof typeof themeIcons]}
                  <span className="hidden md:inline capitalize">{theme.replace('_', ' ')}</span>
                  <span className="text-muted-foreground">({data.indicators.length})</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(themeBreakdown).map(([theme, data]) => (
              <TabsContent key={theme} value={theme}>
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {data.indicators.map((indicator, i) => (
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
                          <span className="ml-auto text-xs font-mono text-primary">
                            +{indicator.weight} pts
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
