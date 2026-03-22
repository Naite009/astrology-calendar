import { useState, useMemo, useEffect } from "react";
import { SRActivationData } from "@/lib/solarReturnActivationWindows";
import { MetricTracker } from "./moonCycle/MetricTracker";
import { ThemeFinderCard } from "./moonCycle/ThemeFinderCard";
import { PatternsInsightsSection } from "./moonCycle/PatternsInsightsSection";
import {
  Moon, Sparkles, Save, History, Loader2, Heart, Eye, Zap, Target,
  RefreshCw, Wand2, BookOpen, ChevronDown, AlertCircle, Feather, Wind
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLunarJournal, LunarJournalEntry } from "@/hooks/useLunarJournal";
import { SignLunationData } from "@/lib/signLunationData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { getSignPractice } from "@/data/signAsPractice";

/* ─────────── constants ─────────── */

const HOUSE_PROMPTS: Record<number, string[]> = {
  1: ["How am I caring for my body and life force?", "How am I showing up in a new way?"],
  2: ["What am I valuing differently?", "What is happening around money, self-worth, or security?"],
  3: ["What conversations, errands, short trips, or messages are surfacing?", "How is my mind working right now?"],
  4: ["What is shifting in home, roots, or emotional foundation?", "What kind of inner safety do I need?"],
  5: ["What wants expression, play, creativity, or joy?", "What needs more softness and imagination?"],
  6: ["What is happening in daily routine, work, or health?", "What needs healing, simplification, or nervous system support?"],
  7: ["What am I learning through relationships and mirroring?", "What feels important in one-to-one connection?"],
  8: ["What is asking for surrender, intimacy, trust, or emotional honesty?", "Where am I in a process of deeper transformation?"],
  9: ["What belief, teaching, or perspective is shifting?", "What larger meaning is emerging?"],
  10: ["What public role, calling, or responsibility is changing?", "What needs to be done differently?"],
  11: ["What is moving through friendships, groups, or future goals?", "What collective dream feels alive?"],
  12: ["What needs retreat, quiet, dream time, and spiritual care?", "What is ending, dissolving, or asking for compassionate witnessing?"],
};

const HOUSE_TOPICS: Record<number, string> = {
  1: "identity · body · self-presentation",
  2: "money · values · security",
  3: "communication · siblings · learning",
  4: "home · family · roots",
  5: "creativity · romance · play",
  6: "work · health · routines",
  7: "relationships · agreements",
  8: "intimacy · fear · transformation",
  9: "beliefs · teaching · meaning",
  10: "career · visibility · calling",
  11: "friends · groups · future goals",
  12: "rest · dreams · solitude",
};

const PHASE_MESSAGING: Record<string, { message: string; energy: string }> = {
  balsamic:    { message: "You are still in the dark phase. Let the last cycle reduce down to its essence.", energy: "quiet · inward · surrender" },
  newMoon:     { message: "Something is emerging. You do not need to know yet. Let this form.", energy: "seed · darkness · potential" },
  firstQuarter:{ message: "Something is pushing. Where do you need courage, effort, or adjustment?", energy: "action · friction · building" },
  fullMoon:    { message: "Something has become visible. What peaked, ripened, or demanded acknowledgment?", energy: "culmination · emotion · clarity" },
  lastQuarter: { message: "Something is no longer needed. What is ready to be released?", energy: "integration · release · editing" },
};

const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

/* ─────────── types ─────────── */

interface KeyPhaseDates {
  firstQuarter: { date: Date; sign: string } | null;
  fullMoon: { date: Date; sign: string } | null;
  lastQuarter: { date: Date; sign: string } | null;
}

type PhaseKey = 'balsamic' | 'newMoon' | 'firstQuarter' | 'fullMoon' | 'lastQuarter';

interface LunarWorkbookSectionProps {
  chartId: string;
  chartName: string;
  cycleStartDate: Date;
  cycleSign: string;
  cycleDegree: number;
  keyPhases: KeyPhaseDates | null;
  signData: SignLunationData | null;
  balsamicStart: Date;
  balsamicEnd: Date;
  natalContext?: {
    natalPlanets?: string;
    newMoonHouse?: string;
    natalAspects?: string;
  };
  activationData?: SRActivationData | null;
}

/* ─────────── shared field ─────────── */

const JournalField = ({ label, placeholder, value, onChange, icon }: {
  label: string; placeholder: string; value: string | undefined;
  onChange: (v: string) => void; icon?: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium flex items-center gap-2">{icon}{label}</label>
    <Textarea placeholder={placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)}
      className="min-h-[90px] bg-background border-border/40 focus:border-primary/40 resize-none text-sm leading-relaxed" />
  </div>
);

/* ─────────── main component ─────────── */

