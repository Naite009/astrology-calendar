import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Star, ArrowRight } from 'lucide-react';
import {
  PLANETARY_MYTHOLOGY,
  MYTHOLOGY_CATEGORIES,
  MythologyEntry,
  MythologyCategory,
} from '@/lib/planetaryMythology';
import { NatalChart } from '@/hooks/useNatalChart';
import { getPlanetSymbol } from '@/components/PlanetSymbol';

interface MythologyEncyclopediaExplorerProps {
  userNatalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
  onNavigateToChartLibrary?: () => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  luminary:       { bg: 'bg-primary/5',     border: 'border-primary/20',  text: 'text-primary',           badge: 'bg-primary/10 text-primary' },
  personal:       { bg: 'bg-accent/30',     border: 'border-accent',      text: 'text-foreground',        badge: 'bg-accent text-accent-foreground' },
  social:         { bg: 'bg-secondary/50',  border: 'border-secondary',   text: 'text-foreground',        badge: 'bg-secondary text-secondary-foreground' },
  transpersonal:  { bg: 'bg-muted/50',      border: 'border-border',      text: 'text-muted-foreground',  badge: 'bg-muted text-muted-foreground' },
  centaur:        { bg: 'bg-primary/5',     border: 'border-primary/15',  text: 'text-primary',           badge: 'bg-primary/10 text-primary' },
  asteroid:       { bg: 'bg-accent/20',     border: 'border-accent/50',   text: 'text-foreground',        badge: 'bg-accent/30 text-accent-foreground' },
  point:          { bg: 'bg-secondary/30',  border: 'border-border',      text: 'text-muted-foreground',  badge: 'bg-secondary text-secondary-foreground' },
};

// Normalize mythology entry name to match chart planet keys
function mythNameToChartKey(name: string): string[] {
  const map: Record<string, string[]> = {
    'Sun': ['Sun'], 'Moon': ['Moon'], 'Mercury': ['Mercury'], 'Venus': ['Venus'],
    'Mars': ['Mars'], 'Jupiter': ['Jupiter'], 'Saturn': ['Saturn'],
    'Uranus': ['Uranus'], 'Neptune': ['Neptune'], 'Pluto': ['Pluto'],
    'Chiron': ['Chiron'], 'Eris': ['Eris'], 'Sedna': ['Sedna'],
    'Lilith (Black Moon)': ['Lilith', 'BlackMoonLilith'],
    'Ceres': ['Ceres'], 'Pallas': ['Pallas'], 'Juno': ['Juno'], 'Vesta': ['Vesta'],
    'North Node': ['NorthNode', 'North Node'], 'South Node': ['SouthNode', 'South Node'],
    'Part of Fortune': ['PartOfFortune', 'Part of Fortune'],
    'Vertex': ['Vertex'],
    'Makemake': ['Makemake'], 'Haumea': ['Haumea'], 'Quaoar': ['Quaoar'],
    'Orcus': ['Orcus'], 'Ixion': ['Ixion'], 'Varuna': ['Varuna'],
    'Pholus': ['Pholus'], 'Nessus': ['Nessus'], 'Chariklo': ['Chariklo'],
    'Psyche': ['Psyche'], 'Eros': ['Eros'], 'Amor': ['Amor'], 'Hygiea': ['Hygiea'],
    'Gonggong': ['Gonggong'], 'Salacia': ['Salacia'],
  };
  return map[name] || [name];
}

function getChartPlacement(name: string, chart: NatalChart | null | undefined): { sign: string; degree: number; minutes?: number; retrograde?: boolean } | null {
  if (!chart?.planets) return null;
  const keys = mythNameToChartKey(name);
  for (const key of keys) {
    const pos = chart.planets[key as keyof typeof chart.planets];
    if (pos && typeof pos === 'object' && 'sign' in pos) return pos as any;
  }
  return null;
}

