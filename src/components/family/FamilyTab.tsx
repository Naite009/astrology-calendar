import { useEffect, useState, useMemo, Fragment } from "react";
import { Users, Plus, Trash2, ArrowRight, ArrowLeftRight, Heart, Sparkles, Loader2, Home, History, RotateCw, Download, Star, Cloud, Trophy, Zap, Brain, Activity, Compass, Thermometer } from "lucide-react";

function downloadJson(data: unknown, filename: string) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/[^a-z0-9._-]+/gi, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("download failed", e);
  }
}

function ordinalShort(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// --- UX helpers for the human-centric Family at a Glance refactor ---
const SIGN_ORDER = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];
const SIGN_ELEMENT: Record<string, "fire"|"earth"|"air"|"water"> = {
  Aries:"fire", Leo:"fire", Sagittarius:"fire",
  Taurus:"earth", Virgo:"earth", Capricorn:"earth",
  Gemini:"air", Libra:"air", Aquarius:"air",
  Cancer:"water", Scorpio:"water", Pisces:"water",
};
function planetLongitude(p?: { sign: string; degree: number; minutes: number; seconds?: number }): number | null {
  if (!p) return null;
  const i = SIGN_ORDER.indexOf(p.sign);
  if (i < 0) return null;
  return i * 30 + (p.degree || 0) + (p.minutes || 0) / 60 + ((p.seconds || 0) / 3600);
}
function moonPhaseLabel(sunLon: number, moonLon: number): string {
  const a = (((moonLon - sunLon) % 360) + 360) % 360;
  if (a < 45) return "New";
  if (a < 90) return "Crescent";
  if (a < 135) return "First Quarter";
  if (a < 180) return "Gibbous";
  if (a < 225) return "Full";
  if (a < 270) return "Disseminating";
  if (a < 315) return "Last Quarter";
  return "Balsamic";
}
type DoDont = { dont: string; doThis: string };
function marsDoDont(marsSign?: string): DoDont {
  const el = marsSign ? SIGN_ELEMENT[marsSign] : undefined;
  switch (el) {
    case "fire":
      return { dont: "Don't ask 'Why?' or pile on words mid-meltdown.", doThis: "Do offer a physical task: a walk, water, a quick errand." };
    case "water":
      return { dont: "Don't rush them out of the feeling or fix it fast.", doThis: "Do sit close, lower your voice, name the feeling out loud." };
    case "air":
      return { dont: "Don't grab, restrain, or escalate physically.", doThis: "Do let them talk it through; give them words to choose from." };
    case "earth":
      return { dont: "Don't surprise them or change the plan on the fly.", doThis: "Do offer something concrete: food, a chore, a clear next step." };
    default:
      return { dont: "Don't try to logic them out of it in the moment.", doThis: "Do slow down and offer one simple, doable next step." };
  }
}
const PROFECTION_MISSION: Record<number, string> = {
  1: "Reclaiming Self",
  2: "Building Security",
  3: "Daily Communication",
  4: "Tending Home & Family",
  5: "Creative Expression",
  6: "Resetting Routines",
  7: "Deepening Partnership",
  8: "Transformation & Trust",
  9: "Expanding Vision",
  10: "Public Calling",
  11: "Community & Future",
  12: "Rest & Reflection",
};
import { NatalChart } from "@/hooks/useNatalChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChartSelector } from "@/components/ChartSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  computeFamilySynastry,
  FAMILY_ROLE_OPTIONS,
  FamilyRole,
  buildPairReadingPayload,
  PairReadingResponse,
  buildChildMoonProfile,
  ChildMoonProfile,
  buildMoonBridge,
  MoonBridge,
  buildContractOverlap,
  ContractOverlapFlag,
} from "@/lib/parentChildSynastry";
import {
  buildFamilySystem,
  buildFamilySystemPayload,
  FamilySystemReadingResponse,
  buildPressurePatternsForGroup,
  buildRespondsBestForGroup,
  buildRespondsBestProfileForGroup,
  buildHouseholdResetLine,
  buildFamilyWeb,
  computeSiblingResetMode,
  marsHouseCategory,
} from "@/lib/familySystemSynastry";
import { migrateFamilySystemReading } from "@/lib/familySystemMigration";
import { ChildPortraitCard } from "./ChildPortrait";

/**
 * Renders one pair (parent↔child or sibling↔sibling) with the role-aware
 * 3-perspective composite block plus per-person bridge and friction lines.
 * Tolerant of legacy cached readings: a legacy plain-string composite/bridge/
 * friction is treated as the "shared" or "aspect" line, with no per-person
 * sub-lines invented.
 */
function PairBlock({
  title,
  nameA,
  nameB,
  composite,
  bridge,
  friction,
  interactionPattern,
  dynamic,
  whatCanFeelHard,
  whatHelps,
  patternType,
  note,
  legacyBody,
}: {
  title: string;
  nameA: string;
  nameB: string;
  composite?: any;
  bridge?: any;
  friction?: any;
  interactionPattern?: any;
  dynamic?: string | null;
  whatCanFeelHard?: string | null;
  whatHelps?: string | null;
  patternType?: string | null;
  note?: string | null;
  legacyBody?: string;
}) {
  const compShared =
    typeof composite === "string"
      ? composite
      : composite && typeof composite === "object"
      ? composite.shared
      : null;
  const compForA = composite && typeof composite === "object" ? composite.feelsLikeForA : null;
  const compForB = composite && typeof composite === "object" ? composite.feelsLikeForB : null;

  const bridgeAspect =
    typeof bridge === "string" ? bridge : bridge && typeof bridge === "object" ? bridge.aspect : null;
  const bridgeForA = bridge && typeof bridge === "object" ? bridge.forA : null;
  const bridgeForB = bridge && typeof bridge === "object" ? bridge.forB : null;

  const frictionAspect =
    typeof friction === "string"
      ? friction
      : friction && typeof friction === "object"
      ? friction.aspect
      : null;
  const frictionForA = friction && typeof friction === "object" ? friction.forA : null;
  const frictionForB = friction && typeof friction === "object" ? friction.forB : null;

  const ipForA =
    interactionPattern && typeof interactionPattern === "object" ? interactionPattern.forA : null;
  const ipForB =
    interactionPattern && typeof interactionPattern === "object" ? interactionPattern.forB : null;
  const ipWhy =
    interactionPattern && typeof interactionPattern === "object" ? interactionPattern.why : null;
  const hasInteractionPattern = !!(ipForA || ipForB || ipWhy);

  // Legacy "no tight aspects" filler is deprecated and should never render.
  const DEAD_NOTE_RE = /no tight aspects|no significant connection|no meaningful aspects|limited connection/i;
  const safeNote = note && !DEAD_NOTE_RE.test(note) ? note : null;

  // STRUCTURED RANGE FORMAT: the `dynamic` field IS the entire pair output.
  // We deliberately do NOT render "The Dynamic" / "What Helps" / "What Can Feel Hard" /
  // "Why" / interactionPattern / composite / bridge / friction sub-blocks anymore.
  // Everything the user needs (Shared Pattern + At its best / More commonly / Under stress
  // + Where connection can happen) lives inside `dynamic` as plain pre-line text.
  const rangeBlock = dynamic && dynamic.trim().length > 0 ? dynamic : null;
  if (!rangeBlock) return null;

  // Validate the three required expression levels are present. If any is missing,
  // we fall back to legacy fields so the user still sees SOMETHING, but flag it.
  const hasAllThreeLevels =
    !!rangeBlock &&
    /at its best/i.test(rangeBlock) &&
    /more commonly/i.test(rangeBlock) &&
    /under stress/i.test(rangeBlock);

  return (
    <div className="border-l-2 border-primary/40 pl-3 space-y-2">
      <div className="font-semibold flex items-center gap-2 flex-wrap">
        <span>{title}</span>
        {patternType && (
          <Badge variant="outline" className="text-[10px] capitalize font-normal">
            {patternType}
          </Badge>
        )}
      </div>

      {rangeBlock && (
        <div>
          <p className="whitespace-pre-line leading-relaxed">{rangeBlock}</p>
          {!hasAllThreeLevels && (
            <p className="text-xs italic text-muted-foreground mt-2">
              This reading is missing one or more expression levels (At its best / More commonly / Under stress). Regenerate for a complete range.
            </p>
          )}
        </div>
      )}

    </div>
  );
}

interface FamilyMember {
  id: string;
  member_chart_id: string;
  member_name: string;
  role: FamilyRole;
  notes: string | null;
}

interface FamilyTabProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const FamilyTab = ({ userNatalChart, savedCharts }: FamilyTabProps) => {
  const { user } = useAuth();
  const allCharts = useMemo(
    () => [...(userNatalChart ? [userNatalChart] : []), ...savedCharts],
    [userNatalChart, savedCharts],
  );

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Add-member form
  const [newChartId, setNewChartId] = useState<string>("");
  const [newRole, setNewRole] = useState<FamilyRole>("child");

