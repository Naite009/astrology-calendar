import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

const traditionalRuler: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const domicileSigns: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini', 'Virgo'], Venus: ['Taurus', 'Libra'],
  Mars: ['Aries', 'Scorpio'], Jupiter: ['Sagittarius', 'Pisces'], Saturn: ['Capricorn', 'Aquarius'],
};
const exaltationSigns: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};
const detrimentSigns: Record<string, string[]> = {
  Sun: ['Aquarius'], Moon: ['Capricorn'], Mercury: ['Sagittarius', 'Pisces'], Venus: ['Aries', 'Scorpio'],
  Mars: ['Taurus', 'Libra'], Jupiter: ['Gemini', 'Virgo'], Saturn: ['Cancer', 'Leo'],
};
const fallSigns: Record<string, string> = {
  Sun: 'Libra', Moon: 'Scorpio', Mercury: 'Pisces', Venus: 'Virgo',
  Mars: 'Cancer', Jupiter: 'Capricorn', Saturn: 'Aries',
};

function getDignity(planet: string, sign: string): string {
  if (domicileSigns[planet]?.includes(sign)) return 'domicile';
  if (exaltationSigns[planet] === sign) return 'exaltation';
  if (detrimentSigns[planet]?.includes(sign)) return 'detriment';
  if (fallSigns[planet] === sign) return 'fall';
  return 'peregrine';
}

const DIGNITY_TEXT: Record<string, (planet: string, sign: string) => string> = {
  domicile: (p) => `${p} is in its home sign — full power and ease this year.`,
  exaltation: (p) => `${p} is exalted — operating at peak effectiveness.`,
  detriment: (p, s) => `${s} is ${p}'s detriment — opposite its home sign. Operates under strain, requires extra effort.`,
  fall: (p, s) => `${s} is ${p}'s fall — its weakest position. The year's themes arrive with difficulty.`,
  peregrine: (p) => `${p} has no essential dignity here — neutral, neither helped nor hindered.`,
};

const ord = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

export const TimeLordCard = ({ analysis, srChart, natalChart }: Props) => {
  const prof = analysis.profectionYear;
  if (!prof) return null;

  const planet = prof.timeLord;
  const age = prof.age;
  const houseNum = prof.houseNumber;
  const srSign = prof.timeLordSRSign || '—';
  const srHouse = prof.timeLordSRHouse;

  // Determine cusp sign
  const cuspKey = `house${houseNum}` as keyof typeof natalChart.houseCusps;
  const cusp = natalChart.houseCusps?.[cuspKey] as any;
  const cuspSign = cusp?.sign || '—';

  // Dignity & retrograde from SR chart
  const dignity = getDignity(planet, srSign);
  const srPlanet = srChart.planets[planet as keyof typeof srChart.planets];
  const isRetrograde = srPlanet?.isRetrograde ?? false;

  const dignityExplanation = DIGNITY_TEXT[dignity]?.(planet, srSign) || '';

  const steps = [
    { text: `Age ${age} → annual profection house`, result: `${ord(houseNum)} house year` },
    { text: `Natal ${ord(houseNum)} house cusp sign`, result: cuspSign },
    { text: `Traditional ruler of ${cuspSign}`, result: planet },
    { text: `${planet} in SR chart`, result: `${srSign}, House ${srHouse || '—'}` },
    { text: `${srSign} = ${planet}'s ${dignity}`, result: dignity === 'domicile' || dignity === 'exaltation' ? '✓ Strengthened' : dignity === 'detriment' || dignity === 'fall' ? '⚠ Compromised' : '— Neutral' },
    ...(isRetrograde ? [{ text: `${planet} is retrograde in SR`, result: '⚠ Internalized' }] : []),
  ];

  const dignityBadgeClass = dignity === 'domicile' || dignity === 'exaltation'
    ? 'bg-emerald-50 text-emerald-800'
    : dignity === 'detriment' || dignity === 'fall'
      ? 'bg-amber-50 text-amber-800'
      : 'bg-muted text-muted-foreground';

  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <span className="text-sm font-medium text-foreground">{planet} is your Time Lord this year</span>
        <div className="flex items-center gap-2">
          {isRetrograde && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-800">Retrograde</span>
          )}
          {dignity !== 'peregrine' && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${dignityBadgeClass}`}>
              {dignity}
            </span>
          )}
        </div>
      </div>

      {/* Three-column body */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-border">
        {/* Col 1 — Why */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Why {planet}</div>
          <div className="text-sm font-medium text-foreground mb-0.5">{ord(houseNum)} house profection</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Age {age} activates your {ord(houseNum)} house. The sign on that cusp is {cuspSign}. {planet} rules {cuspSign} — so {planet} runs the year.
          </div>
        </div>

        {/* Col 2 — Where in SR */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">In your SR chart</div>
          <div className="text-sm font-medium text-foreground mb-0.5">{srSign} · SR House {srHouse || '—'}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{dignityExplanation}</div>
        </div>

        {/* Col 3 — Motion */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Motion</div>
          <div className="text-sm font-medium text-foreground mb-0.5">{isRetrograde ? 'Retrograde' : 'Direct'}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {isRetrograde
              ? `The Time Lord is retrograde — the year's agenda arrives through revisiting, restructuring, and internal work rather than outward achievement. Progress is real but indirect.`
              : `The Time Lord moves direct — the year's themes can be pursued straightforwardly.`}
          </div>
        </div>
      </div>

      {/* Explanation paragraph */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border-l-2 border-muted-foreground/20">
          In Hellenistic astrology, the planet ruling the sign on your activated profection house cusp becomes the Time Lord — the planet setting the agenda for the entire year. Every transit to {planet}, every aspect involving {planet} in both charts, carries amplified weight this year. Pay close attention to the key dates where {planet} makes exact contact with your natal planets.
        </p>
      </div>

      {/* Calculation chain */}
      <div className="px-4 pb-4 pt-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">How this was calculated</div>
        <div className="space-y-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
              <span className="text-[10px] font-medium text-muted-foreground min-w-[16px]">{i + 1}</span>
              <span className="text-xs text-muted-foreground flex-1">{step.text}</span>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{step.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
