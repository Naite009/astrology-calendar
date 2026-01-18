import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Copy, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  ChartPlanet,
  ChartAspect,
  computeDignity,
  computeDispositorChain,
  getSignRuler,
  getPlanetSymbol,
  getSignSymbol,
  getAspectSymbol,
  getAspectNature,
  PLANET_MEANINGS,
  DIGNITY_EXPLAINERS,
  DignityType
} from '@/lib/chartDecoderLogic';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { detectChartPatterns, ChartPattern } from '@/lib/chartPatterns';
import { PLANET_IN_SIGN } from '@/lib/planetSignExpressions';
import { SIGN_COSTUMES } from '@/lib/cinematicNarrative';

interface ReadingScriptGeneratorProps {
  planets: ChartPlanet[];
  aspects: ChartAspect[];
  chartName: string;
  useTraditional: boolean;
  natalChart?: NatalChart | null;
}

interface ScriptSection {
  title: string;
  content: string[];
}

// Generate experiential language for placements
function getPlacementFeeling(planet: string, sign: string, dignity: DignityType, house?: number): string {
  const dignityFeelings: Record<DignityType, string> = {
    rulership: `This energy flows naturally and consistently for you — ${planet} is at home here.`,
    exaltation: `This placement often feels like a gift or natural talent — ${planet} is elevated here.`,
    detriment: `This requires more conscious navigation. You may feel pulled between what ${planet} wants and how ${sign} expresses.`,
    fall: `This is where you build earned confidence. Not weakness — mastery develops through practice.`,
    peregrine: house 
      ? `This energy expresses most clearly through the ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house themes and its aspects.`
      : `A free agent — its expression comes through aspects and the life areas it touches.`
  };
  return dignityFeelings[dignity];
}

// Get aspect feeling based on type and orb
function getAspectFeeling(aspect: ChartAspect, planet1Meaning: string, planet2Meaning: string): string {
  const isTight = aspect.orb < 3;
  const tightNote = isTight ? " This is a tight aspect — you feel it strongly and consistently." : "";
  
  const nature = getAspectNature(aspect.aspectType);
  
  if (nature === 'flowing') {
    return `${aspect.planet1} and ${aspect.planet2} work together harmoniously. Your ${planet1Meaning.toLowerCase()} naturally supports your ${planet2Meaning.toLowerCase()}.${tightNote}`;
  } else if (nature === 'challenging') {
    return `${aspect.planet1} and ${aspect.planet2} create dynamic tension. Your ${planet1Meaning.toLowerCase()} and ${planet2Meaning.toLowerCase()} don't always agree, which can create friction but also drives growth.${tightNote}`;
  } else {
    return `${aspect.planet1} and ${aspect.planet2} are fused together. Your ${planet1Meaning.toLowerCase()} and ${planet2Meaning.toLowerCase()} act as one force.${tightNote}`;
  }
}

