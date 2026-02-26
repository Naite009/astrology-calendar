import React, { useState, useEffect, useMemo, ReactNode, Suspense, lazy, useRef, useCallback } from 'react';
import { Clock, Calendar, CalendarCheck, Sparkles, Sun, Moon, AlertTriangle, CheckCircle, Star, ChevronLeft, ChevronRight, Users, User, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/* Lazy-load heavy components to prevent main thread blocking */
const BiorhythmCard = lazy(() => import('@/components/BiorhythmCard').then(m => ({ default: m.BiorhythmCard })));
const BiorhythmForecast = lazy(() => import('@/components/BiorhythmForecast').then(m => ({ default: m.BiorhythmForecast })));
const LifeCyclesHub = lazy(() => import('@/components/LifeCyclesHub').then(m => ({ default: m.LifeCyclesHub })));
const DailySynthesisCard = lazy(() => import('@/components/DailySynthesisCard').then(m => ({ default: m.DailySynthesisCard })));
const TransitAlertsCard = lazy(() => import('@/components/TransitAlertsCard').then(m => ({ default: m.TransitAlertsCard })));
const BestDaysSummaryCard = lazy(() => import('@/components/BestDaysSummaryCard').then(m => ({ default: m.BestDaysSummaryCard })));
const MoonTransitCalendar = lazy(() => import('@/components/MoonTransitCalendar').then(m => ({ default: m.MoonTransitCalendar })));
const VenusStarPointTrackerComp = lazy(() => import('@/components/VenusStarPointTracker').then(m => ({ default: m.VenusStarPointTracker })));

/* Visibility-gated render: only mounts children when scrolled into view.
   This prevents off-screen heavy components from calculating and blocking the thread. */
const VisibleRender = ({ children, fallback, rootMargin = '200px' }: { children: ReactNode; fallback?: ReactNode; rootMargin?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (!isVisible) {
    return <div ref={ref}>{fallback || <Skeleton className="h-40 w-full rounded-lg" />}</div>;
  }
  return <Suspense fallback={fallback || <Skeleton className="h-40 w-full rounded-lg" />}>{children}</Suspense>;
};
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateBestTimes, BestTimesCategory, BestTimeResult, CATEGORY_INFO, getTransitPositions, getCurrentAspects } from '@/lib/bestTimes';
import { 
  calculateElectionalDays, 
  calculatePersonalActivations,
  getMonthElectionalDays,
  ElectionalDay,
  ElectionalRating,
  PersonalActivation
} from '@/lib/electionalCalendar';
import { DATES_TO_AVOID_2026, BEST_DAYS_2026, get2026MonthData, ElectionalDayData } from '@/lib/electional2026Database';
import { getVOCMoonDetails } from '@/lib/voidOfCourseMoon';
import { calculatePlanetaryHours } from '@/lib/planetaryHours';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartSelector } from '@/components/ChartSelector';
import { parseLocalDate } from '@/lib/localDate';
interface TimingViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartForTiming: string;
  setSelectedChartForTiming: (id: string) => void;
  currentDate: Date;
}

type TimingSection = 'now' | 'today' | 'plan' | 'venus';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷'
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const RATING_CONFIG: Record<string, { 
  bg: string; 
  border: string; 
  text: string;
  icon: string; 
  label: string;
  description: string;
}> = {
  RED: { 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    border: 'border-red-400', 
    text: 'text-red-700 dark:text-red-300',
    icon: '🔴', 
    label: 'Avoid',
    description: "Don't start anything important"
  },
  YELLOW: { 
    bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
    border: 'border-yellow-400', 
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: '🟡', 
    label: 'Caution',
    description: 'Proceed carefully, expect challenges'
  },
  GREEN: { 
    bg: 'bg-green-50 dark:bg-green-950/30', 
    border: 'border-green-400', 
    text: 'text-green-700 dark:text-green-300',
    icon: '🟢', 
    label: 'Best Days',
    description: 'Highly supportive for launches'
  },
  BLUE: { 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    border: 'border-blue-400', 
    text: 'text-blue-700 dark:text-blue-300',
    icon: '🔵', 
    label: 'Power Days',
    description: 'Good for specific activities'
  },
  PURPLE: { 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    border: 'border-purple-400', 
    text: 'text-purple-700 dark:text-purple-300',
    icon: '🟣', 
    label: 'Rare Events',
    description: 'Once-in-decades astrology'
  }
};

