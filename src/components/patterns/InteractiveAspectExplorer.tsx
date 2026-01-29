import { useState, useMemo } from 'react';
import { X, Info, Zap, Gift, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  getPlanetaryPositions, 
  getPlanetSymbol,
  PlanetaryPositions 
} from '@/lib/astrology';
import { ASPECT_INTERPRETATIONS, AspectInterpretation } from '@/lib/aspectInterpretations';

// Planet pairs for aspect checking
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const PLANET_KEYS: (keyof PlanetaryPositions)[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

interface AspectData {
  planet1: string;
  planet2: string;
  planet1Symbol: string;
  planet2Symbol: string;
  planet1Position: { degree: number; sign: string; signName: string };
  planet2Position: { degree: number; sign: string; signName: string };
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  isApplying: boolean;
  interpretation: AspectInterpretation;
}

interface InteractiveAspectExplorerProps {
  date?: Date;
}

// Calculate aspect between two positions
const calculateAspect = (
  deg1: number,
  sign1: string,
  deg2: number,
  sign2: string
): { type: string; symbol: string; orb: number } | null => {
  // Convert to absolute degrees
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const abs1 = signs.indexOf(sign1) * 30 + deg1;
  const abs2 = signs.indexOf(sign2) * 30 + deg2;
  
  let diff = Math.abs(abs1 - abs2);
  if (diff > 180) diff = 360 - diff;
  
  // Define aspects with orbs
  const aspects = [
    { name: 'conjunction', symbol: '☌', angle: 0, orb: 10 },
    { name: 'opposition', symbol: '☍', angle: 180, orb: 10 },
    { name: 'trine', symbol: '△', angle: 120, orb: 8 },
    { name: 'square', symbol: '□', angle: 90, orb: 8 },
    { name: 'sextile', symbol: '⚹', angle: 60, orb: 6 },
    { name: 'quincunx', symbol: '⚻', angle: 150, orb: 5 },
    { name: 'semisextile', symbol: '⚺', angle: 30, orb: 3 },
    { name: 'sesquisquare', symbol: '⚼', angle: 135, orb: 3 },
    { name: 'semisquare', symbol: '∠', angle: 45, orb: 3 },
    { name: 'quintile', symbol: 'Q', angle: 72, orb: 2 },
  ];
  
  for (const aspect of aspects) {
    const aspectOrb = Math.abs(diff - aspect.angle);
    if (aspectOrb <= aspect.orb) {
      return { type: aspect.name, symbol: aspect.symbol, orb: Math.round(aspectOrb * 10) / 10 };
    }
  }
  
  return null;
};

// Get all current aspects
const getAllAspects = (positions: PlanetaryPositions): AspectData[] => {
  const aspects: AspectData[] = [];
  
  for (let i = 0; i < PLANET_KEYS.length; i++) {
    for (let j = i + 1; j < PLANET_KEYS.length; j++) {
      const p1 = positions[PLANET_KEYS[i]];
      const p2 = positions[PLANET_KEYS[j]];
      
      if (!p1 || !p2) continue;
      
      const aspect = calculateAspect(p1.degree, p1.signName, p2.degree, p2.signName);
      
      if (aspect) {
        const interpretation = ASPECT_INTERPRETATIONS[aspect.type];
        if (interpretation) {
          aspects.push({
            planet1: PLANETS[i],
            planet2: PLANETS[j],
            planet1Symbol: getPlanetSymbol(PLANET_KEYS[i]),
            planet2Symbol: getPlanetSymbol(PLANET_KEYS[j]),
            planet1Position: { degree: p1.degree, sign: p1.sign, signName: p1.signName },
            planet2Position: { degree: p2.degree, sign: p2.sign, signName: p2.signName },
            aspectType: aspect.type,
            aspectSymbol: aspect.symbol,
            orb: aspect.orb,
            isApplying: false, // Simplified - would need ephemeris for true calculation
            interpretation,
          });
        }
      }
    }
  }
  
  // Sort by orb (tighter aspects first)
  return aspects.sort((a, b) => a.orb - b.orb);
};

// Get aspect color class
const getAspectColor = (type: string): string => {
  switch (type) {
    case 'conjunction': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'opposition': return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30';
    case 'trine': return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
    case 'square': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
    case 'sextile': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'quincunx': return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

// Get nature badge
const getAspectNature = (type: string): { label: string; color: string } => {
  switch (type) {
    case 'trine':
    case 'sextile':
      return { label: 'Harmonious', color: 'bg-green-500/20 text-green-700 dark:text-green-300' };
    case 'square':
    case 'opposition':
      return { label: 'Challenging', color: 'bg-red-500/20 text-red-700 dark:text-red-300' };
    case 'conjunction':
      return { label: 'Intense', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300' };
    case 'quincunx':
      return { label: 'Adjusting', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' };
    default:
      return { label: 'Minor', color: 'bg-muted text-muted-foreground' };
  }
};

export const InteractiveAspectExplorer = ({ date = new Date() }: InteractiveAspectExplorerProps) => {
  const [selectedAspect, setSelectedAspect] = useState<AspectData | null>(null);
  const [showMinorAspects, setShowMinorAspects] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('major');
  
  const positions = useMemo(() => getPlanetaryPositions(date), [date]);
  const allAspects = useMemo(() => getAllAspects(positions), [positions]);
  
  // Categorize aspects
  const categorizedAspects = useMemo(() => {
    const major = allAspects.filter(a => 
      ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.aspectType)
    );
    const minor = allAspects.filter(a => 
      ['quincunx', 'semisextile', 'sesquisquare', 'semisquare', 'quintile'].includes(a.aspectType)
    );
    
    return { major, minor };
  }, [allAspects]);

  const handleAspectClick = (aspect: AspectData) => {
    setSelectedAspect(aspect);
  };

  const renderAspectCard = (aspect: AspectData) => {
    const nature = getAspectNature(aspect.aspectType);
    
    return (
      <button
        key={`${aspect.planet1}-${aspect.planet2}-${aspect.aspectType}`}
        onClick={() => handleAspectClick(aspect)}
        className={`p-3 rounded-lg border ${getAspectColor(aspect.aspectType)} hover:scale-[1.02] transition-all cursor-pointer text-left w-full group`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{aspect.planet1Symbol}</span>
            <span className="text-xl font-semibold">{aspect.aspectSymbol}</span>
            <span className="text-2xl">{aspect.planet2Symbol}</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {aspect.orb}° orb
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{aspect.planet1}</span>
          <span className="text-muted-foreground text-xs">{aspect.aspectType}</span>
          <span className="font-medium text-sm">{aspect.planet2}</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {aspect.planet1Position.degree}° {aspect.planet1Position.signName} — {aspect.planet2Position.degree}° {aspect.planet2Position.signName}
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <Badge className={`text-[10px] ${nature.color}`}>{nature.label}</Badge>
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Click for details →
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="text-primary" size={24} />
          <h3 className="font-serif text-xl">Interactive Aspect Explorer</h3>
        </div>
        <Badge variant="outline">
          {allAspects.length} aspects active
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Click any aspect to explore its meaning. Tighter orbs (closer to exact) are more powerful.
      </p>

      {/* Major Aspects */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setExpandedCategory(expandedCategory === 'major' ? null : 'major')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Major Aspects ({categorizedAspects.major.length})
            </CardTitle>
            {expandedCategory === 'major' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </CardHeader>
        {expandedCategory === 'major' && (
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categorizedAspects.major.map(renderAspectCard)}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Minor Aspects */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setExpandedCategory(expandedCategory === 'minor' ? null : 'minor')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Minor Aspects ({categorizedAspects.minor.length})
              <span className="text-xs text-muted-foreground font-normal">subtle influences</span>
            </CardTitle>
            {expandedCategory === 'minor' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </CardHeader>
        {expandedCategory === 'minor' && (
          <CardContent>
            {categorizedAspects.minor.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorizedAspects.minor.map(renderAspectCard)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No minor aspects active within orb.
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Aspect Detail Modal */}
      <Dialog open={!!selectedAspect} onOpenChange={() => setSelectedAspect(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedAspect && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <span>{selectedAspect.planet1Symbol}</span>
                  <span className="text-primary">{selectedAspect.aspectSymbol}</span>
                  <span>{selectedAspect.planet2Symbol}</span>
                </DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{selectedAspect.planet1} {selectedAspect.aspectType} {selectedAspect.planet2}</span>
                  <Badge variant="outline">{selectedAspect.orb}° orb</Badge>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {/* Positions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary rounded-lg text-center">
                    <div className="text-2xl mb-1">{selectedAspect.planet1Symbol}</div>
                    <div className="font-medium">{selectedAspect.planet1}</div>
                    <div className="text-sm text-primary">
                      {selectedAspect.planet1Position.degree}° {selectedAspect.planet1Position.signName}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg text-center">
                    <div className="text-2xl mb-1">{selectedAspect.planet2Symbol}</div>
                    <div className="font-medium">{selectedAspect.planet2}</div>
                    <div className="text-sm text-primary">
                      {selectedAspect.planet2Position.degree}° {selectedAspect.planet2Position.signName}
                    </div>
                  </div>
                </div>

                {/* Keyword */}
                <div className="text-center">
                  <Badge className={`text-lg px-4 py-1 ${getAspectColor(selectedAspect.aspectType)}`}>
                    {selectedAspect.interpretation.keyword}
                  </Badge>
                </div>

                {/* How it Feels */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info size={16} className="text-primary" />
                    How This Feels
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed pl-6">
                    {selectedAspect.interpretation.feeling}
                  </p>
                </div>

                {/* How it Manifests */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap size={16} className="text-primary" />
                    How It Manifests
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed pl-6">
                    {selectedAspect.interpretation.manifestation}
                  </p>
                </div>

                {/* Challenge */}
                {selectedAspect.interpretation.challenge && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle size={16} className="text-destructive" />
                      Challenge
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed pl-6">
                      {selectedAspect.interpretation.challenge}
                    </p>
                  </div>
                )}

                {/* Gift */}
                {selectedAspect.interpretation.gift && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Gift size={16} className="text-primary" />
                      Gift
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed pl-6">
                      {selectedAspect.interpretation.gift}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
