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
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p>{cross.description}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Life Work</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p>{cross.lifeWork}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Collective Contribution</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p>{cross.collectiveContribution}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Incarnation Cross</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>
                    Your Incarnation Cross is determined by the position of the Sun and Earth 
                    at both your birth moment (Personality/Conscious) and 88 degrees before 
                    (Design/Unconscious). This cross represents your life purpose and the theme 
                    you're here to explore and express.
                  </p>
                  <p className="mt-4">
                    Your cross is composed of Gates {chart.incarnationCross.gates.consciousSun}, 
                    {chart.incarnationCross.gates.consciousEarth}, {chart.incarnationCross.gates.unconsciousSun}, 
                    and {chart.incarnationCross.gates.unconsciousEarth}.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>The Four Gates of Your Cross</CardTitle>
                <CardDescription>
                  70% from Conscious Sun/Earth, 30% from Unconscious Sun/Earth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-foreground pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Conscious Sun</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.consciousSun}
                    </span>
                  </div>
                  {consciousSunGate && (
                    <div>
                      <p className="font-medium">{consciousSunGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {consciousSunGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{consciousSunGate.description}</p>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-foreground pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Conscious Earth</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.consciousEarth}
                    </span>
                  </div>
                  {consciousEarthGate && (
                    <div>
                      <p className="font-medium">{consciousEarthGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {consciousEarthGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{consciousEarthGate.description}</p>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-destructive pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Unconscious Sun</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.unconsciousSun}
                    </span>
                  </div>
                  {unconsciousSunGate && (
                    <div>
                      <p className="font-medium">{unconsciousSunGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {unconsciousSunGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{unconsciousSunGate.description}</p>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-destructive pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Unconscious Earth</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.unconsciousEarth}
                    </span>
                  </div>
                  {unconsciousEarthGate && (
                    <div>
                      <p className="font-medium">{unconsciousEarthGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {unconsciousEarthGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{unconsciousEarthGate.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {cross && (
              <Card>
                <CardHeader>
                  <CardTitle>How These Gates Work Together</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>{cross.gateIntegration}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="purpose" className="space-y-4">
            {cross && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Living Your Cross</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p>{cross.livingYourCross}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cross vs Conditioning</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p>
                      Your Incarnation Cross is not something you DO - it's something you ARE 
                      when you're living correctly according to your Strategy and Authority. 
                      The cross emerges naturally when you're being yourself authentically.
                    </p>
                    <p className="mt-4">
                      Conditioning often tries to tell you what your purpose "should" be or 
                      how you "should" contribute. Your cross unfolds organically when you 
                      honor your design and make decisions correctly. Don't try to force your 
                      cross - let it emerge through correct living.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="quarter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quarter of {chart.incarnationCross.quarter}</CardTitle>
                <CardDescription>{quarter.theme}</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>{quarter.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The Four Quarters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(quarterDescriptions).map(([name, info]) => (
                  <div 
                    key={name}
                    className={`p-4 rounded-lg border ${
                      name === chart.incarnationCross.quarter 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <h4 className="font-semibold mb-1">
                      Quarter of {name}
                      {name === chart.incarnationCross.quarter && (
                        <Badge className="ml-2" variant="default">Your Quarter</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{info.theme}</p>
                    <p className="text-sm">{info.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{chart.incarnationCross.type} Cross</CardTitle>
                <CardDescription>
                  {crossType.percentage}% of population • {crossType.theme}
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>{crossType.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The Three Cross Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(crossTypeDescriptions).map(([type, info]) => (
                  <div 
                    key={type}
                    className={`p-4 rounded-lg border ${
                      type === chart.incarnationCross.type 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <h4 className="font-semibold mb-1">
                      {type}
                      {type === chart.incarnationCross.type && (
                        <Badge className="ml-2" variant="default">Your Type</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {info.percentage}% • {info.theme}
                    </p>
                    <p className="text-sm">{info.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
