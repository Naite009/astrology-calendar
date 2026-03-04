import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronDown, Check } from "lucide-react";
import type { NatalChart } from "@/hooks/useNatalChart";
import { normalizeName } from "@/lib/nameMatching";
import { getRetrogradePeriods, getRetrogradeStatus, type RetrogradeInfo } from "@/lib/retrogradePatterns";
import * as Astronomy from "astronomy-engine";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface PlanetRetrogradeGuideProps {
  planet: string;
  allCharts: NatalChart[];
  primaryUserName?: string;
}

// ─── PLANET DATA ─────────────────────────────────────────────────────────────

const SIGN_ORDER = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"] as const;

const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const PLANET_GLYPHS: Record<string, string> = {
  Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const PLANET_COLORS: Record<string, { gradient: string; border: string; accent: string }> = {
  Venus: { gradient: "from-pink-950 via-rose-950/50 to-pink-950", border: "border-pink-500/40", accent: "text-pink-300" },
  Mars: { gradient: "from-red-950 via-orange-950/50 to-red-950", border: "border-red-500/40", accent: "text-red-300" },
  Jupiter: { gradient: "from-purple-950 via-violet-950/50 to-purple-950", border: "border-purple-500/40", accent: "text-purple-300" },
  Saturn: { gradient: "from-stone-950 via-slate-950/50 to-stone-950", border: "border-stone-500/40", accent: "text-stone-300" },
  Uranus: { gradient: "from-cyan-950 via-teal-950/50 to-cyan-950", border: "border-cyan-500/40", accent: "text-cyan-300" },
  Neptune: { gradient: "from-blue-950 via-indigo-950/50 to-blue-950", border: "border-blue-500/40", accent: "text-blue-300" },
  Pluto: { gradient: "from-slate-950 via-zinc-950/50 to-slate-950", border: "border-zinc-500/40", accent: "text-zinc-300" },
};

const PLANET_INFO: Record<string, {
  who: string;
  frequency: string;
  duration: string;
  themes: string[];
  keywords: string[];
  dignity: { domicile: string; exaltation: string; detriment: string; fall: string };
  doList: string[];
  dontList: string[];
  signMeanings: Record<string, string>;
}> = {
  Venus: {
    who: "Venus is the goddess of love, beauty, values, and pleasure. She governs how we relate, what we find beautiful, how we handle money, and what brings us joy. Venus shows your love language, your aesthetic, and your relationship to self-worth. When Venus retrogrades, our values undergo review — old lovers may return, financial decisions need reassessment, and what we once found beautiful may lose its luster.",
    frequency: "Venus retrogrades approximately every 18 months, making it one of the rarest personal planet retrogrades. Each retrograde lasts about 40 days.",
    duration: "~40 days retrograde, with pre and post-shadow extending the cycle to roughly 3-4 months total.",
    themes: ["Past relationships and lovers returning", "Reassessing values and self-worth", "Financial review and budget restructuring", "Beauty and aesthetic changes", "Questioning what truly brings pleasure", "Reconciliation or final closure in relationships"],
    keywords: ["Love", "Beauty", "Values", "Money", "Relationships", "Pleasure", "Harmony", "Art", "Self-Worth", "Attraction", "Femininity", "Diplomacy", "Sensuality", "Comfort"],
    dignity: { domicile: "Taurus · Libra", exaltation: "Pisces", detriment: "Scorpio · Aries", fall: "Virgo" },
    doList: ["Reflect on what and who you truly value", "Revisit creative projects with fresh eyes", "Reconnect with old friends (carefully with exes)", "Review your budget and financial habits", "Explore what beauty means to you now", "Practice radical self-love and self-worth"],
    dontList: ["Start new romantic relationships", "Get cosmetic procedures or drastic style changes", "Make major purchases (especially luxury items)", "Sign financial contracts if avoidable", "Ignore recurring relationship patterns"],
    signMeanings: {
      Aries: "Venus retrograde in Aries: Reassessing passion, independence in relationships, and how you assert your desires. Do you fight for what you love?",
      Taurus: "Venus retrograde in Taurus (domicile): Deep review of comfort, security, and sensual pleasures. What do you truly need to feel safe and loved?",
      Gemini: "Venus retrograde in Gemini: Communication in relationships under review. Reconnecting through words, letters, and conversations.",
      Cancer: "Venus retrograde in Cancer: Emotional security in love. Family relationships and nurturing patterns revisited.",
      Leo: "Venus retrograde in Leo: Romance, creativity, and self-expression in love reviewed. Past creative flames reignite.",
      Virgo: "Venus retrograde in Virgo (fall): Love becomes analytical. Critiquing relationships can heal or harm — choose wisely.",
      Libra: "Venus retrograde in Libra (domicile): Partnerships undergo deep review. Balance, fairness, and commitment questioned.",
      Scorpio: "Venus retrograde in Scorpio (detriment): Intense emotional reckoning in love. Jealousy, trust, and power dynamics surface.",
      Sagittarius: "Venus retrograde in Sagittarius: Freedom vs. commitment tension. Cross-cultural relationships and philosophical values reassessed.",
      Capricorn: "Venus retrograde in Capricorn: Love meets ambition. Professional relationships and status in partnerships reviewed.",
      Aquarius: "Venus retrograde in Aquarius: Unconventional relationships reviewed. Friendship vs. romance boundaries blur.",
      Pisces: "Venus retrograde in Pisces (exaltation): Transcendent love. Spiritual connections return. Idealism in love peaks and may shatter beautifully.",
    },
  },
  Mars: {
    who: "Mars is the warrior — the planet of action, drive, desire, anger, and physical vitality. Mars governs how you assert yourself, fight for what you want, and express your sexual energy. When Mars retrogrades, the engine of action goes into review mode. Energy levels drop, anger may simmer beneath the surface, and past conflicts resurface for resolution. This is NOT the time to start wars — it's the time to understand why you fight.",
    frequency: "Mars retrogrades approximately every 2 years and 2 months, lasting about 2.5 months — making it relatively rare.",
    duration: "~70-80 days retrograde, with pre and post-shadow extending the total cycle to roughly 6-7 months.",
    themes: ["Energy levels fluctuating dramatically", "Past conflicts and anger resurfacing", "Reassessing how you assert yourself", "Sexual desire patterns shifting", "Physical health and exercise review", "Delayed or stalled projects"],
    keywords: ["Action", "Drive", "Anger", "Desire", "Courage", "Competition", "Physical Energy", "Sexuality", "Assertiveness", "Warrior", "Conflict", "Initiative", "Muscle", "Heat"],
    dignity: { domicile: "Aries · Scorpio", exaltation: "Capricorn", detriment: "Libra · Taurus", fall: "Cancer" },
    doList: ["Review physical health routines and fitness goals", "Process old anger through therapy, journaling, or art", "Revisit stalled projects with strategic thinking", "Practice martial arts, yoga, or controlled physical activity", "Address conflict patterns in relationships honestly", "Rest when your body asks — Mars Rx can drain energy"],
    dontList: ["Start major new projects or ventures", "Pick fights or force confrontations", "Have elective surgery if avoidable", "Push through exhaustion — you'll burn out", "Make aggressive financial moves", "Ignore simmering resentments — they'll explode later"],
    signMeanings: {
      Aries: "Mars retrograde in Aries (domicile): Identity crisis around action. Who are you when you can't charge forward?",
      Taurus: "Mars retrograde in Taurus (detriment): Slowed to a crawl. Financial aggression reviewed. Stubbornness examined.",
      Gemini: "Mars retrograde in Gemini: Words become weapons — review how you argue. Mental energy scattered.",
      Cancer: "Mars retrograde in Cancer (fall): Passive-aggressive patterns surface. Family anger needs processing.",
      Leo: "Mars retrograde in Leo: Creative drive stalls. Ego battles revisited. Reclaiming authentic self-expression.",
      Virgo: "Mars retrograde in Virgo: Perfectionism exhausts. Work habits and health routines under critical review.",
      Libra: "Mars retrograde in Libra (detriment): Conflict avoidance doesn't work anymore. Relationship assertiveness reviewed.",
      Scorpio: "Mars retrograde in Scorpio (domicile): Intense psychological reckoning. Power dynamics, sexuality, and hidden anger surface.",
      Sagittarius: "Mars retrograde in Sagittarius: Philosophical battles. Righteous anger needs tempering. Travel plans disrupted.",
      Capricorn: "Mars retrograde in Capricorn (exaltation): Career ambition reviewed. Authority issues surface. Strategic patience required.",
      Aquarius: "Mars retrograde in Aquarius: Collective action stalls. Rebellion reviewed. Innovation needs patience.",
      Pisces: "Mars retrograde in Pisces: Anger dissolves into confusion. Spiritual warrior emerges. Passive resistance replaces aggression.",
    },
  },
  Jupiter: {
    who: "Jupiter is the great benefic — the planet of expansion, wisdom, faith, abundance, and higher meaning. Jupiter governs growth, optimism, travel, higher education, philosophy, and luck. When Jupiter retrogrades, external expansion pauses while inner growth accelerates. This is a time to develop your own philosophy rather than following others', and to find abundance within before seeking it without.",
    frequency: "Jupiter retrogrades once a year for approximately 4 months — it's retrograde about 30% of the time.",
    duration: "~4 months retrograde. Because Jupiter retrogrades so frequently, many people are born with Jupiter retrograde natally.",
    themes: ["Inner growth and philosophical reflection", "Reassessing beliefs and faith systems", "Reviewing educational and travel plans", "Questioning what 'abundance' truly means", "Spiritual development turning inward", "Legal matters needing review"],
    keywords: ["Expansion", "Wisdom", "Faith", "Abundance", "Philosophy", "Travel", "Higher Education", "Optimism", "Generosity", "Justice", "Growth", "Vision", "Guru", "Blessing"],
    dignity: { domicile: "Sagittarius · Pisces", exaltation: "Cancer", detriment: "Gemini · Virgo", fall: "Capricorn" },
    doList: ["Reflect on your personal philosophy and beliefs", "Journal about what abundance truly means to you", "Review educational goals and study plans", "Develop inner faith and spiritual practices", "Reassess financial growth strategies", "Travel inwardly — meditation, retreats, contemplation"],
    dontList: ["Over-expand or take excessive risks", "Sign up for programs without thorough research", "Assume luck will carry you — do the work", "Ignore philosophical doubts — they're growth signals", "Make major legal decisions without careful review"],
    signMeanings: {
      Aries: "Jupiter retrograde in Aries: Reconsidering bold initiatives. Is your confidence authentic or performative?",
      Taurus: "Jupiter retrograde in Taurus: Material abundance reviewed. What do you truly need vs. what is excess?",
      Gemini: "Jupiter retrograde in Gemini (detriment): Information overload pauses. Quality over quantity in learning.",
      Cancer: "Jupiter retrograde in Cancer (exaltation): Deep emotional wisdom surfaces. Family blessings recognized.",
      Leo: "Jupiter retrograde in Leo: Creative expansion turns inward. Generosity and ego examined.",
      Virgo: "Jupiter retrograde in Virgo (detriment): Growth through service and health. Small improvements over grand gestures.",
      Libra: "Jupiter retrograde in Libra: Relationship growth reviewed. Justice and fairness in partnerships reconsidered.",
      Scorpio: "Jupiter retrograde in Scorpio: Deep psychological expansion. Hidden wealth — emotional and financial — surfaces.",
      Sagittarius: "Jupiter retrograde in Sagittarius (domicile): Ultimate philosophical review. What do you truly believe?",
      Capricorn: "Jupiter retrograde in Capricorn (fall): Growth meets limitation. Building sustainable structures over quick wins.",
      Aquarius: "Jupiter retrograde in Aquarius: Social vision reviewed. Community involvement and humanitarian goals reconsidered.",
      Pisces: "Jupiter retrograde in Pisces (domicile): Spiritual expansion deepens. Dreams carry profound wisdom.",
    },
  },
  Saturn: {
    who: "Saturn is the great teacher — the planet of discipline, structure, responsibility, karma, and time. Saturn governs boundaries, authority, maturity, and the hard lessons that build lasting wisdom. When Saturn retrogrades, external authority structures loosen while internal accountability deepens. Rules that felt imposed from outside become opportunities for self-discipline. Karmic debts come due — but so do karmic rewards.",
    frequency: "Saturn retrogrades once a year for approximately 4.5 months — retrograde about 36% of the time.",
    duration: "~4.5 months retrograde. Like Jupiter, many people are born with Saturn retrograde, giving them an internalized sense of discipline.",
    themes: ["Reviewing responsibilities and commitments", "Reassessing career structures and authority", "Karmic patterns surfacing for resolution", "Boundaries needing redefinition", "Authority relationships under review", "Time management and life priorities reconsidered"],
    keywords: ["Discipline", "Structure", "Responsibility", "Karma", "Time", "Authority", "Maturity", "Limitation", "Boundaries", "Mastery", "Patience", "Legacy", "Father", "Bones"],
    dignity: { domicile: "Capricorn · Aquarius", exaltation: "Libra", detriment: "Cancer · Leo", fall: "Aries" },
    doList: ["Review your commitments — are they aligned with your values?", "Reassess career goals and professional boundaries", "Address authority issues with maturity", "Practice self-discipline without self-punishment", "Reflect on karmic patterns repeating in your life", "Build internal structure rather than relying on external rules"],
    dontList: ["Start new major business ventures", "Make binding commitments without thorough review", "Ignore responsibilities — they compound", "Resist necessary endings", "Fight authority for the sake of rebellion"],
    signMeanings: {
      Aries: "Saturn retrograde in Aries (fall): Identity structures tested. Impulsive action meets necessary patience.",
      Taurus: "Saturn retrograde in Taurus: Financial and material structures reviewed. Building lasting security.",
      Gemini: "Saturn retrograde in Gemini: Communication commitments assessed. Mental discipline developed.",
      Cancer: "Saturn retrograde in Cancer (detriment): Family obligations weigh heavily. Emotional boundaries needed.",
      Leo: "Saturn retrograde in Leo (detriment): Creative authority tested. Leadership responsibilities reviewed.",
      Virgo: "Saturn retrograde in Virgo: Health routines and work structures undergo serious review.",
      Libra: "Saturn retrograde in Libra (exaltation): Relationship commitments crystallize. Justice and fairness deepened.",
      Scorpio: "Saturn retrograde in Scorpio: Deep structural transformation. Financial entanglements and power structures reviewed.",
      Sagittarius: "Saturn retrograde in Sagittarius: Belief systems tested for integrity. Educational commitments assessed.",
      Capricorn: "Saturn retrograde in Capricorn (domicile): The ultimate career and life-structure review. What legacy are you building?",
      Aquarius: "Saturn retrograde in Aquarius (domicile): Social structures and collective responsibilities reviewed.",
      Pisces: "Saturn retrograde in Pisces: Spiritual discipline deepened. Dissolving structures that no longer serve.",
    },
  },
  Uranus: {
    who: "Uranus is the awakener — the planet of revolution, innovation, sudden change, and liberation. Uranus shatters what's stagnant and introduces the radically new. It governs technology, rebellion, genius, and freedom. When Uranus retrogrades, external disruptions slow while internal revolution accelerates. You process past upheavals and prepare for the next wave of change from within.",
    frequency: "Uranus retrogrades once a year for approximately 5 months — retrograde about 40% of the time.",
    duration: "~5 months retrograde. Because Uranus spends so much time retrograde, its effects are more subtle and internal.",
    themes: ["Processing past upheavals and sudden changes", "Internal revolution and awakening", "Reviewing relationship to freedom and independence", "Technology and innovation turned inward", "Questioning where you conform vs. rebel", "Integration of radical changes from the past year"],
    keywords: ["Revolution", "Innovation", "Freedom", "Awakening", "Technology", "Rebellion", "Genius", "Disruption", "Independence", "Electricity", "Future", "Eccentric", "Liberation", "Shock"],
    dignity: { domicile: "Aquarius", exaltation: "Scorpio (modern)", detriment: "Leo", fall: "Taurus (modern)" },
    doList: ["Reflect on changes you've resisted — are they actually liberating?", "Innovate internally before implementing externally", "Question assumptions and habitual thinking", "Embrace your uniqueness and eccentricities", "Review your relationship to technology", "Process any sudden changes from the past months"],
    dontList: ["Force radical external changes", "Rebel without a clear purpose", "Make impulsive decisions in the name of freedom", "Ignore the need for stability alongside change", "Dismiss conventional wisdom entirely"],
    signMeanings: {
      Aries: "Uranus retrograde in Aries: Identity revolution internalized. Who are you becoming?",
      Taurus: "Uranus retrograde in Taurus (fall): Financial and value revolution deepens. Material stability questioned from within.",
      Gemini: "Uranus retrograde in Gemini: Communication revolution. New ways of thinking process internally.",
      Cancer: "Uranus retrograde in Cancer: Home and family structures quietly revolutionized from within.",
      Leo: "Uranus retrograde in Leo (detriment): Creative and self-expression revolution turns inward.",
      Virgo: "Uranus retrograde in Virgo: Health and work innovation internalized. Systems thinking deepened.",
      Libra: "Uranus retrograde in Libra: Relationship revolution processed. New partnership paradigms gestating.",
      Scorpio: "Uranus retrograde in Scorpio (exaltation): Deep psychological revolution. Transformation of power structures from within.",
      Sagittarius: "Uranus retrograde in Sagittarius: Philosophical revolution internalized. Belief systems radically updated.",
      Capricorn: "Uranus retrograde in Capricorn: Institutional revolution. Career structures quietly reformed.",
      Aquarius: "Uranus retrograde in Aquarius (domicile): Social revolution deepens. Humanitarian vision refined internally.",
      Pisces: "Uranus retrograde in Pisces: Spiritual revolution. Mystical breakthroughs process through dreams and intuition.",
    },
  },
  Neptune: {
    who: "Neptune is the mystic — the planet of dreams, intuition, spirituality, imagination, and dissolution. Neptune governs the unseen realms: the subconscious, collective unconscious, artistic inspiration, and spiritual transcendence. But Neptune also rules illusion, deception, and escapism. When Neptune retrogrades, the fog lifts slightly — you see more clearly what was hidden, both beautiful and deceptive. Inner spiritual work deepens while external illusions may dissolve.",
    frequency: "Neptune retrogrades once a year for approximately 5-6 months — retrograde about 40% of the time.",
    duration: "~5-6 months retrograde. Neptune moves so slowly that its retrograde effects are generational and subtle, operating below conscious awareness.",
    themes: ["Illusions and deceptions becoming clearer", "Spiritual practices deepening", "Creative inspiration turning inward", "Boundaries between self and other clarifying", "Addiction patterns surfacing for healing", "Dreams becoming more vivid and meaningful"],
    keywords: ["Dreams", "Intuition", "Spirituality", "Imagination", "Illusion", "Compassion", "Dissolution", "Mysticism", "Art", "Music", "Escapism", "Transcendence", "Ocean", "Fog"],
    dignity: { domicile: "Pisces", exaltation: "Cancer/Leo (debated)", detriment: "Virgo", fall: "Capricorn/Aquarius (debated)" },
    doList: ["Deepen meditation and spiritual practices", "Pay attention to dreams — keep a dream journal", "Create art, music, or poetry", "Practice discernment in relationships", "Address escapist habits honestly", "Spend time near water"],
    dontList: ["Ignore red flags in relationships", "Make major decisions based solely on intuition without grounding", "Increase substance use as escapism", "Sign contracts without careful review (confusion possible)", "Dismiss practical concerns for idealism"],
    signMeanings: {
      Aries: "Neptune retrograde in Aries: The spiritual warrior turns inward. Idealism about identity reviewed.",
      Taurus: "Neptune retrograde in Taurus: Material illusions dissolve. Spiritual relationship to money and body deepens.",
      Gemini: "Neptune retrograde in Gemini: Mental fog lifts slightly. Communication with the unseen deepens.",
      Cancer: "Neptune retrograde in Cancer: Emotional and family illusions clarify. Ancestral healing deepens.",
      Leo: "Neptune retrograde in Leo: Creative inspiration turns mystical. Performance vs. authenticity examined.",
      Virgo: "Neptune retrograde in Virgo (detriment): Health confusion may clarify. Spiritual service refined.",
      Libra: "Neptune retrograde in Libra: Relationship illusions dissolve. Seeing partners more clearly.",
      Scorpio: "Neptune retrograde in Scorpio: Deep unconscious material surfaces. Psychological and mystical depths explored.",
      Sagittarius: "Neptune retrograde in Sagittarius: Spiritual beliefs tested for authenticity. Guru projections withdrawn.",
      Capricorn: "Neptune retrograde in Capricorn: Institutional illusions dissolve. Career and ambition dreams reviewed.",
      Aquarius: "Neptune retrograde in Aquarius: Social idealism reviewed. Collective dreams need grounding.",
      Pisces: "Neptune retrograde in Pisces (domicile): The deepest spiritual retrograde. Boundless compassion and profound inner visions.",
    },
  },
  Pluto: {
    who: "Pluto is the transformer — the planet of death, rebirth, power, and the deepest psychological processes. Pluto governs what's buried, taboo, and profoundly transformative. It rules shared resources, inheritance, sexuality at its most primal, and the cycle of destruction and regeneration. When Pluto retrogrades, the relentless outer pressure of transformation turns inward. This is when you digest, process, and integrate the profound changes Pluto has been pushing.",
    frequency: "Pluto retrogrades once a year for approximately 5-6 months — retrograde about 44% of the time, the most of any planet.",
    duration: "~5-6 months retrograde. Pluto is retrograde so often that nearly half of all people have natal Pluto retrograde.",
    themes: ["Deep psychological transformation processing", "Power dynamics reviewed internally", "Control issues surfacing for release", "Past traumas processing at a deep level", "Shadow work and hidden material surfacing", "Generational and ancestral healing"],
    keywords: ["Transformation", "Power", "Death/Rebirth", "Shadow", "Depth", "Intensity", "Control", "Obsession", "Phoenix", "Underworld", "Taboo", "Wealth", "Regeneration", "Evolution"],
    dignity: { domicile: "Scorpio", exaltation: "Leo (modern)", detriment: "Taurus", fall: "Aquarius (modern)" },
    doList: ["Engage in deep shadow work and self-inquiry", "Process old traumas with professional support", "Examine power dynamics in your relationships", "Let go of what needs to die — control, grudges, identities", "Research, investigate, and dig deep", "Practice non-attachment to outcomes"],
    dontList: ["Force transformation on others", "Manipulate or use power plays", "Ignore psychological material surfacing", "Resist necessary endings", "Suppress intense emotions — they'll erupt"],
    signMeanings: {
      Aries: "Pluto retrograde in Aries: Identity transformation deepens. Who you're becoming goes through internal purification.",
      Taurus: "Pluto retrograde in Taurus (detriment): Material and value transformation processed. Wealth and possession attachments examined.",
      Gemini: "Pluto retrograde in Gemini: Communication power reviewed. Information as power dynamics examined.",
      Cancer: "Pluto retrograde in Cancer: Family and ancestral transformation deepens. Emotional power processed.",
      Leo: "Pluto retrograde in Leo (exaltation): Creative and self-expression transformation. Personal power refined.",
      Virgo: "Pluto retrograde in Virgo: Health transformation deepens. Service and work patterns undergo deep purification.",
      Libra: "Pluto retrograde in Libra: Relationship power dynamics reviewed at the deepest level.",
      Scorpio: "Pluto retrograde in Scorpio (domicile): The most intense inner transformation. Death and rebirth at the soul level.",
      Sagittarius: "Pluto retrograde in Sagittarius: Belief system transformation deepens. Philosophical power examined.",
      Capricorn: "Pluto retrograde in Capricorn: Institutional and career transformation processed. Authority structures examined.",
      Aquarius: "Pluto retrograde in Aquarius: Social transformation deepens. Collective power dynamics in review.",
      Pisces: "Pluto retrograde in Pisces: Spiritual transformation at the deepest level. Collective unconscious processing.",
    },
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getAscendantSign(chart: NatalChart): string {
  const asc = chart.planets?.Ascendant;
  if (!asc?.sign) return "none";
  return asc.sign.toLowerCase();
}

function getHouseOfSign(risingSign: string, targetSign: string): number | null {
  const rIdx = SIGN_ORDER.indexOf(risingSign as any);
  const tIdx = SIGN_ORDER.indexOf(targetSign as any);
  if (rIdx === -1 || tIdx === -1) return null;
  return ((tIdx - rIdx + 12) % 12) + 1;
}

const HOUSE_THEMES: Record<number, string> = {
  1: "identity, appearance, self-expression",
  2: "money, values, self-worth, possessions",
  3: "communication, siblings, learning, daily mind",
  4: "home, family, roots, emotional foundation",
  5: "creativity, romance, children, pleasure",
  6: "health, daily routines, work, service",
  7: "partnerships, marriage, one-on-one relationships",
  8: "shared resources, intimacy, transformation, other people's money",
  9: "higher education, travel, beliefs, philosophy",
  10: "career, public reputation, authority, legacy",
  11: "friends, community, hopes, networks",
  12: "subconscious, spirituality, hidden matters, retreat",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDeg(lon: number): string {
  const signIdx = Math.floor(lon / 30) % 12;
  const deg = lon % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return `${d}°${String(m).padStart(2,'0')}' ${signs[signIdx]}`;
}

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function AccordionCard({ icon, title, content, accentClass }: { icon: string; title: string; content: string; accentClass: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-xl border transition-all duration-300 cursor-pointer ${open ? `${accentClass} bg-white/5` : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-white">{title}</span>
        </div>
        <span className={`text-white/50 transition-transform duration-300 text-lg ${open ? "rotate-180" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-white/80 text-sm leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function PlanetRetrogradeGuide({ planet, allCharts, primaryUserName }: PlanetRetrogradeGuideProps) {
  const [selectedChartId, setSelectedChartId] = useState("none");
  const [activeSection, setActiveSection] = useState("learn");
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);
  const [chartSearch, setChartSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const info = PLANET_INFO[planet];
  const colors = PLANET_COLORS[planet] || PLANET_COLORS.Saturn;
  const glyph = PLANET_GLYPHS[planet] || "⊕";
  const body = PLANET_BODIES[planet];

  // Compute retrograde periods from ephemeris
  const periods = useMemo(() => {
    if (!body) return [];
    return getRetrogradePeriods(body, new Date());
  }, [body]);

  // Current status
  const currentStatus = useMemo(() => {
    if (!body) return null;
    return getRetrogradeStatus(new Date(), periods);
  }, [body, periods]);

  // Deduplicate charts
  const dedupedCharts = useMemo(() => {
    const nameMap = new Map<string, NatalChart>();
    for (const c of allCharts) {
      if (c.id.startsWith('hd_')) continue;
      const norm = normalizeName(c.name);
      if (!norm) continue;
      const existing = nameMap.get(norm);
      if (!existing) {
        nameMap.set(norm, c);
      } else {
        const existCount = existing.planets ? Object.keys(existing.planets).length : 0;
        const newCount = c.planets ? Object.keys(c.planets).length : 0;
        if (newCount > existCount) nameMap.set(norm, c);
      }
    }
    const primaryNorm = primaryUserName ? normalizeName(primaryUserName) : '';
    return Array.from(nameMap.values()).sort((a, b) => {
      const aIsUser = primaryNorm && normalizeName(a.name) === primaryNorm;
      const bIsUser = primaryNorm && normalizeName(b.name) === primaryNorm;
      if (aIsUser && !bIsUser) return -1;
      if (!aIsUser && bIsUser) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allCharts, primaryUserName]);

  const filteredCharts = useMemo(() => {
    if (!chartSearch.trim()) return dedupedCharts;
    const q = chartSearch.toLowerCase();
    return dedupedCharts.filter(c => c.name.toLowerCase().includes(q));
  }, [dedupedCharts, chartSearch]);

  const selectedChart = allCharts.find(c => c.id === selectedChartId) || null;
  const risingSign = selectedChart ? getAscendantSign(selectedChart) : "none";
  const chartName = selectedChart?.name || "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setChartSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!info) {
    return <div className="text-center text-muted-foreground p-8">No data available for {planet}.</div>;
  }

  const selectedPeriod = periods[selectedPeriodIdx];

  const sections = [
    { id: "learn", label: `Learn ${planet}`, icon: glyph },
    { id: "retrogrades", label: "Retrograde Periods", icon: "🔄" },
    { id: "current", label: "Current Status", icon: currentStatus?.isRetrograde ? "↩️" : "➡️" },
    { id: "guidance", label: "Your Guidance", icon: "✨" },
  ];

  return (
    <div className={`rounded-xl bg-gradient-to-b ${colors.gradient} text-slate-100 font-sans pb-10 -mx-4 -mt-4 md:-mx-6 md:-mt-6`}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(1px 1px at 50% 60%, white, transparent)",
          }}
        />
        <div className="relative px-4 pt-10 pb-6 text-center">
          <div className="text-5xl mb-3 animate-pulse" style={{ animationDuration: "4s" }}>{glyph}</div>
          <h1 className={`text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70`}>
            {planet} Retrograde
          </h1>
          <p className={`${colors.accent} text-sm mt-2 max-w-sm mx-auto`}>
            Understanding {planet}'s backward journey — and what it means for you
          </p>

          {/* Chart selector */}
          <div className="mt-5 flex justify-center">
            <div className="w-72 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between bg-white/5 border ${colors.border} text-white rounded-xl px-4 py-2.5 text-sm cursor-pointer focus:outline-none transition-colors`}
              >
                <span className="truncate">{selectedChart ? chartName : '— Select a Chart —'}</span>
                <ChevronDown size={14} className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-white/10">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text" value={chartSearch} onChange={(e) => setChartSearch(e.target.value)}
                        placeholder="Type to filter…"
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-8 pr-3 py-1.5 text-sm placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto py-1">
                    <button onClick={() => { setSelectedChartId('none'); setIsDropdownOpen(false); }} className={`w-full px-4 py-2 text-sm text-left ${selectedChartId === 'none' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}>
                      — Select a Chart —
                    </button>
                    {filteredCharts.map(c => (
                      <button key={c.id} onClick={() => { setSelectedChartId(c.id); setIsDropdownOpen(false); setChartSearch(''); }}
                        className={`w-full px-4 py-2 text-sm text-left truncate ${selectedChartId === c.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeSection === s.id ? `bg-white/15 text-white shadow-lg` : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">

        {/* ── LEARN ── */}
        {activeSection === "learn" && (
          <div className="space-y-4">
            <AccordionCard icon={glyph} title={`Who Is ${planet}?`} content={info.who} accentClass={colors.border} />
            <AccordionCard icon="🔄" title="How Often & Duration" content={`${info.frequency}\n\n${info.duration}`} accentClass={colors.border} />

            {/* Keywords */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-5`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>{glyph} Keywords</p>
              <div className="flex flex-wrap gap-2">
                {info.keywords.map((w) => (
                  <span key={w} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">{w}</span>
                ))}
              </div>
            </div>

            {/* Dignity */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-5`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>{glyph} {planet}'s Sign Dignity</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-emerald-900/30 border border-emerald-500/30 p-3">
                  <p className="text-emerald-300 text-xs font-bold uppercase mb-1">Domicile</p>
                  <p className="text-emerald-50">{info.dignity.domicile}</p>
                </div>
                <div className="rounded-xl bg-blue-900/30 border border-blue-500/30 p-3">
                  <p className="text-blue-300 text-xs font-bold uppercase mb-1">Exaltation</p>
                  <p className="text-blue-50">{info.dignity.exaltation}</p>
                </div>
                <div className="rounded-xl bg-rose-900/30 border border-rose-500/30 p-3">
                  <p className="text-rose-300 text-xs font-bold uppercase mb-1">Detriment</p>
                  <p className="text-rose-50">{info.dignity.detriment}</p>
                </div>
                <div className="rounded-xl bg-amber-900/30 border border-amber-500/30 p-3">
                  <p className="text-amber-300 text-xs font-bold uppercase mb-1">Fall</p>
                  <p className="text-amber-50">{info.dignity.fall}</p>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-5`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>🌊 Retrograde Themes</p>
              <div className="space-y-2">
                {info.themes.map((t) => (
                  <div key={t} className="flex items-start gap-3 text-sm text-white/80">
                    <span className={`${colors.accent} mt-0.5 flex-shrink-0`}>✦</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RETROGRADE PERIODS ── */}
        {activeSection === "retrogrades" && (
          <div className="space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🔄</span>
                <h2 className="text-xl font-semibold text-white">{planet} Retrograde Periods</h2>
              </div>
              <p className={`text-sm ${colors.accent} ml-11`}>Computed from high-precision ephemeris</p>
            </div>

            {periods.length === 0 ? (
              <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-8 text-center`}>
                <p className="text-white/60">No retrograde periods found in the current range.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map((p, i) => {
                  const isNow = new Date() >= p.start && new Date() <= p.end;
                  const isShadow = new Date() >= p.preStart && new Date() <= p.postEnd;
                  const isSelected = selectedPeriodIdx === i;
                  const sign = p.sign.split('/')[0];
                  const signMeaning = info.signMeanings[sign] || '';

                  return (
                    <div key={i}>
                      <div
                        onClick={() => setSelectedPeriodIdx(isSelected ? -1 : i)}
                        className={`rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${isSelected ? `${colors.border} bg-white/10 shadow-lg` : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isNow ? "bg-red-500/40 text-white border border-red-300/50" : isShadow ? "bg-amber-500/30 text-amber-100 border border-amber-400/40" : "bg-white/5 text-white/60 border border-white/10"}`}>
                              {isNow ? "● RETROGRADE NOW" : isShadow ? "◐ IN SHADOW" : p.start > new Date() ? "UPCOMING" : "PAST"}
                            </span>
                            <h3 className="text-lg font-semibold text-white mt-2">{planet} Retrograde in {p.sign}</h3>
                            <p className="text-white/60 text-sm">{p.start.getFullYear()}</p>
                          </div>
                          <span className="text-3xl opacity-40">{glyph}</span>
                        </div>
                        <div className="text-sm text-white/70 space-y-1">
                          <p>📅 {formatDate(p.start)} – {formatDate(p.end)}</p>
                          <p>📐 {p.rxDegree !== undefined ? formatDeg(p.rxDegree) : '?'} → {p.dDegree !== undefined ? formatDeg(p.dDegree) : '?'}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className={`mt-3 mb-2 rounded-2xl border ${colors.border} bg-white/5 p-6 space-y-5`}>
                          {/* Key Dates */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">🌑 Pre-Shadow</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.preStart)}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">↩️ Station Retrograde</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.start)}</p>
                            </div>
                            {p.cazimi && (
                              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-white/50 mb-1">🌞 Cazimi</p>
                                <p className="text-sm font-medium text-white">{formatDate(p.cazimi)}</p>
                              </div>
                            )}
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">↪️ Station Direct</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.end)}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">🌕 Shadow Clears</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.postEnd)}</p>
                            </div>
                          </div>

                          {/* Degree Range */}
                          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <p className="text-xs text-white/50 font-semibold uppercase mb-1">Degree Range — Triple Activation Zone</p>
                            <p className="text-white font-bold text-lg">
                              {p.rxDegree !== undefined ? formatDeg(p.rxDegree) : '?'} → {p.dDegree !== undefined ? formatDeg(p.dDegree) : '?'}
                            </p>
                            <p className="text-sm text-white/60 mt-2 leading-relaxed">
                              Any natal planet or angle between these degrees will be visited THREE times: once in pre-shadow (direct), once retrograde (backward), and once post-shadow (direct).
                            </p>
                          </div>

                          {/* Sign Meaning */}
                          {signMeaning && (
                            <div className={`rounded-xl ${colors.border} border bg-white/5 p-4`}>
                              <p className={`text-xs ${colors.accent} font-semibold uppercase mb-2`}>🌊 {planet} Retrograde in {sign}</p>
                              <p className="text-white/80 text-sm leading-relaxed">{signMeaning}</p>
                            </div>
                          )}

                          {/* Personalized House */}
                          {risingSign !== "none" && (() => {
                            const retroSign = sign.toLowerCase();
                            const house = getHouseOfSign(risingSign, retroSign);
                            if (!house) return null;
                            return (
                              <div className="rounded-xl bg-gradient-to-br from-fuchsia-900/40 to-violet-900/40 border border-fuchsia-400/40 p-5">
                                <p className="text-xs text-fuchsia-200 font-semibold uppercase mb-2">
                                  ✨ For {chartName} — House {house}
                                </p>
                                <p className="text-fuchsia-50 text-sm leading-relaxed">
                                  {planet} retrograde in {sign} falls in your {house}{house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house of {HOUSE_THEMES[house] || 'various themes'}. 
                                  During the retrograde, expect themes around {HOUSE_THEMES[house]} to resurface for review and integration. 
                                  Pay attention to what was happening in this area of life when {planet} first entered this zone during the pre-shadow.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CURRENT STATUS ── */}
        {activeSection === "current" && (
          <div className="space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{currentStatus?.isRetrograde ? "↩️" : "➡️"}</span>
                <h2 className="text-xl font-semibold text-white">
                  {planet} is {currentStatus?.isRetrograde ? "RETROGRADE" : currentStatus?.isShadow ? `in ${currentStatus.shadowType === 'pre' ? 'Pre' : 'Post'}-Shadow` : "Direct"}
                </h2>
              </div>
            </div>

            {currentStatus?.retrogradeInfo ? (
              <div className={`rounded-2xl border ${colors.border} bg-white/5 p-6 space-y-5`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-white/50 mb-1">↩️ Station Retrograde</p>
                    <p className="text-sm font-medium text-white">{formatDate(currentStatus.retrogradeInfo.start)}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-white/50 mb-1">↪️ Station Direct</p>
                    <p className="text-sm font-medium text-white">{formatDate(currentStatus.retrogradeInfo.end)}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-white/50 mb-1">📍 Sign</p>
                  <p className="text-white font-bold text-lg">{currentStatus.retrogradeInfo.sign}</p>
                  <p className="text-white/60 text-sm mt-2">
                    {info.signMeanings[currentStatus.retrogradeInfo.sign.split('/')[0]] || `${planet} retrograde in ${currentStatus.retrogradeInfo.sign}`}
                  </p>
                </div>

                {currentStatus.isRetrograde && currentStatus.percentComplete !== undefined && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs text-white/50 mb-2">Progress</p>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r from-white/30 to-white/60`} style={{ width: `${currentStatus.percentComplete}%` }} />
                    </div>
                    <p className="text-xs text-white/40 mt-1">{Math.round(currentStatus.percentComplete)}% complete · {currentStatus.daysRemaining} days remaining</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-8 text-center`}>
                <p className="text-3xl mb-3">➡️</p>
                <p className="text-white text-lg font-medium mb-2">{planet} is Currently Direct</p>
                <p className="text-white/60 text-sm">
                  {planet} is moving forward through the zodiac. No retrograde or shadow period is currently active.
                  {periods.length > 0 && (() => {
                    const next = periods.find(p => p.preStart > new Date());
                    if (next) return ` The next ${planet} retrograde pre-shadow begins ${formatDate(next.preStart)}.`;
                    return '';
                  })()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── GUIDANCE ── */}
        {activeSection === "guidance" && (
          <div className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-semibold text-white">{planet} Retrograde Guidance</h2>
              </div>
            </div>

            {/* Do's */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-5">
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider mb-4">✅ What To Do During {planet} Retrograde</p>
              <div className="space-y-2">
                {info.doList.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-emerald-50">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts */}
            <div className="rounded-2xl border border-rose-500/40 bg-rose-900/20 p-5">
              <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider mb-4">⚠️ What To Avoid</p>
              <div className="space-y-2">
                {info.dontList.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-rose-50">
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Closing */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-6 text-center`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>{glyph} A {planet} Retrograde Reminder</p>
              <p className="text-white/80 text-base leading-relaxed italic">
                "Retrogrades are not punishment.<br/>
                They are the universe's invitation to pause,<br/>
                reflect, and integrate before moving forward.<br/>
                What returns to you returns for completion."
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
