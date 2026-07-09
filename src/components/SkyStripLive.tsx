import { useEffect, useState } from "react";
import { buildSkyEntriesAt, type SkyEntry } from "@/lib/cosmicWeatherSkyBlock";

/**
 * Live sky strip. Colorful, editorial planet cards refreshing every minute.
 */

// Per-body color themes (chip background + accent text)
const BODY_THEME: Record<string, { chip: string; ring: string; accent: string }> = {
  sun:     { chip: "bg-amber-400 text-amber-950",       ring: "ring-amber-300/60",   accent: "text-amber-600 dark:text-amber-400" },
  moon:    { chip: "bg-slate-200 text-slate-900",       ring: "ring-slate-300/60",   accent: "text-slate-500 dark:text-slate-300" },
  mercury: { chip: "bg-sky-400 text-sky-950",           ring: "ring-sky-300/60",     accent: "text-sky-600 dark:text-sky-400" },
  venus:   { chip: "bg-rose-300 text-rose-950",         ring: "ring-rose-300/60",    accent: "text-rose-600 dark:text-rose-400" },
  mars:    { chip: "bg-red-500 text-white",             ring: "ring-red-400/60",     accent: "text-red-600 dark:text-red-400" },
  jupiter: { chip: "bg-orange-400 text-orange-950",     ring: "ring-orange-300/60",  accent: "text-orange-600 dark:text-orange-400" },
  saturn:  { chip: "bg-stone-600 text-stone-50",        ring: "ring-stone-400/60",   accent: "text-stone-600 dark:text-stone-300" },
  uranus:  { chip: "bg-cyan-400 text-cyan-950",         ring: "ring-cyan-300/60",    accent: "text-cyan-600 dark:text-cyan-400" },
  neptune: { chip: "bg-indigo-500 text-white",          ring: "ring-indigo-400/60",  accent: "text-indigo-600 dark:text-indigo-400" },
  pluto:   { chip: "bg-zinc-800 text-zinc-50",          ring: "ring-zinc-500/60",    accent: "text-zinc-700 dark:text-zinc-300" },
  chiron:  { chip: "bg-emerald-500 text-emerald-950",   ring: "ring-emerald-300/60", accent: "text-emerald-600 dark:text-emerald-400" },
  northNode: { chip: "bg-violet-500 text-white",        ring: "ring-violet-400/60",  accent: "text-violet-600 dark:text-violet-400" },
};

// Elemental color system: Fire=red/orange, Earth=green, Air=yellow/gold, Water=blue
const SIGN_TINT: Record<string, string> = {
  // Fire
  Aries: "text-red-500", Leo: "text-orange-500", Sagittarius: "text-orange-600",
  // Earth
  Taurus: "text-emerald-600", Virgo: "text-green-600", Capricorn: "text-emerald-800",
  // Air
  Gemini: "text-yellow-500", Libra: "text-amber-500", Aquarius: "text-yellow-600",
  // Water
  Cancer: "text-sky-400", Scorpio: "text-blue-700", Pisces: "text-indigo-500",
};

const FALLBACK = { chip: "bg-primary/15 text-primary", ring: "ring-primary/40", accent: "text-primary" };

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
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  return (
    <section className="mb-6 rounded-lg border border-primary/20 bg-gradient-to-br from-secondary/60 via-background to-secondary/40 shadow-sm overflow-hidden">
      <header className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-primary/10 bg-background/50">
        <h3 className="font-serif text-base tracking-wide text-foreground">
          The Sky Right Now
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {stamp}
        </span>
      </header>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5 p-4">
        {entries.map(e => {
          const theme = BODY_THEME[e.key] ?? FALLBACK;
          const signColor = SIGN_TINT[e.sign] ?? "text-primary";
          return (
            <li
              key={e.key}
              className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/90 px-2.5 py-2.5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              title={`${e.label} ${e.degree}°${String(e.minutes).padStart(2, "0")}' ${e.sign}${e.retrograde ? " retrograde" : ""}`}
            >
              <span
                aria-hidden
                className={`flex-none w-10 h-10 flex items-center justify-center rounded-full ring-2 ${theme.chip} ${theme.ring} text-[22px] leading-none`}
                style={{ fontFamily: '"Apple Symbols","Segoe UI Symbol","Noto Sans Symbols2","DejaVu Sans",sans-serif' }}
              >
                {e.symbol}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.accent} truncate`}>
                    {e.label}
                  </span>
                  {e.retrograde && (
                    <span className="flex-none text-[9px] font-bold px-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      Rx
                    </span>
                  )}
                </div>
                <div className="tabular-nums text-sm font-serif text-foreground mt-0.5">
                  {e.degree}°{String(e.minutes).padStart(2, "0")}′
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-sm leading-none ${signColor}`}
                    style={{ fontFamily: '"Apple Symbols","Segoe UI Symbol","Noto Sans Symbols2","DejaVu Sans",sans-serif' }}
                    aria-hidden
                  >
                    {e.signSymbol}
                  </span>
                  <span className={`text-xs font-semibold ${signColor} truncate`}>
                    {e.sign}
                  </span>
                </div>
              </div>
            </li>

          );
        })}
      </ul>
    </section>
  );
}
