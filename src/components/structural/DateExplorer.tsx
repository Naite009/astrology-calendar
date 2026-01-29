import { useState, useMemo } from 'react';
import { format, setMonth, setYear } from 'date-fns';
import { Calendar as CalendarIcon, Search, ChevronDown, Save, Loader2, HelpCircle, ChevronRight, Info, Lightbulb } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { LifeEvent } from '@/hooks/useLifeEvents';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  exploreDateWithContext, 
  DateExplorerResult,
  LifeEventTag 
} from '@/lib/structuralStressEngine';
import { LIFE_EVENT_LABELS, PHASE_COPY } from '@/lib/structuralStressCopy';

interface DateExplorerProps {
  chart: NatalChart;
  onSaveEvent?: (event: { chartId: string; eventDate: Date; eventType: string; eventLabel?: string; notes?: string }) => Promise<LifeEvent | null>;
  savingEvent?: boolean;
  onDateExplored?: (hasResult: boolean) => void;
}

const PHASE_COLORS: Record<string, string> = {
  Containment: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'Structural Stress': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  Release: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  Activation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  Mixed: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
};

const MOTION_COLORS: Record<string, string> = {
  applying: 'text-amber-600 dark:text-amber-400',
  exact: 'text-red-600 dark:text-red-400 font-semibold',
  separating: 'text-muted-foreground'
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Deeper "why" explanations for each transit planet
const PLANET_WHY_EXPLANATIONS: Record<string, { role: string; whatItDoes: string; whatToAsk: string }> = {
  Saturn: {
    role: "The Architect of Limits",
    whatItDoes: "Saturn transits show where life is demanding you get serious, commit, or face consequences. It's not punishment—it's maturation pressure. Whatever Saturn touches, you're being asked: 'Is this sustainable? Is this real?'",
    whatToAsk: "What am I being asked to commit to, let go of, or take responsibility for?"
  },
  Pluto: {
    role: "The Excavator of Truth",
    whatItDoes: "Pluto transits expose what's been hidden—power dynamics, control patterns, fears you've avoided. The intensity isn't random: it's proportional to how long something has been buried. Pluto asks you to die to what no longer serves you.",
    whatToAsk: "What have I been avoiding that I can't avoid anymore? What power am I reclaiming or releasing?"
  },
  Uranus: {
    role: "The Awakener",
    whatItDoes: "Uranus transits bring sudden clarity, restlessness, or events that shatter 'normal.' It's not chaos for chaos's sake—it's liberation from patterns you've outgrown. Often you've known for years; Uranus just makes it undeniable.",
    whatToAsk: "What am I suddenly done with? What freedom have I been denying myself?"
  },
  Mars: {
    role: "The Trigger",
    whatItDoes: "Mars transits externalize internal pressure into action or confrontation. If you've been building toward something, Mars activates it. If you've been suppressing anger, it erupts. Mars asks: 'What are you going to DO?'",
    whatToAsk: "What have I been building toward that's ready to move? What anger needs expression?"
  },
  Neptune: {
    role: "The Dissolver",
    whatItDoes: "Neptune transits dissolve boundaries and certainties. What felt solid becomes unclear. This isn't confusion—it's an invitation to let go of illusions and connect to something larger than ego.",
    whatToAsk: "What am I being asked to surrender? What illusion is fading?"
  },
  NorthNode: {
    role: "The Destiny Pointer",
    whatItDoes: "North Node transits highlight growth edges and fated encounters. They pull you toward unfamiliar territory that serves your evolution. Discomfort here is often a sign you're moving in the right direction.",
    whatToAsk: "What unfamiliar direction is calling me? Who entered my life that matters?"
  },
  SouthNode: {
    role: "The Release Point",
    whatItDoes: "South Node transits mark what you're ready to release—old patterns, relationships, or identities that served you but are now complete. There's often grief here, but also freedom.",
    whatToAsk: "What past pattern is complete? What am I being asked to let go of?"
  }
};

// Pressure dynamics explainer
const PRESSURE_DYNAMICS_EXPLAINER = {
  Containment: {
    color: 'bg-blue-500',
    symbol: '♄',
    meaning: 'HOLDING pressure',
    description: 'Forces asking you to commit, endure, or take responsibility. The feeling of "I have to hold this together."'
  },
  Stress: {
    color: 'bg-red-500',
    symbol: '♇',
    meaning: 'INTENSITY pressure',
    description: 'Forces exposing what\'s been hidden or avoided. The feeling of "I can\'t keep paying this price."'
  },
  Release: {
    color: 'bg-emerald-500',
    symbol: '♅',
    meaning: 'LIBERATION pressure',
    description: 'Forces pushing you to break free. The feeling of "I\'m suddenly done with this."'
  },
  Trigger: {
    color: 'bg-orange-500',
    symbol: '♂',
    meaning: 'ACTION pressure',
    description: 'Forces externalizing internal buildup. The feeling of "I need to DO something about this."'
  }
};

export const DateExplorer = ({ chart, onSaveEvent, savingEvent, onDateExplored }: DateExplorerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [lifeEvent, setLifeEvent] = useState<LifeEventTag | undefined>();
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<DateExplorerResult | null>(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expandedTransit, setExpandedTransit] = useState<number | null>(null);
  const [showPressureHelp, setShowPressureHelp] = useState(false);

  // Generate year range based on chart birth date
  const yearRange = useMemo(() => {
    const birthYear = chart.birthDate ? new Date(chart.birthDate).getFullYear() : 1960;
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = birthYear; y <= currentYear + 10; y++) {
      years.push(y);
    }
    return years;
  }, [chart.birthDate]);

  // Calendar display date (for month/year navigation)
  const [displayMonth, setDisplayMonth] = useState<Date>(selectedDate || new Date());

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(displayMonth, parseInt(monthIndex));
    setDisplayMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(displayMonth, parseInt(year));
    setDisplayMonth(newDate);
  };

  const handleExplore = () => {
    if (!selectedDate) return;
    const explorerResult = exploreDateWithContext(chart, selectedDate, lifeEvent);
    setResult(explorerResult);
    setExpandedTransit(null);
    onDateExplored?.(true);
  };

  const handleClear = () => {
    setResult(null);
    setSelectedDate(undefined);
    setLifeEvent(undefined);
    setNotes('');
    setExpandedTransit(null);
    onDateExplored?.(false);
  };

  const handleSaveEvent = async () => {
    if (!selectedDate || !lifeEvent || !onSaveEvent) return;
    
    await onSaveEvent({
      chartId: chart.id,
      eventDate: selectedDate,
      eventType: lifeEvent,
      eventLabel: LIFE_EVENT_LABELS[lifeEvent],
      notes: notes || undefined
    });
  };

  const lifeEventOptions = Object.entries(LIFE_EVENT_LABELS) as [LifeEventTag, string][];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          Explore a Date
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter a specific date to understand <strong>why</strong> things happened the way they did based on the transits active at that time.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker and Life Event Selection */}
        <div className="flex flex-wrap gap-3">
          {/* Date Picker with Month/Year Dropdowns */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              {/* Month/Year Quick Navigation */}
              <div className="flex gap-2 p-3 border-b border-border">
                <Select 
                  value={displayMonth.getMonth().toString()} 
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-[130px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {MONTHS.map((month, idx) => (
                      <SelectItem key={month} value={idx.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={displayMonth.getFullYear().toString()} 
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-[90px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {yearRange.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setDisplayMonth(date);
                }}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Life Event Selector with better explanation */}
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 mr-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 text-sm" align="start">
                <p className="font-medium mb-2">What is "Add context"?</p>
                <p className="text-muted-foreground">
                  If you remember <strong>what happened</strong> on this date (a breakup, job change, health event, etc.), 
                  selecting it here will show you how the transits specifically relate to that type of event.
                </p>
                <p className="text-muted-foreground mt-2">
                  It's optional—you can explore any date without adding context.
                </p>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="w-[200px] justify-between"
              onClick={() => setShowEventDropdown(!showEventDropdown)}
            >
              <span className={!lifeEvent ? "text-muted-foreground" : ""}>
                {lifeEvent ? LIFE_EVENT_LABELS[lifeEvent] : "Add context (optional)"}
              </span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showEventDropdown && (
              <div className="absolute top-full left-0 mt-1 w-[260px] bg-background border border-border rounded-md shadow-lg z-50 py-1 max-h-[300px] overflow-y-auto">
                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                  What happened around this date?
                </div>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors text-muted-foreground"
                  onClick={() => { setLifeEvent(undefined); setShowEventDropdown(false); }}
                >
                  Just exploring (no specific event)
                </button>
                {lifeEventOptions.map(([key, label]) => (
                  <button
                    key={key}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                      lifeEvent === key && "bg-secondary font-medium"
                    )}
                    onClick={() => { setLifeEvent(key); setShowEventDropdown(false); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Explore Button */}
          <Button 
            onClick={handleExplore} 
            disabled={!selectedDate}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Show me why
          </Button>

          {result && (
            <Button variant="ghost" onClick={handleClear} className="text-muted-foreground">
              Clear
            </Button>
          )}
        </div>

        {/* Notes Input (shown when event type selected) */}
        {lifeEvent && (
          <div className="flex gap-3 items-center animate-in fade-in-50 duration-200">
            <Input
              placeholder="Add notes about this event (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1"
            />
            {onSaveEvent && selectedDate && (
              <Button 
                variant="outline" 
                onClick={handleSaveEvent}
                disabled={savingEvent}
                className="gap-2"
              >
                {savingEvent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save to Timeline
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
            {/* Phase Summary with explainer */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className={`${PHASE_COLORS[result.phaseLabel]} border`}>
                  {result.phaseLabel}
                </Badge>
                <p className="text-sm text-foreground/90 flex-1">{result.summary}</p>
              </div>
              
              {/* Phase explanation */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {PHASE_COPY[result.phaseLabel]?.body}
                </p>
              </div>
            </div>

            {/* Contextual Narrative */}
            {result.contextualNarrative && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-xs text-primary uppercase tracking-wider font-medium">
                  {result.lifeEventContext && LIFE_EVENT_LABELS[result.lifeEventContext]} Context
                </span>
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                  {result.contextualNarrative}
                </p>
              </div>
            )}

            {/* Active Transits - Now Interactive! */}
            {result.activeTransits.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
                    Why {format(result.date, "MMMM d, yyyy")} Felt The Way It Did
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Click any transit to understand its meaning
                  </span>
                </div>
                <div className="space-y-2">
                  {result.activeTransits.map((transit, i) => {
                    const planetInfo = PLANET_WHY_EXPLANATIONS[transit.planet];
                    const isExpanded = expandedTransit === i;
                    
                    return (
                      <Collapsible 
                        key={i} 
                        open={isExpanded}
                        onOpenChange={() => setExpandedTransit(isExpanded ? null : i)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={cn(
                              "w-full p-3 border rounded-lg transition-all text-left",
                              isExpanded 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/30"
                            )}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-medium">{transit.planet}</span>
                              <span className="text-muted-foreground">{transit.aspectType}</span>
                              <span className="font-medium">your {transit.natalTarget}</span>
                              <span className={cn("text-xs", MOTION_COLORS[transit.motion])}>
                                ({transit.motion}, {transit.orb.toFixed(1)}° orb)
                              </span>
                              <ChevronRight className={cn(
                                "h-4 w-4 ml-auto transition-transform",
                                isExpanded && "rotate-90"
                              )} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {transit.narrative}
                            </p>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {planetInfo && (
                            <div className="mt-2 ml-3 pl-3 border-l-2 border-primary/30 space-y-3 py-3">
                              <div>
                                <span className="text-xs uppercase tracking-widest text-primary font-medium">
                                  {planetInfo.role}
                                </span>
                                <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                                  {planetInfo.whatItDoes}
                                </p>
                              </div>
                              <div className="p-3 bg-primary/5 rounded-lg">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                                  <Lightbulb className="h-4 w-4" />
                                  Ask yourself:
                                </div>
                                <p className="text-sm italic text-foreground/80">
                                  "{planetInfo.whatToAsk}"
                                </p>
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  No major structural transits active on this date. The outer planets weren't forming hard aspects to your personal points.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This doesn't mean nothing was happening—just that the "big pressure" planets weren't directly activating your chart.
                </p>
              </div>
            )}

            {/* Pressure Dynamics Visualization with Help */}
            {result.activeTransits.length > 0 && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
                    Pressure Dynamics on This Day
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowPressureHelp(!showPressureHelp)}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    What is this?
                  </Button>
                </div>

                {/* Pressure Help Explainer */}
                {showPressureHelp && (
                  <div className="p-4 bg-secondary rounded-lg space-y-3 animate-in fade-in-50">
                    <p className="text-sm text-foreground/80">
                      The bar below shows what type of pressure was dominant on this day. Think of it as the emotional/psychological weather:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Object.entries(PRESSURE_DYNAMICS_EXPLAINER).map(([key, data]) => (
                        <div key={key} className="flex items-start gap-2 text-sm">
                          <div className={`w-3 h-3 rounded-full ${data.color} mt-0.5 flex-shrink-0`} />
                          <div>
                            <span className="font-medium">{data.meaning}</span>
                            <p className="text-xs text-muted-foreground">{data.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex h-4 rounded-full overflow-hidden bg-secondary">
                  {result.phaseScores.containment_score > 0 && (
                    <div 
                      className="bg-blue-500 transition-all"
                      style={{ width: `${(result.phaseScores.containment_score / (result.phaseScores.containment_score + result.phaseScores.stress_score + result.phaseScores.release_score + result.phaseScores.trigger_score)) * 100}%` }}
                      title={`Containment: ${result.phaseScores.containment_score}`}
                    />
                  )}
                  {result.phaseScores.stress_score > 0 && (
                    <div 
                      className="bg-red-500 transition-all"
                      style={{ width: `${(result.phaseScores.stress_score / (result.phaseScores.containment_score + result.phaseScores.stress_score + result.phaseScores.release_score + result.phaseScores.trigger_score)) * 100}%` }}
                      title={`Stress: ${result.phaseScores.stress_score}`}
                    />
                  )}
                  {result.phaseScores.release_score > 0 && (
                    <div 
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${(result.phaseScores.release_score / (result.phaseScores.containment_score + result.phaseScores.stress_score + result.phaseScores.release_score + result.phaseScores.trigger_score)) * 100}%` }}
                      title={`Release: ${result.phaseScores.release_score}`}
                    />
                  )}
                  {result.phaseScores.trigger_score > 0 && (
                    <div 
                      className="bg-orange-500 transition-all"
                      style={{ width: `${(result.phaseScores.trigger_score / (result.phaseScores.containment_score + result.phaseScores.stress_score + result.phaseScores.release_score + result.phaseScores.trigger_score)) * 100}%` }}
                      title={`Trigger: ${result.phaseScores.trigger_score}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Holding
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Intensity
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Liberation
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Action
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
