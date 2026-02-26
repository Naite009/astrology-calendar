import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, ArrowRight, Clock, Sparkles, AlertCircle, MapPin } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { NatalChart } from '@/hooks/useNatalChart';
import { 
  calculateSecondaryProgressions, 
  getProgressedMoonInfo, 
  findProgressedAspects,
  getProgressedPlanetSymbol,
  formatSignChangeDate,
  SecondaryProgressions,
  ProgressedMoonInfo,
  ProgressedAspect
} from '@/lib/secondaryProgressions';
import {
  calculateSolarArcChart,
  findSolarArcAspects,
  getExactSolarArcAspects,
  getUpcomingSolarArcAspects,
  getSolarArcPlanetSymbol,
  SolarArcChart,
  SolarArcAspect
} from '@/lib/solarArcDirections';
import { getSaturnReturnContext } from '@/lib/houseInterpretations';

interface ProgressionsDisplayProps {
  natalChart: NatalChart;
  age: number;
}

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

// Journey milestone descriptions for each quarter of a sign
const JOURNEY_STAGES: Record<string, { q1: string; q2: string; q3: string; q4: string }> = {
  Aries: {
    q1: "The spark ignites. You feel restless, impatient, ready to move. New impulses arrive before you can name them. You act first, think later — and that's exactly right for now.",
    q2: "The fire burns steady. You've found what you're fighting for. Independence feels natural, not reactive. You're learning to assert without apologizing.",
    q3: "Your courage has been tested. You know what's worth the fight and what isn't. Others start to see your strength. Leadership opportunities appear.",
    q4: "The warrior prepares to rest. You've claimed your ground. A quieter voice begins to whisper about what you want to BUILD with all this energy. Taurus beckons.",
  },
  Taurus: {
    q1: "After the fire of Aries, everything slows down — and it's a relief. You crave comfort, stability, simplicity. Your body wants rest, good food, beauty.",
    q2: "You're settling in. Financial security matters more. You're investing — in yourself, your home, your values. Patience comes more naturally now.",
    q3: "What you've planted is growing. You can see the results of your patience. Sensual pleasure — music, nature, touch — feeds your soul deeply.",
    q4: "The garden is full but you're getting restless. Curiosity stirs. You've built the foundation; now your mind wants to explore. Gemini energy approaches.",
  },
  Gemini: {
    q1: "Your mind wakes up. Suddenly you want to read everything, talk to everyone, learn something new. Social energy explodes. Short trips feel necessary.",
    q2: "You're connecting dots, making links, building networks. Writing or teaching may call you. Your nervous system is buzzing — in a good way, mostly.",
    q3: "Information overload is possible. You've absorbed a lot — now comes the challenge of depth vs. breadth. Focus becomes the lesson.",
    q4: "The social butterfly looks homeward. All this mental activity has left you craving something deeper, more emotional, more rooted. Cancer energy stirs.",
  },
  Cancer: {
    q1: "You turn inward. Home, family, roots — these become everything. Old memories surface. You may cry more easily, and that's healthy. The shell is building.",
    q2: "You're nesting. Home improvements, family connections, cooking, nurturing — these bring deep satisfaction. Your inner mother/father activates.",
    q3: "Emotional depth has become your superpower. You understand what 'home' really means — not just a place but a feeling. Ancestry may call to you.",
    q4: "The cocoon begins to crack. You've done the deep emotional work; now something in you wants to SHINE. Creativity stirs. Leo approaches.",
  },
  Leo: {
    q1: "You step into the light. After Cancer's inward journey, you need to be SEEN. Romance, creativity, play — your heart demands joy.",
    q2: "You're in full bloom. Creative projects flow. Romance thrives. Children (your own or your inner child) bring delight. You're learning to receive applause.",
    q3: "Your confidence is earned now. You know what makes you unique and you're no longer shy about it. Generosity flows naturally from fullness.",
    q4: "The spotlight dims gently. You've had your season of joy; now a quieter voice asks: how can I be USEFUL? Virgo's practical wisdom calls.",
  },
  Virgo: {
    q1: "The party's over and you're organizing the cleanup — and surprisingly, it feels good. Health routines, work habits, and daily improvements call to you.",
    q2: "You've found your rhythm. Being of service brings deep satisfaction. Your analytical mind is sharp. You notice what needs fixing — and you fix it.",
    q3: "Perfectionism may peak. Be gentle with yourself. The gift of Virgo is discernment, not self-criticism. Your skills are honed and others notice.",
    q4: "You've improved everything you can on your own. Now you feel the pull toward PARTNERSHIP, toward balance, toward another person. Libra approaches.",
  },
  Libra: {
    q1: "Relationships become the mirror. After Virgo's self-improvement, you need someone to share it with. Beauty, harmony, and fairness matter deeply.",
    q2: "You're learning the dance of compromise. Partnership skills deepen. Art, design, and aesthetics nourish your soul. You see beauty everywhere.",
    q3: "The scales tip and rebalance. You've learned when to give and when to hold. Justice feels personal. Your diplomatic skills are at their peak.",
    q4: "Surface harmony isn't enough anymore. Something deeper calls — intensity, truth, transformation. Scorpio's waters begin to pull you under.",
  },
  Scorpio: {
    q1: "The surface breaks. After Libra's lightness, you plunge into depth. Emotions are raw, powerful, and honest. Power dynamics reveal themselves.",
    q2: "You're transforming. Old emotional patterns die — literally crumbling. Intimacy deepens. Trust becomes the central question. Therapy is powerful now.",
    q3: "You've faced the darkness and found treasure there. Psychological insight is profound. You can see through masks. Your power comes from authenticity.",
    q4: "The phoenix rises. The heaviness lifts. You crave MEANING, adventure, philosophy. Sagittarius' arrow points toward the horizon.",
  },
  Sagittarius: {
    q1: "Freedom! After Scorpio's intensity, you need SPACE. Travel, philosophy, higher learning — your spirit expands. Optimism returns like sunlight.",
    q2: "You're exploring — physically, mentally, spiritually. Foreign cultures or ideas excite you. Teaching or publishing may call. Your beliefs are evolving.",
    q3: "You've seen enough to have wisdom. The quest shifts from outer adventure to inner meaning. Faith is tested and deepened. You become the teacher.",
    q4: "The adventure winds down. You've gathered wisdom; now you want to BUILD something with it. Ambition stirs. Capricorn's mountain appears on the horizon.",
  },
  Capricorn: {
    q1: "You get serious. After Sagittarius' wandering, you need STRUCTURE. Career ambitions crystallize. You're ready to do the hard work.",
    q2: "You're climbing. Discipline comes naturally. Professional achievements bring deep satisfaction. You're building a legacy, brick by brick.",
    q3: "Authority becomes you. People look to you for guidance. The weight of responsibility is real but you carry it with dignity. Maturity is your gift.",
    q4: "The summit is reached or at least visible. But loneliness at the top makes you crave CONNECTION — not professional, but humanitarian. Aquarius calls.",
  },
  Aquarius: {
    q1: "You break free. After Capricorn's structure, you need INNOVATION. Old rules feel stifling. Community, technology, and progressive ideas excite you.",
    q2: "Your tribe finds you. Friendships based on shared ideals matter more than status. You're thinking about the future — for everyone, not just yourself.",
    q3: "You've found your cause. Humanitarian impulses are strong. You're the visionary now — seeing what others can't. Detachment is both gift and challenge.",
    q4: "The mind has gone as far as it can. Something softer, more spiritual, more surrendered calls from the deep. Pisces' ocean awaits.",
  },
  Pisces: {
    q1: "The veil thins. After Aquarius' mental energy, you dissolve into feeling. Dreams are vivid. Intuition is sharp. Boundaries blur — beautifully and dangerously.",
    q2: "You're swimming in the collective unconscious. Art, music, and spirituality feed your soul like nothing else. Compassion overflows. You feel everything.",
    q3: "Spiritual depth is profound. You may need solitude to process the ocean of feelings. Forgiveness — of self and others — becomes the great gift.",
    q4: "The cycle completes. You're releasing everything — old identities, old wounds, old stories. The seed of a completely new beginning forms in the darkness. Aries is coming.",
  },
};

