import { useState, useMemo } from 'react';
import { MoonPhasesView } from './MoonPhasesView';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateBirthMoonPhase, BirthMoonPhase } from '@/lib/birthConditions';
import { calculateSecondaryProgressions, getProgressedMoonInfo } from '@/lib/secondaryProgressions';
import { getMoonPhase, getPlanetaryPositions } from '@/lib/astrology';
import { getNatalPlanetHouse } from '@/lib/houseCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, MapPin, Moon, Sparkles } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getArchetypesForPhase, getKalderaArchetype, PHASE_CHAPTER_TITLES, MoonArchetype } from '@/data/moonPhaseSignArchetypes';
import { getForrestPhaseData } from '@/data/moonPhaseForrest';
import { getForrestMoonSign, getForrestMoonHouse } from '@/data/moonForrestData';

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

const PHASE_EMOJIS: Record<string, string> = {
  'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓',
  'Waxing Gibbous': '🌔', 'Full Moon': '🌕', 'Waning Gibbous': '🌖',
  'Last Quarter': '🌗', 'Waning Crescent': '🌘', 'Balsamic': '🌘',
};

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

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// ─── Planetary rulers for Shadowing Moons ───
// Kaldera's concept: a planet closely aspecting your natal Moon "shadows" it,
// adding a secondary layer from the sign(s) that planet rules.
const PLANET_RULED_SIGNS: Record<string, string[]> = {
  Sun: ['Leo'],
  Mercury: ['Gemini', 'Virgo'],
  Venus: ['Taurus', 'Libra'],
  Mars: ['Aries', 'Scorpio'],
  Jupiter: ['Sagittarius', 'Pisces'],
  Saturn: ['Capricorn', 'Aquarius'],
  Uranus: ['Aquarius'],
  Neptune: ['Pisces'],
  Pluto: ['Scorpio'],
  Chiron: ['Virgo'], // often associated
  NorthNode: [],
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊',
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', square: '□', trine: '△', sextile: '⚹',
};

