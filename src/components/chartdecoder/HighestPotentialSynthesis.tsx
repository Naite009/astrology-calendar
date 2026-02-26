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
import { getDecan } from '@/lib/decans';

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
            <div className="text-foreground space-y-3">
              <p className="text-lg font-serif leading-relaxed">
                {generateDeepCoreIdentity(sun, moon, rising, birthConditions)}
              </p>
            </div>
            
            {birthConditions.moonPhase && (
              <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  Born during a {birthConditions.moonPhase.phase} — {birthConditions.moonPhase.archetype}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {birthConditions.moonPhase.soulPurpose}
                </p>
              </div>
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
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-primary">☊</span>
              Your Soul Direction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground font-medium">
              North Node in {northNode.sign}
              {northNode.house && <span className="text-muted-foreground font-normal"> (House {northNode.house})</span>}
            </p>
            <div className="text-sm text-foreground leading-relaxed space-y-2">
              {getDeepNorthNodeGuidance(northNode.sign, northNode.house).map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>') }} />
              ))}
            </div>
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

// ============================================================================
// DEEP HELPER FUNCTIONS
// ============================================================================

function generateDeepCoreIdentity(
  sun: ChartPlanet | undefined,
  moon: ChartPlanet | undefined,
  rising: ChartPlanet | undefined,
  birthConditions: ReturnType<typeof getBirthConditions>
): string {
  const parts: string[] = [];
  const isNightChart = birthConditions.sect.sect === 'Night';
  
  if (sun) {
    const decan = getDecan(sun.degree, sun.sign);
    const houseDesc = sun.house ? HOUSE_BEHAVIORAL[sun.house] : '';
    parts.push(`Your ${sun.sign} Sun${decan ? ` (${decan.quality})` : ''} in House ${sun.house || '?'} means ${getSunBehavior(sun.sign, sun.house || 0)}. ${houseDesc}`);
    
    if (isNightChart) {
      parts.push(`Because you were born at night, your Sun operates below the surface — it's your private identity, the you that exists behind closed doors. Your Moon runs the show externally.`);
    }
  }
  
  if (moon) {
    parts.push(`Your ${moon.sign} Moon in House ${moon.house || '?'} means ${getMoonBehavior(moon.sign, moon.house || 0)}${isNightChart ? ' — and as your chart ruler by sect, this is the DOMINANT force in your daily life, career instincts, and relationship patterns' : ''}.`);
  }
  
  if (rising) {
    parts.push(`${rising.sign} Rising is your survival strategy: ${getRisingBehavior(rising.sign)}. This is the mask that became your face — the first thing people experience before they know you.`);
  }
  
  return parts.join('\n\n');
}

function getSunBehavior(sign: string, house: number): string {
  const behaviors: Record<string, string> = {
    Aries: 'your identity is built through action, initiative, and the courage to go first — you become yourself by doing, not by thinking about doing',
    Taurus: 'your identity is built through what you value, accumulate, and stabilize — you become yourself by creating lasting beauty and security',
    Gemini: 'your identity is built through learning, communicating, and connecting dots others miss — you become yourself through words, curiosity, and intellectual versatility',
    Cancer: 'your identity is built through nurturing, protecting, and creating emotional sanctuary — you become yourself by caring so deeply it restructures your environment',
    Leo: 'your identity is built through creative self-expression, generosity, and the willingness to be seen — you become yourself by having the courage to take up space',
    Virgo: 'your identity is built through analysis, refinement, and devotion to craft — you become yourself by making things better, cleaner, more functional',
    Libra: 'your identity is built through relationship, aesthetic sensibility, and the pursuit of fairness — you become yourself through the mirror of others, learning who you are by understanding who they are',
    Scorpio: 'your identity is built through psychological depth, power dynamics, and transformation — you become yourself by surviving what would destroy others',
    Sagittarius: 'your identity is built through seeking meaning, teaching truth, and expanding beyond comfort — you become yourself through the journey, never the destination',
    Capricorn: 'your identity is built through discipline, responsibility, and earning authority over time — you become yourself by building something that outlasts you',
    Aquarius: 'your identity is built through innovation, detachment from convention, and service to the collective — you become yourself by refusing to be anyone else',
    Pisces: 'your identity is built through surrender, compassion, and dissolving the boundary between self and other — you become yourself by losing yourself in something greater',
  };
  return behaviors[sign] || 'your identity expresses uniquely through this placement';
}

