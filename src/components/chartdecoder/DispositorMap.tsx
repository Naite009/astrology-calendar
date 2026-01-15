import React, { useMemo } from 'react';
import { ChartPlanet, getSignRuler, getPlanetSymbol } from '@/lib/chartDecoderLogic';
import { getDignityStatus } from '@/lib/planetDignities';

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

export const DispositorMap: React.FC<DispositorMapProps> = ({
  planets,
  useTraditional,
  onSelectPlanet
}) => {
  // Build dispositor relationships
  const { nodes, edges, finalDispositors } = useMemo(() => {
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

    nodesResult.forEach(node => {
      if (node.ruledBy === node.name) {
        // Self-ruling = final dispositor
        finalsResult.push(node.name);
      } else if (planetMap.has(node.ruledBy)) {
        edgesResult.push({ from: node.name, to: node.ruledBy });
      }
    });

    return { nodes: nodesResult, edges: edgesResult, finalDispositors: finalsResult };
  }, [planets, useTraditional]);

  const getNodePosition = (name: string) => {
    const node = nodes.find(n => n.name === name);
    return node ? { x: node.x, y: node.y } : { x: 200, y: 150 };
  };

  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Dispositor Flow
        </h4>
        {finalDispositors.length > 0 && (
          <span className="text-xs text-primary">
            Final: {finalDispositors.join(', ')}
          </span>
        )}
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

          return (
            <g
              key={node.name}
              onClick={() => onSelectPlanet?.(node.name)}
              className="cursor-pointer"
            >
              {/* Outer ring for final dispositors */}
              {isFinal && (
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
        Arrows show who each planet "reports to" (its dispositor). Dashed rings = final dispositors.
      </p>
    </div>
  );
};
