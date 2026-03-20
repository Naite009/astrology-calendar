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
          ☽ Moon Cycle Workbook
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
          A monthly emotional work cycle · Track what rises, what peaks, and what asks to be released
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
