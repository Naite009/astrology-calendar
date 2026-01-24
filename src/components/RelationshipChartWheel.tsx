/**
 * Relationship Chart Wheel Visualization
 * Shows Composite or Davison chart planets in a single wheel
 */

import { useMemo } from 'react';
import { CompositePosition } from '@/lib/compositeChart';

interface RelationshipChartWheelProps {
  planets: Record<string, CompositePosition>;
  chartName: string;
  size?: number;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷', Ascendant: 'AC',
  Juno: '⚵', Ceres: '⚳', Pallas: '⚴', Vesta: '🜨', Lilith: '⚸'
};

// Convert position to visual angle (0° Aries at top, counter-clockwise)
function longitudeToAngle(longitude: number): number {
  // 0° Aries at 270° (9 o'clock), going counter-clockwise
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

export const RelationshipChartWheel = ({ planets, chartName, size = 400 }: RelationshipChartWheelProps) => {
  const cx = size / 2;
  const cy = size / 2;
  
  const outerRadius = size * 0.48;
  const zodiacOuterRadius = size * 0.48;
  const zodiacInnerRadius = size * 0.38;
  const planetRadius = size * 0.28;
  const centerRadius = size * 0.08;
  
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
    </div>
  );
};
