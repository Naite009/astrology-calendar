import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, ChevronDown, Save, Loader2 } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { LifeEvent } from '@/hooks/useLifeEvents';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  exploreDateWithContext, 
  DateExplorerResult,
  LifeEventTag 
} from '@/lib/structuralStressEngine';
import { LIFE_EVENT_LABELS } from '@/lib/structuralStressCopy';

interface DateExplorerProps {
  chart: NatalChart;
  onSaveEvent?: (event: { chartId: string; eventDate: Date; eventType: string; eventLabel?: string; notes?: string }) => Promise<LifeEvent | null>;
  savingEvent?: boolean;
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

export const DateExplorer = ({ chart, onSaveEvent, savingEvent }: DateExplorerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [lifeEvent, setLifeEvent] = useState<LifeEventTag | undefined>();
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<DateExplorerResult | null>(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  const handleExplore = () => {
    if (!selectedDate) return;
    const explorerResult = exploreDateWithContext(chart, selectedDate, lifeEvent);
    setResult(explorerResult);
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
          Enter a specific date to see what transits were active and understand the pressure dynamics.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker and Life Event Selection */}
        <div className="flex flex-wrap gap-3">
          {/* Date Picker */}
          <Popover>
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
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="p-3 pointer-events-auto"
                fromYear={1940}
                toYear={2035}
              />
            </PopoverContent>
          </Popover>

          {/* Life Event Selector */}
          <div className="relative">
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
              <div className="absolute top-full left-0 mt-1 w-[220px] bg-background border border-border rounded-md shadow-lg z-50 py-1 max-h-[300px] overflow-y-auto">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors text-muted-foreground"
                  onClick={() => { setLifeEvent(undefined); setShowEventDropdown(false); }}
                >
                  No context
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
            What was happening?
          </Button>
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
                Save Event
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4 animate-in fade-in-50 duration-300">
            {/* Summary */}
            <div className="flex items-start gap-3">
              <Badge className={`${PHASE_COLORS[result.phaseLabel]} border`}>
                {result.phaseLabel}
              </Badge>
              <p className="text-sm text-foreground/90">{result.summary}</p>
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

            {/* Active Transits */}
            {result.activeTransits.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
                  Active Transits on {format(result.date, "MMMM d, yyyy")}
                </h4>
                <div className="space-y-2">
                  {result.activeTransits.map((transit, i) => (
                    <div 
                      key={i}
                      className="p-3 border border-border rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-medium">{transit.planet}</span>
                        <span className="text-muted-foreground">{transit.aspectType}</span>
                        <span className="font-medium">{transit.natalTarget}</span>
                        <span className={cn("text-xs", MOTION_COLORS[transit.motion])}>
                          ({transit.motion}, {transit.orb.toFixed(1)}° orb)
                        </span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {transit.axis}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transit.narrative}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No major structural transits active on this date. Outer planets were not forming hard aspects to your personal points.
              </p>
            )}

            {/* Phase Score Visualization */}
            {result.activeTransits.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Pressure Dynamics
                </h4>
                <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
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
                <div className="flex gap-4 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Containment
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Stress
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Release
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Trigger
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
