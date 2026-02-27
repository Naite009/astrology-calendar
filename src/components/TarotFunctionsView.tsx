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