// Progressed Moon Journey Timeline Component
const ProgressedMoonJourney: React.FC<{ moonInfo: ProgressedMoonInfo }> = ({ moonInfo }) => {
  const journey = useMemo(() => {
    const currentDeg = moonInfo.exactDegree;
    const monthsPerDegree = 1 / 1.08;
    const now = new Date();
    
    const milestones = [
      { deg: 0, label: 'Entry — 0°', stage: 'entry' as const },
      { deg: 7.5, label: 'Quarter — 7°30\'', stage: 'q1' as const },
      { deg: 15, label: 'Midpoint — 15°', stage: 'q2' as const },
      { deg: 22.5, label: 'Three-Quarter — 22°30\'', stage: 'q3' as const },
      { deg: 30, label: 'Exit → ' + moonInfo.nextSign, stage: 'q4' as const },
    ];
    
    return milestones.map(m => {
      const monthsFromNow = (m.deg - currentDeg) * monthsPerDegree;
      const date = addMonths(now, Math.round(monthsFromNow));
      const isPast = m.deg <= currentDeg;
      const isCurrent = (currentDeg >= (m.deg - 3.75) && currentDeg < (m.deg + 3.75));
      
      return { ...m, date, isPast, isCurrent, formattedDate: format(date, 'MMM yyyy') };
    });
  }, [moonInfo]);

  const stages = JOURNEY_STAGES[moonInfo.sign];
  const currentQuarter = moonInfo.exactDegree < 7.5 ? 'q1' 
    : moonInfo.exactDegree < 15 ? 'q2' 
    : moonInfo.exactDegree < 22.5 ? 'q3' 
    : 'q4';

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <MapPin size={14} />
        Your Journey Through {moonInfo.sign} — Timeline
      </h4>
      
      <div className="relative pl-6 space-y-0">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
        
        {journey.map((milestone, i) => (
          <div key={i} className="relative flex items-start gap-3 pb-4">
            <div className={`absolute left-[-13px] top-1.5 w-3 h-3 rounded-full border-2 ${
              milestone.isCurrent 
                ? 'bg-primary border-primary ring-4 ring-primary/20' 
                : milestone.isPast 
                  ? 'bg-muted-foreground/50 border-muted-foreground/50' 
                  : 'bg-background border-border'
            }`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${milestone.isCurrent ? 'text-primary' : milestone.isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {milestone.label}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{milestone.formattedDate}</span>
                {milestone.isCurrent && <Badge variant="default" className="text-[9px]">YOU ARE HERE</Badge>}
                {milestone.isPast && !milestone.isCurrent && <Badge variant="secondary" className="text-[9px]">Complete</Badge>}
              </div>
              
              {stages && i > 0 && i <= 4 && (
                <p className={`text-xs mt-1 leading-relaxed ${milestone.stage === currentQuarter ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stages[milestone.stage === 'entry' ? 'q1' : milestone.stage]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {stages && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-md">
          <h5 className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
            Where You Are Now — {Math.floor(moonInfo.exactDegree)}° {moonInfo.sign}
          </h5>
          <p className="text-sm leading-relaxed">{stages[currentQuarter]}</p>
        </div>
      )}
    </div>
  );
};

export const ProgressionsDisplay: React.FC<ProgressionsDisplayProps> = ({
  natalChart,
  age
}) => {
  // Calculate current date from age and birthDate
  const currentDate = useMemo(() => {
    if (!natalChart?.birthDate) return new Date();
    const [year, month, day] = natalChart.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const targetDate = new Date(birthDate);
    targetDate.setFullYear(birthDate.getFullYear() + age);
    return targetDate;
  }, [natalChart?.birthDate, age]);

  // Secondary Progressions
  const progressions = useMemo(() => {
    if (!natalChart) return null;
    return calculateSecondaryProgressions(natalChart, currentDate);
  }, [natalChart, currentDate]);

  const progressedMoonInfo = useMemo(() => {
    if (!progressions || !natalChart) return null;
    return getProgressedMoonInfo(progressions, natalChart);
  }, [progressions, natalChart]);

  const progressedAspects = useMemo(() => {
    if (!progressions || !natalChart) return [];
    return findProgressedAspects(progressions, natalChart);
  }, [progressions, natalChart]);

  // Solar Arc Directions
  const solarArcChart = useMemo(() => {
    if (!natalChart) return null;
    return calculateSolarArcChart(natalChart, currentDate);
  }, [natalChart, currentDate]);

  const solarArcAspects = useMemo(() => {
    if (!solarArcChart || !natalChart) return [];
    return findSolarArcAspects(solarArcChart, natalChart);
  }, [solarArcChart, natalChart]);

  const exactSolarArcAspects = useMemo(() => 
    getExactSolarArcAspects(solarArcAspects), [solarArcAspects]);
    
  const upcomingSolarArcAspects = useMemo(() => 
    getUpcomingSolarArcAspects(solarArcAspects), [solarArcAspects]);

  // Saturn Return context
  const saturnContext = useMemo(() => getSaturnReturnContext(age), [age]);

  if (!progressions && !solarArcChart) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Unable to calculate progressions. Check birth data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saturn Return Alert */}
      {saturnContext && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
              <AlertCircle size={16} />
              {saturnContext.phase}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{saturnContext.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Progressed Moon — THE MOST IMPORTANT */}
      {progressedMoonInfo && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon size={16} className="text-primary" />
              Progressed Moon — Your Emotional Weather
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Position */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl">{SIGN_SYMBOLS[progressedMoonInfo.sign]}</div>
                <div className="text-sm font-medium mt-1">
                  {progressedMoonInfo.exactDegree.toFixed(1)}° {progressedMoonInfo.sign}
                </div>
                {progressedMoonInfo.house && (
                  <div className="text-xs text-muted-foreground">
                    House {progressedMoonInfo.house}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <Badge variant={progressedMoonInfo.phase === 'Waxing' ? 'default' : 'secondary'}>
                  {progressedMoonInfo.detailedPhase.phaseName}
                </Badge>
                <p className="text-sm mt-2">{progressedMoonInfo.detailedPhase.description}</p>
              </div>
            </div>

            <Separator />

            {/* Detailed Phase Interpretation */}
            <div className="bg-primary/5 p-4 rounded-md space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-primary">
                {progressedMoonInfo.detailedPhase.phaseName} Life Theme
              </h4>
              <p className="text-sm leading-relaxed">{progressedMoonInfo.detailedPhase.lifeTheme}</p>
              <p className="text-xs text-muted-foreground">{progressedMoonInfo.detailedPhase.timing}</p>
            </div>

            {/* Client Summary — FOR READINGS */}
            {progressedMoonInfo.signMeaning?.clientSummary && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-md">
                <h4 className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
                  📋 What to Tell the Client
                </h4>
                <p className="text-sm leading-relaxed italic">{progressedMoonInfo.signMeaning.clientSummary}</p>
              </div>
            )}

            {/* Full Sign Description */}
            {progressedMoonInfo.signMeaning?.fullDescription && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Progressed ☽ in {progressedMoonInfo.sign} — Full Description
                </h4>
                <p className="text-sm leading-relaxed">{progressedMoonInfo.signMeaning.fullDescription}</p>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {progressedMoonInfo.signMeaning?.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ JOURNEY TIMELINE — Milestone dates through this sign ═══ */}
            <Separator />
            <ProgressedMoonJourney moonInfo={progressedMoonInfo} />
            {progressedMoonInfo.house && progressedMoonInfo.houseMeaning && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Currently Activating House {progressedMoonInfo.house}: {progressedMoonInfo.houseMeaning.short}
                  </h4>
                  <p className="text-sm mb-3">{progressedMoonInfo.houseMeaning.themes}</p>
                  
                  {/* Client Feel for House */}
                  {'clientFeel' in progressedMoonInfo.houseMeaning && progressedMoonInfo.houseMeaning.clientFeel && (
                    <div className="bg-secondary/50 p-3 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-1">How This Feels:</p>
                      <p className="text-sm leading-relaxed">{progressedMoonInfo.houseMeaning.clientFeel}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* HOUSE CHANGE — Often more immediately felt than sign change */}
            {progressedMoonInfo.houseChange.monthsUntilHouseChange !== null && 
             progressedMoonInfo.houseChange.monthsUntilHouseChange < progressedMoonInfo.monthsUntilSignChange && (
              <>
                <Separator />
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-md space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600" />
                    <h4 className="text-sm font-medium text-amber-700">
                      House Change Coming First — ~{progressedMoonInfo.houseChange.monthsUntilHouseChange} months
                    </h4>
                  </div>
                  <p className="text-sm">
                    <strong>What you'll feel before the sign change:</strong> The house change is when you'll actually FEEL a shift in your daily life. Your emotional focus will move from House {progressedMoonInfo.houseChange.currentHouse} to House {progressedMoonInfo.houseChange.nextHouse}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {progressedMoonInfo.houseChange.howItFeelsBefore}
                  </p>
                  <div className="pt-2 border-t border-amber-500/20">
                    <p className="text-sm">
                      <strong>What House {progressedMoonInfo.houseChange.nextHouse} brings:</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {progressedMoonInfo.houseChange.whatHouseChangeBrings}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Upcoming Shift Summary */}
            <div className="bg-secondary/30 p-3 rounded-md">
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                <ArrowRight size={12} />
                Upcoming Shift
              </h4>
              <p className="text-sm">{progressedMoonInfo.upcomingShift}</p>
            </div>

            {/* Sign Change Timing */}
            <div className="bg-secondary/30 p-3 rounded-md flex items-center gap-3">
              <Clock size={16} className="text-muted-foreground" />
              <div className="text-xs">
                <span className="text-muted-foreground">Sign change in ~{progressedMoonInfo.monthsUntilSignChange} months</span>
                <span className="mx-2">→</span>
                <span>{SIGN_SYMBOLS[progressedMoonInfo.nextSign]} {progressedMoonInfo.nextSign}</span>
                <span className="text-muted-foreground ml-2">({formatSignChangeDate(progressedMoonInfo.signChangeDate)})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secondary Progressed Aspects */}
      {progressedAspects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sun size={16} />
              Progressed Aspects to Natal — Inner Maturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Secondary progressions show inner psychological development — how you're maturing internally.
            </p>
            <div className="space-y-3">
              {progressedAspects.slice(0, 6).map((aspect, i) => (
                <div key={i} className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getProgressedPlanetSymbol(aspect.progressedPlanet)}</span>
                    <span className="text-sm font-medium">{aspect.aspectSymbol}</span>
                    <span className="text-lg">{getProgressedPlanetSymbol(aspect.natalPlanet)}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {aspect.orb.toFixed(2)}° orb
                    </Badge>
                  </div>
                  <p className="text-sm">{aspect.interpretation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solar Arc Directions */}
      {solarArcChart && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles size={16} />
              Solar Arc Directions — Life Events Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                Solar Arc = <strong>{solarArcChart.solarArc.toFixed(2)}°</strong> (age {solarArcChart.ageYears} years, {solarArcChart.ageMonths} months)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Solar Arc aspects time major external life events — when natal potential manifests in the world.
              </p>
            </div>

            {/* Exact aspects — MAJOR EVENTS */}
            {exactSolarArcAspects.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  EXACT NOW — Major Life Events
                </h4>
                <div className="space-y-3">
                  {exactSolarArcAspects.map((aspect, i) => (
                    <div key={i} className="border-2 border-red-500/30 bg-red-500/5 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSolarArcPlanetSymbol(aspect.solarArcPlanet)}</span>
                        <ArrowRight size={12} className="text-muted-foreground" />
                        <span className="text-lg">{getSolarArcPlanetSymbol(aspect.natalPlanet)}</span>
                        <span className="text-sm font-medium ml-1">{aspect.aspectSymbol}</span>
                        <Badge variant="destructive" className="text-xs ml-auto">
                          EXACT ({aspect.orb.toFixed(2)}°)
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{aspect.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming aspects */}
            {upcomingSolarArcAspects.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-2">
                  Coming in 1-3 Years
                </h4>
                <div className="space-y-2">
                  {upcomingSolarArcAspects.slice(0, 5).map((aspect, i) => (
                    <div key={i} className="border border-amber-500/30 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getSolarArcPlanetSymbol(aspect.solarArcPlanet)}</span>
                        <span className="text-sm">{aspect.aspectSymbol}</span>
                        <span>{getSolarArcPlanetSymbol(aspect.natalPlanet)}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          ~{aspect.yearsUntilExact.toFixed(1)} years
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{aspect.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other active aspects */}
            {solarArcAspects.filter(a => a.orb >= 0.5 && a.yearsUntilExact > 3).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Background Themes (orb 0.5-1°)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {solarArcAspects
                    .filter(a => a.orb >= 0.5 && a.orb <= 1)
                    .slice(0, 8)
                    .map((aspect, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {aspect.solarArcPlanet} {aspect.aspectSymbol} {aspect.natalPlanet}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progressed Planet Positions */}
      {progressions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progressed Planet Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(progressions.planets).map(([name, data]) => (
                <div key={name} className="text-center p-2 border rounded-md">
                  <div className="text-lg">{getProgressedPlanetSymbol(name)}</div>
                  <div className="text-xs font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {SIGN_SYMBOLS[data.sign]} {data.degree.toFixed(0)}° {data.sign}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
