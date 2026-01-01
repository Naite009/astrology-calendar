import { useMemo } from "react";
import { getMoonPhase, getPlanetaryPositions, isMercuryRetrograde } from "@/lib/astrology";

interface AnnualTablesProps {
  year: number;
}

interface LunarCycle {
  date: Date;
  type: string;
  sign: string;
  degree: number;
}

interface RetrogradePeriod {
  start: Date;
  end: Date;
}

interface Ingress {
  date: Date;
  planet: string;
  sign: string;
  symbol: string;
}

export const AnnualTables = ({ year }: AnnualTablesProps) => {
  // Calculate Full & New Moons for the year
  const lunarCycles = useMemo(() => {
    const cycles: LunarCycle[] = [];
    const currentDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    while (currentDate <= endDate) {
      const moonPhase = getMoonPhase(currentDate);
      const planets = getPlanetaryPositions(currentDate);

      if (moonPhase.phaseName === "Full Moon" || moonPhase.phaseName === "New Moon") {
        cycles.push({
          date: new Date(currentDate),
          type: moonPhase.phaseName,
          sign: planets.moon.signName,
          degree: planets.moon.degree,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return cycles;
  }, [year]);

  // Find retrograde periods
  const retrogradePeriods = useMemo(() => {
    const periods: RetrogradePeriod[] = [];
    let inRetro = false;
    let retroStart: Date | null = null;

    for (let d = 0; d < 365; d++) {
      const date = new Date(year, 0, 1 + d);
      const isRetro = isMercuryRetrograde(date);

      if (isRetro && !inRetro) {
        retroStart = new Date(date);
        inRetro = true;
      } else if (!isRetro && inRetro && retroStart) {
        periods.push({
          start: retroStart,
          end: new Date(date),
        });
        inRetro = false;
      }
    }

    return periods;
  }, [year]);

  // Major planetary ingresses
  const majorIngresses = useMemo(() => {
    const ingresses: Ingress[] = [];
    let lastSaturnSign: string | null = null;
    let lastNeptuneSign: string | null = null;

    for (let d = 0; d < 365; d++) {
      const date = new Date(year, 0, 1 + d);
      const planets = getPlanetaryPositions(date);

      if (planets.saturn.signName !== lastSaturnSign && lastSaturnSign !== null) {
        ingresses.push({
          date: new Date(date),
          planet: "Saturn",
          sign: planets.saturn.signName,
          symbol: "♄",
        });
      }

      if (planets.neptune.signName !== lastNeptuneSign && lastNeptuneSign !== null) {
        ingresses.push({
          date: new Date(date),
          planet: "Neptune",
          sign: planets.neptune.signName,
          symbol: "♆",
        });
      }

      lastSaturnSign = planets.saturn.signName;
      lastNeptuneSign = planets.neptune.signName;
    }

    return ingresses;
  }, [year]);

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Lunar Cycles */}
      <section className="rounded-sm border border-border bg-background p-8">
        <h2 className="mb-6 border-b border-border pb-4 font-serif text-2xl font-light text-foreground md:text-3xl">
          🌕 Full Moons & New Moons {year}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {lunarCycles.map((cycle, i) => (
            <div key={i} className="rounded-sm bg-secondary p-4">
              <div className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                {cycle.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="font-medium text-foreground">
                {cycle.type === "Full Moon" ? "🌕" : "🌑"} {cycle.type}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {cycle.degree}° {cycle.sign}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mercury Retrograde */}
      <section className="rounded-sm border border-border bg-background p-8">
        <h2 className="mb-6 border-b border-border pb-4 font-serif text-2xl font-light text-foreground md:text-3xl">
          ☿ Mercury Retrograde {year}
        </h2>
        {retrogradePeriods.length > 0 ? (
          <div className="space-y-4">
            {retrogradePeriods.map((period, i) => (
              <div key={i} className="rounded-sm bg-energy-caution p-4">
                <div className="font-medium text-foreground">
                  {period.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                  {period.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Mercury retrogrades detected in {year}</p>
        )}
      </section>

      {/* Major Ingresses */}
      <section className="rounded-sm border border-border bg-background p-8">
        <h2 className="mb-6 border-b border-border pb-4 font-serif text-2xl font-light text-foreground md:text-3xl">
          ⚡ Major Planetary Ingresses {year}
        </h2>
        {majorIngresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {majorIngresses.map((ingress, i) => (
              <div key={i} className="rounded-sm bg-secondary p-4">
                <div className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {ingress.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="font-medium text-foreground">
                  {ingress.symbol} {ingress.planet} → {ingress.sign}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Generational shift</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No major ingresses in {year}</p>
        )}
      </section>
    </div>
  );
};
