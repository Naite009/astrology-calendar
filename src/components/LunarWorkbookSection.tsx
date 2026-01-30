import { useState } from "react";
import { 
  Moon, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  History, 
  Loader2,
  Heart,
  Eye,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLunarJournal, LunarJournalEntry } from "@/hooks/useLunarJournal";
import { SignLunationData } from "@/lib/signLunationData";

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
}

const PHASE_INFO = {
  newMoon: {
    emoji: "🌑",
    title: "New Moon",
    subtitle: "Planting Seeds",
    description: "At the New Moon you are planting seeds in the dark, fertile soil. Your soul wants something to grow. It's a quiet, inward time when the sun (our divine masculine) and the moon (our divine feminine) come together to create new life.",
    color: "text-primary"
  },
  firstQuarter: {
    emoji: "🌓",
    title: "First Quarter",
    subtitle: "Taking Action",
    description: "At the First Quarter Moon plans are underway. We feel the waxing/rising/yang energy. It's a busy time. We're feeling an internal PUSH to grow. You're getting feedback from the world and overcoming obstacles.",
    color: "text-amber-500"
  },
  fullMoon: {
    emoji: "🌕",
    title: "Full Moon",
    subtitle: "Illumination",
    description: "At the Full Moon, the fruit is ripe. There's lots of LIGHT in the sky to see what's going on. The energy is moving quickly and things will naturally come to a head. It's the time for gratitude and releasing what's not needed.",
    color: "text-yellow-400"
  },
  lastQuarter: {
    emoji: "🌗",
    title: "Last Quarter",
    subtitle: "Letting Go",
    description: "At the Last Quarter Moon you're tying up loose ends, finishing things, cleaning up 'energy leaks'. You're reflecting on the cycle and what was learned. It's a good time for letting go and breaking negative patterns.",
    color: "text-purple-500"
  },
  balsamic: {
    emoji: "🌘",
    title: "Balsamic Moon",
    subtitle: "Rest & Renewal",
    description: "The Dark Moon/Balsamic Moon is a time for quiet, rest and contemplation. Empty your mind, slow down and open to guidance. Your energy is lower. Honor this dark time. We're moving back towards the regenerative dark.",
    color: "text-muted-foreground"
  }
};

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

