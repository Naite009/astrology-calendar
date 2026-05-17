import { useEffect, useState, useMemo, Fragment } from "react";
import { Users, Plus, Trash2, ArrowRight, ArrowLeftRight, Heart, Sparkles, Loader2, Home, History, RotateCw, Download, Star, Cloud, Trophy } from "lucide-react";

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
} from "@/lib/familySystemSynastry";
import { migrateFamilySystemReading } from "@/lib/familySystemMigration";

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
    `system-pipeline-v10-headline:${sel
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
            {reading.siblingConnections.map((sc, i) => {
              const a = members.find((m) => m.chart.name === sc.siblingA)?.chart;
              const b = members.find((m) => m.chart.name === sc.siblingB)?.chart;
              const reset = a && b ? computeSiblingResetMode(a, b) : null;
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
                  {reset && (
                    <div className="ml-3 border-l-2 border-amber-500/60 pl-3 py-2 bg-amber-500/5 rounded-r-md space-y-1">
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        When {sc.siblingA} & {sc.siblingB} clash
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
            })}
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
          twelfthHouseMirrors, midpointHotspots, tsquareCompletions, generationalGaps,
          houseOverlays, profectionAlignment, nodalDestiny,
          sunDevelopmentalTasks, missionStatement,
          parentalShadows, profectionYearMates, headline,
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
          generationalGaps.length > 0 ||
          houseOverlays.length > 0 ||
          (profectionAlignment && (profectionAlignment.synergies.length > 0 || profectionAlignment.clashes.length > 0 || profectionAlignment.perMember.length > 0)) ||
          nodalDestiny.length > 0 ||
          sunDevelopmentalTasks.length > 0 ||
          parentalShadows.length > 0 ||
          !!missionStatement ||
          !!headline;
        if (!anyContent) return null;
        const yearMatesByParent = new Map<string, typeof profectionYearMates>();
        for (const ym of profectionYearMates) {
          if (!yearMatesByParent.has(ym.parent)) yearMatesByParent.set(ym.parent, []);
          yearMatesByParent.get(ym.parent)!.push(ym);
        }
        return (
          <Card className="border-primary/60 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                The Family Feedback Loop
              </CardTitle>
              <CardDescription className="pt-1">
                How members collide, gridlock, mirror, and surrogate for each other. Deterministic, computed from the charts.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-5 text-sm">
              {headline && (
                <div className="rounded-md border-2 border-primary bg-primary/10 p-3 space-y-1">
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">So What? — The Headline</div>
                  <p className="font-semibold leading-relaxed text-base">{headline.sentence}</p>
                </div>
              )}

              {missionStatement && (
                <div className="rounded-md border border-primary/50 bg-background/60 p-3 space-y-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Family Mission Statement</div>
                  <p className="font-medium leading-relaxed">{missionStatement.sentence}</p>
                  <p className="text-xs text-muted-foreground">
                    Element tally: fire {missionStatement.elementCounts.fire}, earth {missionStatement.elementCounts.earth}, air {missionStatement.elementCounts.air}, water {missionStatement.elementCounts.water}.
                    {missionStatement.dominantModality ? ` Dominant modality: ${missionStatement.dominantModality}.` : ""}
                  </p>
                </div>
              )}

              {sunDevelopmentalTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Each Child's Developmental Task (Sun as Hero's Journey)</div>
                  <p className="text-xs text-muted-foreground">
                    Reframe the trait. Each child's Sun sign is the practice they're here to grow into, not a label they're stuck with.
                  </p>
                  {sunDevelopmentalTasks.map((t, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        <span>{t.name} ({t.sunSign} Sun)</span>
                        <Badge variant="outline" className="text-[10px] font-normal capitalize">
                          {t.task}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{t.reframe}</p>
                      <p className="text-xs italic text-muted-foreground">
                        Instead of calling them "{t.insteadOf}", name the practice.
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {elementalVoid.missingElement && (
                <div className="space-y-1">
                  <div className="font-semibold">
                    {elementalVoid.surrogate ? "Natural Surrogate" : "Elemental Void"}
                    {" — "}
                    <span className="capitalize">{elementalVoid.missingElement}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tally: {elementalVoid.counts.fire} fire, {elementalVoid.counts.earth} earth, {elementalVoid.counts.air} air, {elementalVoid.counts.water} water (Sun, Moon, Mercury, Venus, Mars).
                  </div>
                  {elementalVoid.surrogate ? (
                    <p>
                      <span className="font-medium">{elementalVoid.surrogate.name}</span> is the natural surrogate: {elementalVoid.surrogate.why}. The element is technically missing but this person carries the function.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">{elementalVoid.impact}</p>
                  )}
                  {elementalVoid.anchorSuggestion && (
                    <p><span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Add</span>{elementalVoid.anchorSuggestion}</p>
                  )}
                </div>
              )}

              {triangulation.modalityPattern && (
                <div className="rounded-md border border-primary/40 p-3 space-y-1 bg-background/50">
                  <div className="font-semibold">
                    {triangulation.modalityPattern.label}
                    {" — "}
                    <span className="capitalize">{triangulation.modalityPattern.dominant}</span> pile-up ({triangulation.modalityPattern.count})
                  </div>
                  <p>{triangulation.modalityPattern.intervention}</p>
                </div>
              )}

              {bridges.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Bridge Members</div>
                  {bridges.map((b, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                      <div>
                        <span className="font-medium">{b.clashingPair[0]} ↔ {b.clashingPair[1]}</span>
                        <span className="text-muted-foreground"> — {b.clashReason}</span>
                      </div>
                      <div>Bridge: <span className="font-medium">{b.bridge}</span> ({b.sharedElementWithA}/{b.sharedElementWithB})</div>
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
                  <div className="font-semibold">Triangulation</div>
                  {triangulation.triangles.map((t, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-1">
                      <p>{t.sequence}</p>
                      <p className="text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider mr-2">Circuit breaker</span>
                        {t.intervention}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {mirrors.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Family Mirrors (Inherited Signatures)</div>
                  {mirrors.map((m, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3">
                      <span className="font-medium">{m.parent} ↔ {m.child}</span>: {m.mirroredPlacement}.{" "}
                      <span className="text-muted-foreground">{m.sameTeamMessage}</span>
                    </div>
                  ))}
                </div>
              )}

              {dashboard.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Regulation Dashboard</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="py-1 pr-3">Person</th>
                          <th className="py-1 pr-3">Triggered by</th>
                          <th className="py-1 pr-3">Stress reaction</th>
                          <th className="py-1">Circuit breaker</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.map((row, i) => (
                          <Fragment key={i}>
                            <tr className="border-b border-border/50 align-top">
                              <td className="py-2 pr-3 font-medium">{row.name}</td>
                              <td className="py-2 pr-3">{row.triggeredBy}</td>
                              <td className="py-2 pr-3">{row.stressReaction}</td>
                              <td className="py-2">{row.circuitBreaker}</td>
                            </tr>
                            {row.sensitivityNotes && row.sensitivityNotes.map((s, j) => (
                              <tr key={`${i}-${j}`} className="border-b border-border/50">
                                <td colSpan={4} className="py-1 pl-3 italic text-muted-foreground text-xs">
                                  ⚠ Sensitivity ({s.aboutChild}): {s.note}
                                </td>
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {twelfthHouseMirrors.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">12th-House Mirrors (Stress = Reflection)</div>
                  <p className="text-xs text-muted-foreground">
                    When a child's planet falls in a parent's 12th house, the child's "stress behaviors" are a real-time reflection of the parent's unexpressed subconscious. Name your own state out loud first; the behavior softens.
                  </p>
                  {twelfthHouseMirrors.map((m, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3">
                      <div className="font-medium">
                        {m.child}'s {m.childPlanet} → {m.parent}'s 12th
                      </div>
                      <p className="text-muted-foreground">{m.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {midpointHotspots.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Midpoint Hotspots</div>
                  <p className="text-xs text-muted-foreground">
                    Children (or other members) whose planet sits within 1.5° of the midpoint between two parents' planets. They activate the parents' shared energy.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="py-1 pr-3">Parents</th>
                          <th className="py-1 pr-3">Parents' planets</th>
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
                  <div className="font-semibold">T-Square Completions (Missing Leg)</div>
                  <p className="text-xs text-muted-foreground">
                    A child whose planet falls on the open apex of a parent's natal square. Their existence completes the configuration.
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

              {generationalGaps.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Generational Outer-Planet Gap</div>
                  <p className="text-xs text-muted-foreground">
                    Different signs on Uranus, Neptune, and Pluto reveal where the friction is generational, not personal.
                  </p>
                  {generationalGaps.map((g, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3">
                      <div className="font-medium">
                        {g.parent} ({g.planet} in {g.parentSign}) ↔ {g.child} ({g.planet} in {g.childSign})
                      </div>
                      <p className="text-muted-foreground">{g.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {houseOverlays.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">House Overlays (Hellenistic)</div>
                  <p className="text-xs text-muted-foreground">
                    Where each person's Sun, Mars, Saturn, and Jupiter land inside other members' houses. Flags hidden impact (6/8/12) and visibility/support (angular: 1/4/7/10).
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
                                    The Work — Hidden Impact
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] font-normal border-emerald-500/60 text-emerald-600 dark:text-emerald-400 gap-1">
                                    <Star className="h-3 w-3" />
                                    The Lift — Visibility / Support
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

              {parentalShadows.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-purple-500" />
                    Parental Shadow (Parent's Planet in Child's 12th)
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The flip side of the 12th-House Mirror. When a parent's planet lands in a child's 12th house, the parent's unspoken energy lives inside the child's subconscious. When they seem reactive, check your own internal stress levels — they might be mirroring what you haven't said yet.
                  </p>
                  {parentalShadows.map((s, i) => (
                    <div key={i} className="border-l-2 border-purple-500/60 pl-3 bg-purple-500/5 py-2 rounded-r">
                      <div className="font-medium">
                        {s.parent}'s {s.parentPlanet} → {s.child}'s 12th
                      </div>
                      <p className="text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                </div>
              )}

                <div className="space-y-2">
                  <div className="font-semibold">Current Family Focus (Profections)</div>
                  <p className="text-xs text-muted-foreground">
                    Each member's active house this year. Same house = synergy. Squared or opposed houses = priority clash.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="py-1 pr-3">Person</th>
                          <th className="py-1 pr-3">Age</th>
                          <th className="py-1 pr-3">Active house</th>
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
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Priority Clashes</div>
                      {profectionAlignment.clashes.map((c, i) => (
                        <div key={i} className="border-l-2 border-amber-500/50 pl-3">
                          <div className="font-medium">
                            {c.memberA} ({ordinalShort(c.houseA)}) {c.relation === "square" ? "□" : "☍"} {c.memberB} ({ordinalShort(c.houseB)})
                          </div>
                          <p className="text-muted-foreground">{c.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {nodalDestiny.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Nodal Destiny</div>
                  <p className="text-xs text-muted-foreground">
                    A member's Sun or Moon sitting on another member's lunar nodes. North Node = The Teacher (where you're growing). South Node = The Comfort Zone (familiar, but the old pattern).
                  </p>
                  {nodalDestiny.map((n, i) => (
                    <div
                      key={i}
                      className={`border-l-2 pl-3 ${n.nodeType === "North" ? "border-primary/60" : "border-amber-500/50"}`}
                    >
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        <span>{n.contactorName}'s {n.contactorPlanet} ↔ {n.ownerName}'s {n.nodeType} Node</span>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {n.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">orb {n.orb.toFixed(2)}°</span>
                      </div>
                      <p className="text-muted-foreground">{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

    </div>
  );
};
