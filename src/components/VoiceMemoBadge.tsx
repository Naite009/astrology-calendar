import { Mic } from 'lucide-react';
import { VoiceMemo, getCategoryColor } from '@/hooks/useVoiceMemos';
import { cn } from '@/lib/utils';

interface VoiceMemoBadgeProps {
  memos: VoiceMemo[];
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export const VoiceMemoBadge = ({ memos, onClick, size = 'md' }: VoiceMemoBadgeProps) => {
  if (memos.length === 0) return null;

  // Get primary category color (most recent memo)
  const primaryColor = getCategoryColor(memos[0].category);

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full transition-all hover:scale-110',
        size === 'sm' ? 'px-1 py-0.5' : 'px-1.5 py-0.5'
      )}
      style={{ backgroundColor: `${primaryColor}20` }}
      title={`${memos.length} voice memo${memos.length > 1 ? 's' : ''}`}
    >
      <Mic
        className={cn(
          size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
        )}
        style={{ color: primaryColor }}
      />
      {memos.length > 1 && (
        <span
          className={cn(
            'font-medium',
            size === 'sm' ? 'text-[9px]' : 'text-[10px]'
          )}
          style={{ color: primaryColor }}
        >
          {memos.length}
        </span>
      )}
    </button>
  );
};
