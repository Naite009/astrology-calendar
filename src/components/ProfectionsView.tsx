import { useMemo } from "react";
import { Sun, Calendar, HelpCircle } from "lucide-react";
import type { NatalChart } from "@/hooks/useNatalChart";
import { ChartSelector } from "./ChartSelector";
import {
  getAnnualProfection,
  getMonthlyProfections,
  getYearTransits,
  PROFECTION_HOUSE_THEMES,
  TIME_LORD_THEMES,
} from "@/lib/profections";

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartId: string;
  onSelectChart: (id: string) => void;
}

/**
 * Year Ahead tab: annual and monthly profections with the year's timelord,
 * plus where the slow planets move through the chart this year. Written to
 * teach the technique while it reports it.
 */
export const ProfectionsView = ({ userNatalChart, savedCharts, selectedChartId, onSelectChart }: Props) => {
  const chart: NatalChart | null =
    selectedChartId === "user"
      ? userNatalChart
      : savedCharts.find((c) => c.id === selectedChartId) || userNatalChart;

  const risingSign = chart?.houseCusps?.house1?.sign || chart?.planets?.Ascendant?.sign;

  const data = useMemo(() => {
    if (!chart?.birthDate || !risingSign) return null;
    const now = new Date();
    const annual = getAnnualProfection(chart.birthDate, risingSign, now);
    if (!annual) return null;
    const months = getMonthlyProfections(annual, risingSign, now);
    const transits = getYearTransits(annual, risingSign);
    const lordPos = chart.planets?.[annual.timeLord as keyof typeof chart.planets];
    return { annual, months, transits, lordPos };
  }, [chart, risingSign]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedChartId}
          onSelect={onSelectChart}
          includeGeneral={false}
          label="Year for:"
        />
      </div>

      {!chart && (
        <p className="text-sm text-muted-foreground">
          Pick or add a chart to see the profection year.
        </p>
      )}

      {chart && !data && (
        <p className="text-sm text-muted-foreground">
          This technique needs a birth date and a rising sign. Add a birth time and place to this chart first.
        </p>
      )}

      {data && chart && (
        <>
          {/* What is this? Learn-as-you-go intro */}
          <section className="rounded-sm border border-border bg-card p-5 space-y-3">
            <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
              <HelpCircle size={18} className="text-primary" /> How profections work
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Profections are a simple timing method. Your life runs in 12-year cycles: the year you are born
              is a 1st house year, your first birthday starts a 2nd house year, and so on, one house per
              birthday. Whatever life area that house covers becomes the main stage of your year.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Each house belongs to a sign in your chart, and every sign has a ruling planet. The planet that
              rules your profected house is called the <span className="text-foreground font-medium">timelord</span>:
              the planet in charge of your year. Its condition in your birth chart colors how the year tends to go.
              Your year runs birthday to birthday, not January to January, so this page is always current.
            </p>
          </section>

          {/* Current year */}
          <section className="rounded-sm border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
                <Sun size={18} className="text-primary" /> This profection year
              </h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {fmt(data.annual.yearStart)} to {fmt(data.annual.yearEnd)}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-sm bg-secondary/60 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Age</p>
                <p className="font-serif text-3xl text-foreground">{data.annual.age}</p>
              </div>
              <div className="rounded-sm bg-secondary/60 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Profected house</p>
                <p className="font-serif text-3xl text-foreground">
                  {data.annual.house} <span className="text-lg text-muted-foreground">in {data.annual.sign}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {PROFECTION_HOUSE_THEMES[data.annual.house].label}
                </p>
              </div>
              <div className="rounded-sm bg-secondary/60 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Timelord</p>
                <p className="font-serif text-3xl text-foreground">
                  {PLANET_GLYPHS[data.annual.timeLord]} {data.annual.timeLord}
                </p>
                {data.lordPos?.sign && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    In your birth chart: {data.lordPos.sign}
                    {data.lordPos.isRetrograde ? ", retrograde" : ""}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {PROFECTION_HOUSE_THEMES[data.annual.house].focus} With {data.annual.timeLord} as timelord,
              the year also carries themes of {TIME_LORD_THEMES[data.annual.timeLord]}.
              Watch how {data.annual.timeLord} shows up: its good days and hard days tend to mark the
              turning points of the year.
            </p>
          </section>

          {/* Monthly calendar */}
          <section className="rounded-sm border border-border bg-card p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
              <Calendar size={18} className="text-primary" /> Month by month
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Monthly profections zoom in one level. Starting from your birthday, each month activates the
              next sign and house, so you get a smaller theme inside the bigger year. The current month is
              highlighted.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.months.map((m) => (
                <div
                  key={m.monthIndex}
                  className={`rounded-sm border p-3 ${
                    m.isCurrent
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {fmtShort(m.start)}
                      {m.isCurrent && <span className="ml-2 text-primary">Now</span>}
                    </span>
                    <span className="text-sm text-foreground">
                      {PLANET_GLYPHS[m.lord]} {m.lord}
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-lg text-foreground">
                    House {m.house} · {m.sign}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {PROFECTION_HOUSE_THEMES[m.house].label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Year transits */}
          <section className="rounded-sm border border-border bg-card p-5 space-y-4">
            <h2 className="font-serif text-xl text-foreground">The year's big transits in your chart</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The slow planets set the background weather of the year. This shows which sign and which area
              of your chart each one moves through between this birthday and the next. When one of them
              changes sign during your year, both positions are listed.
            </p>
            <div className="space-y-2">
              {data.transits.map((t) => (
                <div
                  key={t.planet}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-secondary/40 px-4 py-3"
                >
                  <span className="font-medium text-foreground">
                    {t.glyph} {t.planet}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t.changesSign ? (
                      <>
                        {t.startSign} (house {t.startHouse}) → {t.endSign} (house {t.endHouse})
                      </>
                    ) : (
                      <>
                        {t.startSign} · house {t.startHouse}: {PROFECTION_HOUSE_THEMES[t.startHouse].label.toLowerCase()}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ProfectionsView;
