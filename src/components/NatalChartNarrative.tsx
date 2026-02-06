import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { 
  getPlanetaryPositions, 
  getMoonPhase, 
  getExactLunarPhase,
  PlanetaryPositions
} from '@/lib/astrology';
import { calculateTransitAspects, TransitAspect } from '@/lib/transitAspects';
import { PLANET_ESSENCES, HOUSE_MEANINGS, ASPECT_MEANINGS } from '@/lib/detailedInterpretations';
import { signDegreesToLongitude } from '@/lib/houseCalculations';
import { EnhancedPlanetDetails } from './EnhancedPlanetDetails';
import { getDeepAspectInterpretation, getFormattedAspectNarrative } from '@/lib/aspectInterpretationsDeep';

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
    chiron: '⚷', lilith: '⚸', northnode: '☊', ascendant: 'AC', midheaven: 'MC',
    eris: '⯰', sedna: '⯲', makemake: '🜨', haumea: '🜵', quaoar: '🝾',
    orcus: '🝿', ixion: '⯳', varuna: '⯴', pholus: '⯛', nessus: '⯜',
    ceres: '⚳', pallas: '⚴', juno: '⚵', vesta: '⚶', partoffortune: '⊕', vertex: 'Vx'
  };
  return symbols[planet.toLowerCase()] || '';
};

// Get full planet name from key (handles all planets including dwarf planets)
const getPlanetFullName = (planet: string): string => {
  const names: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
    chiron: 'Chiron', lilith: 'Black Moon Lilith', northnode: 'North Node', southnode: 'South Node',
    ascendant: 'Ascendant', midheaven: 'Midheaven', mc: 'Midheaven', ic: 'IC',
    eris: 'Eris', sedna: 'Sedna', makemake: 'Makemake', haumea: 'Haumea', quaoar: 'Quaoar',
    orcus: 'Orcus', ixion: 'Ixion', varuna: 'Varuna', pholus: 'Pholus', nessus: 'Nessus',
    ceres: 'Ceres', pallas: 'Pallas', juno: 'Juno', vesta: 'Vesta',
    partoffortune: 'Part of Fortune', vertex: 'Vertex'
  };
  return names[planet.toLowerCase()] || planet;
};

// Convert sign + degree (+ minutes) to longitude for house calculation
// NOTE: Minutes matter for accurate house placement near cusps.

const signToLongitude = (sign: string, degree: number, minutes: number = 0): number => {
  return signDegreesToLongitude(sign, degree, minutes);
};

