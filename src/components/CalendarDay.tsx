import { useState } from "react";
import { 
  getPlanetaryPositions, 
  getMoonPhase, 
  isMercuryRetrograde, 
  getPersonalTransits, 
  checkMajorIngresses, 
  getEnergyRating, 
  calculateDailyAspects,
  getVoidOfCourseMoon,
  getDayColors,
  getDayType,
  getPersonalDayType,
  detectPlanetaryIngresses,
  getPlanetSymbol,
  getExactLunarPhase,
  type DayData 
} from "@/lib/astrology";
import { cn } from "@/lib/utils";
import { UserData } from "@/hooks/useUserData";
import { NatalChart } from "@/hooks/useNatalChart";
import { calculateTransitAspects, getTopTransitAspects, getTransitPlanetSymbol, getHouseLabel, type TransitAspect } from "@/lib/transitAspects";
import { ChevronDown, ChevronRight } from "lucide-react";
import { isVenusStarPointDay } from "@/lib/venusStarPoint";
import { getVOCMoonDetails, formatVOCTime } from "@/lib/voidOfCourseMoon";
import { getCurrentPlanetaryHour, getDayRuler } from "@/lib/planetaryHours";

// Outer planets that are most significant for transits
const OUTER_PLANETS = ['Saturn', 'Jupiter', 'Neptune', 'Pluto', 'Uranus'];
// Personal points that matter most when aspected
const PERSONAL_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'IC', 'MC', 'Descendant'];

// Filter transits into categories with orb filtering
const categorizeTransits = (transits: TransitAspect[], maxOrb: number = 5) => {
  const primary: TransitAspect[] = []; // Outer to personal
  const northNode: TransitAspect[] = [];
  const asteroids: TransitAspect[] = [];
  const other: TransitAspect[] = [];

  for (const t of transits) {
    // Skip if orb is too wide (parse orb as number)
    const orbNum = typeof t.orb === 'string' ? parseFloat(t.orb) : t.orb;
    if (orbNum > maxOrb) continue;
    
    const isOuterTransit = OUTER_PLANETS.includes(t.transitPlanet);
    const isToPersonal = PERSONAL_POINTS.includes(t.natalPlanet);
    
    // Check for North Node
    if (t.transitPlanet.includes('Node') || t.natalPlanet.includes('Node')) {
      northNode.push(t);
    }
    // Check for asteroids (Ceres, Pallas, Juno, Vesta, Chiron, etc.)
    else if (['Ceres', 'Pallas', 'Juno', 'Vesta', 'Chiron', 'Lilith'].some(a => 
      t.transitPlanet.includes(a) || t.natalPlanet.includes(a)
    )) {
      asteroids.push(t);
    }
    // Primary: outer planets to personal points
    else if (isOuterTransit && isToPersonal) {
      primary.push(t);
    }
    // Everything else
    else {
      other.push(t);
    }
  }

  return { primary, northNode, asteroids, other };
};

// Reusable transit line component - simplified monochrome design
const TransitLine = ({ asp, compact = false }: { asp: TransitAspect; compact?: boolean }) => (
  <div 
    className={cn(
      "flex items-center gap-1 text-foreground/80",
      asp.isExact && "font-semibold text-foreground",
      compact ? "text-[10px]" : "text-xs"
    )}
    title={`Transit ${asp.transitPlanet} ${asp.aspect} natal ${asp.natalPlanet} — orb ${asp.orb}°${asp.isExact ? ' — EXACT' : ''}`}
  >
    <span className="opacity-60">tr</span>
    <span>{getTransitPlanetSymbol(asp.transitPlanet)}</span>
    <span>{asp.symbol}</span>
    <span className="opacity-60">n</span>
    <span>{getTransitPlanetSymbol(asp.natalPlanet)}</span>
    {asp.natalHouse && (
      <span className="opacity-50 text-[9px]">{asp.natalHouse}H</span>
    )}
  </div>
);

interface CalendarDayProps {
  date: Date;
  day: number;
  isToday: boolean;
  userData: UserData | null;
  onDayClick: (dayData: DayData) => void;
  activeChart?: NatalChart | null;
}

