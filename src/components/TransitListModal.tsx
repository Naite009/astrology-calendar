import { X } from 'lucide-react';
import { TransitAspect, getTransitPlanetSymbol } from '@/lib/transitAspects';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Planet weight for sorting (higher = more impactful when transiting)
const TRANSIT_WEIGHT: Record<string, number> = {
  Pluto: 100,
  Neptune: 95,
  Uranus: 90,
  Saturn: 85,
  Jupiter: 80,
  Chiron: 60,
  Mars: 50,
  Venus: 40,
  Mercury: 30,
  Sun: 25,
  Moon: 20,
  // Dwarf planets and asteroids
  Eris: 55,
  Sedna: 54,
  Makemake: 53,
  Haumea: 52,
  Quaoar: 51,
  Orcus: 50,
  Pholus: 45,
  Nessus: 44,
  Ixion: 43,
  Varuna: 42,
};

// Natal point weight (higher = more personal/felt)
const NATAL_WEIGHT: Record<string, number> = {
  Sun: 100,
  Moon: 95,
  Ascendant: 90,
  MC: 85,
  Mercury: 80,
  Venus: 75,
  Mars: 70,
  IC: 65,
  Descendant: 60,
  Jupiter: 50,
  Saturn: 45,
  Chiron: 40,
  Uranus: 30,
  Neptune: 25,
  Pluto: 20,
  NorthNode: 35,
  SouthNode: 34,
  // Dwarf planets
  Eris: 15,
  Sedna: 14,
  Makemake: 13,
  Haumea: 12,
  Quaoar: 11,
  Orcus: 10,
  Pholus: 9,
  Nessus: 8,
};

// Aspect strength (tighter aspects are more noticeable)
const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 100,
  opposition: 90,
  square: 85,
  trine: 70,
  sextile: 60,
  quincunx: 40,
  semisextile: 30,
};

interface TransitListModalProps {
  isOpen: boolean;
  onClose: () => void;
  transits: TransitAspect[];
  chartName: string;
  onTransitClick: (index: number) => void;
}

// Calculate impact score for sorting
const calculateImpactScore = (transit: TransitAspect): number => {
  const transitWeight = TRANSIT_WEIGHT[transit.transitPlanet] || 20;
  const natalWeight = NATAL_WEIGHT[transit.natalPlanet] || 10;
  const aspectWeight = ASPECT_WEIGHT[transit.aspect.toLowerCase()] || 50;
  const orbPenalty = parseFloat(String(transit.orb)) * 10; // Closer orb = higher score
  
  // Formula: (transit importance × natal sensitivity × aspect strength) / orb penalty
  // Outer planet to personal point with tight orb = highest score
  return ((transitWeight * natalWeight * aspectWeight) / 1000) - orbPenalty + (transit.isExact ? 50 : 0);
};

// Get full planet name
const getPlanetFullName = (planet: string): string => {
  const names: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
    chiron: 'Chiron', lilith: 'Black Moon Lilith', northnode: 'North Node', southnode: 'South Node',
    ascendant: 'Ascendant', midheaven: 'Midheaven', mc: 'MC', ic: 'IC', descendant: 'Descendant',
    eris: 'Eris', sedna: 'Sedna', makemake: 'Makemake', haumea: 'Haumea', quaoar: 'Quaoar',
    orcus: 'Orcus', ixion: 'Ixion', varuna: 'Varuna', pholus: 'Pholus', nessus: 'Nessus',
    ceres: 'Ceres', pallas: 'Pallas', juno: 'Juno', vesta: 'Vesta',
  };
  return names[planet.toLowerCase()] || planet;
};

// Get aspect description
const getAspectMeaning = (aspect: string): string => {
  const meanings: Record<string, string> = {
    conjunction: 'fusion, intensity',
    opposition: 'awareness, tension',
    trine: 'ease, flow',
    square: 'friction, growth',
    sextile: 'opportunity',
    quincunx: 'adjustment',
    semisextile: 'subtle connection',
  };
  return meanings[aspect.toLowerCase()] || '';
};

// Get impact level label
const getImpactLabel = (score: number): { label: string; color: string } => {
  if (score > 400) return { label: 'VERY HIGH', color: 'text-red-600 dark:text-red-400' };
  if (score > 250) return { label: 'HIGH', color: 'text-orange-600 dark:text-orange-400' };
  if (score > 150) return { label: 'MODERATE', color: 'text-yellow-600 dark:text-yellow-400' };
  if (score > 80) return { label: 'MILD', color: 'text-blue-600 dark:text-blue-400' };
  return { label: 'SUBTLE', color: 'text-muted-foreground' };
};

export const TransitListModal = ({ 
  isOpen, 
  onClose, 
  transits, 
  chartName,
  onTransitClick 
}: TransitListModalProps) => {
  // Sort by impact score (highest first)
  const sortedTransits = [...transits]
    .map((t, originalIndex) => ({ 
      transit: t, 
      originalIndex,
      score: calculateImpactScore(t) 
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-lg font-serif">
            {chartName}'s Transits Today
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Sorted by impact • Outer planets → Personal points • Tightest orbs first
          </p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {sortedTransits.map(({ transit, originalIndex, score }, i) => {
              const impact = getImpactLabel(score);
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    onTransitClick(originalIndex);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-muted/50 rounded-md transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Transit symbols and aspect */}
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-lg"
                        style={{ color: transit.color }}
                      >
                        {getTransitPlanetSymbol(transit.transitPlanet)}
                        {transit.symbol}
                        {getTransitPlanetSymbol(transit.natalPlanet)}
                      </span>
                      
                      {transit.isExact && (
                        <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                          EXACT
                        </span>
                      )}
                    </div>
                    
                    {/* Impact level */}
                    <span className={`text-[9px] font-bold ${impact.color}`}>
                      {impact.label}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div className="mt-1">
                    <span className="text-sm text-foreground">
                      {getPlanetFullName(transit.transitPlanet)} {transit.aspect.toLowerCase()} {getPlanetFullName(transit.natalPlanet)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({transit.orb}° orb)
                    </span>
                  </div>
                  
                  {/* Brief meaning */}
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {getAspectMeaning(transit.aspect)} • {transit.transitSign} → {transit.natalSign}
                    {transit.transitHouse && ` • ${transit.transitHouse}H→${transit.natalHouse}H`}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground">
            Click any transit to jump to its full interpretation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
