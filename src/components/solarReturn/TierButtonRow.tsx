import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { TierPreviewPanel } from './TierPreviewPanel';
import { toast } from 'sonner';

type TierId = 't1' | 't2' | 't3' | 't4' | 't5';

const TIER_BUTTONS: { id: TierId; label: string }[] = [
  { id: 't1', label: 'T1 · Year at a Glance' },
  { id: 't2', label: 'T2 · The Year Ahead' },
  { id: 't3', label: 'T3 · Deep Dive' },
  { id: 't4', label: 'T4 · Master Reading' },
  { id: 't5', label: 'T5 · Oracle Report' },
];

const TIER_COLORS: Record<TierId, { bg: string; text: string; border: string; activeBg: string }> = {
  t1: { bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', activeBg: '#9FE1CB' },
  t2: { bg: '#EEEDFE', text: '#3C3489', border: '#CECBF6', activeBg: '#CECBF6' },
  t3: { bg: '#FAEEDA', text: '#633806', border: '#FAC775', activeBg: '#FAC775' },
  t4: { bg: '#FAECE7', text: '#712B13', border: '#F5C4B3', activeBg: '#F5C4B3' },
  t5: { bg: '#FBEAF0', text: '#72243E', border: '#F4C0D1', activeBg: '#F4C0D1' },
};

function generateTier1SolarReturnPDF() {
  console.log('tier 1 download');
}

interface Props {
  analysis: SolarReturnAnalysis;
  natalChart: NatalChart;
  solarReturnChart: SolarReturnChart;
  birthdayMode?: boolean;
  personalMessage?: string;
  personName?: string;
  onDownloadTier: (tier: TierId) => void;
}

export const TierButtonRow = ({
  analysis,
  natalChart,
  solarReturnChart,
  onDownloadTier,
}: Props) => {
  const [activeTier, setActiveTier] = useState<TierId | null>(null);

  const handleTierClick = (tier: TierId) => {
    setActiveTier(prev => (prev === tier ? null : tier));
  };

  const handleAiClick = () => {
    toast.info('AI reading generation coming soon');
  };

  return (
    <div className="space-y-0">
      {/* Button row */}
      <div className="flex items-center gap-2 flex-wrap py-3 px-1 border-t border-border">
        {TIER_BUTTONS.map(({ id, label }) => {
          const colors = TIER_COLORS[id];
          const isActive = activeTier === id;
          return (
            <button
              key={id}
              onClick={() => handleTierClick(id)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none"
              style={{
                backgroundColor: isActive ? colors.activeBg : colors.bg,
                color: colors.text,
                border: isActive ? `2px solid ${colors.border}` : `1px solid ${colors.border}`,
              }}
            >
              {label}
            </button>
          );
        })}

        {/* AI button */}
        <button
          onClick={handleAiClick}
          className="ml-auto px-4 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center gap-1.5"
        >
          <Sparkles size={10} />
          Generate AI Reading
        </button>
      </div>

      {/* T1 inline preview */}
      {activeTier === 't1' && (
        <div className="border-2 border-green-500 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Year at a Glance</h3>
            <button
              onClick={() => generateTier1SolarReturnPDF()}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Ascendant</div>
              <div className="text-sm font-semibold">{analysis.yearlyTheme?.ascendantSign || '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Moon</div>
              <div className="text-sm font-semibold">{analysis.moonSign || '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Profection House</div>
              <div className="text-sm font-semibold">{analysis.profectionYear?.houseNumber || '—'}</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTier(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} />
            Close
          </button>
        </div>
      )}

      {/* Other tiers use existing preview panel */}
      {activeTier && activeTier !== 't1' && (
        <TierPreviewPanel
          tier={activeTier}
          analysis={analysis}
          onClose={() => setActiveTier(null)}
          onDownload={onDownloadTier}
        />
      )}
    </div>
  );
};
