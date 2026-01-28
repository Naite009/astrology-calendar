import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, User, Download, Calendar, Moon, BookOpen, Book, Printer, Users, Clock, Palette, Orbit, HelpCircle, Scroll, Circle, Mic, Sparkles, Gauge, Globe, Heart, Activity, MessageCircleQuestion, Layers } from "lucide-react";
import { ChartDecoderView } from "./ChartDecoderView";
import { AskView } from "./AskView";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { AnnualTablesView } from "./AnnualTablesView";
import { GuideView } from "./GuideView";
import { MoonPhasesView } from "./MoonPhasesView";
import { UserForm } from "./UserForm";
import { DayDetail } from "./DayDetail";
import { ChartLibrary } from "./ChartLibrary";
import { TimingView } from "./TimingView";
import { ColorsView } from "./ColorsView";
import { PatternsView } from "./PatternsView";
import { SacredScriptView } from "./SacredScriptView";
import { NatalChartWheel } from "./NatalChartWheel";
import { DayTypeLegend } from "./DayTypeLegend";
import { VoiceMemoModal } from "./VoiceMemoModal";
import { VoiceMemoLibrary } from "./VoiceMemoLibrary";
import { PlanetarySpeedsView } from "./PlanetarySpeedsView";
import { DwarfPlanetsGuide } from "./DwarfPlanetsGuide";
import { HealthAstrologyView } from "./HealthAstrologyView";
import { useUserData } from "@/hooks/useUserData";
import { useNotes } from "@/hooks/useNotes";
import { useNatalChart, NatalChart } from "@/hooks/useNatalChart";
import { useCloudBackup } from "@/hooks/useCloudBackup";
import { useVoiceMemos } from "@/hooks/useVoiceMemos";
import { DayData, generateICalExport } from "@/lib/astrology";

import { SynastryView } from "./SynastryView";
import { RelationshipTimelineView } from "./RelationshipTimelineView";
import { StructuralStressView } from "./StructuralStressView";

type ViewMode = "month" | "week" | "year" | "moon-phases" | "annual-tables" | "guide" | "charts" | "wheel" | "timing" | "colors" | "patterns" | "sacred-script" | "voice-memos" | "decoder" | "speeds" | "dwarf-planets" | "synastry" | "health" | "timeline" | "ask" | "structural";

