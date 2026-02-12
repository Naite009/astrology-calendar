import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Heart, Sun, Moon, Activity, Shield, AlertCircle, Pill, Leaf as LeafIcon, Zap, Hexagon } from "lucide-react";
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
import { useHumanDesignChart } from "@/hooks/useHumanDesignChart";
import { determinationData } from "@/data/humanDesignDeterminations";

interface HealthNatalBlueprintProps {
  natalChart: NatalChart;
}

export const HealthNatalBlueprint = ({ natalChart }: HealthNatalBlueprintProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['constitutional', 'vulnerabilities']);
  const { charts: hdCharts } = useHumanDesignChart();

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

  // Find matching HD chart by name — fuzzy: try exact, then first-name, then just use first HD chart
  const matchingHdChart = useMemo(() => {
    if (hdCharts.length === 0) return null;
    const chartName = natalChart.name?.toLowerCase().trim();
    if (!chartName) return hdCharts[0] || null;
    // Exact match
    const exact = hdCharts.find(hd => hd.name?.toLowerCase().trim() === chartName);
    if (exact) return exact;
    // First-name match
    const firstName = chartName.split(/\s+/)[0];
    const firstNameMatch = hdCharts.find(hd => hd.name?.toLowerCase().trim().split(/\s+/)[0] === firstName);
    if (firstNameMatch) return firstNameMatch;
    // If only one HD chart exists, just use it
    if (hdCharts.length === 1) return hdCharts[0];
    return null;
  }, [natalChart.name, hdCharts]);

  // Get HD determination data if available
  const hdDetermination = useMemo(() => {
    if (!matchingHdChart?.variables?.determination) return null;
    const detColor = matchingHdChart.variables.determination.color;
    // Map color number to determination name
    const colorToName: Record<string, Record<number, string>> = {
      Left: { 1: 'Appetite', 2: 'Taste', 3: 'Thirst', 4: 'Nervous', 5: 'Low Sound', 6: 'Indirect Light' },
      Right: { 1: 'Appetite', 2: 'Taste', 3: 'Thirst', 4: 'Nervous', 5: 'Low Sound', 6: 'Indirect Light' }
    };
    const leftNames: Record<number, string> = { 1: 'Consecutive', 2: 'Alternating', 3: 'Open', 4: 'Calm', 5: 'Hot Thirst', 6: 'Direct Light' };
    const rightNames: Record<number, string> = { 1: 'Appetite', 2: 'Taste', 3: 'Thirst', 4: 'Nervous', 5: 'Low Sound', 6: 'Indirect Light' };
    
    const dir = matchingHdChart.variables.determination.arrow;
    const nameMap = dir === 'Left' ? leftNames : rightNames;
    const detName = nameMap[detColor];
    if (!detName) return null;
    
    const data = determinationData[detName];
    return data ? { ...data, determinationName: detName } : null;
  }, [matchingHdChart]);

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
                    <div key={i} className="ml-2 mt-1">
                      <p className="text-xs text-foreground">• {d.text}</p>
                      <p className="text-xs text-muted-foreground italic ml-3">↳ Why: {d.reason}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-xs font-medium">📅 Weekly:</span>
                  {prevention.weekly.map((w, i) => (
                    <div key={i} className="ml-2 mt-1">
                      <p className="text-xs text-foreground">• {w.text}</p>
                      <p className="text-xs text-muted-foreground italic ml-3">↳ Why: {w.reason}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-xs font-medium">🚫 Avoid:</span>
                  {prevention.avoid.map((a, i) => (
                    <div key={i} className="ml-2 mt-1">
                      <p className="text-xs text-foreground">• {a.text}</p>
                      <p className="text-xs text-muted-foreground italic ml-3">↳ Why: {a.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* HUMAN DESIGN PHS - SECONDARY LAYER */}
          {hdDetermination ? (
            <Collapsible
              open={openSections.includes('hd-phs')}
              onOpenChange={() => toggleSection('hd-phs')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-purple-500/30 bg-purple-500/5 p-3 hover:bg-purple-500/10">
                <div className="flex items-center gap-2">
                  <Hexagon className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Human Design: How You Eat</span>
                  <Badge variant="outline" className="text-xs">{(hdDetermination as any).determinationName} ({hdDetermination.direction})</Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('hd-phs') ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="rounded-sm border border-purple-500/20 p-4 space-y-4">
                  <p className="text-xs text-muted-foreground italic">
                    Your Human Design PHS (Primary Health System) Determination adds a second layer to your astrological health profile.
                    While astrology shows what your body needs, HD shows <strong>how</strong> your body best processes food.
                  </p>
                  
                  <div>
                    <span className="text-sm font-medium">{(hdDetermination as any).determinationName} Determination</span>
                    <span className="text-xs text-muted-foreground ml-2">({hdDetermination.category})</span>
                    <p className="text-xs text-muted-foreground mt-1">{hdDetermination.description}</p>
                  </div>

                  <div>
                    <span className="text-xs font-medium">🍽️ How to Eat:</span>
                    <p className="text-xs text-muted-foreground mt-1">{hdDetermination.implementation}</p>
                  </div>

                  <div>
                    <span className="text-xs font-medium">📋 Meal Structure:</span>
                    {hdDetermination.mealStructure.map((item: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground ml-2">• {item}</p>
                    ))}
                  </div>

                  <div>
                    <span className="text-xs font-medium">✅ Benefits when followed:</span>
                    <p className="text-xs text-muted-foreground mt-1">{hdDetermination.benefits}</p>
                  </div>

                  <div>
                    <span className="text-xs font-medium">⚠️ Common Mistakes:</span>
                    {hdDetermination.commonMistakes.map((m: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground ml-2">• {m}</p>
                    ))}
                  </div>

                  <div>
                    <span className="text-xs font-medium">💡 Practical Tips:</span>
                    {hdDetermination.practicalTips.map((t: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground ml-2">• {t}</p>
                    ))}
                  </div>

                  <div className="border-t border-border pt-2">
                    <span className="text-xs font-medium">🧪 30-Day Experiment:</span>
                    <p className="text-xs text-muted-foreground mt-1">{hdDetermination.experimentationGuide}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="rounded-sm border border-dashed border-muted-foreground/30 p-4 text-center">
              <Hexagon className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                Add a Human Design chart with matching name to see PHS eating guidance here.
                <br />
                <span className="italic">Your HD Determination shows <strong>how</strong> your body best digests — a powerful complement to astrological health insights.</span>
              </p>
            </div>
          )}

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
