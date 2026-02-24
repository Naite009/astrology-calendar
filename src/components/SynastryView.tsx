import { useState, useMemo, useCallback } from 'react';
import { Heart, Users, Briefcase, GraduationCap, Sparkles, Palette, AlertTriangle, Flame, Moon, ChevronDown, ChevronUp, Info, Home, HelpCircle, Handshake, Lightbulb, CheckCircle2, XCircle, Circle, UserPlus, X, Calendar, TrendingUp, Compass, BookOpen } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from './ChartSelector';
import { generateAdvancedSynastryReport, RelationshipTypeScore, HouseOverlay, KarmicIndicator } from '@/lib/synastryAdvanced';
import { calculateCompositeChart, calculateDavisonChart, getPlanetSymbol } from '@/lib/compositeChart';
import { analyzeRelationshipFocus, FocusAnalysis, FocusIndicator } from '@/lib/relationshipFocusAnalysis';
import { filterHouseOverlaysForFocus, filterKarmicIndicatorsForFocus, generateFocusedSoulContractTheme, RelationshipFocus } from '@/lib/focusAwareInterpretations';
import { analyzeGroupDynamics, GroupDynamicsReport } from '@/lib/groupDynamicsAnalysis';
import { analyzeShadowDynamics } from '@/lib/shadowIndicators';
import calculateKarmicAnalysis from '@/lib/karmicAnalysis';
import { calculateRelationshipPotential, calculatePurposeAlignment } from '@/lib/relationshipPotentialCalculator';
import { FamilyRelationshipContext } from '@/lib/familyRelationshipTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SynastryWheelSimple } from './SynastryWheelSimple';
import { RelationshipChartWheel } from './RelationshipChartWheel';
import { SynastryTransitTimeline } from './SynastryTransitTimeline';
import { SynastryPDFExport } from './SynastryPDFExport';
import { RelationshipTimingCalculator } from './RelationshipTimingCalculator';
import { CompatibilityRadarChart } from './CompatibilityRadarChart';
import { ScoringBreakdownView } from './ScoringBreakdownView';
import { ShadowIndicatorsCard } from './ShadowIndicatorsCard';
import { SafetyAssessmentCard, SafetyAssessment } from './SafetyAssessmentCard';
import { KarmicAnalysisCard } from './KarmicAnalysisCard';
import { RelationshipPotentialCard } from './RelationshipPotentialCard';
import { PurposeAlignmentCard } from './PurposeAlignmentCard';
import { RelationshipTimelineCard } from './RelationshipTimelineCard';
import { RelationshipTimeline } from './synastry/RelationshipTimeline';
import { FiveEssentialQuestions } from './FiveEssentialQuestions';
import { FamilyRelationshipSelector } from './FamilyRelationshipSelector';
import { format } from 'date-fns';

interface SynastryViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

const RELATIONSHIP_FOCUS_OPTIONS: { value: RelationshipFocus; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'all', label: 'All Types', icon: <Sparkles size={14} />, description: 'View all relationship dynamics' },
  { value: 'romantic', label: 'Romantic', icon: <Heart size={14} />, description: 'Love, passion & partnership' },
  { value: 'friendship', label: 'Friendship', icon: <Users size={14} />, description: 'Companionship & loyalty' },
  { value: 'business', label: 'Business', icon: <Briefcase size={14} />, description: 'Professional collaboration' },
  { value: 'creative', label: 'Creative', icon: <Palette size={14} />, description: 'Artistic partnerships' },
  { value: 'family', label: 'Family', icon: <Home size={14} />, description: 'Family dynamics & bonds' },
];

