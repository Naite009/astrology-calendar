import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  DayData, 
  getPlanetSymbol, 
  MoonPhase, 
  getColorExplanation, 
  ColorExplanation, 
  determineApplying, 
  getIngressInterpretation,
  getFixedStarConjunctions,
  detectStelliums,
  detectRareAspects,
  detectNodeAspects,
  CHIRON_MEANINGS,
  LILITH_MEANINGS,
  getPlanetaryPositions,
} from '@/lib/astrology';
import { UserData } from '@/hooks/useUserData';
import { NatalChart } from '@/hooks/useNatalChart';
import { CosmicWeatherBanner } from './CosmicWeatherBanner';
import { calculateTransitAspects, getTransitPlanetSymbol, TransitAspect, hasHouseData, getHouseLabel, HOUSE_MEANINGS, getTopTransitAspects } from '@/lib/transitAspects';
import { getDetailedInterpretation, DetailedInterpretation } from '@/lib/detailedInterpretations';
import { ComprehensiveTransitAnalysis } from './ComprehensiveTransitAnalysis';
import { VenusStarPointTracker } from './VenusStarPointTracker';
import { getVOCMoonDetails, formatVOCDuration } from '@/lib/voidOfCourseMoon';
import { calculatePlanetaryHours, getDayRuler, formatPlanetaryHourTime, PlanetaryHour } from '@/lib/planetaryHours';
import { calculateSolarArcChart, findSolarArcAspects, getExactSolarArcAspects, getUpcomingSolarArcAspects, getSolarArcPlanetSymbol, formatSolarArcAge } from '@/lib/solarArcDirections';
import { calculateSecondaryProgressions, getProgressedMoonInfo, findProgressedAspects, getProgressedPlanetSymbol, formatSignChangeDate } from '@/lib/secondaryProgressions';
import { getRetrogradeDisplay, getRetrogradeChartActivation, MARS_RETROGRADE_GUIDANCE, MERCURY_RETROGRADE_GUIDANCE, formatRetrogradeDate } from '@/lib/retrogradePatterns';

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

const getDailyGuidance = (
  moonPhase: MoonPhase,
  mercuryRetro: boolean,
  moonSign: string,
  exactPhaseSign?: string,
  exactPhaseType?: 'New Moon' | 'Full Moon' | 'First Quarter' | 'Last Quarter'
): string => {
  const isExactNewMoon = exactPhaseType === 'New Moon';
  const isExactFullMoon = exactPhaseType === 'Full Moon';

  // If we're near a Full/New Moon, the broad phase bucket can still say "Full Moon" / "New Moon"
  // on adjacent days. For guidance, only treat it as New/Full on the exact-timing day.
  const phaseForGuidance = (() => {
    if (moonPhase.phaseName === 'New Moon' && !isExactNewMoon) return moonPhase.phase < 180 ? 'Waxing Crescent' : 'Waning Crescent';
    if (moonPhase.phaseName === 'Full Moon' && !isExactFullMoon) return moonPhase.phase < 180 ? 'Waxing Gibbous' : 'Waning Gibbous';
    return moonPhase.phaseName;
  })();

  const phaseSign = (isExactNewMoon || isExactFullMoon) && exactPhaseSign ? exactPhaseSign : moonSign;
  const signData = SIGN_ENERGIES[phaseSign] || SIGN_ENERGIES.Aries;

  if (mercuryRetro) {
    return `Mercury Retrograde in ${moonSign} - Review and revise communications. Back up data. Reconnect with old contacts. Avoid new contracts. Practice patience with technology and travel.`;
  }
  if (moonPhase.isBalsamic) {
    return `Balsamic Moon in ${moonSign} - The final surrender before rebirth. This is sacred rest time. Release attachments. Meditate and dream. Trust the void. ${signData.focus} dissolves into the cosmic flow. Avoid starting anything new.`;
  }
  if (isExactNewMoon) {
    return `New Moon in ${phaseSign} - Plant seeds of intention. Set powerful goals aligned with ${signData.focus}. ${signData.action} with fresh vision. Channel this initiating energy wisely. Avoid: ${signData.avoid}.`;
  }
  if (isExactFullMoon) {
    return `Full Moon in ${phaseSign} - Maximum illumination! Celebrate what you have manifested around ${signData.focus}. Release what no longer serves. Emotions peak. ${signData.action} with full awareness. Harvest your efforts.`;
  }
  if (phaseForGuidance.includes('Waxing')) {
    return `${phaseForGuidance} in ${moonSign} - Energy is building. ${signData.action} with awareness of ${signData.focus}. Avoid ${signData.avoid}.`;
  }
  if (phaseForGuidance.includes('Waning')) {
    return `${phaseForGuidance} in ${moonSign} - Time for release and integration. Reflect on ${signData.focus}. ${signData.action} mindfully.`;
  }
  return `Moon in ${moonSign} - ${signData.action} with awareness of ${signData.focus}. Avoid ${signData.avoid}.`;
};

