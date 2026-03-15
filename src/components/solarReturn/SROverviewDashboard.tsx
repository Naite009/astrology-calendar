import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { Badge } from '@/components/ui/badge';
import { formatDateMMDDYYYY } from '@/lib/localDate';

const ALL_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function detectInterceptedSigns(houseCusps: any): string[] {
  if (!houseCusps) return [];
  const cuspSigns: string[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}`];
    if (cusp?.sign) cuspSigns.push(cusp.sign);
  }
  if (cuspSigns.length < 12) return [];
  const uniqueSigns = new Set(cuspSigns);
  return ALL_SIGNS.filter(s => !uniqueSigns.has(s));
}
const SIGN_SYMBOLS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇',
};

const OPPOSITE_PAIRS: [string, string][] = [
  ['Aries','Libra'], ['Taurus','Scorpio'], ['Gemini','Sagittarius'],
  ['Cancer','Capricorn'], ['Leo','Aquarius'], ['Virgo','Pisces'],
];

const isOpposite = (a: string, b: string): boolean =>
  OPPOSITE_PAIRS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

const ELEMENT_MAP: Record<string, string> = {
  Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧',
};

const PROFECTION_THEMES: Record<number, string> = {
  1: 'Self & Identity', 2: 'Money & Values', 3: 'Communication & Learning',
  4: 'Home & Family', 5: 'Creativity & Romance', 6: 'Health & Work',
  7: 'Partnerships', 8: 'Transformation & Depth', 9: 'Travel & Philosophy',
  10: 'Career & Reputation', 11: 'Community & Hopes', 12: 'Rest & Spirituality',
};

const HOUSE_THEMES: Record<number, string> = {
  1: 'Identity', 2: 'Resources', 3: 'Communication', 4: 'Home',
  5: 'Creativity', 6: 'Health', 7: 'Partnerships', 8: 'Transformation',
  9: 'Expansion', 10: 'Career', 11: 'Community', 12: 'Spirituality',
};

const ordinal = (n: number) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const dignityColor = (d: string) => {
  if (d === 'Domicile' || d === 'Exaltation') return 'bg-green-500/10 text-green-600 border-green-500/20';
  if (d === 'Detriment' || d === 'Fall') return 'bg-red-400/10 text-red-400 border-red-400/20';
  return 'bg-muted text-muted-foreground border-border';
};

const aspectCategory = (type: string) => {
  if (['Trine','Sextile'].includes(type)) return { label: 'Flowing', cls: 'bg-green-500/10 text-green-600' };
  if (['Square','Opposition'].includes(type)) return { label: 'Tension', cls: 'bg-red-400/10 text-red-400' };
  if (type === 'Conjunction') return { label: 'Fusion', cls: 'bg-blue-400/10 text-blue-400' };
  return { label: type, cls: 'bg-muted text-muted-foreground' };
};

// How This Year Meets You headlines
const getShiftHeadline = (planet: string, natalSign: string, srSign: string): string => {
  if (natalSign === srSign) return `Staying in ${natalSign} — a year of deepening`;
  if (isOpposite(natalSign, srSign)) return `From ${natalSign} to ${srSign} — a full reversal`;
  return `From ${natalSign} to ${srSign} — a new lens`;
};

const getShiftBody = (planet: string, natalSign: string, srSign: string): string => {
  if (planet === 'Sun') {
    if (natalSign === srSign) return 'Your core identity stays in familiar territory this year. The Sun reinforces your natal patterns, bringing consistency and confidence to your self-expression.';
    return `Your identity expression shifts from ${natalSign} to ${srSign} this year. You may notice yourself approaching life decisions with a different energy than usual — lean into it.`;
  }
  if (planet === 'Moon') {
    if (natalSign === srSign) return 'Your emotional needs this year mirror your natal patterns. What comforts you remains consistent — trust your instincts.';
    return `Your emotional landscape shifts from ${natalSign} to ${srSign}. What soothes and satisfies you this year may surprise you — pay attention to new cravings and comfort patterns.`;
  }
  // Rising
  if (natalSign === srSign) return 'Others see you much as they always have. Your outward persona is reinforced, giving you consistency in first impressions and public presence.';
  return `The face you show the world changes from ${natalSign} to ${srSign}. People may react to you differently this year — you're projecting a new energy before you even speak.`;
};

