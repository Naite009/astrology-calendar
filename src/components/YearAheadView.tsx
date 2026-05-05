import { useMemo } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { ChartSelector } from "./ChartSelector";
import {
  calculateYearTransits,
  getTransitsForMonth,
  generateMonthThemes,
  getTransitPlanetSymbol,
  type YearlyTransitEvent,
} from "@/lib/yearlyTransitCalculator";
import { Sparkles, TrendingUp, Calendar as CalendarIcon } from "lucide-react";

interface YearAheadViewProps {
  year: number;
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartId: string;
  onSelectChart: (id: string) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "⚹",
};

const getActiveChart = (
  selectedChartId: string,
  userNatalChart: NatalChart | null,
  savedCharts: NatalChart[]
): NatalChart | null => {
  if (selectedChartId === "general") return null;
  if (selectedChartId === "user") return userNatalChart;
  return savedCharts.find((c) => c.id === selectedChartId) || null;
};

export const YearAheadView = ({
  year,
  userNatalChart,
  savedCharts,
  selectedChartId,
  onSelectChart,
}: YearAheadViewProps) => {
  const activeChart = getActiveChart(selectedChartId, userNatalChart, savedCharts);

  const transits = useMemo<YearlyTransitEvent[]>(() => {
    if (!activeChart) return [];
    try {
      return calculateYearTransits(activeChart, year);
    } catch (e) {
      console.error("YearAhead transit calc failed", e);
      return [];
    }
  }, [activeChart, year]);

  const majorTransits = useMemo(
    () =>
      transits
        .filter((t) => t.significance === "major")
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [transits]
  );

  const monthSummaries = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const monthTransits = getTransitsForMonth(transits, m, year);
      return {
        month: m,
        transits: monthTransits,
        themes: generateMonthThemes(monthTransits),
        majorCount: monthTransits.filter((t) => t.significance === "major").length,
      };
    });
  }, [transits, year]);

  const chartName = activeChart?.name || "General";

  return (
    <div className="space-y-6">
      {/* Header / Chart Selector */}
      <div className="rounded-sm border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-serif text-xl text-foreground">
              {year} — Year Ahead {activeChart ? `for ${chartName}` : "(General)"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {activeChart
                ? "Personalized look at the major transits and themes shaping this year."
                : "Pick a name below to see a personalized year ahead. Without a chart, this view is general."}
            </p>
          </div>
          <ChartSelector
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChartId}
            onSelect={onSelectChart}
            includeGeneral={true}
            generalLabel="General (no chart)"
            label="View as:"
          />
        </div>
      </div>

      {!activeChart ? (
        <div className="rounded-sm border border-dashed border-border bg-muted/30 p-8 text-center">
          <Sparkles className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium">Pick a name above</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            The Year Ahead view shows the major transits hitting a specific birth chart. Choose a name from the dropdown to load it.
          </p>
        </div>
      ) : (
        <>
          {/* Big Themes / Milestones */}
          <div className="rounded-sm border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-serif text-base text-foreground">Major Transits This Year</h3>
              <span className="text-[10px] text-muted-foreground">
                ({majorTransits.length} events)
              </span>
            </div>
            {majorTransits.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No major outer-planet transits flagged for {year}. This is often a quieter integration year.
              </p>
            ) : (
              <ul className="space-y-2">
                {majorTransits.slice(0, 12).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start gap-3 text-xs border-b border-border/50 pb-2 last:border-0"
                  >
                    <div className="text-muted-foreground font-mono w-20 shrink-0">
                      {t.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">
                        {getTransitPlanetSymbol(t.transitPlanet)} {t.transitPlanet}
                      </span>
                      <span className="text-muted-foreground mx-1.5">
                        {ASPECT_SYMBOLS[t.aspect] || ""} {t.aspect}
                      </span>
                      <span className="font-medium text-foreground">
                        natal {getTransitPlanetSymbol(t.natalPlanet)} {t.natalPlanet}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {t.transitDegree}° {t.transitSign} → {t.natalDegree}° {t.natalSign}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Month-by-Month Strip */}
          <div className="rounded-sm border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h3 className="font-serif text-base text-foreground">Month-by-Month Themes</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {monthSummaries.map((m) => (
                <div
                  key={m.month}
                  className="rounded-sm border border-border/60 bg-background p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-serif text-sm text-foreground">
                      {MONTH_NAMES[m.month]}
                    </div>
                    {m.majorCount > 0 && (
                      <span className="text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                        {m.majorCount} major
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {m.themes.slice(0, 3).map((theme, i) => (
                      <div key={i} className="text-[11px] text-muted-foreground">
                        • {theme}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default YearAheadView;
