import { X } from 'lucide-react';
import { DayData, getPlanetSymbol, MoonPhase, getColorExplanation, ColorExplanation } from '@/lib/astrology';
import { UserData } from '@/hooks/useUserData';

// Sign-specific energies for daily guidance
const SIGN_ENERGIES: Record<string, { action: string; focus: string; avoid: string }> = {
  Aries: { action: "initiate boldly", focus: "courage and independence", avoid: "impulsiveness" },
  Taurus: { action: "build steadily", focus: "sensuality and security", avoid: "stubbornness" },
  Gemini: { action: "communicate freely", focus: "learning and connections", avoid: "scattered energy" },
  Cancer: { action: "nurture deeply", focus: "emotions and home", avoid: "over-sensitivity" },
  Leo: { action: "create joyfully", focus: "self-expression and confidence", avoid: "ego battles" },
  Virgo: { action: "organize wisely", focus: "health and service", avoid: "perfectionism" },
  Libra: { action: "harmonize gracefully", focus: "relationships and beauty", avoid: "indecision" },
  Scorpio: { action: "transform powerfully", focus: "depth and intimacy", avoid: "manipulation" },
  Sagittarius: { action: "explore freely", focus: "philosophy and adventure", avoid: "over-extension" },
  Capricorn: { action: "structure deliberately", focus: "ambition and discipline", avoid: "rigidity" },
  Aquarius: { action: "innovate uniquely", focus: "community and ideals", avoid: "detachment" },
  Pisces: { action: "flow intuitively", focus: "spirituality and compassion", avoid: "escapism" },
};

const getDailyGuidance = (moonPhase: MoonPhase, mercuryRetro: boolean, moonSign: string, exactPhaseSign?: string): string => {
  // Use the exact phase sign for New/Full Moon, otherwise use general moon sign
  const phaseSign = (moonPhase.phaseName === "New Moon" || moonPhase.phaseName === "Full Moon") && exactPhaseSign 
    ? exactPhaseSign 
    : moonSign;
  const signData = SIGN_ENERGIES[phaseSign] || SIGN_ENERGIES.Aries;

  if (mercuryRetro) {
    return `Mercury Retrograde in ${moonSign} - Review and revise communications. Back up data. Reconnect with old contacts. Avoid new contracts. Practice patience with technology and travel.`;
  }
  if (moonPhase.isBalsamic) {
    return `Balsamic Moon in ${moonSign} - The final surrender before rebirth. This is sacred rest time. Release attachments. Meditate and dream. Trust the void. ${signData.focus} dissolves into the cosmic flow. Avoid starting anything new.`;
  }
  if (moonPhase.phaseName === "New Moon") {
    return `New Moon in ${phaseSign} - Plant seeds of intention. Set powerful goals aligned with ${signData.focus}. ${signData.action} with fresh vision. Channel this initiating energy wisely. Avoid: ${signData.avoid}.`;
  }
  if (moonPhase.phaseName === "Full Moon") {
    return `Full Moon in ${phaseSign} - Maximum illumination! Celebrate what you've manifested around ${signData.focus}. Release what no longer serves. Emotions peak. ${signData.action} with full awareness. Harvest your efforts.`;
  }
  if (moonPhase.phaseName.includes("Waxing")) {
    return `${moonPhase.phaseName} in ${moonSign} - Energy is building. ${signData.action} with awareness of ${signData.focus}. Avoid ${signData.avoid}.`;
  }
  if (moonPhase.phaseName.includes("Waning")) {
    return `${moonPhase.phaseName} in ${moonSign} - Time for release and integration. Reflect on ${signData.focus}. ${signData.action} mindfully.`;
  }
  return `Moon in ${moonSign} - ${signData.action} with awareness of ${signData.focus}. Avoid ${signData.avoid}.`;
};

interface DayDetailProps {
  dayData: DayData;
  userData: UserData | null;
  onClose: () => void;
}

