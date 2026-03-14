import { X, Download, Sparkles } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { TierPreviewContent } from './TierPreviewContent';
import { toast } from 'sonner';

type TierId = 't1' | 't2' | 't3' | 't4' | 't5';

const TIER_META: Record<TierId, { name: string; tagline: string }> = {
  t1: { name: 'Year at a Glance', tagline: 'Plain language · 3 pages · Always free' },
  t2: { name: 'The Year Ahead', tagline: 'Core interpretation · 8–12 pages' },
  t3: { name: 'Deep Dive', tagline: 'Full analysis · 20–25 pages' },
  t4: { name: 'Master Reading', tagline: 'Practitioner depth · Dignity + Health' },
  t5: { name: 'Oracle Report', tagline: 'Complete mastery · Every technique' },
};

const TIER_COLORS: Record<TierId, { bg: string; text: string; border: string; dot: string }> = {
  t1: { bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', dot: '#085041' },
  t2: { bg: '#EEEDFE', text: '#3C3489', border: '#CECBF6', dot: '#3C3489' },
  t3: { bg: '#FAEEDA', text: '#633806', border: '#FAC775', dot: '#633806' },
  t4: { bg: '#FAECE7', text: '#712B13', border: '#F5C4B3', dot: '#712B13' },
  t5: { bg: '#FBEAF0', text: '#72243E', border: '#F4C0D1', dot: '#72243E' },
};

interface Props {
  tier: TierId;
  analysis: SolarReturnAnalysis;
  onClose: () => void;
  onDownload: (tier: TierId) => void;
}

export const TierPreviewPanel = ({ tier, analysis, onClose, onDownload }: Props) => {
  const meta = TIER_META[tier];
  const colors = TIER_COLORS[tier];

  const handleDownload = () => {
    if (tier === 't4' || tier === 't5') {
      toast.info('Coming soon — this tier is under development');
      return;
    }
    onDownload(tier);
  };

  return (
    <div className="border border-border rounded-sm bg-card mb-4 overflow-hidden animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: colors.dot }}
          />
          <span className="font-medium text-sm text-foreground">{meta.name}</span>
          <span className="text-xs text-muted-foreground">{meta.tagline}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded text-xs font-medium border transition-all hover:opacity-80"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }}
          >
            <span className="flex items-center gap-1.5">
              <Download size={12} />
              {tier === 't4' || tier === 't5' ? 'Coming Soon' : 'Download PDF'}
            </span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <TierPreviewContent tier={tier} analysis={analysis} />
      </div>
    </div>
  );
};