export const AstroCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [showLegend, setShowLegend] = useState(false);
  const { userData, saveUserData } = useUserData();
  const { weekNotes, dayNotes, saveWeekNotes, saveDayNotes } = useNotes();
  const {
    userNatalChart,
    savedCharts,
    selectedChartForTiming,
    saveUserNatalChart,
    addChart,
    updateChart,
    deleteChart,
    selectChartForTiming,
    setSavedCharts,
  } = useNatalChart();

  // Cloud backup integration
  const cloudBackup = useCloudBackup(
    userNatalChart,
    savedCharts,
    setSavedCharts,
    saveUserNatalChart
  );

  // Voice memos
  const voiceMemos = useVoiceMemos();
  const [voiceMemoDate, setVoiceMemoDate] = useState<Date | null>(null);
  // Get active chart for transit overlay
  const getActiveChart = (): NatalChart | null => {
    if (selectedChartForTiming === 'general') return null;
    if (selectedChartForTiming === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartForTiming) || null;
  };

  const activeChart = getActiveChart();

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const navigate = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "year" || viewMode === "annual-tables" || viewMode === "moon-phases" || viewMode === "patterns") {
        newDate.setFullYear(prev.getFullYear() + direction);
      } else if (viewMode === "week") {
        newDate.setDate(prev.getDate() + direction * 7);
      } else {
        newDate.setMonth(prev.getMonth() + direction);
      }
      return newDate;
    });
  };

  const printCalendar = () => {
    window.print();
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
    if (viewMode === "guide") {
      return "Reference Guide";
    }
    if (viewMode === "charts") {
      return "Chart Library";
    }
    if (viewMode === "timing") {
      return "Timing & Electional";
    }
    if (viewMode === "colors") {
      return "Astro Colors";
    }
    if (viewMode === "patterns") {
      return "Patterns & Cycles";
    }
    if (viewMode === "sacred-script") {
      return "Sacred Script";
    }
    if (viewMode === "voice-memos") {
      return "Voice Memos";
    }
    if (viewMode === "decoder") {
      return "Chart Decoder";
    }
    if (viewMode === "speeds") {
      return "Planetary Speeds";
    }
    if (viewMode === "dwarf-planets") {
      return "Dwarf Planets Guide";
    }
    if (viewMode === "health") {
      return "Health Astrology";
    }
    if (viewMode === "structural") {
      return "Structural Stress & Release";
    }
    if (viewMode === "timeline") {
      return "Relationship Timeline";
    }
    if (viewMode === "ask") {
      return "Ask About Chart";
    }
    if (viewMode === "moon-phases") {
      return `${currentDate.getFullYear()} Moon Phases`;
    }
    if (viewMode === "annual-tables") {
      return `${currentDate.getFullYear()} Annual Tables`;
    }
    if (viewMode === "year") {
      return `${currentDate.getFullYear()}`;
    }
    if (viewMode === "week") {
      const weekStart = getWeekStart(currentDate);
      return `Week of ${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 md:mb-12">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-5xl">
              {getTitle()}
            </h1>
            
            {/* Chart Selector Dropdown */}
            {(viewMode === "month" || viewMode === "week") && (
              <div className="flex items-center gap-2">
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  View as:
                </label>
                <select
                  value={selectedChartForTiming}
                  onChange={(e) => selectChartForTiming(e.target.value)}
                  className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
                >
                  <option value="general">General Calendar</option>
                  {userNatalChart && (
                    <option value="user">{userNatalChart.name}&apos;s Chart</option>
                  )}
                  {savedCharts.map(chart => (
                    <option key={chart.id} value={chart.id}>{chart.name}</option>
                  ))}
                </select>
                {activeChart && (
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded-sm">
                    Personal Transits Active
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* View Toggle */}
            <div className="flex flex-wrap gap-1 rounded-sm bg-secondary p-1">
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
                onClick={() => setViewMode("week")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "week"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen size={14} />
                Week
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
                onClick={() => setViewMode("moon-phases")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "moon-phases"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon size={14} />
                Phases
              </button>
              <button
                onClick={() => setViewMode("annual-tables")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "annual-tables"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tables
              </button>
              <button
                onClick={() => setViewMode("guide")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "guide"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Book size={14} />
                Guide
              </button>
              <button
                onClick={() => setViewMode("charts")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "charts"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users size={14} />
                Charts
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("wheel");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "wheel"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Natal Chart Wheel"
                    : "Add a chart to view the wheel"
                }
              >
                <Circle size={14} />
                Wheel
              </button>
              <button
                onClick={() => setViewMode("timing")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "timing"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock size={14} />
                Timing
              </button>
              <button
                onClick={() => setViewMode("colors")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "colors"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Palette size={14} />
                Colors
              </button>
              <button
                onClick={() => setViewMode("patterns")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "patterns"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Orbit size={14} />
                Patterns
              </button>
              {/* Sacred Script */}
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("sacred-script");
                  } else {
                    // No chart loaded yet — send user to Charts to add one.
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "sacred-script"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Sacred Script"
                    : "Add a chart in Charts to unlock Sacred Script"
                }
              >
                <Scroll size={14} />
                Script
              </button>
              <button
                onClick={() => setViewMode("voice-memos")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "voice-memos"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic size={14} />
                Memos
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("decoder");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "decoder"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Chart Decoder"
                    : "Add a chart to decode"
                }
              >
                <Sparkles size={14} />
                Decoder
              </button>
              <button
                onClick={() => setViewMode("speeds")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "speeds"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gauge size={14} />
                Speeds
              </button>
              <button
                onClick={() => setViewMode("dwarf-planets")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "dwarf-planets"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe size={14} />
                TNOs
              </button>
              <button
                onClick={() => setViewMode("synastry")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "synastry"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart size={14} />
                Synastry
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "timeline"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar size={14} />
                Timeline
              </button>
              <button
                onClick={() => setViewMode("structural")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "structural"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers size={14} />
                Structural
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("health");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "health"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Health Astrology"
                    : "Add a chart to view Health Astrology"
                }
              >
                <Activity size={14} />
                Health
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("ask");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "ask"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Ask Questions"
                    : "Add a chart to ask questions"
                }
              >
                <MessageCircleQuestion size={14} />
                Ask
              </button>
            </div>

            {userData && (
              <span className="hidden text-[11px] uppercase tracking-widest text-muted-foreground lg:block">
                {userData.name}
              </span>
            )}

            <nav className="print:hidden flex gap-3">
              <button
                onClick={() => setShowLegend(true)}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                aria-label="Day Type Legend"
                title="Day Type & Luck Guide"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={printCalendar}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                aria-label="Print"
                title="Print"
              >
                <Printer size={20} />
              </button>
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
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => navigate(1)}
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
            activeChart={activeChart}
            voiceMemos={voiceMemos.memos}
            onVoiceMemoClick={(date) => setVoiceMemoDate(date)}
            onOpenFullLegend={() => setShowLegend(true)}
          />
        )}

        {viewMode === "voice-memos" && (
          <VoiceMemoLibrary
            memos={voiceMemos.memos}
            onDelete={voiceMemos.deleteMemo}
            onDownload={voiceMemos.downloadMemo}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            currentDate={currentDate}
            weekNotes={weekNotes}
            dayNotes={dayNotes}
            saveWeekNotes={saveWeekNotes}
            saveDayNotes={saveDayNotes}
            activeChart={activeChart}
          />
        )}

        {viewMode === "year" && <YearView year={currentDate.getFullYear()} />}

        {viewMode === "moon-phases" && <MoonPhasesView year={currentDate.getFullYear()} />}

        {viewMode === "annual-tables" && <AnnualTablesView year={currentDate.getFullYear()} />}

        {viewMode === "guide" && <GuideView onNavigateToView={(view) => setViewMode(view)} />}

        {viewMode === "charts" && (
          <ChartLibrary
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            onSaveUserChart={saveUserNatalChart}
            onAddChart={addChart}
            onUpdateChart={updateChart}
            onDeleteChart={deleteChart}
            cloudBackup={cloudBackup}
          />
        )}

        {viewMode === "wheel" && (
          <NatalChartWheel
            natalChart={userNatalChart || savedCharts[0]}
            allCharts={[
              ...(userNatalChart ? [userNatalChart] : []),
              ...savedCharts
            ]}
            onChartImageUpload={(chartId, imageBase64) => {
              // Find the chart and update it
              if (userNatalChart && chartId === userNatalChart.id) {
                saveUserNatalChart({ ...userNatalChart, chartImageBase64: imageBase64 });
              } else {
                const chartToUpdate = savedCharts.find(c => c.id === chartId);
                if (chartToUpdate) {
                  updateChart(chartId, { chartImageBase64: imageBase64 });
                }
              }
            }}
          />
        )}

        {viewMode === "timing" && (
          <TimingView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartForTiming={selectedChartForTiming}
            setSelectedChartForTiming={selectChartForTiming}
            currentDate={currentDate}
          />
        )}

        {viewMode === "colors" && (
          <ColorsView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            onOpenNatalForm={() => setViewMode("charts")}
          />
        )}

        {viewMode === "patterns" && (
          <PatternsView year={currentDate.getFullYear()} />
        )}

        {viewMode === "sacred-script" && (
          <SacredScriptView 
            natalChart={userNatalChart || savedCharts[0]}
            allCharts={[
              ...(userNatalChart ? [userNatalChart] : []),
              ...savedCharts
            ]}
          />
        )}

        {viewMode === "decoder" && (
          <ChartDecoderView
            natalChart={userNatalChart || savedCharts[0]}
            allCharts={[
              ...(userNatalChart ? [userNatalChart] : []),
              ...savedCharts
            ]}
            selectedChartId={selectedChartForTiming}
          />
        )}

        {viewMode === "speeds" && (
          <PlanetarySpeedsView />
        )}

        {viewMode === "dwarf-planets" && (
          <DwarfPlanetsGuide />
        )}

        {viewMode === "synastry" && (
          <SynastryView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
          />
        )}

        {viewMode === "timeline" && (
          <RelationshipTimelineView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
          />
        )}

        {viewMode === "health" && (
          <HealthAstrologyView
            natalChart={userNatalChart || savedCharts[0]}
            allCharts={[
              ...(userNatalChart ? [userNatalChart] : []),
              ...savedCharts
            ]}
          />
        )}

        {viewMode === "ask" && (
          <AskView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChartForTiming}
          />
        )}

        {viewMode === "structural" && (
          <StructuralStressView
            userChart={userNatalChart}
            savedCharts={savedCharts}
          />
        )}
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
          activeChart={activeChart}
        />
      )}

      {/* Day Type Legend */}
      <DayTypeLegend isOpen={showLegend} onClose={() => setShowLegend(false)} />

      {/* Voice Memo Modal */}
      {voiceMemoDate && (
        <VoiceMemoModal
          isOpen={!!voiceMemoDate}
          onClose={() => setVoiceMemoDate(null)}
          date={voiceMemoDate}
          onSave={async (date, title, category, blob, duration, fileType) => {
            const result = await voiceMemos.addMemo(date, title, category, blob, duration, fileType);
            return !!result;
          }}
        />
      )}
    </div>
  );
};
