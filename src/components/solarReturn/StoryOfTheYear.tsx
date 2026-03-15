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
            Every birthday, the Moon is in a different position relative to the Sun. Over roughly 29.5 years, these positions trace a complete lunar cycle — from New Moon (new beginnings) through Full Moon (culmination) to Balsamic (completion). This isn't a transit or a single day's Moon phase — it's a <strong className="text-foreground">life-development cycle</strong> that shows what season of growth you're in right now, based on decades of accumulated experience. Professional astrologers use this as one of the most important frameworks for reading a Solar Return.
          </p>
        </div>

        {/* 1. Phase context */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">The Season You're In</p>
          <p className="text-sm text-foreground leading-relaxed">
            This Solar Return year falls in the <strong>{currentEntry.phase}</strong> phase of your lunar development cycle — a period focused on {cycleStageText}. {currentEntry.cycleStage === 'Completion' || currentEntry.cycleStage === 'Reevaluation'
              ? 'This is not a year to force new beginnings. It\'s a year to honor what is finishing and create space for what comes next.'
              : currentEntry.cycleStage === 'Beginning' || currentEntry.cycleStage === 'Growth'
              ? 'You are in the building phase of a longer arc. What you start or commit to now gains momentum over the next several years.'
              : currentEntry.cycleStage === 'Culmination'
              ? 'This is a peak year — the results of years of effort become visible. Relationships, career, and creative projects reach important turning points.'
              : 'The momentum of previous years carries forward. Stay engaged with what you\'ve been building.'}
          </p>
        </div>

        {/* 2. Sun house direction */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Where Life Is Moving</p>
          <p className="text-sm text-foreground leading-relaxed">
            The Sun in the <strong>{sunHouse}{sunHouse === 1 ? 'st' : sunHouse === 2 ? 'nd' : sunHouse === 3 ? 'rd' : 'th'} house</strong> places your central focus on {SUN_HOUSE_THEMES[sunHouse] || `house ${sunHouse} themes`}. This is where your vitality, willpower, and conscious attention are directed all year. It's not just a topic — it's where you feel most alive and where the biggest developments happen.
          </p>
        </div>

        {/* 3. Moon emotional field */}
        {moonHouse && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Where You Feel It Most</p>
            <p className="text-sm text-foreground leading-relaxed">
              The Moon in <strong>{analysis.moonSign}</strong> in the <strong>{moonHouse}{moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house</strong> reveals where your emotional attention and daily experience will be most intense: {MOON_HOUSE_THEMES[moonHouse] || `house ${moonHouse} themes`}. Your emotional needs this year are filtered through {analysis.moonSign} — {blending?.releasing ? `meaning patterns like ${blending.releasing} are active in your inner world` : 'shaping how you process and react to everything'}.
            </p>
          </div>
        )}

        {/* 4. Aspect catalyst */}
        {aspectNarrative && topAspect && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">What Adds Momentum</p>
            <p className="text-sm text-foreground leading-relaxed">
              The tightest aspect in the chart — <strong>{aspectNarrative}</strong> — acts as a catalyst. {topAspect.type === 'Conjunction' ? 'This fusion of energies intensifies both planets, creating a concentrated force in your year.' :
              topAspect.type === 'Opposition' ? 'This tension between opposing forces creates awareness through contrast — what you want vs. what you must accommodate.' :
              topAspect.type === 'Square' ? 'This friction generates action — uncomfortable pressure that demands you make changes rather than coast.' :
              topAspect.type === 'Trine' ? 'This natural flow between compatible energies creates ease and talent — things in this area come naturally this year.' :
              topAspect.type === 'Sextile' ? 'This opportunity aspect rewards initiative — the door is open but you must walk through it.' :
              'This aspect adds complexity and nuance to the year\'s themes.'}
            </p>
          </div>
        )}

        {/* 5. Integration */}
        <div className="border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-widest text-primary mb-1.5">The Year in One Sentence</p>
          <p className="text-base font-serif text-foreground leading-relaxed">
            A {currentEntry.cycleStage.toLowerCase()} year centered on {SUN_HOUSE_THEMES[sunHouse]?.split(',')[0] || 'growth'}{moonHouse ? `, felt most deeply through ${MOON_HOUSE_THEMES[moonHouse]?.split('—')[0]?.trim() || 'emotional processing'}` : ''}{aspectNarrative ? `, catalyzed by the ${topAspect!.type.toLowerCase()} between ${topAspect!.planet1} and ${topAspect!.planet2}` : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}
