import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS, SIGN_SYMBOLS, ordinal } from '@/lib/solarReturnConstants';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

export const TimeLordsTab = ({ analysis, srChart, natalChart }: Props) => {
  const HOUSE_THEMES: Record<number, string> = {
    1: 'Self, identity, new beginnings', 2: 'Finances, values, self-worth', 3: 'Communication, siblings, learning',
    4: 'Home, family, roots', 5: 'Creativity, romance, children', 6: 'Health, daily routines, service',
    7: 'Partnerships, marriage, contracts', 8: 'Transformation, shared resources', 9: 'Travel, higher learning, philosophy',
    10: 'Career, reputation, public life', 11: 'Friends, community, hopes', 12: 'Spirituality, solitude, endings',
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Explanatory note */}
      <div className="bg-secondary/50 rounded-sm p-4">
        <p className="text-xs text-foreground leading-relaxed">
          <strong>Two techniques, two rulers:</strong> the Profection Time Lord (
          {analysis.profectionYear ? <>{PLANET_SYMBOLS[analysis.profectionYear.timeLord]} {analysis.profectionYear.timeLord}</> : '—'}
          ) comes from the activated house cusp sign; the Lord of the Year (
          {analysis.lordOfTheYear ? <>{PLANET_SYMBOLS[analysis.lordOfTheYear.planet]} {analysis.lordOfTheYear.planet}</> : '—'}
          ) comes from the SR Ascendant's natal ruler. Both are active this year.
        </p>
      </div>

      {/* Profection Year */}
      {analysis.profectionYear && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">
            Profection Year — House {analysis.profectionYear.houseNumber} / Time Lord: {PLANET_SYMBOLS[analysis.profectionYear.timeLord]} {analysis.profectionYear.timeLord}
          </h3>
          <p className="text-xs text-muted-foreground">
            Age: <span className="font-medium text-foreground">{analysis.profectionYear.age}</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.profectionYear.interpretation}</p>
          {analysis.profectionYear.overlap && analysis.profectionYear.overlapDescription && (
            <div className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-sm">
              <p className="text-xs text-primary font-medium">⚡ {analysis.profectionYear.overlapDescription}</p>
            </div>
          )}

          {/* Profection Wheel */}
          <div className="flex justify-center">
            <svg viewBox="0 0 500 500" className="w-full max-w-[520px]">
              {Array.from({ length: 12 }, (_, i) => {
                const houseNum = i + 1;
                const isActive = houseNum === analysis.profectionYear!.houseNumber;
                const startAngle = 180 - i * 30;
                const endAngle = startAngle - 30;
                const midAngle = (startAngle + endAngle) / 2;
                const toRad = (deg: number) => (deg * Math.PI) / 180;
                const cx = 250, cy = 250, r = 210, rInner = 90;
                const x1 = cx + r * Math.cos(toRad(startAngle));
                const y1 = cy - r * Math.sin(toRad(startAngle));
                const x2 = cx + r * Math.cos(toRad(endAngle));
                const y2 = cy - r * Math.sin(toRad(endAngle));
                const x3 = cx + rInner * Math.cos(toRad(endAngle));
                const y3 = cy - rInner * Math.sin(toRad(endAngle));
                const x4 = cx + rInner * Math.cos(toRad(startAngle));
                const y4 = cy - rInner * Math.sin(toRad(startAngle));
                const baseAge = houseNum - 1;
                const allAges = Array.from({ length: 9 }, (_, j) => baseAge + j * 12).filter(a => a <= 99);
                const midRad = toRad(midAngle);
                const cosM = Math.cos(midRad), sinM = Math.sin(midRad);
                const hlx = cx + (r - 18) * cosM;
                const hly = cy - (r - 18) * sinM;
                const agesR = (r + rInner) / 2;
                const ax = cx + agesR * cosM;
                const ay = cy - agesR * sinM;
                const path = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
                const currentAge = analysis.profectionYear!.age;
                return (
                  <g key={i}>
                    <path d={path} fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} stroke="hsl(var(--border))" strokeWidth="1" opacity={isActive ? 1 : 0.5} />
                    <text x={hlx} y={hly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold"
                      fill={isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}>H{houseNum}</text>
                    <text x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" fontSize="8"
                      fill={isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'}>
                      {allAges.map(a => a === currentAge ? `[${a}]` : a).join(' ')}
                    </text>
                  </g>
                );
              })}
              <text x="250" y="240" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">Age {analysis.profectionYear.age}</text>
              <text x="250" y="260" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
                {ordinal(analysis.profectionYear.houseNumber)} House Year
              </text>
            </svg>
          </div>

          {/* Full profection table */}
          <div className="max-h-64 overflow-y-auto border border-border rounded-sm">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Age</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">House</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Theme</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 100 }, (_, age) => {
                  const house = (age % 12) + 1;
                  const isCurrentAge = age === analysis.profectionYear!.age;
                  return (
                    <tr key={age} className={`border-b border-border/50 ${isCurrentAge ? 'bg-primary/10 font-medium' : age % 2 === 0 ? 'bg-muted/20' : ''}`}>
                      <td className={`px-2 py-1 ${isCurrentAge ? 'text-primary font-bold' : 'text-foreground'}`}>{age}{isCurrentAge ? ' ←' : ''}</td>
                      <td className={`px-2 py-1 ${isCurrentAge ? 'text-primary' : 'text-foreground'}`}>House {house}</td>
                      <td className={`px-2 py-1 ${isCurrentAge ? 'text-primary' : 'text-muted-foreground'}`}>{HOUSE_THEMES[house]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lord of the Year */}
      {analysis.lordOfTheYear && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">
            Lord of the Year — {PLANET_SYMBOLS[analysis.lordOfTheYear.planet]} {analysis.lordOfTheYear.planet}
            {analysis.lordOfTheYear.srHouse ? ` in SR ${ordinal(analysis.lordOfTheYear.srHouse)} House` : ''}
          </h3>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-2xl">{PLANET_SYMBOLS[analysis.lordOfTheYear.planet]}</span>
            <span className="text-sm text-foreground">{SIGN_SYMBOLS[analysis.lordOfTheYear.srSign]} {analysis.lordOfTheYear.srSign} {analysis.lordOfTheYear.srDegree}</span>
            {analysis.lordOfTheYear.isRetrograde && <span className="text-[10px] text-destructive font-medium">Rx</span>}
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${
              analysis.lordOfTheYear.dignity === 'Domicile' || analysis.lordOfTheYear.dignity === 'Exaltation' ? 'bg-green-500/10 text-green-600'
              : analysis.lordOfTheYear.dignity === 'Detriment' || analysis.lordOfTheYear.dignity === 'Fall' ? 'bg-red-400/10 text-red-400'
              : 'bg-muted text-muted-foreground'
            }`}>{analysis.lordOfTheYear.dignity}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.lordOfTheYear.interpretation}</p>
        </div>
      )}

      {/* Firdaria */}
      {analysis.firdaria && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-3">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">
            Firdaria — {PLANET_SYMBOLS[analysis.firdaria.currentMainLord]} {analysis.firdaria.currentMainLord} / {PLANET_SYMBOLS[analysis.firdaria.currentSubLord]} {analysis.firdaria.currentSubLord}
          </h3>
          <p className="text-xs text-muted-foreground">Current period: {analysis.firdaria.currentPeriodYears}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.firdaria.interpretation}</p>

          {analysis.firdaria.entries.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-border rounded-sm">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="px-2 py-1 text-left text-muted-foreground">Ages</th>
                    <th className="px-2 py-1 text-left text-muted-foreground">Main</th>
                    <th className="px-2 py-1 text-left text-muted-foreground">Sub</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.firdaria.entries.map((e, i) => (
                    <tr key={i} className={`border-b border-border/50 ${e.isCurrent ? 'bg-primary/10 font-medium' : ''}`}>
                      <td className="px-2 py-1 text-foreground">{e.periodStart}–{e.periodEnd}{e.isCurrent ? ' ←' : ''}</td>
                      <td className="px-2 py-1 text-foreground">{PLANET_SYMBOLS[e.mainLord]} {e.mainLord}</td>
                      <td className="px-2 py-1 text-muted-foreground">{PLANET_SYMBOLS[e.subLord]} {e.subLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