  // Pair selector
  const [fromChartId, setFromChartId] = useState<string>("");
  const [toChartId, setToChartId] = useState<string>("");
  const [fromRole, setFromRole] = useState<FamilyRole>("parent");
  const [toRole, setToRole] = useState<FamilyRole>("child");

  // Load family members
  useEffect(() => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("family_relationships")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        console.error("[FamilyTab] load failed", error);
        toast.error("Could not load family members");
      } else {
        setMembers((data ?? []) as FamilyMember[]);
      }
      setLoading(false);
    })();
  }, [user]);

  const addMember = async () => {
    if (!user) {
      toast.error("Sign in to save family members");
      return;
    }
    if (!newChartId) {
      toast.error("Pick a chart first");
      return;
    }
    const chart = allCharts.find(c => c.id === newChartId);
    if (!chart) return;
    if (members.some(m => m.member_chart_id === newChartId && m.role === newRole)) {
      toast.error("That chart is already added with that role");
      return;
    }
    const { data, error } = await supabase
      .from("family_relationships")
      .insert({
        user_id: user.id,
        member_chart_id: newChartId,
        member_name: chart.name,
        role: newRole,
      })
      .select()
      .single();
    if (error) {
      toast.error("Could not save");
      console.error(error);
      return;
    }
    setMembers(prev => [...prev, data as FamilyMember]);
    setNewChartId("");
    toast.success(`Added ${chart.name}`);
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from("family_relationships").delete().eq("id", id);
    if (error) {
      toast.error("Could not remove");
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const swap = () => {
    setFromChartId(toChartId);
    setToChartId(fromChartId);
    setFromRole(toRole);
    setToRole(fromRole);
  };

  const fromChart = allCharts.find(c => c.id === fromChartId);
  const toChart = allCharts.find(c => c.id === toChartId);
  const report = useMemo(() => {
    if (!fromChart || !toChart || fromChart.id === toChart.id) return null;
    return computeFamilySynastry(fromChart, toChart, fromRole, toRole);
  }, [fromChart, toChart, fromRole, toRole]);

  const [aiReading, setAiReading] = useState<PairReadingResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // ─── Saved readings history ───────────────────────────────────────────────
  type SavedReading = {
    id: string;
    reading_type: "pair" | "system";
    cache_key: string;
    label: string;
    payload: any;
    created_at: string;
  };
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);

  const pairCacheKey = (fId: string, fR: string, tId: string, tR: string) =>
    `${fId}:${fR}>${tId}:${tR}`;
  const systemCacheKey = (sel: { chart: NatalChart; role: FamilyRole }[]) =>
    `system-pipeline-v13-polish:${sel
      .map((s) => `${s.chart.id}:${s.role}`)
      .sort()
      .join("|")}`;

  // Load saved readings
  useEffect(() => {
    if (!user) {
      setSavedReadings([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("family_readings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[FamilyTab] load saved readings failed", error);
        return;
      }
      setSavedReadings((data ?? []) as SavedReading[]);
    })();
  }, [user]);

  const saveReading = async (
    reading_type: "pair" | "system",
    cache_key: string,
    label: string,
    payload: any,
  ) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("family_readings")
      .upsert(
        { user_id: user.id, reading_type, cache_key, label, payload },
        { onConflict: "user_id,reading_type,cache_key" },
      )
      .select()
      .single();
    if (error) {
      console.error("[FamilyTab] save reading failed", error);
      return;
    }
    setSavedReadings((prev) => {
      const filtered = prev.filter(
        (r) => !(r.reading_type === reading_type && r.cache_key === cache_key),
      );
      return [data as SavedReading, ...filtered];
    });
  };

  const deleteSavedReading = async (id: string) => {
    const { error } = await supabase.from("family_readings").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete");
      return;
    }
    setSavedReadings((prev) => prev.filter((r) => r.id !== id));
    toast.success("Removed from history");
  };

  const loadSavedReading = (r: SavedReading) => {
    if (r.reading_type === "pair") {
      // cache_key: `${fId}:${fR}>${tId}:${tR}`
      const m = r.cache_key.match(/^([^:]+):([^>]+)>([^:]+):(.+)$/);
      if (!m) {
        toast.error("Could not load this reading");
        return;
      }
      const [, fId, fR, tId, tR] = m;
      setFromChartId(fId);
      setFromRole(fR as FamilyRole);
      setToChartId(tId);
      setToRole(tR as FamilyRole);
      // auto-restore effect will populate aiReading
      toast.success("Loaded from history");
      return;
    }
    // system: pieces joined by `|`, each `chartId:role`
    const pieces = r.cache_key.split("|");
    const ids = new Set<string>();
    for (const piece of pieces) {
      const idx = piece.lastIndexOf(":");
      if (idx < 0) continue;
      const chartId = piece.slice(0, idx);
      const role = piece.slice(idx + 1);
      const member = members.find(
        (mm) => mm.member_chart_id === chartId && mm.role === role,
      );
      if (member) ids.add(member.id);
    }
    if (ids.size < 2) {
      toast.error("Some family members are missing from your list");
      return;
    }
    setSelectedIds(ids);
    toast.success("Loaded from history");
  };

  // Auto-restore pair reading if a saved one matches the current selection
  useEffect(() => {
    if (!fromChartId || !toChartId || fromChartId === toChartId) {
      setAiReading(null);
      return;
    }
    const key = pairCacheKey(fromChartId, fromRole, toChartId, toRole);
    const found = savedReadings.find(
      (r) => r.reading_type === "pair" && r.cache_key === key,
    );
    setAiReading(found ? (found.payload as PairReadingResponse) : null);
  }, [fromChartId, toChartId, fromRole, toRole, savedReadings]);

  const generateAiReading = async (force = false) => {
    if (!fromChart || !toChart || !report) return;
    if (report.rows.length === 0) {
      toast.error("No significant cross-aspects found between these two charts.");
      return;
    }
    const key = pairCacheKey(fromChartId, fromRole, toChartId, toRole);
    if (!force) {
      const cached = savedReadings.find(
        (r) => r.reading_type === "pair" && r.cache_key === key,
      );
      if (cached) {
        setAiReading(cached.payload as PairReadingResponse);
        toast.success("Loaded from history");
        return;
      }
    }
    setAiLoading(true);
    setAiReading(null);
    try {
      const payload = buildPairReadingPayload(fromChart, toChart, fromRole, toRole, report);
      const { data, error } = await supabase.functions.invoke("family-pair-reading", { body: payload });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiReading(data as PairReadingResponse);
      const label = `${report.fromName} (${fromRole}) → ${report.toName} (${toRole})`;
      await saveReading("pair", key, label, data);
    } catch (e: any) {
      console.error("[FamilyTab] AI reading failed", e);
      toast.error(e?.message || "Could not generate reading. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Family System Reading (multi-select) ────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [systemReading, setSystemReading] = useState<FamilySystemReadingResponse | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(members.map((m) => m.id)));
  };
  const clearSelected = () => {
    setSelectedIds(new Set());
    setSystemReading(null);
  };

  const selectedMembers = useMemo(() => {
    return members
      .filter((m) => selectedIds.has(m.id))
      .map((m) => {
        const chart = allCharts.find((c) => c.id === m.member_chart_id);
        return chart ? { chart, role: m.role } : null;
      })
      .filter((x): x is { chart: NatalChart; role: FamilyRole } => !!x);
  }, [members, selectedIds, allCharts]);

  // Auto-restore system reading if a saved one matches current selection
  useEffect(() => {
    if (selectedMembers.length < 2) {
      setSystemReading(null);
      return;
    }
    const key = systemCacheKey(selectedMembers);
    const found = savedReadings.find(
      (r) => r.reading_type === "system" && r.cache_key === key,
    );
    setSystemReading(found ? migrateFamilySystemReading(found.payload) : null);
  }, [selectedMembers, savedReadings]);

  const generateSystemReading = async (force = false) => {
    if (selectedMembers.length < 2) {
      toast.error("Select at least 2 family members first.");
      return;
    }
    const key = systemCacheKey(selectedMembers);
    if (!force) {
      const cached = savedReadings.find(
        (r) => r.reading_type === "system" && r.cache_key === key,
      );
      if (cached) {
        setSystemReading(migrateFamilySystemReading(cached.payload));
        toast.success("Loaded from history");
        return;
      }
    }
    const data = buildFamilySystem(selectedMembers);
    if (!data) {
      toast.error("Could not build family system data.");
      return;
    }
    setSystemLoading(true);
    setSystemReading(null);
    try {
      const payload = buildFamilySystemPayload(selectedMembers, data);
      const { data: resp, error } = await supabase.functions.invoke(
        "family-system-reading",
        { body: payload },
      );
      if (error) throw error;
      if ((resp as any)?.error) throw new Error((resp as any).error);
      const migrated = migrateFamilySystemReading(resp);
      setSystemReading(migrated);
      const label = selectedMembers.map((s) => s.chart.name).join(", ");
      await saveReading("system", key, label, migrated);
    } catch (e: any) {
      console.error("[FamilyTab] system reading failed", e);
      toast.error(e?.message || "Could not generate family reading. Please try again.");
    } finally {
      setSystemLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Sign in to use the Family tab.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Family
          </CardTitle>
          <CardDescription>
            Add charts you've saved as family members. Each entry is private to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-muted-foreground">No family members yet.</div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <div className="text-muted-foreground">
                  Check the people you want included in the integrated reading.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-primary hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearSelected}
                    className="text-muted-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {members.map(m => (
                  <li key={m.id} className="flex items-center gap-3 py-2">
                    <Checkbox
                      checked={selectedIds.has(m.id)}
                      onCheckedChange={() => toggleSelected(m.id)}
                      aria-label={`Select ${m.member_name}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{m.member_name}</div>
                      <Badge variant="secondary" className="mt-1 capitalize">{m.role}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(m.id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border flex-wrap">
                <div className="text-sm text-muted-foreground">
                  {selectedIds.size} of {members.length} selected
                  {selectedIds.size > 0 && selectedIds.size < 2 && (
                    <span className="ml-2 text-amber-600">(pick at least 2)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {systemReading && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        downloadJson(
                          systemReading,
                          `family-reading-${selectedMembers.map((s) => s.chart.name).join("-") || "system"}.json`,
                        )
                      }
                      title="Download reading as JSON"
                    >
                      <Download className="h-4 w-4 mr-1" /> Download JSON
                    </Button>
                  )}
                  {systemReading && (
                    <Button
                      variant="outline"
                      onClick={() => generateSystemReading(true)}
                      disabled={systemLoading || selectedIds.size < 2}
                      title="Generate a fresh reading"
                    >
                      <RotateCw className="h-4 w-4 mr-1" /> Regenerate
                    </Button>
                  )}
                  <Button
                    onClick={() => generateSystemReading(false)}
                    disabled={systemLoading || selectedIds.size < 2}
                  >
                    {systemLoading ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Reading…</>
                    ) : (
                      <><Home className="h-4 w-4 mr-1" /> {systemReading ? "View Reading" : "Generate Family Reading"}</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="grid gap-2 md:grid-cols-[1fr_180px_auto] items-end pt-3 border-t border-border">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Chart</div>
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={newChartId}
                onSelect={setNewChartId}
              />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Role</div>
              <Select value={newRole} onValueChange={v => setNewRole(v as FamilyRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FAMILY_ROLE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addMember}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {savedReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Reading History
            </CardTitle>
            <CardDescription>
              Past readings are saved automatically so you don't have to regenerate the same one. Tap any reading to view it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {savedReadings.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => loadSavedReading(r)}
                    className="flex-1 min-w-0 text-left hover:bg-muted/40 -mx-2 px-2 py-1 rounded"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={r.reading_type === "system" ? "default" : "secondary"} className="capitalize">
                        {r.reading_type === "system" ? "Family" : "Pair"}
                      </Badge>
                      <span className="font-medium truncate">{r.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSavedReading(r.id)}
                    aria-label="Delete saved reading"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {systemReading && (
        <FamilySystemReadingView reading={systemReading} members={selectedMembers} />
      )}


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Zoom in: One-on-One Reading
          </CardTitle>
          <CardDescription>
            Want to dig into a single relationship? Pick whose energy is the source (FROM) and whose nervous system is receiving (TO).
            Direction matters: a parent's Mars onto a child's Moon is a different reading than the reverse.
            Readings use the actual signs, houses, and the child's age.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_140px_auto_1fr_140px] items-end">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">From</div>
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={fromChartId}
                onSelect={setFromChartId}
              />
            </div>
            <Select value={fromRole} onValueChange={v => setFromRole(v as FamilyRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FAMILY_ROLE_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={swap} aria-label="Swap" title="Swap from/to">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">To</div>
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={toChartId}
                onSelect={setToChartId}
              />
            </div>
            <Select value={toRole} onValueChange={v => setToRole(v as FamilyRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FAMILY_ROLE_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {report && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border flex-wrap">
              <div className="text-xs text-muted-foreground">
                {report.rows.length} cross-aspect{report.rows.length === 1 ? "" : "s"} found between{" "}
                {report.fromName} and {report.toName}.
              </div>
              <div className="flex gap-2">
                {aiReading && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadJson(aiReading, `pair-reading-${report.fromName}-to-${report.toName}.json`)
                    }
                    title="Download reading as JSON"
                  >
                    <Download className="h-4 w-4 mr-1" /> Download JSON
                  </Button>
                )}
                {aiReading && (
                  <Button
                    variant="outline"
                    onClick={() => generateAiReading(true)}
                    disabled={aiLoading || report.rows.length === 0}
                    title="Generate a fresh reading"
                  >
                    <RotateCw className="h-4 w-4 mr-1" /> Regenerate
                  </Button>
                )}
                <Button onClick={() => generateAiReading(false)} disabled={aiLoading || report.rows.length === 0}>
                  {aiLoading ? (
                    <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Reading…</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-1" /> {aiReading ? "View Reading" : "Generate Reading"}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(() => {
        const familyByChartId = new Map(members.map((m) => [m.member_chart_id, m.role as FamilyRole]));
        const everyone = allCharts.map((chart) => ({
          chart,
          role: (familyByChartId.get(chart.id) ?? "self") as FamilyRole,
        }));
        return everyone.length > 0 ? (
          <ChildPortraitCard members={everyone} />
        ) : null;
      })()}





      {aiReading && report && (
        <AiPairReadingView
          reading={aiReading}
          fromName={report.fromName}
          toName={report.toName}
          fromRole={report.fromRole}
          toRole={report.toRole}
          childMoonProfile={toRole === "child" && toChart ? buildChildMoonProfile(toChart) : null}
          moonBridge={toRole === "child" && fromChart && toChart && report ? buildMoonBridge(fromChart, toChart, report.rows) : null}
          contractOverlapFlags={toRole === "child" && fromChart && toChart ? buildContractOverlap(fromChart, toChart).flags : []}
        />
      )}
    </div>
  );
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const AiPairReadingView = ({
  reading,
  fromName,
  toName,
  fromRole,
  toRole,
  childMoonProfile,
  moonBridge,
  contractOverlapFlags,
}: {
  reading: PairReadingResponse;
  fromName: string;
  toName: string;
  fromRole: FamilyRole;
  toRole: FamilyRole;
  childMoonProfile?: ChildMoonProfile | null;
  moonBridge?: MoonBridge | null;
  contractOverlapFlags?: ContractOverlapFlag[];
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>The Essence</CardTitle>
          <CardDescription>
            How {fromName} ({fromRole}) lands on {toName} ({toRole})
            {reading.ageYears != null ? ` — age ${reading.ageYears}` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm">
            {reading.essence.map((l, i) => (
              <li key={i} className="flex gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
          {reading.ageNote && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
              {reading.ageNote}
            </p>
          )}
        </CardContent>
      </Card>

      {reading.soulContract && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Soul Contract
              </CardTitle>
              <Badge variant="outline">{fromName} &amp; {toName}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm pt-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Why These Two
              </div>
              <p>{reading.soulContract.whyTheseTwo}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What {toName} Came to Learn
              </div>
              <p>{reading.soulContract.childLesson}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What You Came to Learn
              </div>
              <p>{reading.soulContract.parentLesson}</p>
            </div>
            <p className="text-base font-semibold border-t border-border pt-3">
              {reading.soulContract.contractSentence}
            </p>
          </CardContent>
        </Card>
      )}

      {moonBridge && reading.moonBridge && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">How Your Emotional Languages Meet</CardTitle>
              <Badge
                variant="outline"
                className={
                  moonBridge.connectionType === "bridge"
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                    : moonBridge.connectionType === "gap"
                    ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                    : "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30"
                }
              >
                {moonBridge.connectionType === "bridge"
                  ? "Bridge"
                  : moonBridge.connectionType === "gap"
                  ? "Gap"
                  : "Mirror"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {fromName}'s Moon
                </div>
                <p className="text-sm">{moonBridge.parentMoonLabel}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {toName}'s Moon
                </div>
                <p className="text-sm">{moonBridge.childMoonLabel}</p>
              </div>
            </div>
            <p>{reading.moonBridge.summary}</p>
            <p className="italic text-muted-foreground border-l-2 border-primary/40 pl-3">
              {reading.moonBridge.translation}
            </p>
          </CardContent>
        </Card>
      )}

      {reading.pressureProfile &&
        (reading.pressureProfile.plainEnglish?.trim() ||
          reading.pressureProfile.whatHelps?.length > 0) && (
          <Card className="border-amber-500/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {reading.pressureProfile.title || "How This Child Handles Pressure"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {reading.pressureProfile.astrology?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Astrology
                  </div>
                  <p className="text-muted-foreground">{reading.pressureProfile.astrology}</p>
                </div>
              )}
              {reading.pressureProfile.plainEnglish?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Plain English
                  </div>
                  <p>{reading.pressureProfile.plainEnglish}</p>
                </div>
              )}
              {reading.pressureProfile.whatTheParentMayNotice?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What the parent may notice
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.pressureProfile.whatTheParentMayNotice.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reading.pressureProfile.safetyNeeds && reading.pressureProfile.safetyNeeds.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What this child needs to feel safe
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.pressureProfile.safetyNeeds.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reading.pressureProfile.whatHelps?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What helps in the moment
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.pressureProfile.whatHelps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reading.pressureProfile.whatMakesItWorse && reading.pressureProfile.whatMakesItWorse.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What makes it worse (avoid)
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.pressureProfile.whatMakesItWorse.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {reading.perceptionTranslation &&
        (reading.perceptionTranslation.misread?.trim() ||
          reading.perceptionTranslation.underneath?.trim() ||
          reading.perceptionTranslation.whatHelps?.length > 0) && (
          <Card className="border-rose-500/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {reading.perceptionTranslation.title || "What May Be Happening Underneath"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {reading.perceptionTranslation.misread?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What it may look like
                  </div>
                  <p>{reading.perceptionTranslation.misread}</p>
                </div>
              )}
              {reading.perceptionTranslation.underneath?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What may actually be happening
                  </div>
                  <p>{reading.perceptionTranslation.underneath}</p>
                </div>
              )}
              {reading.perceptionTranslation.whatHelps?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What helps
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.perceptionTranslation.whatHelps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {reading.connectionMisfire &&
        (reading.connectionMisfire.framing?.trim() ||
          reading.connectionMisfire.parentIntent?.trim() ||
          reading.connectionMisfire.childExperience?.trim() ||
          reading.connectionMisfire.childProtection?.trim() ||
          reading.connectionMisfire.whatHelpsInTheMoment?.length > 0) && (
          <Card className="border-amber-500/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {reading.connectionMisfire.title || "When Connection Misfires"}
              </CardTitle>
              <CardDescription className="pt-1">
                Why care can exist while the relationship still feels tense, distant, or hostile in the moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {reading.connectionMisfire.framing?.trim() && (
                <p className="italic text-muted-foreground">{reading.connectionMisfire.framing}</p>
              )}
              {reading.connectionMisfire.parentIntent?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What you may be trying to do
                  </div>
                  <p>{reading.connectionMisfire.parentIntent}</p>
                </div>
              )}
              {reading.connectionMisfire.childExperience?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    How your child may experience it
                  </div>
                  <p>{reading.connectionMisfire.childExperience}</p>
                </div>
              )}
              {reading.connectionMisfire.childProtection?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What they may do instead of showing vulnerability
                  </div>
                  <p>{reading.connectionMisfire.childProtection}</p>
                </div>
              )}
              {reading.connectionMisfire.whatHelpsInTheMoment?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What helps in the moment
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.connectionMisfire.whatHelpsInTheMoment.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reading.connectionMisfire.accountabilityNote?.trim() && (
                <div className="border-l-2 border-amber-500/60 pl-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Important
                  </div>
                  <p className="text-muted-foreground">{reading.connectionMisfire.accountabilityNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {reading.repairProfile &&
        (reading.repairProfile.plainEnglish?.trim() ||
          reading.repairProfile.whatHelps?.length > 0) && (
          <Card className="border-sky-500/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {reading.repairProfile.title || "What Repair Requires for This Child"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {reading.repairProfile.astrology?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Astrology
                  </div>
                  <p className="text-muted-foreground">{reading.repairProfile.astrology}</p>
                </div>
              )}
              {reading.repairProfile.plainEnglish?.trim() && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Plain English
                  </div>
                  <p>{reading.repairProfile.plainEnglish}</p>
                </div>
              )}
              {reading.repairProfile.whatTheParentMayNotice?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What the parent may notice
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.repairProfile.whatTheParentMayNotice.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reading.repairProfile.whatHelps?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    What helps
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {reading.repairProfile.whatHelps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {childMoonProfile && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Moon in {childMoonProfile.sign}
                {childMoonProfile.house ? ` · ${ordinal(childMoonProfile.house)} House` : ""}
              </CardTitle>
              <Badge variant="outline">Child's Emotional Language</Badge>
            </div>
            <CardDescription className="pt-1">{childMoonProfile.headline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm pt-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What Makes Them Feel Safe
              </div>
              <ul className="list-disc list-inside space-y-1">
                {childMoonProfile.safetyNeeds.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What Distress Looks Like
              </div>
              <ul className="list-disc list-inside space-y-1">
                {childMoonProfile.stressSignals.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What to Know as Their Parent
              </div>
              <p>{childMoonProfile.parentTip}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reading.sections.map((sec, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">{sec.heading}</CardTitle>
              <Badge variant="outline">{sec.badge}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                How {toName} experiences this
              </div>
              <p>{sec.howItLands}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Blind spot for {fromName}
              </div>
              <p>{sec.blindSpot}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What helps
              </div>
              <ul className="list-disc list-inside space-y-1">
                {sec.whatHelps.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}

      {contractOverlapFlags && contractOverlapFlags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold flex items-center gap-2 pt-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Where Your Contracts Meet
          </h3>
          {contractOverlapFlags.map((flag, idx) => (
            <Card key={idx} className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">{flag.headline}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{flag.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reading.respondsBestWhen && reading.respondsBestWhen.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Responds Best When
            </CardTitle>
            <CardDescription className="pt-1">
              Concrete interaction strategies for this specific child.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="list-disc list-inside text-sm space-y-1">
              {reading.respondsBestWhen.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {reading.inTheMoment && reading.inTheMoment.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What To Do In The Moment
            </CardTitle>
            <CardDescription className="pt-1">
              Real-time de-escalation actions for common scenarios with this child.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            {reading.inTheMoment.map((m, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <div className="font-semibold">{m.scenario}</div>
                <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                  {m.actions.map((a, ai) => <li key={ai}>{a}</li>)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reading.whatMakesItWorse && reading.whatMakesItWorse.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader className="pb-3 bg-destructive/10 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-destructive" />
              What Makes It Worse
            </CardTitle>
            <CardDescription className="pt-1">
              Common parent behaviors that reliably escalate this child. Avoid these.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-sm">
            <ul className="list-disc list-inside space-y-1">
              {reading.whatMakesItWorse.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {reading.practice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              One Practice for the Next 90 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{reading.practice}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const FamilySystemReadingView = ({ reading, members }: { reading: FamilySystemReadingResponse; members: { chart: NatalChart; role: FamilyRole }[] }) => {
  return (
    <div className="space-y-4">
      {reading.atAGlance && reading.atAGlance.length > 0 && (
        <Card className="border-primary/60 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              How This Family Works (At a Glance)
            </CardTitle>
            <CardDescription className="pt-1">
              One plain-language line per family member. The entry point for the rest of the reading.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-sm">
            <ul className="space-y-2">
              {reading.atAGlance.map((m, i) => (
                <li key={i} className="leading-snug">
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-muted-foreground"> → {m.line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {Array.isArray((reading as any).childMechanisms) && (reading as any).childMechanisms.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              How Each Child Works Inside
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            {(reading as any).childMechanisms.map((m: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-2">
                <div className="font-semibold">{m.name}</div>
                {Array.isArray(m.corePattern) && m.corePattern.length > 0 && (
                  <ul className="space-y-1 text-muted-foreground">
                    {m.corePattern.map((p: any, idx: number) => (
                      <li key={idx}>{p.placement}: {p.does}</li>
                    ))}
                  </ul>
                )}
                {m.theConflict && <p>{m.theConflict}</p>}
                {m.inRealLife && <p className="text-muted-foreground">{m.inRealLife}</p>}
                {m.underStress && <p className="text-muted-foreground">{m.underStress}</p>}
                {m.whatThisIsNot && <p className="text-xs italic text-muted-foreground">Not: {m.whatThisIsNot}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {Array.isArray((reading as any).parentRegulationCenter) && (reading as any).parentRegulationCenter.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              The Parent as the Regulation Center
            </CardTitle>
            <CardDescription className="pt-1">
              Whichever way a parent regulates (or doesn't) sets the household's emotional baseline. This is what that looks like in real life.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            {(reading as any).parentRegulationCenter.map((p: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                <div className="font-semibold">{p.name}</div>
                {p.body && <p className="text-muted-foreground">{p.body}</p>}
                {p.whatThisMeansInRealLife && (
                  <p>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">
                      In Real Life
                    </span>
                    {p.whatThisMeansInRealLife}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(() => {
        const resetLine = buildHouseholdResetLine(members);
        if (!resetLine) return null;
        return (
          <Card className="border-primary/40">
            <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                How This Household Resets
              </CardTitle>
              <CardDescription className="pt-1">
                One observation drawn directly from the Moon element tally across the group.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm">
              <p>{resetLine}</p>
            </CardContent>
          </Card>
        );
      })()}

      {/* === Nerd Corner: Full Connections & Profiles (collapsed by default) === */}
      <details className="rounded-md border border-dashed border-border bg-background/40 group">
        <summary className="cursor-pointer select-none p-3 font-semibold text-sm flex items-center justify-between hover:bg-muted/40 rounded-md">
          <span>🔭 View Full Astrological Blueprint — Connections & Profiles</span>
          <span className="text-xs text-muted-foreground group-open:hidden">click to expand</span>
          <span className="text-xs text-muted-foreground hidden group-open:inline">click to collapse</span>
        </summary>
        <div className="p-3 pt-1 space-y-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            The Soul Mission teacher notes stay visible above in the Family Power Map. Everything here is the underlying detail.
          </p>

      {reading.parentChildConnections && reading.parentChildConnections.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Parent ↔ Child Connections
            </CardTitle>
            <CardDescription className="pt-1">
              Each pair has a shared tone plus what it tends to feel like for each person in their role. Bridge and friction also split into per-person behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            {reading.parentChildConnections.map((pc, i) => (
              <PairBlock
                key={i}
                title={`${pc.parent} ↔ ${pc.child}`}
                nameA={pc.parent}
                nameB={pc.child}
                composite={pc.composite}
                bridge={pc.bridge}
                friction={pc.friction}
                interactionPattern={(pc as any).interactionPattern}
                dynamic={(pc as any).dynamic}
                whatCanFeelHard={(pc as any).whatCanFeelHard}
                whatHelps={(pc as any).whatHelps}
                note={pc.note}
                legacyBody={(pc as unknown as { body?: string }).body}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {reading.siblingConnections && reading.siblingConnections.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Sibling ↔ Sibling Connections
            </CardTitle>
            <CardDescription className="pt-1">
              Older sibling first. Same shared-tone-plus-per-person structure as parent–child pairs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            {(() => {
              const siblingWeb = buildFamilyWeb(members);
              const missionsByPair = new Map<string, typeof siblingWeb.siblingSoulMissions>();
              for (const m of siblingWeb.siblingSoulMissions) {
                const k1 = `${m.teacherChild}|${m.studentChild}`;
                const k2 = `${m.studentChild}|${m.teacherChild}`;
                if (!missionsByPair.has(k1)) missionsByPair.set(k1, []);
                if (!missionsByPair.has(k2)) missionsByPair.set(k2, []);
                missionsByPair.get(k1)!.push(m);
                if (k1 !== k2) missionsByPair.get(k2)!.push(m);
              }
              return reading.siblingConnections!.map((sc, i) => {
                const a = members.find((m) => m.chart.name === sc.siblingA)?.chart;
                const b = members.find((m) => m.chart.name === sc.siblingB)?.chart;
                const reset = a && b ? computeSiblingResetMode(a, b) : null;
                const pairMissions = missionsByPair.get(`${sc.siblingA}|${sc.siblingB}`) ?? [];
                return (
                  <div key={i} className="space-y-2">
                    <PairBlock
                      title={`${sc.siblingA} ↔ ${sc.siblingB}`}
                      nameA={sc.siblingA}
                      nameB={sc.siblingB}
                      composite={sc.composite}
                      bridge={sc.bridge}
                      friction={sc.friction}
                      interactionPattern={(sc as any).interactionPattern}
                      dynamic={(sc as any).dynamic}
                      whatCanFeelHard={(sc as any).whatCanFeelHard}
                      whatHelps={(sc as any).whatHelps}
                      patternType={(sc as any).patternType}
                      note={sc.note}
                      legacyBody={(sc as unknown as { body?: string }).body}
                    />
                    {pairMissions.map((m, mi) => (
                      <div
                        key={mi}
                        className={`ml-3 border-l-4 pl-3 py-2 rounded-r-md space-y-1 ${
                          m.nodeType === "North"
                            ? "border-emerald-500 bg-emerald-500/5"
                            : "border-purple-500 bg-purple-500/5"
                        }`}
                      >
                        <div className={`font-bold text-sm ${m.nodeType === "North" ? "text-emerald-700 dark:text-emerald-400" : "text-purple-700 dark:text-purple-400"}`}>
                          ★ {m.headline}
                        </div>
                        <p className="text-sm">{m.body}</p>
                        <p className="text-xs text-muted-foreground italic">orb {m.orb.toFixed(2)}° · {m.contactorPlanet} on {m.nodeType} Node</p>
                      </div>
                    ))}
                    {reset && (
                      <div className="ml-3 border-l-2 border-amber-500/60 pl-3 py-2 bg-amber-500/5 rounded-r-md space-y-1">
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                          When {sc.siblingA} & {sc.siblingB} meet a developmental invitation
                          {reset.sharedElements.length > 0 && (
                            <span className="ml-1 font-normal opacity-70">
                              · shared {reset.sharedElements.join(" + ")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm"><span className="font-semibold">✓ Do this:</span> {reset.doThis}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-semibold">✗ Avoid:</span> {reset.dontDoThis}</p>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </CardContent>
        </Card>
      )}

      {reading.whatEscalates && reading.whatEscalates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What Escalates Each Person</CardTitle>
            <CardDescription>How each family member experiences and contributes to escalation, from their own perspective.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {reading.whatEscalates.map((p, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <div className="font-semibold">{p.name}</div>
                <p className="text-muted-foreground whitespace-pre-line">{p.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {members.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What Each Person Responds Best To
            </CardTitle>
            <CardDescription className="pt-1">
              Labeled micro-lines per person — Moon (safety), Venus (love), Mercury (how they hear you), Mars (reset), Saturn-to-luminary (what cuts). Deterministic, no AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            {(() => {
              const profiles = buildRespondsBestProfileForGroup(
                members.map((m) => ({ id: m.chart.id, chart: m.chart })),
              );
              return members.map((m) => {
                const p = profiles[m.chart.id];
                if (!p) return null;
                return (
                  <div key={m.chart.id} className="border-l-2 border-primary/40 pl-3 space-y-1">
                    <div className="font-semibold">{m.chart.name}</div>
                    <div><span className="text-muted-foreground">☽ What feels safe:</span> {p.whatFeelsSafe}</div>
                    <div><span className="text-muted-foreground">♀ What feels like love:</span> {p.whatFeelsLikeLove}</div>
                    <div><span className="text-muted-foreground">☿ How they hear you:</span> {p.howTheyHearYou}</div>
                    <div><span className="text-muted-foreground">♂ How they reset:</span> {p.howTheyReset}</div>
                    {p.whatCuts && (
                      <div><span className="text-muted-foreground">♄ What cuts:</span> {p.whatCuts}</div>
                    )}
                  </div>
                );
              });
            })()}
          </CardContent>
        </Card>
      )}
        </div>
      </details>


      {members.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              When Pressure Builds
            </CardTitle>
            <CardDescription className="pt-1">
              How each person tends to behave when the household feels stressful.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            {(() => {
              const patterns = buildPressurePatternsForGroup(
                members.map((m) => ({ id: m.chart.id, chart: m.chart })),
                reading
              );
              return members.map((m) => (
                <div key={m.chart.id} className="border-l-2 border-primary/40 pl-3">
                  <span className="font-semibold">{m.chart.name}</span>
                  {" "}→ when pressure builds, {patterns[m.chart.id]}
                </div>
              ));
            })()}
          </CardContent>
        </Card>
      )}

      {members.length >= 2 && (() => {
        const web = buildFamilyWeb(members);
        const {
          elementalVoid, bridges, triangulation, mirrors, dashboard,
          twelfthHouseMirrors, midpointHotspots, tsquareCompletions,
          houseOverlays, profectionAlignment, nodalDestiny,
          sunDevelopmentalTasks, missionStatement,
          parentalShadows, profectionYearMates, headline,
          siblingLenses, groupedGenerationalGaps, siblingSoulMissions,
        } = web;
        const anyContent =
          elementalVoid.missingElement ||
          bridges.length > 0 ||
          triangulation.triangles.length > 0 ||
          triangulation.modalityPattern ||
          mirrors.length > 0 ||
          dashboard.length > 0 ||
          twelfthHouseMirrors.length > 0 ||
          midpointHotspots.length > 0 ||
          tsquareCompletions.length > 0 ||
          groupedGenerationalGaps.length > 0 ||
          houseOverlays.length > 0 ||
          (profectionAlignment && (profectionAlignment.synergies.length > 0 || profectionAlignment.clashes.length > 0 || profectionAlignment.perMember.length > 0)) ||
          nodalDestiny.length > 0 ||
          sunDevelopmentalTasks.length > 0 ||
          parentalShadows.length > 0 ||
          siblingLenses.length > 0 ||
          !!missionStatement ||
          !!headline;
        if (!anyContent) return null;
        const yearMatesByParent = new Map<string, typeof profectionYearMates>();
        for (const ym of profectionYearMates) {
          if (!yearMatesByParent.has(ym.parent)) yearMatesByParent.set(ym.parent, []);
          yearMatesByParent.get(ym.parent)!.push(ym);
        }
        // Filter out child↔child nodal destinies (now rendered inside Sibling Connections)
        const parentChildNodal = nodalDestiny.filter((n) => {
          const ownerRole = members.find((m) => m.chart.name === n.ownerName)?.role;
          const contRole = members.find((m) => m.chart.name === n.contactorName)?.role;
          const isChild = (r?: string) => r === "child" || r === "sibling";
          return !(isChild(ownerRole) && isChild(contRole));
        });
        const marsCatByName = new Map<string, ReturnType<typeof marsHouseCategory>>();
        for (const m of members) marsCatByName.set(m.chart.name, marsHouseCategory(m.chart));
        // --- Build the Three Big Knots summary ---
        const engineLine = headline?.sentence || missionStatement?.sentence || null;
        const topMission = siblingSoulMissions.find((s) => s.nodeType === "North") || siblingSoulMissions[0];
        const siblingMissionLine = topMission
          ? `${topMission.teacherChild} is ${topMission.studentChild}'s Developmental Teacher — friction here is growth, not a problem.`
          : (() => {
              const n = parentChildNodal.find((x) => x.nodeType === "North");
              return n
                ? `${n.contactorName} is helping ${n.ownerName} grow — what feels like friction is actually the lesson.`
                : null;
            })();
        const topShadow = parentalShadows[0];
        const topMirror = twelfthHouseMirrors[0];
        const parentPulseLine = topShadow
          ? `${topShadow.child} may mirror ${topShadow.parent}'s unspoken stress — when they act out, check the household "volume" first.`
          : topMirror
            ? `${topMirror.child} senses what ${topMirror.parent} hasn't said — name your own state out loud first; the behavior softens.`
            : null;
        const hasGlance = !!(engineLine || siblingMissionLine || parentPulseLine);

        // --- Translation Gap per child ---
        const childMembers = members.filter((m) => m.role === "child" || m.role === "sibling");
        const dashboardByName = new Map(dashboard.map((d) => [d.name, d]));
        const translationGaps = childMembers.map((m) => {
          const moonSign = m.chart.planets.Moon?.sign;
          const mercurySign = m.chart.planets.Mercury?.sign;
          const marsSign = m.chart.planets.Mars?.sign;
          const dd = marsDoDont(marsSign);
          const row = dashboardByName.get(m.chart.name);
          return {
            name: m.chart.name,
            moonSign,
            mercurySign,
            marsSign,
            dont: dd.dont,
            doThis: dd.doThis,
            triggeredBy: row?.triggeredBy,
            circuitBreaker: row?.circuitBreaker,
          };
        }).filter((x) => x.moonSign || x.mercurySign || x.marsSign);

        // --- Parental Anchor (with Balsamic Moon reframe) ---
        const parentMembers = members.filter((m) => m.role === "parent");
        const parentAnchors = parentMembers.map((m) => {
          const sunLon = planetLongitude(m.chart.planets.Sun);
          const moonLon = planetLongitude(m.chart.planets.Moon);
          const phase = sunLon !== null && moonLon !== null ? moonPhaseLabel(sunLon, moonLon) : null;
          const moonSign = m.chart.planets.Moon?.sign;
          const isBalsamic = phase === "Balsamic";
          const anchor = isBalsamic
            ? `Your ${moonSign ?? ""} Moon is in the Balsamic phase — it's wired to compost and release energy, not generate it. Silence is a real tool for balance. But because the kids pick up on what you don't say, naming your feelings out loud (even a quick "I'm tired / I'm wound up") prevents them from carrying it for you.`
            : phase
              ? `Your ${moonSign ?? ""} Moon (${phase} phase) sets the household weather. Naming your inner state out loud — even one sentence — keeps the kids from absorbing it subconsciously.`
              : null;
          return { name: m.chart.name, phase, moonSign, anchor, isBalsamic };
        }).filter((x) => !!x.anchor);

        const hasTechnicalContent =
          groupedGenerationalGaps.length > 0 ||
          houseOverlays.length > 0 ||
          (profectionAlignment && profectionAlignment.perMember.length > 0) ||
          parentChildNodal.length > 0 ||
          midpointHotspots.length > 0 ||
          tsquareCompletions.length > 0 ||
          mirrors.length > 0;

        return (
          <Card className="border-primary/60 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                The Family Feedback Loop
              </CardTitle>
              <CardDescription className="pt-1">
                What this family actually needs from each other — in plain English, with the math kept under the hood.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-5 text-sm">
              {/* 0. Emergency Resets — flashcards at the very top */}
              {(() => {
                const childRows = dashboard.filter((d) => {
                  const role = members.find((m) => m.chart.name === d.name)?.role;
                  return role === "child" || role === "sibling";
                });
                if (childRows.length === 0) return null;
                return (
                  <div className="space-y-2 rounded-lg border-2 border-amber-400/70 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 p-4 shadow-md">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <div className="font-bold text-lg tracking-tight">Emergency Resets</div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scan during a meltdown. Red = what set them off. Green = what brings them back.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {childRows.map((row, i) => (
                        <div key={i} className="rounded-lg border-2 border-border bg-background shadow-sm overflow-hidden">
                          <div className="px-3 py-2 bg-muted/60 border-b-2 border-border font-bold text-base">
                            {row.name}
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="rounded border border-rose-400/70 bg-rose-100/70 dark:bg-rose-950/40 p-2">
                              <div className="text-[10px] uppercase tracking-wider font-bold text-rose-700 dark:text-rose-300 mb-0.5">
                                Trigger
                              </div>
                              <div className="text-sm text-rose-900 dark:text-rose-100 font-medium">{row.triggeredBy || "—"}</div>
                            </div>
                            <div className="text-center text-muted-foreground font-mono text-base leading-none">⮕</div>
                            <div className="rounded border border-emerald-400/70 bg-emerald-100/70 dark:bg-emerald-950/40 p-2">
                              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300 mb-0.5 flex items-center gap-1">
                                <Zap className="h-3 w-3" /> Circuit Breaker
                              </div>
                              <div className="text-sm text-emerald-900 dark:text-emerald-100 font-medium">{row.circuitBreaker || "—"}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 0b. Family Power Map — single-glance summary of Soul Missions + Mirrors */}
              {(siblingSoulMissions.length > 0 || parentalShadows.length > 0) && (
                <div className="rounded-md border border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
                    <Compass className="h-3.5 w-3.5" />
                    Family Power Map
                  </div>
                  <div className="space-y-1.5 font-mono text-sm">
                    {siblingSoulMissions.slice(0, 4).map((s, i) => (
                      <div key={`ssm-${i}`} className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{s.teacherChild}</span>
                        <span className="text-muted-foreground">——(</span>
                        <span className={s.nodeType === "North"
                          ? "px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                          : "px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold"}>
                          {s.nodeType === "North" ? "Teacher" : "Old Friend"}
                        </span>
                        <span className="text-muted-foreground">)——&gt;</span>
                        <span className="font-semibold">{s.studentChild}</span>
                      </div>
                    ))}
                    {(() => {
                      const byPair = new Map<string, { parent: string; child: string }>();
                      for (const p of parentalShadows) {
                        const k = `${p.parent}|${p.child}`;
                        if (!byPair.has(k)) byPair.set(k, { parent: p.parent, child: p.child });
                      }
                      return Array.from(byPair.values()).slice(0, 4).map((p, i) => (
                        <div key={`ps-${i}`} className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{p.child}</span>
                          <span className="text-muted-foreground">&lt;——(</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                            Mirror
                          </span>
                          <span className="text-muted-foreground">)——</span>
                          <span className="font-semibold">{p.parent}</span>
                        </div>
                      ));
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Teachers grow each other on purpose. Mirrors reflect what hasn't been said out loud.
                  </p>
                </div>
              )}

              {/* 1. Your Family at a Glance — The Three Big Knots */}
              {hasGlance && (
                <div className="rounded-md border-2 border-primary bg-primary/10 p-4 space-y-3">
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                    Your Family at a Glance
                  </div>
                  <ul className="space-y-2.5">
                    {engineLine && (
                      <li className="flex gap-2">
                        <span className="font-semibold text-primary shrink-0">The Engine:</span>
                        <span>{engineLine}</span>
                      </li>
                    )}
                    {siblingMissionLine && (
                      <li className="flex gap-2">
                        <span className="font-semibold text-primary shrink-0">The Sibling Mission:</span>
                        <span>{siblingMissionLine}</span>
                      </li>
                    )}
                    {parentPulseLine && (
                      <li className="flex gap-2">
                        <span className="font-semibold text-primary shrink-0">The Parent Pulse:</span>
                        <span>{parentPulseLine}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* 2. The Translation Gap — visual flow per child */}
              {translationGaps.length > 0 && (
                <div className="space-y-3">
                  <div className="font-semibold text-base">The Translation Gap</div>
                  <p className="text-xs text-muted-foreground">
                    How each child <em>feels</em> things versus how they <em>say</em> them — and exactly what to do (and avoid) when it gets loud.
                  </p>
                  {translationGaps.map((c, i) => (
                    <div key={i} className="rounded-md border border-border bg-background/60 p-3 space-y-2">
                      <div className="font-semibold">{c.name}</div>
                      {/* Visual flow: Heart → Brain → Action */}
                      <div className="flex items-stretch gap-1.5 flex-wrap text-xs">
                        <div className="flex-1 min-w-[110px] rounded-md border border-rose-300/60 bg-rose-50 dark:bg-rose-950/30 px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-rose-700 dark:text-rose-300">
                            <Heart className="h-3 w-3" /> Heart
                          </div>
                          <div className="font-semibold text-rose-900 dark:text-rose-100">{c.moonSign ?? "—"}</div>
                        </div>
                        <div className="flex items-center text-muted-foreground font-mono text-base">→</div>
                        <div className="flex-1 min-w-[110px] rounded-md border border-sky-300/60 bg-sky-50 dark:bg-sky-950/30 px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-sky-700 dark:text-sky-300">
                            <Brain className="h-3 w-3" /> Brain
                          </div>
                          <div className="font-semibold text-sky-900 dark:text-sky-100">{c.mercurySign ?? "—"}</div>
                        </div>
                        {c.marsSign && (
                          <>
                            <div className="flex items-center text-muted-foreground font-mono text-base">→</div>
                            <div className="flex-1 min-w-[110px] rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5 text-center">
                              <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300">
                                <Activity className="h-3 w-3" /> Action
                              </div>
                              <div className="font-semibold text-amber-900 dark:text-amber-100">{c.marsSign}</div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-destructive mb-1">Don't</div>
                          <div className="text-xs">{c.dont}</div>
                        </div>
                        <div className="rounded border border-emerald-500/40 bg-emerald-500/5 p-2">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Do</div>
                          <div className="text-xs">{c.doThis}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Parental Anchor reframe — Household Thermostat */}
              {parentAnchors.length > 0 && (
                <div className="space-y-2">
                  {parentAnchors.map((p, i) => {
                    const prof = profectionAlignment?.perMember.find((pm) => pm.name === p.name);
                    const mission = prof ? PROFECTION_MISSION[prof.house] : null;
                    return (
                      <div
                        key={i}
                        className="rounded-lg border-2 border-sky-300/70 dark:border-sky-700/70 bg-sky-50 dark:bg-sky-950/40 p-4 shadow-sm space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                          <div className="font-semibold text-base text-sky-900 dark:text-sky-100">
                            {p.name}: The Household Thermostat
                          </div>
                        </div>
                        {mission && (
                          <div className="text-xs uppercase tracking-wider font-semibold text-sky-700 dark:text-sky-300">
                            Current Mission: {mission}
                          </div>
                        )}
                        <p className="text-sm text-sky-950 dark:text-sky-50">{p.anchor}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Developmental Tasks — kept, human-friendly */}
              {sunDevelopmentalTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Each Child's Developmental Task</div>
                  <p className="text-xs text-muted-foreground">
                    What each child is here to practice — not a label they're stuck with.
                  </p>
                  {sunDevelopmentalTasks.map((t, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        <span>{t.name}</span>
                        <Badge variant="outline" className="text-[10px] font-normal capitalize">{t.task}</Badge>
                      </div>
                      <p className="text-muted-foreground">{t.reframe}</p>
                      <p className="text-xs italic text-muted-foreground">
                        Instead of calling them "{t.insteadOf}", name the practice.
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Sibling Lens — kept */}
              {siblingLenses.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">How Each Child Sees Their Siblings</div>
                  <p className="text-xs text-muted-foreground">
                    Each child's built-in lens for reading their brothers and sisters.
                  </p>
                  {siblingLenses.map((s, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3">
                      <div className="font-medium">{s.child}</div>
                      <p className="text-muted-foreground">{s.lens}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Elemental Void — relabeled */}
              {elementalVoid.missingElement && (
                <div className="space-y-1">
                  <div className="font-semibold">
                    {elementalVoid.surrogate ? "The Natural Anchor" : "What This Family is Missing"}
                    {" — "}
                    <span className="capitalize">{elementalVoid.missingElement}</span>
                  </div>
                  {elementalVoid.surrogate ? (
                    <p>
                      <span className="font-medium">{elementalVoid.surrogate.name}</span> quietly carries this for the family: {elementalVoid.surrogate.why}.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">{elementalVoid.impact}</p>
                  )}
                  {elementalVoid.anchorSuggestion && (
                    <p><span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Try</span>{elementalVoid.anchorSuggestion}</p>
                  )}
                </div>
              )}

              {triangulation.modalityPattern && (
                <div className="rounded-md border border-primary/40 p-3 space-y-1 bg-background/50">
                  <div className="font-semibold">
                    {triangulation.modalityPattern.label}
                  </div>
                  <p>{triangulation.modalityPattern.intervention}</p>
                </div>
              )}

              {bridges.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Who Bridges Whom</div>
                  {bridges.map((b, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                      <div>
                        <span className="font-medium">{b.clashingPair[0]} ↔ {b.clashingPair[1]}</span>
                        <span className="text-muted-foreground"> — {b.clashReason}</span>
                      </div>
                      <div>Bridge: <span className="font-medium">{b.bridge}</span></div>
                      <p className="text-muted-foreground">{b.howToUse}</p>
                      {b.withdrawalCaveat && (
                        <p className="text-xs italic text-muted-foreground">⚠ {b.withdrawalCaveat}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {triangulation.triangles.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">When Three People Get Stuck</div>
                  {triangulation.triangles.map((t, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                      <p>{t.sequence}</p>
                      <p className="text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider mr-2">Reset</span>
                        {t.intervention}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Same Team, Different Volume — moved into Nerd Corner accordion below */}

              {/* 3. Regulation Dashboard — compact, 5-second read */}
              {dashboard.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Quick Regulation Dashboard</div>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-left bg-muted/50 border-b border-border">
                          <th className="py-2 px-2 font-semibold">Person</th>
                          <th className="py-2 px-2 font-semibold">Trigger</th>
                          <th className="py-2 px-2 font-semibold">Reaction</th>
                          <th className="py-2 px-2 font-semibold">Reset ⚡</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.map((row, i) => {
                          const cat = marsCatByName.get(row.name);
                          return (
                            <Fragment key={i}>
                              <tr className="border-b border-border/50 align-top hover:bg-muted/30">
                                <td className="py-2 px-2 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    {cat === "angular" && (
                                      <span title="Visible — stress shows up early">
                                        <Star className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                                      </span>
                                    )}
                                    {(cat === "succedent" || cat === "cadent") && (
                                      <span title="Hidden — stress goes underground first">
                                        <Cloud className="h-3.5 w-3.5 text-purple-500" />
                                      </span>
                                    )}
                                    <span>{row.name}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2">{row.triggeredBy}</td>
                                <td className="py-2 px-2">{row.stressReaction}</td>
                                <td className="py-2 px-2 font-medium">{row.circuitBreaker}</td>
                              </tr>
                              {row.sensitivityNotes && row.sensitivityNotes.map((s, j) => (
                                <tr key={`${i}-${j}`} className="border-b border-border/50">
                                  <td colSpan={4} className="py-1 px-2 italic text-muted-foreground text-xs bg-muted/20">
                                    ⚠ Sensitivity ({s.aboutChild}): {s.note}
                                  </td>
                                </tr>
                              ))}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 12th-House Mirrors — kept but renamed */}
              {twelfthHouseMirrors.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">When Stress is a Reflection</div>
                  <p className="text-xs text-muted-foreground">
                    Sometimes a child's outburst is them picking up on something a parent hasn't said. Name your own state out loud first; the behavior usually softens.
                  </p>
                  {twelfthHouseMirrors.map((m, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3">
                      <div className="font-medium">{m.child} ↔ {m.parent}</div>
                      <p className="text-muted-foreground">{m.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {parentalShadows.length > 0 && (() => {
                // Consolidate: one block per (parent, child) pair, listing all planets together.
                type Group = { parent: string; child: string; planets: string[]; texts: string[] };
                const groups = new Map<string, Group>();
                for (const s of parentalShadows) {
                  const k = `${s.parent}|${s.child}`;
                  if (!groups.has(k)) groups.set(k, { parent: s.parent, child: s.child, planets: [], texts: [] });
                  const g = groups.get(k)!;
                  g.planets.push(s.parentPlanet);
                  g.texts.push(s.text);
                }
                // Pick the most specific fix line based on the planets involved.
                const fixFor = (parent: string, child: string, planets: string[]): string => {
                  const has = (p: string) => planets.includes(p);
                  if (has("Saturn")) {
                    return `Be explicit with your expectations and standards — when ${parent}'s silent version stays silent, ${child} carries it as ambient self-doubt.`;
                  }
                  if (has("Sun") || has("Mars") || has("Mercury")) {
                    return `${child} is ${parent}'s primary emotional mirror. If ${child} is acting out, name your own feeling first ("I'm feeling a bit rushed / annoyed") and watch ${child} settle.`;
                  }
                  if (has("Moon")) {
                    return `Name your mood out loud ("I'm tense, not about you") so ${child} doesn't carry it for you.`;
                  }
                  if (has("Venus")) {
                    return `Acknowledge unspoken relational tension out loud — otherwise ${child} absorbs it as their fault.`;
                  }
                  return `When ${child} seems reactive, check your own internal volume first.`;
                };
                const labelFor = (planets: string[]): string => {
                  const order = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn"];
                  const seen = new Set<string>();
                  const ordered = order.filter((p) => planets.includes(p) && !seen.has(p) && (seen.add(p), true));
                  return ordered.join("/");
                };
                const list = Array.from(groups.values());
                return (
                  <div className="space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-purple-500" />
                      Parental Shadow: The Subconscious Mirror
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When a parent's unspoken energy lives in a child's subconscious. If they seem reactive, check your own internal volume first.
                    </p>
                    {list.map((g, i) => (
                      <div key={i} className="border-l-2 border-purple-500/60 pl-3 bg-purple-500/5 py-2 rounded-r space-y-1">
                        <div className="font-medium">
                          {g.child} <span className="text-xs font-normal text-muted-foreground">(12th-House {labelFor(g.planets)} from {g.parent})</span>
                        </div>
                        <p className="text-muted-foreground">{g.texts[0]}</p>
                        <p className="text-sm">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">Fix:</span>{" "}
                          {fixFor(g.parent, g.child, g.planets)}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* 3. Astrology Nerd Corner — collapsed by default */}
              {hasTechnicalContent && (
                <details className="rounded-md border border-dashed border-border bg-background/40 group">
                  <summary className="cursor-pointer select-none p-3 font-semibold text-sm flex items-center justify-between hover:bg-muted/40 rounded-md">
                    <span>🔭 View Full Astrological Blueprint</span>
                    <span className="text-xs text-muted-foreground group-open:hidden">click to expand</span>
                    <span className="text-xs text-muted-foreground hidden group-open:inline">click to collapse</span>
                  </summary>
                  <div className="p-3 pt-1 space-y-5 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      For the astrology-curious: the underlying placements driving everything above.
                    </p>

                    {mirrors.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Same Team, Different Volume</div>
                        {mirrors.map((m, i) => (
                          <div key={i} className="border-l-2 border-primary/40 pl-3">
                            <span className="font-medium">{m.parent} ↔ {m.child}</span>: {m.mirroredPlacement}.{" "}
                            <span className="text-muted-foreground">{m.sameTeamMessage}</span>
                          </div>
                        ))}
                      </div>
                    )}


                    {midpointHotspots.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Midpoint Hotspots</div>
                        <p className="text-xs text-muted-foreground">
                          Members whose planet sits within 1.5° of the midpoint between two parents' planets.
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b border-border">
                                <th className="py-1 pr-3">Parents</th>
                                <th className="py-1 pr-3">Planets</th>
                                <th className="py-1 pr-3">Midpoint</th>
                                <th className="py-1 pr-3">Activated by</th>
                                <th className="py-1 pr-3">Their planet</th>
                                <th className="py-1">Orb</th>
                              </tr>
                            </thead>
                            <tbody>
                              {midpointHotspots.map((h, i) => (
                                <Fragment key={i}>
                                  <tr className="border-b border-border/50 align-top">
                                    <td className="py-2 pr-3 font-medium">{h.parentA} + {h.parentB}</td>
                                    <td className="py-2 pr-3">{h.parentPlanetA} / {h.parentPlanetB}</td>
                                    <td className="py-2 pr-3">{String(h.midpointDegree).padStart(2,"0")}°{String(h.midpointMinutes).padStart(2,"0")}' {h.midpointSign}</td>
                                    <td className="py-2 pr-3 font-medium">{h.activator}</td>
                                    <td className="py-2 pr-3">{h.activatorPlanet}</td>
                                    <td className="py-2">{h.orb.toFixed(2)}°</td>
                                  </tr>
                                  <tr className="border-b border-border/50">
                                    <td colSpan={6} className="py-1 pl-3 italic text-muted-foreground text-xs">
                                      {h.interpretation}
                                    </td>
                                  </tr>
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {tsquareCompletions.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">T-Square Completions</div>
                        <p className="text-xs text-muted-foreground">
                          A child whose planet falls on the open apex of a parent's natal square.
                        </p>
                        {tsquareCompletions.map((t, i) => (
                          <div key={i} className="border-l-2 border-primary/40 pl-3">
                            <div className="font-medium">{t.parent} ↔ {t.child}</div>
                            <p className="text-muted-foreground">{t.text}</p>
                            <p className="text-xs text-muted-foreground">Orb: {t.orb.toFixed(2)}°</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {groupedGenerationalGaps.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Generational Outer-Planet Gap</div>
                        <p className="text-xs text-muted-foreground">
                          Different signs on Uranus, Neptune, and Pluto — one paragraph per pair.
                        </p>
                        {groupedGenerationalGaps.map((g, i) => (
                          <div key={i} className="border-l-2 border-primary/40 pl-3">
                            <div className="font-medium">{g.parent} ↔ {g.child}</div>
                            <p className="text-muted-foreground">{g.paragraph}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {houseOverlays.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">House Overlays</div>
                        <p className="text-xs text-muted-foreground">
                          Where each person's Sun, Mars, Saturn, and Jupiter land inside other members' houses.
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b border-border">
                                <th className="py-1 pr-3">From</th>
                                <th className="py-1 pr-3">Planet</th>
                                <th className="py-1 pr-3">Into</th>
                                <th className="py-1 pr-3">House</th>
                                <th className="py-1">Effect</th>
                              </tr>
                            </thead>
                            <tbody>
                              {houseOverlays.map((o, i) => (
                                <Fragment key={i}>
                                  <tr className={`border-b border-border/50 align-top ${o.category === "hidden" ? "bg-purple-500/5" : "bg-emerald-500/5"}`}>
                                    <td className="py-2 pr-3 font-medium">{o.fromName}</td>
                                    <td className="py-2 pr-3">{o.fromPlanet}{o.fromSign ? ` in ${o.fromSign}` : ""}</td>
                                    <td className="py-2 pr-3 font-medium">{o.toName}</td>
                                    <td className="py-2 pr-3">{o.house}</td>
                                    <td className="py-2">
                                      {o.category === "hidden" ? (
                                        <Badge variant="outline" className="text-[10px] font-normal border-purple-500/60 text-purple-600 dark:text-purple-400 gap-1">
                                          <Cloud className="h-3 w-3" />
                                          Hidden
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-[10px] font-normal border-emerald-500/60 text-emerald-600 dark:text-emerald-400 gap-1">
                                          <Star className="h-3 w-3" />
                                          Visible
                                        </Badge>
                                      )}
                                    </td>
                                  </tr>
                                  <tr className="border-b border-border/50">
                                    <td colSpan={5} className="py-1 pl-3 italic text-muted-foreground text-xs">
                                      {o.note}
                                    </td>
                                  </tr>
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {profectionAlignment && profectionAlignment.perMember.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Family Season (Each Person's Focus This Year)</div>
                        <p className="text-xs text-muted-foreground">
                          Each member's active focus this year. Shared focus = synergy. Tense angles = developmental invitation.
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b border-border">
                                <th className="py-1 pr-3">Person</th>
                                <th className="py-1 pr-3">Age</th>
                                <th className="py-1 pr-3">Active area</th>
                                <th className="py-1">This year's focus</th>
                              </tr>
                            </thead>
                            <tbody>
                              {profectionAlignment.perMember.map((p, i) => {
                                const mates = yearMatesByParent.get(p.name) ?? [];
                                return (
                                  <tr key={i} className="border-b border-border/50">
                                    <td className="py-2 pr-3 font-medium">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span>{p.name}</span>
                                        {mates.map((ym, j) => (
                                          <Badge key={j} variant="outline" className="text-[10px] font-normal border-emerald-500/60 text-emerald-600 dark:text-emerald-400 gap-1">
                                            <Trophy className="h-3 w-3" />
                                            Year-Mate: {ym.mate}
                                          </Badge>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="py-2 pr-3">{p.age}</td>
                                    <td className="py-2 pr-3">{p.house}</td>
                                    <td className="py-2 text-muted-foreground">{p.theme}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {profectionAlignment.synergies.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Synergy</div>
                            {profectionAlignment.synergies.map((s, i) => (
                              <div key={i} className="border-l-2 border-primary/40 pl-3">
                                <p>{s.note}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {profectionAlignment.clashes.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Developmental Invitations</div>
                            {profectionAlignment.clashes.map((c, i) => (
                              <div key={i} className="border-l-2 border-amber-500/50 pl-3">
                                <div className="font-medium">
                                  {c.memberA} ({ordinalShort(c.houseA)}) ↔ {c.memberB} ({ordinalShort(c.houseB)})
                                </div>
                                <p className="text-muted-foreground">{c.note}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {parentChildNodal.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Soul Mission (Parent ↔ Child)</div>
                        <p className="text-xs text-muted-foreground">
                          North Node = The Teacher (where they're growing). South Node = The Comfort Zone.
                        </p>
                        {parentChildNodal.map((n, i) => (
                          <div
                            key={i}
                            className={`border-l-2 pl-3 ${n.nodeType === "North" ? "border-primary/60" : "border-amber-500/50"}`}
                          >
                            <div className="font-medium flex items-center gap-2 flex-wrap">
                              <span>{n.contactorName} ↔ {n.ownerName} ({n.nodeType} Node)</span>
                              <Badge variant="outline" className="text-[10px] font-normal">{n.role}</Badge>
                              <span className="text-xs text-muted-foreground">orb {n.orb.toFixed(2)}°</span>
                            </div>
                            <p className="text-muted-foreground">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        );
      })()}

    </div>
  );
};
