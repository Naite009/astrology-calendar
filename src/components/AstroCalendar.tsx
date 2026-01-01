import { useState } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { CalendarDay } from "./CalendarDay";
import { UserForm } from "./UserForm";
import { useUserData } from "@/hooks/useUserData";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const AstroCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [showUserForm, setShowUserForm] = useState(false);
  const { userData, saveUserData } = useUserData();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between border-b border-border pb-6 md:mb-12">
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-5xl">
            {monthName}
          </h1>
          <div className="flex items-center gap-4">
            {userData && (
              <span className="hidden text-[11px] uppercase tracking-widest text-muted-foreground md:block">
                {userData.name} | {userData.timezone.split('/')[1]?.replace('_', ' ')}
              </span>
            )}
            <nav className="flex gap-3">
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className={`flex h-10 w-10 items-center justify-center border transition-all duration-200 ${
                  showUserForm
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary hover:bg-secondary"
                }`}
                aria-label="User Settings"
              >
                <User size={20} />
              </button>
              <button
                onClick={() => navigateMonth(-1)}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        </header>

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
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <CalendarDay
                key={day}
                date={date}
                day={day}
                isToday={isToday}
              />
            );
          })}
        </div>

        {/* Footer Legend */}
        <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground md:mt-12">
          <span className="opacity-70">🌑 New</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">🌕 Full</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">☿ Favorable</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">℞ Retrograde</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">🌙 Balsamic</span>
        </footer>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          initialData={userData}
          onSave={saveUserData}
          onClose={() => setShowUserForm(false)}
        />
      )}
    </div>
  );
};
