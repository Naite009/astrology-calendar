import { useState, useEffect, useMemo } from "react";
import { Moon, Sparkles, Calendar, Target, Eye, Heart, Briefcase, Zap, ChevronDown, ChevronUp, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Astronomy from 'astronomy-engine';
import { getNewMoonInterpretation, NewMoonInterpretation } from "@/lib/newMoonInterpretations";
import { getPlanetaryPositions, getMoonPhase } from "@/lib/astrology";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentExcerpts } from "@/hooks/useDocumentExcerpts";
import ReactMarkdown from "react-markdown";
import { NatalChart } from "@/hooks/useNatalChart";
import { getSignLunationData, SignLunationData } from "@/lib/signLunationData";
import { LunarWorkbookSection } from "./LunarWorkbookSection";
import { useSolarReturnChart } from "@/hooks/useSolarReturnChart";
import { analyzeSolarReturn } from "@/lib/solarReturnAnalysis";
import { calculateActivationWindows } from "@/lib/solarReturnActivationWindows";

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "text-red-500",
  Earth: "text-emerald-600",
  Air: "text-sky-500",
  Water: "text-blue-500"
};

const ELEMENT_BG: Record<string, string> = {
  Fire: "bg-red-500/10 border-red-500/30",
  Earth: "bg-emerald-500/10 border-emerald-500/30",
  Air: "bg-sky-500/10 border-sky-500/30",
  Water: "bg-blue-500/10 border-blue-500/30"
};

interface LunarCycleViewProps {
  onClose?: () => void;
  userNatalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
  selectedChartId?: string;
  onSelectChart?: (id: string) => void;
}

// Find key phase dates in a lunar cycle
interface KeyPhaseDates {
  firstQuarter: { date: Date; sign: string } | null;
  fullMoon: { date: Date; sign: string } | null;
  lastQuarter: { date: Date; sign: string } | null;
}

function findKeyPhaseDates(newMoonDate: Date): KeyPhaseDates {
  // First Quarter = phase 90 (quarter moon)
  const firstQuarterSearch = Astronomy.SearchMoonPhase(90, newMoonDate, 15);
  // Full Moon = phase 180
  const fullMoonSearch = Astronomy.SearchMoonPhase(180, newMoonDate, 20);
  // Last Quarter = phase 270
  const lastQuarterSearch = Astronomy.SearchMoonPhase(270, newMoonDate, 25);
  
  const getSignAtDate = (date: Date): string => {
    try {
      const vector = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
      const ecliptic = Astronomy.Ecliptic(vector);
      const signIndex = Math.floor(((ecliptic.elon % 360) + 360) % 360 / 30);
      return ZODIAC_SIGNS[signIndex];
    } catch {
      return 'Unknown';
    }
  };
  
  return {
    firstQuarter: firstQuarterSearch ? { 
      date: firstQuarterSearch.date, 
      sign: getSignAtDate(firstQuarterSearch.date) 
    } : null,
    fullMoon: fullMoonSearch ? { 
      date: fullMoonSearch.date, 
      sign: getSignAtDate(fullMoonSearch.date) 
    } : null,
    lastQuarter: lastQuarterSearch ? { 
      date: lastQuarterSearch.date, 
      sign: getSignAtDate(lastQuarterSearch.date) 
    } : null,
  };
}

// Find the previous and next new moons
function findNewMoons(referenceDate: Date): { previous: { date: Date; longitude: number }; next: { date: Date; longitude: number } } {
  // Search backwards for previous new moon
  const prevSearch = Astronomy.SearchMoonPhase(0, referenceDate, -30);
  // Search forwards for next new moon
  const nextSearch = Astronomy.SearchMoonPhase(0, referenceDate, 30);
  
  const prevDate = prevSearch?.date || new Date(referenceDate.getTime() - 29.5 * 24 * 60 * 60 * 1000);
  const nextDate = nextSearch?.date || new Date(referenceDate.getTime() + 29.5 * 24 * 60 * 60 * 1000);
  
  // Get moon longitude at each new moon
  const prevVector = Astronomy.GeoVector(Astronomy.Body.Moon, prevDate, false);
  const prevEcliptic = Astronomy.Ecliptic(prevVector);
  
  const nextVector = Astronomy.GeoVector(Astronomy.Body.Moon, nextDate, false);
  const nextEcliptic = Astronomy.Ecliptic(nextVector);
  
  return {
    previous: { date: prevDate, longitude: prevEcliptic.elon },
    next: { date: nextDate, longitude: nextEcliptic.elon }
  };
}

