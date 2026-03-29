import { useState, useMemo, useCallback } from 'react';
import { Layers, Info, MapPin, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  generateStructuralAnalysis,
  getPlanetaryHousePositions,
  getLifeStageCycles,
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

  const planetaryWeather = useMemo(() => {
    if (!selectedChart) return [];
    return getPlanetaryHousePositions(selectedChart, new Date());
  }, [selectedChart]);

  const lifeStageCycles = useMemo(() => {
    if (!selectedChart) return [];
    return getLifeStageCycles(selectedChart);
  }, [selectedChart]);

  const [showNatalRef, setShowNatalRef] = useState(false);

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
          {/* Life Stage Banner */}
          {lifeStageCycles.length > 0 && (
            <div className="space-y-2">
              {lifeStageCycles.map((cycle) => (
                <Card
                  key={cycle.name}
                  className={cycle.isActive
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-blue-500/30 bg-blue-500/5"}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cycle.isActive ? 'text-amber-500' : 'text-blue-400'}`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{cycle.name}</span>
                          <Badge variant="outline" className={`text-xs ${cycle.isActive ? 'border-amber-500/50 text-amber-600 dark:text-amber-400' : 'border-blue-500/50 text-blue-600 dark:text-blue-400'}`}>
                            {cycle.isActive ? 'Active Now' : `~${cycle.yearsUntil} year${cycle.yearsUntil === 1 ? '' : 's'} away`}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Ages {cycle.ageRange[0]}–{cycle.ageRange[1]} • {cycle.planet}</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{cycle.description}</p>
                        <p className="text-sm italic text-primary/80 mt-1">"{cycle.invitation}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Planetary Weather Now */}
          {planetaryWeather.length > 0 && (
            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Where the Planets Are in Your Chart Right Now
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  The houses these planets occupy show which life areas are under long-term pressure or expansion today.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {planetaryWeather.map((p) => (
                    <div key={p.planet} className="flex items-center gap-3 p-2 rounded-md bg-secondary/40 border border-border/40">
                      <div className="min-w-[70px]">
                        <span className="font-medium text-sm">{p.planet}</span>
                        <div className="text-xs text-muted-foreground">{p.transitingDegreeInSign}° {p.transitingSign}</div>
                      </div>
                      <div className="text-xs text-right flex-1">
                        <span className="text-foreground/80">House {p.house}</span>
                        <div className="text-muted-foreground capitalize">{p.houseTheme}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

              {/* Natal Chart Quick Reference */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <button
                    onClick={() => setShowNatalRef(!showNatalRef)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <CardTitle className="font-serif text-base">Natal Chart Reference</CardTitle>
                    {showNatalRef
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Your natal planet positions — useful context when reading transit interpretations.
                  </p>
                </CardHeader>
                {showNatalRef && (
                  <CardContent>
                    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                      {(Object.entries(selectedChart.planets) as [string, { sign: string; degree: number; minutes: number; isRetrograde?: boolean } | undefined][])
                        .filter(([, pos]) => pos && pos.sign)
                        .map(([planet, pos]) => (
                          <div key={planet} className="flex items-center gap-2 text-sm py-1 border-b border-border/30">
                            <span className="font-medium min-w-[90px] text-foreground/80">{planet}</span>
                            <span className="text-muted-foreground">
                              {pos!.degree}°{pos!.minutes > 0 ? `${pos!.minutes.toString().padStart(2,'0')}'` : ''} {pos!.sign}
                              {pos!.isRetrograde ? ' ℞' : ''}
                            </span>
                          </div>
                        ))}
                    </div>
                    {selectedChart.houseCusps && (
                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">House Cusps</p>
                        <div className="grid gap-1 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
                          {Object.entries(selectedChart.houseCusps).map(([key, cusp]) => {
                            const houseNum = key.replace('house', '');
                            return (
                              <div key={key} className="text-xs text-center p-1.5 rounded bg-secondary/40">
                                <div className="text-muted-foreground">H{houseNum}</div>
                                <div className="font-medium">{(cusp as { sign: string; degree: number }).degree}° {(cusp as { sign: string; degree: number }).sign.slice(0,3)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

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
