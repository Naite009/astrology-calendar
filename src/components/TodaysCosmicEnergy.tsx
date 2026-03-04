import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Moon, Sun, Clock, Loader2, RefreshCw, X, Download, Share2, ChevronRight, AlertTriangle, Calendar, ArrowLeft, User, Volume2, Square, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentExcerpts } from "@/hooks/useDocumentExcerpts";
import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, PlanetaryPositions, getPlanetSymbol, getExactLunarPhase, findNearestMajorPhaseTime } from "@/lib/astrology";
import { getVOCMoonDetails, findNextMoonSignChange } from "@/lib/voidOfCourseMoon";
import { formatLocalDateKey } from "@/lib/localDate";
import { getMercuryRetrogrades, getRetrogradeStatus, getAllRetrogradePeriods } from "@/lib/retrogradePatterns";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";
import { LunarCycleView } from "./LunarCycleView";
import { useNatalChart, NatalChart } from "@/hooks/useNatalChart";
import { PersonalizedTransitsPanel } from "./PersonalizedTransitsPanel";
import { ChartSelector } from "./ChartSelector";

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇"
};

function normalizeSignLabel(sign: string): string {
  // Sometimes upstream may provide a glyph instead of a name.
  const trimmed = (sign || "").trim();
  const byGlyph = Object.entries(ZODIAC_SYMBOLS).find(([, glyph]) => glyph === trimmed)?.[0];
  return byGlyph || trimmed || "Unknown";
}

// Helper to interpret the last aspect's meaning for VOC periods
function getLastAspectMeaning(planet: string, aspectName: string): string {
  const planetMeanings: Record<string, string> = {
    'Sun': 'ego, identity, and creative expression',
    'Mercury': 'thoughts, communication, and mental activity',
    'Venus': 'love, relationships, beauty, and values',
    'Mars': 'action, drive, passion, and energy',
    'Jupiter': 'expansion, optimism, and opportunities',
    'Saturn': 'responsibility, structure, and discipline',
    'Uranus': 'change, innovation, and unexpected events',
    'Neptune': 'dreams, intuition, and spirituality',
    'Pluto': 'transformation, power, and deep processes'
  };
  
  const aspectTones: Record<string, string> = {
    'conjunction': 'merging with',
    'sextile': 'harmoniously flowing with',
    'square': 'challenging growth around',
    'trine': 'easy alignment with',
    'opposition': 'awareness and balance of'
  };
  
  const planetTheme = planetMeanings[planet] || 'various themes';
  const aspectTone = aspectTones[aspectName] || 'connecting with';
  
  return `The void period carries ${aspectTone} ${planetTheme}. This energy lingers as the Moon rests.`;
}

// Helper to describe what it means when Moon enters a new sign
function getSignTransitionMeaning(sign: string): string {
  const signMeanings: Record<string, string> = {
    'Aries': ', bringing fresh initiating energy and a desire to act.',
    'Taurus': ', grounding the mood with comfort, stability, and sensory pleasures.',
    'Gemini': ', shifting energy toward curiosity, conversation, and mental stimulation.',
    'Cancer': ', inviting nurturing feelings and emotional sensitivity.',
    'Leo': ', warming the atmosphere with creativity, confidence, and heart-centered expression.',
    'Virgo': ', focusing attention on details, health, and practical service.',
    'Libra': ', balancing toward harmony, partnership, and aesthetic appreciation.',
    'Scorpio': ', deepening emotions and inviting introspection and transformation.',
    'Sagittarius': ', expanding the mood with optimism, adventure, and big-picture thinking.',
    'Capricorn': ', grounding into ambition, discipline, and practical goals.',
    'Aquarius': ', electrifying the atmosphere with innovation and humanitarian concerns.',
    'Pisces': ', dissolving boundaries and inviting compassion, dreams, and intuition.'
  };
  
  return signMeanings[sign] || '.';
}

interface CosmicData {
  date: string;
  moonPhase: string;
  moonSign: string;
  moonDegrees: number;
  generatedAt: string;
  sunSign: string;
  sunDegrees: number;
  insight: string;
}

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  moonSign: string;
  moonPhase: string;
  sunSign: string;
}

interface VOCInfo {
  isVOC: boolean;
  isCurrentlyVOC?: boolean;
  start?: Date;
  end?: Date;
  lastAspect?: {
    planet: string;
    aspectName: string;
    symbol: string;
    time: Date;
  };
  currentMoonSign?: string;
  moonEntersSign?: string;
}

// Simple stellium detection
function findStelliums(planets: PlanetaryPositions): Array<{ sign: string; planets: string[] }> {
  const signCounts: Record<string, string[]> = {};
  
  Object.entries(planets).forEach(([name, data]) => {
    if (data?.sign) {
      if (!signCounts[data.sign]) {
        signCounts[data.sign] = [];
      }
      signCounts[data.sign].push(name);
    }
  });
  
  return Object.entries(signCounts)
    .filter(([_, names]) => names.length >= 3)
    .map(([sign, names]) => ({ sign, planets: names }));
}

// Get next 7 days forecast data
function getWeekForecast(): WeekDay[] {
  const days: WeekDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const planets = getPlanetaryPositions(date);
    const moonPhase = getMoonPhase(date);
    
    days.push({
      date,
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      moonSign: planets.moon?.sign || 'Unknown',
      moonPhase: moonPhase.phaseName,
      sunSign: planets.sun?.sign || 'Unknown',
    });
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

// Format time for display
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Format degrees with minutes (e.g., "24°32'")
function formatDegreeMinutes(degree: number, minutes?: number): string {
  const deg = Math.floor(degree);
  const min = minutes !== undefined ? minutes : Math.floor((degree - deg) * 60);
  return `${deg}°${min.toString().padStart(2, '0')}'`;
}

// Component for the header button with hover preview
export const CosmicEnergyButton = ({ onClick }: { onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get current cosmic data for preview
  const today = new Date();
  const moonPhase = getMoonPhase(today);
  const planets = getPlanetaryPositions(today);
  
  const moonSign = planets.moon?.sign || 'Unknown';
  const sunSign = planets.sun?.sign || 'Unknown';
  const phaseEmoji = getMoonPhaseEmoji(moonPhase.phaseName);
  
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex h-20 items-center gap-3 px-8 border-2 border-primary bg-primary/10 text-primary font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground rounded-md shadow-md hover:shadow-lg"
        aria-label="Today's Cosmic Energy"
      >
        <span className="text-lg">
          Click for Today's Cosmic Weather
        </span>
      </button>
      
      {/* Hover Tooltip Preview */}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-background border border-border rounded-lg shadow-xl p-4 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Sun</p>
              <p className="text-lg font-medium">
                {ZODIAC_SYMBOLS[sunSign]} {sunSign}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Moon</p>
              <p className="text-lg font-medium">
                <span className="mr-1">{phaseEmoji}</span>
                ☽ {ZODIAC_SYMBOLS[moonSign]} {moonSign}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">{moonPhase.phaseName}</p>
        </div>
      )}
    </div>
  );
};

interface TodaysCosmicEnergyProps {
  onClose?: () => void;
  userNatalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
}

