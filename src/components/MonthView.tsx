import { useMemo } from "react";
import { DayData } from "@/lib/astrology";
import { CalendarDay } from "./CalendarDay";
import { CalendarLegend } from "./CalendarLegend";
import { UserData } from "@/hooks/useUserData";
import { NatalChart } from "@/hooks/useNatalChart";
import { VoiceMemo } from "@/hooks/useVoiceMemos";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface MonthViewProps {
  currentDate: Date;
  userData: UserData | null;
  onDayClick: (dayData: DayData) => void;
  activeChart?: NatalChart | null;
  voiceMemos?: VoiceMemo[];
  onVoiceMemoClick?: (date: Date) => void;
  onOpenFullLegend?: () => void;
}

export const MonthView = ({ currentDate, userData, onDayClick, activeChart, voiceMemos = [], onVoiceMemoClick, onOpenFullLegend }: MonthViewProps) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const memosByDate = useMemo(() => {
    const map = new Map<string, VoiceMemo[]>();
    for (const memo of voiceMemos) {
      if (!map.has(memo.date)) map.set(memo.date, []);
      map.get(memo.date)!.push(memo);
    }
    return map;
  }, [voiceMemos]);

  const dayCells = useMemo(() => {
    const todayStr = new Date().toDateString();
    return Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === todayStr;
      const dateKey = date.toISOString().split("T")[0];
      const dayMemos = memosByDate.get(dateKey) || [];
      return { day, date, isToday, dayMemos };
    });
  }, [daysInMonth, month, year, memosByDate]);

  return (
    <div className="flex gap-4">
      {/* Main Calendar Grid */}
      <div className="flex-1">
        {/* Weekday Headers */}
        <div className="mb-px grid grid-cols-7 gap-px bg-calendar-line">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="bg-background px-2 py-4 text-center text-[10px] font-normal uppercase tracking-widest text-muted-foreground md:text-xs"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-calendar-line animate-fade-in">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 bg-calendar-empty md:min-h-36" />
          ))}

          {/* Actual days of the month */}
          {dayCells.map(({ day, date, isToday, dayMemos }) => (
            <CalendarDay
              key={day}
              date={date}
              day={day}
              isToday={isToday}
              userData={userData}
              onDayClick={onDayClick}
              activeChart={activeChart}
              voiceMemos={dayMemos}
              onVoiceMemoClick={(d) => onVoiceMemoClick?.(d)}
            />
          ))}
        </div>

        {/* Footer Legend */}
        <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground md:mt-12">
          <span className="opacity-70">🌑 New</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">🌕 Full</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">☿ Direct</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">☿℞ Retrograde</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">✦ Transit</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">⚡ Ingress</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">🎙️ Voice Memo</span>
          {activeChart && (
            <>
              <span className="opacity-50">·</span>
              <span className="opacity-70 text-primary">☌ Personal Transit</span>
            </>
          )}
        </footer>
      </div>

      {/* Quick Key Legend - Right Side */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <CalendarLegend onOpenFullLegend={onOpenFullLegend} />
        </div>
      </div>
    </div>
  );
};
