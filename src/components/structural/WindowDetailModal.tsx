import { X } from 'lucide-react';
import { StructuralWindow, ChartSignature } from '@/lib/structuralStressEngine';
import { PHASE_COPY, AXIS_HEADLINES, SAFETY_COPY } from '@/lib/structuralStressCopy';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface WindowDetailModalProps {
  window: StructuralWindow;
  chartSignature: ChartSignature;
  onClose: () => void;
  hasSafetyTag: boolean;
}

export const WindowDetailModal = ({ 
  window, 
  chartSignature, 
  onClose,
  hasSafetyTag 
}: WindowDetailModalProps) => {
  const { phase_label, date_range, axis_badge, output_copy, events } = window;
  const phaseInfo = PHASE_COPY[phase_label];
  const axisInfo = AXIS_HEADLINES[axis_badge];

  const formatDateRange = () => {
    return `${format(date_range.start, 'MMMM yyyy')} – ${format(date_range.end, 'MMMM yyyy')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-start justify-between">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {formatDateRange()}
            </span>
            <h2 className="font-serif text-xl mt-1">{phaseInfo.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Safety Notice */}
          {hasSafetyTag && (
            <div className="p-4 rounded-lg border border-amber-500/50 bg-amber-500/5">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {SAFETY_COPY}
              </p>
            </div>
          )}

          {/* Layer A: Universal Archetype */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              What's Active
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {phaseInfo.body}
            </p>
            {axisInfo && (
              <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                <Badge variant="outline" className="mb-2">{axis_badge}</Badge>
                <p className="text-sm font-medium">{axisInfo.tension}</p>
                <p className="text-sm text-muted-foreground mt-1">{axisInfo.question}</p>
              </div>
            )}
          </section>

          {/* Layer B: Chart-Specific */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Where It Lands in Your Chart
            </h3>
            <ul className="space-y-1.5">
              {output_copy.chart_explanation.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">{item}</li>
              ))}
            </ul>
            
            {/* Transit Events */}
            <div className="mt-4 space-y-2">
              <span className="text-xs text-muted-foreground">Transits in this window:</span>
              <div className="flex flex-wrap gap-2">
                {events.slice(0, 6).map(event => (
                  <Badge 
                    key={event.id} 
                    variant="secondary"
                    className="text-xs"
                  >
                    {event.transiting_planet} {event.aspect_type} {event.natal_target}
                  </Badge>
                ))}
                {events.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{events.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </section>

          {/* Manifestations */}
          {output_copy.manifestations.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Possible Manifestations
              </h3>
              <div className="flex flex-wrap gap-2">
                {output_copy.manifestations.map((m, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2 py-1 bg-secondary rounded-full text-foreground/70"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                These are possible themes, not predictions. Your experience may differ.
              </p>
            </section>
          )}

          {/* Layer C: Actions */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              What to Do With It
            </h3>
            <ul className="space-y-2">
              {output_copy.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Reflection Prompts */}
          {output_copy.reflection_prompts.length > 0 && (
            <section className="border-t border-border pt-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Reflection Questions
              </h3>
              <div className="space-y-3">
                {output_copy.reflection_prompts.map((prompt, i) => (
                  <p key={i} className="text-sm italic text-foreground/70">
                    "{prompt}"
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Saturn Context */}
          {chartSignature && (
            <section className="border-t border-border pt-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Your Saturn Context
              </h3>
              <p className="text-sm text-foreground/70">
                Saturn in {chartSignature.saturn_sign} (House {chartSignature.saturn_house}) 
                {chartSignature.saturn_dispositor && (
                  <span> reports to {chartSignature.saturn_dispositor.planet}</span>
                )}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
