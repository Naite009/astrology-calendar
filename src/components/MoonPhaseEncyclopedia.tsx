import { useState, useMemo } from 'react';
import { ChartSelector } from './ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateBirthMoonPhase, BirthMoonPhase } from '@/lib/birthConditions';
import { calculateSecondaryProgressions, getProgressedMoonInfo } from '@/lib/secondaryProgressions';
import { getMoonPhase, getPlanetaryPositions } from '@/lib/astrology';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, MapPin, Moon } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface MoonPhaseEncyclopediaProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

const PHASE_ORDER: { phase: BirthMoonPhase; degreeRange: string; minDeg: number; maxDeg: number }[] = [
  { phase: 'New Moon', degreeRange: '0° – 45°', minDeg: 0, maxDeg: 45 },
  { phase: 'Waxing Crescent', degreeRange: '45° – 90°', minDeg: 45, maxDeg: 90 },
  { phase: 'First Quarter', degreeRange: '90° – 135°', minDeg: 90, maxDeg: 135 },
  { phase: 'Waxing Gibbous', degreeRange: '135° – 180°', minDeg: 135, maxDeg: 180 },
  { phase: 'Full Moon', degreeRange: '180° – 225°', minDeg: 180, maxDeg: 225 },
  { phase: 'Waning Gibbous', degreeRange: '225° – 270°', minDeg: 225, maxDeg: 270 },
  { phase: 'Last Quarter', degreeRange: '270° – 315°', minDeg: 270, maxDeg: 315 },
  { phase: 'Balsamic', degreeRange: '315° – 360°', minDeg: 315, maxDeg: 360 },
];

function getPositionLabel(degree: number, minDeg: number, maxDeg: number): string {
  const range = maxDeg - minDeg;
  const pos = degree - minDeg;
  const pct = pos / range;
  if (pct < 0.33) return 'early';
  if (pct < 0.66) return 'middle';
  return 'late';
}

const POSITION_MEANINGS: Record<string, string> = {
  early: 'You\'re in the opening stage of this phase—its themes are just beginning to emerge in your life. You may feel the qualities intensely but are still learning how to express them.',
  middle: 'You\'re at the heart of this phase—fully immersed in its lessons and gifts. This is where the phase energy is most potent and natural for you.',
  late: 'You\'re in the mature stage of this phase—preparing to transition into the next. You\'ve integrated much of this phase\'s wisdom and may feel pulled toward what comes next.',
};

