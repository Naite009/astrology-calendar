import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { CHALLENGING_HEALTH_ASPECTS, SUPPORTIVE_HEALTH_ASPECTS } from "@/lib/healthAstrology";
import { getEffectiveOrb } from "@/lib/aspectOrbs";

interface HealthAspectsCardProps {
  natalChart: NatalChart;
}

// Aspect symbols for display
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  square: '□',
  trine: '△',
  sextile: '⚹',
};

const SIGN_DEGREES: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150,
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330
};

export const HealthAspectsCard = ({ natalChart }: HealthAspectsCardProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['challenging', 'supportive']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const { planets } = natalChart;

  // Calculate absolute degree for a planet
  const getAbsoluteDegree = (planet: { sign: string; degree: number; minutes?: number }) => {
    if (!planet.sign || !SIGN_DEGREES.hasOwnProperty(planet.sign)) return null;
    return SIGN_DEGREES[planet.sign] + planet.degree + (planet.minutes || 0) / 60;
  };

  // Detect aspects between two planets using planet-specific orbs
  const detectAspect = (planet1Deg: number, planet2Deg: number, p1Name: string, p2Name: string): { type: string; orb: number } | null => {
    let diff = Math.abs(planet1Deg - planet2Deg);
    if (diff > 180) diff = 360 - diff;

    const aspects = [
      { type: 'conjunction', angle: 0 },
      { type: 'opposition', angle: 180 },
      { type: 'square', angle: 90 },
      { type: 'trine', angle: 120 },
      { type: 'sextile', angle: 60 },
    ];
    for (const a of aspects) {
      const orb = Math.abs(diff - a.angle);
      if (orb <= getEffectiveOrb(p1Name, p2Name, a.type)) {
        return { type: a.type, orb };
      }
    }
    return null;
  };

  // Find health-relevant aspects in the chart
  const healthAspects = useMemo(() => {
    const planetList = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const found: { pair: string; aspect: string; orb: number; isHard: boolean; interpretation: string }[] = [];

    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const p1 = planets[planetList[i]];
        const p2 = planets[planetList[j]];
        if (!p1?.sign || !p2?.sign) continue;

        const deg1 = getAbsoluteDegree(p1);
        const deg2 = getAbsoluteDegree(p2);
        if (deg1 === null || deg2 === null) continue;

        const aspect = detectAspect(deg1, deg2, planetList[i], planetList[j]);
        if (!aspect) continue;

        const pairKey = `${planetList[i]}-${planetList[j]}`;
        const isHard = aspect.type === 'square' || aspect.type === 'opposition';
        
        // Check if we have interpretation for this pair
        const interpretation = 
          CHALLENGING_HEALTH_ASPECTS[pairKey] || 
          SUPPORTIVE_HEALTH_ASPECTS[pairKey] || 
          null;

        if (interpretation) {
          found.push({
            pair: pairKey,
            aspect: aspect.type,
            orb: Math.round(aspect.orb * 10) / 10,
            isHard,
            interpretation
          });
        }
      }
    }

    return found;
  }, [planets]);

  const challengingAspects = healthAspects.filter(a => a.isHard || CHALLENGING_HEALTH_ASPECTS[a.pair]);
  const supportiveAspects = healthAspects.filter(a => !a.isHard && SUPPORTIVE_HEALTH_ASPECTS[a.pair]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Planetary Aspects & Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aspects between planets create health tendencies—some challenging, some supportive. 
            Understanding these helps you work with your chart's energy.
          </p>

          {/* Challenging Aspects */}
          <Collapsible
            open={openSections.includes('challenging')}
            onOpenChange={() => toggleSection('challenging')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Challenging Aspects</span>
                <Badge variant="outline" className="text-xs">{challengingAspects.length} found</Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('challenging') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {challengingAspects.length > 0 ? (
                challengingAspects.map((aspect, i) => (
                  <div key={i} className="rounded-sm border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{aspect.pair.replace('-', ' – ')}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{aspect.aspect}</Badge>
                        <span className="text-xs text-muted-foreground">{aspect.orb}°</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{aspect.interpretation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No challenging health aspects detected with known interpretations. 
                  This doesn't mean there are no challenges—just that the traditional problematic combinations aren't strongly present.
                </p>
              )}

              {/* Show potential aspects even if not in chart */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Common challenging aspects to be aware of:</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries(CHALLENGING_HEALTH_ASPECTS).slice(0, 4).map(([pair, desc]) => (
                    <div key={pair} className="text-xs p-2 bg-muted/50 rounded-sm">
                      <span className="font-medium">{pair}:</span> {desc.slice(0, 60)}...
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Supportive Aspects */}
          <Collapsible
            open={openSections.includes('supportive')}
            onOpenChange={() => toggleSection('supportive')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="font-medium">Supportive Aspects</span>
                <Badge variant="outline" className="text-xs">{supportiveAspects.length} found</Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('supportive') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {supportiveAspects.length > 0 ? (
                supportiveAspects.map((aspect, i) => (
                  <div key={i} className="rounded-sm border border-green-500/30 bg-green-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{aspect.pair.replace('-', ' – ')}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{aspect.aspect}</Badge>
                        <span className="text-xs text-muted-foreground">{aspect.orb}°</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{aspect.interpretation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No traditional supportive health aspects detected with tight orbs. 
                  Look to your dominant element and signs for natural health resources.
                </p>
              )}

              {/* Show potential supportive aspects */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Supportive health aspects to cultivate:</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries(SUPPORTIVE_HEALTH_ASPECTS).slice(0, 4).map(([pair, desc]) => (
                    <div key={pair} className="text-xs p-2 bg-muted/50 rounded-sm">
                      <span className="font-medium">{pair}:</span> {desc.slice(0, 60)}...
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};
