import { useState } from 'react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowUp, ArrowDown, BookOpen, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SPILLER_NODE_DATA, SPILLER_HOUSE_OVERLAYS, SPILLER_SOURCE } from '@/lib/nodeSpillerData';

interface LunarNodesCardProps {
  chart: NatalChart;
  northNodeHouse: number | null;
  southNodeHouse: number | null;
}

const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const OPPOSITE_SIGN: Record<string, string> = {
  Aries: 'Libra', Taurus: 'Scorpio', Gemini: 'Sagittarius',
  Cancer: 'Capricorn', Leo: 'Aquarius', Virgo: 'Pisces',
  Libra: 'Aries', Scorpio: 'Taurus', Sagittarius: 'Gemini',
  Capricorn: 'Cancer', Aquarius: 'Leo', Pisces: 'Virgo',
};

interface NodeAxisData {
  northLesson: string;
  southGift: string;
  soulQuestion: string;
  northKeywords: string[];
  southKeywords: string[];
  practicalSteps: string[];
  shadowPattern: string;
  integration: string;
}

const NODE_AXIS_DATA: Record<string, NodeAxisData> = {
  Aries: {
    northLesson: "You are here to learn COURAGE, INDEPENDENCE, and SELF-ASSERTION. Your soul chose this lifetime to discover who YOU are apart from others. You must learn to fight for yourself, take risks, and trust your own instincts—even when it feels selfish.",
    southGift: "You come in with extraordinary gifts in RELATIONSHIPS, DIPLOMACY, and HARMONY. You naturally know how to make others comfortable, mediate conflict, and create beauty. But you've over-relied on these gifts to the point of losing yourself.",
    soulQuestion: "What would I do if I weren't worried about what anyone else thought?",
    northKeywords: ["Independence", "Courage", "Self-assertion", "Initiative", "Pioneering", "Standing alone"],
    southKeywords: ["People-pleasing", "Over-compromise", "Codependence", "Indecision", "Peace at any cost"],
    practicalSteps: [
      "Make one decision per day without asking anyone's opinion",
      "Practice saying 'no' to requests that drain you",
      "Start something completely on your own—a project, a trip, a goal",
      "Notice when you're adjusting your opinion to match the room",
      "Exercise or do something physical that builds your sense of personal power",
    ],
    shadowPattern: "You may unconsciously create conflict or drama as a way to assert independence, or swing between total self-sacrifice and sudden explosive selfishness.",
    integration: "True mastery comes when you can be fiercely independent AND deeply relational—when you fight FOR love rather than against connection.",
  },
  Taurus: {
    northLesson: "You are here to learn PEACE, SIMPLICITY, and SELF-WORTH. Your soul chose this lifetime to discover that you are enough as you are—without crisis, intensity, or transformation. You must learn to rest, to build slowly, and to trust that life doesn't always require upheaval.",
    southGift: "You come in with extraordinary gifts in TRANSFORMATION, PSYCHOLOGY, and CRISIS MANAGEMENT. You naturally understand the depths of human nature, can handle emergencies, and aren't afraid of the dark. But you've become addicted to intensity.",
    soulQuestion: "Can I trust that peace is not boring—that stillness is not stagnation?",
    northKeywords: ["Simplicity", "Stability", "Self-worth", "Patience", "Sensuality", "Building"],
    southKeywords: ["Crisis addiction", "Control", "Power struggles", "Obsession", "Emotional manipulation"],
    practicalSteps: [
      "Spend time in nature without any agenda",
      "Build or create something tangible with your hands",
      "Practice gratitude for what you already have (instead of what's missing)",
      "Invest in quality over intensity—good food, comfortable spaces, simple pleasures",
      "Notice when you're unconsciously stirring up drama",
    ],
    shadowPattern: "You may unconsciously create crises to feel alive, or use emotional intensity to control situations. You might sabotage peace because it feels 'too easy.'",
    integration: "True mastery comes when you can hold depth AND simplicity—when you choose peace not from avoidance but from genuine security within.",
  },
  Gemini: {
    northLesson: "You are here to learn CURIOSITY, COMMUNICATION, and MENTAL FLEXIBILITY. Your soul chose this lifetime to ask questions instead of giving answers, to stay local instead of always seeking the horizon, and to value many perspectives over one 'truth.'",
    southGift: "You come in with extraordinary gifts in PHILOSOPHY, TEACHING, and BIG-PICTURE VISION. You naturally see meaning, can inspire through belief, and hold strong convictions. But you've become rigid in your worldview.",
    soulQuestion: "Can I stay curious instead of certain? Can I learn something new today?",
    northKeywords: ["Curiosity", "Listening", "Versatility", "Neighborhood", "Questions", "Adaptability"],
    southKeywords: ["Preachiness", "Dogmatism", "Restlessness", "Over-promising", "Know-it-all"],
    practicalSteps: [
      "Ask questions instead of offering answers",
      "Take a class in something completely outside your expertise",
      "Write, journal, or blog—process your thoughts through words",
      "Have conversations with people whose views differ from yours",
      "Stay engaged with your local community",
    ],
    shadowPattern: "You may unconsciously lecture people or assume you know better. You might use 'seeking truth' as an excuse to avoid the mundane details of daily life.",
    integration: "True mastery comes when your big-picture wisdom is grounded in genuine curiosity and communicated with humility.",
  },
  Cancer: {
    northLesson: "You are here to learn VULNERABILITY, NURTURING, and EMOTIONAL HONESTY. Your soul chose this lifetime to let your guard down, to need people, and to discover that feelings are not weakness—they are wisdom.",
    southGift: "You come in with extraordinary gifts in ACHIEVEMENT, STRUCTURE, and AUTHORITY. You naturally know how to build, manage, and take responsibility. But you've used accomplishment as armor against feeling.",
    soulQuestion: "Can I let myself be held? Can I admit that I need someone?",
    northKeywords: ["Vulnerability", "Nurturing", "Home", "Family", "Emotional honesty", "Belonging"],
    southKeywords: ["Over-achieving", "Emotional control", "Workaholism", "Coldness", "Status obsession"],
    practicalSteps: [
      "Create a home environment that feels safe and nourishing",
      "Practice asking for help—actually receiving it",
      "Spend quality time with family or chosen family",
      "Allow yourself to cry, rest, and be unproductive",
      "Cook or prepare food as an act of love",
    ],
    shadowPattern: "You may use 'being responsible' to avoid intimacy, or swing between being completely self-sufficient and emotionally overwhelming others.",
    integration: "True mastery comes when your strength serves your tenderness—when you build structures that protect love rather than replace it.",
  },
  Leo: {
    northLesson: "You are here to learn SELF-EXPRESSION, CREATIVE JOY, and the courage to BE SEEN. Your soul chose this lifetime to step out of the crowd, to shine your unique light, and to follow your heart—even when it's terrifying.",
    southGift: "You come in with extraordinary gifts in COMMUNITY, INNOVATION, and DETACHMENT. You naturally understand groups, social causes, and the bigger picture. But you've hidden behind collective identity to avoid personal vulnerability.",
    soulQuestion: "Can I let myself be special? Can I create from my heart without needing group approval?",
    northKeywords: ["Self-expression", "Creativity", "Romance", "Joy", "Personal recognition", "Heart-centered living"],
    southKeywords: ["Detachment", "Rebellion for its own sake", "Hiding in groups", "Fear of being ordinary", "Emotional distance"],
    practicalSteps: [
      "Create something—art, music, writing—that is purely self-expression",
      "Take a risk that puts YOU personally on display",
      "Practice receiving compliments without deflecting",
      "Follow what brings you genuine joy, not what's 'important'",
      "Allow yourself to fall in love—with a person, a project, a passion",
    ],
    shadowPattern: "You may unconsciously sabotage recognition or use group causes to avoid the vulnerability of personal expression.",
    integration: "True mastery comes when your individuality serves the collective—when you shine so brightly that you give others permission to do the same.",
  },
  Virgo: {
    northLesson: "You are here to learn DISCERNMENT, PRACTICAL SERVICE, and GROUNDED SPIRITUALITY. Your soul chose this lifetime to bring heaven down to earth—to serve through doing, not just dreaming.",
    southGift: "You come in with extraordinary gifts in INTUITION, COMPASSION, and SPIRITUAL SURRENDER. You naturally sense the unseen, feel others' pain, and connect to the divine. But you've used transcendence to avoid practical reality.",
    soulQuestion: "Can I serve in concrete, tangible ways? Can I find the sacred in the mundane?",
    northKeywords: ["Discernment", "Service", "Health", "Routine", "Analysis", "Practical skills"],
    southKeywords: ["Escapism", "Victimhood", "Boundary-less merging", "Addiction", "Avoidance of details"],
    practicalSteps: [
      "Establish healthy daily routines—sleep, diet, exercise",
      "Volunteer or serve others in hands-on, practical ways",
      "Learn to say 'that's not my problem' with compassion",
      "Organize your physical space",
      "Develop a craft or skill that requires precision",
    ],
    shadowPattern: "You may use spiritual bypass to avoid dealing with real-world problems, or lose yourself in substances, fantasy, or others' drama.",
    integration: "True mastery comes when your spiritual sensitivity is channeled through practical action—when your intuition serves real healing.",
  },
  Libra: {
    northLesson: "You are here to learn PARTNERSHIP, BALANCE, and TRUE COOPERATION. Your soul chose this lifetime to discover that strength includes softness, and that 'we' can be more powerful than 'I.'",
    southGift: "You come in with extraordinary gifts in INDEPENDENCE, COURAGE, and SELF-RELIANCE. You naturally know how to survive alone, act decisively, and fight for what you want. But you've become isolated in your self-sufficiency.",
    soulQuestion: "Can I let someone truly in? Can I compromise without losing myself?",
    northKeywords: ["Partnership", "Diplomacy", "Balance", "Beauty", "Cooperation", "Listening"],
    southKeywords: ["Aggression", "Impulsiveness", "Selfishness", "Impatience", "Loner tendencies"],
    practicalSteps: [
      "Practice active listening—truly hearing the other person",
      "Make decisions WITH someone, not just for yourself",
      "Create beauty in your shared spaces",
      "When in conflict, ask 'What would be fair?' before 'What do I want?'",
      "Study relationships—read, observe, learn about partnership dynamics",
    ],
    shadowPattern: "You may push people away to prove you don't need them, or enter relationships aggressively trying to 'win' rather than connect.",
    integration: "True mastery comes when your warrior spirit is placed in service of love—when you fight FOR the relationship, not against it.",
  },
  Scorpio: {
    northLesson: "You are here to learn EMOTIONAL DEPTH, INTIMACY, and TRANSFORMATIVE HONESTY. Your soul chose this lifetime to go deep—to share resources, merge with others, and face the truth no matter how uncomfortable.",
    southGift: "You come in with extraordinary gifts in STABILITY, SELF-RELIANCE, and MATERIAL SECURITY. You naturally know how to build, save, and create comfort. But you've used material security as a wall against emotional vulnerability.",
    soulQuestion: "Can I let someone see ALL of me? Can I trust enough to merge?",
    northKeywords: ["Intimacy", "Transformation", "Shared resources", "Psychological depth", "Letting go", "Trust"],
    southKeywords: ["Possessiveness", "Materialism", "Stubbornness", "Comfort addiction", "Emotional withholding"],
    practicalSteps: [
      "Share a secret or vulnerability with someone you trust",
      "Explore therapy, psychology, or deep self-inquiry",
      "Practice giving—resources, time, emotional energy—without keeping score",
      "Face a fear you've been avoiding",
      "Allow something to end so something new can begin",
    ],
    shadowPattern: "You may hoard resources, cling to comfort, or use material stability to avoid the terrifying vulnerability of true intimacy.",
    integration: "True mastery comes when your stability supports transformation—when you're secure enough to let everything change.",
  },
  Sagittarius: {
    northLesson: "You are here to learn FAITH, EXPANSION, and the courage to SEEK YOUR OWN TRUTH. Your soul chose this lifetime to think big, travel far (literally or mentally), and develop a personal philosophy through direct experience.",
    southGift: "You come in with extraordinary gifts in COMMUNICATION, ADAPTABILITY, and INTELLECTUAL AGILITY. You naturally gather information, see multiple angles, and connect with diverse people. But you've scattered your energy across too many surfaces.",
    soulQuestion: "What do I BELIEVE? Not what have I heard—what do I KNOW from experience?",
    northKeywords: ["Faith", "Adventure", "Philosophy", "Higher education", "Truth-seeking", "Expansion"],
    southKeywords: ["Gossip", "Superficiality", "Nervous energy", "Information overload", "Commitment avoidance"],
    practicalSteps: [
      "Travel somewhere that challenges your worldview",
      "Study philosophy, religion, or meaning-making traditions",
      "Commit to ONE truth and follow it deeply",
      "Teach what you've learned through experience (not just facts)",
      "Say less, mean more—practice speaking from conviction",
    ],
    shadowPattern: "You may hide behind information-gathering to avoid taking a stand, or use intellectual agility to avoid emotional depth.",
    integration: "True mastery comes when your mental versatility serves a larger vision—when your words carry the weight of lived experience.",
  },
  Capricorn: {
    northLesson: "You are here to learn MASTERY, RESPONSIBILITY, and the quiet power of LONG-TERM COMMITMENT. Your soul chose this lifetime to become an authority—not through emotional attachment but through disciplined contribution to the world.",
    southGift: "You come in with extraordinary gifts in NURTURING, EMOTIONAL INTELLIGENCE, and CREATING SAFETY. You naturally care for others, create family bonds, and hold emotional space. But you've used caretaking to avoid your own ambitions.",
    soulQuestion: "Am I willing to grow up? Can I build something that matters, even if it takes years?",
    northKeywords: ["Mastery", "Discipline", "Authority", "Structure", "Long-term goals", "Public contribution"],
    southKeywords: ["Emotional dependency", "Clinginess", "Fear of the world", "Hiding at home", "Avoiding responsibility"],
    practicalSteps: [
      "Set a 5-year goal and work toward it consistently",
      "Take on leadership roles, even small ones",
      "Build professional skills and expertise",
      "Practice emotional self-sufficiency—comfort yourself",
      "Create structures and systems in your daily life",
    ],
    shadowPattern: "You may retreat into family or emotional comfort to avoid the challenges of public life, or use others' neediness to feel important.",
    integration: "True mastery comes when your nurturing heart serves your worldly ambitions—when you lead with both authority and compassion.",
  },
  Aquarius: {
    northLesson: "You are here to learn INDIVIDUALITY, HUMANITARIAN SERVICE, and the courage to be DIFFERENT. Your soul chose this lifetime to break free from ego-driven desires and contribute to something larger than yourself.",
    southGift: "You come in with extraordinary gifts in SELF-EXPRESSION, CREATIVITY, and PERSONAL MAGNETISM. You naturally draw attention, create from the heart, and inspire loyalty. But you've become addicted to being the center of the story.",
    soulQuestion: "Can I let go of needing to be special and instead be USEFUL to the collective?",
    northKeywords: ["Innovation", "Humanitarianism", "Friendship", "Objectivity", "Progress", "Originality"],
    southKeywords: ["Ego attachment", "Drama", "Need for approval", "Self-centeredness", "Romantic obsession"],
    practicalSteps: [
      "Join a group or cause that's bigger than your personal story",
      "Practice friendship—equal, non-hierarchical relationships",
      "Innovate or create something that serves the collective",
      "Question your need for recognition in everything you do",
      "Befriend people who are truly different from you",
    ],
    shadowPattern: "You may use personal drama to avoid collective responsibility, or demand constant appreciation as the price of your participation.",
    integration: "True mastery comes when your creative fire illuminates the path for everyone—when your shine is in service of the whole.",
  },
  Pisces: {
    northLesson: "You are here to learn SURRENDER, SPIRITUAL FAITH, and UNCONDITIONAL COMPASSION. Your soul chose this lifetime to dissolve the illusion of control and merge with something greater—art, spirit, love, the divine mystery.",
    southGift: "You come in with extraordinary gifts in ANALYSIS, ORGANIZATION, and PRACTICAL PROBLEM-SOLVING. You naturally see what needs fixing, create order, and serve through competence. But you've used perfectionism as a shield against the messy, mysterious parts of life.",
    soulQuestion: "Can I let go of needing to fix everything? Can I trust the unfolding?",
    northKeywords: ["Surrender", "Compassion", "Spirituality", "Art", "Imagination", "Oneness"],
    southKeywords: ["Perfectionism", "Over-analysis", "Worry", "Control", "Criticism", "Fear of chaos"],
    practicalSteps: [
      "Develop a meditation, prayer, or contemplative practice",
      "Create art without worrying if it's 'good'",
      "Practice compassion for imperfection—yours and others'",
      "Spend time near water—ocean, lake, bath",
      "Allow yourself to not know the answer sometimes",
    ],
    shadowPattern: "You may use analysis and perfectionism to avoid vulnerability, or criticize yourself and others to maintain the illusion of control.",
    integration: "True mastery comes when your precision serves your compassion—when your practical gifts are offerings to the divine.",
  },
};