const SHADOWING_EXPLANATION: Record<string, { simple: string; felt: string; guru: string }> = {
  conjunction: {
    simple: 'is glued to your Moon. It\'s not separate from your feelings — it IS your feelings. You were born with this planet sitting right on top of your Moon, so its energy is baked into how you feel about everything.',
    felt: 'You feel this as a constant companion in your emotional body. When you get sad, happy, scared, or excited, this planet\'s energy is always there coloring the experience. It\'s like wearing tinted glasses you can never take off — you don\'t even notice the tint because it\'s all you\'ve ever known.',
    guru: 'The conjunction is the most potent shadow. The aspecting planet\'s archetypal energy is indistinguishable from the lunar function itself. In Kaldera\'s framework, the ruled sign of this planet becomes a co-primary archetype — you don\'t just "have" this energy, you ARE this energy. Others see it in you before you see it in yourself. The shadow archetype operates with the same intensity as your birth Moon archetype.',
  },
  opposition: {
    simple: 'sits on the opposite side of the sky from your Moon. This means you often see this energy in OTHER people rather than in yourself. Partners, close friends, even rivals carry this energy and reflect it back to you like a mirror.',
    felt: 'You feel this as attraction and sometimes frustration with certain types of people. You might think "why do I always end up with people who are so [intense/controlling/dreamy/etc.]?" — that\'s this opposition at work. The qualities you notice most in others are the ones this shadow is asking you to own.',
    guru: 'The opposition shadow manifests through projection and relational dynamics. The ruled sign archetype represents disowned lunar material — emotional capacities you possess but have externalized onto partners and intimate others. Integration requires recognizing that what magnetizes or irritates you in relationships is your own unlived Moon energy seeking expression. Kaldera teaches that opposition shadows become conscious only through sustained intimate encounter.',
  },
  square: {
    simple: 'is pushing against your Moon at a 90° angle — like two people trying to walk through the same doorway at the same time. This creates real tension, but that tension is what makes you grow. You can\'t ignore it.',
    felt: 'You feel this as an inner tug-of-war. Part of you wants one thing emotionally, and this planet pulls you in a completely different direction. It shows up as restlessness, frustration, or that nagging feeling that something needs to change but you don\'t know what. The friction is uncomfortable but productive — it\'s the grit that makes the pearl.',
    guru: 'The square shadow is the growth engine. Unlike the flowing aspects, the square demands conscious work. The ruled sign archetype represents emotional territory that feels foreign and threatening to your comfort zone, yet is precisely what your soul requires for evolution. Kaldera describes square shadows as "the teacher you didn\'t choose" — they create crises that force integration. The discomfort never fully resolves; it transforms into creative tension that fuels purpose.',
  },
  trine: {
    simple: 'flows easily with your Moon — like a river that naturally feeds into a lake. This energy supports you so effortlessly that you might not even realize it\'s there. It\'s a gift, but because it comes so easily, you might forget to use it on purpose.',
    felt: 'You feel this as a natural ease in certain emotional situations. While others struggle with this type of energy, it comes to you like breathing. The danger is that you coast — you have access to this beautiful resource but you treat it like background music instead of the symphony it could be.',
    guru: 'The trine shadow represents innate emotional talent — archetypal energy that flows into the lunar function without resistance. Kaldera warns that trine shadows are the most easily wasted: because they require no effort to access, they often remain unconscious gifts rather than developed strengths. The ruled sign archetype is a natural extension of your Moon that operates on autopilot. Conscious engagement with trine shadows transforms passive talent into active mastery.',
  },
  sextile: {
    simple: 'is offering your Moon a helping hand — but you have to reach out and grab it. The support is there, but it won\'t force itself on you. Think of it like a door that\'s unlocked but not open — you still have to turn the handle.',
    felt: 'You feel this as moments of opportunity — flashes where you think "oh, I could do that" or "that feels right." The energy is available when you actively engage with it. It\'s gentler than a trine, more like a suggestion than an automatic gift. When you make the effort to connect with this energy, it responds generously.',
    guru: 'The sextile shadow is the aspect of conscious opportunity. Unlike the trine\'s automatic flow, the sextile requires intentional activation — the ruled sign archetype is available as a resource but must be deliberately cultivated. Kaldera positions sextile shadows as "allies waiting to be called" — their archetypal energy enriches the Moon when the native makes effort to integrate it. This is the shadow most responsive to ritual, practice, and conscious engagement.',
  },
};

interface ShadowingMoon {
  planet: string;
  aspect: string;
  orb: number;
  ruledSigns: string[];
  archetypes: { sign: string; archetype: MoonArchetype }[];
}

function computeShadowingMoons(chart: NatalChart, phase: string): ShadowingMoon[] {
  const planets = chart.planets;
  const moonPos = planets.Moon;
  if (!moonPos) return [];

  const ZODIAC_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const moonAbs = ZODIAC_ORDER.indexOf(moonPos.sign) * 30 + moonPos.degree;

  const ASPECT_ANGLES: { name: string; angle: number; orb: number }[] = [
    { name: 'conjunction', angle: 0, orb: 10 },
    { name: 'opposition', angle: 180, orb: 8 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'sextile', angle: 60, orb: 6 },
  ];

  const shadows: ShadowingMoon[] = [];
  const checkPlanets = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'];

  for (const pName of checkPlanets) {
    const pos = planets[pName as keyof typeof planets];
    if (!pos) continue;
    const pAbs = ZODIAC_ORDER.indexOf(pos.sign) * 30 + pos.degree;
    let diff = Math.abs(moonAbs - pAbs);
    if (diff > 180) diff = 360 - diff;

    for (const asp of ASPECT_ANGLES) {
      const orb = Math.abs(diff - asp.angle);
      if (orb <= asp.orb) {
        const ruledSigns = PLANET_RULED_SIGNS[pName] || [];
        const archetypes = ruledSigns
          .map(sign => {
            const arch = getKalderaArchetype(phase, sign);
            return arch ? { sign, archetype: arch } : null;
          })
          .filter(Boolean) as { sign: string; archetype: MoonArchetype }[];

        if (archetypes.length > 0) {
          shadows.push({
            planet: pName,
            aspect: asp.name,
            orb: Math.round(orb * 10) / 10,
            ruledSigns,
            archetypes,
          });
        }
        break;
      }
    }
  }

  shadows.sort((a, b) => a.orb - b.orb);
  return shadows;
}

