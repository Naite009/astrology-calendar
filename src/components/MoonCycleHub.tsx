import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NatalChart } from "@/hooks/useNatalChart";
import { LunarCycleView } from "./LunarCycleView";
import { MoonTransitCalendar } from "./MoonTransitCalendar";
import { MoonPhasesView } from "./MoonPhasesView";
import { Button } from "@/components/ui/button";

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

  const jumpToSection = (sectionId: string) => {
    setActiveTab("dashboard");

    let attempts = 0;
    const tryScroll = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < 8) {
        window.setTimeout(tryScroll, 120);
      }
    };

    window.setTimeout(tryScroll, 0);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-2 space-y-3">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-widest text-foreground">
            ☽ Moon Cycle Workbook
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
            A monthly emotional work cycle · Track what rises, what peaks, and what asks to be released
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => jumpToSection("card-pulls-section")}
          >
            🃏 Go to Cards
          </Button>
        </div>
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
