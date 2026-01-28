import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, ChevronDown, ChevronUp, Target, Zap, Calendar, AlertCircle, Star, Sun, Moon } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateDetailedSaturnCycles, DetailedSaturnCycles, formatDegreePosition } from '@/lib/saturnCycleCalculator';
import { SaturnReturnCalculator } from './SaturnReturnCalculator';
import * as Astronomy from 'astronomy-engine';
import { format, differenceInDays, differenceInMonths, addYears } from 'date-fns';

interface LifeCyclesHubProps {
  chart: NatalChart;
  currentDate?: Date;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Chiron: '⚷',
  Sun: '☉', Moon: '☽', Jupiter: '♃'
};

interface OuterPlanetTransit {
  planet: string;
  aspectType: 'square' | 'opposition' | 'return' | 'conjunction';
  aspectSymbol: string;
  typicalAgeRange: string;
  exactAge: number | null;
  exactDate: Date | null;
  isPast: boolean;
  isActive: boolean;
  daysUntil: number | null;
  description: string;
  lifeTheme: string;
  intensity: 'critical' | 'major' | 'moderate';
}

// Get planet longitude at date
function getPlanetLongitude(body: Astronomy.Body, date: Date): number {
  const astroTime = new Astronomy.AstroTime(date);
  const geo = Astronomy.GeoVector(body, astroTime, true);
  const ecliptic = Astronomy.Ecliptic(geo);
  return ecliptic.elon;
}

// Calculate natal planet longitude
function getNatalPlanetLongitude(chart: NatalChart, planetName: string): number | null {
  const planet = chart.planets[planetName as keyof typeof chart.planets];
  if (!planet || !planet.sign) return null;
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(planet.sign);
  if (signIndex === -1) return null;
  
  return signIndex * 30 + planet.degree + (planet.minutes || 0) / 60;
}

