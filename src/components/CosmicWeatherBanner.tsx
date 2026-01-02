import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  getPlanetSymbol, 
  getStelliumMeaning,
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
  planetPositions
}: CosmicWeatherBannerProps) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  // Determine the correct moon sign to use:
  // - For exact Full/New Moon, use the exactLunarPhase.sign
  // - Otherwise use the current transiting moon sign
  const effectiveMoonSign = exactLunarPhase?.sign || moonSign;
  const isExactPhase = exactLunarPhase && (exactLunarPhase.type === 'Full Moon' || exactLunarPhase.type === 'New Moon');

  const fetchInsights = async () => {
    if (loading || hasFetched.current) return;
    
    setLoading(true);
    hasFetched.current = true;
    
    try {
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: isExactPhase ? exactLunarPhase.type : moonPhase.phaseName,
          moonSign: effectiveMoonSign,
          exactLunarPhase: isExactPhase ? {
            type: exactLunarPhase.type,
            sign: exactLunarPhase.sign,
            name: exactLunarPhase.name,
            isSupermoon: exactLunarPhase.isSupermoon,
          } : null,
          stelliums,
          rareAspects,
          nodeAspects,
          mercuryRetro,
          aspects,
          planetPositions,
        }
      });

      if (error) {
        console.error('Cosmic weather error:', error);
        toast.error('Could not load cosmic insights');
        hasFetched.current = false;
        return;
      }

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
    fetchInsights();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Simple markdown to HTML conversion for the insights
  const formatInsights = (text: string) => {
    return text
      .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-yellow-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div 
      className="mb-6 p-6 rounded-lg text-white"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}
    >
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
        🌟 Cosmic Weather Report
      </h2>

      {/* AI Insights Section */}
      <div className="mb-5 p-4 rounded-lg bg-white/10 backdrop-blur">
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">
          ✨ AI Astrologer Synthesis
        </h3>
        
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
          Insights synthesized from astrological traditions including Jessica Davidson, Cafe Astrology, Chani Nicholas, and classical sources.
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
    </div>
  );
};
