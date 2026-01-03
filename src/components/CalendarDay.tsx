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
  detectPlanetaryIngresses,
  getPlanetSymbol,
  getExactLunarPhase,
  type DayData 
} from "@/lib/astrology";
import { cn } from "@/lib/utils";
import { UserData } from "@/hooks/useUserData";
import { NatalChart } from "@/hooks/useNatalChart";
import { calculateTransitAspects, getTopTransitAspects, getTransitPlanetSymbol, getHouseLabel } from "@/lib/transitAspects";

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
  const dayColors = getDayColors(aspects, moonPhase);
  const exactLunarPhase = getExactLunarPhase(date);

  // Calculate transit-to-natal aspects if chart is selected
  const transitAspects = activeChart 
    ? calculateTransitAspects(date, planets, activeChart)
    : [];
  const topTransits = getTopTransitAspects(transitAspects, 3);

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
      {/* Header: Day number + Moon phase */}
      <div className="flex items-start justify-between border-b border-foreground/10 pb-2 mb-2">
        <span className="font-serif text-xl font-light text-foreground md:text-2xl">
          {day}
        </span>
        <span className="text-lg opacity-70" title={moonPhase.phaseName}>
          {moonPhase.phaseIcon}
        </span>
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

      {/* Personal Transit Aspects (if chart selected) */}
      {activeChart && topTransits.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {topTransits.map((asp, i) => (
            <div 
              key={i} 
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                asp.isExact && "font-bold"
              )}
              style={{ 
                color: asp.color,
                borderLeft: `2px solid ${asp.color}`,
                paddingLeft: '4px'
              }}
              title={`${asp.transitPlanet} ${asp.aspect} natal ${asp.natalPlanet} (${asp.orb}°)${asp.transitHouse ? ` in ${asp.transitHouse}H` : ''}${asp.isExact ? ' — EXACT' : ''}`}
            >
              <span className="text-sm">{getTransitPlanetSymbol(asp.transitPlanet)}</span>
              <span className="text-sm">{asp.symbol}</span>
              <span className="text-sm">{getTransitPlanetSymbol(asp.natalPlanet)}</span>
              {asp.transitHouse && (
                <span className="text-muted-foreground text-[10px] ml-0.5">{asp.transitHouse}H</span>
              )}
            </div>
          ))}
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

      {/* VOC indicator */}
      {voc.isVOC && (
        <div className="text-xs text-amber-600 mt-1">V/C</div>
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
