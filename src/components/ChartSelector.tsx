import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown, LogIn } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import {
  dedupeChartsByIdentity, chartIdentityKey, chartPickerLabels, chartHiddenReason,
} from '@/lib/charts/chartIdentity';

import { getCachedUserId } from '@/lib/supabaseSessionRecovery';

interface ChartSelectorProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartId: string;
  onSelect: (chartId: string) => void;
  includeGeneral?: boolean;
  generalLabel?: string;
  generalId?: string;
  label?: string;
  className?: string;
}

export const ChartSelector = ({
  userNatalChart,
  savedCharts,
  selectedChartId,
  onSelect,
  includeGeneral = false,
  generalLabel = 'General Calendar',
  generalId = 'general',
  label,
  className = '',
}: ChartSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSignedInSession = !!getCachedUserId();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Listed charts: every saved birth chart stays visible. Only a record with the
  // identical name AND birth moment is treated as the same chart, and Solar
  // Return / Human Design-only records are not birth charts. Two different
  // people sharing a name are both shown, separated by birth date.
  const listedCharts = useMemo(() => {
    const isBirthChart = (c: NatalChart) => !(c as any).solarReturnYear && !c.id?.startsWith('hd_');
    const pool = savedCharts.filter(isBirthChart);
    const deduped = dedupeChartsByIdentity(pool).filter((c) => {
      // The starred chart is already listed on top; skip only that exact record.
      if (!userNatalChart) return true;
      return chartIdentityKey(c) !== chartIdentityKey(userNatalChart);
    });
    return [...deduped].sort((a, b) => a.name.localeCompare(b.name));
  }, [savedCharts, userNatalChart]);

  const hiddenCount = useMemo(
    () => savedCharts.filter((c) => chartHiddenReason(c as any)).length,
    [savedCharts],
  );

  // Build options list
  const options = useMemo(() => {
    const opts: { id: string; name: string; isUser?: boolean; isGeneral?: boolean }[] = [];

    if (includeGeneral) {
      opts.push({ id: generalId, name: generalLabel, isGeneral: true });
    }

    // User's chart always first (after general if present)
    if (userNatalChart) {
      opts.push({ id: 'user', name: userNatalChart.name, isUser: true });
    }

    // Then alphabetically sorted saved charts, birth date added when names clash
    const labels = chartPickerLabels(listedCharts);
    listedCharts.forEach(chart => {
      opts.push({ id: chart.id, name: labels.get(chart) || chart.name });
    });

    return opts;
  }, [userNatalChart, listedCharts, includeGeneral, generalLabel, generalId]);


  // Filter by search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => opt.name.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Get selected option display name
  const selectedOption = options.find(opt => opt.id === selectedChartId);
  const displayName = selectedOption?.name || 'Select a chart';

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[180px] border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none hover:border-primary/50 transition-colors"
      >
        <span className="truncate">
          {selectedOption?.isUser && <span className="text-primary mr-1">★</span>}
          {displayName}
        </span>
        <ChevronDown size={14} className={`ml-2 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-background border border-border rounded-sm shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search charts..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-sm bg-background focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[250px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? `No saved chart matches "${searchTerm.trim()}".`
                  : 'No charts saved yet.'}
              </div>
            ) : (

              filteredOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors ${
                    selectedChartId === opt.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <span className="flex-1 truncate">
                    {opt.isUser && <span className="text-primary mr-1">★</span>}
                    {opt.name}
                  </span>
                  {selectedChartId === opt.id && (
                    <Check size={14} className="text-primary ml-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {!hasSignedInSession && (
            <div className="border-t border-border bg-secondary/40 p-2">
              <button
                type="button"
                onClick={() => { window.location.href = '/auth'; }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogIn size={14} className="text-primary" />
                <span>Sign in to load every saved name</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
