import { useState } from "react";
import { NatalChart } from "@/hooks/useNatalChart";
import { ChartSelector } from "./ChartSelector";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

// Traditional rulers only
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const ELEMENT_FUNCTION: Record<string, string> = {
  Fire: 'Intuition', Water: 'Feeling', Air: 'Thinking', Earth: 'Sensation',
};

const FUNCTION_SUIT: Record<string, string> = {
  Intuition: 'Wands', Feeling: 'Cups', Thinking: 'Swords', Sensation: 'Pentacles',
};

const FUNCTION_EMOJI: Record<string, string> = {
  Intuition: '🔥', Feeling: '💧', Thinking: '🗡️', Sensation: '🪙',
};

const OPPOSITE_ELEMENT: Record<string, string> = {
  Fire: 'Water', Water: 'Fire', Air: 'Earth', Earth: 'Air',
};

// Auxiliary functions sit between superior and inferior
const AUXILIARY_MAP: Record<string, string[]> = {
  Fire: ['Air', 'Earth'],   // Intuition → auxiliaries are Thinking & Sensation
  Water: ['Air', 'Earth'],  // Feeling → auxiliaries are Thinking & Sensation
  Air: ['Fire', 'Water'],   // Thinking → auxiliaries are Intuition & Feeling
  Earth: ['Fire', 'Water'], // Sensation → auxiliaries are Intuition & Feeling
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-500/10 text-red-700 border-red-300',
  Water: 'bg-blue-500/10 text-blue-700 border-blue-300',
  Air: 'bg-yellow-500/10 text-yellow-700 border-yellow-300',
  Earth: 'bg-green-500/10 text-green-700 border-green-300',
};

interface FunctionResult {
  superiorElement: string;
  superiorFunction: string;
  superiorSuit: string;
  inferiorElement: string;
  inferiorFunction: string;
  inferiorSuit: string;
  auxiliaryElements: string[];
  sunSign: string;
  sunElement: string;
  ruler: string;
  rulerSign: string;
  rulerElement: string;
  rulerMatchesSun: boolean;
}

function calculateFunctions(chart: NatalChart): FunctionResult | null {
  const sunPos = chart.planets.Sun;
  if (!sunPos) return null;

  const sunSign = sunPos.sign;
  const sunElement = SIGN_ELEMENT[sunSign];
  const ruler = SIGN_RULERS[sunSign];

  // Find what sign the ruler is in
  const rulerPos = chart.planets[ruler as keyof typeof chart.planets];
  if (!rulerPos) return null;

  const rulerSign = rulerPos.sign;
  const rulerElement = SIGN_ELEMENT[rulerSign];

  // Superior function = element of the Sun's ruler
  const superiorElement = rulerElement;
  const superiorFunction = ELEMENT_FUNCTION[superiorElement];
  const superiorSuit = FUNCTION_SUIT[superiorFunction];

  // Inferior = opposite
  const inferiorElement = OPPOSITE_ELEMENT[superiorElement];
  const inferiorFunction = ELEMENT_FUNCTION[inferiorElement];
  const inferiorSuit = FUNCTION_SUIT[inferiorFunction];

  const auxiliaryElements = AUXILIARY_MAP[superiorElement];

  return {
    superiorElement, superiorFunction, superiorSuit,
    inferiorElement, inferiorFunction, inferiorSuit,
    auxiliaryElements,
    sunSign, sunElement, ruler, rulerSign, rulerElement,
    rulerMatchesSun: sunElement === rulerElement,
  };
}