interface Props {
  analysis: SolarReturnAnalysis;
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export const SROverviewDashboard = ({ analysis, natalChart, srChart }: Props) => {
  const natalSunSign = natalChart.planets.Sun?.sign || '—';
  const natalMoonSign = natalChart.planets.Moon?.sign || '—';
  const natalRisingSign = natalChart.planets.Ascendant?.sign || '—';

  const srSunSign = (srChart.planets as any)?.Sun?.sign || '—';
  const srSunDeg = (srChart.planets as any)?.Sun?.degree;
  const srMoonSign = analysis.moonSign || '—';
  const srMoonHouse = analysis.moonHouse?.house;
  const srRisingSign = analysis.yearlyTheme?.ascendantSign || '—';

  const srSunHouse = analysis.sunHouse?.house;
  const srSunNatalHouse = analysis.sunNatalHouse?.house;

  // Tightest SR-to-natal aspect
  const tightestAspect = analysis.srToNatalAspects.length > 0
    ? [...analysis.srToNatalAspects].sort((a, b) => a.orb - b.orb)[0]
    : null;

  // Dominant element
  const eb = analysis.elementBalance;
  const elementCounts = { Fire: eb.fire, Earth: eb.earth, Air: eb.air, Water: eb.water };

  // Time Lord
  const lord = analysis.lordOfTheYear;
  const prof = analysis.profectionYear;

  return (
    <div className="space-y-4">
      {/* ─── 1. Screen Header ─── */}
      <div className="border-b border-border pb-3">
        <h2 className="text-xl font-serif text-foreground">
          Solar Return {srChart.solarReturnYear} — {natalChart.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {SIGN_SYMBOLS[natalSunSign]} {natalSunSign} Sun · {SIGN_SYMBOLS[natalMoonSign]} {natalMoonSign} Moon · {SIGN_SYMBOLS[natalRisingSign]} {natalRisingSign} Rising · Born {natalChart.birthDate}
        </p>
      </div>

      {/* ─── 2. Row 1: 4 Metric Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* SR Ascendant */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Ascendant</p>
          <p className="text-lg font-serif text-foreground">{SIGN_SYMBOLS[srRisingSign]} {srRisingSign}</p>
          <p className="text-[11px] text-muted-foreground">Year's opening tone</p>
        </div>

        {/* SR Moon */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Moon</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-lg font-serif text-foreground">{SIGN_SYMBOLS[srMoonSign]} {srMoonSign}</p>
            {analysis.moonLateDegree && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">25°+</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {srMoonHouse ? `${ordinal(srMoonHouse)} house` : '—'}
            {analysis.moonPhase ? ` · ${analysis.moonPhase.phase}` : ''}
          </p>
          {analysis.moonVOC && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">VOC</span>
          )}
        </div>

        {/* Profection Year */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Profection Year</p>
          <p className="text-lg font-serif text-foreground">
            {prof ? `${ordinal(prof.houseNumber)} House` : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {prof ? `Age ${prof.age} · ${PROFECTION_THEMES[prof.houseNumber] || ''}` : '—'}
          </p>
        </div>

        {/* SR Sun */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Sun</p>
          <p className="text-lg font-serif text-foreground">{SIGN_SYMBOLS[srSunSign]} {srSunSign}</p>
          <p className="text-[11px] text-muted-foreground">
            {srSunHouse ? `${ordinal(srSunHouse)} house` : '—'}
            {srSunNatalHouse ? ` → natal ${ordinal(srSunNatalHouse)}` : ''}
          </p>
        </div>
      </div>

      {/* ─── 3. Row 2: 3 Metric Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Dominant Element */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Dominant Element</p>
          <p className="text-lg font-serif text-foreground">
            {ELEMENT_MAP[eb.dominant] || ''} {eb.dominant}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {elementCounts[eb.dominant as keyof typeof elementCounts]} planets
          </p>
        </div>

        {/* Strongest Aspect */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Strongest Aspect</p>
          {tightestAspect ? (
            <>
              <p className="text-sm font-serif text-foreground">
                SR {tightestAspect.planet1} {tightestAspect.type} Natal {tightestAspect.planet2}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-muted-foreground">{tightestAspect.orb}° orb</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${aspectCategory(tightestAspect.type).cls}`}>
                  {aspectCategory(tightestAspect.type).label}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No major SR-to-natal aspects</p>
          )}
        </div>

        {/* Stelliums */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stelliums</p>
          {analysis.stelliums.length > 0 ? (
            <div className="space-y-1">
              {analysis.stelliums.slice(0, 3).map((s, i) => (
                <div key={i}>
                  <p className="text-sm font-serif text-foreground">{s.location}</p>
                  <p className="text-[11px] text-muted-foreground">{s.planets.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No stelliums this year</p>
          )}
        </div>
      </div>

      {/* ─── 4. Lord of the Year + Time Lord — Side by Side ─── */}
      {(lord || prof) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* LORD OF THE YEAR — ruler of natal Ascendant */}
          {lord && (
            <div className="border border-border rounded-lg p-4 bg-card space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{PLANET_SYMBOLS[lord.planet]}</span>
                <div>
                  <h3 className="text-base font-serif text-foreground">Lord of the Year</h3>
                  <p className="text-[10px] text-muted-foreground">Ruler of natal Ascendant ({lord.natalRisingSign})</p>
                </div>
                <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${dignityColor(lord.dignity)}`}>
                  {lord.dignity}
                </span>
                {lord.isRetrograde && (
                  <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-600 border-amber-500/20">Rx</span>
                )}
              </div>

              <div className="bg-muted/30 rounded-lg p-2.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">{lord.planet} in SR</p>
                <p className="text-xs text-foreground leading-relaxed">
                  {SIGN_SYMBOLS[lord.srSign]} {lord.srSign} {lord.srDegree}
                  {lord.srHouse ? ` · ${ordinal(lord.srHouse)} house` : ''}
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The ruler of your natal Ascendant ({lord.natalRisingSign}) is {lord.planet}. Its condition in the Solar Return chart shows how your overall vitality and life direction are supported this year.
              </p>
            </div>
          )}

          {/* TIME LORD — ruler of profected house cusp */}
          {prof && (
            <div className="border border-border rounded-lg p-4 bg-card space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{PLANET_SYMBOLS[prof.timeLord]}</span>
                <div>
                  <h3 className="text-base font-serif text-foreground">Time Lord</h3>
                  <p className="text-[10px] text-muted-foreground">Ruler of {ordinal(prof.houseNumber)} house ({prof.natalCuspSign || '—'})</p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-2.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Profection</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Age {prof.age} → {ordinal(prof.houseNumber)} house · {PROFECTION_THEMES[prof.houseNumber] || ''}
                </p>
              </div>

              {prof.timeLordSRHouse && (
                <div className="bg-muted/30 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">{prof.timeLord} in SR</p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {SIGN_SYMBOLS[prof.timeLordSRSign]} {prof.timeLordSRSign}
                    {prof.timeLordSRHouse ? ` · ${ordinal(prof.timeLordSRHouse)} house` : ''}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                At age {prof.age}, the {ordinal(prof.houseNumber)} house is activated. The sign on that cusp ({prof.natalCuspSign || '—'}) makes {prof.timeLord} your Time Lord — the planet setting this year's agenda.
              </p>

              {prof.overlap && (
                <p className="text-[10px] text-primary font-medium">
                  ✦ {prof.timeLord} is also your Lord of the Year — doubly emphasized.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. How This Year Meets You ─── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">How This Year Meets You</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { planet: 'Sun', natal: natalSunSign, sr: srSunSign },
            { planet: 'Moon', natal: natalMoonSign, sr: srMoonSign },
            { planet: 'Rising', natal: natalRisingSign, sr: srRisingSign },
          ].map(({ planet, natal, sr }) => (
            <div key={planet} className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{planet}</p>
                {isOpposite(natal, sr) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">
                    Opposite sign shift
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-foreground">{SIGN_SYMBOLS[natal]} {natal}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-foreground font-medium">{SIGN_SYMBOLS[sr]} {sr}</span>
              </div>
              <p className="text-xs font-medium text-foreground">{getShiftHeadline(planet, natal, sr)}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{getShiftBody(planet, natal, sr)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