export const TodaysCosmicEnergy = ({ onClose, userNatalChart: propUserNatalChart, savedCharts: propSavedCharts }: TodaysCosmicEnergyProps) => {
  const [isOpen, setIsOpen] = useState(true); // Start open when rendered
  const [isLoading, setIsLoading] = useState(false);
  const [cosmicData, setCosmicData] = useState<CosmicData | null>(null);
  // Note: We'll load from cache in useEffect after voiceStyle is initialized
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [weekForecast, setWeekForecast] = useState<WeekDay[]>([]);
  const [currentMoonDegree, setCurrentMoonDegree] = useState<number>(0);
  const [currentMoonMinutes, setCurrentMoonMinutes] = useState<number>(0);
  const [currentMoonSign, setCurrentMoonSign] = useState<string>('');
  const [currentPlanets, setCurrentPlanets] = useState<PlanetaryPositions | null>(null);
  const [vocInfo, setVocInfo] = useState<VOCInfo>({ isVOC: false });
  const [selectedWeekDay, setSelectedWeekDay] = useState<number>(0); // 0 = today
  const [weekDayLoading, setWeekDayLoading] = useState<number | null>(null);
  const [weekDayInsights, setWeekDayInsights] = useState<Record<number, string>>({});
  const [viewMode, setViewMode] = useState<'daily' | 'week' | 'month' | 'lunar'>('daily');
  const [weekSummary, setWeekSummary] = useState<string | null>(null);
  const [monthSummary, setMonthSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<'week' | 'month' | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyle] = useState<'tara' | 'chris' | 'anne' | 'kathy' | 'krs' | 'malika' | 'sarah' | 'astrodienst' | 'cafe' | 'astrotwins' | 'chani'>('tara');
  const contentRef = useRef<HTMLDivElement>(null);
  const [ttsState, setTtsState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [ttsVoiceName, setTtsVoiceName] = useState<string>(() => localStorage.getItem('cosmic-tts-voice-name') || '');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Document excerpts for AI enrichment
  const { buildPromptBlock: buildRefBlock } = useDocumentExcerpts();

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      if (voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, []);

  const stopTtsAudio = useCallback(() => {
    speechSynthesis.cancel();
    utteranceRef.current = null;
    setTtsState('idle');
  }, []);

  const playTtsInsights = useCallback(() => {
    const textToRead = selectedWeekDay === 0 ? cosmicData?.insight : weekDayInsights[selectedWeekDay];
    if (!textToRead) return;

    if (ttsState === 'playing') { stopTtsAudio(); return; }
    if (ttsState === 'paused') { speechSynthesis.resume(); setTtsState('playing'); return; }

    const cleanText = textToRead
      .replace(/\*\*RECIPE_START\*\*[\s\S]*?\*\*RECIPE_END\*\*/, '')
      .replace(/##\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/- /g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\n+/g, ' ')
      .replace(/[☉☽☿♀♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓☊☋△□⚹☌]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Apply selected voice
    if (ttsVoiceName && availableVoices.length > 0) {
      const match = availableVoices.find(v => v.name === ttsVoiceName);
      if (match) utterance.voice = match;
    } else if (availableVoices.length > 0) {
      // Default: pick a nice voice
      const preferred = availableVoices.find(v => v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female'));
      if (preferred) utterance.voice = preferred;
    }

    utterance.onend = () => setTtsState('idle');
    utterance.onerror = () => setTtsState('idle');
    utteranceRef.current = utterance;

    speechSynthesis.speak(utterance);
    setTtsState('playing');
  }, [ttsState, stopTtsAudio, cosmicData, weekDayInsights, selectedWeekDay, ttsVoiceName, availableVoices]);

  // Cleanup TTS on unmount
  useEffect(() => { return () => { stopTtsAudio(); }; }, [stopTtsAudio]);
  
  // Get saved charts - prefer props, fall back to hook
  const hookData = useNatalChart();
  const userNatalChart = propUserNatalChart !== undefined ? propUserNatalChart : hookData.userNatalChart;
  const savedCharts = propSavedCharts !== undefined ? propSavedCharts : hookData.savedCharts;
  
  // Build list of available charts
  const availableCharts: NatalChart[] = [
    ...(userNatalChart ? [userNatalChart] : []),
    ...savedCharts,
  ];
  
  // Get selected chart object - handle 'user' ID from ChartSelector
  const selectedChart = selectedChartId 
    ? selectedChartId === 'user' 
      ? userNatalChart 
      : availableCharts.find(c => c.id === selectedChartId || c.name === selectedChartId) 
    : null;

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const todayKey = formatLocalDateKey(today); // YYYY-MM-DD (local) for cache key

  // Load cached data when voice style changes - don't auto-fetch, just load from cache
  useEffect(() => {
    const cacheKey = `cosmic-weather-${todayKey}-${voiceStyle}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCosmicData(parsed);
        setLastFetched(parsed.generatedAt || null);
      } catch (e) {
        console.error('Failed to parse cached cosmic data:', e);
      }
    } else {
      // No cache for this voice - but DON'T auto-fetch
      // Only reset if we're not currently loading (to avoid race conditions)
      if (!isLoading) {
        setCosmicData(null);
        setLastFetched(null);
      }
    }
  }, [voiceStyle, todayKey, isLoading]);

  // Update all planetary positions in real-time when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const updatePlanetaryPositions = () => {
      const now = new Date();
      const planets = getPlanetaryPositions(now);
      setCurrentPlanets(planets);
      setCurrentMoonDegree(planets.moon?.rawDegree || planets.moon?.degree || 0);
      setCurrentMoonMinutes(planets.moon?.minutes || 0);
      setCurrentMoonSign(planets.moon?.signName || planets.moon?.sign || 'Unknown');
      
      // Get VOC info
      const voc = getVOCMoonDetails(now);
      setVocInfo(voc);
    };
    
    updatePlanetaryPositions();
    // Update every minute for real-time tracking
    const interval = setInterval(updatePlanetaryPositions, 60000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchCosmicWeather = async (forceRefresh = false, targetDate?: Date, overrideVoiceStyle?: typeof voiceStyle) => {
    // Use override voice if provided (fixes race condition when voice just changed)
    const effectiveVoiceStyle = overrideVoiceStyle || voiceStyle;
    
    // If we have cached data and not forcing refresh and it's for today, don't fetch
    if (cosmicData && !forceRefresh && !targetDate) {
      setWeekForecast(getWeekForecast());
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const now = targetDate || new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      
      // Get current astronomical data at the exact moment of request
      const moonPhase = getMoonPhase(now);
      const planets = getPlanetaryPositions(now);
      const aspects = calculateDailyAspects(planets);
      const stelliums = findStelliums(planets);
      const voc = getVOCMoonDetails(now);

      // Update current positions
      if (!targetDate) {
        setCurrentPlanets(planets);
        setCurrentMoonDegree(planets.moon?.rawDegree || planets.moon?.degree || 0);
        setCurrentMoonMinutes(planets.moon?.minutes || 0);
        setCurrentMoonSign(planets.moon?.signName || planets.moon?.sign || 'Unknown');
        setVocInfo(voc);
      }

      // Build planet positions array for the edge function - use sign NAMES not glyphs
      const signGlyphToName: Record<string, string> = {
        '♈': 'Aries', '♉': 'Taurus', '♊': 'Gemini', '♋': 'Cancer',
        '♌': 'Leo', '♍': 'Virgo', '♎': 'Libra', '♏': 'Scorpio',
        '♐': 'Sagittarius', '♑': 'Capricorn', '♒': 'Aquarius', '♓': 'Pisces'
      };
      
      const planetPositions = Object.entries(planets).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: signGlyphToName[data?.sign] || data?.signName || data?.sign || 'Unknown',
        degree: data?.rawDegree?.toFixed(1) || data?.degree || 0
      }));

      // Send MORE aspects with FULL data including orbs - this prevents AI hallucination
      // Use the symbol from calculateDailyAspects directly (already includes correct glyph)
      const aspectsWithDetails = aspects.slice(0, 15).map(a => {
        const orbValue = 'orb' in a && a.orb != null ? a.orb : 0;
        // Map lowercase type names to symbols (calculateDailyAspects returns lowercase)
        const typeToSymbol: Record<string, string> = {
          'conjunction': '☌', 'sextile': '⚹', 'square': '□', 'trine': '△', 'opposition': '☍'
        };
        return {
          planet1: a.planet1,
          planet2: a.planet2,
          type: a.type,
          orb: typeof orbValue === 'number' ? orbValue.toFixed(1) : String(orbValue),
          motion: 'motion' in a ? (a as Record<string, unknown>).motion as string : (a.applying ? 'applying' : 'separating'),
          symbol: a.symbol || typeToSymbol[a.type.toLowerCase()] || '●'
        };
      });

      // Determine time of day using LOCAL time (not UTC)
      const localHour = now.getHours();
      const timeOfDay = localHour < 12 ? 'morning' : localHour < 17 ? 'afternoon' : 'evening';
      const greeting = localHour < 12 ? 'Good morning' : localHour < 17 ? 'Good afternoon' : 'Good evening';

      // Detect user's timezone early (used for ingress times and AI prompt)
      // If runtime reports UTC (common in some preview environments), fall back to ET for Pennsylvania-focused timing.
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userTimezone = detectedTimezone && detectedTimezone !== 'UTC' ? detectedTimezone : 'America/New_York';
      const userTzAbbr = new Date().toLocaleTimeString('en-US', { timeZone: userTimezone, timeZoneName: 'short' }).split(' ').pop() || 'ET';
      const formatDateForTimezone = (value: Date) => value.toLocaleDateString('en-US', {
        timeZone: userTimezone,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // --- Moon sign change today ---
      const moonSignChangeToday = (() => {
        // Check VOC info first (already has moon ingress data)
        if (voc.isVOC && voc.end && voc.moonEntersSign) {
          const changeDate = voc.end;
          const dayStart = new Date(now); dayStart.setHours(0,0,0,0);
          const dayEnd = new Date(now); dayEnd.setHours(23,59,59,999);
          if (changeDate >= dayStart && changeDate <= dayEnd) {
            return {
              fromSign: planets.moon?.signName || signGlyphToName[planets.moon?.sign] || 'Unknown',
              toSign: voc.moonEntersSign,
              time: changeDate.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) + ' ET',
            };
          }
        }
        // Fallback: calculate directly
        const nextChange = findNextMoonSignChange(now);
        const dayEnd2 = new Date(now); dayEnd2.setHours(23,59,59,999);
        if (nextChange.time <= dayEnd2) {
          return {
            fromSign: planets.moon?.signName || signGlyphToName[planets.moon?.sign] || 'Unknown',
            toSign: nextChange.newSign,
            time: nextChange.time.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) + ' ET',
          };
        }
        return null;
      })();

      // --- Imminent planet sign changes (planets at 28°+ in a sign) ---
      const imminentSignChanges: Array<{ planet: string; currentSign: string; degree: number; nextSign: string; ingressTime?: string }> = [];
      const signOrder = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      // Helper to find when a planet crosses into the next sign using getPlanetaryPositions
      const findPlanetIngress = (planetName: string, currentSign: string): Date | null => {
        try {
          const planetKey = planetName.toLowerCase() as keyof PlanetaryPositions;
          // Step forward in time to find when the planet's sign changes
          const stepHours = planetName === 'Sun' ? 4 : ['Mercury', 'Venus', 'Mars'].includes(planetName) ? 4 : 12;
          let searchDate = new Date(now);
          
          for (let i = 0; i < 180; i++) {
            searchDate = new Date(searchDate.getTime() + stepHours * 3600000);
            const futurePositions = getPlanetaryPositions(searchDate);
            const futureSign = futurePositions[planetKey]?.signName || futurePositions[planetKey]?.sign;
            
            if (futureSign && futureSign !== currentSign) {
              // Found the sign change — refine with 10-minute steps backward
              let refineDate = new Date(searchDate.getTime() - stepHours * 3600000);
              for (let j = 0; j < (stepHours * 6 + 10); j++) {
                refineDate = new Date(refineDate.getTime() + 10 * 60000);
                const refPositions = getPlanetaryPositions(refineDate);
                const refSign = refPositions[planetKey]?.signName || refPositions[planetKey]?.sign;
                if (refSign && refSign !== currentSign) {
                  return refineDate;
                }
              }
              return searchDate;
            }
          }
        } catch (e) {
          console.error('Failed to calculate ingress time for', planetName, e);
        }
        return null;
      };
      
      for (const pp of planetPositions) {
        if (pp.name === 'Moon') continue; // handled separately
        const deg = typeof pp.degree === 'string' ? parseFloat(pp.degree) : pp.degree;
        const rawDeg = deg % 30; // degree within sign
        if (rawDeg >= 28) {
          const signIdx = signOrder.indexOf(pp.sign);
          const nextSign = signOrder[(signIdx + 1) % 12];
          
          // Calculate the actual ingress time
          let ingressTimeStr: string | undefined;
          const ingressDate = findPlanetIngress(pp.name, pp.sign);
          if (ingressDate) {
            ingressTimeStr = ingressDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' ' + userTzAbbr + ', ' + ingressDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
          }
          
          imminentSignChanges.push({ planet: pp.name, currentSign: pp.sign, degree: rawDeg, nextSign, ingressTime: ingressTimeStr });
        }
      }

      // --- Mercury retrograde shadow tracking (DYNAMIC from astronomy-engine) ---
      const mercuryRetrosPeriods = getMercuryRetrogrades(now);
      const mercuryRxStatus = getRetrogradeStatus(now, mercuryRetrosPeriods);
      
      const mercuryRxInfo = (() => {
        if (!mercuryRxStatus.retrogradeInfo) return null;
        const ri = mercuryRxStatus.retrogradeInfo;
        const sign = ri.sign;
        const rxStartStr = formatDateForTimezone(ri.start);
        const rxEndStr = formatDateForTimezone(ri.end);
        const preStartStr = formatDateForTimezone(ri.preStart);
        const postEndStr = formatDateForTimezone(ri.postEnd);
        
        // Compute shadow/rx degree from actual planet position at those dates
        const isPiscesRx = sign.includes('Pisces');
        const dignityNote = isPiscesRx
          ? ' IMPORTANT: Pisces is Mercury\'s HARDEST sign — it is in both detriment (opposite Virgo, Mercury\'s home) AND fall (opposite Virgo, Mercury\'s exaltation). This is a double-difficulty placement. The analytical mind dissolves into intuition, feeling, and imagination. Communication becomes impressionistic rather than precise.'
          : '';
        
        if (mercuryRxStatus.isShadow && mercuryRxStatus.shadowType === 'pre') {
          return { phase: 'pre-shadow' as const, sign, rxStart: ri.start, rxEnd: ri.end, postShadowEnd: ri.postEnd, preShadowStart: ri.preStart, shadowDegree: '', rxDegree: '', shadowAbsoluteDeg: 0, description: `Mercury entered the pre-retrograde shadow on ${preStartStr}. It will station retrograde on ${rxStartStr}. Mercury stations direct ${rxEndStr}. Post-shadow clears ${postEndStr}.${dignityNote}` };
        }
        if (mercuryRxStatus.isRetrograde) {
          const midpoint = new Date((ri.start.getTime() + ri.end.getTime()) / 2);
          const isFirstHalf = now < midpoint;
          const phase: string = isFirstHalf ? 'retrograde-first-half' : 'retrograde-second-half';
          return { phase, sign, rxStart: ri.start, rxEnd: ri.end, postShadowEnd: ri.postEnd, preShadowStart: ri.preStart, shadowDegree: '', rxDegree: '', shadowAbsoluteDeg: 0, description: `Mercury is RETROGRADE in ${sign}. ${isFirstHalf ? 'First half - things from the past resurface, review and reassess.' : 'Second half - Mercury and Sun have met (inferior conjunction), clarity begins to emerge.'} Stations direct ${rxEndStr}. Post-shadow clears ${postEndStr}.${isPiscesRx ? ' CRITICAL CONTEXT: Mercury is in its WORST possible dignity in Pisces — both detriment AND fall. This is the most intense Mercury retrograde of the year. The mind works through dreams, feelings, and intuition rather than logic. Miscommunication is amplified. Double-check everything.' : ''}` };
        }
        if (mercuryRxStatus.isShadow && mercuryRxStatus.shadowType === 'post') {
          return { phase: 'post-shadow' as const, sign, rxStart: ri.start, rxEnd: ri.end, postShadowEnd: ri.postEnd, preShadowStart: ri.preStart, shadowDegree: '', rxDegree: '', shadowAbsoluteDeg: 0, description: `Mercury stationed direct on ${rxEndStr} and is now retracing its steps through the post-retrograde shadow. Clarity returns gradually. Shadow clears ${postEndStr}.` };
        }
        return null;
      })();

      // --- Personalized Mercury retrograde house placement ---
      let personalizedRetroInfo: { housePlacement: string; houseNumber: number; sign: string; degree: string; guidance: string } | null = null;
      if (selectedChart && mercuryRxInfo) {
        const absRxDeg = mercuryRxInfo.shadowAbsoluteDeg;
        // Find which house this degree falls in
        if (selectedChart.houseCusps) {
          const cusps = selectedChart.houseCusps;
          const cuspDegrees: number[] = [];
          for (let i = 1; i <= 12; i++) {
            const key = `house${i}` as keyof typeof cusps;
            const cuspData = cusps[key];
            if (cuspData && typeof cuspData === 'object' && 'degree' in cuspData) {
              cuspDegrees.push(typeof cuspData.degree === 'number' ? cuspData.degree : parseFloat(String(cuspData.degree)) || 0);
            }
          }
          if (cuspDegrees.length === 12) {
            let houseNum = 12;
            for (let i = 0; i < 12; i++) {
              const nextI = (i + 1) % 12;
              const start = cuspDegrees[i];
              const end = cuspDegrees[nextI];
              if (end > start) {
                if (absRxDeg >= start && absRxDeg < end) { houseNum = i + 1; break; }
              } else {
                if (absRxDeg >= start || absRxDeg < end) { houseNum = i + 1; break; }
              }
            }
            const houseThemes: Record<number, string> = {
              1: 'identity, appearance, how you present yourself to the world',
              2: 'money, possessions, values, self-worth',
              3: 'communication, siblings, short trips, learning, daily thinking',
              4: 'home, family, roots, emotional foundation, a parent',
              5: 'creativity, romance, children, pleasure, self-expression',
              6: 'health, daily routines, work environment, service, pets',
              7: 'partnerships, marriage, one-on-one relationships, open enemies',
              8: 'shared resources, intimacy, transformation, death/rebirth, other people\'s money',
              9: 'higher education, travel, philosophy, beliefs, publishing',
              10: 'career, public reputation, authority, legacy, a parent',
              11: 'friends, groups, hopes and wishes, community, networks',
              12: 'subconscious, spirituality, hidden matters, self-undoing, retreat',
            };
            personalizedRetroInfo = {
              housePlacement: `House ${houseNum}`,
              houseNumber: houseNum,
              sign: mercuryRxInfo.sign,
              degree: mercuryRxInfo.shadowDegree,
              guidance: `Mercury retrograde at ${mercuryRxInfo.shadowDegree} falls in your ${houseNum}th house of ${houseThemes[houseNum] || 'various themes'}. During the pre-shadow, notice what topics arise around ${houseThemes[houseNum]}. During the retrograde, you'll revisit, review, and rethink matters of ${houseThemes[houseNum]}. At the Mercury-Sun conjunction (midpoint), a key insight about ${houseThemes[houseNum]} will crystallize. When Mercury stations direct, you'll have clarity about what needs to change in this area.`,
            };
          }
        }
      }

      // userTimezone and userTzAbbr already declared above

      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: dateStr,
          timeOfDay,
          greeting,
          userTimezone,
          userTzAbbr,
          forceRegenerate: forceRefresh,
          moonPhase: (() => {
            // Avoid labeling adjacent days as "New Moon"/"Full Moon" when the exact phase isn't today
            const exactPhaseToday = getExactLunarPhase(now);
            if (exactPhaseToday) return exactPhaseToday.type;
            // Downshift broad bucket labels to more accurate waxing/waning
            if (moonPhase.phaseName === 'New Moon') {
              return moonPhase.phase < 180 ? 'Waxing Crescent' : 'Waning Crescent';
            }
            if (moonPhase.phaseName === 'Full Moon') {
              return moonPhase.phase < 180 ? 'Waxing Gibbous' : 'Waning Gibbous';
            }
            return moonPhase.phaseName;
          })(),
          exactLunarPhase: (() => {
            const exact = getExactLunarPhase(now);
            if (exact) return {
              type: exact.type,
              sign: exact.sign,
              position: exact.position,
              time: exact.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' ' + userTzAbbr,
              name: exact.name,
            };
            // If no exact phase today, find the nearest one and tell AI about it
            const nearest = findNearestMajorPhaseTime(now, moonPhase.phaseName);
            if (nearest) {
              const daysAway = Math.round((nearest.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const direction = daysAway > 0 ? 'in' : 'ago';
              return {
                type: nearest.type,
                time: nearest.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' ' + userTzAbbr,
                date: nearest.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                isToday: false,
                daysAway: Math.abs(daysAway),
                direction,
              };
            }
            return null;
          })(),
          moonSign: planets.moon?.signName || signGlyphToName[planets.moon?.sign] || 'Unknown',
          planetPositions,
          aspects: aspectsWithDetails,
          stelliums: stelliums.map(s => ({
            sign: s.sign,
            count: s.planets.length,
            planets: s.planets.map(p => ({ name: p }))
          })),
          mercuryRetro: mercuryRxInfo?.phase === 'retrograde-first-half' || mercuryRxInfo?.phase === 'retrograde-second-half',
          mercuryRetrogradeInfo: mercuryRxInfo ? { phase: mercuryRxInfo.phase, description: mercuryRxInfo.description, shadowDegree: mercuryRxInfo.shadowDegree, rxDegree: mercuryRxInfo.rxDegree, sign: mercuryRxInfo.sign, stationRetrograde: mercuryRxInfo.rxStart ? formatDateForTimezone(mercuryRxInfo.rxStart) : undefined, stationDirect: mercuryRxInfo.rxEnd ? formatDateForTimezone(mercuryRxInfo.rxEnd) : undefined, cazimi: undefined, postShadowClear: mercuryRxInfo.postShadowEnd ? formatDateForTimezone(mercuryRxInfo.postShadowEnd) : undefined } : null,
          // All-planet retrograde status (computed from ephemeris)
          allRetrogrades: (() => {
            const allPeriods = getAllRetrogradePeriods(now);
            const statuses: Record<string, { isRetrograde: boolean; sign?: string; stationDirect?: string }> = {};
            for (const [planet, periods] of Object.entries(allPeriods)) {
              const status = getRetrogradeStatus(now, periods);
              if (status.isRetrograde && status.retrogradeInfo) {
                statuses[planet] = { isRetrograde: true, sign: status.retrogradeInfo.sign, stationDirect: formatDateForTimezone(status.retrogradeInfo.end) };
              }
            }
            return Object.keys(statuses).length > 0 ? statuses : undefined;
          })(),
          moonSignChange: moonSignChangeToday,
          imminentSignChanges,
          personalizedRetrograde: personalizedRetroInfo,
          voiceStyle: effectiveVoiceStyle,
          referenceExcerpts: buildRefBlock(),
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch cosmic weather');
      }

      const generatedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      if (targetDate) {
        // Store for the specific day
        return data.insight;
      }
      
      const newCosmicData: CosmicData = {
        date: dateStr,
        moonPhase: moonPhase.phaseName,
        moonSign: planets.moon?.sign || 'Unknown',
        moonDegrees: planets.moon?.degree || 0,
        generatedAt: generatedTime,
        sunSign: planets.sun?.sign || 'Unknown',
        sunDegrees: planets.sun?.degree || 0,
        insight: data.insight
      };
      
      // Save to localStorage for the day (with voice style in key) - use effectiveVoiceStyle not state
      localStorage.setItem(`cosmic-weather-${todayKey}-${effectiveVoiceStyle}`, JSON.stringify(newCosmicData));
      
      setCosmicData(newCosmicData);
      setLastFetched(generatedTime);
      
      // Generate week forecast
      setWeekForecast(getWeekForecast());
    } catch (err) {
      console.error('Cosmic weather error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cosmic weather');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeekDayWeather = async (dayIndex: number) => {
    if (dayIndex === 0) {
      setSelectedWeekDay(0);
      return;
    }
    
    // Check if we already have this day's insight
    if (weekDayInsights[dayIndex]) {
      setSelectedWeekDay(dayIndex);
      return;
    }
    
    setWeekDayLoading(dayIndex);
    setSelectedWeekDay(dayIndex);
    
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayIndex);
      const insight = await fetchCosmicWeather(true, targetDate);
      
      setWeekDayInsights(prev => ({ ...prev, [dayIndex]: insight }));
    } catch (err) {
      console.error('Failed to fetch week day weather:', err);
    } finally {
      setWeekDayLoading(null);
    }
  };

  // Fetch week summary
  const fetchWeekSummary = async () => {
    if (weekSummary) {
      setViewMode('week');
      return;
    }
    
    setSummaryLoading('week');
    setViewMode('week');
    
    try {
      const weekData = getWeekForecast();
      const weekMoonSigns = weekData.map(d => d.moonSign);
      const weekMoonPhases = weekData.map(d => d.moonPhase);
      
      // Get current planetary positions so the AI doesn't hallucinate them
      const nowPlanets = getPlanetaryPositions(new Date());
      const signGlyphMap: Record<string, string> = { '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo','♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces' };
      const weekPlanetPositions = Object.entries(nowPlanets)
        .filter(([key]) => ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(key))
        .map(([key, val]: [string, any]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          sign: val?.signName || signGlyphMap[val?.sign] || val?.sign || 'Unknown',
          degree: typeof val?.degree === 'number' ? val.degree.toFixed(1) : val?.degree || 0,
        }));

      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: weekMoonPhases[0],
          moonSign: weekMoonSigns[0],
          planetPositions: weekPlanetPositions,
          customPrompt: `Write a comprehensive WEEKLY cosmic forecast for the next 7 days.

WEEK OVERVIEW:
- Moon signs this week: ${weekMoonSigns.join(' → ')}
- Moon phases: ${[...new Set(weekMoonPhases)].join(', ')}

IMPORTANT: Use ONLY the planetary positions provided in the planetPositions data. Do NOT guess or recall positions from memory. For example, if the data says Jupiter is at 15° Cancer, use THAT — do not say Jupiter is in Libra or any other sign.

Write in a professional astrologer's voice with these sections:

## 🌙 Weekly Theme
A 2-paragraph overview of the week's energy arc based on the moon's journey through the signs.

## 📅 Day-by-Day Energy Flow
Brief bullet points for each day highlighting the moon sign energy:
${weekData.map((d, i) => `- **${d.dayName}** (${d.dateStr}): Moon in ${d.moonSign} - ${d.moonPhase}`).join('\n')}

## ✨ Best Days This Week
Identify 2-3 standout days and what they're best for (love, work, creativity, rest).

## ⚠️ Watch Out For
Any challenging moon sign transits or VOC periods to be mindful of.

## 🎯 Weekly Focus
3 practical things to prioritize this week based on the lunar energy.

Keep the tone insightful, practical, and empowering. Do NOT include any meal plans, recipes, or food content.`,
          referenceExcerpts: buildRefBlock(),
        }
      });
      
      if (data?.insight) {
        setWeekSummary(data.insight);
      }
    } catch (err) {
      console.error('Failed to fetch week summary:', err);
      toast({ title: "Error", description: "Failed to generate week summary", variant: "destructive" });
    } finally {
      setSummaryLoading(null);
    }
  };

  // Fetch month summary  
  const fetchMonthSummary = async () => {
    if (monthSummary) {
      setViewMode('month');
      return;
    }
    
    setSummaryLoading('month');
    setViewMode('month');
    
    try {
      const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const planets = getPlanetaryPositions(today);
      const signGlyphMap2: Record<string, string> = { '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo','♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces' };
      const monthPlanetPositions = Object.entries(planets)
        .filter(([key]) => ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(key))
        .map(([key, val]: [string, any]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          sign: val?.signName || signGlyphMap2[val?.sign] || val?.sign || 'Unknown',
          degree: typeof val?.degree === 'number' ? val.degree.toFixed(1) : val?.degree || 0,
        }));
      
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: getMoonPhase(today).phaseName,
          moonSign: planets.moon?.sign || 'Unknown',
          planetPositions: monthPlanetPositions,
          customPrompt: `Write a comprehensive MONTHLY cosmic forecast for ${currentMonth}.

IMPORTANT: Use ONLY the planetary positions provided in the planetPositions data. Do NOT guess or recall positions from memory.

CURRENT POSITIONS (from planetPositions data):
${monthPlanetPositions.map(p => `- ${p.name}: ${p.degree}° ${p.sign}`).join('\n')}

Write in a professional astrologer's voice with these sections:

## 🌟 Monthly Overview
A 2-3 paragraph overview of ${currentMonth}'s cosmic themes based on planetary positions and major transits.

## 🌑 New Moon & 🌕 Full Moon
Identify the key lunations this month and their significance.

## 💫 Planetary Highlights
Major planetary movements, retrogrades, or aspects to watch this month.

## 💝 Love & Relationships
How the month's energy affects partnerships and emotional connections.

## 💼 Career & Goals
Professional opportunities and timing for career moves.

## ✨ Best Dates This Month
5-7 standout dates and what they're optimal for.

## 🎯 Monthly Intention
A guiding theme or mantra for the month.

Keep the tone professional, insightful, and practically applicable.`,
          referenceExcerpts: buildRefBlock(),
        }
      });
      
      if (data?.insight) {
        setMonthSummary(data.insight);
      }
    } catch (err) {
      console.error('Failed to fetch month summary:', err);
      toast({ title: "Error", description: "Failed to generate month summary", variant: "destructive" });
    } finally {
      setSummaryLoading(null);
    }
  };

  useEffect(() => {
    if (isOpen && !isLoading) {
      // Always update week forecast and planetary positions when opening
      setWeekForecast(getWeekForecast());
      const planets = getPlanetaryPositions(new Date());
      setCurrentPlanets(planets);
      setCurrentMoonDegree(planets.moon?.rawDegree || planets.moon?.degree || 0);
      setCurrentMoonMinutes(planets.moon?.minutes || 0);
      setCurrentMoonSign(planets.moon?.sign || 'Unknown');
      const voc = getVOCMoonDetails(new Date());
      setVocInfo(voc);
      
      // Only auto-fetch on first open if no cache exists for the current voice
      // This prevents auto-fetching when switching voices
      const cacheKey = `cosmic-weather-${todayKey}-${voiceStyle}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cosmicData && !cached) {
        fetchCosmicWeather(false);
      }
    }
  }, [isOpen]); // Only depend on isOpen, not voiceStyle

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({ title: "Generating image...", description: "Please wait a moment." });
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `cosmic-weather-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({ title: "Downloaded!", description: "Your cosmic weather has been saved." });
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!cosmicData) return;
    
    const shareText = `✨ Today's Cosmic Energy - ${todayStr}\n\n☽ Moon in ${cosmicData.moonSign} (${formatDegreeMinutes(currentMoonDegree, currentMoonMinutes)})\n☉ Sun in ${cosmicData.sunSign}\n🌙 ${cosmicData.moonPhase}\n\n#astrology #cosmicweather`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Today's Cosmic Energy",
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard!", description: "Share text has been copied." });
    }
  };

  // Get current moon phase quickly for the button
  const moonPhase = getMoonPhase(today);
  const planets = getPlanetaryPositions(today);

  // Get the insight to display based on selected day
  const displayInsight = selectedWeekDay === 0 
    ? cosmicData?.insight 
    : weekDayInsights[selectedWeekDay];

  return (
    <>
      {/* Icon Button for Header - exported separately */}
      <CosmicEnergyButton onClick={handleOpen} />

      {/* Full-Screen Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen px-4 py-8 md:px-8">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-secondary/80 hover:bg-secondary"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="max-w-4xl mx-auto" ref={contentRef}>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-foreground mb-4">
                  {selectedWeekDay === 0 ? "Today's Cosmic Energy" : weekForecast[selectedWeekDay]?.dayName + "'s Cosmic Energy"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {selectedWeekDay === 0 ? todayStr : weekForecast[selectedWeekDay]?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                
                {/* View Mode Buttons */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Button
                    variant={viewMode === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('daily')}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Daily
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={fetchWeekSummary}
                    disabled={summaryLoading === 'week'}
                    className="gap-2"
                  >
                    {summaryLoading === 'week' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={fetchMonthSummary}
                    disabled={summaryLoading === 'month'}
                    className="gap-2"
                  >
                    {summaryLoading === 'month' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                    Month
                  </Button>
                  <Button
                    variant={viewMode === 'lunar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('lunar')}
                    className={`gap-2 ${viewMode === 'lunar' 
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white border-0 ring-2 ring-white/50' 
                      : 'bg-transparent border-primary/30 text-foreground hover:bg-primary/10'}`}
                  >
                    <Moon className="h-4 w-4" />
                    ☽ Lunar Cycle
                  </Button>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Moon Phase</p>
                    <p className="font-medium">{moonPhase.phaseName}</p>
                    {(() => {
                      // Try exact phase for today
                      const exactPhase = getExactLunarPhase(today);
                      if (exactPhase) {
                        const timeStr = exactPhase.time.toLocaleTimeString('en-US', {
                          timeZone: 'America/New_York',
                          hour: 'numeric',
                          minute: '2-digit',
                        });
                        return (
                          <p className="text-xs text-primary mt-1 font-medium">
                            Exact at {timeStr} ET
                          </p>
                        );
                      }
                      // If we're showing New Moon / Full Moon label but exact isn't today,
                      // find the nearest one and display its date+time
                      if (moonPhase.phaseName === 'New Moon' || moonPhase.phaseName === 'Full Moon') {
                        const nearby = findNearestMajorPhaseTime(today, moonPhase.phaseName);
                        if (nearby) {
                          const timeStr = nearby.date.toLocaleTimeString('en-US', {
                            timeZone: 'America/New_York',
                            hour: 'numeric',
                            minute: '2-digit',
                          });
                          const dateStr = nearby.date.toLocaleDateString('en-US', {
                            timeZone: 'America/New_York',
                            month: 'short',
                            day: 'numeric',
                          });
                          return (
                            <p className="text-xs text-primary mt-1 font-medium">
                              {dateStr} at {timeStr} ET
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Moon Position</p>
                    {(() => {
                      const moonSignLabel = normalizeSignLabel(
                        (currentMoonSign || planets.moon?.sign || "Unknown").toString()
                      );
                      return (
                        <>
                          <p className="font-medium">
                            {ZODIAC_SYMBOLS[moonSignLabel as keyof typeof ZODIAC_SYMBOLS] || ''} {moonSignLabel}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatDegreeMinutes(currentMoonDegree, currentMoonMinutes)}
                          </p>
                        </>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground">
                      Live • Updates every minute
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Sun Position</p>
                    {(() => {
                      const sunSignLabel = normalizeSignLabel(
                        ((currentPlanets?.sun?.sign || planets.sun?.sign) || "Unknown").toString()
                      );
                      const sunDegrees = currentPlanets?.sun?.rawDegree || currentPlanets?.sun?.degree || planets.sun?.degree || 0;
                      return (
                        <>
                          <p className="font-medium">
                            {ZODIAC_SYMBOLS[sunSignLabel as keyof typeof ZODIAC_SYMBOLS] || ''} {sunSignLabel}
                          </p>
                          <p className="text-lg font-bold text-amber-600">
                            {formatDegreeMinutes(sunDegrees, currentPlanets?.sun?.minutes)}
                          </p>
                        </>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground">
                      Live position
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary border-border">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Illumination</p>
                    <p className="font-medium">{Math.round(moonPhase.illumination * 100)}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Voice Style Selector */}
              {viewMode === 'daily' && (
                <Card className="mb-6 border-border bg-gradient-to-r from-secondary/50 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Voice Style:</span>
                      </div>
                      <Select
                        value={voiceStyle}
                        onValueChange={(value: typeof voiceStyle) => {
                          setVoiceStyle(value);
                          setCosmicData(null);
                          // Pass the new voice directly to avoid race condition
                          fetchCosmicWeather(true, undefined, value);
                        }}
                      >
                        <SelectTrigger className="w-[220px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border z-[100]">
                          <SelectItem value="tara">🌙 Tara Vogel</SelectItem>
                          <SelectItem value="chris">📚 Chris Brennan</SelectItem>
                          <SelectItem value="anne">⚡ Anne Ortelee</SelectItem>
                          <SelectItem value="kathy">🌹 Kathy Rose</SelectItem>
                          <SelectItem value="krs">🕉️ KRS Channel</SelectItem>
                          <SelectItem value="malika">✊ Malika Siemper</SelectItem>
                          <SelectItem value="sarah">🌕 Sarah L'Harar</SelectItem>
                          <SelectItem value="astrodienst">🔬 Astrodienst</SelectItem>
                          <SelectItem value="cafe">☕ Cafe Astrology</SelectItem>
                          <SelectItem value="astrotwins">♊ AstroTwins</SelectItem>
                          <SelectItem value="chani">🦋 CHANI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {voiceStyle === 'tara' && 'Warm, nurturing mama energy - practical for everyday life and parenting'}
                      {voiceStyle === 'chris' && 'Scholarly Hellenistic approach - technical depth and historical context'}
                      {voiceStyle === 'anne' && 'Enthusiastic weekly weather - specific timing and practical action items'}
                      {voiceStyle === 'kathy' && 'Rose Astrology - intuitive, spiritual, heart-centered guidance'}
                      {voiceStyle === 'krs' && 'Vedic perspective - karmic, fate-focused, direct communication'}
                      {voiceStyle === 'malika' && 'Spiritual grounding - ancestral wisdom, embodied healing, liberation-focused'}
                      {voiceStyle === 'sarah' && 'Lunar Astro - moon-centered, feminine cyclical wisdom'}
                      {voiceStyle === 'astrodienst' && 'Technical precision - research-based, educational depth'}
                      {voiceStyle === 'cafe' && 'Straightforward, accessible - practical daily guidance'}
                      {voiceStyle === 'astrotwins' && 'Modern lifestyle - warm, hip, culturally current'}
                      {voiceStyle === 'chani' && 'Poetic and contemplative - therapeutic, socially conscious'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Chart Selector for Personalization */}
              {availableCharts.length > 0 && viewMode === 'daily' && (
                <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Personalize for:</span>
                      </div>
                      <ChartSelector
                        userNatalChart={userNatalChart}
                        savedCharts={savedCharts}
                        selectedChartId={selectedChartId || 'general'}
                        onSelect={(id) => setSelectedChartId(id === 'general' ? null : id)}
                        includeGeneral={true}
                        generalLabel="None (General)"
                        className="min-w-[200px]"
                      />
                      {selectedChart && (
                        <Badge variant="outline" className="bg-primary/10">
                          {selectedChart.planets.Sun?.sign && `☉ ${selectedChart.planets.Sun.sign}`}
                          {(selectedChart.houseCusps?.house1?.sign || selectedChart.planets.Ascendant?.sign) && ` • ASC ${selectedChart.houseCusps?.house1?.sign || selectedChart.planets.Ascendant?.sign}`}
                        </Badge>
                      )}
                    </div>
                    {!selectedChart && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Select a chart to see how today's transits affect you personally
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Personalized Transits Panel */}
              {selectedChart && viewMode === 'daily' && (
                <div className="mb-6">
                  <PersonalizedTransitsPanel
                    chart={selectedChart}
                    transitPositions={planets}
                    moonSign={currentMoonSign || planets.moon?.signName || 'Unknown'}
                    moonDegree={currentMoonDegree || planets.moon?.degree || 0}
                  />
                </div>
              )}

              {/* Void of Course Moon Alert */}
              {vocInfo.isVOC && vocInfo.start && vocInfo.end && (
                <Card className={`mb-6 ${vocInfo.isCurrentlyVOC ? 'bg-amber-500/10 border-amber-500/40' : 'bg-muted/50 border-border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${vocInfo.isCurrentlyVOC ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {vocInfo.isCurrentlyVOC ? '☽ Moon is Currently Void of Course' : '☽ Void of Course Moon Today'}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="text-foreground">The Moon is in </span>
                          <span className="font-medium">{vocInfo.currentMoonSign ? `${ZODIAC_SYMBOLS[vocInfo.currentMoonSign] || ''} ${vocInfo.currentMoonSign}` : 'its current sign'}</span>
                          <span className="text-foreground"> and is void of course </span>
                          <span className="font-medium text-foreground">{formatTime(vocInfo.start)} – {formatTime(vocInfo.end)}</span>
                          {vocInfo.moonEntersSign && (
                            <>
                              <span className="text-foreground"> before it moves into </span>
                              <span className="font-medium">{ZODIAC_SYMBOLS[vocInfo.moonEntersSign]} {vocInfo.moonEntersSign}</span>
                            </>
                          )}
                        </p>
                        
                        {/* Last Aspect Made */}
                        {vocInfo.lastAspect && (
                          <div className="mt-2 p-2 rounded bg-muted/50">
                            <p className="text-sm font-medium">
                              Last Aspect: ☽ {vocInfo.lastAspect.symbol} {getPlanetSymbol(vocInfo.lastAspect.planet.toLowerCase())} {vocInfo.lastAspect.planet}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getLastAspectMeaning(vocInfo.lastAspect.planet, vocInfo.lastAspect.aspectName)}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          The VOC Moon is ideal for rest, napping, meditation, and completing routine tasks. 
                          Avoid initiating new ventures or important decisions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* LUNAR CYCLE VIEW */}
              {viewMode === 'lunar' && (
                <div className="mb-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('daily')}
                    className="mb-4 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Daily
                  </Button>
                  <LunarCycleView 
                    onClose={() => setViewMode('daily')} 
                    userNatalChart={userNatalChart}
                    savedCharts={savedCharts}
                    selectedChartId={selectedChartId || 'general'}
                    onSelectChart={(id) => setSelectedChartId(id === 'general' ? null : id)}
                  />
                </div>
              )}

              {/* WEEK SUMMARY VIEW */}
              {viewMode === 'week' && (
                <>
                  <Card className="border-primary/20 shadow-lg mb-6">
                    <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-blue-500/5 to-transparent">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="font-serif text-2xl font-light flex items-center gap-3">
                          <Calendar className="h-6 w-6 text-blue-500" />
                          Weekly Cosmic Forecast
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewMode('daily')}
                          className="gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Daily
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      {summaryLoading === 'week' && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-muted-foreground">Generating weekly forecast...</p>
                        </div>
                      )}
                      {weekSummary && !summaryLoading && (
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              h2: ({ children }) => (
                                <h2 className="font-serif text-xl font-medium text-foreground mt-6 mb-3 pb-2 border-b border-primary/10 first:mt-0">
                                  {children}
                                </h2>
                              ),
                              a: ({ href, children }) => (
                                <button 
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    if (href) {
                                      try {
                                        await navigator.clipboard.writeText(href);
                                        toast({ title: "Recipe link copied!", description: "Paste in your browser to search for the recipe." });
                                      } catch {
                                        toast({ title: "Recipe link", description: href, duration: 10000 });
                                      }
                                    }
                                  }}
                                  className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit inline-flex items-center gap-1"
                                >
                                  {children}
                                  <span className="text-xs opacity-60">📋</span>
                                </button>
                              ),
                              ul: ({ children }) => (
                                <ul className="space-y-2 my-4">{children}</ul>
                              ),
                              li: ({ children }) => (
                                <li className="flex items-start gap-2">
                                  <span className="text-primary mt-1.5">•</span>
                                  <span>{children}</span>
                                </li>
                              ),
                              p: ({ children }) => (
                                <p className="text-foreground/90 leading-relaxed my-3">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-foreground">{children}</strong>
                              ),
                            }}
                          >
                            {weekSummary}
                          </ReactMarkdown>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* MONTH SUMMARY VIEW */}
              {viewMode === 'month' && (
                <Card className="border-primary/20 shadow-lg mb-6">
                  <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-purple-500/5 to-transparent">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="font-serif text-2xl font-light flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-purple-500" />
                        Monthly Cosmic Forecast
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewMode('daily')}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Daily
                      </Button>
                    </div>
                    <p className="text-muted-foreground">
                      {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    {summaryLoading === 'month' && (
                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating monthly forecast...</p>
                      </div>
                    )}
                    {monthSummary && !summaryLoading && (
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h2: ({ children }) => (
                              <h2 className="font-serif text-xl font-medium text-foreground mt-6 mb-3 pb-2 border-b border-primary/10 first:mt-0">
                                {children}
                              </h2>
                            ),
                            a: ({ href, children }) => (
                              <button 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (href) {
                                    try {
                                      await navigator.clipboard.writeText(href);
                                      toast({ title: "Recipe link copied!", description: "Paste in your browser to search for the recipe." });
                                    } catch {
                                      toast({ title: "Recipe link", description: href, duration: 10000 });
                                    }
                                  }
                                }}
                                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit inline-flex items-center gap-1"
                              >
                                {children}
                                <span className="text-xs opacity-60">📋</span>
                              </button>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-2 my-4">{children}</ul>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-2">
                                <span className="text-primary mt-1.5">•</span>
                                <span>{children}</span>
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="text-foreground/90 leading-relaxed my-3">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                          }}
                        >
                          {monthSummary}
                        </ReactMarkdown>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* DAILY VIEW - Main Content Card */}
              {viewMode === 'daily' && (
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="font-serif text-2xl font-light flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Cosmic Weather
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          disabled={!cosmicData}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadPDF}
                          disabled={!cosmicData}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchCosmicWeather(true)}
                          disabled={isLoading}
                          className="text-muted-foreground hover:text-foreground"
                          title="Generate a new version of today's reading"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                    {lastFetched && selectedWeekDay === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Today's reading generated at {lastFetched} • <span className="italic">Preserved for the day</span> • Moon position updates live
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    {(isLoading || weekDayLoading !== null) && (
                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Reading the cosmic weather...</p>
                      </div>
                    )}

                    {error && (
                      <div className="text-center py-8">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button variant="outline" onClick={() => fetchCosmicWeather(true)}>
                          Try Again
                        </Button>
                      </div>
                    )}

                    {!isLoading && weekDayLoading === null && !error && displayInsight && (
                      <>
                      {/* Listen Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={playTtsInsights}
                          className="flex items-center gap-2"
                        >
                          {ttsState === 'playing' ? (
                            <><Square className="h-3.5 w-3.5 fill-current" /> Stop</>
                          ) : ttsState === 'paused' ? (
                            <><Volume2 className="h-4 w-4" /> Resume</>
                          ) : (
                            <><Volume2 className="h-4 w-4" /> Listen</>
                          )}
                        </Button>
                        {ttsState === 'playing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { speechSynthesis.pause(); setTtsState('paused'); }}
                          >
                            Pause
                          </Button>
                        )}
                        {availableVoices.length > 0 && (
                          <Select
                            value={ttsVoiceName || availableVoices[0]?.name || ''}
                            onValueChange={(v) => {
                              setTtsVoiceName(v);
                              localStorage.setItem('cosmic-tts-voice-name', v);
                              stopTtsAudio();
                            }}
                          >
                            <SelectTrigger className="w-[200px] bg-background h-9">
                              <SelectValue placeholder="Choose voice" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border z-[100] max-h-[300px]">
                              {availableVoices.map(v => (
                                <SelectItem key={v.name} value={v.name}>
                                  {v.name.replace(/Google\s*/i, '')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h2: ({ children }) => (
                                <h2 className="font-serif text-xl font-medium text-foreground mt-6 mb-3 pb-2 border-b first:mt-0 border-primary/10">
                                  {children}
                                </h2>
                              ),
                            a: ({ href, children }) => (
                              <button 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (href) {
                                    try {
                                      await navigator.clipboard.writeText(href);
                                      toast({ title: "Recipe link copied!", description: "Paste in your browser to search for the recipe." });
                                    } catch {
                                      toast({ title: "Recipe link", description: href, duration: 10000 });
                                    }
                                  }
                                }}
                                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit inline-flex items-center gap-1"
                              >
                                {children}
                                <span className="text-xs opacity-60">📋</span>
                              </button>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-2 my-4">{children}</ul>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-2">
                                <span className="text-primary mt-1.5">•</span>
                                <span>{children}</span>
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="text-foreground/90 leading-relaxed my-3">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                          }}
                        >
                          {displayInsight?.replace(/\*\*RECIPE_START\*\*[\s\S]*?\*\*RECIPE_END\*\*/, '')}
                        </ReactMarkdown>
                        
                      </div>
                      </>
                    )}

                    {!isLoading && weekDayLoading === null && !error && !displayInsight && selectedWeekDay !== 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Click a day to load its cosmic weather</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 7-Day Forecast - Clickable */}
              {weekForecast.length > 0 && (
                <Card className="mt-6 border-border">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg font-light flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      7-Day Cosmic Forecast
                      <span className="text-xs font-normal text-muted-foreground ml-2">(click any day for details)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {weekForecast.map((day, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => fetchWeekDayWeather(idx)}
                          className={`text-center p-3 rounded-lg transition-all cursor-pointer hover:scale-105 ${
                            selectedWeekDay === idx 
                              ? 'bg-primary/20 border-2 border-primary shadow-md' 
                              : idx === 0 
                                ? 'bg-primary/10 border border-primary/30 hover:bg-primary/15' 
                                : 'bg-secondary/50 hover:bg-secondary/80'
                          }`}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">{day.dayName}</p>
                          <p className="text-xs text-muted-foreground">{day.dateStr}</p>
                          <div className="my-2 text-2xl">{getMoonPhaseEmoji(day.moonPhase)}</div>
                          <p className="text-sm font-medium">
                            {ZODIAC_SYMBOLS[day.moonSign]}
                          </p>
                          <p className="text-xs text-muted-foreground">{day.moonSign}</p>
                          {weekDayLoading === idx && (
                            <Loader2 className="h-3 w-3 animate-spin mx-auto mt-1 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Planetary Positions - Live Dynamic */}
              <Card className="mt-6 border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg font-light">Current Planetary Positions</CardTitle>
                    <span className="text-xs text-primary flex items-center gap-1">
                      <span className="animate-pulse">●</span> Live
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Calculated for your local timezone • Updates every minute
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const allEntries = Object.entries(currentPlanets || planets).filter(([, data]) => data && data.sign);
                    // Major planets on first row, nodes on second row (North Node before South Node)
                    const nodeKeys = ['northnode', 'southnode'];
                    const majorPlanets = allEntries.filter(([planet]) => !nodeKeys.includes(planet.toLowerCase()));
                    const nodes = allEntries
                      .filter(([planet]) => nodeKeys.includes(planet.toLowerCase()))
                      .sort((a, b) => nodeKeys.indexOf(a[0].toLowerCase()) - nodeKeys.indexOf(b[0].toLowerCase()));
                    
                    const renderPlanetBadge = ([planet, data]: [string, typeof planets.sun]) => {
                      if (!data || !data.sign) return null;
                      const displayMinutes = data.minutes !== undefined ? data.minutes : 0;
                      const displayName = planet === 'northnode' ? 'North Node' : 
                                          planet === 'southnode' ? 'South Node' :
                                          planet.charAt(0).toUpperCase() + planet.slice(1);
                      return (
                        <Badge 
                          key={planet} 
                          variant="secondary" 
                          className="text-sm py-3 px-4 flex flex-col items-center gap-1"
                        >
                          <span className="text-3xl">{ZODIAC_SYMBOLS[data.sign] || ''}</span>
                          <span className="text-xs text-muted-foreground">{data.sign}</span>
                          <span className="capitalize text-xs font-medium text-foreground">{displayName}</span>
                          <span className="text-primary font-medium text-xs">
                            {data.degree}°{displayMinutes.toString().padStart(2, '0')}'
                          </span>
                        </Badge>
                      );
                    };
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {majorPlanets.map(renderPlanetBadge)}
                        </div>
                        {nodes.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {nodes.map(renderPlanetBadge)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Back Button */}
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleClose}
                  className="px-8"
                >
                  Return to Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
