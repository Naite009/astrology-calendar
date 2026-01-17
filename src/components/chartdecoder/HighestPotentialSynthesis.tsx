import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartPlanet, ChartAspect, computeDignity, getPlanetSymbol, getSignSymbol, getAspectNature } from '@/lib/chartDecoderLogic';
import { getBirthConditions } from '@/lib/birthConditions';
import { analyzeQuadrants } from '@/lib/hemisphereAnalysis';
import { detectChartShape } from '@/lib/chartShapes';
import { generateCharacterProfile, generateDirectorsNotes, PLANET_ROLES } from '@/lib/cinematicNarrative';

interface HighestPotentialSynthesisProps {
  chart: NatalChart;
  planets: ChartPlanet[];
  aspects: ChartAspect[];
  useTraditional?: boolean;
}

export const HighestPotentialSynthesis: React.FC<HighestPotentialSynthesisProps> = ({
  chart,
  planets,
  aspects,
  useTraditional = true
}) => {
  // Calculate all the synthesis data
  const birthConditions = getBirthConditions(chart);
  const quadrantAnalysis = analyzeQuadrants(planets);
  const chartShape = detectChartShape(planets);
  const profiles = planets.map(p => generateCharacterProfile(p, useTraditional));
  const directorsNotes = generateDirectorsNotes(profiles);

  // Find planets in dignity (gifts)
  const planetsInDignity = planets.filter(p => {
    const d = computeDignity(p.name, p.sign, useTraditional);
    return d === 'rulership' || d === 'exaltation';
  });

  // Find planets in challenge
  const planetsInChallenge = planets.filter(p => {
    const d = computeDignity(p.name, p.sign, useTraditional);
    return d === 'detriment' || d === 'fall';
  });

  // Find flowing aspects (gifts)
  const flowingAspects = aspects.filter(a => getAspectNature(a.aspectType) === 'flowing');
  
  // Find challenging aspects (growth edges)
  const challengingAspects = aspects.filter(a => getAspectNature(a.aspectType) === 'challenging');

  // Get the Big Three
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const rising = planets.find(p => p.name === 'Ascendant');

  // North Node for destiny
  const northNode = planets.find(p => p.name === 'NorthNode');

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-serif text-foreground">✨ Your Highest Potential</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This is the synthesis of your chart—what you came here to master, express, and become.
            </p>
          </div>

          {/* The Core Identity Statement */}
          <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Core Identity</h3>
            <p className="text-lg font-serif text-foreground">
              {sun && (
                <>
                  You are a <span className="text-primary font-medium">{sun.sign} Sun</span>
                  {sun.house && <span> expressing through the {getHouseTheme(sun.house)}</span>}
                </>
              )}
              {moon && (
                <>
                  , with a <span className="text-primary font-medium">{moon.sign} Moon</span>
                  {moon.house && <span> needing {getMoonNeed(moon.sign)}</span>}
                </>
              )}
              {rising && (
                <>
                  , presenting to the world as <span className="text-primary font-medium">{rising.sign} Rising</span>
                </>
              )}.
            </p>
            
            {birthConditions.moonPhase && (
              <p className="text-sm text-muted-foreground mt-2">
                Born during a <span className="font-medium">{birthConditions.moonPhase.phase}</span> — 
                you are <span className="font-medium">{birthConditions.moonPhase.archetype}</span>.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gifts & Strengths */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-emerald-500">✦</span>
            Your Natural Gifts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Planets in Dignity */}
          {planetsInDignity.length > 0 && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Planets Operating at Full Power
              </h4>
              <div className="flex flex-wrap gap-2">
                {planetsInDignity.map(p => {
                  const d = computeDignity(p.name, p.sign, useTraditional);
                  return (
                    <Badge key={p.name} variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-500/10">
                      {getPlanetSymbol(p.name)} {p.name} in {p.sign} ({d})
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These planets express cleanly and powerfully. Trust these energies—they're your superpowers.
              </p>
            </div>
          )}

          {/* Flowing Aspects */}
          {flowingAspects.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Natural Harmony ({flowingAspects.length} flowing aspects)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {flowingAspects.slice(0, 6).map((a, i) => (
                  <div key={i} className="text-xs flex items-center gap-1.5 text-emerald-600">
                    <span>{getPlanetSymbol(a.planet1)}</span>
                    <span className="text-emerald-400">{a.aspectType === 'trine' ? '△' : '✱'}</span>
                    <span>{getPlanetSymbol(a.planet2)}</span>
                    <span className="text-muted-foreground">({a.orb.toFixed(1)}°)</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These planetary pairs support each other naturally. Energy flows easily here.
              </p>
            </div>
          )}

          {/* Chart Shape Gift */}
          <div className="pt-3 border-t border-border/50">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Your Pattern Gift: {chartShape.type}
            </h4>
            <p className="text-sm text-foreground">{chartShape.gift}</p>
          </div>
        </CardContent>
      </Card>

      {/* Growth Edges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-amber-500">⚡</span>
            Your Growth Edges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Planets in Challenge */}
          {planetsInChallenge.length > 0 && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Planets Requiring Conscious Work
              </h4>
              <div className="flex flex-wrap gap-2">
                {planetsInChallenge.map(p => {
                  const d = computeDignity(p.name, p.sign, useTraditional);
                  return (
                    <Badge key={p.name} variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">
                      {getPlanetSymbol(p.name)} {p.name} in {p.sign} ({d})
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These planets don't operate on autopilot. They require strategy, patience, and earned confidence.
              </p>
            </div>
          )}

          {/* Challenging Aspects */}
          {challengingAspects.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Productive Tensions ({challengingAspects.length} challenging aspects)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {challengingAspects.slice(0, 6).map((a, i) => (
                  <div key={i} className="text-xs flex items-center gap-1.5 text-amber-600">
                    <span>{getPlanetSymbol(a.planet1)}</span>
                    <span className="text-amber-400">{a.aspectType === 'square' ? '□' : a.aspectType === 'opposition' ? '☍' : '⚻'}</span>
                    <span>{getPlanetSymbol(a.planet2)}</span>
                    <span className="text-muted-foreground">({a.orb.toFixed(1)}°)</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These create friction that demands growth. They're not problems—they're your catalysts.
              </p>
            </div>
          )}

          {/* Chart Shape Challenge */}
          <div className="pt-3 border-t border-border/50">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Your Pattern Challenge
            </h4>
            <p className="text-sm text-foreground">{chartShape.challenge}</p>
          </div>
        </CardContent>
      </Card>

      {/* Soul Direction */}
      {northNode && (
        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-indigo-500">☊</span>
              Your Soul Direction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Your <span className="font-medium text-indigo-500">North Node in {northNode.sign}</span>
              {northNode.house && <span> (House {northNode.house})</span>} points to where you're growing.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {getNorthNodeGuidance(northNode.sign)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Director's Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">🎬 Director's Notes</CardTitle>
          <p className="text-xs text-muted-foreground">Practical guidance for working with your chart</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {directorsNotes.map((note, i) => (
              <li key={i} className="text-sm text-foreground pl-4 border-l-2 border-primary/30">
                <span dangerouslySetInnerHTML={{ __html: note.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>') }} />
              </li>
            ))}
            
            {/* Sect-based guidance */}
            <li className="text-sm text-foreground pl-4 border-l-2 border-primary/30">
              <strong className="text-primary">Your {birthConditions.sect.sect} Chart Path:</strong> {birthConditions.sect.overallMeaning.split('.')[0]}.
            </li>
            
            {/* Moon phase guidance */}
            {birthConditions.moonPhase && (
              <li className="text-sm text-foreground pl-4 border-l-2 border-primary/30">
                <strong className="text-primary">As {birthConditions.moonPhase.archetype}:</strong> {birthConditions.moonPhase.lifeTheme}
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Final Synthesis */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/20 border-primary/20">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-serif text-foreground mb-4">The Story You're Here to Tell</h3>
          <p className="text-foreground max-w-2xl mx-auto leading-relaxed">
            {generateFinalSynthesis(chart, planets, birthConditions, chartShape, quadrantAnalysis)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function getHouseTheme(house: number): string {
  const themes: Record<number, string> = {
    1: 'realm of self and identity',
    2: 'realm of values and resources',
    3: 'realm of communication and learning',
    4: 'realm of home and roots',
    5: 'realm of creativity and joy',
    6: 'realm of work and service',
    7: 'realm of partnership',
    8: 'realm of transformation and depth',
    9: 'realm of wisdom and expansion',
    10: 'realm of career and public life',
    11: 'realm of community and vision',
    12: 'realm of the unconscious and transcendence'
  };
  return themes[house] || 'your chart';
}

function getMoonNeed(sign: string): string {
  const needs: Record<string, string> = {
    Aries: 'independence and action',
    Taurus: 'stability and sensory comfort',
    Gemini: 'mental stimulation and variety',
    Cancer: 'emotional security and nurturing',
    Leo: 'recognition and creative expression',
    Virgo: 'order and meaningful work',
    Libra: 'harmony and partnership',
    Scorpio: 'depth and emotional truth',
    Sagittarius: 'freedom and meaning',
    Capricorn: 'achievement and structure',
    Aquarius: 'independence and uniqueness',
    Pisces: 'transcendence and creative flow'
  };
  return needs[sign] || 'emotional fulfillment';
}

function getNorthNodeGuidance(sign: string): string {
  const guidance: Record<string, string> = {
    Aries: 'Your growth edge is learning to act independently, prioritize yourself, and develop courage. Move away from excessive compromise toward healthy self-assertion.',
    Taurus: 'Your growth edge is learning to slow down, build lasting value, and trust your own resources. Move from chaos toward stability and self-worth.',
    Gemini: 'Your growth edge is learning to stay curious, communicate, and embrace variety. Move from rigid beliefs toward flexible learning.',
    Cancer: 'Your growth edge is learning to nurture, feel deeply, and create emotional security. Move from achievement toward authentic connection.',
    Leo: 'Your growth edge is learning to shine, create, and express your unique self. Move from fitting in toward standing out.',
    Virgo: 'Your growth edge is learning to be practical, helpful, and discerning. Move from idealism toward grounded service.',
    Libra: 'Your growth edge is learning to partner, balance, and consider others. Move from self-focus toward true collaboration.',
    Scorpio: 'Your growth edge is learning to go deep, transform, and embrace intensity. Move from surface comfort toward psychological truth.',
    Sagittarius: 'Your growth edge is learning to seek meaning, expand horizons, and trust faith. Move from details toward the big picture.',
    Capricorn: 'Your growth edge is learning to build, achieve, and take responsibility. Move from dependency toward mature self-sufficiency.',
    Aquarius: 'Your growth edge is learning to innovate, serve the collective, and embrace your uniqueness. Move from personal drama toward humanitarian vision.',
    Pisces: 'Your growth edge is learning to dissolve boundaries, trust intuition, and embrace spirituality. Move from analysis toward surrender.'
  };
  return guidance[sign] || 'Your soul is growing toward new territory. Trust the unfamiliar path.';
}

function generateFinalSynthesis(
  chart: NatalChart,
  planets: ChartPlanet[],
  birthConditions: ReturnType<typeof getBirthConditions>,
  chartShape: ReturnType<typeof detectChartShape>,
  quadrantAnalysis: ReturnType<typeof analyzeQuadrants>
): string {
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  
  let synthesis = '';
  
  // Opening based on chart shape
  if (chartShape.type === 'Bowl') {
    synthesis += 'You came here with focused purpose, carrying a half of life that you\'ve mastered. ';
  } else if (chartShape.type === 'Locomotive') {
    synthesis += 'You came here with powerful momentum, always driving toward what\'s missing. ';
  } else if (chartShape.type === 'Splash') {
    synthesis += 'You came here as a Renaissance soul, able to engage with all of life. ';
  } else {
    synthesis += 'You came here with a unique pattern of energy and purpose. ';
  }
  
  // Sun statement
  if (sun) {
    synthesis += `Your central story is one of becoming a true ${sun.sign}—`;
    if (sun.sign === 'Aries') synthesis += 'learning to lead yourself first. ';
    else if (sun.sign === 'Taurus') synthesis += 'building lasting value. ';
    else if (sun.sign === 'Gemini') synthesis += 'connecting ideas and people. ';
    else if (sun.sign === 'Cancer') synthesis += 'nurturing what matters most. ';
    else if (sun.sign === 'Leo') synthesis += 'shining your creative light. ';
    else if (sun.sign === 'Virgo') synthesis += 'perfecting your craft in service. ';
    else if (sun.sign === 'Libra') synthesis += 'creating beauty and balance. ';
    else if (sun.sign === 'Scorpio') synthesis += 'transforming through depth. ';
    else if (sun.sign === 'Sagittarius') synthesis += 'seeking truth and meaning. ';
    else if (sun.sign === 'Capricorn') synthesis += 'building your legacy. ';
    else if (sun.sign === 'Aquarius') synthesis += 'innovating for the collective. ';
    else if (sun.sign === 'Pisces') synthesis += 'channeling the transcendent. ';
  }
  
  // Moon phase soul purpose
  if (birthConditions.moonPhase) {
    synthesis += `As ${birthConditions.moonPhase.archetype}, ${birthConditions.moonPhase.lifeTheme.split('.')[0].toLowerCase()}. `;
  }
  
  // Hemisphere emphasis
  if (quadrantAnalysis.hemispheres.upper.percentage > 60) {
    synthesis += 'Your path runs through visibility and public engagement. ';
  } else if (quadrantAnalysis.hemispheres.lower.percentage > 60) {
    synthesis += 'Your path runs through inner development before outer expression. ';
  }
  
  // Closing
  synthesis += 'Trust your cast of characters—they know their roles.';
  
  return synthesis;
}

export default HighestPotentialSynthesis;
