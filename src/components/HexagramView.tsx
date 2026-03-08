import { useState, useCallback, useRef } from 'react';
import { Dices, RotateCcw, BookOpen, ChevronDown, ChevronUp, Sparkles, Loader2, Send, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  HexagramLine,
  throwCoins,
  pennyResult,
  linesToHexagram,
  HEXAGRAMS,
  Hexagram,
  TRIGRAMS,
  KING_WEN,
  getHexagram,
} from '@/data/iChingHexagrams';

type Mode = 'cast' | 'key';
type CastMode = 'manual' | 'auto';

/* ─── Hexagram Line Visual ─── */
const LineVisual = ({ line, index }: { line: HexagramLine; index: number }) => (
  <div className="flex items-center gap-3">
    <span className="w-4 text-right text-[10px] text-muted-foreground">{index + 1}</span>
    <div className="flex items-center gap-1">
      {line.type === 'yang' ? (
        <div className={`h-[6px] w-32 rounded-sm ${line.changing ? 'bg-primary' : 'bg-foreground'}`} />
      ) : (
        <>
          <div className={`h-[6px] w-14 rounded-sm ${line.changing ? 'bg-primary' : 'bg-foreground'}`} />
          <div className="w-4" />
          <div className={`h-[6px] w-14 rounded-sm ${line.changing ? 'bg-primary' : 'bg-foreground'}`} />
        </>
      )}
    </div>
    <span className="text-[10px] text-muted-foreground">
      {line.changing ? (line.type === 'yang' ? '○ old yang (9)' : '✕ old yin (6)') : (line.type === 'yang' ? '— yang (7)' : '-- yin (8)')}
    </span>
  </div>
);

/* ─── Hexagram Display Card ─── */
const HexagramCard = ({ hex, label, lines, changingPositions }: {
  hex: Hexagram;
  label: string;
  lines?: HexagramLine[];
  changingPositions?: number[];
}) => {
  const upper = TRIGRAMS[hex.upperTrigram];
  const lower = TRIGRAMS[hex.lowerTrigram];

  return (
    <div className="rounded border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
          <h3 className="font-serif text-2xl text-foreground mt-1">
            {hex.number}. {hex.name}
          </h3>
          <p className="text-lg text-primary">{hex.chinese} · {hex.pinyin}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Upper: {upper?.image} ({upper?.chinese})</p>
          <p>Lower: {lower?.image} ({lower?.chinese})</p>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Judgment</span>
        <p className="text-sm text-foreground italic">{hex.judgment}</p>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Image</span>
        <p className="text-sm text-foreground">{hex.image}</p>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Meaning</span>
        <p className="text-sm text-foreground">{hex.meaning}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {hex.keywords.map(k => (
          <span key={k} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {k}
          </span>
        ))}
      </div>

      {/* Changing line interpretations */}
      {changingPositions && changingPositions.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <span className="text-[10px] uppercase tracking-widest text-primary">Changing Lines</span>
          {changingPositions.map(pos => (
            <div key={pos} className="text-sm">
              <span className="font-medium text-foreground">Line {pos}:</span>{' '}
              <span className="text-muted-foreground">{hex.changingLines[pos]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Trigram Lookup Table ─── */
const T_LABELS = [
  { key: '111', sym: '☰', name: 'Heaven', lines: [1, 1, 1] },
  { key: '000', sym: '☷', name: 'Earth', lines: [0, 0, 0] },
  { key: '100', sym: '☳', name: 'Thunder', lines: [0, 0, 1] },
  { key: '010', sym: '☵', name: 'Water', lines: [0, 1, 0] },
  { key: '001', sym: '☶', name: 'Mountain', lines: [1, 0, 0] },
  { key: '011', sym: '☴', name: 'Wind', lines: [1, 1, 0] },
  { key: '101', sym: '☲', name: 'Fire', lines: [1, 0, 1] },
  { key: '110', sym: '☱', name: 'Lake', lines: [0, 1, 1] },
];

const TrigramLines = ({ lines, size = 'sm' }: { lines: number[]; size?: 'sm' | 'md' }) => {
  const w = size === 'md' ? 'w-6' : 'w-4';
  const h = size === 'md' ? 'h-[3px]' : 'h-[2px]';
  const gap = size === 'md' ? 'gap-[3px]' : 'gap-[2px]';
  return (
    <div className={`flex flex-col items-center ${gap}`}>
      {lines.map((l, i) =>
        l === 1 ? (
          <div key={i} className={`${w} ${h} bg-foreground rounded-sm`} />
        ) : (
          <div key={i} className={`${w} ${h} flex gap-[2px]`}>
            <div className="flex-1 bg-foreground rounded-sm h-full" />
            <div className="flex-1 bg-foreground rounded-sm h-full" />
          </div>
        )
      )}
    </div>
  );
};

const TrigramLookupTable = () => {
  const [highlight, setHighlight] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium">Trigram Lookup Chart</h4>
      <p className="text-[11px] text-muted-foreground">
        Find your <strong>lower trigram (Lines 1-2-3)</strong> across the top row, and your <strong>upper trigram (Lines 4-5-6)</strong> down the left column. The cell where they meet is your hexagram number.
      </p>
      <div className="rounded bg-primary/5 border border-primary/20 p-2 mb-2">
        <p className="text-[11px] text-foreground">
          <strong>⚠️ Reading direction matters!</strong> Line patterns below are shown <strong>top-to-bottom</strong> (how they look visually on a chart). 
          Most printed I Ching charts use this same order. So "━ ⚋ ⚋" (solid, broken, broken reading downward) = <strong>☶ Mountain (Gen/Ken)</strong>. 
          Mountain over Mountain = <strong>#52 Keeping Still</strong>.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[10px] border-collapse w-full">
          <thead>
            <tr>
              <th className="p-1.5 border border-border bg-secondary text-muted-foreground text-[9px]">
                Upper↓ / Lower→
              </th>
              {T_LABELS.map(t => (
                <th key={t.key} className="p-1.5 border border-border bg-secondary text-center">
                  <div className="text-base">{t.sym}</div>
                  <div className="text-muted-foreground text-[8px]">{t.name}</div>
                  <div className="flex justify-center mt-1"><TrigramLines lines={t.lines} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {T_LABELS.map((upper, ui) => (
              <tr key={upper.key}>
                <td className="p-1.5 border border-border bg-secondary text-center">
                  <div className="text-base">{upper.sym}</div>
                  <div className="text-muted-foreground text-[8px]">{upper.name}</div>
                  <div className="flex justify-center mt-1"><TrigramLines lines={upper.lines} /></div>
                </td>
                {T_LABELS.map((_, li) => {
                  const num = KING_WEN[ui][li];
                  return (
                    <td
                      key={li}
                      onMouseEnter={() => setHighlight(num)}
                      onMouseLeave={() => setHighlight(null)}
                      className={`p-1.5 border border-border text-center font-medium cursor-default transition-colors ${
                        highlight === num ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-primary/10'
                      }`}
                    >
                      {num}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-muted-foreground italic flex items-center gap-1 flex-wrap">
        <span>Example: Mountain ☶</span>
        <TrigramLines lines={[1,0,0]} />
        <span>on top + Mountain ☶</span>
        <TrigramLines lines={[1,0,0]} />
        <span>on bottom → <strong>#52 Keeping Still</strong></span>
      </div>
    </div>
  );
};


const PennyRow = ({ lineNum, onResult }: {
  lineNum: number;
  onResult: (line: HexagramLine, sum: number) => void;
}) => {
  const [coins, setCoins] = useState<('H' | 'T')[]>(['H', 'H', 'H']);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (i: number) => {
    if (submitted) return;
    setCoins(prev => {
      const next = [...prev];
      next[i] = next[i] === 'H' ? 'T' : 'H';
      return next;
    });
  };

  const submit = () => {
    const result = pennyResult(coins[0], coins[1], coins[2]);
    setSubmitted(true);
    onResult(result.line, result.sum);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[10px] uppercase tracking-widest text-muted-foreground">Line {lineNum}</span>
      <div className="flex gap-2">
        {coins.map((c, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            disabled={submitted}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
              c === 'H'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-muted-foreground bg-muted text-muted-foreground'
            } ${submitted ? 'opacity-60' : 'hover:scale-110 cursor-pointer'}`}
          >
            {c === 'H' ? 'H' : 'T'}
          </button>
        ))}
      </div>
      {!submitted && (
        <button
          onClick={submit}
          className="rounded border border-primary px-3 py-1 text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Cast
        </button>
      )}
      {submitted && (
        <span className="text-xs text-muted-foreground">
          = {coins.reduce((s, c) => s + (c === 'H' ? 3 : 2), 0)}
        </span>
      )}
    </div>
  );
};

/* ─── Hexagram Key Browser ─── */
const HexagramKey = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState('');

  const filtered = HEXAGRAMS.filter(h =>
    !filter ||
    h.name.toLowerCase().includes(filter.toLowerCase()) ||
    h.chinese.includes(filter) ||
    h.pinyin.toLowerCase().includes(filter.toLowerCase()) ||
    String(h.number) === filter ||
    h.keywords.some(k => k.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by name, number, keyword…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full rounded border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />

      <div className="grid gap-2 md:grid-cols-2">
        {filtered.map(hex => (
          <button
            key={hex.number}
            onClick={() => setExpanded(expanded === hex.number ? null : hex.number)}
            className="w-full text-left rounded border border-border bg-card p-3 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-light text-primary">{hex.number}</span>
                <span className="text-sm text-foreground">{hex.name}</span>
                <span className="text-sm text-muted-foreground">{hex.chinese}</span>
              </div>
              {expanded === hex.number ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>

            {expanded === hex.number && (
              <div className="mt-3 space-y-2 border-t border-border pt-3" onClick={e => e.stopPropagation()}>
                <p className="text-xs text-muted-foreground italic">{hex.judgment}</p>
                <p className="text-xs text-foreground">{hex.meaning}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {hex.keywords.map(k => (
                    <span key={k} className="rounded-sm bg-secondary px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{k}</span>
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-primary">Line Meanings</span>
                  {Object.entries(hex.changingLines).map(([pos, text]) => (
                    <p key={pos} className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Line {pos}:</span> {text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Changing Lines Explainer ─── */
const ChangingLinesExplainer = ({ lines, changingPositions, primary, transformed }: {
  lines: HexagramLine[];
  changingPositions: number[];
  primary: Hexagram;
  transformed: Hexagram | null;
}) => {
  if (changingPositions.length === 0 || !transformed) return null;

  // Build the transformed lines array
  const transformedLines: HexagramLine[] = lines.map(l => ({
    type: l.changing ? (l.type === 'yang' ? 'yin' : 'yang') : l.type,
    changing: false,
  }));

  return (
    <div className="rounded border border-primary/30 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen size={14} className="text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
          How You Got Two Hexagrams — Step by Step
        </span>
      </div>

      {/* Step 1: Explain the concept */}
      <div className="space-y-2">
        <p className="text-sm text-foreground">
          Each coin toss gives you a number: <strong>6, 7, 8, or 9</strong>. Most are stable (7 = solid, 8 = broken — they stay put). 
          But <strong>6 and 9 are "old" lines</strong> — they've maxed out and <em>flip to their opposite</em>.
        </p>
        <p className="text-sm text-foreground">
          That flip is how you get a second hexagram. The first one = <strong>where you are now</strong>. 
          The second one = <strong>where things are heading</strong>.
        </p>
      </div>

      {/* Step 2: Visual line-by-line transformation */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Lines — Watch the Flip</span>
        <div className="rounded bg-card border border-border p-3 space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_24px_1fr] items-center gap-2 mb-2">
            <span />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground text-center">Now ({primary.number})</span>
            <span />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground text-center">Future ({transformed.number})</span>
          </div>
          {/* Lines from 6 down to 1 (visual top-to-bottom) */}
          {[...Array(6)].map((_, i) => {
            const lineIdx = 5 - i; // display line 6 at top
            const orig = lines[lineIdx];
            const tfm = transformedLines[lineIdx];
            const isChanging = orig.changing;
            const lineNum = lineIdx + 1;
            return (
              <div key={lineIdx} className={`grid grid-cols-[40px_1fr_24px_1fr] items-center gap-2 py-0.5 rounded ${isChanging ? 'bg-primary/10' : ''}`}>
                <span className={`text-[10px] text-right ${isChanging ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  Line {lineNum}
                </span>
                {/* Original line */}
                <div className="flex items-center justify-center gap-1">
                  {orig.type === 'yang' ? (
                    <div className={`h-[5px] w-20 rounded-sm ${isChanging ? 'bg-primary' : 'bg-foreground'}`} />
                  ) : (
                    <>
                      <div className={`h-[5px] w-8 rounded-sm ${isChanging ? 'bg-primary' : 'bg-foreground'}`} />
                      <div className="w-3" />
                      <div className={`h-[5px] w-8 rounded-sm ${isChanging ? 'bg-primary' : 'bg-foreground'}`} />
                    </>
                  )}
                </div>
                {/* Arrow */}
                <span className={`text-center text-xs ${isChanging ? 'text-primary font-bold' : 'text-muted-foreground/40'}`}>
                  {isChanging ? '→' : '='}
                </span>
                {/* Transformed line */}
                <div className="flex items-center justify-center gap-1">
                  {tfm.type === 'yang' ? (
                    <div className={`h-[5px] w-20 rounded-sm ${isChanging ? 'bg-primary' : 'bg-foreground'}`} />
                  ) : (
                    <>
                      <div className={`h-[5px] w-8 rounded-sm ${isChanging ? 'bg-primary' : 'bg-foreground'}`} />
                      <div className="w-3" />
                      <div className={`h-[5px] w-8 rounded-sm ${isChanging ? 'bg-primary' : 'bg-foreground'}`} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Plain-English summary */}
      <div className="space-y-1.5 border-t border-primary/20 pt-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">What Changed</span>
        {changingPositions.map(pos => {
          const line = lines[pos - 1];
          return (
            <div key={pos} className="text-sm text-foreground flex items-center gap-2 flex-wrap">
              <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Line {pos}</span>
              <span>
                {line.type === 'yang' 
                  ? 'was solid (old yang = 9) → broke apart into a broken line' 
                  : 'was broken (old yin = 6) → solidified into a solid line'}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground border-t border-primary/20 pt-3">
        <strong>Think of it like this:</strong> Hexagram {primary.number} ({primary.name}) is a snapshot of your situation <em>right now</em>. 
        The changing lines show what's unstable — what's actively shifting. 
        Once those lines flip, you get Hexagram {transformed.number} ({transformed.name}) — that's where the energy is <em>moving toward</em>. 
        If you got no changing lines, it means the situation is stable — one hexagram, one story.
      </p>
    </div>
  );
};

/* ─── Follow-Up Chat for No-Question Readings ─── */
const FollowUpChat = ({ primary, transformed, changingPositions, initialReading }: {
  primary: Hexagram;
  transformed: Hexagram | null;
  changingPositions: number[];
  initialReading: string;
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret-hexagram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          question: `Context: The user already received a general reading which said: "${initialReading.slice(0, 500)}..."\n\nNow they're asking a follow-up question for clarity: "${q}"`,
          primaryHexagram: primary,
          transformedHexagram: transformed,
          changingLines: changingPositions,
          style: 'novice',
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'ai') {
                  updated[updated.length - 1] = { role: 'ai', content: fullText };
                } else {
                  updated.push({ role: 'ai', content: fullText });
                }
                return updated;
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I couldn\'t process that. Try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="rounded border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle size={16} className="text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
          Ask for Clarity
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Want to understand something specific from your reading? Ask a follow-up question and I'll dig deeper.
      </p>

      {messages.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto border-t border-border pt-3">
          {messages.map((msg, i) => (
            <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-foreground font-medium' : ''}`}>
              {msg.role === 'user' ? (
                <p className="text-foreground italic">"{msg.content}"</p>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="What does the water symbolism mean for me? What should I actually do?"
          className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

/* ─── AI Interpretation Card ─── */
type ReadingStyle = 'novice' | 'pro';

const AIInterpretationCard = ({ question, primary, transformed, changingPositions }: {
  question: string;
  primary: Hexagram;
  transformed: Hexagram | null;
  changingPositions: number[];
}) => {
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [style, setStyle] = useState<ReadingStyle>('pro');

  const generate = async () => {
    setLoading(true);
    setError(null);
    setInterpretation('');
    setHasGenerated(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret-hexagram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          question,
          primaryHexagram: primary,
          transformedHexagram: transformed,
          changingLines: changingPositions,
          style,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setInterpretation(fullText);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate interpretation');
    } finally {
      setLoading(false);
    }
  };

  const hasQuestion = question.trim().length > 0;

  return (
    <>
      <div className="rounded border border-primary/40 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
              Personal Reading
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded border border-border overflow-hidden">
              <button
                onClick={() => setStyle('novice')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                  style === 'novice' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Novice
              </button>
              <button
                onClick={() => setStyle('pro')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                  style === 'pro' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pro
              </button>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 rounded border border-primary px-4 py-2 text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {hasGenerated ? 'Re-interpret' : 'Get My Reading'}
            </button>
          </div>
        </div>

        {!hasGenerated && !loading && (
          <p className="text-sm text-muted-foreground">
            Choose <strong>Novice</strong> for a quick, beginner-friendly answer or <strong>Pro</strong> for a full professional reading, then click "Get My Reading."
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {interpretation && (
          <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        )}

        {loading && !interpretation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Consulting the oracle…
          </div>
        )}
      </div>

      {/* Show follow-up chat box after any reading is done */}
      {hasGenerated && !loading && interpretation && (
        <FollowUpChat
          primary={primary}
          transformed={transformed}
          changingPositions={changingPositions}
          initialReading={interpretation}
        />
      )}
    </>
  );
};

/* ─── Main View ─── */
export const HexagramView = () => {
  const [mode, setMode] = useState<Mode>('cast');
  const [castMode, setCastMode] = useState<CastMode>('auto');
  const [lines, setLines] = useState<HexagramLine[]>([]);
  const [question, setQuestion] = useState('');
  const [casting, setCasting] = useState(false);
  const [castKey, setCastKey] = useState(0);

  const reset = () => {
    setLines([]);
    setQuestion('');
    setCasting(false);
    setCastKey(k => k + 1);
  };

  // Auto cast all 6 lines
  const autoCast = useCallback(() => {
    reset();
    setCasting(true);
    const newLines: HexagramLine[] = [];
    // Animate one line at a time
    let i = 0;
    const interval = setInterval(() => {
      const result = throwCoins();
      newLines.push(result.line);
      setLines([...newLines]);
      i++;
      if (i >= 6) {
        clearInterval(interval);
        setCasting(false);
      }
    }, 400);
  }, []);

  // Manual line added
  const addManualLine = (line: HexagramLine) => {
    setLines(prev => [...prev, line]);
  };

  const result = lines.length === 6 ? linesToHexagram(lines) : null;
  const changingPositions = lines
    .map((l, i) => l.changing ? i + 1 : null)
    .filter((p): p is number => p !== null);

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('cast')}
          className={`flex items-center gap-1.5 rounded-sm px-4 py-2 text-[11px] uppercase tracking-widest transition-all ${
            mode === 'cast' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Dices size={14} />
          Cast Hexagram
        </button>
        <button
          onClick={() => setMode('key')}
          className={`flex items-center gap-1.5 rounded-sm px-4 py-2 text-[11px] uppercase tracking-widest transition-all ${
            mode === 'key' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen size={14} />
          Hexagram Key
        </button>
      </div>

      {mode === 'key' && <HexagramKey />}

      {mode === 'cast' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="rounded border border-border bg-card p-4 space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">How It Works</h3>
            <p className="text-sm text-foreground">
              The I Ching uses three coins thrown six times to build a hexagram from <strong>bottom to top</strong>. 
              Each coin is <strong>Heads (3)</strong> or <strong>Tails (2)</strong>. Add the three coins — the sum determines the line type:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-secondary p-2">
                <span className="font-medium">6 (T+T+T)</span> — Old Yin ⚋✕ <span className="text-primary">(changing)</span>
              </div>
              <div className="rounded bg-secondary p-2">
                <span className="font-medium">7 (H+T+T)</span> — Young Yang ⚊
              </div>
              <div className="rounded bg-secondary p-2">
                <span className="font-medium">8 (H+H+T)</span> — Young Yin ⚋
              </div>
              <div className="rounded bg-secondary p-2">
                <span className="font-medium">9 (H+H+H)</span> — Old Yang ⚊○ <span className="text-primary">(changing)</span>
              </div>
            </div>

            {/* Line positions explainer */}
            <div className="rounded bg-primary/5 border border-primary/20 p-3 space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium">Line Positions &amp; Trigrams</h4>
              <div className="flex gap-6 items-start">
                <div className="text-xs text-foreground space-y-0.5">
                  <p className="text-muted-foreground text-[10px] mb-1">TOP ↑</p>
                  <p><strong>Line 6</strong> — top of upper trigram</p>
                  <p><strong>Line 5</strong> — middle of upper trigram</p>
                  <p><strong>Line 4</strong> — bottom of upper trigram</p>
                  <p className="border-t border-border pt-1 mt-1"><strong>Line 3</strong> — top of lower trigram</p>
                  <p><strong>Line 2</strong> — middle of lower trigram</p>
                  <p><strong>Line 1</strong> — bottom of lower trigram</p>
                  <p className="text-muted-foreground text-[10px] mt-1">BOTTOM ↓ (you start here)</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="text-[10px] mb-1">{"}"} <strong className="text-foreground">Upper Trigram</strong></p>
                  <p className="mt-[3.2rem] text-[10px]">{"}"} <strong className="text-foreground">Lower Trigram</strong></p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your 6 lines split into two groups of three: <strong>Lines 1-2-3</strong> form the <strong>lower trigram</strong>, 
                and <strong>Lines 4-5-6</strong> form the <strong>upper trigram</strong>. You look up the lower trigram <em>across</em> and the upper trigram <em>down</em> in the lookup table to find your hexagram number.
              </p>
            </div>

            {/* One vs Two answers */}
            <div className="rounded bg-secondary/50 border border-border p-3 space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium">One Answer or Two?</h4>
              <p className="text-[11px] text-foreground">
                <strong>No changing lines (all 7s and 8s):</strong> You get a <strong>single hexagram</strong> — one clear, stable answer. The situation is settled; read just this hexagram.
              </p>
              <p className="text-[11px] text-foreground">
                <strong>One or more changing lines (any 6s or 9s):</strong> You get <strong>two hexagrams</strong>. The <em>primary</em> hexagram describes your current situation. Each changing line flips to its opposite (yin↔yang), creating a <em>transformed</em> "future" hexagram that shows where things are heading.
              </p>
              <p className="text-[11px] text-muted-foreground">
                The more changing lines you have, the more dynamic and unstable the situation. One changing line gives the most specific guidance (read that line's text closely). Multiple changing lines suggest a bigger transformation is underway.
              </p>
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Question (optional)</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Focus on your question as you cast…"
              className="w-full rounded border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Cast Mode Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Method:</span>
            <button
              onClick={() => { setCastMode('auto'); reset(); }}
              className={`rounded-sm px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                castMode === 'auto' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Auto Throw
            </button>
            <button
              onClick={() => { setCastMode('manual'); reset(); }}
              className={`rounded-sm px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                castMode === 'manual' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Manual Pennies
            </button>
          </div>

          {/* Auto Cast */}
          {castMode === 'auto' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={autoCast}
                  disabled={casting || lines.length === 6}
                  className="flex items-center gap-2 rounded border border-primary bg-primary px-6 py-3 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Dices size={16} />
                  {lines.length === 6 ? 'Cast Complete' : casting ? 'Casting…' : 'Throw Coins'}
                </button>
                {lines.length > 0 && (
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 rounded border border-border px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Manual Cast */}
          {castMode === 'manual' && (
            <div className="space-y-3">
              <div className="rounded border border-border bg-secondary/50 p-4 space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium">How to Roll It Yourself</h4>
                <ol className="text-xs text-foreground space-y-1.5 list-decimal list-inside">
                  <li>Grab <strong>3 coins</strong> (pennies, quarters, whatever)</li>
                  <li>Throw all 3 at once — that's <strong>one line</strong></li>
                  <li>Each coin: <strong>Heads = 3</strong>, <strong>Tails = 2</strong></li>
                  <li>Add the 3 coins together. You'll get <strong>6, 7, 8, or 9</strong></li>
                  <li>Repeat <strong>6 times</strong> total (line 1 at the bottom, line 6 at the top)</li>
                </ol>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-secondary p-2"><strong>6</strong> (2+2+2) = Broken line ⚋ <span className="text-primary">(changing)</span></div>
                  <div className="rounded bg-secondary p-2"><strong>7</strong> (3+2+2) = Solid line ⚊</div>
                  <div className="rounded bg-secondary p-2"><strong>8</strong> (3+3+2) = Broken line ⚋</div>
                  <div className="rounded bg-secondary p-2"><strong>9</strong> (3+3+3) = Solid line ⚊ <span className="text-primary">(changing)</span></div>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium">So How Do You Get the Hexagram Number?</h4>
                  <p className="text-[11px] text-foreground">
                    <strong>You do NOT add up your throws to get the hexagram number.</strong> Here's what actually happens:
                  </p>
                  <ol className="text-[11px] text-foreground space-y-1 list-decimal list-inside">
                    <li>Each throw (6, 7, 8, or 9) just tells you if that line is <strong>solid</strong> (7 or 9) or <strong>broken</strong> (6 or 8)</li>
                    <li>Your 6 lines create a <strong>pattern</strong> — like a barcode of solid and broken lines</li>
                    <li>The bottom 3 lines form one <strong>trigram</strong>, the top 3 form another</li>
                    <li>There are 8 possible trigrams × 8 = <strong>64 combinations</strong> — each one IS a hexagram</li>
                  </ol>
                  <div className="rounded bg-secondary p-3 text-[11px] text-foreground space-y-1">
                    <p className="font-medium">Example — How the same lines can be two different hexagrams:</p>
                    <p>Say your throws are: <strong>7, 8, 8, 7, 8, 8</strong> (bottom→top)</p>
                    <p>Line pattern (bottom→top): solid, broken, broken, solid, broken, broken</p>
                    <p>Bottom trigram (lines 1-3): solid, broken, broken = <strong>☳ Thunder</strong> (read bottom→top)</p>
                    <p>Top trigram (lines 4-6): solid, broken, broken = <strong>☳ Thunder</strong></p>
                    <p>Thunder over Thunder = <strong>#51 The Arousing</strong></p>
                    <p className="border-t border-border pt-1 mt-1">But if your chart reads <strong>top→down</strong> and you see solid, broken, broken — that's <strong>☶ Mountain (Gen/Ken)</strong></p>
                    <p>Mountain over Mountain = <strong>#52 Keeping Still</strong></p>
                    <p className="text-muted-foreground italic pt-1">The app builds lines bottom→top (traditional order). Just enter your coins and it handles the lookup.</p>
                  </div>
                </div>
              </div>
              <TrigramLookupTable />
              <p className="text-xs text-muted-foreground">
                Click each penny to toggle H (Heads) / T (Tails), then press Cast for each line (bottom to top).
              </p>
              {Array.from({ length: 6 }).map((_, i) => (
                i < lines.length ? null : i === lines.length ? (
                  <PennyRow
                    key={i}
                    lineNum={i + 1}
                    onResult={(line) => addManualLine(line)}
                  />
                ) : null
              ))}
              {lines.length > 0 && (
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded border border-border px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Lines Display */}
          {lines.length > 0 && (
            <div className="rounded border border-border bg-card p-4 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Hexagram ({lines.length}/6 lines)
              </span>
              <div className="flex flex-col-reverse gap-1">
                {lines.map((line, i) => (
                  <LineVisual key={i} line={line} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded border border-primary bg-primary/10 px-5 py-3 text-[11px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors w-full justify-center"
              >
                <Dices size={16} />
                Cast a New Reading
              </button>
              {question && (
                <div className="rounded border border-primary/30 bg-primary/5 p-4">
                  <span className="text-[10px] uppercase tracking-widest text-primary">Your Question</span>
                  <p className="mt-1 text-sm text-foreground italic">{question}</p>
                </div>
              )}

              <HexagramCard
                hex={result.primary}
                label="Primary Hexagram (Present)"
                lines={lines}
                changingPositions={changingPositions}
              />

              {result.transformed && (
                <>
                  <ChangingLinesExplainer
                    lines={lines}
                    changingPositions={changingPositions}
                    primary={result.primary}
                    transformed={result.transformed}
                  />
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-[10px] uppercase tracking-widest">transforms into</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                  <HexagramCard
                    hex={result.transformed}
                    label="Transformed Hexagram (Future)"
                  />
                </>
              )}

              <AIInterpretationCard
                question={question}
                primary={result.primary}
                transformed={result.transformed}
                changingPositions={changingPositions}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
