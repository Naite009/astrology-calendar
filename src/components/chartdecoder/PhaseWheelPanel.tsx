import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { 
  computePhaseWheelData, 
  PLANET_SYMBOLS, 
  PhaseWheelData,
  PlanetPhaseResult,
  QUADRANT_MEANINGS 
} from '@/lib/phaseAspects';

interface PhaseWheelPanelProps {
  planets: Array<{ name: string; sign: string; degree: number }>;
  initialFocusPlanet?: string;
  onFocusChange?: (planet: string) => void;
}

// SVG Phase Wheel Component
const PhaseWheelSVG: React.FC<{ data: PhaseWheelData }> = ({ data }) => {
  const size = 320;
  const center = size / 2;
  const radius = 130;
  const innerRadius = 40;
  
  // 16 spoke angles (0° at top, counter-clockwise)
  const spokeAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const majorAngles = [0, 90, 180, 270];
  
  // Convert separation degree to SVG angle (0° at top, counter-clockwise)
  const toSvgAngle = (deg: number) => {
    return (deg - 90) * (Math.PI / 180);
  };
  
  const getPointOnCircle = (angle: number, r: number) => {
    const svgAngle = toSvgAngle(angle);
    return {
      x: center + r * Math.cos(svgAngle),
      y: center + r * Math.sin(svgAngle),
    };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {/* Background circle */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />
      
      {/* Quadrant fills */}
      <path
        d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius} ${center} Z`}
        fill="hsl(var(--primary))"
        fillOpacity={0.03}
      />
      <path
        d={`M ${center} ${center} L ${center + radius} ${center} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} Z`}
        fill="hsl(var(--chart-2))"
        fillOpacity={0.03}
      />
      <path
        d={`M ${center} ${center} L ${center} ${center + radius} A ${radius} ${radius} 0 0 1 ${center - radius} ${center} Z`}
        fill="hsl(var(--chart-3))"
        fillOpacity={0.03}
      />
      <path
        d={`M ${center} ${center} L ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center} ${center - radius} Z`}
        fill="hsl(var(--chart-4))"
        fillOpacity={0.03}
      />
      
      {/* Crosshair lines */}
      <line x1={center} y1={center - radius - 10} x2={center} y2={center + radius + 10} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
      <line x1={center - radius - 10} y1={center} x2={center + radius + 10} y2={center} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
      
      {/* 16 spokes */}
      {spokeAngles.map(angle => {
        const outer = getPointOnCircle(angle, radius);
        const inner = getPointOnCircle(angle, innerRadius + 10);
        const isMajor = majorAngles.includes(angle);
        return (
          <line
            key={angle}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeOpacity={isMajor ? 0.3 : 0.1}
            strokeWidth={isMajor ? 1.5 : 1}
            strokeDasharray={isMajor ? undefined : '2,2'}
          />
        );
      })}
      
      {/* Major angle labels */}
      <text x={center} y={center - radius - 15} textAnchor="middle" className="text-[10px] fill-muted-foreground">0°</text>
      <text x={center + radius + 15} y={center + 4} textAnchor="start" className="text-[10px] fill-muted-foreground">90°</text>
      <text x={center} y={center + radius + 20} textAnchor="middle" className="text-[10px] fill-muted-foreground">180°</text>
      <text x={center - radius - 15} y={center + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">270°</text>
      
      {/* Quadrant labels */}
      <text x={center + 45} y={center - 45} textAnchor="middle" className="text-[9px] fill-primary font-medium">PLAN</text>
      <text x={center + 45} y={center + 55} textAnchor="middle" className="text-[9px] fill-muted-foreground font-medium">EMBODY</text>
      <text x={center - 45} y={center + 55} textAnchor="middle" className="text-[9px] fill-muted-foreground font-medium">EXPERIENCE</text>
      <text x={center - 45} y={center - 45} textAnchor="middle" className="text-[9px] fill-muted-foreground font-medium">KNOW</text>
      
      {/* Side labels */}
      <text x={center + radius + 5} y={center - 70} textAnchor="start" className="text-[8px] fill-emerald-500 font-medium">
        <tspan>Waxing</tspan>
      </text>
      <text x={center + radius + 5} y={center - 58} textAnchor="start" className="text-[7px] fill-emerald-500/70">
        Give/Build →
      </text>
      
      <text x={center - radius - 5} y={center - 70} textAnchor="end" className="text-[8px] fill-amber-500 font-medium">
        Waning
      </text>
      <text x={center - radius - 5} y={center - 58} textAnchor="end" className="text-[7px] fill-amber-500/70">
        ← Take/Integrate
      </text>
      
      {/* Top/Bottom labels */}
      <text x={center + 85} y={center - radius + 25} textAnchor="middle" className="text-[7px] fill-muted-foreground">Inner</text>
      <text x={center + 85} y={center + radius - 15} textAnchor="middle" className="text-[7px] fill-muted-foreground">Outer</text>
      
      {/* Focus planet at center */}
      <circle cx={center} cy={center} r={innerRadius} fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={2} />
      <text x={center} y={center + 6} textAnchor="middle" className="text-xl fill-primary font-medium">
        {data.focusSymbol}
      </text>
      
      {/* Plot planets */}
      {data.planets.map((planet, i) => {
        const plotRadius = radius - 25;
        const point = getPointOnCircle(planet.separationDegrees, plotRadius);
        const isWaxing = planet.phaseAspect.phase === 'waxing';
        
        return (
          <g key={planet.planet}>
            <circle
              cx={point.x}
              cy={point.y}
              r={14}
              fill={isWaxing ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
              fillOpacity={0.2}
              stroke={isWaxing ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
              strokeWidth={1.5}
            />
            <text
              x={point.x}
              y={point.y + 5}
              textAnchor="middle"
              className="text-sm font-medium"
              fill={isWaxing ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
            >
              {planet.symbol}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Planet Picker Grid
const PlanetPicker: React.FC<{
  planets: Array<{ name: string; sign: string; degree: number }>;
  selected: string;
  onSelect: (name: string) => void;
}> = ({ planets, selected, onSelect }) => {
  const mainPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const outerPlanets = ['Uranus', 'Neptune', 'Pluto'];
  
  const renderButton = (name: string) => {
    const planet = planets.find(p => p.name === name);
    if (!planet) return null;
    
    const isSelected = selected === name;
    
    return (
      <button
        key={name}
        onClick={() => onSelect(name)}
        className={`
          flex flex-col items-center justify-center p-2 rounded-lg transition-all
          border min-w-[60px]
          ${isSelected 
            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }
        `}
      >
        <span className={`text-xl ${isSelected ? 'text-primary' : 'text-foreground'}`}>
          {PLANET_SYMBOLS[name] || '?'}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
          {name.length > 6 ? name.substring(0, 5) + '.' : name}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {mainPlanets.map(renderButton)}
      </div>
      <div className="flex flex-wrap gap-2">
        {outerPlanets.map(renderButton)}
      </div>
    </div>
  );
};

// Summary Cards
const SummaryCards: React.FC<{ data: PhaseWheelData }> = ({ data }) => {
  const waxingCount = data.waxingPlanets.length;
  const waningCount = data.waningPlanets.length;
  const innerCount = data.innerPlanets.length;
  const outerCount = data.outerPlanets.length;
  
  const getSummaryInterpretation = (type: 'waxing' | 'waning' | 'inner' | 'outer' | 'quadrant') => {
    switch (type) {
      case 'waxing':
        if (waxingCount > waningCount) return `Relative to ${data.focusPlanet}, you're actively building—effort and choice define these themes.`;
        return `These planets are developing in relation to ${data.focusPlanet}—still under construction.`;
      case 'waning':
        if (waningCount > waxingCount) return `Relative to ${data.focusPlanet}, you carry earned wisdom—integration over initiation.`;
        return `These planets offer refined gifts relative to ${data.focusPlanet}—harvest mode.`;
      case 'inner':
        if (innerCount > outerCount) return `${data.focusPlanet} energy is mostly processed privately—internal before external.`;
        return `Some ${data.focusPlanet} themes stay internal—requiring reflection before action.`;
      case 'outer':
        if (outerCount > innerCount) return `${data.focusPlanet} energy is lived outwardly—visible expression dominates.`;
        return `Some ${data.focusPlanet} themes manifest externally—visible to the world.`;
      case 'quadrant':
        return QUADRANT_MEANINGS[data.dominantQuadrant];
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Waxing Card */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Give / Build</span>
            <Badge variant="outline" className="ml-auto text-[10px] border-emerald-500/50 text-emerald-600">
              {waxingCount}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {data.waxingPlanets.slice(0, 5).map(p => (
              <span key={p.planet} className="text-lg">{p.symbol}</span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">{getSummaryInterpretation('waxing')}</p>
        </CardContent>
      </Card>
      
      {/* Waning Card */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeft className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Take / Integrate</span>
            <Badge variant="outline" className="ml-auto text-[10px] border-amber-500/50 text-amber-600">
              {waningCount}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {data.waningPlanets.slice(0, 5).map(p => (
              <span key={p.planet} className="text-lg">{p.symbol}</span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">{getSummaryInterpretation('waning')}</p>
        </CardContent>
      </Card>
      
      {/* Inner vs Outer Card */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-foreground">Inner vs Outer</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Inner: {innerCount}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Outer: {outerCount}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {innerCount > outerCount ? getSummaryInterpretation('inner') : getSummaryInterpretation('outer')}
          </p>
        </CardContent>
      </Card>
      
      {/* Quadrant Emphasis Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary">Quadrant Emphasis</span>
          </div>
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {Object.entries(data.quadrantCounts).map(([quad, count]) => (
              <Badge 
                key={quad} 
                variant={quad === data.dominantQuadrant ? 'default' : 'outline'}
                className="text-[9px]"
              >
                {quad}: {count}
              </Badge>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Dominant: <span className="text-primary font-medium">{data.dominantQuadrant}</span> — {getSummaryInterpretation('quadrant')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Detailed Table
const PhaseTable: React.FC<{ data: PhaseWheelData }> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 text-[10px] uppercase tracking-wider text-muted-foreground">Planet</th>
            <th className="text-left p-2 text-[10px] uppercase tracking-wider text-muted-foreground">Degrees</th>
            <th className="text-left p-2 text-[10px] uppercase tracking-wider text-muted-foreground">Phase Aspect</th>
            <th className="text-left p-2 text-[10px] uppercase tracking-wider text-muted-foreground">Zone</th>
            <th className="text-left p-2 text-[10px] uppercase tracking-wider text-muted-foreground">Tags</th>
            <th className="text-left p-2 text-[10px] uppercase tracking-wider text-muted-foreground">Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {data.planets.map(planet => {
            const isWaxing = planet.phaseAspect.phase === 'waxing';
            return (
              <tr key={planet.planet} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{planet.symbol}</span>
                    <span className="font-medium text-foreground">{planet.planet}</span>
                  </div>
                </td>
                <td className="p-2 text-muted-foreground font-mono text-xs">
                  {planet.separationDegrees.toFixed(1)}°
                </td>
                <td className="p-2">
                  <span className={`text-xs font-medium ${isWaxing ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {planet.phaseAspect.name}
                  </span>
                </td>
                <td className="p-2 text-xs text-muted-foreground font-mono">
                  {planet.phaseAspect.baseAngle}°
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {planet.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[9px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-2 text-xs text-muted-foreground max-w-[250px]">
                  {planet.interpretation}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Main Component
export const PhaseWheelPanel: React.FC<PhaseWheelPanelProps> = ({
  planets,
  initialFocusPlanet = 'Sun',
  onFocusChange,
}) => {
  const [focusPlanet, setFocusPlanet] = useState(initialFocusPlanet);
  
  const handleFocusChange = (planet: string) => {
    setFocusPlanet(planet);
    onFocusChange?.(planet);
  };
  
  const phaseData = useMemo(() => {
    return computePhaseWheelData(focusPlanet, planets);
  }, [focusPlanet, planets]);

  if (planets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No chart data available. Load a chart to view phase relationships.
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="phase-wheel" className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
            Phase Wheels
            <span className="text-sm text-muted-foreground font-normal">(Full-Phase Aspects)</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a planet. See how every other planet is developing relative to it (waxing vs waning) across 16 phase aspects.
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs">
              <HelpCircle className="h-4 w-4" />
              What does waxing/waning mean?
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm">
            <p className="mb-2">
              <strong>Waxing</strong> (0°–180°): The planet is "building toward" the focus—active development, effort, becoming.
            </p>
            <p>
              <strong>Waning</strong> (180°–360°): The planet has "passed" the focus—integration, wisdom, release, harvest.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Planet Picker */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Focus Planet</h4>
        <PlanetPicker 
          planets={planets} 
          selected={focusPlanet} 
          onSelect={handleFocusChange}
        />
      </div>
      
      {/* The Wheel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-2xl">{phaseData.focusSymbol}</span>
            Phase Wheel for {focusPlanet}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhaseWheelSVG data={phaseData} />
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <SummaryCards data={phaseData} />
      
      {/* Detailed Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Detailed Phase Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <PhaseTable data={phaseData} />
        </CardContent>
      </Card>
    </div>
  );
};
