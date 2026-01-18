import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, Home, ArrowRight, Calendar, Star } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { 
  calculateSecondaryProgressions,
  getProgressedMoonInfo,
  ProgressedMoonInfo
} from '@/lib/secondaryProgressions';

interface ProgressedMoonTimelineProps {
  natalChart: NatalChart;
  age: number;
}

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Progressed Moon through houses interpretations
const PROGRESSED_MOON_HOUSE_MEANINGS: Record<number, {
  theme: string;
  emotionalFocus: string;
  lifeAreas: string;
  whatYouNeed: string;
  howItFeels: string;
}> = {
  1: {
    theme: 'Self-Discovery & New Beginnings',
    emotionalFocus: 'Your emotions are focused on YOU — your identity, your body, how you present yourself to the world',
    lifeAreas: 'Personal appearance, new initiatives, self-expression, physical body, first impressions',
    whatYouNeed: 'Independence, space to experiment with identity, permission to be selfish',
    howItFeels: 'Like emerging from hiding. You feel more visible, more assertive. Personal needs can\'t be ignored. A new 28-year emotional cycle begins.'
  },
  2: {
    theme: 'Security & Self-Worth',
    emotionalFocus: 'Your emotions are focused on what you have, what you\'re worth, and what makes you feel secure',
    lifeAreas: 'Money, possessions, income, talents, values, self-esteem, material comfort',
    whatYouNeed: 'Financial stability, sensory pleasure, validation of your worth, tangible results',
    howItFeels: 'A grounding phase. You want to build something solid. Money matters more. You\'re asking: What do I really value?'
  },
  3: {
    theme: 'Communication & Learning',
    emotionalFocus: 'Your emotions are stimulated through ideas, conversations, and mental activity',
    lifeAreas: 'Siblings, neighbors, short trips, writing, learning, daily interactions, transportation',
    whatYouNeed: 'Mental stimulation, variety, communication, connection with your immediate environment',
    howItFeels: 'Busy and scattered but alive. Your mind is hungry. You may reconnect with siblings or become more social in your neighborhood.'
  },
  4: {
    theme: 'Home & Emotional Foundations',
    emotionalFocus: 'Your emotions are focused on home, family, roots, and inner security',
    lifeAreas: 'Home, family of origin, parents, real estate, ancestry, private life, emotional healing',
    whatYouNeed: 'A place to belong, family connection, emotional safety, time at home',
    howItFeels: 'A turning inward. You may move, renovate, or reconnect with family. Old emotions surface for healing. The need for home base is strong.'
  },
  5: {
    theme: 'Creativity & Joy',
    emotionalFocus: 'Your emotions are focused on pleasure, creativity, romance, and self-expression',
    lifeAreas: 'Romance, children, hobbies, creative projects, entertainment, gambling, fun',
    whatYouNeed: 'Creative outlet, play, romance, attention, opportunities to shine',
    howItFeels: 'A playful, dramatic phase. You want to create, to be seen, to have fun. Romance may heat up. Children may become more central.'
  },
  6: {
    theme: 'Service & Health',
    emotionalFocus: 'Your emotions are focused on work, health routines, and being useful',
    lifeAreas: 'Daily work, health habits, coworkers, pets, routines, service, improvement',
    whatYouNeed: 'Order, health, meaningful work, feeling useful, manageable routines',
    howItFeels: 'A humbling, practical phase. You\'re focused on improvement. Health may demand attention. You want your daily life to work smoothly.'
  },
  7: {
    theme: 'Partnership & Relationship',
    emotionalFocus: 'Your emotions are focused on significant others — marriage, business partners, close one-on-one bonds',
    lifeAreas: 'Marriage, committed relationships, business partnerships, contracts, open enemies',
    whatYouNeed: 'A partner, cooperation, balance, feedback from others, harmony',
    howItFeels: 'Relationships dominate. You may marry, divorce, or transform a partnership. You can\'t ignore what you need from others.'
  },
  8: {
    theme: 'Transformation & Depth',
    emotionalFocus: 'Your emotions are focused on intimacy, shared resources, and psychological depths',
    lifeAreas: 'Shared finances, inheritances, sexuality, death, psychology, power dynamics, transformation',
    whatYouNeed: 'Deep intimacy, emotional truth, confrontation with shadows, transformation',
    howItFeels: 'Intense and sometimes dark. Hidden things surface. You may inherit or deal with others\' money. Psychological depth is unavoidable.'
  },
  9: {
    theme: 'Meaning & Expansion',
    emotionalFocus: 'Your emotions are focused on meaning, philosophy, travel, and growth',
    lifeAreas: 'Higher education, travel abroad, philosophy, religion, publishing, law, foreign cultures',
    whatYouNeed: 'Meaning, adventure, expansion, knowledge, connection to something larger',
    howItFeels: 'Restless for MORE. You may travel, study, or question your beliefs. Small life feels suffocating. You\'re seeking the big picture.'
  },
  10: {
    theme: 'Career & Public Role',
    emotionalFocus: 'Your emotions are focused on achievement, career, and your public reputation',
    lifeAreas: 'Career, public image, authority, achievements, relationship with bosses, legacy',
    whatYouNeed: 'Recognition, achievement, a visible role, respect from authority',
    howItFeels: 'Ambitious and visible. Career moves feel emotionally important. You may step into leadership. What you\'re known for matters deeply.'
  },
  11: {
    theme: 'Community & Future',
    emotionalFocus: 'Your emotions are focused on friendship, groups, and your hopes for the future',
    lifeAreas: 'Friends, groups, organizations, hopes, wishes, social causes, the collective',
    whatYouNeed: 'Belonging to a group, friendship, causes to believe in, vision for the future',
    howItFeels: 'Social and idealistic. Friends become more important. You may join groups or causes. Individual achievement matters less than collective belonging.'
  },
  12: {
    theme: 'Solitude & Transcendence',
    emotionalFocus: 'Your emotions are focused on the inner world, spirituality, and what\'s hidden',
    lifeAreas: 'Solitude, spirituality, institutions, hidden enemies, unconscious patterns, endings',
    whatYouNeed: 'Retreat, spiritual connection, time alone, closure, letting go',
    howItFeels: 'A dissolving phase. You may feel invisible or drawn to solitude. Old patterns complete. The ego softens. Something is ending to prepare for rebirth.'
  }
};

