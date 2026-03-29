import { useState, useRef, useMemo } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { TransitListModal } from './TransitListModal';
import { ChartSelector } from './ChartSelector';
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
  getPersonalDayType,
  getDayType,
  type PersonalDayType,
} from '@/lib/astrology';
import { cn } from '@/lib/utils';
import { UserData } from '@/hooks/useUserData';
import { NatalChart } from '@/hooks/useNatalChart';
import { CosmicWeatherBanner } from './CosmicWeatherBanner';
import { calculateTransitAspects, getTransitPlanetSymbol, TransitAspect, hasHouseData, getHouseLabel, HOUSE_MEANINGS, getTopTransitAspects } from '@/lib/transitAspects';
import { getDetailedInterpretation, DetailedInterpretation } from '@/lib/detailedInterpretations';
import { ComprehensiveTransitAnalysis } from './ComprehensiveTransitAnalysis';
import { VenusStarPointTracker } from './VenusStarPointTracker';
import { getVOCMoonDetails, formatVOCDuration, formatVOCRange } from '@/lib/voidOfCourseMoon';
import { calculatePlanetaryHours, getDayRuler, formatPlanetaryHourTime, PlanetaryHour } from '@/lib/planetaryHours';
import { calculateSolarArcChart, findSolarArcAspects, getExactSolarArcAspects, getUpcomingSolarArcAspects, getSolarArcPlanetSymbol, formatSolarArcAge } from '@/lib/solarArcDirections';
import { calculateSecondaryProgressions, getProgressedMoonInfo, findProgressedAspects, getProgressedPlanetSymbol, formatSignChangeDate } from '@/lib/secondaryProgressions';
import { getMercuryRetrogrades, getRetrogradeStatus, formatRetrogradeDate, formatRetrogradeDateWithTime, getAllRetrogradePeriods, getRetrogradeDisplay, getRetrogradeChartActivation, MARS_RETROGRADE_GUIDANCE, MERCURY_RETROGRADE_GUIDANCE } from '@/lib/retrogradePatterns';
import { DATES_TO_AVOID_2026, BEST_DAYS_2026 } from '@/lib/electional2026Database';
import { findNextMoonSignChange } from '@/lib/voidOfCourseMoon';

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
  // If today contains an exact New/Full Moon moment, that story comes first.
  // (The balsamic phase is still true, but the exact lunation is the headline.)
  if (isExactNewMoon) {
    return `New Moon in ${phaseSign} - Plant seeds of intention. Set powerful goals aligned with ${signData.focus}. ${signData.action} with fresh vision. Channel this initiating energy wisely. Avoid: ${signData.avoid}.`;
  }
  if (isExactFullMoon) {
    return `Full Moon in ${phaseSign} - Maximum illumination! Celebrate what you have manifested around ${signData.focus}. Release what no longer serves. Emotions peak. ${signData.action} with full awareness. Harvest your efforts.`;
  }
  if (moonPhase.isBalsamic) {
    return `Balsamic Moon in ${moonSign} - The final surrender before rebirth. This is sacred rest time. Release attachments. Meditate and dream. Trust the void. ${signData.focus} dissolves into the cosmic flow. Avoid starting anything new.`;
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
  userNatalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
  selectedChartId?: string;
  onChartSelect?: (chartId: string) => void;
}