export const DayDetail = ({ dayData, onClose }: DayDetailProps) => {
  const { date, planets, moonPhase, mercuryRetro, personalTransits, majorIngresses, aspects, voc, exactLunarPhase } = dayData;
  const colorExplanation = getColorExplanation(aspects || [], moonPhase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-6 top-6 text-muted-foreground transition-colors hover:text-foreground"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl mb-6">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>

        {/* Exact Lunar Phase Time - Highlighted */}
        {exactLunarPhase && (
          <div className="mb-6 p-4 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{exactLunarPhase.emoji}</span>
              <div>
                {exactLunarPhase.isSupermoon && (
                  <div className="text-amber-600 text-sm font-bold mb-1">
                    ✦ SUPERMOON
                    {exactLunarPhase.supermoonSequence && (
                      <span className="font-normal ml-2">({exactLunarPhase.supermoonSequence})</span>
                    )}
                  </div>
                )}
                {exactLunarPhase.name && (
                  <div className="font-serif text-xl font-medium text-foreground">
                    {exactLunarPhase.name}
                  </div>
                )}
                <div className="font-serif text-lg font-medium text-foreground">
                  {exactLunarPhase.type} in {exactLunarPhase.sign} at{' '}
                  {exactLunarPhase.time.toLocaleTimeString('en-US', {
                    timeZone: 'America/New_York',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  ET
                </div>
                <div className="text-sm text-muted-foreground">
                  Moon: {exactLunarPhase.position}
                </div>
                {exactLunarPhase.sunPosition && (
                  <div className="text-sm text-muted-foreground">
                    Sun: {exactLunarPhase.sunPosition} (opposite)
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Distance: {exactLunarPhase.distance.toLocaleString()} km
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Why These Colors Section */}
        <ColorExplanationSection colorExplanation={colorExplanation} aspects={aspects} />

        {/* Major Ingresses Section - Highlighted */}
        {majorIngresses.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border bg-amber-50 dark:bg-amber-950/20 p-4 rounded-sm">
            <h3 className="text-[11px] uppercase tracking-widest text-primary mb-3">⭐ Planetary Ingresses Today</h3>
            <ul className="space-y-2">
              {majorIngresses.map((ingress, i) => (
                <li key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ingress.icon}</span>
                    <span className="font-medium text-foreground">{ingress.planet} enters {ingress.sign}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ingress.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Planetary Positions Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Planetary Positions</h3>
          <div className="grid grid-cols-2 gap-3">
            <PlanetItem symbol="☽" name="Moon" position={planets.moon.fullDegree} />
            <PlanetItem symbol="☉" name="Sun" position={planets.sun.fullDegree} />
            <PlanetItem symbol="☿" name={`Mercury ${mercuryRetro ? '℞' : ''}`} position={planets.mercury.fullDegree} />
            <PlanetItem symbol="♀" name="Venus" position={planets.venus.fullDegree} />
            <PlanetItem symbol="♂" name="Mars" position={planets.mars.fullDegree} />
            <PlanetItem symbol="♃" name="Jupiter" position={planets.jupiter.fullDegree} />
            <PlanetItem symbol="♄" name="Saturn" position={planets.saturn.fullDegree} />
            <PlanetItem symbol="♅" name="Uranus" position={planets.uranus.fullDegree} />
            <PlanetItem symbol="♆" name="Neptune" position={planets.neptune.fullDegree} />
            <PlanetItem symbol="♇" name="Pluto" position={planets.pluto.fullDegree} />
          </div>
        </div>

        {/* Moon Phase Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Moon Phase</h3>
          <p className="text-sm text-foreground">
            {moonPhase.phaseIcon} {moonPhase.phaseName} ({(moonPhase.illumination * 100).toFixed(0)}% illuminated)
          </p>
        </div>

        {/* Daily Aspects Section */}
        {aspects && aspects.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
              Daily Aspects ({aspects.length})
            </h3>
            <div className="grid gap-2">
              {aspects.map((asp, i) => (
                <div key={i} className="rounded-sm bg-secondary p-3">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <span>{getPlanetSymbol(asp.planet1)}</span>
                    <span className="text-primary">{asp.symbol}</span>
                    <span>{getPlanetSymbol(asp.planet2)}</span>
                    <span className="text-sm capitalize">{asp.type}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">(orb: {asp.orb}°)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Void of Course Moon Section */}
        {voc && voc.isVOC && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Void of Course Moon</h3>
            {voc.start && voc.end && (
              <p className="text-sm text-foreground">
                {voc.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {voc.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Avoid starting new projects during this time.
            </p>
          </div>
        )}

        {/* Personal Transits Section */}
        {personalTransits.hasTransits && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Personal Transits to Your Chart</h3>
            <ul className="space-y-2">
              {personalTransits.transits.map((transit, i) => (
                <li key={i} className="rounded-sm bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{transit.icon}</span>
                    <span className="font-medium text-foreground">{transit.type}</span>
                    {transit.orb && (
                      <span className="text-[11px] text-muted-foreground">(orb: {transit.orb}°)</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{transit.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Daily Guidance Section */}
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Daily Guidance</h3>
          <p className="text-sm leading-relaxed text-foreground">
            {getDailyGuidance(moonPhase, mercuryRetro, planets.moon.signName, exactLunarPhase?.sign)}
          </p>
        </div>
      </div>
    </div>
  );
};

const PlanetItem = ({ symbol, name, position }: { symbol: string; name: string; position: string }) => (
  <div className="flex justify-between items-center rounded-sm bg-secondary px-3 py-2">
    <div className="flex items-center gap-2">
      <span className="text-lg">{symbol}</span>
      <span className="text-sm text-muted-foreground">{name}</span>
    </div>
    <span className="text-sm font-medium text-foreground">{position}</span>
  </div>
);

interface ColorExplanationSectionProps {
  colorExplanation: ColorExplanation;
  aspects: DayData['aspects'];
}

const ColorExplanationSection = ({ colorExplanation, aspects }: ColorExplanationSectionProps) => (
  <div className="mb-6 pb-6 border-b border-border bg-amber-50 dark:bg-amber-950/20 p-5 rounded-sm">
    <h3 className="text-[11px] uppercase tracking-widest text-primary mb-4 font-semibold">
      🎨 Why These Colors?
    </h3>
    
    <div className="space-y-4">
      {/* Primary Color */}
      <div className="flex gap-4 items-start">
        <div 
          className="w-14 h-14 rounded-sm border-2 border-primary/30 flex-shrink-0" 
          style={{ backgroundColor: colorExplanation.primary.color }}
        />
        <div className="flex-1">
          <div className="font-medium text-foreground mb-1">
            {colorExplanation.primary.planet}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            {colorExplanation.primary.meaning}
          </div>
          {colorExplanation.primary.position && (
            <div className="text-[11px] text-primary font-medium mb-1">
              Position: {colorExplanation.primary.position}
            </div>
          )}
          <div className="text-sm text-foreground">
            {colorExplanation.primary.reason}
          </div>
          {colorExplanation.primary.aspects && colorExplanation.primary.aspects.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              Aspects: {colorExplanation.primary.aspects.map((a, i) => (
                <span key={i}>
                  {getPlanetSymbol(a.planet1)} {a.symbol} {getPlanetSymbol(a.planet2)}
                  {i < (colorExplanation.primary.aspects?.length ?? 0) - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Color */}
      {colorExplanation.secondary && (
        <>
          <div className="text-center text-muted-foreground text-xs">+</div>
          <div className="flex gap-4 items-start">
            <div 
              className="w-14 h-14 rounded-sm border-2 border-primary/30 flex-shrink-0" 
              style={{ backgroundColor: colorExplanation.secondary.color }}
            />
            <div className="flex-1">
              <div className="font-medium text-foreground mb-1">
                {colorExplanation.secondary.planet}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {colorExplanation.secondary.meaning}
              </div>
              {colorExplanation.secondary.position && (
                <div className="text-[11px] text-primary font-medium mb-1">
                  Position: {colorExplanation.secondary.position}
                </div>
              )}
              <div className="text-sm text-foreground">
                {colorExplanation.secondary.reason}
              </div>
              {colorExplanation.secondary.aspects && colorExplanation.secondary.aspects.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  Aspects: {colorExplanation.secondary.aspects.map((a, i) => (
                    <span key={i}>
                      {getPlanetSymbol(a.planet1)} {a.symbol} {getPlanetSymbol(a.planet2)}
                      {i < (colorExplanation.secondary?.aspects?.length ?? 0) - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);
