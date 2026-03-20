import { useState, useMemo } from "react";
import { SRActivationData } from "@/lib/solarReturnActivationWindows";
import { MetricTracker } from "./moonCycle/MetricTracker";
import { 
  Moon, 
  Sparkles, 
  Save, 
  History, 
  Loader2,
  Heart,
  Eye,
  Zap,
  Target,
  RefreshCw,
  Wand2,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLunarJournal, LunarJournalEntry } from "@/hooks/useLunarJournal";
import { SignLunationData } from "@/lib/signLunationData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { JournalContextBanner } from "@/components/solarReturn/JournalContextBanner";

interface KeyPhaseDates {
  firstQuarter: { date: Date; sign: string } | null;
  fullMoon: { date: Date; sign: string } | null;
  lastQuarter: { date: Date; sign: string } | null;
}

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
  1: "identity · body · self-presentation · personal beginnings",
  2: "money · values · security · possessions",
  3: "communication · writing · siblings · short trips · learning",
  4: "home · family · roots · private life",
  5: "creativity · romance · joy · children · play",
  6: "work · health · routines · service",
  7: "relationships · clients · agreements · mirroring",
  8: "shared resources · fear · intimacy · psychology",
  9: "beliefs · teaching · publishing · travel · meaning",
  10: "career · visibility · reputation · calling",
  11: "friends · groups · future goals · audience",
  12: "rest · retreat · dreams · grief · solitude · spiritual clearing",
};

const PHASE_CONFIG = {
  newMoon: {
    emoji: "🌑",
    title: "New Moon",
    subtitle: "Seed + New Beginning",
    description: "Name the next emotional piece and begin working with it. Allow the intention to develop over a day or two if needed. Honor the darkness and not-knowing. Work with what is feeling important to the heart right now.",
  },
  firstQuarter: {
    emoji: "🌓",
    title: "First Quarter",
    subtitle: "Action + Friction",
    description: "Notice choices, effort, resistance, and movement. Something is pushing this cycle forward. Where do you need courage, effort, or adjustment?",
  },
  fullMoon: {
    emoji: "🌕",
    title: "Full Moon",
    subtitle: "Culmination + Visibility",
    description: "Notice what becomes clear, emotional, visible, or complete. The fruit is ripe. What peaked, ripened, or demanded acknowledgment?",
  },
  lastQuarter: {
    emoji: "🌗",
    title: "Last Quarter",
    subtitle: "Integration + Release",
    description: "Reflect on what is no longer working and what is ready to be let go. Tie up loose ends. What lesson did this cycle teach?",
  },
  balsamic: {
    emoji: "🌘",
    title: "Balsamic Moon",
    subtitle: "Sacred Listening Window",
    description: "Take things off your plate. Get quiet. Pay attention to dreams and early morning feelings. Do not overload yourself. Listen for the next emotional piece asking to be held.",
  }
};

type PhaseKey = keyof typeof PHASE_CONFIG;
const PHASE_ORDER: PhaseKey[] = ['newMoon', 'firstQuarter', 'fullMoon', 'lastQuarter', 'balsamic'];

