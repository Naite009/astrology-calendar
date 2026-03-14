import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { KeyFactsRow } from './KeyFactsRow';
import { TimeLordCard } from './TimeLordCard';
import { NatalMeetsSR } from './NatalMeetsSR';
import { TierButtonRow } from './TierButtonRow';
import { buildOraclePrompt } from '@/lib/aiPrompts/oraclePrompt';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function formatBirthDate(d: string): string {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(parts[1], 10) - 1] || ''} ${parseInt(parts[2], 10)}, ${parts[0]}`;
}

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  onSelectTier?: (tier: string | null) => void;
  onDownloadTier: (tier: string) => void;
}

export const OverviewDashboard = ({ analysis, srChart, natalChart, onSelectTier, onDownloadTier }: Props) => {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fullName = natalChart.name || 'Unknown';
  const year = srChart.solarReturnYear;
  const natalSunSign = natalChart.planets?.Sun?.sign || '';
  const natalMoonSign = natalChart.planets?.Moon?.sign || '';
  const natalRisingSign = natalChart.planets?.Ascendant?.sign || '';
  const formattedBirthDate = formatBirthDate(natalChart.birthDate);

  const generateAI = async () => {
    if (aiText) {
      // Already generated — just show/hide
      setAiPanelOpen(!aiPanelOpen);
      return;
    }
    setAiPanelOpen(true);
    setAiLoading(true);
    try {
      const prompt = buildOraclePrompt(analysis, srChart, natalChart);
      const { data, error } = await supabase.functions.invoke('oracle-reading', { body: { prompt } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setAiText(data?.text || 'No reading generated.');
    } catch (err: any) {
      console.error('Oracle reading error:', err);
      toast.error('Failed to generate oracle reading');
    } finally {
      setAiLoading(false);
    }
  };

  const aiParagraphs = aiText.split('\n').filter(p => p.trim());

  return (
    <div className="space-y-0 mt-4">
      {/* SECTION 1 — Screen Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Solar Return {year} — {fullName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {natalSunSign} Sun · {natalMoonSign} Moon · {natalRisingSign} Rising
            {formattedBirthDate && ` · Born ${formattedBirthDate}`}
          </p>
        </div>
      </div>

      {/* SECTION 2 — Key Facts */}
      <KeyFactsRow analysis={analysis} srChart={srChart} />

      {/* SECTION 3 — Time Lord */}
      <TimeLordCard analysis={analysis} srChart={srChart} natalChart={natalChart} />

      {/* SECTION 4 — How This Year Meets You */}
      <NatalMeetsSR analysis={analysis} srChart={srChart} natalChart={natalChart} />

      {/* SECTION 5 — Tier Download Row + AI Button */}
      <TierButtonRow
        analysis={analysis}
        natalChart={natalChart}
        solarReturnChart={srChart}
        onSelectTier={onSelectTier}
        onDownloadTier={onDownloadTier}
        onAIClick={generateAI}
      />

      {/* AI Reading Panel (on demand) */}
      {aiPanelOpen && (
        <div className="mt-3 border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
            <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Sparkles size={12} /> Oracle Reading
            </span>
            <span className="text-xs text-muted-foreground">
              Full practitioner depth · Not included in any PDF
            </span>
          </div>
          <div className="px-4 py-4">
            {aiLoading ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Reading the chart...
              </div>
            ) : (
              <div className="text-sm text-foreground leading-relaxed space-y-3">
                {aiParagraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
