import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, TrendingDown, Flame, Target, Sparkles, AlertTriangle, Home, Mountain, Info } from 'lucide-react';
import { PlanetaryCondition } from '@/lib/planetaryCondition';

interface MostPowerfulPlanetCardProps {
  conditions: PlanetaryCondition[];
  houseCusps?: Record<number, { sign: string; degree: number }>;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇'
};

const TRADITIONAL_RULERS: Record<string, string[]> = {
  Sun: ['Leo'],
  Moon: ['Cancer'],
  Mercury: ['Gemini', 'Virgo'],
  Venus: ['Taurus', 'Libra'],
  Mars: ['Aries', 'Scorpio'],
  Jupiter: ['Sagittarius', 'Pisces'],
  Saturn: ['Capricorn', 'Aquarius'],
  Uranus: [],
  Neptune: [],
  Pluto: []
};

const HOUSE_TOPICS: Record<number, { title: string; keywords: string }> = {
  1: { title: 'Identity', keywords: 'self-image, appearance, first impressions' },
  2: { title: 'Resources', keywords: 'money, possessions, self-worth' },
  3: { title: 'Communication', keywords: 'learning, siblings, daily exchanges' },
  4: { title: 'Home', keywords: 'family, roots, emotional foundation' },
  5: { title: 'Creativity', keywords: 'romance, children, self-expression' },
  6: { title: 'Service', keywords: 'work, health, daily routines' },
  7: { title: 'Partnership', keywords: 'marriage, close relationships' },
  8: { title: 'Transformation', keywords: 'intimacy, shared resources, depth' },
  9: { title: 'Expansion', keywords: 'travel, philosophy, higher learning' },
  10: { title: 'Career', keywords: 'reputation, public role, achievements' },
  11: { title: 'Community', keywords: 'friends, groups, future visions' },
  12: { title: 'Spirituality', keywords: 'solitude, unconscious, dreams' }
};

const PLANET_KEYWORDS: Record<string, { nature: string; gift: string; guidance: string }> = {
  Sun: {
    nature: 'vitality, purpose, and self-expression',
    gift: 'Your life force and creative power flow naturally. You have a reliable sense of who you are.',
    guidance: 'Trust your vision. When you express yourself authentically, doors open.'
  },
  Moon: {
    nature: 'emotional intelligence and intuition',
    gift: 'Your instincts are trustworthy. You read situations and people with ease.',
    guidance: 'Honor your feelings—they guide you correctly. Create safety for yourself and others.'
  },
  Mercury: {
    nature: 'thinking, communication, and learning',
    gift: 'Your mind is sharp and adaptable. Communication comes naturally.',
    guidance: 'Share your ideas. Your perspective and way of connecting dots is valuable.'
  },
  Venus: {
    nature: 'relationships, values, and pleasure',
    gift: 'You attract what you want. Beauty and harmony follow you.',
    guidance: 'Trust your taste. Your sense of what\'s valuable is accurate.'
  },
  Mars: {
    nature: 'drive, courage, and assertion',
    gift: 'Your energy and willpower are reliable. You get things done.',
    guidance: 'Act on your impulses. Your instinct to pursue and compete serves you well.'
  },
  Jupiter: {
    nature: 'growth, opportunity, and wisdom',
    gift: 'Luck and expansion follow you. Things tend to work out.',
    guidance: 'Say yes to opportunity. Your optimism attracts more of what you seek.'
  },
  Saturn: {
    nature: 'discipline, mastery, and structure',
    gift: 'Your persistence and sense of responsibility are assets. You build things that last.',
    guidance: 'Take the long view. Your patience and commitment create real achievement.'
  },
  Uranus: {
    nature: 'innovation, independence, and awakening',
    gift: 'Your unconventional approach works. You see what others miss.',
    guidance: 'Trust your unique perspective. Breaking from convention serves your purpose.'
  },
  Neptune: {
    nature: 'imagination, intuition, and transcendence',
    gift: 'Your sensitivity and creativity are gifts. You access realms others can\'t.',
    guidance: 'Trust your dreams and visions. Your spiritual antenna is calibrated well.'
  },
  Pluto: {
    nature: 'transformation, power, and depth',
    gift: 'Your ability to transform and regenerate is profound. You handle intensity well.',
    guidance: 'Trust your instinct for what must change. Your power to rebuild is strong.'
  }
};