function getMoonBehavior(sign: string, house: number): string {
  const behaviors: Record<string, string> = {
    Aries: 'you process emotions through action — when you feel something, you DO something. Sitting with feelings is excruciating. You need independence to feel safe',
    Taurus: 'you process emotions through the body — food, touch, comfort, beauty. You need physical stability and routine to feel emotionally secure. Change destabilizes you first in the gut',
    Gemini: 'you process emotions through talking, writing, and intellectualizing. You need to NAME what you feel before you can feel it. Silence in emotional conflict is your kryptonite',
    Cancer: 'you process emotions through nurturing and being nurtured. You absorb the emotional atmosphere of every room you enter. Home is not a place, it is a feeling you carry and create',
    Leo: 'you process emotions through creative expression and validation. You need to be SEEN feeling what you feel. Ignored emotions fester into drama',
    Virgo: 'you process emotions by fixing things. Anxiety manifests as organizing, cleaning, problem-solving. You need to feel useful to feel safe',
    Libra: 'you process emotions through relationships — you don\'t fully know what you feel until you discuss it with someone else. Conflict disrupts your nervous system. You need harmony the way others need oxygen',
    Scorpio: 'you process emotions at tectonic depth. You feel everything but show almost nothing. Trust is earned through crisis. Your emotional intensity is your superpower and your heaviest burden',
    Sagittarius: 'you process emotions by finding the meaning in them. Pain must have a PURPOSE or it becomes unbearable. You need freedom — emotional claustrophobia is your worst trigger',
    Capricorn: 'you process emotions by controlling them. You learned early that vulnerability is risky. Emotional maturity came too soon; you may need to learn to be emotionally young again',
    Aquarius: 'you process emotions by intellectualizing them. You observe your own feelings from a distance. Emotional chaos makes you retreat into your mind. You need space to process without pressure',
    Pisces: 'you process emotions by absorbing everyone else\'s. Boundaries between your feelings and others\' feelings are porous. You need regular solitude and creative outlets or you drown in empathy',
  };
  const houseFlavor = house ? ` This emotional pattern plays out most intensely in ${HOUSE_LIFE_AREA[house] || 'your life'}` : '';
  return (behaviors[sign] || 'your emotional needs are unique to this placement') + houseFlavor;
}

function getRisingBehavior(sign: string): string {
  const behaviors: Record<string, string> = {
    Aries: 'you lead with directness, energy, and a "let\'s go" attitude. People perceive you as bold, competitive, and impatient. You enter rooms like you\'re on a mission, even when you\'re not',
    Taurus: 'you lead with calm, sensory presence, and an unshakable quality. People perceive you as grounded, attractive, and stubborn. You slow rooms down just by walking in',
    Gemini: 'you lead with curiosity, wit, and rapid-fire communication. People perceive you as intelligent, scattered, and eternally youthful. You fill silence instinctively',
    Cancer: 'you lead with emotional intelligence and protectiveness. People perceive you as nurturing, moody, and deeply caring. You make people feel safe without trying',
    Leo: 'you lead with warmth, presence, and an unconscious demand for attention. People perceive you as confident, generous, and dramatic. You light up rooms — which can feel exhausting when you just want to blend in',
    Virgo: 'you lead with competence, precision, and helpfulness. People perceive you as smart, critical, and modest. You\'re the person everyone trusts with details',
    Libra: 'you lead with grace, diplomacy, and aesthetic awareness. People perceive you as charming, indecisive, and beautiful. You smooth social situations automatically — which means people rarely see you struggle',
    Scorpio: 'you lead with intensity, mystery, and a penetrating gaze. People perceive you as powerful, private, and intimidating. You know things about people before they tell you',
    Sagittarius: 'you lead with enthusiasm, humor, and expansive energy. People perceive you as optimistic, blunt, and freedom-loving. You make everything feel like an adventure',
    Capricorn: 'you lead with authority, reserve, and quiet competence. People perceive you as serious, ambitious, and mature beyond your years. You earn respect before warmth',
    Aquarius: 'you lead with originality, detachment, and intellectual edge. People perceive you as unique, rebellious, and slightly alien. You don\'t fit in — and that\'s the strategy',
    Pisces: 'you lead with empathy, dreaminess, and a chameleon-like quality. People perceive you as gentle, elusive, and otherworldly. You absorb the identity of whoever you\'re with',
  };
  return behaviors[sign] || 'you present a unique face to the world';
}

