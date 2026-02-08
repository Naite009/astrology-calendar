import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Heart, Sun, Moon, Activity } from "lucide-react";
import { useState } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { PLANETARY_HEALTH_RULERS, getElementForSign } from "@/lib/healthAstrology";

interface HealthNatalBlueprintProps {
  natalChart: NatalChart;
}

export const HealthNatalBlueprint = ({ natalChart }: HealthNatalBlueprintProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['constitutional']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const { planets, houseCusps } = natalChart;

  // Get key health indicators
  const sunSign = planets.Sun?.sign || 'Unknown';
  const moonSign = planets.Moon?.sign || 'Unknown';
  
  // CRITICAL: Use house1 as the definitive source for Ascendant, not planets.Ascendant
  // This prevents import/OCR errors where Ascendant/Descendant can get flipped
  const ascendantSign = houseCusps?.house1?.sign || planets.Ascendant?.sign || sunSign;
  
  // Get 6th house info
  const sixthHouseCusp = houseCusps?.house6?.sign || 'Unknown';

  const sunHealthInfo = PLANETARY_HEALTH_RULERS.Sun;
  const moonHealthInfo = PLANETARY_HEALTH_RULERS.Moon;

  const sunElement = getElementForSign(sunSign);
  const moonElement = getElementForSign(moonSign);
  const ascElement = getElementForSign(ascendantSign);

  return (
    <div className="space-y-6">
      {/* Constitutional Overview */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Your Natal Health Blueprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your birth chart reveals your constitutional strengths, vulnerabilities, and natural healing tendencies.
            This analysis is based on traditional medical astrology principles.
          </p>

          {/* Constitutional Analysis */}
          <Collapsible
            open={openSections.includes('constitutional')}
            onOpenChange={() => toggleSection('constitutional')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <span className="font-medium">Constitutional Analysis</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('constitutional') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Ascendant Vitality */}
              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="font-medium">Ascendant Vitality ({ascendantSign})</span>
                  <Badge variant="outline" className="text-xs">{ascElement}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your rising sign governs your physical constitution and how your body presents to the world.
                  {ascendantSign && (
                    <span className="block mt-2">
                      <strong>{ascendantSign} Rising:</strong> {getAscendantHealthDescription(ascendantSign)}
                    </span>
                  )}
                </p>
              </div>

              {/* Sun Vitality */}
              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Core Vitality ({sunSign})</span>
                  <Badge variant="outline" className="text-xs">{sunElement}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sunHealthInfo.signEffects[sunSign] || 'Vitality expression varies based on aspects and house placement.'}
                </p>
                <div className="mt-2">
                  <span className="text-xs font-medium text-muted-foreground">Body Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sunHealthInfo.bodyParts.map((part, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{part}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Moon Emotional Health */}
              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">Emotional Health ({moonSign})</span>
                  <Badge variant="outline" className="text-xs">{moonElement}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {moonHealthInfo.signEffects[moonSign] || 'Emotional patterns affect digestion and fluid balance.'}
                </p>
                <div className="mt-2">
                  <span className="text-xs font-medium text-muted-foreground">Health Themes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {moonHealthInfo.healthThemes.map((theme, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6th House */}
              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">6th House of Health ({sixthHouseCusp})</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The 6th house governs daily health habits, work-life balance, and specific health conditions.
                  {sixthHouseCusp !== 'Unknown' && (
                    <span className="block mt-2">
                      <strong>{sixthHouseCusp} on the 6th:</strong> {getSixthHouseDescription(sixthHouseCusp)}
                    </span>
                  )}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Planetary Health Rulers */}
          <Collapsible
            open={openSections.includes('planetary')}
            onOpenChange={() => toggleSection('planetary')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <span className="font-medium">Your Planetary Health Indicators</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('planetary') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(planets)
                  .filter(([name]) => ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(name))
                  .map(([name, data]) => {
                    const healthInfo = PLANETARY_HEALTH_RULERS[name];
                    if (!healthInfo || !data.sign) return null;
                    return (
                      <div key={name} className="rounded-sm border border-border p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{healthInfo.symbol}</span>
                          <span className="font-medium">{name} in {data.sign}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {healthInfo.signEffects[data.sign] || 'Health expression varies.'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {healthInfo.bodyParts.slice(0, 3).map((part, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{part}</Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions for descriptions
function getAscendantHealthDescription(sign: string): string {
  const descriptions: Record<string, string> = {
    Aries: 'Strong, athletic build with quick recuperation. Watch for head-related issues and tendency to push too hard.',
    Taurus: 'Sturdy, enduring constitution. Slower metabolism but excellent stamina. Throat and thyroid sensitivity.',
    Gemini: 'Lean, nervous constitution. Quick reflexes but needs to manage nervous energy. Respiratory awareness important.',
    Cancer: 'Sensitive constitution affected by emotions. Strong connection between mood and digestion.',
    Leo: 'Robust constitution with natural vitality. Heart and spine need attention. Tends toward dramatic health expressions.',
    Virgo: 'Health-conscious by nature. Excellent body awareness but prone to health anxiety. Digestive sensitivity.',
    Libra: 'Balanced constitution seeking equilibrium. Kidneys and lower back need support. Benefits from harmonious environment.',
    Scorpio: 'Intense regenerative capacity. Strong but may push through illness. Reproductive and elimination focus.',
    Sagittarius: 'Active, optimistic constitution. Liver and hip/thigh areas need attention. Healing through movement.',
    Capricorn: 'Enduring constitution that improves with age. Bones, teeth, and skin need mineral support.',
    Aquarius: 'Unique constitution with unusual responses to treatments. Circulation and ankles need attention.',
    Pisces: 'Sensitive, absorptive constitution. Strong immune-spiritual connection. Feet and lymphatic system focus.'
  };
  return descriptions[sign] || 'Constitutional patterns expressed through this rising sign.';
}

function getSixthHouseDescription(sign: string): string {
  const descriptions: Record<string, string> = {
    Aries: 'Active health routines needed. May start many health programs. Benefits from competitive exercise.',
    Taurus: 'Steady, consistent health practices. May resist changing routines. Sensual approach to wellness.',
    Gemini: 'Variety in health routines important. Mental health connected to physical. Multiple health interests.',
    Cancer: 'Emotional connection to health habits. Nurturing approach to wellness. Home remedies effective.',
    Leo: 'Dramatic approach to health. Needs recognition for health achievements. Creative exercise beneficial.',
    Virgo: 'Natural health house placement. Detailed health awareness. May overanalyze symptoms.',
    Libra: 'Partner influence on health. Needs beautiful health environments. Balance-focused routines.',
    Scorpio: 'Intense health transformations. All-or-nothing approach. Deep healing capacity.',
    Sagittarius: 'Philosophical approach to health. Benefits from outdoor exercise. May overdo activities.',
    Capricorn: 'Disciplined health approach. Long-term health planning. May neglect health for work.',
    Aquarius: 'Unconventional health methods. Group exercise beneficial. Technology-assisted health.',
    Pisces: 'Intuitive health approach. Sensitive to environments. Spiritual healing practices effective.'
  };
  return descriptions[sign] || 'Health routines influenced by this sign\'s qualities.';
}
