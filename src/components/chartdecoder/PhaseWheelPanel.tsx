import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HelpCircle, ArrowRight, ArrowLeft, ChevronDown, BookOpen, User } from 'lucide-react';
import { 
  computePhaseWheelData, 
  PLANET_SYMBOLS, 
  PhaseWheelData,
  PlanetPhaseResult,
  QUADRANT_MEANINGS 
} from '@/lib/phaseAspects';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';

interface PhaseWheelPanelProps {
  planets: Array<{ name: string; sign: string; degree: number }>;
  initialFocusPlanet?: string;
  onFocusChange?: (planet: string) => void;
  // Chart selector props
  userNatalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
  selectedChartId?: string;
  onChartSelect?: (id: string) => void;
  selectedChartName?: string;
}

// Phase aspect educational descriptions
const PHASE_TEACHINGS: Record<string, { meaning: string; lifeExample: string }> = {
  'New Phase': {
    meaning: 'Two planets occupy nearly the same degree. Their energies are fused — you can\'t tell where one ends and the other begins. Pure instinct, no perspective yet.',
    lifeExample: 'Like the first day of a new job — excitement and uncertainty blended together. You act before you understand why.',
  },
  'Crescent Phase': {
    meaning: 'The faster planet has pulled ahead 45°–90°. A struggle to break free from old patterns. Momentum is building but meets resistance.',
    lifeExample: 'Like a seedling pushing through soil. You feel the pull forward but the old way keeps dragging back.',
  },
  'First Quarter': {
    meaning: 'At 90° separation, a crisis of action. What was seeded at the conjunction must now be built in the real world — decisions are forced.',
    lifeExample: 'Like hitting a wall during a project. You either commit fully or abandon ship. There\'s no coasting.',
  },
  'Gibbous Phase': {
    meaning: 'Between 135°–180°, the energy is refining. You\'re adjusting, improving, perfecting what you\'ve built. Self-analysis intensifies.',
    lifeExample: 'Like editing a rough draft. The core idea exists, but it needs polish before it\'s ready for the world.',
  },
  'Full Phase': {
    meaning: 'At 180° (opposition), maximum illumination. You finally see the whole picture. Relationships and objectivity peak — what was unconscious becomes conscious.',
    lifeExample: 'Like a Full Moon lighting up the night. Everything is visible — including what you\'d rather not see.',
  },
  'Disseminating Phase': {
    meaning: 'Past 180°, now waning 225°–270° range. You share what you\'ve learned. Teaching, distributing, and spreading meaning from the Full Phase revelation.',
    lifeExample: 'Like a teacher who has mastered a subject and now gives it away. The gift is in sharing, not holding.',
  },
  'Last Quarter': {
    meaning: 'At 270° (waning square), a crisis of consciousness. Old structures must be torn down to make room. You question what you once believed.',
    lifeExample: 'Like clearing out a house before a move. You keep only what truly matters.',
  },
  'Balsamic Phase': {
    meaning: 'The final phase (315°–360°). Surrender, release, distillation. The seed of the next cycle is forming in the darkness.',
    lifeExample: 'Like the exhale before a new breath. Letting go is the most powerful act — it creates space for what comes next.',
  },
};

// Quadrant educational content
const QUADRANT_TEACHINGS = {
  Plan: {
    degrees: '0° – 90°',
    theme: 'Intent & Vision',
    description: 'Planets here are developing a new vision relative to the focus planet. The energy is forward-looking, instinctive, and driven by possibility rather than experience.',
    keyword: 'What do I want to create?',
  },
  Embody: {
    degrees: '90° – 180°',
    theme: 'Action & Building',
    description: 'Planets here are actively constructing something tangible. The vision from the Plan quadrant now demands real-world effort, commitment, and problem-solving.',
    keyword: 'How do I make it real?',
  },
  Experience: {
    degrees: '180° – 270°',
    theme: 'Feedback & Sharing',
    description: 'Planets here have reached illumination and are now distributing what they\'ve learned. The focus shifts from building to understanding and sharing meaning.',
    keyword: 'What did I learn?',
  },
  Know: {
    degrees: '270° – 360°',
    theme: 'Wisdom & Release',
    description: 'Planets here carry earned wisdom. Old structures are dismantled to make room for the next cycle. This is harvest territory — deep knowing over fresh effort.',
    keyword: 'What must I release?',
  },
};