const HOUSE_BEHAVIORAL: Record<number, string> = {
  1: 'Your identity is your project — you\'re always becoming, always refining who you are through direct experience.',
  2: 'You build identity through what you own, earn, and value. Self-worth and net worth are entangled; untangling them is your work.',
  3: 'You build identity through communication, learning, and your immediate environment. You need to speak to exist.',
  4: 'Your identity is rooted in family patterns, ancestry, and the private self. Home is where you become you.',
  5: 'Your identity is expressed through creativity, romance, and play. You need an audience or a canvas — something to pour yourself into.',
  6: 'Your identity is expressed through work, service, and daily practice. You are what you do, literally. Health and routine define you.',
  7: 'Your identity is forged in partnership. You discover who you are through other people — for better and worse.',
  8: 'Your identity is forged through crisis, transformation, and shared resources. You become yourself by surviving what others avoid.',
  9: 'Your identity is built through seeking truth, philosophy, travel, and higher learning. You become yourself by expanding beyond your starting point.',
  10: 'Your identity is public — your career, reputation, and legacy are inseparable from who you are. You need to build something the world can see.',
  11: 'Your identity is expressed through community, friendship, and collective vision. You become yourself through the groups you join and the futures you imagine.',
  12: 'Your identity is hidden, spiritual, and dissolving. You become yourself through solitude, surrender, and service to something transcendent. The unconscious runs the show.',
};

const HOUSE_LIFE_AREA: Record<number, string> = {
  1: 'your self-image and physical presence',
  2: 'your finances, possessions, and sense of self-worth',
  3: 'your communication, siblings, and daily mental life',
  4: 'your home, family, and emotional foundations',
  5: 'your creativity, romance, and children',
  6: 'your health, work routine, and service',
  7: 'your partnerships and one-on-one relationships',
  8: 'your shared resources, intimacy, and transformation',
  9: 'your beliefs, higher learning, and long-distance travel',
  10: 'your career, reputation, and public role',
  11: 'your friendships, community, and future vision',
  12: 'your unconscious patterns, spirituality, and solitude',
};

