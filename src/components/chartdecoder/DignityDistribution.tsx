import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Home, Star, AlertCircle, Minus } from 'lucide-react';
import { PlanetaryCondition } from '@/lib/planetaryCondition';

interface DignityDistributionProps {
  conditions: PlanetaryCondition[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇'
};

interface DignityCategory {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  planets: PlanetaryCondition[];
  interpretation: string;
}

export const DignityDistribution: React.FC<DignityDistributionProps> = ({ conditions }) => {
  // Group by essential dignity
  const rulership = conditions.filter(c => c.essentialDignity === 'rulership');
  const exaltation = conditions.filter(c => c.essentialDignity === 'exaltation');
  const peregrine = conditions.filter(c => c.essentialDignity === 'peregrine');
  const detriment = conditions.filter(c => c.essentialDignity === 'detriment');
  const fall = conditions.filter(c => c.essentialDignity === 'fall');

  const categories: DignityCategory[] = [
    {
      label: 'Rulership',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      borderColor: 'border-emerald-500/30',
      icon: <Home size={12} className="text-emerald-500" />,
      planets: rulership,
      interpretation: 'At home—expressing naturally and powerfully'
    },
    {
      label: 'Exaltation',
      color: 'text-sky-600',
      bgColor: 'bg-sky-500',
      borderColor: 'border-sky-500/30',
      icon: <Star size={12} className="text-sky-500" />,
      planets: exaltation,
      interpretation: 'Elevated—expressing in an idealized way'
    },
    {
      label: 'Peregrine',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted-foreground',
      borderColor: 'border-border',
      icon: <Minus size={12} className="text-muted-foreground" />,
      planets: peregrine,
      interpretation: 'Neutral—adaptable, depends on context'
    },
    {
      label: 'Detriment',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-500/30',
      icon: <AlertCircle size={12} className="text-amber-500" />,
      planets: detriment,
      interpretation: 'Opposite home—requires strategy'
    },
    {
      label: 'Fall',
      color: 'text-rose-600',
      bgColor: 'bg-rose-500',
      borderColor: 'border-rose-500/30',
      icon: <AlertCircle size={12} className="text-rose-500" />,
      planets: fall,
      interpretation: 'Humbled—confidence earned through practice'
    }
  ];

  const totalPlanets = conditions.length;

  // Generate overall interpretation
  const generateInterpretation = (): string => {
    const strong = rulership.length + exaltation.length;
    const weak = detriment.length + fall.length;
    
    if (strong >= 4) {
      return 'Your chart has many planets in strong essential dignity—you have natural gifts that flow easily. Multiple inner resources are available.';
    }
    if (weak >= 4) {
      return 'Your chart has several planets working against their nature—this creates growth opportunities. Your wisdom is hard-won, which makes it valuable.';
    }
    if (peregrine.length >= 5) {
      return 'Most of your planets are peregrine (neutral)—your expression is flexible and context-dependent. How you use your planets matters more than their placement.';
    }
    return 'Your chart has a mix of dignities—some natural gifts, some growth areas, and flexible energies. This creates a balanced foundation.';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PieChart size={16} className="text-primary" />
          Essential Dignity Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          How your planets relate to the signs they're in
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Bar Distribution */}
        <div className="flex h-4 rounded-full overflow-hidden bg-muted/30">
          {categories.map((cat) => (
            cat.planets.length > 0 && (
              <div
                key={cat.label}
                className={`${cat.bgColor} transition-all`}
                style={{ width: `${(cat.planets.length / totalPlanets) * 100}%` }}
                title={`${cat.label}: ${cat.planets.length} planets`}
              />
            )
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className={`flex items-center gap-3 p-2 rounded-sm border ${
                cat.planets.length > 0 ? cat.borderColor : 'border-transparent'
              } ${cat.planets.length > 0 ? 'bg-background' : 'opacity-50'}`}
            >
              {/* Icon */}
              {cat.icon}

              {/* Label */}
              <div className="w-20">
                <span className={`text-xs font-medium ${cat.color}`}>
                  {cat.label}
                </span>
              </div>

              {/* Count */}
              <Badge 
                variant="outline" 
                className={`${cat.color} text-[10px] min-w-[24px] justify-center`}
              >
                {cat.planets.length}
              </Badge>

              {/* Planets */}
              <div className="flex-1 flex items-center gap-1.5">
                {cat.planets.length > 0 ? (
                  cat.planets.map((c) => (
                    <span 
                      key={c.planet} 
                      className="text-sm"
                      title={`${c.planet} in ${c.sign}`}
                    >
                      {PLANET_SYMBOLS[c.planet]}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground">—</span>
                )}
              </div>

              {/* Percentage */}
              {cat.planets.length > 0 && (
                <span className="text-[10px] text-muted-foreground w-10 text-right">
                  {Math.round((cat.planets.length / totalPlanets) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Interpretation */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
          <p className="text-xs text-foreground">
            {generateInterpretation()}
          </p>
        </div>

        {/* Minor Dignities Summary */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="text-xs text-muted-foreground">Triplicity</div>
            <div className="text-sm font-medium">
              {conditions.filter(c => c.hasTriplicityDignity).length}
            </div>
          </div>
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="text-xs text-muted-foreground">Terms</div>
            <div className="text-sm font-medium">
              {conditions.filter(c => c.hasTermDignity).length}
            </div>
          </div>
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="text-xs text-muted-foreground">Decan</div>
            <div className="text-sm font-medium">
              {conditions.filter(c => c.hasDecanDignity).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DignityDistribution;
