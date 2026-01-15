import React from 'react';
import { ChartPlanet, getPlanetSymbol, getSignSymbol, computeDignity } from '@/lib/chartDecoderLogic';
import { getDignityStatus } from '@/lib/planetDignities';

interface PlanetIconGridProps {
  planets: ChartPlanet[];
  selectedPlanet: string | null;
  onSelectPlanet: (name: string) => void;
}

export const PlanetIconGrid: React.FC<PlanetIconGridProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet
}) => {
  const mainPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const outerPlanets = ['Uranus', 'Neptune', 'Pluto'];
  const points = ['Chiron', 'NorthNode', 'Ascendant', 'Midheaven'];

  const renderPlanetButton = (planet: ChartPlanet) => {
    const dignity = computeDignity(planet.name, planet.sign);
    const status = getDignityStatus(planet.name, planet.sign);
    const isSelected = selectedPlanet === planet.name;

    return (
      <button
        key={planet.name}
        onClick={() => onSelectPlanet(planet.name)}
        className={`
          flex flex-col items-center justify-center p-3 rounded-lg transition-all
          border-2 min-w-[80px]
          ${isSelected 
            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }
        `}
        style={{
          borderColor: isSelected ? undefined : status.color,
          backgroundColor: isSelected ? undefined : `${status.bgColor}`
        }}
      >
        <span className="text-2xl font-medium" style={{ color: status.color }}>
          {getPlanetSymbol(planet.name)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
          {planet.name.length > 7 ? planet.name.substring(0, 6) + '.' : planet.name}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
          {getSignSymbol(planet.sign)}
          <span className="text-[10px]">{planet.degree.toFixed(0)}°</span>
          {planet.retrograde && <span className="text-[10px] text-amber-500">℞</span>}
        </span>
        {dignity !== 'peregrine' && (
          <span 
            className="text-[9px] uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded"
            style={{ backgroundColor: status.bgColor, color: status.color }}
          >
            {status.type}
          </span>
        )}
      </button>
    );
  };

  const getPlanetByName = (name: string) => planets.find(p => p.name === name);

  return (
    <div className="space-y-4">
      {/* Main Planets */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Personal & Social Planets</h4>
        <div className="flex flex-wrap gap-2">
          {mainPlanets.map(name => {
            const planet = getPlanetByName(name);
            return planet ? renderPlanetButton(planet) : null;
          })}
        </div>
      </div>

      {/* Outer Planets */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Outer Planets</h4>
        <div className="flex flex-wrap gap-2">
          {outerPlanets.map(name => {
            const planet = getPlanetByName(name);
            return planet ? renderPlanetButton(planet) : null;
          })}
        </div>
      </div>

      {/* Points */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Points</h4>
        <div className="flex flex-wrap gap-2">
          {points.map(name => {
            const planet = getPlanetByName(name);
            return planet ? renderPlanetButton(planet) : null;
          })}
        </div>
      </div>
    </div>
  );
};
