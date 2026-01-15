import React, { useMemo, useState } from 'react';
import { ChartPlanet, getSignRuler, getPlanetSymbol, PLANET_MEANINGS } from '@/lib/chartDecoderLogic';
import { getDignityStatus } from '@/lib/planetDignities';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DispositorMapProps {
  planets: ChartPlanet[];
  useTraditional: boolean;
  onSelectPlanet?: (name: string) => void;
}

interface DispositorNode {
  name: string;
  sign: string;
  ruledBy: string;
  x: number;
  y: number;
}

interface MutualReception {
  planet1: string;
  planet2: string;
}

// Experiential descriptions for mutual reception pairs
const MUTUAL_RECEPTION_FEELINGS: Record<string, string> = {
  'Venus-Jupiter': 'Every decision filters through "Is this aligned with my values?" (Venus) AND "Does this have meaning/growth?" (Jupiter). You may struggle with purely practical choices that don\'t feel beautiful or meaningful.',
  'Jupiter-Venus': 'Every decision filters through "Is this aligned with my values?" (Venus) AND "Does this have meaning/growth?" (Jupiter). You may struggle with purely practical choices that don\'t feel beautiful or meaningful.',
  'Sun-Moon': 'Your identity and emotional needs work together seamlessly — what you want (Sun) and what you need (Moon) support each other.',
  'Moon-Sun': 'Your identity and emotional needs work together seamlessly — what you want (Sun) and what you need (Moon) support each other.',
  'Mars-Venus': 'Your drive (Mars) and values (Venus) trade off — you pursue what you love, and love fuels your action. Passion and aesthetics interweave.',
  'Venus-Mars': 'Your drive (Mars) and values (Venus) trade off — you pursue what you love, and love fuels your action. Passion and aesthetics interweave.',
  'Mercury-Venus': 'Your thinking (Mercury) and values (Venus) support each other — you communicate about what matters and find beauty in ideas.',
  'Venus-Mercury': 'Your thinking (Mercury) and values (Venus) support each other — you communicate about what matters and find beauty in ideas.',
  'Saturn-Mars': 'Your discipline (Saturn) and drive (Mars) trade keys — you act with structure, and structure fuels your action.',
  'Mars-Saturn': 'Your discipline (Saturn) and drive (Mars) trade keys — you act with structure, and structure fuels your action.',
};

// Get feeling description for any mutual reception
function getMutualReceptionFeeling(planet1: string, planet2: string): string {
  const key1 = `${planet1}-${planet2}`;
  const key2 = `${planet2}-${planet1}`;
  
  if (MUTUAL_RECEPTION_FEELINGS[key1]) return MUTUAL_RECEPTION_FEELINGS[key1];
  if (MUTUAL_RECEPTION_FEELINGS[key2]) return MUTUAL_RECEPTION_FEELINGS[key2];
  
  // Generate a generic description
  const meaning1 = PLANET_MEANINGS[planet1]?.split(',')[0] || planet1;
  const meaning2 = PLANET_MEANINGS[planet2]?.split(',')[0] || planet2;
  
  return `${planet1} (${meaning1.toLowerCase()}) and ${planet2} (${meaning2.toLowerCase()}) trade keys and strengthen each other. When you express one, you naturally draw on the other.`;
}

