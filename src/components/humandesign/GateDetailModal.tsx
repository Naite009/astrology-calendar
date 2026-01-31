import { X } from 'lucide-react';
import { getGateByNumber } from '@/data/humanDesignGates';
import { HumanDesignChart } from '@/types/humanDesign';

interface GateDetailModalProps {
  gateNumber: number;
  chart: HumanDesignChart;
  onClose: () => void;
}

export const GateDetailModal = ({ gateNumber, chart, onClose }: GateDetailModalProps) => {
  const gate = getGateByNumber(gateNumber);
  
  if (!gate) return null;

  // Check activation status
  const consciousActivation = chart.personalityActivations.find(a => a.gate === gateNumber);
  const unconsciousActivation = chart.designActivations.find(a => a.gate === gateNumber);
  const isConscious = !!consciousActivation;
  const isUnconscious = !!unconsciousActivation;
  const isHarmonic = isConscious && isUnconscious;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-primary">{gateNumber}</span>
              <h2 className="font-serif text-xl text-foreground">{gate.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              I-Ching: {gate.iChing} • {gate.center} Center
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Activation status */}
          <div className="flex gap-2 flex-wrap">
            {isHarmonic ? (
              <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary border border-primary/30">
                Harmonic (Both)
              </span>
            ) : isConscious ? (
              <span className="px-2 py-1 text-xs rounded bg-foreground/20 text-foreground border border-foreground/30">
                Conscious (Personality)
              </span>
            ) : isUnconscious ? (
              <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Unconscious (Design)
              </span>
            ) : (
              <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                Not Activated
              </span>
            )}
            {gate.circuit && (
              <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                {gate.circuit}
              </span>
            )}
          </div>

          {/* Line information if activated */}
          {(consciousActivation || unconsciousActivation) && (
            <div className="bg-muted/30 rounded p-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Your Activation
              </span>
              <div className="mt-2 space-y-1">
                {consciousActivation && (
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Conscious:</span>{' '}
                    Gate {consciousActivation.gate}.{consciousActivation.line} via{' '}
                    {consciousActivation.planet}
                  </p>
                )}
                {unconsciousActivation && (
                  <p className="text-sm">
                    <span className="font-medium text-red-400">Unconscious:</span>{' '}
                    Gate {unconsciousActivation.gate}.{unconsciousActivation.line} via{' '}
                    {unconsciousActivation.planet}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Keynotes */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Keynotes
            </span>
            <div className="mt-2 flex gap-2 flex-wrap">
              {gate.keynotes.map((keynote, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-muted rounded">
                  {keynote}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Description
            </span>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {gate.description}
            </p>
          </div>

          {/* Expression */}
          {(isConscious || isUnconscious) && (
            <div className="grid gap-3">
              {isConscious && (
                <div className="bg-foreground/5 border border-foreground/10 rounded p-3">
                  <span className="text-[10px] uppercase tracking-widest text-foreground/70">
                    Conscious Expression
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {gate.consciousExpression}
                  </p>
                </div>
              )}
              {isUnconscious && (
                <div className="bg-red-500/5 border border-red-500/10 rounded p-3">
                  <span className="text-[10px] uppercase tracking-widest text-red-400/70">
                    Unconscious Expression
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {gate.unconsciousExpression}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Gifts & Challenges */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Gifts
              </span>
              <ul className="mt-2 space-y-1">
                {gate.gifts.map((gift, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">+</span>
                    {gift}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Challenges
              </span>
              <ul className="mt-2 space-y-1">
                {gate.challenges.map((challenge, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Biological correlation */}
          {gate.biologicalCorrelation && (
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              <span className="text-[10px] uppercase tracking-widest">
                Biological Correlation:
              </span>{' '}
              {gate.biologicalCorrelation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