// Find when a transiting planet hits a target degree (rough estimate)
function findTransitDate(
  body: Astronomy.Body,
  targetDegree: number,
  birthDate: Date,
  startAge: number,
  endAge: number
): { date: Date; age: number } | null {
  const startDate = addYears(new Date(birthDate), startAge);
  const endDate = addYears(new Date(birthDate), endAge);
  
  let currentDate = new Date(startDate);
  const stepDays = 30; // Monthly steps for outer planets
  
  while (currentDate < endDate) {
    const lon = getPlanetLongitude(body, currentDate);
    let diff = Math.abs(lon - targetDegree);
    if (diff > 180) diff = 360 - diff;
    
    if (diff < 2) {
      // Found approximate date, refine with smaller steps
      const refinedDate = new Date(currentDate);
      for (let i = 0; i < 60; i++) {
        const testDate = new Date(refinedDate.getTime() - (30 - i) * 24 * 60 * 60 * 1000);
        const testLon = getPlanetLongitude(body, testDate);
        let testDiff = Math.abs(testLon - targetDegree);
        if (testDiff > 180) testDiff = 360 - testDiff;
        if (testDiff < 1) {
          const ageInYears = (testDate.getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          return { date: testDate, age: Math.round(ageInYears * 10) / 10 };
        }
      }
      const ageInYears = (currentDate.getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return { date: currentDate, age: Math.round(ageInYears * 10) / 10 };
    }
    
    currentDate = new Date(currentDate.getTime() + stepDays * 24 * 60 * 60 * 1000);
  }
  
  return null;
}

// Calculate all major outer planet transits for a life cycle
function calculateOuterPlanetTransits(chart: NatalChart, currentDate: Date): OuterPlanetTransit[] {
  const birthDate = new Date(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const transits: OuterPlanetTransit[] = [];
  
  // Neptune Square (natal Neptune) - typically age 40-42
  const natalNeptune = getNatalPlanetLongitude(chart, 'Neptune');
  if (natalNeptune !== null) {
    const squareDegree1 = (natalNeptune + 90) % 360;
    const result = findTransitDate(Astronomy.Body.Neptune, squareDegree1, birthDate, 38, 50);
    if (result) {
      transits.push({
        planet: 'Neptune',
        aspectType: 'square',
        aspectSymbol: '□',
        typicalAgeRange: '40-42',
        exactAge: result.age,
        exactDate: result.date,
        isPast: result.date < currentDate,
        isActive: Math.abs(result.age - currentAge) < 2,
        daysUntil: result.date > currentDate ? differenceInDays(result.date, currentDate) : null,
        description: 'Neptune Square Neptune — The Fog of Midlife',
        lifeTheme: 'Spiritual disillusionment and re-enchantment. Old dreams dissolve to make way for deeper meaning. You may question what you\'ve been chasing.',
        intensity: 'major'
      });
    }
  }
  
  // Pluto Square (natal Pluto) - varies HUGELY by generation
  const natalPluto = getNatalPlanetLongitude(chart, 'Pluto');
  if (natalPluto !== null) {
    const squareDegree = (natalPluto + 90) % 360;
    // Pluto square can happen anywhere from 36-90 depending on Pluto's speed at birth
    const result = findTransitDate(Astronomy.Body.Pluto, squareDegree, birthDate, 30, 100);
    if (result) {
      transits.push({
        planet: 'Pluto',
        aspectType: 'square',
        aspectSymbol: '□',
        typicalAgeRange: 'Varies (36-90)',
        exactAge: result.age,
        exactDate: result.date,
        isPast: result.date < currentDate,
        isActive: Math.abs(result.age - currentAge) < 3,
        daysUntil: result.date > currentDate ? differenceInDays(result.date, currentDate) : null,
        description: 'Pluto Square Pluto — Power Transformation',
        lifeTheme: 'Deep power crisis. Everything you thought you controlled comes up for review. Death/rebirth of old identity structures. Shadow material demands integration.',
        intensity: 'critical'
      });
    }
  }
  
  // Chiron Return - age 49-51
  // Note: astronomy-engine doesn't have Chiron, so we estimate based on typical 50-year cycle
  const natalChiron = getNatalPlanetLongitude(chart, 'Chiron');
  if (natalChiron !== null) {
    // Estimate Chiron return at age 50 (Chiron's orbital period is ~50.7 years)
    const estimatedDate = addYears(birthDate, 50);
    transits.push({
      planet: 'Chiron',
      aspectType: 'return',
      aspectSymbol: '☌',
      typicalAgeRange: '49-51',
      exactAge: 50,
      exactDate: estimatedDate,
      isPast: estimatedDate < currentDate,
      isActive: Math.abs(50 - currentAge) < 2,
      daysUntil: estimatedDate > currentDate ? differenceInDays(estimatedDate, currentDate) : null,
      description: 'Chiron Return — The Wounded Healer Returns',
      lifeTheme: 'Your core wound comes full circle. The pain you\'ve carried since childhood asks to be healed—or transformed into wisdom. Many become healers/teachers after this.',
      intensity: 'major'
    });
  }
  
  // Second Saturn Return - age 57-60
  const natalSaturn = getNatalPlanetLongitude(chart, 'Saturn');
  if (natalSaturn !== null) {
    const result = findTransitDate(Astronomy.Body.Saturn, natalSaturn, birthDate, 56, 62);
    if (result) {
      transits.push({
        planet: 'Saturn',
        aspectType: 'return',
        aspectSymbol: '☌',
        typicalAgeRange: '57-60',
        exactAge: result.age,
        exactDate: result.date,
        isPast: result.date < currentDate,
        isActive: Math.abs(result.age - currentAge) < 1,
        daysUntil: result.date > currentDate ? differenceInDays(result.date, currentDate) : null,
        description: '2nd Saturn Return — Elder Initiation',
        lifeTheme: 'Time to become an elder, not just an older person. What legacy will you leave? What structures need rebuilding for your final chapter?',
        intensity: 'critical'
      });
    }
  }
  
  // Neptune Opposition - age 82-84 (most won't see this)
  if (natalNeptune !== null && currentAge < 80) {
    const oppositionDegree = (natalNeptune + 180) % 360;
    transits.push({
      planet: 'Neptune',
      aspectType: 'opposition',
      aspectSymbol: '☍',
      typicalAgeRange: '82-84',
      exactAge: 83,
      exactDate: addYears(birthDate, 83),
      isPast: currentAge > 84,
      isActive: false,
      daysUntil: null,
      description: 'Neptune Opposition — Transcendence',
      lifeTheme: 'If reached: Complete dissolution of ego boundaries. Spiritual transcendence. Many experience visions, mystical states, or the veil between worlds thinning.',
      intensity: 'major'
    });
  }
  
  // Third Saturn Return - age 87-90
  if (natalSaturn !== null && currentAge < 85) {
    transits.push({
      planet: 'Saturn',
      aspectType: 'return',
      aspectSymbol: '☌',
      typicalAgeRange: '87-90',
      exactAge: 88,
      exactDate: addYears(birthDate, 88),
      isPast: currentAge > 90,
      isActive: false,
      daysUntil: null,
      description: '3rd Saturn Return — Final Mastery',
      lifeTheme: 'Rare transit reached by few. Complete mastery over time and form. The wisdom-keeper phase. Legacy solidification.',
      intensity: 'critical'
    });
  }
  
  return transits.sort((a, b) => (a.exactAge || 0) - (b.exactAge || 0));
}

// Chart Lord Activation Component
const ChartLordActivation: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  // Determine if day or night chart
  const sunHouse = useMemo(() => {
    const sun = chart.planets.Sun;
    if (!sun || !chart.houseCusps) return 1;
    // Simplified - check if Sun is above or below horizon
    return 1; // Would need full house calculation
  }, [chart]);
  
  // For now, use birth time to determine sect
  const isNightChart = useMemo(() => {
    if (!chart.birthTime) return false;
    const [hours] = chart.birthTime.split(':').map(Number);
    // Rough estimate: if born before 6am or after 6pm, likely night chart
    // This is simplified - real calculation uses Sun's position relative to horizon
    return hours < 6 || hours >= 18;
  }, [chart.birthTime]);
  
  const sectLight = isNightChart ? 'Moon' : 'Sun';
  const sectLightSymbol = isNightChart ? '☽' : '☉';
  
  // Find next major transit to sect light
  const natalSectLightLon = getNatalPlanetLongitude(chart, sectLight);
  
  const nextTransit = useMemo(() => {
    if (natalSectLightLon === null) return null;
    
    const outerPlanets = [
      { name: 'Saturn', body: Astronomy.Body.Saturn },
      { name: 'Jupiter', body: Astronomy.Body.Jupiter },
      { name: 'Uranus', body: Astronomy.Body.Uranus },
      { name: 'Neptune', body: Astronomy.Body.Neptune },
      { name: 'Pluto', body: Astronomy.Body.Pluto }
    ];
    
    const aspects = [
      { name: 'conjunction', angle: 0, symbol: '☌', orb: 8 },
      { name: 'opposition', angle: 180, symbol: '☍', orb: 8 },
      { name: 'square', angle: 90, symbol: '□', orb: 7 },
      { name: 'trine', angle: 120, symbol: '△', orb: 7 }
    ];
    
    let closestTransit: any = null;
    let smallestOrb = 999;
    
    outerPlanets.forEach(planet => {
      const currentLon = getPlanetLongitude(planet.body, currentDate);
      
      aspects.forEach(aspect => {
        const targetAngle1 = (natalSectLightLon + aspect.angle) % 360;
        const targetAngle2 = (natalSectLightLon - aspect.angle + 360) % 360;
        
        [targetAngle1, targetAngle2].forEach(target => {
          let diff = Math.abs(currentLon - target);
          if (diff > 180) diff = 360 - diff;
          
          if (diff <= aspect.orb && diff < smallestOrb) {
            smallestOrb = diff;
            closestTransit = {
              planet: planet.name,
              symbol: PLANET_SYMBOLS[planet.name],
              aspect: aspect.name,
              aspectSymbol: aspect.symbol,
              orb: diff.toFixed(1)
            };
          }
        });
      });
    });
    
    return closestTransit;
  }, [natalSectLightLon, currentDate]);
  
  return (
    <Card className={isNightChart ? 'border-violet-500/30 bg-violet-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isNightChart ? <Moon size={16} className="text-violet-500" /> : <Sun size={16} className="text-amber-500" />}
            {sectLightSymbol} {sectLight} — Your Chart Lord Status
          </CardTitle>
          <Badge variant="outline" className={isNightChart ? 'text-violet-600' : 'text-amber-600'}>
            {isNightChart ? 'Night Chart' : 'Day Chart'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {nextTransit ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{nextTransit.symbol}</span>
              <div>
                <div className="font-medium">
                  {nextTransit.planet} {nextTransit.aspectSymbol} {sectLightSymbol} {sectLight}
                </div>
                <div className="text-sm text-muted-foreground">
                  Currently within {nextTransit.orb}° orb
                </div>
              </div>
              <Badge variant="outline" className="ml-auto bg-primary/10 text-primary animate-pulse">
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isNightChart 
                ? 'Your Moon is activated. Emotional themes, instincts, and daily rhythms are intensified.'
                : 'Your Sun is activated. Identity, purpose, and visibility themes are intensified.'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No major outer planet transits currently activating your {sectLight}. 
            Your Chart Lord is in a quiet period.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Midlife Window Component
const MidlifeTransitWindow: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  const birthDate = new Date(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const midlifeTransits = useMemo(() => {
    return calculateOuterPlanetTransits(chart, currentDate).filter(t => 
      t.exactAge !== null && t.exactAge >= 38 && t.exactAge <= 52
    );
  }, [chart, currentDate]);
  
  const getStatusColor = (transit: OuterPlanetTransit) => {
    if (transit.isActive) return 'border-rose-500 bg-rose-500/10';
    if (transit.isPast) return 'border-muted bg-muted/30';
    return 'border-amber-500 bg-amber-500/10';
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            Midlife Transit Window (Ages 38-52)
          </CardTitle>
          <Badge variant="outline">
            Current Age: {Math.floor(currentAge)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          The concentrated period of outer planet challenges that reshape identity
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {midlifeTransits.length > 0 ? (
          midlifeTransits.map((transit, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${getStatusColor(transit)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PLANET_SYMBOLS[transit.planet]}</span>
                  <div>
                    <div className="text-sm font-medium">
                      {transit.planet} {transit.aspectSymbol} natal {transit.planet}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Age ~{transit.exactAge} • {transit.exactDate ? format(transit.exactDate, 'MMM yyyy') : transit.typicalAgeRange}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {transit.isActive && (
                    <Badge variant="outline" className="bg-rose-500/20 text-rose-600 animate-pulse">
                      ACTIVE NOW
                    </Badge>
                  )}
                  {!transit.isPast && !transit.isActive && transit.daysUntil && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-600">
                      in {Math.round(transit.daysUntil / 30)} months
                    </Badge>
                  )}
                  {transit.isPast && (
                    <Badge variant="outline" className="bg-muted">
                      COMPLETE
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground font-medium mb-1">{transit.description}</p>
              <p className="text-xs text-muted-foreground">{transit.lifeTheme}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No midlife transits calculated. Check birth data.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Post-50 Transits Component
const Post50Transits: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  const birthDate = new Date(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const post50Transits = useMemo(() => {
    return calculateOuterPlanetTransits(chart, currentDate).filter(t => 
      t.exactAge !== null && t.exactAge >= 50
    );
  }, [chart, currentDate]);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star size={16} className="text-violet-500" />
            Elder Initiations (Ages 50+)
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          The wisdom years: what's ahead after midlife
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {post50Transits.map((transit, idx) => (
          <div key={idx} className={`p-3 rounded-lg border ${transit.isPast ? 'bg-muted/30' : 'bg-violet-500/5 border-violet-500/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{PLANET_SYMBOLS[transit.planet]}</span>
                <div>
                  <div className="text-sm font-medium">{transit.description}</div>
                  <div className="text-xs text-muted-foreground">
                    Age ~{transit.exactAge} • {transit.typicalAgeRange}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{transit.lifeTheme}</p>
          </div>
        ))}
        
        {post50Transits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No post-50 transits calculated.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Main Life Cycles Hub Component
export const LifeCyclesHub: React.FC<LifeCyclesHubProps> = ({ chart, currentDate = new Date() }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSaturnDetails, setShowSaturnDetails] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="text-primary" size={24} />
        <div>
          <h3 className="text-lg font-serif">Life Cycles & Major Transits</h3>
          <p className="text-sm text-muted-foreground">
            Your personal timeline of major astrological initiations
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="saturn">♄ Saturn</TabsTrigger>
          <TabsTrigger value="midlife">Midlife</TabsTrigger>
          <TabsTrigger value="elder">50+</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Chart Lord Activation */}
          <ChartLordActivation chart={chart} currentDate={currentDate} />
          
          {/* Quick Summary of All Life Phases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Your Life Cycle Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded">
                  <span className="text-lg">♄</span>
                  <span className="font-medium">Saturn Return #1:</span>
                  <span className="text-muted-foreground">Age 28-30 — Adult identity forms</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded">
                  <span className="text-lg">♅</span>
                  <span className="font-medium">Uranus Opposition:</span>
                  <span className="text-muted-foreground">Age 41-43 — Midlife awakening</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-violet-500/10 rounded">
                  <span className="text-lg">♆</span>
                  <span className="font-medium">Neptune Square:</span>
                  <span className="text-muted-foreground">Age 40-42 — Spiritual disillusionment</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-rose-500/10 rounded">
                  <span className="text-lg">♇</span>
                  <span className="font-medium">Pluto Square:</span>
                  <span className="text-muted-foreground">Varies — Power transformation</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded">
                  <span className="text-lg">⚷</span>
                  <span className="font-medium">Chiron Return:</span>
                  <span className="text-muted-foreground">Age 49-51 — Wound becomes gift</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded">
                  <span className="text-lg">♄</span>
                  <span className="font-medium">Saturn Return #2:</span>
                  <span className="text-muted-foreground">Age 57-60 — Elder initiation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saturn" className="mt-4">
          <SaturnReturnCalculator chart={chart} currentDate={currentDate} />
        </TabsContent>
        
        <TabsContent value="midlife" className="mt-4">
          <MidlifeTransitWindow chart={chart} currentDate={currentDate} />
        </TabsContent>
        
        <TabsContent value="elder" className="mt-4">
          <Post50Transits chart={chart} currentDate={currentDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifeCyclesHub;
