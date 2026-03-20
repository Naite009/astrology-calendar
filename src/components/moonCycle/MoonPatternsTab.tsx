import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { NatalChart } from "@/hooks/useNatalChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MoonPatternsTabProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

interface JournalEntry {
  id: string;
  cycle_sign: string;
  cycle_start_date: string;
  mood: number | null;
  energy: number | null;
  clarity: number | null;
  stress: number | null;
  sleep_quality: number | null;
  communication_quality: number | null;
  intuition: number | null;
  productivity: number | null;
  dream_intensity: number | null;
  conflict_level: number | null;
  body_sensitivity: number | null;
  tags: string[] | null;
  moon_house: number | null;
}

const METRIC_LABELS: Record<string, string> = {
  mood: "Mood",
  energy: "Energy",
  clarity: "Clarity",
  stress: "Stress",
  sleep_quality: "Sleep",
  communication_quality: "Communication",
  intuition: "Intuition",
  productivity: "Productivity",
  dream_intensity: "Dreams",
  conflict_level: "Conflict",
  body_sensitivity: "Body Sensitivity",
};

const PHASE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(45, 80%, 55%)",
  "hsl(20, 70%, 50%)",
  "hsl(270, 50%, 60%)",
];

function getDeviceId(): string {
  return localStorage.getItem("device_id") || "";
}

export const MoonPatternsTab = ({ userNatalChart, savedCharts }: MoonPatternsTabProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("mood");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const deviceId = getDeviceId();
      if (!deviceId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("lunar_cycle_journals")
        .select(
          "id, cycle_sign, cycle_start_date, mood, energy, clarity, stress, sleep_quality, communication_quality, intuition, productivity, dream_intensity, conflict_level, body_sensitivity, tags, moon_house"
        )
        .eq("device_id", deviceId)
        .order("cycle_start_date", { ascending: false })
        .limit(100);

      if (!error && data) {
        setEntries(data as JournalEntry[]);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Average metric by sign
  const signAverages = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const e of entries) {
      const val = (e as any)[selectedMetric];
      if (val == null) continue;
      if (!map[e.cycle_sign]) map[e.cycle_sign] = { total: 0, count: 0 };
      map[e.cycle_sign].total += val;
      map[e.cycle_sign].count += 1;
    }
    return Object.entries(map)
      .map(([sign, { total, count }]) => ({
        sign,
        avg: Math.round((total / count) * 10) / 10,
        count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [entries, selectedMetric]);

  // Top tags
  const topTags = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      if (e.tags) {
        for (const t of e.tags) {
          map[t] = (map[t] || 0) + 1;
        }
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [entries]);

  // Insights
  const insights = useMemo(() => {
    const result: { title: string; text: string }[] = [];
    const hasEnough = entries.filter((e) => e.mood != null).length >= 3;

    if (hasEnough && signAverages.length > 0) {
      const best = signAverages[0];
      result.push({
        title: `Best ${METRIC_LABELS[selectedMetric]} Sign`,
        text: `${best.sign} cycles average ${best.avg}/10 for ${METRIC_LABELS[selectedMetric].toLowerCase()} (${best.count} entries).`,
      });
    }

    // Dream intensity by house
    const houseEntries = entries.filter((e) => e.moon_house != null && e.dream_intensity != null);
    if (houseEntries.length >= 3) {
      const houseMap: Record<number, { total: number; count: number }> = {};
      for (const e of houseEntries) {
        const h = e.moon_house!;
        if (!houseMap[h]) houseMap[h] = { total: 0, count: 0 };
        houseMap[h].total += e.dream_intensity!;
        houseMap[h].count += 1;
      }
      const sorted = Object.entries(houseMap).sort(
        (a, b) => b[1].total / b[1].count - a[1].total / a[1].count
      );
      if (sorted.length > 0) {
        const [house, { total, count }] = sorted[0];
        result.push({
          title: "Most Dream-Active House",
          text: `House ${house} averages ${(total / count).toFixed(1)}/10 dream intensity (${count} entries).`,
        });
      }
    }

    if (topTags.length > 0) {
      result.push({
        title: "Top Recurring Tags",
        text: topTags
          .slice(0, 5)
          .map(([tag, count]) => `${tag} (${count}×)`)
          .join(", "),
      });
    }

    return result;
  }, [entries, signAverages, selectedMetric, topTags]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading patterns…
      </div>
    );
  }

  const trackedCount = entries.filter((e) => e.mood != null).length;

  if (trackedCount < 3) {
    return (
      <Card className="bg-background border">
        <CardContent className="p-8 text-center">
          <p className="text-lg font-serif mb-2">🔮 Not Enough Data Yet</p>
          <p className="text-sm text-muted-foreground">
            Track your mood, energy, and other metrics in the <strong>Dashboard → ☽ Cycle Workbook</strong> for
            at least 3 cycles. Then come back here to discover your lunar patterns.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {trackedCount}/3 cycles tracked so far
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              selectedMetric === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bar Chart: Average by Sign */}
      {signAverages.length > 0 && (
        <Card className="bg-background border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average {METRIC_LABELS[selectedMetric]} by Moon Sign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={signAverages} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="sign" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number) => [`${v}/10`, METRIC_LABELS[selectedMetric]]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {signAverages.map((_, i) => (
                    <Cell key={i} fill={PHASE_COLORS[i % PHASE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Insight Cards */}
      {insights.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((ins, i) => (
            <Card key={i} className="bg-background border">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-primary mb-1">{ins.title}</p>
                <p className="text-sm text-foreground/90">{ins.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tag Cloud */}
      {topTags.length > 0 && (
        <Card className="bg-background border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag} <span className="ml-1 opacity-60">×{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Based on {trackedCount} tracked lunar cycles · {entries.length} total journal entries
      </p>
    </div>
  );
};
