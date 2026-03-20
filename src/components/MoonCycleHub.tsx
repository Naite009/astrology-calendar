import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NatalChart } from "@/hooks/useNatalChart";
import { LunarCycleView } from "./LunarCycleView";
import { MoonTransitCalendar } from "./MoonTransitCalendar";
import { MoonPhasesView } from "./MoonPhasesView";

const MoonPatternsTab = lazy(() =>
  import("./moonCycle/MoonPatternsTab").then((m) => ({ default: m.MoonPatternsTab }))
);

interface MoonCycleHubProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartId?: string;
  onSelectChart?: (id: string) => void;
  currentYear: number;
}

export const MoonCycleHub = ({
  userNatalChart,
  savedCharts,
  selectedChartId,
  onSelectChart,
  currentYear,
}: MoonCycleHubProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="font-serif text-2xl font-light tracking-widest text-foreground">
          ☽ Cycle Tracker
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Track lunar phases against your natal chart · Discover patterns · Journal your experience
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50">
          <TabsTrigger value="dashboard" className="text-xs">
            🌙 Dashboard
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">
            📅 Calendar
          </TabsTrigger>
          <TabsTrigger value="journal" className="text-xs">
            📓 Journal
          </TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs">
            🔮 Patterns
          </TabsTrigger>
          <TabsTrigger value="natal-overlay" className="text-xs">
            ⭐ Natal Overlay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <LunarCycleView
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChartId}
            onSelectChart={onSelectChart}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <MoonPhasesView year={currentYear} />
        </TabsContent>

        <TabsContent value="journal">
          {/* The journal is currently embedded in LunarCycleView via LunarWorkbookSection.
              For now, point users to the Dashboard tab where the workbook lives.
              Phase 2 will extract it as a standalone sub-tab. */}
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              📓 Your lunar journal is in the <strong>Dashboard</strong> tab — scroll down to the ☽ Cycle Workbook section.
            </p>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="mt-2 text-xs text-primary underline"
            >
              Go to Dashboard →
            </button>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading patterns…
              </div>
            }
          >
            <MoonPatternsTab
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="natal-overlay">
          <MoonTransitCalendar natalChart={userNatalChart || savedCharts[0] || null} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoonCycleHub;
