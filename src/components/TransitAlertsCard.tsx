import { useMemo, forwardRef, useState, useEffect } from 'react';
import { AlertTriangle, Bell, Clock, ChevronRight, Zap, Star, ChevronDown, Moon } from 'lucide-react';
import { calculateTransitAlerts, getAlertEmoji, getPriorityLabel, TransitAlert, AlertPriority } from '@/lib/transitAlerts';
import { calculateProgressedMoonTransits, ProgressedMoonTransit, calculateSecondaryProgressions, getProgressedMoonInfo } from '@/lib/secondaryProgressions';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TransitAlertsCardProps {
  natalChart: NatalChart | null;
  maxAlerts?: number;
}

// Major planets for priority display
const MAJOR_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'];

const getPriorityStyles = (priority: AlertPriority): { bg: string; border: string; text: string } => {
  switch (priority) {
    case 'critical':
      return { 
        bg: 'bg-red-50 dark:bg-red-950/30', 
        border: 'border-red-300 dark:border-red-800', 
        text: 'text-red-700 dark:text-red-300' 
      };
    case 'high':
      return { 
        bg: 'bg-orange-50 dark:bg-orange-950/30', 
        border: 'border-orange-300 dark:border-orange-800', 
        text: 'text-orange-700 dark:text-orange-300' 
      };
    case 'medium':
      return { 
        bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
        border: 'border-yellow-300 dark:border-yellow-800', 
        text: 'text-yellow-700 dark:text-yellow-300' 
      };
    default:
      return { 
        bg: 'bg-blue-50 dark:bg-blue-950/30', 
        border: 'border-blue-300 dark:border-blue-800', 
        text: 'text-blue-700 dark:text-blue-300' 
      };
  }
};

