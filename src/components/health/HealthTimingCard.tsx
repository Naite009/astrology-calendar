import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Clock, Moon, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { LUNAR_CYCLE_HEALTH, PLANETARY_HEALTH_TIMING } from "@/lib/healthAstrology";
import { getCurrentPlanetaryHour, getDayRuler } from "@/lib/planetaryHours";
import { getMoonPhase } from "@/lib/astrology";

export const HealthTimingCard = () => {
  const [openSections, setOpenSections] = useState<string[]>(['current', 'lunar']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const today = new Date();
  const currentHour = getCurrentPlanetaryHour();
  const dayRuler = getDayRuler(today);
  const moonPhase = useMemo(() => getMoonPhase(today), []);

  // Map moon phase to lunar cycle key
  const getLunarCycleKey = (phaseName: string): string => {
    if (phaseName.includes('New')) return 'New Moon';
    if (phaseName.includes('Waxing Crescent')) return 'Waxing Crescent';
    if (phaseName.includes('First Quarter')) return 'First Quarter';
    if (phaseName.includes('Waxing Gibbous')) return 'Waxing Gibbous';
    if (phaseName.includes('Full')) return 'Full Moon';
    if (phaseName.includes('Waning Gibbous')) return 'Waning Gibbous';
    if (phaseName.includes('Last Quarter') || phaseName.includes('Third Quarter')) return 'Last Quarter';
    if (phaseName.includes('Waning Crescent')) return 'Waning Crescent';
    return 'New Moon';
  };

  const lunarKey = getLunarCycleKey(moonPhase.phaseName);
  const lunarHealthAdvice = LUNAR_CYCLE_HEALTH[lunarKey];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Optimal Health Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use planetary hours and lunar phases to time health activities for maximum benefit.
          </p>

          {/* Current Timing */}
          <Collapsible
            open={openSections.includes('current')}
            onOpenChange={() => toggleSection('current')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Current Health Timing</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('current') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {/* Day Ruler */}
                <div className="rounded-sm border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dayRuler.symbol}</span>
                    <div>
                      <span className="font-medium">{dayRuler.dayName}</span>
                      <span className="text-sm text-muted-foreground ml-2">Day of {dayRuler.planet}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getDayHealthAdvice(dayRuler.planet)}
                  </p>
                </div>

                {/* Current Hour */}
                {currentHour && (
                  <div className="rounded-sm border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentHour.symbol}</span>
                      <div>
                        <span className="font-medium">Hour of {currentHour.planet}</span>
                        <span className="text-xs text-muted-foreground block">
                          Until {currentHour.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Good for:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(PLANETARY_HEALTH_TIMING[currentHour.planet] || []).map((activity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{activity}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Lunar Cycle */}
          <Collapsible
            open={openSections.includes('lunar')}
            onOpenChange={() => toggleSection('lunar')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <span className="font-medium">Lunar Cycle Health</span>
                <Badge variant="outline" className="text-xs">{moonPhase.phase}</Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('lunar') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {/* Current Phase */}
              <div className="rounded-sm border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{moonPhase.phaseIcon}</span>
                  <div>
                    <span className="font-medium">{lunarKey}</span>
                    <span className="text-sm text-muted-foreground ml-2">({Math.round(moonPhase.illumination * 100)}% illuminated)</span>
                  </div>
                </div>
                <p className="text-sm">{lunarHealthAdvice}</p>
              </div>

              {/* Full Lunar Cycle Reference */}
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Complete Lunar Health Cycle</h4>
                <div className="grid gap-2">
                  {Object.entries(LUNAR_CYCLE_HEALTH).map(([phase, advice]) => (
                    <div
                      key={phase}
                      className={`text-xs p-2 rounded-sm ${
                        phase === lunarKey ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                      }`}
                    >
                      <span className="font-medium">{phase}:</span> {advice}
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Surgery Timing */}
          <Collapsible
            open={openSections.includes('surgery')}
            onOpenChange={() => toggleSection('surgery')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <span className="font-medium">Electional Health Guidelines</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('surgery') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-3">
                  <h5 className="font-medium text-sm mb-2 text-red-700">Avoid for Surgery</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Moon in sign ruling body part being operated on</li>
                    <li>• Mars afflicting the area</li>
                    <li>• Moon void of course</li>
                    <li>• Mercury retrograde (if possible)</li>
                    <li>• Lunar eclipse within 2 weeks</li>
                  </ul>
                </div>
                <div className="rounded-sm border border-green-500/30 bg-green-500/5 p-3">
                  <h5 className="font-medium text-sm mb-2 text-green-700">Favorable Timing</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Waxing moon for building procedures</li>
                    <li>• Waning moon for removing procedures</li>
                    <li>• Jupiter aspects for growth/healing</li>
                    <li>• Venus aspects for beauty procedures</li>
                    <li>• Strong 6th house ruler</li>
                  </ul>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                <strong>Starting a Diet:</strong> New moon in earth sign, moon trine Saturn for discipline<br/>
                <strong>Starting Exercise:</strong> Mars well-aspected, moon in fire or air sign<br/>
                <strong>Detox/Cleanse:</strong> Waning moon, moon in water sign
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

function getDayHealthAdvice(planet: string): string {
  const advice: Record<string, string> = {
    Sun: 'Excellent for vitality activities, heart health focus, meetings with specialists, and setting health intentions.',
    Moon: 'Best for emotional wellness, digestive care, water therapies, and hormonal awareness. Nurturing activities favored.',
    Mars: 'Ideal for vigorous exercise, starting new fitness programs, surgical procedures, and breaking through health plateaus.',
    Mercury: 'Good for health consultations, learning about wellness, nervous system care, and breathwork practices.',
    Jupiter: 'Favorable for holistic treatments, health education, liver support, and expanding wellness practices.',
    Venus: 'Perfect for beauty treatments, pleasure-based healing, kidney care, and creating harmonious health routines.',
    Saturn: 'Suited for discipline-based health work, bone/joint care, chronic condition management, and long-term planning.'
  };
  return advice[planet] || 'Health activities supported by planetary energy.';
}
