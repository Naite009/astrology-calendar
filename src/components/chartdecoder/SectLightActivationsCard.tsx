import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Zap, TrendingUp, Clock, Target, Sparkles, AlertCircle, Heart, Briefcase } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import * as Astronomy from 'astronomy-engine';

interface SectLightActivationsCardProps {
  chart: NatalChart;
  isNightChart: boolean;
}

interface SectLightTransit {
  transitPlanet: string;
  transitSymbol: string;
  aspectType: string;
  aspectSymbol: string;
  exactDate: Date;
  orb: number;
  isApplying: boolean;
  daysUntil: number;
  intensity: 'critical' | 'major' | 'moderate' | 'minor';
  theme: string;
  dailyLife: string;
  relationships: string;
  career: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const ASPECT_DEFS = [
  { name: 'conjunction', angle: 0, symbol: '☌', orb: 8 },
  { name: 'opposition', angle: 180, symbol: '☍', orb: 8 },
  { name: 'trine', angle: 120, symbol: '△', orb: 7 },
  { name: 'square', angle: 90, symbol: '□', orb: 7 },
  { name: 'sextile', angle: 60, symbol: '⚹', orb: 5 }
];

const TRANSITING_PLANETS = [
  { name: 'Mars', body: Astronomy.Body.Mars },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  { name: 'Saturn', body: Astronomy.Body.Saturn },
  { name: 'Uranus', body: Astronomy.Body.Uranus },
  { name: 'Neptune', body: Astronomy.Body.Neptune },
  { name: 'Pluto', body: Astronomy.Body.Pluto }
];

// Normalize angle to 0-360
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

// Get ecliptic longitude for a planet
function getPlanetLongitude(body: Astronomy.Body, date: Date): number {
  const astroTime = new Astronomy.AstroTime(date);
  const geo = Astronomy.GeoVector(body, astroTime, true);
  const ecliptic = Astronomy.Ecliptic(geo);
  return normalizeAngle(ecliptic.elon);
}

// Binary search to find exact transit date using ephemeris
function findExactTransitDate(body: Astronomy.Body, natalLongitude: number, aspectAngle: number, startDate: Date): number {
  const targetAngle = normalizeAngle(natalLongitude + aspectAngle);
  const targetAngle2 = normalizeAngle(natalLongitude - aspectAngle);
  
  // Search up to 365 days ahead
  const maxDays = 365;
  let bestDays = 0;
  let bestOrb = 999;
  
  // Daily scan first to find approximate date
  for (let day = 0; day <= maxDays; day++) {
    const checkDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const lon = getPlanetLongitude(body, checkDate);
    
    let diff1 = Math.abs(normalizeAngle(lon - targetAngle));
    if (diff1 > 180) diff1 = 360 - diff1;
    let diff2 = Math.abs(normalizeAngle(lon - targetAngle2));
    if (diff2 > 180) diff2 = 360 - diff2;
    
    const orb = Math.min(diff1, diff2);
    
    if (orb < bestOrb) {
      bestOrb = orb;
      bestDays = day;
    }
    
    // If exact (within 0.1 degree), we found it
    if (orb < 0.1) break;
  }
  
  // Binary search refinement for hourly precision
  if (bestDays > 0 && bestOrb < 5) {
    let lowHour = (bestDays - 1) * 24;
    let highHour = (bestDays + 1) * 24;
    
    for (let i = 0; i < 10; i++) {
      const midHour = (lowHour + highHour) / 2;
      const checkDate = new Date(startDate.getTime() + midHour * 60 * 60 * 1000);
      const lon = getPlanetLongitude(body, checkDate);
      
      let diff1 = Math.abs(normalizeAngle(lon - targetAngle));
      if (diff1 > 180) diff1 = 360 - diff1;
      let diff2 = Math.abs(normalizeAngle(lon - targetAngle2));
      if (diff2 > 180) diff2 = 360 - diff2;
      
      const orb = Math.min(diff1, diff2);
      if (orb < bestOrb) {
        bestOrb = orb;
        bestDays = midHour / 24;
      }
      
      // Check direction
      const checkDateNext = new Date(startDate.getTime() + (midHour + 1) * 60 * 60 * 1000);
      const nextLon = getPlanetLongitude(body, checkDateNext);
      let nextDiff1 = Math.abs(normalizeAngle(nextLon - targetAngle));
      if (nextDiff1 > 180) nextDiff1 = 360 - nextDiff1;
      let nextDiff2 = Math.abs(normalizeAngle(nextLon - targetAngle2));
      if (nextDiff2 > 180) nextDiff2 = 360 - nextDiff2;
      const nextOrb = Math.min(nextDiff1, nextDiff2);
      
      if (nextOrb < orb) {
        lowHour = midHour;
      } else {
        highHour = midHour;
      }
    }
  }
  
  return Math.round(bestDays);
}

// Convert sign + degree to absolute longitude
function toAbsoluteLongitude(sign: string, degree: number, minutes: number = 0): number {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const idx = signs.indexOf(sign);
  return idx >= 0 ? idx * 30 + degree + minutes / 60 : 0;
}

// Get transit themes for sect light activations
function getTransitThemes(transitPlanet: string, aspectType: string, isNightChart: boolean): {
  theme: string;
  dailyLife: string;
  relationships: string;
  career: string;
} {
  const sectLight = isNightChart ? 'Moon' : 'Sun';
  const lightNature = isNightChart ? 'instincts, emotions, and inner guidance' : 'will, purpose, and conscious direction';
  
  const themes: Record<string, Record<string, { theme: string; dailyLife: string; relationships: string; career: string }>> = {
    Mars: {
      conjunction: {
        theme: `Your ${lightNature} meet with raw drive and assertion`,
        dailyLife: isNightChart ? 'Emotions fuel action. You may feel more reactive but also more energized.' : 'Your will is activated. Take initiative but watch for ego battles.',
        relationships: isNightChart ? 'Emotional intensity peaks. Passion or conflict—you choose.' : 'Assert yourself in partnerships. Others notice your fire.',
        career: isNightChart ? 'Instincts guide bold moves. Trust your gut on action items.' : 'Leadership energy peaks. Time to push forward on goals.'
      },
      opposition: {
        theme: `Others challenge your ${lightNature} with their Mars energy`,
        dailyLife: isNightChart ? 'External conflicts trigger emotional responses. Stay centered.' : 'Power struggles may arise. Choose battles wisely.',
        relationships: isNightChart ? 'Partner may be assertive/aggressive. Find your boundary.' : 'Relationship tension peaks. Healthy conflict can clear the air.',
        career: isNightChart ? 'Competition or conflict from others. Defend your emotional space.' : 'Professional rivals may challenge you. Rise to it.'
      },
      square: {
        theme: `Tension between your ${lightNature} and action/desire`,
        dailyLife: isNightChart ? 'Irritability. What you feel vs what you want clash.' : 'Frustration with obstacles. Channel into productive action.',
        relationships: isNightChart ? 'Emotional friction. Say what you mean without heat.' : 'Conflict tests your partnerships. Growth through tension.',
        career: isNightChart ? 'Gut feelings clash with action needed. Find balance.' : 'Goals meet resistance. Persistence required.'
      },
      trine: {
        theme: `Your ${lightNature} flow harmoniously with courage and drive`,
        dailyLife: isNightChart ? 'Emotions empower action. Natural motivation.' : 'Confident self-expression. Easy initiative.',
        relationships: isNightChart ? 'Emotional courage. Easy to express feelings.' : 'Healthy assertion in love. Passion flows.',
        career: isNightChart ? 'Instincts guide successful action.' : 'Leadership flows naturally. Go for it.'
      },
      sextile: {
        theme: `Opportunities arise when you combine ${lightNature} with action`,
        dailyLife: isNightChart ? 'Small emotional motivations lead to big results.' : 'Gentle push toward your goals works well.',
        relationships: isNightChart ? 'Easy emotional courage. Small gestures matter.' : 'Pleasant assertiveness in partnerships.',
        career: isNightChart ? 'Intuitive opportunities for action.' : 'Small initiatives bring recognition.'
      }
    },
    Jupiter: {
      conjunction: {
        theme: `Major expansion of your ${lightNature}`,
        dailyLife: isNightChart ? '12-year emotional growth peak. Optimism flows.' : 'Major confidence boost. Possibilities multiply.',
        relationships: isNightChart ? 'Emotional generosity expands. Love grows.' : 'Joy in partnerships. Lucky connections.',
        career: isNightChart ? 'Trust your instincts—they lead to opportunity.' : 'Career expansion. Visibility and recognition peak.'
      },
      opposition: {
        theme: `Others bring growth opportunities to your ${lightNature}`,
        dailyLife: isNightChart ? 'Others expand your emotional world.' : 'External opportunities challenge you to grow.',
        relationships: isNightChart ? 'Partner brings joy/growth. Receive it.' : 'Relationships expand your world.',
        career: isNightChart ? 'Collaborators bring luck.' : 'Others open doors for you.'
      },
      square: {
        theme: `Growth tension with your ${lightNature}—overextension possible`,
        dailyLife: isNightChart ? 'Emotional excess. What feels too big to contain?' : 'Overconfidence. Where are you stretching too thin?',
        relationships: isNightChart ? 'Emotional exaggeration. Keep expectations real.' : 'Promise less, deliver more in love.',
        career: isNightChart ? 'Instincts may overpromise. Check the details.' : 'Ambition outpaces resources. Scale back.'
      },
      trine: {
        theme: `Luck and growth flow to your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional wellbeing peaks. Trust the flow.' : 'Easy confidence. Things work out.',
        relationships: isNightChart ? 'Love feels abundant. Generosity returns.' : 'Joy in partnerships. Easy harmony.',
        career: isNightChart ? 'Follow your gut—it leads to luck.' : 'Recognition and growth come naturally.'
      },
      sextile: {
        theme: `Small opportunities expand your ${lightNature}`,
        dailyLife: isNightChart ? 'Gentle emotional growth.' : 'Small lucky breaks support your goals.',
        relationships: isNightChart ? 'Easy emotional abundance.' : 'Pleasant growth in partnerships.',
        career: isNightChart ? 'Intuitive opportunities knock.' : 'Small recognitions build momentum.'
      }
    },
    Saturn: {
      conjunction: {
        theme: `Major restructuring of your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional maturation demanded. Feel the weight.' : 'Saturn return energy: restructure your identity.',
        relationships: isNightChart ? 'Emotional boundaries crystallize. Maturity in love.' : 'Relationship commitments solidify or end.',
        career: isNightChart ? 'Your instincts must prove themselves. Build trust slowly.' : 'Career structure forms. Authority tested.'
      },
      opposition: {
        theme: `External authority challenges your ${lightNature}`,
        dailyLife: isNightChart ? 'Others demand emotional accountability.' : 'External structures test your will.',
        relationships: isNightChart ? 'Partner may feel heavy/demanding. Set boundaries.' : 'Relationship responsibilities peak.',
        career: isNightChart ? 'Authority figures test your emotional composure.' : 'Professional accountability peaks.'
      },
      square: {
        theme: `Tension between structure and your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional restriction. What feelings need discipline?' : 'Obstacles test your resolve. Build character.',
        relationships: isNightChart ? 'Emotional walls. What needs to soften?' : 'Relationship tests. Commitment or release?',
        career: isNightChart ? 'Instincts meet resistance. Patience required.' : 'Career blocks demand creative solutions.'
      },
      trine: {
        theme: `Discipline supports your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional stability. Feelings have structure.' : 'Confidence with discipline. Earned authority.',
        relationships: isNightChart ? 'Mature love. Steady emotional connection.' : 'Relationship stability. Trust builds.',
        career: isNightChart ? 'Steady progress following intuition.' : 'Efforts pay off. Recognition for discipline.'
      },
      sextile: {
        theme: `Small structures support your ${lightNature}`,
        dailyLife: isNightChart ? 'Gentle emotional discipline.' : 'Small efforts compound over time.',
        relationships: isNightChart ? 'Steady emotional improvements.' : 'Small commitments strengthen bonds.',
        career: isNightChart ? 'Practical instincts serve you.' : 'Quiet progress. Keep building.'
      }
    },
    Uranus: {
      conjunction: {
        theme: `Revolution of your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional awakening. Expect the unexpected in feelings.' : 'Identity revolution. Who you were is changing.',
        relationships: isNightChart ? 'Emotional liberation. Freedom to feel differently.' : 'Relationship shake-ups. Authenticity demanded.',
        career: isNightChart ? 'Intuition leads to breakthrough.' : 'Career reinvention. Break free of old patterns.'
      },
      opposition: {
        theme: `Others disrupt your ${lightNature}`,
        dailyLife: isNightChart ? 'External chaos triggers emotional upheaval.' : 'Others shock you awake. Pay attention.',
        relationships: isNightChart ? 'Partner brings surprises. Stay flexible.' : 'Relationship freedom issues surface.',
        career: isNightChart ? 'Unexpected changes require emotional agility.' : 'Career disruptions from outside forces.'
      },
      square: {
        theme: `Tension between freedom and your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional restlessness. What needs to change?' : 'Inner rebellion. What structure is outdated?',
        relationships: isNightChart ? 'Emotional unpredictability. Find your center.' : 'Freedom vs commitment tension.',
        career: isNightChart ? 'Instincts push against routine.' : 'Career restlessness. Time for change?'
      },
      trine: {
        theme: `Exciting changes support your ${lightNature}`,
        dailyLife: isNightChart ? 'Refreshing emotional insights.' : 'Exciting authentic expression.',
        relationships: isNightChart ? 'Emotional freedom feels good.' : 'Relationships allow authenticity.',
        career: isNightChart ? 'Intuitive innovations succeed.' : 'Creative freedom opens doors.'
      },
      sextile: {
        theme: `Small awakenings enliven your ${lightNature}`,
        dailyLife: isNightChart ? 'Gentle emotional surprises.' : 'Small excitements refresh perspective.',
        relationships: isNightChart ? 'Easy emotional flexibility.' : 'Pleasant spontaneity in love.',
        career: isNightChart ? 'New intuitions guide progress.' : 'Small innovations get noticed.'
      }
    },
    Neptune: {
      conjunction: {
        theme: `Dissolution and spiritual opening of your ${lightNature}`,
        dailyLife: isNightChart ? 'Boundaries between self and others dissolve. Spiritual sensitivity peaks.' : 'Identity becomes fluid. Ego dissolves into something larger.',
        relationships: isNightChart ? 'Soul connection possible—or confusion. Discern.' : 'Idealization or disillusionment in love.',
        career: isNightChart ? 'Follow the dream. Creative intuition peaks.' : 'Career vision expands but may lack grounding.'
      },
      opposition: {
        theme: `Others bring confusion or inspiration to your ${lightNature}`,
        dailyLife: isNightChart ? 'External fog. Who/what is real?' : 'Others may deceive or inspire. Discern.',
        relationships: isNightChart ? 'Partner triggers confusion or transcendence.' : 'Relationship ideals meet reality.',
        career: isNightChart ? 'External illusions. Trust but verify.' : 'Professional confusion from others.'
      },
      square: {
        theme: `Confusion between dreams and your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional fog. What illusion needs clearing?' : 'Self-deception possible. Stay grounded.',
        relationships: isNightChart ? 'Emotional confusion in love. What\'s real?' : 'Relationship illusions exposed.',
        career: isNightChart ? 'Instincts may mislead. Ground yourself.' : 'Career confusion. Clarify before acting.'
      },
      trine: {
        theme: `Spiritual flow supports your ${lightNature}`,
        dailyLife: isNightChart ? 'Intuitive and creative flow. Dreams are vivid.' : 'Inspiration flows. Creative expression easy.',
        relationships: isNightChart ? 'Soul connection. Compassion deepens.' : 'Spiritual love. Easy forgiveness.',
        career: isNightChart ? 'Creative instincts guide success.' : 'Artistic or spiritual work thrives.'
      },
      sextile: {
        theme: `Gentle inspiration touches your ${lightNature}`,
        dailyLife: isNightChart ? 'Subtle intuitions. Pay attention to dreams.' : 'Quiet inspiration. Art and beauty call.',
        relationships: isNightChart ? 'Gentle compassion flows.' : 'Romantic imagination in healthy doses.',
        career: isNightChart ? 'Creative hunches worth following.' : 'Artistic opportunities appear.'
      }
    },
    Pluto: {
      conjunction: {
        theme: `Total transformation of your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional death and rebirth. Everything you feel is changing.' : 'Identity transformation. Who you were dies to who you\'re becoming.',
        relationships: isNightChart ? 'Emotional power dynamics surface. Transform them.' : 'Relationship transformation. Nothing stays the same.',
        career: isNightChart ? 'Instinctual power awakens. Use wisely.' : 'Career reinvention at the deepest level.'
      },
      opposition: {
        theme: `Others trigger deep transformation of your ${lightNature}`,
        dailyLife: isNightChart ? 'External events trigger emotional depths.' : 'Others wield power over you. Reclaim it.',
        relationships: isNightChart ? 'Partner triggers shadow work.' : 'Power dynamics in relationships exposed.',
        career: isNightChart ? 'External forces transform your path.' : 'Professional power struggles.'
      },
      square: {
        theme: `Power tension with your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional power struggles. What do you control?' : 'Inner power meets external resistance.',
        relationships: isNightChart ? 'Emotional manipulation—given or received. Heal it.' : 'Relationship power games surface.',
        career: isNightChart ? 'Instinctive power plays. Choose integrity.' : 'Career power struggles demand evolution.'
      },
      trine: {
        theme: `Deep power supports your ${lightNature}`,
        dailyLife: isNightChart ? 'Emotional transformation feels natural.' : 'Personal power flows. Evolution is easy.',
        relationships: isNightChart ? 'Deep healing in relationships.' : 'Transformative love. Depth without drama.',
        career: isNightChart ? 'Instinctive power serves success.' : 'Strategic influence. Natural authority.'
      },
      sextile: {
        theme: `Subtle transformation empowers your ${lightNature}`,
        dailyLife: isNightChart ? 'Gentle emotional healing.' : 'Quiet empowerment. Small changes, big effects.',
        relationships: isNightChart ? 'Easy emotional depth.' : 'Healing opportunities in love.',
        career: isNightChart ? 'Subtle instinctive power.' : 'Quiet influence grows.'
      }
    }
  };
  
  return themes[transitPlanet]?.[aspectType] || {
    theme: `Transit ${transitPlanet} ${aspectType} your ${sectLight}`,
    dailyLife: 'Pay attention to how this energy manifests.',
    relationships: 'Notice relationship dynamics during this time.',
    career: 'Watch for career implications.'
  };
}

// Calculate transits to sect light
function calculateSectLightTransits(chart: NatalChart, isNightChart: boolean): SectLightTransit[] {
  const sectLight = isNightChart ? 'Moon' : 'Sun';
  const natalPos = chart.planets[sectLight];
  if (!natalPos) return [];
  
  const natalLongitude = toAbsoluteLongitude(natalPos.sign, natalPos.degree, natalPos.minutes);
  const now = new Date();
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  const transits: SectLightTransit[] = [];
  
  for (const transit of TRANSITING_PLANETS) {
    const currentLon = getPlanetLongitude(transit.body, now);
    
    for (const aspect of ASPECT_DEFS) {
      const targetAngle = normalizeAngle(natalLongitude + aspect.angle);
      const targetAngle2 = normalizeAngle(natalLongitude - aspect.angle);
      
      // Check current orb
      let diff1 = Math.abs(normalizeAngle(currentLon - targetAngle));
      if (diff1 > 180) diff1 = 360 - diff1;
      let diff2 = Math.abs(normalizeAngle(currentLon - targetAngle2));
      if (diff2 > 180) diff2 = 360 - diff2;
      
      const orb = Math.min(diff1, diff2);
      
      if (orb <= aspect.orb) {
        // Check if applying or separating using ephemeris comparison
        const futureLon = getPlanetLongitude(transit.body, new Date(now.getTime() + 24 * 60 * 60 * 1000));
        const futureOrb1 = Math.abs(normalizeAngle(futureLon - targetAngle));
        const futureOrb2 = Math.abs(normalizeAngle(futureLon - targetAngle2));
        const futureOrb = Math.min(
          futureOrb1 > 180 ? 360 - futureOrb1 : futureOrb1,
          futureOrb2 > 180 ? 360 - futureOrb2 : futureOrb2
        );
        const isApplying = futureOrb < orb;
        
        // Calculate exact days until exact using binary search ephemeris
        const daysUntil = isApplying ? findExactTransitDate(transit.body, natalLongitude, aspect.angle, now) : 0;
        
        // Determine intensity
        let intensity: 'critical' | 'major' | 'moderate' | 'minor' = 'minor';
        if (orb < 1) intensity = 'critical';
        else if (orb < 3) intensity = 'major';
        else if (orb < 5) intensity = 'moderate';
        
        const themes = getTransitThemes(transit.name, aspect.name, isNightChart);
        
        transits.push({
          transitPlanet: transit.name,
          transitSymbol: PLANET_SYMBOLS[transit.name],
          aspectType: aspect.name,
          aspectSymbol: aspect.symbol,
          exactDate: new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000),
          orb,
          isApplying,
          daysUntil,
          intensity,
          ...themes
        });
      }
    }
  }
  
  // Sort by intensity and orb
  return transits.sort((a, b) => {
    const intensityOrder = { critical: 0, major: 1, moderate: 2, minor: 3 };
    if (intensityOrder[a.intensity] !== intensityOrder[b.intensity]) {
      return intensityOrder[a.intensity] - intensityOrder[b.intensity];
    }
    return a.orb - b.orb;
  });
}

export const SectLightActivationsCard: React.FC<SectLightActivationsCardProps> = ({ chart, isNightChart }) => {
  const sectLight = isNightChart ? 'Moon' : 'Sun';
  const sectLightSymbol = isNightChart ? '☽' : '☉';
  
  const transits = useMemo(() => calculateSectLightTransits(chart, isNightChart), [chart, isNightChart]);
  
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'critical': return 'bg-rose-500/20 text-rose-600 border-rose-500/30';
      case 'major': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
      case 'moderate': return 'bg-sky-500/20 text-sky-600 border-sky-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  const getMotionBadge = (isApplying: boolean) => {
    return isApplying 
      ? <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">↗ Applying</Badge>
      : <Badge variant="outline" className="text-[10px] bg-muted">↘ Separating</Badge>;
  };

  return (
    <Card className={isNightChart ? 'border-violet-500/30' : 'border-amber-500/30'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isNightChart ? <Moon size={16} className="text-violet-500" /> : <Sun size={16} className="text-amber-500" />}
            {sectLightSymbol} {sectLight} Activations — Your Chart Lord
          </CardTitle>
          <Badge variant="outline" className={isNightChart ? 'text-violet-600 border-violet-500/30' : 'text-amber-600 border-amber-500/30'}>
            Next 12 Months
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isNightChart 
            ? 'As a Night Chart native, your Moon is the "Chart Lord" — transits to it affect your daily life, relationships, and career more than any other planet.'
            : 'As a Day Chart native, your Sun is the "Chart Lord" — transits to it shape your identity, purpose, and direction more than any other planet.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Why This Matters */}
        <div className={`p-3 rounded-lg ${isNightChart ? 'bg-violet-500/10' : 'bg-amber-500/10'}`}>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Target size={12} />
            Why {sectLight} Transits Matter Most
          </h4>
          <p className="text-xs text-foreground">
            {isNightChart 
              ? 'In Night Charts, the Moon governs your emotional reality, instincts, and bodily rhythms. Major transits to your Moon will intensify feelings, shift relationships, and change what feels like "home." Watch these dates carefully.'
              : 'In Day Charts, the Sun governs your conscious will, life direction, and sense of purpose. Major transits to your Sun will shift your identity, open (or close) career doors, and redefine what success means to you.'}
          </p>
        </div>

        {/* Current Transits */}
        {transits.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Zap size={12} />
              Active & Upcoming Transits to Your {sectLight}
            </h4>
            
            {transits.slice(0, 5).map((transit, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${getIntensityColor(transit.intensity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{transit.transitSymbol}</span>
                    <span className="text-sm font-medium">
                      {transit.transitPlanet} {transit.aspectSymbol} {sectLightSymbol}
                    </span>
                    {getMotionBadge(transit.isApplying)}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Orb: {transit.orb.toFixed(1)}°
                    </div>
                    {transit.intensity === 'critical' && (
                      <Badge variant="outline" className="text-[10px] bg-rose-500/20 text-rose-600 animate-pulse">
                        ★ EXACT
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-xs font-medium text-foreground mb-2">{transit.theme}</p>
                
                {/* Life area impacts */}
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={10} /> Daily Life
                    </div>
                    <p className="text-foreground">{transit.dailyLife}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart size={10} /> Relationships
                    </div>
                    <p className="text-foreground">{transit.relationships}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase size={10} /> Career
                    </div>
                    <p className="text-foreground">{transit.career}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="mx-auto mb-2" size={24} />
            <p className="text-sm">No major transits to your {sectLight} currently active.</p>
            <p className="text-xs">Check back as outer planets move into aspect.</p>
          </div>
        )}

        {/* Day vs Night explanation */}
        <div className="p-3 bg-muted/30 rounded-md">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {isNightChart ? 'For Day Charts' : 'For Night Charts'}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isNightChart 
              ? 'If you had a Day Chart, you\'d watch transits to your Sun instead. Day Chart natives are more conscious and willful—their purpose is visible and external.'
              : 'If you had a Night Chart, you\'d watch transits to your Moon instead. Night Chart natives are more instinctual and receptive—their power works from the inside out.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectLightActivationsCard;
