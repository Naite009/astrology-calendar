import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { NatalPlanetPosition } from '@/hooks/useNatalChart';
import {
  PLANET_DIGNITIES,
  SIGN_PROPERTIES,
  HOUSE_TYPES,
  TRIPLICITY_RULERS,
  AVERAGE_SPEEDS,
  SATURN_SYMBOLS,
  getElementSymbol,
  getDecanName,
  getTermRuler,
  getDecanRuler,
  getDignityStatus,
  getSectStatus,
  getHousesRuled,
  calculateDeclination
} from '@/lib/planetDignities';

// Educational content for each topic
const LEARN_MORE_CONTENT: Record<string, string> = {
  position: "The exact degree and sign placement of a planet determines its expression. Each degree has unique symbolism, and the sign colors how the planet's energy manifests in your life.",
  element: "Elements represent fundamental energies: Fire (inspiration, action), Earth (practicality, material), Air (intellect, communication), and Water (emotion, intuition). Your planet expresses through this elemental lens.",
  mode: "Modes show how energy moves: Cardinal signs initiate and lead, Fixed signs stabilize and persist, Mutable signs adapt and transform. This affects how your planet takes action.",
  angularity: "Angular houses (1, 4, 7, 10) are most prominent and visible. Succedent houses (2, 5, 8, 11) build and sustain. Cadent houses (3, 6, 9, 12) process and distribute energy.",
  motion: "Direct motion is forward movement through the zodiac. Retrograde (℞) appears backward from Earth's view, turning the planet's energy inward for reflection, review, and internalization.",
  speed: "Planetary speed indicates how quickly themes manifest. Faster planets bring rapid changes; slower planets indicate long-term processes. Retrograde planets move more slowly or appear stationary.",
  dignities: "Essential dignity measures a planet's strength by sign. In Rulership or Exaltation, planets express easily. In Detriment or Fall, they face challenges. Peregrine planets have neutral placement.",
  dispositor: "The dispositor is the planet ruling the sign your planet occupies. It 'hosts' your planet and influences how it expresses. Following the dispositor chain reveals your chart's energy flow.",
  triplicities: "Triplicity rulers are secondary dignities based on element. Day charts use the day ruler; night charts use the night ruler. The participating ruler offers additional support.",
  terms: "Terms (or bounds) divide each sign into five unequal segments, each ruled by a planet. The Egyptian/Ptolemaic terms give subtle influence based on exact degree placement.",
  decans: "Each sign is divided into three 10° segments called decans or faces. The decan ruler adds a secondary planetary influence to your planet's expression.",
  houseRulerships: "The houses a planet rules show areas of life connected to that planet's themes. The ruler brings its sign's energy to those house matters.",
  sect: "Sect divides planets into day (Sun, Jupiter, Saturn) and night (Moon, Venus, Mars) teams. Planets 'in sect' (matching chart type) function more harmoniously.",
  declination: "Declination measures a planet's distance north or south of the celestial equator. Planets at similar declinations form parallel aspects, creating hidden connections.",
  saturnSymbol: "Saturn's placement by sign carries special archetypal meaning about your karmic lessons, where you face tests, and how you build mastery through discipline and time."
};

interface DetailRowProps {
  label: string;
  value: string;
  description?: string;
  learnMoreKey?: string;
}

const DetailRow = ({ label, value, description, learnMoreKey }: DetailRowProps) => {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const learnMoreContent = learnMoreKey ? LEARN_MORE_CONTENT[learnMoreKey] : null;

  return (
    <div className="py-3 border-b border-border/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground mb-0.5">
            {label}
          </div>
          <div className="text-sm text-foreground/80">
            {value}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5 italic">
              {description}
            </div>
          )}
        </div>
        {learnMoreContent && (
          <button
            onClick={() => setShowLearnMore(!showLearnMore)}
            className="text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Info size={10} />
            {showLearnMore ? 'Hide' : 'Learn More'}
          </button>
        )}
      </div>
      {showLearnMore && learnMoreContent && (
        <div className="mt-2 p-2 bg-primary/5 rounded text-xs text-foreground/70 leading-relaxed border-l-2 border-primary/30">
          {learnMoreContent}
        </div>
      )}
    </div>
  );
};