const PhaseSection = ({ 
  phase, 
  journal, 
  updateField,
  phaseDate,
  signData
}: { 
  phase: keyof typeof PHASE_INFO; 
  journal: LunarJournalEntry | null;
  updateField: (field: keyof LunarJournalEntry, value: string) => void;
  phaseDate?: Date;
  signData: SignLunationData | null;
}) => {
  const info = PHASE_INFO[phase];
  
  const renderFields = () => {
    switch (phase) {
      case 'newMoon':
        return (
          <>
            <JournalField
              label="What FEELS important right now? (inside ☽)"
              placeholder="What is my soul telling me is 'up' right now? What's wanting to be conceived?"
              value={journal?.new_moon_feelings}
              onChange={(v) => updateField('new_moon_feelings', v)}
              icon={<Heart className="h-4 w-4 text-rose-500" />}
            />
            <JournalField
              label="What's SHOWING UP right now in your life? (outside ☼)"
              placeholder="What issues have been at the forefront of your mind over the past few days/week?"
              value={journal?.new_moon_showing_up}
              onChange={(v) => updateField('new_moon_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-amber-500" />}
            />
            <JournalField
              label="House Themes (where this New Moon falls in your chart)"
              placeholder="What area of life is being illuminated for you? What are the themes of that house?"
              value={journal?.new_moon_house_themes}
              onChange={(v) => updateField('new_moon_house_themes', v)}
              icon={<Target className="h-4 w-4 text-primary" />}
            />
            {signData && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                <p className="text-sm font-medium text-primary mb-2">✍️ Suggested Intention Words</p>
                <p className="text-sm text-muted-foreground italic">
                  {signData.intentionWords.join(' • ')}
                </p>
              </div>
            )}
            <JournalField
              label="My Intention(s) for this cycle"
              placeholder="Allow the intentions to come to you. Imagine opening up to them and receiving them. Write your intentions as a prayer, affirmation, or wish..."
              value={journal?.new_moon_intentions}
              onChange={(v) => updateField('new_moon_intentions', v)}
              icon={<Sparkles className="h-4 w-4 text-primary" />}
            />
            <JournalField
              label="How would I FEEL with this present in my life?"
              placeholder="Focus on the sensations in your body rather than emotions..."
              value={journal?.new_moon_body_sensations}
              onChange={(v) => updateField('new_moon_body_sensations', v)}
              icon={<Zap className="h-4 w-4 text-purple-500" />}
            />
          </>
        );
      
      case 'firstQuarter':
        return (
          <>
            <JournalField
              label="What's showing up in my life?"
              placeholder="What feedback are you receiving? What obstacles are you facing?"
              value={journal?.first_quarter_showing_up}
              onChange={(v) => updateField('first_quarter_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-amber-500" />}
            />
            <JournalField
              label="Obstacles & Challenges"
              placeholder="What's pushing back? What resistance are you feeling?"
              value={journal?.first_quarter_obstacles}
              onChange={(v) => updateField('first_quarter_obstacles', v)}
              icon={<Target className="h-4 w-4 text-red-500" />}
            />
            <JournalField
              label="Adjustments I'm Making"
              placeholder="How are you adapting? What decisions are you making?"
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
              label="What's showing up / being illuminated?"
              placeholder="What is spirit asking you to pay attention to? What has come to fruition?"
              value={journal?.full_moon_showing_up}
              onChange={(v) => updateField('full_moon_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-yellow-500" />}
            />
            <JournalField
              label="What am I grateful for?"
              placeholder="Express gratitude for the light and revelation..."
              value={journal?.full_moon_gratitude}
              onChange={(v) => updateField('full_moon_gratitude', v)}
              icon={<Heart className="h-4 w-4 text-rose-500" />}
            />
            <JournalField
              label="What am I releasing?"
              placeholder="What's not needed? What's ready to be let go?"
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
              label="What's showing up in my life?"
              placeholder="What loose ends need tying? What's finishing?"
              value={journal?.last_quarter_showing_up}
              onChange={(v) => updateField('last_quarter_showing_up', v)}
              icon={<Eye className="h-4 w-4 text-purple-500" />}
            />
            <JournalField
              label="What am I letting go of?"
              placeholder="What needs to be surrendered? What doesn't serve anymore?"
              value={journal?.last_quarter_letting_go}
              onChange={(v) => updateField('last_quarter_letting_go', v)}
              icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
            />
            <JournalField
              label="Patterns I'm Releasing"
              placeholder="What negative patterns are you breaking?"
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
              placeholder="What are the inner stirrings inside of your being asking you to pay attention to? You may not be clear on this yet... that's okay."
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{info.emoji}</span>
        <div>
          <h3 className={`font-medium ${info.color}`}>{info.title}</h3>
          <p className="text-sm text-muted-foreground">{info.subtitle}</p>
        </div>
        {phaseDate && (
          <Badge variant="secondary" className="ml-auto">
            {phaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-foreground/80 italic border-l-2 border-primary/30 pl-3 mb-4">
        {info.description}
      </p>
      
      <div className="space-y-4">
        {renderFields()}
      </div>
    </div>
  );
};

const PastJournalCard = ({ journal, onSelect }: { journal: LunarJournalEntry; onSelect: () => void }) => {
  const startDate = new Date(journal.cycle_start_date);
  const hasContent = journal.new_moon_intentions || journal.balsamic_evolved;
  
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
  balsamicEnd
}: LunarWorkbookSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedPastJournal, setSelectedPastJournal] = useState<LunarJournalEntry | null>(null);
  
  const { 
    journal, 
    isLoading, 
    isSaving, 
    pastJournals, 
    updateField 
  } = useLunarJournal(chartId, cycleStartDate, cycleSign);
  
  const viewingJournal = selectedPastJournal || journal;
  const isViewingPast = !!selectedPastJournal;
  
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-background border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
            <CardTitle className="font-serif text-lg font-light flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                ☽ Cycle Workbook for {chartName}
              </span>
              <div className="flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!isSaving && journal?.id && (
                  <Badge variant="secondary" className="text-xs">
                    <Save className="h-3 w-3 mr-1" /> Auto-saved
                  </Badge>
                )}
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current" className="gap-2">
                  <Moon className="h-4 w-4" />
                  Current Cycle
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <History className="h-4 w-4" />
                  Past Cycles ({pastJournals.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="mt-4">
                {selectedPastJournal && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
                    <p className="text-sm">
                      Viewing: <strong>{selectedPastJournal.cycle_sign} New Moon</strong> (
                      {new Date(selectedPastJournal.cycle_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPastJournal(null)}>
                      Back to Current
                    </Button>
                  </div>
                )}
                
                <Tabs defaultValue="newMoon">
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="newMoon" className="text-xs px-2">🌑 New</TabsTrigger>
                    <TabsTrigger value="firstQuarter" className="text-xs px-2">🌓 1st Q</TabsTrigger>
                    <TabsTrigger value="fullMoon" className="text-xs px-2">🌕 Full</TabsTrigger>
                    <TabsTrigger value="lastQuarter" className="text-xs px-2">🌗 Last Q</TabsTrigger>
                    <TabsTrigger value="balsamic" className="text-xs px-2">🌘 Balsamic</TabsTrigger>
                  </TabsList>
                  
                  <ScrollArea className="h-[500px] pr-4">
                    <TabsContent value="newMoon">
                      <PhaseSection 
                        phase="newMoon" 
                        journal={viewingJournal}
                        updateField={isViewingPast ? () => {} : updateField}
                        phaseDate={cycleStartDate}
                        signData={signData}
                      />
                    </TabsContent>
                    
                    <TabsContent value="firstQuarter">
                      <PhaseSection 
                        phase="firstQuarter" 
                        journal={viewingJournal}
                        updateField={isViewingPast ? () => {} : updateField}
                        phaseDate={keyPhases?.firstQuarter?.date}
                        signData={signData}
                      />
                    </TabsContent>
                    
                    <TabsContent value="fullMoon">
                      <PhaseSection 
                        phase="fullMoon" 
                        journal={viewingJournal}
                        updateField={isViewingPast ? () => {} : updateField}
                        phaseDate={keyPhases?.fullMoon?.date}
                        signData={signData}
                      />
                    </TabsContent>
                    
                    <TabsContent value="lastQuarter">
                      <PhaseSection 
                        phase="lastQuarter" 
                        journal={viewingJournal}
                        updateField={isViewingPast ? () => {} : updateField}
                        phaseDate={keyPhases?.lastQuarter?.date}
                        signData={signData}
                      />
                    </TabsContent>
                    
                    <TabsContent value="balsamic">
                      <PhaseSection 
                        phase="balsamic" 
                        journal={viewingJournal}
                        updateField={isViewingPast ? () => {} : updateField}
                        phaseDate={balsamicStart}
                        signData={signData}
                      />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </TabsContent>
              
              <TabsContent value="past" className="mt-4">
                {pastJournals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No past lunar cycle journals yet.</p>
                    <p className="text-sm">Your journaled cycles will appear here over time.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {pastJournals.map((pj) => (
                        <PastJournalCard 
                          key={pj.id}
                          journal={pj}
                          onSelect={() => {
                            setSelectedPastJournal(pj);
                            setActiveTab('current');
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
