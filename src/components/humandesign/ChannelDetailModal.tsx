import { X } from 'lucide-react';
import { getChannelByGates } from '@/data/humanDesignChannels';
import { HumanDesignChart } from '@/types/humanDesign';

interface ChannelDetailModalProps {
  gates: [number, number];
  chart: HumanDesignChart;
  onClose: () => void;
}

export const ChannelDetailModal = ({ gates, chart, onClose }: ChannelDetailModalProps) => {
  const channel = getChannelByGates(gates[0], gates[1]);
  
  if (!channel) return null;

  // Get all activated gates from chart
  const activatedGates = new Set<number>();
  chart.personalityActivations.forEach(a => activatedGates.add(a.gate));
  chart.designActivations.forEach(a => activatedGates.add(a.gate));

  const gate1Active = activatedGates.has(channel.gates[0]);
  const gate2Active = activatedGates.has(channel.gates[1]);
  const isFullyDefined = gate1Active && gate2Active;
  const isPartiallyDefined = gate1Active || gate2Active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-light text-primary">
                {channel.gates[0]}-{channel.gates[1]}
              </span>
              <h2 className="font-serif text-xl text-foreground">{channel.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {channel.centers[0]} ↔ {channel.centers[1]}
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
          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs rounded border ${
              isFullyDefined 
                ? 'bg-primary/20 text-primary border-primary/30'
                : isPartiallyDefined
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-muted text-muted-foreground border-border'
            }`}>
              {isFullyDefined ? 'Defined' : isPartiallyDefined ? 'Hanging Gate' : 'Undefined'}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
              {channel.circuit}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
              {channel.type}
            </span>
          </div>

          {/* Gate status */}
          <div className="bg-muted/30 rounded p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Gate Status
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className={`p-2 rounded ${gate1Active ? 'bg-primary/20' : 'bg-muted'}`}>
                <p className="text-sm font-medium">Gate {channel.gates[0]}</p>
                <p className="text-xs text-muted-foreground">
                  {gate1Active ? '✓ Activated' : 'Not activated'}
                </p>
              </div>
              <div className={`p-2 rounded ${gate2Active ? 'bg-primary/20' : 'bg-muted'}`}>
                <p className="text-sm font-medium">Gate {channel.gates[1]}</p>
                <p className="text-xs text-muted-foreground">
                  {gate2Active ? '✓ Activated' : 'Not activated'}
                </p>
              </div>
            </div>
          </div>

          {/* Keynotes */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Keynotes
            </span>
            <div className="mt-2 flex gap-2 flex-wrap">
              {channel.keynotes.map((keynote, i) => (
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
              {channel.description}
            </p>
          </div>

          {/* What this means for you */}
          {isFullyDefined && (
            <div className="bg-primary/5 border border-primary/20 rounded p-3">
              <span className="text-[10px] uppercase tracking-widest text-primary/70">
                What This Means For You
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                With this channel defined, you have consistent access to this energy. 
                It's a reliable part of who you are and how you operate in the world.
                The connection between your {channel.centers[0]} and {channel.centers[1]} 
                centers is always active.
              </p>
            </div>
          )}

          {isPartiallyDefined && !isFullyDefined && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-3">
              <span className="text-[10px] uppercase tracking-widest text-yellow-500/70">
                Hanging Gate
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                You have Gate {gate1Active ? channel.gates[0] : channel.gates[1]} activated, 
                but not Gate {gate1Active ? channel.gates[1] : channel.gates[0]}. 
                This creates a "hanging gate" – you'll feel this energy strongly when around 
                someone who has the completing gate activated.
              </p>
            </div>
          )}

          {/* Gifts & Challenges */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Gifts
              </span>
              <ul className="mt-2 space-y-1">
                {channel.gifts.map((gift, i) => (
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
                {channel.challenges.map((challenge, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
