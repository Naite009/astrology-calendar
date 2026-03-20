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
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    { field: 'new_moon_feelings', label: "What FEELS important right now?", placeholder: "What is my soul telling me is 'up' right now?", icon: <Heart className="h-4 w-4 text-rose-500" /> },
    { field: 'new_moon_showing_up', label: "What's SHOWING UP in your life?", placeholder: "What issues have been at the forefront of your mind?", icon: <Eye className="h-4 w-4 text-amber-500" /> },
    { field: 'new_moon_house_themes', label: "House Themes", placeholder: "What area of life is being illuminated?", icon: <Target className="h-4 w-4 text-primary" /> },
    { field: 'new_moon_intentions', label: "My Intention(s) for this cycle", placeholder: "Write your intentions as a prayer, affirmation, or wish...", icon: <Sparkles className="h-4 w-4 text-primary" /> },
    { field: 'new_moon_body_sensations', label: "How would I FEEL with this present?", placeholder: "Focus on sensations in your body...", icon: <Zap className="h-4 w-4 text-purple-500" /> },
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
            <JournalField
              label="What's showing up within me?"
              placeholder="As you slow down and go inward, what guidance are you receiving?"
              value={journal?.balsamic_reflections}
              onChange={(v) => updateField('balsamic_reflections', v)}
              icon={<Moon className="h-4 w-4 text-muted-foreground" />}
            />
            <JournalField
              label="What has evolved for me this cycle?"
              placeholder="Reflect on your journey from New Moon to now..."
              value={journal?.balsamic_evolved}
              onChange={(v) => updateField('balsamic_evolved', v)}
              icon={<Sparkles className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="How am I different?"
              placeholder="Yes it can be very subtle, but our soul asks us to grow a tiny bit in each cycle..."
              value={journal?.balsamic_different}
              onChange={(v) => updateField('balsamic_different', v)}
              icon={<Heart className="h-4 w-4 text-rose-500" />}
            />
            <JournalField
              label="Wisdom I'm taking into the next cycle"
              placeholder="What did you learn? What will you carry forward?"
              value={journal?.cycle_wisdom}
              onChange={(v) => updateField('cycle_wisdom', v)}
              icon={<Target className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="What's stirring for the next cycle?"
              placeholder="What are the inner stirrings inside of your being asking you to pay attention to?"
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
        <p className="text-sm text-muted-foreground">
          {cycleSign} New Moon at {cycleDegree}° • {cycleStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cosmic context banner — auto-tags with moon phase, eclipse, transits */}
        <JournalContextBanner date={new Date()} activationData={activationData ?? null} compact />

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={!isGuidedMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsGuidedMode(false)}
          >
            Full View
          </Button>
          <Button
            variant={isGuidedMode ? "default" : "outline"}
            size="sm"
            onClick={() => { setIsGuidedMode(true); setGuidedStep(0); }}
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Guided Mode
          </Button>
        </div>

        {isGuidedMode ? (
          <GuidedStep
            stepNumber={guidedStep + 1}
            totalSteps={newMoonSteps.length}
            onNext={() => setGuidedStep(prev => Math.min(prev + 1, newMoonSteps.length - 1))}
            onPrev={() => setGuidedStep(prev => Math.max(prev - 1, 0))}
            isFirst={guidedStep === 0}
            isLast={guidedStep === newMoonSteps.length - 1}
          >
            <JournalField
              label={newMoonSteps[guidedStep].label}
              placeholder={newMoonSteps[guidedStep].placeholder}
              value={(journal as any)?.[newMoonSteps[guidedStep].field] || ''}
              onChange={(v) => updateField(newMoonSteps[guidedStep].field as keyof LunarJournalEntry, v)}
              icon={newMoonSteps[guidedStep].icon}
            />
          </GuidedStep>
        ) : (
          <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as PhaseKey)}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {PHASE_ORDER.map((phase) => (
                <TabsTrigger 
                  key={phase} 
                  value={phase} 
                  className="text-xs px-1"
                >
                  <span className="mr-1">{PHASE_CONFIG[phase].emoji}</span>
                  <span className="hidden sm:inline">{PHASE_CONFIG[phase].title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {PHASE_ORDER.map((phase) => (
              <TabsContent key={phase} value={phase}>
                <ScrollArea className="h-[600px] pr-4">
                  {renderPhaseContent(phase)}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Body State + Experience Tracking */}
        <MetricTracker
          energy={journal?.energy ?? null}
          stress={journal?.stress ?? null}
          sleepQuality={journal?.sleep_quality ?? null}
          sensitivity={journal?.body_sensitivity ?? null}
          dreamIntensity={journal?.dream_intensity ?? null}
          tags={(journal?.tags as string[]) ?? []}
          journalText={journal?.journal_text ?? ""}
          onMetricChange={(field, value) => saveJournal({ [field]: value })}
          onTagsChange={(tags) => saveJournal({ tags })}
          onJournalTextChange={(text) => saveJournal({ journal_text: text })}
        />

        {/* Past Cycles */}
        {pastJournals.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <History className="h-4 w-4" />
              Past Cycles ({pastJournals.length})
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="grid gap-2">
                {pastJournals.map((pj) => (
                  <PastJournalCard 
                    key={pj.id} 
                    journal={pj} 
                    onSelect={() => setSelectedPastJournal(pj)} 
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Past journal viewer modal/overlay */}
        {selectedPastJournal && (
          <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPastJournal.cycle_sign} New Moon Cycle</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPastJournal(null)}>
                    ✕
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedPastJournal.cycle_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {selectedPastJournal.new_moon_intentions && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">Intentions</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.new_moon_intentions}</p>
                      </div>
                    )}
                    {selectedPastJournal.tarot_card_name && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">🃏 Tarot: {selectedPastJournal.tarot_card_name}</h5>
                        {selectedPastJournal.tarot_ai_interpretation && (
                          <p className="text-sm text-muted-foreground">{selectedPastJournal.tarot_ai_interpretation}</p>
                        )}
                      </div>
                    )}
                    {selectedPastJournal.oracle_card_name && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">✨ Oracle: {selectedPastJournal.oracle_card_name}</h5>
                        {selectedPastJournal.oracle_ai_interpretation && (
                          <p className="text-sm text-muted-foreground">{selectedPastJournal.oracle_ai_interpretation}</p>
                        )}
                      </div>
                    )}
                    {selectedPastJournal.balsamic_evolved && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">What Evolved</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.balsamic_evolved}</p>
                      </div>
                    )}
                    {selectedPastJournal.cycle_wisdom && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">Cycle Wisdom</h5>
                        <p className="text-sm text-muted-foreground">{selectedPastJournal.cycle_wisdom}</p>
                      </div>
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
