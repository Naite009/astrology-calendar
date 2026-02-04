import { memo, useMemo, useState } from "react";
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
  type DayData,
  type PlanetaryPositions
} from "@/lib/astrology";
import { cn } from "@/lib/utils";
import { UserData } from "@/hooks/useUserData";
import { NatalChart } from "@/hooks/useNatalChart";
import { calculateTransitAspects, getTopTransitAspects, getTransitPlanetSymbol, getHouseLabel, type TransitAspect } from "@/lib/transitAspects";
import { ChevronDown, ChevronRight, Mic } from "lucide-react";
import { isVenusStarPointDay } from "@/lib/venusStarPoint";
import { getVOCMoonDetails, formatVOCTime } from "@/lib/voidOfCourseMoon";
import { getCurrentPlanetaryHour, getDayRuler } from "@/lib/planetaryHours";
import { VoiceMemo, getCategoryColor } from "@/hooks/useVoiceMemos";

// Outer planets that are most significant for transits
const OUTER_PLANETS = ['Saturn', 'Jupiter', 'Neptune', 'Pluto', 'Uranus'];
// Personal points that matter most when aspected
const PERSONAL_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'IC', 'MC', 'Descendant'];

// Simple in-memory cache to avoid re-running astronomy-engine work for the same timestamps.
// Keyed by full ISO string so it works for both day cells and exact lunation timestamps.
const PLANET_CACHE = new Map<string, PlanetaryPositions>();
const getCachedPlanetaryPositions = (date: Date): PlanetaryPositions => {
  const key = date.toISOString();
  const cached = PLANET_CACHE.get(key);
  if (cached) return cached;
  const computed = getPlanetaryPositions(date);
  PLANET_CACHE.set(key, computed);
  return computed;
};

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
  voiceMemos?: VoiceMemo[];
  onVoiceMemoClick?: (date: Date, e: React.MouseEvent) => void;
}

