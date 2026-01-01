import { useState } from "react";
import { ChevronLeft, ChevronRight, User, Download, Calendar, Moon } from "lucide-react";
import { MonthView } from "./MonthView";
import { YearView } from "./YearView";
import { AnnualTables } from "./AnnualTables";
import { UserForm } from "./UserForm";
import { DayDetail } from "./DayDetail";
import { useUserData } from "@/hooks/useUserData";
import { DayData, generateICalExport } from "@/lib/astrology";

type ViewMode = "month" | "year" | "annual-tables";

export const AstroCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const { userData, saveUserData } = useUserData();

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "year" || viewMode === "annual-tables") {
        newDate.setFullYear(prev.getFullYear() + direction);
      } else {
        newDate.setMonth(prev.getMonth() + direction);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.getDate();
  };

  const exportToCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const ical = generateICalExport(currentDate.getFullYear(), currentDate.getMonth(), daysInMonth);

    const blob = new Blob([ical], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astro-calendar-${currentDate.toLocaleString("default", { month: "long", year: "numeric" }).replace(" ", "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTitle = () => {
    if (viewMode === "annual-tables") {
      return `${currentDate.getFullYear()} Annual Tables`;
    }
    if (viewMode === "year") {
      return `${currentDate.getFullYear()}`;
    }
    return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 md:mb-12">
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-5xl">
            {getTitle()}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            {/* View Toggle */}
            <div className="flex gap-1 rounded-sm bg-secondary p-1">
              <button
                onClick={() => setViewMode("month")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "month"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar size={14} />
                Month
              </button>
              <button
                onClick={() => setViewMode("year")}
                className={`rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "year"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setViewMode("annual-tables")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "annual-tables"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon size={14} />
                Tables
              </button>
            </div>

            {userData && (
              <span className="hidden text-[11px] uppercase tracking-widest text-muted-foreground lg:block">
                {userData.name}
              </span>
            )}

            <nav className="flex gap-3">
              {viewMode === "month" && (
                <button
                  onClick={exportToCalendar}
                  className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                  aria-label="Export to Calendar"
                  title="Export to Calendar"
                >
                  <Download size={20} />
                </button>
              )}
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
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        </header>

        {/* Views */}
        {viewMode === "month" && (
          <MonthView
            currentDate={currentDate}
            userData={userData}
            onDayClick={setSelectedDay}
          />
        )}

        {viewMode === "year" && <YearView year={currentDate.getFullYear()} />}

        {viewMode === "annual-tables" && <AnnualTables year={currentDate.getFullYear()} />}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          initialData={userData}
          onSave={saveUserData}
          onClose={() => setShowUserForm(false)}
        />
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetail
          dayData={selectedDay}
          userData={userData}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};
