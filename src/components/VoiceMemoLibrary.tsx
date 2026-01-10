import { useState, useMemo } from 'react';
import { Search, Mic, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceMemoPlayer } from './VoiceMemoPlayer';
import { VoiceMemo, MemoCategory, getCategoryLabel, getCategoryColor } from '@/hooks/useVoiceMemos';
import { cn } from '@/lib/utils';

interface VoiceMemoLibraryProps {
  memos: VoiceMemo[];
  onDelete: (id: string) => void;
  onDownload: (memo: VoiceMemo) => void;
}

const CATEGORIES: (MemoCategory | 'all')[] = [
  'all',
  'transit-notes',
  'reading-notes',
  'daily-reflection',
  'dream-journal',
  'other',
];

export const VoiceMemoLibrary = ({ memos, onDelete, onDownload }: VoiceMemoLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MemoCategory | 'all'>('all');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Filter memos
  const filteredMemos = useMemo(() => {
    let result = memos;

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(query));
    }

    return result;
  }, [memos, categoryFilter, searchQuery]);

  // Group by date
  const groupedMemos = useMemo(() => {
    const groups: Record<string, VoiceMemo[]> = {};
    
    for (const memo of filteredMemos) {
      if (!groups[memo.date]) {
        groups[memo.date] = [];
      }
      groups[memo.date].push(memo);
    }

    // Sort dates descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredMemos]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  // Auto-expand first 3 dates
  useState(() => {
    const firstThree = groupedMemos.slice(0, 3).map(([date]) => date);
    setExpandedDates(new Set(firstThree));
  });

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl font-light text-foreground">
            <Mic className="h-6 w-6 text-primary" />
            Voice Memos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {memos.length} memo{memos.length !== 1 ? 's' : ''} total
            {filteredMemos.length !== memos.length && ` • ${filteredMemos.length} shown`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memos..."
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val as MemoCategory | 'all')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center gap-2">
                    {cat !== 'all' && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(cat) }}
                      />
                    )}
                    {cat === 'all' ? 'All Categories' : getCategoryLabel(cat)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      {memos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Mic className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-medium text-foreground">No Voice Memos Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click the 🎙️ icon on any calendar day to add your first memo
          </p>
        </div>
      )}

      {/* No Results */}
      {memos.length > 0 && filteredMemos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 font-medium text-foreground">No Memos Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter
          </p>
        </div>
      )}

      {/* Grouped Memos */}
      {groupedMemos.length > 0 && (
        <div className="space-y-4">
          {groupedMemos.map(([date, dateMemos]) => {
            const isExpanded = expandedDates.has(date);
            
            return (
              <div
                key={date}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* Date Header */}
                <button
                  onClick={() => toggleDate(date)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {formatDateHeader(date)}
                  </span>
                  <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <Mic className="h-3 w-3" />
                    {dateMemos.length}
                  </span>
                </button>

                {/* Memos List */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    {dateMemos.map((memo) => (
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
          })}
        </div>
      )}
    </div>
  );
};