const JOURNEY_STAGES: Record<string, { q1: string; q2: string; q3: string; q4: string }> = {
  Aries: { q1: "The spark ignites — restless, ready to move. New impulses arrive before you can name them.", q2: "The fire burns steady. You've found what you're fighting for.", q3: "Your courage has been tested. Others see your strength now.", q4: "The warrior prepares to rest. A quieter voice asks what to BUILD. Taurus beckons." },
  Taurus: { q1: "Everything slows down — and it's a relief. You crave comfort, stability, beauty.", q2: "You're settling in. Financial security matters. Patience comes naturally.", q3: "What you planted is growing. Sensual pleasure feeds your soul deeply.", q4: "The garden is full but curiosity stirs. Gemini energy approaches." },
  Gemini: { q1: "Your mind wakes up. You want to read everything, talk to everyone.", q2: "Connecting dots, building networks. Writing or teaching may call.", q3: "Information overload possible. Depth vs. breadth becomes the lesson.", q4: "The social butterfly looks homeward, craving something deeper. Cancer stirs." },
  Cancer: { q1: "You turn inward. Home, family, roots become everything. Old memories surface.", q2: "You're nesting. Nurturing brings deep satisfaction.", q3: "Emotional depth is your superpower. You understand what 'home' really means.", q4: "The cocoon cracks. Something wants to SHINE. Leo approaches." },
  Leo: { q1: "You step into the light. Romance, creativity, play — your heart demands joy.", q2: "Full bloom. Creative projects flow. You're learning to receive applause.", q3: "Confidence is earned. You know what makes you unique.", q4: "The spotlight dims gently. A quieter voice asks: how can I be useful? Virgo calls." },
  Virgo: { q1: "Time to organize. Health routines and daily improvements call.", q2: "You've found your rhythm. Being of service brings satisfaction.", q3: "Perfectionism may peak. Be gentle. Your skills are honed.", q4: "You feel the pull toward partnership, balance. Libra approaches." },
  Libra: { q1: "Relationships become the mirror. Beauty, harmony, and fairness matter.", q2: "Learning the dance of compromise. Aesthetics nourish your soul.", q3: "Diplomatic skills peak. You've learned when to give and hold.", q4: "Surface harmony isn't enough. Something deeper calls. Scorpio's waters pull." },
  Scorpio: { q1: "The surface breaks. Emotions are raw, powerful, honest.", q2: "You're transforming. Old patterns crumble. Intimacy deepens.", q3: "You've faced darkness and found treasure. Psychological insight is profound.", q4: "The phoenix rises. You crave meaning, adventure. Sagittarius points to the horizon." },
  Sagittarius: { q1: "Freedom! You need space. Travel, philosophy, higher learning expand your spirit.", q2: "Exploring physically, mentally, spiritually. Beliefs are evolving.", q3: "Wisdom gathered. The quest shifts from outer adventure to inner meaning.", q4: "Adventure winds down. You want to BUILD something. Capricorn's mountain appears." },
  Capricorn: { q1: "You get serious. Career ambitions crystallize. Ready for hard work.", q2: "You're climbing. Discipline comes naturally. Building a legacy.", q3: "Authority becomes you. People look to you for guidance.", q4: "The summit is visible. Loneliness makes you crave connection. Aquarius calls." },
  Aquarius: { q1: "You break free. Old rules feel stifling. Community and innovation excite.", q2: "Your tribe finds you. Friendships based on shared ideals matter.", q3: "You've found your cause. You're the visionary now.", q4: "The mind has gone far. Something softer, more spiritual calls. Pisces awaits." },
  Pisces: { q1: "The veil thins. Dreams are vivid. Intuition is sharp. Boundaries blur.", q2: "Swimming in the collective unconscious. Art and spirituality feed your soul.", q3: "Spiritual depth is profound. Forgiveness becomes the great gift.", q4: "The cycle completes. Old identities release. A new beginning forms. Aries is coming." },
};