/** Archetype Detail Modal */
function ArchetypeDetailModal({ archetype, phase, sign, open, onClose }: {
  archetype: MoonArchetype | null;
  phase: string;
  sign: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!archetype) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{PHASE_EMOJIS[phase] || '🌙'}</span>
            <span className="font-serif">{archetype.name}</span>
          </DialogTitle>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="text-[10px]">{phase}</Badge>
            <Badge variant="secondary" className="text-[10px]">{SIGN_GLYPHS[sign]} {sign}</Badge>
            {PHASE_CHAPTER_TITLES[phase] && (
              <span className="text-[10px] text-muted-foreground italic">"{PHASE_CHAPTER_TITLES[phase]}"</span>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            <p className="text-sm font-medium italic text-primary/80">{archetype.essence}</p>
            {archetype.description.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground">{para}</p>
            ))}
            {archetype.coreWound && (
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">💔 CORE WOUND</p>
                <p className="text-sm text-foreground leading-relaxed">{archetype.coreWound}</p>
              </div>
            )}
            {archetype.healingPath && (
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">🌿 HEALING PATH</p>
                <p className="text-sm text-foreground leading-relaxed">{archetype.healingPath}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">✦ GIFTS</p>
                <ul className="space-y-1">
                  {archetype.gifts.map((g, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">⚠ CHALLENGES</p>
                <ul className="space-y-1">
                  {archetype.challenges.map((c, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-destructive mt-0.5">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {archetype.inTheBody && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">🫀 IN THE BODY</p>
                <p className="text-sm text-foreground leading-relaxed">{archetype.inTheBody}</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-accent/50 border border-accent">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">🔮 SOUL LESSON</p>
              <p className="text-sm text-foreground leading-relaxed italic">{archetype.soulLesson}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-secondary">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">💕 IN RELATIONSHIPS</p>
              <p className="text-sm text-foreground leading-relaxed">{archetype.inRelationships}</p>
            </div>
            {archetype.sacredPurpose && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">🌟 SACRED PURPOSE</p>
                <p className="text-sm text-foreground leading-relaxed">{archetype.sacredPurpose}</p>
              </div>
            )}
            {archetype.shadowExpression && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">🌑 SHADOW EXPRESSION</p>
                <p className="text-sm text-foreground leading-relaxed">{archetype.shadowExpression}</p>
              </div>
            )}
            {archetype.affirmation && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">✨ AFFIRMATION</p>
                <p className="text-base font-serif italic text-foreground leading-relaxed">"{archetype.affirmation}"</p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground italic">— Raven Kaldera, Moon Phase Astrology</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/** Shadowing Moons section — planets aspecting the natal Moon add secondary archetypal layers */
function ShadowingMoonsSection({ chart, phase }: { chart: NatalChart; phase: string }) {
  const shadows = useMemo(() => computeShadowingMoons(chart, phase), [chart, phase]);
  const [expandedShadow, setExpandedShadow] = useState<string | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<{ archetype: MoonArchetype; sign: string } | null>(null);

  if (shadows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          🌒 Shadowing Moons — Secondary Archetypal Layers
        </h4>
      </div>
      <div className="p-4 rounded-lg bg-muted/30 border border-border text-sm text-muted-foreground leading-relaxed space-y-3">
        <div>
          <p className="text-foreground font-semibold text-base mb-1">🧸 The Simple Version</p>
          <p>
            Imagine your Moon is a person sitting in a room. <strong className="text-foreground">Shadowing Moons</strong> are other planets that are close enough to knock on the door, 
            peek through the window, or even sit right next to your Moon on the couch. Each planet that "touches" your Moon adds its own flavor to how you feel things. 
            Your primary Moon archetype is still YOU — but these shadows add extra colors to your emotional palette. Think of it like this: your Moon is chocolate ice cream, 
            and each shadowing planet sprinkles something on top — caramel, nuts, sea salt. You're still chocolate, but you taste different because of what's on you.
          </p>
        </div>
        <div>
          <p className="text-foreground font-semibold text-base mb-1">🔮 The Deeper Truth</p>
          <p>
            In Raven Kaldera's system, any planet forming a major aspect (conjunction, opposition, square, trine, or sextile) to your natal Moon casts an archetypal "shadow." 
            The planet's <em>ruled sign(s)</em> become secondary archetypes layered onto your primary birth Moon. These shadows don't replace your Moon — they 
            <strong className="text-foreground"> complicate it, enrich it, and sometimes challenge it</strong>. A tighter orb (fewer degrees of separation) means a stronger, 
            more unavoidable shadow. The type of aspect determines <em>how</em> you experience that shadow — read each one below to understand exactly how it works in your body and life.
          </p>
        </div>
      </div>

      {shadows.map((shadow) => {
        const explanation = SHADOWING_EXPLANATION[shadow.aspect];
        return (
        <div key={shadow.planet} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedShadow(prev => prev === shadow.planet ? null : shadow.planet)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{PLANET_SYMBOLS[shadow.planet] || '•'}</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {shadow.planet} {ASPECT_SYMBOLS[shadow.aspect] || ''} Moon
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    ({shadow.aspect}, {shadow.orb}° orb)
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Shadows from: {shadow.ruledSigns.map(s => `${SIGN_GLYPHS[s]} ${s}`).join(' & ')}
                  {' → '}{shadow.archetypes.map(a => a.archetype.name).join(' & ')}
                </p>
              </div>
            </div>
            {expandedShadow === shadow.planet ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>

          {expandedShadow === shadow.planet && explanation && (
            <div className="px-3 pb-3 space-y-3">
              {/* Simple explanation */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-[10px] font-medium text-primary uppercase tracking-wide mb-1">🧸 In Simple Terms</p>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>{shadow.planet}</strong> {explanation.simple}
                </p>
              </div>

              {/* How you feel it */}
              <div className="p-3 rounded-lg bg-accent/20 border border-accent/30">
                <p className="text-[10px] font-medium text-accent-foreground uppercase tracking-wide mb-1">💫 How You Feel It</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {explanation.felt}
                </p>
              </div>

              {/* Guru deep dive */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">📚 The Full Teaching</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {explanation.guru}
                </p>
              </div>

              {shadow.archetypes.map(({ sign, archetype }) => (
                <div
                  key={sign}
                  className="p-3 rounded-lg bg-accent/30 border border-accent/40 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelectedArchetype({ archetype, sign })}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{SIGN_GLYPHS[sign]}</span>
                    <span className="text-sm font-serif font-semibold text-foreground">{archetype.name}</span>
                    <Badge variant="outline" className="text-[8px]">Shadow</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{archetype.essence}</p>
                  <p className="text-[10px] text-primary mt-1.5">
                    This {shadow.aspect} from {shadow.planet} means you also carry the energy of the {archetype.name}. Tap to read the full archetype →
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}

      <ArchetypeDetailModal
        archetype={selectedArchetype?.archetype ?? null}
        phase={phase}
        sign={selectedArchetype?.sign ?? ''}
        open={!!selectedArchetype}
        onClose={() => setSelectedArchetype(null)}
      />

      <p className="text-[10px] text-muted-foreground italic">
        — Raven Kaldera, Moon Phase Astrology · "Shadowing Moons" concept
      </p>
    </div>
  );
}

/** Kaldera archetypes grid for an expanded phase card */
function KalderaArchetypesSection({ phase, userMoonSign }: { phase: string; userMoonSign?: string }) {
  const [open, setOpen] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<{ archetype: MoonArchetype; sign: string } | null>(null);
  const archetypes = getArchetypesForPhase(phase);
  const chapterTitle = PHASE_CHAPTER_TITLES[phase];
  const userArchetype = userMoonSign ? getKalderaArchetype(phase, userMoonSign) : null;

  return (
    <div className="space-y-3">
      {userArchetype && userMoonSign && (
        <div
          className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setSelectedArchetype({ archetype: userArchetype, sign: userMoonSign })}
        >
          <p className="text-[10px] font-medium text-primary uppercase tracking-wide mb-1">☽ Your Moon Archetype — tap to read more</p>
          <p className="text-sm font-serif font-semibold text-foreground">
            {userArchetype.name} <span className="text-muted-foreground font-normal text-xs">({phase} in {userMoonSign})</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{userArchetype.essence}</p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">— Raven Kaldera</p>
        </div>
      )}

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full">
          <span>☽ All 12 {chapterTitle ? `"${chapterTitle}"` : phase} Archetypes</span>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {archetypes.map(({ sign, archetype }) => {
              const isUser = sign === userMoonSign;
              return (
                <div
                  key={sign}
                  onClick={() => setSelectedArchetype({ archetype, sign })}
                  className={`p-2.5 rounded-lg border text-xs transition-colors cursor-pointer hover:shadow-md ${
                    isUser ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{SIGN_GLYPHS[sign] || ''}</span>
                    <span className="font-semibold text-foreground">{archetype.name}</span>
                    {isUser && <Badge variant="default" className="text-[8px] px-1 py-0">You</Badge>}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{archetype.essence}</p>
                  <p className="text-[9px] text-primary mt-1">Tap to read more →</p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">— Raven Kaldera, Moon Phase Astrology</p>
        </CollapsibleContent>
      </Collapsible>

      <ArchetypeDetailModal
        archetype={selectedArchetype?.archetype ?? null}
        phase={phase}
        sign={selectedArchetype?.sign ?? ''}
        open={!!selectedArchetype}
        onClose={() => setSelectedArchetype(null)}
      />
    </div>
  );
}

/** Forrest phase insight section */
function ForrestPhaseInsight({ phase }: { phase: string }) {
  const data = getForrestPhaseData(phase);
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-accent/50 border border-accent">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px]">{data.evolutionaryKeyword}</Badge>
          <span className="text-[10px] text-muted-foreground">Evolutionary Keyword</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">{data.forrestInsight}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ HIGH EXPRESSION</p>
          <p className="text-xs text-foreground leading-relaxed">{data.highExpression}</p>
        </div>
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">🌑 SHADOW</p>
          <p className="text-xs text-foreground leading-relaxed">{data.darkSide}</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        🔗 {data.rudhyarLineage}
      </p>
      <p className="text-[10px] text-muted-foreground italic">— Steven Forrest, The Book of the Moon</p>
    </div>
  );
}

/** Forrest Moon-in-sign + Moon-in-house section for natal chart */
function ForrestNatalMoonSection({ chart }: { chart: NatalChart }) {
  const moonSign = chart.planets.Moon?.sign;
  const moonHouseNum = getNatalPlanetHouse('Moon', chart);
  const signData = moonSign ? getForrestMoonSign(moonSign) : undefined;
  const houseData = typeof moonHouseNum === 'number' ? getForrestMoonHouse(moonHouseNum) : undefined;

  if (!signData && !houseData) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        Steven Forrest's Evolutionary Moon
      </h4>

      {signData && (
        <div className="p-3 rounded-lg bg-secondary/50 border border-secondary space-y-2">
          <p className="text-xs font-semibold text-foreground">☽ Moon in {signData.sign}</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div><span className="text-muted-foreground">Evolutionary Goal:</span> <span className="text-foreground">{signData.evolutionaryGoal}</span></div>
            <div><span className="text-muted-foreground">Mood:</span> <span className="text-foreground">{signData.mood}</span></div>
            <div><span className="text-muted-foreground">Reigning Need:</span> <span className="text-foreground">{signData.reigningNeed}</span></div>
            <div><span className="text-muted-foreground">Secret of Happiness:</span> <span className="text-foreground">{signData.secretOfHappiness}</span></div>
            <div><span className="text-muted-foreground">Shadow:</span> <span className="text-foreground">{signData.shadow}</span></div>
          </div>
        </div>
      )}

      {houseData && (
        <div className="p-3 rounded-lg bg-accent/30 border border-accent space-y-2">
          <p className="text-xs font-semibold text-foreground">☽ Moon in the {houseData.house}{houseData.house === 1 ? 'st' : houseData.house === 2 ? 'nd' : houseData.house === 3 ? 'rd' : 'th'} House</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div><span className="text-muted-foreground">Soul Intention:</span> <span className="text-foreground">{houseData.soulIntention}</span></div>
            <div><span className="text-muted-foreground">Mood Sensitive To:</span> <span className="text-foreground">{houseData.moodSensitiveTo}</span></div>
            <div><span className="text-muted-foreground">Reigning Need:</span> <span className="text-foreground">{houseData.reigningNeed}</span></div>
            <div><span className="text-muted-foreground">Critical Whimsy:</span> <span className="text-foreground">{houseData.criticalWhimsy}</span></div>
            <div><span className="text-muted-foreground">Soul-cage:</span> <span className="text-foreground">{houseData.soulCage}</span></div>
          </div>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground italic">— Steven Forrest, The Book of the Moon</p>
    </div>
  );
}

export const MoonPhaseEncyclopedia = ({ userNatalChart, savedCharts }: MoonPhaseEncyclopediaProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string>(userNatalChart ? 'user' : '');
  const [expandedPhase, setExpandedPhase] = useState<BirthMoonPhase | null>(null);
  const [myMoonModal, setMyMoonModal] = useState(false);
  const [myMoonDeepDiveOpen, setMyMoonDeepDiveOpen] = useState(false);

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

    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const sunAbs = signs.indexOf(sun.sign) * 30 + sun.degree;
    const moonAbs = signs.indexOf(moon.sign) * 30 + moon.degree;
    let separation = moonAbs - sunAbs;
    if (separation < 0) separation += 360;

    return { ...result, separation: Math.round(separation * 10) / 10 };
  }, [selectedChart]);

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

  const transitingMoon = useMemo(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    const positions = getPlanetaryPositions(now);
    const moonPos = positions.moon;
    const sign = moonPos?.signName || 'Unknown';
    const phaseName = phase.phaseName;
    const archetype = getKalderaArchetype(phaseName, sign);
    return {
      sign,
      degree: moonPos?.degree ?? 0,
      minutes: moonPos?.minutes ?? 0,
      phaseName,
      emoji: PHASE_EMOJIS[phaseName] || '🌙',
      illumination: phase.illumination,
      archetype,
    };
  }, []);

  const userMoonSign = selectedChart?.planets.Moon?.sign;

  // "Find My Moon" archetype for the selected chart
  const myArchetype = useMemo(() => {
    if (!natalPhaseResult || !userMoonSign) return null;
    const archetype = getKalderaArchetype(natalPhaseResult.phase, userMoonSign);
    if (!archetype) return null;
    return { archetype, phase: natalPhaseResult.phase, sign: userMoonSign };
  }, [natalPhaseResult, userMoonSign]);

  // Shadowing moons for selected chart
  const shadowingMoons = useMemo(() => {
    if (!selectedChart || !myArchetype) return [];
    return computeShadowingMoons(selectedChart, myArchetype.phase);
  }, [selectedChart, myArchetype]);

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

      {/* "Find My Moon" Banner — with Kaldera name prominently shown */}
      {myArchetype && selectedChart && natalPhaseResult && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{PHASE_EMOJIS[myArchetype.phase] || '🌙'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="default" className="text-[10px]">
                    <Sparkles size={10} className="mr-1" />
                    Your Moon Archetype
                  </Badge>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-1">
                  {selectedChart.name} — <span className="text-primary">{myArchetype.archetype.name}</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{myArchetype.phase}</span> in <span className="font-medium text-foreground">{SIGN_GLYPHS[myArchetype.sign]} {myArchetype.sign}</span>
                  {' · '}{PHASE_CHAPTER_TITLES[myArchetype.phase] && <span className="italic">"{PHASE_CHAPTER_TITLES[myArchetype.phase]}"</span>}
                </p>

                {/* Explanation of where the name comes from */}
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground mb-1">Where does "{myArchetype.archetype.name}" come from?</p>
                  <p>
                    Raven Kaldera's <em>Moon Phase Astrology</em> identifies 96 unique lunar archetypes — one for each combination of the 8 Moon phases × 12 zodiac signs.
                    Your Sun–Moon separation is <span className="font-mono text-foreground">{natalPhaseResult.separation}°</span>, placing you in the <strong className="text-foreground">{myArchetype.phase}</strong> phase
                    ({PHASE_ORDER.find(p => p.phase === myArchetype.phase)?.degreeRange}).
                    Combined with your Moon in <strong className="text-foreground">{SIGN_GLYPHS[myArchetype.sign]} {myArchetype.sign}</strong>,
                    your specific archetype is <strong className="text-primary">{myArchetype.archetype.name}</strong>.
                  </p>
                  <p className="mt-2">
                    The generic Balsamic phase archetype is sometimes called "The Mystic" — but that's the <em>phase-level</em> label (all Balsamic Moons share mystical, completion-oriented energy).
                    Your <em>specific</em> archetype — <strong className="text-primary">{myArchetype.archetype.name}</strong> — is unique to {myArchetype.phase} + {myArchetype.sign} and carries
                    its own distinct gifts, wounds, and sacred purpose. The Mystic's Moon (Balsamic Pisces) is a different archetype entirely.
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{myArchetype.archetype.essence}</p>

                {/* Collapsible deep dive */}
                <Collapsible open={myMoonDeepDiveOpen} onOpenChange={setMyMoonDeepDiveOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary font-medium mt-3 cursor-pointer hover:underline">
                    {myMoonDeepDiveOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {myMoonDeepDiveOpen ? 'Collapse deep dive' : `Read your full ${myArchetype.archetype.name} deep dive ↓`}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 space-y-4">
                      {myArchetype.archetype.description.split('\n\n').map((para, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground">{para}</p>
                      ))}

                      {myArchetype.archetype.coreWound && (
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">💔 CORE WOUND</p>
                          <p className="text-sm text-foreground leading-relaxed">{myArchetype.archetype.coreWound}</p>
                        </div>
                      )}
                      {myArchetype.archetype.healingPath && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">🌿 HEALING PATH</p>
                          <p className="text-sm text-foreground leading-relaxed">{myArchetype.archetype.healingPath}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-[10px] font-medium text-muted-foreground mb-2">✦ GIFTS</p>
                          <ul className="space-y-1">
                            {myArchetype.archetype.gifts.map((g, i) => (
                              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                <span className="text-primary mt-0.5">•</span> {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-[10px] font-medium text-muted-foreground mb-2">⚠ CHALLENGES</p>
                          <ul className="space-y-1">
                            {myArchetype.archetype.challenges.map((c, i) => (
                              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                <span className="text-destructive mt-0.5">•</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {myArchetype.archetype.inTheBody && (
                        <div className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">🫀 IN THE BODY</p>
                          <p className="text-sm text-foreground leading-relaxed">{myArchetype.archetype.inTheBody}</p>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">🔮 SOUL LESSON</p>
                        <p className="text-sm text-foreground leading-relaxed italic">{myArchetype.archetype.soulLesson}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 border border-secondary">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">💕 IN RELATIONSHIPS</p>
                        <p className="text-sm text-foreground leading-relaxed">{myArchetype.archetype.inRelationships}</p>
                      </div>
                      {myArchetype.archetype.sacredPurpose && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">🌟 SACRED PURPOSE</p>
                          <p className="text-sm text-foreground leading-relaxed">{myArchetype.archetype.sacredPurpose}</p>
                        </div>
                      )}
                      {myArchetype.archetype.shadowExpression && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">🌑 SHADOW EXPRESSION</p>
                          <p className="text-sm text-foreground leading-relaxed">{myArchetype.archetype.shadowExpression}</p>
                        </div>
                      )}
                      {myArchetype.archetype.affirmation && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                          <p className="text-[10px] font-medium text-muted-foreground mb-2">✨ AFFIRMATION</p>
                          <p className="text-base font-serif italic text-foreground leading-relaxed">"{myArchetype.archetype.affirmation}"</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground italic">— Raven Kaldera, Moon Phase Astrology</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shadowing Moons — planets aspecting natal Moon */}
      {selectedChart && myArchetype && shadowingMoons.length > 0 && (
        <Card className="border-accent/30">
          <CardContent className="p-5">
            <ShadowingMoonsSection chart={selectedChart} phase={myArchetype.phase} />
          </CardContent>
        </Card>
      )}

      {/* Today's Transiting Moon — with archetype */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 flex-wrap">
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
                <span className="text-foreground font-medium">{SIGN_GLYPHS[transitingMoon.sign]} {transitingMoon.sign}</span>
                {' · '}
                <span className="font-mono text-xs">{transitingMoon.degree}°{transitingMoon.minutes.toString().padStart(2, '0')}'</span>
                {' · '}
                {Math.round(transitingMoon.illumination * 100)}% illuminated
              </p>
              {transitingMoon.archetype && (
                <div className="mt-3 p-3 rounded-lg bg-accent/20 border border-accent/30">
                  <p className="text-xs font-medium text-foreground mb-1">
                    Today's Archetype: <span className="font-serif text-primary">{transitingMoon.archetype.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{transitingMoon.archetype.essence}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    The collective mood today carries the energy of the {transitingMoon.archetype.name} — {transitingMoon.phaseName} in {transitingMoon.sign}.
                  </p>
                </div>
              )}
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
                  {myArchetype && (
                    <span className="text-muted-foreground text-sm font-normal ml-2">
                      ({myArchetype.archetype.name})
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sun–Moon separation: <span className="font-mono text-foreground">{natalPhaseResult.separation}°</span>
                  {' · '}Phase archetype: {natalPhaseResult.archetype}
                  {myArchetype && natalPhaseResult.archetype !== myArchetype.archetype.name && (
                    <span> · Kaldera archetype: <span className="text-primary font-medium">{myArchetype.archetype.name}</span></span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forrest Moon-in-sign + Moon-in-house for selected chart */}
      {selectedChart && <ForrestNatalMoonSection chart={selectedChart} />}

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
                  <div className="mt-4 pt-4 border-t border-border space-y-5 text-sm" onClick={e => e.stopPropagation()}>
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
                      <div className="p-3 rounded bg-primary/5 border border-primary/20">
                        <h4 className="text-xs uppercase tracking-widest text-primary mb-1">
                          Your Position: {getPositionLabel(natalPhaseResult.separation, minDeg, maxDeg)} {phase}
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed">
                          At {natalPhaseResult.separation}° Sun–Moon separation, you're in the <strong>{getPositionLabel(natalPhaseResult.separation, minDeg, maxDeg)}</strong> portion of this phase.{' '}
                          {POSITION_MEANINGS[getPositionLabel(natalPhaseResult.separation, minDeg, maxDeg)]}
                        </p>
                      </div>
                    )}

                    <Separator />
                    <ForrestPhaseInsight phase={phase} />

                    <Separator />
                    <KalderaArchetypesSection phase={phase} userMoonSign={userMoonSign} />
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
