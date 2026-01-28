import { useMemo } from 'react';
import { format, differenceInDays, startOfYear, endOfYear, eachYearOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NatalChart } from '@/hooks/useNatalChart';
import { LifeEvent } from '@/hooks/useLifeEvents';
import { FocusedTransitWindow } from '@/lib/structuralStressEngine';
import { LIFE_EVENT_LABELS } from '@/lib/structuralStressCopy';
import { Calendar, Circle } from 'lucide-react';

interface PhaseTimelineProps {
  chart: NatalChart;
  transitWindows: FocusedTransitWindow[];
  lifeEvents: LifeEvent[];
  onEventClick?: (date: Date) => void;
}

const PHASE_COLORS = {
  containment: { bg: 'bg-blue-500', hover: 'bg-blue-600', text: 'Saturn (Containment)', color: '#3b82f6' },
  stress: { bg: 'bg-red-500', hover: 'bg-red-600', text: 'Pluto (Stress)', color: '#ef4444' },
  release: { bg: 'bg-emerald-500', hover: 'bg-emerald-600', text: 'Uranus/Neptune (Release)', color: '#10b981' },
  trigger: { bg: 'bg-orange-500', hover: 'bg-orange-600', text: 'Mars/Nodes (Trigger)', color: '#f97316' }
};

export const PhaseTimeline = ({ 
  chart, 
  transitWindows, 
  lifeEvents, 
  onEventClick 
}: PhaseTimelineProps) => {
  // Determine timeline range based on transit windows + buffer
  const { timelineStart, timelineEnd, years, totalDays } = useMemo(() => {
    if (transitWindows.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear() - 3, 0, 1);
      const end = new Date(now.getFullYear() + 3, 11, 31);
      return {
        timelineStart: start,
        timelineEnd: end,
        years: eachYearOfInterval({ start, end }),
        totalDays: differenceInDays(end, start)
      };
    }

    const dates = transitWindows.flatMap(w => [w.startDate, w.endDate]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const start = startOfYear(minDate);
    const end = endOfYear(maxDate);

    return {
      timelineStart: start,
      timelineEnd: end,
      years: eachYearOfInterval({ start, end }),
      totalDays: differenceInDays(end, start)
    };
  }, [transitWindows]);

  // Calculate position and width for a transit window
  const getWindowStyle = (window: FocusedTransitWindow) => {
    const startOffset = differenceInDays(window.startDate, timelineStart);
    const duration = differenceInDays(window.endDate, window.startDate);
    
    const left = (startOffset / totalDays) * 100;
    const width = Math.max((duration / totalDays) * 100, 0.5);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Calculate position for life event marker
  const getEventPosition = (date: Date) => {
    const offset = differenceInDays(date, timelineStart);
    return `${(offset / totalDays) * 100}%`;
  };

  // Group windows by row to avoid overlap
  const windowRows = useMemo(() => {
    const rows: FocusedTransitWindow[][] = [[], [], [], []];
    const sortedWindows = [...transitWindows].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    for (const window of sortedWindows) {
      // Find first row where this window doesn't overlap
      let placed = false;
      for (const row of rows) {
        const overlaps = row.some(w => 
          !(window.endDate < w.startDate || window.startDate > w.endDate)
        );
        if (!overlaps) {
          row.push(window);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows[rows.length - 1].push(window);
      }
    }
    
    return rows.filter(row => row.length > 0);
  }, [transitWindows]);

  const now = new Date();
  const nowPosition = getEventPosition(now);

  if (transitWindows.length === 0 && lifeEvents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No transit data available for timeline visualization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Phase Timeline
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Horizontal view of containment, stress, and release periods over time
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(PHASE_COLORS).map(([phase, config]) => (
            <div key={phase} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${config.bg}`} />
              <span className="text-muted-foreground">{config.text}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <Circle className="w-3 h-3 fill-primary text-primary" />
            <span className="text-muted-foreground">Life Event</span>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Year Labels */}
          <div className="flex relative h-6 border-b border-border">
            {years.map((year, i) => {
              const yearStart = startOfYear(year);
              const yearEnd = endOfYear(year);
              const left = (differenceInDays(yearStart, timelineStart) / totalDays) * 100;
              const width = (differenceInDays(yearEnd, yearStart) / totalDays) * 100;
              
              return (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground border-l border-border pl-1"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {format(year, 'yyyy')}
                </div>
              );
            })}
          </div>

          {/* Transit Bars */}
          <TooltipProvider>
            <div className="relative min-h-[100px] py-2">
              {windowRows.map((row, rowIndex) => (
                <div key={rowIndex} className="relative h-6 mb-1">
                  {row.map(window => {
                    const style = getWindowStyle(window);
                    const phaseConfig = PHASE_COLORS[window.phaseType];
                    
                    return (
                      <Tooltip key={window.id}>
                        <TooltipTrigger asChild>
                          <button
                            className={`absolute h-5 rounded-sm ${phaseConfig.bg} hover:${phaseConfig.hover} transition-opacity cursor-pointer opacity-80 hover:opacity-100`}
                            style={{ left: style.left, width: style.width }}
                            onClick={() => onEventClick?.(window.peakDate)}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {window.transitPlanet} {window.aspectType} {window.natalTarget}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(window.startDate, 'MMM yyyy')} – {format(window.endDate, 'MMM yyyy')}
                            </p>
                            {window.exactDates.length > 0 && (
                              <p className="text-xs">
                                Exact: {window.exactDates.map(d => format(d, 'MMM d, yyyy')).join(', ')}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}

              {/* Life Event Markers */}
              {lifeEvents.map(event => {
                const position = getEventPosition(event.eventDate);
                const label = LIFE_EVENT_LABELS[event.eventType as keyof typeof LIFE_EVENT_LABELS] || event.eventType;
                
                return (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <button
                        className="absolute bottom-0 transform -translate-x-1/2 cursor-pointer z-10"
                        style={{ left: position }}
                        onClick={() => onEventClick?.(event.eventDate)}
                      >
                        <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm" />
                        <div className="w-px h-[calc(100%+8px)] bg-primary/40 absolute left-1/2 -translate-x-1/2 bottom-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="space-y-1">
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.eventDate, 'MMMM d, yyyy')}
                        </p>
                        {event.notes && (
                          <p className="text-xs italic">{event.notes}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* "Now" indicator */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-foreground/50 z-20"
                style={{ left: nowPosition }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-foreground/70 whitespace-nowrap">
                  Now
                </div>
              </div>
            </div>
          </TooltipProvider>
        </div>

        {/* Summary */}
        <div className="pt-2 border-t border-border">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{transitWindows.length} transit periods</span>
            <span>{lifeEvents.length} saved life events</span>
            <span>
              {format(timelineStart, 'yyyy')} – {format(timelineEnd, 'yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
