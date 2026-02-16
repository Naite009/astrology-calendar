import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Activity, Zap, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { getPlanetaryPositions } from "@/lib/astrology";

interface HealthTransitAlert {
  id: string;
  transitPlanet: string;
  natalTarget: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  isApproaching: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthGuidance: string;
  bodyArea: string;
  recommendation: string;
}

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const ASPECT_DEFS = [
  { angle: 0, name: 'conjunction', symbol: '☌', orb: 3 },
  { angle: 180, name: 'opposition', symbol: '☍', orb: 3 },
  { angle: 90, name: 'square', symbol: '□', orb: 2 },
  { angle: 120, name: 'trine', symbol: '△', orb: 3 },
  { angle: 60, name: 'sextile', symbol: '⚹', orb: 2 },
];

const HEALTH_TRANSIT_PLANETS = ['Saturn', 'Uranus', 'Neptune', 'Pluto', 'Jupiter', 'Mars', 'Chiron'];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Chiron: '⚷'
};

// Health-specific transit interpretations
const HEALTH_TRANSIT_MESSAGES: Record<string, Record<string, { guidance: string; bodyArea: string; recommendation: string }>> = {
  Saturn: {
    Sun: {
      guidance: "Saturn transiting your Sun tests vitality and demands rest. Energy may feel depleted; chronic issues may surface.",
      bodyArea: "Heart, spine, overall vitality",
      recommendation: "Prioritize sleep, reduce stress, get cardiovascular checkup. Pace yourself - this is not a time for exhaustion."
    },
    Moon: {
      guidance: "Saturn transiting your Moon affects digestion and emotional eating. Hormonal balance may need attention.",
      bodyArea: "Stomach, breasts, fluids, hormones",
      recommendation: "Establish regular meal times, avoid emotional eating, support digestive health with probiotics and warm foods."
    },
    Ascendant: {
      guidance: "Saturn transiting your Ascendant brings focus to physical body and appearance. Time to build sustainable health habits.",
      bodyArea: "Physical constitution, bones, skin",
      recommendation: "Start a structured exercise routine, address dental/bone health, commit to long-term wellness practices."
    },
    "6th House": {
      guidance: "Saturn transiting your 6th House demands serious attention to daily health routines. Work-related stress may impact health.",
      bodyArea: "Daily health, work stress, chronic conditions",
      recommendation: "Restructure daily routines, address workplace ergonomics, don't ignore persistent symptoms - see specialists."
    }
  },
  Uranus: {
    Sun: {
      guidance: "Uranus transiting your Sun can bring sudden changes to vitality. Watch for nervous system irregularities.",
      bodyArea: "Heart rhythm, nervous system, circulation",
      recommendation: "Monitor heart rhythm, manage stress through grounding practices, be open to innovative treatments."
    },
    Moon: {
      guidance: "Uranus transiting your Moon disrupts emotional patterns and sleep. Hormonal fluctuations possible.",
      bodyArea: "Sleep cycles, hormones, emotional wellbeing",
      recommendation: "Establish calming bedtime routines, consider adaptogenic herbs, allow emotional expression through creative outlets."
    },
    Ascendant: {
      guidance: "Uranus transiting your Ascendant brings unexpected changes to physical self. Time for health experimentation.",
      bodyArea: "Overall constitution, ankles, nervous system",
      recommendation: "Try new exercise modalities, explore alternative therapies, watch for sudden injuries during this restless period."
    },
    "6th House": {
      guidance: "Uranus transiting your 6th House revolutionizes health routines. Sudden health insights or changes in diet/exercise.",
      bodyArea: "Daily routines, nervous system health",
      recommendation: "Be open to radical changes in wellness approach, try biohacking or new technologies, but don't abandon what works."
    }
  },
  Neptune: {
    Sun: {
      guidance: "Neptune transiting your Sun can lower vitality and increase sensitivity to substances. Immune system needs support.",
      bodyArea: "Immune system, energy levels, sensitivities",
      recommendation: "Avoid alcohol and drugs, boost immune system, get adequate rest, be cautious with medications and dosages."
    },
    Moon: {
      guidance: "Neptune transiting your Moon heightens emotional sensitivity and may affect fluid balance. Watch for escapism.",
      bodyArea: "Lymphatic system, emotional health, water retention",
      recommendation: "Practice mindfulness, limit alcohol, support lymphatic drainage, pay attention to dreams for health insights."
    },
    Ascendant: {
      guidance: "Neptune transiting your Ascendant dissolves physical boundaries. Heightened sensitivity to environment.",
      bodyArea: "Feet, immune system, overall sensitivity",
      recommendation: "Foot care becomes important, minimize toxic exposures, explore spiritual healing modalities, watch for misdiagnosis."
    },
    "6th House": {
      guidance: "Neptune transiting your 6th House may cloud health picture. Difficult to diagnose issues possible.",
      bodyArea: "Mysterious symptoms, sensitivities, psychosomatic issues",
      recommendation: "Keep detailed health journals, seek multiple opinions, explore mind-body connection, address underlying emotional issues."
    }
  },
  Pluto: {
    Sun: {
      guidance: "Pluto transiting your Sun brings deep transformation of vitality. Regenerative power activated but intensity is high.",
      bodyArea: "Cellular regeneration, reproductive organs, elimination",
      recommendation: "Deep detox beneficial, address any power struggles affecting health, transform relationship with your body."
    },
    Moon: {
      guidance: "Pluto transiting your Moon transforms emotional health patterns. Digestive purging and emotional release necessary.",
      bodyArea: "Digestive system, reproductive health, emotional eating",
      recommendation: "Address compulsive eating, release old emotional patterns, consider therapy, support elimination organs."
    },
    Ascendant: {
      guidance: "Pluto transiting your Ascendant transforms physical body. Major health rebirth possible after breakdown.",
      bodyArea: "Complete physical transformation, regeneration",
      recommendation: "This is a time for complete health overhaul. Address root causes, consider major lifestyle changes, embrace transformation."
    },
    "6th House": {
      guidance: "Pluto transiting your 6th House transforms daily health practices. Complete overhaul of wellness routines.",
      bodyArea: "Deep health transformation, chronic issues",
      recommendation: "Eliminate unhealthy habits completely, investigate root causes of any chronic issues, power through with discipline."
    }
  },
  Jupiter: {
    Sun: {
      guidance: "Jupiter transiting your Sun expands vitality and optimism. Good for healing but watch for overindulgence.",
      bodyArea: "Liver, heart, overall growth",
      recommendation: "Great time to start new health regimens, but moderate excesses - weight gain and liver stress possible."
    },
    Moon: {
      guidance: "Jupiter transiting your Moon expands emotional wellbeing and appetite. Comfort eating may increase.",
      bodyArea: "Stomach, liver, weight management",
      recommendation: "Embrace joy and pleasure in eating mindfully, expand emotional support network, watch portion sizes."
    },
    Ascendant: {
      guidance: "Jupiter transiting your Ascendant expands physical presence. Great for growth but monitor weight.",
      bodyArea: "Overall constitution, hips, thighs, liver",
      recommendation: "Excellent time to improve fitness, but balance expansion with discipline. Support liver health."
    },
    "6th House": {
      guidance: "Jupiter transiting your 6th House brings healing opportunities and improved daily health routines.",
      bodyArea: "General health improvement, healing capacity",
      recommendation: "Take advantage of this healing window - schedule check-ups, start beneficial practices, optimism aids recovery."
    }
  },
  Mars: {
    Sun: {
      guidance: "Mars transiting your Sun energizes but may bring inflammation or fever. High energy period with accident risk.",
      bodyArea: "Head, blood pressure, adrenals, inflammation",
      recommendation: "Channel energy into vigorous exercise, watch for overheating, manage anger constructively, avoid accidents."
    },
    Moon: {
      guidance: "Mars transiting your Moon can trigger emotional inflammation and digestive upset. Stress eating possible.",
      bodyArea: "Stomach, digestion, emotional reactivity",
      recommendation: "Avoid spicy foods and irritants, manage emotional reactions, physical exercise helps discharge tension."
    },
    Ascendant: {
      guidance: "Mars transiting your Ascendant brings high physical energy. Great for starting exercise but watch for injuries.",
      bodyArea: "Head, muscles, physical energy",
      recommendation: "Perfect time to begin vigorous fitness routine, but warm up properly and avoid recklessness."
    },
    "6th House": {
      guidance: "Mars transiting your 6th House energizes daily health routines but may bring work stress or minor health flare-ups.",
      bodyArea: "Daily energy, inflammation, acute symptoms",
      recommendation: "Attack health goals with vigor, good time for starting exercise, but watch for stress-related symptoms."
    }
  },
  Chiron: {
    Sun: {
      guidance: "Chiron transiting your Sun activates core wounds around vitality and identity. Healing crisis possible.",
      bodyArea: "Core vitality, identity-related health issues",
      recommendation: "Address deep-seated health wounds, consider alternative healing, be gentle with yourself during this vulnerable time."
    },
    Moon: {
      guidance: "Chiron transiting your Moon surfaces emotional wounds affecting physical health. Nurturing self-care essential.",
      bodyArea: "Emotional health, digestive issues from stress",
      recommendation: "Seek emotional healing support, address connection between feelings and physical symptoms, practice self-compassion."
    },
    Ascendant: {
      guidance: "Chiron transiting your Ascendant brings focus to body-related wounds. Healing journey for physical self.",
      bodyArea: "Body image, physical wounds, healing capacity",
      recommendation: "Work with healers and therapists, address body image issues, embrace your unique physical expression."
    },
    "6th House": {
      guidance: "Chiron transiting your 6th House activates healing potential in daily health practices. Wounded healer emerges.",
      bodyArea: "Chronic issues, healing practices",
      recommendation: "Your health challenges become teaching opportunities, explore healing modalities, help others while healing yourself."
    }
  }
};

