import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Heart, Sun, Moon, Activity, Shield, AlertCircle, Pill, Leaf as LeafIcon, Zap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { PLANETARY_HEALTH_RULERS, getElementForSign, getDominantElement } from "@/lib/healthAstrology";
import { getValidatedAscendant, validateChartData } from "@/lib/chartDataValidation";
import {
  assessConstitutionalStrength,
  detectAfflictedPlanets,
  generatePreventionProtocol,
  ELEMENT_VITAMIN_PROTOCOLS,
  CONDITION_PROTOCOLS
} from "@/lib/healthRemedies";

interface HealthNatalBlueprintProps {
  natalChart: NatalChart;
}

export const HealthNatalBlueprint = ({ natalChart }: HealthNatalBlueprintProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['constitutional', 'vulnerabilities']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const { planets, houseCusps } = natalChart;

  useEffect(() => {
    const validation = validateChartData(natalChart);
    if (validation.hasIssues) {
      console.warn('[HealthNatalBlueprint] Chart data issues:', validation.issues);
    }
  }, [natalChart]);

  const sunSign = planets.Sun?.sign || 'Unknown';
  const moonSign = planets.Moon?.sign || 'Unknown';
  const ascValidation = getValidatedAscendant(natalChart);
  const ascendantSign = ascValidation.correctedValue;
  const sixthHouseCusp = houseCusps?.house6?.sign || 'Unknown';

  const sunHealthInfo = PLANETARY_HEALTH_RULERS.Sun;
  const moonHealthInfo = PLANETARY_HEALTH_RULERS.Moon;
  const sunElement = getElementForSign(sunSign);
  const moonElement = getElementForSign(moonSign);
  const ascElement = getElementForSign(ascendantSign);
  const dominantElement = getDominantElement(planets, ascendantSign);

  // Constitutional assessment
  const constitutional = useMemo(() => assessConstitutionalStrength(planets, ascendantSign), [planets, ascendantSign]);

  // Afflicted planets
  const afflictedPlanets = useMemo(() => detectAfflictedPlanets(planets), [planets]);

  // Prevention protocol
  const prevention = useMemo(
    () => generatePreventionProtocol(dominantElement, afflictedPlanets, ascendantSign),
    [dominantElement, afflictedPlanets, ascendantSign]
  );

  const elementProtocol = ELEMENT_VITAMIN_PROTOCOLS[dominantElement];

  const getStrengthColor = (rating: string) => {
    switch (rating) {
      case 'Strong': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'Moderate': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      case 'Sensitive': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500/40 bg-red-500/5';
      case 'medium': return 'border-amber-500/40 bg-amber-500/5';
      default: return 'border-border';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴 Primary Focus';
      case 'medium': return '🟡 Secondary';
      default: return '🟢 Minor';
    }
  };

  return (
    <div className="space-y-6">
      {/* Constitutional Strength Rating */}
      <Card className={`border ${getStrengthColor(constitutional.rating)}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Constitutional Strength</span>
            </div>
            <Badge className={getStrengthColor(constitutional.rating)}>
              {constitutional.rating}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className="h-2 rounded-full transition-all bg-primary"
              style={{ width: `${constitutional.score}%` }}
            />
          </div>
          <div className="space-y-1">
            {constitutional.factors.map((f, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {f}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Blueprint Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Your Natal Health Blueprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your birth chart reveals constitutional strengths, vulnerabilities, and natural healing tendencies
            based on traditional medical astrology principles.
          </p>

          {/* Constitutional Analysis */}
          <Collapsible
            open={openSections.includes('constitutional')}
            onOpenChange={() => toggleSection('constitutional')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <span className="font-medium">Constitutional Analysis</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('constitutional') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="font-medium">Ascendant Vitality ({ascendantSign})</span>
                  <Badge variant="outline" className="text-xs">{ascElement}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ascendantSign && (
                    <span><strong>{ascendantSign} Rising:</strong> {getAscendantHealthDescription(ascendantSign)}</span>
                  )}
                </p>
              </div>

              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Core Vitality ({sunSign})</span>
                  <Badge variant="outline" className="text-xs">{sunElement}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sunHealthInfo.signEffects[sunSign] || 'Vitality expression varies.'}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {sunHealthInfo.bodyParts.map((part, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{part}</Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">Emotional Health ({moonSign})</span>
                  <Badge variant="outline" className="text-xs">{moonElement}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {moonHealthInfo.signEffects[moonSign] || 'Emotional patterns affect digestion.'}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {moonHealthInfo.healthThemes.map((theme, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-border p-4 space-y-2">
                <span className="font-medium">6th House of Health ({sixthHouseCusp})</span>
                <p className="text-sm text-muted-foreground">
                  {sixthHouseCusp !== 'Unknown' && (
                    <span><strong>{sixthHouseCusp} on the 6th:</strong> {getSixthHouseDescription(sixthHouseCusp)}</span>
                  )}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* NATAL VULNERABILITIES */}
          <Collapsible
            open={openSections.includes('vulnerabilities')}
            onOpenChange={() => toggleSection('vulnerabilities')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-amber-500/30 bg-amber-500/5 p-3 hover:bg-amber-500/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Areas to Watch (Natal Vulnerabilities)</span>
                <Badge variant="outline" className="text-xs">{afflictedPlanets.length} found</Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('vulnerabilities') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {afflictedPlanets.length > 0 ? (
                afflictedPlanets.map((aff, i) => (
                  <div key={i} className={`rounded-sm border p-4 space-y-3 ${getSeverityColor(aff.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{aff.symbol}</span>
                        <span className="font-medium">{aff.planet} in {aff.sign}</span>
                      </div>
                      <span className="text-xs">{getSeverityLabel(aff.severity)}</span>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Afflictions:</span>
                      {aff.afflictions.map((a, j) => (
                        <p key={j} className="text-xs text-muted-foreground">• {a}</p>
                      ))}
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Body Areas Affected:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aff.bodyAreas.map((area, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-2 space-y-2">
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <Pill className="h-3 w-3" /> Support Protocol
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Vitamins & Minerals:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aff.remedies.vitamins.map((v, j) => (
                            <Badge key={j} variant="secondary" className="text-xs bg-green-500/10 text-green-700">{v}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Herbs:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aff.remedies.herbs.map((h, j) => (
                            <Badge key={j} variant="secondary" className="text-xs bg-purple-500/10 text-purple-700">{h}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Lifestyle:</span>
                        {aff.remedies.lifestyle.map((l, j) => (
                          <p key={j} className="text-xs text-muted-foreground">• {l}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No significantly afflicted planets detected. Your chart shows relatively balanced health indicators.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* ELEMENT VITAMIN PROTOCOL */}
          <Collapsible
            open={openSections.includes('element-protocol')}
            onOpenChange={() => toggleSection('element-protocol')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">{dominantElement}-Element Vitamin Protocol</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('element-protocol') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              {elementProtocol && (
                <div className="rounded-sm border border-border p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{elementProtocol.focus}</p>
                  <div className="flex flex-wrap gap-1">
                    {elementProtocol.vitamins.map((v, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700">{v}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* PREVENTION PROTOCOL */}
          <Collapsible
            open={openSections.includes('prevention')}
            onOpenChange={() => toggleSection('prevention')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-green-500/30 bg-green-500/5 p-3 hover:bg-green-500/10">
              <div className="flex items-center gap-2">
                <LeafIcon className="h-4 w-4 text-green-600" />
                <span className="font-medium">Your Prevention Protocol</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('prevention') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="rounded-sm border border-border p-4 space-y-4">
                <div>
                  <span className="text-xs font-medium">📋 Key Supplements for Your Chart:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prevention.keySupplements.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium">☀️ Daily:</span>
                  {prevention.daily.map((d, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {d}</p>
                  ))}
                </div>

                <div>
                  <span className="text-xs font-medium">📅 Weekly:</span>
                  {prevention.weekly.map((w, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {w}</p>
                  ))}
                </div>

                <div>
                  <span className="text-xs font-medium">🚫 Avoid:</span>
                  {prevention.avoid.map((a, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {a}</p>
                  ))}
                </div>
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
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('planetary') ? 'rotate-180' : ''}`} />
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

          {/* Condition-Specific Quick Reference */}
          <Collapsible
            open={openSections.includes('conditions')}
            onOpenChange={() => toggleSection('conditions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <span className="font-medium">Common Condition Protocols</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('conditions') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {Object.entries(CONDITION_PROTOCOLS).map(([key, protocol]) => (
                <Collapsible key={key}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-2 hover:bg-muted/50 text-sm">
                    <span className="font-medium">{protocol.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 pl-2 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Natal Indicators:</span>
                      {protocol.natalIndicators.slice(0, 4).map((ind, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {ind}</p>
                      ))}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Support:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {protocol.vitamins.slice(0, 4).map((v, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700">{v}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {protocol.herbs.slice(0, 3).map((h, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-purple-500/10 text-purple-700">{h}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Lifestyle:</span>
                      {protocol.lifestyle.slice(0, 3).map((l, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {l}</p>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

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
  return descriptions[sign] || "Health routines influenced by this sign's qualities.";
}