// Get days in the current lunar cycle
function getLunarCycleDays(start: Date, end: Date): Array<{ date: Date; moonSign: string; moonPhase: string; dayNumber: number }> {
  const days: Array<{ date: Date; moonSign: string; moonPhase: string; dayNumber: number }> = [];
  const current = new Date(start);
  let dayNumber = 1;
  
  while (current < end && dayNumber <= 30) {
    const planets = getPlanetaryPositions(current);
    const phase = getMoonPhase(current);
    
    days.push({
      date: new Date(current),
      moonSign: planets.moon?.sign || 'Unknown',
      moonPhase: phase.phaseName,
      dayNumber
    });
    
    current.setDate(current.getDate() + 1);
    dayNumber++;
  }
  
  return days;
}

// Get moon phase emoji
function getMoonPhaseEmoji(phase: string): string {
  const phaseMap: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };
  return phaseMap[phase] || '🌙';
}

// Lunar phase guidance
const PHASE_GUIDANCE: Record<string, { theme: string; activities: string[]; avoid: string[] }> = {
  'New Moon': {
    theme: 'Planting seeds of intention',
    activities: ['Set intentions', 'Journal goals', 'Start vision boards', 'Quiet reflection'],
    avoid: ['Taking major action', 'Announcing plans publicly', 'Pushing hard']
  },
  'Waxing Crescent': {
    theme: 'Building momentum',
    activities: ['Take first steps', 'Gather resources', 'Make plans concrete', 'Research'],
    avoid: ['Giving up too soon', 'Overcommitting', 'Second-guessing']
  },
  'First Quarter': {
    theme: 'Taking action & overcoming obstacles',
    activities: ['Push through challenges', 'Make decisions', 'Take bold action', 'Assert yourself'],
    avoid: ['Avoiding conflict', 'Procrastinating', 'Being passive']
  },
  'Waxing Gibbous': {
    theme: 'Refining and editing',
    activities: ['Fine-tune projects', 'Seek feedback', 'Adjust course', 'Perfect details'],
    avoid: ['Starting new things', 'Major pivots', 'Perfectionism paralysis']
  },
  'Full Moon': {
    theme: 'Illumination & culmination',
    activities: ['Celebrate achievements', 'Release what isn\'t working', 'Express gratitude', 'Social gatherings'],
    avoid: ['Starting new projects', 'Making impulsive decisions', 'Overreacting emotionally']
  },
  'Waning Gibbous': {
    theme: 'Sharing wisdom & gratitude',
    activities: ['Teach others', 'Share knowledge', 'Express appreciation', 'Give back'],
    avoid: ['Hoarding success', 'Being stingy', 'Ignoring lessons']
  },
  'Last Quarter': {
    theme: 'Letting go & clearing',
    activities: ['Declutter', 'End commitments', 'Forgive', 'Tie up loose ends'],
    avoid: ['Clinging to the past', 'Starting new ventures', 'Resisting change']
  },
  'Waning Crescent': {
    theme: 'Rest & renewal',
    activities: ['Rest', 'Dream', 'Meditate', 'Prepare for the new cycle'],
    avoid: ['Pushing hard', 'Overworking', 'Ignoring fatigue']
  }
};

