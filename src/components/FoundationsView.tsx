import { useState } from 'react';
import { ZodiacSignExplorer } from '@/components/narrative/ZodiacSignExplorer';
import { PlanetEncyclopediaExplorer } from '@/components/narrative/PlanetEncyclopediaExplorer';
import { HouseEncyclopediaExplorer } from '@/components/narrative/HouseEncyclopediaExplorer';
import { AspectEncyclopediaExplorer } from '@/components/narrative/AspectEncyclopediaExplorer';
import { ElementDistributionCard } from '@/components/narrative/ElementDistributionCard';
import { NatalChart } from '@/hooks/useNatalChart';

type SubTab = 'signs' | 'planets' | 'houses' | 'aspects';

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function FoundationsView({ userNatalChart, savedCharts }: Props) {
  const [activeTab, setActiveTab] = useState<SubTab>('signs');

  const tabs: { key: SubTab; label: string; icon: string }[] = [
    { key: 'signs', label: 'Signs', icon: '♈' },
    { key: 'planets', label: 'Planets', icon: '☿' },
    { key: 'houses', label: 'Houses', icon: '🏛' },
    { key: 'aspects', label: 'Aspects', icon: '△' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 mb-8 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'signs' && (
        <div className="space-y-8">
          <ZodiacSignExplorer />
          {userNatalChart && (
            <ElementDistributionCard planetHouses={[]} />
          )}
        </div>
      )}

      {activeTab === 'planets' && <PlanetEncyclopediaExplorer />}

      {activeTab === 'houses' && (
        <HouseEncyclopediaExplorer chart={userNatalChart || savedCharts[0] || null} />
      )}

      {activeTab === 'aspects' && (
        <AspectEncyclopediaExplorer
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
        />
      )}
    </div>
  );
}
