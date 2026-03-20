import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import {
  computeLunarPhaseTimeline,
  TimelineEntry,
} from '@/lib/solarReturnLunarTimeline';
import { getMoonPhaseBlending } from '@/lib/solarReturnMoonData';
import { computeYearPriorities } from '@/lib/yearPriorityScoring';

const PHASE_ICONS: Record<string, string> = {
  'New Moon': '🌑', 'Crescent': '🌒', 'First Quarter': '🌓', 'Gibbous': '🌔',
  'Full Moon': '🌕', 'Disseminating': '🌖', 'Last Quarter': '🌗', 'Balsamic': '🌘',
};

const CYCLE_STAGE_TEXT: Record<string, string> = {
  'Beginning': 'planting new seeds — trusting raw instincts even when the outcome isn\'t visible yet',
  'Growth': 'building momentum — pushing through early resistance with real effort producing real traction',
  'Action': 'decisive moves — committing to a direction and taking a stand under pressure',
  'Refinement': 'fine-tuning — adjusting and perfecting what is almost ready before the next stage',
  'Culmination': 'harvesting results — what you\'ve been building becomes visible and relationships reach turning points',
  'Sharing': 'teaching and distributing — what you\'ve learned and built becomes valuable to others',
  'Reevaluation': 'questioning and releasing — old structures, beliefs, and habits are up for honest review',
  'Completion': 'closure and preparation — letting go of what\'s finished so the next cycle can begin',
};

const SUN_HOUSE_THEMES: Record<number, string> = {
  1: 'personal identity, physical appearance, and how you present yourself to the world',
  2: 'money, possessions, self-worth, and what you truly value',
  3: 'communication, learning, siblings, and everyday connections',
  4: 'home, family, emotional roots, and private foundations',
  5: 'creativity, romance, children, joy, and self-expression',
  6: 'daily work, health routines, service, and physical wellness',
  7: 'committed partnerships, marriage, business alliances, and one-on-one relationships',
  8: 'shared finances, intimacy, psychological depth, and transformation',
  9: 'travel, higher education, philosophy, publishing, and expanding your worldview',
  10: 'career, public reputation, authority, and professional standing',
  11: 'friendships, community, social causes, and long-term goals',
  12: 'solitude, spiritual practice, the unconscious, endings, and inner processing',
};

const MOON_HOUSE_THEMES: Record<number, string> = {
  1: 'your body, appearance, and immediate personal reactions — emotions are visible and instinctive',
  2: 'financial security and self-worth — money feels personal and emotional this year',
  3: 'conversations, siblings, and mental processing — you think through feelings by talking',
  4: 'home and family — your emotional world centers on where you live and where you come from',
  5: 'joy, creativity, and romance — you need play and self-expression to feel emotionally alive',
  6: 'health and daily routines — your body reflects your emotional state directly',
  7: 'partnerships — your emotional life is shaped by close one-on-one relationships',
  8: 'intimacy and shared resources — deep emotional processing and psychological transformation',
  9: 'meaning and exploration — restlessness and a need for expanded perspective',
  10: 'career and public role — emotional investment in professional achievement and recognition',
  11: 'friendships and community — emotional fulfillment comes through groups and shared causes',
  12: 'solitude and inner work — emotions run deep beneath the surface in quiet processing',
};

