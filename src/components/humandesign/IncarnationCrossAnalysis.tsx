import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HumanDesignChart } from '@/types/humanDesign';
import { 
  determineIncarnationCross, 
  quarterDescriptions, 
  crossTypeDescriptions 
} from '@/data/incarnationCrosses';
import { HUMAN_DESIGN_GATES } from '@/data/humanDesignGates';
import { Sun, Globe, Target, Compass, Star, BookOpen } from 'lucide-react';

interface IncarnationCrossAnalysisProps {
  chart: HumanDesignChart;
}

export function IncarnationCrossAnalysis({ chart }: IncarnationCrossAnalysisProps) {
  const cross = determineIncarnationCross(
    chart.incarnationCross.gates.consciousSun,
    chart.incarnationCross.gates.consciousEarth,
    chart.incarnationCross.gates.unconsciousSun,
    chart.incarnationCross.gates.unconsciousEarth
  );

  const quarter = quarterDescriptions[chart.incarnationCross.quarter];
  const crossType = crossTypeDescriptions[chart.incarnationCross.type];

  const consciousSunGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.consciousSun);
  const consciousEarthGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.consciousEarth);
  const unconsciousSunGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.unconsciousSun);
  const unconsciousEarthGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.unconsciousEarth);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {cross?.name || chart.incarnationCross.name}
              </CardTitle>
              <CardDescription>
                Your Life Purpose & Incarnation Cross
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/5">
              {chart.incarnationCross.type}
            </Badge>
            <Badge variant="secondary">
              Quarter of {chart.incarnationCross.quarter}
            </Badge>
          </div>
        </div>

        {cross && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-primary">
              {cross.theme}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gates">The Four Gates</TabsTrigger>
            <TabsTrigger value="purpose">Life Purpose</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="type">Cross Type</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {cross ? (
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {cross.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Conscious Sun</span>
                    </div>
                    <p className="text-lg font-semibold">Gate {chart.incarnationCross.gates.consciousSun}</p>
                    <p className="text-xs text-muted-foreground">{consciousSunGate?.name}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-secondary-foreground" />
                      <span className="text-sm font-medium">Conscious Earth</span>
                    </div>
                    <p className="text-lg font-semibold">Gate {chart.incarnationCross.gates.consciousEarth}</p>
                    <p className="text-xs text-muted-foreground">{consciousEarthGate?.name}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border-l-2 border-destructive/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Unconscious Sun</span>
                    </div>
                    <p className="text-lg font-semibold">Gate {chart.incarnationCross.gates.unconsciousSun}</p>
                    <p className="text-xs text-muted-foreground">{unconsciousSunGate?.name}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border-l-2 border-destructive/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Unconscious Earth</span>
                    </div>
                    <p className="text-lg font-semibold">Gate {chart.incarnationCross.gates.unconsciousEarth}</p>
                    <p className="text-xs text-muted-foreground">{unconsciousEarthGate?.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Detailed interpretation for this specific cross combination is being developed.</p>
                <p className="text-sm mt-2">Your cross gates are: {chart.incarnationCross.gates.consciousSun}/{chart.incarnationCross.gates.consciousEarth} | {chart.incarnationCross.gates.unconsciousSun}/{chart.incarnationCross.gates.unconsciousEarth}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gates" className="space-y-4">
            <div className="grid gap-4">
              {[
                { label: 'Conscious Sun', gate: consciousSunGate, gateNum: chart.incarnationCross.gates.consciousSun, icon: Sun, color: 'text-primary', desc: 'Your conscious expression and life theme' },
                { label: 'Conscious Earth', gate: consciousEarthGate, gateNum: chart.incarnationCross.gates.consciousEarth, icon: Globe, color: 'text-secondary-foreground', desc: 'Your grounding and balance point' },
                { label: 'Unconscious Sun', gate: unconsciousSunGate, gateNum: chart.incarnationCross.gates.unconsciousSun, icon: Sun, color: 'text-destructive', desc: 'Your unconscious drive and deeper purpose' },
                { label: 'Unconscious Earth', gate: unconsciousEarthGate, gateNum: chart.incarnationCross.gates.unconsciousEarth, icon: Globe, color: 'text-destructive', desc: 'Your unconscious grounding and body wisdom' }
              ].map(({ label, gate, gateNum, icon: Icon, color, desc }) => (
                <div key={label} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <div>
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground ml-2">Gate {gateNum}</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold mb-1">{gate?.name || 'Unknown Gate'}</p>
                  <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                  {gate && (
                    <p className="text-sm">{gate.keynotes?.[0]}</p>
                  )}
                </div>
              ))}
            </div>
            {cross && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Gate Integration
                </h4>
                <p className="text-sm text-muted-foreground">{cross.gateIntegration}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="purpose" className="space-y-4">
            {cross ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Your Life Work
                  </h4>
                  <p className="text-muted-foreground">{cross.lifeWork}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Collective Contribution
                  </h4>
                  <p className="text-muted-foreground">{cross.collectiveContribution}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Living Your Cross
                  </h4>
                  <p className="text-sm text-muted-foreground">{cross.livingYourCross}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Detailed life purpose interpretation for this cross is being developed.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quarter" className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Quarter of {chart.incarnationCross.quarter}</h4>
              <Badge variant="outline" className="mb-3">{quarter.theme}</Badge>
              <p className="text-muted-foreground">{quarter.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(quarterDescriptions).map(([name, q]) => (
                <div 
                  key={name}
                  className={`p-3 rounded-lg text-center ${
                    name === chart.incarnationCross.quarter 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-muted/20'
                  }`}
                >
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{q.theme}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{chart.incarnationCross.type}</h4>
                <Badge variant="secondary">{crossType.percentage}% of population</Badge>
              </div>
              <Badge variant="outline" className="mb-3">{crossType.theme}</Badge>
              <p className="text-muted-foreground">{crossType.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(crossTypeDescriptions).map(([type, info]) => (
                <div 
                  key={type}
                  className={`p-3 rounded-lg ${
                    type === chart.incarnationCross.type 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-muted/20'
                  }`}
                >
                  <p className="font-medium text-sm">{type}</p>
                  <p className="text-xs text-muted-foreground">{info.percentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{info.theme}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
