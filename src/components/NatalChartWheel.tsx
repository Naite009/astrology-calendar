import { useMemo } from 'react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getPlanetaryPositions } from '@/lib/astrology';

// Zodiac signs with their symbols and elements
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire' },
  { name: 'Taurus', symbol: '♉', element: 'earth' },
  { name: 'Gemini', symbol: '♊', element: 'air' },
  { name: 'Cancer', symbol: '♋', element: 'water' },
  { name: 'Leo', symbol: '♌', element: 'fire' },
  { name: 'Virgo', symbol: '♍', element: 'earth' },
  { name: 'Libra', symbol: '♎', element: 'air' },
  { name: 'Scorpio', symbol: '♏', element: 'water' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire' },
  { name: 'Capricorn', symbol: '♑', element: 'earth' },
  { name: 'Aquarius', symbol: '♒', element: 'air' },
  { name: 'Pisces', symbol: '♓', element: 'water' },
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ascendant: 'AC',
  NorthNode: '☊',
  Chiron: '⚷',
  Lilith: '⚸',
};

// Convert sign + degree to absolute longitude (0-360)
const toAbsoluteLongitude = (sign: string, degree: number, minutes: number = 0): number => {
  const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + minutes / 60;
};

// Convert longitude to SVG angle (with Ascendant at 9 o'clock)
const longitudeToAngle = (longitude: number, ascendantLongitude: number): number => {
  // Ascendant should be at 180° (9 o'clock position)
  const relative = longitude - ascendantLongitude;
  const normalized = ((relative % 360) + 360) % 360;
  // In SVG, 0° is at 3 o'clock, goes clockwise
  // We want Ascendant at 9 o'clock (180°) and counter-clockwise zodiac
  return 180 - normalized;
};

// Get coordinates on circle
const getPointOnCircle = (cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } => {
  const angleRad = (angleDeg - 90) * Math.PI / 180; // SVG starts at top
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
};

// Aspect definitions
const ASPECTS = {
  conjunction: { angle: 0, orb: 8, symbol: '☌', color: 'hsl(var(--foreground))' },
  opposition: { angle: 180, orb: 8, symbol: '☍', color: 'hsl(0, 70%, 50%)' },
  trine: { angle: 120, orb: 8, symbol: '△', color: 'hsl(142, 70%, 45%)' },
  square: { angle: 90, orb: 7, symbol: '□', color: 'hsl(25, 90%, 55%)' },
  sextile: { angle: 60, orb: 6, symbol: '⚹', color: 'hsl(210, 70%, 50%)' },
};

interface NatalChartWheelProps {
  chart: NatalChart;
  showTransits?: boolean;
  transitDate?: Date;
  size?: number;
}