const HOUSE_THEMES: Record<number, { area: string; description: string }> = {
  1: { area: "Identity & Self-Image", description: "The nodes across 1st/7th houses ask you to balance who you are independently vs. who you become through relationships." },
  2: { area: "Values & Resources", description: "The nodes across 2nd/8th houses ask you to balance self-sufficiency vs. intimate sharing and transformation through others." },
  3: { area: "Communication & Learning", description: "The nodes across 3rd/9th houses ask you to balance everyday knowledge vs. higher wisdom and philosophical truth." },
  4: { area: "Home & Family", description: "The nodes across 4th/10th houses ask you to balance private life and emotional roots vs. public life and worldly achievement." },
  5: { area: "Creativity & Romance", description: "The nodes across 5th/11th houses ask you to balance personal self-expression vs. community contribution and friendship." },
  6: { area: "Health & Service", description: "The nodes across 6th/12th houses ask you to balance practical daily service vs. spiritual surrender and transcendence." },
  7: { area: "Partnership", description: "The nodes across 7th/1st houses ask you to balance deep partnership vs. independent self-discovery." },
  8: { area: "Transformation & Intimacy", description: "The nodes across 8th/2nd houses ask you to balance psychological depth vs. simple material security." },
  9: { area: "Philosophy & Travel", description: "The nodes across 9th/3rd houses ask you to balance big-picture meaning vs. everyday communication and curiosity." },
  10: { area: "Career & Public Life", description: "The nodes across 10th/4th houses ask you to balance worldly responsibility vs. emotional nurturing and home life." },
  11: { area: "Community & Friendship", description: "The nodes across 11th/5th houses ask you to balance humanitarian ideals vs. personal creative joy." },
  12: { area: "Spirituality & Transcendence", description: "The nodes across 12th/6th houses ask you to balance spiritual dissolution vs. grounded practical service." },
};