const getPlanetHouse = (planetLon: number, houseCusps?: NatalChart['houseCusps']): number | null => {
  if (!houseCusps) return null;

  // Build array of house cusps with longitudes
  const cusps: { house: number; longitude: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof houseCusps;
    const cusp = houseCusps[key];
    if (cusp?.sign) {
      cusps.push({
        house: i,
        longitude: signToLongitude(cusp.sign, cusp.degree, cusp.minutes ?? 0),
      });
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
    aries: "Quick-to-react emotions. When you feel something, you need to DO something about it immediately—waiting or processing makes you restless. You might exercise when upset, speak before thinking, or need to take action to feel better.",
    taurus: "Steady, body-based emotions. You feel safe through physical comfort—good food, soft textures, familiar routines. Change is stressful; you need time to adjust. When upset, you might eat, organize, or retreat to somewhere cozy.",
    gemini: "Emotions that need words. You process feelings by TALKING about them, not sitting in silence. You might call a friend when upset, journal your feelings, or need to understand WHY you feel something before it settles.",
    cancer: "Deep, protective emotions. You absorb others' feelings like a sponge. Home and family are where you feel safest. When threatened, you retreat into your shell. You remember emotional experiences vividly, sometimes for decades.",
    leo: "Emotions that need an audience. You feel things dramatically and need others to acknowledge your feelings. Being ignored or dismissed when emotional feels unbearable. You express feelings openly and might feel hurt if they're not validated.",
    virgo: "Emotions that seek order. You calm anxiety by organizing, cleaning, or problem-solving. Messy environments make you emotionally unsettled. You might struggle to just FEEL without trying to fix or analyze what's happening.",
    libra: "Emotions filtered through others. You often don't know how YOU feel until you talk to someone else. Conflict makes you emotionally uncomfortable. You might suppress your own feelings to keep the peace, then feel resentful later.",
    scorpio: "Intense, all-or-nothing emotions. You feel things at maximum depth—there's no 'sort of' upset for you. You might hide how much you feel, but inside it's volcanic. Trust is everything; betrayal is devastating.",
    sagittarius: "Emotions that need freedom and meaning. You feel restless when stuck in emotional heaviness—you want to find the lesson, see the bigger picture, and MOVE ON. Travel, learning, or adventure can be your emotional reset. Being tied down emotionally feels suffocating.",
    capricorn: "Controlled, private emotions. You might have learned early that feelings are inconvenient or need to be managed. You process internally, rarely breaking down in public. Achievement and structure help you feel emotionally secure.",
    aquarius: "Emotions observed from a distance. You might analyze your feelings rather than drowning in them. Others might see you as 'detached' when really you just process differently. You need space and alone time to emotionally recalibrate.",
    pisces: "Boundless, absorbing emotions. You feel EVERYTHING—your feelings, others' feelings, the mood of the room. Boundaries are hard. You might escape through fantasy, sleep, or creative expression when overwhelmed.",
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
  houseCusps,
  interceptedSigns
}: { 
  planets: NatalChart['planets']; 
  houseCusps?: NatalChart['houseCusps'];
  interceptedSigns?: string[];
}) => {
  const planetOrder = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Lilith'];
  
  // Calculate sun house for sect determination
  const sunData = planets.Sun;
  const sunHouse = sunData?.sign
    ? getPlanetHouse(
        signToLongitude(sunData.sign, sunData.degree, sunData.minutes ?? 0),
        houseCusps
      )
    : null;

  // Core planets that have dignities (exclude points/asteroids)
  const planetsWithDignities = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-secondary/50 to-secondary rounded-lg">
      <h3 className="text-xl font-bold mb-5 text-foreground">
        Your Natal Planets
      </h3>
      
      <div className="grid gap-4">
        {planetOrder.map(planetKey => {
          const planetData = planets[planetKey as keyof typeof planets];
          if (!planetData?.sign) return null;
          
          const planetLon = signToLongitude(
            planetData.sign,
            planetData.degree,
            planetData.minutes ?? 0
          );
          const house = getPlanetHouse(planetLon, houseCusps);
          const planetInfo = PLANET_ESSENCES[planetKey.toLowerCase()];
          const showTechnicalDetails = planetsWithDignities.includes(planetKey);
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
                  <div className="mt-3 p-3 bg-secondary/30 rounded-md border-l-2 border-primary/30">
                    <div className="font-medium text-foreground mb-1">
                      📍 House {house}: {HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].short}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].whatThisMeans || HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].full}
                    </div>
                    <div className="text-xs text-foreground/70">
                      <span className="font-medium">How {planetInfo?.name || planetKey} works here:</span>{' '}
                      {HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].howItShowsUp || 
                       `This planet expresses through ${HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].keywords || HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS].short} themes.`}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Technical Details */}
              {showTechnicalDetails && (
                <EnhancedPlanetDetails
                  planetName={planetKey}
                  planetData={planetData}
                  house={house}
                  sunHouse={sunHouse}
                  houseCusps={houseCusps}
                  allPlanets={planets as Record<string, import('@/hooks/useNatalChart').NatalPlanetPosition>}
                  interceptedSigns={interceptedSigns}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// SIGN RULERS DATABASE
// ============================================================================

const SIGN_RULERS: Record<string, { traditional: string; modern?: string }> = {
  Aries: { traditional: 'Mars' },
  Taurus: { traditional: 'Venus' },
  Gemini: { traditional: 'Mercury' },
  Cancer: { traditional: 'Moon' },
  Leo: { traditional: 'Sun' },
  Virgo: { traditional: 'Mercury' },
  Libra: { traditional: 'Venus' },
  Scorpio: { traditional: 'Mars', modern: 'Pluto' },
  Sagittarius: { traditional: 'Jupiter' },
  Capricorn: { traditional: 'Saturn' },
  Aquarius: { traditional: 'Saturn', modern: 'Uranus' },
  Pisces: { traditional: 'Jupiter', modern: 'Neptune' },
};

const CHART_RULER_INTERPRETATIONS: Record<string, Record<string, string>> = {
  Sun: {
    house1: "Your life path centers on self-expression and personal identity. You lead through sheer presence and radiance.",
    house2: "Your life path centers on building value and resources. Success comes through developing talents and earning.",
    house3: "Your life path centers on communication and learning. You're meant to be a messenger, writer, or teacher.",
    house4: "Your life path centers on home and family. Creating emotional foundations is your life's work.",
    house5: "Your life path centers on creativity and joy. You're here to create, play, and inspire others.",
    house6: "Your life path centers on service and health. Perfecting daily routines and helping others is your calling.",
    house7: "Your life path centers on partnership and relationship. You find yourself through significant others.",
    house8: "Your life path centers on transformation and shared resources. Deep psychological work is your gift.",
    house9: "Your life path centers on expansion and meaning. Teaching, travel, and philosophy define your journey.",
    house10: "Your life path centers on achievement and public role. Career and reputation are primary life themes.",
    house11: "Your life path centers on community and future vision. Groups and humanitarian causes call you.",
    house12: "Your life path centers on spirituality and transcendence. Working behind the scenes or healing is your gift.",
  },
  Moon: {
    house1: "Your life path is deeply emotional and intuitive. Others see your feelings immediately. Nurturing comes naturally.",
    house2: "Your life path involves emotional security through material means. You need financial stability to feel safe.",
    house3: "Your life path involves emotional communication. You process feelings through talking, writing, and learning.",
    house4: "Your life path is deeply rooted in home and family. Creating emotional sanctuary is essential to your wellbeing.",
    house5: "Your life path involves creative emotional expression. Children, art, and romance fulfill your soul.",
    house6: "Your life path involves emotional service. You nurture through practical help and health awareness.",
    house7: "Your life path involves emotional partnership. You need intimate connection to feel whole.",
    house8: "Your life path involves emotional depth and transformation. You process life through crisis and rebirth.",
    house9: "Your life path involves emotional expansion. Travel, philosophy, and meaning-seeking fulfill you.",
    house10: "Your life path involves emotional expression in career. The public sees your nurturing nature.",
    house11: "Your life path involves emotional connection to groups. Community and friendship are essential.",
    house12: "Your life path involves deep emotional privacy. Spiritual solitude and healing are your gifts.",
  },
  Mercury: {
    house1: "Your life path centers on communication and intellect. You're identified by your mind and way of thinking.",
    house2: "Your life path centers on communicating value. You make money through ideas, speaking, or writing.",
    house3: "Your life path is essentially about communication. Writing, teaching, and connecting ideas is your purpose.",
    house4: "Your life path involves intellectual home life. Family discussions and learning at home matter greatly.",
    house5: "Your life path involves creative communication. Writing creatively, games, and playful learning fulfill you.",
    house6: "Your life path involves analytical service. You help through precision, organization, and problem-solving.",
    house7: "Your life path involves intellectual partnerships. You need mental stimulation in close relationships.",
    house8: "Your life path involves deep research and investigation. Psychology, mysteries, and taboo subjects draw you.",
    house9: "Your life path involves higher learning and teaching. Philosophy, travel writing, and broadcasting call you.",
    house10: "Your life path involves public communication. Your career centers on ideas, writing, or speaking.",
    house11: "Your life path involves group communication. Networking, social media, and community organizing suit you.",
    house12: "Your life path involves hidden knowledge. Research, spiritual study, and private writing are your gifts.",
  },
  Venus: {
    house1: "Your life path centers on beauty, charm, and relationship. You're identified by grace and aesthetic sense.",
    house2: "Your life path centers on luxury and value. You attract resources through charm and create beauty.",
    house3: "Your life path involves beautiful communication. Diplomacy, art criticism, and pleasant conversation are gifts.",
    house4: "Your life path involves creating a beautiful home. Family harmony and domestic aesthetics matter deeply.",
    house5: "Your life path involves romantic creativity. Art, love affairs, and joyful pleasure define your journey.",
    house6: "Your life path involves service through beauty. Health, aesthetics, and harmonious work environments call you.",
    house7: "Your life path centers on partnership. Marriage and committed relationships are essential life themes.",
    house8: "Your life path involves deep intimacy and shared values. You transform through love and joint resources.",
    house9: "Your life path involves love of wisdom and travel. Art, philosophy, and cultural exploration fulfill you.",
    house10: "Your life path involves public appreciation. Career in arts, diplomacy, or beauty is indicated.",
    house11: "Your life path involves social connection and ideals. Friendship and group harmony are priorities.",
    house12: "Your life path involves hidden love and spiritual beauty. Artistic solitude and compassion are your gifts.",
  },
  Mars: {
    house1: "Your life path centers on action and courage. You're identified by energy, drive, and assertiveness.",
    house2: "Your life path centers on earning through action. You build value through effort and competitive drive.",
    house3: "Your life path involves aggressive communication. Debate, decisive speech, and mental combat suit you.",
    house4: "Your life path involves action at home. Protecting family and building your base are primary drives.",
    house5: "Your life path involves creative competition. Sports, drama, and passionate pursuit of pleasure call you.",
    house6: "Your life path involves energetic service. Hard work, physical health, and problem-solving are your gifts.",
    house7: "Your life path involves dynamic partnerships. You need active, sometimes competitive, relationships.",
    house8: "Your life path involves transformative action. Crisis management, surgery, or psychology may call you.",
    house9: "Your life path involves adventurous expansion. Travel, crusading for beliefs, and athletic pursuits fulfill you.",
    house10: "Your life path involves ambitious achievement. Leadership, executive action, and public drive define you.",
    house11: "Your life path involves group action. Leading movements and fighting for causes is your calling.",
    house12: "Your life path involves hidden action. Working behind scenes, spiritual warfare, or hidden strength is yours.",
  },
  Jupiter: {
    house1: "Your life path centers on expansion and optimism. You're identified by generosity, wisdom, and big presence.",
    house2: "Your life path centers on abundant resources. You attract wealth through optimism and wise investment.",
    house3: "Your life path involves expansive communication. Teaching, publishing, and inspiring through words call you.",
    house4: "Your life path involves abundant home life. Large family, generous hospitality, and emotional wealth matter.",
    house5: "Your life path involves joyful creativity. Abundant pleasure, children, and creative expansion fulfill you.",
    house6: "Your life path involves generous service. Improving health, systems, and others' lives is your calling.",
    house7: "Your life path involves expansive partnership. Marriage brings growth, luck, and opportunity.",
    house8: "Your life path involves abundant transformation. Inheritance, deep wisdom, and psychological growth are gifts.",
    house9: "Your life path centers on wisdom and expansion. Higher education, travel, and philosophy are essential.",
    house10: "Your life path involves expansive achievement. Public success, leadership, and respected position call you.",
    house11: "Your life path involves expansive community. Humanitarian causes and group leadership suit you.",
    house12: "Your life path involves spiritual expansion. Hidden blessings, retreat, and faith are your treasures.",
  },
  Saturn: {
    house1: "Your life path centers on mastery through discipline. You're identified by seriousness, responsibility, and hard-won wisdom.",
    house2: "Your life path centers on earning through effort. Financial security comes slowly through patient building.",
    house3: "Your life path involves disciplined communication. Serious study, structured thinking, and careful speech matter.",
    house4: "Your life path involves building solid foundations. Family responsibility and home structure are primary lessons.",
    house5: "Your life path involves disciplined creativity. You master arts through practice and learn joy over time.",
    house6: "Your life path involves serious service. Health discipline, work mastery, and systematic improvement are your gifts.",
    house7: "Your life path involves committed partnership. Marriage is serious business; you seek lasting bonds.",
    house8: "Your life path involves mastering transformation. You face mortality, manage resources, and build psychological strength.",
    house9: "Your life path involves structured wisdom. You earn your philosophy through study and careful exploration.",
    house10: "Your life path centers on achievement and authority. Career mastery and earned reputation are essential.",
    house11: "Your life path involves serious community building. Leadership through responsibility and long-term vision.",
    house12: "Your life path involves spiritual discipline. Solitude, retreat, and facing inner fears are your path to wisdom.",
  },
  Uranus: {
    house1: "Your life path centers on individuality and revolution. You're identified by uniqueness, originality, and unpredictability.",
    house2: "Your life path involves unconventional resources. You earn through innovation and value freedom over security.",
    house3: "Your life path involves revolutionary communication. Original ideas, technology, and breakthrough thinking are gifts.",
    house4: "Your life path involves unconventional home life. Your family or living situation breaks traditional molds.",
    house5: "Your life path involves creative innovation. Unique artistic expression and unconventional pleasure call you.",
    house6: "Your life path involves revolutionary service. You improve systems through technology and breakthrough methods.",
    house7: "Your life path involves unconventional partnership. You need freedom in relationship and attract unusual partners.",
    house8: "Your life path involves sudden transformation. Unexpected changes, awakenings, and psychological breakthroughs define you.",
    house9: "Your life path involves revolutionary beliefs. You seek truth through unconventional paths and inspire change.",
    house10: "Your life path involves innovative career. You're known for originality and may have unusual public role.",
    house11: "Your life path centers on group innovation. Technology, community change, and future vision are your calling.",
    house12: "Your life path involves hidden innovation. Spiritual breakthroughs, technology, and unconscious genius are gifts.",
  },
  Neptune: {
    house1: "Your life path centers on spirituality and dreams. You're identified by compassion, imagination, and otherworldly quality.",
    house2: "Your life path involves spiritual resources. You value the intangible and may earn through art or healing.",
    house3: "Your life path involves intuitive communication. Poetry, music, and channeled messages are your gifts.",
    house4: "Your life path involves spiritual home. Your inner sanctuary is essential; family may be idealized or complex.",
    house5: "Your life path involves inspired creativity. Art, music, drama, and romantic fantasy fulfill your soul.",
    house6: "Your life path involves compassionate service. Healing, helping the vulnerable, and intuitive work call you.",
    house7: "Your life path involves spiritual partnership. You seek soulmate connection and may idealize relationships.",
    house8: "Your life path involves mystical transformation. Psychic gifts, transcendent experiences, and surrender are your path.",
    house9: "Your life path involves spiritual seeking. Mysticism, compassionate philosophy, and transcendent travel call you.",
    house10: "Your life path involves inspirational career. Art, healing, or spiritual work defines your public role.",
    house11: "Your life path involves compassionate community. Humanitarian dreams and group idealism are your calling.",
    house12: "Your life path centers on transcendence. Spiritual gifts, artistic solitude, and dissolution of ego are your journey.",
  },
  Pluto: {
    house1: "Your life path centers on transformation and power. You're identified by intensity, depth, and magnetic presence.",
    house2: "Your life path involves transforming resources. You regenerate through material death and rebirth cycles.",
    house3: "Your life path involves powerful communication. You speak with intensity and uncover hidden truths.",
    house4: "Your life path involves deep family transformation. Healing ancestral patterns is your profound work.",
    house5: "Your life path involves creative transformation. Art, drama, and passionate creation are your gifts.",
    house6: "Your life path involves transforming through service. Healing, psychology, and deep systemic change call you.",
    house7: "Your life path involves transformative partnership. Relationships take you to your depths and remake you.",
    house8: "Your life path centers on death and rebirth. Psychology, occult, crisis, and regeneration are your realm.",
    house9: "Your life path involves transforming beliefs. You destroy and rebuild worldviews; truth is your obsession.",
    house10: "Your life path involves powerful public role. You transform institutions and hold significant influence.",
    house11: "Your life path involves transforming groups. You empower movements and bring depth to community.",
    house12: "Your life path involves deep unconscious work. Hidden power, spiritual transformation, and shadow work are yours.",
  },
};

// ============================================================================
// CHART RULER SECTION
// ============================================================================

const ChartRulerSection = ({ 
  natalChart 
}: { 
  natalChart: NatalChart;
}) => {
  // Get Ascendant sign from house1 cusp
  const ascendantCusp = natalChart.houseCusps?.house1;
  if (!ascendantCusp?.sign) return null;
  
  const ascendantSign = ascendantCusp.sign;
  const ruler = SIGN_RULERS[ascendantSign];
  if (!ruler) return null;
  
  const rulerPlanet = ruler.modern || ruler.traditional;
  const traditionalRuler = ruler.traditional;
  const hasModernRuler = ruler.modern && ruler.modern !== ruler.traditional;
  
  // Get the ruler's placement
  const rulerData = natalChart.planets[rulerPlanet as keyof typeof natalChart.planets];
  const traditionalRulerData = hasModernRuler 
    ? natalChart.planets[traditionalRuler as keyof typeof natalChart.planets] 
    : null;
  
  if (!rulerData?.sign) return null;
  
  const rulerLon = signToLongitude(rulerData.sign, rulerData.degree);
  const rulerHouse = getPlanetHouse(rulerLon, natalChart.houseCusps);
  
  const traditionalRulerHouse = traditionalRulerData?.sign
    ? getPlanetHouse(signToLongitude(traditionalRulerData.sign, traditionalRulerData.degree), natalChart.houseCusps)
    : null;
  
  const getHouseInterpretation = (planet: string, house: number | null): string => {
    if (!house) return '';
    const houseKey = `house${house}` as keyof typeof CHART_RULER_INTERPRETATIONS['Sun'];
    return CHART_RULER_INTERPRETATIONS[planet]?.[houseKey] || 
      `Your chart ruler in the ${house}${getOrdinal(house)} house brings themes of ${HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS]?.short || 'this area'} to the forefront of your life path.`;
  };
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-lg border-2 border-purple-500/50">
      <h3 className="text-xl font-bold mb-5 text-purple-800 dark:text-purple-300">
        👑 Your Chart Ruler
      </h3>
      
      <div className="p-5 bg-background/95 rounded-lg mb-4">
        <div className="text-sm text-muted-foreground mb-2">
          Your Ascendant is in <span className="font-bold text-foreground">{ascendantSign}</span>
          {hasModernRuler && (
            <span> (Modern ruler: {rulerPlanet}, Traditional: {traditionalRuler})</span>
          )}
        </div>
        
        <div className="text-lg font-bold mb-3 text-purple-800 dark:text-purple-300">
          {getSymbol(rulerPlanet)} {rulerPlanet} in {rulerData.degree}° {rulerData.sign}
          {rulerHouse && ` • ${rulerHouse}${getOrdinal(rulerHouse)} House`}
          {rulerData.isRetrograde && ' ℞'}
        </div>
        
        <div className="text-sm leading-relaxed text-foreground mb-3">
          <strong>What this means:</strong> Your chart ruler is the planet that guides your entire life journey. 
          It's like the captain of your ship, steering everything toward its themes.
        </div>
        
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded border-l-4 border-purple-500">
          <div className="text-sm leading-relaxed text-foreground">
            {getHouseInterpretation(rulerPlanet, rulerHouse)}
          </div>
          <div className="mt-2 text-sm text-muted-foreground italic">
            {getSignExpression(rulerPlanet, rulerData.sign)}
          </div>
        </div>
      </div>
      
      {hasModernRuler && traditionalRulerData?.sign && traditionalRulerHouse && (
        <div className="p-4 bg-background/80 rounded-lg">
          <div className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">
            Traditional Ruler: {getSymbol(traditionalRuler)} {traditionalRuler} in {traditionalRulerData.degree}° {traditionalRulerData.sign}
            {traditionalRulerHouse && ` • ${traditionalRulerHouse}${getOrdinal(traditionalRulerHouse)} House`}
          </div>
          <div className="text-sm text-muted-foreground">
            {getHouseInterpretation(traditionalRuler, traditionalRulerHouse)}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NATAL ASPECTS SECTION
// ============================================================================

interface NatalAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  symbol: string;
  orb: number;
  degree1: number;
  sign1: string;
  degree2: number;
  sign2: string;
  color: string;
  interpretation: string;
  hasDeepInterp?: boolean; // Indicates rich teaching interpretation available
}

const NATAL_ASPECT_INTERPRETATIONS: Record<string, Record<string, string>> = {
  'Sun-Moon': {
    conjunction: "Your identity and emotions are fused. You're whole within yourself, what you want and what you need are aligned. Strong self-awareness.",
    opposition: "Inner tension between who you are and what you feel. Your will and emotions pull in different directions. Learning to balance both is your work.",
    trine: "Natural harmony between identity and emotions. You feel at ease with yourself. What you want flows naturally from what you need.",
    sextile: "Your identity and emotions support each other with some effort. Opportunities come when you align head and heart.",
    square: "Friction between will and feelings. Internal tension drives growth. You must learn to honor both your purpose and your needs.",
  },
  'Sun-Mercury': {
    conjunction: "Mind and identity are fused. You think as you are. Strong mental focus, but may struggle to see other perspectives.",
  },
  'Sun-Venus': {
    conjunction: "Identity infused with charm and beauty. You naturally attract. Love and self-expression are intertwined.",
    opposition: "Your sense of self may depend on others' love. Learning to value yourself independently is key.",
    trine: "Natural grace and attractiveness. Love flows easily. You have artistic gifts and social ease.",
    sextile: "Creative potential that requires cultivation. Charm emerges when you make effort to connect.",
    square: "Tension between what you want and what you value. Love life may challenge your identity. Growth through relationship friction.",
  },
  'Sun-Mars': {
    conjunction: "Identity fused with action and drive. High energy, competitive nature. You are what you do.",
    opposition: "Conflict between self and action. Others may challenge your will. Learning to assert without aggression.",
    trine: "Natural vitality and courage. Action supports identity. You accomplish what you set out to do.",
    sextile: "Energy available when you direct it. Leadership potential that requires initiative.",
    square: "Friction between will and action creates drive but also conflict. Anger management may be a theme. Powerful when channeled.",
  },
  'Sun-Jupiter': {
    conjunction: "Expansive identity. Natural optimism and generosity. You see big possibilities and inspire others.",
    opposition: "Balance needed between ego and expansion. May promise more than you deliver. Growth through moderation.",
    trine: "Natural luck and abundance. Opportunities flow. Faith in life supports your purpose.",
    sextile: "Growth available through effort. Teaching and learning expand your identity.",
    square: "Overconfidence or excess may challenge you. Big dreams meet reality. Growth through right-sizing expectations.",
  },
  'Sun-Saturn': {
    conjunction: "Serious, disciplined identity. Responsibility came early. You earn everything through hard work.",
    opposition: "Authority figures challenge your sense of self. Learning to claim your own authority is key.",
    trine: "Natural discipline supports identity. You achieve through patience. Wisdom comes with age.",
    sextile: "Structure available when you apply effort. Mentors help you grow.",
    square: "Tension between freedom and responsibility. Father issues or authority struggles. Maturity comes through facing limitations.",
  },
  'Sun-Uranus': {
    conjunction: "Unique, rebellious identity. You must be authentic above all. Sudden changes define your path.",
    opposition: "Others see you as unusual or disruptive. Finding community that accepts your uniqueness is key.",
    trine: "Natural originality. Innovation comes easily. You inspire change without trying.",
    sextile: "Breakthrough potential when you take initiative. Technology and new ideas support your purpose.",
    square: "Tension between fitting in and being yourself. Sudden disruptions wake you up. Freedom is non-negotiable.",
  },
  'Sun-Neptune': {
    conjunction: "Dreamy, spiritual identity. Strong imagination but may struggle with boundaries. Artist or healer potential.",
    opposition: "Confusion about who you are vs. who you imagine. Disillusionment teaches discernment.",
    trine: "Natural artistic and spiritual gifts. Imagination enhances identity. Compassion flows.",
    sextile: "Creative inspiration available through receptivity. Spiritual growth supports purpose.",
    square: "Illusion vs. reality in self-image. May escape rather than face self. Art and spirituality channel this tension.",
  },
  'Sun-Pluto': {
    conjunction: "Intense, powerful identity. You transform everything you touch. Control issues may arise. Magnetic presence.",
    opposition: "Power struggles with others mirror internal power issues. Learning to transform without controlling.",
    trine: "Natural psychological depth. You regenerate easily. Power used constructively.",
    sextile: "Transformation available through effort. Research and depth work support your purpose.",
    square: "Intense inner tension drives transformation. Power and ego clash. Crisis leads to rebirth.",
  },
  'Moon-Mercury': {
    conjunction: "Mind and emotions fused. You think about feelings and feel about thoughts. Strong emotional intelligence.",
    opposition: "Logic vs. feelings. Your head and heart disagree. Learning to honor both perspectives.",
    trine: "Natural ability to communicate feelings. Emotional intelligence flows easily.",
    sextile: "Can express emotions with some effort. Writing about feelings helps process them.",
    square: "Tension between what you think and what you feel. Anxiety may arise. Growth through integrating mind and heart.",
  },
  'Moon-Venus': {
    conjunction: "Emotional warmth and charm. Love and nurturing are intertwined. Strong need for affection.",
    opposition: "What you need vs. what you want in love may conflict. Learning self-care alongside care for others.",
    trine: "Natural emotional grace. Love flows easily. Artistic sensibility and social ease.",
    sextile: "Affection available when you reach out. Beauty soothes your emotions.",
    square: "Emotional needs and desires create friction. May overindulge or feel unloved. Self-worth work needed.",
  },
  'Moon-Mars': {
    conjunction: "Passionate emotions. Quick to react, protective instincts strong. May struggle with anger.",
    opposition: "Feelings and actions may conflict. Others trigger your emotions. Learning emotional self-defense.",
    trine: "Emotional courage. You act on feelings constructively. Protective nature.",
    sextile: "Can defend emotional boundaries with effort. Action soothes anxiety.",
    square: "Emotional volatility. Quick temper or suppressed anger. Physical exercise helps process feelings.",
  },
  'Moon-Jupiter': {
    conjunction: "Generous emotions. Natural optimism and emotional abundance. May feel everything big.",
    opposition: "Emotional excess meets need for moderation. Learning emotional boundaries.",
    trine: "Emotional well-being and faith. Nurturing nature brings luck. Generous heart.",
    sextile: "Growth through emotional openness. Faith supports emotional security.",
    square: "Emotional over-expansion. May promise more care than you can give. Learning emotional honesty.",
  },
  'Moon-Saturn': {
    conjunction: "Serious emotions. Emotional maturity or childhood burdens. Learning to feel without restriction.",
    opposition: "Cold vs. warm. Responsibility dampens emotions. Mother/father issues may arise.",
    trine: "Emotional stability and maturity. Feelings are steady and reliable. Wisdom about emotional needs.",
    sextile: "Can build emotional security with effort. Patience in emotional matters.",
    square: "Emotional restriction or depression patterns. Fear of vulnerability. Healing through accepting feelings.",
  },
  'Moon-Uranus': {
    conjunction: "Unpredictable emotions. Need for emotional freedom. Unusual relationship with mother or home.",
    opposition: "Emotional disruption from others. Sudden changes in feelings. Learning emotional independence.",
    trine: "Emotional originality. You feel differently than others and that's okay. Intuitive breakthroughs.",
    sextile: "Emotional insights through new experiences. Change refreshes your feelings.",
    square: "Emotional instability or restlessness. Need for freedom conflicts with need for security. Finding unconventional comfort.",
  },
  'Moon-Neptune': {
    conjunction: "Deeply sensitive emotions. Psychic impressions, artistic feelings. May absorb others' emotions.",
    opposition: "Emotional confusion or idealization. Boundaries between self and others blur. Learning discernment.",
    trine: "Natural emotional intuition. Artistic sensitivity. Compassionate nature.",
    sextile: "Spiritual feelings available through receptivity. Dreams carry emotional messages.",
    square: "Emotional confusion or escapism. May lose yourself in others' feelings. Healing through grounding practices.",
  },
  'Moon-Pluto': {
    conjunction: "Intense emotional nature. Deep feelings, may be overwhelming. Powerful intuition.",
    opposition: "Power struggles in close relationships. Others trigger deep feelings. Learning emotional empowerment.",
    trine: "Emotional power and resilience. You transform through feelings. Psychological insight.",
    sextile: "Emotional transformation available through effort. Deep connections support healing.",
    square: "Emotional intensity creates crisis and growth. Control issues in nurturing. Learning to release.",
  },
  'Venus-Mars': {
    conjunction: "Passion and attraction fused. Strong romantic and creative drive. You attract what you want.",
    opposition: "Love and desire may conflict. Push-pull in relationships. Learning to balance give and take.",
    trine: "Natural charm and sexual magnetism. Love and action harmonize. Artistic and romantic gifts.",
    sextile: "Can attract through effort. Romance blossoms when you take initiative.",
    square: "Tension between love and lust. Relationship friction drives growth. Passion through challenge.",
  },
  'Venus-Jupiter': {
    conjunction: "Abundant love and pleasure. Natural generosity and social grace. May overindulge.",
    opposition: "Love excess meets reality. May give too much or expect too much. Learning balanced generosity.",
    trine: "Natural luck in love and money. Grace and abundance flow. Social blessings.",
    sextile: "Growth in relationships through effort. Expanding what you value.",
    square: "Excess in pleasure or spending. Relationships may be dramatic. Learning moderation in love.",
  },
  'Venus-Saturn': {
    conjunction: "Serious about love. Commitment matters deeply. May fear rejection or love slowly.",
    opposition: "Love meets duty. Relationships carry responsibility. Learning to love without conditions.",
    trine: "Loyal, lasting love. You build relationships that endure. Practical approach to beauty.",
    sextile: "Stable relationships available through effort. Time improves your love life.",
    square: "Fear of rejection or unworthiness in love. Cold shoulder or delayed gratification. Earning love through patience.",
  },
  'Venus-Uranus': {
    conjunction: "Unusual tastes in love. Attracted to the unconventional. Sudden attractions and changes.",
    opposition: "Freedom vs. commitment in love. Others may be unpredictable. Learning to balance independence and intimacy.",
    trine: "Original approach to love and beauty. Attracts interesting people. Creative breakthroughs.",
    sextile: "Refreshing love life through trying new things. Innovation in relationships.",
    square: "Relationship instability or boredom with convention. Need for excitement may disrupt love. Finding freedom within commitment.",
  },
  'Venus-Neptune': {
    conjunction: "Romantic idealism. Artistic and spiritual love. May idealize partners or be disillusioned.",
    opposition: "Ideal vs. real in love. May project fantasies onto partners. Learning to love the real person.",
    trine: "Natural romantic and artistic gifts. Love feels spiritual. Compassionate in relationships.",
    sextile: "Creative inspiration in love through openness. Art and romance intertwine.",
    square: "Disillusionment in love. May escape into fantasy or addiction. Learning discernment in relationships.",
  },
  'Venus-Pluto': {
    conjunction: "Intense love nature. Obsessive attractions. You love deeply and transformatively.",
    opposition: "Power struggles in love. Others trigger your deepest desires. Learning to love without controlling.",
    trine: "Magnetic attraction. Love transforms you positively. Deep, loyal connections.",
    sextile: "Transformation available through love relationships. Depth in intimacy.",
    square: "Jealousy, possessiveness, or power games in love. Intense attractions. Learning healthy attachment.",
  },
  'Mars-Jupiter': {
    conjunction: "Expansive energy and ambition. Enthusiasm and courage combine. May overextend.",
    opposition: "Action vs. expansion. May promise more than you deliver. Learning right-sized action.",
    trine: "Lucky action. Efforts succeed naturally. Athletic or adventurous gifts.",
    sextile: "Growth through initiative. Taking action brings opportunities.",
    square: "Excess energy or over-ambition. May take on too much. Learning focused effort.",
  },
  'Mars-Saturn': {
    conjunction: "Controlled energy. Disciplined action but may be frustrated or harsh. Endurance.",
    opposition: "Drive meets limitation. Authority may block your efforts. Learning patient assertion.",
    trine: "Disciplined energy. You accomplish through steady effort. Strategic action.",
    sextile: "Structured action available through persistence. Building slowly pays off.",
    square: "Frustrated energy or anger at restrictions. Stop-start patterns. Learning to work within limits.",
  },
  'Mars-Uranus': {
    conjunction: "Electric, unpredictable energy. Sudden actions, original approach. May be accident-prone.",
    opposition: "Others disrupt your plans. Unexpected conflicts. Learning flexible action.",
    trine: "Original, innovative action. You act on inspiration. Breakthrough energy.",
    sextile: "Innovative action available through initiative. Technology supports your efforts.",
    square: "Explosive energy or recklessness. Sudden disruptions to plans. Learning to channel intensity.",
  },
  'Mars-Neptune': {
    conjunction: "Inspired or confused action. May act on dreams or ideals. Creative but sometimes unfocused.",
    opposition: "Action vs. surrender. Energy may dissipate or be misdirected. Learning to act with faith.",
    trine: "Inspired action. You act on intuition successfully. Spiritual warrior energy.",
    sextile: "Creative action through sensitivity. Art and spirituality motivate effort.",
    square: "Confused action or escapism. May avoid conflict or act deceptively. Learning direct action.",
  },
  'Mars-Pluto': {
    conjunction: "Powerful, intense energy. Volcanic drive. You accomplish through sheer will. Control issues possible.",
    opposition: "Power struggles with others. Your drive triggers confrontation. Learning empowered action.",
    trine: "Powerful, strategic action. You regenerate through effort. Accomplishing transformation.",
    sextile: "Transformative action available through effort. Research and investigation support goals.",
    square: "Intense power struggles or compulsive drive. Learning to channel plutonian intensity constructively.",
  },
  'Jupiter-Saturn': {
    conjunction: "Expansion meets restriction. You grow through discipline. Major cycle begins.",
    opposition: "Growth vs. limitation. Faith tested by reality. Learning balanced manifestation.",
    trine: "Growth within structure. You expand wisely and build lasting success.",
    sextile: "Structured growth available through effort. Mentors support your expansion.",
    square: "Tension between hope and fear, growth and limits. Learning to dream realistically.",
  },
  'Saturn-Uranus': {
    conjunction: "Structure meets revolution. You bring order to chaos or break outdated structures.",
    opposition: "Tradition vs. progress. Tension between old and new in your life.",
    trine: "Progressive stability. You reform systems effectively. Innovation within structure.",
    sextile: "Reform possible through patient effort. Technology and tradition can coexist.",
    square: "Tension between security and freedom. Sudden breaks from structure. Revolutionary patience needed.",
  },
  'Saturn-Neptune': {
    conjunction: "Dreams meet reality. Practical spirituality or disillusionment. Building visions.",
    opposition: "Reality vs. fantasy. Faith tested by limitations. Learning grounded transcendence.",
    trine: "Practical imagination. You manifest dreams through discipline. Spiritual maturity.",
    sextile: "Creative discipline available through effort. Art and spirituality need structure.",
    square: "Confusion about reality. Dreams may be blocked or unrealistic. Learning to dream within limits.",
  },
  'Saturn-Pluto': {
    conjunction: "Power structures transform. Major life restructuring. Confronting limitations head-on.",
    opposition: "Power vs. authority. External forces may crush or empower. Learning to rebuild.",
    trine: "Powerful discipline. You transform through patient effort. Lasting structural change.",
    sextile: "Transformation available through discipline. Research and depth work support building.",
    square: "Intense structural pressure. Things break down to rebuild. Learning to release control.",
  },
  'Uranus-Neptune': {
    conjunction: "Generation mark: spiritual revolution. New age consciousness. Inspired idealism.",
    opposition: "Collective awakening vs. dissolution. Generational spiritual crisis and growth.",
    trine: "Generational spiritual gifts. Intuition and innovation combine naturally.",
    sextile: "Spiritual innovation available through effort. Art and technology merge.",
    square: "Collective tension between change and transcendence. Generational confusion seeking clarity.",
  },
  'Uranus-Pluto': {
    conjunction: "Generation mark: revolutionary transformation. Radical change in collective power structures.",
    opposition: "Collective power awakening. Generational conflict between old and new power.",
    trine: "Generational transformative innovation. Change comes through evolution not revolution.",
    sextile: "Transformation through innovation available. Technology empowers change.",
    square: "Intense generational pressure for change. Revolutionary transformation. Breaking and rebuilding.",
  },
  'Neptune-Pluto': {
    conjunction: "Generation mark: spiritual transformation. Very long cycle affecting collective unconscious.",
    sextile: "Current generational aspect: spiritual transformation supports collective evolution. Death and rebirth of beliefs.",
  },
};

const calculateNatalAspects = (planets: NatalChart['planets']): NatalAspect[] => {
  const aspects: NatalAspect[] = [];
  const planetKeys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 8, symbol: '☌', color: '#9b87f5' },
    { name: 'opposition', angle: 180, orb: 8, symbol: '☍', color: '#ea384c' },
    { name: 'trine', angle: 120, orb: 8, symbol: '△', color: '#22c55e' },
    { name: 'square', angle: 90, orb: 7, symbol: '□', color: '#f97316' },
    { name: 'sextile', angle: 60, orb: 6, symbol: '⚹', color: '#0ea5e9' },
  ];
  
  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const planet1Key = planetKeys[i];
      const planet2Key = planetKeys[j];
      const planet1 = planets[planet1Key as keyof typeof planets];
      const planet2 = planets[planet2Key as keyof typeof planets];
      
      if (!planet1?.sign || !planet2?.sign) continue;
      
      const lon1 = signToLongitude(planet1.sign, planet1.degree);
      const lon2 = signToLongitude(planet2.sign, planet2.degree);
      
      let diff = Math.abs(lon1 - lon2);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspectType of aspectTypes) {
        const orbValue = Math.abs(diff - aspectType.angle);
        if (orbValue <= aspectType.orb) {
          // Try deep interpretation first, then fall back to original
          const deepInterp = getDeepAspectInterpretation(planet1Key, planet2Key, aspectType.name);
          
          let interpretation: string;
          if (deepInterp) {
            // Use the rich, teaching-quality interpretation
            interpretation = getFormattedAspectNarrative(planet1Key, planet2Key, aspectType.name, planet1.sign, planet2.sign);
          } else {
            // Fall back to original interpretations
            const pairKey = `${planet1Key}-${planet2Key}`;
            const reversePairKey = `${planet2Key}-${planet1Key}`;
            const interps = NATAL_ASPECT_INTERPRETATIONS[pairKey] || NATAL_ASPECT_INTERPRETATIONS[reversePairKey] || {};
            interpretation = interps[aspectType.name] || 
              `${planet1Key} ${aspectType.name} ${planet2Key}: These planetary energies ${aspectType.name === 'conjunction' ? 'merge and amplify each other' : aspectType.name === 'opposition' ? 'create tension and awareness' : aspectType.name === 'trine' ? 'flow harmoniously together' : aspectType.name === 'square' ? 'create friction that drives growth' : 'offer opportunities when engaged'}.`;
          }
          
          aspects.push({
            planet1: planet1Key,
            planet2: planet2Key,
            aspect: aspectType.name,
            symbol: aspectType.symbol,
            orb: Math.round(orbValue * 10) / 10,
            degree1: planet1.degree,
            sign1: planet1.sign,
            degree2: planet2.degree,
            sign2: planet2.sign,
            color: aspectType.color,
            interpretation,
            hasDeepInterp: !!deepInterp, // Track if we have a deep interpretation
          });
          break;
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb);
};

const NatalAspectsSection = ({ 
  natalChart 
}: { 
  natalChart: NatalChart;
}) => {
  const aspects = calculateNatalAspects(natalChart.planets);
  
  if (aspects.length === 0) return null;
  
  // Group by aspect type
  const grouped: Record<string, NatalAspect[]> = {};
  aspects.forEach(a => {
    if (!grouped[a.aspect]) grouped[a.aspect] = [];
    grouped[a.aspect].push(a);
  });
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 rounded-lg border-2 border-rose-500/50">
      <h3 className="text-xl font-bold mb-2 text-rose-800 dark:text-rose-300">
        🔗 Your Natal Aspects
      </h3>
      <div className="text-sm text-rose-700 dark:text-rose-400 mb-5 italic">
        Internal dynamics between your natal planets — these are lifelong patterns
      </div>
      
      <div className="flex flex-col gap-4">
        {aspects.map((aspect, i) => (
          <div 
            key={i} 
            className={`p-4 bg-background/95 rounded-lg ${aspect.hasDeepInterp ? 'ring-1 ring-primary/20' : ''}`}
            style={{ borderLeft: `4px solid ${aspect.color}` }}
          >
            <div 
              className="text-base font-bold mb-2 flex items-center gap-2 flex-wrap"
              style={{ color: aspect.color }}
            >
              <span>{getSymbol(aspect.planet1)}{aspect.symbol}{getSymbol(aspect.planet2)}</span>
              <span>{aspect.planet1} ({aspect.degree1}° {aspect.sign1})</span>
              <span className="text-foreground capitalize">{aspect.aspect}</span>
              <span>{aspect.planet2} ({aspect.degree2}° {aspect.sign2})</span>
              <span className="text-xs text-muted-foreground">Orb: {aspect.orb}°</span>
              {aspect.hasDeepInterp && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  Deep Analysis
                </span>
              )}
            </div>
            
            {aspect.hasDeepInterp ? (
              <div className="text-sm leading-relaxed space-y-3 text-foreground/90">
                {aspect.interpretation.split('\n\n').map((paragraph, pi) => (
                  <div key={pi}>
                    {paragraph.startsWith('**') ? (
                      <div className="space-y-1">
                        {paragraph.split('**').map((part, partIdx) => {
                          if (partIdx % 2 === 1) {
                            // Bold header
                            return <span key={partIdx} className="font-semibold text-foreground">{part}</span>;
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </div>
                    ) : (
                      <p>{paragraph}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm leading-relaxed text-foreground/80">
                {aspect.interpretation}
              </div>
            )}
          </div>
        ))}
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
            const fullName = natalPlanetInfo?.name || getPlanetFullName(natalPlanet);
            const essence = natalPlanetInfo?.essence || `Your ${fullName} is activated.`;
            
            return (
              <div key={natalPlanet} className="p-5 bg-background/95 rounded-lg shadow">
                <div className="text-lg font-bold mb-3 text-green-800 dark:text-green-300">
                  Transits to Your Natal {getSymbol(natalPlanet)} {fullName}
                  {natalData && (
                    <span className="text-sm font-normal text-muted-foreground ml-3">
                      ({natalData.degree}° {natalData.sign})
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-foreground mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                  <strong>Your Natal {fullName}:</strong> {essence}
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
      
      {/* Chart Ruler */}
      <ChartRulerSection natalChart={natalChart} />
      
      {/* Natal Planets Summary */}
      <NatalPlanetsSummary planets={natalChart.planets} houseCusps={natalChart.houseCusps} interceptedSigns={natalChart.interceptedSigns} />
      
      {/* Natal Aspects */}
      <NatalAspectsSection natalChart={natalChart} />
      
      {/* Current Transits Affecting You */}
      <CurrentTransitsReport natalChart={natalChart} currentDate={currentDate} />
      
      {/* Lunar Cycle Context */}
      <LunarCycleContext currentDate={currentDate} natalChart={natalChart} />
      
      {/* Patterns & Timing */}
      <PatternsAndTiming natalChart={natalChart} currentDate={currentDate} />
    </div>
  );
};
