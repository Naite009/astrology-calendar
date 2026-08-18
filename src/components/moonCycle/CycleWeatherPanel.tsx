import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getSignLunationData } from "@/lib/signLunationData";
import { getSignPractice } from "@/data/signAsPractice";
import { formatLocalDateKey } from "@/lib/localDate";
import type { NatalChart } from "@/hooks/useNatalChart";
import {
  buildNewMoonCycle,
  getCurrentNewMoon,
  HOUSE_ARENA,
  PLANET_WEATHER,
  SIGN_GLYPHS,
} from "@/lib/newMoonCycles";

interface CycleWeatherPanelProps {
  chartId?: string;
  natalChart?: NatalChart | null;
  /** New Moon that opens the cycle being shown. Defaults to the live cycle. */
  newMoonDate?: Date;
}

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtLong(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export const CycleWeatherPanel = ({ chartId, natalChart, newMoonDate }: CycleWeatherPanelProps) => {
  const [journal, setJournal] = useState<{
    new_moon_intentions?: string | null;
    ai_suggested_intentions?: string | null;
    tarot_card_name?: string | null;
    tarot_ai_interpretation?: string | null;
  } | null>(null);

  const cycle = useMemo(
    () => buildNewMoonCycle(newMoonDate || getCurrentNewMoon(), natalChart),
    [newMoonDate?.getTime(), natalChart?.id],
  );

  const isLive = useMemo(() => {
    const now = Date.now();
    return now >= cycle.date.getTime() && now < cycle.nextNewMoon.getTime();
  }, [cycle]);

  useEffect(() => {
    setJournal(null);
    const load = async () => {
      const deviceId = localStorage.getItem("device_id") || "";
      if (!deviceId) return;
      let q = supabase
        .from("lunar_cycle_journals")
        .select("new_moon_intentions, ai_suggested_intentions, tarot_card_name, tarot_ai_interpretation")
        .eq("device_id", deviceId)
        .eq("cycle_start_date", formatLocalDateKey(cycle.date))
        .limit(1);
      if (chartId) q = q.eq("chart_id", chartId);
      const { data } = await q;
      if (data && data.length > 0) setJournal(data[0] as typeof journal);
    };
    load();
  }, [cycle.date, chartId]);

  const lunation = getSignLunationData(cycle.sign);
  const practice = getSignPractice(cycle.sign);

  return (
    <div className="space-y-4">
      <Card className="bg-background border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-medium">
              🌑 {isLive ? "This cycle's weather" : "Cycle weather"} · New Moon in {SIGN_GLYPHS[cycle.sign]} {cycle.sign} {cycle.degree}°
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isLive && (
                <Badge variant="outline" className="text-[10px]">
                  {cycle.date.getTime() > Date.now() ? "Upcoming" : "Past cycle"}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px]">
                {fmt(cycle.date)} to {fmt(cycle.nextNewMoon)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Exact New Moon: {fmtLong(cycle.date)}. This part is the same for everyone. It is the sky, not your
            journal. Your chart overlay, intentions and card pull sit underneath.
          </p>

          {lunation && (
            <div className="space-y-2">
              <p className="text-sm text-foreground/90 leading-relaxed">{lunation.overview}</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{lunation.seedGuidance}</p>
            </div>
          )}

          {/* Phase timeline */}
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              { label: "🌑 New Moon", point: { date: cycle.date, sign: cycle.sign, degree: cycle.degree }, note: "Plant it" },
              cycle.firstQuarter && { label: "🌓 First Quarter", point: cycle.firstQuarter, note: "First friction" },
              cycle.fullMoon && { label: "🌕 Full Moon", point: cycle.fullMoon, note: "It becomes visible" },
              cycle.lastQuarter && { label: "🌗 Last Quarter", point: cycle.lastQuarter, note: "Trim and release" },
            ]
              .filter(Boolean)
              .map((p: any) => (
                <div key={p.label} className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <p className="text-[11px] font-medium">{p.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {fmt(p.point.date)} · {p.point.sign} {p.point.degree}°
                  </p>
                  <p className="text-[11px] text-foreground/70 mt-1">{p.note}</p>
                </div>
              ))}
          </div>

          {/* Sky contacts to the New Moon */}
          {cycle.skyContacts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">What else the sky put on this New Moon</p>
              <ul className="space-y-1.5">
                {cycle.skyContacts.slice(0, 4).map((c) => (
                  <li key={c.planet} className="text-sm text-foreground/85 leading-relaxed">
                    <span className="font-mono text-xs text-muted-foreground mr-1">
                      (sky ☽ {cycle.sign} {c.symbol} sky {c.planet} {c.sign}, {c.orb}°)
                    </span>
                    {c.planet} {c.tone} this reset, so expect {PLANET_WEATHER[c.planet]} to show up in the story
                    of the month.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sign concentrations */}
          {cycle.concentrations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-primary">Where the sky is stacked</p>
              {cycle.concentrations.map((c) => (
                <p key={c.sign} className="text-sm text-foreground/85 leading-relaxed">
                  {c.bodies.length} bodies sit in {SIGN_GLYPHS[c.sign]} {c.sign} ({c.bodies.join(", ")}), so that
                  sign's way of doing things colors most of the month even where it does not touch your chart.
                </p>
              ))}
            </div>
          )}

          {lunation && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                <p className="text-[11px] uppercase tracking-wide text-success mb-1">When it goes right</p>
                <p className="text-sm text-foreground/85">{lunation.expressions.slice(0, 6).join(", ")}</p>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-[11px] uppercase tracking-wide text-destructive mb-1">When it goes wrong</p>
                <p className="text-sm text-foreground/85">{lunation.shadow.slice(0, 5).join(", ")}</p>
              </div>
            </div>
          )}

          {lunation?.themes && lunation.themes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">Themes of the month</p>
              {lunation.themes.map((t) => (
                <div key={t.title} className="rounded-lg bg-muted/30 p-2.5">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-sm text-foreground/80">{t.description}</p>
                </div>
              ))}
            </div>
          )}

          {practice && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Questions this cycle asks</p>
                <ul className="space-y-1">
                  {practice.prompts.slice(0, 3).map((p) => (
                    <li key={p} className="text-sm text-foreground/85">• {p}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Simple things to do</p>
                <p className="text-sm text-foreground/85">{practice.ritualIdeas.join(", ")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart overlay: how this lunation lands on the selected person */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            ⭐ How this New Moon lands in {natalChart?.name ? `${natalChart.name}'s chart` : "your chart"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!natalChart ? (
            <p className="text-sm text-muted-foreground">
              Pick a chart to see which house this New Moon lands in and which of your planets it touches.
            </p>
          ) : (
            <>
              {cycle.natalHouse ? (
                <p className="text-sm text-foreground/90 leading-relaxed">
                  It lands in house {cycle.natalHouse}, which runs {HOUSE_ARENA[cycle.natalHouse]}. That is the
                  area getting the clean slate this month, whether or not anything is written down.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  House cusps are missing for this chart, so the house of the New Moon cannot be placed yet.
                </p>
              )}

              {cycle.natalContacts.length > 0 ? (
                <ul className="space-y-1.5">
                  {cycle.natalContacts.slice(0, 5).map((c) => (
                    <li key={c.planet} className="text-sm text-foreground/85 leading-relaxed">
                      <span className="font-mono text-xs text-muted-foreground mr-1">
                        (t.☽ {cycle.sign} {c.symbol} n.{c.planet} {c.sign}
                        {c.house ? `, house ${c.house}` : ""}, {c.orb}°)
                      </span>
                      {c.hard
                        ? `Your ${c.planet} gets pushed rather than asked, so this month you will notice it as pressure to act, decide or drop something.`
                        : `Your ${c.planet} gets an easier line here, so support around it is available but you have to use it, it will not chase you.`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This lunation does not touch a major natal planet inside orb, so the month reads more as a
                  house-level reset than a personal jolt.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Personal layer: intentions + tarot */}
      <Card className="border-border bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">✨ Your layer on top of this cycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {journal?.new_moon_intentions ? (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary mb-1">Your intention</p>
              <p className="text-sm text-foreground/90 whitespace-pre-line">{journal.new_moon_intentions}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing written for this cycle. The sky reading above still works on its own, so you can compare
              cycles without any journal entries.
            </p>
          )}

          {journal?.ai_suggested_intentions && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Generated examples kept for this cycle</p>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{journal.ai_suggested_intentions}</p>
            </div>
          )}

          {journal?.tarot_card_name && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary mb-1">🃏 Card for this cycle</p>
              <p className="text-sm font-medium">{journal.tarot_card_name}</p>
              {journal.tarot_ai_interpretation && (
                <p className="text-sm text-foreground/80 whitespace-pre-line mt-1">
                  {journal.tarot_ai_interpretation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleWeatherPanel;
