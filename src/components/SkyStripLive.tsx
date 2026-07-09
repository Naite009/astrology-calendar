import { useEffect, useState } from "react";
import { buildSkyEntriesAt, type SkyEntry } from "@/lib/cosmicWeatherSkyBlock";

/**
 * Horizontal live-sky strip. Shows every tracked body across the top of the
 * cosmic-weather reading so you can visually verify positions the AI cites.
 * Updates every minute.
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
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="mb-6 rounded-md border border-primary/20 bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Sky right now · {stamp}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {entries.map(e => (
          <div
            key={e.key}
            className="flex items-baseline gap-1.5 font-mono text-xs text-foreground/90 whitespace-nowrap"
            title={`${e.label} ${e.degree}°${String(e.minutes).padStart(2, "0")}' ${e.sign}${e.retrograde ? " retrograde" : ""}`}
          >
            <span className="text-primary text-sm">{e.symbol}</span>
            <span className="text-muted-foreground">{e.label}</span>
            <span className="tabular-nums">
              {e.degree}°{String(e.minutes).padStart(2, "0")}'
            </span>
            <span>{e.signSymbol}</span>
            <span className="text-muted-foreground">{e.sign}</span>
            {e.retrograde && <span className="text-amber-500">℞</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
