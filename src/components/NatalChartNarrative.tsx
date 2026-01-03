import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { 
  getPlanetaryPositions, 
  getMoonPhase, 
  getExactLunarPhase,
  PlanetaryPositions
} from '@/lib/astrology';
import { calculateTransitAspects, TransitAspect } from '@/lib/transitAspects';
import { PLANET_ESSENCES, HOUSE_MEANINGS, ASPECT_MEANINGS } from '@/lib/detailedInterpretations';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOrdinal = (num: number): string => {
  if (num === 1 || num === 21 || num === 31) return 'st';
  if (num === 2 || num === 22) return 'nd';
  if (num === 3 || num === 23) return 'rd';
  return 'th';
};

const getSymbol = (planet: string): string => {
  const symbols: Record<string, string> = {
    sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
    jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
    chiron: '⚷', lilith: '⚸', northnode: '☊', ascendant: 'AC', midheaven: 'MC'
  };
  return symbols[planet.toLowerCase()] || planet[0];
};

// Convert sign + degree to longitude for house calculation
const signToLongitude = (sign: string, degree: number): number => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
};

const getPlanetHouse = (planetLon: number, houseCusps?: NatalChart['houseCusps']): number | null => {
  if (!houseCusps) return null;
  
  // Build array of house cusps with longitudes
  const cusps: { house: number; longitude: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof houseCusps;
    const cusp = houseCusps[key];
    if (cusp) {
      cusps.push({ house: i, longitude: signToLongitude(cusp.sign, cusp.degree) });
    }
  }
  
  if (cusps.length < 12) return null;
  
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i].longitude;
    const nextCusp = cusps[(i + 1) % 12].longitude;
    
    let inHouse = false;
    if (nextCusp > currentCusp) {
      inHouse = planetLon >= currentCusp && planetLon < nextCusp;
    } else {
      inHouse = planetLon >= currentCusp || planetLon < nextCusp;
    }
    
    if (inHouse) return cusps[i].house;
  }
  return 1;
};

// Sign expression database
const SIGN_EXPRESSIONS: Record<string, Record<string, string>> = {
  sun: {
    aries: "Pioneering identity. You shine through courage, independence, and bold action.",
    taurus: "Grounded identity. You shine through stability, sensuality, and steady presence.",
    gemini: "Curious identity. You shine through communication, wit, and mental agility.",
    cancer: "Nurturing identity. You shine through emotional depth, care, and protection.",
    leo: "Creative identity. You shine through self-expression, drama, and generous heart.",
    virgo: "Analytical identity. You shine through service, precision, and improvement.",
    libra: "Harmonious identity. You shine through balance, beauty, and relationship.",
    scorpio: "Intense identity. You shine through depth, power, and transformation.",
    sagittarius: "Expansive identity. You shine through adventure, truth, and philosophy.",
    capricorn: "Ambitious identity. You shine through achievement, mastery, and responsibility.",
    aquarius: "Innovative identity. You shine through uniqueness, community, and revolution.",
    pisces: "Mystical identity. You shine through compassion, dreams, and transcendence.",
  },
  moon: {
    aries: "Impulsive emotions. You feel through instinct and need freedom to react.",
    taurus: "Stable emotions. You feel through body and need physical comfort.",
    gemini: "Curious emotions. You feel through words and need mental stimulation.",
    cancer: "Deep emotions. You feel through intuition and need emotional safety.",
    leo: "Dramatic emotions. You feel through heart and need to be seen.",
    virgo: "Analytical emotions. You feel through service and need order.",
    libra: "Harmonious emotions. You feel through others and need balance.",
    scorpio: "Intense emotions. You feel through depth and need transformation.",
    sagittarius: "Free emotions. You feel through philosophy and need adventure.",
    capricorn: "Disciplined emotions. You feel through structure and need control.",
    aquarius: "Detached emotions. You feel through ideals and need space.",
    pisces: "Mystical emotions. You feel through empathy and need transcendence.",
  },
  mercury: {
    aries: "Direct communication. You think fast and speak boldly.",
    taurus: "Deliberate communication. You think slowly and speak with certainty.",
    gemini: "Quick communication. You think rapidly and speak prolifically.",
    cancer: "Emotional communication. You think with feeling and speak from the heart.",
    leo: "Dramatic communication. You think creatively and speak with flair.",
    virgo: "Precise communication. You think analytically and speak accurately.",
    libra: "Diplomatic communication. You think fairly and speak harmoniously.",
    scorpio: "Intense communication. You think deeply and speak powerfully.",
    sagittarius: "Expansive communication. You think philosophically and speak freely.",
    capricorn: "Structured communication. You think practically and speak authoritatively.",
    aquarius: "Innovative communication. You think uniquely and speak unconventionally.",
    pisces: "Intuitive communication. You think symbolically and speak poetically.",
  },
  venus: {
    aries: "Passionate love. You value independence and are attracted to boldness.",
    taurus: "Sensual love. You value stability and are attracted to beauty.",
    gemini: "Playful love. You value variety and are attracted to wit.",
    cancer: "Nurturing love. You value security and are attracted to care.",
    leo: "Romantic love. You value admiration and are attracted to drama.",
    virgo: "Practical love. You value service and are attracted to competence.",
    libra: "Harmonious love. You value partnership and are attracted to grace.",
    scorpio: "Intense love. You value depth and are attracted to power.",
    sagittarius: "Free love. You value adventure and are attracted to wisdom.",
    capricorn: "Committed love. You value loyalty and are attracted to success.",
    aquarius: "Unconventional love. You value friendship and are attracted to uniqueness.",
    pisces: "Mystical love. You value compassion and are attracted to spirituality.",
  },
  mars: {
    aries: "Direct action. You assert yourself boldly and fight courageously.",
    taurus: "Steady action. You assert yourself slowly and fight stubbornly.",
    gemini: "Quick action. You assert yourself verbally and fight with words.",
    cancer: "Emotional action. You assert yourself defensively and fight for family.",
    leo: "Dramatic action. You assert yourself proudly and fight for recognition.",
    virgo: "Precise action. You assert yourself efficiently and fight for perfection.",
    libra: "Balanced action. You assert yourself diplomatically and fight for justice.",
    scorpio: "Intense action. You assert yourself powerfully and fight to win.",
    sagittarius: "Free action. You assert yourself freely and fight for truth.",
    capricorn: "Controlled action. You assert yourself strategically and fight for goals.",
    aquarius: "Revolutionary action. You assert yourself uniquely and fight for ideals.",
    pisces: "Intuitive action. You assert yourself gently and fight for compassion.",
  }
};