const GROWTH_EDGE_GUIDANCE: Record<string, { work: string; reframe: string }> = {
  Sun: {
    work: 'Building confidence and self-expression requires conscious effort',
    reframe: 'Your sense of self becomes more authentic through the very struggle to find it'
  },
  Moon: {
    work: 'Emotional security doesn\'t come automatically—you learn to create it',
    reframe: 'Through working on emotional intelligence, you develop wisdom others take for granted'
  },
  Mercury: {
    work: 'Communication and learning require extra care and attention',
    reframe: 'You develop a deeper, more deliberate relationship with how you think and speak'
  },
  Venus: {
    work: 'Love and self-worth don\'t flow easily—you learn to cultivate them',
    reframe: 'Your relationship wisdom comes from truly understanding what love requires'
  },
  Mars: {
    work: 'Asserting yourself and taking action requires conscious strategy',
    reframe: 'You develop a more refined and intentional relationship with your will'
  },
  Jupiter: {
    work: 'Growth and opportunity don\'t come automatically—you create them',
    reframe: 'Your success is hard-won, which makes it more meaningful'
  },
  Saturn: {
    work: 'Structure and discipline feel heavy—you must find your own way to master them',
    reframe: 'You develop a unique relationship with responsibility that others don\'t understand'
  },
  Uranus: {
    work: 'Being yourself feels risky or disruptive—you learn to own your uniqueness',
    reframe: 'Your individuality emerges through conscious choice, not accident'
  },
  Neptune: {
    work: 'Spiritual and creative connection requires deliberate practice',
    reframe: 'Your imagination becomes a conscious tool rather than an overwhelming flood'
  },
  Pluto: {
    work: 'Transformation and power dynamics require careful navigation',
    reframe: 'Your relationship with power becomes conscious and ethical through the struggle'
  }
};

// House proximity to MC (house 10 = closest, then 9, 11, etc.)
const MC_PROXIMITY: Record<number, number> = {
  10: 10, 9: 8, 11: 7, 8: 5, 12: 4, 7: 3, 1: 3, 6: 2, 2: 2, 5: 1, 3: 1, 4: 0
};

function getMostElevated(conditions: PlanetaryCondition[]): PlanetaryCondition | null {
  if (conditions.length === 0) return null;
  return conditions.reduce((best, c) => {
    const bestProx = MC_PROXIMITY[best.house || 0] ?? 0;
    const cProx = MC_PROXIMITY[c.house || 0] ?? 0;
    return cProx > bestProx ? c : best;
  }, conditions[0]);
}

// Helper to get houses ruled by a planet
function getHousesRuled(
  planetName: string,
  houseCusps?: Record<number, { sign: string; degree: number }>
): number[] {
  if (!houseCusps) return [];
  const ruledSigns = TRADITIONAL_RULERS[planetName] || [];
  const housesRuled: number[] = [];
  
  for (let h = 1; h <= 12; h++) {
    const cusp = houseCusps[h];
    if (cusp && ruledSigns.includes(cusp.sign)) {
      housesRuled.push(h);
    }
  }
  return housesRuled;
}

