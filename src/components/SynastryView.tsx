import { useState, useMemo } from 'react';
import { Heart, Users, Briefcase, GraduationCap, Sparkles, Palette, AlertTriangle, Flame, Moon, ChevronDown, ChevronUp, Info, Home, HelpCircle, Handshake, Lightbulb, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { generateAdvancedSynastryReport, RelationshipTypeScore, HouseOverlay } from '@/lib/synastryAdvanced';
import { calculateCompositeChart, calculateDavisonChart, getPlanetSymbol } from '@/lib/compositeChart';
import { analyzeRelationshipFocus, FocusAnalysis, FocusIndicator } from '@/lib/relationshipFocusAnalysis';
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
import { format } from 'date-fns';

interface SynastryViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

type RelationshipFocus = 'all' | 'romantic' | 'friendship' | 'business' | 'creative' | 'family';

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
        <CollapsibleTrigger className="w-full">
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

const HouseOverlayCard = ({ overlay }: { overlay: HouseOverlay }) => {
  const impactColors = {
    activating: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    challenging: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    nurturing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    transformative: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  };
  
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">
          {overlay.planetOwner}'s {overlay.planet} → {overlay.houseOwner}'s {overlay.house}th House
        </span>
        <Badge className={impactColors[overlay.impact]} variant="secondary">
          {overlay.impact}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{overlay.lifeArea}</p>
      <p className="text-sm">{overlay.interpretation}</p>
    </div>
  );
};

