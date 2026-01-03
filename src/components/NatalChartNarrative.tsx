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
  },
  jupiter: {
    aries: "Entrepreneurial expansion. You grow through bold initiatives, pioneering ventures, and courageous risk-taking. Luck comes when you lead.",
    taurus: "Material abundance. You grow through building lasting value, patient accumulation, and sensory pleasures. Luck comes through stability.",
    gemini: "Intellectual expansion. You grow through learning, teaching, communication, and making connections. Luck comes through ideas.",
    cancer: "Emotional abundance. You grow through nurturing others, creating home, and honoring family bonds. Luck comes through caring.",
    leo: "Creative expansion. You grow through self-expression, generosity, and following your heart. Luck comes through joy and play.",
    virgo: "Service-oriented growth. You grow through helping others, improving systems, and perfecting your craft. Luck comes through precision.",
    libra: "Relational expansion. You grow through partnerships, diplomacy, and creating harmony. Luck comes through collaboration.",
    scorpio: "Transformational abundance. You grow through deep research, healing, and embracing the mysteries. Luck comes through intensity.",
    sagittarius: "Philosophical expansion. You grow through travel, higher education, and seeking meaning. Luck flows naturally here.",
    capricorn: "Ambitious growth. You grow through discipline, building structures, and achieving mastery. Luck comes through hard work.",
    aquarius: "Innovative expansion. You grow through humanitarian efforts, technology, and revolutionary thinking. Luck comes through originality.",
    pisces: "Spiritual abundance. You grow through compassion, artistic expression, and transcendence. Luck comes through surrender.",
  },
  saturn: {
    aries: "Mastering self-assertion. Your life lessons involve learning patience with impulses, disciplining courage, and earning the right to lead.",
    taurus: "Mastering resources. Your life lessons involve building real security, learning the value of patience, and earning through steady effort.",
    gemini: "Mastering communication. Your life lessons involve developing mental discipline, speaking with authority, and learning to focus scattered thoughts.",
    cancer: "Mastering emotions. Your life lessons involve building inner security, setting healthy boundaries in family, and learning emotional self-reliance.",
    leo: "Mastering self-expression. Your life lessons involve earning recognition, disciplining creative impulses, and learning to shine without seeking approval.",
    virgo: "Mastering service. Your life lessons involve perfectionism vs. good enough, learning to serve without self-criticism, and earning health through discipline.",
    libra: "Mastering relationships. Your life lessons involve commitment, learning partnership through patience, and earning harmony through fair effort.",
    scorpio: "Mastering power. Your life lessons involve facing fears, learning to transform through discipline, and earning trust through accountability.",
    sagittarius: "Mastering belief. Your life lessons involve tempering optimism with realism, learning through structured study, and earning wisdom through experience.",
    capricorn: "Mastering ambition. Your life lessons involve building real authority, learning through hard work, and earning status through integrity. Saturn is at home here.",
    aquarius: "Mastering innovation. Your life lessons involve bringing structure to vision, learning to reform systematically, and earning a place in community.",
    pisces: "Mastering faith. Your life lessons involve grounding spirituality, learning to surrender without losing yourself, and earning peace through acceptance.",
  },
  uranus: {
    aries: "Revolutionary independence. Your generation breaks free through bold individual action. You awaken through courage and pioneering change.",
    taurus: "Revolutionary resources. Your generation disrupts traditional values and economics. You awaken through material innovation and body liberation.",
    gemini: "Revolutionary communication. Your generation transforms how we think and share information. You awaken through radical ideas and new media.",
    cancer: "Revolutionary nurturing. Your generation transforms family structures and emotional norms. You awaken through redefining home and belonging.",
    leo: "Revolutionary self-expression. Your generation transforms creativity and individuality. You awaken through authentic self-presentation and new art forms.",
    virgo: "Revolutionary service. Your generation transforms health, work, and daily systems. You awaken through perfecting new methods of helping.",
    libra: "Revolutionary relationships. Your generation transforms partnerships and social justice. You awaken through redefining equality and connection.",
    scorpio: "Revolutionary transformation. Your generation transforms sexuality, death, and power structures. You awaken through radical psychological depth.",
    sagittarius: "Revolutionary belief. Your generation transforms religion, philosophy, and global connection. You awaken through new visions of meaning.",
    capricorn: "Revolutionary authority. Your generation transforms governments, institutions, and traditional structures. You awaken through rebuilding what's broken.",
    aquarius: "Revolutionary humanity. Your generation transforms technology and collective consciousness. You awaken through radical innovation. Uranus is at home here.",
    pisces: "Revolutionary spirituality. Your generation transforms art, mysticism, and collective unconscious. You awaken through dissolving old boundaries.",
  },
  neptune: {
    aries: "Spiritual warrior. Your generation dreams of brave new worlds. You dissolve ego through courageous compassion and pioneering faith.",
    taurus: "Spiritual materialism. Your generation dreams of earthly paradise. You dissolve through beauty, art, and redefining what has true value.",
    gemini: "Spiritual communication. Your generation dreams through words and ideas. You dissolve through poetry, media, and the power of story.",
    cancer: "Spiritual nurturing. Your generation dreams of unconditional love. You dissolve through compassionate care and healing wounded families.",
    leo: "Spiritual creativity. Your generation dreams through art and performance. You dissolve ego through creative surrender and joyful transcendence.",
    virgo: "Spiritual service. Your generation dreams of healing and wholeness. You dissolve through devoted service and surrendering to a higher craft.",
    libra: "Spiritual relationship. Your generation dreams of perfect love and harmony. You dissolve through idealized partnerships and artistic collaboration.",
    scorpio: "Spiritual depth. Your generation dreams of transformation and mystery. You dissolve through psychic exploration and surrendering to the unknown.",
    sagittarius: "Spiritual quest. Your generation dreams of ultimate truth and meaning. You dissolve through philosophical exploration and faith expansion.",
    capricorn: "Spiritual ambition. Your generation dreams of manifesting heaven on earth. You dissolve old structures through visionary leadership.",
    aquarius: "Spiritual revolution. Your generation dreams of enlightened humanity. You dissolve through collective awakening and technological transcendence.",
    pisces: "Spiritual transcendence. Your generation dreams the deepest dreams. You dissolve naturally into cosmic consciousness. Neptune is at home here.",
  },
  pluto: {
    aries: "Power through self-assertion. Your generation transforms through courage and reclaiming individual will. You regenerate by learning to fight for yourself.",
    taurus: "Power through resources. Your generation transforms material values and relationship to Earth. You regenerate by reclaiming authentic self-worth.",
    gemini: "Power through communication. Your generation transforms information and mental paradigms. You regenerate by reclaiming your authentic voice.",
    cancer: "Power through emotion. Your generation transforms family patterns and emotional inheritance. You regenerate by healing ancestral wounds.",
    leo: "Power through creativity. Your generation transforms self-expression and heart-centered living. You regenerate by reclaiming your creative fire.",
    virgo: "Power through service. Your generation transforms health, work, and daily rituals. You regenerate by purifying and perfecting your offerings.",
    libra: "Power through relationship. Your generation transforms partnerships and social justice. You regenerate by reclaiming relational balance.",
    scorpio: "Power through transformation. Your generation goes deepest into the underworld. You regenerate through complete death and rebirth. Pluto is at home here.",
    sagittarius: "Power through belief. Your generation transforms religion, education, and global connection. You regenerate by reclaiming authentic truth.",
    capricorn: "Power through structure. Your generation transforms governments, institutions, and authority. You regenerate by rebuilding systems with integrity.",
    aquarius: "Power through innovation. Your generation transforms society and collective consciousness. You regenerate through revolutionary change.",
    pisces: "Power through transcendence. Your generation transforms spirituality and collective unconscious. You regenerate by dissolving and merging with source.",
  },
  chiron: {
    aries: "Wound of identity. Your healing gift emerges from struggles with self-assertion. You help others find courage by owning your own journey with confidence.",
    taurus: "Wound of worth. Your healing gift emerges from struggles with self-value. You help others ground in their bodies by healing your own relationship to worth.",
    gemini: "Wound of communication. Your healing gift emerges from struggles with being heard. You help others find their voice by healing your own expression.",
    cancer: "Wound of belonging. Your healing gift emerges from family and emotional wounds. You help others feel at home by healing your own nurturing patterns.",
    leo: "Wound of recognition. Your healing gift emerges from struggles with being seen. You help others shine by healing your own relationship to self-expression.",
    virgo: "Wound of perfection. Your healing gift emerges from struggles with self-criticism. You help others accept themselves by healing your inner critic.",
    libra: "Wound of relationship. Your healing gift emerges from partnership struggles. You help others balance by healing your own relational patterns.",
    scorpio: "Wound of trust. Your healing gift emerges from betrayal and power struggles. You help others transform by facing your own depths.",
    sagittarius: "Wound of meaning. Your healing gift emerges from crises of faith. You help others find truth by healing your relationship to belief.",
    capricorn: "Wound of authority. Your healing gift emerges from struggles with achievement. You help others succeed by healing your relationship to mastery.",
    aquarius: "Wound of belonging. Your healing gift emerges from feeling like an outsider. You help others embrace uniqueness by healing your own alienation.",
    pisces: "Wound of separation. Your healing gift emerges from spiritual disconnection. You help others transcend by healing your relationship to the divine.",
  },
  northnode: {
    aries: "Soul growth through independence. You're learning to assert yourself, take initiative, and develop courage. Your past-life comfort zone is in pleasing others.",
    taurus: "Soul growth through stability. You're learning to build value, trust the body, and develop patience. Your past-life comfort zone is in intensity and crisis.",
    gemini: "Soul growth through communication. You're learning to listen, share ideas, and stay curious. Your past-life comfort zone is in big-picture thinking.",
    cancer: "Soul growth through nurturing. You're learning to feel deeply, create home, and care for others. Your past-life comfort zone is in achievement and control.",
    leo: "Soul growth through creativity. You're learning to shine, express yourself, and follow your heart. Your past-life comfort zone is in group identity.",
    virgo: "Soul growth through service. You're learning to be useful, discern clearly, and perfect your craft. Your past-life comfort zone is in mystical escape.",
    libra: "Soul growth through partnership. You're learning to cooperate, find balance, and create harmony. Your past-life comfort zone is in self-focus.",
    scorpio: "Soul growth through transformation. You're learning to merge deeply, release control, and embrace intensity. Your past-life comfort zone is in material security.",
    sagittarius: "Soul growth through expansion. You're learning to seek truth, travel widely, and think big. Your past-life comfort zone is in local concerns.",
    capricorn: "Soul growth through mastery. You're learning to achieve, build structure, and take responsibility. Your past-life comfort zone is in emotional dependency.",
    aquarius: "Soul growth through innovation. You're learning to think collectively, embrace uniqueness, and serve humanity. Your past-life comfort zone is in personal drama.",
    pisces: "Soul growth through transcendence. You're learning to surrender, trust the universe, and dissolve boundaries. Your past-life comfort zone is in analysis and control.",
  },
  lilith: {
    aries: "Shadow of anger. Your wild feminine power expresses through rage, independence, and refusing to be tamed. Integrate this by owning your right to fight.",
    taurus: "Shadow of desire. Your wild feminine power expresses through sensuality, possession, and earthy pleasure. Integrate this by owning your appetites.",
    gemini: "Shadow of the mind. Your wild feminine power expresses through forbidden knowledge and dangerous ideas. Integrate this by owning your curiosity.",
    cancer: "Shadow of the mother. Your wild feminine power expresses through dark nurturing and emotional manipulation. Integrate this by owning your needs.",
    leo: "Shadow of pride. Your wild feminine power expresses through diva energy and demanding recognition. Integrate this by owning your right to shine.",
    virgo: "Shadow of perfection. Your wild feminine power expresses through dark criticism and sacred service. Integrate this by owning your standards.",
    libra: "Shadow of relationship. Your wild feminine power expresses through seduction and breaking social rules. Integrate this by owning your desires.",
    scorpio: "Shadow of power. Your wild feminine power expresses through destruction and regeneration. Integrate this by owning your darkness.",
    sagittarius: "Shadow of truth. Your wild feminine power expresses through heresy and forbidden teachings. Integrate this by owning your beliefs.",
    capricorn: "Shadow of ambition. Your wild feminine power expresses through ruthless achievement. Integrate this by owning your authority.",
    aquarius: "Shadow of revolution. Your wild feminine power expresses through rebellion and breaking all rules. Integrate this by owning your difference.",
    pisces: "Shadow of transcendence. Your wild feminine power expresses through dark mysticism and dissolution. Integrate this by owning your surrender.",
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
                
                {planetAspects.map((aspect, i) => {
                  const detailed = aspect.detailedInterpretation;
                  return (
                    <div 
                      key={i} 
                      className="mb-6 last:mb-0 p-4 bg-white/50 dark:bg-black/20 rounded-lg"
                      style={{ borderLeft: `4px solid ${aspect.color}` }}
                    >
                      {/* Header */}
                      <div 
                        className="text-base font-semibold mb-2 flex items-center gap-2 flex-wrap"
                        style={{ color: aspect.color }}
                      >
                        <span>{getSymbol(aspect.transitPlanet)}{aspect.symbol}{getSymbol(aspect.natalPlanet)}</span>
                        <span>Transit {aspect.transitPlanet} ({aspect.transitDegree}° {aspect.transitSign}{aspect.transitHouse ? `, ${aspect.transitHouse}H` : ''})</span>
                        <span className="text-foreground">{aspect.aspect}</span>
                        <span>Natal {aspect.natalPlanet} ({aspect.natalDegree}° {aspect.natalSign}{aspect.natalHouse ? `, ${aspect.natalHouse}H` : ''})</span>
                        {aspect.isExact && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-bold">⭐ EXACT!</span>}
                        <span className="text-xs text-muted-foreground">Orb: {aspect.orb}°</span>
                      </div>
                      
                      {/* What's Happening */}
                      <div className="mb-3">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What's Happening</div>
                        <div className="text-sm text-foreground mb-1">{detailed.transitEssence}</div>
                        <div className="text-sm text-foreground mb-1">{detailed.natalEssence}</div>
                        <div className="text-sm text-primary font-medium">{detailed.aspectEnergy}</div>
                        <div className="text-sm text-muted-foreground italic">{detailed.aspectDescription}</div>
                      </div>
                      
                      {/* The Signs */}
                      <div className="mb-3">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">The Signs</div>
                        <div className="text-sm text-foreground mb-1">{detailed.transitSignInfo}</div>
                        <div className="text-sm text-foreground mb-1">{detailed.natalSignInfo}</div>
                        {detailed.signCombination && (
                          <div className="text-sm text-muted-foreground italic">{detailed.signCombination}</div>
                        )}
                      </div>
                      
                      {/* The Houses */}
                      {(detailed.transitHouseFull || detailed.natalHouseFull) && (
                        <div className="mb-3">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">The Houses</div>
                          {detailed.transitHouseFull && (
                            <div className="text-sm"><strong>{detailed.transitHouseShort}:</strong> {detailed.transitHouseFull}</div>
                          )}
                          {detailed.natalHouseFull && (
                            <div className="text-sm"><strong>{detailed.natalHouseShort}:</strong> {detailed.natalHouseFull}</div>
                          )}
                          {detailed.houseConnection && (
                            <div className="text-sm text-primary/80 mt-1 p-2 bg-primary/5 rounded">{detailed.houseConnection}</div>
                          )}
                        </div>
                      )}
                      
                      {/* Practical Guidance */}
                      <div className="mb-3">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Practical Guidance</div>
                        {detailed.guidance.gifts && (
                          <div className="mb-2">
                            <div className="text-xs font-semibold text-green-600">TODAY'S GIFTS:</div>
                            <ul className="text-sm">{detailed.guidance.gifts.map((g, j) => <li key={j}>• {g}</li>)}</ul>
                          </div>
                        )}
                        {detailed.guidance.challenges && (
                          <div className="mb-2">
                            <div className="text-xs font-semibold text-amber-600">TODAY'S CHALLENGE:</div>
                            <ul className="text-sm">{detailed.guidance.challenges.map((c, j) => <li key={j}>• {c}</li>)}</ul>
                          </div>
                        )}
                        {detailed.guidance.power && (
                          <div className="mb-2">
                            <div className="text-xs font-semibold text-purple-600">TODAY'S POWER:</div>
                            <ul className="text-sm">{detailed.guidance.power.map((p, j) => <li key={j}>• {p}</li>)}</ul>
                          </div>
                        )}
                        <div className="mb-2">
                          <div className="text-xs font-semibold">WHAT TO DO:</div>
                          <ul className="text-sm">{detailed.guidance.todo.map((t, j) => <li key={j}>✓ {t}</li>)}</ul>
                        </div>
                        <div>
                          <div className="text-xs font-semibold">AVOID:</div>
                          <ul className="text-sm text-muted-foreground">{detailed.guidance.avoid.map((a, j) => <li key={j}>✗ {a}</li>)}</ul>
                        </div>
                      </div>
                      
                      {/* Journal Prompt */}
                      <div className="bg-primary/5 p-3 rounded border-l-2 border-primary">
                        <div className="text-[10px] uppercase tracking-widest text-primary mb-1">Journal Prompt</div>
                        <div className="text-sm italic">{detailed.journalPrompt}</div>
                      </div>
                    </div>
                  );
                })}
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
