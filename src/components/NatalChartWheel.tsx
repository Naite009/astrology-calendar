// Natal Chart Wheel Visualization
// A traditional astrological chart wheel showing planets, signs, and houses

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Ascendant: 'AC', NorthNode: '☊', SouthNode: '☋', Chiron: '⚷',
  Lilith: '⚸', Ceres: '⚳', Pallas: '⚴', Juno: '⚵', Vesta: '⚶',
  PartOfFortune: '⊕', Vertex: 'Vx', MC: 'MC', IC: 'IC', Descendant: 'DC'
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',   // red
  Earth: '#22c55e',  // green
  Air: '#eab308',    // yellow
  Water: '#3b82f6',  // blue
};

const getElement = (sign: string): string => {
  const fireS = ['Aries', 'Leo', 'Sagittarius'];
  const earthS = ['Taurus', 'Virgo', 'Capricorn'];
  const airS = ['Gemini', 'Libra', 'Aquarius'];
  if (fireS.includes(sign)) return 'Fire';
  if (earthS.includes(sign)) return 'Earth';
  if (airS.includes(sign)) return 'Air';
  return 'Water';
};

// Convert planet position to absolute longitude (0-360)
const positionToLongitude = (pos: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
};

// Convert longitude to SVG position
// Traditional: ASC at left (9 o'clock), signs counter-clockwise
const longitudeToPosition = (longitude: number, ascLongitude: number, radius: number, cx: number, cy: number) => {
  // Rotate so Ascendant is at the left (180° in SVG)
  const angle = (180 - (longitude - ascLongitude)) * (Math.PI / 180);
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy - Math.sin(angle) * radius
  };
};

interface NatalChartWheelProps {
  natalChart: NatalChart | null;
  allCharts?: NatalChart[];
}