// Get planet symbol for ingress display
const getIngressSymbol = (planet: string): string => {
  const symbols: Record<string, string> = {
    Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄',
    Uranus: '♅', Neptune: '♆', Pluto: '♇', Sun: '☉', Moon: '☽',
  };
  return symbols[planet] || planet;
};

interface DayDetailProps {
  dayData: DayData;
  userData: UserData | null;
  onClose: () => void;
  activeChart?: NatalChart | null;
}

// Detailed Transit Card Component with expandable sections
const DetailedTransitCard = ({ aspect }: { aspect: TransitAspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use the pre-calculated detailed interpretation from the aspect
  const detailed = aspect.detailedInterpretation;
  
  return (
    <div className={`rounded-sm bg-background border ${aspect.isExact ? 'border-primary shadow-md' : 'border-border'}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center gap-3"
      >
        <div 
          className="flex items-center gap-1.5 text-lg font-medium"
          style={{ color: aspect.color }}
        >
          <span>{getTransitPlanetSymbol(aspect.transitPlanet)}</span>
          <span className="text-xl">{aspect.symbol}</span>
          <span>{getTransitPlanetSymbol(aspect.natalPlanet)}</span>
        </div>
        <div className="text-sm font-medium text-foreground capitalize">
          {aspect.aspect}
        </div>
        {aspect.isExact && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-bold">
            EXACT!
          </span>
        )}
        {aspect.transitHouse && (
          <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-sm">
            {aspect.transitHouse}H
          </span>
        )}
        {aspect.natalHouse && (
          <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-sm">
            →{aspect.natalHouse}H
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-2">
          Orb: {aspect.orb}°
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      
      {/* Quick interpretation - Always visible */}
      <div className="px-4 pb-3 -mt-2">
        <div className="text-sm text-foreground leading-relaxed">
          {aspect.interpretation}
        </div>
      </div>
      
      {/* Expanded detailed content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* What's Happening */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              What's Happening
            </h4>
            <div className="space-y-2 text-sm">
              <div className="text-foreground">{detailed.transitEssence}</div>
              <div className="text-foreground">{detailed.natalEssence}</div>
              <div className="text-primary font-medium mt-2">{detailed.aspectEnergy}</div>
              <div className="text-muted-foreground italic">{detailed.aspectDescription}</div>
            </div>
          </div>
          
          {/* The Signs */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              The Signs
            </h4>
            <div className="space-y-1 text-sm">
              <div className="text-foreground">{detailed.transitSignInfo}</div>
              <div className="text-foreground">{detailed.natalSignInfo}</div>
              {detailed.signCombination && (
                <div className="text-muted-foreground italic mt-2">{detailed.signCombination}</div>
              )}
            </div>
          </div>
          
          {/* The Houses */}
          {(detailed.transitHouseFull || detailed.natalHouseFull) && (
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                The Houses — Where This Happens
              </h4>
              <div className="space-y-2 text-sm">
                {detailed.transitHouseFull && (
                  <div>
                    <span className="font-medium text-foreground">{detailed.transitHouseShort}:</span>
                    <span className="text-muted-foreground ml-1">{detailed.transitHouseFull}</span>
                  </div>
                )}
                {detailed.natalHouseFull && (
                  <div>
                    <span className="font-medium text-foreground">{detailed.natalHouseShort}:</span>
                    <span className="text-muted-foreground ml-1">{detailed.natalHouseFull}</span>
                  </div>
                )}
                {detailed.houseConnection && (
                  <div className="text-primary/80 mt-2 p-2 bg-primary/5 rounded-sm">{detailed.houseConnection}</div>
                )}
              </div>
            </div>
          )}
          
          {/* Practical Guidance */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Practical Guidance
            </h4>
            
            {/* Gifts/Challenges/Power */}
            {detailed.guidance.gifts && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-green-600 mb-1">TODAY'S GIFTS:</div>
                <ul className="space-y-0.5">
                  {detailed.guidance.gifts.map((g, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-green-600">•</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {detailed.guidance.challenges && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-amber-600 mb-1">TODAY'S CHALLENGE:</div>
                <ul className="space-y-0.5">
                  {detailed.guidance.challenges.map((c, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-amber-600">•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {detailed.guidance.power && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-purple-600 mb-1">TODAY'S POWER:</div>
                <ul className="space-y-0.5">
                  {detailed.guidance.power.map((p, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-purple-600">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* What To Do */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-foreground mb-1">WHAT TO DO:</div>
              <ul className="space-y-0.5">
                {detailed.guidance.todo.map((t, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary">✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Avoid */}
            <div>
              <div className="text-xs font-semibold text-foreground mb-1">AVOID:</div>
              <ul className="space-y-0.5">
                {detailed.guidance.avoid.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive">✗</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Journal Prompt */}
          <div className="bg-primary/5 p-3 rounded-sm border-l-2 border-primary">
            <h4 className="text-[10px] uppercase tracking-widest text-primary mb-1">
              Journal Prompt
            </h4>
            <p className="text-sm text-foreground italic">{detailed.journalPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const DayDetail = ({ dayData, onClose, activeChart }: DayDetailProps) => {
  const { date, planets, moonPhase, mercuryRetro, personalTransits, majorIngresses, aspects, voc, exactLunarPhase } = dayData;
  const colorExplanation = getColorExplanation(aspects || [], moonPhase);
  
  // Divine Feminine features
  const fixedStarHits = getFixedStarConjunctions(planets);
  const stelliums = detectStelliums(planets);
  const rareAspects = detectRareAspects(planets);
  const nodeAspects = detectNodeAspects(planets);

  // Calculate personal transit aspects if chart is active
  // Use same categorization as calendar for consistent ordering
  const OUTER_PLANETS = ['Saturn', 'Jupiter', 'Neptune', 'Pluto', 'Uranus'];
  const PERSONAL_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'IC', 'MC', 'Descendant'];
  
  const rawTransitAspects: TransitAspect[] = activeChart
    ? calculateTransitAspects(date, planets, activeChart)
    : [];
  
  // Sort and filter to ≤5° orb for Day Detail
  const allTransits = getTopTransitAspects(rawTransitAspects, rawTransitAspects.length)
    .filter(asp => parseFloat(String(asp.orb)) <= 5);
  
  // Categorize same as calendar: Key Transits (outer→personal) first, then others
  const keyTransits: TransitAspect[] = [];
  const otherTransits: TransitAspect[] = [];
  
  for (const t of allTransits) {
    const isOuterTransit = OUTER_PLANETS.includes(t.transitPlanet);
    const isToPersonal = PERSONAL_POINTS.includes(t.natalPlanet);
    
    if (isOuterTransit && isToPersonal) {
      keyTransits.push(t);
    } else {
      otherTransits.push(t);
    }
  }
  
  // Final order: Key transits first, then all others (same as calendar)
  const transitAspects = [...keyTransits, ...otherTransits];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-6 top-6 z-10 p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
        >
          <X size={24} />
        </button>

        <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl mb-6">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>

        {/* Personal Transit Aspects - Comprehensive Professional Analysis */}
        {activeChart && transitAspects.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 p-4 rounded-sm bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
              <h3 className="text-[11px] uppercase tracking-widest text-primary font-semibold">
                ✨ Your Personal Transits — {activeChart.name}
              </h3>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-sm">
                {transitAspects.length} aspect{transitAspects.length !== 1 ? 's' : ''} within 5°
              </span>
            </div>
            <div className="space-y-6">
              {/* Show ALL transits within 5° in sorted order (matching calendar) */}
              {transitAspects.map((asp, i) => (
                <ComprehensiveTransitAnalysis 
                  key={i} 
                  aspect={asp} 
                  natalChart={activeChart}
                  currentDate={date}
                />
              ))}
            </div>
          </div>
        )}

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

        {/* Venus Star Point Tracker - After lunar phase, before personal transits context */}
        <div className="mb-6">
          <VenusStarPointTracker date={date} activeChart={activeChart} />
        </div>

        {/* Why These Colors Section */}
        <ColorExplanationSection colorExplanation={colorExplanation} aspects={aspects} />

        {/* Major Ingresses Section - Highlighted with Interpretations */}
        {majorIngresses.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border bg-amber-50 dark:bg-amber-950/20 p-4 rounded-sm border-2 border-amber-200 dark:border-amber-700">
            <h3 className="text-[11px] uppercase tracking-widest text-primary mb-4 font-semibold">⭐ Planetary Ingresses Today</h3>
            <div className="space-y-4">
              {majorIngresses.map((ingress, i) => (
                <div key={i} className={majorIngresses.length > 1 && i < majorIngresses.length - 1 ? "pb-4 border-b border-border/50" : ""}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getIngressSymbol(ingress.planet)}</span>
                    <span className="font-semibold text-foreground text-lg">{ingress.planet} enters {ingress.sign}</span>
                  </div>
                  
                  {/* Entry/Exit Times */}
                  <div className="bg-background/60 dark:bg-background/30 p-3 rounded-sm mb-3 space-y-2">
                    {ingress.entryTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">→ Enters {ingress.sign}:</span>
                        <span className="text-foreground font-semibold">{ingress.entryTime}</span>
                      </div>
                    )}
                    {ingress.exitTime && ingress.nextSign && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-600 dark:text-red-400 font-medium">← Exits to {ingress.nextSign}:</span>
                        <span className="text-foreground font-semibold">{ingress.exitTime}</span>
                      </div>
                    )}
                    {ingress.durationDays && (
                      <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                        Duration in {ingress.sign}: ~{ingress.durationDays} days
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed">
                    {getIngressInterpretation(ingress.planet, ingress.sign)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cosmic Weather Section - Gradient Banner */}
        <CosmicWeatherBanner 
          date={date}
          moonPhase={moonPhase}
          moonSign={planets.moon.signName}
          exactLunarPhase={exactLunarPhase}
          stelliums={stelliums} 
          rareAspects={rareAspects} 
          nodeAspects={nodeAspects}
          mercuryRetro={mercuryRetro}
          aspects={aspects || []}
          planetPositions={[
            { name: 'Moon', sign: planets.moon.signName, degree: planets.moon.degree },
            { name: 'Sun', sign: planets.sun.signName, degree: planets.sun.degree },
            { name: 'Mercury', sign: planets.mercury.signName, degree: planets.mercury.degree },
            { name: 'Venus', sign: planets.venus.signName, degree: planets.venus.degree },
            { name: 'Mars', sign: planets.mars.signName, degree: planets.mars.degree },
            { name: 'Jupiter', sign: planets.jupiter.signName, degree: planets.jupiter.degree },
            { name: 'Saturn', sign: planets.saturn.signName, degree: planets.saturn.degree },
            { name: 'Uranus', sign: planets.uranus.signName, degree: planets.uranus.degree },
            { name: 'Neptune', sign: planets.neptune.signName, degree: planets.neptune.degree },
            { name: 'Pluto', sign: planets.pluto.signName, degree: planets.pluto.degree },
          ]}
        />

        {/* Fixed Star Conjunctions */}
        {fixedStarHits.length > 0 && (
          <div className="mb-6 p-4 rounded-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">⭐ Fixed Star Conjunctions</h3>
            {fixedStarHits.map((hit, i) => (
              <div key={i} className="mb-3 pb-3 border-b border-blue-200 dark:border-blue-700 last:border-0 last:mb-0 last:pb-0">
                <div className="font-medium text-foreground">
                  {getPlanetSymbol(hit.planet.toLowerCase())} {hit.planet} ☌ {hit.star}
                  <span className="text-xs text-muted-foreground ml-2">(orb {hit.orb}°)</span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">{hit.meaning}</div>
              </div>
            ))}
          </div>
        )}

        {/* Divine Feminine Bodies Section */}
        {(planets.northNode || planets.chiron || planets.lilith) && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Divine Feminine Bodies</h3>
            <div className="space-y-4">
              {/* Lunar Nodes */}
              {planets.northNode && planets.southNode && (
                <div className="bg-secondary p-4 rounded-sm">
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">☊☋ Lunar Nodes — Destiny Path</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">☊ North Node: {planets.northNode.fullDegree}</div>
                      <div className="text-xs text-muted-foreground mt-1">Your destiny, where you're headed, life purpose</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">☋ South Node: {planets.southNode.fullDegree}</div>
                      <div className="text-xs text-muted-foreground mt-1">Past life skills, comfort zone, what to release</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chiron */}
              {planets.chiron && (
                <div className="bg-secondary p-4 rounded-sm">
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">⚷ Chiron — The Wounded Healer</div>
                  <div className="text-sm font-medium text-foreground mb-2">{planets.chiron.fullDegree}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {CHIRON_MEANINGS[planets.chiron.signName] || 'Healing journey through this sign\'s themes.'}
                  </div>
                </div>
              )}

              {/* Lilith */}
              {planets.lilith && (
                <div className="bg-secondary p-4 rounded-sm">
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">⚸ Black Moon Lilith — Wild Feminine</div>
                  <div className="text-sm font-medium text-foreground mb-2">{planets.lilith.fullDegree}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {LILITH_MEANINGS[planets.lilith.signName] || 'Reclaiming power through this sign\'s expression.'}
                  </div>
                </div>
              )}
            </div>
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

        {/* Daily Aspects Section with Applying/Separating */}
        {aspects && aspects.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
              Daily Aspects ({aspects.length})
            </h3>
            <div className="grid gap-3">
              {aspects.map((asp, i) => {
                const planet1Data = planets[asp.planet1 as keyof typeof planets];
                const planet2Data = planets[asp.planet2 as keyof typeof planets];
                const isApplying = determineApplying(asp.planet1, asp.planet2, planet1Data, planet2Data, asp.type);
                
                return (
                  <div key={i} className="rounded-sm bg-secondary p-3 border border-border">
                    <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                      <span className="text-lg">{getPlanetSymbol(asp.planet1)}</span>
                      <span className="text-primary text-lg">{asp.symbol}</span>
                      <span className="text-lg">{getPlanetSymbol(asp.planet2)}</span>
                      <span className="text-sm capitalize">{asp.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mb-2">
                      {getPlanetSymbol(asp.planet1)} {planet1Data.degree}° {planet1Data.sign} {asp.symbol} {getPlanetSymbol(asp.planet2)} {planet2Data.degree}° {planet2Data.sign}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">Orb: {asp.orb}°</span>
                      <span className="text-muted-foreground">•</span>
                      <span className={isApplying ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                        {isApplying ? "→ Applying" : "← Separating"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 italic">
                      {isApplying
                        ? `${asp.planet1.charAt(0).toUpperCase() + asp.planet1.slice(1)} moving toward exact aspect with ${asp.planet2.charAt(0).toUpperCase() + asp.planet2.slice(1)}`
                        : `${asp.planet1.charAt(0).toUpperCase() + asp.planet1.slice(1)} moving away from exact aspect with ${asp.planet2.charAt(0).toUpperCase() + asp.planet2.slice(1)}`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Void of Course Moon Section - Enhanced */}
        <VOCMoonSection date={date} voc={voc} />

        {/* Planetary Hours Section */}
        <PlanetaryHoursSection date={date} />

        {/* Solar Arc Directions Section */}
        {activeChart && <SolarArcSection date={date} natalChart={activeChart} />}

        {/* Secondary Progressions Section */}
        {activeChart && <SecondaryProgressionsSection date={date} natalChart={activeChart} />}

        {/* Retrograde Patterns Section */}
        <RetrogradePatternSection date={date} natalChart={activeChart} />

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
            {getDailyGuidance(
              moonPhase,
              mercuryRetro,
              planets.moon.signName,
              exactLunarPhase?.sign,
              exactLunarPhase?.type
            )}
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

// VOC Moon Section Component
const VOCMoonSection = ({ date, voc }: { date: Date; voc: DayData['voc'] }) => {
  const vocDetails = getVOCMoonDetails(date);
  
  if (!vocDetails.isVOC) return null;
  
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="p-4 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
        <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
          ⚠️ Void of Course Moon
        </h3>
        
        <div className="space-y-3">
          {/* Time Range */}
          <div className="flex items-center gap-2 text-foreground font-medium">
            <span className="text-lg">
              {vocDetails.start?.toLocaleTimeString('en-US', { 
                timeZone: 'America/New_York',
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
            <span className="text-muted-foreground">—</span>
            <span className="text-lg">
              {vocDetails.end?.toLocaleTimeString('en-US', { 
                timeZone: 'America/New_York',
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
            <span className="text-xs text-muted-foreground">ET</span>
            {vocDetails.durationMinutes && (
              <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                ({formatVOCDuration(vocDetails.durationMinutes)})
              </span>
            )}
          </div>
          
          {/* Last Aspect Info */}
          {vocDetails.lastAspect && (
            <div className="text-sm">
              <span className="text-muted-foreground">Moon's last aspect:</span>
              <span className="ml-2 font-medium text-foreground">
                ☽ {vocDetails.lastAspect.symbol} {vocDetails.lastAspect.planet}
              </span>
              <span className="ml-2 text-muted-foreground">
                at {vocDetails.lastAspect.time.toLocaleTimeString('en-US', {
                  timeZone: 'America/New_York',
                  hour: 'numeric',
                  minute: '2-digit',
                })} ET
              </span>
            </div>
          )}
          
          {/* Moon Enters Sign */}
          {vocDetails.moonEntersSign && (
            <div className="text-sm">
              <span className="text-muted-foreground">Moon enters:</span>
              <span className="ml-2 font-medium text-foreground">{vocDetails.moonEntersSign}</span>
            </div>
          )}
          
          {/* Guidance */}
          <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-700 text-sm">
            <div className="grid gap-2">
              <div>
                <span className="font-medium text-red-600 dark:text-red-400">✗ Avoid:</span>
                <span className="ml-2 text-foreground">Starting new projects, signing contracts, major purchases, important decisions</span>
              </div>
              <div>
                <span className="font-medium text-green-600 dark:text-green-400">✓ Best for:</span>
                <span className="ml-2 text-foreground">Finishing existing work, rest, meditation, routine tasks, tying up loose ends</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-amber-600 dark:text-amber-400 italic mt-2">
            Things started during VOC tend to "go nowhere" or not develop as planned.
          </div>
        </div>
      </div>
    </div>
  );
};

// Planetary Hours Section Component
const PlanetaryHoursSection = ({ date }: { date: Date }) => {
  const [showAllHours, setShowAllHours] = useState(false);
  const dayRuler = getDayRuler(date);
  const hours = calculatePlanetaryHours(date);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  // Find current hour if viewing today
  const currentHourIndex = isToday 
    ? hours.findIndex(h => now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime())
    : -1;
  
  const currentHour = currentHourIndex >= 0 ? hours[currentHourIndex] : null;
  const nextHour = currentHourIndex >= 0 && currentHourIndex < hours.length - 1 ? hours[currentHourIndex + 1] : null;
  
  // Get day hours (first 12) and night hours (last 12)
  const dayHours = hours.slice(0, 12);
  const nightHours = hours.slice(12, 24);
  
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="p-4 rounded-sm bg-secondary border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          📅 Planetary Hours
          <span className="text-xs font-normal text-muted-foreground">
            ({dayRuler.dayName} is ruled by {dayRuler.symbol} {dayRuler.planet})
          </span>
        </h3>
        
        {/* Current Hour (if today) */}
        {isToday && currentHour && (
          <div className="mb-4 p-3 rounded-sm bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-primary flex items-center gap-2">
                <span className="text-xl">{currentHour.symbol}</span>
                <span>RIGHT NOW: {currentHour.planet} Hour</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatPlanetaryHourTime(currentHour.start)} - {formatPlanetaryHourTime(currentHour.end)}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium text-green-600 dark:text-green-400">Best for:</span>
                <span className="ml-2 text-foreground">{currentHour.meanings.bestFor.slice(0, 3).join(', ')}</span>
              </div>
            </div>
            
            {nextHour && (
              <div className="mt-2 pt-2 border-t border-primary/20 text-xs text-muted-foreground">
                <span>Next: {nextHour.symbol} {nextHour.planet} Hour ({formatPlanetaryHourTime(nextHour.start)})</span>
              </div>
            )}
          </div>
        )}
        
        {/* Collapsed/Expanded Schedule */}
        <button
          onClick={() => setShowAllHours(!showAllHours)}
          className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors mb-2"
        >
          {showAllHours ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAllHours ? 'Hide full schedule' : 'Show full schedule'}
        </button>
        
        {showAllHours && (
          <div className="space-y-4 mt-4">
            {/* Day Hours */}
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                ☀️ Day Hours (Sunrise to Sunset)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dayHours.map((hour, i) => (
                  <div 
                    key={i}
                    className={`p-2 rounded-sm text-xs border ${
                      currentHourIndex === i 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{hour.symbol} {hour.planet}</span>
                      <span className="text-muted-foreground">#{hour.hourNumber}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatPlanetaryHourTime(hour.start)} - {formatPlanetaryHourTime(hour.end)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Night Hours */}
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                🌙 Night Hours (Sunset to Sunrise)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {nightHours.map((hour, i) => (
                  <div 
                    key={i}
                    className={`p-2 rounded-sm text-xs border ${
                      currentHourIndex === i + 12 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{hour.symbol} {hour.planet}</span>
                      <span className="text-muted-foreground">#{hour.hourNumber}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatPlanetaryHourTime(hour.start)} - {formatPlanetaryHourTime(hour.end)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Reference */}
        {!showAllHours && (
          <div className="text-xs text-muted-foreground mt-2">
            Click to see when each planetary hour occurs today for precise timing.
          </div>
        )}
      </div>
    </div>
  );
};

// Solar Arc Directions Section Component
const SolarArcSection = ({ date, natalChart }: { date: Date; natalChart: NatalChart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const solarArcChart = calculateSolarArcChart(natalChart, date);
  
  if (!solarArcChart) return null;
  
  const allAspects = findSolarArcAspects(solarArcChart, natalChart);
  const exactAspects = getExactSolarArcAspects(allAspects);
  const upcomingAspects = getUpcomingSolarArcAspects(allAspects);
  
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="p-4 rounded-sm bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
          🌟 Solar Arc Directions
          <span className="text-xs font-normal text-muted-foreground">
            (Personal Timing)
          </span>
        </h3>
        
        {/* Age and Arc Info */}
        <div className="text-sm mb-3">
          <span className="text-muted-foreground">Age: </span>
          <span className="font-medium text-foreground">
            {formatSolarArcAge(solarArcChart.ageYears, solarArcChart.ageMonths)}
          </span>
          <span className="text-muted-foreground ml-4">Solar Arc: </span>
          <span className="font-medium text-foreground">{solarArcChart.solarArc.toFixed(1)}°</span>
        </div>
        
        {/* Exact Aspects THIS YEAR */}
        {exactAspects.length > 0 && (
          <div className="mb-4 p-3 rounded-sm bg-purple-100 dark:bg-purple-800/40 border border-purple-300 dark:border-purple-600">
            <div className="text-xs uppercase tracking-widest text-purple-700 dark:text-purple-300 font-semibold mb-2">
              ⚡ EXACT THIS YEAR
            </div>
            {exactAspects.map((aspect, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                  <span>SA {getSolarArcPlanetSymbol(aspect.solarArcPlanet)}</span>
                  <span className="text-purple-600">{aspect.aspectSymbol}</span>
                  <span>Natal {getSolarArcPlanetSymbol(aspect.natalPlanet)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">orb {aspect.orb}°</span>
                </div>
                <div className="text-sm text-foreground leading-relaxed">
                  {aspect.interpretation}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {exactAspects.length === 0 && (
          <div className="text-sm text-muted-foreground mb-3">
            No exact Solar Arc aspects this year.
          </div>
        )}
        
        {/* Upcoming Aspects */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-500 transition-colors"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Hide upcoming aspects' : `Show ${upcomingAspects.length} upcoming aspects (next 3 years)`}
        </button>
        
        {isExpanded && upcomingAspects.length > 0 && (
          <div className="mt-3 space-y-2">
            {upcomingAspects.slice(0, 5).map((aspect, i) => (
              <div key={i} className="text-sm flex items-center gap-2 text-muted-foreground">
                <span>• SA {getSolarArcPlanetSymbol(aspect.solarArcPlanet)} {aspect.aspectSymbol} {getSolarArcPlanetSymbol(aspect.natalPlanet)}</span>
                <span className="text-xs">(age ~{Math.floor(aspect.exactAge)})</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-purple-600 dark:text-purple-400 italic mt-3">
          Solar Arc aspects last ~9 months and represent personal life timing.
        </div>
      </div>
    </div>
  );
};

// Secondary Progressions Section Component
const SecondaryProgressionsSection = ({ date, natalChart }: { date: Date; natalChart: NatalChart }) => {
  const progressions = calculateSecondaryProgressions(natalChart, date);
  
  if (!progressions) return null;
  
  const moonInfo = getProgressedMoonInfo(progressions, natalChart);
  const aspects = findProgressedAspects(progressions, natalChart);
  
  if (!moonInfo) return null;
  
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="p-4 rounded-sm bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
          📈 Secondary Progressions
          <span className="text-xs font-normal text-muted-foreground">
            (Emotional Maturation)
          </span>
        </h3>
        
        {/* Progressed Moon - MOST IMPORTANT */}
        <div className="mb-4 p-3 rounded-sm bg-green-100 dark:bg-green-800/40 border border-green-300 dark:border-green-600">
          <div className="text-xs uppercase tracking-widest text-green-700 dark:text-green-300 font-semibold mb-2">
            ☽ Progressed Moon (Most Important!)
          </div>
          
          <div className="text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Position: </span>
              <span className="font-medium text-foreground">
                {moonInfo.degree}° {moonInfo.sign}
                {moonInfo.house && ` (${moonInfo.house}th house)`}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Phase: </span>
              <span className="font-medium text-foreground">{moonInfo.phase}</span>
              <span className="text-muted-foreground ml-1">— {moonInfo.phaseDescription}</span>
            </div>
            
            {moonInfo.signMeaning && (
              <div className="p-2 rounded bg-background/50 mt-2">
                <div className="font-medium text-foreground text-xs mb-1">
                  Current Theme: {moonInfo.signMeaning.theme}
                </div>
                <div className="text-xs text-muted-foreground">
                  Focus on: {moonInfo.signMeaning.focus}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-green-200 dark:border-green-700">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                ⚠️ Sign Change Coming: {moonInfo.nextSign} in ~{moonInfo.monthsUntilSignChange} months
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ({formatSignChangeDate(moonInfo.signChangeDate)}) — This marks a major emotional shift!
              </div>
            </div>
          </div>
        </div>
        
        {/* Other Progressed Planets */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(progressions.planets)
            .filter(([planet]) => planet !== 'Moon')
            .slice(0, 4)
            .map(([planet, data]) => (
              <div key={planet} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{getProgressedPlanetSymbol(planet)}</span>
                <span className="ml-1">{Math.floor(data.degree)}° {data.sign}</span>
              </div>
            ))}
        </div>
        
        {/* Progressed Aspects */}
        {aspects.length > 0 && (
          <div className="text-sm">
            <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
              Active Progressed Aspects:
            </div>
            {aspects.slice(0, 3).map((aspect, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                • P.{getProgressedPlanetSymbol(aspect.progressedPlanet)} {aspect.aspectSymbol} N.{getProgressedPlanetSymbol(aspect.natalPlanet)}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-green-600 dark:text-green-400 italic mt-3">
          "A day for a year" — your internal emotional clock.
        </div>
      </div>
    </div>
  );
};

// Retrograde Patterns Section Component
const RetrogradePatternSection = ({ date, natalChart }: { date: Date; natalChart: NatalChart | null | undefined }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const retroDisplay = getRetrogradeDisplay(date);
  
  if (!retroDisplay.hasActivity) return null;
  
  const { mars, mercury } = retroDisplay;
  
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="p-4 rounded-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
        <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
          ♂☿ Retrograde Activity
        </h3>
        
        {/* Mars Retrograde */}
        {(mars.isRetrograde || mars.isShadow) && mars.retrogradeInfo && (
          <div className="mb-4 p-3 rounded-sm bg-red-100 dark:bg-red-800/40 border border-red-300 dark:border-red-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">♂</span>
              <span className="font-semibold text-foreground">
                Mars {mars.isRetrograde ? 'Retrograde' : (mars.shadowType === 'pre' ? 'Pre-Shadow' : 'Post-Shadow')}
              </span>
              <span className="text-xs text-muted-foreground">in {mars.retrogradeInfo.sign}</span>
            </div>
            
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>
                <span className="font-medium">Retrograde:</span> {formatRetrogradeDate(mars.retrogradeInfo.start)} - {formatRetrogradeDate(mars.retrogradeInfo.end)}
              </div>
              {mars.isRetrograde && mars.daysRemaining && (
                <div>
                  <span className="font-medium">{mars.daysRemaining} days remaining</span>
                  <span className="ml-2">({mars.percentComplete}% complete)</span>
                </div>
              )}
            </div>
            
            {natalChart && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                {getRetrogradeChartActivation(mars.retrogradeInfo, 'Mars', natalChart).slice(0, 2).join(' ')}
              </div>
            )}
          </div>
        )}
        
        {/* Mercury Retrograde */}
        {(mercury.isRetrograde || mercury.isShadow) && mercury.retrogradeInfo && (
          <div className="mb-3 p-3 rounded-sm bg-orange-100 dark:bg-orange-800/40 border border-orange-300 dark:border-orange-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">☿</span>
              <span className="font-semibold text-foreground">
                Mercury {mercury.isRetrograde ? 'Retrograde' : (mercury.shadowType === 'pre' ? 'Pre-Shadow' : 'Post-Shadow')}
              </span>
              <span className="text-xs text-muted-foreground">in {mercury.retrogradeInfo.sign}</span>
            </div>
            
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>
                <span className="font-medium">Retrograde:</span> {formatRetrogradeDate(mercury.retrogradeInfo.start)} - {formatRetrogradeDate(mercury.retrogradeInfo.end)}
              </div>
              {mercury.isRetrograde && mercury.daysRemaining && (
                <div>
                  <span className="font-medium">{mercury.daysRemaining} days remaining</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Guidance Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs text-red-600 hover:text-red-500 transition-colors"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Hide guidance' : 'Show retrograde guidance'}
        </button>
        
        {isExpanded && (
          <div className="mt-3 space-y-3 text-xs">
            {mars.isRetrograde && (
              <div className="p-2 rounded bg-background/50">
                <div className="font-semibold text-foreground mb-1">Mars Retrograde Tips:</div>
                <div className="text-green-600">✓ Best: {MARS_RETROGRADE_GUIDANCE.bestActivities.slice(0, 3).join(', ')}</div>
                <div className="text-red-600 mt-1">✗ Avoid: {MARS_RETROGRADE_GUIDANCE.avoid.slice(0, 3).join(', ')}</div>
              </div>
            )}
            {mercury.isRetrograde && (
              <div className="p-2 rounded bg-background/50">
                <div className="font-semibold text-foreground mb-1">Mercury Retrograde Tips:</div>
                <div className="text-green-600">✓ Best: {MERCURY_RETROGRADE_GUIDANCE.bestActivities.slice(0, 3).join(', ')}</div>
                <div className="text-red-600 mt-1">✗ Avoid: {MERCURY_RETROGRADE_GUIDANCE.avoid.slice(0, 3).join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
