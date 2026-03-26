import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import {
  PLANETARY_MYTHOLOGY,
  MYTHOLOGY_CATEGORIES,
  MythologyEntry,
  MythologyCategory,
} from '@/lib/planetaryMythology';

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  luminary:       { bg: 'bg-primary/5',     border: 'border-primary/20',  text: 'text-primary',           badge: 'bg-primary/10 text-primary' },
  personal:       { bg: 'bg-accent/30',     border: 'border-accent',      text: 'text-foreground',        badge: 'bg-accent text-accent-foreground' },
  social:         { bg: 'bg-secondary/50',  border: 'border-secondary',   text: 'text-foreground',        badge: 'bg-secondary text-secondary-foreground' },
  transpersonal:  { bg: 'bg-muted/50',      border: 'border-border',      text: 'text-muted-foreground',  badge: 'bg-muted text-muted-foreground' },
  centaur:        { bg: 'bg-primary/5',     border: 'border-primary/15',  text: 'text-primary',           badge: 'bg-primary/10 text-primary' },
  asteroid:       { bg: 'bg-accent/20',     border: 'border-accent/50',   text: 'text-foreground',        badge: 'bg-accent/30 text-accent-foreground' },
  point:          { bg: 'bg-secondary/30',  border: 'border-border',      text: 'text-muted-foreground',  badge: 'bg-secondary text-secondary-foreground' },
};

function MythDetailModal({ entry, open, onClose }: { entry: MythologyEntry | null; open: boolean; onClose: () => void }) {
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

export function MythologyEncyclopediaExplorer() {
  const [selected, setSelected] = useState<MythologyEntry | null>(null);

  const categoryOrder: MythologyCategory[] = ['luminary', 'personal', 'social', 'transpersonal', 'centaur', 'asteroid', 'point'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg">Mythology & Archetypes</h3>
        <span className="text-xs text-muted-foreground ml-auto">Tap any body to explore its myth</span>
      </div>

      {categoryOrder.map(cat => {
        const meta = MYTHOLOGY_CATEGORIES[cat];
        const entries = PLANETARY_MYTHOLOGY.filter(e => e.category === cat);
        if (entries.length === 0) return null;
        const cs = CATEGORY_STYLES[cat] || CATEGORY_STYLES.personal;

        return (
          <div key={cat}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <span>{meta.icon}</span>
              {meta.label}
              <span className="font-normal normal-case tracking-normal">— {meta.description}</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {entries.map(entry => (
                <button
                  key={entry.name}
                  onClick={() => setSelected(entry)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105 cursor-pointer ${cs.bg} ${cs.border} hover:shadow-md`}
                >
                  <span className="text-2xl">{entry.symbol}</span>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${cs.text}`}>{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.archetype}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <MythDetailModal entry={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
