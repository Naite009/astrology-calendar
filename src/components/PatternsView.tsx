import { useState, useMemo, useEffect } from 'react';
import { Orbit, History, TrendingUp, AlertTriangle, Star, RefreshCw, Clock, MapPin, User } from 'lucide-react';
import { PlanetDetailModal } from './PlanetDetailModal';
import { InteractiveAspectExplorer } from './patterns/InteractiveAspectExplorer';
import { PhaseWheelPanel } from './chartdecoder/PhaseWheelPanel';
import { 
  getPlanetaryPositions, 
  detectStelliums, 
  detectRareAspects, 
  detectNodeAspects,
  isMercuryRetrograde,
  getPlanetSymbol,
  getNodePositions,
  getChironPosition,
  getBlackMoonLilith,
  Stellium,
  RareAspect,
  NodeAspect,
  PlanetaryPositions,
  isPlanetRetrograde,
} from '@/lib/astrology';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUserData } from '@/hooks/useUserData';
import { useNatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from './ChartSelector';
import * as Astronomy from 'astronomy-engine';

interface PatternsViewProps {
  year: number;
  initialFocusPlanet?: string;
}

// Mercury retrograde data for 2024-2030
const MERCURY_RETROGRADES: Record<number, { start: string; end: string; sign: string; degrees: string }[]> = {
  2024: [
    { start: 'Dec 13', end: 'Jan 1', sign: 'Sagittarius → Capricorn', degrees: '22°-8°' },
    { start: 'Apr 1', end: 'Apr 25', sign: 'Aries', degrees: '27°-16°' },
    { start: 'Aug 5', end: 'Aug 28', sign: 'Virgo → Leo', degrees: '4°-21°' },
    { start: 'Nov 26', end: 'Dec 15', sign: 'Sagittarius', degrees: '22°-6°' },
  ],
  2025: [
    { start: 'Mar 15', end: 'Apr 7', sign: 'Aries → Pisces', degrees: '9°-26°' },
    { start: 'Jul 18', end: 'Aug 11', sign: 'Leo', degrees: '15°-4°' },
    { start: 'Nov 9', end: 'Nov 29', sign: 'Sagittarius', degrees: '6°-20°' },
  ],
  2026: [
    { start: 'Feb 26', end: 'Mar 20', sign: 'Pisces → Aquarius', degrees: '21°-9°' },
    { start: 'Jun 29', end: 'Jul 23', sign: 'Cancer', degrees: '26°-16°' },
    { start: 'Oct 24', end: 'Nov 13', sign: 'Scorpio', degrees: '19°-3°' },
  ],
  2027: [
    { start: 'Feb 9', end: 'Mar 3', sign: 'Pisces', degrees: '5°-19°' },
    { start: 'Jun 10', end: 'Jul 4', sign: 'Cancer → Gemini', degrees: '8°-26°' },
    { start: 'Oct 7', end: 'Oct 28', sign: 'Scorpio → Libra', degrees: '3°-18°' },
  ],
  2028: [
    { start: 'Jan 24', end: 'Feb 14', sign: 'Aquarius', degrees: '18°-3°' },
    { start: 'May 21', end: 'Jun 13', sign: 'Gemini', degrees: '19°-7°' },
    { start: 'Sep 19', end: 'Oct 11', sign: 'Libra', degrees: '16°-2°' },
  ],
  2029: [
    { start: 'Jan 7', end: 'Jan 27', sign: 'Aquarius → Capricorn', degrees: '2°-16°' },
    { start: 'May 1', end: 'May 25', sign: 'Taurus', degrees: '29°-18°' },
    { start: 'Sep 2', end: 'Sep 24', sign: 'Virgo', degrees: '29°-15°' },
    { start: 'Dec 22', end: 'Jan 10', sign: 'Capricorn', degrees: '16°-1°' },
  ],
  2030: [
    { start: 'Apr 13', end: 'May 7', sign: 'Taurus → Aries', degrees: '11°-28°' },
    { start: 'Aug 15', end: 'Sep 7', sign: 'Virgo', degrees: '12°-28°' },
    { start: 'Dec 6', end: 'Dec 25', sign: 'Capricorn → Sagittarius', degrees: '0°-14°' },
  ],
};

// Historical major conjunctions
const HISTORICAL_CONJUNCTIONS = [
  {
    planets: 'Saturn ☌ Neptune',
    cycle: '~36 years',
    last: { year: 1989, sign: 'Capricorn', degrees: '10°', event: 'Fall of Berlin Wall, end of Cold War' },
    next: { year: 2026, sign: 'Aries', degrees: '0°', exact: 'Feb 20, 2026' },
    meaning: 'Dissolution of old structures, spiritual awakening in collective consciousness. Reality meets dreams.',
    history: [
      { year: 1989, event: 'Fall of Berlin Wall', degrees: '10° Capricorn' },
      { year: 1953, event: 'End of Korean War, Stalin dies', degrees: '22° Libra' },
      { year: 1917, event: 'Russian Revolution', degrees: '3° Leo' },
      { year: 1882, event: 'Birth of modern psychology', degrees: '16° Taurus' },
    ],
  },
  {
    planets: 'Jupiter ☌ Saturn',
    cycle: '~20 years',
    last: { year: 2020, sign: 'Aquarius', degrees: '0°', event: 'COVID pandemic, new era begins' },
    next: { year: 2040, sign: 'Libra', degrees: '17°', exact: 'Oct 31, 2040' },
    meaning: 'Major social/economic shifts. The "Great Mutation" marking generational changes in society.',
    history: [
      { year: 2020, event: 'COVID pandemic begins', degrees: '0° Aquarius' },
      { year: 2000, event: 'Y2K, tech boom peaks', degrees: '22° Taurus' },
      { year: 1980, event: 'Reagan era begins, neoliberalism', degrees: '9° Libra' },
      { year: 1961, event: 'JFK presidency, Space Race', degrees: '25° Capricorn' },
    ],
  },
  {
    planets: 'Uranus ☌ Pluto',
    cycle: '~127 years',
    last: { year: 1966, sign: 'Virgo', degrees: '16°', event: 'Counterculture revolution, civil rights' },
    next: { year: 2104, sign: 'Taurus', degrees: '2°', exact: '~2104' },
    meaning: 'Massive revolutionary transformation. Complete paradigm shifts in technology and power structures.',
    history: [
      { year: 1966, event: 'Counterculture, civil rights movement', degrees: '16° Virgo' },
      { year: 1850, event: 'Industrial Revolution peak', degrees: '29° Aries' },
      { year: 1710, event: 'Enlightenment begins', degrees: '28° Leo' },
    ],
  },
  {
    planets: 'Neptune ☌ Pluto',
    cycle: '~492 years',
    last: { year: 1891, sign: 'Gemini', degrees: '8°', event: 'Birth of modern era, electricity age' },
    next: { year: 2385, sign: 'Gemini', degrees: '~0°', exact: '~2385' },
    meaning: 'Civilization-defining shifts. Complete transformation of spiritual understanding and collective unconscious.',
    history: [
      { year: 1891, event: 'Birth of modern technology era', degrees: '8° Gemini' },
      { year: 1399, event: 'Renaissance begins', degrees: '3° Gemini' },
    ],
  },
  {
    planets: 'Saturn ☌ Uranus',
    cycle: '~45 years',
    last: { year: 1988, sign: 'Sagittarius', degrees: '29°', event: 'End of Cold War era begins' },
    next: { year: 2032, sign: 'Gemini', degrees: '28°', exact: 'Jun 28, 2032' },
    meaning: 'Tension between old and new. Revolutionary restructuring of established systems.',
    history: [
      { year: 1988, event: 'End of Cold War begins', degrees: '29° Sagittarius' },
      { year: 1942, event: 'World War II turning point', degrees: '29° Taurus' },
      { year: 1897, event: 'Second Industrial Revolution', degrees: '27° Scorpio' },
    ],
  },
  {
    planets: 'Saturn ☌ Pluto',
    cycle: '~33-38 years',
    last: { year: 2020, sign: 'Capricorn', degrees: '22°', event: 'COVID pandemic, global restructuring' },
    next: { year: 2053, sign: 'Pisces', degrees: '15°', exact: '~2053' },
    meaning: 'Destruction and rebuilding of power structures. Karmic reckoning with authority.',
    history: [
      { year: 2020, event: 'COVID pandemic, global shutdown', degrees: '22° Capricorn' },
      { year: 1982, event: 'Global recession, AIDS epidemic', degrees: '27° Libra' },
      { year: 1947, event: 'Cold War begins, atomic age', degrees: '13° Leo' },
      { year: 1914, event: 'World War I begins', degrees: '2° Cancer' },
    ],
  },
];

// Get sign symbol from name
const getSignSymbol = (signName: string): string => {
  const symbols: Record<string, string> = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
    'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
    'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
  };
  return symbols[signName] || '';
};

