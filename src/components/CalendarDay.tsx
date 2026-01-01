import { getPlanetaryPositions, getMoonPhase, isMercuryRetrograde, getPersonalTransits, checkMajorIngresses, getEnergyRating, type EnergyLevel, type DayData } from "@/lib/astrology";
import { cn } from "@/lib/utils";
import { UserData } from "@/hooks/useUserData";

interface CalendarDayProps {
  date: Date;
  day: number;
  isToday: boolean;
  userData: UserData | null;
  onDayClick: (dayData: DayData) => void;
}

const energyStyles: Record<EnergyLevel, string> = {
  rest: "bg-energy-rest",
  high: "bg-energy-high",
  caution: "bg-energy-caution",
  moderate: "bg-background",
};

export const CalendarDay = ({ date, day, isToday, userData, onDayClick }: CalendarDayProps) => {
  const planets = getPlanetaryPositions(date);
  const moonPhase = getMoonPhase(date);
  const mercuryRetro = isMercuryRetrograde(date);
  const personalTransits = getPersonalTransits(planets, userData);
  const majorIngresses = checkMajorIngresses(planets);
  const energy = getEnergyRating(moonPhase, mercuryRetro);

  const dayData: DayData = {
    date,
    planets,
    moonPhase,
    mercuryRetro,
    personalTransits,
    majorIngresses,
    energy,
  };

  return (
    <div
      onClick={() => onDayClick(dayData)}
      className={cn(
        "group relative flex min-h-24 cursor-pointer flex-col p-3 transition-all duration-200 md:min-h-36 md:p-4",
        "hover:opacity-90 hover:shadow-[inset_0_0_0_1px_hsl(var(--border))]",
        energyStyles[energy.level],
        isToday && "shadow-[inset_0_0_0_2px_hsl(var(--primary))]"
      )}
    >
      {/* Day number */}
      <span className="font-serif text-xl font-light text-foreground md:text-2xl">
        {day}
      </span>

      {/* Moon info */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className="text-lg opacity-70 md:text-xl"
          title={moonPhase.phaseName}
        >
          {moonPhase.phaseIcon}
        </span>
        <span
          className="text-sm text-muted-foreground md:text-base"
          title={`${planets.moon.signName} ${planets.moon.degree}°`}
        >
          {planets.moon.sign}
        </span>
      </div>

      {/* Day indicators */}
      <div className="mt-auto flex flex-wrap gap-1.5 text-xs">
        {moonPhase.isBalsamic && (
          <span className="opacity-80" title="Balsamic Moon">🌙</span>
        )}
        {mercuryRetro && (
          <span className="opacity-80" title="Mercury Retrograde">☿℞</span>
        )}
        {!mercuryRetro && !moonPhase.isBalsamic && (
          <span className="opacity-80" title="Mercury Direct">☿</span>
        )}
        {personalTransits.hasTransits && (
          <span className="opacity-80" title="Personal Transit">✦</span>
        )}
        {majorIngresses.length > 0 && (
          <span className="opacity-80" title="Major Ingress">⚡</span>
        )}
      </div>
    </div>
  );
};
