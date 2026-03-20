import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LunarJournalEntry } from "@/hooks/useLunarJournal";
import { BarChart, TrendingUp, Layers } from "lucide-react";
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, Cell, Legend,
  BarChart as RechartsBarChart, Bar,
} from "recharts";

/* ── helpers ── */

const PHASE_ORDER = ["newMoon", "firstQuarter", "fullMoon", "lastQuarter", "balsamic"] as const;
const PHASE_LABELS: Record<string, string> = {
  newMoon: "New", firstQuarter: "1st Q", fullMoon: "Full",
  lastQuarter: "Last Q", balsamic: "Balsamic",
};

const ordinal = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

function detectPhase(j: LunarJournalEntry): string {
  if (j.balsamic_reflections || j.balsamic_dreams) return "balsamic";
  if (j.last_quarter_showing_up || j.last_quarter_letting_go) return "lastQuarter";
  if (j.full_moon_showing_up || j.full_moon_releasing) return "fullMoon";
  if (j.first_quarter_showing_up) return "firstQuarter";
  return "newMoon";
}

function extractMetric(j: LunarJournalEntry, metric: string): number | null {
  switch (metric) {
    case "energy": return j.energy ?? null;
    case "stress": return j.stress ?? null;
    case "sleep": return j.sleep_quality ?? null;
    case "sensitivity": return j.body_sensitivity ?? null;
    case "dreams": return j.dream_intensity ?? null;
    default: return null;
  }
}

/* ── types ── */

interface PatternsInsightsSectionProps {
  pastJournals: LunarJournalEntry[];
  currentJournal: LunarJournalEntry | null;
  cycleSign: string;
}

/* ── Heatmap data builder ── */

interface HeatCell {
  phase: string;
  phaseLabel: string;
  house: number;
  houseLabel: string;
  value: number;
  count: number;
}

function buildHeatmapData(journals: LunarJournalEntry[], metric: string): HeatCell[] {
  const buckets: Record<string, { total: number; count: number }> = {};

  for (const j of journals) {
    const house = j.moon_house;
    if (!house) continue;
    const phase = detectPhase(j);
    const val = extractMetric(j, metric);
    if (val === null) continue;
    const key = `${phase}-${house}`;
    if (!buckets[key]) buckets[key] = { total: 0, count: 0 };
    buckets[key].total += val;
    buckets[key].count += 1;
  }

  return Object.entries(buckets).map(([key, { total, count }]) => {
    const [phase, houseStr] = key.split("-");
    const house = parseInt(houseStr, 10);
    return {
      phase,
      phaseLabel: PHASE_LABELS[phase] || phase,
      house,
      houseLabel: `${ordinal(house)}`,
      value: Math.round((total / count) * 10) / 10,
      count,
    };
  });
}

/* ── Same-sign timeline data ── */

interface TimelineEntry {
  date: string;
  year: string;
  house: string;
  theme: string;
  intention: string;
  outcome: string;
}

