import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, Home, Link, TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';
import { PlanetaryCondition } from '@/lib/planetaryCondition';
import { ChartAspect } from '@/lib/chartDecoderLogic';

interface PlanetSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  condition: PlanetaryCondition | null;
  aspects: ChartAspect[];
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

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
  semisextile: '⚺'
};

const HOUSE_TOPICS: Record<number, { title: string; keywords: string[]; advice: string }> = {
  1: { 
    title: 'Identity & Self-Image',
    keywords: ['appearance', 'first impressions', 'personality', 'vitality'],
    advice: 'This planet colors how you present yourself to the world. Work with its energy consciously in how you initiate and assert.'
  },
  2: { 
    title: 'Money & Resources',
    keywords: ['finances', 'possessions', 'self-worth', 'values'],
    advice: 'This planet influences your relationship with money and material security. Let its energy guide how you build resources.'
  },
  3: { 
    title: 'Communication & Learning',
    keywords: ['daily conversations', 'siblings', 'local travel', 'early education'],
    advice: 'This planet shapes your thinking and communication style. Use its energy in how you learn and share ideas.'
  },
  4: { 
    title: 'Home & Family',
    keywords: ['roots', 'mother/nurturing parent', 'emotional foundation', 'private life'],
    advice: 'This planet influences your sense of home and belonging. Work with its energy to create emotional security.'
  },
  5: { 
    title: 'Creativity & Romance',
    keywords: ['self-expression', 'children', 'play', 'romance', 'hobbies'],
    advice: 'This planet colors your creative self-expression. Let its energy guide your joy, play, and romantic adventures.'
  },
  6: { 
    title: 'Work & Health',
    keywords: ['daily routines', 'service', 'health habits', 'co-workers'],
    advice: 'This planet influences your daily work and health routines. Apply its energy to service and self-improvement.'
  },
  7: { 
    title: 'Partnerships',
    keywords: ['marriage', 'business partners', 'close relationships', 'open enemies'],
    advice: 'This planet shapes what you seek in partnership. Work with its energy in committed one-on-one relationships.'
  },
  8: { 
    title: 'Transformation & Shared Resources',
    keywords: ['intimacy', 'joint finances', 'inheritance', 'psychological depth'],
    advice: 'This planet influences deep transformation and merging with others. Use its energy for psychological growth.'
  },
  9: { 
    title: 'Philosophy & Expansion',
    keywords: ['higher education', 'long-distance travel', 'beliefs', 'publishing'],
    advice: 'This planet shapes your search for meaning. Let its energy guide your philosophical and spiritual pursuits.'
  },
  10: { 
    title: 'Career & Reputation',
    keywords: ['public image', 'achievements', 'father/authority parent', 'life direction'],
    advice: 'This planet influences your public role and career. Apply its energy consciously to your worldly ambitions.'
  },
  11: { 
    title: 'Community & Hopes',
    keywords: ['friendships', 'groups', 'future visions', 'collective causes'],
    advice: 'This planet colors your role in groups and vision for the future. Work with its energy in community.'
  },
  12: { 
    title: 'Spirituality & Solitude',
    keywords: ['unconscious', 'hidden strengths', 'retreat', 'endings'],
    advice: 'This planet operates behind the scenes. Access its energy through meditation, dreams, and solitary practice.'
  }
};