export const DispositorMap: React.FC<DispositorMapProps> = ({
  planets,
  useTraditional,
  onSelectPlanet
}) => {
  const [guideOpen, setGuideOpen] = useState(false);

  // Build dispositor relationships
  const { nodes, edges, finalDispositors, mutualReceptions } = useMemo(() => {
    const planetMap = new Map<string, ChartPlanet>();
    planets.forEach(p => planetMap.set(p.name, p));

    const mainPlanets = planets.filter(p => 
      !['Ascendant', 'Midheaven', 'NorthNode', 'SouthNode', 'Chiron'].includes(p.name)
    );

    // Position nodes in a circle
    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / mainPlanets.length;

    const nodesResult: DispositorNode[] = mainPlanets.map((planet, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      return {
        name: planet.name,
        sign: planet.sign,
        ruledBy: getSignRuler(planet.sign, useTraditional),
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Build edges (who reports to whom)
    const edgesResult: Array<{ from: string; to: string }> = [];
    const finalsResult: string[] = [];
    const mutualReceptionsResult: MutualReception[] = [];

    // First pass: find self-rulers and build edges
    nodesResult.forEach(node => {
      if (node.ruledBy === node.name) {
        // Self-ruling = final dispositor
        finalsResult.push(node.name);
      } else if (planetMap.has(node.ruledBy)) {
        edgesResult.push({ from: node.name, to: node.ruledBy });
      }
    });

    // Second pass: detect mutual receptions
    nodesResult.forEach(node1 => {
      nodesResult.forEach(node2 => {
        if (node1.name !== node2.name) {
          // Check if they rule each other's signs
          if (node1.ruledBy === node2.name && node2.ruledBy === node1.name) {
            // Avoid duplicates
            const alreadyFound = mutualReceptionsResult.some(mr =>
              (mr.planet1 === node1.name && mr.planet2 === node2.name) ||
              (mr.planet1 === node2.name && mr.planet2 === node1.name)
            );
            if (!alreadyFound) {
              mutualReceptionsResult.push({ planet1: node1.name, planet2: node2.name });
            }
          }
        }
      });
    });

    return { 
      nodes: nodesResult, 
      edges: edgesResult, 
      finalDispositors: finalsResult,
      mutualReceptions: mutualReceptionsResult
    };
  }, [planets, useTraditional]);

  const getNodePosition = (name: string) => {
    const node = nodes.find(n => n.name === name);
    return node ? { x: node.x, y: node.y } : { x: 200, y: 150 };
  };

  // Check if a planet is part of a mutual reception
  const isInMutualReception = (name: string) => {
    return mutualReceptions.some(mr => mr.planet1 === name || mr.planet2 === name);
  };

  // Build display string for finals
  const getFinalsDisplay = () => {
    const parts: string[] = [];
    
    // Add self-rulers
    finalDispositors.forEach(f => parts.push(f));
    
    // Add mutual receptions (if not already self-rulers)
    mutualReceptions.forEach(mr => {
      if (!finalDispositors.includes(mr.planet1) && !finalDispositors.includes(mr.planet2)) {
        parts.push(`${mr.planet1} ↔ ${mr.planet2}`);
      }
    });
    
    return parts.length > 0 ? parts.join(', ') : 'None (loop)';
  };

  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      {/* Intro explanation */}
      <div className="mb-4 p-3 bg-background/50 rounded-md border border-border/50">
        <h4 className="text-sm font-medium mb-2">What is a Dispositor?</h4>
        <p className="text-xs text-muted-foreground mb-2">
          Every planet "reports to" the planet that rules its sign. This creates a chain of command in your chart.
        </p>
        
        {/* Scenario explanations */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-primary text-xs mt-0.5">●</span>
            <p className="text-xs text-muted-foreground">
              <strong>Planet in own sign</strong> (dashed ring): Answers to no one. Pure and self-directed in your chart.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-xs mt-0.5">●</span>
            <p className="text-xs text-muted-foreground">
              <strong>Mutual reception</strong> (double ring): Two planets swap keys and support each other. Together they're the command center.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground text-xs mt-0.5">→</span>
            <p className="text-xs text-muted-foreground">
              <strong>Simple chain</strong>: Follow the arrow to see who's giving orders.
            </p>
          </div>
        </div>

        {/* Mutual reception feeling */}
        {mutualReceptions.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 mt-2">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
              Your Command Center: {mutualReceptions.map(mr => `${mr.planet1} ↔ ${mr.planet2}`).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              {getMutualReceptionFeeling(mutualReceptions[0].planet1, mutualReceptions[0].planet2)}
            </p>
          </div>
        )}
      </div>

      {/* How to Read Guide - Collapsible */}
      <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2 bg-primary/10 rounded-md mb-3 hover:bg-primary/20 transition-colors">
          <span className="text-xs font-medium">📖 How to Explain This in a Reading</span>
          {guideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 bg-background/50 rounded-md border border-border/50 mb-3 space-y-3">
            <div>
              <p className="text-xs font-medium mb-1">Step-by-step script:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
                <li>"Pick any planet — let's start with your Sun. What sign is it in?"</li>
                <li>"Who rules that sign? That's where your Sun 'reports' for instructions."</li>
                <li>"Now follow THAT planet — what sign is IT in? Who rules that?"</li>
                <li>"Keep following until you hit a planet in its own sign (final boss) OR two planets ruling each other's signs (mutual reception loop)."</li>
              </ol>
            </div>
            
            {mutualReceptions.length > 0 && (
              <div className="bg-secondary/30 p-2 rounded">
                <p className="text-xs font-medium mb-1">For this chart:</p>
                <p className="text-xs text-muted-foreground">
                  "Every planet eventually reports to {mutualReceptions[0].planet1} and {mutualReceptions[0].planet2}. 
                  These two trade keys — they're in each other's signs. This means your whole chart filters through their themes."
                </p>
              </div>
            )}

            {finalDispositors.length > 0 && mutualReceptions.length === 0 && (
              <div className="bg-secondary/30 p-2 rounded">
                <p className="text-xs font-medium mb-1">For this chart:</p>
                <p className="text-xs text-muted-foreground">
                  "{finalDispositors.join(' and ')} {finalDispositors.length > 1 ? 'are' : 'is'} in {finalDispositors.length > 1 ? 'their' : 'its'} own sign — 
                  the final boss of the chain. Everything connects back here."
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium mb-1">How clients feel this:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• They naturally filter decisions through the final dispositor's themes</li>
                <li>• Choices that don't honor these themes feel "off" or unsatisfying</li>
                <li>• Growth edge: consciously working WITH this filter, not fighting it</li>
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Dispositor Flow
        </h4>
        <span className="text-xs text-primary">
          Final: {getFinalsDisplay()}
        </span>
      </div>

      <svg viewBox="0 0 400 300" className="w-full h-auto max-h-[300px]">
        {/* Draw edges (arrows) */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--muted-foreground))"
              opacity="0.5"
            />
          </marker>
        </defs>

        {/* Draw mutual reception arcs */}
        {mutualReceptions.map((mr, i) => {
          const pos1 = getNodePosition(mr.planet1);
          const pos2 = getNodePosition(mr.planet2);
          
          // Draw a curved connecting line between mutual reception pairs
          const midX = (pos1.x + pos2.x) / 2;
          const midY = (pos1.y + pos2.y) / 2;
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Offset the control point perpendicular to the line
          const perpX = -dy / dist * 30;
          const perpY = dx / dist * 30;
          const ctrlX = midX + perpX;
          const ctrlY = midY + perpY;

          return (
            <path
              key={`mr-${i}`}
              d={`M ${pos1.x} ${pos1.y} Q ${ctrlX} ${ctrlY} ${pos2.x} ${pos2.y}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="6 3"
              opacity="0.6"
            />
          );
        })}

        {edges.map((edge, i) => {
          const from = getNodePosition(edge.from);
          const to = getNodePosition(edge.to);
          
          // Shorten the line to not overlap with circles
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offset = 28; // radius of circle + margin
          
          const startX = from.x + (dx / dist) * offset;
          const startY = from.y + (dy / dist) * offset;
          const endX = to.x - (dx / dist) * offset;
          const endY = to.y - (dy / dist) * offset;

          return (
            <line
              key={i}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Draw nodes */}
        {nodes.map((node) => {
          const status = getDignityStatus(node.name, node.sign);
          const isFinal = finalDispositors.includes(node.name);
          const isMutualReception = isInMutualReception(node.name);

          return (
            <g
              key={node.name}
              onClick={() => onSelectPlanet?.(node.name)}
              className="cursor-pointer"
            >
              {/* Outer ring for mutual reception (double ring) */}
              {isMutualReception && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={32}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.7"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </>
              )}
              
              {/* Outer ring for final dispositors (single dashed ring) */}
              {isFinal && !isMutualReception && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}
              
              {/* Main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={24}
                fill={status.bgColor}
                stroke={status.color}
                strokeWidth="2"
              />
              
              {/* Planet symbol */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
                fill={status.color}
                fontWeight="500"
              >
                {getPlanetSymbol(node.name)}
              </text>

              {/* Planet name below */}
              <text
                x={node.x}
                y={node.y + 38}
                textAnchor="middle"
                fontSize="9"
                fill="hsl(var(--muted-foreground))"
                className="uppercase tracking-wider"
              >
                {node.name.length > 6 ? node.name.substring(0, 5) : node.name}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Tap any planet to see its full card. Arrows show the chain of command.
        {mutualReceptions.length > 0 && ' Curved dashed lines connect mutual receptions.'}
      </p>
    </div>
  );
};
