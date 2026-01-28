import { MeaningDialMode } from '@/lib/structuralStressEngine';
import { Lightbulb, Wrench, Heart, Moon } from 'lucide-react';

interface MeaningDialProps {
  mode: MeaningDialMode;
  onModeChange: (mode: MeaningDialMode) => void;
}

const MODES: { mode: MeaningDialMode; label: string; icon: typeof Lightbulb; description: string }[] = [
  { 
    mode: 'Insight', 
    label: 'Insight', 
    icon: Lightbulb,
    description: 'Neutral, interpretive tone'
  },
  { 
    mode: 'Practical', 
    label: 'Practical', 
    icon: Wrench,
    description: 'Focus on next steps and decisions'
  },
  { 
    mode: 'Emotional Support', 
    label: 'Support', 
    icon: Heart,
    description: 'Gentle, validating language'
  },
  { 
    mode: 'Shadow Work', 
    label: 'Shadow', 
    icon: Moon,
    description: 'Pattern exploration and depth'
  }
];

export const MeaningDial = ({ mode, onModeChange }: MeaningDialProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        Meaning Mode
      </label>
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ mode: m, label, icon: Icon, description }) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
              mode === m
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
            title={description}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