const RelationshipTypeCard = ({ type }: { type: RelationshipTypeScore }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="text-left">
                  <h4 className="font-medium text-sm">{type.label}</h4>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{type.score}%</div>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            <Progress value={type.score} className="mt-2 h-2" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {type.indicators.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border space-y-1">
              {type.indicators.map((ind, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {ind}</p>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Enhanced House Overlay Card with focus-specific interpretation
const FocusAwareHouseOverlayCard = ({ 
  overlay, 
  focus 
}: { 
  overlay: HouseOverlay & { focusRelevance?: 'high' | 'medium' | 'low'; focusInterpretation?: string };
  focus: RelationshipFocus;
}) => {
  const impactColors = {
    activating: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    challenging: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    nurturing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    transformative: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  };

  const relevanceColors = {
    high: 'border-l-4 border-l-primary',
    medium: 'border-l-4 border-l-muted-foreground/50',
    low: ''
  };
  
  return (
    <div className={`p-3 rounded-lg border border-border bg-card ${relevanceColors[overlay.focusRelevance || 'medium']}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">
          {overlay.planetOwner}'s {overlay.planet} → {overlay.houseOwner}'s {overlay.house}th House
        </span>
        <div className="flex items-center gap-2">
          {overlay.focusRelevance === 'high' && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">Key</Badge>
          )}
          <Badge className={impactColors[overlay.impact]} variant="secondary">
            {overlay.impact}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{overlay.lifeArea}</p>
      <p className="text-sm">{overlay.focusInterpretation || overlay.interpretation}</p>
    </div>
  );
};

// Enhanced Karmic Card with focus-specific interpretation
const FocusAwareKarmicCard = ({
  indicator,
  focus
}: {
  indicator: KarmicIndicator & { focusRelevance?: 'high' | 'medium' | 'low'; focusInterpretation?: string };
  focus: RelationshipFocus;
}) => {
  const relevanceBorder = indicator.focusRelevance === 'high' ? 'border-l-4 border-l-purple-500' : '';

  return (
    <div className={`p-3 rounded-lg border border-border bg-card ${relevanceBorder}`}>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">{indicator.aspectType}</Badge>
        <span className="text-sm font-medium">{indicator.name}</span>
        <span className="text-xs text-muted-foreground">({indicator.orb}° orb)</span>
        {indicator.focusRelevance === 'high' && (
          <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0">Key for {focus}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{indicator.focusInterpretation || indicator.interpretation}</p>
      <p className="text-xs text-primary mt-2">💡 Lesson: {indicator.lessonToLearn}</p>
    </div>
  );
};

// Focus Analysis Display Component
const FocusAnalysisCard = ({ analysis }: { analysis: FocusAnalysis }) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="p-4 rounded-xl border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{analysis.title}</h4>
        <div className="text-2xl font-bold text-primary">{analysis.overallStrength}%</div>
      </div>
      <Progress value={analysis.overallStrength} className="h-2" />
      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="text-sm font-medium text-primary flex items-center gap-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide' : 'Show'} detailed indicators
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-3">
          {analysis.indicators.map((ind, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/30 border">
              <div className="flex items-center gap-2 mb-1">
                {ind.strength === 'strong' ? <CheckCircle2 size={14} className="text-green-500" /> :
                 ind.strength === 'moderate' ? <Circle size={14} className="text-amber-500" /> :
                 ind.strength === 'weak' ? <Circle size={14} className="text-muted-foreground" /> :
                 <XCircle size={14} className="text-muted-foreground/50" />}
                <span className="font-medium text-sm">{ind.name}</span>
                {ind.aspect && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {ind.aspect.type} ({ind.aspect.orb}°)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{ind.interpretation}</p>
            </div>
          ))}
          
          {analysis.recommendations.length > 0 && (
            <div className="pt-3 border-t">
              <h5 className="text-sm font-medium mb-2">Recommendations</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                {analysis.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Group Dynamics Display Component
const GroupDynamicsDisplay = ({ report, focus }: { report: GroupDynamicsReport; focus: RelationshipFocus }) => {
  const [showPairs, setShowPairs] = useState(false);

  return (
    <div className="space-y-6">
      {/* Group Overview */}
      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/30 border">
        <div className="text-4xl font-bold text-primary mb-2">
          {report.memberCount} People
        </div>
        <p className="text-lg font-medium">{report.groupEnergy}</p>
      </div>

      {/* Element Balance */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(report.elementBalance).map(([element, count]) => (
          <div key={element} className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="text-2xl mb-1">
              {element === 'Fire' ? '🔥' : element === 'Earth' ? '🌍' : element === 'Air' ? '💨' : '💧'}
            </div>
            <div className="font-medium text-sm">{element}</div>
            <div className="text-xs text-muted-foreground">{count} member{count !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {report.members.map((member, i) => (
          <div key={i} className="p-3 rounded-lg border bg-card">
            <div className="font-medium text-sm mb-1">{member.chart.name}</div>
            <Badge variant="outline" className="mb-2">{member.roleInGroup}</Badge>
            <p className="text-xs text-muted-foreground">{member.primaryEnergy}</p>
          </div>
        ))}
      </div>

      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-sm mb-2">✨ Group Strengths</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {report.groupStrengths.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-sm mb-2">⚡ Growth Areas</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {report.groupChallenges.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Focus Insights */}
      {report.focusInsights.length > 0 && (
        <div className="p-4 rounded-lg bg-primary/5 border">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            {RELATIONSHIP_FOCUS_OPTIONS.find(o => o.value === focus)?.icon}
            {focus.charAt(0).toUpperCase() + focus.slice(1)} Insights
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {report.focusInsights.map((insight, i) => (
              <li key={i}>• {insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pair Dynamics */}
      <Collapsible open={showPairs} onOpenChange={setShowPairs}>
        <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2">
          {showPairs ? 'Hide' : 'Show'} pair-by-pair dynamics
          {showPairs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {report.pairDynamics.sort((a, b) => b.connectionStrength - a.connectionStrength).map((pair, i) => (
              <div key={i} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{pair.person1} ↔ {pair.person2}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={pair.dynamicType === 'Very Harmonious' ? 'default' : 'secondary'}>
                      {pair.dynamicType}
                    </Badge>
                    <span className="text-sm font-bold text-primary">{pair.connectionStrength}%</span>
                  </div>
                </div>
                {pair.keyAspects.length > 0 && (
                  <p className="text-xs text-muted-foreground">{pair.keyAspects.join(' • ')}</p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-sm mb-2">💡 Recommendations</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {report.recommendations.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Pallas & Vesta Analysis */}
      {(report.pallasAnalysis || report.vestaAnalysis) && (
        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-sm mb-2">🔮 Asteroid Insights</h4>
          {report.pallasAnalysis && (
            <p className="text-sm text-muted-foreground mb-2">⚴ {report.pallasAnalysis}</p>
          )}
          {report.vestaAnalysis && (
            <p className="text-sm text-muted-foreground">🜨 {report.vestaAnalysis}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Composite/Davison Chart Display Component
const RelationshipChartDisplay = ({ 
  chart1, 
  chart2, 
  method 
}: { 
  chart1: NatalChart; 
  chart2: NatalChart; 
  method: 'composite' | 'davison';
}) => {
  const [showPlanets, setShowPlanets] = useState(false);
  
  const chartData = useMemo(() => {
    if (method === 'composite') {
      return calculateCompositeChart(chart1, chart2);
    } else {
      return calculateDavisonChart(chart1, chart2);
    }
  }, [chart1, chart2, method]);
  
  const { interpretation, planets } = chartData;
  
  return (
    <div className="space-y-6">
      {/* Chart Wheel Visualization */}
      <div className="flex justify-center">
        <RelationshipChartWheel 
          planets={planets} 
          chartName={method === 'composite' ? 'Composite Chart' : 'Davison Chart'} 
          size={350} 
        />
      </div>
      
      {/* Davison Date Info */}
      {method === 'davison' && 'averagedDate' in chartData && chartData.averagedDate instanceof Date && (
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <p className="text-sm">
            <strong>Relationship "Birth Date":</strong> {format(chartData.averagedDate, 'MMMM d, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Davison calculates actual planetary positions for this date - different from Composite's midpoint method.
          </p>
        </div>
      )}
      
      {/* Method Explanation */}
      <div className="p-3 rounded-lg bg-muted/50 text-center text-sm">
        {method === 'composite' 
          ? '📐 Composite uses mathematical midpoints between each planet pair'
          : '📅 Davison projects planets to the midpoint date using actual planetary motion'}
      </div>
      
      {/* Key Planet Signs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="outline" className="text-sm px-3 py-1">
          ☉ Sun in {interpretation.sunSign}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          ☽ Moon in {interpretation.moonSign}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          ♀ Venus in {interpretation.venusSign}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          ♂ Mars in {interpretation.marsSign}
        </Badge>
      </div>
      
      {/* Overall Theme */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-800 text-center">
        <p className="text-lg font-medium">{interpretation.overallTheme}</p>
      </div>
      
      {/* Interpretations Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <span className="text-xl">☉</span> Relationship Style
          </h4>
          <p className="text-sm text-muted-foreground">{interpretation.relationshipStyle}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <span className="text-xl">☽</span> Emotional Core
          </h4>
          <p className="text-sm text-muted-foreground">{interpretation.emotionalCore}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <span className="text-xl">♀</span> Love Language
          </h4>
          <p className="text-sm text-muted-foreground">{interpretation.loveLanguage}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <span className="text-xl">♂</span> Drive & Action
          </h4>
          <p className="text-sm text-muted-foreground">{interpretation.passionStyle}</p>
        </div>
      </div>
      
      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-sm mb-2">✨ Strengths</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {interpretation.strengths.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-sm mb-2">⚡ Growth Areas</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {interpretation.challenges.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Planet Positions */}
      <Collapsible open={showPlanets} onOpenChange={setShowPlanets}>
        <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2">
          {showPlanets ? 'Hide' : 'Show'} all planet positions
          {showPlanets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {Object.entries(planets).map(([planet, pos]) => (
              <div key={planet} className="flex items-center justify-between p-2 rounded bg-secondary/50">
                <span className="text-sm font-medium">{getPlanetSymbol(planet)} {planet}</span>
                <span className="text-sm text-muted-foreground">{pos.degree}° {pos.sign}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const SynastryView = ({ userNatalChart, savedCharts }: SynastryViewProps) => {
  // Build allCharts: user first, then alphabetically sorted saved charts
  const allCharts = useMemo(() => {
    const sortedSaved = [...savedCharts]
      .filter(c => c.id !== userNatalChart?.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    charts.push(...sortedSaved);
    return charts;
  }, [userNatalChart, savedCharts]);
  
  // Multi-person selection
  const [selectedChartIds, setSelectedChartIds] = useState<string[]>(() => {
    const initial = allCharts.slice(0, 2).map(c => c.id);
    return initial;
  });
  const [activeTab, setActiveTab] = useState<string>('synastry');
  const [relationshipFocus, setRelationshipFocus] = useState<RelationshipFocus>('all');
  
  // Get selected charts
  const selectedCharts = useMemo(() => {
    return selectedChartIds.map(id => allCharts.find(c => c.id === id)).filter(Boolean) as NatalChart[];
  }, [selectedChartIds, allCharts]);

  // For pair analysis (first two selected)
  const chart1 = selectedCharts[0] || null;
  const chart2 = selectedCharts[1] || null;
  
  // Is this a group analysis (3+ people)?
  const isGroupAnalysis = selectedCharts.length >= 3;
  
  const report = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return generateAdvancedSynastryReport(chart1, chart2);
  }, [chart1, chart2]);

  // Group dynamics report
  const groupReport = useMemo(() => {
    if (!isGroupAnalysis) return null;
    return analyzeGroupDynamics(selectedCharts, relationshipFocus);
  }, [selectedCharts, isGroupAnalysis, relationshipFocus]);
  
  // Filter house overlays for focus
  const focusedHouseOverlays = useMemo(() => {
    if (!report) return [];
    return filterHouseOverlaysForFocus(report.houseOverlays, relationshipFocus);
  }, [report, relationshipFocus]);

  // Filter karmic indicators for focus
  const focusedKarmicIndicators = useMemo(() => {
    if (!report) return [];
    return filterKarmicIndicatorsForFocus(report.karmicIndicators, relationshipFocus);
  }, [report, relationshipFocus]);

  // Focused soul contract theme
  const focusedSoulContract = useMemo(() => {
    if (!report || !chart1 || !chart2) return '';
    return generateFocusedSoulContractTheme(report.soulContractTheme, relationshipFocus, chart1.name, chart2.name);
  }, [report, relationshipFocus, chart1, chart2]);
  
  // Filter relationship types based on focus
  const filteredRelationshipTypes = useMemo(() => {
    if (!report) return [];
    if (relationshipFocus === 'all') return report.bestRelationshipTypes;
    
    const focusMap: Record<RelationshipFocus, string[]> = {
      all: [],
      romantic: ['romantic'],
      friendship: ['friendship'],
      business: ['business'],
      creative: ['creative'],
      family: ['karmic', 'teacherStudent'],
    };
    
    return report.bestRelationshipTypes.filter(t => 
      focusMap[relationshipFocus].some(f => t.type.toLowerCase().includes(f))
    );
  }, [report, relationshipFocus]);
  
  // Get detailed focus analysis
  const focusAnalysis = useMemo(() => {
    if (!chart1 || !chart2 || relationshipFocus === 'all') return null;
    return analyzeRelationshipFocus(chart1, chart2, relationshipFocus);
  }, [chart1, chart2, relationshipFocus]);

  // Get shadow dynamics analysis - pass chart names for personalized output
  const shadowAnalysis = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return analyzeShadowDynamics(chart1, chart2, chart1.name, chart2.name);
  }, [chart1, chart2]);

  // Family relationship context state
  const [familyContext, setFamilyContext] = useState<FamilyRelationshipContext | null>(null);
  
  // Handler for family context changes
  const handleFamilyContextChange = useCallback((context: FamilyRelationshipContext | null) => {
    setFamilyContext(context);
  }, []);

  // Get karmic analysis using the new professional system - NOW FOCUS-AWARE + FAMILY-AWARE
  const karmicAnalysis = useMemo(() => {
    if (!chart1 || !chart2) return null;
    // Map the relationshipFocus to karmic analysis focus type
    const focusMap: Record<string, 'romance' | 'friendship' | 'business' | 'family' | 'creative'> = {
      'all': 'romance',
      'romantic': 'romance',
      'friends': 'friendship',
      'friendship': 'friendship',
      'business': 'business',
      'family': 'family',
      'creative': 'creative'
    };
    const karmicFocus = focusMap[relationshipFocus] || 'romance';
    // Pass family context when focus is family
    return calculateKarmicAnalysis(
      chart1, 
      chart2, 
      karmicFocus, 
      karmicFocus === 'family' ? familyContext || undefined : undefined
    );
  }, [chart1, chart2, relationshipFocus, familyContext]);

  // Calculate TRUE overall score as weighted average of all 5 focus types
  // MUST be before safetyAssessment since it depends on this
  const trueOverallScore = useMemo(() => {
    if (!chart1 || !chart2) return null;
    
    const focusTypes: Array<'romantic' | 'friendship' | 'business' | 'creative' | 'family'> = 
      ['romantic', 'friendship', 'business', 'creative', 'family'];
    
    const scores = focusTypes.map(focus => {
      const analysis = analyzeRelationshipFocus(chart1, chart2, focus);
      return analysis.overallStrength;
    });
    
    // Calculate weighted average (all equal weight)
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    return {
      overall: average,
      breakdown: focusTypes.map((focus, i) => ({ focus, score: scores[i] }))
    };
  }, [chart1, chart2]);

  // Compute safety assessment from karmic analysis
  // Factor in compatibility - high compatibility connections need higher threshold for professional support warning
  const safetyAssessment = useMemo((): SafetyAssessment | null => {
    if (!karmicAnalysis) return null;
    
    let riskScore = 0;
    const dangerIndicators: SafetyAssessment['dangerIndicators'] = [];
    
    karmicAnalysis.dangerFlags.forEach(flag => {
      let severity: 'critical' | 'high' | 'moderate' | 'low' = 'moderate';
      if (flag.includes('Pluto') && (flag.includes('Venus') || flag.includes('Moon'))) {
        severity = 'critical';
        riskScore += 25;
      } else if (flag.includes('Saturn') && flag.includes('Moon')) {
        severity = 'high';
        riskScore += 20;
      } else if (flag.includes('8th house')) {
        severity = 'high';
        riskScore += 15;
      } else {
        riskScore += 10;
      }
      dangerIndicators.push({
        type: flag.includes('Pluto') ? 'Power Dynamics' : flag.includes('Saturn') ? 'Restriction' : 'Intensity',
        severity,
        description: flag,
        mitigation: 'Maintain strong boundaries and self-awareness.'
      });
    });

    // Get compatibility score if available
    const compatScore = trueOverallScore?.overall || 0;
    
    // Adjust thresholds based on compatibility
    // High compatibility (60%+) means strong positive indicators exist alongside challenges
    // This is common in intense, transformative relationships - not inherently dangerous
    const adjustedRiskThreshold = compatScore >= 60 ? 75 : compatScore >= 45 ? 60 : 50;
    
    const safetyLevel: SafetyAssessment['safetyLevel'] = 
      riskScore >= 60 ? 'high_risk' : 
      riskScore >= 40 ? 'moderate_risk' : 
      riskScore >= 20 ? 'low_risk' : 'safe';

    const greenFlags: string[] = [];
    if (karmicAnalysis.karmicType === 'soul_family' || karmicAnalysis.karmicType === 'new_contract') {
      greenFlags.push('Healthy soul connection without heavy karmic baggage');
    }
    if (karmicAnalysis.healingOpportunities.length >= 3) {
      greenFlags.push('Strong healing potential in this connection');
    }
    const northNodeCount = karmicAnalysis.indicators.filter(i => i.theme === 'soul_growth').length;
    if (northNodeCount >= 2) {
      greenFlags.push('Multiple North Node contacts - supports mutual evolution');
    }
    // Add green flag for high compatibility with intensity
    if (compatScore >= 60 && riskScore >= 30) {
      greenFlags.push('High compatibility suggests transformative potential, not just challenge');
    }

    // Only recommend professional support for genuinely concerning patterns
    // Not just "intense" connections with high compatibility
    const professionalSupportRecommended = riskScore >= adjustedRiskThreshold;

    return {
      safetyLevel,
      riskScore: Math.min(100, riskScore),
      dangerIndicators,
      greenFlags,
      proceedWithCaution: riskScore >= 30 && !professionalSupportRecommended,
      professionalSupportRecommended
    };
  }, [karmicAnalysis, trueOverallScore]);

  // Get composite interpretation for 5 Essential Questions
  const compositeInterpretation = useMemo(() => {
    if (!chart1 || !chart2) return null;
    const compositeData = calculateCompositeChart(chart1, chart2);
    return compositeData.interpretation;
  }, [chart1, chart2]);

  // Calculate relationship potential (short-term vs long-term)
  const relationshipPotential = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return calculateRelationshipPotential(chart1, chart2, karmicAnalysis || undefined, compositeInterpretation || undefined);
  }, [chart1, chart2, karmicAnalysis, compositeInterpretation]);

  // Calculate purpose alignment
  const purposeAlignment = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return calculatePurposeAlignment(chart1, chart2, compositeInterpretation || undefined);
  }, [chart1, chart2, compositeInterpretation]);

  // Handle adding/removing/changing people
  const addPerson = (id: string) => {
    if (!selectedChartIds.includes(id)) {
      setSelectedChartIds([...selectedChartIds, id]);
    }
  };

  const removePerson = (id: string) => {
    // Allow removal as long as at least 2 people remain
    if (selectedChartIds.length > 2) {
      setSelectedChartIds(selectedChartIds.filter(cid => cid !== id));
    }
  };

  const changePerson = (oldId: string, newId: string) => {
    if (oldId === newId) return;
    setSelectedChartIds(selectedChartIds.map(id => id === oldId ? newId : id));
  };
  
  if (allCharts.length < 2) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-serif mb-2">Relationship Analysis</h2>
        <p className="text-muted-foreground mb-6">
          Add at least two charts in the Charts tab to compare relationship compatibility.
        </p>
      </div>
    );
  }
  
  // Get charts not currently selected (for swap dropdowns)
  const availableForSwap = (currentId: string) => 
    allCharts.filter(c => c.id === currentId || !selectedChartIds.includes(c.id));
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Chart Selection */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif">Relationship Analysis</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare charts using Synastry, Composite, or Davison methods. Select 2 people for pair analysis, or 3+ for group dynamics.
        </p>
        
        {/* Selected People Display - Fully Editable */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-lg bg-secondary/30 border">
          <span className="text-sm text-muted-foreground mr-2">Analyzing:</span>
          
          {selectedCharts.map((chart, i) => (
            <div key={chart.id} className="flex items-center gap-1">
              {/* Person Selector - Always changeable */}
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={availableForSwap(chart.id).filter(c => c.id !== userNatalChart?.id)}
                selectedChartId={chart.id === userNatalChart?.id ? 'user' : chart.id}
                onSelect={(id) => {
                  const resolvedId = id === 'user' ? (userNatalChart?.id || '') : id;
                  changePerson(chart.id, resolvedId);
                }}
                className="min-w-[140px]"
              />
              
              {/* Remove button - show when 3+ people selected */}
              {selectedChartIds.length > 2 && (
                <button 
                  onClick={() => removePerson(chart.id)} 
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Remove from analysis"
                >
                  <X size={14} />
                </button>
              )}
              
              {/* Separator between people */}
              {i < selectedCharts.length - 1 && (
                <span className="text-muted-foreground mx-1">+</span>
              )}
            </div>
          ))}
          
          {/* Add Person Button */}
          {allCharts.filter(c => !selectedChartIds.includes(c.id)).length > 0 && (
            <ChartSelector
              userNatalChart={null}
              savedCharts={allCharts.filter(c => !selectedChartIds.includes(c.id))}
              selectedChartId=""
              onSelect={(id) => {
                const resolvedId = id === 'user' ? (userNatalChart?.id || '') : id;
                addPerson(resolvedId);
              }}
              className="w-[140px] ml-2"
            />
          )}
        </div>

        {/* Mode Indicator */}
        {isGroupAnalysis && (
          <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80">
            <Users size={12} className="mr-1" />
            Group Dynamics Mode ({selectedCharts.length} people)
          </Badge>
        )}
      </div>
      
      {selectedCharts.length >= 2 && (
        <>
          {/* Relationship Focus Selector */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm text-muted-foreground">Analyze for:</label>
            <div className="flex flex-wrap justify-center gap-2">
              {RELATIONSHIP_FOCUS_OPTIONS.map(option => (
                <TooltipProvider key={option.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={relationshipFocus === option.value ? 'default' : 'outline'}
                        onClick={() => setRelationshipFocus(option.value)}
                        className="gap-1.5"
                      >
                        {option.icon}
                        {option.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {/* Family Relationship Selector - Shows when Family focus is selected */}
            {relationshipFocus === 'family' && chart1 && chart2 && (
              <div className="w-full max-w-lg mt-4">
                <FamilyRelationshipSelector
                  userName={chart1.name}
                  otherPersonName={chart2.name}
                  onContextChange={handleFamilyContextChange}
                />
              </div>
            )}
          </div>

          {/* OVERALL SCORE BANNER - Shows first for all pair analyses */}
          {!isGroupAnalysis && trueOverallScore && chart1 && chart2 && (
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/30 border">
              <div className="text-5xl font-bold text-primary mb-2">
                {trueOverallScore.overall}%
              </div>
              <p className="text-lg font-medium">Overall Compatibility</p>
              <p className="text-sm text-muted-foreground mt-2">
                {chart1.name} & {chart2.name}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {trueOverallScore.breakdown.map(({ focus, score }) => (
                  <div key={focus} className="text-center">
                    <div className="text-sm font-semibold text-primary">{score}%</div>
                    <div className="text-xs text-muted-foreground capitalize">{focus}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* GROUP ANALYSIS VIEW */}
          {isGroupAnalysis && groupReport && (
            <GroupDynamicsDisplay report={groupReport} focus={relationshipFocus} />
          )}

          {/* PAIR ANALYSIS VIEW */}
          {!isGroupAnalysis && (
            <>
              {/* Detailed Focus Analysis with Scoring Breakdown */}
              {focusAnalysis && chart1 && chart2 && (
                <div className="space-y-4">
                  <FocusAnalysisCard analysis={focusAnalysis} />
                  <ScoringBreakdownView 
                    analysis={focusAnalysis} 
                    chart1Name={chart1.name} 
                    chart2Name={chart2.name} 
                  />
                </div>
              )}
              
              {/* Chart Type Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                  <TabsTrigger value="synastry" className="gap-1.5">
                    <Users size={14} />
                    Synastry
                  </TabsTrigger>
                  <TabsTrigger value="composite" className="gap-1.5">
                    <Heart size={14} />
                    Composite
                  </TabsTrigger>
                  <TabsTrigger value="davison" className="gap-1.5">
                    <Sparkles size={14} />
                    Davison
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  {activeTab === 'synastry' && 'How you interact with each other'}
                  {activeTab === 'composite' && 'The midpoint "third entity" of your relationship'}
                  {activeTab === 'davison' && 'Your relationship\'s birth chart in time & space'}
                </div>
                
                {/* Synastry Tab */}
                <TabsContent value="synastry" className="space-y-8 mt-6">
                  {report && chart1 && chart2 && (
                    <>
                      {/* Export Button */}
                      <div className="flex justify-end">
                        <SynastryPDFExport
                          chart1={chart1}
                          chart2={chart2}
                          report={report}
                          focusAnalysis={focusAnalysis}
                          houseOverlays={focusedHouseOverlays}
                          karmicIndicators={focusedKarmicIndicators}
                          focus={relationshipFocus}
                        />
                      </div>
                      
                      {/* THE 5 ESSENTIAL QUESTIONS - Primary educational structure */}
                      <FiveEssentialQuestions
                        chart1={chart1}
                        chart2={chart2}
                        report={report}
                        karmicAnalysis={karmicAnalysis}
                        compositeInterpretation={compositeInterpretation}
                        focus={relationshipFocus === 'romantic' ? 'romance' : relationshipFocus === 'all' ? 'romance' : relationshipFocus}
                      />
                      
                      {/* Additional Technical Views - Expandable */}
                      <Collapsible>
                        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
                          <span className="font-medium flex items-center gap-2">
                            <BookOpen size={18} />
                            View Additional Analysis Tools
                          </span>
                          <ChevronDown size={18} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 space-y-8">
                          {/* Safety Assessment */}
                          {safetyAssessment && (
                            <SafetyAssessmentCard 
                              assessment={safetyAssessment} 
                              chart1Name={chart1.name} 
                              chart2Name={chart2.name} 
                            />
                          )}
                          
                          {/* Karmic Analysis Card */}
                          {karmicAnalysis && (
                            <KarmicAnalysisCard 
                              analysis={karmicAnalysis} 
                              chart1Name={chart1.name} 
                              chart2Name={chart2.name} 
                            />
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                      
                      <section className="flex flex-col items-center">
                        <SynastryWheelSimple chart1={chart1} chart2={chart2} size={420} />
                      </section>
                      
                      {/* Why Drawn Together - narrative context */}
                      <div className="p-4 rounded-lg bg-secondary/30 border">
                        <p className="text-sm text-center text-muted-foreground max-w-xl mx-auto">
                          {report.whyDrawnTogether}
                        </p>
                      </div>
                      
                      {/* Compatibility Summary Radar Chart - Only in "All Types" mode */}
                      {relationshipFocus === 'all' && (
                        <section>
                          <CompatibilityRadarChart chart1={chart1} chart2={chart2} />
                        </section>
                      )}
                      
                      {/* Relationship Types - use balanced scores from trueOverallScore */}
                      {relationshipFocus === 'all' && trueOverallScore && (
                        <section>
                          <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                            <Sparkles className="text-primary" size={20} />
                            Connection Types Overview
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {trueOverallScore.breakdown.map(({ focus, score }) => {
                              const focusConfig = {
                                romantic: { label: 'Romantic Partnership', icon: '💕', description: 'Intimate, romantic, and potentially long-term love connection' },
                                friendship: { label: 'Friendship', icon: '🤝', description: 'Platonic connection, companionship, mutual enjoyment' },
                                business: { label: 'Business Partnership', icon: '💼', description: 'Professional collaboration, shared ventures, career synergy' },
                                creative: { label: 'Creative Partnership', icon: '🎨', description: 'Artistic collaboration, inspiration, imaginative projects' },
                                family: { label: 'Family Bond', icon: '🏠', description: 'Family dynamics, nurturing connections, domestic harmony' }
                              };
                              const config = focusConfig[focus as keyof typeof focusConfig];
                              return (
                                <RelationshipTypeCard 
                                  key={focus} 
                                  type={{
                                    type: focus as any,
                                    score,
                                    label: config.label,
                                    description: config.description,
                                    icon: config.icon,
                                    indicators: []
                                  }} 
                                />
                              );
                            })}
                          </div>
                        </section>
                      )}
                      
                      {/* Focus-Aware House Overlays */}
                      {focusedHouseOverlays.length > 0 && (
                        <section>
                          <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                            <Home className="text-blue-500" size={20} />
                            {relationshipFocus !== 'all' ? `${relationshipFocus.charAt(0).toUpperCase() + relationshipFocus.slice(1)}-Relevant ` : ''}House Overlays
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle size={14} className="text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Shows which life areas (houses) each person's planets activate in the other's chart, filtered for {relationshipFocus} context.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {focusedHouseOverlays.map((overlay, i) => (
                              <FocusAwareHouseOverlayCard key={i} overlay={overlay} focus={relationshipFocus} />
                            ))}
                          </div>
                        </section>
                      )}
                      
                      {/* Focus-Aware Karmic Indicators */}
                      {focusedKarmicIndicators.length > 0 && (
                        <section>
                          <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                            <Moon className="text-purple-500" size={20} />
                            {relationshipFocus !== 'all' ? `${relationshipFocus.charAt(0).toUpperCase() + relationshipFocus.slice(1)}-Relevant ` : ''}Soul Connections
                          </h3>
                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mb-4">
                            <p className="text-sm">{focusedSoulContract}</p>
                            {report.pastLifeConnection && (
                              <p className="text-xs text-muted-foreground mt-2 italic">{report.pastLifeConnection}</p>
                            )}
                          </div>
                          <ScrollArea className="h-64">
                            <div className="space-y-3">
                              {focusedKarmicIndicators.map((k, i) => (
                                <FocusAwareKarmicCard key={i} indicator={k} focus={relationshipFocus} />
                              ))}
                            </div>
                          </ScrollArea>
                        </section>
                      )}
                      
                      {/* Attraction Dynamics - only for romantic/all focus */}
                      {(relationshipFocus === 'all' || relationshipFocus === 'romantic') && report.attractionDynamics.length > 0 && (
                        <section>
                          <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                            <Flame className="text-red-500" size={20} />
                            Attraction Dynamics
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {report.attractionDynamics.map((d, i) => (
                              <div key={i} className="p-4 rounded-lg border border-border bg-card">
                                <h4 className="font-medium mb-1">{d.name}</h4>
                                <Badge className="mb-2">{d.chemistry}</Badge>
                                <p className="text-sm text-muted-foreground">{d.description}</p>
                                <p className="text-xs text-primary mt-2">{d.energy}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                      
                      {/* Conflict Triggers */}
                      {report.conflictTriggers.length > 0 && (
                        <section>
                          <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={20} />
                            Potential Friction Points
                          </h3>
                          <div className="space-y-3">
                            {report.conflictTriggers.map((c, i) => (
                              <div key={i} className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-sm">{c.name}</span>
                                  <Badge variant={c.intensity === 'intense' ? 'destructive' : 'secondary'}>
                                    {c.intensity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{c.triggerDescription}</p>
                                <p className="text-xs"><strong>Pattern:</strong> {c.emotionalPattern}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Resolution: {c.resolution}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                      
                      {/* NEW: Relationship Potential Card */}
                      {relationshipPotential && (
                        <section>
                          <RelationshipPotentialCard
                            potential={relationshipPotential}
                            chart1Name={chart1.name}
                            chart2Name={chart2.name}
                            focus={relationshipFocus}
                          />
                        </section>
                      )}
                      
                      {/* NEW: Purpose Alignment Card */}
                      {purposeAlignment && (
                        <section>
                          <PurposeAlignmentCard
                            alignment={purposeAlignment}
                            chart1Name={chart1.name}
                            chart2Name={chart2.name}
                          />
                        </section>
                      )}
                      
                      {/* NEW: 12-Month Relationship Timeline */}
                      <section>
                        <RelationshipTimelineCard
                          chart1={chart1}
                          chart2={chart2}
                          months={12}
                        />
                      </section>
                      
                      {/* Historical Relationship Timeline - Date-based Analysis */}
                      <section>
                        <RelationshipTimeline
                          person1Name={chart1.name}
                          person2Name={chart2.name}
                          person1Chart={chart1}
                          person2Chart={chart2}
                        />
                      </section>
                      
                      {/* Transit Timeline */}
                      <section className="p-4 rounded-xl border bg-card">
                        <SynastryTransitTimeline chart1={chart1} chart2={chart2} focus={relationshipFocus} />
                      </section>
                      
                      {/* Relationship Timing Calculator */}
                      <section>
                        <RelationshipTimingCalculator chart1={chart1} chart2={chart2} />
                      </section>
                      
                      {/* Purpose & Growth */}
                      <section className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg border border-border bg-card">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Info size={16} className="text-primary" />
                            Relationship Purpose
                          </h4>
                          <p className="text-sm text-muted-foreground">{report.relationshipPurpose}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                          <h4 className="font-medium mb-3">Growth Opportunities</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {report.growthOpportunities.slice(0, 4).map((g, i) => (
                              <li key={i}>• {g}</li>
                            ))}
                          </ul>
                        </div>
                      </section>

                      {/* Shadow Indicators - placed LAST, after all positive content */}
                      {shadowAnalysis && shadowAnalysis.indicators.length > 0 && (
                        <ShadowIndicatorsCard 
                          analysis={shadowAnalysis} 
                          chart1Name={chart1.name} 
                          chart2Name={chart2.name} 
                        />
                      )}
                    </>
                  )}
                </TabsContent>
                
                {/* Composite Tab */}
                <TabsContent value="composite" className="mt-6">
                  {chart1 && chart2 && (
                    <RelationshipChartDisplay chart1={chart1} chart2={chart2} method="composite" />
                  )}
                </TabsContent>
                
                {/* Davison Tab */}
                <TabsContent value="davison" className="mt-6">
                  {chart1 && chart2 && (
                    <RelationshipChartDisplay chart1={chart1} chart2={chart2} method="davison" />
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
};