function getDeepNorthNodeGuidance(sign: string, house?: number): string[] {
  const guidance: Record<string, string[]> = {
    Aries: [
      '**Your soul is learning to prioritize itself.** Your South Node in Libra means you\'re an expert at compromise, diplomacy, and reading what others need. You could do this in your sleep. That\'s the problem — it\'s your comfort zone, and it keeps you from ever asking: *What do I actually want?*',
      '**Practical step:** Start making decisions without consulting anyone. Not big ones at first — what to eat, where to go, what to watch. Build the muscle of choosing for yourself. Notice how uncomfortable it feels. That discomfort is growth.',
      '**The deeper pattern:** You may have spent lifetimes (or your whole childhood) being the peacekeeper, the mediator, the one who holds everything together. Your soul contract now is to learn that conflict is not destruction — it\'s information. Your anger is valid. Your needs are not negotiable.',
    ],
    Taurus: [
      '**Your soul is learning to build lasting value from your own resources.** South Node in Scorpio means you\'re an expert at crisis, transformation, and using other people\'s power. But you stay in crisis mode long after the crisis ends.',
      '**Practical step:** Build one thing that is YOURS — a savings account, a garden, a daily routine. Something stable, boring, and completely under your control. Your nervous system needs proof that life can be calm.',
      '**The deeper pattern:** You may be addicted to intensity. Chaos feels familiar, peace feels suspicious. Your soul contract is to discover that simplicity is not the same as stagnation. The most profound thing you can do is stay.',
    ],
    Gemini: [
      '**Your soul is learning to stay curious and communicate locally.** South Node in Sagittarius means you\'re an expert at big-picture thinking, philosophy, and believing you already know the answer. Your challenge is listening to the question.',
      '**Practical step:** Ask more questions. In every conversation, ask one more question than feels natural. Read broadly. Talk to people who are nothing like you. The data matters as much as the theory.',
      '**The deeper pattern:** You may default to preaching, teaching, or assuming your worldview is correct. Your soul contract is to discover that truth is not a mountain you stand on — it\'s a conversation you join. Intellectual humility is your growth edge.',
    ],
    Cancer: [
      '**Your soul is learning to nurture and feel deeply.** South Node in Capricorn means you\'re an expert at achievement, structure, and emotional control. You built walls so high they became a prison.',
      '**Practical step:** Let someone take care of you this week. Not performatively — really receive it. Cook a meal with no purpose other than comfort. Call someone and say "I miss you" without an agenda.',
      '**The deeper pattern:** Achievement without emotional connection is hollow, and you\'ve already proven you can achieve. Your soul contract is to build a HOME — not a house, a home. A place where people feel safe because YOU feel safe.',
    ],
    Leo: [
      '**Your soul is learning to shine as an individual.** South Node in Aquarius means you\'re an expert at fitting into groups, being the intellectual, and hiding behind collective identity. Your challenge is to stop blending.',
      '**Practical step:** Create something this week that has your name on it. Not a group project. Not "for the cause." Something that is purely, unapologetically YOU. Share it. Let people respond.',
      '**The deeper pattern:** You may hide behind ideas, networks, and "the mission" to avoid the vulnerability of personal expression. Your soul contract is to risk being seen as an individual, not a role. Your heart, not your mind, is the compass.',
    ],
    Virgo: [
      '**Your soul is learning to be practical and discerning.** South Node in Pisces means you\'re an expert at surrender, compassion, and dissolving into the cosmic. But you use spirituality to avoid the mess of being human.',
      '**Practical step:** Fix one broken thing in your home. Organize one drawer. Make one concrete plan with dates and steps. Your soul needs the satisfaction of practical completion, not just spiritual intention.',
      '**The deeper pattern:** You may use meditation, art, or escape to avoid dealing with the physical world. Your soul contract is to bring heaven to earth — to be the mystic who also does their taxes, the healer who also cleans the kitchen.',
    ],
    Libra: [
      '**Your soul is learning to partner, balance, and consider others.** South Node in Aries means you\'re an expert at independence, action, and putting yourself first. That served you — but now it isolates you.',
      '**Practical step:** In your next disagreement, before responding, ask: "What do you need?" Not to capitulate — to understand. Practice the art of true negotiation where both people get something real.',
      '**The deeper pattern:** You may feel that needing others is weakness. Your soul contract is to discover that interdependence is not dependency — it\'s the highest form of strength. You lose nothing by learning to share.',
    ],
    Scorpio: [
      '**Your soul is learning to go deep, transform, and embrace intensity.** South Node in Taurus means you\'re an expert at comfort, stability, and holding onto what you have. But what you\'re holding onto may be holding you back.',
      '**Practical step:** Identify one thing in your life you\'re keeping because it feels safe, not because it serves you. A relationship pattern, a job, a belief, a possession. Name it. Ask: "Am I keeping this out of love or fear?" If fear — begin the process of letting go. Not dramatically. Just honestly.',
      '**The deeper pattern:** You may equate change with loss. Your soul contract is to discover that transformation is not destruction — it\'s composting. What dies feeds what\'s trying to grow. The intensity you\'re afraid of is actually your power source. Stop skimming the surface of your own life.',
    ],
    Sagittarius: [
      '**Your soul is learning to seek meaning beyond the familiar.** South Node in Gemini means you\'re an expert at data collection, communication, and mental agility. But you have a thousand facts and no wisdom.',
      '**Practical step:** Go somewhere you\'ve never been — physically or intellectually. Take a class in something you know nothing about. Have a conversation about meaning, purpose, or God with someone whose perspective challenges yours.',
      '**The deeper pattern:** You may stay busy learning to avoid the harder question: "What do I believe?" Your soul contract is to move from information to wisdom, from facts to faith, from cleverness to conviction.',
    ],
    Capricorn: [
      '**Your soul is learning to build, achieve, and take responsibility.** South Node in Cancer means you\'re an expert at nurturing, emotional connection, and creating safety. But you use emotional comfort as a hiding place from your ambition.',
      '**Practical step:** Set one professional goal with a deadline. Not a dream — a goal. With steps. Tell someone about it. Let yourself be held accountable. Notice how the vulnerability of ambition feels different from emotional vulnerability.',
      '**The deeper pattern:** You may sabotage success because "achieving" feels like leaving home. Your soul contract is to discover that you can be powerful AND emotionally connected. Authority does not require abandoning tenderness.',
    ],
    Aquarius: [
      '**Your soul is learning to serve the collective and embrace your uniqueness.** South Node in Leo means you\'re an expert at personal drama, creative self-expression, and demanding attention. But the spotlight got lonely.',
      '**Practical step:** Join a group, cause, or community where you are NOT the center. Contribute your gifts without needing credit. Notice how it feels to matter without being special.',
      '**The deeper pattern:** You may use personal charisma to avoid genuine connection with humanity as a whole. Your soul contract is to discover that your uniqueness serves its highest purpose when it serves something bigger than your identity.',
    ],
    Pisces: [
      '**Your soul is learning to dissolve boundaries and trust intuition.** South Node in Virgo means you\'re an expert at analysis, criticism, and fixing things. But your perfectionism is a form of control, and control is the opposite of faith.',
      '**Practical step:** This week, do one thing imperfectly ON PURPOSE. Leave a typo. Send a "good enough" email. Let your desk be messy. Notice the anxiety that arises — that anxiety is the exact edge your soul needs to push past.',
      '**The deeper pattern:** You may analyze your spiritual experiences instead of having them. Your soul contract is to let go of understanding and surrender to experiencing. Not everything has to make sense to be real.',
    ],
  };
  
  const result = guidance[sign] || ['Your soul is growing toward new territory. Trust the unfamiliar path.'];
  
  if (house) {
    result.push(`**In House ${house}:** This soul growth plays out specifically in ${HOUSE_LIFE_AREA[house] || 'this area of life'}. This is WHERE your courage to change must show up — not abstractly, but in the concrete, daily reality of ${HOUSE_LIFE_AREA[house] || 'this domain'}.`);
  }
  
  return result;
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
  const rising = planets.find(p => p.name === 'Ascendant');
  const northNode = planets.find(p => p.name === 'NorthNode');
  const isNightChart = birthConditions.sect.sect === 'Night';
  
  let synthesis = '';
  
  // Opening — chart shape specific and behavioral
  const shapeOpeners: Record<string, string> = {
    Bowl: `Your chart is a Bowl — half of life mastered, half unexplored. You carry concentrated purpose and your rim planets guard the gateway to your growth edge.`,
    Bucket: `Your chart is a Bucket — concentrated focus with a single handle planet acting as your release valve. Everything you build flows through that one channel.`,
    Locomotive: `Your chart is a Locomotive — two-thirds loaded, one-third empty. You are driven by what you haven't yet filled. Your leading planet pulls the entire train forward, and you don't stop.`,
    Seesaw: `Your chart is a Seesaw — two opposing camps of energy, forever weighing, forever balancing. You are the diplomat of the zodiac, the person who sees both sides because you ARE both sides.`,
    Splash: `Your chart is a Splash — energy distributed everywhere, competence in all directions. You're the Renaissance soul who can do anything but must choose what to master.`,
    Splay: `Your chart is a Splay — irregular power centers with intentional gaps. You refuse to be categorized, and your chart agrees. Your strength is in your concentrated clusters.`,
    Bundle: `Your chart is a Bundle — everything you are lives in one-third of the zodiac. This is radical specialization: you are a laser beam, not a floodlight.`,
    TSquare: `Your chart is driven by a T-Square — dynamic tension between opposing forces, channeled through one focal planet. This is the engine of achievement.`,
    Yod: `Your chart carries a Yod — the Finger of God pointing at your apex planet. This is a pattern of destiny, mission, and the constant adjustments required to fulfill both.`,
  };
  synthesis += (shapeOpeners[chartShape.type] || `Your chart carries a ${chartShape.type} pattern — ${chartShape.description}`) + ' ';
  
  // The sect-aware identity statement
  if (isNightChart && moon) {
    synthesis += `As a Night Chart native, your ${moon.sign} Moon is the dominant force — your emotional instincts, not your conscious identity, drive your daily decisions and relationships. `;
    if (sun) {
      synthesis += `Your ${sun.sign} Sun is the private flame, burning below the surface where only you (and those closest to you) can see it. `;
    }
  } else if (sun) {
    synthesis += `Your ${sun.sign} Sun${sun.house ? ` in House ${sun.house}` : ''} is your central story — the identity you're building through direct experience. `;
  }
  
  // Rising as strategy, not label
  if (rising) {
    synthesis += `${rising.sign} Rising is the lens others see you through, and the survival strategy you developed before you knew you were developing it. `;
  }
  
  // North Node as direction
  if (northNode) {
    synthesis += `Your North Node in ${northNode.sign}${northNode.house ? ` (House ${northNode.house})` : ''} is where your soul is stretching — uncomfortable, unfamiliar, and absolutely necessary. `;
  }
  
  // Moon phase integration
  if (birthConditions.moonPhase) {
    synthesis += `Born as ${birthConditions.moonPhase.archetype}, ${birthConditions.moonPhase.lifeTheme.split('.')[0].toLowerCase()}.`;
  }
  
  return synthesis;
}

export default HighestPotentialSynthesis;
