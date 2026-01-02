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

interface CalendarDayProps {
  date: Date;
  day: number;
  isToday: boolean;
  userData: UserData | null;
  onDayClick: (dayData: DayData) => void;
}

export const CalendarDay = ({ date, day, isToday, userData, onDayClick }: CalendarDayProps) => {
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
      <div className="flex flex-col gap-0.5 text-[11px] text-foreground/70 leading-tight">
        <div className="flex items-center gap-1">
          <span>☽</span>
          <span>{planets.moon.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>☉</span>
          <span>{planets.sun.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>☿</span>
          <span>{planets.mercury.fullDegree}</span>
          {mercuryRetro && <span className="text-amber-600">℞</span>}
        </div>
        <div className="flex items-center gap-1">
          <span>♀</span>
          <span>{planets.venus.fullDegree}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>♂</span>
          <span>{planets.mars.fullDegree}</span>
        </div>
      </div>

      {/* Exact Lunar Phase Time */}
      {exactLunarPhase && (
        <div className="text-[10px] text-primary font-semibold mt-2 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-sm">
          {exactLunarPhase.isSupermoon && <span className="text-amber-600">✦ SUPERMOON</span>}
          {exactLunarPhase.name && (
            <div className="font-medium">{exactLunarPhase.name}</div>
          )}
          <div>{exactLunarPhase.emoji} {exactLunarPhase.type}</div>
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
      {aspects.length > 0 && (
        <div className="mt-auto pt-2 text-[10px] text-primary">
          {aspects.slice(0, 2).map((asp, i) => (
            <div key={i}>
              {getPlanetSymbol(asp.planet1)} {asp.symbol} {getPlanetSymbol(asp.planet2)}
            </div>
          ))}
          {aspects.length > 2 && <div className="text-muted-foreground">+{aspects.length - 2} more</div>}
        </div>
      )}

      {/* VOC indicator */}
      {voc.isVOC && (
        <div className="text-[10px] text-amber-600 mt-1">V/C</div>
      )}

      {/* Ingress indicator */}
      {allIngresses.length > 0 && (
        <div className="text-[10px] text-primary font-medium mt-1">
          {allIngresses.slice(0, 1).map((ing, i) => (
            <div key={i}>{ing.icon} → {ing.sign}</div>
          ))}
        </div>
      )}
    </div>
  );
};
