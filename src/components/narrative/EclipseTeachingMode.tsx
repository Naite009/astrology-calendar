import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';
import { buildSignTeaching, getSignGlyph, getSignInfo } from '@/lib/astrology/signTeacher';
import type { ZodiacSign } from '@/lib/astrology/signTeacher';
import { signDegreesToLongitude, getHouseForLongitude, HOUSE_MEANINGS, getNatalPlanetHouse } from '@/lib/houseCalculations';
import { ECLIPSE_HOUSE_TEACHINGS } from '@/lib/eclipseHouseTeachings';
import { getEclipseAspectHits } from '@/lib/astrology/eclipseAspects';
import type { NatalPoint, NatalPointKey, AspectHit } from '@/lib/astrology/eclipseAspects';
import { SPILLER_NODE_DATA, SPILLER_SOURCE } from '@/lib/nodeSpillerData';
import { synthesizeEclipseWithNodes } from '@/lib/eclipseNodeSynthesis';
import { getSignHouseHabits } from '@/lib/eclipseSignHouseHabits';
import { nodalEducation } from './EclipseEncyclopediaExplorer';
import type { EclipseEvent } from './EclipseEncyclopediaExplorer';
import type { NatalChart } from '@/hooks/useNatalChart';
import { extractNatalPoints } from './EclipseInterpretationLayer';

const STEPS = [
  { num: 1, title: 'What This Eclipse IS', icon: '🌒', requiresChart: false },
  { num: 2, title: 'The Sign Filter', icon: '♍', requiresChart: false },
  { num: 3, title: 'YOUR House', icon: '🏛', requiresChart: true },
  { num: 4, title: 'YOUR Natal Nodes', icon: '☊', requiresChart: true },
  { num: 5, title: 'The Pattern Mirror', icon: '🪞', requiresChart: true },
  { num: 6, title: 'Natal Planet Activations', icon: '🎯', requiresChart: true },
  { num: 7, title: 'Your Personal Action Plan', icon: '🧭', requiresChart: true },
];

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const POINT_THEMES: Partial<Record<NatalPointKey, string>> = {
  Sun: 'identity, vitality, and life direction',
  Moon: 'emotional needs, habits, and inner security',
  Mercury: 'communication, thinking patterns, and daily decisions',
  Venus: 'values, relationships, and money choices',
  Mars: 'energy, boundaries, and conflict style',
  Jupiter: 'growth, beliefs, and opportunity areas',
  Saturn: 'responsibility, structure, and long-term commitments',
  Uranus: 'freedom, innovation, and sudden shifts',
  Neptune: 'intuition, ideals, and where clarity is needed',
  Pluto: 'power dynamics, transformation, and what must change',
  ASC: 'identity, self-image, and how others perceive you',
  MC: 'career, public role, and life direction',
  NorthNode: 'destiny direction and growth edge',
  SouthNode: 'past patterns and what to release',
  Chiron: 'healing journey and core vulnerability',
};