export const NatalChartWheel = ({ 
  chart, 
  showTransits = false, 
  transitDate = new Date(),
  size = 500 
}: NatalChartWheelProps) => {
  const cx = size / 2;
  const cy = size / 2;
  
  // Radii for different rings
  const outerRadius = size / 2 - 10;
  const zodiacOuterRadius = outerRadius;
  const zodiacInnerRadius = outerRadius - 35;
  const houseRadius = zodiacInnerRadius - 5;
  const planetRadius = houseRadius - 40;
  const transitRadius = planetRadius - 35;
  const aspectRadius = transitRadius - 20;
  const innerRadius = aspectRadius - 10;

  // Calculate Ascendant longitude
  const ascendantLongitude = useMemo(() => {
    if (chart.planets.Ascendant?.sign) {
      return toAbsoluteLongitude(
        chart.planets.Ascendant.sign,
        chart.planets.Ascendant.degree,
        chart.planets.Ascendant.minutes
      );
    }
    return 0; // Default to 0° Aries if no Ascendant
  }, [chart.planets.Ascendant]);

  // Get natal planet positions with longitudes
  const natalPlanets = useMemo(() => {
    const planets: { name: string; symbol: string; longitude: number; isRetrograde?: boolean }[] = [];
    
    const planetOrder = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Lilith'];
    
    planetOrder.forEach(name => {
      const pos = chart.planets[name as keyof typeof chart.planets];
      if (pos?.sign) {
        planets.push({
          name,
          symbol: PLANET_SYMBOLS[name] || name[0],
          longitude: toAbsoluteLongitude(pos.sign, pos.degree, pos.minutes),
          isRetrograde: pos.isRetrograde,
        });
      }
    });
    
    return planets;
  }, [chart.planets]);

  // Get transit positions
  const transitPlanets = useMemo(() => {
    if (!showTransits) return [];
    
    const positions = getPlanetaryPositions(transitDate);
    const planets: { name: string; symbol: string; longitude: number }[] = [];
    
    const transitOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    
    transitOrder.forEach(name => {
      const pos = positions[name as keyof typeof positions];
      if (pos) {
        const longitude = pos.degree + (ZODIAC_SIGNS.findIndex(s => s.name === pos.signName) * 30);
        planets.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          symbol: PLANET_SYMBOLS[name.charAt(0).toUpperCase() + name.slice(1)] || name[0].toUpperCase(),
          longitude: longitude + (ZODIAC_SIGNS.findIndex(s => s.name === pos.signName) * 30) / 30,
        });
      }
    });
    
    // Recalculate properly
    return transitOrder.map(name => {
      const pos = positions[name as keyof typeof positions];
      if (!pos) return null;
      const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === pos.signName);
      const longitude = signIndex * 30 + pos.degree;
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        symbol: PLANET_SYMBOLS[name.charAt(0).toUpperCase() + name.slice(1)] || name[0].toUpperCase(),
        longitude,
      };
    }).filter(Boolean) as { name: string; symbol: string; longitude: number }[];
  }, [showTransits, transitDate]);

  // Calculate aspects between natal planets
  const aspects = useMemo(() => {
    const found: { planet1: string; planet2: string; type: string; color: string; long1: number; long2: number }[] = [];
    
    for (let i = 0; i < natalPlanets.length; i++) {
      for (let j = i + 1; j < natalPlanets.length; j++) {
        const p1 = natalPlanets[i];
        const p2 = natalPlanets[j];
        
        let diff = Math.abs(p1.longitude - p2.longitude);
        if (diff > 180) diff = 360 - diff;
        
        for (const [aspectName, aspect] of Object.entries(ASPECTS)) {
          if (Math.abs(diff - aspect.angle) <= aspect.orb) {
            found.push({
              planet1: p1.name,
              planet2: p2.name,
              type: aspectName,
              color: aspect.color,
              long1: p1.longitude,
              long2: p2.longitude,
            });
            break;
          }
        }
      }
    }
    
    return found;
  }, [natalPlanets]);

  // Spread out overlapping planets
  const spreadPlanets = (planets: typeof natalPlanets, radius: number) => {
    const minGap = 15; // minimum degrees between planets for display
    const positioned: { name: string; symbol: string; longitude: number; displayAngle: number; isRetrograde?: boolean }[] = [];
    
    const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
    
    sorted.forEach(planet => {
      let displayAngle = longitudeToAngle(planet.longitude, ascendantLongitude);
      
      // Check for overlaps and adjust
      for (const placed of positioned) {
        const diff = Math.abs(displayAngle - placed.displayAngle);
        if (diff < minGap || (360 - diff) < minGap) {
          displayAngle += minGap;
        }
      }
      
      positioned.push({
        ...planet,
        displayAngle,
      });
    });
    
    return positioned;
  };

  const positionedNatalPlanets = spreadPlanets(natalPlanets, planetRadius);
  const positionedTransitPlanets = spreadPlanets(transitPlanets as typeof natalPlanets, transitRadius);

  return (
    <div className="relative">
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        width={size} 
        height={size}
        className="mx-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Background */}
        <circle cx={cx} cy={cy} r={outerRadius} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
        
        {/* Zodiac ring background segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = longitudeToAngle(i * 30, ascendantLongitude);
          const endAngle = longitudeToAngle((i + 1) * 30, ascendantLongitude);
          
          const start1 = getPointOnCircle(cx, cy, zodiacOuterRadius, startAngle);
          const end1 = getPointOnCircle(cx, cy, zodiacOuterRadius, endAngle);
          const start2 = getPointOnCircle(cx, cy, zodiacInnerRadius, startAngle);
          const end2 = getPointOnCircle(cx, cy, zodiacInnerRadius, endAngle);
          
          // Determine fill based on element
          const fillOpacity = sign.element === 'fire' ? '0.15' : 
                              sign.element === 'earth' ? '0.1' : 
                              sign.element === 'air' ? '0.05' : '0.12';
          const fillHue = sign.element === 'fire' ? '15' : 
                          sign.element === 'earth' ? '90' : 
                          sign.element === 'air' ? '200' : '240';
          
          return (
            <g key={sign.name}>
              <path
                d={`M ${start1.x} ${start1.y} A ${zodiacOuterRadius} ${zodiacOuterRadius} 0 0 0 ${end1.x} ${end1.y} L ${end2.x} ${end2.y} A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 1 ${start2.x} ${start2.y} Z`}
                fill={`hsla(${fillHue}, 60%, 50%, ${fillOpacity})`}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
            </g>
          );
        })}

        {/* Zodiac sign symbols */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const midAngle = longitudeToAngle(i * 30 + 15, ascendantLongitude);
          const pos = getPointOnCircle(cx, cy, (zodiacOuterRadius + zodiacInnerRadius) / 2, midAngle);
          
          return (
            <text
              key={`sign-${sign.name}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              fontSize="16"
              fontWeight="500"
            >
              {sign.symbol}
            </text>
          );
        })}

        {/* Inner house circle */}
        <circle cx={cx} cy={cy} r={houseRadius} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerRadius} fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />

        {/* House cusps (simplified - equal houses from Ascendant) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const houseStart = ascendantLongitude + i * 30;
          const angle = longitudeToAngle(houseStart, ascendantLongitude);
          const outer = getPointOnCircle(cx, cy, zodiacInnerRadius, angle);
          const inner = getPointOnCircle(cx, cy, innerRadius, angle);
          
          // House numbers
          const numAngle = longitudeToAngle(houseStart + 15, ascendantLongitude);
          const numPos = getPointOnCircle(cx, cy, innerRadius + 15, numAngle);
          
          return (
            <g key={`house-${i}`}>
              <line
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={i === 0 || i === 3 || i === 6 || i === 9 ? "2" : "0.5"}
                strokeOpacity={i === 0 || i === 3 || i === 6 || i === 9 ? "1" : "0.5"}
              />
              <text
                x={numPos.x}
                y={numPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize="10"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Ascendant marker */}
        {chart.planets.Ascendant?.sign && (
          <g>
            <text
              x={cx - houseRadius - 10}
              y={cy}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-primary"
              fontSize="12"
              fontWeight="bold"
            >
              ASC
            </text>
          </g>
        )}

        {/* Aspect lines */}
        {aspects.map((aspect, i) => {
          const angle1 = longitudeToAngle(aspect.long1, ascendantLongitude);
          const angle2 = longitudeToAngle(aspect.long2, ascendantLongitude);
          const pos1 = getPointOnCircle(cx, cy, aspectRadius, angle1);
          const pos2 = getPointOnCircle(cx, cy, aspectRadius, angle2);
          
          return (
            <line
              key={`aspect-${i}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={aspect.color}
              strokeWidth="1"
              strokeOpacity="0.6"
              strokeDasharray={aspect.type === 'opposition' || aspect.type === 'square' ? '4,2' : 'none'}
            />
          );
        })}

        {/* Transit planets (outer ring) */}
        {showTransits && positionedTransitPlanets.map(planet => {
          const pos = getPointOnCircle(cx, cy, transitRadius, planet.displayAngle);
          
          return (
            <g key={`transit-${planet.name}`}>
              <circle cx={pos.x} cy={pos.y} r="12" fill="hsl(var(--primary))" fillOpacity="0.2" />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-primary"
                fontSize="14"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {/* Natal planets */}
        {positionedNatalPlanets.map(planet => {
          const pos = getPointOnCircle(cx, cy, planetRadius, planet.displayAngle);
          
          // Draw line from actual position to displayed position if different
          const actualAngle = longitudeToAngle(planet.longitude, ascendantLongitude);
          const actualPos = getPointOnCircle(cx, cy, houseRadius - 5, actualAngle);
          
          return (
            <g key={`natal-${planet.name}`}>
              {/* Tick mark at actual position */}
              <line
                x1={actualPos.x}
                y1={actualPos.y}
                x2={getPointOnCircle(cx, cy, houseRadius - 15, actualAngle).x}
                y2={getPointOnCircle(cx, cy, houseRadius - 15, actualAngle).y}
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
              />
              {/* Planet symbol */}
              <circle cx={pos.x} cy={pos.y} r="14" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground"
                fontSize="16"
                fontWeight="500"
              >
                {planet.symbol}
              </text>
              {/* Retrograde indicator */}
              {planet.isRetrograde && (
                <text
                  x={pos.x + 12}
                  y={pos.y - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-amber-600"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ℞
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-foreground"></span>
          <span className="text-muted-foreground">☌ Conjunction</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-red-500" style={{ background: 'hsl(0, 70%, 50%)' }}></span>
          <span className="text-muted-foreground">☍ Opposition</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5" style={{ background: 'hsl(142, 70%, 45%)' }}></span>
          <span className="text-muted-foreground">△ Trine</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5" style={{ background: 'hsl(25, 90%, 55%)' }}></span>
          <span className="text-muted-foreground">□ Square</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5" style={{ background: 'hsl(210, 70%, 50%)' }}></span>
          <span className="text-muted-foreground">⚹ Sextile</span>
        </div>
        {showTransits && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-primary/20"></span>
            <span className="text-muted-foreground">Current Transits</span>
          </div>
        )}
      </div>

      {/* Birth info */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <div className="font-medium text-foreground">{chart.name}</div>
        {chart.birthDate && (
          <div>
            {new Date(chart.birthDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {chart.birthTime && ` • ${chart.birthTime}`}
          </div>
        )}
        {chart.birthLocation && <div>{chart.birthLocation}</div>}
      </div>
    </div>
  );
};
