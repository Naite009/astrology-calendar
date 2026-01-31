import { HDPlanetaryActivation } from '@/types/humanDesign';

interface HDActivationsTableProps {
  personalityActivations: HDPlanetaryActivation[];
  designActivations: HDPlanetaryActivation[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Earth: '⊕',
  Moon: '☽',
  NorthNode: '☊',
  SouthNode: '☋',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

export const HDActivationsTable = ({
  personalityActivations,
  designActivations,
}: HDActivationsTableProps) => {
  const planets = [
    'Sun', 'Earth', 'NorthNode', 'SouthNode', 'Moon',
    'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto'
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              Planet
            </th>
            <th className="py-2 text-center text-[10px] uppercase tracking-widest text-foreground">
              Personality
              <span className="ml-1 text-muted-foreground">(Conscious)</span>
            </th>
            <th className="py-2 text-center text-[10px] uppercase tracking-widest text-red-400">
              Design
              <span className="ml-1 text-muted-foreground">(Unconscious)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {planets.map(planet => {
            const personality = personalityActivations.find(a => a.planet === planet);
            const design = designActivations.find(a => a.planet === planet);

            return (
              <tr key={planet} className="border-b border-border/50">
                <td className="py-3">
                  <span className="mr-2 text-lg">{PLANET_SYMBOLS[planet]}</span>
                  <span className="text-muted-foreground">{planet}</span>
                </td>
                <td className="py-3 text-center">
                  {personality && (
                    <span className="font-mono text-foreground">
                      {personality.gate}.{personality.line}
                    </span>
                  )}
                </td>
                <td className="py-3 text-center">
                  {design && (
                    <span className="font-mono text-red-400">
                      {design.gate}.{design.line}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