export const NatalChartWheel = ({ natalChart: initialChart, allCharts = [] }: NatalChartWheelProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string>(initialChart?.id || '');
  
  // Get sorted charts alphabetically
  const sortedCharts = [...allCharts].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get the selected chart
  const natalChart = sortedCharts.find(c => c.id === selectedChartId) || initialChart;
  
  if (!natalChart) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center text-muted-foreground">
        <p className="text-lg">No natal chart loaded.</p>
        <p className="text-sm mt-2">Go to the Charts tab to add your birth data.</p>
      </div>
    );
  }

  const cx = 200;
  const cy = 200;
  const outerRadius = 180;
  const signRingOuter = 180;
  const signRingInner = 150;
  const houseRingOuter = 150;
  const houseRingInner = 50;
  const planetRadius = 120;
  
  // Get Ascendant longitude for rotation
  const ascPos = natalChart.houseCusps?.house1 || natalChart.planets.Ascendant;
  const ascLongitude = ascPos ? positionToLongitude({
    sign: ascPos.sign,
    degree: ascPos.degree,
    minutes: ascPos.minutes || 0,
    seconds: 0,
    isRetrograde: false
  }) : 0;

  // Get core planets to display
  const corePlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const additionalPlanets = ['NorthNode', 'Chiron', 'Lilith'];
  
  const planetsToShow = [...corePlanets, ...additionalPlanets].filter(p => natalChart.planets[p]?.sign);

  // Calculate planet positions with collision avoidance
  const planetPositions = planetsToShow.map(planet => {
    const pos = natalChart.planets[planet];
    if (!pos) return null;
    const lon = positionToLongitude(pos);
    return { planet, lon, pos };
  }).filter(Boolean) as { planet: string; lon: number; pos: NatalPlanetPosition }[];

  // Sort by longitude and spread overlapping planets
  planetPositions.sort((a, b) => a.lon - b.lon);
  const adjustedPositions: { planet: string; lon: number; adjustedLon: number; pos: NatalPlanetPosition; radius: number }[] = [];
  
  for (let i = 0; i < planetPositions.length; i++) {
    const p = planetPositions[i];
    let adjustedLon = p.lon;
    let radius = planetRadius;
    
    // Check for collisions with already placed planets
    for (const placed of adjustedPositions) {
      const diff = Math.abs(adjustedLon - placed.adjustedLon);
      if (diff < 8 || diff > 352) { // Too close
        adjustedLon = (placed.adjustedLon + 8) % 360;
        radius = placed.radius === planetRadius ? planetRadius - 18 : planetRadius; // Alternate layers
      }
    }
    
    adjustedPositions.push({ ...p, adjustedLon, radius });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Chart Selector */}
      {sortedCharts.length > 1 && (
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-muted-foreground">Select Chart:</label>
          <select
            value={selectedChartId}
            onChange={(e) => setSelectedChartId(e.target.value)}
            className="flex-1 max-w-xs border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {sortedCharts.map(chart => (
              <option key={chart.id} value={chart.id}>
                {chart.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl mb-4 text-center">{natalChart.name}'s Natal Chart</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {natalChart.birthDate} • {natalChart.birthTime} • {natalChart.birthLocation}
        </p>

        <svg width="400" height="400" viewBox="0 0 400 400" className="mx-auto">
          {/* Background */}
          <circle cx={cx} cy={cy} r={outerRadius} className="fill-background stroke-border" strokeWidth="2" />
          
          {/* Zodiac Sign Ring */}
          {ZODIAC_SIGNS.map((sign, i) => {
            const startAngle = (180 - ((i * 30) - ascLongitude)) * (Math.PI / 180);
            const endAngle = (180 - (((i + 1) * 30) - ascLongitude)) * (Math.PI / 180);
            const midAngle = (startAngle + endAngle) / 2;
            
            const outerStart = {
              x: cx + Math.cos(startAngle) * signRingOuter,
              y: cy - Math.sin(startAngle) * signRingOuter
            };
            const outerEnd = {
              x: cx + Math.cos(endAngle) * signRingOuter,
              y: cy - Math.sin(endAngle) * signRingOuter
            };
            const innerEnd = {
              x: cx + Math.cos(endAngle) * signRingInner,
              y: cy - Math.sin(endAngle) * signRingInner
            };
            const innerStart = {
              x: cx + Math.cos(startAngle) * signRingInner,
              y: cy - Math.sin(startAngle) * signRingInner
            };
            
            const labelRadius = (signRingOuter + signRingInner) / 2;
            const labelPos = {
              x: cx + Math.cos(midAngle) * labelRadius,
              y: cy - Math.sin(midAngle) * labelRadius
            };

            const element = getElement(sign);
            const color = ELEMENT_COLORS[element];
            
            return (
              <g key={sign}>
                <path
                  d={`M ${outerStart.x} ${outerStart.y}
                      A ${signRingOuter} ${signRingOuter} 0 0 0 ${outerEnd.x} ${outerEnd.y}
                      L ${innerEnd.x} ${innerEnd.y}
                      A ${signRingInner} ${signRingInner} 0 0 1 ${innerStart.x} ${innerStart.y}
                      Z`}
                  fill={color}
                  fillOpacity="0.15"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg fill-foreground"
                  style={{ fontSize: '16px' }}
                >
                  {SIGN_SYMBOLS[sign]}
                </text>
              </g>
            );
          })}
          
          {/* Inner circle (house ring boundary) */}
          <circle cx={cx} cy={cy} r={signRingInner} className="fill-none stroke-border" strokeWidth="1" />
          
          {/* House Cusps */}
          {natalChart.houseCusps && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
            const key = `house${num}` as keyof typeof natalChart.houseCusps;
            const cusp = natalChart.houseCusps![key];
            if (!cusp) return null;
            
            const lon = positionToLongitude({ sign: cusp.sign, degree: cusp.degree, minutes: cusp.minutes || 0, seconds: 0, isRetrograde: false });
            const angle = (180 - (lon - ascLongitude)) * (Math.PI / 180);
            
            const outerPoint = {
              x: cx + Math.cos(angle) * signRingInner,
              y: cy - Math.sin(angle) * signRingInner
            };
            const innerPoint = {
              x: cx + Math.cos(angle) * houseRingInner,
              y: cy - Math.sin(angle) * houseRingInner
            };
            
            // House number position
            const nextNum = num === 12 ? 1 : num + 1;
            const nextKey = `house${nextNum}` as keyof typeof natalChart.houseCusps;
            const nextCusp = natalChart.houseCusps![nextKey];
            let nextLon = nextCusp ? positionToLongitude({ sign: nextCusp.sign, degree: nextCusp.degree, minutes: nextCusp.minutes || 0, seconds: 0, isRetrograde: false }) : lon + 30;
            if (nextLon < lon) nextLon += 360;
            const midLon = (lon + nextLon) / 2;
            const midAngle = (180 - (midLon - ascLongitude)) * (Math.PI / 180);
            const numRadius = 35;
            const numPos = {
              x: cx + Math.cos(midAngle) * numRadius,
              y: cy - Math.sin(midAngle) * numRadius
            };
            
            const isAngular = num === 1 || num === 4 || num === 7 || num === 10;
            
            return (
              <g key={`house-${num}`}>
                <line
                  x1={outerPoint.x}
                  y1={outerPoint.y}
                  x2={innerPoint.x}
                  y2={innerPoint.y}
                  className={isAngular ? 'stroke-primary' : 'stroke-border'}
                  strokeWidth={isAngular ? 2 : 1}
                />
                <text
                  x={numPos.x}
                  y={numPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: '10px' }}
                >
                  {num}
                </text>
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle cx={cx} cy={cy} r={houseRingInner} className="fill-background stroke-border" strokeWidth="1" />
          
          {/* Planets */}
          {adjustedPositions.map(({ planet, adjustedLon, pos, radius }) => {
            const position = longitudeToPosition(adjustedLon, ascLongitude, radius, cx, cy);
            const symbol = PLANET_SYMBOLS[planet] || planet[0];
            const isRetro = pos.isRetrograde;
            
            return (
              <g key={planet}>
                {/* Planet marker */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={12}
                  className="fill-background stroke-primary"
                  strokeWidth="1.5"
                />
                <text
                  x={position.x}
                  y={position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-medium"
                  style={{ fontSize: planet === 'Ascendant' || planet === 'MC' ? '8px' : '12px' }}
                >
                  {symbol}
                </text>
                {isRetro && (
                  <text
                    x={position.x + 10}
                    y={position.y - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-destructive"
                    style={{ fontSize: '8px' }}
                  >
                    ℞
                  </text>
                )}
              </g>
            );
          })}
          
          {/* ASC/DC/MC/IC labels at edges */}
          <text x={cx - outerRadius - 10} y={cy} textAnchor="end" dominantBaseline="middle" className="fill-primary font-medium" style={{ fontSize: '12px' }}>AC</text>
          <text x={cx + outerRadius + 10} y={cy} textAnchor="start" dominantBaseline="middle" className="fill-primary font-medium" style={{ fontSize: '12px' }}>DC</text>
          
          {/* MC/IC based on house 10 and 4 */}
          {natalChart.houseCusps?.house10 && (() => {
            const mcLon = positionToLongitude({ sign: natalChart.houseCusps.house10.sign, degree: natalChart.houseCusps.house10.degree, minutes: natalChart.houseCusps.house10.minutes || 0, seconds: 0, isRetrograde: false });
            const mcPos = longitudeToPosition(mcLon, ascLongitude, outerRadius + 15, cx, cy);
            return <text x={mcPos.x} y={mcPos.y} textAnchor="middle" dominantBaseline="middle" className="fill-primary font-medium" style={{ fontSize: '12px' }}>MC</text>;
          })()}
          {natalChart.houseCusps?.house4 && (() => {
            const icLon = positionToLongitude({ sign: natalChart.houseCusps.house4.sign, degree: natalChart.houseCusps.house4.degree, minutes: natalChart.houseCusps.house4.minutes || 0, seconds: 0, isRetrograde: false });
            const icPos = longitudeToPosition(icLon, ascLongitude, outerRadius + 15, cx, cy);
            return <text x={icPos.x} y={icPos.y} textAnchor="middle" dominantBaseline="middle" className="fill-primary font-medium" style={{ fontSize: '12px' }}>IC</text>;
          })()}
        </svg>

        {/* Legend */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {adjustedPositions.map(({ planet, pos }) => (
            <div key={planet} className="flex items-center gap-2">
              <span className="text-lg">{PLANET_SYMBOLS[planet]}</span>
              <span className="text-muted-foreground">
                {planet === 'NorthNode' ? 'North Node' : planet}: {pos.degree}°{pos.minutes ? String(pos.minutes).padStart(2, '0') : '00'}′ {pos.sign}
                {pos.isRetrograde && <span className="text-destructive ml-1">℞</span>}
              </span>
            </div>
          ))}
        </div>

        {/* House Cusps Table */}
        {natalChart.houseCusps && (
          <div className="mt-8 w-full max-w-2xl">
            <h3 className="font-serif text-lg mb-3 text-center">House Cusps</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                const key = `house${num}` as keyof typeof natalChart.houseCusps;
                const cusp = natalChart.houseCusps![key];
                if (!cusp) return null;
                const label = num === 1 ? 'ASC' : num === 4 ? 'IC' : num === 7 ? 'DC' : num === 10 ? 'MC' : `H${num}`;
                return (
                  <div key={num} className={`p-2 rounded ${num === 1 || num === 4 || num === 7 || num === 10 ? 'bg-primary/10' : 'bg-secondary'}`}>
                    <span className="font-medium">{label}:</span> {cusp.degree}°{cusp.minutes ? String(cusp.minutes).padStart(2, '0') : '00'}′ {cusp.sign}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
