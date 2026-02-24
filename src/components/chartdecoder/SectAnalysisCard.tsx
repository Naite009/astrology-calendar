import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sun, Moon, Sparkles, Shield, ChevronDown, ChevronUp, HelpCircle, Users } from 'lucide-react';
import { ChartStrengthsAnalysis } from '@/lib/chartStrengths';
import { PlanetaryCondition } from '@/lib/planetaryCondition';

interface SectAnalysisCardProps {
  analysis: ChartStrengthsAnalysis;
  conditions: PlanetaryCondition[];
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

// Comprehensive sect team descriptions
const SECT_TEAM_DESCRIPTIONS = {
  day: {
    beneficTeam: {
      primary: 'Jupiter',
      secondary: 'Venus',
      description: 'Jupiter is your primary helper—luck, expansion, and opportunity come through visible action, teaching, travel, and philosophy. Venus still helps with love and beauty, but requires more conscious cultivation.',
      jupiterRole: 'Your SECT BENEFIC. Jupiter\'s gifts flow naturally: wisdom, opportunities, optimism, and the sense that life is working FOR you. Trust your big-picture thinking.',
      venusRole: 'Your out-of-sect benefic. Love and pleasure are available but require more effort. Beauty comes through conscious appreciation rather than automatic attraction.'
    },
    maleficTeam: {
      primary: 'Saturn',
      secondary: 'Mars',
      description: 'Saturn is your manageable challenge—discipline, limits, and structure feel purposeful rather than oppressive. Mars is the wilder force that may burn hotter.',
      saturnRole: 'Your SECT MALEFIC. Saturn\'s tests are workable: you can build, structure, and accept limitation without being crushed by it. Time is your ally.',
      marsRole: 'Your out-of-sect malefic. Mars runs HOT. Anger may surprise you. Impulsiveness and conflict require conscious management. Physical outlets are essential.'
    }
  },
  night: {
    beneficTeam: {
      primary: 'Venus',
      secondary: 'Jupiter',
      description: 'Venus is your primary helper—love, beauty, and pleasure come through instinct, receptivity, and emotional intelligence. Jupiter still helps with growth, but requires more conscious seeking.',
      venusRole: 'Your SECT BENEFIC. Venus\'s gifts flow naturally: love, connection, aesthetic sense, and the ability to attract what you need. Trust your relational instincts.',
      jupiterRole: 'Your out-of-sect benefic. Growth and luck are available but come through inner work. Meaning comes through seeking rather than finding.'
    },
    maleficTeam: {
      primary: 'Mars',
      secondary: 'Saturn',
      description: 'Mars is your manageable challenge—drive, courage, and assertion have productive outlets. Saturn is the heavier force that may feel more oppressive.',
      marsRole: 'Your SECT MALEFIC. Mars\'s fire is controllable: you can assert, compete, and take action without burning out or burning others. Your energy is sustainable.',
      saturnRole: 'Your out-of-sect malefic. Saturn feels HEAVY. Time pressure, authority issues, and self-criticism may be more challenging. Work consciously with limits.'
    }
  }
};

export const SectAnalysisCard: React.FC<SectAnalysisCardProps> = ({ analysis, conditions }) => {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const isNightChart = analysis.sectLight.planet === 'Moon';
  const sectTeam = isNightChart ? SECT_TEAM_DESCRIPTIONS.night : SECT_TEAM_DESCRIPTIONS.day;
  
  // Get planetary conditions
  const venusCondition = conditions.find(c => c.planet === 'Venus');
  const jupiterCondition = conditions.find(c => c.planet === 'Jupiter');
  const marsCondition = conditions.find(c => c.planet === 'Mars');
  const saturnCondition = conditions.find(c => c.planet === 'Saturn');
  const mercuryCondition = conditions.find(c => c.planet === 'Mercury');
  const sunCondition = conditions.find(c => c.planet === 'Sun');

  // Sect benefic and malefic determination
  const sectBenefic = isNightChart ? 'Venus' : 'Jupiter';
  const outOfSectBenefic = isNightChart ? 'Jupiter' : 'Venus';
  const sectMalefic = isNightChart ? 'Mars' : 'Saturn';
  const outOfSectMalefic = isNightChart ? 'Saturn' : 'Mars';

  // Mercury's sect - determined by whether it rises before or after the Sun
  // If Mercury's longitude is less than Sun's (accounting for Aries wrap), Mercury rises before Sun = Morning Star = Day Team
  // Otherwise, Mercury is Evening Star = Night Team
  const mercurySect = useMemo(() => {
    const mercuryDeg = mercuryCondition ? 
      (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        .indexOf(mercuryCondition.sign) * 30 + (mercuryCondition.house || 0)) : 0;
    const sunDeg = sunCondition ? 
      (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        .indexOf(sunCondition.sign) * 30 + (sunCondition.house || 0)) : 0;
    
    // Calculate if Mercury is ahead of (morning star) or behind (evening star) the Sun
    let diff = mercuryDeg - sunDeg;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    // Mercury rises before Sun (morning star) when it's at a lower zodiacal degree
    // This is a simplification - real calculation would check rising times
    const isMorningStar = diff < 0;
    
    return {
      isMorningStar,
      team: isMorningStar ? 'Day' : 'Night',
      matchesChartSect: isMorningStar ? !isNightChart : isNightChart,
      description: isMorningStar 
        ? 'Mercury rises before the Sun each day, making it a "Morning Star." In ancient astrology, this means Mercury joins the Day team — the planets that work through conscious action and logic. Your thinking style is direct: you process ideas out loud, make decisions deliberately, and your best insights come when you\'re fully awake and engaged.'
        : 'Mercury sets after the Sun each evening, making it an "Evening Star." In ancient astrology, this means Mercury joins the Night team — the planets that work through reflection and inner processing. Your thinking style is receptive: ideas come to you in quiet moments, your gut feelings carry real intelligence, and you often "just know" things before you can explain why.'
    };
  }, [mercuryCondition, sunCondition, isNightChart]);

  const getConditionFor = (planet: string) => {
    switch (planet) {
      case 'Venus': return venusCondition;
      case 'Jupiter': return jupiterCondition;
      case 'Mars': return marsCondition;
      case 'Saturn': return saturnCondition;
      case 'Mercury': return mercuryCondition;
      default: return null;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 5) return 'text-emerald-600';
    if (score >= 2) return 'text-sky-600';
    if (score >= 0) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 5) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 2) return 'bg-sky-500/10 border-sky-500/30';
    if (score >= 0) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
  };

  const renderPlanetCard = (
    planet: string,
    label: string,
    labelColor: string,
    description: string,
    isSect: boolean
  ) => {
    const condition = getConditionFor(planet);
    const score = condition?.totalScore || 0;
    
    return (
      <div className={`p-3 rounded-lg border ${getScoreBg(score)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{PLANET_SYMBOLS[planet]}</span>
            <div>
              <div className="text-sm font-medium">{planet}</div>
              <Badge variant="outline" className={`text-[10px] ${labelColor}`}>
                {label}
              </Badge>
            </div>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score > 0 ? '+' : ''}{score}
          </div>
        </div>
        <div className="text-xs space-y-1">
          <p className="text-foreground font-medium">{description}</p>
          <p className="text-muted-foreground">
            {condition?.sign} • House {condition?.house || '?'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users size={16} className="text-primary" />
            Sect Teams: Your Planetary Helpers & Challengers
          </CardTitle>
          <Badge variant="outline" className={isNightChart ? 'bg-violet-500/10 text-violet-600 border-violet-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'}>
            {isNightChart ? '☽ Night Chart' : '☉ Day Chart'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isNightChart 
            ? 'Night Chart: Venus and Mars work more easily for you. Jupiter requires effort; Saturn may feel heavy.'
            : 'Day Chart: Jupiter and Saturn work more easily for you. Venus requires effort; Mars may run hot.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Team Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Benefics Team */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Your Helpers (Benefics)
              </span>
            </div>
            
            {renderPlanetCard(
              sectBenefic,
              'Sect Benefic ★',
              'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
              sectBenefic === 'Venus' 
                ? 'Primary source of love, beauty, pleasure'
                : 'Primary source of luck, growth, opportunity',
              true
            )}
            
            {renderPlanetCard(
              outOfSectBenefic,
              'Out of Sect',
              'bg-muted text-muted-foreground',
              outOfSectBenefic === 'Venus' 
                ? 'Love and beauty with conscious effort'
                : 'Growth through inner seeking',
              false
            )}
          </div>

          {/* Malefics Team */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Your Challengers (Malefics)
              </span>
            </div>
            
            {renderPlanetCard(
              sectMalefic,
              'Sect Malefic',
              'bg-violet-500/20 text-violet-600 border-violet-500/30',
              sectMalefic === 'Mars' 
                ? 'Controllable drive and courage'
                : 'Purposeful discipline and structure',
              true
            )}
            
            {renderPlanetCard(
              outOfSectMalefic,
              'Out of Sect ⚠',
              'bg-rose-500/20 text-rose-600 border-rose-500/30',
              outOfSectMalefic === 'Mars' 
                ? 'Fire runs hot—channel consciously'
                : 'May feel heavy—work with limits',
              false
            )}
          </div>
        </div>

        {/* Mercury - The Team Switcher */}
        <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-500/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☿</span>
              <div>
                <div className="text-sm font-medium">Mercury — The Shape-Shifter</div>
                <Badge variant="outline" className={mercurySect.matchesChartSect 
                  ? 'text-[10px] bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                  : 'text-[10px] bg-amber-500/20 text-amber-600 border-amber-500/30'
                }>
                  {mercurySect.isMorningStar ? '☉ Morning Star (Day)' : '☽ Evening Star (Night)'}
                </Badge>
              </div>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(mercuryCondition?.totalScore || 0)}`}>
              {(mercuryCondition?.totalScore || 0) > 0 ? '+' : ''}{mercuryCondition?.totalScore || 0}
            </div>
          </div>
          <p className="text-xs text-foreground font-medium mb-1">{mercurySect.description}</p>
          <p className="text-xs text-muted-foreground">
            {mercuryCondition?.sign} • House {mercuryCondition?.house || '?'}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 italic">
            {mercurySect.matchesChartSect 
              ? `Because you have a ${isNightChart ? 'Night' : 'Day'} chart and Mercury is also on the ${mercurySect.team} team, your mind is "in sync" with the rest of your chart. Your natural thinking style fits how the rest of your planets operate — communication flows easily and your mental instincts are reliable.`
              : `Your chart is a ${isNightChart ? 'Night' : 'Day'} chart, but Mercury plays for the ${mercurySect.team} team. This means your thinking style doesn't automatically match your chart's default mode — you may need to consciously bridge between how you think and how you feel or act. This isn't bad; it just means your mind brings a different perspective than the rest of your chart.`}
          </p>
        </div>
        {/* Quick Summary */}
        <div className="p-3 bg-primary/5 rounded-md">
          <p className="text-xs text-foreground">
            <span className="font-medium">Your {isNightChart ? 'Night' : 'Day'} Chart Advantage: </span>
            {isNightChart 
              ? `Venus (your sect benefic) and Mars (your sect malefic) are more manageable. You thrive through receptivity, instinct, and emotional intelligence. Jupiter's luck comes through inner work; Saturn's limits may feel heavier.`
              : `Jupiter (your sect benefic) and Saturn (your sect malefic) are more manageable. You thrive through visible action, conscious will, and external achievement. Venus's pleasures come through effort; Mars's fire may surprise you.`}
          </p>
        </div>

        {/* Deep Dive Collapsible */}
        <Collapsible open={showDeepDive} onOpenChange={setShowDeepDive}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <HelpCircle size={12} className="mr-1" />
              {showDeepDive ? 'Hide' : 'Show'} Deep Explanation of Sect Teams
              {showDeepDive ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Benefic Team Deep Dive */}
            <div className={`p-4 rounded-lg ${isNightChart ? 'bg-violet-500/5 border border-violet-500/20' : 'bg-amber-500/5 border border-amber-500/20'}`}>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-500" />
                Your Benefic Team
              </h4>
              <p className="text-xs text-muted-foreground mb-3">{sectTeam.beneficTeam.description}</p>
              
              <div className="space-y-2">
                <div className="p-2 bg-background/50 rounded">
                  <p className="text-xs">
                    <span className="font-medium text-emerald-600">{PLANET_SYMBOLS[sectBenefic]} {sectBenefic}: </span>
                    <span className="text-foreground">
                      {sectBenefic === 'Jupiter' ? sectTeam.beneficTeam.jupiterRole : sectTeam.beneficTeam.venusRole}
                    </span>
                  </p>
                </div>
                <div className="p-2 bg-background/50 rounded">
                  <p className="text-xs">
                    <span className="font-medium text-muted-foreground">{PLANET_SYMBOLS[outOfSectBenefic]} {outOfSectBenefic}: </span>
                    <span className="text-muted-foreground">
                      {outOfSectBenefic === 'Jupiter' ? sectTeam.beneficTeam.jupiterRole : sectTeam.beneficTeam.venusRole}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Malefic Team Deep Dive */}
            <div className="p-4 rounded-lg bg-muted/30 border border-muted">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Shield size={14} className="text-amber-500" />
                Your Malefic Team
              </h4>
              <p className="text-xs text-muted-foreground mb-3">{sectTeam.maleficTeam.description}</p>
              
              <div className="space-y-2">
                <div className="p-2 bg-background/50 rounded">
                  <p className="text-xs">
                    <span className="font-medium text-violet-600">{PLANET_SYMBOLS[sectMalefic]} {sectMalefic}: </span>
                    <span className="text-foreground">
                      {sectMalefic === 'Mars' ? sectTeam.maleficTeam.marsRole : sectTeam.maleficTeam.saturnRole}
                    </span>
                  </p>
                </div>
                <div className="p-2 bg-background/50 rounded">
                  <p className="text-xs">
                    <span className="font-medium text-rose-600">{PLANET_SYMBOLS[outOfSectMalefic]} {outOfSectMalefic}: </span>
                    <span className="text-foreground">
                      {outOfSectMalefic === 'Mars' ? sectTeam.maleficTeam.marsRole : sectTeam.maleficTeam.saturnRole}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* The Difference Explained */}
            <div className="p-4 rounded-lg bg-background border">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                {isNightChart ? <Moon size={14} className="text-violet-500" /> : <Sun size={14} className="text-amber-500" />}
                Day vs Night: Why It Matters
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className={`p-2 rounded ${!isNightChart ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted'}`}>
                  <p className="font-medium text-amber-600 mb-1">☉ Day Charts</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Sun below horizon at birth</li>
                    <li>• Conscious will dominates</li>
                    <li>• Jupiter = primary luck</li>
                    <li>• Saturn = workable limits</li>
                    <li>• Mars may burn hot</li>
                    <li>• Venus requires effort</li>
                  </ul>
                </div>
                <div className={`p-2 rounded ${isNightChart ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-muted'}`}>
                  <p className="font-medium text-violet-600 mb-1">☽ Night Charts</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Sun above horizon at birth</li>
                    <li>• Instincts dominate</li>
                    <li>• Venus = primary luck</li>
                    <li>• Mars = controllable fire</li>
                    <li>• Saturn may feel heavy</li>
                    <li>• Jupiter requires seeking</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SectAnalysisCard;