function FunctionCard({ label, emoji, func, suit, element, description, colorClass }: {
  label: string; emoji: string; func: string; suit: string; element: string; description: string; colorClass: string;
}) {
  return (
    <Card className={`border ${colorClass}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-xl font-serif font-semibold">{func}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={colorClass}>{element}</Badge>
          <Badge variant="outline">🃏 {suit}</Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

const FUNCTION_DESCRIPTIONS: Record<string, { superior: string; inferior: string }> = {
  Intuition: {
    superior: "You naturally perceive possibilities, patterns, and hidden meanings. In tarot, Wands cards will feel most natural to interpret — you instinctively understand themes of inspiration, vision, and creative fire.",
    inferior: "The world of raw feelings and emotional depths can feel overwhelming or hard to access. Cups cards may initially confuse you or trigger strong unconscious reactions — but they hold your greatest growth potential.",
  },
  Feeling: {
    superior: "You naturally navigate through empathy, values, and emotional intelligence. Cups cards feel like home — you instinctively read relationship dynamics, emotional undercurrents, and matters of the heart.",
    inferior: "Abstract possibilities and 'big picture' visions can feel ungrounded or anxiety-inducing. Wands cards may initially feel vague or overwhelming — but working with them develops your visionary side.",
  },
  Thinking: {
    superior: "You naturally analyze, categorize, and find logical patterns. Swords cards are your strength — you instinctively understand mental clarity, decisions, truth-seeking, and intellectual challenges.",
    inferior: "The physical, sensory world — bodies, money, material reality — can feel like a foreign language. Pentacles cards may initially bore you or feel 'too simple' — but they ground your brilliance in reality.",
  },
  Sensation: {
    superior: "You naturally perceive through your senses — what's real, tangible, and present. Pentacles cards are your home base — you instinctively understand resources, craftsmanship, health, and material security.",
    inferior: "Abstract thinking and intellectual detachment can feel cold or pointless. Swords cards may initially feel harsh or overly mental — but they sharpen your ability to discern and communicate clearly.",
  },
};

// Court Card Quiz — expanded with suit + rank questions
const SUIT_QUESTIONS = [
  {
    question: "What draws you to a new idea?",
    icon: "💡",
    options: [
      { label: "The spark — I feel it in my gut before I can explain it", suit: "Wands" },
      { label: "How it makes me feel — does it resonate emotionally?", suit: "Cups" },
      { label: "Whether it's logical — does it actually make sense?", suit: "Swords" },
      { label: "Whether it's practical — can I build something real with it?", suit: "Pentacles" },
    ],
  },
  {
    question: "When a friend is going through a hard time, you:",
    icon: "🤝",
    options: [
      { label: "Inspire them with possibilities and a bigger vision", suit: "Wands" },
      { label: "Hold space and let them feel their feelings with you", suit: "Cups" },
      { label: "Help them think it through and find clarity", suit: "Swords" },
      { label: "Show up with something tangible — food, help, a plan", suit: "Pentacles" },
    ],
  },
  {
    question: "Your ideal weekend looks like:",
    icon: "🌅",
    options: [
      { label: "An adventure — somewhere new, something spontaneous", suit: "Wands" },
      { label: "Quality time — deep conversations, music, art", suit: "Cups" },
      { label: "Learning — a book, documentary, or stimulating debate", suit: "Swords" },
      { label: "Making something — cooking, gardening, organizing", suit: "Pentacles" },
    ],
  },
  {
    question: "You're most drained by:",
    icon: "😩",
    options: [
      { label: "Routine and repetition — I need novelty", suit: "Wands" },
      { label: "Conflict and coldness — I need harmony", suit: "Cups" },
      { label: "Chaos and illogic — I need order", suit: "Swords" },
      { label: "Instability and waste — I need security", suit: "Pentacles" },
    ],
  },
];

const RANK_QUESTIONS = [
  {
    question: "How do you relate to your own power?",
    icon: "⚡",
    options: [
      { label: "I'm still figuring it out — every day I learn something new", rank: "Page" },
      { label: "I'm chasing it — I want to prove what I'm capable of", rank: "Knight" },
      { label: "I hold it quietly — I lead through understanding, not force", rank: "Queen" },
      { label: "I own it — I've earned my authority through experience", rank: "King" },
    ],
  },
  {
    question: "When you walk into a room of strangers:",
    icon: "🚪",
    options: [
      { label: "I observe and absorb — I'm curious about everyone", rank: "Page" },
      { label: "I make an entrance — I want to be seen and engage", rank: "Knight" },
      { label: "I feel the energy — I tune into the emotional atmosphere", rank: "Queen" },
      { label: "I assess the room — I know where I stand instinctively", rank: "King" },
    ],
  },
  {
    question: "Your approach to making decisions is:",
    icon: "🔮",
    options: [
      { label: "I ask others and gather lots of input first", rank: "Page" },
      { label: "I decide fast and course-correct later if needed", rank: "Knight" },
      { label: "I sit with it until I feel a deep inner knowing", rank: "Queen" },
      { label: "I weigh the facts, decide, and commit fully", rank: "King" },
    ],
  },
  {
    question: "Which stage of life resonates most right now?",
    icon: "🌱",
    options: [
      { label: "Beginning — everything feels new and full of potential", rank: "Page" },
      { label: "Pursuit — I'm actively going after what I want", rank: "Knight" },
      { label: "Depth — I'm cultivating inner wisdom and emotional truth", rank: "Queen" },
      { label: "Mastery — I'm building legacy and leading from experience", rank: "King" },
    ],
  },
];

const ALL_QUIZ_QUESTIONS = [
  ...SUIT_QUESTIONS.map(q => ({ ...q, type: 'suit' as const })),
  ...RANK_QUESTIONS.map(q => ({ ...q, type: 'rank' as const })),
];

const COURT_RANK_DESCRIPTIONS: Record<string, { title: string; archetype: string; traits: string; reading: string }> = {
  Page: { title: "Page", archetype: "The Student", traits: "Curious, eager, open-minded, sometimes naive. You're in a phase of learning and discovery. Messages and new beginnings define your energy.", reading: "When this card appears for others, it signals a message incoming or a fresh start. For you, it's a reminder that your greatest strength is your willingness to learn." },
  Knight: { title: "Knight", archetype: "The Quester", traits: "Passionate, driven, sometimes reckless. You pursue what you want with intensity and speed. Action, movement, and pursuit are your calling cards.", reading: "When this card appears for others, it signals momentum and pursuit. For you, it's a reminder to channel your drive purposefully — speed without direction is just chaos." },
  Queen: { title: "Queen", archetype: "The Nurturer", traits: "Emotionally mature, intuitive, receptive. You channel energy inward and use it with depth and wisdom. Mastery through feeling and inner knowing.", reading: "When this card appears for others, it signals emotional intelligence at work. For you, it's a reminder that your receptivity IS your power — you don't need to push to lead." },
  King: { title: "King", archetype: "The Authority", traits: "Commanding, experienced, outwardly directed. You've integrated your element and wield it with confidence and responsibility. Leadership and external mastery.", reading: "When this card appears for others, it signals mature authority. For you, it's a reminder that your experience has earned you the right to lead — trust your track record." },
};

const COURT_CARD_PROFILES: Record<string, { personality: string; shadow: string; advice: string; symbols: string }> = {
  "Page of Wands": {
    personality: "You are the eternal spark — the one who lights up when a new idea hits. You live for creative beginnings, passion projects, and the thrill of possibility. People are drawn to your infectious enthusiasm and your willingness to try anything.",
    shadow: "You may start a hundred things and finish three. Your fire burns bright but brief. Watch for scattered energy and chasing novelty over depth.",
    advice: "Your gift is ignition. Not every flame needs to become a bonfire — some are meant to light someone else's torch.",
    symbols: "A young figure holding a wand in a desert landscape, gazing with wonder. Salamanders on their tunic. The energy of 'what could be.'"
  },
  "Knight of Wands": {
    personality: "You are pure momentum — a blazing comet of passion and action. You don't just have ideas, you chase them with reckless devotion. Charismatic and bold, you book the flight before checking the price and confess feelings at 2am.",
    shadow: "Impulsiveness can burn bridges. You may charge into situations without reading the room, leaving unfinished quests and bewildered people behind.",
    advice: "Your fire is real and rare — but direction matters more than speed. Before you charge, ask: 'Am I running toward something or away from something?'",
    symbols: "A rider on a rearing horse, plumes of fire, desert landscape. Pure kinetic energy — the charge before the battle."
  },
  "Queen of Wands": {
    personality: "You radiate warmth and creative authority. People gather around you not because you demand attention, but because your presence is magnetic — you make others feel seen, inspired, and capable. You are the sunflower and the sun.",
    shadow: "You can become possessive of your creative territory or jealous when others shine. Your warmth can turn to scorching heat if you feel disrespected.",
    advice: "Your throne is built on authenticity, not performance. You don't need to be 'on' all the time — your quiet fire is just as powerful as your roar.",
    symbols: "A confident figure on a throne holding a wand and a sunflower, with a black cat at her feet. Creative sovereignty and inner fire."
  },
  "King of Wands": {
    personality: "You are the visionary leader — the one who sees the big picture and inspires others to build it. You've taken raw creative fire and forged it into something sustainable. Your confidence isn't bravado — it's earned through creative courage.",
    shadow: "You can become domineering or dismissive of others' ideas when too attached to your own vision. Your certainty can calcify into rigidity.",
    advice: "The greatest kings build kingdoms that outlast them. Your vision is the spark, but your people are the fuel. Lead with generosity, not just genius.",
    symbols: "A commanding figure on a throne with lions and salamanders. A wand planted firmly — not waved, but wielded with purpose."
  },
  "Page of Cups": {
    personality: "You are the dreamer — tender, imaginative, and emotionally open in a way that startles people. You see beauty in the mundane and feel things others walk right past. You're the one who cries at commercials and means it.",
    shadow: "Your emotional openness can make you naive or easily manipulated. You may retreat into fantasy when reality feels too harsh.",
    advice: "Your sensitivity is not weakness — it's a superpower. But learn to discern between intuition and wishful thinking. Not every fish in your cup is a gift.",
    symbols: "A young figure gazing curiously at a fish emerging from a golden cup. The unexpected arrival of feeling and creativity."
  },
  "Knight of Cups": {
    personality: "You are the romantic quester — pursuing love, beauty, and emotional truth with poetic intensity. You write the love letter, plan the meaningful gesture, or follow a feeling across continents. Your emotional courage is remarkable.",
    shadow: "You can become moody, emotionally manipulative, or addicted to the high of falling in love without staying for the work of loving.",
    advice: "The grail you seek isn't in another person or another horizon — it's in your capacity to sit with your own depths. The bravest quest is inward.",
    symbols: "A knight on a white horse, calmly approaching with a cup extended. Not charging — offering. The quiet courage of emotional vulnerability."
  },
  "Queen of Cups": {
    personality: "You are the deep well — emotionally psychic, compassionate, and profoundly intuitive. You sense what others feel before they speak it. People confide in you because your presence alone is healing. Your emotional intelligence is your throne.",
    shadow: "You can absorb others' emotions until you lose yourself. Codependency, martyrdom, and emotional enmeshment are your traps.",
    advice: "Your gift of feeling everything is sacred, but you must learn where you end and others begin. A cup that's always pouring eventually runs dry.",
    symbols: "A contemplative figure at the water's edge, holding an ornate sealed cup. Emotions mastered, not suppressed."
  },
  "King of Cups": {
    personality: "You are emotional mastery personified — you feel deeply but act wisely. You've learned to navigate your inner ocean without drowning in it. Calm in crisis, compassionate without being consumed, everyone turns to you when things fall apart.",
    shadow: "Your control can become emotional repression. You may appear calm while seething underneath, or use emotional intelligence to manipulate.",
    advice: "True mastery isn't controlling the waves — it's surfing them. Let people see your depths sometimes. Vulnerability from strength is the most powerful thing there is.",
    symbols: "A composed figure amid turbulent seas, holding a cup steadily. A fish and a ship — unconscious and conscious held in balance."
  },
  "Page of Swords": {
    personality: "You are the sharp observer — endlessly curious, mentally agile, and always watching. You ask the questions nobody else thinks to ask and notice the detail everyone else misses. Truth matters to you more than comfort.",
    shadow: "You can become argumentative for sport, or so focused on finding flaws that you miss the beauty. Your sharp tongue can cut people you love.",
    advice: "Your mind is a magnificent sword — but a sword that swings at everything eventually hits something precious. Choose your battles.",
    symbols: "A vigilant figure on rough ground, sword raised, hair blown by wind. Alert, watchful, ready — the spy before the battle."
  },
  "Knight of Swords": {
    personality: "You are the intellectual warrior — charging toward truth with the ferocity of a storm. You cut through nonsense, challenge authority, and refuse to accept 'because I said so.' Your mind is a weapon and you wield it fearlessly.",
    shadow: "You can become ruthless, tactless, or so attached to being right that you destroy relationships in the name of truth.",
    advice: "Being right and being effective are not the same thing. The sharpest blade is useless if wielded without precision. Slow down long enough to aim.",
    symbols: "A charging knight, sword raised high, riding into a storm. Trees bending, clouds racing. The unstoppable force of a mind on a mission."
  },
  "Queen of Swords": {
    personality: "You are the clear-eyed truth-teller — someone who has suffered and emerged sharper, not harder. Your clarity comes from experience, not theory. You see through pretense instantly and speak with precision that cuts to the core.",
    shadow: "You can become cold, judgmental, or isolated behind walls of independence. Past pain may make you preemptively push people away.",
    advice: "Your sword of truth is most powerful when held with an open heart. You've earned your clarity through pain — now use it to liberate, not to punish.",
    symbols: "A solitary figure on a throne in the clouds, sword upright, one hand extended. Butterflies and a crescent moon. Grief transformed into wisdom."
  },
  "King of Swords": {
    personality: "You are the strategic authority — fair, analytical, and unswayed by emotional manipulation. You make decisions based on principle and precedent, not feelings. People respect you because your judgments are consistent and your standards are clear.",
    shadow: "You can become tyrannical in your logic, dismissing emotion as weakness and demanding perfection from others. Detachment may read as coldness.",
    advice: "The greatest minds serve the greatest hearts. Logic without compassion is just cruelty with good grammar. Let your principles protect people, not punish them.",
    symbols: "An authoritative figure on a throne, sword raised vertically, butterflies carved in stone. Thought made law."
  },
  "Page of Pentacles": {
    personality: "You are the devoted student of the material world — fascinated by how things work, grow, and are built. You approach money, health, and craft with genuine wonder and patience. You practice until you get it right.",
    shadow: "You can become too cautious, missing opportunities while 'preparing.' Perfectionism and analysis paralysis may keep you studying instead of doing.",
    advice: "The seed you're examining so carefully? It's time to plant it. Perfection is the enemy of progress. Your careful nature will serve you — but only if you begin.",
    symbols: "A figure in a green landscape, holding a pentacle up and studying it with fascination. Rich earth, a plowed field."
  },
  "Knight of Pentacles": {
    personality: "You are the reliable builder — methodical, hardworking, and quietly unstoppable. While others sprint and crash, you maintain a steady pace that actually gets you there. You show up every day, do the work, and finish what you start. Always.",
    shadow: "You can become stubborn, rigid, or so focused on the plan that you miss when it needs to change. You may equate your worth with productivity.",
    advice: "Your consistency is your crown, but don't let it become a cage. Sometimes the most productive thing is rest. Sometimes the plan needs to change.",
    symbols: "A knight on a heavy workhorse, standing still in a plowed field. Not charging — enduring. The long game personified."
  },
  "Queen of Pentacles": {
    personality: "You are the abundant nurturer — someone who creates beauty, comfort, and security wherever you go. Your home is a sanctuary, your cooking feeds the soul, your advice is practical and warm. You have a magical ability to make things grow.",
    shadow: "You can become possessive, materialistic, or so focused on providing for others that you forget your own needs. Generosity may come with invisible strings.",
    advice: "Your abundance is real and you've earned it — but remember that the most valuable thing you grow is yourself. Don't lose the wild woman inside the garden walls.",
    symbols: "A nurturing figure on a throne in a lush garden, holding a pentacle lovingly. A rabbit at her feet, flowers everywhere."
  },
  "King of Pentacles": {
    personality: "You are the master builder — patience, discipline, and practical wisdom turned into tangible wealth and security. Not just money, but a life that works: stable relationships, good health, a home reflecting your values. Proof that slow, intentional effort creates lasting results.",
    shadow: "You can become controlling, status-obsessed, or so attached to what you've built that you resist all change. Your empire may become your prison.",
    advice: "You've built something remarkable — now make sure it serves life, not just legacy. The greatest wealth is the freedom to be generous.",
    symbols: "A prosperous figure surrounded by vines and bulls, holding a pentacle and a scepter. Material mastery complete."
  },
};

const SUIT_IMAGERY: Record<string, { emoji: string; keywords: string; courtStyle: string }> = {
  Wands: { emoji: "🔥", keywords: "Passion, creativity, ambition, spiritual fire", courtStyle: "The Wands court are visionaries and creators — charismatic, restless, and driven by inspiration." },
  Cups: { emoji: "🌊", keywords: "Emotions, love, relationships, inner world", courtStyle: "The Cups court are feelers and healers — empathic, romantic, and guided by the heart." },
  Swords: { emoji: "⚔️", keywords: "Intellect, truth, conflict, clarity", courtStyle: "The Swords court are thinkers and truth-seekers — sharp, analytical, and unafraid of hard truths." },
  Pentacles: { emoji: "🌿", keywords: "Material world, health, money, craft", courtStyle: "The Pentacles court are builders and providers — steady, resourceful, and deeply grounded." },
};

const SUIT_CARD_STYLES: Record<string, { border: string; bg: string; glow: string; accent: string }> = {
  Wands: { border: 'border-red-400/60', bg: 'bg-gradient-to-b from-red-950/40 via-red-900/20 to-orange-950/30', glow: 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]', accent: 'text-red-300' },
  Cups: { border: 'border-blue-400/60', bg: 'bg-gradient-to-b from-blue-950/40 via-blue-900/20 to-cyan-950/30', glow: 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]', accent: 'text-blue-300' },
  Swords: { border: 'border-yellow-400/60', bg: 'bg-gradient-to-b from-slate-900/40 via-yellow-950/10 to-slate-950/30', glow: 'shadow-[0_0_40px_-10px_rgba(250,204,21,0.3)]', accent: 'text-yellow-300' },
  Pentacles: { border: 'border-green-400/60', bg: 'bg-gradient-to-b from-green-950/40 via-emerald-900/20 to-green-950/30', glow: 'shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]', accent: 'text-green-300' },
};

const SUIT_NUMERAL: Record<string, string> = {
  Wands: '🜂', Cups: '🜄', Swords: '🜁', Pentacles: '🜃',
};

function CourtCardQuiz({ chart }: { chart: NatalChart }) {
  const chartId = chart.name || 'default';
  const storageKey = `court-card-result-${chartId}`;
  const savedData = (() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [answers, setAnswers] = useState<Record<number, string>>(savedData?.answers || {});
  const [showResult, setShowResult] = useState(!!savedData?.result);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaved, setIsSaved] = useState(!!savedData?.result);

  const sunPos = chart.planets.Sun;
  if (!sunPos) return null;

  // Elemental signature for added weight (shown after quiz)
  const elementWeights: Record<string, number> = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
  const breakdown: { name: string; sign: string; element: string; weight: number }[] = [];
  const astroWeights: Record<string, number> = { Sun: 3, Moon: 3, Ascendant: 2, Mercury: 1, Venus: 1, Mars: 1 };

  for (const [planet, weight] of Object.entries(astroWeights)) {
    if (planet === 'Ascendant') {
      const asc = chart.houseCusps?.house1;
      if (asc) {
        const el = SIGN_ELEMENT[asc.sign];
        if (el) { elementWeights[el] += weight; breakdown.push({ name: 'Ascendant', sign: asc.sign, element: el, weight }); }
      }
    } else {
      const pos = chart.planets[planet as keyof typeof chart.planets];
      if (pos) {
        const el = SIGN_ELEMENT[pos.sign];
        if (el) { elementWeights[el] += weight; breakdown.push({ name: planet, sign: pos.sign, element: el, weight }); }
      }
    }
  }

  const totalAstroWeight = Object.values(elementWeights).reduce((a, b) => a + b, 0);

  const handleAnswer = (questionIndex: number, value: string) => {
    const newAnswers = { ...answers, [questionIndex]: value };
    setAnswers(newAnswers);
    setShowResult(false);
    // Auto-advance after a short delay
    if (currentStep < ALL_QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => Math.min(prev + 1, ALL_QUIZ_QUESTIONS.length - 1)), 300);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === ALL_QUIZ_QUESTIONS.length;
  const progress = Math.round((answeredCount / ALL_QUIZ_QUESTIONS.length) * 100);

  const calculateResult = (): { suit: string; rank: string } => {
    // Tally suit votes from quiz
    const suitCounts: Record<string, number> = { Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 };
    const rankCounts: Record<string, number> = { Page: 0, Knight: 0, Queen: 0, King: 0 };

    ALL_QUIZ_QUESTIONS.forEach((q, i) => {
      const answer = answers[i];
      if (!answer) return;
      if (q.type === 'suit') {
        const opt = SUIT_QUESTIONS.find(sq => sq.question === q.question)?.options.find(o => o.suit === answer);
        if (opt) suitCounts[opt.suit]++;
      } else {
        const opt = RANK_QUESTIONS.find(rq => rq.question === q.question)?.options.find(o => o.rank === answer);
        if (opt) rankCounts[opt.rank]++;
      }
    });

    // Add elemental signature as weighted bonus (0.5 per astro point, normalized)
    if (totalAstroWeight > 0) {
      for (const [el, w] of Object.entries(elementWeights)) {
        const func = ELEMENT_FUNCTION[el];
        const s = FUNCTION_SUIT[func];
        suitCounts[s] += (w / totalAstroWeight) * 1.5; // up to 1.5 bonus points
      }
    }

    // Modality tiebreaker for rank
    const modalityBoost: Record<string, string> = {
      Aries: 'Knight', Cancer: 'Queen', Libra: 'Queen', Capricorn: 'King',
      Taurus: 'King', Leo: 'King', Scorpio: 'Queen', Aquarius: 'Knight',
      Gemini: 'Knight', Virgo: 'Page', Sagittarius: 'Knight', Pisces: 'Queen',
    };
    const boost = modalityBoost[sunPos.sign] || 'Knight';
    rankCounts[boost] += 0.5;

    const suit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0][0];
    const rank = Object.entries(rankCounts).sort((a, b) => b[1] - a[1])[0][0];
    return { suit, rank };
  };

  const result = allAnswered ? calculateResult() : null;
  const rankInfo = result ? COURT_RANK_DESCRIPTIONS[result.rank] : null;
  const suitInfo = result ? SUIT_IMAGERY[result.suit] : null;

  const currentQ = ALL_QUIZ_QUESTIONS[currentStep];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif">👑 Discover Your Court Card</CardTitle>
        <p className="text-sm text-muted-foreground">Answer 8 questions and your chart does the rest.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answeredCount} of {ALL_QUIZ_QUESTIONS.length} answered</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question navigation dots */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {ALL_QUIZ_QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all border ${
                i === currentStep
                  ? 'bg-primary text-primary-foreground border-primary scale-110'
                  : answers[i] !== undefined
                    ? 'bg-primary/20 border-primary/40 text-foreground'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        <div className="p-5 rounded-lg bg-secondary/20 border border-border space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{currentQ.icon}</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {currentQ.type === 'suit' ? 'Your Element' : 'Your Rank'} · Question {currentStep + 1}
              </p>
              <p className="font-serif text-base font-medium">{currentQ.question}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {currentQ.type === 'suit'
              ? SUIT_QUESTIONS.find(q => q.question === currentQ.question)?.options.map((opt, oi) => {
                  const selected = answers[currentStep] === opt.suit;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(currentStep, opt.suit)}
                      className={`p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${
                        selected
                          ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-sm'
                          : 'bg-background border-border hover:bg-secondary/40 hover:border-primary/30'
                      }`}
                    >
                      <span className="text-lg shrink-0">{SUIT_IMAGERY[opt.suit].emoji}</span>
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  );
                })
              : RANK_QUESTIONS.find(q => q.question === currentQ.question)?.options.map((opt, oi) => {
                  const selected = answers[currentStep] === opt.rank;
                  const rankEmoji: Record<string, string> = { Page: '📖', Knight: '⚔️', Queen: '👑', King: '🏛️' };
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(currentStep, opt.rank)}
                      className={`p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${
                        selected
                          ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-sm'
                          : 'bg-background border-border hover:bg-secondary/40 hover:border-primary/30'
                      }`}
                    >
                      <span className="text-lg shrink-0">{rankEmoji[opt.rank]}</span>
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  );
                })
            }
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary/40 disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(s => Math.min(ALL_QUIZ_QUESTIONS.length - 1, s + 1))}
            disabled={currentStep === ALL_QUIZ_QUESTIONS.length - 1}
            className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary/40 disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
          {allAnswered && !showResult && (
            <button
              onClick={() => setShowResult(true)}
              className="ml-auto px-6 py-2 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              ✨ Reveal My Court Card
            </button>
          )}
        </div>

        {/* Result */}
        {showResult && result && rankInfo && suitInfo && (() => {
          const cardName = `${rankInfo.title} of ${result.suit}`;
          const profile = COURT_CARD_PROFILES[cardName];
          const cardStyle = SUIT_CARD_STYLES[result.suit];
          const numeral = SUIT_NUMERAL[result.suit];
          return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tarot Card Frame */}
            <div className="flex justify-center">
              <div className={`relative w-64 rounded-2xl border-2 ${cardStyle.border} ${cardStyle.bg} ${cardStyle.glow} p-1 overflow-hidden`}>
                {/* Inner card */}
                <div className="rounded-xl border border-white/10 bg-background/80 backdrop-blur-sm overflow-hidden">
                  {/* Top decoration */}
                  <div className="flex justify-between items-start px-3 pt-3">
                    <span className={`text-xs font-serif ${cardStyle.accent}`}>{numeral}</span>
                    <span className={`text-xs font-serif ${cardStyle.accent}`}>{numeral}</span>
                  </div>
                  
                  {/* Card center */}
                  <div className="px-6 py-8 text-center space-y-3">
                    <p className="text-6xl">{suitInfo.emoji}</p>
                    <div className="space-y-1">
                      <p className={`text-lg font-serif font-bold tracking-wide ${cardStyle.accent}`}>
                        {rankInfo.title}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">— of —</p>
                      <p className={`text-lg font-serif font-bold tracking-wide ${cardStyle.accent}`}>
                        {result.suit}
                      </p>
                    </div>
                    <p className="text-xs italic text-muted-foreground pt-2">"{rankInfo.archetype}"</p>
                  </div>

                  {/* Bottom decoration */}
                  <div className="flex justify-between items-end px-3 pb-3">
                    <span className={`text-xs font-serif rotate-180 ${cardStyle.accent}`}>{numeral}</span>
                    <span className={`text-xs font-serif rotate-180 ${cardStyle.accent}`}>{numeral}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unique personality profile */}
            {profile && (
              <div className="space-y-4">
                <div className="p-5 rounded-lg bg-secondary/20 border border-border space-y-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">🪞 Your Personality</p>
                  <p className="text-sm leading-relaxed">{profile.personality}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">🌑 Your Shadow</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{profile.shadow}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">💎 Your Advice</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{profile.advice}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-border space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">🎨 Traditional Imagery</p>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">{profile.symbols}</p>
                </div>
              </div>
            )}

            {/* Court style */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">The {result.suit} Court</p>
              <p className="text-sm text-muted-foreground">{suitInfo.courtStyle}</p>
            </div>

            {/* Reading advice */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">In Your Readings</p>
              <p className="text-sm text-muted-foreground">{rankInfo.reading}</p>
            </div>

            {/* Save button */}
            <button
              onClick={() => {
                localStorage.setItem(storageKey, JSON.stringify({ result, answers, savedAt: new Date().toISOString() }));
                setIsSaved(true);
              }}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isSaved
                  ? 'bg-green-500/10 border border-green-400/40 text-green-400 cursor-default'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              disabled={isSaved}
            >
              {isSaved ? '✓ Saved to Your Chart' : '💾 Save My Court Card'}
            </button>

            {/* Significator tip */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary/70">✨ Your Significator</p>
              <p className="text-sm text-muted-foreground">
                Use the <strong>{cardName}</strong> as your significator card. Pull it from the deck before shuffling and place it face-up to anchor the reading in your energy.
              </p>
            </div>

            {/* Elemental signature (added weight, shown after) */}
            <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Your Elemental Signature (Chart Influence)</p>
              <p className="text-xs text-muted-foreground">Your chart placements added weighted influence to your suit result:</p>
              <div className="flex gap-2 flex-wrap">
                {breakdown.map((b, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-xs border ${ELEMENT_COLORS[b.element]}`}>
                    {b.name} in {b.sign} <span className="opacity-60">({b.element} ×{b.weight})</span>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(elementWeights).filter(([,v]) => v > 0).sort((a,b) => b[1] - a[1]).map(([el, w]) => (
                  <span key={el} className={`px-2 py-1 rounded-full text-xs border font-medium ${ELEMENT_COLORS[el]}`}>
                    {el}: {Math.round((w / totalAstroWeight) * 100)}%
                  </span>
                ))}
              </div>
            </div>

            {/* Retake */}
            <button
              onClick={() => { setAnswers({}); setShowResult(false); setCurrentStep(0); setIsSaved(false); localStorage.removeItem(storageKey); }}
              className="w-full py-2 rounded border border-border text-sm text-muted-foreground hover:bg-secondary/40 transition-colors"
            >
              Retake Quiz
            </button>
          </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function TarotFunctionsView({ userNatalChart, savedCharts }: Props) {
  const allCharts = [...(userNatalChart ? [userNatalChart] : []), ...savedCharts];
  const [selectedId, setSelectedId] = useState(userNatalChart ? 'user' : allCharts[0]?.id || '');

  const chart = selectedId === 'user' ? userNatalChart : savedCharts.find(c => c.id === selectedId);
  const result = chart ? calculateFunctions(chart) : null;

  if (allCharts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-2xl font-serif mb-2">🃏 Tarot Functions</p>
        <p className="text-muted-foreground">Add a chart in Charts to discover your superior & inferior Jungian functions for tarot.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm max-w-2xl">
          Carl Jung's four psychological functions — Intuition, Feeling, Thinking, and Sensation — map directly to the four tarot suits and astrological elements. Your natal chart reveals which function is your <strong>strongest</strong> (superior) and which is your <strong>blind spot</strong> (inferior).
        </p>
      </div>

      {/* Chart selector */}
      {allCharts.length > 1 && (
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedId}
          onSelect={setSelectedId}
          label="Calculate for:"
        />
      )}

      {result ? (
        <div className="space-y-8">
          {/* How it's calculated */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">How Your Functions Were Determined</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded bg-secondary/50 border border-border">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 1: Your Sun Sign</p>
                  <p className="font-medium">☉ Sun in {result.sunSign}</p>
                  <p className="text-muted-foreground text-xs mt-1">{result.sunElement} element</p>
                </div>
                <div className="p-3 rounded bg-secondary/50 border border-border">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 2: Sun's Ruler</p>
                  <p className="font-medium">{result.ruler} rules {result.sunSign}</p>
                  <p className="text-muted-foreground text-xs mt-1">{result.ruler} is in {result.rulerSign} ({result.rulerElement})</p>
                </div>
                <div className="p-3 rounded bg-secondary/50 border border-border">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 3: Superior Function</p>
                  <p className="font-medium">{result.rulerElement} → {result.superiorFunction}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {result.rulerMatchesSun
                      ? "Ruler is in the same element as your Sun — doubly strong!"
                      : `Your Sun is ${result.sunElement} but your ruler brings ${result.rulerElement} energy`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Superior & Inferior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FunctionCard
              label="Superior Function — Your Strength"
              emoji={FUNCTION_EMOJI[result.superiorFunction]}
              func={result.superiorFunction}
              suit={result.superiorSuit}
              element={result.superiorElement}
              description={FUNCTION_DESCRIPTIONS[result.superiorFunction].superior}
              colorClass={ELEMENT_COLORS[result.superiorElement]}
            />
            <FunctionCard
              label="Inferior Function — Your Blind Spot"
              emoji={FUNCTION_EMOJI[result.inferiorFunction]}
              func={result.inferiorFunction}
              suit={result.inferiorSuit}
              element={result.inferiorElement}
              description={FUNCTION_DESCRIPTIONS[result.inferiorFunction].inferior}
              colorClass={ELEMENT_COLORS[result.inferiorElement]}
            />
          </div>

          {/* Auxiliary Functions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Your Auxiliary Functions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Between your strongest and weakest functions sit two <strong>auxiliary</strong> functions. These are your "helping hands" — neither as effortless as your superior nor as challenging as your inferior.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.auxiliaryElements.map(el => {
                  const func = ELEMENT_FUNCTION[el];
                  const suit = FUNCTION_SUIT[func];
                  return (
                    <div key={el} className={`p-4 rounded border ${ELEMENT_COLORS[el]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{FUNCTION_EMOJI[func]}</span>
                        <span className="font-medium">{func}</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{el}</Badge>
                        <Badge variant="outline" className="text-xs">🃏 {suit}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {suit} cards are accessible to you — not your first instinct, but you can work with them comfortably.
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tarot Reading Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">🃏 How to Use This in Readings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="space-y-3">
                <div className="p-3 rounded bg-secondary/30 border border-border">
                  <p className="font-medium text-foreground mb-1">When your Superior suit appears ({result.superiorSuit})</p>
                  <p>Trust your instincts. These cards speak your native language. Your interpretations here are likely accurate and insightful — lean into confidence.</p>
                </div>
                <div className="p-3 rounded bg-secondary/30 border border-border">
                  <p className="font-medium text-foreground mb-1">When your Inferior suit appears ({result.inferiorSuit})</p>
                  <p>Slow down and pay extra attention. These cards carry messages from your unconscious — they often point to where the <em>real</em> growth is happening. Don't dismiss them as irrelevant.</p>
                </div>
                <div className="p-3 rounded bg-secondary/30 border border-border">
                  <p className="font-medium text-foreground mb-1">When a reading is dominated by your Inferior suit</p>
                  <p>This is a significant message. Life is asking you to develop your weakest function. It may feel uncomfortable, but this is where transformation lives.</p>
                </div>
                <div className="p-3 rounded bg-secondary/30 border border-border">
                  <p className="font-medium text-foreground mb-1">Significator Card Selection</p>
                  <p>Choose your significator from your Superior suit. For example, if {result.superiorSuit} is your strength, consider the King/Queen of {result.superiorSuit} as your significator depending on how you identify.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Court Card Quiz */}
          {chart && <CourtCardQuiz chart={chart} />}

          {/* Element ↔ Function reference */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Quick Reference: Elements ↔ Functions ↔ Suits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Fire', 'Water', 'Air', 'Earth'] as const).map(el => {
                  const func = ELEMENT_FUNCTION[el];
                  const suit = FUNCTION_SUIT[func];
                  const isSuper = el === result.superiorElement;
                  const isInferior = el === result.inferiorElement;
                  return (
                    <div
                      key={el}
                      className={`p-3 rounded border text-center ${ELEMENT_COLORS[el]} ${
                        isSuper ? 'ring-2 ring-primary' : isInferior ? 'ring-2 ring-destructive/50' : ''
                      }`}
                    >
                      <p className="text-2xl mb-1">{FUNCTION_EMOJI[func]}</p>
                      <p className="font-medium text-sm">{el}</p>
                      <p className="text-xs">{func}</p>
                      <p className="text-xs text-muted-foreground">{suit}</p>
                      {isSuper && <Badge className="mt-1 text-[10px]" variant="default">Your Strength</Badge>}
                      {isInferior && <Badge className="mt-1 text-[10px]" variant="destructive">Blind Spot</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Unable to calculate functions — make sure the selected chart has Sun and its ruler's positions entered.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
