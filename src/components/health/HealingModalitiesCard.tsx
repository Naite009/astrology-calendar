import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame, Leaf, Wind, Droplets } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";
import { ELEMENT_HEALING_MODALITIES, PLANETARY_HEALTH_RULERS, getDominantElement } from "@/lib/healthAstrology";

interface HealingModalitiesCardProps {
  natalChart: NatalChart;
}

export const HealingModalitiesCard = ({ natalChart }: HealingModalitiesCardProps) => {
  const { planets } = natalChart;
  const dominantElement = getDominantElement(planets);

  // Find strongest planets (simplified: check if in own sign or exaltation)
  const getStrongPlanets = (): string[] => {
    const strong: string[] = [];
    const ownSigns: Record<string, string[]> = {
      Sun: ['Leo'],
      Moon: ['Cancer'],
      Mercury: ['Gemini', 'Virgo'],
      Venus: ['Taurus', 'Libra'],
      Mars: ['Aries', 'Scorpio'],
      Jupiter: ['Sagittarius', 'Pisces'],
      Saturn: ['Capricorn', 'Aquarius']
    };

    Object.entries(ownSigns).forEach(([planet, signs]) => {
      if (planets[planet]?.sign && signs.includes(planets[planet].sign)) {
        strong.push(planet);
      }
    });

    return strong.length > 0 ? strong : ['Sun', 'Moon']; // Default to luminaries
  };

  const strongPlanets = getStrongPlanets();

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="h-5 w-5 text-orange-500" />;
      case 'Earth': return <Leaf className="h-5 w-5 text-green-500" />;
      case 'Air': return <Wind className="h-5 w-5 text-blue-400" />;
      case 'Water': return <Droplets className="h-5 w-5 text-blue-600" />;
      default: return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const planetaryModalities: Record<string, string[]> = {
    Sun: ['Vitality practices', 'Sunlight therapy', 'Heart-opening work', 'Leadership in health groups'],
    Moon: ['Nurturing practices', 'Emotional release', 'Water therapies', 'Cyclical awareness'],
    Mercury: ['Mind-body connection', 'Nervous system healing', 'Communication therapy', 'Learning about health'],
    Venus: ['Beauty treatments', 'Pleasure-based healing', 'Art therapy', 'Balance practices'],
    Mars: ['Physical exercise', 'Martial arts', 'Competitive sports', 'Assertiveness training'],
    Jupiter: ['Holistic approaches', 'Philosophy of healing', 'Travel for health', 'Expansion practices'],
    Saturn: ['Structural healing', 'Discipline protocols', 'Long-term programs', 'Bone health work']
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalized Healing Approaches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Based on your elemental balance and planetary strengths, these healing modalities 
            are most likely to resonate with your constitution.
          </p>

          {/* Element-Based Healing */}
          <div className="rounded-sm border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              {getElementIcon(dominantElement)}
              <span className="font-medium">{dominantElement}-Element Healing</span>
              <Badge variant="outline" className="text-xs">Primary</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your {dominantElement.toLowerCase()} dominance suggests these modalities will feel most natural:
            </p>
            <div className="flex flex-wrap gap-2">
              {(ELEMENT_HEALING_MODALITIES[dominantElement] || []).map((modality, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{modality}</Badge>
              ))}
            </div>
          </div>

          {/* All Elements Reference */}
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(ELEMENT_HEALING_MODALITIES)
              .filter(([element]) => element !== dominantElement)
              .map(([element, modalities]) => (
                <div key={element} className="rounded-sm border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {getElementIcon(element)}
                    <span className="font-medium text-sm">{element}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {modalities.slice(0, 4).map((modality, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{modality}</Badge>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Planetary Strengths */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Your Planetary Healing Strengths</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {strongPlanets.map(planet => {
                const healthInfo = PLANETARY_HEALTH_RULERS[planet];
                const modalities = planetaryModalities[planet] || [];
                return (
                  <div key={planet} className="rounded-sm border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{healthInfo?.symbol || '★'}</span>
                      <span className="font-medium">{planet}</span>
                      {planets[planet]?.sign && (
                        <span className="text-xs text-muted-foreground">in {planets[planet].sign}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {modalities.map((modality, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                          {modality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preventive Focus */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Preventive Health Focus</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Areas to strengthen based on your chart's potential vulnerabilities:
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="text-xs p-2 bg-muted/50 rounded-sm">
                <span className="font-medium">6th House Ruler:</span><br/>
                <span className="text-muted-foreground">Track the condition of this planet for daily health</span>
              </div>
              <div className="text-xs p-2 bg-muted/50 rounded-sm">
                <span className="font-medium">Saturn Placement:</span><br/>
                <span className="text-muted-foreground">Area requiring consistent, long-term care</span>
              </div>
              <div className="text-xs p-2 bg-muted/50 rounded-sm">
                <span className="font-medium">Mars Placement:</span><br/>
                <span className="text-muted-foreground">Watch for inflammation or injury in this area</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
