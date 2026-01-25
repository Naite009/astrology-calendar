import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Apple, Sparkles, Home, Clock, Leaf, AlertCircle } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";
import { HealthNatalBlueprint } from "./health/HealthNatalBlueprint";
import { NutritionalAstrology } from "./health/NutritionalAstrology";
import { HealthAspectsCard } from "./health/HealthAspectsCard";
import { HouseHealthSystem } from "./health/HouseHealthSystem";
import { HealthTimingCard } from "./health/HealthTimingCard";
import { HealingModalitiesCard } from "./health/HealingModalitiesCard";

interface HealthAstrologyViewProps {
  natalChart: NatalChart | null;
  allCharts: NatalChart[];
}

export const HealthAstrologyView = ({ natalChart, allCharts }: HealthAstrologyViewProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string>(
    natalChart?.id || allCharts[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<string>('blueprint');

  const selectedChart = allCharts.find(c => c.id === selectedChartId) || natalChart;

  if (!selectedChart) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Chart Available</h3>
          <p className="text-muted-foreground">
            Add a birth chart in the Charts tab to access Health Astrology analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-light">Health Astrology</h2>
          <p className="text-muted-foreground text-sm">
            Medical astrology insights for holistic wellness
          </p>
        </div>

        {/* Chart Selector */}
        {allCharts.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Analyzing:
            </label>
            <select
              value={selectedChartId}
              onChange={(e) => setSelectedChartId(e.target.value)}
              className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
            >
              {allCharts.map(chart => (
                <option key={chart.id} value={chart.id}>{chart.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4">
          <p className="text-sm text-amber-700">
            <strong>Disclaimer:</strong> Health astrology is for educational and self-awareness purposes only. 
            It does not replace professional medical advice, diagnosis, or treatment. 
            Always consult healthcare providers for medical concerns.
          </p>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1">
          <TabsTrigger value="blueprint" className="flex items-center gap-1.5 text-xs">
            <Heart size={14} />
            Blueprint
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1.5 text-xs">
            <Apple size={14} />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="aspects" className="flex items-center gap-1.5 text-xs">
            <Sparkles size={14} />
            Aspects
          </TabsTrigger>
          <TabsTrigger value="houses" className="flex items-center gap-1.5 text-xs">
            <Home size={14} />
            Houses
          </TabsTrigger>
          <TabsTrigger value="timing" className="flex items-center gap-1.5 text-xs">
            <Clock size={14} />
            Timing
          </TabsTrigger>
          <TabsTrigger value="healing" className="flex items-center gap-1.5 text-xs">
            <Leaf size={14} />
            Healing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blueprint">
          <HealthNatalBlueprint natalChart={selectedChart} />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionalAstrology natalChart={selectedChart} />
        </TabsContent>

        <TabsContent value="aspects">
          <HealthAspectsCard natalChart={selectedChart} />
        </TabsContent>

        <TabsContent value="houses">
          <HouseHealthSystem natalChart={selectedChart} />
        </TabsContent>

        <TabsContent value="timing">
          <HealthTimingCard />
        </TabsContent>

        <TabsContent value="healing">
          <HealingModalitiesCard natalChart={selectedChart} />
        </TabsContent>
      </Tabs>

      {/* Quick Reference Footer */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quick Health Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4 text-xs">
            <div className="p-2 bg-muted/50 rounded-sm">
              <span className="font-medium">Sun Sign:</span> {selectedChart.planets.Sun?.sign || 'Unknown'}
              <span className="block text-muted-foreground">Core vitality</span>
            </div>
            <div className="p-2 bg-muted/50 rounded-sm">
              <span className="font-medium">Moon Sign:</span> {selectedChart.planets.Moon?.sign || 'Unknown'}
              <span className="block text-muted-foreground">Emotional/digestive</span>
            </div>
            <div className="p-2 bg-muted/50 rounded-sm">
              <span className="font-medium">6th House:</span> {selectedChart.houseCusps?.house6?.sign || 'Unknown'}
              <span className="block text-muted-foreground">Daily health</span>
            </div>
            <div className="p-2 bg-muted/50 rounded-sm">
              <span className="font-medium">Ascendant:</span> {selectedChart.planets.Ascendant?.sign || 'Unknown'}
              <span className="block text-muted-foreground">Constitution</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
