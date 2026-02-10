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
import { HUMAN_DESIGN_GATES, HDGate } from '@/data/humanDesignGates';
import { Sun, Globe, Target, Compass, Star, BookOpen } from 'lucide-react';

interface IncarnationCrossAnalysisProps {
  chart: HumanDesignChart;
}

/**
 * Synthesize a personalized life-purpose narrative from the four cross gates.
 * This runs when the incarnation cross database entry doesn't include
 * the optional extended fields (lifeWork, collectiveContribution, etc.).
 */
function synthesizeCrossPurpose(
  consciousSun: HDGate | undefined,
  consciousEarth: HDGate | undefined,
  unconsciousSun: HDGate | undefined,
  unconsciousEarth: HDGate | undefined,
  crossName: string,
  crossType: string,
  hdType: string
) {
  const cSun = consciousSun;
  const cEarth = consciousEarth;
  const uSun = unconsciousSun;
  const uEarth = unconsciousEarth;

  // Build the "Your Life Purpose" synthesis
  const purposeParts: string[] = [];

  if (cSun) {
    purposeParts.push(
      `Your Conscious Sun sits in Gate ${cSun.number} — ${cSun.name}. This is the primary theme of your life purpose, accounting for roughly 70% of your cross's energy. ${cSun.consciousExpression} Your core gifts here include: ${cSun.gifts.slice(0, 3).join(', ')}.`
    );
  }

  if (cEarth) {
    purposeParts.push(
      `Your Conscious Earth in Gate ${cEarth.number} — ${cEarth.name} — provides grounding and stability for your Sun theme. This is what keeps you anchored: ${cEarth.keynotes.slice(0, 2).join(' and ')}. ${cEarth.consciousExpression}`
    );
  }

  if (uSun) {
    purposeParts.push(
      `Your Unconscious Sun in Gate ${uSun.number} — ${uSun.name} — is the deeper, less visible driver of your purpose. Others see this in you before you do: ${uSun.unconsciousExpression} This adds the dimension of ${uSun.keynotes.slice(0, 2).join(' and ')} to your life theme.`
    );
  }

  if (uEarth) {
    purposeParts.push(
      `Your Unconscious Earth in Gate ${uEarth.number} — ${uEarth.name} — is the unconscious foundation beneath everything. It grounds the deeper purpose with ${uEarth.keynotes.slice(0, 2).join(' and ')}. ${uEarth.unconsciousExpression}`
    );
  }

  // Build "How These Gates Work Together"
  const integrationParts: string[] = [];
  if (cSun && uSun) {
    integrationParts.push(
      `The conscious drive of ${cSun.name} (Gate ${cSun.number}) meets the unconscious pull of ${uSun.name} (Gate ${uSun.number}). On the surface you express ${cSun.keynotes[0]?.toLowerCase() || 'your conscious theme'}, while underneath, ${uSun.keynotes[0]?.toLowerCase() || 'your unconscious theme'} is always at work shaping how your purpose lands in the world.`
    );
  }
  if (cEarth && uEarth) {
    integrationParts.push(
      `Your grounding axis — Gate ${cEarth.number} (${cEarth.name}) consciously and Gate ${uEarth.number} (${uEarth.name}) unconsciously — creates the stable base from which you operate. Together they anchor your purpose in ${cEarth.keynotes[0]?.toLowerCase() || 'stability'} and ${uEarth.keynotes[0]?.toLowerCase() || 'foundation'}.`
    );
  }

  // Build "Living Your Cross"
  const livingParts: string[] = [];
  if (crossType === 'Right Angle') {
    livingParts.push(
      `As a Right Angle Cross, your purpose is deeply personal. It's not about fulfilling a role for the collective — it's about your own journey and transformation. Your cross unfolds through the specific experiences that your Strategy brings to you.`
    );
  } else if (crossType === 'Left Angle') {
    livingParts.push(
      `As a Left Angle Cross, your purpose is transpersonal — it comes alive through your interactions and relationships with others. Your cross needs other people to fulfill itself. The people you meet aren't accidental; they're part of your purpose geometry.`
    );
  } else {
    livingParts.push(
      `As a Juxtaposition Cross, you walk a fixed geometry — a singular, focused path. Your purpose is neither purely personal nor transpersonal but a bridge between both. You have a very specific frequency and direction that doesn't bend.`
    );
  }

  if (cSun) {
    livingParts.push(
      `In practice, you'll notice your purpose most when you allow Gate ${cSun.number}'s theme of ${cSun.keynotes[0]?.toLowerCase() || 'expression'} to emerge naturally through correct decision-making. The challenges of ${cSun.challenges[0]?.toLowerCase() || 'this gate'} are actually the friction that polishes your purpose into something real and embodied.`
    );
  }

  // Build "Collective Contribution" 
  const contributionParts: string[] = [];
  const allGifts = [
    ...(cSun?.gifts || []).slice(0, 2),
    ...(uSun?.gifts || []).slice(0, 2),
  ];
  if (allGifts.length > 0) {
    contributionParts.push(
      `When you're living your design correctly, your natural contribution to others includes: ${allGifts.join(', ')}. This isn't something you need to work at — these gifts emerge when you follow your Strategy and Authority.`
    );
  }
  if (uSun) {
    contributionParts.push(
      `The unconscious dimension of Gate ${uSun.number} means others often receive ${uSun.gifts?.[0]?.toLowerCase() || 'something valuable'} from you without you even realizing you're offering it.`
    );
  }

  return {
    purpose: purposeParts.join('\n\n'),
    integration: integrationParts.join('\n\n'),
    living: livingParts.join('\n\n'),
    contribution: contributionParts.join('\n\n'),
  };
}

