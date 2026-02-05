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
import { ChartSelector } from './ChartSelector';
 import { toast } from 'sonner';
 
 interface Props {
   savedCharts: NatalChart[];
   userNatalChart: NatalChart | null;
 }
 
export type VoiceStyle = 
  | 'grounded_therapist' 
  | 'spiritual_guide' 
  | 'motherly_supportive' 
  | 'direct_practical' 
  | 'mystical_poetic'
  | 'analytical_technical';

const VOICE_OPTIONS: { value: VoiceStyle; label: string; description: string }[] = [
  { value: 'grounded_therapist', label: 'Grounded Therapist', description: 'Warm, steady, emotionally intelligent' },
  { value: 'spiritual_guide', label: 'Spiritual Guide', description: 'Soul-centered, ancestral wisdom, divine timing' },
  { value: 'motherly_supportive', label: 'Nurturing & Practical', description: 'Gentle encouragement, actionable advice' },
  { value: 'direct_practical', label: 'Direct & Clear', description: 'Straightforward, no fluff, action-oriented' },
  { value: 'mystical_poetic', label: 'Mystical & Poetic', description: 'Evocative imagery, archetypal depth' },
  { value: 'analytical_technical', label: 'Technical Astrologer', description: 'Traditional dignities, precise language' },
];

