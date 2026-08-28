import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { NatalChart } from "@/hooks/useNatalChart";
import {
  detectCyclePatterns,
  getCurrentNewMoon,
  getNewMoonsForYear,
  SIGN_GLYPHS,
  summarizeNewMoon,
} from "@/lib/newMoonCycles";

interface NewMoonCalendarProps {
  year: number;
  onYearChange: (year: number) => void;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  natalChart?: NatalChart | null;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const NewMoonCalendar = ({
  year,
  onYearChange,
  selectedDate,
  onSelectDate,
  natalChart,
}: NewMoonCalendarProps) => {
  const liveKey = useMemo(() => getCurrentNewMoon().toDateString(), []);

  const cycles = useMemo(
    () => getNewMoonsForYear(year).map((p) => summarizeNewMoon(p, natalChart)),
    [year, natalChart?.id],
  );

  // Patterns across a five-year window centered on the visible year, so a
  // repeating house or planet shows up even with no journal entries.
  const windowSummaries = useMemo(() => {
    const out = [];
    for (let y = year - 2; y <= year + 2; y++) {
      for (const p of getNewMoonsForYear(y)) out.push(summarizeNewMoon(p, natalChart));
    }
    return out;
  }, [year, natalChart?.id]);

  const yearPatterns = useMemo(() => detectCyclePatterns(cycles, natalChart), [cycles, natalChart?.id]);
  const windowPatterns = useMemo(
    () => detectCyclePatterns(windowSummaries, natalChart),
    [windowSummaries, natalChart?.id],
  );

  const selectedKey = selectedDate.toDateString();

  return (
    <div className="space-y-4">
      <Card className="bg-background border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> New Moon calendar
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={year <= MIN_YEAR}
                onClick={() => onYearChange(year - 1)}
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[3.5rem] text-center text-sm font-medium tabular-nums">{year}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={year >= MAX_YEAR}
                onClick={() => onYearChange(year + 1)}
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => {
                  const live = getCurrentNewMoon();
                  onYearChange(live.getFullYear());
                  onSelectDate(live);
                }}
              >
                Back to now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Every New Moon of the year, with its sign and degree, plus which of{" "}
            {natalChart?.name ? `${natalChart.name}'s` : "your"} houses it falls in and the closest contact to a
            natal planet. Click any one to read that whole cycle, past or future, written or not.
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cycles.map((c) => {
              const key = c.date.toDateString();
              const isSelected = key === selectedKey;
              const isLive = key === liveKey;
              return (
                <button
                  key={key}
                  onClick={() => onSelectDate(c.date)}
                  className={`text-left rounded-lg border p-2.5 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-muted/20 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {SIGN_GLYPHS[c.sign]} {c.sign} {c.degree}°
                    </p>
                    {isLive && (
                      <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">Now</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{fmtDay(c.date)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.natalHouse && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        House {c.natalHouse}
                      </Badge>
                    )}
                    {c.tightestNatal && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 ${
                          c.tightestNatal.hard
                            ? "border-destructive/40 text-destructive"
                            : "border-success/40 text-success"
                        }`}
                      >
                        {c.tightestNatal.symbol} {c.tightestNatal.planet} {c.tightestNatal.orb}°
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {(yearPatterns.length > 0 || windowPatterns.length > 0) && (
        <Card className="bg-background border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🔁 Patterns in the lunations themselves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              These come from the sky and your chart, not from your journal, so they read the same whether or not
              you have written anything yet.
            </p>

            {yearPatterns.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-primary">Across {year}</p>
                {yearPatterns.map((p) => (
                  <div key={p.title} className="rounded-lg bg-muted/30 p-2.5">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>
            )}

            {windowPatterns.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Across {year - 2} to {year + 2}
                </p>
                {windowPatterns.map((p) => (
                  <div key={p.title} className="rounded-lg border border-border p-2.5">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewMoonCalendar;
