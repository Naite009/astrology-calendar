/**
 * Relationship Chart Wheel
 *
 * Plots a composite or Davison chart in a single wheel. House cusps and major
 * aspect lines are drawn only when they are mathematically valid for this chart;
 * when they are not, the wheel is labelled as a sign-and-aspect wheel rather
 * than quietly implying houses it does not have.
 */

import { useMemo } from 'react';

interface WheelBody {
  longitude: number;
}

export interface WheelAspectLine {
  from: number;
  to: number;
  tone: 'flowing' | 'tense' | 'fusion';
}

interface RelationshipChartWheelProps {
  planets: Record<string, WheelBody>;
  chartName: string;
  size?: number;
  /** Cusp longitudes. Accepts a 1..12 indexed array; drawn only when complete. */
  cuspLongitudes?: number[] | null;
  /** Major aspects to draw across the middle of the wheel. */
  aspectLines?: WheelAspectLine[];
  /** Explicit note under the wheel, e.g. why houses are absent. */
  caption?: string;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷', Ascendant: 'AC', Midheaven: 'MC',
  Juno: '⚵', Ceres: '⚳', Pallas: '⚴', Vesta: '🜨', Lilith: '⚸'
};

const ASPECT_STROKE: Record<WheelAspectLine['tone'], string> = {
  flowing: 'rgba(59, 130, 246, 0.55)',
  tense: 'rgba(239, 68, 68, 0.5)',
  fusion: 'rgba(168, 85, 247, 0.55)',
};

// Convert position to visual angle (0° Aries at 9 o'clock, counter-clockwise)
function longitudeToAngle(longitude: number): number {
  return 270 - longitude;
}

function angleToPoint(angle: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  const radian = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy - radius * Math.sin(radian)
  };
}

// Spread overlapping planets
function spreadPlanets(
  positions: Array<{ planet: string; longitude: number; symbol: string }>,
  minSpacing: number = 10
): Array<{ planet: string; longitude: number; symbol: string; displayLongitude: number }> {
  if (positions.length === 0) return [];
  
  const sorted = [...positions].sort((a, b) => a.longitude - b.longitude);
  const result: Array<{ planet: string; longitude: number; symbol: string; displayLongitude: number }> = [];
  
  for (let i = 0; i < sorted.length; i++) {
    let displayLongitude = sorted[i].longitude;
    
    for (let j = 0; j < result.length; j++) {
      let diff = displayLongitude - result[j].displayLongitude;
      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;
      
      const absDiff = Math.abs(diff);
      if (absDiff < minSpacing) {
        const push = (minSpacing - absDiff) * (diff >= 0 ? 1 : -1);
        displayLongitude = (displayLongitude + push + 360) % 360;
      }
    }
    
    result.push({ ...sorted[i], displayLongitude });
  }
  
  return result;
}

/** Only draw cusps when all twelve are present and finite. */
function usableCusps(cuspLongitudes?: number[] | null): number[] | null {
  if (!cuspLongitudes) return null;
  const list = cuspLongitudes.length === 13 ? cuspLongitudes.slice(1) : cuspLongitudes;
  if (list.length !== 12) return null;
  if (!list.every((c) => typeof c === 'number' && Number.isFinite(c))) return null;
  return list;
}