// Right Now Section Component
const RightNowSection = ({ 
  userNatalChart, 
  savedCharts,
  selectedChart,
  setSelectedChart
}: { 
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChart: string;
  setSelectedChart: (id: string) => void;
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [planetaryHours, setPlanetaryHours] = useState<any[]>([]);
  const [vocMoon, setVocMoon] = useState<{ isVoid: boolean; endsAt?: Date; nextSign?: string } | null>(null);
  const [personalTransits, setPersonalTransits] = useState<any[]>([]);

  // Get active natal chart
  const activeChart = useMemo(() => {
    if (selectedChart === 'general') return null;
    if (selectedChart === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChart) || null;
  }, [selectedChart, userNatalChart, savedCharts]);

  // Update time every minute - but use a stable interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Split heavy calculations into separate timeouts to avoid blocking
  useEffect(() => {
    const t1 = setTimeout(() => {
      const lat = 34.0522;
      const lng = -118.2437;
      setPlanetaryHours(calculatePlanetaryHours(currentTime, lat, lng));
    }, 0);
    return () => clearTimeout(t1);
  }, [currentTime]);

  useEffect(() => {
    const t2 = setTimeout(() => {
      const vocDetails = getVOCMoonDetails(currentTime);
      setVocMoon(vocDetails.isCurrentlyVOC 
        ? { isVoid: true, endsAt: vocDetails.end, nextSign: vocDetails.moonEntersSign } 
        : { isVoid: false });
    }, 100);
    return () => clearTimeout(t2);
  }, [currentTime]);

  useEffect(() => {
    if (!activeChart?.planets) {
      setPersonalTransits([]);
      return;
    }
    const t3 = setTimeout(() => {
      const transits = getTransitPositions(currentTime);
      const aspects: any[] = [];
      const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const natalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
      natalPlanets.forEach(natalPlanet => {
        const natalPos = activeChart.planets[natalPlanet];
        if (!natalPos?.sign) return;
        const natalSignIndex = ZODIAC_SIGNS.indexOf(natalPos.sign);
        const natalLongitude = natalSignIndex * 30 + natalPos.degree + (natalPos.minutes || 0) / 60;
        transits.forEach(transit => {
          if (transit.name === natalPlanet) return;
          let diff = Math.abs(transit.longitude - natalLongitude);
          if (diff > 180) diff = 360 - diff;
          const aspectTypes = [
            { name: 'conjunction', angle: 0, symbol: '☌', effect: 'intensifies' },
            { name: 'sextile', angle: 60, symbol: '⚹', effect: 'supports' },
            { name: 'square', angle: 90, symbol: '□', effect: 'challenges' },
            { name: 'trine', angle: 120, symbol: '△', effect: 'harmonizes with' },
            { name: 'opposition', angle: 180, symbol: '☍', effect: 'opposes' }
          ];
          aspectTypes.forEach(aspect => {
            const orb = Math.abs(diff - aspect.angle);
            if (orb <= 3) {
              aspects.push({
                transitPlanet: transit.name,
                natalPlanet,
                aspectType: aspect.name,
                symbol: aspect.symbol,
                orb: orb.toFixed(1),
                effect: aspect.effect,
                isHarmonious: ['conjunction', 'trine', 'sextile'].includes(aspect.name)
              });
            }
          });
        });
      });
      setPersonalTransits(aspects);
    }, 200);
    return () => clearTimeout(t3);
  }, [activeChart, currentTime]);

  // Find current planetary hour - use correct property names (start/end not startTime/endTime)
  const currentHour = planetaryHours.find(h => {
    const start = h.start instanceof Date ? h.start : new Date(h.start);
    const end = h.end instanceof Date ? h.end : new Date(h.end);
    return currentTime >= start && currentTime < end;
  });

  const nextHour = planetaryHours.find(h => {
    const start = h.start instanceof Date ? h.start : new Date(h.start);
    return start > currentTime;
  });

  // Moon phase calculation
  const getMoonPhase = () => {
    const synodic = 29.530588853;
    const newMoon = new Date('2000-01-06T18:14:00Z');
    const diff = currentTime.getTime() - newMoon.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    const phase = ((days % synodic) / synodic) * 100;
    
    if (phase < 3.5) return { name: 'New Moon', emoji: '🌑', percent: Math.round(phase * 2) };
    if (phase < 25) return { name: 'Waxing Crescent', emoji: '🌒', percent: Math.round(phase) };
    if (phase < 28) return { name: 'First Quarter', emoji: '🌓', percent: 50 };
    if (phase < 50) return { name: 'Waxing Gibbous', emoji: '🌔', percent: Math.round(phase) };
    if (phase < 53) return { name: 'Full Moon', emoji: '🌕', percent: 100 };
    if (phase < 75) return { name: 'Waning Gibbous', emoji: '🌖', percent: Math.round(100 - (phase - 50)) };
    if (phase < 78) return { name: 'Last Quarter', emoji: '🌗', percent: 50 };
    return { name: 'Waning Crescent', emoji: '🌘', percent: Math.round(100 - phase) };
  };

  const moonPhase = getMoonPhase();

  const PLANET_MEANINGS: Record<string, { bestFor: string; avoid: string }> = {
    Sun: { bestFor: 'Visibility, leadership, confidence, authority', avoid: 'Hiding, deception' },
    Moon: { bestFor: 'Emotions, intuition, home, family', avoid: 'Logic-heavy tasks' },
    Mars: { bestFor: 'Competition, courage, physical activity', avoid: 'Delicate negotiations' },
    Mercury: { bestFor: 'Communication, contracts, learning, travel', avoid: 'Secrecy' },
    Jupiter: { bestFor: 'Expansion, luck, education, legal matters', avoid: 'Restrictions' },
    Venus: { bestFor: 'Love, beauty, art, pleasure, finances', avoid: 'Conflict' },
    Saturn: { bestFor: 'Discipline, structure, long-term planning', avoid: 'Quick wins' }
  };

  return (
    <div className="space-y-4">
      {/* Chart Selector */}
      <div className="p-4 rounded-lg border border-border bg-secondary/30">
        <div className="flex items-center gap-3 flex-wrap">
          <ChartSelector
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChart}
            onSelect={setSelectedChart}
            includeGeneral={true}
            generalLabel="Collective Only"
            label="View transits for:"
          />
          {activeChart && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-sm">
              Personal transits active for {activeChart.name}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Current Planetary Hour */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Current Planetary Hour</span>
          </div>
          {currentHour ? (
            <div>
              <div className="text-2xl font-serif mb-1">
                {PLANET_SYMBOLS[currentHour.planet]} {currentHour.planet}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Best for: {PLANET_MEANINGS[currentHour.planet]?.bestFor || 'General activities'}
              </p>
              {nextHour && (
                <p className="text-xs text-muted-foreground">
                  Next: {PLANET_SYMBOLS[nextHour.planet]} {nextHour.planet} at{' '}
                  {(nextHour.start instanceof Date ? nextHour.start : new Date(nextHour.start)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading planetary hours...</p>
          )}
        </div>

        {/* VOC Moon Status */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Moon size={18} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Moon Status</span>
          </div>
          {vocMoon !== null ? (
            <div>
              <div className={`text-lg font-medium mb-1 ${vocMoon.isVoid ? 'text-yellow-600' : 'text-green-600'}`}>
                {vocMoon.isVoid ? '⚠️ Void of Course' : '✅ Productive Moon'}
              </div>
              {vocMoon.isVoid && vocMoon.endsAt && (
                <p className="text-sm text-muted-foreground">
                  Until {vocMoon.endsAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  {vocMoon.nextSign && ` → ${vocMoon.nextSign}`}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {vocMoon.isVoid 
                  ? 'Avoid starting new projects. Good for routine tasks.'
                  : 'Good time for new beginnings and important decisions.'}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Calculating...</p>
          )}
        </div>

        {/* Moon Phase */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{moonPhase.emoji}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Moon Phase</span>
          </div>
          <div className="text-lg font-medium mb-1">{moonPhase.name}</div>
          <p className="text-sm text-muted-foreground">
            {moonPhase.percent}% illuminated
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {moonPhase.name.includes('Waxing') || moonPhase.name === 'New Moon'
              ? 'Growth phase: Good for starting, building, expanding'
              : 'Release phase: Good for completion, letting go, reflection'}
          </p>
        </div>
      </div>

      {/* Transit Alerts Card */}
      <VisibleRender>
        <div className="mt-6">
          <TransitAlertsCard natalChart={activeChart} />
        </div>
      </VisibleRender>

      {/* Moon Transit Calendar */}
      <VisibleRender>
        <div className="mt-6">
          <MoonTransitCalendar natalChart={activeChart} />
        </div>
      </VisibleRender>

      {/* Personal Transits to Natal Chart - TODAY'S TRANSITS */}
      {activeChart && personalTransits.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star size={16} className="text-primary" />
            Today's Transits to {activeChart.name}'s Chart
            <span className="text-xs text-muted-foreground font-normal ml-2">
              ({currentTime.toLocaleDateString()})
            </span>
          </h4>
          <div className="grid gap-2">
            {personalTransits.slice(0, 6).map((transit, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 rounded ${transit.isHarmonious ? 'bg-accent/50' : 'bg-destructive/10'}`}>
                <span className={`text-lg ${transit.isHarmonious ? 'text-accent-foreground' : 'text-destructive'}`}>
                  {transit.isHarmonious ? '✨' : '⚡'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {PLANET_SYMBOLS[transit.transitPlanet]} Transit {transit.transitPlanet} {transit.symbol} Natal {PLANET_SYMBOLS[transit.natalPlanet]} {transit.natalPlanet}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {transit.transitPlanet} {transit.effect} your natal {transit.natalPlanet} ({transit.orb}° orb)
                  </div>
                </div>
              </div>
            ))}
            {personalTransits.length > 6 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                +{personalTransits.length - 6} more transits active
              </p>
            )}
          </div>
        </div>
      )}

      {/* Daily Power Synthesis */}
      {activeChart && (
        <VisibleRender fallback={<Skeleton className="h-40 w-full rounded-lg mt-6" />}>
          <div className="mt-6">
            <DailySynthesisCard
              birthDate={new Date(activeChart.birthDate)}
              targetDate={currentTime}
              natalChart={activeChart}
            />
          </div>
        </VisibleRender>
      )}

      {/* Biorhythm Card */}
      <VisibleRender fallback={<Skeleton className="h-40 w-full rounded-lg mt-6" />}>
        <div className="mt-6">
          <BiorhythmCard
            birthDate={activeChart ? parseLocalDate(activeChart.birthDate) : null}
            targetDate={currentTime}
            savedCharts={[...(userNatalChart ? [userNatalChart] : []), ...savedCharts]}
            selectedChartId={activeChart ? (selectedChart === 'user' ? userNatalChart?.id : selectedChart) : undefined}
            onChartChange={(id) => {
              const chart = [...(userNatalChart ? [userNatalChart] : []), ...savedCharts].find(c => c.id === id);
              if (chart) {
                if (userNatalChart && chart.id === userNatalChart.id) {
                  setSelectedChart('user');
                } else {
                  setSelectedChart(id);
                }
              }
            }}
            chartName={activeChart?.name}
          />
        </div>
      </VisibleRender>

      {/* Best Days Summary */}
      <VisibleRender fallback={<Skeleton className="h-40 w-full rounded-lg mt-6" />}>
        <div className="mt-6">
          <BestDaysSummaryCard natalChart={activeChart} />
        </div>
      </VisibleRender>

      {/* Life Cycles Hub */}
      {activeChart && (
        <VisibleRender fallback={<Skeleton className="h-40 w-full rounded-lg mt-6" />}>
          <div className="mt-6">
            <LifeCyclesHub chart={activeChart} currentDate={currentTime} />
          </div>
        </VisibleRender>
      )}
    </div>
  );
};

// Today Section Component
const TodaySection = ({ 
  date,
  userNatalChart,
  savedCharts,
  selectedChart,
  setSelectedChart
}: { 
  date: Date;
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChart: string;
  setSelectedChart: (id: string) => void;
}) => {
  const [aspects, setAspects] = useState<any[]>([]);
  const [transitPositions, setTransitPositions] = useState<any[]>([]);
  const [personalTransits, setPersonalTransits] = useState<any[]>([]);

  // Get active natal chart
  const activeChart = useMemo(() => {
    if (selectedChart === 'general') return null;
    if (selectedChart === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChart) || null;
  }, [selectedChart, userNatalChart, savedCharts]);

  useEffect(() => {
    const todayAspects = getCurrentAspects(date);
    const positions = getTransitPositions(date);
    setAspects(todayAspects);
    setTransitPositions(positions);
  }, [date]);

  // Calculate personal transits when chart changes
  useEffect(() => {
    if (!activeChart?.planets) {
      setPersonalTransits([]);
      return;
    }

    const transits = getTransitPositions(date);
    const aspects: any[] = [];
    const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    const natalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
    
    natalPlanets.forEach(natalPlanet => {
      const natalPos = activeChart.planets[natalPlanet];
      if (!natalPos?.sign) return;
      
      const natalSignIndex = ZODIAC_SIGNS.indexOf(natalPos.sign);
      const natalLongitude = natalSignIndex * 30 + natalPos.degree + (natalPos.minutes || 0) / 60;
      
      transits.forEach(transit => {
        if (transit.name === natalPlanet) return;
        
        let diff = Math.abs(transit.longitude - natalLongitude);
        if (diff > 180) diff = 360 - diff;
        
        const aspectTypes = [
          { name: 'conjunction', angle: 0, symbol: '☌', effect: 'intensifies' },
          { name: 'sextile', angle: 60, symbol: '⚹', effect: 'supports' },
          { name: 'square', angle: 90, symbol: '□', effect: 'challenges' },
          { name: 'trine', angle: 120, symbol: '△', effect: 'harmonizes with' },
          { name: 'opposition', angle: 180, symbol: '☍', effect: 'opposes' }
        ];
        
        aspectTypes.forEach(aspect => {
          const orb = Math.abs(diff - aspect.angle);
          if (orb <= 3) {
            aspects.push({
              transitPlanet: transit.name,
              natalPlanet,
              aspectType: aspect.name,
              symbol: aspect.symbol,
              orb: orb.toFixed(1),
              effect: aspect.effect,
              isHarmonious: ['conjunction', 'trine', 'sextile'].includes(aspect.name)
            });
          }
        });
      });
    });
    
    setPersonalTransits(aspects);
  }, [activeChart, date]);

  const getAspectColor = (type: string) => {
    switch (type) {
      case 'conjunction': return 'text-green-600';
      case 'trine': return 'text-blue-600';
      case 'sextile': return 'text-purple-600';
      case 'square': return 'text-red-600';
      case 'opposition': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const getAspectRating = (type: string) => {
    if (['conjunction', 'trine', 'sextile'].includes(type)) return '🟢';
    if (type === 'square') return '🟡';
    if (type === 'opposition') return '🔴';
    return '⚪';
  };

  const allCharts = [
    { id: 'general', name: 'Collective Only' },
    ...(userNatalChart ? [{ id: 'user', name: `★ ${userNatalChart.name}` }] : []),
    ...[...savedCharts].sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ id: c.id, name: c.name }))
  ];

  return (
    <div className="space-y-4">
      {/* Chart Selector */}
      <div className="p-4 rounded-lg border border-border bg-secondary/30">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">View transits for:</label>
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {allCharts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {activeChart && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-sm">
              Personal transits active for {activeChart.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-primary" />
        <span className="font-medium">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Collective Aspects */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          Today's Collective Aspects
          {aspects.filter(a => a.isExact).length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full animate-pulse">
              {aspects.filter(a => a.isExact).length} EXACT
            </span>
          )}
        </h4>
        {aspects.length > 0 ? (
          <div className="space-y-3">
            {aspects.map((aspect, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                  aspect.isExact 
                    ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">{getAspectRating(aspect.type)}</span>
                  {aspect.isExact && (
                    <span className="text-[10px] font-bold text-primary mt-1">EXACT</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${getAspectColor(aspect.type)}`}>
                      {PLANET_SYMBOLS[aspect.planet1] || '?'} {aspect.planet1} {aspect.symbol} {PLANET_SYMBOLS[aspect.planet2] || '?'} {aspect.planet2}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      aspect.isExact 
                        ? 'bg-primary text-primary-foreground font-bold' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {aspect.orb}° orb
                    </span>
                    {/* Applying/Separating Indicator */}
                    <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      aspect.isApplying 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {aspect.isApplying ? (
                        <>
                          <span className="text-[10px]">↗</span>
                          Applying
                        </>
                      ) : (
                        <>
                          <span className="text-[10px]">↘</span>
                          Separating
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {aspect.description}
                    {aspect.isApplying && (
                      <span className="text-green-600 dark:text-green-400 ml-1">
                        • Building in intensity
                      </span>
                    )}
                    {aspect.isSeparating && (
                      <span className="text-amber-600 dark:text-amber-400 ml-1">
                        • Waning in effect
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
            <p>No major aspects today.</p>
            <p className="text-sm mt-1">Check the Plan Ahead section for upcoming significant dates.</p>
          </div>
        )}
      </div>

      {/* Personal Transits to Natal Chart */}
      {activeChart && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star size={16} className="text-primary" />
            Transits to {activeChart.name}'s Chart
          </h4>
          {personalTransits.length > 0 ? (
            <div className="grid gap-2">
              {personalTransits.map((transit, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${transit.isHarmonious ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'}`}>
                  <span className={`text-lg ${transit.isHarmonious ? 'text-green-600' : 'text-red-600'}`}>
                    {transit.isHarmonious ? '✨' : '⚡'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {PLANET_SYMBOLS[transit.transitPlanet]} Transit {transit.transitPlanet} {transit.symbol} Natal {PLANET_SYMBOLS[transit.natalPlanet]} {transit.natalPlanet}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transit.transitPlanet} {transit.effect} your natal {transit.natalPlanet} ({transit.orb}° orb)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
              <p>No major transits to your chart today.</p>
            </div>
          )}
        </div>
      )}

      {/* Current Planet Positions */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Current Planet Positions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {transitPositions.map((planet) => (
            <div key={planet.name} className="flex items-center gap-2">
              <span className="text-primary">{PLANET_SYMBOLS[planet.name] || '?'}</span>
              <span>{planet.name}</span>
              <span className="text-muted-foreground text-xs">{planet.degree}° {planet.sign?.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Plan Ahead Section Component (Electional Calendar)
const PlanAheadSection = ({ 
  year, 
  userNatalChart, 
  savedCharts 
}: { 
  year: number; 
  userNatalChart: NatalChart | null; 
  savedCharts: NatalChart[];
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState<'collective' | 'personal'>('collective');
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedChart, setSelectedChart] = useState<string>('user');

  // Use 2026 database if applicable, otherwise calculate dynamically
  const monthData = useMemo(() => {
    if (selectedYear === 2026) {
      return get2026MonthData(currentMonth);
    }
    // Fall back to dynamic calculation for other years
    const electionalDays = calculateElectionalDays(selectedYear);
    return getMonthElectionalDays(selectedYear, currentMonth, electionalDays);
  }, [selectedYear, currentMonth]);

  // Personal activations
  const activeChart = useMemo(() => {
    if (selectedChart === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChart) || null;
  }, [selectedChart, userNatalChart, savedCharts]);

  const personalActivations = useMemo(() => {
    if (!activeChart) return [];
    return calculatePersonalActivations(selectedYear, currentMonth, activeChart);
  }, [selectedYear, currentMonth, activeChart]);

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, currentMonth, 1).getDay();

    const grid: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(day);
    }
    return grid;
  }, [selectedYear, currentMonth]);

  // Get day data from 2026 database or dynamic
  const getDayData = (day: number): ElectionalDayData | ElectionalDay | null => {
    if (selectedYear === 2026) {
      const dateStr = `2026-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const avoidDay = DATES_TO_AVOID_2026.find(d => d.date === dateStr);
      if (avoidDay) return avoidDay;
      const bestDay = BEST_DAYS_2026.find(d => d.date === dateStr);
      if (bestDay) return bestDay;
      return null;
    }
    // Dynamic calculation
    const date = new Date(selectedYear, currentMonth, day);
    const electionalDays = calculateElectionalDays(selectedYear);
    return electionalDays.find(d => 
      d.date.getDate() === day && 
      d.date.getMonth() === currentMonth
    ) || null;
  };

  const getDayActivations = (day: number): PersonalActivation[] => {
    return personalActivations.filter(a => a.date.getDate() === day);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return today.getFullYear() === selectedYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day;
  };

  const allCharts = [
    ...(userNatalChart ? [{ id: 'user', name: `★ ${userNatalChart.name}` }] : []),
    ...[...savedCharts].sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ id: c.id, name: c.name }))
  ];

  const getRating = (data: ElectionalDayData | ElectionalDay | null): string | undefined => {
    if (!data) return undefined;
    if ('warning' in data && data.warning) return data.warning;
    if ('rating' in data) return data.rating;
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
              <option key={y} value={y}>{y} {y === 2026 ? '(Enhanced Data)' : ''}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('collective')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
              viewMode === 'collective'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={16} />
            For Everyone
          </button>

          <button
            onClick={() => setViewMode('personal')}
            disabled={allCharts.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
              viewMode === 'personal'
                ? 'bg-primary text-primary-foreground'
                : allCharts.length > 0
                  ? 'bg-secondary text-muted-foreground hover:text-foreground'
                  : 'bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
            }`}
          >
            <User size={16} />
            My Chart {allCharts.length === 0 && '(Upload Chart)'}
          </button>

          {viewMode === 'personal' && allCharts.length > 0 && (
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
            >
              {allCharts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Calendar Key:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(RATING_CONFIG).map(([rating, config]) => (
            <div
              key={rating}
              className={`flex items-center gap-2 p-3 ${config.bg} border-2 ${config.border} rounded-lg`}
            >
              <span className="text-lg">{config.icon}</span>
              <div>
                <div className={`text-sm font-semibold ${config.text}`}>{config.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{config.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentMonth(m => m > 0 ? m - 1 : 11)}
          className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-wrap justify-center gap-2">
          {MONTHS.map((month, index) => (
            <button
              key={month}
              onClick={() => setCurrentMonth(index)}
              className={`px-3 py-2 text-xs font-semibold rounded-sm transition-all ${
                currentMonth === index
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border hover:border-primary'
              }`}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentMonth(m => m < 11 ? m + 1 : 0)}
          className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <TooltipProvider>
        <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-serif mb-4 text-center">
            {MONTHS[currentMonth]} {selectedYear}
          </h2>

          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarGrid.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2" />;
              }

              const dayData = viewMode === 'collective' ? getDayData(day) : null;
              const activations = viewMode === 'personal' ? getDayActivations(day) : [];
              const topActivation = activations.length > 0
                ? activations.reduce((best, curr) =>
                  curr.intensity === 'HIGH' ? curr : best, activations[0])
                : null;

              const rating = getRating(dayData) || topActivation?.rating;
              const config = rating ? RATING_CONFIG[rating] : null;
              const today = isToday(day);

              return (
                <Tooltip key={day}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative p-2 min-h-[70px] rounded-lg cursor-pointer transition-all
                        ${config ? `${config.bg} border-2 ${config.border}` : 'bg-card border border-border'}
                        ${today ? 'ring-2 ring-primary ring-offset-2' : ''}
                        hover:shadow-md
                      `}
                    >
                      <div className={`text-sm font-semibold ${today ? 'text-primary' : 'text-foreground'}`}>
                        {day}
                      </div>

                      {config && (
                        <div className="absolute bottom-2 right-2 text-lg">
                          {config.icon}
                        </div>
                      )}

                      {viewMode === 'personal' && activations.length > 0 && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full">
                          {activations.length}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>

                  {(dayData || activations.length > 0) && (
                    <TooltipContent side="bottom" className="max-w-xs p-3">
                      {viewMode === 'collective' && dayData && (
                        <div>
                          <div className="font-bold mb-1">{dayData.reason}</div>
                          <div className="text-sm text-muted-foreground">
                            {dayData.why}
                          </div>
                          {'power' in dayData && dayData.power && (
                            <div className="text-sm text-green-600 mt-1 font-medium">
                              ✨ {dayData.power}
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === 'personal' && activations.length > 0 && (
                        <div className="space-y-2">
                          {activations.slice(0, 3).map((a, i) => (
                            <div key={i} className="text-sm">
                              <span className={`font-medium ${
                                a.intensity === 'HIGH' ? 'text-red-600' :
                                  a.intensity === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                              }`}>
                                {a.intensity}
                              </span>
                              : {a.description}
                            </div>
                          ))}
                          {activations.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{activations.length - 3} more...
                            </div>
                          )}
                        </div>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>
      </TooltipProvider>

      {/* Detailed List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif border-b border-border pb-2">
          {viewMode === 'collective'
            ? `Special Days in ${MONTHS[currentMonth]}`
            : `Personal Activations in ${MONTHS[currentMonth]}`}
        </h3>

        {viewMode === 'collective' ? (
          monthData.length > 0 ? (
            <div className="grid gap-4">
              {monthData.map((day, index) => {
                const rating = ('warning' in day && day.warning) ? day.warning : day.rating || 'GREEN';
                const config = RATING_CONFIG[rating];
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">
                            {new Date(('date' in day && typeof day.date === 'string') ? day.date : (day as ElectionalDay).date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            rating === 'RED' ? 'bg-red-200 text-red-800' :
                              rating === 'YELLOW' ? 'bg-yellow-200 text-yellow-800' :
                                rating === 'GREEN' ? 'bg-green-200 text-green-800' :
                                  rating === 'BLUE' ? 'bg-blue-200 text-blue-800' :
                                    'bg-purple-200 text-purple-800'
                          }`}>
                            {config.label}
                          </span>
                        </div>

                        <div className="text-base font-medium text-foreground mb-2">
                          {day.reason}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {day.why}
                        </p>

                        {day.avoid && day.avoid.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold uppercase text-red-600">❌ Avoid:</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {day.avoid.join(', ')}
                            </span>
                          </div>
                        )}

                        {day.best_for && day.best_for.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold uppercase text-green-600">✓ Best For:</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {day.best_for.join(', ')}
                            </span>
                          </div>
                        )}

                        {'bestFor' in day && day.bestFor && day.bestFor.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold uppercase text-green-600">✓ Best For:</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {day.bestFor.join(', ')}
                            </span>
                          </div>
                        )}

                        {day.workaround && (
                          <div className="mt-2 p-2 bg-background/50 rounded text-sm">
                            <span className="font-medium">💡 Workaround:</span> {day.workaround}
                          </div>
                        )}

                        {day.power && (
                          <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm text-green-800 dark:text-green-200 font-medium">
                            ✨ {day.power}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No major electional events this month. Generally safe for planning!
            </div>
          )
        ) : (
          personalActivations.length > 0 ? (
            <div className="grid gap-3">
              {personalActivations.map((activation, index) => {
                const config = RATING_CONFIG[activation.rating];
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {activation.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {activation.description}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${
                          activation.intensity === 'HIGH' ? 'text-red-600' :
                            activation.intensity === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          Intensity: {activation.intensity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No personal activations found for this month.</p>
              <p className="text-sm mt-1">Make sure you have a natal chart uploaded with planet positions.</p>
            </div>
          )
        )}
      </div>

      {/* Biorhythm Forecast Section - Always visible with built-in chart selector */}
      <div className="mt-8">
        <h4 className="text-lg font-serif mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          Personal Biorhythm Forecast
        </h4>
        {activeChart ? (
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
            <BiorhythmForecast 
              birthDate={parseLocalDate(activeChart.birthDate)}
              startDate={new Date(selectedYear, currentMonth, 1)}
              days={35}
              savedCharts={[
                ...(userNatalChart ? [{ id: 'user', name: `★ ${userNatalChart.name}`, birthDate: userNatalChart.birthDate }] : []),
                ...[...savedCharts].sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ id: c.id, name: c.name, birthDate: c.birthDate }))
              ]}
              selectedChartId={selectedChart}
              onChartChange={(id) => setSelectedChart(id)}
            />
          </Suspense>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-border bg-secondary/20">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Biorhythm Forecast Available</p>
                <p className="text-xs text-muted-foreground">
                  Select a chart above to see your 30-day biorhythm forecast with romance compatibility.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// (InsightsSection removed – components merged into RightNowSection)

// Venus Star Point Section
const VenusStarSection = ({
  userNatalChart,
  savedCharts,
  selectedChart,
  setSelectedChart,
  currentDate,
}: {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChart: string;
  setSelectedChart: (id: string) => void;
  currentDate: Date;
}) => {
  const activeChart = useMemo(() => {
    if (selectedChart === 'general') return null;
    if (selectedChart === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChart) || null;
  }, [selectedChart, userNatalChart, savedCharts]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-serif mb-2">♀⭐ Venus Star Point Tracker</h3>
        <p className="text-sm text-muted-foreground">
          Track the Venus-Sun cycle, your personal Venus connections, and journal prompts for each phase.
        </p>
      </div>

      {/* Chart Selector for personalization */}
      <div className="mb-6">
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedChart}
          onSelect={setSelectedChart}
          label="Personalize to"
        />
      </div>

      <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <VenusStarPointTrackerComp date={currentDate} activeChart={activeChart} />
      </Suspense>
    </div>
  );
};

// Main Timing View Component
export const TimingView = ({
  userNatalChart,
  savedCharts,
  selectedChartForTiming,
  setSelectedChartForTiming,
  currentDate
}: TimingViewProps) => {
  const [activeSection, setActiveSection] = useState<TimingSection>('now');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="text-primary" size={28} />
        <h2 className="font-serif text-2xl font-light text-foreground">Timing & Best Days</h2>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-4">
        <button
          onClick={() => setActiveSection('now')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${
            activeSection === 'now'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
        >
          <Clock size={18} />
          Right Now
        </button>
        <button
          onClick={() => setActiveSection('today')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${
            activeSection === 'today'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
        >
          <Calendar size={18} />
          Today
        </button>
        <button
          onClick={() => setActiveSection('plan')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${
            activeSection === 'plan'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
        >
          <CalendarCheck size={18} />
          Plan Ahead
        </button>
        <button
          onClick={() => setActiveSection('venus')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${
            activeSection === 'venus'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
        >
          <span className="text-lg">♀</span>
          Venus Star
        </button>
      </div>

      {/* Section Content */}
      <div className="animate-fade-in">
        {activeSection === 'now' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif mb-2">⏰ What's Good Right Now</h3>
              <p className="text-sm text-muted-foreground">
                Live timing information for immediate decisions. Updated every minute.
              </p>
            </div>
            <RightNowSection 
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
              selectedChart={selectedChartForTiming}
              setSelectedChart={setSelectedChartForTiming}
            />
          </div>
        )}


        {activeSection === 'today' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif mb-2">📅 Today's Cosmic Weather</h3>
              <p className="text-sm text-muted-foreground">
                All aspects and transits happening today with interpretations.
              </p>
            </div>
            <TodaySection 
              date={new Date()} 
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
              selectedChart={selectedChartForTiming}
              setSelectedChart={setSelectedChartForTiming}
            />
          </div>
        )}

        {activeSection === 'plan' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif mb-2">🗓️ Plan Ahead - Electional Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Days to avoid and best days for major life events. Plan weddings, launches, and big decisions.
              </p>
            </div>
            <PlanAheadSection
              year={currentDate.getFullYear()}
              userNatalChart={userNatalChart}
              savedCharts={savedCharts}
            />
          </div>
        )}

        {activeSection === 'venus' && (
          <VenusStarSection
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChart={selectedChartForTiming}
            setSelectedChart={setSelectedChartForTiming}
            currentDate={currentDate}
          />
        )}
      </div>
    </div>
  );
};
