import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";
import { HOUSE_HEALTH } from "@/lib/healthAstrology";

interface HouseHealthSystemProps {
  natalChart: NatalChart;
}

export const HouseHealthSystem = ({ natalChart }: HouseHealthSystemProps) => {
  const { houseCusps, planets } = natalChart;

  // Find planets in each house (simplified)
  const getPlanetsInHouse = (houseNum: number): string[] => {
    if (!houseCusps) return [];
    
    const houseKey = `house${houseNum}` as keyof typeof houseCusps;
    const nextHouseKey = `house${houseNum === 12 ? 1 : houseNum + 1}` as keyof typeof houseCusps;
    
    const houseCusp = houseCusps[houseKey];
    const nextCusp = houseCusps[nextHouseKey];
    
    if (!houseCusp) return [];
    
    const planetsInHouse: string[] = [];
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    // Simplified: just check if planet sign matches house cusp sign
    planetNames.forEach(name => {
      const planet = planets[name];
      if (planet?.sign === houseCusp.sign) {
        planetsInHouse.push(name);
      }
    });
    
    return planetsInHouse;
  };

  // Key health houses
  const keyHouses = [1, 6, 8, 12];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-primary" />
            Health Through the Houses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each house governs specific health areas. The 6th house is the primary health house, 
            but 1st (body), 8th (regeneration), and 12th (hidden issues) are also significant.
          </p>

          {/* Key Health Houses */}
          <div className="grid gap-4 md:grid-cols-2">
            {keyHouses.map(houseNum => {
              const houseInfo = HOUSE_HEALTH[houseNum];
              const houseKey = `house${houseNum}` as keyof typeof houseCusps;
              const houseCusp = houseCusps?.[houseKey];
              const planetsInHouse = getPlanetsInHouse(houseNum);
              
              return (
                <div
                  key={houseNum}
                  className={`rounded-sm border p-4 space-y-3 ${
                    houseNum === 6 ? 'border-primary/40 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">{houseNum}</span>
                      <span className="text-sm text-muted-foreground">
                        {houseCusp?.sign || 'Unknown'}
                      </span>
                    </div>
                    {houseNum === 6 && (
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm">{houseInfo.healthSignificance}</p>
                  
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Body Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {houseInfo.bodyParts.map((part, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{part}</Badge>
                      ))}
                    </div>
                  </div>

                  {planetsInHouse.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Planets Here:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {planetsInHouse.map((planet, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{planet}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* All Houses Reference */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Complete House Health Reference</h4>
            <div className="grid gap-2 md:grid-cols-3">
              {Object.entries(HOUSE_HEALTH).map(([num, info]) => (
                <div key={num} className="text-xs p-2 bg-muted/50 rounded-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{num}H</span>
                    {houseCusps && (
                      <span className="text-muted-foreground">
                        {houseCusps[`house${num}` as keyof typeof houseCusps]?.sign}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{info.bodyParts.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
