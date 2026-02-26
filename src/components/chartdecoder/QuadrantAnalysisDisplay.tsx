import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartPlanet, getPlanetSymbol } from '@/lib/chartDecoderLogic';
import { analyzeQuadrants, QuadrantAnalysis, getHemisphereSummary } from '@/lib/hemisphereAnalysis';
import { detectChartShape, ChartShape } from '@/lib/chartShapes';

interface QuadrantAnalysisDisplayProps {
  planets: ChartPlanet[];
}

export const QuadrantAnalysisDisplay: React.FC<QuadrantAnalysisDisplayProps> = ({ planets }) => {
  const analysis = analyzeQuadrants(planets);
  const chartShape = detectChartShape(planets);
  const hemisphereSummary = getHemisphereSummary(analysis);

  return (
    <div className="space-y-6">
      {/* Chart Shape */}
      <ChartShapeCard shape={chartShape} />

      {/* Quadrant Visual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quadrant Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <QuadrantCell 
              label="Q4: Career & Legacy"
              houses="10-12"
              data={analysis.q4}
              position="top-left"
            />
            <QuadrantCell 
              label="Q3: Relationship & Expansion"
              houses="7-9"
              data={analysis.q3}
              position="top-right"
            />
            <QuadrantCell 
              label="Q1: Self-Development"
              houses="1-3"
              data={analysis.q1}
              position="bottom-left"
            />
            <QuadrantCell 
              label="Q2: Security & Service"
              houses="4-6"
              data={analysis.q2}
              position="bottom-right"
            />
          </div>

          {/* Hemisphere Summary */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hemisphereSummary.map((summary, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {summary}
              </Badge>
            ))}
          </div>

          {/* Interpretation */}
          <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
            <p className="text-sm text-foreground">{analysis.interpretation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hemisphere Details */}
      <div className="grid grid-cols-2 gap-4">
        <HemisphereCard 
          title="Vertical Axis"
          upper={{ 
            label: 'Above Horizon (Public)', 
            percentage: analysis.hemispheres.upper.percentage,
            planets: analysis.hemispheres.upper.planets 
          }}
          lower={{ 
            label: 'Below Horizon (Private)', 
            percentage: analysis.hemispheres.lower.percentage,
            planets: analysis.hemispheres.lower.planets 
          }}
        />
        <HemisphereCard 
          title="Horizontal Axis"
          upper={{ 
            label: 'Eastern (Self-Initiated)', 
            percentage: analysis.hemispheres.eastern.percentage,
            planets: analysis.hemispheres.eastern.planets 
          }}
          lower={{ 
            label: 'Western (Other-Oriented)', 
            percentage: analysis.hemispheres.western.percentage,
            planets: analysis.hemispheres.western.planets 
          }}
        />
      </div>
    </div>
  );
};

// Sub-components
const ChartShapeCard: React.FC<{ shape: ChartShape }> = ({ shape }) => (
  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">Chart Shape Pattern</CardTitle>
        <Badge variant="outline" className="border-primary text-primary">
          {shape.confidence}% confidence
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <h3 className="text-2xl font-serif text-foreground">{shape.type}</h3>
        <p className="text-sm text-muted-foreground">{shape.description}</p>
      </div>
      
      <div className="bg-background/50 p-3 rounded-md">
        <p className="text-sm text-foreground">{shape.personality}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <span className="text-xs text-emerald-500 font-medium">Gift:</span>
          <p className="text-xs text-muted-foreground">{shape.gift}</p>
        </div>
        <div>
          <span className="text-xs text-amber-500 font-medium">Challenge:</span>
          <p className="text-xs text-muted-foreground">{shape.challenge}</p>
        </div>
      </div>

      {shape.leadPlanet && (
        <div className="pt-2 border-t border-border/50">
          <span className="text-xs text-primary font-medium">
            Lead Planet: {getPlanetSymbol(shape.leadPlanet)} {shape.leadPlanet}
          </span>
          <p className="text-xs text-muted-foreground mt-1">{shape.emptyArea}</p>
        </div>
      )}

      {shape.secondaryShape && shape.confidence < 100 && (
        <div className="pt-2 border-t border-border/50 bg-muted/30 -mx-3 px-3 pb-1 rounded-b-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground font-medium">Runner-up:</span>
            <Badge variant="outline" className="text-[10px] border-muted-foreground/30">
              {shape.secondaryShape.confidence}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{shape.secondaryShape.type}</span> — {shape.secondaryShape.description}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

interface QuadrantCellProps {
  label: string;
  houses: string;
  data: {
    planets: string[];
    count: number;
    percentage: number;
    theme: string;
    description: string;
  };
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const QuadrantCell: React.FC<QuadrantCellProps> = ({ label, houses, data, position }) => {
  const isEmpty = data.count === 0;
  const isHeavy = data.percentage >= 30;
  
  const roundedClasses = {
    'top-left': 'rounded-tl-lg',
    'top-right': 'rounded-tr-lg',
    'bottom-left': 'rounded-bl-lg',
    'bottom-right': 'rounded-br-lg'
  };

  return (
    <div 
      className={`
        p-3 border border-border/50 ${roundedClasses[position]}
        ${isHeavy ? 'bg-primary/10' : isEmpty ? 'bg-muted/30' : 'bg-secondary/30'}
        transition-colors
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Houses {houses}
        </span>
        <Badge variant={isHeavy ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
          {data.percentage}%
        </Badge>
      </div>
      
      <h4 className="text-xs font-medium text-foreground mb-1">{label}</h4>
      
      <div className="flex flex-wrap gap-1">
        {data.planets.length > 0 ? (
          data.planets.map(planet => (
            <span key={planet} className="text-sm" title={planet}>
              {getPlanetSymbol(planet)}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">Empty</span>
        )}
      </div>
    </div>
  );
};

interface HemisphereCardProps {
  title: string;
  upper: { label: string; percentage: number; planets: string[] };
  lower: { label: string; percentage: number; planets: string[] };
}

const HemisphereCard: React.FC<HemisphereCardProps> = ({ title, upper, lower }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-primary/60 transition-all"
          style={{ width: `${upper.percentage}%` }}
        />
        <div 
          className="absolute right-0 top-0 h-full bg-primary/30 transition-all"
          style={{ width: `${lower.percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <div>
          <span className="text-muted-foreground">{upper.label}</span>
          <span className="ml-1 text-foreground font-medium">{upper.percentage}%</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground">{lower.label}</span>
          <span className="ml-1 text-foreground font-medium">{lower.percentage}%</span>
        </div>
      </div>
      
      <div className="flex justify-between text-sm pt-1">
        <div className="flex flex-wrap gap-0.5">
          {upper.planets.map(p => (
            <span key={p} title={p}>{getPlanetSymbol(p)}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-0.5 justify-end">
          {lower.planets.map(p => (
            <span key={p} title={p}>{getPlanetSymbol(p)}</span>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default QuadrantAnalysisDisplay;