export const MoonPhaseEncyclopedia = ({ userNatalChart, savedCharts }: MoonPhaseEncyclopediaProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string>(userNatalChart ? 'user' : '');
  const [expandedPhase, setExpandedPhase] = useState<BirthMoonPhase | null>(null);

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    charts.push(...savedCharts);
    return charts;
  }, [userNatalChart, savedCharts]);

  const selectedChart = useMemo(() => {
    if (selectedChartId === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartId) || null;
  }, [selectedChartId, userNatalChart, savedCharts]);

  const natalPhaseResult = useMemo(() => {
    if (!selectedChart) return null;
    const sun = selectedChart.planets.Sun;
    const moon = selectedChart.planets.Moon;
    if (!sun || !moon) return null;

    const result = calculateBirthMoonPhase(sun.sign, sun.degree, moon.sign, moon.degree);

    // Calculate raw separation degree
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const sunAbs = signs.indexOf(sun.sign) * 30 + sun.degree;
    const moonAbs = signs.indexOf(moon.sign) * 30 + moon.degree;
    let separation = moonAbs - sunAbs;
    if (separation < 0) separation += 360;

    return { ...result, separation: Math.round(separation * 10) / 10 };
  }, [selectedChart]);

  // Progressed Moon calculation
  const progressedMoonInfo = useMemo(() => {
    if (!selectedChart) return null;
    try {
      const progressions = calculateSecondaryProgressions(selectedChart, new Date());
      if (!progressions) return null;
      return getProgressedMoonInfo(progressions, selectedChart);
    } catch {
      return null;
    }
  }, [selectedChart]);

  // Journey milestones
  const journeyMilestones = useMemo(() => {
    if (!progressedMoonInfo) return null;
    const currentDeg = progressedMoonInfo.exactDegree;
    const monthsPerDegree = 1 / 1.08;
    const now = new Date();
    const milestones = [
      { deg: 0, label: 'Entry — 0°', stage: 'entry' as const },
      { deg: 7.5, label: "Quarter — 7°30'", stage: 'q1' as const },
      { deg: 15, label: 'Midpoint — 15°', stage: 'q2' as const },
      { deg: 22.5, label: "Three-Quarter — 22°30'", stage: 'q3' as const },
      { deg: 30, label: `Exit → ${progressedMoonInfo.nextSign}`, stage: 'q4' as const },
    ];
    return milestones.map(m => {
      const monthsFromNow = (m.deg - currentDeg) * monthsPerDegree;
      const date = addMonths(now, Math.round(monthsFromNow));
      const isPast = m.deg <= currentDeg;
      const isCurrent = (currentDeg >= (m.deg - 3.75) && currentDeg < (m.deg + 3.75));
      return { ...m, date, isPast, isCurrent, formattedDate: format(date, 'MMM d, yyyy') };
    });
  }, [progressedMoonInfo]);

  const togglePhase = (phase: BirthMoonPhase) => {
    setExpandedPhase(prev => prev === phase ? null : phase);
  };

  const currentQuarter = progressedMoonInfo
    ? (progressedMoonInfo.exactDegree < 7.5 ? 'q1' : progressedMoonInfo.exactDegree < 15 ? 'q2' : progressedMoonInfo.exactDegree < 22.5 ? 'q3' : 'q4')
    : null;

  // Today's transiting moon
  const transitingMoon = useMemo(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    const positions = getPlanetaryPositions(now);
    const moonPos = positions.moon;
    const PHASE_EMOJIS: Record<string, string> = {
      'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓',
      'Waxing Gibbous': '🌔', 'Full Moon': '🌕', 'Waning Gibbous': '🌖',
      'Last Quarter': '🌗', 'Waning Crescent': '🌘', 'Balsamic': '🌘',
    };
    return {
      sign: moonPos?.signName || 'Unknown',
      degree: moonPos?.degree ?? 0,
      minutes: moonPos?.minutes ?? 0,
      phaseName: phase.phaseName,
      emoji: PHASE_EMOJIS[phase.phaseName] || '🌙',
      illumination: phase.illumination,
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Chart Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Show my natal moon phase for:</span>
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedChartId}
          onSelect={setSelectedChartId}
        />
      </div>

      {/* Today's Transiting Moon */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl">{transitingMoon.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                  <Moon size={16} className="text-muted-foreground" />
                  Today's Moon
                </h3>
                <Badge variant="outline" className="text-[10px]">Live</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                <span className="text-foreground font-medium">{transitingMoon.phaseName}</span>
                {' in '}
                <span className="text-foreground font-medium">{transitingMoon.sign}</span>
                {' · '}
                <span className="font-mono text-xs">{transitingMoon.degree}°{transitingMoon.minutes.toString().padStart(2, '0')}'</span>
                {' · '}
                {Math.round(transitingMoon.illumination * 100)}% illuminated
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Natal Result Banner */}
      {natalPhaseResult && selectedChart && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl">{natalPhaseResult.symbol}</span>
              <div>
                <p className="font-serif text-lg text-foreground">
                  {selectedChart.name} — <span className="text-primary font-semibold">{natalPhaseResult.phase}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Sun–Moon separation: <span className="font-mono text-foreground">{natalPhaseResult.separation}°</span>
                  {' · '}{natalPhaseResult.archetype}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progressed Moon Journey Timeline */}
      {progressedMoonInfo && journeyMilestones && selectedChart && (
        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                ☽ Progressed Moon Journey — {progressedMoonInfo.sign}
              </h3>
              <Badge variant="outline" className="font-mono text-xs">
                {Math.floor(progressedMoonInfo.exactDegree)}°{Math.round((progressedMoonInfo.exactDegree % 1) * 60).toString().padStart(2, '0')}' {progressedMoonInfo.sign}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Your progressed Moon is currently moving through {progressedMoonInfo.sign}, shifting to {progressedMoonInfo.nextSign} in ~{progressedMoonInfo.monthsUntilSignChange} months.
            </p>

            <Separator />

            {/* Timeline */}
            <div className="relative pl-6 space-y-0">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              {journeyMilestones.map((m, i) => {
                const stages = JOURNEY_STAGES[progressedMoonInfo.sign];
                return (
                  <div key={i} className="relative flex items-start gap-3 pb-4">
                    <div className={`absolute left-[-13px] top-1.5 w-3 h-3 rounded-full border-2 ${
                      m.isCurrent ? 'bg-primary border-primary ring-4 ring-primary/20'
                      : m.isPast ? 'bg-muted-foreground/50 border-muted-foreground/50'
                      : 'bg-background border-border'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${m.isCurrent ? 'text-primary' : m.isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {m.label}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{m.formattedDate}</span>
                        {m.isCurrent && <Badge variant="default" className="text-[9px]">YOU ARE HERE</Badge>}
                        {m.isPast && !m.isCurrent && <Badge variant="secondary" className="text-[9px]">Complete</Badge>}
                      </div>
                      {stages && i > 0 && i <= 4 && (
                        <p className={`text-xs mt-1 leading-relaxed ${m.stage === currentQuarter ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {stages[m.stage === 'entry' ? 'q1' : m.stage]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current stage highlight */}
            {currentQuarter && JOURNEY_STAGES[progressedMoonInfo.sign] && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-md">
                <h5 className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                  Where You Are Now — {Math.floor(progressedMoonInfo.exactDegree)}° {progressedMoonInfo.sign}
                </h5>
                <p className="text-sm leading-relaxed">{JOURNEY_STAGES[progressedMoonInfo.sign][currentQuarter]}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8 Phase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PHASE_ORDER.map(({ phase, degreeRange, minDeg, maxDeg }) => {
          const isNatal = natalPhaseResult?.phase === phase;
          const isExpanded = expandedPhase === phase;
          const phaseData = calculateBirthMoonPhase('Aries', 0, 'Aries', minDeg + 10);

          return (
            <Card
              key={phase}
              className={`cursor-pointer transition-all duration-200 hover:border-primary/40 ${
                isNatal ? 'ring-2 ring-primary border-primary/50 bg-primary/5' : ''
              } ${isExpanded ? 'col-span-1 sm:col-span-2 lg:col-span-4' : ''}`}
              onClick={() => togglePhase(phase)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{phaseData.symbol}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-semibold text-foreground">{phase}</h3>
                        {isNatal && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Your Phase
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{degreeRange}</p>
                      <p className="text-xs text-primary/80 italic">{phaseData.archetype}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground mt-1" /> : <ChevronDown size={16} className="text-muted-foreground mt-1" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 text-sm" onClick={e => e.stopPropagation()}>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Soul Purpose</h4>
                      <p className="text-foreground leading-relaxed">{phaseData.soulPurpose}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Expression</h4>
                      <p className="text-foreground leading-relaxed">{phaseData.expression}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Gift</h4>
                        <p className="text-foreground">{phaseData.gift}</p>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Challenge</h4>
                        <p className="text-foreground">{phaseData.challenge}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Life Theme</h4>
                      <p className="text-foreground leading-relaxed">{phaseData.lifeTheme}</p>
                    </div>

                    {isNatal && natalPhaseResult && (
                      <div className="mt-3 p-3 rounded bg-primary/5 border border-primary/20">
                        <h4 className="text-xs uppercase tracking-widest text-primary mb-1">
                          Your Position: {getPositionLabel(natalPhaseResult.separation, minDeg, maxDeg)} {phase}
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed">
                          At {natalPhaseResult.separation}° Sun–Moon separation, you're in the <strong>{getPositionLabel(natalPhaseResult.separation, minDeg, maxDeg)}</strong> portion of this phase.{' '}
                          {POSITION_MEANINGS[getPositionLabel(natalPhaseResult.separation, minDeg, maxDeg)]}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
