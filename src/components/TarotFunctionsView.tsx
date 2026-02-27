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

// Court Card Quiz
const COURT_QUIZ_QUESTIONS = [
  {
    question: "When you encounter a new challenge, you tend to:",
    options: [
      { label: "Watch and study it first — there's so much to learn", rank: "Page" },
      { label: "Charge in and figure it out along the way", rank: "Knight" },
      { label: "Feel into it — what does my intuition say?", rank: "Queen" },
      { label: "Assess it strategically — I know what works", rank: "King" },
    ],
  },
  {
    question: "In a group, you naturally:",
    options: [
      { label: "Ask questions and absorb everyone's perspective", rank: "Page" },
      { label: "Push for action — let's stop talking and do", rank: "Knight" },
      { label: "Hold space for the emotional temperature of the room", rank: "Queen" },
      { label: "Take the lead and set the direction", rank: "King" },
    ],
  },
  {
    question: "Your relationship to your element's energy is:",
    options: [
      { label: "I'm still discovering it — it surprises me", rank: "Page" },
      { label: "I chase it relentlessly — sometimes too much", rank: "Knight" },
      { label: "I channel it inward — it's part of my wisdom", rank: "Queen" },
      { label: "I've mastered it — I wield it with authority", rank: "King" },
    ],
  },
  {
    question: "When reading tarot for yourself, you prefer to:",
    options: [
      { label: "Pull a single card and journal about it", rank: "Page" },
      { label: "Do a quick 3-card spread and act on it", rank: "Knight" },
      { label: "Sit with a full spread and let meanings emerge slowly", rank: "Queen" },
      { label: "Use a structured spread with clear positions and logic", rank: "King" },
    ],
  },
];

const COURT_RANK_DESCRIPTIONS: Record<string, { title: string; archetype: string; traits: string }> = {
  Page: { title: "Page", archetype: "The Student", traits: "Curious, eager, open-minded, sometimes naive. You're in a phase of learning and discovery with this element's energy. Messages and new beginnings." },
  Knight: { title: "Knight", archetype: "The Quester", traits: "Passionate, driven, sometimes reckless. You actively pursue this element's energy with intensity. Action, movement, and pursuit." },
  Queen: { title: "Queen", archetype: "The Nurturer", traits: "Emotionally mature, intuitive, receptive. You channel this element inward and use it with wisdom. Depth, mastery through feeling." },
  King: { title: "King", archetype: "The Authority", traits: "Commanding, experienced, outwardly directed. You've integrated this element and wield it with confidence. Leadership and external mastery." },
};

const SUIT_IMAGERY: Record<string, { emoji: string; keywords: string }> = {
  Wands: { emoji: "🏔️", keywords: "Passion, creativity, ambition, spiritual fire" },
  Cups: { emoji: "🌊", keywords: "Emotions, love, relationships, inner world" },
  Swords: { emoji: "⚔️", keywords: "Intellect, truth, conflict, clarity" },
  Pentacles: { emoji: "🌿", keywords: "Material world, health, money, craft" },
};

function CourtCardQuiz({ chart }: { chart: NatalChart }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const sunPos = chart.planets.Sun;
  if (!sunPos) return null;

  const sunElement = SIGN_ELEMENT[sunPos.sign];
  const suit = FUNCTION_SUIT[ELEMENT_FUNCTION[sunElement]];
  const suitInfo = SUIT_IMAGERY[suit];

  const handleAnswer = (questionIndex: number, rank: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: rank }));
    setShowResult(false);
  };

  const allAnswered = Object.keys(answers).length === COURT_QUIZ_QUESTIONS.length;

  const calculateRank = (): string => {
    const counts: Record<string, number> = { Page: 0, Knight: 0, Queen: 0, King: 0 };
    Object.values(answers).forEach(r => counts[r]++);

    // Tiebreaker: modality of sun sign
    const modalityBoost: Record<string, string> = {
      Aries: 'Knight', Cancer: 'Queen', Libra: 'Queen', Capricorn: 'King',
      Taurus: 'King', Leo: 'King', Scorpio: 'Queen', Aquarius: 'Knight',
      Gemini: 'Knight', Virgo: 'Page', Sagittarius: 'Knight', Pisces: 'Queen',
    };
    const boost = modalityBoost[sunPos.sign] || 'Knight';
    counts[boost] += 0.5;

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const rank = allAnswered ? calculateRank() : null;
  const rankInfo = rank ? COURT_RANK_DESCRIPTIONS[rank] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif">👑 Discover Your Court Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded bg-secondary/30 border border-border space-y-2">
          <p className="text-sm text-muted-foreground">
            Your Sun is in <strong>{sunPos.sign}</strong> ({sunElement}), which places you in the suit of <strong>{suit}</strong>.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{suitInfo.emoji}</span>
            <p className="text-xs text-muted-foreground">{suitInfo.keywords}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Now answer these questions to discover your <strong>rank</strong> — are you the Page, Knight, Queen, or King of {suit}?
          </p>
        </div>

        {COURT_QUIZ_QUESTIONS.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => handleAnswer(qi, opt.rank)}
                  className={`p-3 rounded border text-left text-sm transition-all ${
                    answers[qi] === opt.rank
                      ? 'bg-primary/10 border-primary ring-1 ring-primary'
                      : 'bg-secondary/20 border-border hover:bg-secondary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {allAnswered && !showResult && (
          <button
            onClick={() => setShowResult(true)}
            className="w-full py-3 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Reveal My Court Card
          </button>
        )}

        {showResult && rank && rankInfo && (
          <div className={`p-6 rounded-lg border-2 ${ELEMENT_COLORS[sunElement]} space-y-4`}>
            <div className="text-center space-y-2">
              <p className="text-4xl">{suitInfo.emoji}</p>
              <p className="text-2xl font-serif font-bold">{rankInfo.title} of {suit}</p>
              <p className="text-sm text-muted-foreground italic">{rankInfo.archetype}</p>
            </div>
            <p className="text-sm leading-relaxed">{rankInfo.traits}</p>
            <div className="p-3 rounded bg-background/60 border border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">As Your Significator</p>
              <p className="text-sm text-muted-foreground">
                Use the <strong>{rankInfo.title} of {suit}</strong> as your significator card in readings. 
                This card represents your core identity — pull it from the deck before shuffling and place it face-up 
                to anchor the reading in your energy.
              </p>
            </div>
            <div className="p-3 rounded bg-background/60 border border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Astrological Basis</p>
              <p className="text-sm text-muted-foreground">
                ☉ Sun in {sunPos.sign} → {sunElement} element → Suit of {suit}. 
                Your quiz responses + {sunPos.sign}'s modality energy shaped your rank as {rankInfo.title}.
              </p>
            </div>
          </div>
        )}
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
