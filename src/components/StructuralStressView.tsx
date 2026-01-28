import { useState, useMemo } from 'react';
import { Layers, Info } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  generateStructuralAnalysis, 
  StructuralWindow, 
  MeaningDialMode,
  generateWindowCopy,
  extractChartSignature
} from '@/lib/structuralStressEngine';
import { CONTEXT_TAG_LABELS, SAFETY_COPY } from '@/lib/structuralStressCopy';
import { WindowCard } from './structural/WindowCard';
import { WindowDetailModal } from './structural/WindowDetailModal';
import { SaturnLensCards } from './structural/SaturnLensCards';
import { MeaningDial } from './structural/MeaningDial';
import { ContextTagsPanel } from './structural/ContextTagsPanel';

interface StructuralStressViewProps {
  userChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const StructuralStressView = ({ userChart, savedCharts }: StructuralStressViewProps) => {
  const [selectedChart, setSelectedChart] = useState<NatalChart | null>(userChart);
  const [meaningMode, setMeaningMode] = useState<MeaningDialMode>('Insight');
  const [selectedWindow, setSelectedWindow] = useState<StructuralWindow | null>(null);
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [showSaturnCards, setShowSaturnCards] = useState(true);

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userChart) charts.push(userChart);
    charts.push(...savedCharts);
    return charts;
  }, [userChart, savedCharts]);

  const analysis = useMemo(() => {
    if (!selectedChart) return null;
    return generateStructuralAnalysis(selectedChart);
  }, [selectedChart]);

  const windowsWithMode = useMemo(() => {
    if (!analysis || !selectedChart) return [];
    
    const signature = extractChartSignature(selectedChart);
    return analysis.windows.map(window => {
      const updatedWindow = { ...window, meaning_dial_mode: meaningMode };
      updatedWindow.output_copy = generateWindowCopy(updatedWindow, signature, meaningMode);
      updatedWindow.user_context_tags = contextTags;
      return updatedWindow;
    });
  }, [analysis, selectedChart, meaningMode, contextTags]);

  const handleWindowClick = (window: StructuralWindow) => {
    setSelectedWindow(window);
  };

  const hasSafetyTag = contextTags.includes('safety');

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
      {/* Intro Section */}
      <Card className="bg-secondary/30 border-none">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              This view explains pressure cycles—when life is in "hold it together" mode vs "something must change" mode. 
              It doesn't predict specific events. It helps you understand what themes are active and what choices support you.
            </p>
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
          {/* Meaning Dial */}
          <MeaningDial 
            mode={meaningMode} 
            onModeChange={setMeaningMode} 
          />

          {/* Context Tags (Optional) */}
          <ContextTagsPanel
            selectedTags={contextTags}
            onTagsChange={setContextTags}
            tagLabels={CONTEXT_TAG_LABELS}
          />

          {/* Safety Notice */}
          {hasSafetyTag && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-4">
                <p className="text-sm text-destructive">
                  {SAFETY_COPY}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Saturn Lens Cards */}
          <div className="space-y-3">
            <button
              onClick={() => setShowSaturnCards(!showSaturnCards)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <span className={`transform transition-transform ${showSaturnCards ? 'rotate-90' : ''}`}>▶</span>
              Saturn Lens Cards
            </button>
            {showSaturnCards && (
              <SaturnLensCards cards={analysis.saturnCards} />
            )}
          </div>

          {/* Timeline View */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Structural Windows Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {windowsWithMode.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No significant structural transits detected in the 10-year scan window.
                </p>
              ) : (
                <div className="space-y-4">
                  {windowsWithMode.map(window => (
                    <WindowCard
                      key={window.window_id}
                      window={window}
                      onClick={() => handleWindowClick(window)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Detail Modal */}
      {selectedWindow && selectedChart && (
        <WindowDetailModal
          window={selectedWindow}
          chartSignature={extractChartSignature(selectedChart)}
          onClose={() => setSelectedWindow(null)}
          hasSafetyTag={hasSafetyTag}
        />
      )}
    </div>
  );
};
