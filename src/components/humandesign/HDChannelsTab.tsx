import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HumanDesignChart } from '@/types/humanDesign';
import { getChannelByGates, HDChannel } from '@/data/humanDesignChannels';
import { getGateByNumber } from '@/data/humanDesignGates';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HDChannelsTabProps {
  chart: HumanDesignChart;
}

interface ChannelWithGateInfo {
  channel: HDChannel;
  gate1Activations: Array<{ line: number; planet: string; isConscious: boolean }>;
  gate2Activations: Array<{ line: number; planet: string; isConscious: boolean }>;
}

export const HDChannelsTab = ({ chart }: HDChannelsTabProps) => {
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

  // Build channel info from defined channels
  const channelsWithInfo: ChannelWithGateInfo[] = [];

  for (const channelId of chart.definedChannels) {
    const [g1, g2] = channelId.split('-').map(Number);
    const channel = getChannelByGates(g1, g2);
    
    if (!channel) continue;

    // Find gate activations
    const gate1Activations: Array<{ line: number; planet: string; isConscious: boolean }> = [];
    const gate2Activations: Array<{ line: number; planet: string; isConscious: boolean }> = [];

    chart.personalityActivations.forEach(a => {
      if (a.gate === channel.gates[0]) {
        gate1Activations.push({ line: a.line, planet: a.planet, isConscious: true });
      }
      if (a.gate === channel.gates[1]) {
        gate2Activations.push({ line: a.line, planet: a.planet, isConscious: true });
      }
    });

    chart.designActivations.forEach(a => {
      if (a.gate === channel.gates[0]) {
        gate1Activations.push({ line: a.line, planet: a.planet, isConscious: false });
      }
      if (a.gate === channel.gates[1]) {
        gate2Activations.push({ line: a.line, planet: a.planet, isConscious: false });
      }
    });

    channelsWithInfo.push({ channel, gate1Activations, gate2Activations });
  }

  // Sort by channel name
  channelsWithInfo.sort((a, b) => a.channel.name.localeCompare(b.channel.name));

  const toggleChannel = (channelId: string) => {
    setExpandedChannels(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  };

  const getChannelId = (ch: HDChannel) => `${ch.gates[0]}-${ch.gates[1]}`;

  return (
    <div className="space-y-4">
      <div className="rounded border border-border bg-card p-4 space-y-4">
        <div>
          <h4 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Defined Channels ({channelsWithInfo.length})
          </h4>
          <p className="text-sm text-muted-foreground">
            Channels form when you have both gates activated, creating a fixed energy flow between two centers. A defined channel means this energy is <strong className="text-foreground">always on</strong> for you — it's a reliable, consistent part of who you are.
          </p>
        </div>

        <div className="border-t border-border pt-3">
          <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Channel Types — What They Mean
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 px-2 py-0.5 text-xs rounded bg-orange-500/20 text-orange-500">Generated</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Motor energy that responds.</strong> These channels connect a motor center (Sacral, Root, Heart, or Solar Plexus) and create energy you can sustain. You access this energy by <em>responding</em> — waiting for life to bring you something to react to, rather than initiating.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-500">Projected</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Wisdom that needs recognition.</strong> These channels carry awareness and insight rather than raw motor energy. Their gifts are best expressed when <em>invited or recognized</em> by others. Sharing unsolicited can meet resistance.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-500">Manifested</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Motor connected directly to the Throat.</strong> These channels give you the ability to <em>initiate and act</em> independently. The key practice is to <em>inform</em> those affected before you act — this removes resistance.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Activation Colors
          </h5>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-foreground/20 border border-foreground/30"></span>
              <span className="text-muted-foreground"><strong className="text-foreground">Personality</strong> (Conscious) — the you that you know</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30"></span>
              <span className="text-muted-foreground"><strong className="text-destructive">Design</strong> (Unconscious) — the you that others see</span>
            </div>
          </div>
        </div>
      </div>

      {channelsWithInfo.length === 0 ? (
        <div className="rounded border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No defined channels in this chart.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {channelsWithInfo.map(({ channel, gate1Activations, gate2Activations }) => {
            const channelId = getChannelId(channel);
            const isExpanded = expandedChannels.has(channelId);
            const gate1Data = getGateByNumber(channel.gates[0]);
            const gate2Data = getGateByNumber(channel.gates[1]);

            return (
              <Collapsible
                key={channelId}
                open={isExpanded}
                onOpenChange={() => toggleChannel(channelId)}
              >
                <div className="rounded border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-semibold text-primary">
                        {channel.gates[0]}-{channel.gates[1]}
                      </span>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {channel.centers[0]} ↔ {channel.centers[1]} • {channel.circuit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        channel.type === 'Generated' ? 'bg-orange-500/20 text-orange-500' :
                        channel.type === 'Projected' ? 'bg-blue-500/20 text-blue-500' :
                        channel.type === 'Manifested' || channel.type === 'Manifestation' ? 'bg-red-500/20 text-red-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {channel.type}
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 py-4 border-t border-border bg-secondary/10 space-y-4">
                      {/* Channel Theme */}
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Channel Theme
                        </h5>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {channel.keynotes.map((kn, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {kn}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {channel.description}
                        </p>
                      </div>

                      {/* Gate Breakdown */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Gate 1 */}
                        <div className="p-3 rounded border border-border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-semibold text-primary">
                              Gate {channel.gates[0]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {gate1Data?.name || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {channel.centers[0]} Center
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {gate1Activations.map((act, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 text-xs rounded ${
                                  act.isConscious
                                    ? 'bg-foreground/10 text-foreground'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                {act.planet} L{act.line}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Gate 2 */}
                        <div className="p-3 rounded border border-border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-semibold text-primary">
                              Gate {channel.gates[1]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {gate2Data?.name || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {channel.centers[1]} Center
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {gate2Activations.map((act, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 text-xs rounded ${
                                  act.isConscious
                                    ? 'bg-foreground/10 text-foreground'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                {act.planet} L{act.line}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Gifts & Challenges */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                            Gifts
                          </h5>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {channel.gifts.map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                            Challenges
                          </h5>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {channel.challenges.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};
