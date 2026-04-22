import { useState, useEffect, useMemo } from "react";
import { Moon, Sparkles, Calendar, Target, Eye, Heart, Briefcase, Zap, ChevronDown, ChevronUp, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartSelector } from "@/components/ChartSelector";
import * as Astronomy from 'astronomy-engine';
import { getNewMoonInterpretation, NewMoonInterpretation } from "@/lib/newMoonInterpretations";
import { getPlanetaryPositions, getMoonPhase } from "@/lib/astrology";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentExcerpts } from "@/hooks/useDocumentExcerpts";
import ReactMarkdown from "react-markdown";
import { NatalChart } from "@/hooks/useNatalChart";
import { getSignLunationData, SignLunationData } from "@/lib/signLunationData";
import { getEffectiveOrb as getEffectiveOrbFn, getTransitOrb as getTransitOrbFn } from "@/lib/aspectOrbs";
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
  firstQuarter: { date: Date; sign: string; degree: number; longitude: number } | null;
  fullMoon: { date: Date; sign: string; degree: number; longitude: number } | null;
  lastQuarter: { date: Date; sign: string; degree: number; longitude: number } | null;
}

function findKeyPhaseDates(newMoonDate: Date): KeyPhaseDates {
  const firstQuarterSearch = Astronomy.SearchMoonPhase(90, newMoonDate, 15);
  const fullMoonSearch = Astronomy.SearchMoonPhase(180, newMoonDate, 20);
  const lastQuarterSearch = Astronomy.SearchMoonPhase(270, newMoonDate, 25);
  
  const getInfoAtDate = (date: Date): { sign: string; degree: number; longitude: number } => {
    try {
      const vector = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
      const ecliptic = Astronomy.Ecliptic(vector);
      const lon = ((ecliptic.elon % 360) + 360) % 360;
      const signIndex = Math.floor(lon / 30);
      return { sign: ZODIAC_SIGNS[signIndex], degree: Math.floor(lon % 30), longitude: lon };
    } catch {
      return { sign: 'Unknown', degree: 0, longitude: 0 };
    }
  };
  
  return {
    firstQuarter: firstQuarterSearch ? { date: firstQuarterSearch.date, ...getInfoAtDate(firstQuarterSearch.date) } : null,
    fullMoon: fullMoonSearch ? { date: fullMoonSearch.date, ...getInfoAtDate(fullMoonSearch.date) } : null,
    lastQuarter: lastQuarterSearch ? { date: lastQuarterSearch.date, ...getInfoAtDate(lastQuarterSearch.date) } : null,
  };
}

// Find the previous and next new moons (with cycle offset)
function findNewMoons(referenceDate: Date, cycleOffset = 0): { previous: { date: Date; longitude: number }; next: { date: Date; longitude: number } } {
  let searchDate = new Date(referenceDate);
  if (cycleOffset !== 0) searchDate.setDate(searchDate.getDate() + cycleOffset * 30);

  const prevSearch = Astronomy.SearchMoonPhase(0, searchDate, -30);
  const nextSearch = Astronomy.SearchMoonPhase(0, searchDate, 30);
  
  const prevDate = prevSearch?.date || new Date(searchDate.getTime() - 29.5 * 24 * 60 * 60 * 1000);
  const nextDate = nextSearch?.date || new Date(searchDate.getTime() + 29.5 * 24 * 60 * 60 * 1000);
  
  const prevVector = Astronomy.GeoVector(Astronomy.Body.Moon, prevDate, false);
  const prevEcliptic = Astronomy.Ecliptic(prevVector);
  
  const nextVector = Astronomy.GeoVector(Astronomy.Body.Moon, nextDate, false);
  const nextEcliptic = Astronomy.Ecliptic(nextVector);
  
  return {
    previous: { date: prevDate, longitude: prevEcliptic.elon },
    next: { date: nextDate, longitude: nextEcliptic.elon }
  };
}

// Find the nearest New Moon in a specific sign (searching forward or backward)
function findNewMoonInSign(sign: string, direction: 'next' | 'previous', fromDate: Date): Date | null {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex < 0) return null;
  
  let searchDate = new Date(fromDate);
  // Search up to 14 cycles (~14 months) to guarantee finding the sign
  for (let i = 0; i < 14; i++) {
    const offset = direction === 'next' ? 30 : -30;
    const nm = Astronomy.SearchMoonPhase(0, searchDate, offset);
    if (!nm) { searchDate.setDate(searchDate.getDate() + offset); continue; }
    
    const vec = Astronomy.GeoVector(Astronomy.Body.Moon, nm.date, false);
    const ecl = Astronomy.Ecliptic(vec);
    const lon = ((ecl.elon % 360) + 360) % 360;
    const nmSignIndex = Math.floor(lon / 30);
    
    if (nmSignIndex === signIndex) return nm.date;
    
    // Move search cursor past this New Moon
    searchDate = new Date(nm.date.getTime() + (direction === 'next' ? 2 : -2) * 24 * 60 * 60 * 1000);
  }
  return null;
}

// Calculate which natal house a given ecliptic longitude falls in
function calculateNatalHouse(longitude: number, houseCusps: NatalChart['houseCusps']): number | null {
  if (!houseCusps) return null;
  const cuspLongitudes: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      cuspLongitudes.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
    }
  }
  if (cuspLongitudes.length !== 12) return null;
  for (let i = 0; i < 12; i++) {
    const nextI = (i + 1) % 12;
    let start = cuspLongitudes[i];
    let end = cuspLongitudes[nextI];
    if (end < start) end += 360;
    let deg = longitude;
    if (deg < start) deg += 360;
    if (deg >= start && deg < end) return i + 1;
  }
  return 1;
}

// Find natal aspects to a given longitude (Moon phase → natal planet)
function findPhaseNatalAspects(longitude: number, chart: NatalChart) {
  const aspects: Array<{ planet: string; aspect: string; orb: number; symbol: string }> = [];
  const aspectDefs = [
    { name: 'Conjunction', angle: 0, symbol: '☌', key: 'conjunction' },
    { name: 'Semi-sextile', angle: 30, symbol: '⚺', key: 'semisextile' },
    { name: 'Sextile', angle: 60, symbol: '⚹', key: 'sextile' },
    { name: 'Square', angle: 90, symbol: '□', key: 'square' },
    { name: 'Trine', angle: 120, symbol: '△', key: 'trine' },
    { name: 'Quincunx', angle: 150, symbol: '⚻', key: 'quincunx' },
    { name: 'Opposition', angle: 180, symbol: '☍', key: 'opposition' },
  ];

  Object.entries(chart.planets).forEach(([planet, data]) => {
    if (!data) return;
    const pd = data as { sign: string; degree: number; minutes?: number };
    const planetLon = ZODIAC_SIGNS.indexOf(pd.sign) * 30 + pd.degree + (pd.minutes || 0) / 60;
    let diff = Math.abs(longitude - planetLon);
    if (diff > 180) diff = 360 - diff;
    
    for (const ad of aspectDefs) {
      // Moon is the transiting body here; use planet-specific orbs
      const effectiveOrb = getEffectiveOrbFn('Moon', planet, ad.key);
      if (Math.abs(diff - ad.angle) <= effectiveOrb) {
        aspects.push({ planet, aspect: ad.name, orb: Math.abs(diff - ad.angle), symbol: ad.symbol });
        break;
      }
    }
  });
  return aspects.sort((a, b) => a.orb - b.orb);
}

// Find outer planet transits active at a given date
function findTransitAspectsAtDate(date: Date, chart: NatalChart): Array<{ transit: string; natal: string; aspect: string; orb: number; symbol: string }> {
  const results: Array<{ transit: string; natal: string; aspect: string; orb: number; symbol: string }> = [];
  const transitBodies: Array<{ name: string; body: Astronomy.Body }> = [
    { name: 'Uranus', body: Astronomy.Body.Uranus },
    { name: 'Neptune', body: Astronomy.Body.Neptune },
    { name: 'Pluto', body: Astronomy.Body.Pluto },
    { name: 'Saturn', body: Astronomy.Body.Saturn },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  ];
  
  const aspectDefs = [
    { name: 'Conjunction', angle: 0, symbol: '☌', key: 'conjunction' },
    { name: 'Square', angle: 90, symbol: '□', key: 'square' },
    { name: 'Opposition', angle: 180, symbol: '☍', key: 'opposition' },
    { name: 'Trine', angle: 120, symbol: '△', key: 'trine' },
    { name: 'Sextile', angle: 60, symbol: '⚹', key: 'sextile' },
  ];

  for (const tb of transitBodies) {
    try {
      const vec = Astronomy.GeoVector(tb.body, date, false);
      const ecl = Astronomy.Ecliptic(vec);
      const transitLon = ((ecl.elon % 360) + 360) % 360;
      
      Object.entries(chart.planets).forEach(([planet, data]) => {
        if (!data) return;
        const pd = data as { sign: string; degree: number; minutes?: number };
        const natalLon = ZODIAC_SIGNS.indexOf(pd.sign) * 30 + pd.degree + (pd.minutes || 0) / 60;
        let diff = Math.abs(transitLon - natalLon);
        if (diff > 180) diff = 360 - diff;
        
        for (const ad of aspectDefs) {
          const effectiveOrb = getTransitOrbFn(tb.name, planet, ad.key);
          if (Math.abs(diff - ad.angle) <= effectiveOrb) {
            results.push({ transit: tb.name, natal: planet, aspect: ad.name, orb: Math.abs(diff - ad.angle), symbol: ad.symbol });
            break;
          }
        }
      });
    } catch { /* skip */ }
  }
  return results;
}

