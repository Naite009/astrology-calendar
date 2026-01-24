/**
 * Synastry Wheel Visualization
 * Shows two charts overlaid with aspect lines between them
 * Oriented with Ascendant at 9 o'clock, signs counter-clockwise
 */

import { useMemo } from 'react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

interface SynastryWheelSimpleProps {
  chart1: NatalChart;
  chart2: NatalChart;
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
  NorthNode: '☊', Chiron: '⚷', Ascendant: 'AC', Midheaven: 'MC'
};

// Convert position to absolute degrees (0-360, starting from 0° Aries)
function toAbsoluteDegree(pos: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + pos.degree + ((pos.minutes || 0) / 60);
}

// Get aspect between two planets
function getAspect(deg1: number, deg2: number): { type: string; color: string; orb: number; dashArray?: string } | null {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  
  const aspects = [
    { angle: 0, orb: 8, type: 'conjunction', color: '#a855f7', dashArray: undefined },
    { angle: 60, orb: 5, type: 'sextile', color: '#3b82f6', dashArray: '4 2' },
    { angle: 90, orb: 7, type: 'square', color: '#ef4444', dashArray: undefined },
    { angle: 120, orb: 8, type: 'trine', color: '#22c55e', dashArray: '6 3' },
    { angle: 180, orb: 8, type: 'opposition', color: '#ef4444', dashArray: undefined }
  ];
  
  for (const asp of aspects) {
    const orbDiff = Math.abs(diff - asp.angle);
    if (orbDiff <= asp.orb) {
      return { type: asp.type, color: asp.color, orb: orbDiff, dashArray: asp.dashArray };
    }
  }
  return null;
}

/**
 * Convert zodiac degree to SVG angle
 * Ascendant at 9 o'clock (180°), signs go COUNTER-clockwise
 * So 0° Aries visual angle depends on Ascendant position
 */
function degreeToAngle(zodiacDegree: number, ascendantDegree: number): number {
  // Calculate how far this degree is from the Ascendant
  // Ascendant is at 180° (9 o'clock)
  // Signs go counter-clockwise, so higher zodiac degrees go clockwise in visual space
  const offset = zodiacDegree - ascendantDegree;
  // 180° is 9 o'clock, counter-clockwise means subtracting
  return 180 - offset;
}

// Convert angle to SVG coordinates
function angleToPoint(angle: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  const radian = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy + radius * Math.sin(radian)
  };
}

// Spread overlapping planets
function spreadPlanets(
  positions: Array<{ planet: string; degree: number; symbol: string }>,
  minSpacing: number = 12
): Array<{ planet: string; degree: number; symbol: string; displayDegree: number }> {
  if (positions.length === 0) return [];
  
  // Sort by degree
  const sorted = [...positions].sort((a, b) => a.degree - b.degree);
  const result: Array<{ planet: string; degree: number; symbol: string; displayDegree: number }> = [];
  
  for (let i = 0; i < sorted.length; i++) {
    let displayDegree = sorted[i].degree;
    
    // Check for overlap with previous planets
    for (let j = 0; j < result.length; j++) {
      let diff = Math.abs(displayDegree - result[j].displayDegree);
      if (diff > 180) diff = 360 - diff;
      
      if (diff < minSpacing) {
        // Push this planet away
        displayDegree = (result[j].displayDegree + minSpacing) % 360;
      }
    }
    
    result.push({ ...sorted[i], displayDegree });
  }
  
  return result;
}

