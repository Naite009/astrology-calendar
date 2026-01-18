import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Home, Compass, Sparkles, Shield, AlertTriangle, Star, Heart, Zap } from 'lucide-react';
import {
  ChartPlanet,
  ChartAspect,
  computeDignity,
  getSignRuler,
  getPlanetSymbol,
  getSignSymbol,
  getAspectSymbol,
  getAspectNature,
  PLANET_MEANINGS,
  DignityType
} from '@/lib/chartDecoderLogic';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculatePlanetaryCondition, PlanetaryCondition } from '@/lib/planetaryCondition';
import { calculateSect } from '@/lib/birthConditions';

interface ChartRulerDeepDiveProps {
  planets: ChartPlanet[];
  aspects: ChartAspect[];
  natalChart: NatalChart;
  useTraditional: boolean;
}

// Detailed house meanings for chart ruler placement
const CHART_RULER_HOUSE_MEANINGS: Record<number, {
  lifeDirection: string;
  dailyExpression: string;
  pathMeaning: string;
  challenges: string;
  gifts: string;
}> = {
  1: {
    lifeDirection: 'Self-discovery and personal presence',
    dailyExpression: 'You express your chart ruler energy directly — people see it immediately when they meet you',
    pathMeaning: 'Your life direction IS about you — your identity, your body, your personal journey. You are the project.',
    challenges: 'Can be too self-focused; may struggle to see beyond personal perspective',
    gifts: 'Natural self-awareness; people follow your lead instinctively; authentic presence'
  },
  2: {
    lifeDirection: 'Building resources and establishing self-worth',
    dailyExpression: 'You express your chart ruler through what you own, earn, and value',
    pathMeaning: 'Your life direction is about creating material security and discovering what truly matters to you.',
    challenges: 'Can over-identify with possessions; may struggle with self-worth issues',
    gifts: 'Natural ability to attract resources; grounded values; practical manifestation'
  },
  3: {
    lifeDirection: 'Communication, learning, and local connections',
    dailyExpression: 'You express your chart ruler through speaking, writing, and daily interactions',
    pathMeaning: 'Your life direction is about becoming a messenger — sharing ideas, connecting people, learning constantly.',
    challenges: 'Can scatter energy across too many interests; may stay surface-level',
    gifts: 'Natural communicator; quick learner; skilled at making connections'
  },
  4: {
    lifeDirection: 'Home, family, and emotional foundations',
    dailyExpression: 'You express your chart ruler in private — at home, with family, in your inner world',
    pathMeaning: 'Your life direction is about building emotional security and creating a foundation for yourself and others.',
    challenges: 'Can be too private; may over-attach to family or past; difficulty leaving home base',
    gifts: 'Deep emotional intelligence; natural caretaker; creates sanctuary wherever they go'
  },
  5: {
    lifeDirection: 'Creative self-expression and joy',
    dailyExpression: 'You express your chart ruler through creativity, romance, and what brings you pleasure',
    pathMeaning: 'Your life direction is about shining — creating, performing, expressing what makes you unique.',
    challenges: 'Can be too focused on drama or recognition; may resist ordinary responsibilities',
    gifts: 'Natural creativity; brings joy to others; magnetic creative presence'
  },
  6: {
    lifeDirection: 'Service, health, and daily work',
    dailyExpression: 'You express your chart ruler through your job, your health practices, and service to others',
    pathMeaning: 'Your life direction is about being useful — perfecting skills, maintaining systems, serving.',
    challenges: 'Can be workaholic or overly critical; may neglect self in service to others',
    gifts: 'Natural problem-solver; excellent at improvement; dedicated and reliable'
  },
  7: {
    lifeDirection: 'Partnership and committed relationships',
    dailyExpression: 'You express your chart ruler THROUGH others — you need partnership to fully realize yourself',
    pathMeaning: 'Your life direction is about relationship — you discover yourself through deep connection with others.',
    challenges: 'Can lose yourself in others; may be too dependent on partnership for identity',
    gifts: 'Natural diplomat; skilled at collaboration; brings out the best in others'
  },
  8: {
    lifeDirection: 'Transformation, intimacy, and shared resources',
    dailyExpression: 'You express your chart ruler in intense, hidden ways — through deep intimacy and psychological exploration',
    pathMeaning: 'Your life direction involves death and rebirth cycles — you are here to transform yourself and others.',
    challenges: 'Can be controlling or secretive; may attract crisis; trust issues',
    gifts: 'Psychological depth; crisis management; power to transform situations'
  },
  9: {
    lifeDirection: 'Philosophy, travel, and higher meaning',
    dailyExpression: 'You express your chart ruler through seeking meaning, teaching, traveling, or publishing',
    pathMeaning: 'Your life direction is about wisdom — finding the big picture and sharing it with others.',
    challenges: 'Can be preachy or restless; may avoid practical details in favor of big ideas',
    gifts: 'Natural philosopher; inspires others toward meaning; connects local to global'
  },
  10: {
    lifeDirection: 'Career, reputation, and public contribution',
    dailyExpression: 'You express your chart ruler publicly — your professional life IS your path',
    pathMeaning: 'Your life direction is about achievement — building a career and being recognized for your contribution.',
    challenges: 'Can sacrifice private life for public success; may over-identify with status',
    gifts: 'Natural authority; professional excellence; leaves a lasting legacy'
  },
  11: {
    lifeDirection: 'Community, friendship, and future visions',
    dailyExpression: 'You express your chart ruler through groups, causes, and your social network',
    pathMeaning: 'Your life direction is about the collective — your individual path serves something larger than yourself.',
    challenges: 'Can lose individuality in groups; may be too detached from personal needs',
    gifts: 'Natural networker; visionary thinking; brings people together for causes'
  },
  12: {
    lifeDirection: 'Spirituality, solitude, and transcendence',
    dailyExpression: 'You express your chart ruler in hidden ways — through meditation, creativity, or service to the unseen',
    pathMeaning: 'Your life direction involves the invisible realms — you may work behind the scenes or channel something larger.',
    challenges: 'Can lose yourself; may struggle with boundaries; vulnerability to escapism',
    gifts: 'Spiritual sensitivity; creative/artistic channeling; compassionate service'
  }
};