export const RelationshipChartWheel = ({
  planets,
  chartName,
  size = 400,
  cuspLongitudes = null,
  aspectLines = [],
  caption,
}: RelationshipChartWheelProps) => {
  const cx = size / 2;
  const cy = size / 2;
  
  const outerRadius = size * 0.48;
  const zodiacOuterRadius = size * 0.48;
  const zodiacInnerRadius = size * 0.38;
  const planetRadius = size * 0.28;
  const aspectRadius = size * 0.21;
  const centerRadius = size * 0.08;

  const cusps = useMemo(() => usableCusps(cuspLongitudes), [cuspLongitudes]);
  
  // Convert planets to positions
  const planetPositions = useMemo(() => {
    const positions: Array<{ planet: string; longitude: number; symbol: string }> = [];
    
    for (const [planet, pos] of Object.entries(planets)) {
      if (pos && pos.longitude !== undefined) {
        positions.push({
          planet,
          longitude: pos.longitude,
          symbol: PLANET_SYMBOLS[planet] || planet[0]
        });
      }
    }
    
    return spreadPlanets(positions, 12);
  }, [planets]);
  
  const longitudeToPoint = (longitude: number, radius: number) => {
    const angle = longitudeToAngle(longitude);
    return angleToPoint(angle, radius, cx, cy);
  };
  
  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-medium mb-2 text-center">{chartName}</h4>
      
      <svg width={size} height={size} className="drop-shadow-md">
        <defs>
          <linearGradient id="relationshipWheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--card))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <circle cx={cx} cy={cy} r={outerRadius} fill="url(#relationshipWheelGradient)" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Zodiac segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startLong = i * 30;
          const endLong = (i + 1) * 30;
          const midLong = startLong + 15;
          
          const outerStart = longitudeToPoint(startLong, zodiacOuterRadius);
          const outerEnd = longitudeToPoint(endLong, zodiacOuterRadius);
          const innerStart = longitudeToPoint(startLong, zodiacInnerRadius);
          const innerEnd = longitudeToPoint(endLong, zodiacInnerRadius);
          const labelPos = longitudeToPoint(midLong, (zodiacOuterRadius + zodiacInnerRadius) / 2);
          
          // Element colors
          const isFireSign = [0, 4, 8].includes(i);
          const isEarthSign = [1, 5, 9].includes(i);
          const isAirSign = [2, 6, 10].includes(i);
          const fillColor = isFireSign ? 'rgba(239, 68, 68, 0.15)' :
                           isEarthSign ? 'rgba(34, 197, 94, 0.15)' :
                           isAirSign ? 'rgba(96, 165, 250, 0.15)' :
                           'rgba(168, 85, 247, 0.15)';
          
          return (
            <g key={sign}>
              <path
                d={`M ${innerStart.x} ${innerStart.y} 
                    L ${outerStart.x} ${outerStart.y} 
                    A ${zodiacOuterRadius} ${zodiacOuterRadius} 0 0 0 ${outerEnd.x} ${outerEnd.y}
                    L ${innerEnd.x} ${innerEnd.y}
                    A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 1 ${innerStart.x} ${innerStart.y}`}
                fill={fillColor}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-medium"
                style={{ fontSize: size * 0.035 }}
              >
                {ZODIAC_SYMBOLS[i]}
              </text>
            </g>
          );
        })}
        
        {/* Inner ring border */}
        <circle cx={cx} cy={cy} r={zodiacInnerRadius} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />

        {/* House cusps — only when this chart actually has a valid house frame */}
        {cusps && cusps.map((cuspLon, i) => {
          const inner = longitudeToPoint(cuspLon, centerRadius);
          const outer = longitudeToPoint(cuspLon, zodiacInnerRadius);
          const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
          const nextLon = cusps[(i + 1) % 12];
          let span = nextLon - cuspLon;
          if (span <= 0) span += 360;
          const labelPos = longitudeToPoint((cuspLon + span / 2) % 360, zodiacInnerRadius * 0.92);
          return (
            <g key={`cusp-${i}`}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="hsl(var(--border))"
                strokeWidth={isAngle ? 1.6 : 0.7}
                strokeDasharray={isAngle ? undefined : '3 3'}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: size * 0.024 }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Major aspect lines */}
        {aspectLines.map((line, i) => {
          const a = longitudeToPoint(line.from, aspectRadius);
          const b = longitudeToPoint(line.to, aspectRadius);
          return (
            <line
              key={`aspect-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={ASPECT_STROKE[line.tone]}
              strokeWidth={line.tone === 'fusion' ? 1.8 : 1.2}
            />
          );
        })}
        
        {/* Planets */}
        {planetPositions.map((pos) => {
          const point = longitudeToPoint(pos.displayLongitude, planetRadius);
          
          return (
            <g key={pos.planet}>
              <circle 
                cx={point.x} 
                cy={point.y} 
                r={size * 0.032} 
                fill="hsl(var(--card))" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
              />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-semibold"
                style={{ fontSize: size * 0.028 }}
              >
                {pos.symbol}
              </text>
            </g>
          );
        })}
        
        {/* Center */}
        <circle cx={cx} cy={cy} r={centerRadius} fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold" style={{ fontSize: size * 0.022 }}>
          {Object.keys(planets).length}
        </text>
      </svg>

      <p className="mt-2 max-w-[420px] text-center text-xs text-muted-foreground">
        {caption ??
          (cusps
            ? 'Signs, planets, house cusps and major aspect lines.'
            : 'Signs, planets and major aspect lines only. This wheel has no house ring because valid house cusps could not be derived for this chart.')}
      </p>
    </div>
  );
};