export function GroundedNarrativeView({ savedCharts, userNatalChart }: Props) {
  const [selectedChartId, setSelectedChartId] = useState<string>('');
  const [lengthPreset, setLengthPreset] = useState<'short_250' | 'full_800'>('full_800');
  const [includeShadow, setIncludeShadow] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('grounded_therapist');
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

      // Confirm if narrative already exists
      if (narrativeText) {
        const confirmed = window.confirm(
          'This will generate a new narrative, replacing the current one. AI responses vary each time. Continue?'
        );
        if (!confirmed) return;
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
            includeShadow,
            voiceStyle
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
          voice_preset: voiceStyle,
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
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={selectedChartId}
                onSelect={setSelectedChartId}
                label="Chart"
              />
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
 
              {/* Voice Style */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Voice Style</Label>
                <Select value={voiceStyle} onValueChange={(v) => setVoiceStyle(v as VoiceStyle)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {VOICE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      <p className="text-xs text-muted-foreground mb-3 italic">💡 Click any sentence to see the astrological triggers behind it</p>
                      <div className="space-y-1">
                        {sourceMap && sourceMap.length > 0 ? (
                          sourceMap.map((entry, i) => (
                            <span
                              key={i}
                              onClick={() => setSelectedSentenceIndex(selectedSentenceIndex === i ? null : i)}
                              className={`cursor-pointer transition-all inline ${
                                selectedSentenceIndex === i 
                                  ? 'bg-primary/20 rounded px-1' 
                                  : 'hover:bg-muted/50 hover:rounded hover:px-1'
                              }`}
                            >
                              {entry.sentence}{' '}
                              {selectedSentenceIndex === i && (
                                <span className="block my-2 p-3 bg-muted/70 rounded-lg border-l-4 border-primary text-sm">
                                  {entry.triggers.length > 0 ? (
                                    <span className="space-y-1.5 block">
                                      <span className="text-xs text-muted-foreground font-medium block mb-2">Astrological Triggers:</span>
                                      {entry.triggers.map((t, j) => (
                                        <span key={j} className="block text-xs">
                                          <Badge variant="secondary" className="mr-2">{t.type}</Badge>
                                          <span className="text-foreground">{t.object}:</span>{' '}
                                          <span className="text-muted-foreground">{t.details}</span>
                                        </span>
                                      ))}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">This is transitional/stylistic prose without a specific chart trigger.</span>
                                  )}
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          // Fallback if no source map
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {narrativeText.split('\n\n').map((para, i) => (
                              <p key={i} className="leading-relaxed mb-4">{para}</p>
                            ))}
                          </div>
                        )}
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
                          <h3 className="font-medium mb-2">Operating Mode Scores</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            These scores measure how your chart's placements distribute energy across key life dimensions. 
                            They reveal your natural tendencies—not limitations, but starting points for self-awareness.
                          </p>
                          <div className="space-y-4">
                            {Object.entries(signals.operatingMode).map(([key, value]) => {
                              const numValue = value as number;
                              const explanations: Record<string, { 
                                what: string; 
                                sources: string;
                                highMeaning: string; 
                                lowMeaning: string;
                                whyMatters: string;
                              }> = {
                                visibility: {
                                  what: 'How naturally your presence registers to others without effort',
                                  sources: 'Calculated from: planets in angular houses (1st, 4th, 7th, 10th), Sun/Moon prominence, Leo/Aries placements',
                                  highMeaning: 'You naturally command attention. People notice when you enter a room. Your actions have public impact.',
                                  lowMeaning: 'You operate behind the scenes. Your influence is subtle, working through private channels rather than spotlight.',
                                  whyMatters: 'Understanding this helps you choose environments where you thrive—leadership roles vs. advisory positions.'
                                },
                                functionality: {
                                  what: 'Your orientation toward practical output versus inner reflection',
                                  sources: 'Calculated from: earth/air sign emphasis, 2nd/6th/10th house placements, Saturn/Mercury strength',
                                  highMeaning: 'You need tangible results. Abstract ideas frustrate you unless they produce real-world outcomes.',
                                  lowMeaning: 'You value process over product. Meaning and experience matter more than measurable achievements.',
                                  whyMatters: 'This shapes career satisfaction—do you need to see concrete results, or find fulfillment in the journey?'
                                },
                                expressive: {
                                  what: 'Your tendency to externalize emotions, thoughts, and identity',
                                  sources: 'Calculated from: fire/air signs, planets in 1st/5th/9th houses, Sun/Mars aspects',
                                  highMeaning: 'You process by sharing. Talking, creating, and performing help you understand yourself.',
                                  lowMeaning: 'You process internally first. You may seem reserved until you\'ve worked things through privately.',
                                  whyMatters: 'This affects relationships—expressive types need outlets; contained types need space before sharing.'
                                },
                                contained: {
                                  what: 'Your tendency to internalize and process privately before acting',
                                  sources: 'Calculated from: water/earth signs, planets in 4th/8th/12th houses, Moon/Pluto aspects',
                                  highMeaning: 'You have a rich inner world. Solitude recharges you. You observe before participating.',
                                  lowMeaning: 'You prefer immediate engagement. Too much alone time feels stagnant.',
                                  whyMatters: 'This determines your recharge needs—introverted processing vs. extroverted engagement.'
                                },
                                relational: {
                                  what: 'Energy naturally directed toward partnerships, collaboration, and others',
                                  sources: 'Calculated from: 7th house planets, Venus/Libra emphasis, aspects to Descendant',
                                  highMeaning: 'You come alive through connection. Partnerships amplify your capabilities.',
                                  lowMeaning: 'You operate independently. Collaboration can feel like compromise of your vision.',
                                  whyMatters: 'This affects work style and relationships—some thrive in teams, others need autonomy.'
                                },
                                selfDirected: {
                                  what: 'Energy naturally directed toward individual pursuits and self-development',
                                  sources: 'Calculated from: 1st house planets, Mars/Aries emphasis, aspects to Ascendant',
                                  highMeaning: 'You have strong self-initiative. Personal goals drive you more than group approval.',
                                  lowMeaning: 'You are motivated by others\' needs. Service and responsiveness feel more natural than self-promotion.',
                                  whyMatters: 'This shapes motivation—do you set your own goals, or respond to what others need?'
                                },
                              };
                              const info = explanations[key];
                              const scoreLabel = numValue >= 70 ? 'High' : numValue >= 40 ? 'Moderate' : 'Low';
                              const interpretation = numValue >= 60 ? info?.highMeaning : info?.lowMeaning;
                              
                              return (
                                <div key={key} className="p-3 bg-muted/30 rounded-lg space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-muted-foreground font-medium">{numValue}/100 <span className="text-[10px]">({scoreLabel})</span></span>
                                  </div>
                                  <Progress value={numValue} className="h-2" />
                                  
                                  {info && (
                                    <div className="space-y-2 pt-1">
                                      <p className="text-xs text-foreground"><span className="font-medium">What this measures:</span> {info.what}</p>
                                      <p className="text-[10px] text-muted-foreground italic">{info.sources}</p>
                                      <div className="p-2 bg-primary/5 rounded border-l-2 border-primary">
                                        <p className="text-xs text-foreground"><span className="font-medium">Your score means:</span> {interpretation}</p>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground">💡 {info.whyMatters}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
                          <p className="text-xs text-muted-foreground mb-4">
                            What's missing from your chart can be as revealing as what's present. 
                            Absences point to areas where energy may feel unfamiliar, borrowed from others, 
                            or require conscious development.
                          </p>
                          <div className="space-y-3 text-sm">
                            {signals.absenceSignals.missingElements.length > 0 && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="font-medium mb-1">
                                  Missing Element{signals.absenceSignals.missingElements.length > 1 ? 's' : ''}: {signals.absenceSignals.missingElements.join(', ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {signals.absenceSignals.missingElements.includes('Fire') && 
                                    'No Fire: You may feel you lack spontaneity or self-promotion instincts. Initiative can feel forced rather than natural. '}
                                  {signals.absenceSignals.missingElements.includes('Earth') && 
                                    'No Earth: Practical matters, routines, and material security may feel like foreign territory you have to consciously learn. '}
                                  {signals.absenceSignals.missingElements.includes('Air') && 
                                    'No Air: Abstract thinking or social networking might not come naturally; you process through feeling or action rather than ideas. '}
                                  {signals.absenceSignals.missingElements.includes('Water') && 
                                    'No Water: Emotional attunement and intuitive knowing may feel elusive; you might intellectualize feelings instead of flowing with them. '}
                                </p>
                              </div>
                            )}
                            {signals.absenceSignals.missingModalities.length > 0 && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="font-medium mb-1">
                                  Missing Modality: {signals.absenceSignals.missingModalities.join(', ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {signals.absenceSignals.missingModalities.includes('Cardinal') && 
                                    'No Cardinal: Starting new things or taking initiative might feel unnatural. You may wait for situations to develop before acting. '}
                                  {signals.absenceSignals.missingModalities.includes('Fixed') && 
                                    'No Fixed: Sustained effort, persistence, and seeing things through to completion can require extra conscious focus. '}
                                  {signals.absenceSignals.missingModalities.includes('Mutable') && 
                                    'No Mutable: Adapting to change or shifting perspective might feel challenging; you prefer stability over flexibility. '}
                                </p>
                              </div>
                            )}
                            {signals.absenceSignals.fewAngularPlanets && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="font-medium mb-1">
                                  Few Angular Planets ({signals.absenceSignals.angularPlanetCount})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Angular houses (1st, 4th, 7th, 10th) are the most visible positions. 
                                  With few planets here, your impact may be more subtle—working behind the scenes 
                                  or through indirect influence rather than commanding immediate attention.
                                </p>
                              </div>
                            )}
                            {signals.absenceSignals.fewOuterPersonalLinks && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="font-medium mb-1">
                                  Few Outer-Personal Planet Links
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Uranus, Neptune, and Pluto don't strongly aspect your personal planets. 
                                  Your sense of self may feel less buffeted by generational or transpersonal forces, 
                                  giving you a more grounded (but potentially less transformative) baseline.
                                </p>
                              </div>
                            )}
                            {signals.absenceSignals.missingElements.length === 0 && 
                             signals.absenceSignals.missingModalities.length === 0 && 
                             !signals.absenceSignals.fewAngularPlanets &&
                             !signals.absenceSignals.fewOuterPersonalLinks && (
                              <div className="p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                                <p className="text-muted-foreground">
                                  ✓ Your chart has good elemental and modal balance with no significant absences. 
                                  This suggests access to a full range of energetic modes.
                                </p>
                              </div>
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