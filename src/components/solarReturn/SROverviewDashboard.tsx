import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { Badge } from '@/components/ui/badge';
import { formatDateMMDDYYYY } from '@/lib/localDate';
import { Droplets, Flame, Wind, Mountain } from 'lucide-react';

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

const SIGN_ELEMENT: Record<string, string> = {
  Aries:'Fire', Leo:'Fire', Sagittarius:'Fire',
  Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
  Gemini:'Air', Libra:'Air', Aquarius:'Air',
  Cancer:'Water', Scorpio:'Water', Pisces:'Water',
};

const SIGN_MODALITY: Record<string, string> = {
  Aries:'Cardinal', Cancer:'Cardinal', Libra:'Cardinal', Capricorn:'Cardinal',
  Taurus:'Fixed', Leo:'Fixed', Scorpio:'Fixed', Aquarius:'Fixed',
  Gemini:'Mutable', Virgo:'Mutable', Sagittarius:'Mutable', Pisces:'Mutable',
};

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

// ─── Sign shift relationship tags ────────────────────────────────
const getShiftTags = (natal: string, sr: string): { label: string; cls: string }[] => {
  if (natal === sr) return [{ label: 'Same sign', cls: 'bg-green-500/10 text-green-600' }];
  const tags: { label: string; cls: string }[] = [];
  if (isOpposite(natal, sr)) tags.push({ label: 'Opposite axis', cls: 'bg-amber-500/10 text-amber-600' });
  if (SIGN_ELEMENT[natal] === SIGN_ELEMENT[sr]) tags.push({ label: `Same element · ${SIGN_ELEMENT[natal]}`, cls: 'bg-blue-400/10 text-blue-400' });
  if (SIGN_MODALITY[natal] === SIGN_MODALITY[sr]) tags.push({ label: `Same mode · ${SIGN_MODALITY[natal]}`, cls: 'bg-purple-400/10 text-purple-400' });
  if (SIGN_ELEMENT[natal] !== SIGN_ELEMENT[sr] && SIGN_MODALITY[natal] !== SIGN_MODALITY[sr] && !isOpposite(natal, sr)) {
    tags.push({ label: 'Full shift', cls: 'bg-red-400/10 text-red-400' });
  }
  return tags;
};

// ─── Expert-level opposite axis interpretations ─────────────────
const OPPOSITE_AXIS_DEPTH: Record<string, string> = {
  'Aries-Libra': 'The Aries-Libra axis is the axis of self versus other. Aries acts from personal will; Libra negotiates through relationship. When a planet shifts across this axis, the year demands you reconcile independence with compromise — the tension between "what I need" and "what the relationship needs." Neither side is wrong, but the year won\'t let you default to one without addressing the other.',
  'Scorpio-Taurus': 'The Taurus-Scorpio axis is the axis of possession and release. Taurus holds, stabilizes, and builds material security; Scorpio strips away, transforms, and demands psychological honesty. A shift across this axis forces a reckoning between comfort and truth — what you cling to versus what must die so something more authentic can emerge. This is one of the most intense axes in astrology.',
  'Gemini-Sagittarius': 'The Gemini-Sagittarius axis is the axis of information versus meaning. Gemini gathers data, asks questions, stays curious; Sagittarius synthesizes, draws conclusions, seeks ultimate truth. A shift here pushes you from collecting to concluding (or vice versa) — you either need more facts before deciding, or you need to stop researching and commit to a belief.',
  'Cancer-Capricorn': 'The Cancer-Capricorn axis is the axis of private life versus public life. Cancer nurtures, protects, and roots into family; Capricorn builds, achieves, and earns public authority. A shift here forces you to weigh emotional security against ambition — the year asks whether your professional climb supports or undermines the people who matter most.',
  'Aquarius-Leo': 'The Leo-Aquarius axis is the axis of personal creativity versus collective contribution. Leo radiates individual brilliance and demands recognition; Aquarius serves the group and questions whether personal glory matters. A shift here recalibrates your relationship between self-expression and community — shine without overshadowing, or contribute without losing yourself.',
  'Pisces-Virgo': 'The Virgo-Pisces axis is the axis of analysis versus surrender. Virgo refines, organizes, and fixes; Pisces dissolves, accepts, and trusts the invisible. A shift here demands you balance precision with intuition — either you\'ve been over-analyzing and need to let go, or you\'ve been drifting and need to get practical.',
};

