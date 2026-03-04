import { useState, lazy, Suspense } from "react";
import { ChevronLeft, ChevronRight, User, Download, Calendar, Moon, BookOpen, Book, Printer, Users, Clock, Palette, Orbit, HelpCircle, Scroll, Circle, Mic, ScanSearch, Gauge, Globe, Heart, Activity, MessageCircleQuestion, Layers, Combine, Diamond, FileText, CalendarClock, Utensils, Sun, Home } from "lucide-react";
import { TodaysCosmicEnergy, CosmicEnergyButton } from "./TodaysCosmicEnergy";
import { useState as useCosmicState } from "react";
const ChartDecoderView = lazy(() => import("./ChartDecoderView").then(m => ({ default: m.ChartDecoderView })));
import { AskView } from "./AskView";
import { ChartSelector } from "./ChartSelector";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { AnnualTablesView } from "./AnnualTablesView";
import { GuideView } from "./GuideView";
import { MoonPhasesView } from "./MoonPhasesView";
import { UserForm } from "./UserForm";
import { DayDetail } from "./DayDetail";
import { ChartLibrary } from "./ChartLibrary";
const TimingView = lazy(() => import("./TimingView").then(m => ({ default: m.TimingView })));
import { ColorsView } from "./ColorsView";
import { PatternsView } from "./PatternsView";
const SacredScriptView = lazy(() => import("./SacredScriptView").then(m => ({ default: m.SacredScriptView })));
import { DayTypeLegend } from "./DayTypeLegend";
import { VoiceMemoModal } from "./VoiceMemoModal";
import { VoiceMemoLibrary } from "./VoiceMemoLibrary";
import { PlanetarySpeedsView } from "./PlanetarySpeedsView";
import { DwarfPlanetsGuide } from "./DwarfPlanetsGuide";
const HealthAstrologyView = lazy(() => import("./HealthAstrologyView").then(m => ({ default: m.HealthAstrologyView })));
const HumanDesignView = lazy(() => import("./humandesign/HumanDesignView").then(m => ({ default: m.HumanDesignView })));
import { useUserData } from "@/hooks/useUserData";
import { useNotes } from "@/hooks/useNotes";
import { useNatalChart, NatalChart } from "@/hooks/useNatalChart";
import { useCloudBackup } from "@/hooks/useCloudBackup";
import { useVoiceMemos } from "@/hooks/useVoiceMemos";
import { DayData, generateICalExport } from "@/lib/astrology";

const SynastryView = lazy(() => import("./SynastryView").then(m => ({ default: m.SynastryView })));
const RelationshipTimelineView = lazy(() => import("./RelationshipTimelineView").then(m => ({ default: m.RelationshipTimelineView })));
const StructuralStressView = lazy(() => import("./StructuralStressView").then(m => ({ default: m.StructuralStressView })));
const CombosView = lazy(() => import("./CombosView").then(m => ({ default: m.CombosView })));
const GroundedNarrativeView = lazy(() => import("./GroundedNarrativeView").then(m => ({ default: m.GroundedNarrativeView })));
const TransitCalendarView = lazy(() => import("./TransitCalendarView").then(m => ({ default: m.TransitCalendarView })));
import { WeeklyMealPlanCard } from "./WeeklyMealPlanCard";
const HexagramView = lazy(() => import("./HexagramView").then(m => ({ default: m.HexagramView })));
const SolarReturnView = lazy(() => import("./SolarReturnView").then(m => ({ default: m.SolarReturnView })));
import { RetroGradesHub } from "./RetroGradesHub";
import { MoonPhaseEncyclopedia } from "./MoonPhaseEncyclopedia";
const FoundationsView = lazy(() => import("./FoundationsView").then(m => ({ default: m.FoundationsView })));
const TarotFunctionsView = lazy(() => import("./TarotFunctionsView").then(m => ({ default: m.TarotFunctionsView })));



