import { useEffect, useState, useMemo } from "react";
import { Users, Plus, Trash2, ArrowRight, ArrowLeftRight, Heart, Sparkles, Loader2, Home, History, RotateCw } from "lucide-react";
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
} from "@/lib/familySystemSynastry";

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
    sel
      .map((s) => `${s.chart.id}:${s.role}`)
      .sort()
      .join("|");

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
    setSystemReading(found ? (found.payload as FamilySystemReadingResponse) : null);
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
        setSystemReading(cached.payload as FamilySystemReadingResponse);
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
      setSystemReading(resp as FamilySystemReadingResponse);
      const label = selectedMembers.map((s) => s.chart.name).join(", ");
      await saveReading("system", key, label, resp);
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
        <FamilySystemReadingView reading={systemReading} />
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

const FamilySystemReadingView = ({ reading }: { reading: FamilySystemReadingResponse }) => {
  return (
    <div className="space-y-4">
      {reading.householdRegulationPattern && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              Household Regulation Pattern
            </CardTitle>
            <CardDescription className="pt-1">
              How the parent or caregiver sets the emotional tone, conflict style, and repair pattern.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-sm">
            <p>{reading.householdRegulationPattern}</p>
          </CardContent>
        </Card>
      )}

      {reading.childAdaptations?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How Each Child Adapts</CardTitle>
            <CardDescription>
              Each child's regulation style based on Moon, Saturn/Chiron sensitivity, Mercury/Mars pattern, and parent-child synastry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {reading.childAdaptations.map((c, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <div className="font-semibold">{c.name}</div>
                <p className="text-muted-foreground">{c.line}</p>
                {c.respondsBestWhen && c.respondsBestWhen.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">Responds Best When</div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-0.5">
                      {c.respondsBestWhen.map((r, ri) => <li key={ri}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {c.inTheMoment && c.inTheMoment.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">What To Do In The Moment</div>
                    <div className="space-y-2 mt-1">
                      {c.inTheMoment.map((m, mi) => (
                        <div key={mi}>
                          <div className="text-xs font-medium">{m.scenario}</div>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            {m.actions.map((a, ai) => <li key={ai}>{a}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {c.whatMakesItWorse && c.whatMakesItWorse.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-destructive">What Makes It Worse</div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-0.5">
                      {c.whatMakesItWorse.map((w, wi) => <li key={wi}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reading.siblingPressurePoints?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sibling Pressure Points</CardTitle>
            <CardDescription>How each child experiences their siblings, from their own perspective. Based on exact synastry between siblings only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {reading.siblingPressurePoints.map((p, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <div className="font-semibold">{p.name}</div>
                <p className="text-muted-foreground whitespace-pre-line">{p.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reading.whatEscalates?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What Escalates the Household</CardTitle>
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

      {reading.whatHelps && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What Actually Helps This Family
            </CardTitle>
            <CardDescription>Realistic, low-pressure practices that fit this family's nervous systems.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{reading.whatHelps}</p>
          </CardContent>
        </Card>
      )}

      {reading.householdInTheMoment && reading.householdInTheMoment.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What To Do In The Moment (Household)
            </CardTitle>
            <CardDescription className="pt-1">
              Real-time de-escalation actions for common household scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            {reading.householdInTheMoment.map((m, i) => (
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

      {reading.householdMakesItWorse && reading.householdMakesItWorse.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader className="pb-3 bg-destructive/10 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-destructive" />
              What Makes It Worse (Household)
            </CardTitle>
            <CardDescription className="pt-1">
              Common household-level patterns that reliably escalate the whole system. Avoid these.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-sm">
            <ul className="list-disc list-inside space-y-1">
              {reading.householdMakesItWorse.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
