import { useState, useCallback, useRef } from 'react';
import { Dices, RotateCcw, BookOpen, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  HexagramLine,
  throwCoins,
  pennyResult,
  linesToHexagram,
  HEXAGRAMS,
  Hexagram,
  TRIGRAMS,
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

/* ─── Manual Penny Throw Row ─── */
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

/* ─── AI Interpretation Card ─── */
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

  return (
    <div className="rounded border border-primary/40 bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
            Personal Reading
          </span>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 rounded border border-primary px-4 py-2 text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {hasGenerated ? 'Re-interpret' : 'Interpret My Reading'}
        </button>
      </div>

      {!hasGenerated && !loading && (
        <p className="text-sm text-muted-foreground">
          Click "Interpret My Reading" to receive a detailed, personal interpretation that explains exactly what this hexagram means for your specific question.
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
  );
};

/* ─── Main View ─── */
export const HexagramView = () => {
  const [mode, setMode] = useState<Mode>('cast');
  const [castMode, setCastMode] = useState<CastMode>('auto');
  const [lines, setLines] = useState<HexagramLine[]>([]);
  const [question, setQuestion] = useState('');
  const [casting, setCasting] = useState(false);

  const reset = () => {
    setLines([]);
    setCasting(false);
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
          <div className="rounded border border-border bg-card p-4 space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">How It Works</h3>
            <p className="text-sm text-foreground">
              The I Ching uses three coins (pennies) thrown six times to build a hexagram from bottom to top. 
              Each coin is <strong>Heads (3)</strong> or <strong>Tails (2)</strong>. The sum determines the line:
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
            <p className="text-xs text-muted-foreground">
              Changing lines transform into their opposite, creating a second "future" hexagram.
            </p>
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