type ViewMode = "month" | "week" | "year" | "moon-phases" | "annual-tables" | "guide" | "charts" | "timing" | "colors" | "patterns" | "sacred-script" | "voice-memos" | "decoder" | "speeds" | "dwarf-planets" | "synastry" | "health" | "timeline" | "ask" | "structural" | "combos" | "human-design" | "narrative" | "transit-calendar" | "cosmic-kitchen" | "hexagram" | "solar-return" | "retrogrades" | "moon-encyclopedia" | "foundations" | "tarot-functions";

export const AstroCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [showLegend, setShowLegend] = useState(false);
  const [showCosmicEnergy, setShowCosmicEnergy] = useState(false);
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
      return "Timing & Best Days";
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
    if (viewMode === "combos") {
      return "Planetary Combinations";
    }
    if (viewMode === "timeline") {
      return "Relationship Timeline";
    }
    if (viewMode === "ask") {
      return "Ask About Chart";
    }
    if (viewMode === "narrative") {
      return "Narrative";
    }
    if (viewMode === "transit-calendar") {
      return "2026 Transit Calendar";
    }
    if (viewMode === "hexagram") {
      return "I Ching Hexagram";
    }
    if (viewMode === "solar-return") {
      return "Solar Return";
    }
    if (viewMode === "retrogrades") {
      return "Retrogrades";
    }
    if (viewMode === "moon-encyclopedia") {
      return "Moon Phase Encyclopedia";
    }
    if (viewMode === "foundations") {
      return "Foundations";
    }
    if (viewMode === "tarot-functions") {
      return "Tarot Functions";
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
            {viewMode !== "month" && (
              <button
                onClick={() => setViewMode("month")}
                className="flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary rounded-sm"
                aria-label="Home"
                title="Back to Calendar"
              >
                <Home size={20} />
              </button>
            )}
            <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-5xl">
              {getTitle()}
            </h1>
            
            {/* Chart Selector Dropdown */}
            {(viewMode === "month" || viewMode === "week") && (
              <div className="flex items-center gap-2">
                <ChartSelector
                  userNatalChart={userNatalChart}
                  savedCharts={savedCharts}
                  selectedChartId={selectedChartForTiming}
                  onSelect={selectChartForTiming}
                  includeGeneral={true}
                  generalLabel="General Calendar"
                  label="View as:"
                />
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
                ☽ Almanac
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
                onClick={() => setViewMode("foundations")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "foundations"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ✦ Foundations
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
                  if (userNatalChart) selectChartForTiming('user');
                  setViewMode("timing");
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "timing"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock size={14} />
                Timing & Best Days
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
                <ScanSearch size={14} />
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
              <button
                onClick={() => setViewMode("combos")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "combos"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Combine size={14} />
                Combos
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("narrative");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "narrative"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Grounded Narrative"
                    : "Add a chart to view Narrative"
                }
              >
                <FileText size={14} />
                Narrative
              </button>
              <button
                onClick={() => setViewMode("human-design")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "human-design"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Diamond size={14} />
                HD
              </button>
              <button
                onClick={() => setViewMode("transit-calendar")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "transit-calendar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarClock size={14} />
                Transits
              </button>
              <button
                onClick={() => setViewMode("cosmic-kitchen")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "cosmic-kitchen"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Utensils size={14} />
                Kitchen
              </button>
              <button
                onClick={() => setViewMode("hexagram")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "hexagram"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ☰ Hexagram
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("solar-return");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "solar-return"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Solar Return"
                    : "Add a chart to use Solar Return"
                }
              >
               <Sun size={14} />
                Solar Return
              </button>
              <button
                onClick={() => setViewMode("moon-encyclopedia")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "moon-encyclopedia"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon size={14} />
                Moon
              </button>
              <button
                onClick={() => setViewMode("retrogrades")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "retrogrades"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🔄 Retrogrades
              </button>
              <button
                onClick={() => {
                  if (userNatalChart || savedCharts.length > 0) {
                    setViewMode("tarot-functions");
                  } else {
                    setViewMode("charts");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] uppercase tracking-widest transition-all ${
                  viewMode === "tarot-functions"
                    ? "bg-primary text-primary-foreground"
                    : userNatalChart || savedCharts.length > 0
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
                title={
                  userNatalChart || savedCharts.length > 0
                    ? "Tarot Functions"
                    : "Add a chart to see Tarot Functions"
                }
              >
                🃏 Tarot
              </button>
            </div>

            {userData && (
              <span className="hidden text-[11px] uppercase tracking-widest text-muted-foreground lg:block">
                {userData.name}
              </span>
            )}

            {/* Cosmic Weather Button - Centered */}
            <div className="print:hidden flex-1 flex justify-center">
              <CosmicEnergyButton onClick={() => setShowCosmicEnergy(true)} />
            </div>

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

        {/* Cosmic Energy Modal */}
        {showCosmicEnergy && (
          <TodaysCosmicEnergy onClose={() => setShowCosmicEnergy(false)} userNatalChart={userNatalChart} savedCharts={savedCharts} />
        )}

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


        {viewMode === "timing" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading Timing…</div>}>
            <TimingView
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
              selectedChartForTiming={selectedChartForTiming}
              setSelectedChartForTiming={selectChartForTiming}
              currentDate={currentDate}
            />
          </Suspense>
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
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <SacredScriptView 
              natalChart={userNatalChart || savedCharts[0]}
              allCharts={[
                ...(userNatalChart ? [userNatalChart] : []),
                ...savedCharts
              ]}
            />
          </Suspense>
        )}

        {viewMode === "decoder" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <ChartDecoderView
              natalChart={userNatalChart || savedCharts[0]}
              allCharts={[
                ...(userNatalChart ? [userNatalChart] : []),
                ...savedCharts
              ]}
              selectedChartId={selectedChartForTiming}
            />
          </Suspense>
        )}

        {viewMode === "speeds" && (
          <PlanetarySpeedsView />
        )}

        {viewMode === "dwarf-planets" && (
          <DwarfPlanetsGuide />
        )}

        {viewMode === "synastry" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <SynastryView
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </Suspense>
        )}

        {viewMode === "timeline" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <RelationshipTimelineView
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </Suspense>
        )}

        {viewMode === "health" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <HealthAstrologyView
              natalChart={userNatalChart || savedCharts[0]}
              allCharts={[
                ...(userNatalChart ? [userNatalChart] : []),
                ...savedCharts
              ]}
            />
          </Suspense>
        )}

        {viewMode === "ask" && (
          <AskView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChartForTiming}
          />
        )}

        {viewMode === "structural" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <StructuralStressView
              userChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </Suspense>
        )}

        {viewMode === "combos" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <CombosView 
              savedCharts={savedCharts}
              userChart={userNatalChart}
            />
          </Suspense>
        )}

        {viewMode === "human-design" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <HumanDesignView />
          </Suspense>
        )}

        {viewMode === "narrative" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <GroundedNarrativeView 
              savedCharts={savedCharts}
              userNatalChart={userNatalChart}
            />
          </Suspense>
        )}

        {viewMode === "transit-calendar" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <TransitCalendarView 
              natalChart={userNatalChart} 
              savedCharts={savedCharts}
            />
          </Suspense>
        )}

        {viewMode === "cosmic-kitchen" && (
          <div className="max-w-4xl mx-auto">
            <WeeklyMealPlanCard />
          </div>
        )}

        {viewMode === "hexagram" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <HexagramView />
          </Suspense>
        )}

        {viewMode === "solar-return" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <SolarReturnView
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </Suspense>
        )}

        {viewMode === "retrogrades" && (
          <RetroGradesHub
            allCharts={[
              ...(userNatalChart ? [userNatalChart] : []),
              ...savedCharts
            ]}
            primaryUserName={userData?.name}
          />
        )}

        {viewMode === "moon-encyclopedia" && (
          <MoonPhaseEncyclopedia
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
          />
        )}

        {viewMode === "foundations" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <FoundationsView
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
              onNavigateToView={(view) => setViewMode(view as ViewMode)}
            />
          </Suspense>
        )}

        {viewMode === "tarot-functions" && (
          <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>}>
            <TarotFunctionsView
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </Suspense>
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

export default AstroCalendar;