// Focus Analysis Display Component
const FocusAnalysisCard = ({ analysis }: { analysis: FocusAnalysis }) => {
  const [expanded, setExpanded] = useState(false);
  
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
  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    charts.push(...savedCharts.filter(c => c.id !== userNatalChart?.id));
    return charts;
  }, [userNatalChart, savedCharts]);
  
  const [chart1Id, setChart1Id] = useState<string>(allCharts[0]?.id || '');
  const [chart2Id, setChart2Id] = useState<string>(allCharts[1]?.id || '');
  const [activeTab, setActiveTab] = useState<string>('synastry');
  const [relationshipFocus, setRelationshipFocus] = useState<RelationshipFocus>('all');
  
  const chart1 = allCharts.find(c => c.id === chart1Id) || null;
  const chart2 = allCharts.find(c => c.id === chart2Id) || null;
  
  const report = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return generateAdvancedSynastryReport(chart1, chart2);
  }, [chart1, chart2]);
  
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
      family: ['karmic', 'teacherStudent'], // Family connections often have karmic/teaching elements
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
  
  // Get focus-specific insights
  const focusInsights = useMemo(() => {
    if (!report || relationshipFocus === 'all') return null;
    
    const insights: Record<RelationshipFocus, { title: string; aspects: string[]; tips: string[] }> = {
      all: { title: '', aspects: [], tips: [] },
      romantic: {
        title: 'Romantic Compatibility',
        aspects: ['Venus-Mars connections', 'Moon aspects for emotional bonding', '5th/7th house overlays'],
        tips: ['Focus on Venus and Mars interaspects', 'Moon compatibility for daily harmony', 'Look for 7th house planet overlays']
      },
      friendship: {
        title: 'Friendship Dynamics',
        aspects: ['Mercury connections for communication', 'Jupiter aspects for growth together', '11th house overlays'],
        tips: ['Mercury aspects show conversation flow', 'Jupiter brings expansion and fun', 'Uranus contacts add excitement']
      },
      business: {
        title: 'Business Partnership',
        aspects: ['Saturn for structure and commitment', 'Mercury for communication', '10th house overlays for public success'],
        tips: ['Saturn aspects show reliability', 'Mercury contacts ensure clear communication', '2nd/10th house overlays for financial success']
      },
      creative: {
        title: 'Creative Collaboration',
        aspects: ['Neptune for inspiration', 'Venus for aesthetic harmony', '5th house overlays'],
        tips: ['Neptune aspects bring creative vision', 'Venus shows shared aesthetics', 'Look for 5th house planet placements']
      },
      family: {
        title: 'Family Bonds',
        aspects: ['Moon-Moon for emotional understanding', 'Saturn for responsibility', '4th house overlays'],
        tips: ['Moon aspects show emotional attunement', 'Saturn brings stability and duty', 'North Node aspects suggest karmic family ties']
      }
    };
    
    return insights[relationshipFocus];
  }, [report, relationshipFocus]);
  
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
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Chart Selection */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif">Relationship Analysis</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare charts using Synastry, Composite, or Davison methods for any type of relationship.
        </p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Select value={chart1Id} onValueChange={setChart1Id}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Select Person 1" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {allCharts.map(c => (
                <SelectItem key={c.id} value={c.id} disabled={c.id === chart2Id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Handshake className="text-primary" />
          
          <Select value={chart2Id} onValueChange={setChart2Id}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Select Person 2" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {allCharts.map(c => (
                <SelectItem key={c.id} value={c.id} disabled={c.id === chart1Id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {chart1 && chart2 && (
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
          </div>
          
          {/* Detailed Focus Analysis */}
          {focusAnalysis && (
            <FocusAnalysisCard analysis={focusAnalysis} />
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
              {report && (
                <>
                  {/* Synastry Wheel Visualization */}
                  <section className="flex flex-col items-center">
                    <SynastryWheelSimple chart1={chart1} chart2={chart2} size={420} />
                  </section>
                  
                  {/* Overall Score */}
                  <div className="text-center p-8 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/30 border">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {report.overallCompatibility}%
                    </div>
                    <p className="text-lg font-medium">Overall Compatibility</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
                      {report.whyDrawnTogether}
                    </p>
                  </div>
                  
                  {/* Best Relationship Types */}
                  <section>
                    <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                      <Sparkles className="text-primary" size={20} />
                      {relationshipFocus === 'all' ? 'Best Connection Types' : `${RELATIONSHIP_FOCUS_OPTIONS.find(o => o.value === relationshipFocus)?.label} Compatibility`}
                    </h3>
                    {filteredRelationshipTypes.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {filteredRelationshipTypes.map((type) => (
                          <RelationshipTypeCard key={type.type} type={type} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No specific {relationshipFocus} indicators found. Try viewing "All Types" for complete analysis.
                      </p>
                    )}
                  </section>
                  
                  {/* House Overlays */}
                  {report.houseOverlays.length > 0 && (
                    <section>
                      <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                        <Home className="text-blue-500" size={20} />
                        House Overlays
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle size={14} className="text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Shows which life areas (houses) each person's planets activate in the other's chart.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {report.houseOverlays.map((overlay, i) => (
                          <HouseOverlayCard key={i} overlay={overlay} />
                        ))}
                      </div>
                    </section>
                  )}
                  
                  {/* Karmic Indicators */}
                  {report.karmicIndicators.length > 0 && (
                    <section>
                      <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                        <Moon className="text-purple-500" size={20} />
                        Karmic & Soul Connections
                      </h3>
                      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mb-4">
                        <p className="text-sm">{report.soulContractTheme}</p>
                        {report.pastLifeConnection && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{report.pastLifeConnection}</p>
                        )}
                      </div>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {report.karmicIndicators.map((k, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-card">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{k.aspectType}</Badge>
                                <span className="text-sm font-medium">{k.name}</span>
                                <span className="text-xs text-muted-foreground">({k.orb}° orb)</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{k.interpretation}</p>
                              <p className="text-xs text-primary mt-2">💡 Lesson: {k.lessonToLearn}</p>
                            </div>
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
                </>
              )}
            </TabsContent>
            
            {/* Composite Tab */}
            <TabsContent value="composite" className="mt-6">
              <RelationshipChartDisplay chart1={chart1} chart2={chart2} method="composite" />
            </TabsContent>
            
            {/* Davison Tab */}
            <TabsContent value="davison" className="mt-6">
              <RelationshipChartDisplay chart1={chart1} chart2={chart2} method="davison" />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