const getSignExpression = (planet: string, sign: string): string => {
  const planetKey = planet.toLowerCase();
  const signKey = sign.toLowerCase();
  return SIGN_EXPRESSIONS[planetKey]?.[signKey] || 
    `${planet} in ${sign} expresses through the qualities of ${sign}.`;
};

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface NatalChartNarrativeProps {
  natalChart: NatalChart | null;
  currentDate?: Date;
}

// ============================================================================
// NATAL PLANETS SUMMARY
// ============================================================================

const NatalPlanetsSummary = ({ 
  planets, 
  houseCusps 
}: { 
  planets: NatalChart['planets']; 
  houseCusps?: NatalChart['houseCusps'];
}) => {
  const planetOrder = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Lilith'];
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-secondary/50 to-secondary rounded-lg">
      <h3 className="text-xl font-bold mb-5 text-foreground">
        Your Natal Planets
      </h3>
      
      <div className="grid gap-4">
        {planetOrder.map(planetKey => {
          const planetData = planets[planetKey as keyof typeof planets];
          if (!planetData?.sign) return null;
          
          const planetLon = signToLongitude(planetData.sign, planetData.degree);
          const house = getPlanetHouse(planetLon, houseCusps);
          const planetInfo = PLANET_ESSENCES[planetKey.toLowerCase()];
          
          return (
            <div key={planetKey} className="p-4 bg-background rounded border-l-4 border-primary/60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-base font-bold mb-1">
                    {getSymbol(planetKey)} {planetInfo?.name || planetKey}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {planetData.degree}° {planetData.sign}
                    {house && ` in ${house}${getOrdinal(house)} house`}
                    {planetData.isRetrograde && ' ℞'}
                  </div>
                </div>
              </div>
              
              <div className="text-sm leading-relaxed text-foreground/80">
                {getSignExpression(planetInfo?.name || planetKey, planetData.sign)}
                {house && HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS] && (
                  <div className="mt-1 italic text-muted-foreground">
                    Expresses through: {HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].short}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// CURRENT TRANSITS REPORT
// ============================================================================

const CurrentTransitsReport = ({ 
  natalChart, 
  currentDate 
}: { 
  natalChart: NatalChart; 
  currentDate: Date;
}) => {
  const planets = getPlanetaryPositions(currentDate);
  const aspects = calculateTransitAspects(currentDate, planets, natalChart);
  
  // Group by natal planet
  const groupedByNatal: Record<string, TransitAspect[]> = {};
  aspects.forEach(aspect => {
    if (!groupedByNatal[aspect.natalPlanet]) {
      groupedByNatal[aspect.natalPlanet] = [];
    }
    groupedByNatal[aspect.natalPlanet].push(aspect);
  });
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg border-2 border-green-500/50">
      <h3 className="text-xl font-bold mb-2 text-green-800 dark:text-green-300">
        💫 How Today's Transits Affect YOUR Chart
      </h3>
      
      <div className="text-sm text-green-700 dark:text-green-400 mb-5 italic">
        {currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </div>
      
      {Object.keys(groupedByNatal).length === 0 ? (
        <div className="p-5 bg-background/80 rounded text-sm text-foreground">
          No major transits to your natal planets today. This is a good day to rest, 
          integrate, and prepare for the next wave of cosmic activity.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(groupedByNatal).map(([natalPlanet, planetAspects]) => {
            const natalPlanetInfo = PLANET_ESSENCES[natalPlanet.toLowerCase()];
            const natalData = natalChart.planets[natalPlanet as keyof typeof natalChart.planets];
            
            return (
              <div key={natalPlanet} className="p-5 bg-background/95 rounded-lg shadow">
                <div className="text-lg font-bold mb-3 text-green-800 dark:text-green-300">
                  Transits to Your Natal {getSymbol(natalPlanet)} {natalPlanetInfo?.name}
                  {natalData && (
                    <span className="text-sm font-normal text-muted-foreground ml-3">
                      ({natalData.degree}° {natalData.sign})
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-foreground mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                  <strong>Your Natal {natalPlanetInfo?.name}:</strong> {natalPlanetInfo?.essence}
                </div>
                
                {planetAspects.map((aspect, i) => (
                  <div 
                    key={i} 
                    className="mb-4 last:mb-0 pl-4"
                    style={{ borderLeft: `3px solid ${aspect.color}` }}
                  >
                    <div 
                      className="text-base font-semibold mb-1"
                      style={{ color: aspect.color }}
                    >
                      {getSymbol(aspect.transitPlanet)} Transit {aspect.transitPlanet}
                      {' '}{aspect.symbol}{' '}
                      ({aspect.transitDegree}° {aspect.transitSign})
                      {aspect.isExact && ' ⭐ EXACT!'}
                    </div>
                    
                    <div className="text-sm leading-relaxed text-foreground">
                      {aspect.interpretation}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// LUNAR CYCLE CONTEXT
// ============================================================================

const LunarCycleContext = ({ 
  currentDate, 
  natalChart 
}: { 
  currentDate: Date; 
  natalChart: NatalChart;
}) => {
  const currentPhase = getExactLunarPhase(currentDate);
  const moonPhase = getMoonPhase(currentDate);
  const planets = getPlanetaryPositions(currentDate);
  const moonData = planets.moon;
  
  const getLunarCycleNarrative = (newMoonSign: string, current: Date, newMoonDate: Date): string => {
    const daysSince = Math.floor((current.getTime() - newMoonDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const signMeanings: Record<string, string> = {
      'Aries': 'This cycle is about courage, independence, and taking bold action.',
      'Taurus': 'This cycle is about grounding, building value, and sensual pleasure.',
      'Gemini': 'This cycle is about communication, learning, and making connections.',
      'Cancer': 'This cycle is about emotional depth, home, and nurturing care.',
      'Leo': 'This cycle is about creative self-expression, joy, and heart-centered living.',
      'Virgo': 'This cycle is about service, health, and perfecting your craft.',
      'Libra': 'This cycle is about balance, relationships, and finding harmony.',
      'Scorpio': 'This cycle is about transformation, depth, and reclaiming power.',
      'Sagittarius': 'This cycle is about expansion, truth-seeking, and adventure.',
      'Capricorn': 'This cycle is about achievement, structure, and mastering responsibility.',
      'Aquarius': 'This cycle is about innovation, community, and revolutionary change.',
      'Pisces': 'This cycle is about compassion, spirituality, and dissolving boundaries.'
    };
    
    const phaseGuidance = daysSince < 7
      ? "You're in the new moon phase - plant seeds and set intentions."
      : daysSince < 14
      ? "You're in the waxing phase - take action on your intentions."
      : daysSince < 21
      ? "You're approaching the full moon - prepare for culmination."
      : "You're in the waning phase - release and let go.";
    
    return `${signMeanings[newMoonSign] || ''} ${phaseGuidance} What you initiated then is now ${daysSince} days into manifestation.`;
  };
  
  // Find last/next new moons
  const getLastNewMoon = (date: Date) => {
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() - i);
      const phase = getExactLunarPhase(checkDate);
      if (phase && phase.type === 'New Moon') {
        return { date: checkDate, phase };
      }
    }
    return null;
  };
  
  const getNextNewMoon = (date: Date) => {
    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() + i);
      const phase = getExactLunarPhase(checkDate);
      if (phase && phase.type === 'New Moon') {
        return { date: checkDate, phase };
      }
    }
    return null;
  };
  
  const lastNewMoon = getLastNewMoon(currentDate);
  const nextNewMoon = getNextNewMoon(currentDate);
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 rounded-lg border-2 border-indigo-500/50">
      <h3 className="text-xl font-bold mb-5 text-indigo-800 dark:text-indigo-300">
        🌙 Your Current Lunar Cycle
      </h3>
      
      <div className="p-5 bg-background/95 rounded-lg mb-5">
        <div className="text-lg font-bold mb-3 text-indigo-800 dark:text-indigo-300">
          {currentPhase?.emoji || '🌙'} {currentPhase?.type || moonPhase.phaseName} in {moonData.signName}
        </div>
        <div className="text-sm leading-relaxed text-foreground">
          {currentPhase ? (
            <span>
              {currentPhase.type} at {currentPhase.position} — {moonPhase.phaseName} energy active.
            </span>
          ) : (
            <span>
              Moon energy is {moonPhase.phaseName.toLowerCase()}. Illumination: {(moonPhase.illumination * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      
      {/* Cycle Timeline */}
      <div className="p-5 bg-background/80 rounded-lg">
        <div className="text-base font-semibold mb-4 text-indigo-800 dark:text-indigo-300">
          Cycle Timeline:
        </div>
        
        {lastNewMoon && (
          <div className="mb-3 pl-4 border-l-4 border-indigo-500">
            <div className="text-sm font-semibold text-foreground">
              ☽ Last New Moon: {lastNewMoon.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {lastNewMoon.phase.sign} - Seeds planted {Math.floor((currentDate.getTime() - lastNewMoon.date.getTime()) / (1000 * 60 * 60 * 24))} days ago.
            </div>
            <div className="text-sm text-foreground mt-2 leading-relaxed">
              {getLunarCycleNarrative(lastNewMoon.phase.sign, currentDate, lastNewMoon.date)}
            </div>
          </div>
        )}
        
        {nextNewMoon && (
          <div className="pl-4 border-l-4 border-indigo-300">
            <div className="text-sm font-semibold text-foreground">
              ☽ Next New Moon: {nextNewMoon.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {nextNewMoon.phase.sign} - New cycle in {Math.floor((nextNewMoon.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))} days.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PATTERNS & TIMING
// ============================================================================

const PatternsAndTiming = ({ 
  natalChart, 
  currentDate 
}: { 
  natalChart: NatalChart; 
  currentDate: Date;
}) => {
  const planets = getPlanetaryPositions(currentDate);
  const aspects = calculateTransitAspects(currentDate, planets, natalChart);
  
  const getReturnNarrative = (planet: string): string => {
    const returnMeanings: Record<string, string> = {
      sun: "Solar Return - Your birthday! A new year of personal growth begins. Major theme: who you're becoming.",
      moon: "Lunar Return (monthly) - Emotional reset. Your feelings align with natal patterns. Good for introspection.",
      mercury: "Mercury Return (yearly) - Mental refresh. Communication and learning patterns restart.",
      venus: "Venus Return (yearly) - Values and love refresh. What you attract and appreciate renews.",
      mars: "Mars Return (~2 years) - Drive and action restart. New 2-year cycle of ambition begins.",
      jupiter: "Jupiter Return (~12 years) - Major expansion cycle. Every 12 years, growth opportunities multiply.",
      saturn: "Saturn Return (~29 years) - Life restructuring. Major maturity milestone. Everything gets real.",
      chiron: "Chiron Return (~50 years) - Wound becomes wisdom. Healing gift fully activates."
    };
    
    return returnMeanings[planet.toLowerCase()] || "Planet returns to natal position - cycle completes and restarts.";
  };
  
  // Check for planetary returns using sign + degree
  const returns: Array<{ planet: string; orb: string; natalSign: string; natalDegree: number }> = [];
  const planetKeys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
  
  planetKeys.forEach(planetKey => {
    const transitKey = planetKey.toLowerCase() as keyof PlanetaryPositions;
    const transitData = planets[transitKey];
    const natalPlanet = natalChart.planets[planetKey];
    
    if (transitData && natalPlanet?.sign) {
      const transitLon = signToLongitude(transitData.signName, transitData.degree);
      const natalLon = signToLongitude(natalPlanet.sign, natalPlanet.degree);
      const diff = Math.abs(transitLon - natalLon);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      if (normalizedDiff < 8) {
        returns.push({
          planet: planetKey,
          orb: normalizedDiff.toFixed(1),
          natalSign: natalPlanet.sign,
          natalDegree: natalPlanet.degree
        });
      }
    }
  });
  
  const exactAspects = aspects.filter(a => parseFloat(String(a.orb)) < 1);
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-lg border-2 border-amber-500/50">
      <h3 className="text-xl font-bold mb-5 text-amber-800 dark:text-amber-300">
        ⏰ Patterns & Timing
      </h3>
      
      {returns.length > 0 && (
        <div className="p-5 bg-background/95 rounded-lg mb-5">
          <div className="text-lg font-bold mb-3 text-amber-800 dark:text-amber-300">
            🔄 Planetary Returns Approaching
          </div>
          {returns.map((ret, i) => (
            <div key={i} className="mb-3 last:mb-0 pl-4 border-l-4 border-amber-500">
              <div className="text-base font-semibold text-foreground">
                {getSymbol(ret.planet)} {ret.planet} Return
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Coming back to {ret.natalDegree}° {ret.natalSign} (orb: {ret.orb}°)
              </div>
              <div className="text-sm text-foreground mt-2 leading-relaxed">
                {getReturnNarrative(ret.planet)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {exactAspects.length > 0 && (
        <div className="p-5 bg-background/95 rounded-lg">
          <div className="text-lg font-bold mb-3 text-amber-800 dark:text-amber-300">
            ⭐ Exact Aspects Today
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            These transits are at peak power right now:
          </div>
          {exactAspects.map((aspect, i) => (
            <div 
              key={i} 
              className="mb-3 last:mb-0 p-3 bg-amber-50 dark:bg-amber-950/40 rounded"
              style={{ borderLeft: `4px solid ${aspect.color}` }}
            >
              <div className="text-sm font-semibold" style={{ color: aspect.color }}>
                ⭐ {getSymbol(aspect.transitPlanet)} {aspect.transitPlanet} {aspect.symbol} {getSymbol(aspect.natalPlanet)} {aspect.natalPlanet}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Orb: {aspect.orb}° - This is PEAK ENERGY!
              </div>
            </div>
          ))}
        </div>
      )}
      
      {returns.length === 0 && exactAspects.length === 0 && (
        <div className="p-5 bg-background/95 rounded-lg text-sm text-foreground">
          No exact returns or exact aspects today. Transits are building or separating. 
          Use this time to integrate recent experiences.
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NatalChartNarrative = ({ natalChart, currentDate = new Date() }: NatalChartNarrativeProps) => {
  if (!natalChart) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <p>Select a natal chart to see your personalized analysis.</p>
      </div>
    );
  }
  
  // Parse birth date/time for header display
  const birthParts = natalChart.birthDate?.split('-') || [];
  const timeParts = natalChart.birthTime?.split(':') || [];
  
  return (
    <div className="p-8 bg-background max-h-[80vh] overflow-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-border">
        <h2 className="font-serif text-3xl mb-2 text-foreground">
          {natalChart.name}'s Natal Chart
        </h2>
        <div className="text-sm text-muted-foreground">
          {birthParts[1] || ''}/{birthParts[2] || ''}/{birthParts[0] || ''}
          {' • '}
          {timeParts[0] || ''}:{timeParts[1] || '00'}
          {' • '}
          {natalChart.birthLocation}
        </div>
      </div>
      
      {/* Natal Planets Summary */}
      <NatalPlanetsSummary planets={natalChart.planets} houseCusps={natalChart.houseCusps} />
      
      {/* Current Transits Affecting You */}
      <CurrentTransitsReport natalChart={natalChart} currentDate={currentDate} />
      
      {/* Lunar Cycle Context */}
      <LunarCycleContext currentDate={currentDate} natalChart={natalChart} />
      
      {/* Patterns & Timing */}
      <PatternsAndTiming natalChart={natalChart} currentDate={currentDate} />
    </div>
  );
};