export function IncarnationCrossAnalysis({ chart }: IncarnationCrossAnalysisProps) {
  const cross = determineIncarnationCross(
    chart.incarnationCross.gates.consciousSun,
    chart.incarnationCross.gates.consciousEarth,
    chart.incarnationCross.gates.unconsciousSun,
    chart.incarnationCross.gates.unconsciousEarth,
    chart.incarnationCross.type
  );

  const quarter = quarterDescriptions[chart.incarnationCross.quarter];
  const crossType = crossTypeDescriptions[chart.incarnationCross.type];

  const consciousSunGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.consciousSun);
  const consciousEarthGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.consciousEarth);
  const unconsciousSunGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.unconsciousSun);
  const unconsciousEarthGate = HUMAN_DESIGN_GATES.find(g => g.number === chart.incarnationCross.gates.unconsciousEarth);

  // Synthesize personalized content from the four gates
  const synthesized = synthesizeCrossPurpose(
    consciousSunGate,
    consciousEarthGate,
    unconsciousSunGate,
    unconsciousEarthGate,
    cross?.name || chart.incarnationCross.name,
    chart.incarnationCross.type,
    chart.type
  );

  // Use database fields if available, otherwise use synthesized
  const lifeWorkText = cross?.lifeWork || synthesized.purpose;
  const contributionText = cross?.collectiveContribution || synthesized.contribution;
  const integrationText = cross?.gateIntegration || synthesized.integration;
  const livingText = cross?.livingYourCross || synthesized.living;

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
            <Card>
              <CardHeader>
                <CardTitle>Your Cross — What It Means For You</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                {cross?.description && (
                  <p>{cross.description}</p>
                )}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  {lifeWorkText.split('\n\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
            {contributionText && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Collective Contribution</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  {contributionText.split('\n\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>The Four Gates of Your Cross</CardTitle>
                <CardDescription>
                  ~70% from Conscious Sun/Earth • ~30% from Unconscious Sun/Earth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-foreground pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Conscious Sun</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.consciousSun}
                    </span>
                    <span className="text-xs text-muted-foreground">— Primary life theme</span>
                  </div>
                  {consciousSunGate && (
                    <div>
                      <p className="font-medium">{consciousSunGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {consciousSunGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{consciousSunGate.description}</p>
                      <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your conscious experience</p>
                        <p className="text-sm">{consciousSunGate.consciousExpression}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-foreground pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Conscious Earth</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.consciousEarth}
                    </span>
                    <span className="text-xs text-muted-foreground">— What grounds you</span>
                  </div>
                  {consciousEarthGate && (
                    <div>
                      <p className="font-medium">{consciousEarthGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {consciousEarthGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{consciousEarthGate.description}</p>
                      <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your conscious experience</p>
                        <p className="text-sm">{consciousEarthGate.consciousExpression}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-destructive pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Unconscious Sun</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.unconsciousSun}
                    </span>
                    <span className="text-xs text-muted-foreground">— What others see in you</span>
                  </div>
                  {unconsciousSunGate && (
                    <div>
                      <p className="font-medium">{unconsciousSunGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {unconsciousSunGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{unconsciousSunGate.description}</p>
                      <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">How others experience this in you</p>
                        <p className="text-sm">{unconsciousSunGate.unconsciousExpression}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-l-4 border-destructive pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Unconscious Earth</Badge>
                    <span className="font-semibold">
                      Gate {chart.incarnationCross.gates.unconsciousEarth}
                    </span>
                    <span className="text-xs text-muted-foreground">— Unconscious foundation</span>
                  </div>
                  {unconsciousEarthGate && (
                    <div>
                      <p className="font-medium">{unconsciousEarthGate.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {unconsciousEarthGate.keynotes.join(' • ')}
                      </p>
                      <p className="text-sm mt-2">{unconsciousEarthGate.description}</p>
                      <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">How others experience this in you</p>
                        <p className="text-sm">{unconsciousEarthGate.unconsciousExpression}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {integrationText && (
              <Card>
                <CardHeader>
                  <CardTitle>How These Gates Work Together</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  {integrationText.split('\n\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="purpose" className="space-y-4">
            {livingText && (
              <Card>
                <CardHeader>
                  <CardTitle>Living Your Cross</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  {livingText.split('\n\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Cross vs Conditioning</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                <p>
                  Your Incarnation Cross is not something you DO — it's something you ARE 
                  when you're living correctly according to your Strategy and Authority. 
                  The cross emerges naturally when you're being yourself authentically.
                </p>
                {consciousSunGate && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      What this means for your cross specifically
                    </p>
                    <p>
                      With Gate {consciousSunGate.number} ({consciousSunGate.name}) as your Conscious Sun, 
                      conditioning may pressure you to express {consciousSunGate.challenges[0]?.toLowerCase() || 'this gate'} in 
                      ways that feel forced. Instead, when you follow your {chart.strategy} strategy, 
                      the gift of {consciousSunGate.gifts[0]?.toLowerCase() || 'this gate'} emerges naturally. 
                      You don't need to "try" to live your purpose — it unfolds when you make 
                      decisions correctly through your {chart.authority} authority.
                    </p>
                  </div>
                )}
                <p className="text-muted-foreground">
                  Conditioning often tries to tell you what your purpose "should" be. 
                  Your cross unfolds organically when you honor your design and make 
                  decisions correctly. Don't try to force your cross — let it emerge 
                  through correct living.
                </p>
              </CardContent>
            </Card>
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
