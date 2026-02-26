import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, BarChart3, Map, Loader2, AlertCircle, ChevronRight, Star, Layers, Diamond, Download, Printer, Hexagon, Crosshair, Palette } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { HUMAN_DESIGN_GATES } from '@/data/humanDesignGates';
import { incarnationCrosses, crossTypeDescriptions } from '@/data/incarnationCrosses';
import { computeAllSignals, SignalsData, SourceMapEntry } from '@/lib/narrativeAnalysisEngine';
import { supabase } from '@/integrations/supabase/client';

import { LifeStylesSection } from './narrative/LifeStylesSection';
import { AtAGlanceCard } from './narrative/AtAGlanceCard';
import { WhatsAheadPanel } from './narrative/WhatsAheadPanel';
import { ThemesTab } from './narrative/ThemesTab';
import { HDLifeStyles } from './narrative/HDLifeStyles';
import { useHumanDesignChart } from '@/hooks/useHumanDesignChart';

import { toast } from 'sonner';
import { useRef, useCallback } from 'react';
import { namesMatch } from '@/lib/nameMatching';
import { useUnifiedProfiles } from '@/hooks/useUnifiedProfiles';
import { FoundationsSection } from './narrative/FoundationsSection';

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
  | 'analytical_technical'
  | 'plain_human';

export type ReadingType = 'astrology' | 'human_design' | 'combined';

const VOICE_OPTIONS: { value: VoiceStyle; label: string; description: string }[] = [
  { value: 'grounded_therapist', label: 'Therapist', description: 'Warm, steady, emotionally intelligent' },
  { value: 'spiritual_guide', label: 'Spiritual Guide', description: 'Soul-centered, ancestral wisdom, divine timing' },
  { value: 'motherly_supportive', label: 'Nurturing & Practical', description: 'Gentle encouragement, actionable advice' },
  { value: 'direct_practical', label: 'Direct & Clear', description: 'Blunt, no metaphors, just facts' },
  { value: 'mystical_poetic', label: 'Mystical & Poetic', description: 'Evocative imagery, archetypal depth' },
  { value: 'analytical_technical', label: 'Technical Astrologer', description: 'Traditional dignities, precise language' },
  { value: 'plain_human', label: 'No Astrology', description: 'Pure feelings & behavior, zero jargon' },
];

const READING_TYPE_OPTIONS: { value: ReadingType; label: string; description: string; icon: typeof Star }[] = [
  { value: 'astrology', label: 'Astrology', description: 'Natal chart reading', icon: Star },
  { value: 'human_design', label: 'Human Design', description: 'HD chart reading', icon: Diamond },
  { value: 'combined', label: 'Combined', description: 'Astrology + HD unified', icon: Layers },
];

