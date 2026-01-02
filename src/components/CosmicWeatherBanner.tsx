import { 
  getPlanetSymbol, 
  getStelliumMeaning,
  Stellium,
  RareAspect,
  NodeAspect 
} from "@/lib/astrology";

interface CosmicWeatherBannerProps {
  stelliums: Stellium[];
  rareAspects: RareAspect[];
  nodeAspects: NodeAspect[];
}

export const CosmicWeatherBanner = ({ 
  stelliums, 
  rareAspects, 
  nodeAspects 
}: CosmicWeatherBannerProps) => {
  // Don't render if nothing to show
  if (stelliums.length === 0 && rareAspects.length === 0 && nodeAspects.length === 0) {
    return null;
  }

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
        <div className="mb-5 p-4 rounded-lg bg-white/10 backdrop-blur">
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

      {/* Astrologer Sources */}
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">
          📚 Master Astrologer Insights
        </h3>
        <p className="text-sm opacity-90 leading-relaxed mb-3">
          For deeper cosmic wisdom on today's transits, consult these trusted sources who provide daily forecasts and lunar guidance:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-white/20">Jessica Davidson</span>
          <span className="px-2 py-1 rounded bg-white/20">Cafe Astrology</span>
          <span className="px-2 py-1 rounded bg-white/20">Chani Nicholas</span>
          <span className="px-2 py-1 rounded bg-white/20">The Dark Pixie Universe</span>
          <span className="px-2 py-1 rounded bg-white/20">Astrology King</span>
        </div>
        <div className="text-xs mt-3 opacity-60 italic">
          These astrologers offer daily transit readings and lunar phase guidance.
        </div>
      </div>
    </div>
  );
};
