import { useMemo, forwardRef } from 'react';
import { AlertTriangle, Bell, Clock, ChevronRight, Zap, Star } from 'lucide-react';
import { calculateTransitAlerts, getAlertEmoji, getPriorityLabel, TransitAlert, AlertPriority } from '@/lib/transitAlerts';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransitAlertsCardProps {
  natalChart: NatalChart | null;
  maxAlerts?: number;
}

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

const AlertItem = forwardRef<HTMLDivElement, { alert: TransitAlert }>(({ alert }, ref) => {
  const styles = getPriorityStyles(alert.priority);
  
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
            {alert.orb}° orb
            {alert.daysUntilExact !== null && alert.daysUntilExact > 0 && (
              <span className="ml-2 text-primary">
                → Exact in ~{alert.daysUntilExact} days
              </span>
            )}
          </p>
          
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
  ({ natalChart, maxAlerts = 5 }, ref) => {
    const alerts = useMemo(() => {
      if (!natalChart) return [];
      return calculateTransitAlerts(natalChart);
    }, [natalChart]);
    
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
    
    const criticalAlerts = alerts.filter(a => a.priority === 'critical' || a.alertType === 'exact');
    const otherAlerts = alerts.filter(a => a.priority !== 'critical' && a.alertType !== 'exact');
    const displayAlerts = [...criticalAlerts, ...otherAlerts].slice(0, maxAlerts);
    
    if (displayAlerts.length === 0) {
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
                {alerts.length} active transit{alerts.length !== 1 ? 's' : ''} to your chart
              </p>
            </div>
          </div>
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalAlerts.length} Critical
            </Badge>
          )}
        </div>
        
        {/* Alerts List */}
        <ScrollArea className={displayAlerts.length > 3 ? 'h-80' : 'h-auto'}>
          <div className="space-y-2">
            {displayAlerts.map((alert, index) => (
              <AlertItem key={`${alert.id}-${index}`} alert={alert} />
            ))}
          </div>
        </ScrollArea>
        
        {alerts.length > maxAlerts && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            +{alerts.length - maxAlerts} more alerts
          </p>
        )}
      </div>
    );
  }
);

TransitAlertsCard.displayName = 'TransitAlertsCard';
