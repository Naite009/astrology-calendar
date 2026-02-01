import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HumanDesignChart } from '@/types/humanDesign';
import { determinationData, getDetermination } from '@/data/humanDesignDeterminations';
import { ArrowLeft, ArrowRight, Utensils, Home, Eye, Target, Info } from 'lucide-react';

interface VariablesAnalysisProps {
  chart: HumanDesignChart;
}

// Map color numbers to determination types
const colorToDetermination: Record<number, string> = {
  1: 'Consecutive',
  2: 'Alternating', 
  3: 'Open',
  4: 'Calm',
  5: 'Hot Thirst',
  6: 'Direct Light'
};

// Right-facing equivalents
const rightDeterminations: Record<number, string> = {
  1: 'Appetite',
  2: 'Taste',
  3: 'Nervous', 
  4: 'Low Sound',
  5: 'Thirst',
  6: 'Indirect Light'
};

// Environment types by color
const colorToEnvironment: Record<number, string> = {
  1: 'Caves',
  2: 'Markets',
  3: 'Kitchens',
  4: 'Mountains',
  5: 'Valleys',
  6: 'Shores'
};

// Perspective types by color
const colorToPerspective: Record<number, string> = {
  1: 'Survival',
  2: 'Possibility',
  3: 'Power',
  4: 'Wanting',
  5: 'Probability',
  6: 'Personal'
};

// Motivation types by color
const colorToMotivation: Record<number, string> = {
  1: 'Fear',
  2: 'Hope',
  3: 'Desire',
  4: 'Need',
  5: 'Guilt',
  6: 'Innocence'
};

export function VariablesAnalysis({ chart }: VariablesAnalysisProps) {
  // Check if variables exist
  if (!chart.variables) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variables (The Four Arrows)</CardTitle>
          <CardDescription>
            Variables data not available for this chart. This requires advanced calculation or manual entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info size={16} />
            <span className="text-sm">
              Variables (PHS) require precise birth time and advanced calculation. 
              This feature will be available when variable data is added to the chart.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { determination, environment, perspective, motivation } = chart.variables;

  // Get determination type based on arrow direction and color
  const determinationType = determination.arrow === 'Left' 
    ? colorToDetermination[determination.color] || 'Consecutive'
    : rightDeterminations[determination.color] || 'Appetite';

  const environmentType = colorToEnvironment[environment.color] || 'Caves';
  const perspectiveType = colorToPerspective[perspective.color] || 'Survival';
  const motivationType = colorToMotivation[motivation.color] || 'Fear';

  const determinationInfo = getDetermination(determinationType);

  return (
    <div className="space-y-6">
      {/* Variables Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Your Variables (The Four Arrows)</CardTitle>
          <CardDescription>
            Advanced differentiation - how you're designed to operate optimally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Determination */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="h-4 w-4 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Determination</span>
                  {determination.arrow === 'Left' ? (
                    <ArrowLeft className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">How to eat</p>
              <span className="font-semibold text-foreground">{determinationType}</span>
              <Badge variant="outline" className="ml-2 text-[10px]">
                {determination.arrow === 'Left' ? 'Strategic' : 'Receptive'}
              </Badge>
            </div>

            {/* Environment */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-4 w-4 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Environment</span>
                  {environment.arrow === 'Left' ? (
                    <ArrowLeft className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Where you thrive</p>
              <span className="font-semibold text-foreground">{environmentType}</span>
            </div>

            {/* Perspective */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Perspective</span>
                  {perspective.arrow === 'Left' ? (
                    <ArrowLeft className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">How you perceive</p>
              <span className="font-semibold text-foreground">{perspectiveType}</span>
            </div>

            {/* Motivation */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Motivation</span>
                  {motivation.arrow === 'Left' ? (
                    <ArrowLeft className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">What drives you</p>
              <span className="font-semibold text-foreground">{motivationType}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Card>
        <Tabs defaultValue="determination" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger value="determination" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Determination (PHS)
            </TabsTrigger>
            <TabsTrigger value="environment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Environment
            </TabsTrigger>
            <TabsTrigger value="perspective" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Perspective
            </TabsTrigger>
            <TabsTrigger value="motivation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Motivation
            </TabsTrigger>
          </TabsList>

          {/* Determination Tab */}
          <TabsContent value="determination" className="p-6">
            {determinationInfo ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Utensils className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>{determinationInfo.name} Determination</CardTitle>
                        <CardDescription>
                          {determinationInfo.category} • {determinationInfo.direction}-Facing Arrow
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{determinationInfo.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">How to Implement</h4>
                      <p className="text-sm text-muted-foreground">{determinationInfo.implementation}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Meal Structure</h4>
                      <div className="grid gap-1">
                        {determinationInfo.mealStructure.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">•</span>
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Benefits</h4>
                      <p className="text-sm text-muted-foreground">{determinationInfo.benefits}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Common Mistakes to Avoid</h4>
                      <div className="grid gap-1">
                        {determinationInfo.commonMistakes.map((mistake, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-destructive">✕</span>
                            <span className="text-muted-foreground">{mistake}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Practical Tips</h4>
                      <div className="grid gap-1">
                        {determinationInfo.practicalTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500">✓</span>
                            <span className="text-muted-foreground">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">30-Day Experimentation Guide</h4>
                      <p className="text-sm text-muted-foreground">{determinationInfo.experimentationGuide}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Journal Prompts for Tracking</h4>
                      <div className="grid gap-1">
                        {determinationInfo.journalPrompts.map((prompt, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-amber-500">?</span>
                            <span className="text-muted-foreground italic">{prompt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Integration with Your Health System</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Your {determinationInfo.name} determination is a fundamental part of your Primary Health System (PHS). 
                      This is not a diet - it's how your unique digestive system is designed to function optimally.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In your Health section, you can track your determination compliance, create meal plans, 
                      and correlate your dietary approach with astrological transits affecting your health and vitality.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-muted-foreground">Determination data not available.</p>
            )}
          </TabsContent>

          {/* Environment Tab */}
          <TabsContent value="environment" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>{environmentType} Environment</CardTitle>
                <CardDescription>
                  {environment.arrow}-Facing • Where you thrive and feel most yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your environment variable shows the physical spaces where you operate optimally. 
                  This affects where you work best, where you should live, and what kind of spaces 
                  support your wellbeing and productivity.
                </p>
                <div className="rounded border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground italic">
                    Note: Full environment descriptions will be added in the next build phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perspective Tab */}
          <TabsContent value="perspective" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>{perspectiveType} Perspective</CardTitle>
                <CardDescription>
                  {perspective.arrow}-Facing • How you naturally take in information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your perspective variable shows your primary way of perceiving and processing 
                  information from the world. This affects your learning style, how you make sense 
                  of experiences, and your natural way of knowing.
                </p>
                <div className="rounded border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground italic">
                    Note: Full perspective descriptions will be added in the next build phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Motivation Tab */}
          <TabsContent value="motivation" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>{motivationType} Motivation</CardTitle>
                <CardDescription>
                  {motivation.arrow}-Facing • What drives you at the deepest level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your motivation variable shows your core drive and what moves you at the deepest level. 
                  Understanding this helps you recognize when you're operating from authentic motivation 
                  vs. conditioned drives.
                </p>
                <div className="rounded border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground italic">
                    Note: Full motivation descriptions will be added in the next build phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
