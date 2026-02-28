import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Zap, Info, BookOpen } from 'lucide-react';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import {
  computeChartMidpoints,
  MidpointResult,
  PLANET_GLYPHS,
  MIDPOINT_EDUCATION,
  MidpointInterpretation,
} from '@/lib/midpointData';

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

function MidpointDetailModal({
  midpoint,
  open,
  onClose,
}: {
  midpoint: MidpointResult | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!midpoint?.interpretation) return null;
  const interp = midpoint.interpretation;
  const glyphA = PLANET_GLYPHS[midpoint.planetA] || midpoint.planetA;
  const glyphB = PLANET_GLYPHS[midpoint.planetB] || midpoint.planetB;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-2xl">{interp.emoji}</span>
            <div>
              <span>{interp.title}</span>
              <span className="text-sm text-muted-foreground font-normal ml-2">
                {glyphA}/{glyphB}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-5">
            {/* Position info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {midpoint.midpointDegInSign}°{midpoint.midpointMinutes.toString().padStart(2, '0')}′ {midpoint.midpointSign}
              </Badge>
              {midpoint.activatingPlanets.map((ap, i) => (
                <Badge key={i} className="text-xs bg-primary/10 text-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  {PLANET_GLYPHS[ap.name] || ap.name} {ap.aspect}
                </Badge>
              ))}
            </div>

            {/* Basic Idea */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-primary mb-2">💡 THE BASIC IDEA</p>
              <p className="text-sm leading-relaxed">{interp.basicIdea}</p>
            </div>

            {/* Personal Life */}
            <div>
              <p className="text-xs font-medium mb-1">🧑 In Your Personal Life</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{interp.personalLife}</p>
            </div>

            {/* Relationships */}
            <div>
              <p className="text-xs font-medium mb-1">💞 In Your Relationships</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{interp.relationships}</p>
            </div>

            {/* Body & Mind */}
            <div>
              <p className="text-xs font-medium mb-1">🫀 Body & Mind</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{interp.bodyMind}</p>
            </div>

            {/* Shadow */}
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ THE SHADOW</p>
              <p className="text-xs leading-relaxed">{interp.shadow}</p>
            </div>

            {/* Activating planets explanation */}
            {midpoint.activatingPlanets.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">⚡ ACTIVATED BY</p>
                {midpoint.activatingPlanets.map((ap, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    <span className="font-medium">{PLANET_GLYPHS[ap.name] || ap.name} {ap.name}</span> in {ap.aspect} — 
                    this planet energizes and brings the {glyphA}/{glyphB} combination to life in your chart.
                  </p>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function EducationSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1 text-left">What Are Midpoints?</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3 px-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-[10px] font-medium text-primary mb-2">🎨 WHAT IS A MIDPOINT?</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{MIDPOINT_EDUCATION.whatIs}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-[10px] font-medium text-primary mb-2">✨ WHY DO THEY MATTER?</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{MIDPOINT_EDUCATION.whyMatters}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-[10px] font-medium text-primary mb-2">📖 HOW TO READ THEM</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{MIDPOINT_EDUCATION.howToRead}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-[10px] font-medium text-primary mb-2">📜 HISTORY</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{MIDPOINT_EDUCATION.history}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MidpointExplorer({ userNatalChart, savedCharts }: Props) {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [selectedMidpoint, setSelectedMidpoint] = useState<MidpointResult | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    savedCharts.forEach(c => {
      if (!userNatalChart || c.name !== userNatalChart.name) charts.push(c);
    });
    return charts;
  }, [userNatalChart, savedCharts]);

  const selectedChart = useMemo(() => {
    if (!selectedChartId) return allCharts[0] || null;
    if (selectedChartId === 'user' && userNatalChart) return userNatalChart;
    return allCharts.find(c => c.id === selectedChartId || c.name === selectedChartId) || allCharts[0] || null;
  }, [selectedChartId, allCharts, userNatalChart]);

  const midpoints = useMemo(() => {
    if (!selectedChart || !selectedChart.planets || Object.keys(selectedChart.planets).length < 3) return [];
    return computeChartMidpoints(selectedChart);
  }, [selectedChart]);

  // Split into activated and unactivated
  const activated = midpoints.filter(m => m.activatingPlanets.length > 0 && m.interpretation);
  const withInterpretation = midpoints.filter(m => m.activatingPlanets.length === 0 && m.interpretation);
  const displayed = showAll ? [...activated, ...withInterpretation] : activated;

  if (allCharts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <EducationSection />
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Info className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Add a birth chart to see your personalized midpoints.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Chart selector */}
      <ChartSelector
        userNatalChart={userNatalChart}
        savedCharts={savedCharts}
        selectedChartId={
          selectedChart && userNatalChart && selectedChart.id === userNatalChart.id
            ? 'user'
            : selectedChart?.id || ''
        }
        onSelect={setSelectedChartId}
      />

      <EducationSection />

      {/* Summary badges */}
      {midpoints.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="text-xs">
            {midpoints.length} total midpoints
          </Badge>
          <Badge className="text-xs bg-primary/10 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            {activated.length} activated
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            for {selectedChart?.name}
          </span>
        </div>
      )}

      {/* Activated midpoints (most important) */}
      {activated.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Your Activated Midpoints
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            These midpoints have a third planet sitting right at the blending point — making them the most active and influential in your chart.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {activated.map((mp, i) => (
              <MidpointCard key={i} midpoint={mp} onClick={() => setSelectedMidpoint(mp)} />
            ))}
          </div>
        </div>
      )}

      {activated.length === 0 && midpoints.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tightly activated midpoints found with a 1.5° orb. This is normal — try viewing all midpoints below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Toggle to show all */}
      {withInterpretation.length > 0 && (
        <div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAll ? 'Hide' : 'Show'} all {withInterpretation.length} interpreted midpoints
          </button>

          {showAll && (
            <div className="grid gap-3 sm:grid-cols-2 mt-3">
              {withInterpretation.map((mp, i) => (
                <MidpointCard key={i} midpoint={mp} onClick={() => setSelectedMidpoint(mp)} />
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground italic px-1">
        Midpoint interpretations based on Michael Munkasey's "Midpoints: Unleashing the Power of the Planets." 
        Activated midpoints use a 1.5° orb with conjunction, opposition, square, semi-square, and sesqui-square aspects.
      </p>

      <MidpointDetailModal
        midpoint={selectedMidpoint}
        open={!!selectedMidpoint}
        onClose={() => setSelectedMidpoint(null)}
      />
    </div>
  );
}

function MidpointCard({ midpoint, onClick }: { midpoint: MidpointResult; onClick: () => void }) {
  const interp = midpoint.interpretation;
  if (!interp) return null;

  const glyphA = PLANET_GLYPHS[midpoint.planetA] || midpoint.planetA;
  const glyphB = PLANET_GLYPHS[midpoint.planetB] || midpoint.planetB;
  const isActivated = midpoint.activatingPlanets.length > 0;

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all group ${
        isActivated ? 'ring-1 ring-primary/20 border-primary/30' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{glyphA}/{glyphB}</span>
            <span className="text-xs text-muted-foreground">{interp.title}</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {midpoint.midpointDegInSign}° {midpoint.midpointSign}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {interp.basicIdea.split('.')[0]}.
        </p>
        {isActivated && (
          <div className="flex flex-wrap gap-1">
            {midpoint.activatingPlanets.map((ap, i) => (
              <Badge key={i} className="text-[10px] bg-primary/10 text-primary">
                <Zap className="h-2.5 w-2.5 mr-0.5" />
                {PLANET_GLYPHS[ap.name] || ap.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
