import { getMoonData, getMercuryStatus, getVenusTransits, getPersonalTransits, getEnergyRating, type EnergyLevel, type DayData } from "@/lib/astrology";
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
  void: "bg-energy-void",
  rest: "bg-energy-rest",
  high: "bg-energy-high",
  caution: "bg-energy-caution",
  moderate: "bg-background",
};

export const CalendarDay = ({ date, day, isToday, userData, onDayClick }: CalendarDayProps) => {
  const moonData = getMoonData(date);
  const mercuryStatus = getMercuryStatus(date);
  const venusData = getVenusTransits(date, userData);
  const personalTransits = getPersonalTransits(moonData, userData);
  const vocData = moonData.vocStart;
  const energy = getEnergyRating(moonData, mercuryStatus, vocData);

  const dayData: DayData = {
    date,
    moonData,
    mercuryStatus,
    venusData,
    personalTransits,
    vocData,
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
          title={moonData.phaseName}
        >
          {moonData.phaseIcon}
        </span>
        <span
          className="text-sm text-muted-foreground md:text-base"
          title={`${moonData.name} ${moonData.degree}°`}
        >
          {moonData.sign}
        </span>
      </div>

      {/* Day indicators */}
      <div className="mt-auto flex flex-wrap gap-1.5 text-xs">
        {moonData.isBalsamic && (
          <span className="opacity-80" title="Balsamic Moon">🌙</span>
        )}
        {vocData && (
          <span className="opacity-80 font-medium" title="Void of Course">V/C</span>
        )}
        {mercuryStatus.isFavorable && !moonData.isBalsamic && !vocData && (
          <span className="opacity-80" title="Mercury Favorable">☿</span>
        )}
        {venusData.hasVenusAspect && (
          <span className="opacity-80" title="Venus Transit">♀</span>
        )}
        {personalTransits.hasTransits && (
          <span className="opacity-80" title="Personal Transit">✦</span>
        )}
      </div>
    </div>
  );
};
