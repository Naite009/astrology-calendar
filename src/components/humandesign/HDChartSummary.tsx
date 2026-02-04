import { HumanDesignChart } from '@/types/humanDesign';

interface HDChartSummaryProps {
  chart: HumanDesignChart;
}

const TYPE_COLORS: Record<string, string> = {
  'Generator': 'text-orange-500',
  'Manifesting Generator': 'text-orange-400',
  'Projector': 'text-blue-500',
  'Manifestor': 'text-red-500',
  'Reflector': 'text-purple-500',
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  'Generator': 'Life force energy, here to build and respond',
  'Manifesting Generator': 'Multi-passionate initiating responder',
  'Projector': 'Guide and manager of energy',
  'Manifestor': 'Initiator and impact maker',
  'Reflector': 'Lunar being, mirror of community',
};

const AUTHORITY_DESCRIPTIONS: Record<string, string> = {
  'Emotional': 'Wait through your emotional wave for clarity',
  'Sacral': 'Trust your gut response in the moment',
  'Splenic': 'Honor your spontaneous intuitive knowing',
  'Ego Manifested': 'Follow what your heart wills',
  'Ego Projected': 'Listen to what you promise yourself',
  'Self-Projected': 'Talk it out to hear your truth',
  'Mental': 'Use your environment and sounding boards',
  'Lunar': 'Wait 29 days for major decisions',
};

// Show fuller authority labels for display
const AUTHORITY_DISPLAY_LABELS: Record<string, string> = {
  'Emotional': 'Emotional (Solar Plexus)',
  'Sacral': 'Sacral',
  'Splenic': 'Splenic',
  'Ego Manifested': 'Ego Manifested',
  'Ego Projected': 'Ego Projected',
  'Self-Projected': 'Self-Projected',
  'Mental': 'Mental/Environmental',
  'Lunar': 'Lunar',
};

export const HDChartSummary = ({ chart }: HDChartSummaryProps) => {
  const crossDisplayName = (() => {
    const typePrefix = `${chart.incarnationCross.type} `;
    // Some saved cross names already include the type (e.g., "Left Angle Cross of Dominion").
    // Avoid rendering "Left Angle Left Angle ...".
    if (chart.incarnationCross.name?.startsWith(typePrefix)) return chart.incarnationCross.name;
    return `${chart.incarnationCross.type} ${chart.incarnationCross.name}`;
  })();

  return (
    <div className="space-y-6">
      {/* Type Card */}
      <div className="rounded border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Type</span>
          <span className={`text-lg font-medium ${TYPE_COLORS[chart.type] || 'text-foreground'}`}>
            {chart.type}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {TYPE_DESCRIPTIONS[chart.type]}
        </p>
      </div>

      {/* Core Mechanics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strategy */}
        <div className="rounded border border-border bg-card p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Strategy</span>
          <p className="mt-2 text-sm font-medium text-foreground">{chart.strategy}</p>
        </div>

        {/* Authority */}
        <div className="rounded border border-border bg-card p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Authority</span>
          <p className="mt-2 text-sm font-medium text-foreground">
            {AUTHORITY_DISPLAY_LABELS[chart.authority] || chart.authority}
          </p>
        </div>

        {/* Profile */}
        <div className="rounded border border-border bg-card p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Profile</span>
          <p className="mt-2 text-sm font-medium text-foreground">{chart.profile}</p>
        </div>

        {/* Definition */}
        <div className="rounded border border-border bg-card p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Definition</span>
          <p className="mt-2 text-sm font-medium text-foreground">{chart.definitionType}</p>
        </div>
      </div>

      {/* Authority Guidance */}
      <div className="rounded border border-border bg-secondary/30 p-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Decision Making
        </span>
        <p className="mt-2 text-sm text-foreground">
          {AUTHORITY_DESCRIPTIONS[chart.authority]}
        </p>
      </div>

      {/* Incarnation Cross */}
      <div className="rounded border border-border bg-card p-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Incarnation Cross
        </span>
        <p className="mt-2 text-sm font-medium text-foreground">
          {crossDisplayName}
        </p>
        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
          <span>☉ {chart.incarnationCross.gates.consciousSun}</span>
          <span>⊕ {chart.incarnationCross.gates.consciousEarth}</span>
          <span className="text-destructive">☉ {chart.incarnationCross.gates.unconsciousSun}</span>
          <span className="text-destructive">⊕ {chart.incarnationCross.gates.unconsciousEarth}</span>
        </div>
      </div>

      {/* Centers Summary */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Defined Centers ({chart.definedCenters.length}/9)
        </span>
        <div className="flex flex-wrap gap-2">
          {chart.definedCenters.map(center => (
            <span
              key={center}
              className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary"
            >
              {center}
            </span>
          ))}
        </div>
        {chart.undefinedCenters.length > 0 && (
          <>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Open Centers
            </span>
            <div className="flex flex-wrap gap-2">
              {chart.undefinedCenters.map(center => (
                <span
                  key={center}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  {center}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Channels */}
      {chart.definedChannels.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Defined Channels ({chart.definedChannels.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {chart.definedChannels.map(channel => (
              <span
                key={channel}
                className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-foreground"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