const PLANET_LIFE_ADVICE: Record<string, { wellPlaced: string; challenged: string; general: string }> = {
  Sun: {
    wellPlaced: 'Your sense of purpose flows naturally. Trust your vision and let yourself be visible. Leadership comes easily—step into it.',
    challenged: 'Building confidence requires conscious effort. Define yourself on your own terms, not others\'. Each act of self-expression strengthens your core.',
    general: 'The Sun represents your conscious will and life purpose. Where it shines, you\'re meant to express your authentic self.'
  },
  Moon: {
    wellPlaced: 'Your emotional instincts are reliable guides. Trust your gut feelings and create nurturing spaces for yourself and others.',
    challenged: 'Emotional security doesn\'t come automatically—you build it yourself. This makes your inner peace hard-won but genuine.',
    general: 'The Moon represents your emotional nature and what you need to feel safe. Honor these needs rather than dismissing them.'
  },
  Mercury: {
    wellPlaced: 'Your mind is sharp and communication flows easily. Share your ideas—your perspective is valuable and others benefit from hearing it.',
    challenged: 'Communication requires extra care. This develops a more deliberate and thoughtful relationship with language and learning.',
    general: 'Mercury rules thinking and communication. Develop these gifts through reading, writing, and meaningful conversation.'
  },
  Venus: {
    wellPlaced: 'Love, beauty, and pleasure come naturally to you. Trust your taste and let yourself receive. Relationships flow when you relax.',
    challenged: 'Love and harmony require conscious cultivation. This builds authentic appreciation rather than superficial attraction.',
    general: 'Venus governs love, beauty, and values. Invest in relationships, aesthetics, and experiences that bring genuine pleasure.'
  },
  Mars: {
    wellPlaced: 'Your drive and courage are assets. Take action on what matters. Healthy competition and physical expression serve you well.',
    challenged: 'Anger and assertion need conscious channeling. Physical outlets and strategic action prevent burnout and conflict.',
    general: 'Mars represents your drive and how you pursue goals. Channel this energy through exercise, competition, and purposeful action.'
  },
  Jupiter: {
    wellPlaced: 'Luck and opportunity tend to find you. Say yes to growth. Your optimism and faith are well-founded—expansion flows.',
    challenged: 'Growth requires more internal work. Your wisdom is earned through seeking, which makes it more authentic.',
    general: 'Jupiter brings expansion and meaning. Pursue education, travel, philosophy—anything that broadens your horizons.'
  },
  Saturn: {
    wellPlaced: 'Your discipline and long-term vision are strengths. Build patiently. What you create through sustained effort lasts.',
    challenged: 'Structure may feel restrictive. Work with limitations rather than against them—they focus your power.',
    general: 'Saturn governs mastery and responsibility. Embrace long-term commitments and let time prove your dedication.'
  },
  Uranus: {
    wellPlaced: 'Your unconventional approach works. Trust your unique perspective and let yourself break from tradition when called.',
    challenged: 'Individuality may feel disruptive. Learn to be yourself without burning bridges—evolution over revolution.',
    general: 'Uranus represents innovation and authenticity. Don\'t conform where you\'re meant to innovate.'
  },
  Neptune: {
    wellPlaced: 'Your imagination and spiritual sensitivity are gifts. Trust your dreams, intuition, and creative visions.',
    challenged: 'Fantasy and reality need conscious distinction. Ground your spirituality in practical expression.',
    general: 'Neptune governs dreams, intuition, and transcendence. Develop these through art, meditation, and compassionate service.'
  },
  Pluto: {
    wellPlaced: 'Your capacity for transformation is profound. You handle intensity well and help others through their depths.',
    challenged: 'Power dynamics need conscious navigation. Transform yourself before trying to transform your world.',
    general: 'Pluto represents deep transformation. Let go of what no longer serves you and embrace regeneration.'
  }
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

export const PlanetSpotlightModal: React.FC<PlanetSpotlightModalProps> = ({
  isOpen,
  onClose,
  condition,
  aspects,
  houseCusps
}) => {
  if (!condition) return null;

  // Find aspects involving this planet
  const planetAspects = aspects.filter(
    a => a.planet1 === condition.planet || a.planet2 === condition.planet
  );

  // Find houses ruled by this planet
  const housesRuled: number[] = [];
  if (houseCusps) {
    const ruledSigns = TRADITIONAL_RULERS[condition.planet] || [];
    for (let h = 1; h <= 12; h++) {
      const cusp = houseCusps[h];
      if (cusp && ruledSigns.includes(cusp.sign)) {
        housesRuled.push(h);
      }
    }
  }

  const lifeAdvice = PLANET_LIFE_ADVICE[condition.planet];
  const houseInfo = condition.house ? HOUSE_TOPICS[condition.house] : null;

  const getAspectColor = (aspectType: string): string => {
    const flowing = ['trine', 'sextile'];
    const challenging = ['square', 'opposition'];
    if (flowing.includes(aspectType)) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30';
    if (challenging.includes(aspectType)) return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    return 'text-sky-600 bg-sky-500/10 border-sky-500/30';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-4xl">{PLANET_SYMBOLS[condition.planet]}</span>
            <div>
              <span className="text-xl font-serif">{condition.planet} Spotlight</span>
              <p className="text-sm font-normal text-muted-foreground">
                {condition.sign} • House {condition.house || '?'} • Score: {condition.totalScore > 0 ? '+' : ''}{condition.totalScore}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed analysis of {condition.planet}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Quality Badge */}
          <div className="flex flex-wrap gap-2">
            <Badge className={
              condition.qualityRating === 'Excellent' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' :
              condition.qualityRating === 'Good' ? 'bg-green-500/20 text-green-600 border-green-500/30' :
              condition.qualityRating === 'Moderate' ? 'bg-sky-500/20 text-sky-600 border-sky-500/30' :
              condition.qualityRating === 'Challenged' ? 'bg-amber-500/20 text-amber-600 border-amber-500/30' :
              'bg-rose-500/20 text-rose-600 border-rose-500/30'
            }>
              {condition.qualityRating}
            </Badge>
            {condition.essentialDignity !== 'peregrine' && (
              <Badge variant="outline" className="text-xs">
                {condition.essentialDignity === 'rulership' && 'In Rulership'}
                {condition.essentialDignity === 'exaltation' && 'Exalted'}
                {condition.essentialDignity === 'detriment' && 'In Detriment'}
                {condition.essentialDignity === 'fall' && 'In Fall'}
              </Badge>
            )}
            {condition.isInSect && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                In Sect
              </Badge>
            )}
          </div>

          {/* Life Advice */}
          {lifeAdvice && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb size={14} className="text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Life Advice</span>
                </div>
                <p className="text-sm text-foreground">
                  {condition.isWellPlaced ? lifeAdvice.wellPlaced : lifeAdvice.challenged}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {lifeAdvice.general}
                </p>
              </CardContent>
            </Card>
          )}

          {/* House Placement */}
          {houseInfo && condition.house && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  House {condition.house}: {houseInfo.title}
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-md space-y-2">
                <div className="flex flex-wrap gap-1">
                  {houseInfo.keywords.map(k => (
                    <Badge key={k} variant="outline" className="text-[10px] bg-background/50">
                      {k}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{houseInfo.advice}</p>
              </div>
            </div>
          )}

          {/* Houses Ruled */}
          {housesRuled.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Life Areas Governed
                </span>
              </div>
              <div className="space-y-2">
                {housesRuled.map(h => {
                  const info = HOUSE_TOPICS[h];
                  return (
                    <div key={h} className="p-2 bg-muted/20 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">House {h}</span>
                        <span className="text-xs text-muted-foreground">{info.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {info.keywords.slice(0, 3).map(k => (
                          <Badge key={k} variant="outline" className="text-[9px]">{k}</Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Aspects */}
          {planetAspects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Aspects ({planetAspects.length})
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {planetAspects.map((asp, i) => {
                  const otherPlanet = asp.planet1 === condition.planet ? asp.planet2 : asp.planet1;
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 p-2 rounded-md border ${getAspectColor(asp.aspectType)}`}
                    >
                      <span className="text-lg">{PLANET_SYMBOLS[otherPlanet]}</span>
                      <span className="text-sm">{ASPECT_SYMBOLS[asp.aspectType] || asp.aspectType}</span>
                      <span className="text-sm font-medium">{otherPlanet}</span>
                      <span className="text-xs text-muted-foreground capitalize ml-auto">
                        {asp.aspectType} • {asp.orb?.toFixed(1)}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths & Challenges */}
          <div className="grid grid-cols-2 gap-3">
            {condition.strengthFactors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={12} />
                  <span className="text-xs font-medium">Strengths</span>
                </div>
                <ul className="space-y-0.5">
                  {condition.strengthFactors.slice(0, 4).map((s, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {condition.challengeFactors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-600">
                  <TrendingDown size={12} />
                  <span className="text-xs font-medium">Challenges</span>
                </div>
                <ul className="space-y-0.5">
                  {condition.challengeFactors.slice(0, 4).map((c, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground">• {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanetSpotlightModal;