// Check if outer planet is retrograde
const isOuterPlanetRetrograde = (planetName: string, date: Date): boolean => {
  const bodyMap: Record<string, Astronomy.Body> = {
    'Mercury': Astronomy.Body.Mercury,
    'Venus': Astronomy.Body.Venus,
    'Mars': Astronomy.Body.Mars,
    'Jupiter': Astronomy.Body.Jupiter,
    'Saturn': Astronomy.Body.Saturn,
    'Uranus': Astronomy.Body.Uranus,
    'Neptune': Astronomy.Body.Neptune,
    'Pluto': Astronomy.Body.Pluto,
  };
  const body = bodyMap[planetName];
  if (!body) return false;
  return isPlanetRetrograde(body, date);
};

// Live Planetary Positions Component with real-time updates
const LivePlanetaryPositions = ({ userLocation }: { userLocation?: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPlanet, setSelectedPlanet] = useState<{
    name: string;
    symbol: string;
    degree: number;
    signName: string;
    sign: string;
    isRetrograde: boolean;
  } | null>(null);
  
  // Update time every 30 seconds (was 1 second - caused performance issues)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const planets = useMemo(() => getPlanetaryPositions(currentTime), [currentTime]);
  const nodes = useMemo(() => getNodePositions(currentTime), [currentTime]);
  const chiron = useMemo(() => getChironPosition(currentTime), [currentTime]);
  const lilith = useMemo(() => getBlackMoonLilith(currentTime), [currentTime]);

  // All celestial bodies with their data
  const allBodies = useMemo(() => {
    const bodies = [
      { name: 'Sun', symbol: '☉', ...planets.sun, isRetrograde: false },
      { name: 'Moon', symbol: '☽', ...planets.moon, isRetrograde: false },
      { name: 'Mercury', symbol: '☿', ...planets.mercury, isRetrograde: isOuterPlanetRetrograde('Mercury', currentTime) },
      { name: 'Venus', symbol: '♀', ...planets.venus, isRetrograde: isOuterPlanetRetrograde('Venus', currentTime) },
      { name: 'Mars', symbol: '♂', ...planets.mars, isRetrograde: isOuterPlanetRetrograde('Mars', currentTime) },
      { name: 'Jupiter', symbol: '♃', ...planets.jupiter, isRetrograde: isOuterPlanetRetrograde('Jupiter', currentTime) },
      { name: 'Saturn', symbol: '♄', ...planets.saturn, isRetrograde: isOuterPlanetRetrograde('Saturn', currentTime) },
      { name: 'Uranus', symbol: '♅', ...planets.uranus, isRetrograde: isOuterPlanetRetrograde('Uranus', currentTime) },
      { name: 'Neptune', symbol: '♆', ...planets.neptune, isRetrograde: isOuterPlanetRetrograde('Neptune', currentTime) },
      { name: 'Pluto', symbol: '♇', ...planets.pluto, isRetrograde: isOuterPlanetRetrograde('Pluto', currentTime) },
      { name: 'North Node', symbol: '☊', ...nodes.north, isRetrograde: true }, // Nodes always retrograde
      { name: 'Chiron', symbol: '⚷', ...chiron, isRetrograde: false },
      { name: 'Lilith', symbol: '⚸', ...lilith, isRetrograde: false },
    ];
    return bodies;
  }, [planets, nodes, chiron, lilith, currentTime]);

  const handlePlanetClick = (body: typeof allBodies[0]) => {
    setSelectedPlanet({
      name: body.name,
      symbol: body.symbol,
      degree: body.degree,
      signName: body.signName,
      sign: body.sign,
      isRetrograde: body.isRetrograde,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-primary" size={24} />
          <h3 className="font-serif text-xl">Live Planetary Positions</h3>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          {userLocation && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end">
              <MapPin size={10} />
              {userLocation}
            </div>
          )}
        </div>
      </div>

      {/* Planetary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allBodies.map((body) => (
          <button 
            key={body.name} 
            onClick={() => handlePlanetClick(body)}
            className="p-3 rounded-sm bg-secondary border border-border hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl group-hover:scale-110 transition-transform">{body.symbol}</span>
              <span className="font-medium text-foreground text-sm">
                {body.name}
                {body.isRetrograde && <span className="text-red-500 ml-1">℞</span>}
              </span>
            </div>
            <div className="text-lg font-semibold text-primary">
              {body.degree}° {getSignSymbol(body.signName)} {body.signName}
            </div>
            <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to learn more →
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        Click any planet for detailed interpretation • Positions update in real-time • ℞ = Retrograde
      </p>

      {/* Planet Detail Modal */}
      <PlanetDetailModal
        planet={selectedPlanet}
        isOpen={!!selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        currentTime={currentTime}
      />
    </div>
  );
};

// Get current pattern analysis
const getCurrentPatterns = (date: Date) => {
  const planets = getPlanetaryPositions(date);
  const stelliums = detectStelliums(planets);
  const rareAspects = detectRareAspects(planets);
  const nodeAspects = detectNodeAspects(planets);
  const mercuryRx = isMercuryRetrograde(date);
  
  return { planets, stelliums, rareAspects, nodeAspects, mercuryRx };
};

// Retrograde tracker component
const RetrogradePatternTracker = ({ year }: { year: number }) => {
  const retrogrades = MERCURY_RETROGRADES[year] || [];
  const pastYears = [year - 3, year - 2, year - 1].filter(y => MERCURY_RETROGRADES[y]);
  const futureYears = [year + 1, year + 2, year + 3].filter(y => MERCURY_RETROGRADES[y]);

  // Analyze sign patterns
  const signCounts: Record<string, number> = {};
  Object.values(MERCURY_RETROGRADES).flat().forEach(rx => {
    const mainSign = rx.sign.split(' → ')[0];
    signCounts[mainSign] = (signCounts[mainSign] || 0) + 1;
  });

  const topSigns = Object.entries(signCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <RefreshCw className="text-primary" size={24} />
        <h3 className="font-serif text-xl">Mercury Retrograde Pattern Tracker</h3>
      </div>

      {/* Current Year */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-sm border border-amber-200 dark:border-amber-700">
        <h4 className="font-semibold text-foreground mb-3">{year} Mercury Retrogrades</h4>
        <div className="grid gap-3 md:grid-cols-3">
          {retrogrades.map((rx, i) => (
            <div key={i} className="bg-background p-3 rounded-sm border border-border">
              <div className="font-medium text-foreground">☿℞ #{i + 1}</div>
              <div className="text-sm text-muted-foreground">{rx.start} – {rx.end}</div>
              <div className="text-sm text-primary font-medium">{rx.sign}</div>
              <div className="text-xs text-muted-foreground">{rx.degrees}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern History */}
      <Accordion type="single" collapsible>
        <AccordionItem value="history">
          <AccordionTrigger className="text-sm font-medium">
            Past Retrogrades ({pastYears.join(', ')})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {pastYears.map(y => (
                <div key={y}>
                  <div className="font-medium text-foreground mb-2">{y}</div>
                  <div className="grid gap-2 md:grid-cols-4">
                    {(MERCURY_RETROGRADES[y] || []).map((rx, i) => (
                      <div key={i} className="text-sm p-2 bg-secondary rounded-sm">
                        <div className="text-muted-foreground">{rx.start} – {rx.end}</div>
                        <div className="text-primary">{rx.sign}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="future">
          <AccordionTrigger className="text-sm font-medium">
            Future Retrogrades ({futureYears.join(', ')})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {futureYears.map(y => (
                <div key={y}>
                  <div className="font-medium text-foreground mb-2">{y}</div>
                  <div className="grid gap-2 md:grid-cols-4">
                    {(MERCURY_RETROGRADES[y] || []).map((rx, i) => (
                      <div key={i} className="text-sm p-2 bg-secondary rounded-sm">
                        <div className="text-muted-foreground">{rx.start} – {rx.end}</div>
                        <div className="text-primary">{rx.sign}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="patterns">
          <AccordionTrigger className="text-sm font-medium">
            Sign Pattern Analysis
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Mercury retrogrades cycle through the elements roughly every 7 years. Current pattern emphasis:
              </p>
              <div className="flex flex-wrap gap-2">
                {topSigns.map(([sign, count]) => (
                  <span key={sign} className="px-3 py-1 rounded-full text-sm bg-secondary text-foreground">
                    {sign}: {count}x
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Mercury tends to retrograde in the same element (Fire, Earth, Air, Water) for about a year before shifting.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Historical conjunction finder component
const HistoricalConjunctionFinder = ({ year }: { year: number }) => {
  // Check if any conjunctions are happening this year or soon
  const upcomingConjunctions = HISTORICAL_CONJUNCTIONS.filter(c => {
    const nextYear = parseInt(c.next.year.toString());
    return nextYear >= year && nextYear <= year + 10;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <History className="text-primary" size={24} />
        <h3 className="font-serif text-xl">Historical Conjunction Cycles</h3>
      </div>

      {/* Upcoming Soon */}
      {upcomingConjunctions.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-sm border border-purple-200 dark:border-purple-700">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star size={18} className="text-purple-600" />
            Upcoming Major Conjunctions
          </h4>
          <div className="space-y-3">
            {upcomingConjunctions.map((c, i) => (
              <div key={i} className="bg-background p-3 rounded-sm border border-border">
                <div className="font-medium text-foreground">{c.planets}</div>
                <div className="text-sm text-primary">{c.next.exact} in {c.next.sign}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Major Cycles */}
      <Accordion type="single" collapsible>
        {HISTORICAL_CONJUNCTIONS.map((conjunction, i) => (
          <AccordionItem key={i} value={`conjunction-${i}`}>
            <AccordionTrigger className="text-sm font-medium">
              {conjunction.planets} <span className="text-muted-foreground ml-2">({conjunction.cycle})</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Meaning */}
                <div className="p-3 bg-secondary rounded-sm">
                  <div className="text-sm text-foreground leading-relaxed">{conjunction.meaning}</div>
                </div>

                {/* Last & Next */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-sm border border-red-200 dark:border-red-700">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Last Occurred</div>
                    <div className="font-medium text-foreground">{conjunction.last.year} in {conjunction.last.sign}</div>
                    <div className="text-sm text-muted-foreground">{conjunction.last.event}</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-200 dark:border-green-700">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Next Occurrence</div>
                    <div className="font-medium text-foreground">{conjunction.next.exact}</div>
                    <div className="text-sm text-muted-foreground">{conjunction.next.sign} at {conjunction.next.degrees}</div>
                  </div>
                </div>

                {/* Historical Events */}
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Historical Events</div>
                  <div className="space-y-2">
                    {conjunction.history.map((h, j) => (
                      <div key={j} className="flex items-start gap-3 text-sm">
                        <span className="font-medium text-primary min-w-[50px]">{h.year}</span>
                        <span className="text-muted-foreground">{h.event}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{h.degrees}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

// Current patterns component
const CurrentPatternsPanel = ({ date }: { date: Date }) => {
  const patterns = useMemo(() => getCurrentPatterns(date), [date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="text-primary" size={24} />
        <h3 className="font-serif text-xl">Current Patterns — {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
      </div>

      {/* Mercury Retrograde Status */}
      <div className={`p-4 rounded-sm border ${patterns.mercuryRx ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">☿</span>
          <span className="font-medium text-foreground">
            Mercury {patterns.mercuryRx ? '℞ Retrograde' : 'Direct'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {patterns.mercuryRx 
            ? 'Review, revise, reconnect. Avoid signing contracts or starting new projects.'
            : 'Communication and travel flow smoothly. Good for new initiatives.'}
        </p>
      </div>

      {/* Stelliums */}
      {patterns.stelliums.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-sm border border-amber-200 dark:border-amber-700">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            Active Stelliums
          </h4>
          <div className="space-y-3">
            {patterns.stelliums.map((stellium: Stellium, i: number) => (
              <div key={i}>
                <div className="font-medium text-foreground">
                  {stellium.count} planets in {stellium.sign}
                </div>
                <div className="flex gap-2 mt-1">
                  {stellium.planets.map((p, j) => (
                    <span key={j} className="text-lg" title={p.name}>
                      {p.symbol}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Concentrated energy in {stellium.sign} themes. Major focus area.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rare Aspects - with positions */}
      {patterns.rareAspects.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-sm border border-purple-200 dark:border-purple-700">
          <h4 className="font-semibold text-foreground mb-3">Rare Aspects Active</h4>
          <div className="space-y-3">
            {patterns.rareAspects.map((aspect: RareAspect, i: number) => {
              // Get current positions for the planets in this aspect
              const p1Key = aspect.planet1.toLowerCase() as keyof PlanetaryPositions;
              const p2Key = aspect.planet2.toLowerCase() as keyof PlanetaryPositions;
              const p1Pos = patterns.planets[p1Key];
              const p2Pos = patterns.planets[p2Key];
              
              return (
                <div key={i} className="p-3 bg-background rounded-sm border border-border">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xl">{getPlanetSymbol(aspect.planet1.toLowerCase())}</span>
                    <span className="text-primary font-medium text-lg">{aspect.symbol}</span>
                    <span className="text-xl">{getPlanetSymbol(aspect.planet2.toLowerCase())}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {aspect.type} ({aspect.orb}° orb)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{aspect.planet1}:</span>
                      <span className="text-primary">
                        {p1Pos?.degree}° {p1Pos?.sign} {p1Pos?.signName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{aspect.planet2}:</span>
                      <span className="text-primary">
                        {p2Pos?.degree}° {p2Pos?.sign} {p2Pos?.signName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Node Aspects */}
      {patterns.nodeAspects.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-sm border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold text-foreground mb-3">☊☋ Nodal Activations</h4>
          <div className="space-y-2">
            {patterns.nodeAspects.map((aspect: NodeAspect, i: number) => (
              <div key={i} className="p-2 bg-background rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlanetSymbol(aspect.planet.toLowerCase())}</span>
                  <span className="text-primary">{aspect.symbol}</span>
                  <span className="font-medium text-foreground">
                    {aspect.node} Node
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{aspect.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No special patterns */}
      {patterns.stelliums.length === 0 && patterns.rareAspects.length === 0 && patterns.nodeAspects.length === 0 && (
        <div className="p-4 bg-secondary rounded-sm text-center">
          <p className="text-sm text-muted-foreground">
            No major stelliums or rare aspects active today. Check the standard aspects in the day view.
          </p>
        </div>
      )}
    </div>
  );
};

export const PatternsView = ({ year, initialFocusPlanet }: PatternsViewProps) => {
  const [selectedDate] = useState(new Date());
  const { userData } = useUserData();
  const { userNatalChart, savedCharts } = useNatalChart();
  const [selectedChartId, setSelectedChartId] = useState<string>('');

  // Set default chart
  useEffect(() => {
    if (!selectedChartId && userNatalChart) {
      setSelectedChartId(userNatalChart.id);
    }
  }, [userNatalChart, selectedChartId]);

  // Get selected chart data
  const selectedChart = useMemo(() => {
    if (!selectedChartId) return userNatalChart;
    if (userNatalChart && userNatalChart.id === selectedChartId) return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartId) || userNatalChart;
  }, [selectedChartId, userNatalChart, savedCharts]);
  
  // Get current planetary positions for the Phase Wheel
  const planets = useMemo(() => {
    const positions = getPlanetaryPositions(selectedDate);
    const nodes = getNodePositions(selectedDate);
    const chiron = getChironPosition(selectedDate);
    
    // Convert to the format PhaseWheelPanel expects
    const result: Array<{ name: string; sign: string; degree: number }> = [
      { name: 'Sun', sign: positions.sun.signName, degree: positions.sun.degree },
      { name: 'Moon', sign: positions.moon.signName, degree: positions.moon.degree },
      { name: 'Mercury', sign: positions.mercury.signName, degree: positions.mercury.degree },
      { name: 'Venus', sign: positions.venus.signName, degree: positions.venus.degree },
      { name: 'Mars', sign: positions.mars.signName, degree: positions.mars.degree },
      { name: 'Jupiter', sign: positions.jupiter.signName, degree: positions.jupiter.degree },
      { name: 'Saturn', sign: positions.saturn.signName, degree: positions.saturn.degree },
      { name: 'Uranus', sign: positions.uranus.signName, degree: positions.uranus.degree },
      { name: 'Neptune', sign: positions.neptune.signName, degree: positions.neptune.degree },
      { name: 'Pluto', sign: positions.pluto.signName, degree: positions.pluto.degree },
    ];
    
    if (nodes.north) {
      result.push({ name: 'NorthNode', sign: nodes.north.signName, degree: nodes.north.degree });
    }
    if (chiron) {
      result.push({ name: 'Chiron', sign: chiron.signName, degree: chiron.degree });
    }
    
    return result;
  }, [selectedDate]);
  
  // Scroll to phase wheel if initialFocusPlanet is provided
  useEffect(() => {
    if (initialFocusPlanet) {
      const element = document.getElementById('phase-wheel');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [initialFocusPlanet]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header + Chart Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Orbit className="text-primary" size={28} />
          <h2 className="font-serif text-2xl font-light text-foreground">Astrological Patterns & Cycles</h2>
        </div>

        <p className="text-muted-foreground">
          Track retrograde patterns, major planetary conjunctions, and current cosmic configurations.
        </p>

        {/* Chart Selector for personalization */}
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <User size={16} className="text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground flex-shrink-0">Personalize for:</span>
          <div className="flex-1">
            <ChartSelector
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
              selectedChartId={selectedChartId}
              onSelect={setSelectedChartId}
              label=""
            />
          </div>
        </div>

        {selectedChart && (
          <p className="text-xs text-muted-foreground italic">
            Showing transits personalized for {selectedChart.name}'s natal chart. Planetary aspects to natal positions will be highlighted.
          </p>
        )}
      </div>

      {/* Live Planetary Positions */}
      <section className="rounded-lg border border-border bg-card p-6">
        <LivePlanetaryPositions userLocation={userData?.birthLocation} />
      </section>

      {/* Interactive Aspect Explorer */}
      <section className="rounded-lg border border-border bg-card p-6">
        <InteractiveAspectExplorer date={selectedDate} />
      </section>

      {/* Phase Wheel Panel - NEW */}
      <section className="rounded-lg border border-border bg-card p-6">
        <PhaseWheelPanel 
          planets={planets} 
          initialFocusPlanet={initialFocusPlanet || 'Sun'}
        />
      </section>

      {/* Current Patterns */}
      <section className="rounded-lg border border-border bg-card p-6">
        <CurrentPatternsPanel date={selectedDate} />
      </section>

      {/* Retrograde Tracker */}
      <section className="rounded-lg border border-border bg-card p-6">
        <RetrogradePatternTracker year={year} />
      </section>

      {/* Historical Conjunctions */}
      <section className="rounded-lg border border-border bg-card p-6">
        <HistoricalConjunctionFinder year={year} />
      </section>

      {/* Info Footer */}
      <div className="p-4 rounded-sm bg-secondary text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>About These Patterns:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Stelliums</strong>: 3+ planets in the same sign amplify that sign's energy</li>
          <li><strong>Rare Aspects</strong>: Quincunx (150°), Quintile (72°), Sesquiquadrate (135°) reveal subtle dynamics</li>
          <li><strong>Retrograde Patterns</strong>: Mercury retrogrades cycle through elements roughly every 7 years</li>
          <li><strong>Major Conjunctions</strong>: Outer planet conjunctions mark generational shifts</li>
          <li><strong>Phase Wheels</strong>: Track waxing (building) vs waning (integrating) relationships between planets</li>
        </ul>
      </div>
    </div>
  );
};
