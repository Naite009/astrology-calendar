import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Compass, Check, HelpCircle, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LunarJournalEntry } from "@/hooks/useLunarJournal";

interface ThemeCandidate {
  title: string;
  whySuggested: string;
  bodyClues: string;
  lifeClues: string;
  draftIntentionStem: string;
}

interface ShiftArea {
  area: string;
  description: string;
}

interface ThemeFinderCardProps {
  journal: LunarJournalEntry | null;
  cycleSign: string;
  cycleDegree: number;
  chartName: string;
  natalHouse?: string;
  saveJournal: (u: Partial<LunarJournalEntry>) => void;
  initialCandidates?: ThemeCandidate[];
  initialShiftAreas?: ShiftArea[];
}

const PISCES_SEED_CANDIDATES: ThemeCandidate[] = [
  {
    title: "Strength and steadiness",
    whySuggested: "Your body is front and center — restricted breathing, stomach angst, back tension. You want to start heavy lifting and move more. The desire for physical strength is a clear signal.",
    bodyClues: "Restricted breathing, stomach angst, right-side back tension",
    lifeClues: "Want to start heavy lifting, eat healthier, focus on physical routines",
    draftIntentionStem: "I begin building a steadier and stronger relationship with my body.",
  },
  {
    title: "Letting direction form without forcing it",
    whySuggested: "You feel inspired by coding and building, but you're not ready to leap. The work direction is alive but still forming — and that's okay.",
    bodyClues: "Anxiety eases when you start working on the app",
    lifeClues: "Coding feels inspiring, but no clear commitment yet",
    draftIntentionStem: "I allow my next work direction to emerge without pressure.",
  },
  {
    title: "Healthier resilience",
    whySuggested: "Mental toughness, kids' sports frustration, and body stress signals suggest a need to redefine strength in a more supportive way — resilience that doesn't cost you your peace.",
    bodyClues: "Body tension patterns linked to performance pressure",
    lifeClues: "Focus on kids and mental toughness, frustration around wanting to be tougher but also gentler",
    draftIntentionStem: "I choose resilience that supports my body instead of stressing it.",
  },
];

const PISCES_SEED_SHIFTS: ShiftArea[] = [
  { area: "Body regulation", description: "Breathing and physical tension are active signals — your body is asking for a different relationship with stress." },
  { area: "Releasing performance pressure", description: "The push toward toughness and excellence may need softening into something more sustainable." },
  { area: "Allowing uncertainty", description: "You named 'inspiration' as your theme but also said what needs to shift is unclear — that forming state is valid and worth protecting." },
];

