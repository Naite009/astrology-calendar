import { useEffect, useState, useMemo } from "react";
import { Users, Plus, Trash2, ArrowRight, ArrowLeftRight, Heart, Sparkles, Loader2 } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChartSelector } from "@/components/ChartSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
} from "@/lib/parentChildSynastry";

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

  // Reset AI reading when pair changes
  useEffect(() => {
    setAiReading(null);
  }, [fromChartId, toChartId, fromRole, toRole]);

  const generateAiReading = async () => {
    if (!fromChart || !toChart || !report) return;
    if (report.rows.length === 0) {
      toast.error("No significant cross-aspects found between these two charts.");
      return;
    }
    setAiLoading(true);
    setAiReading(null);
    try {
      const payload = buildPairReadingPayload(fromChart, toChart, fromRole, toRole, report);
      const { data, error } = await supabase.functions.invoke("family-pair-reading", { body: payload });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiReading(data as PairReadingResponse);
    } catch (e: any) {
      console.error("[FamilyTab] AI reading failed", e);
      toast.error(e?.message || "Could not generate reading. Please try again.");
    } finally {
      setAiLoading(false);
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
            <ul className="divide-y divide-border">
              {members.map(m => (
                <li key={m.id} className="flex items-center justify-between py-2">
                  <div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Pair Reading
          </CardTitle>
          <CardDescription>
            Pick whose energy is the source (FROM) and whose nervous system is receiving (TO).
            Direction matters — a parent's Mars onto a child's Moon is a different reading than the reverse.
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
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {report.rows.length} cross-aspect{report.rows.length === 1 ? "" : "s"} found between{" "}
                {report.fromName} and {report.toName}.
              </div>
              <Button onClick={generateAiReading} disabled={aiLoading || report.rows.length === 0}>
                {aiLoading ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Reading…</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-1" /> Generate Reading</>
                )}
              </Button>
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
}: {
  reading: PairReadingResponse;
  fromName: string;
  toName: string;
  fromRole: FamilyRole;
  toRole: FamilyRole;
  childMoonProfile?: ChildMoonProfile | null;
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
