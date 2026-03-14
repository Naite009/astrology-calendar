import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
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

interface Props {
  analysis: SolarReturnAnalysis;
  natalChart: NatalChart;
  solarReturnChart: SolarReturnChart;
  birthdayMode?: boolean;
  personalMessage?: string;
  personName?: string;
  onDownloadTier: (tier: TierId) => void;
  onSelectTier?: (tier: TierId | null) => void;
  onAIClick?: () => void;
}

export const TierButtonRow = ({
  analysis,
  natalChart,
  solarReturnChart,
  onDownloadTier,
  onSelectTier,
  onAIClick,
}: Props) => {
  const [activeTier, setActiveTier] = useState<TierId | null>(null);

  const handleTierClick = (tier: TierId) => {
    const newTier = activeTier === tier ? null : tier;
    setActiveTier(newTier);
    // All tiers now switch to full preview mode
    if (onSelectTier) {
      onSelectTier(newTier);
      return;
    }
  };

  const handleAiClick = () => {
    if (onAIClick) {
      onAIClick();
    } else {
      toast.info('AI reading generation coming soon');
    }
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

      {/* Preview panel — only for non-T1 tiers (T1 uses full preview) */}
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