const getAxisKey = (a: string, b: string): string => [a, b].sort().join('-');

// ─── Same-element expert depth ──────────────────────────────────
const SAME_ELEMENT_DEPTH: Record<string, string> = {
  Fire: 'Both signs speak Fire — initiative, passion, and forward motion. The shift isn\'t a shock; it\'s a change in how that fire burns. Aries fire is a match strike (fast, personal, competitive). Leo fire is a bonfire (sustained, creative, performative). Sagittarius fire is a wildfire (expansive, philosophical, restless). The underlying drive remains action-oriented, but the style and target shift noticeably.',
  Earth: 'Both signs share Earth\'s concern with tangible results, material stability, and practical execution. The shift changes the method, not the goal. Taurus Earth is sensory and accumulative. Virgo Earth is analytical and service-oriented. Capricorn Earth is structural and ambitious. You\'ll still be building — but with different tools and for different reasons.',
  Air: 'Both signs operate through Air — ideas, communication, and social connection. Gemini Air is curious and scattered across many topics. Libra Air is relational and aesthetic, focused on fairness and beauty. Aquarius Air is systemic and unconventional, concerned with reform and innovation. There\'s a shared intellectual restlessness, but the conversation changes topics entirely.',
  Water: 'Both signs process through Water — emotion, intuition, and deep feeling. The shift changes the depth and direction of that emotional current. Cancer Water is protective and familial. Scorpio Water is investigative and transformative. Pisces Water is boundaryless and spiritual. The feeling tone is familiar, but what triggers your emotions and how you process them shifts significantly.',
};

// ─── Expert intercepted sign interpretations ────────────────────
const INTERCEPTION_SIGN_THEMES: Record<string, string> = {
  Aries: 'Aries interception contains your capacity for direct, assertive action — buried inside a house rather than announcing itself at the cusp. You can\'t just "be bold" easily this year. Courage and initiative require deliberate cultivation. The first half of the year often feels frustratingly passive in this area; the Aries energy typically breaks through mid-year when enough internal pressure builds that it can no longer be suppressed.',
  Taurus: 'Taurus interception contains your ability to stabilize, possess, and build material security. What you value and how you ground yourself isn\'t readily accessible — it takes conscious work to feel settled. Financial or sensory comfort may feel elusive until mid-year when the contained Taurus energy finds its outlet.',
  Gemini: 'Gemini interception suppresses your natural curiosity and communication style. You may struggle to articulate what you know or feel mentally foggy in the intercepted house\'s domain. The Gemini energy emerges later when you\'ve accumulated enough experience to finally name what you\'ve been processing.',
  Cancer: 'Cancer interception contains your nurturing instincts and emotional security needs. The area of life ruled by this house feels emotionally unsafe at first — you can\'t easily access comfort or create belonging there. The Cancer energy breaks through when vulnerability is finally allowed.',
  Leo: 'Leo interception suppresses your creative self-expression and visibility in this area. You want to shine here but the energy is locked — it feels like performing behind a curtain. The Leo energy emerges when you stop waiting for permission and create your own stage.',
  Virgo: 'Virgo interception means your analytical and problem-solving abilities are contained. You see what needs fixing but can\'t easily act on it. The Virgo energy activates later when accumulated observation finally produces a clear, actionable plan.',
  Libra: 'Libra interception contains your relational intelligence and diplomatic instincts. Partnerships and negotiations in this house\'s domain feel strained or one-sided early in the year — you can\'t easily find balance or fairness. The Libra energy surfaces when you stop over-accommodating and advocate for genuine equity.',
  Scorpio: 'Scorpio interception locks your transformative power and psychological depth inside this house. Surface-level approaches don\'t work here, but going deep feels blocked. The Scorpio energy erupts — often suddenly — when the truth can no longer be contained.',
  Sagittarius: 'Sagittarius interception contains your ability to find meaning, see the big picture, and expand. The area feels confined or purposeless at first. The Sagittarius energy breaks through when a single experience or insight suddenly unlocks an entirely new perspective.',
  Capricorn: 'Capricorn interception suppresses your structural ambition and authority. You want to build something lasting but can\'t find traction. The Capricorn energy activates later when you\'ve earned enough credibility through patient, unglamorous work.',
  Aquarius: 'Aquarius interception contains your innovative thinking and desire for change. The status quo in this area feels immovable. The Aquarius energy breaks through when you stop trying to reform the system from within and find an unconventional side door.',
  Pisces: 'Pisces interception contains your spiritual sensitivity and intuitive knowing. The area feels spiritually dry or disconnected from something larger. The Pisces energy flows in when you surrender control and allow the unconscious to guide you.',
};