/** Explain what "filtered through X's lens" actually means for each sign */
function getSignLensExplanation(sign: string): string {
  const map: Record<string, string> = {
    Aries: "It arrives as urgency — a push to act, to assert, to start something or fight for something. The lens of Aries means everything feels personal and immediate.",
    Taurus: "It arrives through the body and material world — what you own, what you eat, what feels safe or threatened. The lens of Taurus means the changes show up in tangible, physical ways you can't ignore.",
    Gemini: "It arrives through information, conversations, and mental restlessness — what you're hearing, reading, and saying. The lens of Gemini means the shifts show up in how you think and communicate.",
    Cancer: "It arrives through emotional waves, family dynamics, and the felt sense of home. The lens of Cancer means you'll process this in your gut and your private life before you process it intellectually.",
    Leo: "It arrives through questions of self-expression, recognition, and creative identity. The lens of Leo means you'll feel it as a spotlight — what's being seen, celebrated, or exposed.",
    Virgo: "It arrives through the body, daily routines, work habits, and the small systems that hold your life together. The lens of Virgo means the shifts show up in practical, tangible ways — your schedule, your health, your sense of usefulness, and whether your current systems are actually working or just keeping you busy.",
    Libra: "It arrives through relationships, fairness, and the agreements you've made with others. The lens of Libra means you'll feel it in your partnerships and in the gap between peace-keeping and truth-telling.",
    Scorpio: "It arrives through intensity, power dynamics, and what's been hidden. The lens of Scorpio means you'll feel it as emotional depth — secrets surfacing, trust being tested, or a compulsion to go deeper.",
    Sagittarius: "It arrives through beliefs, meaning-making, and the urge for expansion. The lens of Sagittarius means you'll feel it as restlessness with anything that feels too small or too certain.",
    Capricorn: "It arrives through structures, ambition, and accountability. The lens of Capricorn means you'll feel it in your career, your responsibilities, and the question of whether you're building something that actually matters.",
    Aquarius: "It arrives through community, ideals, and your relationship to the collective. The lens of Aquarius means you'll feel it as tension between fitting in and standing apart.",
    Pisces: "It arrives through intuition, dreams, and emotional permeability — the things you can't quite name but deeply feel. The lens of Pisces means boundaries dissolve and you may absorb more than you realize.",
  };
  return map[sign] || `The lens of ${sign} shapes how you experience and process these changes.`;
}

/** Describe the felt-sense / somatic experience of this sign's eclipse energy */
function getSignFeltSense(sign: string): string {
  const map: Record<string, string> = {
    Aries: "a surge of adrenaline, impatience with delay, and a fierce need to take action — even before you're sure what the action should be",
    Taurus: "a tightening in the body around security, a hyper-awareness of comfort vs. discomfort, and resistance to change that feels like stubbornness but is actually self-protection",
    Gemini: "mental overdrive, scattered attention, an urge to talk it out or research everything, and difficulty sitting still with uncertainty",
    Cancer: "waves of nostalgia, vulnerability, or protectiveness — a pull toward home, family, or the desire to retreat and nurture yourself before facing the world",
    Leo: "a heightened need for acknowledgment, creative restlessness, and a sensitivity to being overlooked or undervalued",
    Virgo: "a hyper-focus on what needs fixing, an anxious audit of your health, habits, and daily routines, and possibly physical symptoms like tension in the stomach or disrupted sleep — your body is the messenger",
    Libra: "an acute awareness of imbalance in your relationships, an urge to smooth things over, and inner tension between what you want and what you think you should want for harmony's sake",
    Scorpio: "emotional intensity that sits low in the body, a compulsion to investigate what's really going on, and a feeling that something needs to die so something else can live",
    Sagittarius: "philosophical restlessness, wanderlust, a questioning of beliefs you used to take for granted, and an allergy to anything that feels confining",
    Capricorn: "pressure in the shoulders and jaw, a weight of responsibility, and a sober reckoning with whether your ambitions are serving your soul or just your resume",
    Aquarius: "a buzzing detachment, sudden clarity about group dynamics, and a pull between belonging to the community and needing to break from it entirely",
    Pisces: "emotional flooding, vivid dreams, compassion fatigue, and a blurring of the line between your feelings and everyone else's — you may need more sleep, more water, more solitude than usual",
  };
  return map[sign] || "heightened awareness in the areas this sign governs";
}

interface Props {
  eclipse: EclipseEvent;
  userNatalChart: NatalChart | null;
}