function buildTimeline(journals: LunarJournalEntry[], sign: string): TimelineEntry[] {
  return journals
    .filter(j => j.cycle_sign === sign)
    .sort((a, b) => a.cycle_start_date.localeCompare(b.cycle_start_date))
    .map(j => ({
      date: new Date(j.cycle_start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      year: new Date(j.cycle_start_date).getFullYear().toString(),
      house: j.moon_house ? `${ordinal(j.moon_house)} House` : "—",
      theme: j.what_is_surfacing || j.new_moon_feelings || "—",
      intention: j.new_moon_intentions || "—",
      outcome: j.full_moon_showing_up || j.real_life_what_happened || j.cycle_wisdom || "—",
    }));
}

/* ── Cycle storyline data ── */

interface StorylinePoint {
  phase: string;
  phaseLabel: string;
  idx: number;
  surfaced: string;
  action: string;
  culmination: string;
  released: string;
  remained: string;
}

function buildStoryline(j: LunarJournalEntry | null): StorylinePoint[] {
  if (!j) return [];
  return [
    {
      phase: "balsamic", phaseLabel: "Listening", idx: 0,
      surfaced: j.balsamic_dreams || j.balsamic_morning_thoughts || "—",
      action: "", culmination: "", released: "", remained: "",
    },
    {
      phase: "newMoon", phaseLabel: "Seed", idx: 1,
      surfaced: j.what_is_surfacing || j.new_moon_feelings || "—",
      action: "", culmination: "", released: "", remained: "",
    },
    {
      phase: "firstQuarter", phaseLabel: "Action", idx: 2,
      surfaced: "", action: j.first_quarter_showing_up || j.first_quarter_adjustments || "—",
      culmination: "", released: "", remained: "",
    },
    {
      phase: "fullMoon", phaseLabel: "Reveal", idx: 3,
      surfaced: "", action: "",
      culmination: j.full_moon_showing_up || "—", released: "", remained: "",
    },
    {
      phase: "lastQuarter", phaseLabel: "Release", idx: 4,
      surfaced: "", action: "", culmination: "",
      released: j.last_quarter_letting_go || j.full_moon_releasing || "—",
      remained: j.cycle_wisdom || "—",
    },
  ];
}

/* ── color scale ── */

const HEAT_COLORS = [
  "hsl(var(--muted))",
  "hsl(220 60% 85%)",
  "hsl(220 65% 72%)",
  "hsl(220 70% 58%)",
  "hsl(220 75% 45%)",
];

function heatColor(val: number): string {
  if (val <= 2) return HEAT_COLORS[0];
  if (val <= 4) return HEAT_COLORS[1];
  if (val <= 6) return HEAT_COLORS[2];
  if (val <= 8) return HEAT_COLORS[3];
  return HEAT_COLORS[4];
}

/* ── component ── */

export const PatternsInsightsSection = ({
  pastJournals, currentJournal, cycleSign,
}: PatternsInsightsSectionProps) => {
  const [heatMetric, setHeatMetric] = useState("energy");
  const allJournals = useMemo(() => {
    const combined = [...pastJournals];
    if (currentJournal?.id) combined.push(currentJournal);
    return combined;
  }, [pastJournals, currentJournal]);

  const heatmapData = useMemo(() => buildHeatmapData(allJournals, heatMetric), [allJournals, heatMetric]);
  const timeline = useMemo(() => buildTimeline(allJournals, cycleSign), [allJournals, cycleSign]);
  const storyline = useMemo(() => buildStoryline(currentJournal), [currentJournal]);

  const hasEnoughData = allJournals.length >= 3;

  // Build bar chart data for heatmap alternative view
  const houseBarData = useMemo(() => {
    const grouped: Record<number, { total: number; count: number }> = {};
    for (const j of allJournals) {
      const h = j.moon_house;
      if (!h) continue;
      const v = extractMetric(j, heatMetric);
      if (v === null) continue;
      if (!grouped[h]) grouped[h] = { total: 0, count: 0 };
      grouped[h].total += v;
      grouped[h].count += 1;
    }
    return Object.entries(grouped)
      .map(([h, { total, count }]) => ({
        house: `${ordinal(parseInt(h))}`,
        avg: Math.round((total / count) * 10) / 10,
        entries: count,
      }))
      .sort((a, b) => parseInt(a.house) - parseInt(b.house));
  }, [allJournals, heatMetric]);

  // Strongest patterns insight
  const insights = useMemo(() => {
    if (!hasEnoughData) return [];
    const results: string[] = [];

    // Most activated house
    const houseCounts: Record<number, number> = {};
    for (const j of allJournals) {
      if (j.moon_house) houseCounts[j.moon_house] = (houseCounts[j.moon_house] || 0) + 1;
    }
    const topHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];
    if (topHouse) results.push(`Your ${ordinal(parseInt(topHouse[0]))} house is most frequently activated (${topHouse[1]} cycles).`);

    // Most common tags
    const tagCounts: Record<string, number> = {};
    for (const j of allJournals) {
      if (j.tags) for (const t of j.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (topTags.length > 0) results.push(`Recurring emotional tags: ${topTags.map(([t, c]) => `${t} (${c}×)`).join(", ")}.`);

    // Dream activity
    const dreamJournals = allJournals.filter(j => j.balsamic_dreams);
    if (dreamJournals.length >= 2) results.push(`Dream signals recorded in ${dreamJournals.length} of ${allJournals.length} cycles — your balsamic listening is active.`);

    // Surprise tracker
    const surprises = allJournals.filter(j => j.surprise_event);
    if (surprises.length >= 2) results.push(`Surprises tracked in ${surprises.length} cycles — keep following the unexpected.`);

    return results;
  }, [allJournals, hasEnoughData]);

  if (allJournals.length < 2 && !currentJournal?.id) {
    return (
      <Card className="border-border/20 bg-muted/10">
        <CardContent className="p-5 text-center space-y-2">
          <p className="text-sm text-muted-foreground">🔮 Patterns + Insights</p>
          <p className="text-xs text-muted-foreground italic leading-relaxed max-w-sm mx-auto">
            Complete 2–3 lunar cycles to begin seeing your patterns. Each cycle you journal adds depth to what the app can reflect back to you.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] ${
                allJournals.length >= i ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              }`}>{i}</div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">{allJournals.length} of 3 cycles journaled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Patterns + Insights
        </CardTitle>
        <p className="text-xs text-muted-foreground italic">
          {hasEnoughData
            ? "Patterns emerging from your lunar journal entries."
            : `${3 - allJournals.length} more cycle${3 - allJournals.length === 1 ? "" : "s"} until full pattern detection.`}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="storyline" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="storyline" className="text-[10px]">
              <Layers className="h-3 w-3 mr-1" /> Cycle Story
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-[10px]">
              <BarChart className="h-3 w-3 mr-1" /> House Patterns
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-[10px]">
              <TrendingUp className="h-3 w-3 mr-1" /> {cycleSign} Timeline
            </TabsTrigger>
          </TabsList>

          {/* ── Cycle Storyline ── */}
          <TabsContent value="storyline">
            <div className="space-y-1">
              {storyline.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">Start journaling this cycle to see your storyline unfold.</p>
              ) : (
                storyline.map((pt, i) => {
                  const content = pt.surfaced || pt.action || pt.culmination || pt.released || "";
                  const isEmpty = content === "—" || !content;
                  return (
                    <div key={pt.phase} className="flex gap-3 items-start">
                      {/* vertical connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          isEmpty ? "bg-border" : "bg-primary"
                        }`} />
                        {i < storyline.length - 1 && (
                          <div className="w-px h-full min-h-[32px] bg-border/50" />
                        )}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground">{pt.phaseLabel}</p>
                        {!isEmpty && (
                          <p className="text-[11px] text-foreground/60 leading-relaxed line-clamp-2 mt-0.5">{content}</p>
                        )}
                        {isEmpty && (
                          <p className="text-[10px] text-muted-foreground italic mt-0.5">Not yet recorded</p>
                        )}
                        {pt.remained && pt.remained !== "—" && (
                          <p className="text-[10px] text-primary/70 italic mt-0.5">Carrying forward: {pt.remained}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* ── House Patterns (Heatmap / Bar) ── */}
          <TabsContent value="heatmap">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Metric:</span>
                {["energy", "stress", "sleep", "sensitivity", "dreams"].map(m => (
                  <button
                    key={m}
                    onClick={() => setHeatMetric(m)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border capitalize transition-all ${
                      heatMetric === m
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {houseBarData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={houseBarData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="house" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        formatter={(value: number, name: string) => [`${value}/10`, `Avg ${heatMetric}`]}
                        labelFormatter={(label) => `${label} House`}
                      />
                      <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={32}>
                        {houseBarData.map((entry, i) => (
                          <Cell key={i} fill={heatColor(entry.avg)} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-8">
                  Not enough data yet. Track body metrics across cycles to see house patterns.
                </p>
              )}

              {/* Scatter heatmap view */}
              {heatmapData.length > 4 && (
                <div className="h-[180px] mt-2">
                  <p className="text-[10px] text-muted-foreground mb-2">Phase × House detail</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="phaseLabel"
                        type="category"
                        allowDuplicatedCategory={false}
                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        dataKey="house"
                        type="number"
                        domain={[1, 12]}
                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => ordinal(v)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        formatter={(value: number) => [`${value}/10`, `Avg ${heatMetric}`]}
                      />
                      <Scatter data={heatmapData} dataKey="value">
                        {heatmapData.map((entry, i) => (
                          <Cell key={i} fill={heatColor(entry.value)} r={Math.max(6, entry.count * 4)} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Same-Sign Timeline ── */}
          <TabsContent value="timeline">
            {timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-8">
                No past {cycleSign} New Moons journaled yet. This timeline builds over years.
              </p>
            ) : (
              <div className="space-y-2">
                {timeline.map((entry, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                      {i < timeline.length - 1 && <div className="w-px h-full min-h-[40px] bg-border/40" />}
                    </div>
                    <div className="pb-3 flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-foreground">{entry.date}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{entry.house}</Badge>
                      </div>
                      {entry.theme !== "—" && (
                        <p className="text-[11px] text-foreground/60 line-clamp-2">
                          <span className="text-muted-foreground font-medium">Theme: </span>{entry.theme}
                        </p>
                      )}
                      {entry.intention !== "—" && (
                        <p className="text-[11px] text-foreground/60 line-clamp-1 italic">
                          <span className="text-muted-foreground font-medium not-italic">Intention: </span>"{entry.intention}"
                        </p>
                      )}
                      {entry.outcome !== "—" && (
                        <p className="text-[11px] text-foreground/60 line-clamp-2">
                          <span className="text-muted-foreground font-medium">Outcome: </span>{entry.outcome}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Generated Insights ── */}
        {insights.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/15 space-y-2">
            <p className="text-[11px] font-medium text-primary flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> Pattern Insights ({allJournals.length} cycles)
            </p>
            {insights.map((ins, i) => (
              <p key={i} className="text-[11px] text-foreground/60 leading-relaxed flex items-start gap-1.5">
                <span className="text-primary/50 mt-0.5 flex-shrink-0">›</span>{ins}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
