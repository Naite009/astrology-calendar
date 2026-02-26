import { PlanetHouseInfo } from '@/lib/narrativeAnalysisEngine';
import { ZodiacSignExplorer } from './ZodiacSignExplorer';
import { ElementDistributionCard } from './ElementDistributionCard';
import { Compass } from 'lucide-react';

interface Props {
  planetHouses: PlanetHouseInfo[];
}

export function FoundationsSection({ planetHouses }: Props) {
  if (!planetHouses || planetHouses.length === 0) return null;

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center gap-2 border-b pb-3">
        <Compass className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-serif">Foundations</h2>
        <span className="text-xs text-muted-foreground ml-auto">Signs · Elements · Polarity</span>
      </div>

      <ZodiacSignExplorer />
      <ElementDistributionCard planetHouses={planetHouses} />
    </div>
  );
}