export const LunarWorkbookSection = ({
  chartId, chartName, cycleStartDate, cycleSign, cycleDegree,
  keyPhases, signData, balsamicStart, balsamicEnd, natalContext, activationData,
}: LunarWorkbookSectionProps) => {
  const [simpleMode, setSimpleMode] = useState(true);
  const [isGeneratingIntentions, setIsGeneratingIntentions] = useState(false);
  const [interpretingCard, setInterpretingCard] = useState<'tarot' | 'oracle' | null>(null);

  const { journal, isLoading, isSaving, pastJournals, updateField, saveJournal } =
    useLunarJournal(chartId, cycleStartDate, cycleSign);

  const houseNum = natalContext?.newMoonHouse ? parseInt(natalContext.newMoonHouse, 10) : null;
  const signPractice = getSignPractice(cycleSign);
  const sameSignJournals = pastJournals.filter(pj => pj.cycle_sign === cycleSign);

  // ── Seed example data for first-time Pisces cycle ──
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded || !journal || journal.id || journal.what_is_surfacing) return;
    if (cycleSign !== 'Pisces') return;

    const seedData: Partial<LunarJournalEntry> = {
      what_is_surfacing: "Uneasy, heightened anxiety, focused on breathing. Slightly improved after doctor reassurance. Body feels tense — restricted breathing, stomach angst, right-side back tension. But warmer weather improved mood and coding feels inspiring. Increased dream recall.",
      intention_status: 'forming',
      new_moon_feelings: "Inspiration — wanting to build something meaningful, move my body more, start heavy lifting, eat healthier. Kids' sports and mental toughness feels important. But I'm not ready to commit to a clear direction yet.",
      balsamic_dreams: "1. Someone telling Lauren Ward she is very wealthy and her calmly agreeing.\n2. Forgetting to take care of a dog and not knowing how to feed another dog.",
      balsamic_morning_thoughts: "Breathing feels restricted first thing. Mind goes to body worries but also to what I want to build. The anxiety eases once I start moving or working on the app.",
      balsamic_fatigue: 6,
      balsamic_withdrawal: 4,
      real_life_body_signals: "Restricted breathing, stomach angst, right-side back tension",
      real_life_what_happened: "Doctor visit brought reassurance. Warmer weather shifted mood. Started getting inspired by coding and building this app.",
      real_life_emotional_reactions: "Anxiety heightened around body sensations, but eased after reassurance. Frustration around wanting to be tougher but also wanting to be gentler.",
      surprise_event: "Dream recall increased significantly. Warmer weather brought unexpected emotional relief.",
    };

    saveJournal(seedData);
    setSeeded(true);
  }, [journal, seeded, cycleSign, saveJournal]);

  const currentPhase = useMemo((): PhaseKey => {
    const now = new Date();
    if (now >= balsamicStart) return 'balsamic';
    if (keyPhases?.lastQuarter && now >= keyPhases.lastQuarter.date) return 'lastQuarter';
    if (keyPhases?.fullMoon && now >= keyPhases.fullMoon.date) return 'fullMoon';
    if (keyPhases?.firstQuarter && now >= keyPhases.firstQuarter.date) return 'firstQuarter';
    return 'newMoon';
  }, [keyPhases, balsamicStart]);

  const phaseMsg = PHASE_MESSAGING[currentPhase];

  const handleGenerateIntentions = async () => {
    setIsGeneratingIntentions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-intentions', {
        body: { cycleSign, cycleDegree, chartName, natalPlanets: natalContext?.natalPlanets,
          newMoonHouse: natalContext?.newMoonHouse, natalAspects: natalContext?.natalAspects,
          intentionWords: signData?.intentionWords }
      });
      if (error) throw error;
      if (data?.suggestions) { saveJournal({ ai_suggested_intentions: data.suggestions }); toast.success("Intentions generated"); }
    } catch { toast.error("Failed to generate intentions"); }
    finally { setIsGeneratingIntentions(false); }
  };

  const handleInterpretCard = async (cardType: 'tarot' | 'oracle') => {
    const cardName = cardType === 'tarot' ? journal?.tarot_card_name : journal?.oracle_card_name;
    if (!cardName?.trim()) { toast.error(`Enter a ${cardType} card name first`); return; }
    setInterpretingCard(cardType);
    try {
      const phaseName = currentPhase === 'newMoon' ? 'New Moon' : currentPhase === 'firstQuarter' ? 'First Quarter' : currentPhase === 'fullMoon' ? 'Full Moon' : currentPhase === 'lastQuarter' ? 'Last Quarter' : 'Balsamic';
      const { data, error } = await supabase.functions.invoke('interpret-cards', {
        body: {
          cardType,
          cardName: cardName.trim(),
          deckName: cardType === 'oracle' ? journal?.oracle_deck_name : undefined,
          cycleSign,
          phaseName,
          chartName,
          intentions: journal?.new_moon_intentions,
        }
      });
      if (error) throw error;
      if (data?.interpretation) {
        const field = cardType === 'tarot' ? 'tarot_ai_interpretation' : 'oracle_ai_interpretation';
        saveJournal({ [field]: data.interpretation });
        toast.success(`${cardType === 'tarot' ? 'Tarot' : 'Oracle'} card interpreted`);
      }
    } catch { toast.error("Failed to interpret card"); }
    finally { setInterpretingCard(null); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary/50" /></div>
  );

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="text-center space-y-2 py-4">
        <p className="text-3xl">☽</p>
        <h2 className="font-serif text-xl font-light tracking-wide text-foreground">Moon Cycle Workbook</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {cycleSign} New Moon at {cycleDegree}° · {cycleStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button onClick={() => setSimpleMode(!simpleMode)}
            className={`text-[10px] px-3 py-1 rounded-full border transition-all ${simpleMode ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}>
            {simpleMode ? '🌿 Simple' : '🔬 Advanced'}
          </button>
          {[
            { id: 'surfacing-section', label: '👁 Surfacing' },
            { id: 'phase-checkins-section', label: '🌗 Phases' },
            { id: 'intentions-section', label: '✨ Intentions' },
            { id: 'card-pulls-section', label: '🃏 Cards' },
            { id: 'metrics-section', label: '📊 Metrics' },
            { id: 'patterns-section', label: '🔮 Patterns' },
          ].map(nav => (
            <button key={nav.id} onClick={() => document.getElementById(nav.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-[10px] px-3 py-1 rounded-full border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all">
              {nav.label}
            </button>
          ))}
          <div className="flex items-center gap-1">
            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            {!isSaving && journal?.id && <Badge variant="secondary" className="text-[9px]"><Save className="h-2.5 w-2.5 mr-0.5" /> Saved</Badge>}
          </div>
        </div>
      </div>

      {/* ═══ 1 · Current Phase Header ═══ */}
      <Card className={`border-primary/20 ${currentPhase === 'balsamic' ? 'bg-muted/30' : 'bg-primary/5'}`}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentPhase === 'balsamic' ? '🌘' : currentPhase === 'newMoon' ? '🌑' : currentPhase === 'firstQuarter' ? '🌓' : currentPhase === 'fullMoon' ? '🌕' : '🌗'}</span>
              <div>
                <h3 className="font-serif text-base font-medium capitalize">{currentPhase === 'newMoon' ? 'New Moon' : currentPhase === 'firstQuarter' ? 'First Quarter' : currentPhase === 'fullMoon' ? 'Full Moon' : currentPhase === 'lastQuarter' ? 'Last Quarter' : 'Balsamic Moon'}</h3>
                <p className="text-xs text-muted-foreground">{phaseMsg.energy}</p>
              </div>
            </div>
            {houseNum && <Badge variant="outline" className="text-xs">{ordinal(houseNum)} House</Badge>}
          </div>
          <p className="text-sm text-foreground/80 italic leading-relaxed">{phaseMsg.message}</p>

          {/* Intention status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Intention:</span>
            {(['unclear', 'forming', 'ready'] as const).map(s => (
              <button key={s} onClick={() => saveJournal({ intention_status: s })}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize ${(journal?.intention_status || 'unclear') === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/40'}`}>
                {s === 'unclear' ? '🌫️ ' : s === 'forming' ? '🌱 ' : '✨ '}{s}
              </button>
            ))}
            <span className="text-[10px] text-muted-foreground ml-auto italic hidden sm:inline">
              {journal?.intention_status === 'unclear' ? 'You are still listening.' : journal?.intention_status === 'forming' ? 'Your intention is emerging.' : 'You have enough clarity to seed this cycle.'}
            </span>
          </div>

          {/* House reflection */}
          {houseNum && HOUSE_PROMPTS[houseNum] && (
            <div className="p-3 rounded-lg border border-primary/15 bg-background/50 space-y-2">
              <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Moon className="h-3 w-3" /> {ordinal(houseNum)} House — {HOUSE_TOPICS[houseNum]}
              </p>
              {HOUSE_PROMPTS[houseNum].map((p, i) => (
                <p key={i} className="text-xs text-foreground/70 italic flex items-start gap-1.5">
                  <span className="text-primary/60 mt-0.5">›</span>{p}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ 2 · Balsamic Distillation ═══ */}
      {(currentPhase === 'balsamic' || !simpleMode) && (
        <Card className="border-border/30 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" /> Balsamic Distillation
            </CardTitle>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              🕯️ Take things off your plate. Get quiet. Listen for what is rising up to be worked with next.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <JournalField label="What dreams are surfacing?" placeholder="Record any dreams, recurring images, nighttime impressions..."
              value={journal?.balsamic_dreams} onChange={v => saveJournal({ balsamic_dreams: v })} icon={<Moon className="h-4 w-4 text-muted-foreground" />} />
            <JournalField label="Morning thoughts & feelings" placeholder="What surfaces first thing? What worries or feelings greet you?"
              value={journal?.balsamic_morning_thoughts} onChange={v => saveJournal({ balsamic_morning_thoughts: v })} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-2 gap-4 p-3 bg-background/50 rounded-lg">
              <div className="space-y-1">
                <label className="text-xs flex items-center gap-1">😴 Fatigue</label>
                <input type="range" min={1} max={10} value={journal?.balsamic_fatigue ?? 5}
                  onChange={e => saveJournal({ balsamic_fatigue: parseInt(e.target.value) })} className="w-full accent-primary h-1.5" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>Low</span><span>{journal?.balsamic_fatigue ?? '—'}</span><span>High</span></div>
              </div>
              <div className="space-y-1">
                <label className="text-xs flex items-center gap-1">🚪 Withdrawal</label>
                <input type="range" min={1} max={10} value={journal?.balsamic_withdrawal ?? 5}
                  onChange={e => saveJournal({ balsamic_withdrawal: parseInt(e.target.value) })} className="w-full accent-primary h-1.5" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>Low</span><span>{journal?.balsamic_withdrawal ?? '—'}</span><span>Strong</span></div>
              </div>
            </div>
            <JournalField label="What needs to end?" placeholder="What has run its course? What feels complete?"
              value={journal?.balsamic_needs_to_end} onChange={v => saveJournal({ balsamic_needs_to_end: v })} icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />} />
            <JournalField label="What needs to come off your plate?" placeholder="What can you let go of, delegate, or stop?"
              value={journal?.balsamic_off_plate} onChange={v => saveJournal({ balsamic_off_plate: v })} icon={<Target className="h-4 w-4 text-muted-foreground" />} />
            <JournalField label="What wisdom are you carrying forward?" placeholder="What did this cycle teach you? What essence remains?"
              value={journal?.balsamic_reflections} onChange={v => updateField('balsamic_reflections', v)} icon={<Sparkles className="h-4 w-4 text-primary" />} />
          </CardContent>
        </Card>
      )}

      {/* ═══ 3 · Close Last Cycle ═══ */}
      {(currentPhase === 'balsamic' || currentPhase === 'newMoon' || !simpleMode) && (
        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/30 text-sm font-medium hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /> Close Last Cycle</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <p className="text-xs text-muted-foreground italic px-1">Close the last cycle before opening the next one. What do you carry forward? What do you leave behind?</p>
            <JournalField label="What began at the last New Moon?" placeholder="What intention, theme, or emotional piece opened?"
              value={journal?.balsamic_evolved} onChange={v => updateField('balsamic_evolved', v)} icon={<Moon className="h-4 w-4 text-muted-foreground" />} />
            <JournalField label="What changed through the cycle?" placeholder="How did things shift from seed to culmination to release?"
              value={journal?.balsamic_different} onChange={v => updateField('balsamic_different', v)} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
            <JournalField label="What truth are you carrying forward?" placeholder="What wisdom, shift, or realization remains?"
              value={journal?.cycle_wisdom} onChange={v => updateField('cycle_wisdom', v)} icon={<Heart className="h-4 w-4 text-primary" />} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ═══ 4 · What Is Surfacing ═══ */}
      <Card id="surfacing-section" className="border-2 border-primary/25 bg-primary/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <h3 className="font-serif text-base font-medium">What is surfacing right now?</h3>
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            Do not overthink. Choose the thing with emotion attached. What feels emotionally charged? What keeps coming up? What is your body telling you?
          </p>
          <Textarea placeholder="What feels important — even if small? What showed up in the last 2–3 days? What conversation, dream, reaction, or worry has emotion attached?"
            value={journal?.what_is_surfacing || ''} onChange={e => saveJournal({ what_is_surfacing: e.target.value })}
            className="min-h-[100px] bg-background border-border/40 text-sm resize-none leading-relaxed" />
        </CardContent>
      </Card>

      {/* ═══ Theme Finder ═══ */}
      <ThemeFinderCard
        journal={journal}
        cycleSign={cycleSign}
        cycleDegree={cycleDegree}
        chartName={chartName}
        natalHouse={natalContext?.newMoonHouse}
        saveJournal={saveJournal}
        seedPisces={cycleSign === 'Pisces' && !journal?.id}
      />

      {/* ═══ 5 · New Moon Seed / Intention ═══ */}
      {(currentPhase === 'newMoon' || !simpleMode) && (
        <Card id="intentions-section" className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> New Moon Seed
            </CardTitle>
            {journal?.intention_status !== 'ready' && (
              <p className="text-xs text-muted-foreground italic">
                {journal?.intention_status === 'forming' ? 'Your intention is emerging. Give it another day or two.' : 'You are still listening. Let the emotional truth form.'}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {signData && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/15">
                <p className="text-xs font-medium text-primary mb-1">✍️ Intention Words for {cycleSign}</p>
                <p className="text-xs text-muted-foreground italic">{signData.intentionWords.join(' · ')}</p>
              </div>
            )}
            <JournalField label="What wants to be worked with this cycle?" placeholder="What emotional theme feels alive now?"
              value={journal?.new_moon_feelings} onChange={v => updateField('new_moon_feelings', v)} icon={<Heart className="h-4 w-4 text-primary" />} />
            <JournalField label="Draft intention" placeholder="Write when emotionally clear. Allow the words to develop over 1–3 days if needed..."
              value={journal?.new_moon_intentions} onChange={v => updateField('new_moon_intentions', v)} icon={<Sparkles className="h-4 w-4 text-primary" />} />
            {!simpleMode && (
              <>
                <JournalField label="Why does this matter emotionally?" placeholder="What would it mean to hold this intention?"
                  value={journal?.new_moon_house_themes} onChange={v => updateField('new_moon_house_themes', v)} icon={<Target className="h-4 w-4 text-primary" />} />
                <JournalField label="What does this feel like in your body?" placeholder="Focus on sensations. What shifts when you name this?"
                  value={journal?.new_moon_body_sensations} onChange={v => updateField('new_moon_body_sensations', v)} icon={<Zap className="h-4 w-4 text-primary" />} />
                <Button variant="outline" size="sm" onClick={handleGenerateIntentions} disabled={isGeneratingIntentions} className="w-full">
                  {isGeneratingIntentions ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</> : <><Wand2 className="h-3 w-3 mr-1" /> AI Intention Suggestions</>}
                </Button>
                {journal?.ai_suggested_intentions && (
                  <div className="prose prose-sm dark:prose-invert bg-primary/5 p-3 rounded-lg border border-primary/15">
                    <ReactMarkdown>{journal.ai_suggested_intentions}</ReactMarkdown>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ 5b · New Moon Card Pulls ═══ */}
      <Card id="card-pulls-section" className="border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">🃏</span> New Moon Card Pulls
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">Pull a tarot and/or oracle card for this cycle. Enter the card name and get an AI interpretation tied to the {cycleSign} New Moon.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Tarot Card */}
          <div className="space-y-3 p-4 rounded-lg bg-secondary/20 border border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-base">🎴</span>
              <h4 className="text-xs font-medium uppercase tracking-widest text-foreground">Tarot Card</h4>
            </div>
            <div className="space-y-2">
              {(() => {
                const raw = journal?.tarot_card_name || '';
                const isReversed = raw.includes('(Reversed)');
                const baseName = raw.replace(' (Reversed)', '');
                return (
                  <>
                    <select
                      value={baseName}
                      onChange={e => {
                        const val = e.target.value;
                        saveJournal({ tarot_card_name: val ? (isReversed ? `${val} (Reversed)` : val) : '' });
                      }}
                      className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    >
                      <option value="">Select a card...</option>
                      <optgroup label="Major Arcana">
                        {["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"].map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Wands">
                        {["Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands","Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands","Page of Wands","Knight of Wands","Queen of Wands","King of Wands"].map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Cups">
                        {["Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups","Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups","Page of Cups","Knight of Cups","Queen of Cups","King of Cups"].map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Swords">
                        {["Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords","Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords","Page of Swords","Knight of Swords","Queen of Swords","King of Swords"].map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Pentacles">
                        {["Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles","Five of Pentacles","Six of Pentacles","Seven of Pentacles","Eight of Pentacles","Nine of Pentacles","Ten of Pentacles","Page of Pentacles","Knight of Pentacles","Queen of Pentacles","King of Pentacles"].map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        onClick={() => {
                          if (!baseName) return;
                          saveJournal({ tarot_card_name: isReversed ? baseName : `${baseName} (Reversed)` });
                        }}
                        disabled={!baseName}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          isReversed ? 'bg-primary' : 'bg-border'
                        } ${!baseName ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                          isReversed ? 'translate-x-5' : ''
                        }`} />
                      </button>
                      <span className={`text-xs ${isReversed ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        Reversed {isReversed ? '🔄' : ''}
                      </span>
                    </label>
                  </>
                );
              })()}
              <Textarea
                placeholder="Your own notes about this card — what struck you, what you felt when you saw it..."
                value={journal?.tarot_card_notes || ''}
                onChange={e => saveJournal({ tarot_card_notes: e.target.value })}
                className="min-h-[60px] bg-background border-border/40 text-sm resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInterpretCard('tarot')}
                disabled={interpretingCard === 'tarot' || !journal?.tarot_card_name?.trim()}
                className="w-full"
              >
                {interpretingCard === 'tarot' ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Interpreting...</> : <><Wand2 className="h-3 w-3 mr-1" /> Interpret This Card</>}
              </Button>
              {journal?.tarot_ai_interpretation && (
                <div className="prose prose-sm dark:prose-invert bg-primary/5 p-3 rounded-lg border border-primary/15">
                  <ReactMarkdown>{journal.tarot_ai_interpretation}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Oracle Card */}
          <div className="space-y-3 p-4 rounded-lg bg-secondary/20 border border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h4 className="text-xs font-medium uppercase tracking-widest text-foreground">Oracle Card</h4>
            </div>
            <div className="space-y-2">
              {/* Deck selector */}
              <select
                value={journal?.oracle_deck_name || ''}
                onChange={e => {
                  saveJournal({ oracle_deck_name: e.target.value, oracle_card_name: '' });
                }}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                <option value="">Choose a deck...</option>
                <option value="Moonology Oracle">🌙 Moonology Oracle (44 cards)</option>
                <option value="Other">✦ Other deck (type card name)</option>
              </select>

              {/* Card selector — Moonology populated, other = text input */}
              {journal?.oracle_deck_name === 'Moonology Oracle' ? (
                <select
                  value={journal?.oracle_card_name || ''}
                  onChange={e => saveJournal({ oracle_card_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                >
                  <option value="">Select a card...</option>
                  <optgroup label="Moon Phases">
                    {["New Moon — Beginnings","Crescent Moon — Commitment","First Quarter Moon — Crisis","Gibbous Moon — Potential","Full Moon — Climax","Disseminating Moon — Sharing","Third Quarter Moon — Trust","Balsamic Moon — Soothing"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="New Moon in Signs">
                    {["New Moon in Aries","New Moon in Taurus","New Moon in Gemini","New Moon in Cancer","New Moon in Leo","New Moon in Virgo","New Moon in Libra","New Moon in Scorpio","New Moon in Sagittarius","New Moon in Capricorn","New Moon in Aquarius","New Moon in Pisces"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Full Moon in Signs">
                    {["Full Moon in Aries","Full Moon in Taurus","Full Moon in Gemini","Full Moon in Cancer","Full Moon in Leo","Full Moon in Virgo","Full Moon in Libra","Full Moon in Scorpio","Full Moon in Sagittarius","Full Moon in Capricorn","Full Moon in Aquarius","Full Moon in Pisces"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Eclipse & Cycle Cards">
                    {["New Moon Eclipse — A New Start","Full Moon Eclipse — Climax","Waxing Moon — Courage","Waning Moon — Acceptance"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Special Cards">
                    {["Void of Course Moon — Just Be","Cardinal Moon — Action","Fixed Moon — Sturdy","Mutable Moon — Changeable","Supermoon — Exceptional","Blue Moon — A Rare Chance","Moon's South Node — Karma","Moon's North Node — Fulfilment"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              ) : journal?.oracle_deck_name === 'Other' ? (
                <>
                  <input
                    type="text"
                    placeholder="Deck name..."
                    value={(() => {
                      const dn = journal?.oracle_deck_name;
                      return dn === 'Other' ? '' : (dn || '');
                    })()}
                    onChange={e => {
                      // Store "Other:DeckName" pattern
                    }}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                  <input
                    type="text"
                    placeholder="Card name..."
                    value={journal?.oracle_card_name || ''}
                    onChange={e => saveJournal({ oracle_card_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </>
              ) : null}

              <Textarea
                placeholder="Your own notes — what the image or message stirred in you..."
                value={journal?.oracle_card_notes || ''}
                onChange={e => saveJournal({ oracle_card_notes: e.target.value })}
                className="min-h-[60px] bg-background border-border/40 text-sm resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInterpretCard('oracle')}
                disabled={interpretingCard === 'oracle' || !journal?.oracle_card_name?.trim()}
                className="w-full"
              >
                {interpretingCard === 'oracle' ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Interpreting...</> : <><Wand2 className="h-3 w-3 mr-1" /> Interpret This Card</>}
              </Button>
              {journal?.oracle_ai_interpretation && (
                <div className="prose prose-sm dark:prose-invert bg-primary/5 p-3 rounded-lg border border-primary/15">
                  <ReactMarkdown>{journal.oracle_ai_interpretation}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="phase-checkins-section" className="border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Phase Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={currentPhase}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {(['newMoon', 'firstQuarter', 'fullMoon', 'lastQuarter', 'balsamic'] as PhaseKey[]).map(p => (
                <TabsTrigger key={p} value={p} className="text-[10px] px-1">
                  {p === 'newMoon' ? '🌑' : p === 'firstQuarter' ? '🌓' : p === 'fullMoon' ? '🌕' : p === 'lastQuarter' ? '🌗' : '🌘'}
                  <span className="hidden sm:inline ml-1">{p === 'newMoon' ? 'New' : p === 'firstQuarter' ? '1st Q' : p === 'fullMoon' ? 'Full' : p === 'lastQuarter' ? 'Last Q' : 'Balsamic'}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="newMoon"><PhaseCheckin phase="newMoon" journal={journal} updateField={updateField} saveJournal={saveJournal} isCurrent={currentPhase === 'newMoon'} /></TabsContent>
            <TabsContent value="firstQuarter"><PhaseCheckin phase="firstQuarter" journal={journal} updateField={updateField} saveJournal={saveJournal} isCurrent={currentPhase === 'firstQuarter'} /></TabsContent>
            <TabsContent value="fullMoon"><PhaseCheckin phase="fullMoon" journal={journal} updateField={updateField} saveJournal={saveJournal} isCurrent={currentPhase === 'fullMoon'} /></TabsContent>
            <TabsContent value="lastQuarter"><PhaseCheckin phase="lastQuarter" journal={journal} updateField={updateField} saveJournal={saveJournal} isCurrent={currentPhase === 'lastQuarter'} /></TabsContent>
            <TabsContent value="balsamic"><PhaseCheckin phase="balsamic" journal={journal} updateField={updateField} saveJournal={saveJournal} isCurrent={currentPhase === 'balsamic'} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ═══ Surprise Tracker ═══ */}
      <div className="p-4 bg-secondary/15 rounded-lg border border-border/30 space-y-2">
        <div className="flex items-center gap-2">
          <span>⚡</span>
          <h4 className="text-xs font-medium">What happened that you did NOT expect?</h4>
        </div>
        <p className="text-[10px] text-muted-foreground italic">Follow this. Unexpected = often the real movement of the cycle.</p>
        <Textarea placeholder="Any surprises, unexpected events, or things you didn't see coming?"
          value={journal?.surprise_event || ''} onChange={e => saveJournal({ surprise_event: e.target.value })}
          className="min-h-[60px] bg-background border-border/40 text-sm resize-none" />
      </div>

      {/* ═══ Real Life Event Log ═══ */}
      <Collapsible>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-secondary/15 rounded-lg border border-border/30 text-sm font-medium hover:bg-secondary/25 transition-colors">
          <span className="flex items-center gap-2">📋 Real Life Event Log</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <JournalField label="What actually happened?" placeholder="Events, shifts, conversations, decisions..."
            value={journal?.real_life_what_happened} onChange={v => saveJournal({ real_life_what_happened: v })} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
          <JournalField label="Important conversations?" placeholder="What was said that matters?"
            value={journal?.real_life_conversations} onChange={v => saveJournal({ real_life_conversations: v })} icon={<Target className="h-4 w-4 text-muted-foreground" />} />
          <JournalField label="Body signals?" placeholder="Tension, fatigue, energy shifts..."
            value={journal?.real_life_body_signals} onChange={v => saveJournal({ real_life_body_signals: v })} icon={<Heart className="h-4 w-4 text-muted-foreground" />} />
          <JournalField label="Synchronicities?" placeholder="Repeated numbers, themes, meaningful coincidences..."
            value={journal?.real_life_synchronicities} onChange={v => saveJournal({ real_life_synchronicities: v })} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />
          <JournalField label="Emotional reactions?" placeholder="What triggered you? What moved you?"
            value={journal?.real_life_emotional_reactions} onChange={v => saveJournal({ real_life_emotional_reactions: v })} icon={<Zap className="h-4 w-4 text-muted-foreground" />} />
          <JournalField label="Something repeated?" placeholder="Themes, patterns, situations that keep showing up..."
            value={journal?.real_life_repeated} onChange={v => saveJournal({ real_life_repeated: v })} icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />} />
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Body State + Metrics ═══ */}
      <div id="metrics-section">
      <MetricTracker energy={journal?.energy ?? null} stress={journal?.stress ?? null}
        sleepQuality={journal?.sleep_quality ?? null} sensitivity={journal?.body_sensitivity ?? null}
        dreamIntensity={journal?.dream_intensity ?? null} tags={(journal?.tags as string[]) ?? []}
        journalText={journal?.journal_text ?? ""}
        onMetricChange={(f, v) => saveJournal({ [f]: v })}
        onTagsChange={tags => saveJournal({ tags })}
        onJournalTextChange={text => saveJournal({ journal_text: text })} />
      </div>

      {/* ═══ 7 · Natal Overlay ═══ */}
      {!simpleMode && natalContext && (
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Natal Overlay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-1">Lunation</p>
                <p className="font-medium">{cycleDegree}° {cycleSign}</p>
              </div>
              {houseNum && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground mb-1">Natal House</p>
                  <p className="font-medium">{ordinal(houseNum)} House</p>
                  <p className="text-[10px] text-muted-foreground">{HOUSE_TOPICS[houseNum]}</p>
                </div>
              )}
            </div>
            {natalContext.natalAspects && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-1">Natal Aspects Activated</p>
                <p className="text-foreground/80">{natalContext.natalAspects}</p>
              </div>
            )}
            {natalContext.natalPlanets && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-1">Nearby Natal Planets</p>
                <p className="text-foreground/80">{natalContext.natalPlanets}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ 8 · Same-Sign Recall ═══ */}
      {sameSignJournals.length > 0 && (
        <Card className="border-primary/15 bg-primary/5">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Same-Sign Recall — Past {cycleSign} New Moons
            </CardTitle>
            <p className="text-[11px] text-muted-foreground italic">This cycle is echoing an earlier one. What patterns keep returning?</p>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {sameSignJournals.slice(0, 5).map(pj => {
              const theme = pj.what_is_surfacing || pj.new_moon_feelings;
              const outcome = pj.full_moon_showing_up || pj.real_life_what_happened || pj.cycle_wisdom;
              return (
                <div key={pj.id} className="p-3 bg-background rounded-lg border border-border/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      🌑 {new Date(pj.cycle_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      {pj.moon_house && <Badge variant="outline" className="text-[9px] px-1.5 py-0">{ordinal(pj.moon_house)} house</Badge>}
                    </span>
                  </div>
                  {theme && <p className="text-xs text-foreground/70 italic line-clamp-2"><span className="text-muted-foreground font-medium not-italic">Theme: </span>{theme}</p>}
                  {pj.new_moon_intentions && <p className="text-xs text-foreground/70 italic line-clamp-2"><span className="text-muted-foreground font-medium not-italic">Intention: </span>"{pj.new_moon_intentions}"</p>}
                  {outcome && <p className="text-xs text-foreground/70 line-clamp-2"><span className="text-muted-foreground font-medium">What happened: </span>{outcome}</p>}
                  {pj.surprise_event && <p className="text-xs text-foreground/70 line-clamp-1"><span className="text-muted-foreground font-medium">⚡ Surprise: </span>{pj.surprise_event}</p>}
                </div>
              );
            })}
            {sameSignJournals.length >= 3 && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/15">
                <p className="text-[11px] font-medium text-primary flex items-center gap-1.5 mb-1"><RefreshCw className="h-3 w-3" /> Pattern across {sameSignJournals.length} {cycleSign} cycles</p>
                <p className="text-[11px] text-foreground/60 italic">What emotions, life areas, or surprises keep showing up? That's your {cycleSign} signature.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ 10 · Cycle Essence Summary ═══ */}
      {(currentPhase === 'lastQuarter' || currentPhase === 'balsamic' || !simpleMode) && (
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Feather className="h-4 w-4 text-primary" /> Essence of This Cycle
            </CardTitle>
            <p className="text-xs text-muted-foreground italic">What was this cycle really about?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <JournalField label="What this cycle was really about" placeholder="In a sentence or two, what was the core emotional truth?"
              value={journal?.cycle_wisdom} onChange={v => updateField('cycle_wisdom', v)} icon={<Heart className="h-4 w-4 text-primary" />} />
            <JournalField label="What stirred for the next cycle?" placeholder="What early signals are forming? What wants attention next?"
              value={journal?.cycle_next_stirrings} onChange={v => updateField('cycle_next_stirrings', v)} icon={<Sparkles className="h-4 w-4 text-primary" />} />
          </CardContent>
        </Card>
      )}

      {/* ═══ 9 · Patterns + Insights ═══ */}
      <div id="patterns-section">
      <PatternsInsightsSection
        pastJournals={pastJournals}
        currentJournal={journal}
        cycleSign={cycleSign}
      />
      </div>

      {/* ═══ 11 · Sign-as-Practice / Learn Your Chart ═══ */}
      {signPractice && (
        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/15 text-sm font-medium hover:bg-primary/10 transition-colors">
            <span className="flex items-center gap-2">🌿 {cycleSign} as Practice — Learn Your Chart Through the Moon</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4 px-1">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              Each lunation activates a piece of your natal chart. By tracking how {cycleSign} New Moons feel over time, you learn what this sign means <em>for you</em> — not from a textbook, but from lived experience.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {signPractice.keywords.map(kw => (
                <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">Embodied Prompts</p>
              {signPractice.prompts.map((p, i) => (
                <p key={i} className="text-xs text-foreground/70 italic flex items-start gap-1.5"><span className="text-primary/60 mt-0.5">›</span>{p}</p>
              ))}
            </div>
            {!simpleMode && (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Shadow Prompts</p>
                  {signPractice.shadowPrompts.map((p, i) => (
                    <p key={i} className="text-xs text-foreground/60 italic flex items-start gap-1.5"><span className="text-muted-foreground mt-0.5">›</span>{p}</p>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Ritual Ideas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {signPractice.ritualIdeas.map(r => (
                      <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ═══ Past Cycles ═══ */}
      {pastJournals.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/30 text-sm font-medium hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" /> Past Cycles ({pastJournals.length})</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <ScrollArea className="h-[200px]">
              <div className="grid gap-2">
                {pastJournals.map(pj => (
                  <div key={pj.id} className="p-3 bg-background rounded-lg border border-border/30 text-xs cursor-pointer hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">🌑 {pj.cycle_sign} — {new Date(pj.cycle_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      {pj.new_moon_intentions && <Badge variant="outline" className="text-[9px]">Journaled</Badge>}
                    </div>
                    {pj.new_moon_intentions && <p className="text-muted-foreground italic line-clamp-1 mt-1">"{pj.new_moon_intentions}"</p>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

/* ─────────── Phase Check-in sub-component ─────────── */

function PhaseCheckin({ phase, journal, updateField, saveJournal, isCurrent }: {
  phase: PhaseKey; journal: LunarJournalEntry | null;
  updateField: (f: keyof LunarJournalEntry, v: string) => void;
  saveJournal: (u: Partial<LunarJournalEntry>) => void;
  isCurrent: boolean;
}) {
  const messaging = PHASE_MESSAGING[phase];
  return (
    <div className="space-y-3">
      {isCurrent && (
        <div className="flex items-center gap-2 p-2.5 bg-primary/10 border border-primary/25 rounded-lg">
          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs font-medium">You're in this phase now</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground italic border-l-2 border-primary/25 pl-3">{messaging.message}</p>

      {phase === 'newMoon' && (
        <JournalField label="What wants to be worked with?" placeholder="What emotional theme feels alive?"
          value={journal?.new_moon_feelings} onChange={v => updateField('new_moon_feelings', v)} icon={<Heart className="h-4 w-4 text-primary" />} />
      )}
      {phase === 'firstQuarter' && (
        <>
          <JournalField label="What action is shaping this cycle?" placeholder="What tension, decision, or courage is needed?"
            value={journal?.first_quarter_showing_up} onChange={v => updateField('first_quarter_showing_up', v)} icon={<Zap className="h-4 w-4 text-primary" />} />
          <JournalField label="What action actually moved the story?" placeholder="What decision did you make?"
            value={journal?.first_quarter_adjustments} onChange={v => updateField('first_quarter_adjustments', v)} icon={<RefreshCw className="h-4 w-4 text-primary" />} />
        </>
      )}
      {phase === 'fullMoon' && (
        <>
          <JournalField label="What came to light?" placeholder="What became obvious, emotional, or visible?"
            value={journal?.full_moon_showing_up} onChange={v => updateField('full_moon_showing_up', v)} icon={<Eye className="h-4 w-4 text-primary" />} />
          <JournalField label="What needs release?" placeholder="What peaked and now asks to be let go?"
            value={journal?.full_moon_releasing} onChange={v => updateField('full_moon_releasing', v)} icon={<RefreshCw className="h-4 w-4 text-primary" />} />
        </>
      )}
      {phase === 'lastQuarter' && (
        <>
          <JournalField label="What no longer fits?" placeholder="What has run its course?"
            value={journal?.last_quarter_showing_up} onChange={v => updateField('last_quarter_showing_up', v)} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
          <JournalField label="What lesson did this cycle teach?" placeholder="What did you learn?"
            value={journal?.last_quarter_letting_go} onChange={v => updateField('last_quarter_letting_go', v)} icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />} />
        </>
      )}
      {phase === 'balsamic' && (
        <JournalField label="What is rising up to be worked with next?" placeholder="Dreams, morning feelings, fatigue, quiet signals..."
          value={journal?.balsamic_reflections} onChange={v => updateField('balsamic_reflections', v)} icon={<Moon className="h-4 w-4 text-muted-foreground" />} />
      )}
    </div>
  );
}