export const CalendarDay = memo(({ date, day, isToday, userData, onDayClick, activeChart, voiceMemos = [], onVoiceMemoClick }: CalendarDayProps) => {
  const planets = useMemo(() => getCachedPlanetaryPositions(date), [date]);
  const moonPhase = useMemo(() => getMoonPhase(date), [date]);
  const mercuryRetro = useMemo(() => isMercuryRetrograde(date), [date]);
  const aspects = useMemo(() => calculateDailyAspects(planets), [planets]);
  const dayColors = useMemo(() => getDayColors(aspects, moonPhase), [aspects, moonPhase]);
  const collectiveDayType = useMemo(() => getDayType(aspects, moonPhase), [aspects, moonPhase]);
  const energy = useMemo(() => getEnergyRating(moonPhase, mercuryRetro), [moonPhase, mercuryRetro]);

  const personalTransits = useMemo(() => getPersonalTransits(planets, userData), [planets, userData]);
  const majorIngresses = useMemo(() => checkMajorIngresses(planets), [planets]);
  const detectedIngresses = useMemo(() => detectPlanetaryIngresses(date, planets), [date, planets]);
  const allIngresses = useMemo(() => [...majorIngresses, ...detectedIngresses], [majorIngresses, detectedIngresses]);

  const voc = useMemo(() => getVoidOfCourseMoon(moonPhase), [moonPhase]);
  const vocDetails = useMemo(() => getVOCMoonDetails(date), [date]);

  const exactLunarPhase = useMemo(() => getExactLunarPhase(date), [date]);
  const venusStarPoint = useMemo(() => isVenusStarPointDay(date), [date]);
  const dayRuler = useMemo(() => getDayRuler(date), [date]);

  // Calculate transit-to-natal aspects if chart is selected
  const transitAspects = useMemo(() => {
    if (!activeChart) return [];
    return calculateTransitAspects(date, planets, activeChart);
  }, [activeChart, date, planets]);

  // If today contains an exact New/Full Moon moment, compute transits at the exact event time
  // so the daily label + key hits reflect the actual lunation activation.
  const transitAspectsForDisplay = useMemo(() => {
    if (!activeChart || !exactLunarPhase) return transitAspects;
    if (exactLunarPhase.type !== 'New Moon' && exactLunarPhase.type !== 'Full Moon') return transitAspects;

    const eventPlanets = getCachedPlanetaryPositions(exactLunarPhase.time);
    return calculateTransitAspects(exactLunarPhase.time, eventPlanets, activeChart);
  }, [activeChart, exactLunarPhase, transitAspects]);

  // Categorize transits - only show ≤2° orb on calendar, ≤5° in Day Detail
  const sortedTransits = useMemo(
    () => getTopTransitAspects(transitAspectsForDisplay, transitAspectsForDisplay.length),
    [transitAspectsForDisplay]
  );
  const { primary, northNode, asteroids, other } = useMemo(
    () => categorizeTransits(sortedTransits, 2),
    [sortedTransits]
  );
  
  // State for collapsible sections
  const [showNorthNode, setShowNorthNode] = useState(false);
  const [showAsteroids, setShowAsteroids] = useState(false);
  const [showOther, setShowOther] = useState(false);
  
  // Get personal day type based on transits to YOUR chart
  const personalDayType = useMemo(() => {
    if (!activeChart) return null;
    return getPersonalDayType(transitAspectsForDisplay);
  }, [activeChart, transitAspectsForDisplay]);

  const dayData: DayData = useMemo(
    () => ({
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
    }),
    [
      date,
      planets,
      moonPhase,
      mercuryRetro,
      personalTransits,
      allIngresses,
      energy,
      aspects,
      voc,
      dayColors,
      exactLunarPhase,
    ]
  );

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
                  "text-[10px] font-medium mt-0.5 flex items-center gap-1",
                  personalDayType.tightestAspectType === 'flowing' && "text-emerald-600",
                  personalDayType.tightestAspectType === 'challenging' && "text-amber-600",
                  personalDayType.tightestAspectType === 'conjunction' && "text-foreground/80"
                )}
                title={`${personalDayType.description}${personalDayType.reason ? ` — ${personalDayType.reason}` : ''}\nLuck score: ${personalDayType.luckyScore}/10`}
              >
                {/* Show indicator based on tightest aspect type, not overall score */}
                {personalDayType.tightestAspectType === 'flowing' && <span className="font-bold">✦</span>}
                {personalDayType.tightestAspectType === 'challenging' && <span className="font-bold">△</span>}
                {personalDayType.tightestAspectType === 'conjunction' && <span className="font-bold">☌</span>}
                <span>{personalDayType.emoji}</span>
                <span>{personalDayType.label}</span>
              </span>
              <span className="text-[8px] bg-foreground/10 text-foreground/70 px-1 py-0.5 rounded-sm flex items-center gap-1" title={collectiveDayType.description}>
                sky: {collectiveDayType.emoji} {collectiveDayType.label}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-foreground/80 mt-0.5 flex items-center gap-1" title={collectiveDayType.description}>
              <span>{collectiveDayType.emoji}</span>
              <span>{collectiveDayType.label}</span>
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {/* Voice Memo Indicator & Add Button */}
          <div className="flex items-center gap-1">
            {voiceMemos.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVoiceMemoClick?.(date, e);
                }}
                className="inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 transition-all hover:scale-110"
                style={{ backgroundColor: `${getCategoryColor(voiceMemos[0].category)}20` }}
                title={`${voiceMemos.length} voice memo${voiceMemos.length > 1 ? 's' : ''}`}
              >
                <Mic
                  className="h-3 w-3"
                  style={{ color: getCategoryColor(voiceMemos[0].category) }}
                />
                {voiceMemos.length > 1 && (
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: getCategoryColor(voiceMemos[0].category) }}
                  >
                    {voiceMemos.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVoiceMemoClick?.(date, e);
              }}
              className="invisible group-hover:visible transition-all duration-200 rounded-full bg-primary hover:bg-primary/80 hover:scale-110 p-1.5 shadow-lg ring-2 ring-white/50"
              title="Add voice memo"
            >
              <Mic className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
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
        <div className="flex items-center gap-1.5">
          <span className="text-base">♃</span>
          <span>{planets.jupiter.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">♄</span>
          <span>{planets.saturn.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">♅</span>
          <span>{planets.uranus.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">♆</span>
          <span>{planets.neptune.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">♇</span>
          <span>{planets.pluto.fullDegree}</span>
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
          ⚠️ V/C {formatVOCTime(vocDetails.displayStart)}-{formatVOCTime(vocDetails.displayEnd)}
          {vocDetails.moonEntersSign && (
            <span className="ml-1 font-medium">→ {vocDetails.moonEntersSign}</span>
          )}
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
});

CalendarDay.displayName = "CalendarDay";