function natalToLongitude(pos: { sign: string; degree: number; minutes?: number }): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
}

function angleDiff(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function getTransitLongitude(positions: ReturnType<typeof getPlanetaryPositions>, planet: string): number | null {
  const data = positions[planet as keyof typeof positions];
  if (!data) return null;
  const signIndex = ZODIAC_SIGNS.indexOf(data.sign);
  if (signIndex === -1) return null;
  const minutes = 'minutes' in data && typeof data.minutes === 'number' ? data.minutes : 0;
  return signIndex * 30 + data.degree + minutes / 60;
}

function get6thHouseCusp(natalChart: NatalChart): { sign: string; degree: number; minutes: number } | null {
  if (!natalChart.houseCusps?.house6) return null;
  return natalChart.houseCusps.house6;
}

function calculateHealthTransitAlerts(natalChart: NatalChart): HealthTransitAlert[] {
  const alerts: HealthTransitAlert[] = [];
  const today = new Date();
  const positions = getPlanetaryPositions(today);
  
  // Future positions for motion detection
  const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const futurePositions = getPlanetaryPositions(futureDate);

  // Health-significant natal points
  const healthTargets: { name: string; longitude: number }[] = [];

  // Add Sun, Moon, Ascendant
  if (natalChart.planets.Sun) {
    healthTargets.push({ name: 'Sun', longitude: natalToLongitude(natalChart.planets.Sun) });
  }
  if (natalChart.planets.Moon) {
    healthTargets.push({ name: 'Moon', longitude: natalToLongitude(natalChart.planets.Moon) });
  }
  // Always prefer houseCusps.house1 for Ascendant to avoid Asc/Desc flip
  const reliableAsc = natalChart.houseCusps?.house1 
    ? { sign: natalChart.houseCusps.house1.sign, degree: natalChart.houseCusps.house1.degree, minutes: natalChart.houseCusps.house1.minutes || 0 }
    : natalChart.planets.Ascendant;
  if (reliableAsc) {
    healthTargets.push({ name: 'Ascendant', longitude: natalToLongitude(reliableAsc) });
  }

  // Add 6th House cusp
  const sixthHouse = get6thHouseCusp(natalChart);
  if (sixthHouse) {
    healthTargets.push({ name: '6th House', longitude: natalToLongitude(sixthHouse) });
  }

  for (const transitPlanet of HEALTH_TRANSIT_PLANETS) {
    const transitLon = getTransitLongitude(positions, transitPlanet);
    const futureTransitLon = getTransitLongitude(futurePositions, transitPlanet);
    if (transitLon === null || futureTransitLon === null) continue;

    for (const target of healthTargets) {
      const currentDiff = angleDiff(transitLon, target.longitude);
      const futureDiff = angleDiff(futureTransitLon, target.longitude);

      for (const aspectDef of ASPECT_DEFS) {
        const currentOrb = Math.abs(currentDiff - aspectDef.angle);
        const futureOrb = Math.abs(futureDiff - aspectDef.angle);

        if (currentOrb <= aspectDef.orb) {
          const isApproaching = futureOrb < currentOrb;
          const isExact = currentOrb <= 0.5;

          // Get health-specific message
          const messages = HEALTH_TRANSIT_MESSAGES[transitPlanet]?.[target.name];
          if (!messages) continue;

          // Determine priority
          let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
          const isOuterPlanet = ['Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(transitPlanet);
          
          if (isExact && isOuterPlanet) priority = 'critical';
          else if (isExact || (isOuterPlanet && currentOrb <= 1)) priority = 'high';
          else if (isOuterPlanet) priority = 'medium';
          else priority = 'low';

          alerts.push({
            id: `${transitPlanet}-${target.name}-${aspectDef.name}`,
            transitPlanet,
            natalTarget: target.name,
            aspectType: aspectDef.name,
            aspectSymbol: aspectDef.symbol,
            orb: Math.round(currentOrb * 10) / 10,
            isApproaching,
            priority,
            healthGuidance: messages.guidance,
            bodyArea: messages.bodyArea,
            recommendation: messages.recommendation
          });
        }
      }
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return alerts;
}

interface HealthTransitAlertsCardProps {
  natalChart: NatalChart;
}

export const HealthTransitAlertsCard = ({ natalChart }: HealthTransitAlertsCardProps) => {
  const [openAlerts, setOpenAlerts] = useState<string[]>([]);

  const alerts = useMemo(() => calculateHealthTransitAlerts(natalChart), [natalChart]);

  const toggleAlert = (id: string) => {
    setOpenAlerts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Transit Health Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No significant health transits are currently active for your chart. Check back periodically as planetary positions change.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" />
          Transit Health Alerts
          <Badge variant="outline" className="ml-2">{alerts.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Current transits affecting your natal Sun, Moon, Ascendant, and 6th House with health-specific guidance.
        </p>

        {alerts.map((alert) => (
          <Collapsible
            key={alert.id}
            open={openAlerts.includes(alert.id)}
            onOpenChange={() => toggleAlert(alert.id)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border p-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                {getPriorityIcon(alert.priority)}
                <span className="text-lg">{PLANET_SYMBOLS[alert.transitPlanet] || '⚫'}</span>
                <span className="font-medium text-sm">
                  {alert.transitPlanet} {alert.aspectSymbol} {alert.natalTarget}
                </span>
                <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                  {alert.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {alert.orb}° {alert.isApproaching ? '↗' : '↘'}
                </Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openAlerts.includes(alert.id) ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3 px-3">
              <div className="rounded-sm border border-border p-3 space-y-2">
                <p className="text-sm">{alert.healthGuidance}</p>
                
                <div className="grid gap-2 md:grid-cols-2 pt-2">
                  <div className="rounded-sm bg-muted/50 p-2">
                    <span className="text-xs font-medium text-muted-foreground block mb-1">Body Areas Affected</span>
                    <span className="text-sm">{alert.bodyArea}</span>
                  </div>
                  <div className="rounded-sm bg-primary/5 p-2">
                    <span className="text-xs font-medium text-primary block mb-1">Recommendation</span>
                    <span className="text-sm">{alert.recommendation}</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

        <div className="text-xs text-muted-foreground pt-3 border-t border-border">
          <strong>Note:</strong> ↗ = Approaching (intensifying) | ↘ = Separating (waning). 
          Outer planet transits (Saturn, Uranus, Neptune, Pluto) have longer-lasting effects.
        </div>
      </CardContent>
    </Card>
  );
};
