import { VoiceMemo } from '@/hooks/useVoiceMemos';
import { VoiceMemoPlayer } from './VoiceMemoPlayer';
import { Mic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceMemosForDayProps {
  memos: VoiceMemo[];
  onDelete: (id: string) => void;
  onDownload: (memo: VoiceMemo) => void;
  onAddNew: () => void;
}

export const VoiceMemosForDay = ({ memos, onDelete, onDownload, onAddNew }: VoiceMemosForDayProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-foreground">
          <Mic className="h-4 w-4 text-primary" />
          Voice Memos ({memos.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNew}
          className="gap-1.5"
        >
          <Plus className="h-3 w-3" />
          Add Memo
        </Button>
      </div>

      {memos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <Mic className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No voice memos for this day
          </p>
          <Button
            variant="link"
            onClick={onAddNew}
            className="mt-1"
          >
            Add your first memo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {memos.map((memo) => (
            <VoiceMemoPlayer
              key={memo.id}
              memo={memo}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
};
