 import { useState, useEffect } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Switch } from '@/components/ui/switch';
 import { Label } from '@/components/ui/label';
 import { Progress } from '@/components/ui/progress';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Badge } from '@/components/ui/badge';
 import { Sparkles, FileText, BarChart3, Map, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
 import { NatalChart } from '@/hooks/useNatalChart';
 import { computeAllSignals, SignalsData, SourceMapEntry } from '@/lib/narrativeAnalysisEngine';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 interface Props {
   savedCharts: NatalChart[];
   userNatalChart: NatalChart | null;
 }
 
 export function GroundedNarrativeView({ savedCharts, userNatalChart }: Props) {
   const [selectedChartId, setSelectedChartId] = useState<string>('');
   const [lengthPreset, setLengthPreset] = useState<'short_250' | 'full_800'>('full_800');
   const [includeShadow, setIncludeShadow] = useState(true);
   const [activeTab, setActiveTab] = useState<'narrative' | 'signals' | 'source-map'>('narrative');
   
   const [isGenerating, setIsGenerating] = useState(false);
   const [narrativeText, setNarrativeText] = useState<string | null>(null);
   const [signals, setSignals] = useState<SignalsData | null>(null);
   const [sourceMap, setSourceMap] = useState<SourceMapEntry[] | null>(null);
   const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
 
   // Build chart options
   const allCharts = userNatalChart ? [userNatalChart, ...savedCharts] : savedCharts;
 
   // Auto-select first chart if none selected
   useEffect(() => {
     if (!selectedChartId && allCharts.length > 0) {
       setSelectedChartId(allCharts[0].id);
     }
   }, [allCharts, selectedChartId]);
 
   const selectedChart = allCharts.find(c => c.id === selectedChartId);
 
   // Check if chart has required data
   const hasRequiredData = selectedChart && selectedChart.planets && 
     Object.keys(selectedChart.planets).length >= 3;
 
   const handleGenerate = async () => {
     if (!selectedChart || !hasRequiredData) {
       toast.error('Please select a chart with planet data');
       return;
     }
 
     setIsGenerating(true);
     setNarrativeText(null);
     setSourceMap(null);
 
     try {
       // Compute signals locally
       const computedSignals = computeAllSignals(selectedChart);
       setSignals(computedSignals);
 
       // Call edge function
       const { data, error } = await supabase.functions.invoke('generate-narrative', {
         body: {
           signals: computedSignals,
           chartName: selectedChart.name,
           planets: selectedChart.planets,
           lengthPreset,
           includeShadow
         }
       });
 
       if (error) {
         throw error;
       }
 
       if (data.error) {
         toast.error(data.error);
         return;
       }
 
       setNarrativeText(data.narrativeText);
       setSourceMap(data.sourceMap || []);
 
       // Save to database
       const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
       localStorage.setItem('deviceId', deviceId);
 
      await supabase.from('chart_narratives').insert([{
         chart_id: selectedChart.id,
         voice_preset: 'grounded_therapist',
         length_preset: lengthPreset,
         include_shadow: includeShadow,
         engine_version: 'narrative_v1.0.0',
         narrative_text: data.narrativeText,
        signals_json: JSON.parse(JSON.stringify(computedSignals)),
        source_map_json: JSON.parse(JSON.stringify(data.sourceMap || [])),
         device_id: deviceId
      }]);
 
       toast.success('Narrative generated successfully');
 
     } catch (err) {
       console.error('Generate narrative error:', err);
       toast.error('Failed to generate narrative. Please try again.');
     } finally {
       setIsGenerating(false);
     }
   };
 
   // Load previous narrative on chart change
   useEffect(() => {
     if (!selectedChartId) return;
     
     const loadPrevious = async () => {
       const deviceId = localStorage.getItem('deviceId');
       if (!deviceId) return;
 
       const { data } = await supabase
         .from('chart_narratives')
         .select('*')
         .eq('chart_id', selectedChartId)
         .eq('device_id', deviceId)
         .order('created_at', { ascending: false })
         .limit(1);
 
       if (data && data.length > 0) {
         const record = data[0];
         setNarrativeText(record.narrative_text);
         setSignals(record.signals_json as unknown as SignalsData);
         setSourceMap(record.source_map_json as unknown as SourceMapEntry[]);
       } else {
         setNarrativeText(null);
         setSignals(null);
         setSourceMap(null);
       }
     };
 
     loadPrevious();
   }, [selectedChartId]);
 
   return (
     <div className="space-y-6">
       <div className="text-center space-y-2">
         <h1 className="text-2xl font-serif">Grounded Narrative</h1>
         <p className="text-muted-foreground text-sm">
           A cohesive, therapist-style write-up of your natal chart with transparent sourcing
         </p>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Left Panel - Controls */}
         <Card className="lg:col-span-1">
           <CardHeader className="pb-3">
             <CardTitle className="text-sm font-medium">Settings</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {/* Chart Selection */}
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Chart</Label>
               <Select value={selectedChartId} onValueChange={setSelectedChartId}>
                 <SelectTrigger className="w-full">
                   <SelectValue placeholder="Select a chart" />
                 </SelectTrigger>
                 <SelectContent className="bg-background border z-50">
                   {allCharts.map(chart => (
                     <SelectItem key={chart.id} value={chart.id}>
                       {chart.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             {/* Length Toggle */}
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Length</Label>
               <Select value={lengthPreset} onValueChange={(v) => setLengthPreset(v as 'short_250' | 'full_800')}>
                 <SelectTrigger className="w-full">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-background border z-50">
                   <SelectItem value="short_250">Short (~250 words)</SelectItem>
                   <SelectItem value="full_800">Full (~800 words)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
 
             {/* Shadow Toggle */}
             <div className="flex items-center justify-between">
               <Label htmlFor="shadow-toggle" className="text-xs text-muted-foreground">
                 Include Shadow Content
               </Label>
               <Switch 
                 id="shadow-toggle"
                 checked={includeShadow} 
                 onCheckedChange={setIncludeShadow} 
               />
             </div>
 
             {/* Voice Preset (locked) */}
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Voice</Label>
               <div className="text-sm px-3 py-2 bg-muted rounded-md">
                 Grounded Therapist
               </div>
             </div>
 
             {/* Generate Button */}
             <Button 
               onClick={handleGenerate} 
               disabled={isGenerating || !hasRequiredData}
               className="w-full"
             >
               {isGenerating ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Generating...
                 </>
               ) : (
                 <>
                   <Sparkles className="mr-2 h-4 w-4" />
                   Generate
                 </>
               )}
             </Button>
 
             {!hasRequiredData && selectedChart && (
               <p className="text-xs text-destructive flex items-center gap-1">
                 <AlertCircle className="h-3 w-3" />
                 Chart needs planet data
               </p>
             )}
           </CardContent>
         </Card>
 
         {/* Right Panel - Tabs */}
         <Card className="lg:col-span-3">
           <CardContent className="pt-6">
             <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
               <TabsList className="grid w-full grid-cols-3">
                 <TabsTrigger value="narrative" className="flex items-center gap-2">
                   <FileText className="h-4 w-4" />
                   Narrative
                 </TabsTrigger>
                 <TabsTrigger value="signals" className="flex items-center gap-2">
                   <BarChart3 className="h-4 w-4" />
                   Signals
                 </TabsTrigger>
                 <TabsTrigger value="source-map" className="flex items-center gap-2">
                   <Map className="h-4 w-4" />
                   Source Map
                 </TabsTrigger>
               </TabsList>
 
               {/* Narrative Tab */}
               <TabsContent value="narrative" className="mt-4">
                 {!narrativeText && !isGenerating && (
                   <div className="text-center py-12 text-muted-foreground">
                     <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                     <p>No narrative generated yet.</p>
                     <p className="text-sm">Select a chart and click Generate to create your narrative.</p>
                   </div>
                 )}
                 {isGenerating && (
                   <div className="text-center py-12">
                     <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                     <p>Generating your grounded narrative...</p>
                   </div>
                 )}
                 {narrativeText && !isGenerating && (
                   <ScrollArea className="h-[500px] pr-4">
                     <div className="prose prose-sm dark:prose-invert max-w-none">
                       {narrativeText.split('\n\n').map((para, i) => (
                         <p key={i} className="leading-relaxed mb-4">{para}</p>
                       ))}
                     </div>
                   </ScrollArea>
                 )}
               </TabsContent>
 
               {/* Signals Tab */}
                <TabsContent value="signals" className="mt-4">
                  {!signals && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Generate a narrative to see chart signals.</p>
                    </div>
                  )}
                  {signals && (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-6">
                        {/* Operating Mode Scores */}
                        <div>
                          <h3 className="font-medium mb-3">Operating Mode Scores</h3>
                          <div className="space-y-3">
                            {Object.entries(signals.operatingMode).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="text-muted-foreground">{value as number}</span>
                                </div>
                                <Progress value={value as number} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Midheaven (MC) Analysis */}
                        {signals.midheaven && (
                          <div>
                            <h3 className="font-medium mb-3">Midheaven (MC) Analysis</h3>
                            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">MC in {signals.midheaven.sign}</span>
                                <Badge variant="outline">{signals.midheaven.degree}°</Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="text-muted-foreground">MC Ruler:</span>{' '}
                                  {signals.midheaven.ruler} in {signals.midheaven.rulerSign} (house {signals.midheaven.rulerHouse})
                                  {signals.midheaven.rulerIsAngular && <Badge className="ml-2 text-[10px]" variant="secondary">Angular</Badge>}
                                  {signals.midheaven.rulerIsRetrograde && <span className="ml-1 text-amber-600">℞</span>}
                                </p>
                                {signals.midheaven.tenthHousePlanets.length > 0 && (
                                  <p>
                                    <span className="text-muted-foreground">10th House Planets:</span>{' '}
                                    {signals.midheaven.tenthHousePlanets.join(', ')}
                                  </p>
                                )}
                                {signals.midheaven.mcAspects.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Aspects to MC:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {signals.midheaven.mcAspects.map((a, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px]">
                                          {a.planet1} {a.type} ({a.orb}°)
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Career Themes:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {signals.midheaven.careerThemes.map((theme, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px]">{theme}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Verified Natal Aspects */}
                        <div>
                          <h3 className="font-medium mb-3">Verified Natal Aspects ({signals.natalAspects?.length || 0})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {signals.natalAspects?.slice(0, 12).map((asp, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                                <span>
                                  {asp.planet1} <span className="text-muted-foreground">{asp.type}</span> {asp.planet2}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-[10px]">{asp.orb}°</Badge>
                                  {asp.isOutOfSign && <Badge variant="destructive" className="text-[9px]">OOS</Badge>}
                                </div>
                              </div>
                            ))}
                            {(!signals.natalAspects || signals.natalAspects.length === 0) && (
                              <p className="text-sm text-muted-foreground col-span-2">No natal aspects detected.</p>
                            )}
                          </div>
                          {signals.natalAspects && signals.natalAspects.length > 12 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              + {signals.natalAspects.length - 12} more aspects
                            </p>
                          )}
                        </div>

                        {/* Pressure Points */}
                        <div>
                          <h3 className="font-medium mb-3">Pressure Points (Top 8)</h3>
                          <div className="space-y-2">
                            {signals.pressurePointsRanked.map((pp, i) => (
                              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{pp.description}</span>
                                  <Badge variant="outline" className="text-xs">{pp.weight}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{pp.details}</p>
                              </div>
                            ))}
                            {signals.pressurePointsRanked.length === 0 && (
                              <p className="text-sm text-muted-foreground">No major pressure points detected.</p>
                            )}
                          </div>
                        </div>

                        {/* Absence Signals */}
                        <div>
                          <h3 className="font-medium mb-3">Absence Signals</h3>
                          <div className="space-y-2 text-sm">
                            {signals.absenceSignals.missingElements.length > 0 && (
                              <p>
                                <span className="text-muted-foreground">Missing elements:</span>{' '}
                                {signals.absenceSignals.missingElements.join(', ')}
                              </p>
                            )}
                            {signals.absenceSignals.missingModalities.length > 0 && (
                              <p>
                                <span className="text-muted-foreground">Missing modalities:</span>{' '}
                                {signals.absenceSignals.missingModalities.join(', ')}
                              </p>
                            )}
                            {signals.absenceSignals.fewAngularPlanets && (
                              <p>
                                <span className="text-muted-foreground">Angular planets:</span>{' '}
                                Only {signals.absenceSignals.angularPlanetCount} (few)
                              </p>
                            )}
                            {signals.absenceSignals.missingElements.length === 0 && 
                             signals.absenceSignals.missingModalities.length === 0 && 
                             !signals.absenceSignals.fewAngularPlanets && (
                              <p className="text-muted-foreground">No notable absences.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
 
               {/* Source Map Tab */}
               <TabsContent value="source-map" className="mt-4">
                 {!sourceMap && (
                   <div className="text-center py-12 text-muted-foreground">
                     <Map className="h-12 w-12 mx-auto mb-4 opacity-30" />
                     <p>Generate a narrative to see the source map.</p>
                   </div>
                 )}
                 {sourceMap && (
                   <ScrollArea className="h-[500px] pr-4">
                     <div className="space-y-2">
                       {sourceMap.map((entry, i) => (
                         <div 
                           key={i}
                           className={`p-3 rounded-lg cursor-pointer transition-colors ${
                             selectedSentenceIndex === i 
                               ? 'bg-primary/10 border border-primary/30' 
                               : 'bg-muted/30 hover:bg-muted/50'
                           }`}
                           onClick={() => setSelectedSentenceIndex(selectedSentenceIndex === i ? null : i)}
                         >
                           <div className="flex items-start gap-2">
                             <ChevronRight className={`h-4 w-4 mt-1 transition-transform ${selectedSentenceIndex === i ? 'rotate-90' : ''}`} />
                             <div className="flex-1">
                               <p className="text-sm">{entry.sentence}</p>
                               {selectedSentenceIndex === i && entry.triggers.length > 0 && (
                                 <div className="mt-2 pl-2 border-l-2 border-primary/30 space-y-1">
                                   {entry.triggers.map((t, j) => (
                                     <div key={j} className="text-xs">
                                       <Badge variant="secondary" className="mr-2">{t.type}</Badge>
                                       <span className="text-muted-foreground">{t.object}: {t.details}</span>
                                     </div>
                                   ))}
                                 </div>
                               )}
                               {selectedSentenceIndex === i && entry.triggers.length === 0 && (
                                 <p className="mt-2 text-xs text-muted-foreground italic">No specific triggers identified</p>
                               )}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </ScrollArea>
                 )}
               </TabsContent>
             </Tabs>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }