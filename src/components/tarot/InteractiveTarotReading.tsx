import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TAROT_DECK,
  SUIT_BADGE,
  SUIT_EMOJI,
  THREE_CARD_POSITIONS,
  CELTIC_CROSS_POSITIONS,
  findCard,
  type TarotCard,
  type TarotSuit,
} from "@/lib/tarotDeck";
import { Loader2, Shuffle, Sparkles, RotateCw } from "lucide-react";
import { toast } from "sonner";

export interface FunctionProfile {
  superiorFunction: string;
  superiorSuit: string;
  superiorElement: string;
  inferiorFunction: string;
  inferiorSuit: string;
  inferiorElement: string;
  auxiliaryElements: string[];
  sunSign: string;
  ruler: string;
  rulerSign: string;
  chartName?: string;
}

interface DrawnCard {
  cardName: string;
  reversed: boolean;
}

interface Props {
  profile: FunctionProfile;
}

type SpreadType = "three-card" | "celtic-cross";

const SUITS_BY_GROUP: { label: string; suit: TarotSuit }[] = [
  { label: "Major Arcana", suit: "Major" },
  { label: "Wands (Fire / Intuition)", suit: "Wands" },
  { label: "Cups (Water / Feeling)", suit: "Cups" },
  { label: "Swords (Air / Thinking)", suit: "Swords" },
  { label: "Pentacles (Earth / Sensation)", suit: "Pentacles" },
];

export function InteractiveTarotReading({ profile }: Props) {
  const [spreadType, setSpreadType] = useState<SpreadType>("three-card");
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<DrawnCard[]>(() => emptyDraw("three-card"));
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);

  const positions =
    spreadType === "three-card" ? THREE_CARD_POSITIONS : CELTIC_CROSS_POSITIONS;

  const groupedDeck = useMemo(() => {
    const groups: Record<TarotSuit, TarotCard[]> = {
      Major: [],
      Wands: [],
      Cups: [],
      Swords: [],
      Pentacles: [],
    };
    TAROT_DECK.forEach((c) => groups[c.suit].push(c));
    return groups;
  }, []);

  function handleSpreadChange(value: SpreadType) {
    setSpreadType(value);
    setDrawn(emptyDraw(value));
    setInterpretation(null);
  }

  function updateCard(index: number, cardName: string) {
    setDrawn((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], cardName };
      return next;
    });
  }

  function toggleReversed(index: number) {
    setDrawn((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], reversed: !next[index].reversed };
      return next;
    });
  }

  function shuffleAll() {
    const slots = positions.length;
    const pool = [...TAROT_DECK];
    // Fisher–Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const next: DrawnCard[] = [];
    for (let i = 0; i < slots; i++) {
      next.push({ cardName: pool[i].name, reversed: Math.random() < 0.25 });
    }
    setDrawn(next);
    setInterpretation(null);
  }

  function clearAll() {
    setDrawn(emptyDraw(spreadType));
    setInterpretation(null);
  }

  const allFilled = drawn.every((d) => d.cardName);
  const hasDuplicates = (() => {
    const seen = new Set<string>();
    for (const d of drawn) {
      if (!d.cardName) continue;
      if (seen.has(d.cardName)) return true;
      seen.add(d.cardName);
    }
    return false;
  })();

  async function generate() {
    if (!question.trim()) {
      toast.error("Type the question you'd like the cards to answer.");
      return;
    }
    if (!allFilled) {
      toast.error("Choose a card for every position first.");
      return;
    }
    setLoading(true);
    setInterpretation(null);
    try {
      const cards = drawn.map((d, i) => {
        const card = findCard(d.cardName)!;
        return {
          position: positions[i].label,
          positionMeaning: positions[i].meaning,
          card: card.name,
          suit: card.suit,
          reversed: d.reversed,
        };
      });

      const { data, error } = await supabase.functions.invoke("interpret-tarot-spread", {
        body: {
          spreadType,
          question,
          cards,
          ...profile,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setInterpretation(data?.interpretation ?? "Unable to generate interpretation.");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Failed to generate interpretation.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif">🔮 Interactive Reading — Through Your Functions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a spread, type your question, pick the cards you pulled, and get a personalized interpretation
          filtered through your <strong>{profile.superiorFunction}</strong> /{" "}
          <strong>{profile.inferiorFunction}</strong> profile.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spread + question */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="spread-type">Spread</Label>
            <Select value={spreadType} onValueChange={(v) => handleSpreadChange(v as SpreadType)}>
              <SelectTrigger id="spread-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="three-card">Three-Card (Past / Present / Future)</SelectItem>
                <SelectItem value="celtic-cross">Celtic Cross (10 cards)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="question">Your question</Label>
            <Input
              id="question"
              placeholder='e.g. "What do I need to know about this new opportunity?"'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={shuffleAll}>
            <Shuffle className="mr-1.5 h-4 w-4" /> Shuffle &amp; Draw
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            Clear
          </Button>
          {hasDuplicates && (
            <span className="text-xs text-destructive">Same card chosen in two positions — reshuffle or pick uniquely.</span>
          )}
        </div>

        {/* Card pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {positions.map((pos, i) => {
            const drawnCard = drawn[i];
            const card = drawnCard.cardName ? findCard(drawnCard.cardName) : undefined;
            const lensTag = card ? lensFor(card.suit, profile) : null;
            return (
              <div key={pos.label} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {pos.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground italic">{pos.meaning}</p>
                </div>
                <Select
                  value={drawnCard.cardName}
                  onValueChange={(v) => updateCard(i, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a card…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {SUITS_BY_GROUP.map((g) => (
                      <SelectGroup key={g.suit}>
                        <SelectLabel>
                          {SUIT_EMOJI[g.suit]} {g.label}
                        </SelectLabel>
                        {groupedDeck[g.suit].map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                {card && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${SUIT_BADGE[card.suit]}`}>
                      {SUIT_EMOJI[card.suit]} {card.suit}
                    </Badge>
                    {lensTag && (
                      <Badge variant="outline" className="text-[10px]">
                        {lensTag}
                      </Badge>
                    )}
                    <label className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                      <Checkbox
                        checked={drawnCard.reversed}
                        onCheckedChange={() => toggleReversed(i)}
                      />
                      <RotateCw className="h-3 w-3" /> Reversed
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Generate */}
        <div className="flex justify-end">
          <Button onClick={generate} disabled={loading || !allFilled || hasDuplicates}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading the spread…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Interpret My Spread
              </>
            )}
          </Button>
        </div>

        {/* Interpretation */}
        {interpretation && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <p className="text-xs uppercase tracking-widest text-primary/70">Your Personalized Reading</p>
            <article className="prose prose-sm max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground whitespace-pre-wrap">
              {interpretation}
            </article>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function emptyDraw(spread: SpreadType): DrawnCard[] {
  const count = spread === "three-card" ? 3 : 10;
  return Array.from({ length: count }, () => ({ cardName: "", reversed: false }));
}

function lensFor(suit: TarotSuit, profile: FunctionProfile): string | null {
  if (suit === "Major") return "Soul-level theme";
  if (suit === profile.superiorSuit) return "Comfort zone";
  if (suit === profile.inferiorSuit) return "Growth edge";
  return "Auxiliary support";
}
