import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PLANET_ENCYCLOPEDIA, PLANET_CATEGORIES, PlanetEncyclopediaData } from '@/lib/planetEncyclopedia';
import { NatalChart } from '@/hooks/useNatalChart';

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  personal: { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary', badge: 'bg-primary/10 text-primary' },
  social: { bg: 'bg-accent/30', border: 'border-accent', text: 'text-foreground', badge: 'bg-accent text-accent-foreground' },
  transpersonal: { bg: 'bg-secondary/50', border: 'border-secondary', text: 'text-foreground', badge: 'bg-secondary text-secondary-foreground' },
  point: { bg: 'bg-muted/50', border: 'border-border', text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
  asteroid: { bg: 'bg-primary/5', border: 'border-primary/15', text: 'text-primary', badge: 'bg-primary/10 text-primary' },
};

function PlanetDetailModal({ planet, open, onClose, chart, onNavigateToView }: { planet: PlanetEncyclopediaData | null; open: boolean; onClose: () => void; chart: NatalChart | null; onNavigateToView?: (view: string) => void }) {
  if (!planet) return null;
  const cs = CATEGORY_STYLES[planet.category] || CATEGORY_STYLES.personal;

  // Find planet in user's chart
  const userPlacement = chart?.planets?.[planet.name as keyof typeof chart.planets];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-3xl">{planet.symbol}</span>
            <div>
              <span>{planet.name}</span>
              <span className="text-sm text-muted-foreground font-normal ml-2">— {planet.nickname}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-5">
            {/* Quick badges */}
            <div className="flex flex-wrap gap-2">
              {planet.ruledSigns.map(s => (
                <Badge key={s} variant="outline" className="text-xs">Rules {s}</Badge>
              ))}
              {planet.ruledHouses.map(h => (
                <Badge key={h} variant="outline" className="text-xs">House {h}</Badge>
              ))}
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cs.badge}`}>
                {planet.category === 'personal' ? 'Personal' : planet.category === 'social' ? 'Social' : planet.category === 'transpersonal' ? 'Transpersonal' : planet.category === 'point' ? 'Special Point' : 'Goddess Asteroid'}
              </span>
            </div>

            {/* Quick reference grid */}
            <div className="grid grid-cols-2 gap-2">
              {planet.bodyParts.length > 0 && (
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">🫀 BODY</p>
                  <p className="text-xs">{planet.bodyParts.join(', ')}</p>
                </div>
              )}
              {planet.color && (
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">🎨 COLOR</p>
                  <p className="text-xs">{planet.color}</p>
                </div>
              )}
              {planet.crystal && (
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">💎 CRYSTAL</p>
                  <p className="text-xs">{planet.crystal}</p>
                </div>
              )}
              {planet.day && (
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">📅 DAY</p>
                  <p className="text-xs">{planet.day}</p>
                </div>
              )}
              {planet.metal && (
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">⚙️ METAL</p>
                  <p className="text-xs">{planet.metal}</p>
                </div>
              )}
            </div>

            {/* What it rules */}
            <div>
              <p className="text-xs font-medium mb-2">What {planet.symbol} Rules</p>
              <div className="flex flex-wrap gap-1.5">
                {planet.whatItRules.map((r, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px]">{r}</Badge>
                ))}
              </div>
            </div>

            {/* High Road / Low Road Keywords */}
            {((planet.highRoad?.length ?? 0) > 0 || (planet.lowRoad?.length ?? 0) > 0) && (
              <div className="grid grid-cols-2 gap-3">
                {(planet.highRoad?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground mb-1.5">✦ HIGH ROAD</p>
                    <div className="flex flex-wrap gap-1">
                      {planet.highRoad.map((k, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-primary/30 bg-primary/5 text-primary">{k}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(planet.lowRoad?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground mb-1.5">⚠ LOW ROAD</p>
                    <div className="flex flex-wrap gap-1">
                      {planet.lowRoad.map((k, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-destructive/30 bg-destructive/5 text-destructive">{k}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orbit / Astronomy */}
            <div className={`p-4 rounded-lg border ${cs.border} ${cs.bg}`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">🔭 Astronomy</p>
              <p className="text-sm leading-relaxed">{planet.orbitInfo}</p>
            </div>

            {/* Mythology */}
            <div>
              <p className="text-xs font-medium mb-1">📜 Mythology</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{planet.mythology}</p>
            </div>

            {/* Gift & Shadow */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ GIFT</p>
                <p className="text-xs leading-relaxed">{planet.gift}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ SHADOW</p>
                <p className="text-xs leading-relaxed">{planet.shadow}</p>
              </div>
            </div>

            {/* Careers */}
            {planet.careers.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">💼 Careers & Callings</p>
                <div className="flex flex-wrap gap-1.5">
                  {planet.careers.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Deep Teaching */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">The Deeper Teaching</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{planet.teaching}</p>
            </div>

            {/* How to Read */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-2">📖 How to Read {planet.symbol} in Your Chart</p>
              <p className="text-sm leading-relaxed">{planet.howToRead}</p>
            </div>

            {/* Personalized placement + Navigate */}
            {userPlacement && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <p className="text-[10px] font-medium text-muted-foreground">⭐ YOUR {planet.symbol} {planet.name.toUpperCase()}</p>
                <p className="text-sm">
                  Your <strong>{planet.name}</strong> is in <strong>{userPlacement.sign}</strong> at {Math.round(userPlacement.degree)}°
                  {userPlacement.isRetrograde ? ' ℞ (retrograde)' : ''}.
                </p>
                {onNavigateToView && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      onClose();
                      onNavigateToView('decoder');
                    }}
                  >
                    Show it to me — Full {planet.name} Reading
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {!userPlacement && onNavigateToView && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Add a chart to see your personal {planet.name} placement and get a full reading.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    onClose();
                    onNavigateToView('charts');
                  }}
                >
                  Go to Charts
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function PlanetEncyclopediaExplorer({ chart, onNavigateToView }: { chart?: NatalChart | null; onNavigateToView?: (view: string) => void }) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetEncyclopediaData | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <span>☿</span> Planet & Point Encyclopedia
      </h3>
      <p className="text-xs text-muted-foreground">Click any planet to explore its full profile — mythology, body, career, teaching, and how to read it in your chart.</p>

      {PLANET_CATEGORIES.map(cat => {
        const planets = PLANET_ENCYCLOPEDIA.filter(p => p.category === cat.key);
        const cs = CATEGORY_STYLES[cat.key] || CATEGORY_STYLES.personal;
        
        return (
          <div key={cat.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{cat.label}</h4>
              <span className="text-[10px] text-muted-foreground">— {cat.description}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {planets.map(planet => {
                const placement = chart?.planets?.[planet.name as keyof typeof chart.planets];
                return (
                  <button
                    key={planet.name}
                    onClick={() => setSelectedPlanet(planet)}
                    className={`p-3 rounded-lg border ${cs.border} ${cs.bg} hover:shadow-md transition-all text-center cursor-pointer group`}
                  >
                    <span className="text-2xl block group-hover:scale-110 transition-transform">{planet.symbol}</span>
                    <span className="text-xs font-medium block mt-1">{planet.name}</span>
                    {placement ? (
                      <span className="text-[10px] text-primary block">{placement.sign} {Math.round(placement.degree)}°</span>
                    ) : (
                      <span className={`text-[10px] block ${cs.text}`}>{planet.nickname}</span>
                    )}
                    <div className="mt-1">
                      {planet.ruledSigns.length > 0 && (
                        <span className="text-[8px] text-muted-foreground">{planet.ruledSigns[0]}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <PlanetDetailModal
        planet={selectedPlanet}
        open={!!selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        chart={chart || null}
        onNavigateToView={onNavigateToView}
      />
    </div>
  );
}
