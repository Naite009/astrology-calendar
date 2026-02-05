import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { RelationshipTimeline } from './synastry/RelationshipTimeline';
import { calculateSynastryAspects } from '@/lib/synastry';
import { ChartSelector } from './ChartSelector';

interface RelationshipTimelineViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const RelationshipTimelineView: React.FC<RelationshipTimelineViewProps> = ({
  userNatalChart,
  savedCharts
}) => {
  const [selectedChart1Id, setSelectedChart1Id] = useState<string>('');
  const [selectedChart2Id, setSelectedChart2Id] = useState<string>('');

  // Build sorted charts list: user first, then alphabetically sorted
  const allCharts = useMemo(() => {
    const sorted = [...savedCharts]
      .filter(c => c.id !== userNatalChart?.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    return [
      ...(userNatalChart ? [userNatalChart] : []),
      ...sorted
    ];
  }, [userNatalChart, savedCharts]);

  const chart1 = allCharts.find(c => c.id === selectedChart1Id);
  const chart2 = allCharts.find(c => c.id === selectedChart2Id);

  const hasEnoughCharts = allCharts.length >= 2;

  // Calculate synastry aspects when both charts are selected
  const synastryAspects = React.useMemo(() => {
    if (!chart1 || !chart2) return [];
    try {
      return calculateSynastryAspects(chart1, chart2);
    } catch {
      return [];
    }
  }, [chart1, chart2]);

  if (!hasEnoughCharts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Two Charts Required
        </h2>
        <p className="text-muted-foreground max-w-md">
          To use the Relationship Timeline, you need at least two charts saved.
          Go to the Charts tab to add more birth data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Two People
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts.filter(c => c.id !== selectedChart2Id)}
                selectedChartId={selectedChart1Id}
                onSelect={setSelectedChart1Id}
                label="Person 1"
              />
            </div>

            <div className="space-y-2">
              <ChartSelector
                userNatalChart={selectedChart1Id === (userNatalChart?.id || 'user') ? null : userNatalChart}
                savedCharts={savedCharts.filter(c => c.id !== selectedChart1Id)}
                selectedChartId={selectedChart2Id}
                onSelect={setSelectedChart2Id}
                label="Person 2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Component */}
      {chart1 && chart2 ? (
        <RelationshipTimeline
          person1Name={chart1.name}
          person2Name={chart2.name}
          person1Chart={chart1}
          person2Chart={chart2}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Select two people above to generate their relationship timeline</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