export const ThemeFinderCard = ({
  journal, cycleSign, cycleDegree, chartName, natalHouse, saveJournal,
  initialCandidates, initialShiftAreas,
}: ThemeFinderCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [candidates, setCandidates] = useState<ThemeCandidate[]>(initialCandidates || []);
  const [shiftAreas, setShiftAreas] = useState<ShiftArea[]>(initialShiftAreas || []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<number, string>>({});

  const hasReflections = Boolean(
    journal?.what_is_surfacing ||
    journal?.balsamic_dreams ||
    journal?.balsamic_morning_thoughts ||
    journal?.balsamic_needs_to_end ||
    journal?.real_life_body_signals ||
    journal?.real_life_emotional_reactions ||
    journal?.surprise_event ||
    journal?.real_life_what_happened
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCandidates([]);
    setShiftAreas([]);
    setSelectedIndex(null);
    setReactions({});

    try {
      const { data, error } = await supabase.functions.invoke("find-lunar-theme", {
        body: {
          cycleSign,
          cycleDegree,
          chartName,
          natalHouse,
          whatIsSurfacing: journal?.what_is_surfacing,
          balsamicDreams: journal?.balsamic_dreams,
          balsamicMorningThoughts: journal?.balsamic_morning_thoughts,
          balsamicNeedsToEnd: journal?.balsamic_needs_to_end,
          bodySignals: journal?.real_life_body_signals,
          emotionalReactions: journal?.real_life_emotional_reactions,
          surpriseEvent: journal?.surprise_event,
          whatHappened: journal?.real_life_what_happened,
          conversations: journal?.real_life_conversations,
          synchronicities: journal?.real_life_synchronicities,
          newMoonFeelings: journal?.new_moon_feelings,
          fatigue: journal?.balsamic_fatigue,
          withdrawal: journal?.balsamic_withdrawal,
        },
      });

      if (error) throw error;
      if (data?.candidates) setCandidates(data.candidates);
      if (data?.shiftAreas) setShiftAreas(data.shiftAreas);
    } catch {
      toast.error("Could not generate theme suggestions. Try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReaction = (idx: number, reaction: string) => {
    setReactions(prev => ({ ...prev, [idx]: reaction }));

    if (reaction === "right") {
      setSelectedIndex(idx);
      const c = candidates[idx];
      if (c) {
        saveJournal({
          new_moon_feelings: c.title,
          intention_status: "forming",
        });
        toast.success(`"${c.title}" set as your emerging theme`);
      }
    }
  };

  const handleUseStem = (stem: string) => {
    saveJournal({ new_moon_intentions: stem, intention_status: "forming" });
    toast.success("Draft intention added — keep refining it.");
  };

  return (
    <div className="space-y-4">
      {/* ── Theme Finder ── */}
      <Card className="border-border/30 bg-secondary/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🔍</span>
            <div>
              <h3 className="font-serif text-base font-medium text-foreground">What might this really be about?</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You don't need the answer yet. These are possible themes emerging from what you shared.
              </p>
            </div>
          </div>

          {!hasReflections && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border/20">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Start by writing in "What is surfacing" or the Balsamic section above. The more you share — body signals, dreams, worries, hopes — the better this can reflect back to you.
              </p>
            </div>
          )}

          {hasReflections && candidates.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full border-primary/20 hover:bg-primary/5"
            >
              {isGenerating ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Listening to what you've shared…</>
              ) : (
                <><Compass className="h-3.5 w-3.5 mr-1.5" /> Find emerging themes</>
              )}
            </Button>
          )}

          {candidates.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground italic">
                Here are possible themes emerging from what you shared. None of these is "the answer" — see which resonates.
              </p>

              {candidates.map((c, i) => {
                const reaction = reactions[i];
                const isSelected = selectedIndex === i;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border transition-all space-y-2.5 ${
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : reaction === "not_quite"
                        ? "border-border/20 bg-muted/10 opacity-60"
                        : "border-border/30 bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{i + 1}.</span>
                        <h4 className="text-sm font-medium text-foreground">{c.title}</h4>
                      </div>
                      {isSelected && <Badge className="text-[9px] bg-primary/15 text-primary border-primary/20">Selected</Badge>}
                    </div>

                    <p className="text-xs text-foreground/70 leading-relaxed">
                      <span className="text-muted-foreground font-medium">Why this may be surfacing: </span>
                      {c.whySuggested}
                    </p>

                    {c.bodyClues && (
                      <p className="text-[11px] text-foreground/60 leading-relaxed">
                        <span className="text-muted-foreground font-medium">Body clues: </span>{c.bodyClues}
                      </p>
                    )}

                    {c.lifeClues && (
                      <p className="text-[11px] text-foreground/60 leading-relaxed">
                        <span className="text-muted-foreground font-medium">Life clues: </span>{c.lifeClues}
                      </p>
                    )}

                    {c.draftIntentionStem && (
                      <div className="p-2.5 bg-primary/5 rounded border border-primary/10">
                        <p className="text-[11px] text-foreground/70 italic">"{c.draftIntentionStem}"</p>
                        {!journal?.new_moon_intentions && (
                          <button
                            onClick={() => handleUseStem(c.draftIntentionStem)}
                            className="text-[10px] text-primary hover:underline mt-1"
                          >
                            Use as draft intention →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reaction buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleReaction(i, "right")}
                        className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          reaction === "right"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" /> This feels right
                      </button>
                      <button
                        onClick={() => handleReaction(i, "maybe")}
                        className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          reaction === "maybe"
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "bg-background text-muted-foreground border-border hover:border-border"
                        }`}
                      >
                        <HelpCircle className="h-2.5 w-2.5" /> Maybe
                      </button>
                      <button
                        onClick={() => handleReaction(i, "not_quite")}
                        className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          reaction === "not_quite"
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-background text-muted-foreground border-border hover:border-border"
                        }`}
                      >
                        <Minus className="h-2.5 w-2.5" /> Not quite
                      </button>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full text-xs text-muted-foreground"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Compass className="h-3 w-3 mr-1" />}
                Regenerate suggestions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── What May Need to Shift ── */}
      {shiftAreas.length > 0 && (
        <Card className="border-border/20 bg-muted/10">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🌊</span>
              <div>
                <h3 className="font-serif text-sm font-medium text-foreground">What may need to shift?</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Gentle possibilities, not conclusions.</p>
              </div>
            </div>

            <div className="space-y-2">
              {shiftAreas.map((s, i) => (
                <div key={i} className="p-3 bg-background rounded-lg border border-border/20 space-y-1">
                  <p className="text-xs font-medium text-foreground">{s.area}</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