// Somatic felt-sense descriptions for how a transit physically/emotionally lands
const PLANET_FELT_SENSE: Record<string, { body: string; emotion: string; urge: string }> = {
  Sun: { body: "a warmth in your chest, like standing in sunlight", emotion: "a quiet confidence or need to be seen", urge: "to step forward and claim something as yours" },
  Moon: { body: "a flutter in your stomach, tender and raw", emotion: "waves of feeling that rise without warning", urge: "to retreat somewhere safe and soft" },
  Mercury: { body: "a buzzing in your head, thoughts racing", emotion: "restlessness, like your mind won't quiet down", urge: "to talk it out, write it down, or figure something out" },
  Venus: { body: "a softening in your body, craving comfort", emotion: "longing for beauty, closeness, or pleasure", urge: "to reach for someone, buy something lovely, or indulge" },
  Mars: { body: "heat rising, tension in your jaw or fists", emotion: "impatience, desire, or a flash of anger", urge: "to act now, push through, or compete" },
  Jupiter: { body: "an expansive feeling, like you can breathe deeper", emotion: "optimism and faith that things will work out", urge: "to say yes to everything and overcommit" },
  Saturn: { body: "heaviness in your shoulders, a tightness", emotion: "pressure to get it right, fear of falling short", urge: "to buckle down, set a boundary, or face hard truth" },
  Uranus: { body: "electric jolts, restless legs, can't sit still", emotion: "sudden clarity or rebellion against routine", urge: "to break free, change something drastically, shock yourself" },
  Neptune: { body: "brain fog, fatigue, or a dreamy floatiness", emotion: "longing for something you can't name", urge: "to escape into fantasy, music, sleep, or spirituality" },
  Pluto: { body: "a deep gut clench, intensity you can't ignore", emotion: "obsessive focus or a sense that something must change", urge: "to dig deeper, confront what's hidden, transform or purge" },
  Chiron: { body: "a dull ache in an old wound spot", emotion: "vulnerability and the memory of past hurt", urge: "to heal, help others, or finally face what you've avoided" },
  Ascendant: { body: "heightened self-awareness, noticing how you carry yourself", emotion: "feeling exposed or newly visible", urge: "to adjust your presentation or reclaim your identity" },
  MC: { body: "a pull toward your public role, career tension", emotion: "ambition mixed with 'am I on the right path?'", urge: "to make a move in your career or reputation" },
  IC: { body: "a tug toward home, roots, inner privacy", emotion: "nostalgia or need for emotional foundation", urge: "to nest, process family patterns, or go inward" },
  Descendant: { body: "awareness of others, a magnetic pull toward someone", emotion: "relationship hunger or projection onto a partner", urge: "to merge, compromise, or confront a dynamic" },
};

const ASPECT_FEEL: Record<string, string> = {
  conjunction: "This hits you all at once — the two energies fuse and you can't separate them. It's intense and singular.",
  opposition: "You feel pulled in two directions, like two parts of yourself are arguing. The tension demands you find a middle ground.",
  square: "This creates friction you can't ignore — like an itch you must scratch. It's uncomfortable but forces growth.",
  trine: "This flows so naturally you might not even notice it's happening. Things click into place with an easy, supportive rhythm.",
  sextile: "A gentle nudge, an open door. You feel a spark of opportunity but you have to choose to walk through it.",
  quincunx: "An awkward, off-kilter feeling — like wearing shoes on the wrong feet. Something needs adjusting but it's hard to name what.",
  "semi-sextile": "A low background hum, subtle but persistent. Something is slightly off and quietly asking for your attention.",
};

