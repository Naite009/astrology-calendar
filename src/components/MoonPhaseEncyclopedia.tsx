import { useState, useMemo } from 'react';
import { ChartSelector } from './ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateBirthMoonPhase, BirthMoonPhase } from '@/lib/birthConditions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  const togglePhase = (phase: BirthMoonPhase) => {
    setExpandedPhase(prev => prev === phase ? null : phase);
  };

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

      {/* 8 Phase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PHASE_ORDER.map(({ phase, degreeRange, minDeg, maxDeg }) => {
          const isNatal = natalPhaseResult?.phase === phase;
          const isExpanded = expandedPhase === phase;
          const phaseData = calculateBirthMoonPhase('Aries', 0, 'Aries', minDeg + 10); // just to get static data

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

                    {/* Position within phase for natal */}
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