export function GroundedNarrativeView({ savedCharts, userNatalChart }: Props) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [readingType, setReadingType] = useState<ReadingType>('astrology');
  const [lengthPreset, setLengthPreset] = useState<'short_250' | 'full_800'>('full_800');
  const [includeShadow, setIncludeShadow] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('grounded_therapist');
  const [activeTab, setActiveTab] = useState<string>('narrative');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [narrativeText, setNarrativeText] = useState<string | null>(null);
  const [signals, setSignals] = useState<SignalsData | null>(null);
  const [sourceMap, setSourceMap] = useState<SourceMapEntry[] | null>(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

  const narrativeRef = useRef<HTMLDivElement>(null);

  // HD charts
  const { charts: hdCharts } = useHumanDesignChart();

  // Unified profiles: merge natal + HD by name/birthday into one person each
  const unifiedProfiles = useUnifiedProfiles(userNatalChart, savedCharts, hdCharts, userNatalChart?.name);

  // Auto-select first profile if none selected
  useEffect(() => {
    if (!selectedProfileId && unifiedProfiles.length > 0) {
      setSelectedProfileId(unifiedProfiles[0].id);
    }
  }, [unifiedProfiles, selectedProfileId]);

  // Get the selected unified profile
  const selectedProfile = unifiedProfiles.find(p => p.id === selectedProfileId);

  // Resolve the correct chart based on reading type
  const selectedChart = selectedProfile?.natalChart || null;
  const selectedHdChart = selectedProfile?.hdChart || null;
  const autoMatchedHdChart = selectedProfile?.hdChart || null;

  // Use auto-matched chart for Combined, manual selection for HD-only
  const effectiveHdChart = selectedHdChart;

  const buildPrintHTML = useCallback((forDownload = false) => {
    if (!narrativeText) return '';
    const chartName = readingType === 'combined'
      ? `${selectedChart?.name} — Combined Reading`
      : readingType === 'human_design'
      ? effectiveHdChart?.name
      : selectedChart?.name;
    const readingLabel = readingType === 'combined' ? 'Combined Astrology + Human Design' : readingType === 'human_design' ? 'Human Design' : 'Astrology';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const paragraphs = narrativeText.split('\n\n').map(p => 
      `<p>${p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`
    ).join('');

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${chartName} - ${readingLabel} Reading</title>
<style>
  @page { margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.9;
    color: #111;
    background: #fff;
    max-width: 700px;
    margin: 0 auto;
    padding: 48px 32px;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #333;
    padding-bottom: 20px;
    margin-bottom: 32px;
  }
  .header h1 { font-size: 26px; color: #111; margin-bottom: 6px; letter-spacing: 0.5px; }
  .header .type { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
  .header .date { font-size: 11px; color: #999; margin-top: 8px; }
  p { margin-bottom: 18px; font-size: 15px; color: #222; text-align: justify; }
  strong { font-weight: 700; color: #111; }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #ddd;
    text-align: center;
    font-size: 11px;
    color: #999;
  }
  @media print {
    body { padding: 0; }
    .footer { page-break-inside: avoid; }
  }
</style></head><body>
  <div class="header">
    <h1>${chartName}</h1>
    <div class="type">${readingLabel} Reading</div>
    <div class="date">${today}</div>
  </div>
  ${paragraphs}
  <div class="footer">Generated by Cosmic Calendar • ${today}</div>
</body></html>`;
  }, [narrativeText, readingType, selectedChart, effectiveHdChart]);

  const handleDownload = useCallback(() => {
    const html = buildPrintHTML(true);
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const chartName = readingType === 'combined'
      ? `${selectedChart?.name}_combined`
      : readingType === 'human_design'
      ? effectiveHdChart?.name
      : selectedChart?.name;
    link.download = `${chartName || 'narrative'}_reading.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [buildPrintHTML, readingType, selectedChart, effectiveHdChart]);

  const handlePrint = useCallback(() => {
    const html = buildPrintHTML();
    if (!html) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  }, [buildPrintHTML]);

  // Check if chart has required data
  const hasRequiredAstroData = selectedChart && selectedChart.planets && 
    Object.keys(selectedChart.planets).length >= 3;
  const hasRequiredHdData = effectiveHdChart && effectiveHdChart.type;
  
  const canGenerate = (() => {
    if (readingType === 'astrology') return hasRequiredAstroData;
    if (readingType === 'human_design') return hasRequiredHdData;
    if (readingType === 'combined') return hasRequiredAstroData && hasRequiredHdData;
    return false;
  })();

  // Combined mode: no matching HD chart warning
  const combinedMismatch = readingType === 'combined' && selectedChart && !autoMatchedHdChart;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('Please select the required chart(s)');
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
      if (readingType === 'astrology') {
        // Original astrology flow
        const computedSignals = computeAllSignals(selectedChart!);
        setSignals(computedSignals);

        const { data, error } = await supabase.functions.invoke('generate-narrative', {
          body: {
            signals: computedSignals,
            chartName: selectedChart!.name,
            planets: selectedChart!.planets,
            lengthPreset,
            includeShadow,
            voiceStyle,
          },
        });

        if (error) throw error;
        if (data?.error) {
          toast.error(data.error);
          return;
        }

        setNarrativeText(data?.narrativeText || null);
        setSourceMap(data?.sourceMap || []);

        // Save to database
        const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);

        const { error: insertError } = await supabase.from('chart_narratives').insert([{
          chart_id: selectedChart!.id,
          voice_preset: voiceStyle,
          length_preset: lengthPreset,
          include_shadow: includeShadow,
          engine_version: 'narrative_v1.0.0',
          narrative_text: data?.narrativeText || '',
          signals_json: JSON.parse(JSON.stringify(computedSignals)),
          source_map_json: JSON.parse(JSON.stringify(data?.sourceMap || [])),
          device_id: deviceId,
        }]);

        if (insertError) {
          console.warn('Failed to persist narrative:', insertError);
        } else {
          toast.success('Narrative generated successfully');
        }

      } else {
        // Human Design or Combined flow
        setSignals(null); // No astro signals for HD-only

        const body: Record<string, unknown> = {
          readingType: readingType,
          hdChart: effectiveHdChart,
          chartName: readingType === 'combined' 
            ? `${selectedChart?.name} — Combined` 
            : effectiveHdChart?.name,
          lengthPreset,
          includeShadow,
          voiceStyle,
        };

        // Add astro data for combined reading
        if (readingType === 'combined' && selectedChart) {
          const computedSignals = computeAllSignals(selectedChart);
          setSignals(computedSignals);
          body.astroSignals = computedSignals;
          body.astroPlanets = selectedChart.planets;
        }

        const { data, error } = await supabase.functions.invoke('generate-hd-narrative', {
          body,
        });

        if (error) throw error;
        if (data?.error) {
          toast.error(data.error);
          return;
        }

        setNarrativeText(data?.narrativeText || null);
        setSourceMap(null); // HD narratives don't have source maps yet

        // Save to database
        const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);

        const chartId = readingType === 'combined' 
          ? `combined_${selectedChart?.id}_${effectiveHdChart?.id}` 
          : `hd_${effectiveHdChart?.id}`;

        const { error: insertError } = await supabase.from('chart_narratives').insert([{
          chart_id: chartId,
          voice_preset: voiceStyle,
          length_preset: lengthPreset,
          include_shadow: includeShadow,
          engine_version: readingType === 'combined' ? 'combined_v1.0.0' : 'hd_v1.0.0',
          narrative_text: data?.narrativeText || '',
          signals_json: readingType === 'combined' && signals ? JSON.parse(JSON.stringify(signals)) : {},
          source_map_json: [],
          device_id: deviceId,
        }]);

        if (insertError) {
          console.warn('Failed to persist narrative:', insertError);
        } else {
          toast.success('Narrative generated successfully');
        }
      }
    } catch (err) {
      console.error('Generate narrative error:', err);
      toast.error('Failed to generate narrative. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load previous narrative on profile/mode change
  useEffect(() => {
    if (!selectedProfileId) return;
    if (readingType === 'astrology' && !selectedChart) return;
    if (readingType === 'human_design' && !selectedHdChart) return;
    if (readingType === 'combined' && (!selectedChart || !effectiveHdChart)) return;
    if (isGenerating) return;

    let cancelled = false;

    const loadPrevious = async () => {
      const deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        setNarrativeText(null);
        setSignals(null);
        setSourceMap(null);
        return;
      }

      let chartId = '';
      if (readingType === 'astrology') {
        chartId = selectedChart?.id || '';
      } else if (readingType === 'human_design') {
        chartId = `hd_${selectedHdChart?.id || ''}`;
      } else {
        chartId = `combined_${selectedChart?.id || ''}_${effectiveHdChart?.id || ''}`;
      }

      const { data, error } = await supabase
        .from('chart_narratives')
        .select('*')
        .eq('chart_id', chartId)
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (cancelled) return;
      if (error) {
        console.warn('Failed to load previous narrative:', error);
        return;
      }

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

    return () => { cancelled = true; };
  }, [selectedProfileId, readingType, selectedChart, selectedHdChart, effectiveHdChart]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif">Narrative</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Controls */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reading Type Toggle */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Reading Type</Label>
              <div className="grid grid-cols-3 gap-1">
                {READING_TYPE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setReadingType(opt.value);
                        setNarrativeText(null);
                        setSourceMap(null);
                        setSignals(null);
                        setActiveTab('narrative');
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded border text-[10px] uppercase tracking-wider transition-colors ${
                        readingType === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {readingType === 'astrology' && 'AI narrative from your natal chart'}
                {readingType === 'human_design' && 'AI narrative from your HD chart'}
                {readingType === 'combined' && 'Unified astrology + HD portrait'}
              </p>
            </div>

            {/* Unified Person Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Person</Label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a person..." />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {unifiedProfiles.map(profile => {
                    const isUser = profile.natalChart?.id === userNatalChart?.id;
                    const hasAstro = !!profile.natalChart;
                    const hasHd = !!profile.hdChart;
                    const canUseForMode = 
                      (readingType === 'astrology' && hasAstro) ||
                      (readingType === 'human_design' && hasHd) ||
                      (readingType === 'combined' && hasAstro && hasHd);
                    return (
                      <SelectItem key={profile.id} value={profile.id} disabled={!canUseForMode}>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            {isUser && <span className="text-primary">★</span>}
                            {profile.name}
                            {!canUseForMode && <span className="text-muted-foreground text-[10px] ml-1">(no {readingType === 'astrology' ? 'natal' : readingType === 'human_design' ? 'HD' : 'natal+HD'} data)</span>}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {hasAstro && '☉ Astrology'}
                            {hasAstro && hasHd && ' · '}
                            {hasHd && `◇ ${profile.hdChart!.type}`}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {readingType === 'astrology' && selectedProfile && !selectedProfile.natalChart && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No natal chart for "{selectedProfile.name}". Upload one in Chart Library.
                </p>
              )}
              {readingType === 'human_design' && selectedProfile && !selectedProfile.hdChart && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No HD chart for "{selectedProfile.name}". Create one in Human Design tab.
                </p>
              )}
              {readingType === 'combined' && selectedProfile && (
                <div className="text-[10px] space-y-1">
                  {selectedProfile.isFullyLinked ? (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Diamond className="h-3 w-3 text-primary" />
                      Linked: <span className="font-medium">{selectedProfile.hdChart!.type} · {selectedProfile.hdChart!.profile}</span>
                    </p>
                  ) : (
                    <p className="text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {!selectedProfile.natalChart ? 'Missing natal chart' : 'Missing HD chart'} for combined reading.
                    </p>
                  )}
                </div>
              )}
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
              disabled={isGenerating || !canGenerate}
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
                  Generate {readingType === 'combined' ? 'Combined' : readingType === 'human_design' ? 'HD' : ''} Reading
                </>
              )}
            </Button>

            {!canGenerate && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {readingType === 'astrology' && 'Chart needs planet data'}
                {readingType === 'human_design' && (!selectedHdChart ? 'No HD chart for this person' : 'Select a person with HD data')}
                {readingType === 'combined' && (!hasRequiredAstroData ? 'Chart needs planet data' : 'No matching HD chart found')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Tabs */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
              <TabsList className={`grid w-full ${
                readingType === 'astrology' ? 'grid-cols-4' : 
                (readingType === 'human_design' || readingType === 'combined') ? 'grid-cols-4' : 'grid-cols-1'
              }`}>
                <TabsTrigger value="narrative" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Narrative
                </TabsTrigger>
                {readingType === 'astrology' && (
                  <>
                    <TabsTrigger value="signals" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Signals
                    </TabsTrigger>
                    <TabsTrigger value="source-map" className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      Source Map
                    </TabsTrigger>
                  </>
                )}
                {(readingType === 'human_design' || readingType === 'combined') && (
                  <>
                    <TabsTrigger value="blueprint" className="flex items-center gap-2">
                      <Hexagon className="h-4 w-4" />
                      Blueprint
                    </TabsTrigger>
                    <TabsTrigger value="cross" className="flex items-center gap-2">
                      <Crosshair className="h-4 w-4" />
                      Cross
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger value="themes" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Themes
                </TabsTrigger>
              </TabsList>

              {/* Narrative Tab */}
              <TabsContent value="narrative" className="mt-4">
                {!narrativeText && !isGenerating && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No narrative generated yet.</p>
                    <p className="text-sm">
                      {readingType === 'astrology' && 'Select a chart and click Generate to create your narrative.'}
                      {readingType === 'human_design' && 'Select your HD chart and click Generate for a Human Design reading.'}
                      {readingType === 'combined' && 'Select both charts and click Generate for a unified reading.'}
                    </p>
                  </div>
                )}
                {isGenerating && (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p>
                      {readingType === 'combined' 
                        ? 'Weaving your astrology and Human Design together...' 
                        : readingType === 'human_design'
                        ? 'Analyzing your Human Design blueprint...'
                        : 'Generating your narrative...'}
                    </p>
                  </div>
                )}
                {narrativeText && !isGenerating && (
                  <>
                    {/* At a Glance Card */}
                    <AtAGlanceCard
                      readingType={readingType}
                      chart={selectedChart}
                      signals={signals}
                      hdChart={effectiveHdChart}
                    />
                    {/* Reading type badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {readingType === 'astrology' && '☉ Astrology Reading'}
                        {readingType === 'human_design' && '◇ Human Design Reading'}
                        {readingType === 'combined' && '☉◇ Combined Reading'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download as image">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint} title="Print">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div ref={narrativeRef}>
                    <ScrollArea className="h-[500px] pr-4">
                      {readingType === 'astrology' && sourceMap && sourceMap.length > 0 ? (
                        <>
                          <p className="text-xs text-muted-foreground mb-3 italic">💡 Click any sentence to see the astrological triggers behind it</p>
                          <div className="space-y-1">
                            {sourceMap.map((entry, i) => (
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
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {narrativeText.split('\n\n').map((para, i) => {
                            // Handle markdown bold
                            const parts = para.split(/(\*\*[^*]+\*\*)/g);
                            return (
                              <p key={i} className="leading-relaxed mb-4">
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={j}>{part}</span>;
                                })}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                    </div>
                    {/* Life Styles Section */}
                    {readingType === 'astrology' && signals && (
                      <div className="mt-6">
                        <LifeStylesSection signals={signals} />
                      </div>
                    )}
                    {readingType === 'human_design' && effectiveHdChart && (
                      <div className="mt-6">
                        <HDLifeStyles hdChart={effectiveHdChart} />
                      </div>
                    )}
                    {readingType === 'combined' && (
                      <div className="mt-6 space-y-4">
                        {signals && <LifeStylesSection signals={signals} />}
                        {effectiveHdChart && <HDLifeStyles hdChart={effectiveHdChart} />}
                      </div>
                    )}
                    {/* What's Ahead Panel - transit forecast */}
                    {selectedChart && selectedChart.planets && Object.keys(selectedChart.planets).length >= 3 && (
                      <WhatsAheadPanel chart={selectedChart} />
                    )}
                  </>
                )}

                {/* Foundations Section — always visible when chart has data, even without narrative */}
                {readingType === 'astrology' && selectedChart && selectedChart.planets && Object.keys(selectedChart.planets).length >= 3 && (
                  <FoundationsSection planetHouses={(signals || computeAllSignals(selectedChart)).planetHouses} />
                )}
              </TabsContent>

              {/* Signals Tab - only for astrology */}
              {readingType === 'astrology' && (
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
              )}

              {/* Source Map Tab - only for astrology */}
              {readingType === 'astrology' && (
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
              )}

              {/* Blueprint Tab - HD & Combined */}
              {(readingType === 'human_design' || readingType === 'combined') && (
                <TabsContent value="blueprint" className="mt-4">
                  {(() => {
                    const hd = effectiveHdChart;
                    if (!hd) return (
                      <div className="text-center py-12 text-muted-foreground">
                        <Hexagon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No Human Design chart available.</p>
                      </div>
                    );
                    const centerNames: Array<{label: string, key: string}> = [
                      {label: 'Head', key: 'Head'}, {label: 'Ajna', key: 'Ajna'}, {label: 'Throat', key: 'Throat'},
                      {label: 'G/Self', key: 'G'}, {label: 'Heart/Will', key: 'Heart'}, {label: 'Sacral', key: 'Sacral'},
                      {label: 'Solar Plexus', key: 'SolarPlexus'}, {label: 'Spleen', key: 'Spleen'}, {label: 'Root', key: 'Root'}
                    ];
                    const definedCenterKeys = hd.definedCenters || [];
                    return (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h3 className="font-medium">Your Design at a Glance</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                                <p className="font-medium text-sm">{hd.type || '—'}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {hd.type === 'Generator' && 'You have sustainable energy. Life works when you wait for things that light you up, then respond with your gut.'}
                                  {hd.type === 'Manifesting Generator' && 'You have multi-passionate energy. Wait for your gut response, then inform others before acting.'}
                                  {hd.type === 'Projector' && 'You see others deeply. Your power comes from being recognized and invited — not from pushing.'}
                                  {hd.type === 'Manifestor' && 'You are here to initiate. Inform those affected before you act, and you\'ll meet less resistance.'}
                                  {hd.type === 'Reflector' && 'You mirror the health of your environment. Wait a full lunar cycle before major decisions.'}
                                </p>
                              </div>
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Strategy</p>
                                <p className="font-medium text-sm">{hd.strategy || '—'}</p>
                                <p className="text-xs text-muted-foreground mt-1">This is HOW life brings you the right opportunities. Follow this and decisions feel easier.</p>
                              </div>
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Authority</p>
                                <p className="font-medium text-sm">{hd.authority || '—'}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {hd.authority?.includes('Emotional') && 'Never decide in the moment. Wait until the emotional wave passes and you feel clear.'}
                                  {hd.authority?.includes('Sacral') && 'Trust your gut sounds — "uh-huh" (yes) or "un-uh" (no). Your body knows before your mind does.'}
                                  {hd.authority?.includes('Splenic') && 'Trust your instinctive, in-the-moment knowing. It speaks once and doesn\'t repeat.'}
                                  {!hd.authority?.includes('Emotional') && !hd.authority?.includes('Sacral') && !hd.authority?.includes('Splenic') && 'This is your body\'s decision-making intelligence. Trust it over mental analysis.'}
                                </p>
                              </div>
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Profile</p>
                                <p className="font-medium text-sm">{hd.profile || '—'}</p>
                                <p className="text-xs text-muted-foreground mt-1">Your profile describes your costume in life — how you naturally learn and interact with the world.</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Definition</h3>
                            <p className="text-xs text-muted-foreground">
                              {hd.definitionType === 'Single' && 'Single Definition: Your defined centers are all connected. You process independently and don\'t need others to feel complete.'}
                              {hd.definitionType === 'Split' && 'Split Definition: Your defined centers form two separate groups. You may seek partners who "bridge" the gap — this is by design.'}
                              {hd.definitionType === 'Triple Split' && 'Triple Split: Three separate defined areas. You need time in busy environments to let different parts of you connect through others\' energy.'}
                              {hd.definitionType === 'Quadruple Split' && 'Quadruple Split: Four separate areas. You need lots of aura contact and patience with your own process.'}
                              {hd.definitionType === 'None' && 'No Definition: You are a Reflector — sampling and reflecting the energy around you.'}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-medium">Centers</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              <span className="font-medium">Defined</span> = consistent energy you can rely on. <span className="font-medium">Open</span> = where you absorb and amplify others' energy (wisdom through experience, not weakness).
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {centerNames.map(center => {
                                const isDefined = definedCenterKeys.includes(center.key as any);
                                return (
                                  <div key={center.key} className={`p-2 rounded border text-center text-xs ${isDefined ? 'bg-primary/10 border-primary/30' : 'bg-muted/20 border-border'}`}>
                                    <p className="font-medium">{center.label}</p>
                                    <p className={`text-[10px] ${isDefined ? 'text-primary' : 'text-muted-foreground'}`}>
                                      {isDefined ? 'Defined' : 'Open'}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {hd.definedChannels && hd.definedChannels.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Active Channels ({hd.definedChannels.length})</h3>
                              <p className="text-xs text-muted-foreground">Channels are your fixed life themes — consistent gifts you carry.</p>
                              <div className="space-y-1">
                                {hd.definedChannels.map((chId: string, i: number) => (
                                  <div key={i} className="p-2 bg-muted/30 rounded flex items-center justify-between">
                                    <span className="text-sm font-medium">Channel {chId}</span>
                                    <Badge variant="outline" className="text-[10px]">Active</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    );
                  })()}
                </TabsContent>
              )}

              {/* Cross Tab - HD & Combined */}
              {(readingType === 'human_design' || readingType === 'combined') && (
                <TabsContent value="cross" className="mt-4">
                  {(() => {
                    const hd = effectiveHdChart;
                    if (!hd) return (
                      <div className="text-center py-12 text-muted-foreground">
                        <Crosshair className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No Human Design chart available.</p>
                      </div>
                    );
                     const crossName = hd.incarnationCross?.name || 'Unknown';
                    // Find gate details from activations
                    const findGate = (planet: string, conscious: boolean) => {
                      const activations = conscious ? hd.personalityActivations : hd.designActivations;
                      return activations?.find(a => a.planet === planet);
                    };
                    const personalitySun = findGate('Sun', true);
                    const personalityEarth = findGate('Earth', true);
                    const designSun = findGate('Sun', false);
                    const designEarth = findGate('Earth', false);
                    const gateLabel = (g?: { gate: number; line: number }) => g ? `Gate ${g.gate}.${g.line}` : 'Gate ?';
                    const getGateData = (g?: { gate: number }) => g ? HUMAN_DESIGN_GATES.find(gd => gd.number === g.gate) : undefined;
                    const pSunData = getGateData(personalitySun);
                    const pEarthData = getGateData(personalityEarth);
                    const dSunData = getGateData(designSun);
                    const dEarthData = getGateData(designEarth);

                    // Look up rich cross data from incarnationCrosses
                    const crossEntry = incarnationCrosses.find((c) => c.name === crossName);
                    const angleDesc = hd.incarnationCross?.type ? crossTypeDescriptions[hd.incarnationCross.type as keyof typeof crossTypeDescriptions] : undefined;

                    return (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                          {/* Cross Name & Purpose Synthesis */}
                          <div className="space-y-3">
                            <h3 className="font-medium text-lg text-center">{crossName}</h3>
                            {crossEntry?.description ? (
                              <p className="text-sm leading-relaxed text-foreground/90">
                                {crossEntry.description}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground text-center">Your Incarnation Cross is your life's overarching purpose — the theme that gives your life meaning over time.</p>
                            )}
                          </div>

                          {/* Life Work */}
                          {crossEntry?.lifeWork && (
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">🎯 Your Life's Work</p>
                              <p className="text-sm">{crossEntry.lifeWork}</p>
                            </div>
                          )}

                          {/* How the Gates Work Together */}
                          {crossEntry?.gateIntegration && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">🔗 How Your Gates Work Together</p>
                              <p className="text-sm">{crossEntry.gateIntegration}</p>
                            </div>
                          )}

                          {/* The Four Gates Detail */}
                          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                            <h4 className="font-medium text-sm">Your Four Cross Gates</h4>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="p-3 bg-background rounded border-l-4 border-foreground">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Conscious Axis (What You Know About Yourself)</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-[10px] text-muted-foreground">☀️ Personality Sun</p>
                                    <p className="font-medium text-sm">{gateLabel(personalitySun)}{pSunData ? ` — ${pSunData.name}` : ''}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{pSunData?.consciousExpression || 'What you consciously express and identify with'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground">🌍 Personality Earth</p>
                                    <p className="font-medium text-sm">{gateLabel(personalityEarth)}{pEarthData ? ` — ${pEarthData.name}` : ''}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{pEarthData?.consciousExpression || 'What keeps you grounded and stable'}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-3 bg-background rounded border-l-4 border-destructive/50">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Unconscious Axis (What Others See in You)</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-[10px] text-muted-foreground">☀️ Design Sun</p>
                                    <p className="font-medium text-sm">{gateLabel(designSun)}{dSunData ? ` — ${dSunData.name}` : ''}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{dSunData?.unconsciousExpression || 'What your body naturally radiates without you knowing'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground">🌍 Design Earth</p>
                                    <p className="font-medium text-sm">{gateLabel(designEarth)}{dEarthData ? ` — ${dEarthData.name}` : ''}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{dEarthData?.unconsciousExpression || 'The deep unconscious foundation of your being'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cross Angle - comparison of all three */}
                          {hd.incarnationCross?.type && (() => {
                            const userAngle = hd.incarnationCross!.type;
                            const angles = [
                              {
                                type: 'Right Angle',
                                emoji: '🔺',
                                pct: '~70%',
                                keyword: 'Personal Destiny',
                                brief: 'Purpose is <strong>self-contained</strong> — everything needed is already built in. Impact on others is a natural byproduct of living authentically.',
                                full: 'Your purpose is about <strong>YOUR journey</strong>. Everything you need to fulfill your purpose is <strong>already inside you</strong> — you don\'t need to find the right person, the right group, or the right opportunity to "unlock" it. You just need to <strong>live as yourself</strong>. Your impact on others happens naturally as a <strong>byproduct of living authentically</strong> — you don\'t need to go looking for your purpose in other people. Think of it this way: Left Angle people need specific relationships to find their purpose. <strong>You don\'t. Yours is built in.</strong> About 70% of people have Right Angle crosses, which means most humans are here to figure out their own thing first — and that\'s not selfish, it\'s by design.',
                              },
                              {
                                type: 'Left Angle',
                                emoji: '🔻',
                                pct: '~25%',
                                keyword: 'Transpersonal Karma',
                                brief: 'Purpose unfolds <strong>through others</strong> — specific relationships and networks are essential, not optional.',
                                full: 'Your purpose <strong>cannot be fulfilled alone</strong>. Unlike Right Angle people who carry everything they need inside them, your destiny is <strong>woven into specific relationships</strong> — the people you meet, the groups you join, the networks you enter. These aren\'t random — they feel <strong>"fated"</strong> because they are. You\'ll notice certain people walk into your life and everything shifts. That\'s your cross at work. Your gift is <strong>transpersonal</strong> — meaning your purpose literally <strong>lives in the space between you and others</strong>. You\'re here to impact specific people, and they\'re here to unlock something in you too. If you\'ve ever felt like you can\'t figure out your purpose by yourself, that\'s not a flaw — <strong>that\'s your design</strong>. About 25% of people have Left Angle crosses.',
                              },
                              {
                                type: 'Juxtaposition',
                                emoji: '⬥',
                                pct: '~5%',
                                keyword: 'Fixed Fate',
                                brief: 'The <strong>rarest geometry</strong> — a laser-focused, almost fated path that bridges personal and transpersonal destiny.',
                                full: 'You have the <strong>rarest cross geometry</strong> — only about 5% of people share it. Your path is <strong>extremely specific and focused</strong>, almost like you\'re walking a tightrope that was laid out before you were born. While Right Angle people explore their own journey and Left Angle people find purpose through relationships, you\'re doing something in between: your life has a <strong>"fixed fate" quality</strong> where you\'re meant to be in <strong>exact places at exact times</strong>. You might notice your life doesn\'t have as much "wiggle room" as others — that\'s not bad luck, it\'s your geometry. You serve as a <strong>bridge</strong> between the personal and the transpersonal, and your very presence in certain situations is what matters. <strong>You don\'t need to force anything — your job is to show up as yourself, and the geometry handles the rest.</strong>',
                              },
                            ];
                            return (
                              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cross Geometry — Understanding the Three Angles</p>
                                <p className="text-xs text-muted-foreground">
                                  Every Incarnation Cross has one of three "angles" that determines HOW your purpose operates. Yours is <strong>{userAngle}</strong>.
                                </p>
                                <div className="space-y-2">
                                  {angles.map(a => {
                                    const isYours = a.type === userAngle;
                                    return (
                                      <div
                                        key={a.type}
                                        className={`p-3 rounded-lg border ${isYours ? 'border-primary bg-primary/5' : 'border-transparent bg-background/50'}`}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <span>{a.emoji}</span>
                                          <span className={`font-medium text-sm ${isYours ? 'text-primary' : ''}`}>{a.type}</span>
                                          <Badge variant={isYours ? 'default' : 'secondary'} className="text-[9px] h-4">
                                            {isYours ? '← You' : a.pct}
                                          </Badge>
                                          <span className="text-[10px] text-muted-foreground ml-auto">{a.keyword}</span>
                                        </div>
                                        <p
                                          className="text-xs text-muted-foreground leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: isYours ? a.full : a.brief }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Collective Contribution */}
                          {crossEntry?.collectiveContribution && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">🌍 What You Bring to the World</p>
                              <p className="text-sm">{crossEntry.collectiveContribution}</p>
                            </div>
                          )}

                          {/* Living Your Cross */}
                          {crossEntry?.livingYourCross && (
                            <div className="p-3 border border-primary/20 rounded-lg bg-primary/5">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">💡 How to Live This Cross</p>
                              <p className="text-sm">{crossEntry.livingYourCross}</p>
                            </div>
                          )}

                          <div className="p-3 border border-muted rounded-lg bg-muted/10">
                            <p className="text-xs text-muted-foreground">
                              💡 <strong>Remember:</strong> Your cross doesn't "activate" at birth — it unfolds gradually. Most people begin to feel their cross purpose clearly around age 40+, after living their Strategy and Authority. It's a destination, not a starting point.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                    );
                  })()}
                </TabsContent>
              )}

              {/* Themes Tab - All Modes */}
              <TabsContent value="themes" className="mt-4">
                <ThemesTab
                  readingType={readingType}
                  signals={signals}
                  hdChart={effectiveHdChart}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