interface EnhancedPlanetDetailsProps {
  planetName: string;
  planetData: NatalPlanetPosition;
  house: number | null;
  sunHouse?: number | null;
  houseCusps?: Record<string, { sign: string; degree: number; minutes?: number }>;
}

export const EnhancedPlanetDetails = ({
  planetName,
  planetData,
  house,
  sunHouse,
  houseCusps
}: EnhancedPlanetDetailsProps) => {
  const [expanded, setExpanded] = useState(false);

  const sign = planetData.sign;
  const degree = planetData.degree;
  const isRetrograde = planetData.isRetrograde;

  // Get sign properties
  const signProps = SIGN_PROPERTIES[sign];
  if (!signProps) return null;

  // Get house type
  const houseType = house ? HOUSE_TYPES[house] : null;

  // Get dignities
  const dignities = PLANET_DIGNITIES[planetName];
  const dignityStatus = getDignityStatus(planetName, sign);

  // Get dispositor (ruler of the sign)
  const dispositor = signProps.ruler;

  // Get triplicity rulers
  const triplicityRulers = TRIPLICITY_RULERS[signProps.element];

  // Get decan ruler
  const decanIndex = Math.min(2, Math.floor(degree / 10));
  const decanRuler = getDecanRuler(sign, degree);

  // Get term ruler
  const termRuler = getTermRuler(sign, degree);

  // Calculate speed with retrograde consideration
  const baseSpeed = AVERAGE_SPEEDS[planetName] || 'Unknown';
  const speed = isRetrograde ? `-${baseSpeed}` : `+${baseSpeed}`;

  // Determine if day chart (Sun above horizon = houses 7-12)
  const isDayChart = sunHouse ? sunHouse >= 7 : null;

  // Get sect status
  const sectInfo = getSectStatus(planetName, sunHouse || null, isDayChart);

  // Get houses ruled
  const housesRuled = getHousesRuled(planetName, houseCusps);

  // Get declination
  const declination = calculateDeclination(sign, degree);

  // Saturn symbol (only for Saturn)
  const saturnSymbol = planetName === 'Saturn' ? SATURN_SYMBOLS[sign] : null;

  return (
    <div className="mt-3">
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 hover:bg-secondary rounded text-xs font-medium text-foreground/80 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          🔍 View Technical Details
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Technical Details */}
      {expanded && (
        <div className="mt-3 p-4 bg-secondary/30 rounded-md space-y-0">
          {/* Position & Movement Section */}
          <div className="pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Position & Movement
            </h4>
          </div>

          <DetailRow
            label="Position"
            value={`${degree}° ${sign}`}
            learnMoreKey="position"
          />

          <DetailRow
            label="Element"
            value={`${getElementSymbol(signProps.element)} ${signProps.element}`}
            learnMoreKey="element"
          />

          <DetailRow
            label="Mode"
            value={signProps.mode}
            learnMoreKey="mode"
          />

          {houseType && (
            <DetailRow
              label="Angularity"
              value={houseType}
              description={`${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house is ${houseType.toLowerCase()}`}
              learnMoreKey="angularity"
            />
          )}

          <DetailRow
            label="Motion"
            value={isRetrograde ? `Retrograde ℞` : 'Direct'}
            description={isRetrograde ? "Planet appears to move backward from Earth's perspective" : 'Planet moving forward in normal direction'}
            learnMoreKey="motion"
          />

          <DetailRow
            label="Speed"
            value={speed}
            learnMoreKey="speed"
          />

          {/* Dignity Status Section */}
          {dignities && (
            <>
              <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                  Dignity Status
                </h4>
              </div>

              <DignityBox 
                dignityStatus={dignityStatus} 
                dignities={dignities} 
              />
            </>
          )}

          {/* Rulership Chain Section */}
          <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Rulership Chain
            </h4>
          </div>

          <DetailRow
            label="Dispositor"
            value={dispositor}
            description={`${sign} is ruled by ${dispositor}`}
            learnMoreKey="dispositor"
          />

          {triplicityRulers && (
            <DetailRow
              label="Triplicity Rulers"
              value={`${triplicityRulers.day}, ${triplicityRulers.night}, ${triplicityRulers.participating}`}
              description={`Day: ${triplicityRulers.day} | Night: ${triplicityRulers.night} | Participating: ${triplicityRulers.participating}`}
              learnMoreKey="triplicities"
            />
          )}

          <DetailRow
            label="Term Ruler"
            value={termRuler}
            description={`Egyptian/Ptolemaic terms for ${degree}° ${sign}`}
            learnMoreKey="terms"
          />

          <DetailRow
            label="Decan Ruler"
            value={decanRuler}
            description={`${degree}° is in the ${getDecanName(decanIndex)} decan (${decanIndex * 10}°-${(decanIndex + 1) * 10}°)`}
            learnMoreKey="decans"
          />

          <DetailRow
            label="Houses Ruled"
            value={housesRuled}
            description="Houses where this planet is the traditional ruler"
            learnMoreKey="houseRulerships"
          />

          {/* Condition Section */}
          <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Condition
            </h4>
          </div>

          <DetailRow
            label="Sect Status"
            value={sectInfo.status}
            description={sectInfo.description}
            learnMoreKey="sect"
          />

          <DetailRow
            label="Declination"
            value={declination}
            learnMoreKey="declination"
          />

          {/* Saturn Symbol (only for Saturn) */}
          {saturnSymbol && (
            <DetailRow
              label="Saturn Symbol"
              value={saturnSymbol.symbol}
              description={saturnSymbol.meaning}
              learnMoreKey="saturnSymbol"
            />
          )}
        </div>
      )}
    </div>
  );
};

