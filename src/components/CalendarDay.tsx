import { getMoonPhase } from "@/lib/moon";
import { cn } from "@/lib/utils";

interface CalendarDayProps {
  date: Date;
  day: number;
  isToday: boolean;
}

export const CalendarDay = ({ date, day, isToday }: CalendarDayProps) => {
  const moonPhase = getMoonPhase(date);

  return (
    <div
      className={cn(
        "group relative min-h-24 cursor-pointer bg-background p-3 transition-all duration-200 md:min-h-36 md:p-4",
        "hover:bg-calendar-hover hover:shadow-[inset_0_0_0_1px_hsl(var(--border))]",
        isToday && "bg-calendar-today shadow-[inset_0_0_0_2px_hsl(var(--primary))]"
      )}
    >
      <span className="font-serif text-xl font-light text-foreground md:text-2xl">
        {day}
      </span>
      <span
        className="absolute right-3 top-3 text-lg opacity-60 transition-opacity group-hover:opacity-90 md:right-4 md:top-4 md:text-xl"
        title={moonPhase.name}
      >
        {moonPhase.icon}
      </span>
    </div>
  );
};
