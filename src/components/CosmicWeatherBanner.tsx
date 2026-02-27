import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Loader2, Volume2, Square } from 'lucide-react';
import { 
  getPlanetSymbol, 
  getStelliumMeaning,
  getPlanetaryPositions,
  calculateDailyAspects,
  Stellium,
  RareAspect,
  NodeAspect,
  MoonPhase,
  Aspect
} from "@/lib/astrology";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExactLunarPhase {
  type: 'New Moon' | 'Full Moon' | 'First Quarter' | 'Last Quarter';
  sign: string;
  time: Date;
  position: string;
  sunPosition?: string;
  emoji: string;
  name?: string;
  distance: number;
  isSupermoon?: boolean;
  supermoonSequence?: string;
}

interface PlanetPositionForAI {
  name: string;
  sign: string;
  degree: number;
}

interface UpcomingEvent {
  date: string;
  type: string;
  description: string;
  daysAway: number;
}

interface MoonSignChangeData {
  fromSign: string;
  toSign: string;
  time: string;
}

interface ImminentSignChange {
  planet: string;
  currentSign: string;
  degree: number;
  nextSign: string;
  ingressTime?: string;
}

interface MercuryRetrogradeInfoData {
  phase: string;
  description: string;
  shadowDegree?: string;
  rxDegree?: string;
  sign?: string;
  stationRetrograde?: string;
  stationDirect?: string;
  postShadowClear?: string;
}

interface CosmicWeatherBannerProps {
  date: Date;
  moonPhase: MoonPhase;
  moonSign: string;
  exactLunarPhase?: ExactLunarPhase | null;
  stelliums: Stellium[];
  rareAspects: RareAspect[];
  nodeAspects: NodeAspect[];
  mercuryRetro: boolean;
  aspects: Aspect[];
  planetPositions: PlanetPositionForAI[];
  upcomingEvents?: UpcomingEvent[];
  // Extended data fields (when provided, forwarded to AI for richer reports)
  voiceStyle?: string;
  userTimezone?: string;
  userTzAbbr?: string;
  moonSignChange?: MoonSignChangeData | null;
  imminentSignChanges?: ImminentSignChange[];
  mercuryRetrogradeInfo?: MercuryRetrogradeInfoData | null;
  allRetrogrades?: Record<string, { isRetrograde: boolean; sign?: string; stationDirect?: string }>;
  personalizedRetrograde?: { housePlacement: string; guidance: string } | null;
  eclipseContext?: string;
}

