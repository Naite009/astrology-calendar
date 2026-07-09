import { useEffect, useState } from "react";
import { buildSkyEntriesAt, type SkyEntry } from "@/lib/cosmicWeatherSkyBlock";

/**
 * Live sky strip. Editorial pill layout for every tracked body,
 * refreshing every minute.
 */
export function SkyStripLive({ at }: { at?: Date }) {
  const [now, setNow] = useState<Date>(at ?? new Date());

  useEffect(() => {
    if (at) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [at]);

  let entries: SkyEntry[] = [];
  try {
    entries = buildSkyEntriesAt(at ?? now);
  } catch (e) {
    console.error("SkyStripLive failed:", e);
    return null;
  }

  const stamp = (at ?? now).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <section className="mb-6 rounded-sm border border-primary/20 bg-gradient-to-br from-secondary/60 via-background to-secondary/40 shadow-sm overflow-hidden">
      <header className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-primary/10 bg-background/40">
        <h3 className="font-serif text-base tracking-wide text-foreground">
          The Sky Right Now
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {stamp}
        </span>
      </header>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
        {entries.map(e => (
          <li
            key={e.key}
            className="group relative flex items-center gap-3 rounded-sm border border-border/60 bg-card/80 px-3 py-2 hover:border-primary/40 hover:bg-card transition-colors"
            title={`${e.label} ${e.degree}°${String(e.minutes).padStart(2, "0")}' ${e.sign}${e.retrograde ? " retrograde" : ""}`}
          >
            <span className="flex-none w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-serif">
              {e.symbol}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                  {e.label}
                </span>
                {e.retrograde && (
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    ℞
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 font-serif text-foreground">
                <span className="tabular-nums text-sm">
                  {e.degree}°{String(e.minutes).padStart(2, "0")}′
                </span>
                <span className="text-primary/80">{e.signSymbol}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {e.sign}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