export const SynastryWheelSimple = ({ chart1, chart2, size = 500 }: SynastryWheelSimpleProps) => {
  const cx = size / 2;
  const cy = size / 2;
  
  // Ring radii
  const outerRadius = size * 0.48;
  const zodiacOuterRadius = size * 0.48;
  const zodiacInnerRadius = size * 0.40;
  const degreeTickRadius = size * 0.39;
  const chart1Radius = size * 0.34; // Outer planet ring (person 1)
  const chart2Radius = size * 0.26; // Inner planet ring (person 2)
  const houseLineInner = size * 0.18;
  const aspectRadius = size * 0.16; // Center for aspect lines
  const centerRadius = size * 0.06;
  
  // Get Ascendant degree (use chart1's Ascendant for wheel orientation)
  const ascendantDegree = useMemo(() => {
    const asc = chart1.planets.Ascendant;
    if (asc) return toAbsoluteDegree(asc);
    // Default to 0° Libra if no Ascendant (Libra at 9 o'clock as user mentioned)
    return 180; // 0° Libra
  }, [chart1]);
  
  // Calculate planet positions for both charts
  const chart1Positions = useMemo(() => {
    const positions: Array<{ planet: string; degree: number; symbol: string }> = [];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    for (const planet of planets) {
      const pos = chart1.planets[planet as keyof typeof chart1.planets];
      if (pos) {
        positions.push({
          planet,
          degree: toAbsoluteDegree(pos),
          symbol: PLANET_SYMBOLS[planet] || planet[0]
        });
      }
    }
    return spreadPlanets(positions, 14);
  }, [chart1]);
  
  const chart2Positions = useMemo(() => {
    const positions: Array<{ planet: string; degree: number; symbol: string }> = [];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    for (const planet of planets) {
      const pos = chart2.planets[planet as keyof typeof chart2.planets];
      if (pos) {
        positions.push({
          planet,
          degree: toAbsoluteDegree(pos),
          symbol: PLANET_SYMBOLS[planet] || planet[0]
        });
      }
    }
    return spreadPlanets(positions, 14);
  }, [chart2]);
  
  // Calculate aspects between charts
  const aspects = useMemo(() => {
    const result: Array<{
      p1: string; p2: string;
      deg1: number; deg2: number;
      type: string; color: string; orb: number; dashArray?: string;
    }> = [];
    
    for (const pos1 of chart1Positions) {
      for (const pos2 of chart2Positions) {
        const aspect = getAspect(pos1.degree, pos2.degree);
        if (aspect) {
          result.push({
            p1: pos1.planet,
            p2: pos2.planet,
            deg1: pos1.degree,
            deg2: pos2.degree,
            ...aspect
          });
        }
      }
    }
    return result;
  }, [chart1Positions, chart2Positions]);
  
  // Generate house cusps (whole sign from Ascendant)
  const houseCusps = useMemo(() => {
    const cusps: number[] = [];
    for (let i = 0; i < 12; i++) {
      cusps.push((ascendantDegree + i * 30) % 360);
    }
    return cusps;
  }, [ascendantDegree]);
  
  // Helper to convert zodiac degree to visual point
  const zodiacToPoint = (zodiacDeg: number, radius: number) => {
    const angle = degreeToAngle(zodiacDeg, ascendantDegree);
    return angleToPoint(angle, radius, cx, cy);
  };
  
  // Generate degree tick marks
  const degreeMarks = useMemo(() => {
    const marks: Array<{ deg: number; isMajor: boolean }> = [];
    for (let d = 0; d < 360; d += 5) {
      marks.push({ deg: d, isMajor: d % 30 === 0 });
    }
    return marks;
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-serif mb-2">Synastry Chart Wheel</h3>
        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-pink-500 bg-card"></span>
            <span className="font-medium">{chart1.name}</span>
            <span className="text-xs text-muted-foreground">(outer)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-cyan-500 bg-card"></span>
            <span className="font-medium">{chart2.name}</span>
            <span className="text-xs text-muted-foreground">(inner)</span>
          </span>
        </div>
      </div>
      
      <svg width={size} height={size} className="drop-shadow-md">
        <defs>
          {/* Gradient for outer ring */}
          <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--card))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={outerRadius} fill="url(#wheelGradient)" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Zodiac wheel segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const signStartDeg = i * 30; // 0° of this sign in zodiac
          const signEndDeg = (i + 1) * 30;
          
          const outerStart = zodiacToPoint(signStartDeg, zodiacOuterRadius);
          const outerEnd = zodiacToPoint(signEndDeg, zodiacOuterRadius);
          const innerStart = zodiacToPoint(signStartDeg, zodiacInnerRadius);
          const innerEnd = zodiacToPoint(signEndDeg, zodiacInnerRadius);
          const midDeg = signStartDeg + 15;
          const labelPos = zodiacToPoint(midDeg, (zodiacOuterRadius + zodiacInnerRadius) / 2);
          
          // Element colors
          const isFireSign = [0, 4, 8].includes(i); // Aries, Leo, Sag
          const isEarthSign = [1, 5, 9].includes(i); // Taurus, Virgo, Cap
          const isAirSign = [2, 6, 10].includes(i); // Gemini, Libra, Aqua
          const fillColor = isFireSign ? 'rgba(239, 68, 68, 0.12)' :
                           isEarthSign ? 'rgba(34, 197, 94, 0.12)' :
                           isAirSign ? 'rgba(96, 165, 250, 0.12)' :
                           'rgba(168, 85, 247, 0.12)'; // Water
          
          // Determine arc direction (counter-clockwise in visual space)
          const angle1 = degreeToAngle(signStartDeg, ascendantDegree);
          const angle2 = degreeToAngle(signEndDeg, ascendantDegree);
          
          return (
            <g key={sign}>
              {/* Sign segment arc */}
              <path
                d={`M ${innerStart.x} ${innerStart.y} 
                    L ${outerStart.x} ${outerStart.y} 
                    A ${zodiacOuterRadius} ${zodiacOuterRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}
                    L ${innerEnd.x} ${innerEnd.y}
                    A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`}
                fill={fillColor}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              {/* Sign symbol */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-medium"
                style={{ fontSize: size * 0.032 }}
              >
                {ZODIAC_SYMBOLS[i]}
              </text>
            </g>
          );
        })}
        
        {/* Degree tick marks */}
        {degreeMarks.map(({ deg, isMajor }) => {
          const outer = zodiacToPoint(deg, zodiacInnerRadius);
          const inner = zodiacToPoint(deg, isMajor ? degreeTickRadius - 6 : degreeTickRadius - 2);
          return (
            <line
              key={`tick-${deg}`}
              x1={outer.x} y1={outer.y}
              x2={inner.x} y2={inner.y}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={isMajor ? 1 : 0.5}
              strokeOpacity={isMajor ? 0.6 : 0.3}
            />
          );
        })}
        
        {/* Inner ring borders */}
        <circle cx={cx} cy={cy} r={zodiacInnerRadius} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={chart1Radius + 16} fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx={cx} cy={cy} r={chart2Radius + 16} fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" strokeOpacity="0.5" />
        
        {/* House cusp lines */}
        {houseCusps.map((cusp, i) => {
          const outer = zodiacToPoint(cusp, zodiacInnerRadius);
          const inner = zodiacToPoint(cusp, houseLineInner);
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9; // ASC, IC, DSC, MC
          
          return (
            <g key={`house-${i}`}>
              <line
                x1={outer.x} y1={outer.y}
                x2={inner.x} y2={inner.y}
                stroke={isAngular ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isAngular ? 2 : 1}
                strokeOpacity={isAngular ? 0.8 : 0.4}
              />
              {/* House number */}
              {isAngular && (
                <text
                  x={zodiacToPoint(cusp + 15, houseLineInner + 10).x}
                  y={zodiacToPoint(cusp + 15, houseLineInner + 10).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-primary font-bold"
                  style={{ fontSize: size * 0.022 }}
                >
                  {i === 0 ? 'ASC' : i === 3 ? 'IC' : i === 6 ? 'DSC' : 'MC'}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Aspect lines */}
        <g opacity="0.7">
          {aspects.map((asp, i) => {
            const p1 = zodiacToPoint(asp.deg1, aspectRadius);
            const p2 = zodiacToPoint(asp.deg2, aspectRadius);
            
            return (
              <line
                key={i}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke={asp.color}
                strokeWidth={asp.type === 'conjunction' || asp.type === 'opposition' ? 1.5 : 1}
                strokeDasharray={asp.dashArray}
              />
            );
          })}
        </g>
        
        {/* Chart 1 planets (outer ring - pink) */}
        {chart1Positions.map((pos) => {
          const point = zodiacToPoint(pos.displayDegree, chart1Radius);
          return (
            <g key={`c1-${pos.planet}`}>
              <circle 
                cx={point.x} 
                cy={point.y} 
                r={size * 0.028} 
                fill="hsl(var(--card))" 
                stroke="#ec4899" 
                strokeWidth="2" 
              />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-semibold"
                style={{ fontSize: size * 0.026 }}
              >
                {pos.symbol}
              </text>
            </g>
          );
        })}
        
        {/* Chart 2 planets (inner ring - cyan) */}
        {chart2Positions.map((pos) => {
          const point = zodiacToPoint(pos.displayDegree, chart2Radius);
          return (
            <g key={`c2-${pos.planet}`}>
              <circle 
                cx={point.x} 
                cy={point.y} 
                r={size * 0.028} 
                fill="hsl(var(--card))" 
                stroke="#06b6d4" 
                strokeWidth="2" 
              />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-semibold"
                style={{ fontSize: size * 0.026 }}
              >
                {pos.symbol}
              </text>
            </g>
          );
        })}
        
        {/* Center circle with aspect count */}
        <circle cx={cx} cy={cy} r={centerRadius} fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold" style={{ fontSize: size * 0.028 }}>
          {aspects.length}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: size * 0.016 }}>
          aspects
        </text>
      </svg>
      
      {/* Aspect Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded" style={{ backgroundColor: '#a855f7' }}></span>
          Conjunction
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded" style={{ backgroundColor: '#ef4444' }}></span>
          Square/Opposition
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded" style={{ backgroundColor: '#22c55e', borderTop: '2px dashed #22c55e', height: 0 }}></span>
          Trine
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded" style={{ backgroundColor: '#3b82f6', borderTop: '2px dashed #3b82f6', height: 0 }}></span>
          Sextile
        </span>
      </div>
      
      {/* Orientation note */}
      <p className="mt-2 text-xs text-muted-foreground text-center">
        Wheel oriented to {chart1.name}'s Ascendant at 9 o'clock
      </p>
    </div>
  );
};