export const CosmicWeatherBanner = ({ 
  date,
  moonPhase,
  moonSign,
  exactLunarPhase,
  stelliums, 
  rareAspects, 
  nodeAspects,
  mercuryRetro,
  aspects,
  planetPositions,
  upcomingEvents = [],
  voiceStyle,
  userTimezone,
  userTzAbbr,
  moonSignChange,
  imminentSignChanges,
  mercuryRetrogradeInfo,
  allRetrogrades,
  personalizedRetrograde,
  eclipseContext,
}: CosmicWeatherBannerProps) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const [audioState, setAudioState] = useState<'idle' | 'playing'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopAudio = useCallback(() => {
    speechSynthesis.cancel();
    utteranceRef.current = null;
    setAudioState('idle');
  }, []);

  const playInsights = useCallback(() => {
    if (!aiInsights) return;

    if (audioState === 'playing') {
      stopAudio();
      return;
    }

    const cleanText = aiInsights
      .replace(/##\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/- /g, '')
      .replace(/\n+/g, ' ')
      .replace(/[☉☽☿♀♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓☊☋△□⚹☌]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setAudioState('idle');
    utterance.onerror = () => setAudioState('idle');
    utteranceRef.current = utterance;

    speechSynthesis.speak(utterance);
    setAudioState('playing');
  }, [aiInsights, audioState, stopAudio]);

  // Cleanup audio on unmount or date change
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [date, stopAudio]);

  // Compute 7-day major aspects (today + 6 days)
  const weekAspects = useMemo(() => {
    const result: { label: string; summary: string }[] = [];
    const today = new Date(date);

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const label = i === 0
        ? 'Today'
        : i === 1
        ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const planets = getPlanetaryPositions(d);
      const dayAspects = calculateDailyAspects(planets);

      // Pick the "major" aspect: prioritise conjunctions/oppositions/squares of slow planets
      const ranked = [...dayAspects].sort((a, b) => {
        const weight = (asp: Aspect) => {
          let w = 0;
          const orbNum = parseFloat(asp.orb) || 5;
          w += (5 - Math.min(orbNum, 5)) * 2;
          // Hard aspects are more noteworthy
          if (asp.type === 'Conjunction') w += 6;
          if (asp.type === 'Opposition') w += 5;
          if (asp.type === 'Square') w += 4;
          if (asp.type === 'Trine') w += 3;
          // Applying aspects are more important
          if (asp.applying) w += 2;
          return w;
        };
        return weight(b) - weight(a);
      });

      const top = ranked[0];
      const summary = top
        ? `${getPlanetSymbol(top.planet1.toLowerCase())} ${top.planet1} ${top.symbol} ${getPlanetSymbol(top.planet2.toLowerCase())} ${top.planet2} (${top.type}, ${top.orb}° orb)`
        : 'No major aspects';

      result.push({ label, summary });
    }
    return result;
  }, [date]);

  // Create a stable cache key based on date + prompt version to avoid stale astrology text
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const CLIENT_CACHE_VERSION = 'v2-mercury-fact-check';
  const cacheKey = `cosmic-day-weather-${CLIENT_CACHE_VERSION}-${dateKey}`;

  // Determine the correct moon sign to use:
  // - For an exact lunar event, use exactLunarPhase.sign
  // - Otherwise use the current transiting moon sign
  const isExactPhase = exactLunarPhase != null;
  const effectiveMoonSign = isExactPhase ? exactLunarPhase.sign : moonSign;

  // Avoid labeling adjacent days as "Full Moon"/"New Moon".
  // If we do NOT have an exact lunar event for today, downshift the broad phase bucket
  // into a more truthful waxing/waning label.
  const phaseForAI = (() => {
    if (exactLunarPhase) return exactLunarPhase.type;

    if (moonPhase.phaseName === 'New Moon') {
      return moonPhase.phase < 180 ? 'Waxing Crescent' : 'Waning Crescent';
    }
    if (moonPhase.phaseName === 'Full Moon') {
      return moonPhase.phase < 180 ? 'Waxing Gibbous' : 'Waning Gibbous';
    }
    return moonPhase.phaseName;
  })();

  const fetchInsights = async () => {
    if (loading) return;
    
    // Check localStorage cache first (this is the primary cache)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (less than 20 hours old)
        const generatedAt = new Date(parsed.generatedAt);
        const ageHours = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60);
        if (ageHours < 20 && parsed.insight) {
          console.log(`Using cached cosmic weather for ${dateKey} (${ageHours.toFixed(1)}h old)`);
          setAiInsights(parsed.insight);
          hasFetched.current = true;
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached day weather:', e);
        // Continue to fetch fresh data
      }
    }
    
    // Already fetched this session, don't re-fetch
    if (hasFetched.current) return;
    
    setLoading(true);
    hasFetched.current = true;
    
    try {
      // Get device ID for server-side caching
      const deviceId = localStorage.getItem('astro-device-id') || 'default';
      
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: phaseForAI,
          moonSign: effectiveMoonSign,
          exactLunarPhase: isExactPhase ? {
            type: exactLunarPhase.type,
            sign: exactLunarPhase.sign,
            position: exactLunarPhase.position,
            time: exactLunarPhase.time.toLocaleTimeString('en-US', {
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit',
            }) + ' ET',
            name: exactLunarPhase.name,
            isSupermoon: exactLunarPhase.isSupermoon,
          } : null,
          stelliums,
          rareAspects,
          nodeAspects,
          mercuryRetro,
          aspects: aspects.map(a => ({
            ...a,
            applyingSeparating: a.applying ? 'APPLYING (building toward exact)' : 'SEPARATING (moving apart)'
          })),
          planetPositions,
          upcomingEvents: upcomingEvents.length > 0 ? upcomingEvents : undefined,
          deviceId,
          // Forward extended data when available
          ...(voiceStyle && { voiceStyle }),
          ...(userTimezone && { userTimezone }),
          ...(userTzAbbr && { userTzAbbr }),
          ...(moonSignChange && { moonSignChange }),
          ...(imminentSignChanges && imminentSignChanges.length > 0 && { imminentSignChanges }),
          ...(mercuryRetrogradeInfo && { mercuryRetrogradeInfo }),
          ...(allRetrogrades && { allRetrogrades }),
          ...(personalizedRetrograde && { personalizedRetrograde }),
          ...(eclipseContext && { eclipseContext }),
        }
      });

      if (error) {
        console.error('Cosmic weather error:', error);
        toast.error('Could not load cosmic insights');
        hasFetched.current = false;
        return;
      }

      // Save to localStorage cache (this is the primary client-side cache)
      localStorage.setItem(cacheKey, JSON.stringify({
        insight: data.insight,
        generatedAt: new Date().toISOString(),
        cached: data.cached || false
      }));

      console.log(`Cosmic weather for ${dateKey}: ${data.cached ? 'from server cache' : 'freshly generated'}`);
      setAiInsights(data.insight);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      toast.error('Failed to connect to cosmic wisdom');
      hasFetched.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch insights when component mounts
  useEffect(() => {
    // Reset hasFetched when date changes
    hasFetched.current = false;
    setAiInsights(null);
    fetchInsights();
  }, [dateKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simple markdown to HTML conversion for the insights
  const formatInsights = (text: string) => {
    return text
      .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-yellow-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div 
      className="mb-6 p-6 rounded-lg text-white"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🌟 Cosmic Weather Report
        </h2>
        <span className="text-xs opacity-70">
          Positions as of {currentTime} ET
        </span>
      </div>

      {/* AI Insights Section */}
      <div className="mb-5 p-4 rounded-lg bg-white/10 backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-yellow-300">
            ✨ AI Astrologer Synthesis
          </h3>
          {aiInsights && (
            <button
              onClick={playInsights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
              title={audioState === 'playing' ? 'Stop reading' : 'Listen to report'}
            >
              {audioState === 'playing' ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Listen
                </>
              )}
            </button>
          )}
        </div>
        
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Consulting the stars...</span>
          </div>
        )}

        {aiInsights && (
          <div 
            className="text-sm leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatInsights(aiInsights) }}
          />
        )}

        {!loading && !aiInsights && (
          <div className="text-center py-4">
            <p className="text-sm opacity-80">Unable to load insights. Please try again later.</p>
          </div>
        )}

        <div className="text-xs mt-4 pt-3 border-t border-white/20 opacity-60 italic">
          Generated from the chart data shown above (planet signs, degrees, and aspects).
        </div>
      </div>

      {/* Stellium Alert */}
      {stelliums.length > 0 && (
        <div className="mb-5 p-4 rounded-lg bg-white/10 backdrop-blur">
          <h3 className="text-lg font-semibold mb-4 text-yellow-300">
            ⚡ Stellium Alert
          </h3>
          {stelliums.map((s, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="text-lg font-semibold mb-2">
                {s.planets.map(p => p.symbol).join(' ')} Triple Conjunction in {s.sign}
              </div>
              <div className="text-sm opacity-90 mb-3">
                {s.planets.map(p => p.name).join(', ')} all in {s.sign}
              </div>
              <div className="text-sm leading-relaxed p-3 rounded bg-white/15">
                <strong>Translation:</strong> {getStelliumMeaning(s.sign)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Destiny Aspects (Node Aspects) */}
      {nodeAspects.length > 0 && (
        <div className="mb-5 p-4 rounded-lg bg-white/10 backdrop-blur">
          <h3 className="text-lg font-semibold mb-4 text-green-300">
            ☊ Destiny Aspects
          </h3>
          {nodeAspects.map((a, i) => (
            <div key={i} className="mb-3 last:mb-0 p-3 rounded bg-white/10">
              <div className="font-semibold mb-1">
                {getPlanetSymbol(a.planet.toLowerCase())} {a.planet} {a.symbol} {a.node === 'North' ? '☊' : '☋'} {a.node} Node
              </div>
              <div className="text-sm opacity-90">{a.meaning}</div>
            </div>
          ))}
        </div>
      )}

      {/* Rare Aspects */}
      {rareAspects.length > 0 && (
        <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
          <h3 className="text-lg font-semibold mb-4 text-yellow-300">
            🔮 Rare Aspects Active
          </h3>
          {rareAspects.map((a, i) => (
            <div key={i} className="mb-3 last:mb-0 p-3 rounded bg-white/10">
              <div className="font-semibold mb-1">
                {getPlanetSymbol(a.planet1.toLowerCase())} {a.symbol} {getPlanetSymbol(a.planet2.toLowerCase())} — {a.type} ({a.angle}°)
              </div>
              <div className="text-xs opacity-75">Orb: {a.orb}°</div>
              <div className="text-sm opacity-90 mt-1">{a.meaning}</div>
            </div>
          ))}
        </div>
      )}

      {/* Coming Up – 7-Day Major Aspects */}
      <div className="mt-5 p-4 rounded-lg bg-white/10 backdrop-blur">
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">
          📅 Coming Up
        </h3>
        <ul className="space-y-2 text-sm">
          {weekAspects.map((day, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px] shrink-0">{day.label}:</span>
              <span className="opacity-90">{day.summary}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