export function EclipseTeachingMode({ eclipse, userNatalChart }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasChart = !!userNatalChart && !!userNatalChart.planets && Object.keys(userNatalChart.planets).length >= 3;
  const hasHouses = hasChart && !!userNatalChart?.houseCusps;

  // Computed data
  const signTeaching = useMemo(() => buildSignTeaching(eclipse.sign), [eclipse.sign]);

  const natalPoints = useMemo(() => {
    if (!userNatalChart) return null;
    return extractNatalPoints(userNatalChart);
  }, [userNatalChart]);

  const eclipseHouse = useMemo(() => {
    if (!userNatalChart?.houseCusps) return null;
    const lon = signDegreesToLongitude(eclipse.sign, eclipse.degree, eclipse.minutes);
    return getHouseForLongitude(lon, userNatalChart);
  }, [eclipse, userNatalChart]);

  const oppositeHouse = useMemo(() => {
    if (!eclipseHouse) return null;
    return eclipseHouse <= 6 ? eclipseHouse + 6 : eclipseHouse - 6;
  }, [eclipseHouse]);

  const signHouseHabits = useMemo(() => {
    if (!eclipseHouse) return null;
    return getSignHouseHabits(eclipse.sign, eclipseHouse);
  }, [eclipse.sign, eclipseHouse]);

  const eclipseLocalTime = useMemo(() => {
    if (!eclipse.timeUtc || !eclipse.date) return null;
    try {
      const [h, m] = eclipse.timeUtc.split(':').map(Number);
      const [y, mo, d] = eclipse.date.split('-').map(Number);
      const utcDate = new Date(Date.UTC(y, mo - 1, d, h, m));
      const localDate = format(utcDate, 'MMMM d, yyyy');
      const localTime = utcDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
      return { localDate, localTime, isPast: utcDate < new Date() };
    } catch { return null; }
  }, [eclipse.date, eclipse.timeUtc]);

  const aspectHits = useMemo(() => {
    if (!natalPoints) return [];
    return getEclipseAspectHits(eclipse, natalPoints, 5);
  }, [eclipse, natalPoints]);

  const nnSign = useMemo(() => {
    if (!userNatalChart?.planets?.NorthNode?.sign) return null;
    return userNatalChart.planets.NorthNode.sign as ZodiacSign;
  }, [userNatalChart]);

  const snSign = useMemo(() => {
    if (!nnSign) return null;
    return getSignInfo(nnSign).opposite;
  }, [nnSign]);

  const nnHouse = useMemo(() => {
    if (!userNatalChart) return null;
    return getNatalPlanetHouse('NorthNode', userNatalChart);
  }, [userNatalChart]);

  const snHouse = useMemo(() => {
    if (!userNatalChart) return null;
    return getNatalPlanetHouse('SouthNode', userNatalChart);
  }, [userNatalChart]);

  const synthesis = useMemo(() => {
    if (!nnSign || !snSign) return null;
    return synthesizeEclipseWithNodes(
      eclipse.sign, eclipse.type, eclipse.nodal,
      eclipseHouse, nnSign, snSign, nnHouse, snHouse
    );
  }, [eclipse, eclipseHouse, nnSign, snSign, nnHouse, snHouse]);

  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(6, step)));
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderLockedMessage = () => (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-5">
      <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
      <p className="text-sm text-muted-foreground">
        Add your birth chart (with birth time) to personalize this step.
      </p>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      case 4: return renderStep5();
      case 5: return renderStep6();
      case 6: return renderStep7();
      default: return null;
    }
  };

  // ── Step 1: What This Eclipse IS ──
  const renderStep1 = () => {
    const edu = nodalEducation[eclipse.nodal];
    const subtypeLabel = eclipse.subtype.charAt(0).toUpperCase() + eclipse.subtype.slice(1);
    const isLunar = eclipse.type === 'lunar';

    const localTimeStr = eclipseLocalTime;

    return (
      <div className="space-y-4">
        {/* Date and time banner */}
        {localTimeStr && (
          <div className={`rounded-lg border px-4 py-3 ${localTimeStr.isPast ? 'border-muted bg-muted/30' : 'border-primary/20 bg-primary/5'}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-semibold">{localTimeStr.localDate}</p>
                <p className="text-xs text-muted-foreground">Maximum eclipse at <strong>{localTimeStr.localTime}</strong></p>
              </div>
              <Badge variant={localTimeStr.isPast ? 'secondary' : 'default'} className="text-xs">
                {localTimeStr.isPast ? 'Past Eclipse' : 'Upcoming'}
              </Badge>
            </div>
          </div>
        )}

        <p className="text-base leading-relaxed">
          This is a <strong>{subtypeLabel} {isLunar ? 'Lunar' : 'Solar'} Eclipse</strong> at{' '}
          <strong>{eclipse.degree}°{eclipse.minutes > 0 ? eclipse.minutes.toString().padStart(2, '0') + "'" : ''} {getSignGlyph(eclipse.sign)} {eclipse.sign}</strong>.
        </p>

        <div className={`rounded-lg px-4 py-3 border ${eclipse.nodal === 'north' ? 'border-primary/20 bg-primary/5' : 'border-accent/20 bg-accent/5'}`}>
          <p className="text-sm font-semibold mb-1">{edu.emoji} {edu.headline}</p>
          <p className="text-sm text-muted-foreground">{edu.shortMeaning}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <p className="text-sm text-muted-foreground">{edu.deeperMeaning}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">How This Typically Feels</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {edu.howItFeels.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>

        <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
          <p className="text-sm font-medium italic text-muted-foreground">"{edu.guidance}"</p>
        </div>
      </div>
    );
  };

  // ── Step 2: The Sign Filter ──
  const renderStep2 = () => {
    const t = signTeaching;
    return (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          Because this eclipse is in <strong>{getSignGlyph(eclipse.sign)} {eclipse.sign}</strong>, the themes being activated are filtered through {eclipse.sign}'s lens — meaning the eclipse energy doesn't arrive in the abstract. {getSignLensExplanation(eclipse.sign)} In practice, you'll feel this as {getSignFeltSense(eclipse.sign)}.
        </p>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">{t.elementCard.icon} {t.elementCard.title}</h4>
          <p className="text-sm text-muted-foreground">{t.elementCard.body}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">🔄 {t.modalityCard.title}</h4>
          <p className="text-sm text-muted-foreground">{t.modalityCard.body}</p>
        </div>

        {t.signProfile && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Core Question This Eclipse Asks</p>
              <p className="text-sm text-muted-foreground italic">{t.signProfile.coreQuestion}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">{eclipse.sign}'s Superpower</p>
              <p className="text-sm text-muted-foreground">{t.signProfile.superpower}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">{eclipse.sign}'s Shadow (What the Eclipse Exposes)</p>
              <p className="text-sm text-muted-foreground">{t.signProfile.shadow}</p>
            </div>
          </div>
        )}

        {eclipse.releasingThemes && eclipse.releasingThemes.length > 0 && (
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
            <h4 className="font-semibold text-sm">☋ {eclipse.sign} Themes Being Released</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
              {eclipse.releasingThemes.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // ── Step 3: YOUR House ──
  const renderStep3 = () => {
    if (!hasHouses) return renderLockedMessage();
    if (!eclipseHouse || !oppositeHouse) return renderLockedMessage();

    const hitInfo = HOUSE_MEANINGS[eclipseHouse];
    const oppInfo = HOUSE_MEANINGS[oppositeHouse];
    const teaching = ECLIPSE_HOUSE_TEACHINGS[eclipseHouse];
    const oppTeaching = ECLIPSE_HOUSE_TEACHINGS[oppositeHouse];
    const isLunar = eclipse.type === 'lunar';

    return (
      <div className="space-y-4">
        {/* Simple explanation first — the 3rd grade layer */}
        <p className="text-base leading-relaxed">
          For you, this eclipse falls in your <strong>{ordinal(eclipseHouse)} House</strong> — <em>{hitInfo.keywords}</em>.
        </p>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">🏛 What IS the {ordinal(eclipseHouse)} House?</h4>
          <p className="text-sm text-muted-foreground">{teaching.simpleExplanation}</p>
        </div>

        {/* Deeper meaning — the thesis layer */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">📖 The Deeper Layer</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{teaching.deeperMeaning}</p>
        </div>

        {/* What this specific eclipse type does in this house */}
        <div className={`rounded-lg border p-4 space-y-2 ${isLunar ? 'border-accent/20 bg-accent/5' : 'border-primary/20 bg-primary/5'}`}>
          <h4 className="font-semibold text-sm">{isLunar ? '🌕' : '🌑'} What a {isLunar ? 'Lunar' : 'Solar'} Eclipse Does Here</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{isLunar ? teaching.eclipseLunar : teaching.eclipseSolar}</p>
        </div>

        {/* The sign + house intersection */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">🔍 The {eclipse.sign} Audit in Your {ordinal(eclipseHouse)} House</h4>
          <p className="text-sm text-muted-foreground">
            So the {eclipse.sign} themes — <em>{signTeaching.signProfile?.shadow || 'what this eclipse exposes'}</em> — are happening specifically in <strong>{hitInfo.lifeArea}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This isn't abstract. This is about your actual {hitInfo.lifeArea}. The eclipse is pressure-testing this area of your life and asking whether what you've built here is still serving you.
          </p>
        </div>

        {/* Real-life examples */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">💡 What This Can Look Like in Real Life</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {teaching.examples.map((ex, i) => <li key={i}>{ex}</li>)}
          </ul>
        </div>

        {/* Sign-in-House habit audit */}
        {signHouseHabits && signHouseHabits.length > 0 && (
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-3">
            <h4 className="font-semibold text-sm">🔎 What {eclipse.sign} Habit Has Run Its Course in Your {ordinal(eclipseHouse)} House?</h4>
            <p className="text-xs text-muted-foreground">
              Because this eclipse lands in your {ordinal(eclipseHouse)} house, the {eclipse.sign} patterns to watch aren't abstract — they show up specifically in <strong>{hitInfo.lifeArea}</strong>. Read through these and notice which ones land:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-none">
              {signHouseHabits.map((habit, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent shrink-0 mt-0.5">•</span>
                  <span>{habit}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2">
              If one or two of these hit home — that's the eclipse working. You don't have to fix it tonight. Just notice it. Awareness is the first step.
            </p>
          </div>
        )}


        <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">The Question This Eclipse Asks You</p>
          <p className="text-sm font-medium italic text-muted-foreground">"{teaching.soulQuestion}"</p>
        </div>

        {/* Danger zone — what happens if you resist */}
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">⚠️ The Danger Zone (What Resistance Looks Like)</h4>
          <p className="text-sm text-muted-foreground">{teaching.dangerZone}</p>
        </div>

        {/* Opposite axis — deep version */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-3">
          <h4 className="font-semibold text-sm">↔ The Axis: {ordinal(eclipseHouse)}–{ordinal(oppositeHouse)} House</h4>
          <p className="text-sm text-muted-foreground">{teaching.axisTeaching}</p>

          <div className="mt-2 pt-2 border-t border-border/30 space-y-2">
            <p className="text-xs font-medium text-accent-foreground uppercase tracking-wide">The Other Side: Your {ordinal(oppositeHouse)} House</p>
            <p className="text-sm text-muted-foreground">{oppTeaching.simpleExplanation}</p>
          </div>

          <div className="rounded-lg bg-card/50 border border-border/30 p-3 space-y-2">
            <p className="text-xs font-medium text-primary uppercase tracking-wide">How Axes Work During Eclipses</p>
            <p className="text-sm text-muted-foreground">
              Eclipses never hit just one house — they activate an <strong>axis</strong>, which means two opposite life areas are in conversation at the same time. Think of it like a seesaw: when one side gets pressure, the other side lifts. The eclipse lands in your {ordinal(eclipseHouse)} house ({hitInfo.keywords.toLowerCase()}), but it's <em>pulling</em> on your {ordinal(oppositeHouse)} house ({oppInfo.keywords.toLowerCase()}) simultaneously.
            </p>
            <p className="text-sm text-muted-foreground">
              This doesn't mean you lose one to gain the other. It means whatever shifts in your {hitInfo.keywords.toLowerCase().split(',')[0]?.trim()} area will ripple into your {oppInfo.keywords.toLowerCase().split(',')[0]?.trim()} area — and vice versa. The goal isn't choosing sides. It's finding a new balance point between both.
            </p>
          </div>

          {/* Nodal overlay — if nodes are on this axis */}
          {nnHouse && snHouse && (nnHouse === eclipseHouse || nnHouse === oppositeHouse || snHouse === eclipseHouse || snHouse === oppositeHouse) && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-medium text-primary uppercase tracking-wide">⚡ Your Nodes Are on This Axis</p>
              {nnHouse === oppositeHouse ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your <strong>North Node is in your {ordinal(oppositeHouse)} house</strong> — this is your growth direction. The eclipse is landing opposite your North Node, which means it's <em>activating your South Node house</em> (the {ordinal(eclipseHouse)} house). This is not about letting go of the people or things in your {ordinal(oppositeHouse)} house. It's the opposite: the eclipse is clearing out old patterns in your {ordinal(eclipseHouse)} house <em>so that</em> you can show up more fully in your {ordinal(oppositeHouse)} house relationships and commitments.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Think of it this way: whatever the eclipse disrupts in your {hitInfo.keywords.toLowerCase()} is making room for you to grow into your {oppInfo.keywords.toLowerCase()} with less baggage. The {ordinal(oppositeHouse)} house is where you're <em>headed</em>. The {ordinal(eclipseHouse)} house is what you need to release, refine, or restructure to get there.
                  </p>
                </>
              ) : nnHouse === eclipseHouse ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your <strong>North Node is in your {ordinal(eclipseHouse)} house</strong> — the same house this eclipse is activating. This is a direct push toward your growth edge. The eclipse is saying: this is exactly where you need to be investing energy, even if it's uncomfortable. The {ordinal(eclipseHouse)} house themes ({hitInfo.keywords.toLowerCase()}) are not just being disrupted — they're being <em>upgraded</em>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your South Node in the {ordinal(oppositeHouse)} house ({oppInfo.keywords.toLowerCase()}) represents the comfort zone the eclipse is pulling you away from. You won't lose what's there — but you'll be asked to stop using it as a hiding place.
                  </p>
                </>
              ) : snHouse === eclipseHouse ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your <strong>South Node is in your {ordinal(eclipseHouse)} house</strong> — the house this eclipse is activating. This means the eclipse is directly stirring your past patterns, your comfort zone, and the habits you default to under stress. This can feel intense because the eclipse is illuminating exactly what you need to release or evolve beyond.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This isn't punishment. It's the universe pointing a flashlight at the loop. Your North Node in the {ordinal(oppositeHouse)} house is where the growth lives — the eclipse is clearing the path to get there.
                  </p>
                </>
              ) : snHouse === oppositeHouse ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your <strong>South Node is in your {ordinal(oppositeHouse)} house</strong> — the opposite side of this eclipse axis. The eclipse lands in your {ordinal(eclipseHouse)} house (North Node territory), pushing you toward growth, while simultaneously stirring the {ordinal(oppositeHouse)} house comfort patterns you tend to fall back on.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is a supportive eclipse for your nodal journey. It's accelerating you toward your North Node direction while making the South Node default less comfortable to maintain.
                  </p>
                </>
              ) : null}
            </div>
          )}

          {/* When nodes are NOT on this axis */}
          {nnHouse && snHouse && nnHouse !== eclipseHouse && nnHouse !== oppositeHouse && snHouse !== eclipseHouse && snHouse !== oppositeHouse && (
            <div className="rounded-lg border border-border/30 bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Nodes & This Axis</p>
              <p className="text-sm text-muted-foreground">
                Your nodes are in your {ordinal(nnHouse)}–{ordinal(snHouse)} house axis, not directly on this {ordinal(eclipseHouse)}–{ordinal(oppositeHouse)} axis. This eclipse is working on a different part of your life than your core nodal journey — but the {ordinal(eclipseHouse)} house changes may still indirectly support or challenge your North Node growth, depending on what planets are activated (see Step 6).
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Step 4: YOUR Natal Nodes ──
  const renderStep4 = () => {
    if (!hasChart || !nnSign || !snSign || !synthesis) return renderLockedMessage();

    const nnGlyph = getSignGlyph(nnSign);
    const snGlyph = getSignGlyph(snSign);

    return (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          Your North Node is in <strong>{nnGlyph} {nnSign}</strong>{nnHouse ? ` (${ordinal(nnHouse)} House)` : ''} and your South Node is in <strong>{snGlyph} {snSign}</strong>{snHouse ? ` (${ordinal(snHouse)} House)` : ''}.
        </p>

        {/* Connection narrative — the key synthesis */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">🔗 How This Eclipse Connects to Your Nodes</h4>
          <p className="text-sm text-muted-foreground">{synthesis.connectionNarrative}</p>
        </div>

        {/* North Node growth direction */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">☊ Your North Node in {nnSign}: Where You're Growing</h4>
          <p className="text-sm text-muted-foreground italic">{synthesis.nnSpiller?.overview}</p>
          {synthesis.nnHouseOverlay && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <p className="text-xs font-medium text-primary uppercase tracking-wide">{synthesis.nnHouseOverlay.focus} ({ordinal(nnHouse!)} House)</p>
              <p className="text-sm text-muted-foreground">{synthesis.nnHouseOverlay.lifeLesson}</p>
            </div>
          )}
        </div>

        {/* South Node past patterns */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">☋ Your South Node in {snSign}: What You Default To</h4>
          <p className="text-sm text-muted-foreground italic">{synthesis.nnSpiller?.pastLifeStory}</p>
          <div className="mt-2">
            <p className="text-xs font-medium uppercase tracking-wide mb-1">Tendencies to Leave Behind</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
              {synthesis.nnSpiller?.tendenciesToLeaveBehind?.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <strong>The question this eclipse asks:</strong> Are your {eclipse.sign}-style habits keeping you stuck in {snSign} comfort — or moving you toward {nnSign} depth?
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center italic">
          Source: {SPILLER_SOURCE}
        </p>
      </div>
    );
  };

  // ── Step 5: The Pattern Mirror ──
  const renderStep5 = () => {
    if (!synthesis) return renderLockedMessage();

    return (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          Now let's look for the <strong>pattern</strong> — the loop you might be running without realizing it.
        </p>

        {synthesis.patternSentences.map((sentence, i) => (
          <div key={i} className={`rounded-lg border p-4 ${i === 0 ? 'border-primary/20 bg-primary/5' : 'border-border/50 bg-card/50'}`}>
            <p className="text-sm text-muted-foreground">{sentence}</p>
          </div>
        ))}

        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-3">
          <h4 className="font-semibold text-sm">🪞 The Mirror Question</h4>
          <p className="text-sm text-muted-foreground italic">
            "Where in my life right now am I doing the {eclipse.sign} thing —{' '}
            {signTeaching.signProfile?.shadow?.split('.')[0]?.toLowerCase() || 'over-functioning'} — as a way to avoid the {nnSign} thing —{' '}
            {synthesis.nnSpiller?.tendenciesToDevelop?.[0]?.toLowerCase() || 'real growth'}?"
          </p>
        </div>

        <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
          <p className="text-sm font-medium italic text-muted-foreground">
            The pattern isn't a failure — it's a signal. The eclipse illuminates it so you can choose differently.
          </p>
        </div>
      </div>
    );
  };

  // ── Step 6: Natal Planet Activations ──
  const renderStep6 = () => {
    if (!hasChart) return renderLockedMessage();

    return (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          This eclipse at <strong>{eclipse.degree}° {eclipse.sign}</strong> makes the following aspects to your natal planets:
        </p>

        {aspectHits.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-4">
            <p className="text-sm text-muted-foreground">
              <strong>No tight aspects within orb.</strong> The house and nodal story matter most for you with this eclipse — the personal activation comes through life area, not planet-to-planet contact.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aspectHits.map((hit, idx) => (
              <div key={idx} className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-sm font-mono">{hit.glyph}</Badge>
                  <span className="text-sm font-semibold">{hit.point}</span>
                  <Badge variant="secondary" className="text-xs capitalize">{hit.aspect}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">orb {hit.orbLabel}</span>
                </div>
                <p className="text-sm text-muted-foreground">{hit.interpretation}</p>
                {POINT_THEMES[hit.point] && (
                  <p className="text-sm text-muted-foreground">
                    <strong>This adds themes of:</strong> {POINT_THEMES[hit.point]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {eclipse.aspects && eclipse.aspects.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Additional Transit Context</p>
            {eclipse.aspects.map((asp, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-1">
                <Badge variant="outline" className="text-xs capitalize">{asp.planet} {asp.type} ({asp.sign})</Badge>
                <p className="text-sm text-muted-foreground">{asp.meaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Step 7: Your Personal Action Plan ──
  const renderStep7 = () => {
    if (!synthesis) return renderLockedMessage();

    return (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          Based on everything above — here's your personalized action plan for this eclipse.
        </p>

        {/* Release */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">☋ What to Release</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {synthesis.releaseGuidance.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        {/* Grow toward */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">☊ What to Move Toward</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {synthesis.growthGuidance.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>

        {/* Journal prompts */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">📝 Journal Prompts</h4>
          <ul className="text-sm text-muted-foreground space-y-2 list-none">
            {synthesis.journalPrompts.map((j, i) => (
              <li key={i} className="italic border-l-2 border-primary/20 pl-3">{j}</li>
            ))}
          </ul>
        </div>

        {/* Eclipse-specific reflection questions */}
        {eclipse.reflectionQuestions && eclipse.reflectionQuestions.length > 0 && (
          <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
            <h4 className="font-semibold text-sm">🔍 Eclipse-Specific Reflection Questions</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-none">
              {eclipse.reflectionQuestions.map((q, i) => (
                <li key={i} className="italic border-l-2 border-accent/20 pl-3">{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Watch for */}
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">👁 Watch for This in the Next 2 Weeks</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>A truth surfacing that changes how you feel about a situation you thought was settled.</li>
            <li>The pull to handle things the {snSign ?? 'old'} way — notice it, then consciously choose the {nnSign ?? 'growth'} path.</li>
            {eclipse.nodal === 'south' && <li>Relief after letting go — the lightness confirms the release was right.</li>}
            {eclipse.nodal === 'north' && <li>Growth disguised as discomfort — the stretch IS the signal that you're on the right track.</li>}
          </ul>
        </div>

        <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
          <p className="text-sm font-medium italic text-muted-foreground">
            {eclipse.nodal === 'south'
              ? "Don't fight what's completing. Let the audit happen. The question isn't 'how do I hold on?' — it's 'what have I learned, and what can I release with grace?'"
              : "Say yes to what feels unfamiliar but resonant. The North Node asks for courage — not recklessness, but the willingness to walk toward what you haven't yet become."
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div ref={contentRef} className="space-y-4">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <Badge variant="outline" className="text-xs">
            {eclipse.degree}° {getSignGlyph(eclipse.sign)} {eclipse.sign} • {(() => {
              const [y, m, d] = eclipse.date.split('-').map(Number);
              return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            })()}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                i === currentStep
                  ? 'bg-primary text-primary-foreground scale-110'
                  : i < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={s.title}
            >
              {i < currentStep ? <Check className="h-3.5 w-3.5" /> : s.num}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="border-accent/20">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{step.icon}</span>
            <div>
              <h3 className="text-lg font-semibold">Step {step.num}: {step.title}</h3>
              {step.requiresChart && !hasChart && (
                <p className="text-xs text-muted-foreground">Requires birth chart</p>
              )}
            </div>
          </div>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          variant={currentStep === STEPS.length - 1 ? 'outline' : 'default'}
          size="sm"
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep === STEPS.length - 1}
          className="gap-1.5"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