const getInterceptionTeaching = (intercepted: string[]): string => {
  const axisPairs = OPPOSITE_PAIRS.filter(([a, b]) => intercepted.includes(a) && intercepted.includes(b));
  let axisNote = '';
  if (axisPairs.length > 0) {
    const [a, b] = axisPairs[0];
    axisNote = ` Interceptions always occur in opposite pairs. The ${a}-${b} axis being intercepted means an entire polarity is operating beneath the surface — neither the ${a} principle nor its counterbalance in ${b} has easy expression. The year's work is to consciously develop both sides. Usually one emerges first and pulls the other into awareness by mid-year.`;
  }
  return `In solar return work, interception is a technical condition with real psychological consequences. When a sign is intercepted, it appears entirely within a house — no house cusp carries that sign. This means the sign's energy has no "front door." It can't announce itself; it must be excavated. You may not even recognize these needs exist until the second half of the year, when enough internal pressure forces them to the surface.${axisNote}`;
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

const getShiftHeadline = (planet: string, natalSign: string, srSign: string): string => {
  if (natalSign === srSign) return `Staying in ${natalSign} — a year of deepening`;
  if (isOpposite(natalSign, srSign)) return `${natalSign} → ${srSign} — the polarity axis activates`;
  if (SIGN_ELEMENT[natalSign] === SIGN_ELEMENT[srSign]) return `${natalSign} → ${srSign} — same element, different expression`;
  if (SIGN_MODALITY[natalSign] === SIGN_MODALITY[srSign]) return `${natalSign} → ${srSign} — same drive, different arena`;
  return `${natalSign} → ${srSign} — a fundamentally different lens`;
};

const getShiftBody = (planet: string, natalSign: string, srSign: string): string => {
  const planetLabel = planet === 'Rising' ? 'your Ascendant (the mask you wear and how others first experience you)' : planet === 'Sun' ? 'your core identity and vitality' : 'your emotional needs and instinctive reactions';

  if (natalSign === srSign) {
    if (planet === 'Sun') return 'Your core identity stays in its natal sign. In solar return work, this is a year of consolidation — the Sun reinforces patterns you already know. The gift is confidence and consistency; the risk is stagnation if you don\'t push into new territory within familiar ground.';
    if (planet === 'Moon') return 'Your emotional needs this year mirror your natal Moon. What comforts you remains consistent — the same foods, people, and environments feel right. This is stabilizing for emotional health, but watch for complacency. The Moon in its natal sign deepens rather than disrupts.';
    return 'Others see you much as they always have. The SR Ascendant matching your natal Rising means your public persona is reinforced — there\'s no cognitive dissonance between who you are and how you present. "What you see is what you get" works in your favor this year.';
  }

  const base = `This year, ${planetLabel} shifts from ${natalSign} to ${srSign}.`;

  if (isOpposite(natalSign, srSign)) {
    const axisKey = getAxisKey(natalSign, srSign);
    const depth = OPPOSITE_AXIS_DEPTH[axisKey] || `The ${natalSign}-${srSign} axis activates a fundamental polarity. What was dominant becomes secondary, and what was unconscious rises to the surface. Expect to see the "other side" of your ${planet.toLowerCase()} nature this year.`;
    return `${base} This is a full polarity reversal — one of the most significant shifts in solar return work. ${depth}`;
  }

  if (SIGN_ELEMENT[natalSign] === SIGN_ELEMENT[srSign]) {
    const el = SIGN_ELEMENT[natalSign];
    const depth = SAME_ELEMENT_DEPTH[el] || '';
    return `${base} Because both signs share the ${el} element, this isn't a jarring transition — it's more like changing rooms in the same house. The fundamental language is the same, but the dialect changes. ${depth}`;
  }

  if (SIGN_MODALITY[natalSign] === SIGN_MODALITY[srSign]) {
    const mod = SIGN_MODALITY[natalSign];
    const modDesc = mod === 'Cardinal' ? 'Both signs initiate action, but the arena and motivation change completely. You\'re still a starter, but what you\'re starting and why has shifted.' :
      mod === 'Fixed' ? 'Both signs commit with determination, but what they\'re committed to and why shifts dramatically. Your tenacity is intact; the target is different.' :
      'Both signs adapt and adjust, but the information they\'re processing and how they communicate it transforms. Flexibility is your constant; what bends around you changes.';
    return `${base} They share the ${mod} modality — ${modDesc} The underlying operating system is familiar, but the content is entirely new.`;
  }

  return `${base} This is a significant recalibration — different element, different modality, no shared ground. The way ${planetLabel} operates this year has almost no overlap with your natal pattern. This can feel disorienting in the first months, but it's the solar return's way of forcing growth in areas you wouldn't naturally explore.`;
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

  // Tightest SR-to-natal aspect — exclude Sun conjunct Sun (always exact in a solar return)
  const nonSunConjAspects = analysis.srToNatalAspects.filter(
    a => !(a.planet1 === 'Sun' && a.planet2 === 'Sun' && a.type === 'Conjunction')
  );
  const tightestAspect = nonSunConjAspects.length > 0
    ? [...nonSunConjAspects].sort((a, b) => a.orb - b.orb)[0]
    : null;

  // Dominant element
  const eb = analysis.elementBalance;
  const elementCounts = { Fire: eb.fire, Earth: eb.earth, Air: eb.air, Water: eb.water };
  const elementPlanetLists: Record<string, string[]> = {
    Fire: eb.firePlanets || [], Earth: eb.earthPlanets || [],
    Air: eb.airPlanets || [], Water: eb.waterPlanets || [],
  };

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
          {SIGN_SYMBOLS[natalSunSign]} {natalSunSign} Sun · {SIGN_SYMBOLS[natalMoonSign]} {natalMoonSign} Moon · {SIGN_SYMBOLS[natalRisingSign]} {natalRisingSign} Rising · Born {formatDateMMDDYYYY(natalChart.birthDate)}
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
        {(() => {
          const domCap = eb.dominant ? eb.dominant.charAt(0).toUpperCase() + eb.dominant.slice(1) : '—';
          const planets = elementPlanetLists[domCap] || elementPlanetLists[eb.dominant] || [];
          return (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Dominant Element</p>
              <p className="text-lg font-serif text-foreground flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400 inline" style={{ display: domCap === 'Water' ? 'inline' : 'none' }} />
                <Flame className="w-4 h-4 text-red-400 inline" style={{ display: domCap === 'Fire' ? 'inline' : 'none' }} />
                <Wind className="w-4 h-4 text-sky-400 inline" style={{ display: domCap === 'Air' ? 'inline' : 'none' }} />
                <Mountain className="w-4 h-4 text-amber-700 inline" style={{ display: domCap === 'Earth' ? 'inline' : 'none' }} />
                {domCap}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {planets.join(', ')}
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 leading-tight">
                {eb.interpretation?.split('.').slice(0, 1).join('.')}.
              </p>
            </div>
          );
        })()}

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
              {tightestAspect.interpretation && (
                <p className="text-[10px] text-muted-foreground/80 mt-1.5 leading-tight">
                  {tightestAspect.interpretation.split('.').slice(0, 2).join('.')}.
                </p>
              )}
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
                  {s.extras && s.extras.filter(e => e === 'Chiron' || e === 'NorthNode').length > 0 && (
                    <p className="text-[10px] text-amber-400 italic mt-0.5">
                      Also contains: {s.extras.filter(e => e === 'Chiron' || e === 'NorthNode').map(e => e === 'NorthNode' ? 'North Node' : e).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No stelliums this year</p>
          )}
        </div>
      </div>

      {/* ─── 4. Lord of the Year + Time Lord — Side by Side ─── */}
      {(lord || prof) && (() => {
        // Find tight aspects (≤1° orb) involving Lord of the Year or Time Lord
        const lordPlanet = lord?.planet || '';
        const timeLordPlanet = prof?.timeLord || '';
        const allAspects = [...(analysis.srToNatalAspects || []), ...(analysis.srInternalAspects || [])];
        
        const findTightAspects = (planet: string) => {
          if (!planet) return [];
          return allAspects.filter(a => 
            (a.planet1 === planet || a.planet2 === planet) && 
            a.orb <= 1.0 &&
            !(a.planet1 === 'Sun' && a.planet2 === 'Sun' && a.type === 'Conjunction')
          );
        };
        
        const lordTightAspects = findTightAspects(lordPlanet);
        const timeLordTightAspects = findTightAspects(timeLordPlanet);
        const isDoubled = prof?.overlap || false;

        // Expert interpretation for planet in sign in house
        const getPlanetSignHouseExpert = (planet: string, sign: string, house: number | null, role: 'lord' | 'timeLord'): string => {
          const PLANET_DRIVE: Record<string, string> = {
            Sun: 'vitality, will, and conscious purpose',
            Moon: 'emotional needs, instinctive reactions, and comfort patterns',
            Mercury: 'communication style, mental processing, and daily decision-making',
            Venus: 'values, relationships, pleasure-seeking, and aesthetic choices',
            Mars: 'drive, assertiveness, desire, and how you fight for what you want',
            Jupiter: 'expansion, optimism, opportunity, and where you seek growth',
            Saturn: 'discipline, responsibility, fear, and where you must earn through effort',
            Uranus: 'disruption, innovation, sudden change, and where you break free',
            Neptune: 'imagination, spiritual longing, confusion, and where boundaries dissolve',
            Pluto: 'power, transformation, obsession, and where you undergo psychological death and rebirth',
          };
          const SIGN_STYLE: Record<string, string> = {
            Aries: 'impulsively, directly, and with raw courage — acting before thinking',
            Taurus: 'slowly, sensually, and with stubborn persistence — prioritizing comfort and stability',
            Gemini: 'verbally, adaptively, and with intellectual curiosity — through conversation and information-gathering',
            Cancer: 'protectively, emotionally, and with deep sensitivity — through nurturing and emotional attunement',
            Leo: 'dramatically, generously, and with creative confidence — through self-expression and warm-hearted leadership',
            Virgo: 'analytically, precisely, and with practical service — through improvement and attention to detail',
            Libra: 'diplomatically, aesthetically, and through partnership — seeking fairness and harmony in all interactions',
            Scorpio: 'intensely, strategically, and with psychological depth — through investigation and emotional honesty',
            Sagittarius: 'expansively, philosophically, and with restless optimism — through exploration and meaning-making',
            Capricorn: 'methodically, ambitiously, and with structural discipline — through long-term planning and earned authority',
            Aquarius: 'unconventionally, collectively, and with detached innovation — through reform and group consciousness',
            Pisces: 'intuitively, compassionately, and with fluid boundaries — through imagination, empathy, and surrender to what cannot be controlled',
          };
          const HOUSE_WHERE: Record<number, string> = {
            1: 'in matters of personal identity, physical body, and how you initiate new beginnings',
            2: 'in matters of money, material security, self-worth, and what you build to feel safe',
            3: 'in matters of communication, siblings, short travel, learning, and your immediate environment',
            4: 'in matters of home, family, roots, emotional foundation, and private life',
            5: 'in matters of creativity, romance, children, pleasure, and joyful self-expression',
            6: 'in matters of daily work, health routines, service to others, and practical problem-solving',
            7: 'in matters of committed partnerships, one-on-one relationships, and open collaborations or conflicts',
            8: 'in matters of shared resources, intimacy, psychological transformation, and what you must release',
            9: 'in matters of higher education, travel, philosophy, publishing, and expanding your worldview',
            10: 'in matters of career, public reputation, authority, and your visible contribution to the world',
            11: 'in matters of community, friendships, collective goals, hopes for the future, and group identity',
            12: 'in matters of solitude, spiritual practice, hidden patterns, self-undoing, and what operates beneath conscious awareness',
          };

          const drive = PLANET_DRIVE[planet] || `${planet}'s specific themes`;
          const style = SIGN_STYLE[sign] || `through ${sign} energy`;
          const where = house ? (HOUSE_WHERE[house] || `in the ${ordinal(house)} house domain`) : '';
          
          if (role === 'lord') {
            return `As Lord of the Year, ${planet} governs your overall vitality and life direction. ${planet} represents ${drive}. In ${sign}, it operates ${style}. ${house ? `Placed in the ${ordinal(house)} house, you feel this most directly ${where}. This is where the year's energy concentrates — this house becomes the stage where your identity is most actively tested and developed.` : ''}`;
          }
          return `As Time Lord, ${planet} sets the year's agenda and determines the conditions under which life delivers its lessons. ${planet} represents ${drive}. In ${sign}, it operates ${style}. ${house ? `In the ${ordinal(house)} house, the agenda plays out ${where}.` : ''}`;
        };

        const getDoubleEmphasisExpert = (planet: string, sign: string, house: number | null): string => {
          return `When the same planet serves as both Lord of the Year (ruler of natal Ascendant) and Time Lord (ruler of the profected house), the year becomes a single-planet year. Every major theme — your vitality, your timing, your opportunities, and your challenges — routes through ${planet}. This is extraordinarily focused. Instead of two different planets pulling you in different directions, ${planet} is the sole gatekeeper. What ${planet} touches, thrives. What ${planet} ignores, stalls. In ${sign}${house ? ` in the ${ordinal(house)} house` : ''}, the style and arena are clear: every door opens or closes through ${planet}'s condition. Pay attention to transits hitting ${planet} this year — they function as master switches for the entire solar return.`;
        };

        return (
          <div className="space-y-3">
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
                    {getPlanetSignHouseExpert(lord.planet, lord.srSign, lord.srHouse, 'lord')}
                  </p>

                  {/* Tight aspects for Lord */}
                  {lordTightAspects.length > 0 && (
                    <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                      <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Tight Aspects (≤1° orb)</p>
                      {lordTightAspects.map((a, i) => {
                        const other = a.planet1 === lord.planet ? a.planet2 : a.planet1;
                        return (
                          <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-medium">{a.type} {other}</span> ({a.orb.toFixed(1)}° orb)
                            {a.interpretation ? ` — ${a.interpretation.split('.').slice(0, 1).join('.')}.` : ''}
                          </p>
                        );
                      })}
                      <p className="text-[10px] text-muted-foreground/80 mt-1 leading-tight">
                        When the Lord of the Year forms aspects within 1° of another planet or angle, those contacts are highly activated all year. They represent the most reliable channels through which the year's energy flows.
                      </p>
                    </div>
                  )}
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
                    {getPlanetSignHouseExpert(prof.timeLord, prof.timeLordSRSign, prof.timeLordSRHouse, 'timeLord')}
                  </p>

                  {/* Tight aspects for Time Lord (only if different from Lord) */}
                  {!isDoubled && timeLordTightAspects.length > 0 && (
                    <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                      <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Tight Aspects (≤1° orb)</p>
                      {timeLordTightAspects.map((a, i) => {
                        const other = a.planet1 === prof.timeLord ? a.planet2 : a.planet1;
                        return (
                          <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-medium">{a.type} {other}</span> ({a.orb.toFixed(1)}° orb)
                            {a.interpretation ? ` — ${a.interpretation.split('.').slice(0, 1).join('.')}.` : ''}
                          </p>
                        );
                      })}
                      <p className="text-[10px] text-muted-foreground/80 mt-1 leading-tight">
                        Tight Time Lord aspects indicate precisely how and when the profection house themes are triggered throughout the year.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── Double Emphasis Box ─── */}
            {isDoubled && lord && prof && (
              <div className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PLANET_SYMBOLS[lord.planet]}</span>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Double Emphasis — Single-Planet Year</p>
                </div>
                <p className="text-xs font-medium text-foreground">
                  {lord.planet} serves as both Lord of the Year and Time Lord
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {getDoubleEmphasisExpert(lord.planet, lord.srSign, lord.srHouse)}
                </p>
                {lordTightAspects.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Critical Aspects (≤1° orb)</p>
                    {lordTightAspects.map((a, i) => {
                      const other = a.planet1 === lord.planet ? a.planet2 : a.planet1;
                      return (
                        <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
                          <span className="text-foreground font-medium">{PLANET_SYMBOLS[other] || ''} {a.type} {other}</span> ({a.orb.toFixed(1)}°)
                          {a.interpretation ? ` — ${a.interpretation.split('.').slice(0, 1).join('.')}.` : ''}
                        </p>
                      );
                    })}
                    <p className="text-[10px] text-muted-foreground/80 mt-1 leading-tight">
                      In a single-planet year, tight aspects to the ruling planet become the year's most critical activations. Every transit that touches {lord.planet} ripples through both your identity (Lord) and your timing (Time Lord) simultaneously.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ─── 5. How This Year Meets You ─── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">How This Year Meets You</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { planet: 'Sun', natal: natalSunSign, sr: srSunSign },
            { planet: 'Moon', natal: natalMoonSign, sr: srMoonSign },
            { planet: 'Rising', natal: natalRisingSign, sr: srRisingSign },
          ].map(({ planet, natal, sr }) => {
            const tags = getShiftTags(natal, sr);
            return (
              <div key={planet} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{planet}</p>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, i) => (
                      <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${tag.cls}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-foreground">{SIGN_SYMBOLS[natal]} {natal}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground font-medium">{SIGN_SYMBOLS[sr]} {sr}</span>
                </div>
                <p className="text-xs font-medium text-foreground">{getShiftHeadline(planet, natal, sr)}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{getShiftBody(planet, natal, sr)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 6. Intercepted Signs ─── */}
      {(() => {
        const intercepted = detectInterceptedSigns(srChart.houseCusps);
        if (intercepted.length === 0) return null;
        return (
          <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-600 font-medium">Intercepted Signs</p>
            <div className="flex flex-wrap gap-2">
              {intercepted.map(sign => (
                <Badge key={sign} variant="outline" className="border-amber-500/30 text-amber-700 bg-amber-50">
                  {SIGN_SYMBOLS[sign]} {sign}
                </Badge>
              ))}
            </div>
            {/* Master-level teaching on interception mechanics */}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {getInterceptionTeaching(intercepted)}
            </p>
            {/* Per-sign expert themes */}
            <div className="space-y-2 mt-1">
              {intercepted.map(sign => (
                <div key={sign} className="bg-background/60 rounded p-2.5 border border-border/50">
                  <p className="text-xs font-medium text-foreground mb-1">{SIGN_SYMBOLS[sign]} {sign}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {INTERCEPTION_SIGN_THEMES[sign] || `${sign} themes are contained within this house and require deliberate effort to express.`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
