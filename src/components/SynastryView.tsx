import { useState, useMemo } from 'react';
import { Heart, Users, Briefcase, GraduationCap, Sparkles, Palette, AlertTriangle, Flame, Moon, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { generateAdvancedSynastryReport, RelationshipTypeScore } from '@/lib/synastryAdvanced';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SynastryViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

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

export const SynastryView = ({ userNatalChart, savedCharts }: SynastryViewProps) => {
  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    charts.push(...savedCharts.filter(c => c.id !== userNatalChart?.id));
    return charts;
  }, [userNatalChart, savedCharts]);
  
  const [chart1Id, setChart1Id] = useState<string>(allCharts[0]?.id || '');
  const [chart2Id, setChart2Id] = useState<string>(allCharts[1]?.id || '');
  
  const chart1 = allCharts.find(c => c.id === chart1Id) || null;
  const chart2 = allCharts.find(c => c.id === chart2Id) || null;
  
  const report = useMemo(() => {
    if (!chart1 || !chart2) return null;
    return generateAdvancedSynastryReport(chart1, chart2);
  }, [chart1, chart2]);
  
  if (allCharts.length < 2) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-serif mb-2">Synastry Analysis</h2>
        <p className="text-muted-foreground mb-6">
          Add at least two charts in the Charts tab to compare relationship compatibility.
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Chart Selection */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif">Synastry Analysis</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional relationship analysis including karmic connections, attraction dynamics, conflict patterns, and relationship type compatibility.
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
          
          <Heart className="text-pink-500" />
          
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
      
      {report && (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="text-center p-8 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800">
            <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
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
              Best Connection Types
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {report.bestRelationshipTypes.map((type, i) => (
                <RelationshipTypeCard key={type.type} type={type} />
              ))}
            </div>
          </section>
          
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
          
          {/* Attraction Dynamics */}
          {report.attractionDynamics.length > 0 && (
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
                Potential Conflict Triggers
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
                    <p className="text-xs"><strong>Emotional pattern:</strong> {c.emotionalPattern}</p>
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
        </div>
      )}
    </div>
  );
};
