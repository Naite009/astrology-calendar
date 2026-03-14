import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

const PROFECTION_THEMES: Record<number, string> = {
  1: 'Identity & fresh starts', 2: 'Resources & self-worth',
  3: 'Learning & communication', 4: 'Home & roots',
  5: 'Creativity & joy', 6: 'Health & daily rhythm',
  7: 'Relationships', 8: 'Transformation',
  9: 'Expansion & meaning', 10: 'Career & purpose',
  11: 'Community & vision', 12: 'Rest & inner work',
};

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  badge?: { text: string; variant: 'green' | 'amber' | 'red' | 'purple' };
}

const BADGE_STYLES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  amber: 'bg-amber-50 text-amber-800',
  red: 'bg-red-50 text-red-800',
  purple: 'bg-purple-50 text-purple-800',
};

const MetricCard = ({ label, value, sub, badge }: MetricCardProps) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
    <div className="text-sm font-medium text-foreground leading-snug mb-0.5">{value}</div>
    <div className="text-xs text-muted-foreground leading-snug">{sub}</div>
    {badge && (
      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${BADGE_STYLES[badge.variant]}`}>
        {badge.text}
      </span>
    )}
  </div>
);

const ord = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
}

export const KeyFactsRow = ({ analysis, srChart }: Props) => {
  const srAscSign = analysis.yearlyTheme?.ascendantSign || srChart.planets.Ascendant?.sign || '—';
  const srMoonSign = analysis.moonSign || srChart.planets.Moon?.sign || '—';
  const srMoonHouse = analysis.moonHouse?.house;
  const moonPhase = analysis.moonPhase?.phase || '—';
  const moonDeg = srChart.planets.Moon?.degree ?? null;
  const srSunSign = srChart.planets.Sun?.sign || '—';
  const srSunHouse = analysis.sunHouse?.house;
  const srSunNatalHouse = analysis.sunNatalHouse?.house;

  const profection = analysis.profectionYear;
  const elBal = analysis.elementBalance;

  // Strongest SR-to-natal aspect
  const strongest = analysis.srToNatalAspects?.[0] || null;
  const aspectBadge = strongest ? (() => {
    const t = strongest.type;
    if (t === 'Trine' || t === 'Sextile') return { text: 'Flowing', variant: 'green' as const };
    if (t === 'Square' || t === 'Opposition') return { text: 'Tension', variant: 'amber' as const };
    if (t === 'Conjunction') return { text: 'Fusion', variant: 'purple' as const };
    return undefined;
  })() : undefined;

  // Stelliums
  const signStelliums = analysis.stelliums?.filter(s => s.locationType === 'sign') || [];
  const stelliumValue = signStelliums.length > 0
    ? signStelliums.map(s => s.location).join(' · ')
    : 'None this year';
  const stelliumSub = signStelliums.length > 0
    ? signStelliums.map(s => {
        const h = s.planets[0] ? analysis.planetSRHouses?.[s.planets[0]] : null;
        return `${h ? `${h}H` : '—'} (${s.planets.join('/')})`;
      }).join(' · ')
    : 'Energy is distributed';

  // Element second
  const elCounts = { Fire: elBal.fire, Earth: elBal.earth, Air: elBal.air, Water: elBal.water };
  const sorted = Object.entries(elCounts).sort((a, b) => b[1] - a[1]);
  const secondEl = sorted[1]?.[0] || '—';
  const secondCount = sorted[1]?.[1] || 0;

  return (
    <div className="space-y-2 mb-4">
      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-4 gap-2">
        <MetricCard
          label="SR Ascendant"
          value={`${srAscSign} Rising`}
          sub="Year's opening tone"
        />
        <MetricCard
          label="SR Moon"
          value={`${srMoonSign}${srMoonHouse ? ` · ${ord(srMoonHouse)}` : ''}`}
          sub={`${moonPhase} phase`}
          badge={
            analysis.moonLateDegree && moonDeg !== null
              ? { text: `Late degree ${moonDeg}°`, variant: 'amber' }
              : analysis.moonVOC
                ? { text: 'Void of Course', variant: 'purple' }
                : undefined
          }
        />
        <MetricCard
          label="Profection Year"
          value={profection ? `${ord(profection.houseNumber)} House · Age ${profection.age}` : '—'}
          sub={profection ? (PROFECTION_THEMES[profection.houseNumber] || '') : '—'}
        />
        <MetricCard
          label="SR Sun"
          value={`${srSunSign}${srSunHouse ? ` · ${ord(srSunHouse)}` : ''}`}
          sub={srSunNatalHouse ? `Natal house overlay: ${ord(srSunNatalHouse)}` : '—'}
        />
      </div>

      {/* Row 2 — 3 cards */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="Dominant Element"
          value={`${elBal.dominant} (${elCounts[elBal.dominant as keyof typeof elCounts] || 0} planets)`}
          sub={`Followed by ${secondEl} (${secondCount})`}
        />
        <MetricCard
          label="Strongest Aspect"
          value={strongest ? `${strongest.planet1} ${strongest.type} ${strongest.planet2}` : 'None found'}
          sub={strongest ? `${strongest.orb}° orb — felt all year` : '—'}
          badge={aspectBadge}
        />
        <MetricCard
          label="Stelliums"
          value={stelliumValue}
          sub={stelliumSub}
        />
      </div>
    </div>
  );
};