// Node Ruler technique — the ruling planet of the North Node sign shows HOW you approach soul growth
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const getNodeRulerInsight = (nnSign: string, chart: NatalChart): { ruler: string; rulerSign: string; rulerHouse: number | null; interpretation: string } | null => {
  const ruler = SIGN_RULERS[nnSign];
  if (!ruler) return null;
  
  const rulerKey = ruler as keyof typeof chart.planets;
  const rulerPos = chart.planets[rulerKey];
  if (!rulerPos?.sign) return null;
  
  // Find ruler's house
  let rulerHouse: number | null = null;
  if (chart.houseCusps) {
    const ZODIAC = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC.indexOf(sign) * 30 + deg + min / 60;
    const cusps: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const c = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
      if (c?.sign) cusps.push(toLon(c.sign, c.degree, c.minutes ?? 0));
    }
    if (cusps.length === 12) {
      const lon = toLon(rulerPos.sign, rulerPos.degree, rulerPos.minutes ?? 0);
      for (let i = 0; i < 12; i++) {
        const cur = cusps[i], next = cusps[(i + 1) % 12];
        const inH = next < cur ? (lon >= cur || lon < next) : (lon >= cur && lon < next);
        if (inH) { rulerHouse = i + 1; break; }
      }
    }
  }
  
  const housePhrase = rulerHouse ? ` in your ${rulerHouse}${rulerHouse === 1 ? 'st' : rulerHouse === 2 ? 'nd' : rulerHouse === 3 ? 'rd' : 'th'} house` : '';
  
  return {
    ruler,
    rulerSign: rulerPos.sign,
    rulerHouse,
    interpretation: `Your North Node in ${nnSign} is ruled by ${ruler}. Your ${ruler} is in ${rulerPos.sign}${housePhrase}${rulerPos.isRetrograde ? ' (retrograde)' : ''}. This means you approach your soul's lessons through a ${rulerPos.sign} lens — the energy, style, and concerns of ${rulerPos.sign} shape HOW you grow toward your North Node destiny.${rulerHouse ? ` The ${rulerHouse}${rulerHouse === 1 ? 'st' : rulerHouse === 2 ? 'nd' : rulerHouse === 3 ? 'rd' : 'th'} house is the life area where this growth is most actively channeled.` : ''}`,
  };
};

