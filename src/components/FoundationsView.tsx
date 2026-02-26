import { useState, useMemo } from 'react';
import { ZodiacSignExplorer } from '@/components/narrative/ZodiacSignExplorer';
import { PlanetEncyclopediaExplorer } from '@/components/narrative/PlanetEncyclopediaExplorer';
import { HouseEncyclopediaExplorer } from '@/components/narrative/HouseEncyclopediaExplorer';
import { AspectEncyclopediaExplorer } from '@/components/narrative/AspectEncyclopediaExplorer';
import { ElementDistributionCard } from '@/components/narrative/ElementDistributionCard';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { computeAllSignals } from '@/lib/narrativeAnalysisEngine';

type SubTab = 'signs' | 'planets' | 'houses' | 'aspects';

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function FoundationsView({ userNatalChart, savedCharts }: Props) {
  const [activeTab, setActiveTab] = useState<SubTab>('signs');
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    savedCharts.forEach(c => {
      if (!userNatalChart || c.name !== userNatalChart.name) charts.push(c);
    });
    return charts;
  }, [userNatalChart, savedCharts]);

  const selectedChart = selectedChartId
    ? allCharts.find(c => c.name === selectedChartId) || allCharts[0] || null
    : allCharts[0] || null;

  const planetHouses = useMemo(() => {
    if (!selectedChart || !selectedChart.planets || Object.keys(selectedChart.planets).length < 3) return [];
    return computeAllSignals(selectedChart).planetHouses;
  }, [selectedChart]);

  const tabs: { key: SubTab; label: string; icon: string }[] = [
    { key: 'signs', label: 'Signs', icon: '♈' },
    { key: 'planets', label: 'Planets', icon: '☿' },
    { key: 'houses', label: 'Houses', icon: '🏛' },
    { key: 'aspects', label: 'Aspects', icon: '△' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Chart selector for personalization */}
      {allCharts.length > 0 && (activeTab === 'signs' || activeTab === 'houses') && (
        <div className="mb-6">
          <ChartSelector
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChart?.name || ''}
            onSelect={setSelectedChartId}
          />
        </div>
      )}

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
          {planetHouses.length > 0 && (
            <ElementDistributionCard planetHouses={planetHouses} />
          )}
        </div>
      )}

      {activeTab === 'planets' && <PlanetEncyclopediaExplorer />}

      {activeTab === 'houses' && (
        <HouseEncyclopediaExplorer chart={selectedChart} />
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