// Working with chart ruler guidance based on condition
const WORKING_WITH_RULER_GUIDANCE: Record<string, {
  condition: string;
  awareness: string;
  practices: string[];
  affirmation: string;
}> = {
  excellent: {
    condition: 'Your chart ruler is excellently placed',
    awareness: 'Your life direction flows naturally. You don\'t have to push — you can trust your instincts. The challenge is not wasting this gift on autopilot.',
    practices: [
      'Consciously develop the gifts your chart ruler offers rather than taking them for granted',
      'Use your natural ease to support others who struggle in this area',
      'When things feel too easy, add intentional challenge to deepen mastery',
      'Share your gifts publicly — others need to see what\'s possible'
    ],
    affirmation: 'My path supports me. I trust my direction and share my gifts freely.'
  },
  good: {
    condition: 'Your chart ruler is well-placed',
    awareness: 'Your life direction has natural support. Things work out, though you still need to show up consciously. The key is consistent engagement.',
    practices: [
      'Build on your strengths by practicing them regularly',
      'Notice when flow happens and recreate those conditions',
      'Don\'t confuse "easy" with "unimportant" — develop depth',
      'Find mentors who\'ve mastered what comes naturally to you'
    ],
    affirmation: 'My path is supported. I cultivate my gifts with conscious attention.'
  },
  moderate: {
    condition: 'Your chart ruler is in neutral territory',
    awareness: 'Your life direction is what you make of it. Nothing is blocked, but nothing is given. Your effort determines your outcome.',
    practices: [
      'Study your chart ruler\'s needs and consciously create conditions for its expression',
      'Watch for aspects that activate your ruler — they show when opportunity peaks',
      'Build routines that support your chart ruler\'s expression',
      'Seek environments where your ruler\'s energy is valued'
    ],
    affirmation: 'I am the architect of my path. My effort creates my direction.'
  },
  challenged: {
    condition: 'Your chart ruler faces challenges',
    awareness: 'Your life direction requires conscious work. What others receive naturally, you must earn. This builds authentic mastery — but only if you engage with awareness.',
    practices: [
      'Name your chart ruler\'s specific challenges and create strategies for each',
      'Find role models who\'ve thrived with similar placements',
      'Reframe obstacles as training — each difficulty builds real competence',
      'Be patient with yourself while maintaining commitment',
      'Track small wins to counter the narrative that "this is too hard"'
    ],
    affirmation: 'My challenges are my teachers. I earn my mastery through conscious effort.'
  },
  difficult: {
    condition: 'Your chart ruler is significantly challenged',
    awareness: 'Your life direction demands transformation. You cannot coast. Every expression of your chart ruler must be chosen, developed, and refined. This is hard — and it creates depth that others cannot achieve.',
    practices: [
      'Accept that your path is harder than most — not as complaint, but as reality',
      'Build support systems specifically for this challenge',
      'Look for the hidden gift in the difficulty — often it\'s depth or wisdom',
      'Allow your chart ruler\'s energy to mature slowly rather than forcing it',
      'Celebrate any expression of this energy, no matter how small',
      'Consider therapy or coaching focused specifically on this life area'
    ],
    affirmation: 'My difficult path creates rare depth. I embrace my journey with compassion.'
  }
};

