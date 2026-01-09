import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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

interface DetailRowProps {
  label: string;
  value: string;
  description?: string;
  learnMoreLink?: string;
}

const DetailRow = ({ label, value, description, learnMoreLink }: DetailRowProps) => (
  <div className="py-3 border-b border-border/50 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
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
    {learnMoreLink && (
      <a
        href={learnMoreLink}
        className="text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={10} />
        Learn More →
      </a>
    )}
  </div>
);

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
            learnMoreLink={`/learn/signs/${sign.toLowerCase()}`}
          />

          <DetailRow
            label="Element"
            value={`${getElementSymbol(signProps.element)} ${signProps.element}`}
            learnMoreLink={`/learn/elements/${signProps.element.toLowerCase()}`}
          />

          <DetailRow
            label="Mode"
            value={signProps.mode}
            learnMoreLink={`/learn/modes/${signProps.mode.toLowerCase()}`}
          />

          {houseType && (
            <DetailRow
              label="Angularity"
              value={houseType}
              description={`${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house is ${houseType.toLowerCase()}`}
              learnMoreLink="/learn/house-types"
            />
          )}

          <DetailRow
            label="Motion"
            value={isRetrograde ? `Retrograde ℞` : 'Direct'}
            description={isRetrograde ? 'Planet appears to move backward from Earth\'s perspective' : 'Planet moving forward in normal direction'}
            learnMoreLink="/learn/retrograde"
          />

          <DetailRow
            label="Speed"
            value={speed}
            learnMoreLink="/learn/planetary-motion"
          />

          {/* Dignity Status Section */}
          {dignities && (
            <>
              <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                  Dignity Status
                </h4>
              </div>

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
                <a
                  href="/learn/dignities"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={10} />
                  Learn More about Dignities →
                </a>
              </div>
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
            learnMoreLink="/learn/dispositors"
          />

          {triplicityRulers && (
            <DetailRow
              label="Triplicity Rulers"
              value={`${triplicityRulers.day}, ${triplicityRulers.night}, ${triplicityRulers.participating}`}
              description={`Day: ${triplicityRulers.day} | Night: ${triplicityRulers.night} | Participating: ${triplicityRulers.participating}`}
              learnMoreLink="/learn/triplicities"
            />
          )}

          <DetailRow
            label="Term Ruler"
            value={termRuler}
            description={`Egyptian/Ptolemaic terms for ${degree}° ${sign}`}
            learnMoreLink="/learn/terms"
          />

          <DetailRow
            label="Decan Ruler"
            value={decanRuler}
            description={`${degree}° is in the ${getDecanName(decanIndex)} decan (${decanIndex * 10}°-${(decanIndex + 1) * 10}°)`}
            learnMoreLink="/learn/decans"
          />

          <DetailRow
            label="Houses Ruled"
            value={housesRuled}
            description="Houses where this planet is the traditional ruler"
            learnMoreLink="/learn/house-rulerships"
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
            learnMoreLink="/learn/sect"
          />

          <DetailRow
            label="Declination"
            value={declination}
            learnMoreLink="/learn/declination"
          />

          {/* Saturn Symbol (only for Saturn) */}
          {saturnSymbol && (
            <DetailRow
              label="Saturn Symbol"
              value={saturnSymbol.symbol}
              description={saturnSymbol.meaning}
              learnMoreLink="/learn/saturn-symbols"
            />
          )}
        </div>
      )}
    </div>
  );
};