export const LunarNodesCard = ({ chart, northNodeHouse, southNodeHouse }: LunarNodesCardProps) => {
  const nn = chart.planets.NorthNode;
  const sn = chart.planets.SouthNode;

  if (!nn) return null;

  const nnSign = nn.sign;
  const snSign = sn?.sign || OPPOSITE_SIGN[nnSign] || '';
  const axisData = NODE_AXIS_DATA[nnSign];
  const spillerData = SPILLER_NODE_DATA[nnSign] || null;
  const spillerHouse = northNodeHouse ? SPILLER_HOUSE_OVERLAYS[northNodeHouse] || null : null;
  const nodeRuler = getNodeRulerInsight(nnSign, chart);

  if (!axisData) return null;

  return (
    <div className="space-y-4">
      {/* Title */}
      <p className="text-sm text-muted-foreground italic">
        "What are you here to learn? The Lunar Nodes reveal your soul's evolutionary direction—where you've been and where you're going."
      </p>

      {/* North Node */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 p-5 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <ArrowUp className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-medium">☊ North Node in {nnSign}</h4>
            <p className="text-xs text-muted-foreground">
              {nn.degree}°{nn.minutes !== undefined ? nn.minutes.toString().padStart(2, '0') : ''}' • {SIGN_ELEMENT[nnSign]}
              {northNodeHouse && ` • House ${northNodeHouse}`}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4">{axisData.northLesson}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {axisData.northKeywords.map((kw, i) => (
            <span key={i} className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{kw}</span>
          ))}
        </div>

        {northNodeHouse && HOUSE_THEMES[northNodeHouse] && (
          <div className="bg-background/50 p-3 rounded mt-3 border border-indigo-100 dark:border-indigo-800/50">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">
              House {northNodeHouse}: {HOUSE_THEMES[northNodeHouse].area}
            </p>
            <p className="text-sm text-muted-foreground">{HOUSE_THEMES[northNodeHouse].description}</p>
          </div>
        )}
      </div>

      {/* South Node */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-5 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <ArrowDown className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-medium">☋ South Node in {snSign}</h4>
            <p className="text-xs text-muted-foreground">
              {sn ? `${sn.degree}°${sn.minutes !== undefined ? sn.minutes.toString().padStart(2, '0') : ''}'` : ''} • {SIGN_ELEMENT[snSign]}
              {southNodeHouse && ` • House ${southNodeHouse}`}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4">{axisData.southGift}</p>

        <div className="flex flex-wrap gap-1.5">
          {axisData.southKeywords.map((kw, i) => (
            <span key={i} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{kw}</span>
          ))}
        </div>
      </div>

      {/* Soul Question */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 p-5 rounded-lg border-2 border-purple-300 dark:border-purple-700 text-center">
        <p className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">The Soul Question</p>
        <p className="text-xl font-serif italic">"{axisData.soulQuestion}"</p>
      </div>

      {/* Practical Steps */}
      <div className="bg-background/50 p-5 rounded-lg border border-border">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sparkles className="text-primary" size={16} />
          Practical Steps Toward Your North Node
        </h4>
        <ul className="space-y-2">
          {axisData.practicalSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-indigo-500 mt-0.5 font-medium">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Node Ruler Technique */}
      {nodeRuler && (
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/40 dark:to-teal-950/40 p-5 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="text-cyan-600 dark:text-cyan-400" size={18} />
            <h4 className="font-medium text-sm">How You Approach Your North Node</h4>
            <span className="text-[10px] text-muted-foreground ml-auto">Node Ruler Technique</span>
          </div>
          <p className="text-sm leading-relaxed mb-3">{nodeRuler.interpretation}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full">
              NN Ruler: {nodeRuler.ruler}
            </span>
            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full">
              In {nodeRuler.rulerSign}
            </span>
            {nodeRuler.rulerHouse && (
              <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full">
                House {nodeRuler.rulerHouse}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Shadow & Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-2">⚠️ Shadow Pattern</p>
          <p className="text-sm">{axisData.shadowPattern}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">✦ Integration</p>
          <p className="text-sm">{axisData.integration}</p>
        </div>
      </div>

      {/* Jan Spiller Deep Dive */}
      {spillerData && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-3 px-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors border border-border">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Deep Dive: Your North Node Story</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Jan Spiller</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4">
            {/* Past Life Story */}
            <div className="p-4 rounded-lg bg-accent/20 border border-accent/20">
              <p className="text-[10px] font-medium text-muted-foreground mb-2">🕰️ YOUR PAST-LIFE PATTERN</p>
              <p className="text-sm leading-relaxed italic">{spillerData.pastLifeStory}</p>
            </div>

            {/* Overview */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-2">✦ THIS LIFETIME'S DIRECTION</p>
              <p className="text-sm leading-relaxed">{spillerData.overview}</p>
            </div>

            {/* What Works For/Against */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <p className="text-[10px] font-medium text-green-700 dark:text-green-400 mb-2">✓ WHAT WORKS FOR YOU</p>
                <p className="text-xs leading-relaxed">{spillerData.whatWorksForYou}</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                <p className="text-[10px] font-medium text-rose-700 dark:text-rose-400 mb-2">✗ WHAT WORKS AGAINST YOU</p>
                <p className="text-xs leading-relaxed">{spillerData.whatWorksAgainstYou}</p>
              </div>
            </div>

            {/* Tendencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">↓ TENDENCIES TO LEAVE BEHIND</p>
                <ul className="space-y-1">
                  {spillerData.tendenciesToLeaveBehind.map((t, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5">
                      <span className="text-muted-foreground mt-0.5">—</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">↑ TENDENCIES TO DEVELOP</p>
                <ul className="space-y-1">
                  {spillerData.tendenciesToDevelop.map((t, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">+</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Relationships */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-[10px] font-medium text-muted-foreground mb-2">💞 IN RELATIONSHIPS</p>
              <p className="text-sm leading-relaxed">{spillerData.relationships}</p>
            </div>

            {/* House Overlay */}
            {northNodeHouse && spillerHouse && (
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <p className="text-[10px] font-medium text-indigo-700 dark:text-indigo-400 mb-2">🏠 NORTH NODE IN HOUSE {northNodeHouse}: {spillerHouse.focus.toUpperCase()}</p>
                <p className="text-sm leading-relaxed mb-2">{spillerHouse.description}</p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{spillerHouse.lifeLesson}</p>
              </div>
            )}

            {/* Healing Affirmations */}
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-[10px] font-medium text-muted-foreground mb-2">🌿 HEALING AFFIRMATIONS</p>
              <div className="space-y-1.5">
                {spillerData.healingAffirmations.map((a, i) => (
                  <p key={i} className="text-sm italic text-center">"{a}"</p>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-muted-foreground italic text-center">Insights drawn from {SPILLER_SOURCE}</p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