export const ReadingScriptGenerator: React.FC<ReadingScriptGeneratorProps> = ({
  planets,
  aspects,
  chartName,
  useTraditional,
  natalChart
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const script = useMemo(() => {
    const sections: ScriptSection[] = [];
    
    // 1. OPENING
    sections.push({
      title: "Opening",
      content: [
        `"Let's explore ${chartName}'s natal chart together. I'll walk you through the key patterns I see."`,
        `"Remember: nothing in your chart is 'bad.' Some placements require more conscious work, but those often become your greatest strengths."`
      ]
    });

    // 2. THE BIG THREE (Sun, Moon, Ascendant)
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    const asc = planets.find(p => p.name === 'Ascendant');
    
    const bigThreeContent: string[] = [];
    
    if (sun) {
      const sunDignity = computeDignity('Sun', sun.sign, useTraditional);
      const sunDescription = PLANET_IN_SIGN.Sun?.[sun.sign] || `Your core identity expresses through ${sun.sign}.`;
      bigThreeContent.push(`"Your Sun is in ${sun.sign} at ${sun.degree.toFixed(0)}°${sun.house ? ` in the ${sun.house}${sun.house === 1 ? 'st' : sun.house === 2 ? 'nd' : sun.house === 3 ? 'rd' : 'th'} house` : ''}."`);
      bigThreeContent.push(`"${sunDescription}"`);
      if (sunDignity !== 'peregrine') {
        bigThreeContent.push(`"${getPlacementFeeling('Sun', sun.sign, sunDignity, sun.house)}"`);
      }
    }
    
    if (moon) {
      const moonDignity = computeDignity('Moon', moon.sign, useTraditional);
      const moonDescription = PLANET_IN_SIGN.Moon?.[moon.sign] || `Your emotional nature expresses through ${moon.sign}.`;
      bigThreeContent.push(`"Your Moon is in ${moon.sign}${moon.house ? ` in the ${moon.house}${moon.house === 1 ? 'st' : moon.house === 2 ? 'nd' : moon.house === 3 ? 'rd' : 'th'} house` : ''}."`);
      bigThreeContent.push(`"${moonDescription}"`);
      if (moonDignity !== 'peregrine') {
        bigThreeContent.push(`"${getPlacementFeeling('Moon', moon.sign, moonDignity, moon.house)}"`);
      }
    }
    
    if (asc) {
      const ascCostume = SIGN_COSTUMES[asc.sign];
      const ascDescription = ascCostume 
        ? `You enter every room wearing ${ascCostume.costume}. Your energy reads as ${ascCostume.energy}. You approach life ${ascCostume.howTheyDoIt}.`
        : `Your Ascendant in ${asc.sign} shapes how you appear to others and approach new situations.`;
      bigThreeContent.push(`"Your Ascendant is in ${asc.sign}."`);
      bigThreeContent.push(`"${ascDescription}"`);
    }
    
    sections.push({
      title: "The Big Three — Sun, Moon, Rising",
      content: bigThreeContent
    });

    // 3. PERSONAL PLANETS (Mercury, Venus, Mars)
    const mercury = planets.find(p => p.name === 'Mercury');
    const venus = planets.find(p => p.name === 'Venus');
    const mars = planets.find(p => p.name === 'Mars');
    
    const personalContent: string[] = [];
    
    if (mercury) {
      const mercuryDignity = computeDignity('Mercury', mercury.sign, useTraditional);
      personalContent.push(`"Mercury in ${mercury.sign} shows how you think and communicate. ${mercury.retrograde ? 'Being retrograde, your Mercury works more internally — you process before speaking.' : ''}"`);
      if (mercuryDignity !== 'peregrine') {
        personalContent.push(`"${getPlacementFeeling('Mercury', mercury.sign, mercuryDignity)}"`);
      }
    }
    
    if (venus) {
      const venusDignity = computeDignity('Venus', venus.sign, useTraditional);
      personalContent.push(`"Venus in ${venus.sign} reveals your love style, values, and what you find beautiful."`);
      if (venusDignity !== 'peregrine') {
        personalContent.push(`"${getPlacementFeeling('Venus', venus.sign, venusDignity)}"`);
      }
    }
    
    if (mars) {
      const marsDignity = computeDignity('Mars', mars.sign, useTraditional);
      personalContent.push(`"Mars in ${mars.sign} shows how you assert yourself, pursue goals, and handle anger."`);
      if (marsDignity !== 'peregrine') {
        personalContent.push(`"${getPlacementFeeling('Mars', mars.sign, marsDignity)}"`);
      }
    }
    
    if (personalContent.length > 0) {
      sections.push({
        title: "Personal Planets — How You Operate",
        content: personalContent
      });
    }

    // 4. KEY ASPECTS (tight ones first)
    const tightAspects = aspects.filter(a => a.orb < 3).slice(0, 5);
    const aspectContent: string[] = [];
    
    if (tightAspects.length > 0) {
      aspectContent.push(`"Now let's look at the strongest connections in your chart — aspects under 3° that you feel intensely."`);
      
      tightAspects.forEach(aspect => {
        const p1Meaning = PLANET_MEANINGS[aspect.planet1]?.split(',')[0] || aspect.planet1;
        const p2Meaning = PLANET_MEANINGS[aspect.planet2]?.split(',')[0] || aspect.planet2;
        const symbol = getAspectSymbol(aspect.aspectType);
        
        aspectContent.push(`"${aspect.planet1} ${symbol} ${aspect.planet2} (${aspect.orb.toFixed(1)}°): ${getAspectFeeling(aspect, p1Meaning, p2Meaning)}"`);
      });
    } else {
      aspectContent.push(`"Your aspects are more diffuse — no single connection dominates. This can mean more flexibility in how these energies express."`);
    }
    
    sections.push({
      title: "Key Aspects — The Conversations Between Planets",
      content: aspectContent
    });

    // 5. DISPOSITOR CHAIN / COMMAND CENTER
    const dispositorContent: string[] = [];
    
    // Find mutual receptions
    const mutualReceptions: Array<[string, string]> = [];
    planets.forEach(p1 => {
      planets.forEach(p2 => {
        if (p1.name !== p2.name) {
          const ruler1 = getSignRuler(p1.sign, useTraditional);
          const ruler2 = getSignRuler(p2.sign, useTraditional);
          if (ruler1 === p2.name && ruler2 === p1.name) {
            if (!mutualReceptions.some(([a, b]) => 
              (a === p1.name && b === p2.name) || (a === p2.name && b === p1.name)
            )) {
              mutualReceptions.push([p1.name, p2.name]);
            }
          }
        }
      });
    });
    
    // Find planets in own sign
    const selfRulers = planets.filter(p => getSignRuler(p.sign, useTraditional) === p.name);
    
    if (mutualReceptions.length > 0) {
      const [p1, p2] = mutualReceptions[0];
      dispositorContent.push(`"Your chart has a powerful command center: ${p1} and ${p2} are in mutual reception — they rule each other's signs."`);
      dispositorContent.push(`"This means every planet in your chart eventually reports up to these two. All your decisions filter through ${p1} and ${p2} themes."`);
      dispositorContent.push(`"When making choices, you'll naturally ask: 'Does this align with my ${PLANET_MEANINGS[p1]?.split(',')[0]?.toLowerCase() || p1}?' AND 'Does this serve my ${PLANET_MEANINGS[p2]?.split(',')[0]?.toLowerCase() || p2}?'"`);
    } else if (selfRulers.length > 0) {
      dispositorContent.push(`"${selfRulers.map(p => p.name).join(' and ')} ${selfRulers.length > 1 ? 'are' : 'is'} in ${selfRulers.length > 1 ? 'their' : 'its'} own sign — acting as final dispositor(s) in your chart."`);
      dispositorContent.push(`"Energy flows cleanly to ${selfRulers.length > 1 ? 'these points' : 'this point'}. ${selfRulers[0].name} themes run through much of your chart."`);
    } else {
      dispositorContent.push(`"Your chart has a dispositor loop — planets circulate energy without a single 'boss.' This can feel like going in circles until you consciously choose a starting point."`);
    }
    
    sections.push({
      title: "The Command Center — Who Calls the Shots",
      content: dispositorContent
    });

    // 6. CHALLENGES & GROWTH EDGES
    const challengeContent: string[] = [];
    
    const challengingPlacements = planets.filter(p => {
      const dignity = computeDignity(p.name, p.sign, useTraditional);
      return dignity === 'detriment' || dignity === 'fall';
    });
    
    if (challengingPlacements.length > 0) {
      challengeContent.push(`"Let's talk about where you build mastery through practice rather than having it handed to you."`);
      
      challengingPlacements.slice(0, 3).forEach(p => {
        const dignity = computeDignity(p.name, p.sign, useTraditional);
        challengeContent.push(`"${p.name} in ${p.sign} (${dignity}): ${DIGNITY_EXPLAINERS[dignity]}"`);
      });
      
      challengeContent.push(`"Remember: these aren't weaknesses. They're where you develop hard-won expertise that others may never fully understand."`);
    } else {
      challengeContent.push(`"Your planets are mostly in neutral or supported positions — you may not face as many internal friction points, but watch for taking natural gifts for granted."`);
    }
    
    sections.push({
      title: "Growth Edges — Where You Build Mastery",
      content: challengeContent
    });

    // 7. CHART PATTERNS (Yod, T-Square, etc.)
    if (natalChart) {
      const patterns = detectChartPatterns(natalChart);
      
      if (patterns.length > 0) {
        const patternContent: string[] = [];
        patternContent.push(`"Your chart contains some significant patterns — geometric configurations that amplify certain themes."`);
        
        patterns.forEach(pattern => {
          if (pattern.name.includes('Yod')) {
            patternContent.push(`\n**⚲ YOD (FINGER OF GOD)**`);
            patternContent.push(`"This is one of the most significant patterns in astrology — it indicates a special mission or destiny."`);
            
            // Parse the detailed description
            const descLines = pattern.description.split('\n').filter(l => l.trim());
            descLines.forEach(line => {
              if (line.startsWith('**')) {
                patternContent.push(line);
              } else {
                patternContent.push(`"${line}"`);
              }
            });
            
            patternContent.push(`\n**The Challenge:**`);
            patternContent.push(`"${pattern.challenge}"`);
            
            patternContent.push(`\n**The Gift:**`);
            patternContent.push(`"${pattern.gift}"`);
          } else {
            patternContent.push(`\n**${pattern.symbol} ${pattern.name.toUpperCase()}**`);
            patternContent.push(`"Planets involved: ${pattern.planets.join(', ')}"`);
            patternContent.push(`"${pattern.meaning}"`);
            if (pattern.challenge) {
              patternContent.push(`"Challenge: ${pattern.challenge}"`);
            }
            if (pattern.gift) {
              patternContent.push(`"Gift: ${pattern.gift}"`);
            }
          }
        });
        
        sections.push({
          title: "Chart Patterns — Geometry of Destiny",
          content: patternContent
        });
      }
    }

    // 8. CLOSING
    sections.push({
      title: "Closing",
      content: [
        `"This is your unique cosmic blueprint. The chart shows tendencies, not destiny — you always have choice in how you express these energies."`,
        `"What questions do you have? What resonated most strongly?"`
      ]
    });

    return sections;
  }, [planets, aspects, chartName, useTraditional, natalChart]);

  const copyToClipboard = () => {
    const fullScript = script.map(section => 
      `## ${section.title}\n\n${section.content.join('\n\n')}`
    ).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(fullScript);
    toast.success('Reading script copied to clipboard!');
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <CardTitle className="text-sm font-medium flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Chart Reading Script
              </div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                A step-by-step narrative script for giving readings. Copy and customize for your style.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy size={14} />
                Copy Script
              </Button>
            </div>
            
            <ScrollArea className="h-[500px] rounded-md border p-4">
              <div className="space-y-6">
                {script.map((section, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {section.title}
                    </h4>
                    <div className="space-y-3 pl-8">
                      {section.content.map((paragraph, j) => (
                        <p 
                          key={j} 
                          className={`text-sm leading-relaxed ${
                            paragraph.startsWith('"') 
                              ? 'italic text-foreground' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {i < script.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="bg-secondary/30 p-3 rounded-md">
              <p className="text-[10px] text-muted-foreground">
                <strong>Tip:</strong> Pause after each section and invite questions. The best readings are conversations, not monologues.
                Adjust the language to match your style — these are starting points, not scripts to read verbatim.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
