import React from 'react';
import ReactMarkdown from 'react-markdown';
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

  // ── PURPOSE: Deep behavioral narrative of each gate's role ──
  const purposeParts: string[] = [];

  if (cSun) {
    purposeParts.push(
      `**Gate ${cSun.number} — ${cSun.name} (Conscious Sun · ~70% of your cross)**\n\nThis is the loudest note in your life purpose. It's the theme you're here to live, not as an abstract concept, but as a daily, embodied experience.\n\n${cSun.description}\n\n*What this feels like for you:* ${cSun.consciousExpression}`
    );
  }

  if (cEarth) {
    purposeParts.push(
      `**Gate ${cEarth.number} — ${cEarth.name} (Conscious Earth · Your Grounding)**\n\nIf your Conscious Sun is the theme of your purpose, your Conscious Earth is what stabilizes it — the ground you stand on so that the Sun theme doesn't burn you out or float away. Without this grounding, your purpose would feel unanchored.\n\n${cEarth.description}\n\n*What this feels like for you:* ${cEarth.consciousExpression}`
    );
  }

  if (uSun) {
    purposeParts.push(
      `**Gate ${uSun.number} — ${uSun.name} (Unconscious Sun · What Others See)**\n\nThis is the part of your purpose that operates beneath your awareness. You don't "do" this gate — it does you. Others experience this in you clearly, often before you recognize it in yourself. This is the hidden engine of your cross.\n\n${uSun.description}\n\n*How others experience this in you:* ${uSun.unconsciousExpression}`
    );
  }

  if (uEarth) {
    purposeParts.push(
      `**Gate ${uEarth.number} — ${uEarth.name} (Unconscious Earth · Deepest Foundation)**\n\nThis is the most hidden gate in your cross — the unconscious ground beneath the unconscious theme. It quietly stabilizes everything from below the surface. You may never fully "see" this gate in yourself, but others feel its steadying presence.\n\n${uEarth.description}\n\n*How others experience this in you:* ${uEarth.unconsciousExpression}`
    );
  }

  // ── INTEGRATION: How the gates weave together ──
  const integrationParts: string[] = [];
  if (cSun && uSun) {
    integrationParts.push(
      `**The Conscious–Unconscious Dance**\n\nYour purpose has two layers that work simultaneously. On the surface — the part you're most aware of — Gate ${cSun.number} (${cSun.name}) drives your experience. You feel its themes consciously: ${cSun.keynotes[0]?.toLowerCase()}, ${cSun.keynotes[1]?.toLowerCase()}. But underneath that, Gate ${uSun.number} (${uSun.name}) is always running. This is the part of your purpose that others see in you, even when you don't see it yourself.\n\nThe interplay matters: your conscious theme of ${cSun.keynotes[0]?.toLowerCase()} is given depth and texture by the unconscious dimension of ${uSun.keynotes[0]?.toLowerCase()}. Neither gate alone IS your purpose — the cross is the combination, the way they inform and enrich each other.`
    );
  }
  if (cEarth && uEarth) {
    integrationParts.push(
      `**The Grounding Axis**\n\nWhile the Sun gates carry the "what" of your purpose, the Earth gates carry the "how you sustain it." Gate ${cEarth.number} (${cEarth.name}) consciously anchors you through ${cEarth.keynotes[0]?.toLowerCase()}, while Gate ${uEarth.number} (${uEarth.name}) unconsciously provides a foundation of ${uEarth.keynotes[0]?.toLowerCase()}. Without these Earth gates, the Sun's purpose would lack staying power. They're the roots that let the visible part of your purpose grow tall.`
    );
  }
  if (cSun && cEarth && uSun && uEarth) {
    integrationParts.push(
      `**The Full Picture**\n\nYour cross is a four-part architecture: the conscious purpose of ${cSun.name} (Gate ${cSun.number}), grounded by ${cEarth.name} (Gate ${cEarth.number}), deepened by the unconscious ${uSun.name} (Gate ${uSun.number}), and stabilized at the deepest level by ${uEarth.name} (Gate ${uEarth.number}). When you're living according to your Strategy and Authority, these four energies aren't competing — they're harmonizing into a coherent life direction that you don't need to manage. It simply emerges.`
    );
  }

  // ── LIVING YOUR CROSS ──
  const livingParts: string[] = [];
  if (crossType === 'Right Angle') {
    livingParts.push(
      `**Your Cross Is Personal**\n\nAs a Right Angle Cross, your purpose is a personal journey. It's not about serving the collective, fulfilling a mission statement, or saving anyone. It's about what happens when YOU live correctly — when you follow your Strategy and Authority and let your unique configuration express itself without interference.\n\nThis means your purpose isn't something you figure out intellectually. It's something that reveals itself through the accumulation of correct decisions. Each time you honor your design, the cross becomes a little more visible — to you and to others.`
    );
  } else if (crossType === 'Left Angle') {
    livingParts.push(
      `**Your Cross Is Transpersonal**\n\nAs a Left Angle Cross, your purpose comes alive through other people. The people you meet, the relationships you form, the communities you move through — these aren't distractions from your purpose, they ARE your purpose. Your cross needs interaction to fulfill itself.\n\nThis means your purpose isn't something you find in isolation. It emerges through the specific chemistry of your interactions. The "right" people for your cross show up when you're making correct decisions through your Strategy and Authority.`
    );
  } else {
    livingParts.push(
      `**Your Cross Is Fixed**\n\nAs a Juxtaposition Cross, you walk a singular, focused path. Your geometry is precise — neither the personal journey of a Right Angle nor the transpersonal dance of a Left Angle, but a specific, unwavering direction. You have a very particular frequency that doesn't adapt or bend to circumstances.\n\nThis can feel isolating at times, but it's also your power. Your consistency of direction is exactly what others need from you.`
    );
  }

  if (cSun) {
    livingParts.push(
      `**Where You'll Feel It**\n\nYou'll know your cross is emerging when the themes of Gate ${cSun.number} (${cSun.name}) stop feeling like effort and start feeling like inevitability. The challenges — ${cSun.challenges[0]?.toLowerCase()} — aren't obstacles to your purpose. They're the friction that refines it. Every time you navigate those challenges correctly (through your ${hdType} Strategy), your purpose becomes more embodied and less theoretical.\n\nDon't try to "live your cross." Instead, make correct decisions, and watch the cross live you.`
    );
  }

  // ── COLLECTIVE CONTRIBUTION ──
  const contributionParts: string[] = [];
  
  if (cSun && uSun) {
    contributionParts.push(
      `**What You Offer Without Trying**\n\nWhen you're living correctly, you naturally bring two layers of contribution to the people around you.\n\nThe conscious layer — Gate ${cSun.number} (${cSun.name}) — shows up as: ${cSun.gifts.slice(0, 2).join(', ')}. This is the contribution you're more aware of, the one you can somewhat deliberately express.\n\nBut the deeper contribution — Gate ${uSun.number} (${uSun.name}) — happens without your awareness: ${uSun.gifts.slice(0, 2).join(', ')}. ${uSun.unconsciousExpression}`
    );
  }

  if (cEarth && uEarth) {
    contributionParts.push(
      `**The Invisible Support You Provide**\n\nBeyond the visible contributions, your Earth gates create a stabilizing effect on the people in your life. Through Gate ${cEarth.number} (${cEarth.name}), you ground others with ${cEarth.gifts[0]?.toLowerCase()}. Through Gate ${uEarth.number} (${uEarth.name}), you unconsciously provide ${uEarth.gifts[0]?.toLowerCase()} — a foundation others lean on without either of you fully realizing it.`
    );
  }

  contributionParts.push(
    `**The Key Distinction**\n\nNone of this contribution requires effort or strategy. It's not a job description or a mission. It's the natural byproduct of living correctly. When you follow your Strategy and Authority, these gifts flow as naturally as breathing. When you try to force them, they distort.`
  );

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
              <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
                {cross?.description && (
                  <p>{cross.description}</p>
                )}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <ReactMarkdown>{lifeWorkText}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
            {contributionText && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Collective Contribution</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{contributionText}</ReactMarkdown>
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
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{integrationText}</ReactMarkdown>
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
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{livingText}</ReactMarkdown>
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