interface Props {
  analysis: SolarReturnAnalysis;
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export function StoryOfTheYear({ analysis, natalChart, srChart }: Props) {
  const timeline = useMemo(() => {
    const sun = natalChart.planets.Sun;
    if (!sun) return [];
    return computeLunarPhaseTimeline(sun.sign, sun.degree, sun.minutes, natalChart.birthDate, srChart.solarReturnYear);
  }, [natalChart, srChart.solarReturnYear]);

  const currentEntry = timeline.find(e => e.isCurrent);

  // Get blending data for releasing/emerging
  const blending = currentEntry
    ? getMoonPhaseBlending(currentEntry.phase, currentEntry.moonSign, currentEntry.sunSign, null, null)
    : null;

  const sunHouse = analysis.sunHouse?.house;
  const moonHouse = analysis.moonHouse?.house;

  // Get top aspect for the "catalyst" paragraph
  const topAspect = analysis.srToNatalAspects?.[0] || analysis.srInternalAspects?.[0];
  const aspectNarrative = topAspect
    ? `${topAspect.planet1}–${topAspect.planet2} ${topAspect.type.toLowerCase()} (${topAspect.orb.toFixed(1)}°)`
    : null;

  // Compute priority themes
  const topThemes = useMemo(() => {
    return computeYearPriorities(analysis, natalChart, srChart).slice(0, 3);
  }, [analysis, natalChart, srChart]);

  if (!currentEntry || !sunHouse) return null;

  const cycleStageText = CYCLE_STAGE_TEXT[currentEntry.cycleStage] || currentEntry.cycleStage.toLowerCase();

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 px-5 py-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Story of the Year</h3>
            <p className="text-xs text-muted-foreground">
              {srChart.solarReturnYear} · {currentEntry.phase} {PHASE_ICONS[currentEntry.phase] || '☽'} · {currentEntry.cycleStage}
            </p>
          </div>
        </div>
      </div>

      {/* Body — narrative paragraphs */}
      <div className="p-5 space-y-5">
        {/* 0. What is this — context explainer */}
        <div className="bg-muted/30 border border-border rounded-sm p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">What You're Reading</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every year on your birthday, the Sun returns to the exact same spot it was when you were born. At that precise moment, we cast a new chart — a snapshot of the sky. This "birthday chart" acts as a <strong className="text-foreground">blueprint for the year ahead</strong>. Below, we break down what it says about where your attention goes, how you'll feel, and what creates momentum.
          </p>
        </div>

        {/* 1. Sun house — the main event */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Where Your Energy Goes This Year</p>
          <p className="text-sm text-foreground leading-relaxed">
            The Sun in the <strong>{sunHouse}{sunHouse === 1 ? 'st' : sunHouse === 2 ? 'nd' : sunHouse === 3 ? 'rd' : 'th'} house</strong> means your main focus this year is on {SUN_HOUSE_THEMES[sunHouse] || `house ${sunHouse} themes`}. This is where the biggest developments happen — it's the area of life where you'll spend the most energy, make the most decisions, and see the most visible results.
          </p>
        </div>

        {/* 2. Moon emotional field */}
        {moonHouse && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Where You Feel It Most</p>
            <p className="text-sm text-foreground leading-relaxed">
              The Moon in <strong>{analysis.moonSign}</strong> in the <strong>{moonHouse}{moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house</strong> shows where your emotional life is most active: {MOON_HOUSE_THEMES[moonHouse] || `house ${moonHouse} themes`}. Think of it as what keeps you up at night, what you daydream about, and what triggers your strongest reactions this year.{blending?.releasing ? ` You may notice that patterns around ${blending.releasing} are especially present in your emotional world.` : ''}
            </p>
          </div>
        )}

        {/* 3. SR Moon Phase tone */}
        {currentEntry && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Emotional Tone of the Year</p>
            <p className="text-sm text-foreground leading-relaxed">
              This year's Moon phase is <strong>{currentEntry.phase}</strong>, which means the overall emotional flavor is about {cycleStageText}. Think of it like a season: some years feel like spring (new beginnings), others feel like autumn (harvesting what you've built). This year's season is {currentEntry.cycleStage.toLowerCase()}.
            </p>
          </div>
        )}

        {/* 4. Aspect catalyst — skip Sun-Sun */}
        {aspectNarrative && topAspect && !(topAspect.planet1 === 'Sun' && topAspect.planet2 === 'Sun') && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">What Creates Momentum</p>
            <p className="text-sm text-foreground leading-relaxed">
              The strongest connection in this year's chart is between <strong>{topAspect.planet1}</strong> and <strong>{topAspect.planet2}</strong> ({topAspect.type.toLowerCase()}, {topAspect.orb.toFixed(1)}° apart). {topAspect.type === 'Conjunction' ? 'These two forces blend together — when one activates, the other automatically comes along. You can\'t deal with one without dealing with the other.' :
              topAspect.type === 'Opposition' ? 'These two forces pull in opposite directions, like a tug-of-war. You\'ll feel torn between them at times. The solution isn\'t choosing one — it\'s finding a way to honor both.' :
              topAspect.type === 'Square' ? 'These two forces create friction — like two people who disagree but force each other to be sharper. It\'s uncomfortable but it\'s what pushes you to actually act instead of staying still.' :
              topAspect.type === 'Trine' ? 'These two forces work together easily — things related to them come naturally this year. The only risk is taking the ease for granted and not making the most of it.' :
              topAspect.type === 'Sextile' ? 'These two forces create a quiet opportunity — it won\'t force itself on you, but if you notice it and act, things flow smoothly.' :
              'These two forces interact in a way that adds nuance and complexity to the year.'}
            </p>
          </div>
        )}

        {/* 5. Integration */}
        <div className="border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-widest text-primary mb-1.5">The Year in One Sentence</p>
          <p className="text-base font-serif text-foreground leading-relaxed">
            A {currentEntry?.phase ? `${currentEntry.phase} ` : ''}{currentEntry?.cycleStage ? `(${currentEntry.cycleStage.toLowerCase()}) ` : ''}year focused on {SUN_HOUSE_THEMES[sunHouse]?.split(',')[0]?.toLowerCase() || 'growth'}{moonHouse ? `, with emotional energy concentrated in ${MOON_HOUSE_THEMES[moonHouse]?.split('—')[0]?.trim()?.toLowerCase() || 'inner processing'}` : ''}{topAspect && !(topAspect.planet1 === 'Sun' && topAspect.planet2 === 'Sun') ? `, sharpened by the ${topAspect.type.toLowerCase()} between ${topAspect.planet1} and ${topAspect.planet2}` : ''}.
          </p>
          {topThemes.length >= 2 && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              The strongest priorities of the year are <strong className="text-foreground">{topThemes[0].label}</strong>{topThemes[1] ? <>, <strong className="text-foreground">{topThemes[1].label}</strong></> : ''}{topThemes[2] ? <>, and <strong className="text-foreground">{topThemes[2].label}</strong></> : ''} — these themes are confirmed by multiple independent signals across the chart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
