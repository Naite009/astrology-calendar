import { useMemo } from 'react';
import { format } from 'date-fns';
import { Milestone, Clock, Star } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDetailedSaturnCycles, DetailedSaturnCycles } from '@/lib/saturnCycleCalculator';

interface LifeMilestonesProps {
  chart: NatalChart;
  onMilestoneClick: (date: Date) => void;
}

export const LifeMilestones = ({ chart, onMilestoneClick }: LifeMilestonesProps) => {
  const cycles = useMemo<DetailedSaturnCycles | null>(() => {
    if (!chart.birthDate) return null;
    try {
      return calculateDetailedSaturnCycles(chart);
    } catch {
      return null;
    }
  }, [chart]);

  if (!cycles) {
    return null;
  }

  const now = new Date();

  // Filter to major milestones: Returns and Oppositions
  const majorMilestones = cycles.cycles.filter(
    c => c.phaseName === 'Return' || c.phaseName === 'Opposition'
  );

  // Add Uranus Opposition if available
  const uranusOpp = cycles.uranusOpposition;

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Milestone className="h-5 w-5 text-amber-500" />
          Key Life Milestones
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click any milestone to explore the transits active during that period.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {majorMilestones.map((milestone, i) => {
            const firstEvent = milestone.events[0];
            if (!firstEvent) return null;

            const isPast = milestone.isPast;
            const isCurrent = !isPast && !milestone.isUpcoming;
            const isUpcoming = milestone.isUpcoming;

            return (
              <button
                key={i}
                onClick={() => onMilestoneClick(firstEvent.date)}
                className="w-full text-left p-3 border border-border rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full ${
                  isCurrent ? 'bg-amber-500 animate-pulse' : 
                  isPast ? 'bg-blue-500' : 'bg-muted-foreground'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {milestone.phaseName === 'Return' 
                        ? `Saturn Return #${milestone.cycleNumber}`
                        : `Saturn Opposition #${milestone.cycleNumber}`
                      }
                    </span>
                    {isCurrent && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Active Now
                      </Badge>
                    )}
                    {isUpcoming && (
                      <Badge variant="outline" className="text-xs">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {format(firstEvent.date, 'MMMM yyyy')} (age ~{firstEvent.age})
                  </div>
                </div>

                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Explore →
                </span>
              </button>
            );
          })}

          {/* Uranus Opposition */}
          {uranusOpp && uranusOpp.events.length > 0 && (
            <button
              onClick={() => onMilestoneClick(uranusOpp.events[0].date)}
              className="w-full text-left p-3 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group flex items-center gap-3"
            >
              <div className={`w-2 h-2 rounded-full ${
                !uranusOpp.isPast && !uranusOpp.isUpcoming ? 'bg-cyan-500 animate-pulse' : 
                uranusOpp.isPast ? 'bg-cyan-500' : 'bg-muted-foreground'
              }`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-cyan-700 dark:text-cyan-400">
                    Uranus Opposition
                  </span>
                  <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/30 text-xs">
                    Midlife Awakening
                  </Badge>
                  {!uranusOpp.isPast && !uranusOpp.isUpcoming && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                      Active Now
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {format(uranusOpp.events[0].date, 'MMMM yyyy')} (age ~{uranusOpp.events[0].age})
                </div>
              </div>

              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Explore →
              </span>
            </button>
          )}
        </div>

        {majorMilestones.length === 0 && !uranusOpp && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No major milestones calculated. Check that birth date is set correctly.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