function MythDetailModal({ entry, open, onClose, chartPlacement, onNavigateToChartLibrary }: {
  entry: MythologyEntry | null; open: boolean; onClose: () => void;
  chartPlacement: { sign: string; degree: number; minutes?: number; retrograde?: boolean } | null;
  onNavigateToChartLibrary?: () => void;
}) {
  if (!entry) return null;
  const cs = CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.personal;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-4xl">{entry.symbol}</span>
            <div>
              <span>{entry.name}</span>
              <span className="text-sm text-muted-foreground font-normal ml-2">— {entry.archetype}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-5">
            {/* In Your Chart banner */}
            {chartPlacement ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary" />
                  In Your Chart
                </p>
                <p className="text-sm mt-1">
                  {entry.name} is at <span className="font-semibold">{chartPlacement.degree}°{chartPlacement.minutes ? `${chartPlacement.minutes}'` : ''} {chartPlacement.sign}</span>
                  {chartPlacement.retrograde && <span className="text-amber-500 ml-1">℞ Retrograde</span>}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Not in your chart yet.{' '}
                  {onNavigateToChartLibrary ? (
                    <button onClick={() => { onClose(); onNavigateToChartLibrary(); }} className="text-primary hover:underline inline-flex items-center gap-1">
                      Add it in Chart Library <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <span>You can add this placement in your Chart Library.</span>
                  )}
                </p>
              </div>
            )}

            {/* Quick identifiers */}
            <div className="flex flex-wrap gap-2">
              <Badge className={cs.badge}>{MYTHOLOGY_CATEGORIES[entry.category as MythologyCategory]?.label}</Badge>
              <Badge variant="outline">{entry.greekName}</Badge>
              {entry.romanName !== 'N/A' && <Badge variant="outline">{entry.romanName}</Badge>}
              {entry.otherNames?.map(n => <Badge key={n} variant="outline" className="text-xs">{n}</Badge>)}
            </div>

            {/* Tagline */}
            <p className="italic text-primary text-sm border-l-2 border-primary/30 pl-3">{entry.tagline}</p>

            {/* The Myth */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                The Myth
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{entry.myth}</p>
            </div>

            {/* Symbolism */}
            <div className="rounded border border-border p-4">
              <h4 className="font-medium mb-2">Symbolism</h4>
              <ul className="space-y-2">
                {entry.symbolism.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">◆</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Psychological Function */}
            <div className="rounded border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-medium text-primary mb-2">Psychological Function</h4>
              <p className="text-sm">{entry.psychologicalFunction}</p>
            </div>

            {/* Shadow & Gift */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded border border-amber-500/20 bg-amber-500/5 p-4">
                <h4 className="font-medium text-amber-600 mb-2 text-sm">Shadow Expression</h4>
                <p className="text-xs text-muted-foreground">{entry.shadowExpression}</p>
              </div>
              <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-4">
                <h4 className="font-medium text-emerald-600 mb-2 text-sm">Gift Expression</h4>
                <p className="text-xs text-muted-foreground">{entry.giftExpression}</p>
              </div>
            </div>

            {/* Rulership */}
            <div className="rounded border border-border p-4">
              <h4 className="font-medium mb-2">Rulership & Keywords</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">Rules:</span> {entry.rulesSign.join(', ')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.keywords.map(k => (
                  <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                ))}
              </div>
            </div>

            {/* Correspondences */}
            <div className="rounded border border-border p-4">
              <h4 className="font-medium mb-3">Correspondences</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {entry.dayOfWeek && (
                  <div><span className="font-medium text-foreground">Day:</span> {entry.dayOfWeek}</div>
                )}
                {entry.metals && (
                  <div><span className="font-medium text-foreground">Metal:</span> {entry.metals.join(', ')}</div>
                )}
                {entry.colors && (
                  <div><span className="font-medium text-foreground">Colors:</span> {entry.colors.join(', ')}</div>
                )}
                {entry.animals && (
                  <div><span className="font-medium text-foreground">Animals:</span> {entry.animals.join(', ')}</div>
                )}
                {entry.bodyParts && (
                  <div><span className="font-medium text-foreground">Body:</span> {entry.bodyParts.join(', ')}</div>
                )}
                {entry.tarotCorrespondence && (
                  <div><span className="font-medium text-foreground">Tarot:</span> {entry.tarotCorrespondence}</div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function MythologyEncyclopediaExplorer({ userNatalChart, savedCharts, onNavigateToChartLibrary }: MythologyEncyclopediaExplorerProps) {
  const [selected, setSelected] = useState<MythologyEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'dropdown' | 'grid'>('dropdown');

  // Sort alphabetically, starred (in chart) first
  const sortedEntries = useMemo(() => {
    const all = [...PLANETARY_MYTHOLOGY];
    const inChart = new Set<string>();
    if (userNatalChart?.planets) {
      for (const entry of all) {
        if (getChartPlacement(entry.name, userNatalChart)) {
          inChart.add(entry.name);
        }
      }
    }
    all.sort((a, b) => {
      const aIn = inChart.has(a.name) ? 0 : 1;
      const bIn = inChart.has(b.name) ? 0 : 1;
      if (aIn !== bIn) return aIn - bIn;
      return a.name.localeCompare(b.name);
    });
    return { entries: all, inChart };
  }, [userNatalChart]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return sortedEntries.entries;
    const q = searchQuery.toLowerCase();
    return sortedEntries.entries.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.archetype.toLowerCase().includes(q) ||
      e.keywords.some(k => k.toLowerCase().includes(q)) ||
      e.greekName.toLowerCase().includes(q) ||
      e.romanName.toLowerCase().includes(q)
    );
  }, [sortedEntries.entries, searchQuery]);

  const categoryOrder: MythologyCategory[] = ['luminary', 'personal', 'social', 'transpersonal', 'centaur', 'asteroid', 'point'];

  const selectedPlacement = selected ? getChartPlacement(selected.name, userNatalChart) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg">Mythology & Archetypes</h3>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, archetype, or keyword..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('dropdown')}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${viewMode === 'dropdown' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          A–Z List
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          By Category
        </button>
        <span className="text-xs text-muted-foreground ml-auto self-center">
          {PLANETARY_MYTHOLOGY.length} bodies · {sortedEntries.inChart.size} in your chart
        </span>
      </div>

      {/* A-Z List view */}
      {viewMode === 'dropdown' && (
        <div className="space-y-1">
          {filteredEntries.map(entry => {
            const isInChart = sortedEntries.inChart.has(entry.name);
            const placement = getChartPlacement(entry.name, userNatalChart);
            const cs = CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.personal;
            return (
              <button
                key={entry.name}
                onClick={() => setSelected(entry)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-all hover:shadow-sm text-left ${cs.bg} ${cs.border} hover:scale-[1.01]`}
              >
                {isInChart && <Star className="h-3.5 w-3.5 fill-primary text-primary flex-shrink-0" />}
                <span className="text-xl flex-shrink-0 w-8 text-center">{entry.symbol}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${cs.text}`}>{entry.name}</span>
                    <span className="text-xs text-muted-foreground truncate">— {entry.archetype}</span>
                  </div>
                  {placement && (
                    <p className="text-xs text-primary mt-0.5">
                      {placement.degree}°{placement.minutes ? `${placement.minutes}'` : ''} {placement.sign}
                      {placement.retrograde && ' ℞'}
                    </p>
                  )}
                </div>
                <Badge className={`${cs.badge} text-[10px] flex-shrink-0`}>
                  {MYTHOLOGY_CATEGORIES[entry.category as MythologyCategory]?.label?.split(' ')[0]}
                </Badge>
              </button>
            );
          })}
          {filteredEntries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No bodies match "{searchQuery}"</p>
          )}
        </div>
      )}

      {/* Category grid view */}
      {viewMode === 'grid' && (
        <>
          {categoryOrder.map(cat => {
            const meta = MYTHOLOGY_CATEGORIES[cat];
            const entries = filteredEntries.filter(e => e.category === cat);
            if (entries.length === 0) return null;

            return (
              <div key={cat}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                  <span>{meta.icon}</span>
                  {meta.label}
                  <span className="font-normal normal-case tracking-normal">— {meta.description}</span>
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {entries.map(entry => {
                    const cs = CATEGORY_STYLES[cat] || CATEGORY_STYLES.personal;
                    const isInChart = sortedEntries.inChart.has(entry.name);
                    return (
                      <button
                        key={entry.name}
                        onClick={() => setSelected(entry)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105 cursor-pointer ${cs.bg} ${cs.border} hover:shadow-md relative`}
                      >
                        {isInChart && <Star className="h-3 w-3 fill-primary text-primary absolute -top-1 -right-1" />}
                        <span className="text-2xl">{entry.symbol}</span>
                        <div className="text-left">
                          <p className={`text-sm font-medium ${cs.text}`}>{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.archetype}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      <MythDetailModal
        entry={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        chartPlacement={selectedPlacement}
        onNavigateToChartLibrary={onNavigateToChartLibrary}
      />
    </div>
  );
}

export default MythologyEncyclopediaExplorer;