function getTransitFeltSense(transitPlanet: string, natalPlanet: string, aspectType: string): string {
  const transit = PLANET_FELT_SENSE[transitPlanet];
  const natal = PLANET_FELT_SENSE[natalPlanet];
  const aspectFeel = ASPECT_FEEL[aspectType.toLowerCase()] || ASPECT_FEEL['conjunction'];
  
  if (transit && natal) {
    return `In your body: ${transit.body}. Emotionally: ${natal.emotion}. ${aspectFeel}`;
  }
  if (transit) {
    return `In your body: ${transit.body}. The urge: ${transit.urge}. ${aspectFeel}`;
  }
  if (natal) {
    return `Emotionally: ${natal.emotion}. The urge: ${natal.urge}. ${aspectFeel}`;
  }
  return aspectFeel;
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
        {/* Felt-sense: how you physically/emotionally feel this transit */}
        <div className="mt-2 px-3 py-2 rounded-sm bg-accent/50 border border-accent text-sm text-muted-foreground italic leading-relaxed">
          <span className="not-italic">💫 </span>
          {getTransitFeltSense(aspect.transitPlanet, aspect.natalPlanet, aspect.aspect)}
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

export const DayDetail = ({ dayData, onClose, activeChart, userNatalChart, savedCharts = [], selectedChartId = 'general', onChartSelect }: DayDetailProps) => {
  const { date, planets, moonPhase, mercuryRetro, personalTransits, majorIngresses, aspects, voc, exactLunarPhase } = dayData;
  const colorExplanation = getColorExplanation(aspects || [], moonPhase);
  
  // State for transit list modal
  const [isTransitListOpen, setIsTransitListOpen] = useState(false);
  const transitRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Divine Feminine features
  const fixedStarHits = getFixedStarConjunctions(planets);
  const stelliums = detectStelliums(planets);
  const rareAspects = detectRareAspects(planets);
  const nodeAspects = detectNodeAspects(planets);

  // Calculate upcoming events for the next 7 days for AI context
  const getUpcomingEvents = () => {
    const events: { date: string; type: string; description: string; daysAway: number }[] = [];
    const today = new Date(date);
    
    for (let i = 1; i <= 10; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dateKey = futureDate.toISOString().split('T')[0];
      
      // Check RED/YELLOW dates (eclipses, major aspects) — only valid for 2026
      if (futureDate.getFullYear() === 2026) {
        const avoidData = DATES_TO_AVOID_2026.find(d => d.date === dateKey);
        if (avoidData && (avoidData.warning === 'RED' || avoidData.warning === 'PURPLE')) {
          events.push({
            date: futureDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            type: avoidData.reason.includes('Eclipse') ? 'Eclipse' : 'Major Transit',
            description: avoidData.reason,
            daysAway: i
          });
        }

        // Check best days (rare conjunctions, etc.)
        const bestData = BEST_DAYS_2026.find(d => d.date === dateKey);
        if (bestData && bestData.rating === 'PURPLE') {
          events.push({
            date: futureDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            type: 'Auspicious',
            description: bestData.reason,
            daysAway: i
          });
        }
      }
    }
    
    return events.slice(0, 5); // Max 5 upcoming events
  };
  
  const upcomingEvents = getUpcomingEvents();

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
  
  // Handle clicking a transit from the modal - scroll to it
  const handleTransitClick = (index: number) => {
    const ref = transitRefs.current[index];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      ref.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        ref.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  };

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

        <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl mb-2">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>

        {/* Chart Selector - switch charts without closing */}
        {onChartSelect && (userNatalChart || savedCharts.length > 0) && (
          <div className="mb-6">
            <ChartSelector
              userNatalChart={userNatalChart || null}
              savedCharts={savedCharts}
              selectedChartId={selectedChartId}
              onSelect={onChartSelect}
              includeGeneral={true}
              label="Viewing as:"
            />
          </div>
        )}

        {/* DAY OVERVIEW - Color blocks + Day Type at TOP */}
        <DayOverviewSection 
          dayData={dayData}
          colorExplanation={colorExplanation}
          activeChart={activeChart}
          transitAspects={transitAspects}
        />

        {/* Personal Transit Aspects - Comprehensive Professional Analysis */}
        {activeChart && transitAspects.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 p-4 rounded-sm bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
              <h3 className="text-[11px] uppercase tracking-widest text-primary font-semibold">
                ✨ Your Personal Transits — {activeChart.name}
              </h3>
              <button
                onClick={() => setIsTransitListOpen(true)}
                className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-sm hover:bg-primary/30 transition-colors cursor-pointer font-medium"
                title="Click to see all transits sorted by impact"
              >
                {transitAspects.length} aspect{transitAspects.length !== 1 ? 's' : ''} within 5° →
              </button>
            </div>
            <div className="space-y-6">
              {/* Show ALL transits within 5° in sorted order (matching calendar) */}
              {transitAspects.map((asp, i) => (
                <div 
                  key={i} 
                  ref={(el) => { transitRefs.current[i] = el; }}
                  className="transition-all duration-300"
                >
                  <ComprehensiveTransitAnalysis 
                    aspect={asp} 
                    natalChart={activeChart}
                    currentDate={date}
                  />
                </div>
              ))}
            </div>
            
            {/* Transit List Modal */}
            <TransitListModal
              isOpen={isTransitListOpen}
              onClose={() => setIsTransitListOpen(false)}
              transits={transitAspects}
              chartName={activeChart.name}
              onTransitClick={handleTransitClick}
            />
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
          upcomingEvents={upcomingEvents}
          voiceStyle={(() => { try { return localStorage.getItem('cosmic-voice-style') || 'tara'; } catch { return 'tara'; } })()}
          userTimezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          userTzAbbr={new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'ET'}
          mercuryRetrogradeInfo={(() => {
            try {
              const periods = getMercuryRetrogrades(date);
              const status = getRetrogradeStatus(date, periods);
              if (!status.retrogradeInfo) return null;
              const ri = status.retrogradeInfo;
              // Use exact times (with user's local timezone) for station dates
              const rxEndStr = formatRetrogradeDateWithTime(ri.end);
              const postEndStr = formatRetrogradeDate(ri.postEnd);
              const preStartStr = formatRetrogradeDate(ri.preStart);
              const rxStartStr = formatRetrogradeDateWithTime(ri.start);
              const isPiscesRx = ri.sign.includes('Pisces');
              const dignityNote = isPiscesRx ? ' Mercury is in BOTH detriment AND fall in Pisces — double difficulty.' : '';
              const cazimiStr = ri.cazimi ? formatRetrogradeDateWithTime(ri.cazimi) : undefined;
              const stationData = {
                sign: ri.sign,
                stationRetrograde: rxStartStr,
                stationDirect: rxEndStr,
                postShadowClear: postEndStr,
                ...(cazimiStr && { cazimi: cazimiStr }),
              };
              if (status.isShadow && status.shadowType === 'pre') {
                return { phase: 'pre-shadow', description: `Mercury entered pre-retrograde shadow on ${preStartStr}. Stations retrograde ${rxStartStr}. Stations direct ${rxEndStr}. Post-shadow clears ${postEndStr}.${dignityNote}`, ...stationData };
              }
              if (status.isRetrograde) {
                const midpoint = new Date((ri.start.getTime() + ri.end.getTime()) / 2);
                const isFirstHalf = date < midpoint;
                return { phase: isFirstHalf ? 'retrograde-first-half' : 'retrograde-second-half', description: `Mercury is RETROGRADE in ${ri.sign}. ${isFirstHalf ? 'First half - things resurface.' : 'Second half - clarity begins.'} Stations direct ${rxEndStr}. Post-shadow clears ${postEndStr}.${dignityNote}`, ...stationData };
              }
              if (status.isShadow && status.shadowType === 'post') {
                return { phase: 'post-shadow', description: `Mercury stationed direct ${rxEndStr} and is retracing post-retrograde shadow. Clarity returns. Shadow clears ${postEndStr}.`, ...stationData };
              }
              return null;
            } catch { return null; }
          })()}
          allRetrogrades={(() => {
            try {
              const allPeriods = getAllRetrogradePeriods(date);
              const statuses: Record<string, { isRetrograde: boolean; sign?: string; stationDirect?: string }> = {};
              for (const [planet, periods] of Object.entries(allPeriods)) {
                const status = getRetrogradeStatus(date, periods);
                if (status.isRetrograde && status.retrogradeInfo) {
                  statuses[planet] = { isRetrograde: true, sign: status.retrogradeInfo.sign, stationDirect: formatRetrogradeDateWithTime(status.retrogradeInfo.end) };
                }
              }
              return Object.keys(statuses).length > 0 ? statuses : undefined;
            } catch { return undefined; }
          })()}
          moonSignChange={(() => {
            try {
              if (voc.isVOC && voc.end && (voc as any).moonEntersSign) {
                const dayEnd = new Date(date); dayEnd.setHours(23,59,59,999);
                if (voc.end <= dayEnd) {
                  const tzAbbr = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'ET';
                  return { fromSign: (voc as any).fromSign || planets.moon.signName, toSign: (voc as any).moonEntersSign, time: voc.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' ' + tzAbbr };
                }
              }
              const nextChange = findNextMoonSignChange(date);
              const dayEnd2 = new Date(date); dayEnd2.setHours(23,59,59,999);
              if (nextChange.time <= dayEnd2) {
                const tzAbbr = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'ET';
                const currentMoonSign = planets.moon.signName;
                return { fromSign: currentMoonSign, toSign: nextChange.newSign, time: nextChange.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' ' + tzAbbr };
              }
              return null;
            } catch { return null; }
          })()}
          imminentSignChanges={(() => {
            try {
              const signOrder = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
              const checks = [
                { name: 'Mercury', pos: planets.mercury },
                { name: 'Venus', pos: planets.venus },
                { name: 'Mars', pos: planets.mars },
                { name: 'Jupiter', pos: planets.jupiter },
                { name: 'Saturn', pos: planets.saturn },
              ];
              const result: Array<{ planet: string; currentSign: string; degree: number; nextSign: string }> = [];
              for (const c of checks) {
                const rawDeg = c.pos.rawDegree ?? c.pos.degree;
                if (rawDeg >= 28) {
                  const idx = signOrder.indexOf(c.pos.signName);
                  if (idx >= 0) {
                    result.push({ planet: c.name, currentSign: c.pos.signName, degree: rawDeg, nextSign: signOrder[(idx + 1) % 12] });
                  }
                }
              }
              return result.length > 0 ? result : undefined;
            } catch { return undefined; }
          })()}
          eclipseContext={(() => {
            try {
              const eclipses = DATES_TO_AVOID_2026.filter(d => d.reason.includes('Eclipse'));
              const now = date.getTime();
              const nearby = eclipses.filter(e => {
                const eDate = new Date(e.date + 'T12:00:00').getTime();
                const daysDiff = (now - eDate) / (1000 * 60 * 60 * 24);
                return daysDiff >= -30 && daysDiff <= 30;
              });
              if (nearby.length === 0) return undefined;
              const lines = nearby.map(e => {
                const eDate = new Date(e.date + 'T12:00:00');
                const daysDiff = Math.round((now - eDate.getTime()) / (1000 * 60 * 60 * 24));
                const when = daysDiff > 0 ? `${daysDiff} days ago` : daysDiff < 0 ? `in ${Math.abs(daysDiff)} days` : 'TODAY';
                return `- ${e.reason} on ${eDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (${when}). Eclipse energy lingers for weeks — themes of sudden revelations, endings, and powerful new beginnings. ${e.why}`;
              });
              return `We are in ECLIPSE SEASON. Eclipses are the most powerful lunations of the year — they activate fate, bring sudden changes, and accelerate karmic timelines.\n${lines.join('\n')}\nEclipse effects ripple out for 6 months. Even if the eclipse has passed, its themes are still unfolding. Mention this context.`;
            } catch { return undefined; }
          })()}
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

// Day Overview Section - Shows color blocks, day type, and luck at the TOP

interface DayOverviewSectionProps {
  dayData: DayData;
  colorExplanation: ColorExplanation;
  activeChart?: NatalChart | null;
  transitAspects: TransitAspect[];
}

const DayOverviewSection = ({ dayData, colorExplanation, activeChart, transitAspects }: DayOverviewSectionProps) => {
  const { aspects, moonPhase, exactLunarPhase } = dayData;

  // Personal "lunation spotlight": if today contains an exact New/Full Moon moment,
  // compute transits AT THE EXACT EVENT TIME (not the day's generic timestamp)
  // so the degree hits show up accurately.
  const lunationSpotlight = (() => {
    if (!activeChart || !exactLunarPhase) return null;
    if (exactLunarPhase.type !== 'New Moon' && exactLunarPhase.type !== 'Full Moon') return null;

    const eventPlanets = getPlanetaryPositions(exactLunarPhase.time);
    const eventAspects = calculateTransitAspects(exactLunarPhase.time, eventPlanets, activeChart)
      .filter(a => (a.transitPlanet === 'Sun' || a.transitPlanet === 'Moon'))
      // keep it tight — this is meant to catch the "exact hit" moments
      .filter(a => parseFloat(String(a.orb)) <= 1.5);

    // Prefer hits to Sun/Moon/Angles
    const natalPriority: Record<string, number> = {
      Sun: 100,
      Moon: 95,
      Ascendant: 90,
      MC: 85,
      IC: 80,
      Descendant: 80,
      Mercury: 60,
      Venus: 60,
      Mars: 60,
    };

    const sorted = [...eventAspects].sort((a, b) => {
      const pA = natalPriority[a.natalPlanet] ?? 0;
      const pB = natalPriority[b.natalPlanet] ?? 0;
      if (pB !== pA) return pB - pA;
      return parseFloat(String(a.orb)) - parseFloat(String(b.orb));
    });

    const top = sorted.slice(0, 3);
    if (top.length === 0) return null;

    return {
      headline: `${exactLunarPhase.emoji} ${exactLunarPhase.type} at ${exactLunarPhase.position}`,
      when: exactLunarPhase.time.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
      }) + ' ET',
      lines: top.map(a => {
        const orb = parseFloat(String(a.orb));
        const orbText = orb < 0.05 ? 'exact' : `orb ${a.orb}°`;
        return `${getTransitPlanetSymbol(a.transitPlanet)} ${a.symbol} ${getTransitPlanetSymbol(a.natalPlanet)} — ${a.transitPlanet} ${a.aspect}s your natal ${a.natalPlanet} (${orbText})`;
      }),
    };
  })();

  // Prefer exact lunation timing for the headline day label.
  // Otherwise the label can be hijacked by a random (even wide) daily snapshot aspect.
  const transitAspectsForDayType = (() => {
    if (!activeChart || !exactLunarPhase) return transitAspects;
    if (exactLunarPhase.type !== 'New Moon' && exactLunarPhase.type !== 'Full Moon') return transitAspects;

    const eventPlanets = getPlanetaryPositions(exactLunarPhase.time);
    return calculateTransitAspects(exactLunarPhase.time, eventPlanets, activeChart);
  })();

  // Get personal day type if chart active, otherwise collective
  const personalDayType: PersonalDayType | null = activeChart 
    ? getPersonalDayType(transitAspectsForDayType)
    : null;
  const collectiveDayType = getDayType(aspects, moonPhase);

  return (
    <div className="mb-6 p-5 rounded-sm border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      {/* Lunation spotlight comes FIRST so it can't be missed */}
      {lunationSpotlight && (
        <div className="mb-4 rounded-sm border border-border bg-background/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Spotlight</div>
              <div className="mt-1 font-serif text-lg font-medium text-foreground">
                {lunationSpotlight.headline}
              </div>
              <div className="text-xs text-muted-foreground">{lunationSpotlight.when}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-sm text-foreground">
            {lunationSpotlight.lines.map((l, i) => (
              <div key={i} className="leading-relaxed">{l}</div>
            ))}
          </div>
        </div>
      )}

      {/* Color Blocks Visual - matches calendar */}
      <div className="flex items-start gap-5 mb-4">
        {/* Color block stack - mimics calendar day appearance */}
        <div className="flex flex-col w-20 h-20 rounded-sm overflow-hidden border border-border shadow-sm flex-shrink-0">
          <div 
            className="flex-1" 
            style={{ backgroundColor: colorExplanation.primary.color }}
          />
          {colorExplanation.secondary && (
            <div 
              className="flex-1" 
              style={{ backgroundColor: colorExplanation.secondary.color }}
            />
          )}
        </div>
        
        {/* Color explanations */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPlanetSymbol(colorExplanation.primary.planet.toLowerCase())}</span>
            <span className="font-medium text-foreground">{colorExplanation.primary.planet}</span>
            <span className="text-xs text-muted-foreground">— {colorExplanation.primary.meaning}</span>
          </div>
          {colorExplanation.primary.aspects && colorExplanation.primary.aspects.length > 0 && (
            <div className="text-sm text-foreground/80 pl-7">
              {colorExplanation.primary.aspects.map((a, i) => (
                <span key={i}>
                  {getPlanetSymbol(a.planet1)} {a.symbol} {getPlanetSymbol(a.planet2)}
                  {i < (colorExplanation.primary.aspects?.length ?? 0) - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          
          {colorExplanation.secondary && (
            <>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-lg">{getPlanetSymbol(colorExplanation.secondary.planet.toLowerCase())}</span>
                <span className="font-medium text-foreground">{colorExplanation.secondary.planet}</span>
                <span className="text-xs text-muted-foreground">— {colorExplanation.secondary.meaning}</span>
              </div>
              {colorExplanation.secondary.aspects && colorExplanation.secondary.aspects.length > 0 && (
                <div className="text-sm text-foreground/80 pl-7">
                  {colorExplanation.secondary.aspects.map((a, i) => (
                    <span key={i}>
                      {getPlanetSymbol(a.planet1)} {a.symbol} {getPlanetSymbol(a.planet2)}
                      {i < (colorExplanation.secondary?.aspects?.length ?? 0) - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Day Type with Emoji */}
      <div className="border-t border-border/50 pt-4 mt-4">
        {personalDayType ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{personalDayType.emoji}</span>
              <div>
                <div className="font-medium text-lg text-foreground flex items-center gap-2">
                  {personalDayType.label}
                  {/* Show indicator based on tightest aspect type */}
                  {personalDayType.tightestAspectType === 'flowing' && <span className="text-emerald-600 font-bold" title="Flowing aspect">✦</span>}
                  {personalDayType.tightestAspectType === 'challenging' && <span className="text-amber-600 font-bold" title="Challenging aspect">△</span>}
                  {personalDayType.tightestAspectType === 'conjunction' && <span className="text-purple-600 font-bold" title="Conjunction">☌</span>}
                </div>
                <div className="text-sm text-muted-foreground">{personalDayType.description}</div>
              </div>
            </div>
            
            {/* Aspect Indicator with Reason - based on tightest aspect */}
            <div className={cn(
              "text-sm px-3 py-2 rounded-sm",
              personalDayType.tightestAspectType === 'flowing' && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
              personalDayType.tightestAspectType === 'challenging' && "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
              personalDayType.tightestAspectType === 'conjunction' && "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
            )}>
              {personalDayType.tightestAspectType === 'flowing' && (
                <span className="font-medium">✦ Flowing aspect — energy flows easily</span>
              )}
              {personalDayType.tightestAspectType === 'challenging' && (
                <span className="font-medium">△ Challenging aspect — patience & growth</span>
              )}
              {personalDayType.tightestAspectType === 'conjunction' && (
                <span className="font-medium">☌ Conjunction — intense focus</span>
              )}
              {personalDayType.reason && (
                <span className="ml-2">— {personalDayType.reason}</span>
              )}
            </div>
            
            {/* Overall luck score */}
            <div className={cn(
              "text-xs px-2 py-1 rounded-sm inline-flex items-center gap-2",
              personalDayType.isLucky && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
              personalDayType.isChallenging && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
              !personalDayType.isLucky && !personalDayType.isChallenging && "bg-muted text-muted-foreground"
            )}>
              <span>Overall energy: {personalDayType.luckyScore}/10</span>
              {personalDayType.isLucky && <span className="font-medium">— Lucky day!</span>}
              {personalDayType.isChallenging && <span className="font-medium">— Tense day</span>}
            </div>
            
            {/* Collective energy (sky) */}
            <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
              <span>sky:</span>
              <span>{collectiveDayType.emoji}</span>
              <span>{collectiveDayType.label}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{collectiveDayType.emoji}</span>
            <div>
              <div className="font-medium text-lg text-foreground">{collectiveDayType.label}</div>
              <div className="text-sm text-muted-foreground">{collectiveDayType.description}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
          {/* Descriptive sentence */}
          <p className="text-sm text-foreground">
            The Moon is in <span className="font-medium">{vocDetails.currentMoonSign || 'its current sign'}</span> and is void of course{' '}
            <span className="font-medium">
              {vocDetails.start && vocDetails.end ? formatVOCRange(vocDetails.start, vocDetails.end, date) : ''}
            </span>
            {vocDetails.durationMinutes && (
              <span className="text-amber-600 dark:text-amber-400"> ({formatVOCDuration(vocDetails.durationMinutes)})</span>
            )}
            {vocDetails.moonEntersSign && (
              <> before it moves into <span className="font-medium">{vocDetails.moonEntersSign}</span></>
            )}
          </p>
          
          {/* Last Aspect Info */}
          {vocDetails.lastAspect && (
            <div className="text-sm">
              <span className="text-muted-foreground">Last aspect:</span>
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