export const MostPowerfulPlanetCard: React.FC<MostPowerfulPlanetCardProps> = ({ conditions, houseCusps }) => {
  if (conditions.length === 0) return null;

  // Most powerful = highest score (first in sorted array)
  const mostPowerful = conditions[0];
  
  // Growth edge = lowest score (last in sorted array)
  const growthEdge = conditions[conditions.length - 1];

  // Most elevated = closest to MC (house 10)
  const elevated = getMostElevated(conditions);
  const elevatedRank = elevated ? conditions.findIndex(c => c.planet === elevated.planet) + 1 : null;
  const elevatedIsMvp = elevated?.planet === mostPowerful.planet;
  
  // Get houses ruled by MVP
  const mvpHousesRuled = getHousesRuled(mostPowerful.planet, houseCusps);
  
  const powerInfo = PLANET_KEYWORDS[mostPowerful.planet] || {
    nature: 'its unique energy',
    gift: 'This planet operates as a reliable resource for you.',
    guidance: 'Lean into this energy—it works well for you.'
  };
  
  const edgeInfo = GROWTH_EDGE_GUIDANCE[growthEdge.planet] || {
    work: 'This energy requires conscious development',
    reframe: 'Through working with this challenge, you gain wisdom'
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Most Powerful Planet Card */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border-emerald-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="text-amber-500" size={16} />
              Your Chart's MVP
            </CardTitle>
            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
              Score: +{mostPowerful.totalScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Planet Header */}
          <div className="flex items-center gap-3">
            <div className="text-4xl">{PLANET_SYMBOLS[mostPowerful.planet] || '⚫'}</div>
            <div>
              <h3 className="text-xl font-serif text-foreground">
                {mostPowerful.planet}
              </h3>
               <p className="text-xs text-muted-foreground">
                 {mostPowerful.sign} • House {mostPowerful.house || '?'}
               </p>
               <p className="text-[10px] text-muted-foreground/70 mt-0.5 italic">
                 Best condition score — not necessarily the most dominant
               </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Essential</div>
              <div className={mostPowerful.essentialDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {mostPowerful.essentialDignityScore >= 0 ? '+' : ''}{mostPowerful.essentialDignityScore}
              </div>
            </div>
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Accidental</div>
              <div className={mostPowerful.accidentalDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {mostPowerful.accidentalDignityScore >= 0 ? '+' : ''}{mostPowerful.accidentalDignityScore}
              </div>
            </div>
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Sect</div>
              <div className={mostPowerful.sectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {mostPowerful.sectScore >= 0 ? '+' : ''}{mostPowerful.sectScore}
              </div>
            </div>
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Aspects</div>
              <div className={mostPowerful.aspectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {mostPowerful.aspectScore >= 0 ? '+' : ''}{mostPowerful.aspectScore}
              </div>
            </div>
          </div>

          {/* What This Means */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground">Your Natural Gift</div>
                <p className="text-xs text-muted-foreground">
                  {mostPowerful.planet} governs {powerInfo.nature}. {powerInfo.gift}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Target size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground">How to Use It</div>
                <p className="text-xs text-muted-foreground">
              {powerInfo.guidance}
                </p>
              </div>
            </div>
          </div>

          {/* House Rulership - Life Areas Governed */}
          {mvpHousesRuled.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home size={14} className="text-primary" />
                <span className="text-xs font-medium text-foreground">Life Areas Governed</span>
              </div>
              <div className="space-y-1.5">
                {mvpHousesRuled.map(h => {
                  const info = HOUSE_TOPICS[h];
                  return (
                    <div key={h} className="p-2 bg-background/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                          House {h}
                        </Badge>
                        <span className="text-xs font-medium text-foreground">{info.title}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{info.keywords}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Your MVP's strength flows into these life areas
              </p>
            </div>
          )}

          {/* Dignity Tags */}
          <div className="flex flex-wrap gap-1.5">
            {mostPowerful.essentialDignity === 'rulership' && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                In Rulership
              </Badge>
            )}
            {mostPowerful.essentialDignity === 'exaltation' && (
              <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30">
                Exalted
              </Badge>
            )}
            {mostPowerful.hasTriplicityDignity && (
              <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/30">
                Triplicity
              </Badge>
            )}
            {mostPowerful.isInSect && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                In Sect
              </Badge>
            )}
            {mostPowerful.visibility === 'Highly Visible' && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                Angular
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Edge Card */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-rose-500/10 border-amber-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="text-amber-500" size={16} />
              Your Growth Edge
            </CardTitle>
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
              Score: {growthEdge.totalScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Planet Header */}
          <div className="flex items-center gap-3">
            <div className="text-4xl">{PLANET_SYMBOLS[growthEdge.planet] || '⚫'}</div>
            <div>
              <h3 className="text-xl font-serif text-foreground">
                {growthEdge.planet}
              </h3>
              <p className="text-xs text-muted-foreground">
                {growthEdge.sign} • House {growthEdge.house || '?'}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Essential</div>
              <div className={growthEdge.essentialDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {growthEdge.essentialDignityScore >= 0 ? '+' : ''}{growthEdge.essentialDignityScore}
              </div>
            </div>
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Accidental</div>
              <div className={growthEdge.accidentalDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {growthEdge.accidentalDignityScore >= 0 ? '+' : ''}{growthEdge.accidentalDignityScore}
              </div>
            </div>
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Sect</div>
              <div className={growthEdge.sectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {growthEdge.sectScore >= 0 ? '+' : ''}{growthEdge.sectScore}
              </div>
            </div>
            <div className="p-1.5 bg-background/50 rounded text-xs">
              <div className="text-muted-foreground">Aspects</div>
              <div className={growthEdge.aspectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {growthEdge.aspectScore >= 0 ? '+' : ''}{growthEdge.aspectScore}
              </div>
            </div>
          </div>

          {/* What This Means */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground">The Work</div>
                <p className="text-xs text-muted-foreground">
                  {edgeInfo.work}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <TrendingUp size={14} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground">The Gift in the Challenge</div>
                <p className="text-xs text-muted-foreground">
                  {edgeInfo.reframe}
                </p>
              </div>
            </div>
          </div>

          {/* Challenge Tags */}
          <div className="flex flex-wrap gap-1.5">
            {growthEdge.essentialDignity === 'detriment' && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                In Detriment
              </Badge>
            )}
            {growthEdge.essentialDignity === 'fall' && (
              <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30">
                In Fall
              </Badge>
            )}
            {!growthEdge.isInSect && (
              <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/30">
                Out of Sect
              </Badge>
            )}
            {growthEdge.visibility === 'Behind the Scenes' && (
              <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                Cadent
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Most Elevated Planet Card */}
      {elevated && !elevatedIsMvp && (
        <Card className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border-sky-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mountain className="text-sky-500" size={16} />
                Most Elevated Planet
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-sky-500/20 text-sky-600 border-sky-500/30">
                  Score: {elevated.totalScore >= 0 ? '+' : ''}{elevated.totalScore}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Rank #{elevatedRank} of {conditions.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Planet Header */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">{PLANET_SYMBOLS[elevated.planet] || '⚫'}</div>
              <div>
                <h3 className="text-xl font-serif text-foreground">
                  {elevated.planet}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {elevated.sign} • House {elevated.house || '?'} (near Midheaven)
                </p>
              </div>
            </div>

            {/* Why Elevation Matters */}
            <div className="p-3 bg-background/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-sky-500" />
                <span className="text-xs font-medium text-foreground">Why Your Highest Planet Matters</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>{elevated.planet}</strong> sits at the peak of your chart, closest to the Midheaven — the point 
                of greatest public visibility. This is the energy other people notice about you <em>first</em>. It shapes 
                your reputation, how you're perceived professionally, and the qualities people project onto you before 
                they truly know you. Think of it as your "billboard" — the planet the world reads when it looks at your life.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {PLANET_KEYWORDS[elevated.planet]
                  ? `Because ${elevated.planet} governs ${PLANET_KEYWORDS[elevated.planet].nature}, people tend to associate you with these themes in your career and public life — even if you feel more driven by other energies internally.`
                  : `This planet's themes dominate how others perceive your public role and career direction.`}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-1.5 bg-background/50 rounded text-xs">
                <div className="text-muted-foreground">Essential</div>
                <div className={elevated.essentialDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {elevated.essentialDignityScore >= 0 ? '+' : ''}{elevated.essentialDignityScore}
                </div>
              </div>
              <div className="p-1.5 bg-background/50 rounded text-xs">
                <div className="text-muted-foreground">Accidental</div>
                <div className={elevated.accidentalDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {elevated.accidentalDignityScore >= 0 ? '+' : ''}{elevated.accidentalDignityScore}
                </div>
              </div>
              <div className="p-1.5 bg-background/50 rounded text-xs">
                <div className="text-muted-foreground">Sect</div>
                <div className={elevated.sectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {elevated.sectScore >= 0 ? '+' : ''}{elevated.sectScore}
                </div>
              </div>
              <div className="p-1.5 bg-background/50 rounded text-xs">
                <div className="text-muted-foreground">Aspects</div>
                <div className={elevated.aspectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {elevated.aspectScore >= 0 ? '+' : ''}{elevated.aspectScore}
                </div>
              </div>
            </div>

            {/* Practical Guidance */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-foreground">Working With Your Elevated Planet</div>
                  <p className="text-xs text-muted-foreground">
                    {PLANET_KEYWORDS[elevated.planet]?.guidance || 'Lean into this planet\'s energy in your public and professional life — it\'s what people already see in you.'}
                    {' '}Since {elevated.planet} is your most visible planet, leaning into its themes in your career and public roles will feel natural and be well-received by others.
                  </p>
                </div>
              </div>
            </div>

            {/* Dignity Tags */}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30">
                Most Elevated
              </Badge>
              {elevated.essentialDignity === 'rulership' && (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  In Rulership
                </Badge>
              )}
              {elevated.essentialDignity === 'exaltation' && (
                <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30">
                  Exalted
                </Badge>
              )}
              {elevated.essentialDignity === 'detriment' && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                  In Detriment
                </Badge>
              )}
              {elevated.essentialDignity === 'fall' && (
                <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30">
                  In Fall
                </Badge>
              )}
              {elevated.isInSect && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  In Sect
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* If elevated IS the MVP, show a note */}
      {elevated && elevatedIsMvp && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Mountain size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Your MVP is also your most elevated planet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mostPowerful.planet} sits near the top of your chart <em>and</em> has the strongest condition score. 
              This means your most powerful planet is also your most publicly visible — the world sees your greatest 
              strength. This is a particularly potent combination for career and public recognition.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MostPowerfulPlanetCard;
