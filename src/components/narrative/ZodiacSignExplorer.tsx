import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ZODIAC_SIGNS_DATA, ELEMENT_COLORS, ZodiacSignData } from '@/lib/zodiacSignEncyclopedia';

function SignDetailModal({ sign, open, onClose }: { sign: ZodiacSignData | null; open: boolean; onClose: () => void }) {
  if (!sign) return null;
  const ec = ELEMENT_COLORS[sign.element];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-3xl">{sign.symbol}</span>
            <span>{sign.name}</span>
            <span className="text-sm text-muted-foreground font-normal">({sign.animal})</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-5">
            {/* Quick badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ec.badge}`}>
                {sign.element}
              </span>
              <Badge variant="outline">{sign.modality}</Badge>
              <Badge variant="outline">{sign.polarity} · {sign.polarityLabels.join(' / ')}</Badge>
              <Badge variant="outline">{sign.planetSymbol} {sign.rulingPlanet}</Badge>
            </div>

            {/* Mantra */}
            <div className="text-center py-3">
              <p className="text-lg font-serif italic text-primary">"{sign.mantra}"</p>
            </div>

            {/* Mnemonic */}
            <div className={`p-4 rounded-lg border ${ec.border} ${ec.bg}`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">🧠 Memory Device</p>
              <p className="text-sm font-medium">{sign.mnemonic}</p>
            </div>

            {/* Affirmation & Shadow */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ AFFIRMATION</p>
                <p className="text-xs">{sign.affirmation}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ SHADOW MINDSET</p>
                <p className="text-xs">{sign.shadowMindset}</p>
              </div>
            </div>

            {/* Keywords — High Road & Low Road */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Keywords</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2">✦ HIGH ROAD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(sign.highRoadKeywords || []).map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{kw}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2">⚠ LOW ROAD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(sign.lowRoadKeywords || []).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-destructive/30">{kw}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Essence */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Essence</h4>
              {sign.essence.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>

            {/* Body region */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium mb-1">🫀 Body Region</p>
              <p className="text-sm">{sign.bodyRegion}</p>
            </div>

            {/* Needs */}
            <div>
              <p className="text-xs font-medium mb-2">Core Needs</p>
              <div className="flex flex-wrap gap-1.5">
                {sign.needs.map((n, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{n}</Badge>
                ))}
              </div>
            </div>

            {/* Creative Expression */}
            <div>
              <p className="text-xs font-medium mb-1">🎨 Creative Expression</p>
              <p className="text-sm text-muted-foreground">{sign.creativeExpression}</p>
            </div>

            {/* Superpower & Areas to work on */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚡ SUPERPOWER</p>
                <p className="text-xs">{sign.superpower}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">🌱 AREAS TO GROW</p>
                <ul className="text-xs space-y-0.5">
                  {sign.areasToWorkOn.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function ZodiacSignExplorer() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSignData | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <span>✦</span> Zodiac Sign Encyclopedia
      </h3>
      <p className="text-xs text-muted-foreground">Click any sign to explore its full profile — essence, body, shadow, and memory device.</p>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {ZODIAC_SIGNS_DATA.map(sign => {
          const ec = ELEMENT_COLORS[sign.element];
          return (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign)}
              className={`p-3 rounded-lg border ${ec.border} ${ec.bg} hover:shadow-md transition-all text-center cursor-pointer group`}
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">{sign.symbol}</span>
              <span className="text-xs font-medium block mt-1">{sign.name}</span>
              <span className={`text-[10px] block ${ec.text}`}>{sign.element}</span>
              <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                {sign.keywords.slice(0, 2).map((kw, i) => (
                  <span key={i} className="text-[8px] text-muted-foreground">{kw}{i === 0 ? ' ·' : ''}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <SignDetailModal
        sign={selectedSign}
        open={!!selectedSign}
        onClose={() => setSelectedSign(null)}
      />
    </div>
  );
}