interface JournalFieldProps {
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

const JournalField = ({ label, placeholder, value, onChange, icon }: JournalFieldProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium flex items-center gap-2">
      {icon}
      {label}
    </label>
    <Textarea
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[100px] bg-background border-border/50 focus:border-primary/50 resize-none"
    />
  </div>
);

// Guided mode step component
const GuidedStep = ({ 
  stepNumber, 
  totalSteps, 
  children, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast 
}: { 
  stepNumber: number; 
  totalSteps: number; 
  children: React.ReactNode; 
  onNext: () => void; 
  onPrev: () => void; 
  isFirst: boolean; 
  isLast: boolean; 
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
      <span>Step {stepNumber} of {totalSteps}</span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i < stepNumber ? 'bg-primary' : 'bg-muted'}`} 
          />
        ))}
      </div>
    </div>
    {children}
    <div className="flex justify-between pt-4">
      <Button variant="outline" onClick={onPrev} disabled={isFirst}>
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      <Button onClick={onNext} disabled={isLast}>
        {isLast ? 'Complete' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);

// Card section for tarot/oracle
const CardDrawSection = ({ 
  cardType,
  cardName,
  deckName,
  notes,
  interpretation,
  onCardNameChange,
  onDeckNameChange,
  onNotesChange,
  onInterpret,
  isInterpreting,
  cycleSign,
  phaseName
}: {
  cardType: 'tarot' | 'oracle';
  cardName?: string;
  deckName?: string;
  notes?: string;
  interpretation?: string;
  onCardNameChange: (v: string) => void;
  onDeckNameChange?: (v: string) => void;
  onNotesChange: (v: string) => void;
  onInterpret: () => void;
  isInterpreting: boolean;
  cycleSign: string;
  phaseName: string;
}) => (
  <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border/50">
    <div className="flex items-center gap-2">
      <span className="text-2xl">{cardType === 'tarot' ? '🃏' : '✨'}</span>
      <h4 className="font-medium">{cardType === 'tarot' ? 'Tarot Card' : 'Oracle Card'}</h4>
    </div>
    
    <div className="grid gap-3">
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Card Name</label>
        <Input 
          placeholder={cardType === 'tarot' ? "e.g., The Star, Three of Cups" : "e.g., Transformation, Inner Wisdom"}
          value={cardName || ''}
          onChange={(e) => onCardNameChange(e.target.value)}
        />
      </div>
      
      {cardType === 'oracle' && onDeckNameChange && (
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Deck Name (optional)</label>
          <Input 
            placeholder="e.g., Moonology, Work Your Light"
            value={deckName || ''}
            onChange={(e) => onDeckNameChange(e.target.value)}
          />
        </div>
      )}
      
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Your Initial Thoughts</label>
        <Textarea 
          placeholder="What did you feel when you drew this card? What stood out?"
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      
      {cardName && (
        <Button 
          variant="outline" 
          onClick={onInterpret}
          disabled={isInterpreting || !cardName}
          className="w-full"
        >
          {isInterpreting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Interpreting...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Get AI Interpretation
            </>
          )}
        </Button>
      )}
      
      {interpretation && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary mb-2">✨ Card Interpretation</p>
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Phase prompt banner
const PhasePromptBanner = ({ phase, phaseDate, isActive }: { phase: PhaseKey; phaseDate?: Date; isActive: boolean }) => {
  if (!isActive) return null;
  
  const config = PHASE_CONFIG[phase];
  const dateStr = phaseDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg mb-4">
      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
      <div>
        <p className="font-medium text-sm">It's time to journal for the {config.title}!</p>
        <p className="text-xs text-muted-foreground">
          {dateStr ? `${config.title} was ${dateStr}` : config.subtitle}
        </p>
      </div>
    </div>
  );
};

// Past journal viewer
const PastJournalCard = ({ journal, onSelect }: { journal: LunarJournalEntry; onSelect: () => void }) => {
  const startDate = new Date(journal.cycle_start_date);
  const hasContent = journal.new_moon_intentions || journal.balsamic_evolved || journal.tarot_card_name;
  
  return (
    <Card 
      className={`cursor-pointer hover:border-primary/50 transition-colors ${hasContent ? 'border-primary/20' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌑</span>
            <div>
              <p className="font-medium">{journal.cycle_sign} New Moon</p>
              <p className="text-xs text-muted-foreground">
                {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          {hasContent && (
            <Badge variant="outline" className="text-xs">
              Journaled
            </Badge>
          )}
        </div>
        {journal.new_moon_intentions && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
            "{journal.new_moon_intentions}"
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const LunarWorkbookSection = ({
  chartId,
  chartName,
  cycleStartDate,
  cycleSign,
  cycleDegree,
  keyPhases,
  signData,
  balsamicStart,
  balsamicEnd,
  natalContext,
  activationData,
}: LunarWorkbookSectionProps) => {
  const [activePhase, setActivePhase] = useState<PhaseKey>('newMoon');
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [isGeneratingIntentions, setIsGeneratingIntentions] = useState(false);
  const [isInterpretingTarot, setIsInterpretingTarot] = useState(false);
  const [isInterpretingOracle, setIsInterpretingOracle] = useState(false);
  const [selectedPastJournal, setSelectedPastJournal] = useState<LunarJournalEntry | null>(null);
  const [simpleMode, setSimpleMode] = useState(true);
  
  const { 
    journal, 
    isLoading, 
    isSaving, 
    pastJournals, 
    updateField,
    saveJournal
  } = useLunarJournal(chartId, cycleStartDate, cycleSign);

  // Determine which phase we're currently in based on dates
  const currentPhase = useMemo((): PhaseKey => {
    const now = new Date();
    if (keyPhases?.lastQuarter && now >= keyPhases.lastQuarter.date) {
      return now >= balsamicStart ? 'balsamic' : 'lastQuarter';
    }
    if (keyPhases?.fullMoon && now >= keyPhases.fullMoon.date) return 'fullMoon';
    if (keyPhases?.firstQuarter && now >= keyPhases.firstQuarter.date) return 'firstQuarter';
    return 'newMoon';
  }, [keyPhases, balsamicStart]);

  const getPhaseDate = (phase: PhaseKey): Date | undefined => {
    switch (phase) {
      case 'newMoon': return cycleStartDate;
      case 'firstQuarter': return keyPhases?.firstQuarter?.date;
      case 'fullMoon': return keyPhases?.fullMoon?.date;
      case 'lastQuarter': return keyPhases?.lastQuarter?.date;
      case 'balsamic': return balsamicStart;
      default: return undefined;
    }
  };

  // Guided mode steps for New Moon phase
  const newMoonSteps = [
    { field: 'new_moon_feelings', label: "What wants to be worked with this cycle?", placeholder: "What is surfacing from within? What emotional theme feels alive now?", icon: <Heart className="h-4 w-4 text-rose-500" /> },
    { field: 'new_moon_showing_up', label: "What is showing up in your life?", placeholder: "What is the world reflecting back to you?", icon: <Eye className="h-4 w-4 text-amber-500" /> },
    { field: 'new_moon_house_themes', label: "House Themes", placeholder: "What area of life is being illuminated? What would it mean to nurture this gently?", icon: <Target className="h-4 w-4 text-primary" /> },
    { field: 'new_moon_intentions', label: "Intention(s) for this cycle", placeholder: "Write when emotionally clear. Allow the words to develop over a day or two if needed...", icon: <Sparkles className="h-4 w-4 text-primary" /> },
    { field: 'new_moon_body_sensations', label: "How would I feel with this present?", placeholder: "Focus on sensations in your body. What does it feel like to hold this intention?", icon: <Zap className="h-4 w-4 text-purple-500" /> },
  ];

  const handleGenerateIntentions = async () => {
    setIsGeneratingIntentions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-intentions', {
        body: {
          cycleSign,
          cycleDegree,
          chartName,
          natalPlanets: natalContext?.natalPlanets,
          newMoonHouse: natalContext?.newMoonHouse,
          natalAspects: natalContext?.natalAspects,
          intentionWords: signData?.intentionWords
        }
      });

      if (error) throw error;
      if (data?.suggestions) {
        saveJournal({ ai_suggested_intentions: data.suggestions });
        toast.success("AI intentions generated!");
      }
    } catch (err) {
      console.error("Failed to generate intentions:", err);
      toast.error("Failed to generate intentions");
    } finally {
      setIsGeneratingIntentions(false);
    }
  };

  const handleInterpretCard = async (cardType: 'tarot' | 'oracle') => {
    const setLoading = cardType === 'tarot' ? setIsInterpretingTarot : setIsInterpretingOracle;
    const cardName = cardType === 'tarot' ? journal?.tarot_card_name : journal?.oracle_card_name;
    const deckName = cardType === 'oracle' ? journal?.oracle_deck_name : undefined;
    
    if (!cardName) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('interpret-cards', {
        body: {
          cardType,
          cardName,
          deckName,
          cycleSign,
          phaseName: PHASE_CONFIG[activePhase].title,
          chartName,
          intentions: journal?.new_moon_intentions
        }
      });

      if (error) throw error;
      if (data?.interpretation) {
        const field = cardType === 'tarot' ? 'tarot_ai_interpretation' : 'oracle_ai_interpretation';
        saveJournal({ [field]: data.interpretation });
        toast.success("Card interpreted!");
      }
    } catch (err) {
      console.error("Failed to interpret card:", err);
      toast.error("Failed to interpret card");
    } finally {
      setLoading(false);
    }
  };

  const renderPhaseContent = (phase: PhaseKey) => {
    const config = PHASE_CONFIG[phase];
    const phaseDate = getPhaseDate(phase);
    const isCurrentPhase = phase === currentPhase;

    return (
      <div className="space-y-4">
        <PhasePromptBanner phase={phase} phaseDate={phaseDate} isActive={isCurrentPhase} />
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{config.emoji}</span>
          <div>
            <h3 className="font-medium">{config.title}</h3>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
          {phaseDate && (
            <Badge variant="secondary" className="ml-auto">
              {phaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-foreground/80 italic border-l-2 border-primary/30 pl-3 mb-4">
          {config.description}
        </p>

        {(() => {
          const houseNum = natalContext?.newMoonHouse ? parseInt(natalContext.newMoonHouse, 10) : null;
          const prompts = houseNum ? HOUSE_PROMPTS[houseNum] : null;
          const topics = houseNum ? HOUSE_TOPICS[houseNum] : null;
          if (!houseNum || !prompts) return null;
          return (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">
                  {ordinal(houseNum)} House Reflection
                </h4>
                <Badge variant="outline" className="ml-auto text-xs">{topics}</Badge>
              </div>
              <ul className="space-y-2">
                {prompts.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="text-primary mt-0.5">›</span>
                    <span className="italic">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {renderPhaseFields(phase)}
      </div>
    );
  };

  const renderPhaseFields = (phase: PhaseKey) => {
    switch (phase) {
      case 'newMoon':
        return (
          <div className="space-y-4">
            {/* AI Intentions */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  AI Intention Suggestions
                </h4>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateIntentions}
                  disabled={isGeneratingIntentions}
                >
                  {isGeneratingIntentions ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-3 w-3 mr-1" /> Generate</>
                  )}
                </Button>
              </div>
              {journal?.ai_suggested_intentions ? (
                <div className="prose prose-sm dark:prose-invert bg-primary/5 p-3 rounded-lg">
                  <ReactMarkdown>{journal.ai_suggested_intentions}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Click "Generate" to receive personalized intention suggestions based on this lunar cycle and your chart.
                </p>
              )}
            </div>

            {signData && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary mb-2">✍️ Intention Words for {cycleSign}</p>
                <p className="text-sm text-muted-foreground italic">
                  {signData.intentionWords.join(' • ')}
                </p>
              </div>
            )}

            <JournalField
              label="What wants to be worked with this cycle?"
              placeholder="What is surfacing from within? What emotional theme feels alive now?"
              value={journal?.new_moon_feelings}
              onChange={(v) => updateField('new_moon_feelings', v)}
              icon={<Heart className="h-4 w-4 text-rose-500" />}
            />
            <JournalField
              label="What is showing up in your life?"
              placeholder="What issues have been at the forefront? What is the world reflecting back to you?"
              value={journal?.new_moon_showing_up}
              onChange={(v) => updateField('new_moon_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-amber-500" />}
            />
            <JournalField
              label="House Themes"
              placeholder="What area of life is being illuminated? What would it mean to nurture this gently?"
              value={journal?.new_moon_house_themes}
              onChange={(v) => updateField('new_moon_house_themes', v)}
              icon={<Target className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="Intention(s) for this cycle"
              placeholder="Write when emotionally clear. Allow the words to develop over a day or two if needed..."
              value={journal?.new_moon_intentions}
              onChange={(v) => updateField('new_moon_intentions', v)}
              icon={<Sparkles className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="How would I feel with this present?"
              placeholder="Focus on sensations in your body. What does it feel like to hold this intention?"
              value={journal?.new_moon_body_sensations}
              onChange={(v) => updateField('new_moon_body_sensations', v)}
              icon={<Zap className="h-4 w-4 text-purple-500" />}
            />

            {/* Tarot Card */}
            <CardDrawSection
              cardType="tarot"
              cardName={journal?.tarot_card_name}
              notes={journal?.tarot_card_notes}
              interpretation={journal?.tarot_ai_interpretation}
              onCardNameChange={(v) => updateField('tarot_card_name', v)}
              onNotesChange={(v) => updateField('tarot_card_notes', v)}
              onInterpret={() => handleInterpretCard('tarot')}
              isInterpreting={isInterpretingTarot}
              cycleSign={cycleSign}
              phaseName="New Moon"
            />

            {/* Oracle Card */}
            <CardDrawSection
              cardType="oracle"
              cardName={journal?.oracle_card_name}
              deckName={journal?.oracle_deck_name}
              notes={journal?.oracle_card_notes}
              interpretation={journal?.oracle_ai_interpretation}
              onCardNameChange={(v) => updateField('oracle_card_name', v)}
              onDeckNameChange={(v) => updateField('oracle_deck_name', v)}
              onNotesChange={(v) => updateField('oracle_card_notes', v)}
              onInterpret={() => handleInterpretCard('oracle')}
              isInterpreting={isInterpretingOracle}
              cycleSign={cycleSign}
              phaseName="New Moon"
            />
          </div>
        );
      
      case 'firstQuarter':
        return (
          <>
            <JournalField
              label="What action am I taking?"
              placeholder="What is moving? What effort or decision is shaping this cycle?"
              value={journal?.first_quarter_showing_up}
              onChange={(v) => updateField('first_quarter_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-amber-500" />}
            />
            <JournalField
              label="What tension or challenge is present?"
              placeholder="Where do I need courage or adjustment? What's pushing back?"
              value={journal?.first_quarter_obstacles}
              onChange={(v) => updateField('first_quarter_obstacles', v)}
              icon={<Target className="h-4 w-4 text-red-500" />}
            />
            <JournalField
              label="What action actually moved the story?"
              placeholder="What decision did I make? How am I adapting?"
              value={journal?.first_quarter_adjustments}
              onChange={(v) => updateField('first_quarter_adjustments', v)}
              icon={<RefreshCw className="h-4 w-4 text-primary" />}
            />
          </>
        );
      
      case 'fullMoon':
        return (
          <>
            <JournalField
              label="What came to light?"
              placeholder="What became obvious, emotional, or visible? What peaked or ripened?"
              value={journal?.full_moon_showing_up}
              onChange={(v) => updateField('full_moon_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-yellow-500" />}
            />
            <JournalField
              label="What result or realization became visible?"
              placeholder="What demanded acknowledgment? What am I grateful for in this revelation?"
              value={journal?.full_moon_gratitude}
              onChange={(v) => updateField('full_moon_gratitude', v)}
              icon={<Heart className="h-4 w-4 text-rose-500" />}
            />
            <JournalField
              label="What needs release?"
              placeholder="What peaked emotionally and now asks to be let go?"
              value={journal?.full_moon_releasing}
              onChange={(v) => updateField('full_moon_releasing', v)}
              icon={<RefreshCw className="h-4 w-4 text-purple-500" />}
            />
          </>
        );
      
      case 'lastQuarter':
        return (
          <>
            <JournalField
              label="What no longer fits?"
              placeholder="What is no longer worth carrying forward? What has run its course?"
              value={journal?.last_quarter_showing_up}
              onChange={(v) => updateField('last_quarter_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-purple-500" />}
            />
            <JournalField
              label="What lesson did this cycle teach me?"
              placeholder="What did I learn about myself, my patterns, or my needs?"
              value={journal?.last_quarter_letting_go}
              onChange={(v) => updateField('last_quarter_letting_go', v)}
              icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
            />
            <JournalField
              label="What do I need to edit, forgive, or reframe?"
              placeholder="What patterns am I releasing? What perspective is shifting?"
              value={journal?.last_quarter_patterns}
              onChange={(v) => updateField('last_quarter_patterns', v)}
              icon={<Zap className="h-4 w-4 text-amber-500" />}
            />
          </>
        );
      
      case 'balsamic':
        return (
          <>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mb-2">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                🕯️ <strong>Sacred Listening Window</strong> — This is where the next cycle begins. 
                Take things off your plate. Get quiet. Do not skip this phase.
              </p>
            </div>
            <JournalField
              label="What dreams are you having?"
              placeholder="Record any dreams, recurring images, or nighttime impressions..."
              value={journal?.balsamic_dreams}
              onChange={(v) => saveJournal({ balsamic_dreams: v })}
              icon={<Moon className="h-4 w-4 text-muted-foreground" />}
            />
            <JournalField
              label="What are your morning thoughts?"
              placeholder="What surfaces first thing? What worries or feelings greet you?"
              value={journal?.balsamic_morning_thoughts}
              onChange={(v) => saveJournal({ balsamic_morning_thoughts: v })}
              icon={<Eye className="h-4 w-4 text-amber-500" />}
            />
            {/* Fatigue + Withdrawal sliders */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded-lg">
              <div className="space-y-1">
                <label className="text-xs flex items-center gap-1">😴 Fatigue Level</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Low</span>
                  <input type="range" min={1} max={10} value={journal?.balsamic_fatigue ?? 5}
                    onChange={(e) => saveJournal({ balsamic_fatigue: parseInt(e.target.value) })}
                    className="flex-1 accent-primary h-1.5" />
                  <span className="text-[10px] text-muted-foreground">High</span>
                  <span className="text-xs text-muted-foreground w-6">{journal?.balsamic_fatigue ?? '—'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs flex items-center gap-1">🚪 Desire to Withdraw</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Low</span>
                  <input type="range" min={1} max={10} value={journal?.balsamic_withdrawal ?? 5}
                    onChange={(e) => saveJournal({ balsamic_withdrawal: parseInt(e.target.value) })}
                    className="flex-1 accent-primary h-1.5" />
                  <span className="text-[10px] text-muted-foreground">Strong</span>
                  <span className="text-xs text-muted-foreground w-6">{journal?.balsamic_withdrawal ?? '—'}</span>
                </div>
              </div>
            </div>
            <JournalField
              label="What needs to end?"
              placeholder="What has run its course? What is complete?"
              value={journal?.balsamic_needs_to_end}
              onChange={(v) => saveJournal({ balsamic_needs_to_end: v })}
              icon={<RefreshCw className="h-4 w-4 text-purple-500" />}
            />
            <JournalField
              label="What needs to come off your plate?"
              placeholder="What can you let go of, delegate, or stop doing?"
              value={journal?.balsamic_off_plate}
              onChange={(v) => saveJournal({ balsamic_off_plate: v })}
              icon={<Target className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="What is distilling down from this cycle?"
              placeholder="What wisdom is emerging? What feels emotionally charged enough to work with next?"
              value={journal?.balsamic_reflections}
              onChange={(v) => updateField('balsamic_reflections', v)}
              icon={<Sparkles className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="What's stirring for the next cycle?"
              placeholder="What early signals, feelings, or themes are beginning to form?"
              value={journal?.cycle_next_stirrings}
              onChange={(v) => updateField('cycle_next_stirrings', v)}
              icon={<Zap className="h-4 w-4 text-purple-500" />}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  // Same-sign recall: find past journals with same cycle_sign
  const sameSignJournals = pastJournals.filter(pj => pj.cycle_sign === cycleSign);

  if (isLoading) {
    return (
      <Card className="bg-background border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-xl font-light flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            ☽ Cycle Workbook — {chartName}
          </span>
          <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!isSaving && journal?.id && (
              <Badge variant="secondary" className="text-xs">
                <Save className="h-3 w-3 mr-1" /> Saved
              </Badge>
            )}
          </div>
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {cycleSign} New Moon at {cycleDegree}° • {cycleStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
              simpleMode 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-background text-muted-foreground border-border'
            }`}
          >
            {simpleMode ? '🌿 Simple' : '🔬 Full'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <JournalContextBanner date={new Date()} activationData={activationData ?? null} compact />

        {/* ★ WHAT IS SURFACING — First thing user sees */}
        <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <h3 className="font-serif text-base font-medium">What is surfacing right now?</h3>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Do not overthink. Choose the thing with emotion attached.
          </p>
          <Textarea
            placeholder="What feels emotionally charged? What keeps coming up? What feels important — even if small? What showed up in the last 2–3 days? What is your body telling you?"
            value={journal?.what_is_surfacing || ''}
            onChange={(e) => saveJournal({ what_is_surfacing: e.target.value })}
            className="min-h-[100px] bg-background border-border/50 text-sm resize-none"
          />
        </div>

        {/* Intention Status */}
        <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg flex-wrap">
          <span className="text-xs text-muted-foreground">Intention:</span>
          {(['unclear', 'forming', 'ready'] as const).map((status) => (
            <button
              key={status}
              onClick={() => saveJournal({ intention_status: status })}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize ${
                (journal?.intention_status || 'unclear') === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {status === 'unclear' && '🌫️ '}
              {status === 'forming' && '🌱 '}
              {status === 'ready' && '✨ '}
              {status}
            </button>
          ))}
          <span className="text-[10px] text-muted-foreground ml-auto italic">
            Let it form over 1–3 days
          </span>
        </div>

        {/* Same-Sign Recall */}
        {sameSignJournals.length > 0 && (
          <div className="p-3 bg-secondary/20 rounded-lg border border-border/50 space-y-2">
            <h4 className="text-xs font-medium flex items-center gap-2">
              <History className="h-3 w-3" />
              Same-Sign Recall — Past {cycleSign} Cycles
            </h4>
            {sameSignJournals.slice(0, 3).map((pj) => (
              <div key={pj.id} className="p-2 bg-background rounded border border-border/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    🌑 {new Date(pj.cycle_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => setSelectedPastJournal(pj)} className="text-primary underline text-[10px]">
                    View
                  </button>
                </div>
                {pj.new_moon_intentions && (
                  <p className="text-muted-foreground italic line-clamp-2">"{pj.new_moon_intentions}"</p>
                )}
                {pj.what_is_surfacing && (
                  <p className="text-muted-foreground line-clamp-1">Surfacing: {pj.what_is_surfacing}</p>
                )}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground italic">
              Notice repeating emotional themes across these {cycleSign} cycles.
            </p>
          </div>
        )}

        {/* Mode toggle (only in full mode) */}
        {!simpleMode && (
          <div className="flex items-center gap-2">
            <Button variant={!isGuidedMode ? "default" : "outline"} size="sm" onClick={() => setIsGuidedMode(false)}>Full View</Button>
            <Button variant={isGuidedMode ? "default" : "outline"} size="sm" onClick={() => { setIsGuidedMode(true); setGuidedStep(0); }}>
              <Wand2 className="h-3 w-3 mr-1" /> Guided
            </Button>
          </div>
        )}

        {/* Phase Journal */}
        {simpleMode ? (
          <div className="space-y-3">
            <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as PhaseKey)}>
              <TabsList className="grid w-full grid-cols-5 mb-3">
                {PHASE_ORDER.map((phase) => (
                  <TabsTrigger key={phase} value={phase} className="text-xs px-1">
                    <span className="mr-1">{PHASE_CONFIG[phase].emoji}</span>
                    <span className="hidden sm:inline">{PHASE_CONFIG[phase].title.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {PHASE_ORDER.map((phase) => {
                const config = PHASE_CONFIG[phase];
                const isCurrentPhase = phase === currentPhase;
                return (
                  <TabsContent key={phase} value={phase}>
                    <div className="space-y-3">
                      {isCurrentPhase && (
                        <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-xs font-medium">You're in this phase now</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.emoji}</span>
                        <div>
                          <h3 className="font-medium text-sm">{config.title}</h3>
                          <p className="text-xs text-muted-foreground">{config.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">{config.description}</p>
                      {phase === 'newMoon' && <JournalField label="Intention(s) for this cycle" placeholder="What wants to be worked with? Write when ready..." value={journal?.new_moon_intentions} onChange={(v) => updateField('new_moon_intentions', v)} icon={<Sparkles className="h-4 w-4 text-primary" />} />}
                      {phase === 'firstQuarter' && <JournalField label="What action is shaping this cycle?" placeholder="What tension, decision, or courage is needed?" value={journal?.first_quarter_showing_up} onChange={(v) => updateField('first_quarter_showing_up', v)} icon={<Zap className="h-4 w-4 text-amber-500" />} />}
                      {phase === 'fullMoon' && <JournalField label="What came to light?" placeholder="What peaked, became visible, or demands release?" value={journal?.full_moon_showing_up} onChange={(v) => updateField('full_moon_showing_up', v)} icon={<Eye className="h-4 w-4 text-yellow-500" />} />}
                      {phase === 'lastQuarter' && <JournalField label="What lesson did this cycle teach?" placeholder="What no longer fits? What needs to be released?" value={journal?.last_quarter_letting_go} onChange={(v) => updateField('last_quarter_letting_go', v)} icon={<RefreshCw className="h-4 w-4 text-purple-500" />} />}
                      {phase === 'balsamic' && <JournalField label="What is rising up to be worked with next?" placeholder="Dreams, morning feelings, fatigue, quiet signals..." value={journal?.balsamic_reflections} onChange={(v) => updateField('balsamic_reflections', v)} icon={<Moon className="h-4 w-4 text-muted-foreground" />} />}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        ) : isGuidedMode ? (
          <GuidedStep stepNumber={guidedStep + 1} totalSteps={newMoonSteps.length}
            onNext={() => setGuidedStep(prev => Math.min(prev + 1, newMoonSteps.length - 1))}
            onPrev={() => setGuidedStep(prev => Math.max(prev - 1, 0))}
            isFirst={guidedStep === 0} isLast={guidedStep === newMoonSteps.length - 1}>
            <JournalField label={newMoonSteps[guidedStep].label} placeholder={newMoonSteps[guidedStep].placeholder}
              value={(journal as any)?.[newMoonSteps[guidedStep].field] || ''}
              onChange={(v) => updateField(newMoonSteps[guidedStep].field as keyof LunarJournalEntry, v)}
              icon={newMoonSteps[guidedStep].icon} />
          </GuidedStep>
        ) : (
          <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as PhaseKey)}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {PHASE_ORDER.map((phase) => (
                <TabsTrigger key={phase} value={phase} className="text-xs px-1">
                  <span className="mr-1">{PHASE_CONFIG[phase].emoji}</span>
                  <span className="hidden sm:inline">{PHASE_CONFIG[phase].title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {PHASE_ORDER.map((phase) => (
              <TabsContent key={phase} value={phase}>
                <ScrollArea className="h-[600px] pr-4">{renderPhaseContent(phase)}</ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* ★ SURPRISE TRACKER */}
        <div className="p-3 bg-secondary/20 rounded-lg border border-border/50 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <h4 className="text-xs font-medium">What happened that you did NOT expect?</h4>
          </div>
          <p className="text-[10px] text-muted-foreground italic">Follow this. Unexpected = often the real movement of the cycle.</p>
          <Textarea placeholder="Any surprises, unexpected events, or things you didn't see coming?"
            value={journal?.surprise_event || ''} onChange={(e) => saveJournal({ surprise_event: e.target.value })}
            className="min-h-[60px] bg-background border-border/50 text-sm resize-none" />
        </div>

        {/* ★ REAL LIFE EVENT LOG */}
        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50 text-sm font-medium">
            <span className="flex items-center gap-2">📋 Real Life Event Log</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <JournalField label="What actually happened?" placeholder="Events, shifts, conversations, decisions..."
              value={journal?.real_life_what_happened} onChange={(v) => saveJournal({ real_life_what_happened: v })}
              icon={<Eye className="h-4 w-4 text-amber-500" />} />
            <JournalField label="Important conversations?" placeholder="What was said that matters?"
              value={journal?.real_life_conversations} onChange={(v) => saveJournal({ real_life_conversations: v })}
              icon={<Target className="h-4 w-4 text-primary" />} />
            <JournalField label="Body signals?" placeholder="Tension, fatigue, energy shifts, sensitivity..."
              value={journal?.real_life_body_signals} onChange={(v) => saveJournal({ real_life_body_signals: v })}
              icon={<Heart className="h-4 w-4 text-rose-500" />} />
            <JournalField label="Synchronicities?" placeholder="Repeated numbers, themes, meaningful coincidences..."
              value={journal?.real_life_synchronicities} onChange={(v) => saveJournal({ real_life_synchronicities: v })}
              icon={<Sparkles className="h-4 w-4 text-primary" />} />
            <JournalField label="Emotional reactions?" placeholder="What triggered you? What moved you?"
              value={journal?.real_life_emotional_reactions} onChange={(v) => saveJournal({ real_life_emotional_reactions: v })}
              icon={<Zap className="h-4 w-4 text-purple-500" />} />
            <JournalField label="Something repeated?" placeholder="Themes, patterns, situations that keep showing up..."
              value={journal?.real_life_repeated} onChange={(v) => saveJournal({ real_life_repeated: v })}
              icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />} />
          </CollapsibleContent>
        </Collapsible>

        {/* Body State + Experience Tracking */}
        <MetricTracker energy={journal?.energy ?? null} stress={journal?.stress ?? null}
          sleepQuality={journal?.sleep_quality ?? null} sensitivity={journal?.body_sensitivity ?? null}
          dreamIntensity={journal?.dream_intensity ?? null} tags={(journal?.tags as string[]) ?? []}
          journalText={journal?.journal_text ?? ""}
          onMetricChange={(field, value) => saveJournal({ [field]: value })}
          onTagsChange={(tags) => saveJournal({ tags })}
          onJournalTextChange={(text) => saveJournal({ journal_text: text })} />

        {/* Past Cycles */}
        {pastJournals.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <History className="h-4 w-4" /> Past Cycles ({pastJournals.length})
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="grid gap-2">
                {pastJournals.map((pj) => (
                  <PastJournalCard key={pj.id} journal={pj} onSelect={() => setSelectedPastJournal(pj)} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Past journal viewer */}
        {selectedPastJournal && (
          <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPastJournal.cycle_sign} New Moon Cycle</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPastJournal(null)}>✕</Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedPastJournal.cycle_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {selectedPastJournal.what_is_surfacing && (
                      <div><h5 className="font-medium text-sm mb-1">🔴 What Was Surfacing</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.what_is_surfacing}</p></div>
                    )}
                    {selectedPastJournal.new_moon_intentions && (
                      <div><h5 className="font-medium text-sm mb-1">Intentions</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.new_moon_intentions}</p></div>
                    )}
                    {selectedPastJournal.surprise_event && (
                      <div><h5 className="font-medium text-sm mb-1">⚡ Surprise</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.surprise_event}</p></div>
                    )}
                    {selectedPastJournal.real_life_what_happened && (
                      <div><h5 className="font-medium text-sm mb-1">📋 What Happened</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.real_life_what_happened}</p></div>
                    )}
                    {selectedPastJournal.balsamic_dreams && (
                      <div><h5 className="font-medium text-sm mb-1">🌙 Balsamic Dreams</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.balsamic_dreams}</p></div>
                    )}
                    {selectedPastJournal.cycle_wisdom && (
                      <div><h5 className="font-medium text-sm mb-1">Cycle Wisdom</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.cycle_wisdom}</p></div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
