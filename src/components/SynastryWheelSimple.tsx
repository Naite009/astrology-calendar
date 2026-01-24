/**
 * Simple Synastry Wheel - Proof of Concept
 * Shows two charts overlaid with aspect lines between them
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

// Convert position to absolute degrees (0-360)
function toAbsoluteDegree(pos: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + pos.degree + ((pos.minutes || 0) / 60);
}

// Get aspect between two planets
function getAspect(deg1: number, deg2: number): { type: string; color: string; orb: number } | null {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  
  const aspects = [
    { angle: 0, orb: 8, type: 'conjunction', color: '#8b5cf6' },
    { angle: 60, orb: 6, type: 'sextile', color: '#3b82f6' },
    { angle: 90, orb: 7, type: 'square', color: '#ef4444' },
    { angle: 120, orb: 8, type: 'trine', color: '#3b82f6' },
    { angle: 180, orb: 8, type: 'opposition', color: '#ef4444' }
  ];
  
  for (const asp of aspects) {
    const orbDiff = Math.abs(diff - asp.angle);
    if (orbDiff <= asp.orb) {
      return { type: asp.type, color: asp.color, orb: orbDiff };
    }
  }
  return null;
}

// Convert degree to SVG coordinates on a circle
function degreeToPoint(degree: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  // Astrology: 0° Aries at left (9 o'clock), going counter-clockwise
  const radian = ((270 - degree) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy - radius * Math.sin(radian)
  };
}

export const SynastryWheelSimple = ({ chart1, chart2, size = 500 }: SynastryWheelSimpleProps) => {
  const cx = size / 2;
  const cy = size / 2;
  
  // Ring radii
  const outerRingRadius = size * 0.45;
  const zodiacRingRadius = size * 0.40;
  const chart1Radius = size * 0.32; // Inner ring for person 1
  const chart2Radius = size * 0.24; // Middle ring for person 2
  const aspectRadius = size * 0.18; // Center area for aspect lines
  
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
    return positions;
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
    return positions;
  }, [chart2]);
  
  // Calculate aspects between charts
  const aspects = useMemo(() => {
    const result: Array<{
      p1: string; p2: string;
      deg1: number; deg2: number;
      type: string; color: string; orb: number;
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
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-serif mb-1">Synastry Wheel</h3>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-pink-500"></span>
            {chart1.name}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
            {chart2.name}
          </span>
        </div>
      </div>
      
      <svg width={size} height={size} className="drop-shadow-lg">
        {/* Background */}
        <circle cx={cx} cy={cy} r={outerRingRadius} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Zodiac wheel segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = i * 30;
          const endAngle = (i + 1) * 30;
          const start = degreeToPoint(startAngle, outerRingRadius, cx, cy);
          const end = degreeToPoint(endAngle, outerRingRadius, cx, cy);
          const innerStart = degreeToPoint(startAngle, zodiacRingRadius, cx, cy);
          const innerEnd = degreeToPoint(endAngle, zodiacRingRadius, cx, cy);
          const midAngle = startAngle + 15;
          const labelPos = degreeToPoint(midAngle, (outerRingRadius + zodiacRingRadius) / 2, cx, cy);
          
          // Alternate colors for signs
          const isFireSign = [0, 4, 8].includes(i);
          const isEarthSign = [1, 5, 9].includes(i);
          const isAirSign = [2, 6, 10].includes(i);
          const fillColor = isFireSign ? 'rgba(239, 68, 68, 0.15)' :
                           isEarthSign ? 'rgba(34, 197, 94, 0.15)' :
                           isAirSign ? 'rgba(59, 130, 246, 0.15)' :
                           'rgba(168, 85, 247, 0.15)';
          
          return (
            <g key={sign}>
              {/* Sign segment */}
              <path
                d={`M ${innerStart.x} ${innerStart.y} 
                    L ${start.x} ${start.y} 
                    A ${outerRingRadius} ${outerRingRadius} 0 0 0 ${end.x} ${end.y}
                    L ${innerEnd.x} ${innerEnd.y}
                    A ${zodiacRingRadius} ${zodiacRingRadius} 0 0 1 ${innerStart.x} ${innerStart.y}`}
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
                className="text-base font-medium fill-foreground"
              >
                {ZODIAC_SYMBOLS[i]}
              </text>
            </g>
          );
        })}
        
        {/* Inner circle for planets */}
        <circle cx={cx} cy={cy} r={zodiacRingRadius} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={chart1Radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" strokeDasharray="4 2" />
        <circle cx={cx} cy={cy} r={chart2Radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" strokeDasharray="4 2" />
        
        {/* Aspect lines (drawn first so planets overlay them) */}
        {aspects.map((asp, i) => {
          const p1 = degreeToPoint(asp.deg1, aspectRadius, cx, cy);
          const p2 = degreeToPoint(asp.deg2, aspectRadius, cx, cy);
          
          return (
            <line
              key={i}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke={asp.color}
              strokeWidth={asp.type === 'conjunction' || asp.type === 'opposition' ? 2 : 1.5}
              strokeOpacity={0.6}
              strokeDasharray={asp.type === 'sextile' || asp.type === 'trine' ? '4 2' : undefined}
            />
          );
        })}
        
        {/* Chart 1 planets (outer ring - pink) */}
        {chart1Positions.map((pos, i) => {
          const point = degreeToPoint(pos.degree, chart1Radius, cx, cy);
          return (
            <g key={`c1-${pos.planet}`}>
              <circle cx={point.x} cy={point.y} r={14} fill="hsl(var(--card))" stroke="#ec4899" strokeWidth="2" />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-foreground font-medium"
              >
                {pos.symbol}
              </text>
            </g>
          );
        })}
        
        {/* Chart 2 planets (inner ring - cyan) */}
        {chart2Positions.map((pos, i) => {
          const point = degreeToPoint(pos.degree, chart2Radius, cx, cy);
          return (
            <g key={`c2-${pos.planet}`}>
              <circle cx={point.x} cy={point.y} r={14} fill="hsl(var(--card))" stroke="#06b6d4" strokeWidth="2" />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-foreground font-medium"
              >
                {pos.symbol}
              </text>
            </g>
          );
        })}
        
        {/* Center info */}
        <circle cx={cx} cy={cy} r={size * 0.08} fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">
          {aspects.length}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="text-[8px] fill-muted-foreground">
          aspects
        </text>
      </svg>
      
      {/* Aspect Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-6 h-0.5 bg-purple-500"></span>
          Conjunction
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 h-0.5 bg-red-500"></span>
          Square/Opposition
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 h-0.5 bg-blue-500 border-dashed" style={{ borderTopWidth: 2, borderStyle: 'dashed' }}></span>
          Trine/Sextile
        </span>
      </div>
    </div>
  );
};