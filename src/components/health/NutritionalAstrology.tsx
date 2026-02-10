import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Apple, Leaf, Droplets, Flame } from "lucide-react";
import { useState } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { SIGN_NUTRITION, ELEMENTAL_NUTRITION, getDominantElement, getElementForSign } from "@/lib/healthAstrology";
import { getValidatedAscendant } from "@/lib/chartDataValidation";

interface NutritionalAstrologyProps {
  natalChart: NatalChart;
}

export const NutritionalAstrology = ({ natalChart }: NutritionalAstrologyProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['elemental']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const { planets } = natalChart;
  const sunSign = planets.Sun?.sign || 'Aries';
  const moonSign = planets.Moon?.sign || 'Cancer';

  const ascendantSign = getValidatedAscendant(natalChart).correctedValue;
  const dominantElement = getDominantElement(planets, ascendantSign);
  const elementalInfo = ELEMENTAL_NUTRITION[dominantElement];
  const sunNutrition = SIGN_NUTRITION[sunSign];
  const moonNutrition = SIGN_NUTRITION[moonSign];

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'Earth': return <Leaf className="h-4 w-4 text-green-500" />;
      case 'Air': return <Droplets className="h-4 w-4 text-blue-400" />;
      case 'Water': return <Droplets className="h-4 w-4 text-blue-600" />;
      default: return <Apple className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Apple className="h-5 w-5 text-primary" />
            Your Cosmic Nutrition Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nutrition recommendations based on your elemental balance, Sun sign (vitality), and Moon sign (digestion/emotional eating patterns).
          </p>

          {/* Elemental Nutrition */}
          <Collapsible
            open={openSections.includes('elemental')}
            onOpenChange={() => toggleSection('elemental')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                {getElementIcon(dominantElement)}
                <span className="font-medium">{dominantElement}-Dominant Constitution</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('elemental') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="rounded-sm border border-border p-4 space-y-3">
                <p className="text-sm">{elementalInfo.characteristics}</p>
                
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Beneficial Foods:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {elementalInfo.foods.map((food, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700">{food}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground">Foods to Avoid:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {elementalInfo.avoid.map((food, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-red-500/10 text-red-700">{food}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground">Meal Timing:</span>
                  <p className="text-sm mt-1">{elementalInfo.mealTiming}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Sun Sign Nutrition */}
          <Collapsible
            open={openSections.includes('sun')}
            onOpenChange={() => toggleSection('sun')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">☉</span>
                <span className="font-medium">{sunSign} Sun Nutrition</span>
                <Badge variant="outline" className="text-xs">{getElementForSign(sunSign)}</Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('sun') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {sunNutrition && (
                <div className="rounded-sm border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ruled by <strong>{sunNutrition.ruledBy}</strong></span>
                    <Badge variant="outline" className="text-xs">{sunNutrition.healthFocus}</Badge>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Cell Salt:</span>
                    <p className="text-sm font-medium">{sunNutrition.cellSalt}</p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Key Nutritional Needs:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sunNutrition.nutritionalNeeds.map((need, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{need}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Beneficial Foods:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sunNutrition.beneficialFoods.map((food, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700">{food}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Foods to Limit:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sunNutrition.avoid.map((food, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-red-500/10 text-red-700">{food}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Moon Sign Eating Patterns */}
          <Collapsible
            open={openSections.includes('moon')}
            onOpenChange={() => toggleSection('moon')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">☽</span>
                <span className="font-medium">{moonSign} Moon Eating Patterns</span>
                <Badge variant="outline" className="text-xs">{getElementForSign(moonSign)}</Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSections.includes('moon') ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="rounded-sm border border-border p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your Moon sign reveals emotional eating patterns, comfort food preferences, and optimal eating environments.
                </p>
                
                {moonNutrition && (
                  <>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Cell Salt for Emotional Balance:</span>
                      <p className="text-sm font-medium">{moonNutrition.cellSalt}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Comfort Foods (Healthy Options):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {moonNutrition.beneficialFoods.slice(0, 5).map((food, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-blue-500/10 text-blue-700">{food}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="text-xs font-medium text-muted-foreground">Emotional Eating Awareness:</span>
                      <p className="text-sm mt-1">{getMoonEatingPattern(moonSign)}</p>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

function getMoonEatingPattern(moonSign: string): string {
  const patterns: Record<string, string> = {
    Aries: 'Tendency to eat quickly or impulsively when stressed. Benefits from slowing down and savoring meals. May crave spicy or bold flavors.',
    Taurus: 'Strong comfort food connection. May overeat when seeking security. Benefits from luxurious but healthy dining experiences.',
    Gemini: 'Prone to eating while distracted or multitasking. Benefits from mindful eating. May crave variety and light foods.',
    Cancer: 'Deep emotional connection to food and family meals. Nurturing through cooking. Watch for comfort eating when feeling insecure.',
    Leo: 'Dramatic relationship with food. May crave rich, impressive meals. Benefits from making healthy eating feel special.',
    Virgo: 'Can be overly critical of eating habits. May develop anxiety around food. Benefits from gentle, non-judgmental approach.',
    Libra: 'Social eating patterns. May struggle with portion control in company. Benefits from beautiful, balanced presentations.',
    Scorpio: 'Intense, all-or-nothing eating patterns. May use food for emotional control. Benefits from acknowledging food as nourishment.',
    Sagittarius: 'Adventurous eating, may overindulge when happy. Benefits from exotic, healthy cuisines. Watch for excess.',
    Capricorn: 'May skip meals when stressed or busy. Practical approach to food. Benefits from scheduling regular, nourishing meals.',
    Aquarius: 'Detached from hunger signals. Unusual food preferences. Benefits from reconnecting with body signals.',
    Pisces: 'Highly absorptive of others\' eating habits. Comfort eating tendency. Benefits from mindful, spiritual approach to meals.'
  };
  return patterns[moonSign] || 'Emotional eating patterns influenced by lunar energy.';
}
