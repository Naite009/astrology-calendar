/**
 * Composite / Davison card.
 *
 * This card no longer keeps any interpretation of its own: it renders the same
 * canonical composite reading as the Composite tab, so the two can never say
 * different things about the same pair.
 */

import { useMemo, useState } from 'react';
import { Users, Calendar } from 'lucide-react';
import { calculateCompositeChart, calculateDavisonChart } from '@/lib/compositeChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { buildCompositeReading } from '@/lib/relationship/compositeReading';
import { buildRelationshipContext, type RelationshipContext } from '@/lib/relationship/relationshipContext';
import { CompositeReadingView } from '@/components/relationship/CompositeReadingView';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

type ChartMethod = 'composite' | 'davison';

interface CompositeChartCardProps {
  chart1: NatalChart | null;
  chart2: NatalChart | null;
  /** Age and relationship context. Built as neutral when not supplied. */
  relContext?: RelationshipContext;
}

const MethodToggle = ({
  method,
  onMethodChange,
}: {
  method: ChartMethod;
  onMethodChange: (m: ChartMethod) => void;
}) => (
  <TooltipProvider>
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary/50">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onMethodChange('composite')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              method === 'composite' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            Composite
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px]">
          <p className="text-xs">Midpoint method: every position is the halfway point between the two natal positions.</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onMethodChange('davison')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              method === 'davison' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            Davison
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px]">
          <p className="text-xs">Real sky method: positions for the moment halfway between the two births.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);

export const CompositeChartCard = ({ chart1, chart2, relContext }: CompositeChartCardProps) => {
  const [method, setMethod] = useState<ChartMethod>('composite');

  const context = useMemo(
    () => relContext ?? buildRelationshipContext({ kind: 'neutral', chart1, chart2 }),
    [relContext, chart1, chart2],
  );

  const reading = useMemo(() => {
    if (!chart1 || !chart2) return null;
    const model =
      method === 'composite'
        ? calculateCompositeChart(chart1, chart2, context).model
        : calculateDavisonChart(chart1, chart2, context).model;
    return buildCompositeReading(model, context);
  }, [chart1, chart2, method, context]);

  const davison = useMemo(() => {
    if (!chart1 || !chart2 || method !== 'davison') return null;
    return calculateDavisonChart(chart1, chart2, context);
  }, [chart1, chart2, method, context]);

  if (!chart1 || !chart2) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/20">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Users size={18} />
          <h3 className="font-medium">Relationship chart</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose two charts to see the relationship read as a chart of its own.
        </p>
      </div>
    );
  }

  if (!reading) return null;

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{method === 'composite' ? 'Composite' : 'Davison'} chart</h3>
            <p className="text-xs text-muted-foreground">
              {chart1.name} + {chart2.name}
            </p>
          </div>
        </div>
        <MethodToggle method={method} onMethodChange={setMethod} />
      </div>

      <CompositeReadingView
        reading={reading}
        wheelSize={300}
        extraHeader={
          davison ? (
            <div className="p-2 rounded-lg border border-border bg-secondary/30 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-primary" />
                <p className="text-xs text-muted-foreground">
                  Midpoint moment used:{' '}
                  <span className="font-medium text-foreground">{format(davison.averagedDate, 'MMMM d, yyyy')}</span>
                </p>
              </div>
              {davison.momentNote && (
                <p className="text-xs text-amber-700 dark:text-amber-400">{davison.momentNote}</p>
              )}
            </div>
          ) : null
        }
      />
    </div>
  );
};