// SVG Phase Wheel Component - LARGER
const PhaseWheelSVG: React.FC<{ data: PhaseWheelData }> = ({ data }) => {
  const size = 520;
  const center = size / 2;
  const radius = 190;
  const innerRadius = 50;
  
  // 16 spoke angles (0° at top, counter-clockwise)
  const spokeAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const majorAngles = [0, 90, 180, 270];
  
  // Phase labels at their degree positions
  const phaseLabels = [
    { angle: 15, label: 'New', short: true },
    { angle: 67, label: 'Crescent', short: false },
    { angle: 112, label: '1st Qtr', short: false },
    { angle: 157, label: 'Gibbous', short: false },
    { angle: 195, label: 'Full', short: true },
    { angle: 247, label: 'Dissem.', short: false },
    { angle: 292, label: 'Last Qtr', short: false },
    { angle: 337, label: 'Balsamic', short: false },
  ];
  
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

  // Collision avoidance: adjust planet positions if they overlap
  const getAdjustedPlanetPositions = () => {
    const plotRadius = radius - 30;
    const positions = data.planets.map(planet => {
      const point = getPointOnCircle(planet.separationDegrees, plotRadius);
      return { ...planet, x: point.x, y: point.y, originalX: point.x, originalY: point.y };
    });

    // Check for overlaps and nudge
    const minDistance = 32;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance && dist > 0) {
          const nudge = (minDistance - dist) / 2;
          const nx = (dx / dist) * nudge;
          const ny = (dy / dist) * nudge;
          positions[i].x -= nx;
          positions[i].y -= ny;
          positions[j].x += nx;
          positions[j].y += ny;
        }
      }
    }
    return positions;
  };

  const adjustedPlanets = getAdjustedPlanetPositions();

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[520px] mx-auto overflow-visible">
      {/* Background circle */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />
      
      {/* Quadrant fills */}
      <path
        d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius} ${center} Z`}
        fill="hsl(var(--primary))"
        fillOpacity={0.04}
      />
      <path
        d={`M ${center} ${center} L ${center + radius} ${center} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} Z`}
        fill="hsl(var(--chart-2))"
        fillOpacity={0.04}
      />
      <path
        d={`M ${center} ${center} L ${center} ${center + radius} A ${radius} ${radius} 0 0 1 ${center - radius} ${center} Z`}
        fill="hsl(var(--chart-3))"
        fillOpacity={0.04}
      />
      <path
        d={`M ${center} ${center} L ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center} ${center - radius} Z`}
        fill="hsl(var(--chart-4))"
        fillOpacity={0.04}
      />
      
      {/* Crosshair lines */}
      <line x1={center} y1={center - radius - 15} x2={center} y2={center + radius + 15} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
      <line x1={center - radius - 15} y1={center} x2={center + radius + 15} y2={center} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
      
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
      <text x={center} y={center - radius - 20} textAnchor="middle" className="text-[11px] fill-muted-foreground font-medium">0°</text>
      <text x={center + radius + 20} y={center + 4} textAnchor="start" className="text-[11px] fill-muted-foreground font-medium">90°</text>
      <text x={center} y={center + radius + 28} textAnchor="middle" className="text-[11px] fill-muted-foreground font-medium">180°</text>
      <text x={center - radius - 20} y={center + 4} textAnchor="end" className="text-[11px] fill-muted-foreground font-medium">270°</text>
      
      {/* Quadrant labels - larger and clearer */}
      <text x={center + 60} y={center - 65} textAnchor="middle" className="text-[11px] fill-primary font-semibold">PLAN</text>
      <text x={center + 60} y={center - 52} textAnchor="middle" className="text-[8px] fill-primary/60">Intent</text>
      <text x={center + 60} y={center + 68} textAnchor="middle" className="text-[11px] fill-muted-foreground font-semibold">EMBODY</text>
      <text x={center + 60} y={center + 81} textAnchor="middle" className="text-[8px] fill-muted-foreground/60">Action</text>
      <text x={center - 60} y={center + 68} textAnchor="middle" className="text-[11px] fill-muted-foreground font-semibold">EXPERIENCE</text>
      <text x={center - 60} y={center + 81} textAnchor="middle" className="text-[8px] fill-muted-foreground/60">Feedback</text>
      <text x={center - 60} y={center - 65} textAnchor="middle" className="text-[11px] fill-muted-foreground font-semibold">KNOW</text>
      <text x={center - 60} y={center - 52} textAnchor="middle" className="text-[8px] fill-muted-foreground/60">Wisdom</text>
      
      {/* Side labels - Waxing / Waning */}
      <text x={center + radius + 10} y={center - 90} textAnchor="start" className="text-[10px] fill-emerald-500 font-semibold">Waxing</text>
      <text x={center + radius + 10} y={center - 76} textAnchor="start" className="text-[8px] fill-emerald-500/70">Give / Build →</text>
      
      <text x={center - radius - 10} y={center - 90} textAnchor="end" className="text-[10px] fill-amber-500 font-semibold">Waning</text>
      <text x={center - radius - 10} y={center - 76} textAnchor="end" className="text-[8px] fill-amber-500/70">← Take / Integrate</text>
      
      {/* Inner / Outer labels */}
      <text x={center + 110} y={center - radius + 35} textAnchor="middle" className="text-[8px] fill-muted-foreground">↑ Inner (private)</text>
      <text x={center + 110} y={center + radius - 25} textAnchor="middle" className="text-[8px] fill-muted-foreground">↓ Outer (visible)</text>
      
      {/* Phase labels on the outer ring */}
      {phaseLabels.map(({ angle, label }) => {
        const pt = getPointOnCircle(angle, radius + 28);
        return (
          <text
            key={label}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[8px] fill-muted-foreground/50 font-medium"
          >
            {label}
          </text>
        );
      })}
      
      {/* Focus planet at center */}
      <circle cx={center} cy={center} r={innerRadius} fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={2} />
      <text x={center} y={center + 8} textAnchor="middle" className="text-2xl fill-primary font-medium">
        {data.focusSymbol}
      </text>
      <text x={center} y={center + 22} textAnchor="middle" className="text-[8px] fill-primary/60 font-medium">
        {data.focusPlanet}
      </text>
      
      {/* Plot planets with collision avoidance */}
      {adjustedPlanets.map((planet) => {
        const isWaxing = planet.phaseAspect.phase === 'waxing';
        
        return (
          <g key={planet.planet}>
            {/* Connector line from original position to center */}
            <line
              x1={center}
              y1={center}
              x2={planet.originalX}
              y2={planet.originalY}
              stroke={isWaxing ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
              strokeOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="2,3"
            />
            <circle
              cx={planet.x}
              cy={planet.y}
              r={16}
              fill={isWaxing ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
              fillOpacity={0.15}
              stroke={isWaxing ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
              strokeWidth={1.5}
            />
            <text
              x={planet.x}
              y={planet.y + 5}
              textAnchor="middle"
              className="text-[14px] font-medium"
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

// How to Read This Wheel - teaching section
const HowToReadGuide: React.FC = () => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full">
        <BookOpen className="h-4 w-4" />
        <span>How to Read This Wheel</span>
        <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <div className="bg-secondary/50 p-4 rounded-lg text-sm text-foreground space-y-3">
          <p>
            <strong>The Phase Wheel shows one planet's relationship to every other planet</strong> — not by sign or house, but by the <em>developmental cycle</em> between them.
          </p>
          <p>
            Think of it like the Moon phases you already know: New Moon → Full Moon → back to New. Every pair of planets follows this same cycle, just over different timeframes.
          </p>
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider mb-1">Right Side = Waxing (0°–180°)</div>
              <p className="text-xs text-muted-foreground">Building phase. You're actively creating something with this energy. It takes <em>effort</em> — like planting and tending a garden.</p>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <div className="font-semibold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider mb-1">Left Side = Waning (180°–360°)</div>
              <p className="text-xs text-muted-foreground">Harvest phase. You've already built it — now you're sharing, teaching, and releasing. It feels more <em>natural</em> than forced.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 rounded-lg border border-border">
              <div className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Top Half = Inner</div>
              <p className="text-xs text-muted-foreground">Private processing. You feel it but others may not see it.</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <div className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Bottom Half = Outer</div>
              <p className="text-xs text-muted-foreground">Visible expression. This energy shows up in your actions and relationships.</p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Phase Meanings Reference
const PhaseMeaningsGuide: React.FC = () => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
        <HelpCircle className="h-4 w-4" />
        <span>The 8 Phases Explained</span>
        <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(PHASE_TEACHINGS).map(([phase, { meaning, lifeExample }]) => (
            <div key={phase} className="p-3 rounded-lg border border-border bg-card">
              <div className="font-semibold text-foreground text-sm mb-1">{phase}</div>
              <p className="text-xs text-muted-foreground mb-2">{meaning}</p>
              <p className="text-xs text-primary/80 italic">💡 {lifeExample}</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Quadrant Guide
const QuadrantGuide: React.FC = () => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
        <HelpCircle className="h-4 w-4" />
        <span>The 4 Quadrants Explained</span>
        <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(QUADRANT_TEACHINGS).map(([name, info]) => (
            <div key={name} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground text-sm">{name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{info.degrees}</span>
              </div>
              <div className="text-xs font-medium text-primary mb-1">{info.theme}</div>
              <p className="text-xs text-muted-foreground mb-1">{info.description}</p>
              <p className="text-xs text-primary/70 italic">"{info.keyword}"</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Main Component
export const PhaseWheelPanel: React.FC<PhaseWheelPanelProps> = ({
  planets,
  initialFocusPlanet = 'Sun',
  onFocusChange,
  userNatalChart,
  savedCharts = [],
  selectedChartId,
  onChartSelect,
  selectedChartName,
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
            Pick a planet. See how every other planet is developing relative to it — building something new (waxing) or harvesting wisdom (waning).
          </p>
        </div>
      </div>

      {/* Chart Selector — moved here from page header */}
      {onChartSelect && userNatalChart && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <User size={16} className="text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground flex-shrink-0">Personalize for:</span>
          <div className="flex-1">
            <ChartSelector
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
              selectedChartId={selectedChartId || ''}
              onSelect={onChartSelect}
              label=""
            />
          </div>
        </div>
      )}

      {selectedChartName && (
        <p className="text-xs text-muted-foreground italic">
          Showing current sky phase relationships. Select a chart above to see how today's planets relate to {selectedChartName}'s natal positions.
        </p>
      )}

      {/* How to Read Guide */}
      <HowToReadGuide />
      
      {/* Planet Picker */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Focus Planet</h4>
        <PlanetPicker 
          planets={planets} 
          selected={focusPlanet} 
          onSelect={handleFocusChange}
        />
      </div>
      
      {/* The Wheel - LARGER */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-2xl">{phaseData.focusSymbol}</span>
            Phase Wheel for {focusPlanet}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Every planet plotted by its angular separation from {focusPlanet}. Green (right) = waxing/building. Amber (left) = waning/harvesting.
          </p>
        </CardHeader>
        <CardContent>
          <PhaseWheelSVG data={phaseData} />
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <SummaryCards data={phaseData} />

      {/* Phase Meanings Reference */}
      <PhaseMeaningsGuide />

      {/* Quadrant Guide */}
      <QuadrantGuide />
      
      {/* Detailed Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Detailed Phase Analysis</CardTitle>
          <p className="text-xs text-muted-foreground">Each planet's exact phase relationship to {focusPlanet}, with interpretation.</p>
        </CardHeader>
        <CardContent>
          <PhaseTable data={phaseData} />
        </CardContent>
      </Card>
    </div>
  );
};