const ordinalLCV = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

const HOUSE_TOPICS_LCV: Record<number, string> = {
  1: "identity · body · self-presentation",
  2: "money · values · security",
  3: "communication · siblings · learning",
  4: "home · family · roots",
  5: "creativity · romance · play",
  6: "work · health · routines",
  7: "relationships · agreements",
  8: "intimacy · fear · transformation",
  9: "beliefs · teaching · meaning",
  10: "career · visibility · calling",
  11: "friends · groups · future goals",
  12: "rest · dreams · solitude",
};

// Phase house interpretations — subtle for new moon, intense for full moon
const PHASE_HOUSE_INTERP: Record<string, Record<number, string>> = {
  newMoon: {
    1: "A quiet seed drops into your sense of self. New beginnings around identity or appearance stir subtly — you may not notice until later.",
    2: "Something stirs around money, possessions, or self-worth. A new value is forming beneath the surface.",
    3: "A new idea, conversation, or learning path wants to begin. Communication opens gently.",
    4: "The seed falls into your emotional foundations — home, family, roots. Something private and deep is beginning.",
    5: "Creative energy stirs. Joy, romance, play, or children may be involved. Something wants expression from the heart.",
    6: "A fresh start around health, daily routines, or work habits. The body asks for quiet attention.",
    7: "New energy enters relationships. A partnership may shift or ask for a new understanding.",
    8: "Deep water. Something around intimacy, shared resources, or transformation is seeding beneath the surface.",
    9: "A new belief or direction is forming. Travel, education, or meaning-making may be involved.",
    10: "Career or public role gets a subtle reset. Something is changing in how the world sees you.",
    11: "New energy in friendships, groups, or future visions. Community connections quietly shift.",
    12: "The quietest seed. Something is forming in your unconscious, dreams, or spiritual life. Don't push.",
  },
  fullMoon: {
    1: "Who you are is illuminated. Others see you clearly now. Identity themes reach a powerful emotional peak.",
    2: "A financial or values matter culminates with intensity. What you've been building becomes visible.",
    3: "A communication or learning matter peaks. Information arrives with force. Words carry maximum impact.",
    4: "Home and emotional life reach a crescendo. Family dynamics or deep feelings demand attention.",
    5: "Creative projects, romance, or joy hit a powerful peak. What you've poured your heart into is on display.",
    6: "Health or work routine reaches a turning point. Daily life demands attention or reveals clear results.",
    7: "Relationship illumination. What's working and what isn't becomes impossible to ignore.",
    8: "Deep emotional or financial entanglements peak. Secrets surface. Transformation accelerates.",
    9: "A belief or educational path reaches fruition with intensity. What you've been reaching toward becomes clear.",
    10: "Career or reputation peaks powerfully. Professional recognition or a calling turning point arrives.",
    11: "Friendships, groups, or future goals culminate with emotional charge. A social matter demands resolution.",
    12: "Hidden things surface with force. Dreams intensify. What's been unconscious becomes visible.",
  },
  firstQuarter: {
    1: "Tension between your new direction and old habits. Push through — this friction builds something real.",
    2: "Money or values decisions create pressure. Choose between security and growth.",
    3: "A conversation or decision creates tension. Speak up — clarity comes through action.",
    4: "Home or family pressure needs active attention. Work through the tension, don't avoid it.",
    5: "Creative friction. Joy or romance asks for a bold, possibly vulnerable move.",
    6: "Work or health demands action. Adjust your daily routines — small moves matter most.",
    7: "Relationship friction drives growth. Honest communication is required right now.",
    8: "Trust or intimacy is tested. Go deeper, not wider.",
    9: "Beliefs face a challenge. Stay open — growth lives inside this friction.",
    10: "Career pressure. Step up and make the call even without perfect information.",
    11: "Social dynamics create productive tension. Which friendships actually support your growth?",
    12: "Inner conflict. The unconscious pushes against conscious plans. Rest if you can.",
  },
  lastQuarter: {
    1: "Release an outdated version of yourself. Who you were at the start of this cycle has already changed.",
    2: "Let go of a financial pattern or value that no longer serves you.",
    3: "Release a story or communication pattern that needs editing.",
    4: "Release an emotional pattern or family dynamic. Something in your inner life asks to be cleared.",
    5: "Let go of a creative project or romantic attachment that's run its course.",
    6: "Release a health habit or work pattern that has evolved past its usefulness.",
    7: "Release a relationship expectation. Partnerships need space to evolve.",
    8: "Release a fear or control pattern. What you surrender creates space.",
    9: "Release an old belief. Your understanding has evolved — let the old framework dissolve.",
    10: "Release a career expectation. Your calling is refining itself.",
    11: "Release a group affiliation or future plan that no longer aligns.",
    12: "Deep release. Something unconscious is completing. Trust the dissolving process.",
  },
  balsamic: {
    1: "Your sense of self is composting. Identity questions may feel heavy — let them dissolve rather than solving them.",
    2: "Financial or value patterns are distilling. What you thought mattered may be quietly shifting beneath the surface.",
    3: "Old stories and mental patterns are dissolving. Your mind may feel foggy — that's the clearing, not a problem.",
    4: "Home and emotional foundations are in deep release. Dreams about family or the past may surface. Rest here.",
    5: "Creative energy is at its lowest ebb. Joy and play need quiet — don't force expression right now.",
    6: "Health and routines are asking for rest, not optimization. Your body is processing. Listen to fatigue signals.",
    7: "Relationship patterns are composting. Don't try to fix anything right now — let things settle on their own.",
    8: "Deep psychic clearing. Old fears, grief, or control patterns are dissolving in the dark. This is sacred work.",
    9: "Beliefs and meaning-making are in retreat. You may feel lost or directionless — that's the old map dissolving.",
    10: "Career ambitions are at low tide. Professional identity is resetting in the dark. Don't push for visibility yet.",
    11: "Social energy is at its lowest. The desire to withdraw from groups or collective demands is valid and wise.",
    12: "The most natural balsamic placement. You are deep in the unconscious. Dreams, intuition, and spiritual impressions are vivid. Surrender.",
  },
};

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
  selectedChartId,
  onSelectChart 
}: LunarCycleViewProps) => {
  const [newMoons, setNewMoons] = useState<{ previous: { date: Date; longitude: number }; next: { date: Date; longitude: number } } | null>(null);
  const [interpretation, setInterpretation] = useState<NewMoonInterpretation | null>(null);
  const [cycleDays, setCycleDays] = useState<Array<{ date: Date; moonSign: string; moonPhase: string; dayNumber: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [keyPhases, setKeyPhases] = useState<KeyPhaseDates | null>(null);
  // Default to user's own chart when available, otherwise general
  const [localSelectedChart, setLocalSelectedChart] = useState(
    selectedChartId || (userNatalChart ? 'user' : 'general')
  );
  const [cycleOffset, setCycleOffset] = useState(0);
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
      const birthDate = new Date(activeChart.birthDate || '');
      return calculateActivationWindows(srPlanetPositions, latestSR.solarReturnYear, birthDate.getMonth(), birthDate.getDate());
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
    const moons = findNewMoons(today, cycleOffset);
    setNewMoons(moons);
    
    const interp = getNewMoonInterpretation(moons.previous.date, moons.previous.longitude);
    setInterpretation(interp);
    
    const days = getLunarCycleDays(moons.previous.date, moons.next.date);
    setCycleDays(days);
    
    const phases = findKeyPhaseDates(moons.previous.date);
    setKeyPhases(phases);
    
    setAiInsight(null);
  }, [cycleOffset]);
  
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
    
    // Pre-calculate house cusps for planet mapping
    const cuspLongitudes: number[] = [];
    if (activeChart.houseCusps) {
      for (let i = 1; i <= 12; i++) {
        const cusp = activeChart.houseCusps[`house${i}` as keyof typeof activeChart.houseCusps];
        if (cusp) {
          const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
          cuspLongitudes.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
        }
      }
    }
    const calcHouse = (absDeg: number): number | null => {
      if (cuspLongitudes.length !== 12) return null;
      for (let i = 0; i < 12; i++) {
        const nextI = (i + 1) % 12;
        let start = cuspLongitudes[i];
        let end = cuspLongitudes[nextI];
        if (end < start) end += 360;
        let d = absDeg;
        if (d < start) d += 360;
        if (d >= start && d < end) return i + 1;
      }
      return 1;
    };

    // Get all natal planet positions WITH calculated houses
    const natalPositions = Object.entries(activeChart.planets)
      .filter(([_, data]) => data)
      .map(([planet, data]) => {
        const planetData = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
        const deg = planetData.degree + (planetData.minutes || 0) / 60;
        const absDeg = ZODIAC_SIGNS.indexOf(planetData.sign) * 30 + deg;
        const house = calcHouse(absDeg);
        return `${planet}: ${Math.floor(planetData.degree)}°${String(planetData.minutes || 0).padStart(2, '0')}' ${planetData.sign}${house ? ` (House ${house})` : ''}${planetData.isRetrograde ? ' ℞' : ''}`;
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
${interpretation.hasStellium ? `- STELLIUM: ${interpretation.stelliumPlanets.join(', ')} in ${interpretation.stelliumSign}\n  FELT SENSE: ${interpretation.stelliumFeltSense}` : ''}
${interpretation.conjunctions.length > 0 ? `- Planets Conjunct New Moon: ${interpretation.conjunctions.map(c => `${c.symbol}${c.name} at ${c.degree.toFixed(1)}° ${c.sign}`).join(', ')}\n  IMPORTANT: For EACH conjunct planet, explain specifically HOW that planet's energy will be felt during this cycle. Saturn = weight, discipline, sober clarity. Neptune = dissolving boundaries, heightened intuition. Don't just say "concentrated energy" — describe the SOMATIC FELT SENSE of each planet.` : ''}
${interpretation.conjunctionPairSyntheses.length > 0 ? `- CONJUNCTION PAIR SYNTHESES (use these as the foundation for your interpretation of how these planets interact):\n${interpretation.conjunctionPairSyntheses.map(s => `  ${s}`).join('\n')}` : ''}
${interpretation.aspects.length > 0 ? `- Major Aspects: ${interpretation.aspects.map(a => `${a.planet} ${a.aspectType} (${a.orb.toFixed(1)}°)`).join(', ')}` : ''}

${keyPhasesInfo}

Write in a professional astrologer's voice with these sections:
## 🌑 ${isPersonalized ? `This Lunar Cycle for ${activeChart?.name}` : 'This Lunar Cycle\'s Theme'}
${isPersonalized ? `A 2-3 paragraph exploration of how this ${interpretation.sign} New Moon activates ${activeChart?.name}'s natal chart. Reference the SPECIFIC HOUSE where the New Moon falls and explain what that house governs. For EACH conjunct planet, explain HOW ${activeChart?.name} will physically/emotionally FEEL that planet's energy — use somatic language (weight, buzzing, softening, dissolving, charging). If there's a stellium, name every planet in it and explain the combined effect.` : `A 2-3 paragraph exploration of what this particular New Moon is initiating. For EACH conjunct planet, explain the FELT SENSE — how does Saturn feel different from Neptune? How does their conjunction change the texture of this cycle? Name every planet, explain each one's contribution, then synthesize.`}

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
  // Planet identity descriptions — what IS this body?
  const PLANET_IDENTITY: Record<string, string> = {
    Sun: 'Your core identity, ego, and life force — who you ARE at the deepest level.',
    Moon: 'Your emotional nature, instincts, and inner world — how you FEEL and what you need to feel safe.',
    Mercury: 'Your mind, communication style, and how you process information — how you THINK and speak.',
    Venus: 'Your values, love language, and relationship style — what you DESIRE and find beautiful.',
    Mars: 'Your drive, anger, and how you take action — what you FIGHT for and how you assert yourself.',
    Jupiter: 'Your growth edge, where luck finds you, and your sense of meaning — where life EXPANDS.',
    Saturn: 'Your discipline, fears, and mastery path — where you face your hardest LESSONS.',
    Uranus: 'Your need for freedom, where you break rules, and sudden insights — where you REBEL.',
    Neptune: 'Your spirituality, imagination, and blind spots — where you DISSOLVE boundaries.',
    Pluto: 'Your deepest power, shadow, and transformation — where you DIE and are REBORN.',
    NorthNode: 'Your soul\'s growth direction this lifetime — the unfamiliar territory you\'re meant to GROW into.',
    SouthNode: 'Your past-life gifts and comfort zone — what comes naturally but can hold you BACK.',
    Chiron: 'Your deepest wound that becomes your greatest healing gift — where you HURT and ultimately TEACH.',
    Ascendant: 'Your rising sign — the lens through which you meet the world and others\' first impression of you.',
    Midheaven: 'Your public reputation and career direction — how the world SEES your purpose.',
    Ceres: 'The asteroid of nurturing — how you CARE for others and need to be cared for. Mothering style, food, and body comfort.',
    Vesta: 'The asteroid of sacred focus — what you DEVOTE yourself to with ritual dedication. Your inner flame.',
    Juno: 'The asteroid of committed partnership — what you NEED in a long-term partner and marriage.',
    Pallas: 'The asteroid of strategic wisdom — how you see PATTERNS, solve problems, and fight for justice.',
    Lilith: 'Black Moon Lilith — your wild, untamed power that refuses to be domesticated. Raw feminine rage and authenticity.',
    PartOfFortune: 'An Arabic Part showing where worldly luck and material abundance flow most naturally.',
    Vertex: 'A fated point — encounters and events here feel destined, as if the universe arranged them.',
  };

  // Aspect type explanations — what does this geometric relationship DO?
  const ASPECT_WHAT: Record<string, { symbol: string; what: string }> = {
    Conjunction: {
      symbol: '☌',
      what: 'Same degree — the New Moon lands directly ON this point, fusing its energy with the lunar seed moment.',
    },
    Sextile: {
      symbol: '⚹',
      what: '60° apart — a gentle opening, like a door left ajar. Opportunity knocks but you have to walk through it.',
    },
    Square: {
      symbol: '□',
      what: '90° apart — friction and tension. The New Moon energy pushes against this part of your chart, creating pressure to act.',
    },
    Trine: {
      symbol: '△',
      what: '120° apart — natural flow and ease. The New Moon energy harmonizes with this part of your chart effortlessly.',
    },
    Opposition: {
      symbol: '☍',
      what: '180° apart — full polarity. The New Moon illuminates what\'s OPPOSITE this point, creating an awareness axis.',
    },
  };

  // Planet-in-sign somatic keywords — how does this planet express through this sign?
  const PLANET_SIGN_FEEL: Record<string, Record<string, string>> = {
    Sun: { Aries: 'assertive identity, physical courage', Taurus: 'steady self-worth, sensory grounding', Gemini: 'curious self-expression, mental agility', Cancer: 'protective instincts, emotional self-definition', Leo: 'radiant confidence, creative self-expression', Virgo: 'purposeful refinement, service-oriented identity', Libra: 'relational identity, aesthetic sensitivity', Scorpio: 'intense self-possession, psychological depth', Sagittarius: 'expansive vision, philosophical identity', Capricorn: 'disciplined ambition, structural authority', Aquarius: 'independent thinking, humanitarian identity', Pisces: 'empathic absorption, spiritual identity' },
    Moon: { Aries: 'emotional impulsiveness, need for independence', Taurus: 'emotional security through comfort and routine', Gemini: 'emotional processing through talking and thinking', Cancer: 'deep emotional sensitivity, nurturing needs', Leo: 'emotional warmth, need to be seen and appreciated', Virgo: 'emotional order, comfort through being useful', Libra: 'emotional harmony-seeking, need for partnership', Scorpio: 'emotional intensity, need for deep trust', Sagittarius: 'emotional freedom, need for meaning', Capricorn: 'emotional restraint, need for structure', Aquarius: 'emotional detachment, need for space', Pisces: 'emotional porousness, need for spiritual connection' },
    Mercury: { Aries: 'direct speech, fast thinking', Taurus: 'deliberate thinking, practical communication', Gemini: 'quick wit, verbal dexterity', Cancer: 'intuitive thinking, memory-driven communication', Leo: 'dramatic expression, authoritative speech', Virgo: 'analytical precision, detail-oriented mind', Libra: 'diplomatic communication, balanced thinking', Scorpio: 'penetrating insight, strategic speech', Sagittarius: 'big-picture thinking, philosophical communication', Capricorn: 'structured thinking, careful speech', Aquarius: 'innovative ideas, unconventional thinking', Pisces: 'imaginative thinking, poetic communication' },
    Venus: { Aries: 'passionate pursuit, bold attraction', Taurus: 'sensual pleasure, material comfort, loyalty', Gemini: 'intellectual attraction, flirtatious communication', Cancer: 'nurturing love, domestic comfort', Leo: 'generous affection, dramatic romance', Virgo: 'devoted service, practical care', Libra: 'harmonious partnership, aesthetic refinement', Scorpio: 'possessive depth, transformative love', Sagittarius: 'adventurous love, freedom in relationship', Capricorn: 'committed love, traditional values', Aquarius: 'unconventional attraction, friendship-based love', Pisces: 'romantic idealism, compassionate love' },
    Mars: { Aries: 'raw initiative, physical assertion', Taurus: 'slow-burn determination, stubborn endurance', Gemini: 'mental sparring, scattered energy', Cancer: 'protective fighting, indirect anger', Leo: 'proud action, dramatic assertion', Virgo: 'precise effort, critical energy', Libra: 'passive assertion, fighting for fairness', Scorpio: 'strategic intensity, controlled power', Sagittarius: 'bold risk-taking, restless action', Capricorn: 'disciplined effort, ambitious drive', Aquarius: 'rebellious action, unconventional methods', Pisces: 'compassionate action, diffuse energy' },
    Jupiter: { Aries: 'bold expansion, pioneering faith', Taurus: 'material abundance, sensory generosity', Gemini: 'intellectual growth, diverse exploration', Cancer: 'emotional generosity, family expansion', Leo: 'creative abundance, joyful expansion', Virgo: 'growth through service, practical wisdom', Libra: 'social expansion, relational abundance', Scorpio: 'transformative growth, deep research', Sagittarius: 'philosophical expansion, travel and teaching', Capricorn: 'structured growth, institutional authority', Aquarius: 'humanitarian expansion, innovative growth', Pisces: 'spiritual expansion, boundless compassion' },
    Saturn: { Aries: 'lessons in patience, disciplined courage', Taurus: 'material discipline, earning through persistence', Gemini: 'focused thinking, communication responsibilities', Cancer: 'emotional boundaries, family obligations', Leo: 'creative discipline, humble authority', Virgo: 'perfectionist standards, health discipline', Libra: 'relationship commitments, fairness obligations', Scorpio: 'power discipline, facing fears', Sagittarius: 'belief testing, structured faith', Capricorn: 'peak ambition, structural mastery', Aquarius: 'social responsibility, systemic reform', Pisces: 'spiritual discipline, surrendering control' },
    Uranus: { Aries: 'radical independence, identity disruption', Taurus: 'financial revolution, value upheaval', Gemini: 'mental breakthroughs, communication disruption', Cancer: 'family disruption, emotional liberation', Leo: 'creative revolution, ego disruption', Virgo: 'health innovation, routine disruption', Libra: 'relationship revolution, partnership disruption', Scorpio: 'power disruption, psychological breakthrough', Sagittarius: 'belief disruption, philosophical revolution', Capricorn: 'institutional disruption, structural revolution', Aquarius: 'social revolution, collective awakening', Pisces: 'spiritual disruption, collective awakening' },
    Neptune: { Aries: 'spiritual warrior, identity dissolution', Taurus: 'sensory transcendence, material confusion', Gemini: 'inspired communication, mental fog', Cancer: 'psychic sensitivity, emotional merging', Leo: 'creative inspiration, ego dissolution', Virgo: 'healing service, perfectionism dissolution', Libra: 'romantic idealism, relationship confusion', Scorpio: 'psychic depth, power dissolution', Sagittarius: 'spiritual seeking, belief confusion', Capricorn: 'institutional dissolution, structural confusion', Aquarius: 'collective dreaming, social idealism', Pisces: 'pure transcendence, boundless empathy' },
    Pluto: { Aries: 'identity transformation, power through courage', Taurus: 'material transformation, value crisis', Gemini: 'mental transformation, communication power', Cancer: 'family transformation, emotional power', Leo: 'creative transformation, ego death and rebirth', Virgo: 'health transformation, service power', Libra: 'relationship transformation, partnership power', Scorpio: 'total transformation, absolute power', Sagittarius: 'belief transformation, philosophical power', Capricorn: 'institutional transformation, structural power', Aquarius: 'social transformation, collective power', Pisces: 'spiritual transformation, transcendent power' },
    NorthNode: { Aries: 'growing into independence and initiative', Taurus: 'growing into self-worth and stability', Gemini: 'growing into curiosity and communication', Cancer: 'growing into emotional vulnerability', Leo: 'growing into creative self-expression', Virgo: 'growing into practical service', Libra: 'growing into partnership and compromise', Scorpio: 'growing into intimacy and transformation', Sagittarius: 'growing into faith and exploration', Capricorn: 'growing into authority and responsibility', Aquarius: 'growing into community and innovation', Pisces: 'growing into surrender and compassion' },
    Chiron: { Aries: 'wound around identity and self-assertion', Taurus: 'wound around self-worth and material security', Gemini: 'wound around communication and being heard', Cancer: 'wound around belonging and emotional safety', Leo: 'wound around being seen and creative expression', Virgo: 'wound around adequacy and perfectionism', Libra: 'wound around relationships and fairness', Scorpio: 'wound around trust, power, and vulnerability', Sagittarius: 'wound around meaning and belief', Capricorn: 'wound around achievement and recognition', Aquarius: 'wound around belonging and individuality', Pisces: 'wound around boundaries and spiritual connection' },
    Ceres: { Aries: 'nurturing through independence and encouragement', Taurus: 'nurturing through physical comfort, food, touch, and sensory care', Gemini: 'nurturing through conversation and mental stimulation', Cancer: 'nurturing through emotional holding and home-making', Leo: 'nurturing through praise, play, and creative encouragement', Virgo: 'nurturing through practical help and health care', Libra: 'nurturing through beauty, harmony, and companionship', Scorpio: 'nurturing through deep emotional presence and crisis support', Sagittarius: 'nurturing through adventure, teaching, and philosophical guidance', Capricorn: 'nurturing through structure, discipline, and providing security', Aquarius: 'nurturing through freedom, acceptance of differences, and community', Pisces: 'nurturing through spiritual care, compassion, and artistic expression' },
    Vesta: { Aries: 'sacred focus on personal mission and courage', Taurus: 'sacred focus on sustaining beauty and material devotion', Gemini: 'sacred focus on learning and teaching', Cancer: 'sacred focus on home and emotional rituals', Leo: 'sacred focus on creative flame and self-expression', Virgo: 'sacred focus on craft, healing, and daily ritual', Libra: 'sacred focus on relationship tending and justice', Scorpio: 'sacred focus on transformation and emotional alchemy', Sagittarius: 'sacred focus on truth-seeking and spiritual practice', Capricorn: 'sacred focus on career calling and mastery', Aquarius: 'sacred focus on humanitarian service and innovation', Pisces: 'sacred focus on spiritual devotion and compassionate service' },
    Juno: { Aries: 'partnership need for autonomy and directness', Taurus: 'partnership need for stability and sensual loyalty', Gemini: 'partnership need for intellectual connection', Cancer: 'partnership need for emotional security and family', Leo: 'partnership need for admiration and romance', Virgo: 'partnership need for practical reliability', Libra: 'partnership need for equality and beauty', Scorpio: 'partnership need for deep trust and intensity', Sagittarius: 'partnership need for adventure and growth', Capricorn: 'partnership need for commitment and ambition', Aquarius: 'partnership need for freedom and originality', Pisces: 'partnership need for spiritual connection and empathy' },
    Pallas: { Aries: 'strategic intelligence through bold action', Taurus: 'pattern recognition through sensory data', Gemini: 'strategic intelligence through information synthesis', Cancer: 'pattern recognition through emotional intelligence', Leo: 'strategic intelligence through creative vision', Virgo: 'pattern recognition through analytical detail', Libra: 'strategic intelligence through social dynamics', Scorpio: 'pattern recognition through psychological depth', Sagittarius: 'strategic intelligence through philosophical frameworks', Capricorn: 'pattern recognition through structural analysis', Aquarius: 'strategic intelligence through systems thinking', Pisces: 'pattern recognition through intuitive knowing' },
    Lilith: { Aries: 'wild autonomy, rage at being controlled', Taurus: 'sensual power, rage at being devalued', Gemini: 'forbidden knowledge, rage at being silenced', Cancer: 'fierce mothering, rage at emotional manipulation', Leo: 'untamed creativity, rage at being diminished', Virgo: 'body wisdom, rage at being shamed', Libra: 'relational power, rage at injustice', Scorpio: 'raw sexual/psychic power, rage at betrayal', Sagittarius: 'wild freedom, rage at confinement', Capricorn: 'structural power, rage at patriarchal systems', Aquarius: 'revolutionary power, rage at conformity', Pisces: 'mystical power, rage at spiritual abuse' },
  };

  // Aspect-type verb phrases for building specific sentences
  const ASPECT_VERB: Record<string, { active: string; passive: string }> = {
    Conjunction: { active: 'is fused with', passive: 'merges directly into' },
    Sextile: { active: 'opens a gentle doorway to', passive: 'receives a quiet invitation from' },
    Square: { active: 'is pressured by', passive: 'creates friction with' },
    Trine: { active: 'flows naturally into', passive: 'receives effortless support from' },
    Opposition: { active: 'is pulled into awareness by', passive: 'mirrors against' },
  };

  // House topic shorthand
  const HOUSE_LIFE_AREA: Record<number, string> = {
    1: 'your identity, body, and how you show up',
    2: 'your money, self-worth, and material security',
    3: 'your daily communication, siblings, and local environment',
    4: 'your home, family roots, and emotional foundation',
    5: 'your creativity, romance, children, and joy',
    6: 'your daily work, health routines, and service',
    7: 'your committed partnerships and one-on-one relationships',
    8: 'your shared resources, intimacy, and psychological depths',
    9: 'your beliefs, higher education, travel, and meaning-making',
    10: 'your career, public role, and life direction',
    11: 'your friendships, community, and future aspirations',
    12: 'your solitude, dreams, hidden life, and spiritual practice',
  };

  // For each natal Moon sign, describe how that person tends to react to FIVE distinct kinds of theme-work.
  // The personal line per theme picks the right reaction based on what the theme is actually asking for.
  // 'action' = themes asking for movement/initiative/starting | 'release' = themes asking to let go/end something
  // 'values' = themes asking to clarify what matters | 'connect' = themes asking to communicate/relate
  // 'feel' = themes asking to feel/grieve/be with emotion
  const MOON_SIGN_REACTIONS: Record<string, Record<string, string>> = {
    Aries: {
      action: 'you\'ll want to move on it the moment you read it — the trap is starting three things and finishing none. Pick ONE first step today and do only that.',
      release: 'letting go isn\'t your default; you\'d rather fight or push through. Notice when you\'re forcing something that\'s already over and let yourself walk away cleanly.',
      values: 'you tend to know what you want in your gut. Trust the fast yes/no instead of arguing yourself out of it — but write it down so you don\'t forget by next week.',
      connect: 'you\'ll want to say it bluntly. Say it — but soften the opening sentence so the other person can actually hear you instead of bracing for impact.',
      feel: 'sitting with feelings is the hardest ask for you. Try 10 minutes a day where you don\'t fix anything — just notice what\'s under the urge to act.',
    },
    Taurus: {
      action: 'you won\'t move until it feels safe in your body, which can look like procrastination but is actually data-gathering. Give yourself a clear deadline so "not yet" doesn\'t become "never."',
      release: 'you hold on tight to what feels stable, even when it\'s stopped working. Name one specific thing (object, habit, or commitment) you\'ll let go of by the next Full Moon.',
      values: 'this is your home territory — you already know what you value, you just override it for security. Re-read your list and check: what am I doing that contradicts this?',
      connect: 'you\'d rather show up consistently than have the big talk. This cycle, have the conversation you\'ve been postponing — even if it takes you a week to find the words.',
      feel: 'you tend to soothe with food, comfort, or shopping. Try moving the feeling through your body instead — walk, stretch, or sit on the floor and breathe.',
    },
    Gemini: {
      action: 'you\'ll want to research it instead of doing it. Set a 24-hour limit on input-gathering, then act on what you have — perfect information is a trap for you.',
      release: 'you let things drift rather than ending them, which leaves loose threads. Send the actual closing message or delete the actual file — make the ending real.',
      values: 'you can argue any side, which makes "what matters most" hard. Pick three values and rank them. The ranking is the point.',
      connect: 'this is your strength — use it. Have the conversation now. But listen for one full minute before you reply.',
      feel: 'you intellectualize feelings into ideas about feelings. Try writing the raw sentence ("I feel ___ because ___") without analyzing it.',
    },
    Cancer: {
      action: 'you\'ll wait until the emotional climate feels right, which can mean waiting forever. Take the action even when you feel uncertain — your gut sharpens once you\'re in motion.',
      release: 'you grieve everything you let go of, even things that hurt you. Let yourself feel sad about it AND release it — both can be true at once.',
      values: 'your values are tied to who you love. Check: am I protecting what matters to me, or absorbing what matters to them?',
      connect: 'you read the room before you speak. Say the thing directly this time — your hint will not be received as a hint.',
      feel: 'this is where you live. The work isn\'t feeling more, it\'s noticing whose feelings you\'re carrying that aren\'t yours.',
    },
    Leo: {
      action: 'you move when you feel inspired and stall when you don\'t. Show up for the boring middle part — the part nobody claps for.',
      release: 'letting go can feel like losing face. Remind yourself: walking away from what no longer fits is dignity, not defeat.',
      values: 'you know what you love. Check: am I doing this because I love it, or because someone is watching?',
      connect: 'you communicate with warmth and presence. Be the one who says the vulnerable thing first this cycle.',
      feel: 'you\'d rather perform fine than admit you\'re hurt. Tell one trusted person the unvarnished version.',
    },
    Virgo: {
      action: 'you\'ll plan it perfectly and never start. Do the messy first version this week — you can refine it later, but you can\'t edit nothing.',
      release: 'you keep tweaking what should be ended. Set a "done" line in advance and honor it even if it\'s not perfect.',
      values: 'you confuse "useful" with "important." Ask: would I still do this if no one needed me to?',
      connect: 'you tend to give corrections instead of feelings. Lead with how it landed for you, not what they did wrong.',
      feel: 'you somatize what you don\'t process — back, gut, jaw. The body symptom IS the feeling asking to be named.',
    },
    Libra: {
      action: 'you\'ll wait for everyone to agree before you move. They won\'t. Make the call this week even if someone\'s disappointed.',
      release: 'you stay in things to keep the peace, long past when it\'s served you. Letting go IS fair to you — that counts.',
      values: 'you can see all sides, which dilutes your own. Write down what YOU want before you ask anyone else.',
      connect: 'this is your superpower, but you smooth over the hard part. Name the actual disagreement out loud this cycle.',
      feel: 'you mirror others\' moods. Take a day alone to figure out which feelings are actually yours.',
    },
    Scorpio: {
      action: 'you wait until you\'re sure, then move with full commitment. Don\'t wait for 100% certainty — 70% is enough this cycle.',
      release: 'you hold onto resentments and unfinished business in the body. Write the unsent letter and burn it — make the ending physical.',
      values: 'you know what you value because you know what you won\'t tolerate. Honor a "no" you\'ve been overriding.',
      connect: 'you go deep or stay silent — there\'s no in-between. Try a real conversation that\'s not a confession or an interrogation.',
      feel: 'you feel everything at high volume but show none of it. Pick one trusted person and let them see one real reaction this week.',
    },
    Sagittarius: {
      action: 'you\'ll start big and lose interest at the boring part. Commit to the small, repetitive step — that\'s where the actual change lives.',
      release: 'you bolt instead of closing things properly. Have the conversation BEFORE you leave — your future self needs the closure.',
      values: 'you confuse freedom with absence of commitment. What do you value enough to actually choose, even when something else looks shinier?',
      connect: 'you\'re honest to a fault. Notice when "I\'m just being honest" is actually avoiding accountability for the impact.',
      feel: 'you escape feelings by making meaning of them too fast. Sit with the raw version before you turn it into a lesson.',
    },
    Capricorn: {
      action: 'this is your strength — you execute. Check: am I doing the thing because it matters, or because doing things is how I prove I exist?',
      release: 'you treat letting go as failure. Reframe: ending something that\'s done is good management, not giving up.',
      values: 'you confuse achievement with worth. Write down what you value APART from what you produce.',
      connect: 'you keep it professional even with people you love. Drop one wall this cycle and let someone in on the unfinished version.',
      feel: 'you postpone feelings until the work is done — then they show up as exhaustion or shutdown. Build a 15-minute window for them BEFORE the crash.',
    },
    Aquarius: {
      action: 'you\'ll think about it from above instead of doing it from inside. Get your hands on it — the doing teaches you something the analysis can\'t.',
      release: 'you cut ties cleanly but skip the grief. Let yourself feel the loss of what you\'re ending, even if leaving was right.',
      values: 'you value freedom and principle. Check: am I withholding closeness in the name of independence?',
      connect: 'you communicate ideas easily, feelings less so. Try saying the personal sentence, not the conceptual one.',
      feel: 'you observe your feelings like a scientist observing a specimen. Get back inside them — feel them in your body, not your analysis.',
    },
    Pisces: {
      action: 'you\'ll dream about it, then dissolve when it\'s time to do it. Set one tiny, concrete, scheduled step — protect it from the fog.',
      release: 'you let things blur into endings without naming them. Say the actual goodbye out loud or in writing — make it real.',
      values: 'you absorb what others value. Spend a day alone and ask what YOU actually want, separate from anyone else\'s wishes.',
      connect: 'you communicate through feeling and atmosphere. Use plain words this cycle — they need to hear it, not just sense it.',
      feel: 'this is your native land. The work isn\'t feeling more — it\'s identifying whose feelings are yours and which you can put down.',
    },
  };

  // Classify a theme by its title + description into one of five work-types
  const classifyTheme = (title: string, description: string): keyof typeof MOON_SIGN_REACTIONS['Aries'] => {
    const text = `${title} ${description}`.toLowerCase();
    if (/\b(release|let go|end|complete|finish|dissolve|surrender|grieve|leave behind|outgrow|shed)\b/.test(text)) return 'release';
    if (/\b(value|matter|worth|meaning|purpose|priorit|deserv|nourish|recommit|honor what)\b/.test(text)) return 'values';
    if (/\b(communicat|conversat|speak|say|word|share|connect|listen|tell|express|voice)\b/.test(text)) return 'connect';
    if (/\b(feel|emotion|grief|tender|soft|heart|cry|mood|inner|body|sensation|gut|nurture)\b/.test(text)) return 'feel';
    return 'action'; // default — most themes are about doing/initiating something
  };

  // Calculate New Moon house in natal chart
  const getNewMoonHouse = (): number | null => {
    if (!activeChart?.houseCusps || !interpretation) return null;
    const nmDeg = interpretation.degree + (ZODIAC_SIGNS.indexOf(interpretation.sign) * 30);
    const cusps: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const cusp = activeChart.houseCusps[`house${i}` as keyof typeof activeChart.houseCusps];
      if (cusp) {
        const c = cusp as { sign: string; degree: number; minutes?: number };
        cusps.push(ZODIAC_SIGNS.indexOf(c.sign) * 30 + c.degree + (c.minutes || 0) / 60);
      } else return null;
    }
    for (let i = 0; i < 12; i++) {
      const cur = cusps[i];
      const next = cusps[(i + 1) % 12];
      if (next < cur) {
        if (nmDeg >= cur || nmDeg < next) return i + 1;
      } else {
        if (nmDeg >= cur && nmDeg < next) return i + 1;
      }
    }
    return 1;
  };

  const newMoonHouse = getNewMoonHouse();

  // Build a specific, somatic felt-sense sentence for this exact planet+sign+aspect+house combo
  const buildFeltSense = (planet: string, natalSign: string, aspectType: string): string => {
    const signFeel = PLANET_SIGN_FEEL[planet]?.[natalSign];
    const verb = ASPECT_VERB[aspectType];
    const houseArea = newMoonHouse ? HOUSE_LIFE_AREA[newMoonHouse] : null;

    // Somatic response varies by aspect type
    const somaticByAspect: Record<string, string> = {
      Conjunction: `Your natal ${planet} in ${natalSign} (${signFeel || 'its natal expression'}) is directly activated — you'll feel its themes as if someone turned up the volume on this part of your life. It's not background noise this cycle; it IS the cycle.`,
      Sextile: `Your natal ${planet} in ${natalSign} (${signFeel || 'its natal expression'}) ${verb?.passive || 'receives a quiet invitation from'} this New Moon. You'll notice subtle openings — a conversation that leads somewhere, a small opportunity that feels easy to say yes to. It won't push you; you have to notice it and reach for it. Think of it as a door slightly ajar in the area of ${houseArea || 'this New Moon\'s themes'}.`,
      Square: `Your natal ${planet} in ${natalSign} (${signFeel || 'its natal expression'}) ${verb?.passive || 'creates friction with'} this New Moon. You'll feel this as tension in your body — restlessness, irritation, or a nagging sense that something needs to change around ${houseArea || 'this cycle\'s themes'}. The discomfort is the point. It's pushing you to act on what you've been avoiding.`,
      Trine: `Your natal ${planet} in ${natalSign} (${signFeel || 'its natal expression'}) ${verb?.active || 'flows naturally into'} this New Moon. You'll feel this as ease — things related to ${houseArea || 'this cycle\'s themes'} click into place without force. Your ${planet} gifts are available to you effortlessly. The only risk is coasting — consciously use this flow.`,
      Opposition: `Your natal ${planet} in ${natalSign} (${signFeel || 'its natal expression'}) ${verb?.passive || 'mirrors against'} this New Moon. You may feel pulled between your ${planet} needs and the demands of ${houseArea || 'this cycle\'s themes'}. Other people may embody your ${planet} energy for you — watch what triggers you in others, because it's your own unintegrated ${planet} qualities reflected back.`,
    };

    let felt = somaticByAspect[aspectType] || `Your natal ${planet} in ${natalSign} is activated by this New Moon.`;

    if (houseArea && aspectType === 'Conjunction') {
      felt += ` This lands in ${houseArea} — that's the life domain where ${planet}'s energy becomes your seed intention.`;
    }

    return felt;
  };

  const getNatalAspects = () => {
    if (!activeChart || !interpretation) return [];
    
    const newMoonDegree = interpretation.degree + (ZODIAC_SIGNS.indexOf(interpretation.sign) * 30);
    const aspects: Array<{ planet: string; aspect: string; orb: number; planetIdentity: string; aspectInfo: { symbol: string; what: string }; feltSense: string; natalSign: string; natalDegree: number }> = [];
    
    Object.entries(activeChart.planets).forEach(([planet, data]) => {
      const planetData = data as { sign: string; degree: number; minutes?: number; house?: number };
      const planetDegree = planetData.degree + (planetData.minutes || 0) / 60 + (ZODIAC_SIGNS.indexOf(planetData.sign) * 30);
      let diff = Math.abs(newMoonDegree - planetDegree);
      if (diff > 180) diff = 360 - diff;
      
      const aspectChecks = [
        { name: 'Conjunction', angle: 0, key: 'conjunction' },
        { name: 'Sextile', angle: 60, key: 'sextile' },
        { name: 'Square', angle: 90, key: 'square' },
        { name: 'Trine', angle: 120, key: 'trine' },
        { name: 'Opposition', angle: 180, key: 'opposition' },
      ];
      for (const ac of aspectChecks) {
        const orbVal = Math.abs(diff - ac.angle);
        if (orbVal <= getEffectiveOrbFn('Moon', planet, ac.key)) {
          aspects.push({
            planet,
            aspect: ac.name,
            orb: orbVal,
            planetIdentity: PLANET_IDENTITY[planet] || `${planet} — a point in your chart activated by this lunation.`,
            aspectInfo: ASPECT_WHAT[ac.name] || { symbol: '', what: '' },
            feltSense: buildFeltSense(planet, planetData.sign, ac.name),
            natalSign: planetData.sign,
            natalDegree: planetData.degree,
          });
          break;
        }
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
          <ChartSelector
            userNatalChart={userNatalChart || null}
            savedCharts={savedCharts}
            selectedChartId={localSelectedChart}
            onSelect={handleChartChange}
            includeGeneral
            generalLabel="☽ General (Collective)"
            generalId="general"
            label="Personalize for"
          />
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
                {signLunationData.themes.map((theme, i) => {
                  const natalMoon = activeChart?.planets?.Moon as { sign?: string; house?: number } | undefined;
                  const houseArea = newMoonHouse ? HOUSE_LIFE_AREA[newMoonHouse] : null;
                  // Build a chart-specific line UNIQUE to this theme by classifying what it asks for
                  // and pairing it with how this person's natal Moon typically meets that exact kind of work.
                  let personalLine: string | null = null;
                  if (activeChart && houseArea && newMoonHouse) {
                    const workType = classifyTheme(theme.title, theme.description);
                    if (natalMoon?.sign && MOON_SIGN_REACTIONS[natalMoon.sign]) {
                      const reaction = MOON_SIGN_REACTIONS[natalMoon.sign][workType];
                      personalLine = `For you, ${activeChart.name}: this lands in ${houseArea} (House ${newMoonHouse}). With your natal Moon in ${natalMoon.sign}, ${reaction}`;
                    } else {
                      personalLine = `For you, ${activeChart.name}: this lands in ${houseArea} (House ${newMoonHouse}) — that's the specific life area where this theme has to play out for you, not in the abstract.`;
                    }
                  }
                  return (
                    <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">{theme.title}</h4>
                      <p className="text-sm text-foreground/80">{theme.description}</p>
                      {personalLine && (
                        <p className="text-xs text-primary/90 mt-2 pt-2 border-t border-border/50 italic">
                          {personalLine}
                        </p>
                      )}
                    </div>
                  );
                })}
                <p className="text-sm text-muted-foreground italic">
                  Begin with integrity, plant seeds step by step, trust that you don't need to know the whole plan yet — what is no longer working is meant to dissolve.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Lunation Cycle Dates — with cycle navigation, exact times, house + aspects */}
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
                {/* Cycle Navigation — jump to any date, sign, or browse */}
                <div className="flex flex-col gap-2 mb-4 p-2.5 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => setCycleOffset(o => o - 1)} className="text-xs">
                      ← Previous
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="month"
                        className="text-xs border border-border rounded-md px-2 py-1.5 bg-background text-foreground"
                        value={(() => {
                          const d = newMoons?.previous.date || new Date();
                          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        })()}
                        onChange={(e) => {
                          const [year, month] = e.target.value.split('-').map(Number);
                          const target = new Date(year, month - 1, 15);
                          const now = new Date();
                          const diffMs = target.getTime() - now.getTime();
                          const diffMonths = Math.round(diffMs / (30.44 * 24 * 60 * 60 * 1000));
                          setCycleOffset(diffMonths);
                        }}
                      />
                      {cycleOffset !== 0 && (
                        <Button variant="outline" size="sm" onClick={() => setCycleOffset(0)} className="text-[10px] px-2 py-1 h-auto">
                          ↩ Today
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCycleOffset(o => o + 1)} className="text-xs">
                      Next →
                    </Button>
                  </div>
                  {/* Sign filter — jump to New Moon in a specific sign */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide mr-1">Find by sign:</span>
                    <Select
                      value=""
                      onValueChange={(sign) => {
                        const refDate = newMoons?.previous.date || new Date();
                        // Search backward first for the most recent one
                        const prevInSign = findNewMoonInSign(sign, 'previous', refDate);
                        if (prevInSign) {
                          const now = new Date();
                          const diffMs = prevInSign.getTime() - now.getTime();
                          const diffMonths = Math.round(diffMs / (30.44 * 24 * 60 * 60 * 1000));
                          setCycleOffset(diffMonths);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[130px] h-7 text-xs">
                        <SelectValue placeholder="← Previous in…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ZODIAC_SIGNS.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {ZODIAC_SYMBOLS[s]} {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value=""
                      onValueChange={(sign) => {
                        const refDate = newMoons?.previous.date || new Date();
                        // Search forward for the next one
                        const nextInSign = findNewMoonInSign(sign, 'next', new Date(refDate.getTime() + 2 * 24 * 60 * 60 * 1000));
                        if (nextInSign) {
                          const now = new Date();
                          const diffMs = nextInSign.getTime() - now.getTime();
                          const diffMonths = Math.round(diffMs / (30.44 * 24 * 60 * 60 * 1000));
                          setCycleOffset(diffMonths);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[130px] h-7 text-xs">
                        <SelectValue placeholder="Next in… →" />
                      </SelectTrigger>
                      <SelectContent>
                        {ZODIAC_SIGNS.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {ZODIAC_SYMBOLS[s]} {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(() => {
                  const formatDateTime = (d: Date) => {
                    const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
                    return { date, time };
                  };
                  
                  const newMoonLon = ((newMoons?.previous.longitude || 0) % 360 + 360) % 360;
                  const newMoonHouse = activeChart ? calculateNatalHouse(newMoonLon, activeChart.houseCusps) : null;
                  
                  // Build phase entries with house + aspects
                  const phaseEntries: Array<{
                    emoji: string; label: string; date: Date; sign: string; degree: number;
                    longitude: number; phaseKey: string; isRange?: boolean; rangeEnd?: Date;
                    balsamicEndSign?: string; balsamicEndDegree?: number; balsamicEndLongitude?: number;
                  }> = [
                    { emoji: '🌑', label: 'New Moon', date: newMoons!.previous.date, sign: interpretation.sign, degree: interpretation.degree, longitude: newMoonLon, phaseKey: 'newMoon' },
                  ];
                  if (keyPhases.firstQuarter) phaseEntries.push({ emoji: '🌓', label: 'First Quarter', date: keyPhases.firstQuarter.date, sign: keyPhases.firstQuarter.sign, degree: keyPhases.firstQuarter.degree, longitude: keyPhases.firstQuarter.longitude, phaseKey: 'firstQuarter' });
                  if (keyPhases.fullMoon) phaseEntries.push({ emoji: '🌕', label: 'Full Moon', date: keyPhases.fullMoon.date, sign: keyPhases.fullMoon.sign, degree: keyPhases.fullMoon.degree, longitude: keyPhases.fullMoon.longitude, phaseKey: 'fullMoon' });
                  if (keyPhases.lastQuarter) phaseEntries.push({ emoji: '🌗', label: 'Last Quarter', date: keyPhases.lastQuarter.date, sign: keyPhases.lastQuarter.sign, degree: keyPhases.lastQuarter.degree, longitude: keyPhases.lastQuarter.longitude, phaseKey: 'lastQuarter' });
                   // Balsamic — calculate actual Moon positions
                  if (newMoons?.next) {
                    const balStart = new Date(newMoons.next.date); balStart.setDate(balStart.getDate() - 4);
                    const balEnd = new Date(newMoons.next.date); balEnd.setDate(balEnd.getDate() - 1);
                    // Get Moon longitude at balsamic start and end
                    try {
                      const vecStart = Astronomy.GeoVector(Astronomy.Body.Moon, balStart, false);
                      const eclStart = Astronomy.Ecliptic(vecStart);
                      const lonStart = ((eclStart.elon % 360) + 360) % 360;
                      const signIdxStart = Math.floor(lonStart / 30);
                      const vecEnd = Astronomy.GeoVector(Astronomy.Body.Moon, balEnd, false);
                      const eclEnd = Astronomy.Ecliptic(vecEnd);
                      const lonEnd = ((eclEnd.elon % 360) + 360) % 360;
                      const signIdxEnd = Math.floor(lonEnd / 30);
                      phaseEntries.push({
                        emoji: '🌘', label: 'Balsamic Moon', date: balStart,
                        sign: ZODIAC_SIGNS[signIdxStart], degree: Math.floor(lonStart % 30),
                        longitude: lonStart, phaseKey: 'balsamic', isRange: true, rangeEnd: balEnd,
                        balsamicEndSign: ZODIAC_SIGNS[signIdxEnd],
                        balsamicEndDegree: Math.floor(lonEnd % 30),
                        balsamicEndLongitude: lonEnd,
                      });
                    } catch {
                      phaseEntries.push({ emoji: '🌘', label: 'Balsamic Moon', date: balStart, sign: '', degree: 0, longitude: 0, phaseKey: 'balsamic', isRange: true, rangeEnd: balEnd });
                    }
                  }

                  return (
                    <div className="space-y-4">
                      {phaseEntries.map((pe, idx) => {
                        const dt = formatDateTime(pe.date);
                        const house = pe.longitude && activeChart ? calculateNatalHouse(pe.longitude, activeChart.houseCusps) : null;
                        const natalAsp = pe.longitude && activeChart ? findPhaseNatalAspects(pe.longitude, activeChart) : [];
                        const transitAsp = activeChart ? findTransitAspectsAtDate(pe.date, activeChart) : [];
                        const houseInterp = house && PHASE_HOUSE_INTERP[pe.phaseKey]?.[house] ? PHASE_HOUSE_INTERP[pe.phaseKey][house] : null;

                        // For balsamic: check if end falls in a different house
                        const balEndHouse = pe.isRange && pe.balsamicEndLongitude && activeChart
                          ? calculateNatalHouse(pe.balsamicEndLongitude, activeChart.houseCusps) : null;
                        const balSpansTwoHouses = balEndHouse && house && balEndHouse !== house;
                        const balEndHouseInterp = balSpansTwoHouses && PHASE_HOUSE_INTERP[pe.phaseKey]?.[balEndHouse] ? PHASE_HOUSE_INTERP[pe.phaseKey][balEndHouse] : null;

                        return (
                          <div key={idx} className={`p-4 rounded-xl border space-y-2.5 ${pe.phaseKey === 'balsamic' ? 'bg-muted/40 border-border/60' : 'bg-secondary/20 border-border/40'}`}>
                            <div className="flex items-start gap-3">
                              <span className="text-2xl mt-0.5">{pe.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <p className="font-medium text-foreground">{pe.label}</p>
                                  {pe.sign && <Badge variant="outline" className="text-xs">{pe.degree}° {ZODIAC_SYMBOLS[pe.sign]} {pe.sign}</Badge>}
                                  {pe.isRange && pe.balsamicEndSign && pe.balsamicEndSign !== pe.sign && (
                                    <Badge variant="outline" className="text-xs">→ {pe.balsamicEndDegree}° {ZODIAC_SYMBOLS[pe.balsamicEndSign]} {pe.balsamicEndSign}</Badge>
                                  )}
                                  {pe.isRange && <Badge variant="secondary" className="text-xs">Sacred Rest</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{dt.date}</p>
                                {/* Show times for balsamic too */}
                                <p className="text-xs text-primary font-medium">{dt.time}</p>
                                {pe.isRange && pe.rangeEnd && (
                                  <p className="text-xs text-muted-foreground">
                                    through {pe.rangeEnd.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at{' '}
                                    {pe.rangeEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Balsamic degree explanation */}
                            {pe.phaseKey === 'balsamic' && (
                              <div className="ml-9 p-2.5 bg-background/40 rounded-lg border border-border/20">
                                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                  The Balsamic Moon begins when the Sun-Moon separation reaches 315° (45° before the next conjunction). 
                                  This is the final ~3½ days of the cycle — the "dark of the Moon" — when the crescent thins toward invisible. 
                                  Traditionally a time of composting, release, dreams, and deep rest before rebirth.
                                </p>
                              </div>
                            )}

                            {/* House placement + interpretation */}
                            {house && (
                              <div className="ml-9 p-3 bg-background/60 rounded-lg border border-border/30 space-y-1.5">
                                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                  <Moon className="h-3 w-3" /> {ordinalLCV(house)} House — {HOUSE_TOPICS_LCV[house]}
                                </p>
                                {houseInterp && (
                                  <p className="text-xs text-foreground/75 leading-relaxed">{houseInterp}</p>
                                )}
                              </div>
                            )}

                            {/* If balsamic spans two houses */}
                            {balSpansTwoHouses && balEndHouse && (
                              <div className="ml-9 p-3 bg-background/60 rounded-lg border border-border/30 space-y-1.5">
                                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                  <Moon className="h-3 w-3" /> Shifts into {ordinalLCV(balEndHouse)} House — {HOUSE_TOPICS_LCV[balEndHouse]}
                                </p>
                                <p className="text-[10px] text-muted-foreground">The Moon moves into this house during the balsamic window.</p>
                                {balEndHouseInterp && (
                                  <p className="text-xs text-foreground/75 leading-relaxed">{balEndHouseInterp}</p>
                                )}
                              </div>
                            )}

                            {/* Natal aspects */}
                            {natalAsp.length > 0 && (
                              <div className="ml-9 space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Natal Aspects</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {natalAsp.map((a, ai) => (
                                    <Badge key={ai} variant={a.aspect === 'Conjunction' || a.aspect === 'Trine' || a.aspect === 'Sextile' ? 'default' : 'secondary'} className="text-[10px]">
                                      {a.symbol} {a.aspect} natal {a.planet} ({a.orb.toFixed(1)}°)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Active outer planet transits */}
                            {transitAsp.length > 0 && (
                              <div className="ml-9 space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Active Transits</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {transitAsp.slice(0, 5).map((t, ti) => (
                                    <Badge key={ti} variant="outline" className="text-[10px] border-primary/30">
                                      {t.transit} {t.symbol} {t.aspect} natal {t.natal} ({t.orb.toFixed(1)}°)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Next New Moon teaser */}
                      {newMoons?.next && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => setCycleOffset(o => o + 1)}>
                          <span className="text-xl">🌑</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Next New Moon →</p>
                            <p className="text-xs text-muted-foreground">
                              {newMoons.next.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at{' '}
                              {newMoons.next.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
                            </p>
                          </div>
                          <Badge variant="outline">{ZODIAC_SYMBOLS[ZODIAC_SIGNS[Math.floor(((newMoons.next.longitude % 360) + 360) % 360 / 30)]]} {ZODIAC_SIGNS[Math.floor(((newMoons.next.longitude % 360) + 360) % 360 / 30)]}</Badge>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-foreground">Planets Conjunct This New Moon:</span>
                    {interpretation.conjunctions.map((planet, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {planet.symbol} {planet.name}
                        {planet.isRetrograde && <span className="ml-1 text-amber-500">℞</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {interpretation.hasStellium && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                  <p className="text-sm font-medium text-primary">
                    ⭐ {interpretation.stelliumPlanets.length}-Planet Stellium in {interpretation.stelliumSign}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {interpretation.stelliumPlanets.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {interpretation.stelliumFeltSense || `${interpretation.stelliumPlanets.length} planets concentrated in ${interpretation.stelliumSign} — this cycle carries extraordinary weight in these themes.`}
                  </p>
                </div>
              )}
              
              {/* Conjunction pair syntheses */}
              {interpretation.conjunctionPairSyntheses && interpretation.conjunctionPairSyntheses.length > 0 && (
                <div className="space-y-3">
                  {interpretation.conjunctionPairSyntheses.map((synthesis, i) => (
                    <div key={i} className="p-3 bg-secondary/40 rounded-lg border border-border/50">
                      <p className="text-sm leading-relaxed text-foreground/90">{synthesis}</p>
                    </div>
                  ))}
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
                  The {interpretation.sign} New Moon at {interpretation.degree}° activates these points in the natal chart. Each aspect describes a geometric relationship between the New Moon and a point in your chart — here's what each one IS and how you'll FEEL it this cycle:
                </p>
                <div className="space-y-4">
                  {natalAspects.map((aspect, i) => {
                    const isHarmonious = aspect.aspect === 'Conjunction' || aspect.aspect === 'Trine' || aspect.aspect === 'Sextile';
                    return (
                      <div key={i} className="p-4 bg-secondary/30 rounded-lg space-y-2 border border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base capitalize flex items-center gap-2">
                            <span className="text-lg">{aspect.aspectInfo.symbol}</span>
                            {aspect.aspect} to {aspect.planet}
                            <span className="text-xs text-muted-foreground font-normal">
                              (natal {aspect.natalSign} {aspect.natalDegree}° — {aspect.orb.toFixed(1)}° orb)
                            </span>
                          </span>
                          <Badge variant={isHarmonious ? 'default' : 'secondary'} className="text-xs">
                            {isHarmonious ? 'Supportive' : 'Growth Edge'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground/90">
                          What is {aspect.planet}? <span className="font-normal text-muted-foreground">{aspect.planetIdentity}</span>
                        </p>
                        <p className="text-sm font-medium text-foreground/90">
                          What does {aspect.aspectInfo.symbol} {aspect.aspect.toLowerCase()} mean? <span className="font-normal text-muted-foreground">{aspect.aspectInfo.what}</span>
                        </p>
                        <p className="text-sm italic text-foreground/80 bg-background/50 p-2 rounded">
                          How you'll feel it: {aspect.feltSense}
                        </p>
                      </div>
                    );
                  })}
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
          key={`workbook-${activeChart.id || 'user'}-${newMoons.previous.date.toISOString()}`}
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
            natalPlanets: (() => {
              const cusps = activeChart.houseCusps;
              const cuspLongitudes: number[] = [];
              if (cusps) {
                for (let i = 1; i <= 12; i++) {
                  const cusp = cusps[`house${i}` as keyof typeof cusps];
                  if (cusp) {
                    const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
                    cuspLongitudes.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
                  }
                }
              }
              const calcHouse = (absDeg: number): number | null => {
                if (cuspLongitudes.length !== 12) return null;
                for (let i = 0; i < 12; i++) {
                  const nextI = (i + 1) % 12;
                  let start = cuspLongitudes[i];
                  let end = cuspLongitudes[nextI];
                  if (end < start) end += 360;
                  let d = absDeg;
                  if (d < start) d += 360;
                  if (d >= start && d < end) return i + 1;
                }
                return 1;
              };
              return Object.entries(activeChart.planets)
                .filter(([_, data]) => data)
                .map(([planet, data]) => {
                  const planetData = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
                  const deg = planetData.degree + (planetData.minutes || 0) / 60;
                  const absDeg = ZODIAC_SIGNS.indexOf(planetData.sign) * 30 + deg;
                  const house = calcHouse(absDeg);
                  const retro = planetData.isRetrograde ? ' Rx' : '';
                  return `${planet}: ${Math.floor(planetData.degree)}°${planetData.minutes ? String(planetData.minutes).padStart(2, '0') : '00'}' ${planetData.sign}${house ? ` (House ${house})` : ''}${retro}`;
                })
                .join(', ');
            })(),
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
          activationData={srActivationData}
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