export const ChartRulerDeepDive: React.FC<ChartRulerDeepDiveProps> = ({
  planets,
  aspects,
  natalChart,
  useTraditional
}) => {
  const asc = planets.find(p => p.name === 'Ascendant');
  if (!asc) return null;
  
  const chartRuler = getSignRuler(asc.sign, useTraditional);
  const chartRulerPlanet = planets.find(p => p.name === chartRuler);
  
  if (!chartRuler || !chartRulerPlanet) return null;
  
  // Calculate condition (always use traditional for dignities)
  const sectData = calculateSect(natalChart);
  const condition = calculatePlanetaryCondition(chartRulerPlanet, aspects, sectData.sect, true);
  const dignity = computeDignity(chartRuler, chartRulerPlanet.sign, true);
  
  // Get aspects to chart ruler
  const rulerAspects = aspects.filter(a => a.planet1 === chartRuler || a.planet2 === chartRuler);
  const tightAspects = rulerAspects.filter(a => a.orb < 3);
  
  // Determine guidance level
  const guidanceLevel = condition.totalScore >= 8 ? 'excellent' :
                        condition.totalScore >= 4 ? 'good' :
                        condition.totalScore >= 0 ? 'moderate' :
                        condition.totalScore >= -4 ? 'challenged' : 'difficult';
  
  const guidance = WORKING_WITH_RULER_GUIDANCE[guidanceLevel];
  const houseMeaning = chartRulerPlanet.house ? CHART_RULER_HOUSE_MEANINGS[chartRulerPlanet.house] : null;
  
  const getDignityColor = (d: DignityType): string => {
    switch (d) {
      case 'rulership': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'exaltation': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'detriment': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'fall': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };
  
  const getConditionColor = (rating: string): string => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-400';
      case 'Good': return 'text-green-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Challenged': return 'text-orange-400';
      case 'Difficult': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            Chart Ruler Deep Dive: {getPlanetSymbol(chartRuler)} {chartRuler}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Rules your {getSignSymbol(asc.sign)} {asc.sign} Ascendant — The director of your life story
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getPlanetSymbol(chartRuler)}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{chartRulerPlanet.sign}</span>
                <Badge className={getDignityColor(dignity)}>
                  {dignity === 'peregrine' ? 'Peregrine' : dignity.charAt(0).toUpperCase() + dignity.slice(1)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {chartRulerPlanet.degree.toFixed(0)}° {chartRulerPlanet.sign}
                {chartRulerPlanet.house && ` • House ${chartRulerPlanet.house}`}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-xl font-bold ${getConditionColor(condition.qualityRating)}`}>
                {condition.qualityRating}
              </div>
              <div className="text-xs text-muted-foreground">
                Score: {condition.totalScore}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Visual Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Dignity Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Essential Dignity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge className={`${getDignityColor(dignity)} text-sm px-3 py-1`}>
              {dignity === 'peregrine' ? 'Peregrine — Free Agent' : 
               dignity.charAt(0).toUpperCase() + dignity.slice(1)}
            </Badge>
            
            <div className="text-sm leading-relaxed">
              {dignity === 'rulership' && (
                <p><strong>{chartRuler}</strong> is in its own sign — it operates with natural authority. Your chart ruler is strong. The director has full creative control.</p>
              )}
              {dignity === 'exaltation' && (
                <p><strong>{chartRuler}</strong> is exalted here — it operates at an elevated, idealized level. Your chart ruler has special gifts to offer.</p>
              )}
              {dignity === 'detriment' && (
                <p><strong>{chartRuler}</strong> is in detriment — it must work in unfamiliar territory. This doesn't mean weakness, but your chart ruler needs conscious strategy.</p>
              )}
              {dignity === 'fall' && (
                <p><strong>{chartRuler}</strong> is in fall — it lacks natural confidence here. Your chart ruler earns its authority through effort rather than inheritance.</p>
              )}
              {dignity === 'peregrine' && (
                <p><strong>{chartRuler}</strong> has no essential dignity — it's a free agent, expressing through its house and aspects rather than sign-based power.</p>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className={condition.isInSect ? 'text-green-400' : 'text-muted-foreground'}>
                  {condition.isInSect ? '✓' : '○'}
                </span>
                <span>In Sect</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={condition.essentialDignityScore > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                  {condition.essentialDignityScore > 0 ? '✓' : '○'}
                </span>
                <span>Dignified</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* House Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-400" />
              House Placement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chartRulerPlanet.house ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-400">
                    {chartRulerPlanet.house}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{houseMeaning?.lifeDirection}</div>
                    <div className="text-xs text-muted-foreground">
                      {[1, 4, 7, 10].includes(chartRulerPlanet.house) ? 'Angular — Highly Visible' :
                       [2, 5, 8, 11].includes(chartRulerPlanet.house) ? 'Succedent — Stable' :
                       'Cadent — Adaptable'}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {houseMeaning?.dailyExpression}
                </div>
                
                <Separator />
                
                <div className="text-sm">
                  <strong>Your Path:</strong> {houseMeaning?.pathMeaning}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">House placement unavailable</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Aspects Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Compass className="h-4 w-4 text-purple-400" />
            Aspects Shaping Your Path
            <Badge variant="outline" className="ml-auto text-xs">
              {rulerAspects.length} aspect{rulerAspects.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rulerAspects.length > 0 ? (
            <div className="space-y-3">
              {rulerAspects.map((aspect, i) => {
                const otherPlanet = aspect.planet1 === chartRuler ? aspect.planet2 : aspect.planet1;
                const nature = getAspectNature(aspect.aspectType);
                const isTight = aspect.orb < 3;
                
                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-md border ${
                      nature === 'flowing' ? 'border-green-500/30 bg-green-500/5' :
                      nature === 'challenging' ? 'border-orange-500/30 bg-orange-500/5' :
                      'border-purple-500/30 bg-purple-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getPlanetSymbol(chartRuler)}</span>
                      <span className={`font-mono ${
                        nature === 'flowing' ? 'text-green-400' :
                        nature === 'challenging' ? 'text-orange-400' : 'text-purple-400'
                      }`}>
                        {getAspectSymbol(aspect.aspectType)}
                      </span>
                      <span className="text-lg">{getPlanetSymbol(otherPlanet)}</span>
                      <span className="text-sm">{otherPlanet}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {aspect.orb.toFixed(1)}°
                        {isTight && <span className="ml-1 text-primary">tight</span>}
                      </Badge>
                    </div>
                    
                    <div className="text-sm leading-relaxed">
                      {nature === 'flowing' && (
                        <p>
                          <span className="text-green-400">Support:</span> {otherPlanet} actively helps your life direction. 
                          {PLANET_MEANINGS[otherPlanet] && ` Your ${PLANET_MEANINGS[otherPlanet].toLowerCase()} supports your path.`}
                        </p>
                      )}
                      {nature === 'challenging' && (
                        <p>
                          <span className="text-orange-400">Tension:</span> {otherPlanet} creates productive friction with your direction. 
                          {PLANET_MEANINGS[otherPlanet] && ` Your ${PLANET_MEANINGS[otherPlanet].toLowerCase()} demands integration.`}
                        </p>
                      )}
                      {nature === 'neutral' && (
                        <p>
                          <span className="text-purple-400">Fusion:</span> {otherPlanet} is merged with your chart ruler. 
                          These energies act as one force in your life.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {chartRuler} makes no major aspects — it operates independently, expressing purely through its sign and house.
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Working With Your Chart Ruler */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Working With Your Chart Ruler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            {guidanceLevel === 'excellent' || guidanceLevel === 'good' ? (
              <Shield className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
            ) : guidanceLevel === 'moderate' ? (
              <Compass className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="font-medium">{guidance.condition}</div>
              <p className="text-sm text-muted-foreground mt-1">{guidance.awareness}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Practical Suggestions
            </h4>
            <ul className="space-y-2">
              {guidance.practices.map((practice, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {houseMeaning && (
            <>
              <Separator />
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-green-400">GIFTS</span>
                  </div>
                  <p className="text-sm">{houseMeaning.gifts}</p>
                </div>
                <div className="p-3 rounded-md bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400">CHALLENGES</span>
                  </div>
                  <p className="text-sm">{houseMeaning.challenges}</p>
                </div>
              </div>
            </>
          )}
          
          <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm italic">"{guidance.affirmation}"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
