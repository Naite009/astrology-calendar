import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

type TierId = 't1' | 't2' | 't3' | 't4' | 't5';

interface Props {
  tier: TierId;
  analysis: SolarReturnAnalysis;
}

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-border rounded-sm p-3 bg-background/50">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
    <div className="text-sm font-medium text-foreground">{value}</div>
  </div>
);

const SectionList = ({ items }: { items: string }) => (
  <div className="mt-3 pt-3 border-t border-border">
    <span className="text-xs text-muted-foreground">{items}</span>
  </div>
);

export const TierPreviewContent = ({ tier, analysis }: Props) => {
  const sunHouseTheme = analysis.sunHouse?.theme || 'self-discovery';
  const moonKeyword = analysis.moonSign || 'intuitive shifts';
  const profectionTheme = analysis.profectionYear?.interpretation?.slice(0, 60) || 'personal growth';
  const timeLord = analysis.profectionYear?.timeLord || '';
  const topAspects = analysis.srToNatalAspects?.slice(0, 3) || [];
  const moonPhase = analysis.moonPhase?.phase || 'Waxing';
  const stelliums = analysis.stelliums || [];

  switch (tier) {
    case 't1':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Where Your Energy Goes" value={sunHouseTheme} />
            <SummaryCard label="Your Emotional Weather" value={moonKeyword} />
            <SummaryCard label="This Year Activates" value={`House ${analysis.profectionYear?.houseNumber || '—'}`} />
          </div>
          <SectionList items="This report includes: Year theme · Your Big Three activation · Quarterly outlook · Three words for the year" />
        </div>
      );

    case 't2':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Where Your Energy Goes" value={sunHouseTheme} />
            <SummaryCard label="Your Emotional Weather" value={moonKeyword} />
            <SummaryCard label="This Year Activates" value={`House ${analysis.profectionYear?.houseNumber || '—'}`} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Time Lord" value={timeLord || '—'} />
            <SummaryCard label="Top Aspect" value={topAspects[0] ? `${topAspects[0].planet1}–${topAspects[0].planet2}` : '—'} />
            <SummaryCard label="Moon Phase" value={moonPhase} />
          </div>
          <SectionList items="Also includes: Big Three deep dive · Moon analysis · Profection year · Saturn focus · Monthly overview" />
        </div>
      );

    case 't3':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard label="Year Theme" value={analysis.yearlyTheme?.yearTheme || 'Transformation'} />
            <SummaryCard label="Stelliums" value={stelliums.length ? stelliums.map(s => `${s.location} (${s.planets.join(', ')})`).join('; ') : 'None detected'} />
            <SummaryCard label="Strongest Aspect" value={topAspects[0] ? `${topAspects[0].planet1} ${topAspects[0].type} ${topAspects[0].planet2}` : '—'} />
            <SummaryCard label="Moon Analysis" value={`${analysis.moonSign} in House ${analysis.moonHouse?.house || '—'}`} />
          </div>
          <SectionList items="Also includes: All aspects · Planet spotlight · Vertex · Degree conduits · Repeated themes · Full monthly calendar" />
        </div>
      );

    case 't4':
      return (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground italic">Dignity table and health overlay — coming in next release</div>
          <SectionList items="Will include: Planet dignity report · Health overlay · Eclipse sensitivity · Intercepted signs · Mutual receptions · Quarterly focus" />
        </div>
      );

    case 't5':
      return (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground italic">Master synthesis with cross-technique analysis — coming in next release</div>
          <SectionList items="Will include: Fixed stars · Arabic Parts · Firdaria · Antiscia · Solar arc directions · Relationship/money/career synthesis · Oracle narrative" />
        </div>
      );
  }
};