export const LunarCycleView = ({ 
  onClose, 
  userNatalChart, 
  savedCharts = [], 
  selectedChartId = 'general',
  onSelectChart 
}: LunarCycleViewProps) => {
  const [newMoons, setNewMoons] = useState<{ previous: { date: Date; longitude: number }; next: { date: Date; longitude: number } } | null>(null);
  const [interpretation, setInterpretation] = useState<NewMoonInterpretation | null>(null);
  const [cycleDays, setCycleDays] = useState<Array<{ date: Date; moonSign: string; moonPhase: string; dayNumber: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [keyPhases, setKeyPhases] = useState<KeyPhaseDates | null>(null);
  const [localSelectedChart, setLocalSelectedChart] = useState(selectedChartId);
  const { buildPromptBlock: buildRefBlock } = useDocumentExcerpts();
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    expressions: true,
    themes: true,
    cycleDates: true,
    theme: false,
    intentions: false,
    aspects: false,
    chart: false,
    phases: false
  });
  
  const today = new Date();
  
  // Get the active chart based on selection
  const getActiveChart = (): NatalChart | null => {
    if (localSelectedChart === 'general') return null;
    if (localSelectedChart === 'user') return userNatalChart || null;
    return savedCharts.find(c => c.id === localSelectedChart) || null;
  };
  
  const activeChart = getActiveChart();

  // Compute SR activation data for the active chart's most recent Solar Return
  const { getSolarReturnsForChart } = useSolarReturnChart();
  const srActivationData = useMemo(() => {
    if (!activeChart) return null;
    const srCharts = getSolarReturnsForChart(activeChart.id);
    if (srCharts.length === 0) return null;
    // Find the most recent SR chart (highest year)
    const latestSR = srCharts.reduce((a, b) => a.solarReturnYear > b.solarReturnYear ? a : b);
    try {
      const analysis = analyzeSolarReturn(latestSR, activeChart);
      // Build planet degree map from analysis overlays
      const srPlanetPositions: Record<string, number> = {};
      const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      for (const overlay of analysis.houseOverlays) {
        const signIdx = SIGNS.indexOf(overlay.srSign);
        if (signIdx >= 0) {
          const degMatch = overlay.srDegree.match(/(\d+)/);
          const deg = degMatch ? parseInt(degMatch[1]) : 0;
          srPlanetPositions[`SR ${overlay.planet}`] = signIdx * 30 + deg;
        }
      }
      // Add ASC and MC
      if (analysis.yearlyTheme) {
        const ascIdx = SIGNS.indexOf(analysis.yearlyTheme.ascendantSign);
        if (ascIdx >= 0) srPlanetPositions['SR Ascendant'] = ascIdx * 30;
      }
      return calculateActivationWindows(srPlanetPositions, latestSR.solarReturnYear);
    } catch (e) {
      console.error('[LunarCycle] SR activation calc error:', e);
      return null;
    }
  }, [activeChart, getSolarReturnsForChart]);

  const handleChartChange = (value: string) => {
    setLocalSelectedChart(value);
    onSelectChart?.(value);
    // Clear AI insight when chart changes so a new personalized reading can be generated
    setAiInsight(null);
  };
  
  useEffect(() => {
    const moons = findNewMoons(today);
    setNewMoons(moons);
    
    // Get the interpretation for the current/previous new moon
    const interp = getNewMoonInterpretation(moons.previous.date, moons.previous.longitude);
    setInterpretation(interp);
    
    // Get days in this cycle
    const days = getLunarCycleDays(moons.previous.date, moons.next.date);
    setCycleDays(days);
    
    // Get key phase dates
    const phases = findKeyPhaseDates(moons.previous.date);
    setKeyPhases(phases);
  }, []);
  
  const toggleSection = (section: string) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Calculate days into the cycle
  const daysIntoCycle = newMoons ? Math.floor((today.getTime() - newMoons.previous.date.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const cycleProgress = newMoons ? Math.min(100, (daysIntoCycle / 29.5) * 100) : 0;
  
  // Get current moon phase
  const currentPhase = getMoonPhase(today);
  const phaseGuidance = PHASE_GUIDANCE[currentPhase.phaseName] || PHASE_GUIDANCE['New Moon'];
  
  // Get sign-specific lunation data
  const signLunationData = interpretation ? getSignLunationData(interpretation.sign) : null;
  
  // Format key phase dates for the AI prompt
  const formatKeyPhasesForPrompt = (): string => {
    if (!keyPhases) return '';
    
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let result = 'KEY PHASE DATES THIS CYCLE:\n';
    if (keyPhases.firstQuarter) {
      result += `- First Quarter Moon: ${formatDate(keyPhases.firstQuarter.date)} (Moon in ${keyPhases.firstQuarter.sign})\n`;
    }
    if (keyPhases.fullMoon) {
      result += `- Full Moon: ${formatDate(keyPhases.fullMoon.date)} (Moon in ${keyPhases.fullMoon.sign})\n`;
    }
    if (keyPhases.lastQuarter) {
      result += `- Last Quarter Moon: ${formatDate(keyPhases.lastQuarter.date)} (Moon in ${keyPhases.lastQuarter.sign})\n`;
    }
    return result;
  };
  
  // Fetch AI-enhanced lunar cycle insight
  // Build natal chart context for the AI prompt
  const buildNatalChartContext = (): string => {
    if (!activeChart || !interpretation) return '';
    
    const newMoonDegree = interpretation.degree + (ZODIAC_SIGNS.indexOf(interpretation.sign) * 30);
    const natalAspectsForPrompt = getNatalAspects();
    
    // Get all natal planet positions
    const natalPositions = Object.entries(activeChart.planets)
      .filter(([_, data]) => data)
      .map(([planet, data]) => {
        const planetData = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
        return `${planet}: ${Math.floor(planetData.degree)}° ${planetData.sign}${planetData.isRetrograde ? ' ℞' : ''}`;
      })
      .join('\n');
    
    // Find which house the New Moon falls in
    let newMoonHouse = 'unknown';
    if (activeChart.houseCusps) {
      const cusps = activeChart.houseCusps;
      const cuspLongitudes: number[] = [];
      for (let i = 1; i <= 12; i++) {
        const cusp = cusps[`house${i}` as keyof typeof cusps];
        if (cusp) {
          const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
          cuspLongitudes.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
        }
      }
      if (cuspLongitudes.length === 12) {
        for (let i = 0; i < 12; i++) {
          const nextI = (i + 1) % 12;
          let start = cuspLongitudes[i];
          let end = cuspLongitudes[nextI];
          if (end < start) end += 360;
          let nmDeg = newMoonDegree;
          if (nmDeg < start) nmDeg += 360;
          if (nmDeg >= start && nmDeg < end) {
            newMoonHouse = `${i + 1}`;
            break;
          }
        }
      }
    }
    
    const aspectsText = natalAspectsForPrompt.length > 0
      ? natalAspectsForPrompt.map(a => `- New Moon ${a.aspect} natal ${a.planet} (orb: ${a.orb.toFixed(1)}°)`).join('\n')
      : 'No major aspects to natal planets';
    
    return `
PERSONALIZED FOR: ${activeChart.name}
Birth Date: ${activeChart.birthDate || 'Unknown'}
Birth Location: ${activeChart.birthLocation || 'Unknown'}

NATAL CHART POSITIONS:
${natalPositions}

NEW MOON HOUSE PLACEMENT: ${newMoonHouse !== 'unknown' ? `${newMoonHouse}th House` : 'Unknown'}

ASPECTS TO NATAL CHART:
${aspectsText}
`;
  };

  const fetchLunarCycleInsight = async () => {
    if (!interpretation || aiInsight) return;
    
    setIsLoading(true);
    try {
      const keyPhasesInfo = formatKeyPhasesForPrompt();
      const natalContext = buildNatalChartContext();
      const isPersonalized = !!activeChart;
      
      const personalizedInstructions = isPersonalized ? `
This is a PERSONALIZED reading for ${activeChart?.name}. Make the entire reading specific to their natal chart:
- Reference their natal planets and the aspects the New Moon makes to them
- Discuss which house this New Moon falls in and what that means for their specific life areas
- Mention any natal planets that are activated by this lunation
- Use their name throughout the reading
- Make the guidance personal and specific, not generic

${natalContext}` : '';

      // Get current planetary positions to prevent AI hallucinations
      const nowPlanets = getPlanetaryPositions(new Date());
      const signGlyphMap: Record<string, string> = { '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo','♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces' };
      const transitPositions = Object.entries(nowPlanets)
        .filter(([key]) => ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(key))
        .map(([key, val]: [string, any]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          sign: val?.signName || signGlyphMap[val?.sign] || val?.sign || 'Unknown',
          degree: typeof val?.degree === 'number' ? val.degree.toFixed(1) : val?.degree || 0,
        }));

      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: newMoons?.previous.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: 'New Moon',
          moonSign: interpretation.sign,
          planetPositions: transitPositions,
          referenceExcerpts: buildRefBlock(),
          customPrompt: `Write a detailed ${isPersonalized ? 'PERSONALIZED ' : ''}NEW MOON CYCLE interpretation for the ${interpretation.sign} New Moon at ${interpretation.degree}°.
${personalizedInstructions}
LUNAR CYCLE CONTEXT:
- Sign: ${interpretation.sign} (${interpretation.element} element, ${interpretation.modality} modality)
- Degree: ${interpretation.degree}°
- Ruler: ${interpretation.ruler} in ${interpretation.rulerSign}${interpretation.rulerRetrograde ? ' (Retrograde)' : ''}
- Sign Theme: ${interpretation.signTheme}
${interpretation.hasStellium ? `- STELLIUM: ${interpretation.stelliumPlanets.join(', ')} in ${interpretation.stelliumSign}` : ''}
${interpretation.conjunctions.length > 0 ? `- Planets Conjunct New Moon: ${interpretation.conjunctions.map(c => c.name).join(', ')}` : ''}
${interpretation.aspects.length > 0 ? `- Major Aspects: ${interpretation.aspects.map(a => `${a.planet} ${a.aspectType}`).join(', ')}` : ''}

${keyPhasesInfo}

Write in a professional astrologer's voice with these sections:
## 🌑 ${isPersonalized ? `This Lunar Cycle for ${activeChart?.name}` : 'This Lunar Cycle\'s Theme'}
${isPersonalized ? `A 2-3 paragraph exploration of how this ${interpretation.sign} New Moon activates ${activeChart?.name}'s natal chart. Reference the house placement and any natal aspects.` : 'A 2-3 paragraph exploration of what this particular New Moon is initiating. Reference the sign, degree, and any powerful conjunctions or stelliums.'}

## ✨ ${isPersonalized ? `${activeChart?.name}'s Soul Intention` : 'Soul Intention for This Cycle'}
${isPersonalized ? `What ${activeChart?.name}'s soul is being asked to grow into during these 29 days, based on their natal chart activation.` : 'What the soul is being asked to grow into during these 29 days. Be specific and psychological.'}

## 🎯 ${isPersonalized ? `What ${activeChart?.name} Should Focus On` : 'What to Focus On'}
${isPersonalized ? `Specific themes, projects, or inner work for ${activeChart?.name} based on which houses and planets are activated.` : 'Bullet points of specific themes, projects, or inner work favored by this lunar energy.'}

## ⚠️ ${isPersonalized ? `What ${activeChart?.name} Should Release` : 'What to Release'}
${isPersonalized ? `What ${activeChart?.name} needs to let go of to make space for this new energy, considering their natal patterns.` : 'What needs to be let go of to make space for this new energy.'}

## 🌟 Power Days This Cycle${isPersonalized ? ` for ${activeChart?.name}` : ''}
Use the KEY PHASE DATES provided above. For each date, give the exact date, the Moon's sign at that time, and 1-2 sentences about how to use that energy${isPersonalized ? ` specifically for ${activeChart?.name}` : ''}. DO NOT use placeholders like [INSERT DATE] - use the actual dates provided.

Keep the tone deep, insightful, and practically applicable.`
        }
      });
      
      if (data?.insight) {
        setAiInsight(data.insight);
      }
    } catch (err) {
      console.error('Failed to fetch lunar cycle insight:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for natal chart aspects to this new moon
  const getNatalAspects = () => {
    if (!activeChart || !interpretation) return [];
    
    const newMoonDegree = interpretation.degree + (ZODIAC_SIGNS.indexOf(interpretation.sign) * 30);
    const aspects: Array<{ planet: string; aspect: string; orb: number }> = [];
    
    Object.entries(activeChart.planets).forEach(([planet, data]) => {
      const planetData = data as { sign: string; degree: number; house?: number };
      const planetDegree = planetData.degree + (ZODIAC_SIGNS.indexOf(planetData.sign) * 30);
      let diff = Math.abs(newMoonDegree - planetDegree);
      if (diff > 180) diff = 360 - diff;
      
      // Check for major aspects
      if (diff < 8) {
        aspects.push({ planet, aspect: 'Conjunction', orb: diff });
      } else if (Math.abs(diff - 60) < 6) {
        aspects.push({ planet, aspect: 'Sextile', orb: Math.abs(diff - 60) });
      } else if (Math.abs(diff - 90) < 8) {
        aspects.push({ planet, aspect: 'Square', orb: Math.abs(diff - 90) });
      } else if (Math.abs(diff - 120) < 8) {
        aspects.push({ planet, aspect: 'Trine', orb: Math.abs(diff - 120) });
      } else if (Math.abs(diff - 180) < 8) {
        aspects.push({ planet, aspect: 'Opposition', orb: Math.abs(diff - 180) });
      }
    });
    
    return aspects.sort((a, b) => a.orb - b.orb);
  };
  
  if (!newMoons || !interpretation) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const natalAspects = getNatalAspects();
  
  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      {(userNatalChart || savedCharts.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Personalize for:
            </label>
            <Select value={localSelectedChart} onValueChange={handleChartChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a chart" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">☽ General (Collective)</SelectItem>
                {userNatalChart && (
                  <SelectItem value="user">⭐ {userNatalChart.name || 'My Chart'}</SelectItem>
                )}
                {savedCharts.map((chart) => (
                  <SelectItem key={chart.id} value={chart.id || ''}>
                    {chart.name || 'Unnamed Chart'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activeChart && (
            <Badge variant="secondary" className="self-start">
              Personalized for {activeChart.name || 'Your Chart'}
            </Badge>
          )}
        </div>
      )}

      {/* Lunar Cycle Header */}
      <Card className="bg-background border">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-2xl font-light flex items-center gap-3">
            <span className="text-4xl">🌑</span>
            {ZODIAC_SYMBOLS[interpretation.sign]} {interpretation.sign} New Moon Cycle
          </CardTitle>
          <p className="text-muted-foreground">
            {newMoons.previous.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {newMoons.next.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cycle Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Day {daysIntoCycle + 1} of ~29</span>
              <span className="font-medium">{getMoonPhaseEmoji(currentPhase.phaseName)} {currentPhase.phaseName}</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${ELEMENT_COLORS[interpretation.element].replace('text-', 'bg-')} transition-all`}
                style={{ width: `${cycleProgress}%` }}
              />
            </div>
          </div>
          
          {/* Key Facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Degree</p>
              <p className="text-lg font-bold">{interpretation.degree}° {interpretation.sign}</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Element</p>
              <p className={`text-lg font-bold ${ELEMENT_COLORS[interpretation.element]}`}>{interpretation.element}</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Modality</p>
              <p className="text-lg font-bold">{interpretation.modality}</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Ruler</p>
              <p className="text-lg font-bold">
                {interpretation.rulerSymbol} {interpretation.ruler}
                {interpretation.rulerRetrograde && <span className="text-amber-500 text-sm ml-1">℞</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Expressions & Shadow */}
      {signLunationData && (
        <Collapsible open={sectionsOpen.expressions} onOpenChange={() => toggleSection('expressions')}>
          <Card className="bg-background border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
                <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{ZODIAC_SYMBOLS[interpretation.sign]}</span>
                    {interpretation.sign} Expressions
                  </span>
                  {sectionsOpen.expressions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Overview */}
                <p className="text-foreground/90 leading-relaxed">{signLunationData.overview}</p>
                <p className="text-sm text-muted-foreground italic">{signLunationData.seedGuidance}</p>
                
                {/* Ruler Note if exists */}
                {signLunationData.rulerNote && (
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm text-foreground/90">{signLunationData.rulerNote}</p>
                  </div>
                )}
                
                {/* Expressions */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" /> {interpretation.sign} Qualities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {signLunationData.expressions.map((word, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Shadow */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" /> When Unbalanced
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {signLunationData.shadow.map((word, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-muted-foreground">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Intention Words */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2 text-sm text-primary">
                    ✍️ Use These Words When Writing Intentions
                  </h4>
                  <p className="text-sm text-foreground/80 italic">
                    {signLunationData.intentionWords.join(' • ')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {interpretation.sign} asks for clear language and practical support. Also saying "no" to what doesn't matter so you can say "yes" to what does.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Themes of This Lunation */}
      {signLunationData && signLunationData.themes.length > 0 && (
        <Collapsible open={sectionsOpen.themes} onOpenChange={() => toggleSection('themes')}>
          <Card className="bg-background border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
                <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Themes of This {interpretation.sign} New Moon
                  </span>
                  {sectionsOpen.themes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {signLunationData.themes.map((theme, i) => (
                  <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">{theme.title}</h4>
                    <p className="text-sm text-foreground/80">{theme.description}</p>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground italic">
                  Begin with integrity, plant seeds step by step, trust that you don't need to know the whole plan yet — what is no longer working is meant to dissolve.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Lunation Cycle Dates */}
      {keyPhases && (
        <Collapsible open={sectionsOpen.cycleDates} onOpenChange={() => toggleSection('cycleDates')}>
          <Card className="bg-background border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
                <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {interpretation.sign} Lunation Cycle
                  </span>
                  {sectionsOpen.cycleDates ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-3">
                  {/* New Moon */}
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <span className="text-2xl">🌑</span>
                    <div className="flex-1">
                      <p className="font-medium">New Moon</p>
                      <p className="text-sm text-muted-foreground">
                        {newMoons?.previous.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge>{interpretation.degree}° {interpretation.sign}</Badge>
                  </div>
                  
                  {/* First Quarter */}
                  {keyPhases.firstQuarter && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <span className="text-2xl">🌓</span>
                      <div className="flex-1">
                        <p className="font-medium">First Quarter Moon</p>
                        <p className="text-sm text-muted-foreground">
                          {keyPhases.firstQuarter.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="secondary">{keyPhases.firstQuarter.sign}</Badge>
                    </div>
                  )}
                  
                  {/* Full Moon */}
                  {keyPhases.fullMoon && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <span className="text-2xl">🌕</span>
                      <div className="flex-1">
                        <p className="font-medium">Full Moon</p>
                        <p className="text-sm text-muted-foreground">
                          {keyPhases.fullMoon.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="secondary">{keyPhases.fullMoon.sign}</Badge>
                    </div>
                  )}
                  
                  {/* Last Quarter */}
                  {keyPhases.lastQuarter && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <span className="text-2xl">🌗</span>
                      <div className="flex-1">
                        <p className="font-medium">Last Quarter Moon</p>
                        <p className="text-sm text-muted-foreground">
                          {keyPhases.lastQuarter.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="secondary">{keyPhases.lastQuarter.sign}</Badge>
                    </div>
                  )}
                  
                  {/* Balsamic Moon */}
                  {newMoons?.next && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <span className="text-2xl">🌘</span>
                      <div className="flex-1">
                        <p className="font-medium">Balsamic ☽</p>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            // Balsamic phase is approximately 3-4 days before the new moon
                            const balsamicStart = new Date(newMoons.next.date);
                            balsamicStart.setDate(balsamicStart.getDate() - 4);
                            const balsamicEnd = new Date(newMoons.next.date);
                            balsamicEnd.setDate(balsamicEnd.getDate() - 1);
                            return `${balsamicStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${balsamicEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                          })()}
                        </p>
                      </div>
                      <Badge variant="secondary">Rest & Release</Badge>
                    </div>
                  )}
                  
                  {/* Next New Moon */}
                  {newMoons?.next && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-2xl">🌑</span>
                      <div className="flex-1">
                        <p className="font-medium">Next New Moon</p>
                        <p className="text-sm text-muted-foreground">
                          {newMoons.next.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="outline">{ZODIAC_SIGNS[Math.floor(((newMoons.next.longitude % 360) + 360) % 360 / 30)]}</Badge>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Look to see which house contains {interpretation.degree}° {interpretation.sign} in your chart. This house shows where these themes surface for you.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
      
      {/* Current Phase Guidance */}
      <Card className="bg-background border">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg font-light flex items-center gap-2">
            {getMoonPhaseEmoji(currentPhase.phaseName)} Current Phase: {currentPhase.phaseName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3 italic">"{phaseGuidance.theme}"</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                <Target className="h-4 w-4" /> Favored Activities
              </p>
              <ul className="space-y-1">
                {phaseGuidance.activities.map((activity, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-primary">•</span> {activity}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Eye className="h-4 w-4" /> Avoid
              </p>
              <ul className="space-y-1">
                {phaseGuidance.avoid.map((item, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">○</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Collapsible: Main Theme & Interpretation */}
      <Collapsible open={sectionsOpen.theme} onOpenChange={() => toggleSection('theme')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
              <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  New Moon Theme & Energy
                </span>
                {sectionsOpen.theme ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground/90 leading-relaxed">{interpretation.mainTheme}</p>
              </div>
              
              {interpretation.conjunctions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Conjunct:</span>
                  {interpretation.conjunctions.map((planet, i) => (
                    <Badge key={i} variant="secondary">
                      {planet.symbol} {planet.name}
                      {planet.isRetrograde && <span className="ml-1 text-amber-500">℞</span>}
                    </Badge>
                  ))}
                </div>
              )}
              
              {interpretation.hasStellium && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">⭐ {interpretation.stelliumPlanets.length}-Planet Stellium in {interpretation.stelliumSign}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Concentrated energy — this cycle carries extra weight in {interpretation.stelliumSign} themes.
                  </p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Collapsible: Soul Intentions */}
      <Collapsible open={sectionsOpen.intentions} onOpenChange={() => toggleSection('intentions')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
              <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Soul Intentions & Practical Guidance
                </span>
                {sectionsOpen.intentions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> What to Set Intentions Around
                </h4>
                <p className="text-sm text-foreground/90">{interpretation.whatToSet}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> How to Work This Energy
                </h4>
                <p className="text-sm text-foreground/90">{interpretation.howToWork}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" /> Soul-Level Message
                </h4>
                <p className="text-sm text-foreground/90 italic">{interpretation.soulLevel}</p>
              </div>
              
              <div className="p-3 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Practical Advice
                </h4>
                <p className="text-sm text-foreground/90">{interpretation.practicalAdvice}</p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Collapsible: Aspects to New Moon */}
      {interpretation.aspects.length > 0 && (
        <Collapsible open={sectionsOpen.aspects} onOpenChange={() => toggleSection('aspects')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
                <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-primary" />
                    Planetary Aspects to This New Moon
                  </span>
                  {sectionsOpen.aspects ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-3">
                  {interpretation.aspects.map((aspect, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                      <span className="text-xl">{aspect.symbol}</span>
                      <div className="flex-1">
                        <p className="font-medium">
                          {aspect.aspectSymbol} {aspect.aspectType.charAt(0).toUpperCase() + aspect.aspectType.slice(1)} to {aspect.planet}
                          <span className="text-muted-foreground text-sm ml-2">({aspect.orb.toFixed(1)}° orb)</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{aspect.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
      
      {/* Collapsible: Your Chart & This New Moon */}
      {activeChart && natalAspects.length > 0 && (
        <Collapsible open={sectionsOpen.chart} onOpenChange={() => toggleSection('chart')}>
          <Card className="bg-background border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
                <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    This New Moon in {activeChart.name ? `${activeChart.name}'s Chart` : 'YOUR Chart'}
                  </span>
                  <Badge variant="secondary">{natalAspects.length} aspects</Badge>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  The {interpretation.sign} New Moon at {interpretation.degree}° activates these points in the natal chart:
                </p>
                <div className="space-y-2">
                  {natalAspects.map((aspect, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="font-medium capitalize">{aspect.planet}</span>
                      <Badge variant={aspect.aspect === 'Conjunction' || aspect.aspect === 'Trine' || aspect.aspect === 'Sextile' ? 'default' : 'secondary'}>
                        {aspect.aspect} ({aspect.orb.toFixed(1)}°)
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
      
      {/* Collapsible: Full Cycle Overview */}
      <Collapsible open={sectionsOpen.phases} onOpenChange={() => toggleSection('phases')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
              <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Full Lunar Cycle: {cycleDays.length} Days
                </span>
                {sectionsOpen.phases ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {cycleDays.map((day, idx) => {
                  const isToday = day.date.toDateString() === today.toDateString();
                  const isPast = day.date < today;
                  
                  return (
                    <div 
                      key={idx}
                      className={`text-center p-2 rounded-lg text-xs transition-all ${
                        isToday 
                          ? 'bg-primary/20 border-2 border-primary' 
                          : isPast 
                            ? 'bg-muted/30 text-muted-foreground' 
                            : 'bg-secondary/30'
                      }`}
                    >
                      <p className="font-medium">{day.date.getDate()}</p>
                      <p className="text-lg my-1">{getMoonPhaseEmoji(day.moonPhase)}</p>
                      <p className="text-[10px] text-muted-foreground">{ZODIAC_SYMBOLS[day.moonSign]}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Lunar Workbook Section - Only shows when a chart is selected */}
      {activeChart && newMoons && keyPhases && (
        <LunarWorkbookSection
          chartId={activeChart.id || 'user'}
          chartName={activeChart.name || 'Your Chart'}
          cycleStartDate={newMoons.previous.date}
          cycleSign={interpretation.sign}
          cycleDegree={interpretation.degree}
          keyPhases={keyPhases}
          signData={signLunationData}
          balsamicStart={(() => {
            const start = new Date(newMoons.next.date);
            start.setDate(start.getDate() - 4);
            return start;
          })()}
          balsamicEnd={(() => {
            const end = new Date(newMoons.next.date);
            end.setDate(end.getDate() - 1);
            return end;
          })()}
          natalContext={{
            natalPlanets: Object.entries(activeChart.planets)
              .filter(([_, data]) => data)
              .map(([planet, data]) => {
                const planetData = data as { sign: string; degree: number };
                return `${planet}: ${Math.floor(planetData.degree)}° ${planetData.sign}`;
              })
              .join(', '),
            newMoonHouse: (() => {
              if (!activeChart.houseCusps) return undefined;
              const newMoonDegree = interpretation.degree + (ZODIAC_SIGNS.indexOf(interpretation.sign) * 30);
              const cusps = activeChart.houseCusps;
              const cuspLongitudes: number[] = [];
              for (let i = 1; i <= 12; i++) {
                const cusp = cusps[`house${i}` as keyof typeof cusps];
                if (cusp) {
                  const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
                  cuspLongitudes.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
                }
              }
              if (cuspLongitudes.length === 12) {
                for (let i = 0; i < 12; i++) {
                  const nextI = (i + 1) % 12;
                  let start = cuspLongitudes[i];
                  let end = cuspLongitudes[nextI];
                  if (end < start) end += 360;
                  let nmDeg = newMoonDegree;
                  if (nmDeg < start) nmDeg += 360;
                  if (nmDeg >= start && nmDeg < end) return `${i + 1}`;
                }
              }
              return undefined;
            })(),
            natalAspects: natalAspects.length > 0 
              ? natalAspects.map(a => `${a.aspect} ${a.planet}`).join(', ') 
              : undefined
          }}
        />
      )}
      
      {/* AI-Enhanced Insight Button */}
      <Card className="bg-background border">
        <CardContent className="p-4">
          {!aiInsight ? (
            <Button 
              onClick={fetchLunarCycleInsight} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating deep insight...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI-Enhanced Lunar Cycle Reading
                </>
              )}
            </Button>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="font-serif text-lg font-medium text-foreground mt-4 mb-2 pb-1 border-b border-border first:mt-0">
                      {children}
                    </h2>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-1 my-2">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="text-foreground/90 leading-relaxed my-2 text-sm">{children}</p>
                  ),
                }}
              >
                {aiInsight}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

