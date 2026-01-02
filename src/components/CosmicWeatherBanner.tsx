import { useState, useEffect } from 'react';
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

interface CosmicWeatherBannerProps {
  date: Date;
  moonPhase: MoonPhase;
  moonSign: string;
  stelliums: Stellium[];
  rareAspects: RareAspect[];
  nodeAspects: NodeAspect[];
  mercuryRetro: boolean;
  aspects: Aspect[];
}

export const CosmicWeatherBanner = ({ 
  date,
  moonPhase,
  moonSign,
  stelliums, 
  rareAspects, 
  nodeAspects,
  mercuryRetro,
  aspects
}: CosmicWeatherBannerProps) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: moonPhase.phaseName,
          moonSign,
          stelliums,
          rareAspects,
          nodeAspects,
          mercuryRetro,
          aspects,
        }
      });

      if (error) {
        console.error('Cosmic weather error:', error);
        toast.error('Could not load cosmic insights');
        return;
      }

      setAiInsights(data.insight);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      toast.error('Failed to connect to cosmic wisdom');
    } finally {
      setLoading(false);
    }
  };

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
        
        {!hasLoaded && !loading && (
          <div className="text-center py-4">
            <p className="text-sm opacity-80 mb-3">
              Get personalized cosmic insights synthesized from master astrologer wisdom
            </p>
            <button
              onClick={fetchInsights}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded font-semibold text-sm transition-colors"
            >
              🔮 Generate Cosmic Insights
            </button>
          </div>
        )}

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
