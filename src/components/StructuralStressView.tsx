import { useState, useMemo, useCallback } from 'react';
import { Layers, Info } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  generateStructuralAnalysis, 
  exploreDateWithContext,
  DateExplorerResult
} from '@/lib/structuralStressEngine';
import { SAFETY_COPY } from '@/lib/structuralStressCopy';
import { SaturnLensCards } from './structural/SaturnLensCards';
import { DateExplorer } from './structural/DateExplorer';

import { FocusedTransitCard } from './structural/FocusedTransitCard';
import { PhaseTimeline } from './structural/PhaseTimeline';

interface StructuralStressViewProps {
  userChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const StructuralStressView = ({ userChart, savedCharts }: StructuralStressViewProps) => {
  const [selectedChart, setSelectedChart] = useState<NatalChart | null>(userChart);
  const [showSaturnCards, setShowSaturnCards] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [savingEvent, setSavingEvent] = useState(false);
  const [hasDateResult, setHasDateResult] = useState(false);

  const { events: lifeEvents, addEvent, getEventsForChart } = useLifeEvents();

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userChart) charts.push(userChart);
    charts.push(...savedCharts);
    return charts;
  }, [userChart, savedCharts]);

  const analysis = useMemo(() => {
    if (!selectedChart) return null;
    return generateStructuralAnalysis(selectedChart, 5, 5);
  }, [selectedChart]);

  // Get life events for selected chart
  const chartLifeEvents = useMemo(() => {
    if (!selectedChart) return [];
    return getEventsForChart(selectedChart.id);
  }, [selectedChart, getEventsForChart]);

  // Separate focused windows by status
  const { currentTransits, upcomingTransits, pastTransits } = useMemo(() => {
    if (!analysis) return { currentTransits: [], upcomingTransits: [], pastTransits: [] };
    
    const current = analysis.focusedWindows.filter(w => w.isCurrent);
    const upcoming = analysis.focusedWindows.filter(w => w.isUpcoming).slice(0, 5);
    const past = analysis.focusedWindows.filter(w => w.isPast).slice(-10).reverse();
    
    return { currentTransits: current, upcomingTransits: upcoming, pastTransits: past };
  }, [analysis]);

  const handleSaveEvent = useCallback(async (event: { chartId: string; eventDate: Date; eventType: string; eventLabel?: string; notes?: string }) => {
    setSavingEvent(true);
    const result = await addEvent(event);
    setSavingEvent(false);
    return result;
  }, [addEvent]);

  const handleMilestoneClick = useCallback((date: Date) => {
    // no-op, milestones removed (use Life Cycles hub instead)
  }, []);

  const handleTransitClick = useCallback((date: Date) => {
    if (!selectedChart) return;
    setActiveTab('explore');
  }, [selectedChart]);

  if (allCharts.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-serif text-xl mb-2">No Charts Available</h3>
            <p className="text-muted-foreground">
              Add a natal chart in the Charts tab to explore structural stress and release patterns.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* How to Use Section */}
      <Card className="bg-secondary/30 border-none">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong>How to use this:</strong> Enter a specific date when something happened in your life 
                (relationship started, job ended, move, crisis) to see what transits were active and understand 
                the pressure dynamics at that moment.
              </p>
              <p className="text-sm text-muted-foreground">
                Saturn = Containment (commitment pressure) • Pluto = Stress (power dynamics, transformation pressure) • 
                Uranus = Release (awakening, break conditions) • Mars = Trigger (action, events)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium">Analyze chart:</label>
        <select
          value={selectedChart?.id || ''}
          onChange={(e) => {
            const chart = allCharts.find(c => c.id === e.target.value);
            setSelectedChart(chart || null);
          }}
          className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none min-w-[200px]"
        >
          {allCharts.map(chart => (
            <option key={chart.id} value={chart.id}>{chart.name}</option>
          ))}
        </select>
      </div>

      {selectedChart && analysis && (
        <>
          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="explore">Explore Date</TabsTrigger>
              <TabsTrigger value="timeline">Phase Timeline</TabsTrigger>
              <TabsTrigger value="transits">Transit List</TabsTrigger>
              <TabsTrigger value="saturn">Saturn Lens</TabsTrigger>
            </TabsList>

            {/* Date Explorer Tab */}
            <TabsContent value="explore" className="space-y-6">
              <DateExplorer 
                chart={selectedChart} 
                onSaveEvent={handleSaveEvent}
                savingEvent={savingEvent}
                onDateExplored={setHasDateResult}
              />
              
            </TabsContent>

            {/* Phase Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <PhaseTimeline
                chart={selectedChart}
                transitWindows={analysis.focusedWindows}
                lifeEvents={chartLifeEvents}
                onEventClick={(date) => {
                  setActiveTab('explore');
                }}
              />
            </TabsContent>

            {/* Transit Timeline Tab */}
            <TabsContent value="transits" className="space-y-6">
              {/* Current Transits */}
              {currentTransits.length > 0 && (
                <Card className="border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Active Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentTransits.map(transit => (
                      <FocusedTransitCard 
                        key={transit.id} 
                        transit={transit}
                        onClick={handleTransitClick}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Transits */}
              {upcomingTransits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Upcoming</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingTransits.map(transit => (
                      <FocusedTransitCard 
                        key={transit.id} 
                        transit={transit}
                        onClick={handleTransitClick}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recent Past Transits */}
              {pastTransits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Recent Past</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pastTransits.map(transit => (
                      <FocusedTransitCard 
                        key={transit.id} 
                        transit={transit}
                        onClick={handleTransitClick}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {currentTransits.length === 0 && upcomingTransits.length === 0 && pastTransits.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No major structural transits detected in the scan window.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Saturn Lens Tab */}
            <TabsContent value="saturn" className="space-y-6">
              <div className="space-y-3">
                <button
                  onClick={() => setShowSaturnCards(!showSaturnCards)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <span className={`transform transition-transform ${showSaturnCards ? 'rotate-90' : ''}`}>▶</span>
                  Saturn Lens Cards - Your Saturn placement shapes how you experience all structural transits
                </button>
                {showSaturnCards && (
                  <SaturnLensCards cards={analysis.saturnCards} />
                )}
              </div>

              {/* Safety Notice */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="py-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {SAFETY_COPY}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