// Separate component for the dignity box with its own learn more
const DignityBox = ({ 
  dignityStatus, 
  dignities 
}: { 
  dignityStatus: { type: string; color: string; bgColor: string };
  dignities: { rulership: string | string[]; exaltation: string; detriment: string | string[]; fall: string };
}) => {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div 
      className="p-3 rounded mb-3"
      style={{ 
        backgroundColor: dignityStatus.bgColor,
        borderLeft: `4px solid ${dignityStatus.color}`
      }}
    >
      <div className="text-sm font-bold mb-2" style={{ color: dignityStatus.color }}>
        {dignityStatus.type === 'Ruler' && '🏛️ '}
        {dignityStatus.type === 'Exaltation' && '⬆️ '}
        {dignityStatus.type === 'Detriment' && '⬇️ '}
        {dignityStatus.type === 'Fall' && '❌ '}
        {dignityStatus.type === 'Peregrine' && '⚪ '}
        Rulership Status: {dignityStatus.type}
      </div>
      <div className="text-xs space-y-1.5 text-foreground/80">
        <div>
          <span className="font-medium">🏛️ Ruler:</span>{' '}
          {Array.isArray(dignities.rulership) ? dignities.rulership.join(', ') : dignities.rulership}
        </div>
        <div>
          <span className="font-medium">⬆️ Exaltation:</span> {dignities.exaltation}
        </div>
        <div>
          <span className="font-medium">⬇️ Detriment:</span>{' '}
          {Array.isArray(dignities.detriment) ? dignities.detriment.join(', ') : dignities.detriment}
        </div>
        <div>
          <span className="font-medium">❌ Fall:</span> {dignities.fall}
        </div>
      </div>
      <button
        onClick={() => setShowLearnMore(!showLearnMore)}
        className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
      >
        <Info size={10} />
        {showLearnMore ? 'Hide' : 'Learn More about Dignities'}
      </button>
      {showLearnMore && (
        <div className="mt-2 p-2 bg-background/50 rounded text-xs text-foreground/70 leading-relaxed border-l-2 border-primary/30">
          {LEARN_MORE_CONTENT.dignities}
        </div>
      )}
    </div>
  );
};
