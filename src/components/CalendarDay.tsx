import { getMoonData, getMercuryStatus, getEnergyRating, type EnergyLevel } from "@/lib/astrology";
import { cn } from "@/lib/utils";

interface CalendarDayProps {
  date: Date;
  day: number;
  isToday: boolean;
}

const energyStyles: Record<EnergyLevel, string> = {
  rest: "bg-energy-rest",
  high: "bg-energy-high",
  caution: "bg-energy-caution",
  moderate: "bg-background",
};

export const CalendarDay = ({ date, day, isToday }: CalendarDayProps) => {
  const moonData = getMoonData(date);
  const mercuryStatus = getMercuryStatus(date);
  const energy = getEnergyRating(moonData, mercuryStatus);

  return (
    <div
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
          title={moonData.sign.name}
        >
          {moonData.sign.symbol}
        </span>
      </div>

      {/* Day indicators */}
      <div className="mt-auto flex flex-wrap gap-1.5">
        {moonData.isBalsamic && (
          <span className="text-xs opacity-80" title="Balsamic Moon - Rest">
            🌙
          </span>
        )}
        {mercuryStatus.isFavorable && !moonData.isBalsamic && (
          <span className="text-xs opacity-80" title="Mercury Favorable - Good for mental work">
            ☿
          </span>
        )}
        {mercuryStatus.isRetrograde && (
          <span className="text-xs opacity-80" title="Mercury Retrograde - Caution">
            ℞
          </span>
        )}
      </div>
    </div>
  );
};