export const CalendarDay = ({ date, day, isToday, userData, onDayClick, activeChart }: CalendarDayProps) => {
  const planets = getPlanetaryPositions(date);
  const moonPhase = getMoonPhase(date);
  const mercuryRetro = isMercuryRetrograde(date);
  const personalTransits = getPersonalTransits(planets, userData);
  const majorIngresses = checkMajorIngresses(planets);
  const detectedIngresses = detectPlanetaryIngresses(date, planets);
  const allIngresses = [...majorIngresses, ...detectedIngresses];
  const energy = getEnergyRating(moonPhase, mercuryRetro);
  const aspects = calculateDailyAspects(planets);
  const voc = getVoidOfCourseMoon(moonPhase);
  const vocDetails = getVOCMoonDetails(date);
  const dayColors = getDayColors(aspects, moonPhase);
  const collectiveDayType = getDayType(aspects, moonPhase);
  const exactLunarPhase = getExactLunarPhase(date);
  const venusStarPoint = isVenusStarPointDay(date);
  const dayRuler = getDayRuler(date);

  // Calculate transit-to-natal aspects if chart is selected
  const transitAspects = activeChart 
    ? calculateTransitAspects(date, planets, activeChart)
    : [];
  // Categorize transits - only show ≤2° orb on calendar, ≤5° in Day Detail
  const sortedTransits = getTopTransitAspects(transitAspects, transitAspects.length);
  const { primary, northNode, asteroids, other } = categorizeTransits(sortedTransits, 2);
  
  // State for collapsible sections
  const [showNorthNode, setShowNorthNode] = useState(false);
  const [showAsteroids, setShowAsteroids] = useState(false);
  const [showOther, setShowOther] = useState(false);
  
  // Get personal day type based on transits to YOUR chart
  const personalDayType = activeChart 
    ? getPersonalDayType(transitAspects)
    : null;

  const dayData: DayData = {
    date,
    planets,
    moonPhase,
    mercuryRetro,
    personalTransits,
    majorIngresses: allIngresses,
    energy,
    aspects,
    voc,
    dayColors,
    exactLunarPhase,
  };

  // Build background style based on day colors
  const bgStyle = dayColors.secondary
    ? { background: `linear-gradient(to bottom, ${dayColors.primary} 50%, ${dayColors.secondary} 50%)` }
    : { backgroundColor: dayColors.primary };

  return (
    <div
      onClick={() => onDayClick(dayData)}
      style={bgStyle}
      className={cn(
        "group relative flex min-h-32 cursor-pointer flex-col p-3 transition-all duration-200 md:min-h-44 md:p-4",
        "hover:opacity-90 hover:shadow-[inset_0_0_0_1px_hsl(var(--border))]",
        isToday && "shadow-[inset_0_0_0_2px_hsl(var(--primary))]"
      )}
    >
      {/* Header: Day number + Day Type + Moon phase */}
      <div className="flex items-start justify-between border-b border-foreground/10 pb-2 mb-2">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-light text-foreground md:text-2xl">
            {day}
          </span>
          {/* Show personal day type if chart selected, otherwise collective */}
          {personalDayType ? (
            <div className="flex flex-col gap-0.5">
              <span 
                className={cn(
                  "text-[10px] font-medium mt-0.5",
                  personalDayType.isLucky && "text-emerald-600",
                  personalDayType.isChallenging && "text-amber-600",
                  !personalDayType.isLucky && !personalDayType.isChallenging && "text-foreground/80"
                )}
                title={`${personalDayType.description}${personalDayType.reason ? ` — ${personalDayType.reason}` : ''}\nLuck score: ${personalDayType.luckyScore}/10`}
              >
                {personalDayType.isLucky && '🍀 '}
                {personalDayType.isChallenging && '⚠️ '}
                {personalDayType.label}
              </span>
              <span className="text-[8px] text-muted-foreground" title={collectiveDayType.description}>
                (sky: {collectiveDayType.label})
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-foreground/80 mt-0.5" title={collectiveDayType.description}>
              {collectiveDayType.label}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {venusStarPoint && (
            <span 
              className="text-sm text-pink-500" 
              title={`Venus Star Point: ${venusStarPoint.degree}° ${venusStarPoint.sign}${venusStarPoint.companions ? ' — TRIPLE CONJUNCTION!' : ''}`}
            >
              ♀⭐
            </span>
          )}
          <span className="text-lg opacity-70" title={moonPhase.phaseName}>
            {moonPhase.phaseIcon}
          </span>
        </div>
      </div>

      {/* Planet positions */}
      <div className="flex flex-col gap-0.5 text-sm text-foreground/70 leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-base">☽</span>
          <span>{planets.moon.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">☉</span>
          <span>{planets.sun.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">☿</span>
          <span>{planets.mercury.fullDegree}</span>
          {mercuryRetro && <span className="text-amber-600 text-base">℞</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">♀</span>
          <span>{planets.venus.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">♂</span>
          <span>{planets.mars.fullDegree}</span>
        </div>
      </div>

      {/* Personal Transit Aspects to YOUR natal chart (only if chart selected) */}
      {activeChart && primary.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-foreground/10 pt-2">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">
            Key Transits ({primary.length})
          </div>
          {primary.map((asp, i) => (
            <TransitLine key={i} asp={asp} />
          ))}
        </div>
      )}

      {/* North Node transits - collapsible */}
      {activeChart && northNode.length > 0 && (
        <div className="mt-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowNorthNode(!showNorthNode); }}
            className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showNorthNode ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>☊ Node ({northNode.length})</span>
          </button>
          {showNorthNode && (
            <div className="mt-0.5 ml-2 space-y-0.5">
              {northNode.map((asp, i) => (
                <TransitLine key={i} asp={asp} compact />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Asteroid transits - collapsible */}
      {activeChart && asteroids.length > 0 && (
        <div className="mt-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowAsteroids(!showAsteroids); }}
            className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAsteroids ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>⚳ Asteroids ({asteroids.length})</span>
          </button>
          {showAsteroids && (
            <div className="mt-0.5 ml-2 space-y-0.5">
              {asteroids.map((asp, i) => (
                <TransitLine key={i} asp={asp} compact />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other transits - collapsible */}
      {activeChart && other.length > 0 && (
        <div className="mt-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowOther(!showOther); }}
            className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showOther ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>More ({other.length})</span>
          </button>
          {showOther && (
            <div className="mt-0.5 ml-2 space-y-0.5">
              {other.map((asp, i) => (
                <TransitLine key={i} asp={asp} compact />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exact Lunar Phase Time */}
      {exactLunarPhase && (
        <div className="text-[10px] text-primary font-semibold mt-2 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-sm">
          {exactLunarPhase.isSupermoon && <span className="text-amber-600">✦ SUPERMOON</span>}
          {exactLunarPhase.name && (
            <div className="font-medium">{exactLunarPhase.name}</div>
          )}
          <div>{exactLunarPhase.emoji} {exactLunarPhase.type} in {exactLunarPhase.sign}</div>
          <div>
            {exactLunarPhase.time.toLocaleTimeString('en-US', {
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit',
            })}{' '}
            ET
          </div>
        </div>
      )}

      {/* Aspects */}
      {aspects.length > 0 && !activeChart && (
        <div className="mt-auto pt-2 text-xs text-primary">
          {aspects.slice(0, 2).map((asp, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-sm">{getPlanetSymbol(asp.planet1)}</span>
              <span className="text-sm">{asp.symbol}</span>
              <span className="text-sm">{getPlanetSymbol(asp.planet2)}</span>
            </div>
          ))}
          {aspects.length > 2 && <div className="text-muted-foreground">+{aspects.length - 2} more</div>}
        </div>
      )}

      {/* VOC indicator - Time Range Display */}
      {vocDetails.isVOC && vocDetails.displayStart && vocDetails.displayEnd && (
        <div 
          className="text-xs text-amber-600 mt-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-sm"
          title={`Void of Course Moon\n${vocDetails.lastAspect ? `Last aspect: ☽ ${vocDetails.lastAspect.symbol} ${vocDetails.lastAspect.planet} at ${formatVOCTime(vocDetails.lastAspect.time)}` : 'Already VOC'}\nMoon enters ${vocDetails.moonEntersSign || 'next sign'} at ${vocDetails.end ? formatVOCTime(vocDetails.end) : ''}`}
        >
          ⚠️ V/C {formatVOCTime(vocDetails.displayStart)} - {formatVOCTime(vocDetails.displayEnd)}
        </div>
      )}

      {/* Ingress indicator */}
      {allIngresses.length > 0 && (
        <div className="text-xs text-primary font-medium mt-1">
          {allIngresses.slice(0, 1).map((ing, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-sm">{ing.icon}</span>
              <span>→</span>
              <span>{ing.sign}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
