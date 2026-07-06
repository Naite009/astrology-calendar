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
  MONTHLY_SPREAD_POSITIONS,
  findCard,
  type TarotCard,
  type TarotSuit,
} from "@/lib/tarotDeck";
import { Loader2, Shuffle, Sparkles, RotateCw, Printer } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

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

type SpreadType = "three-card" | "celtic-cross" | "monthly";

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
    spreadType === "three-card"
      ? THREE_CARD_POSITIONS
      : spreadType === "celtic-cross"
      ? CELTIC_CROSS_POSITIONS
      : MONTHLY_SPREAD_POSITIONS;

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
    if (!question.trim() && spreadType !== "monthly") {
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
                <SelectItem value="monthly">Monthly Spread (7 cards)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="question">
              {spreadType === "monthly" ? "Focus (optional)" : "Your question"}
            </Label>
            <Input
              id="question"
              placeholder={
                spreadType === "monthly"
                  ? 'Optional — e.g. "How will November unfold?"'
                  : 'e.g. "What do I need to know about this new opportunity?"'
              }
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
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-widest text-primary/70">Your Personalized Reading</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  printReading({
                    spreadType,
                    question,
                    positions,
                    drawn,
                    interpretation,
                    profile,
                  })
                }
              >
                <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
            <article className="prose prose-sm max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-h2:text-base prose-h2:mt-4 prose-h3:text-sm prose-h3:mt-3">
              <ReactMarkdown>{interpretation}</ReactMarkdown>
            </article>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function emptyDraw(spread: SpreadType): DrawnCard[] {
  const count = spread === "three-card" ? 3 : spread === "celtic-cross" ? 10 : 7;
  return Array.from({ length: count }, () => ({ cardName: "", reversed: false }));
}

function lensFor(suit: TarotSuit, profile: FunctionProfile): string | null {
  if (suit === "Major") return "Soul-level theme";
  if (suit === profile.superiorSuit) return "Comfort zone";
  if (suit === profile.inferiorSuit) return "Growth edge";
  return "Auxiliary support";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Minimal markdown → HTML for print (headings, bold, italic, blockquote, lists, paragraphs).
function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };
  const inline = (t: string) =>
    escapeHtml(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeLists(); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { closeLists(); const lvl = h[1].length; out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }
    if (line.startsWith("> ")) { closeLists(); out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); continue; }
    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) { if (!inUl) { closeLists(); out.push("<ul>"); inUl = true; } out.push(`<li>${inline(ul[1])}</li>`); continue; }
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) { if (!inOl) { closeLists(); out.push("<ol>"); inOl = true; } out.push(`<li>${inline(ol[1])}</li>`); continue; }
    closeLists();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeLists();
  return out.join("\n");
}

function spreadTitle(s: SpreadType): string {
  return s === "monthly" ? "Monthly 7-Card Spread"
    : s === "celtic-cross" ? "Celtic Cross Spread"
    : "Three-Card Spread";
}

function printReading(args: {
  spreadType: SpreadType;
  question: string;
  positions: { label: string; meaning: string }[];
  drawn: DrawnCard[];
  interpretation: string;
  profile: FunctionProfile;
}) {
  const { spreadType, question, positions, drawn, interpretation, profile } = args;
  const now = new Date().toLocaleString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
  const cardsList = drawn
    .map((d, i) => {
      const pos = positions[i];
      const orient = d.reversed ? "Reversed" : "Upright";
      return `<li><strong>${escapeHtml(pos.label)}</strong> — ${escapeHtml(d.cardName)} <em>(${orient})</em><br/><span class="pos-meaning">${escapeHtml(pos.meaning)}</span></li>`;
    })
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Tarot Reading — ${escapeHtml(spreadTitle(spreadType))}</title>
<style>
  @page { margin: 0.75in; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; line-height: 1.55; max-width: 7.5in; margin: 0 auto; padding: 0.25in 0; }
  h1 { font-size: 22pt; margin: 0 0 4pt 0; }
  h2 { font-size: 14pt; margin: 18pt 0 6pt 0; border-bottom: 1px solid #999; padding-bottom: 2pt; page-break-after: avoid; }
  h3 { font-size: 12pt; margin: 12pt 0 4pt 0; page-break-after: avoid; }
  h4 { font-size: 11pt; margin: 8pt 0 3pt 0; }
  p, li { font-size: 11pt; }
  blockquote { border-left: 3px solid #7a5cff; margin: 8pt 0; padding: 4pt 10pt; background: #f5f2ff; font-style: italic; }
  ul, ol { padding-left: 20pt; }
  .meta { color: #555; font-size: 10pt; margin-bottom: 12pt; }
  .cards-drawn { background: #faf7ee; border: 1px solid #d9cfa3; padding: 10pt 14pt; margin: 10pt 0 18pt 0; border-radius: 4pt; }
  .cards-drawn h2 { margin-top: 0; border: none; font-size: 12pt; }
  .cards-drawn ul { list-style: none; padding-left: 0; }
  .cards-drawn li { margin-bottom: 6pt; }
  .pos-meaning { color: #666; font-size: 10pt; }
  .question { font-style: italic; margin: 6pt 0 0 0; }
  article h2, article h3 { break-inside: avoid; }
  article p, article li, article blockquote { break-inside: avoid; }
  @media print { .no-print { display: none; } }
  .no-print { text-align: right; margin-bottom: 10pt; }
  .no-print button { font: inherit; padding: 6pt 12pt; cursor: pointer; }
</style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">Print</button></div>
  <h1>${escapeHtml(spreadTitle(spreadType))}</h1>
  <div class="meta">
    ${escapeHtml(profile.chartName || "Reading")} · ${escapeHtml(now)}<br/>
    Function profile: ${escapeHtml(profile.superiorFunction)} (superior) / ${escapeHtml(profile.inferiorFunction)} (inferior)
    ${question.trim() ? `<div class="question">Focus: "${escapeHtml(question.trim())}"</div>` : ""}
  </div>
  <section class="cards-drawn">
    <h2>Cards Drawn</h2>
    <ul>${cardsList}</ul>
  </section>
  <article>${mdToHtml(interpretation)}</article>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 300));</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) {
    toast.error("Pop-up blocked. Please allow pop-ups to print your reading.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