// Progressed Moon Alert Item
const ProgressedMoonItem = forwardRef<HTMLDivElement, { transit: ProgressedMoonTransit }>(({ transit }, ref) => {
  const styles = getPriorityStyles(transit.priority);
  
  // Motion indicator
  const motionIndicator = transit.motion === 'exact' ? '⚡' : transit.motion === 'applying' ? '↗' : '↘';
  const motionLabel = transit.motion === 'exact' ? 'Exact' : transit.motion === 'applying' ? 'Applying' : 'Separating';
  
  return (
    <div ref={ref} className={`p-4 rounded-lg border-2 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">☽</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">{transit.title}</span>
            <Badge variant="outline" className={`text-xs ${styles.text}`}>
              PROGRESSED
            </Badge>
            {transit.priority === 'critical' && (
              <Badge className="text-xs bg-primary animate-pulse">
                <Zap size={10} className="mr-1" />
                MAJOR
              </Badge>
            )}
            {transit.motion === 'exact' && transit.aspectType !== 'position' && (
              <Badge className="text-xs bg-primary animate-pulse">
                <Zap size={10} className="mr-1" />
                EXACT NOW
              </Badge>
            )}
          </div>
          
          {/* Orb and Motion */}
          {transit.aspectType !== 'position' && (
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium">{transit.orb.toFixed(2)}°</span> orb
              <span className="ml-2">({motionIndicator} {motionLabel})</span>
              {transit.monthsUntilExact !== null && transit.monthsUntilExact > 0 && (
                <span className="ml-2 text-primary font-medium">
                  → Exact in ~{transit.monthsUntilExact} month{transit.monthsUntilExact !== 1 ? 's' : ''}
                  {transit.exactDate && (
                    <span className="text-muted-foreground ml-1">
                      ({transit.exactDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                    </span>
                  )}
                </span>
              )}
            </p>
          )}
          
          <p className="text-sm text-foreground mb-2">{transit.description}</p>
          
          {transit.clientSummary && (
            <div className="flex items-start gap-1.5 text-xs mt-2 p-2 rounded bg-primary/5">
              <Star size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground italic">{transit.clientSummary}</span>
            </div>
          )}
          
          {transit.houseMeaning && transit.aspectType === 'position' && (
            <div className="mt-2 p-2 rounded bg-secondary/30">
              <p className="text-xs font-medium text-muted-foreground">House {transit.house} Focus:</p>
              <p className="text-xs text-foreground">{transit.houseMeaning.clientFeel}</p>
            </div>
          )}
          
          {transit.phaseInfo && transit.aspectType === 'position' && (
            <div className="mt-2 p-2 rounded bg-secondary/30">
              <p className="text-xs font-medium text-muted-foreground">{transit.phaseInfo.phaseName}:</p>
              <p className="text-xs text-foreground">{transit.phaseInfo.lifeTheme}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ProgressedMoonItem.displayName = 'ProgressedMoonItem';

const AlertItem = forwardRef<HTMLDivElement, { alert: TransitAlert }>(({ alert }, ref) => {
  const styles = getPriorityStyles(alert.priority);
  
  // Motion indicator
  const motionIndicator = alert.motion === 'exact' ? '⚡' : alert.motion === 'applying' ? '↗' : '↘';
  const motionLabel = alert.motion === 'exact' ? 'Exact' : alert.motion === 'applying' ? 'Applying' : 'Separating';
  
  return (
    <div ref={ref} className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0">{getAlertEmoji(alert)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">{alert.title}</span>
            <Badge variant="outline" className={`text-xs ${styles.text}`}>
              {getPriorityLabel(alert.priority)}
            </Badge>
            {alert.alertType === 'exact' && (
              <Badge className="text-xs bg-primary animate-pulse">
                <Zap size={10} className="mr-1" />
                EXACT NOW
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">
            {alert.transitPlanet} {alert.aspectSymbol} {alert.natalPlanet} 
            <span className="mx-1">•</span>
            <span className="font-medium">{alert.orb}°</span>
            <span className="ml-1">({motionIndicator} {motionLabel})</span>
            {alert.daysUntilExact !== null && alert.daysUntilExact > 0 && (
              <span className="ml-2 text-primary">
                → Exact in ~{alert.daysUntilExact} days
              </span>
            )}
          </p>
          
          {/* Show angle connections if any */}
          {alert.angleAspects && alert.angleAspects.length > 0 && (
            <div className="mb-2 p-2 rounded bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">Also Hitting Angles:</p>
              <div className="flex flex-wrap gap-2">
                {alert.angleAspects.map((angleAsp, i) => (
                  <span key={i} className="text-xs">
                    <span className="font-medium">{angleAsp.aspectSymbol} {angleAsp.angle}</span>
                    <span className="text-muted-foreground ml-1">
                      ({angleAsp.orb}° {angleAsp.motion === 'exact' ? '⚡ Exact' : angleAsp.motion === 'applying' ? '↗ Applying' : '↘ Separating'})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-foreground mb-2">{alert.description}</p>
          
          <div className="flex items-start gap-1.5 text-xs">
            <Star size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{alert.advice}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

AlertItem.displayName = 'AlertItem';

export const TransitAlertsCard = forwardRef<HTMLDivElement, TransitAlertsCardProps>(
  ({ natalChart, maxAlerts = 10 }, ref) => {
    const [isMinorOpen, setIsMinorOpen] = useState(false);
    
    // Calculate progressed Moon transits asynchronously
    const [progressedMoonTransits, setProgressedMoonTransits] = useState<ProgressedMoonTransit[]>([]);
    const [alerts, setAlerts] = useState<TransitAlert[]>([]);
    useEffect(() => {
      if (!natalChart) { setProgressedMoonTransits([]); setAlerts([]); return; }
      // Defer heavy calculations to avoid blocking main thread
      const t1 = setTimeout(() => {
        setProgressedMoonTransits(calculateProgressedMoonTransits(natalChart));
      }, 50);
      const t2 = setTimeout(() => {
        setAlerts(calculateTransitAlerts(natalChart));
      }, 150);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [natalChart]);
    
    // Separate major planet transits from minor ones
    const { majorAlerts, minorAlerts } = useMemo(() => {
      const major: TransitAlert[] = [];
      const minor: TransitAlert[] = [];
      
      alerts.forEach(alert => {
        // Check if transit planet is a major planet
        const isMajorTransit = MAJOR_PLANETS.includes(alert.transitPlanet);
        // Check if natal planet is personal/important
        const isPersonalNatal = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'MC'].includes(alert.natalPlanet);
        
        if (isMajorTransit && isPersonalNatal) {
          major.push(alert);
        } else if (alert.isOuterPlanet) {
          major.push(alert);
        } else {
          minor.push(alert);
        }
      });
      
      // Sort major alerts: outer planets to personal points first
      major.sort((a, b) => {
        // Outer planets to personal planets get highest priority
        const outerPlanets = ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'];
        const personalPlanets = ['Sun', 'Moon', 'Ascendant', 'MC'];
        
        const aIsOuter = outerPlanets.includes(a.transitPlanet);
        const bIsOuter = outerPlanets.includes(b.transitPlanet);
        const aIsPersonal = personalPlanets.includes(a.natalPlanet);
        const bIsPersonal = personalPlanets.includes(b.natalPlanet);
        
        // Outer to personal first
        if (aIsOuter && aIsPersonal && !(bIsOuter && bIsPersonal)) return -1;
        if (bIsOuter && bIsPersonal && !(aIsOuter && aIsPersonal)) return 1;
        
        // Then by priority
        const priorityOrder: Record<AlertPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by orb (tighter first)
        return a.orb - b.orb;
      });
      
      return { majorAlerts: major, minorAlerts: minor };
    }, [alerts]);
    
    if (!natalChart) {
      return (
        <div ref={ref} className="p-4 rounded-xl border border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Bell size={18} />
            <h3 className="font-medium">Transit Alerts</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Add your birth chart to see active transit alerts
          </p>
        </div>
      );
    }
    
    const totalAlerts = progressedMoonTransits.length + majorAlerts.length + minorAlerts.length;
    
    if (totalAlerts === 0) {
      return (
        <div ref={ref} className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <Bell size={18} />
            <h3 className="font-medium">Transit Alerts</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            No major transits approaching your personal planets right now. Smooth sailing! ✨
          </p>
        </div>
      );
    }
    
    const criticalCount = [...progressedMoonTransits, ...majorAlerts].filter(
      a => a.priority === 'critical' || ('alertType' in a && a.alertType === 'exact')
    ).length;
    
    return (
      <div ref={ref} className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Transit Alerts</h3>
              <p className="text-xs text-muted-foreground">
                {totalAlerts} active transit{totalAlerts !== 1 ? 's' : ''} to your chart
              </p>
            </div>
          </div>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} Critical
            </Badge>
          )}
        </div>
        
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-3">
            {/* PROGRESSED MOON — ALWAYS FIRST */}
            {progressedMoonTransits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Moon size={14} className="text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    Progressed Moon (Emotional Weather)
                  </span>
                </div>
                {progressedMoonTransits.map((transit, index) => (
                  <ProgressedMoonItem key={`prog-${index}`} transit={transit} />
                ))}
              </div>
            )}
            
            {/* MAJOR PLANET TRANSITS */}
            {majorAlerts.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-orange-500" />
                  <span className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
                    Major Transits ({majorAlerts.length})
                  </span>
                </div>
                {majorAlerts.slice(0, maxAlerts).map((alert, index) => (
                  <AlertItem key={`major-${alert.id}-${index}`} alert={alert} />
                ))}
              </div>
            )}
            
            {/* MINOR TRANSITS — COLLAPSIBLE */}
            {minorAlerts.length > 0 && (
              <Collapsible open={isMinorOpen} onOpenChange={setIsMinorOpen} className="mt-4">
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <ChevronDown 
                    size={14} 
                    className={`text-muted-foreground transition-transform ${isMinorOpen ? 'rotate-180' : ''}`}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    Minor Transits & Asteroids ({minorAlerts.length})
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {minorAlerts.map((alert, index) => (
                    <AlertItem key={`minor-${alert.id}-${index}`} alert={alert} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

TransitAlertsCard.displayName = 'TransitAlertsCard';