interface TimelineEvent {
  date: Date;
  age: number;
  type: 'sign' | 'house';
  from: string | number;
  to: string | number;
  interpretation: string;
}

export const ProgressedMoonTimeline: React.FC<ProgressedMoonTimelineProps> = ({
  natalChart,
  age
}) => {
  // Calculate timeline events for the next 10 years
  const timelineEvents = useMemo(() => {
    if (!natalChart) return [];
    
    const events: TimelineEvent[] = [];
    const now = new Date();
    
    // Get base birth date
    const [year, month, day] = natalChart.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    
    // Calculate events for each year
    for (let yearOffset = 0; yearOffset <= 10; yearOffset++) {
      const targetDate = new Date(now);
      targetDate.setFullYear(now.getFullYear() + yearOffset);
      
      const targetAge = age + yearOffset;
      
      const progressions = calculateSecondaryProgressions(natalChart, targetDate);
      if (!progressions) continue;
      
      const moonInfo = getProgressedMoonInfo(progressions, natalChart);
      if (!moonInfo) continue;
      
      // Check for sign changes within this year
      if (moonInfo.monthsUntilSignChange <= 12 && yearOffset > 0) {
        const signChangeDate = new Date(now);
        signChangeDate.setMonth(now.getMonth() + moonInfo.monthsUntilSignChange + (yearOffset - 1) * 12);
        
        // Avoid duplicates
        const alreadyHasThisEvent = events.some(e => 
          e.type === 'sign' && 
          Math.abs(e.date.getTime() - signChangeDate.getTime()) < 30 * 24 * 60 * 60 * 1000
        );
        
        if (!alreadyHasThisEvent) {
          events.push({
            date: signChangeDate,
            age: targetAge,
            type: 'sign',
            from: moonInfo.sign,
            to: moonInfo.nextSign,
            interpretation: `Emotional needs shift from ${moonInfo.sign} themes (${PROGRESSED_MOON_SIGN_THEMES[moonInfo.sign] || ''}) to ${moonInfo.nextSign} themes (${PROGRESSED_MOON_SIGN_THEMES[moonInfo.nextSign] || ''}).`
          });
        }
      }
      
      // Check for house changes
      if (moonInfo.houseChange.monthsUntilHouseChange && 
          moonInfo.houseChange.monthsUntilHouseChange <= 12 &&
          moonInfo.houseChange.currentHouse &&
          moonInfo.houseChange.nextHouse) {
        const houseChangeDate = new Date(now);
        houseChangeDate.setMonth(now.getMonth() + moonInfo.houseChange.monthsUntilHouseChange + (yearOffset > 0 ? (yearOffset - 1) * 12 : 0));
        
        const houseMeaning = PROGRESSED_MOON_HOUSE_MEANINGS[moonInfo.houseChange.nextHouse];
        
        // Avoid duplicates
        const alreadyHasThisEvent = events.some(e => 
          e.type === 'house' && 
          e.to === moonInfo.houseChange.nextHouse &&
          Math.abs(e.date.getTime() - houseChangeDate.getTime()) < 60 * 24 * 60 * 60 * 1000
        );
        
        if (!alreadyHasThisEvent && houseMeaning) {
          events.push({
            date: houseChangeDate,
            age: Math.round(age + moonInfo.houseChange.monthsUntilHouseChange / 12 + yearOffset),
            type: 'house',
            from: moonInfo.houseChange.currentHouse,
            to: moonInfo.houseChange.nextHouse,
            interpretation: `Life focus shifts to ${houseMeaning.theme}. ${houseMeaning.howItFeels}`
          });
        }
      }
    }
    
    // Sort by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [natalChart, age]);
  
  // Get current progressed Moon info
  const currentMoonInfo = useMemo(() => {
    if (!natalChart) return null;
    
    const now = new Date();
    const [year, month, day] = natalChart.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const targetDate = new Date(birthDate);
    targetDate.setFullYear(birthDate.getFullYear() + age);
    
    const progressions = calculateSecondaryProgressions(natalChart, targetDate);
    if (!progressions) return null;
    
    return getProgressedMoonInfo(progressions, natalChart);
  }, [natalChart, age]);
  
  const currentHouseMeaning = currentMoonInfo?.house ? PROGRESSED_MOON_HOUSE_MEANINGS[currentMoonInfo.house] : null;
  
  return (
    <div className="space-y-4">
      {/* Current Position */}
      {currentMoonInfo && currentHouseMeaning && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Moon className="h-4 w-4 text-primary" />
              Current Progressed Moon Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl">{SIGN_SYMBOLS[currentMoonInfo.sign]}</div>
                <div className="text-sm font-medium">
                  {currentMoonInfo.exactDegree.toFixed(1)}° {currentMoonInfo.sign}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <div className="text-2xl">⌂</div>
                <div className="text-sm font-medium">House {currentMoonInfo.house}</div>
              </div>
            </div>
            
            <div className="space-y-2 p-3 bg-secondary/30 rounded-md">
              <h4 className="text-xs font-medium uppercase tracking-wide text-primary">
                {currentHouseMeaning.theme}
              </h4>
              <p className="text-sm">{currentHouseMeaning.emotionalFocus}</p>
              <p className="text-sm text-muted-foreground">{currentHouseMeaning.howItFeels}</p>
            </div>
            
            <div className="grid gap-2 md:grid-cols-2">
              <div className="p-2 bg-secondary/20 rounded-md">
                <div className="text-xs font-medium text-muted-foreground mb-1">Life Areas Activated</div>
                <p className="text-sm">{currentHouseMeaning.lifeAreas}</p>
              </div>
              <div className="p-2 bg-secondary/20 rounded-md">
                <div className="text-xs font-medium text-muted-foreground mb-1">What You Need Now</div>
                <p className="text-sm">{currentHouseMeaning.whatYouNeed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 10-Year Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Progressed Moon Journey — Next 10 Years
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Key dates when your emotional focus shifts
          </p>
        </CardHeader>
        <CardContent>
          {timelineEvents.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {timelineEvents.map((event, i) => (
                  <div key={i} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                      event.type === 'sign' 
                        ? 'bg-purple-500/20 border-2 border-purple-500' 
                        : 'bg-blue-500/20 border-2 border-blue-500'
                    }`}>
                      {event.type === 'sign' ? (
                        <Star className="h-3 w-3 text-purple-400" />
                      ) : (
                        <Home className="h-3 w-3 text-blue-400" />
                      )}
                    </div>
                    
                    <div className={`p-3 rounded-md border ${
                      event.type === 'sign' 
                        ? 'border-purple-500/30 bg-purple-500/5' 
                        : 'border-blue-500/30 bg-blue-500/5'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {event.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Age ~{event.age}</span>
                        <Badge className={`ml-auto text-xs ${
                          event.type === 'sign' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {event.type === 'sign' ? 'Sign Change' : 'House Change'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {event.type === 'sign' ? (
                          <>
                            <span className="text-lg">{SIGN_SYMBOLS[event.from as string]}</span>
                            <span className="text-sm">{event.from}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg">{SIGN_SYMBOLS[event.to as string]}</span>
                            <span className="text-sm">{event.to}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm">House {event.from}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">House {event.to}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{event.interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Calculating timeline events...
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* House Interpretations Reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Home className="h-4 w-4" />
            Progressed Moon Through the Houses
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            What each house activation brings emotionally (~2.5 years each)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PROGRESSED_MOON_HOUSE_MEANINGS).map(([house, meaning]) => {
              const houseNum = parseInt(house);
              const isCurrentHouse = currentMoonInfo?.house === houseNum;
              
              return (
                <div 
                  key={house}
                  className={`p-3 rounded-md border transition-colors ${
                    isCurrentHouse 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrentHouse ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {house}
                    </div>
                    <span className="text-sm font-medium">{meaning.theme}</span>
                    {isCurrentHouse && (
                      <Badge variant="default" className="ml-auto text-xs">NOW</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {meaning.whatYouNeed}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Sign themes for timeline interpretation
const PROGRESSED_MOON_SIGN_THEMES: Record<string, string> = {
  Aries: 'independence, new starts, self-assertion',
  Taurus: 'security, comfort, values, stability',
  Gemini: 'communication, learning, variety',
  Cancer: 'home, family, emotional security',
  Leo: 'creativity, romance, self-expression',
  Virgo: 'health, work, service, improvement',
  Libra: 'partnership, balance, harmony',
  Scorpio: 'transformation, depth, intimacy',
  Sagittarius: 'meaning, travel, expansion',
  Capricorn: 'career, achievement, structure',
  Aquarius: 'community, friendship, innovation',
  Pisces: 'spirituality, dreams, transcendence'
};
