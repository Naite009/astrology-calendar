import { useState, useRef, useCallback } from 'react';
import { X, Sparkles, Loader2, RotateCcw, Download, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export type AiReadingMode = 'plain' | 'astro';

interface Props {
  open: boolean;
  onClose: () => void;
  personName: string;
  buildFullJson: () => Record<string, any>;
  onReadingsUpdate?: (readings: { plain: string; astro: string }) => void;
}

export async function fetchReading(
  fullJson: Record<string, any>,
  mode: AiReadingMode,
  signal: AbortSignal,
  onDelta: (text: string) => void,
): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sr-ai-reading`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ fullJson, mode }),
    signal,
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    if (resp.status === 429) throw new Error('Rate limit exceeded — please wait a moment and try again.');
    if (resp.status === 402) throw new Error('AI credits needed — please add credits in Settings.');
    throw new Error(errData.error || 'Failed to generate reading');
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          accumulated += content;
          onDelta(accumulated);
        }
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
  return accumulated;
}

export const AiReadingModal = ({ open, onClose, personName, buildFullJson, onReadingsUpdate }: Props) => {
  const [readings, setReadings] = useState<{ plain: string; astro: string }>({ plain: '', astro: '' });
  const [activeView, setActiveView] = useState<AiReadingMode>('plain');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeStreams, setActiveStreams] = useState<Set<AiReadingMode>>(new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [streamTexts, setStreamTexts] = useState<{ plain: string; astro: string }>({ plain: '', astro: '' });
  const abortRef = useRef<AbortController | null>(null);

  const generateBoth = useCallback(async () => {
    setReadings({ plain: '', astro: '' });
    setStreamTexts({ plain: '', astro: '' });
    setIsStreaming(true);
    setHasStarted(true);
    setActiveView('plain');
    setActiveStreams(new Set(['plain', 'astro']));

    const controller = new AbortController();
    abortRef.current = controller;
    const fullJson = buildFullJson();

    const runStream = async (mode: AiReadingMode): Promise<string> => {
      const result = await fetchReading(fullJson, mode, controller.signal, (text) => {
        setStreamTexts(prev => ({ ...prev, [mode]: text }));
      });
      setReadings(prev => ({ ...prev, [mode]: result }));
      setActiveStreams(prev => {
        const next = new Set(prev);
        next.delete(mode);
        return next;
      });
      return result;
    };

    try {
      const [plainResult, astroResult] = await Promise.all([
        runStream('plain'),
        runStream('astro'),
      ]);
      const final = { plain: plainResult, astro: astroResult };
      onReadingsUpdate?.(final);
      toast.success('Both readings generated');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('AI reading error:', err);
        toast.error(err.message || 'Failed to generate reading');
      }
    } finally {
      setIsStreaming(false);
      setActiveStreams(new Set());
      setStreamTexts({ plain: '', astro: '' });
      abortRef.current = null;
    }
  }, [buildFullJson, onReadingsUpdate]);

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  const downloadReading = (mode: AiReadingMode) => {
    const text = readings[mode];
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const label = mode === 'plain' ? 'PlainLanguage' : 'AstrologyMind';
    a.download = `SolarReturn_AI_${label}_${personName.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  // What to display in the body — show live stream text if actively streaming, otherwise final reading
  const isViewStreaming = activeStreams.has(activeView);
  const displayText = isViewStreaming ? streamTexts[activeView] : readings[activeView];
  const isCurrentlyStreaming = isStreaming && isViewStreaming;
  const currentDone = !!readings[activeView];

  // Build status message for parallel generation
  const streamingModes = Array.from(activeStreams);
  const streamingLabel = streamingModes.length === 2
    ? 'Both readings'
    : streamingModes[0] === 'plain' ? 'Plain Language' : 'Astrology Mind';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI Reading — {personName}
          </h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Mode Toggle (view switcher, not generation control) */}
        {hasStarted && (
          <div className="px-5 py-2.5 border-b border-border flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">View:</span>
            <div className="flex rounded-full border border-border overflow-hidden">
              <button
                onClick={() => setActiveView('plain')}
                className={`px-3 py-1 text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'plain'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Plain Language
                {readings.plain && <CheckCircle2 size={10} className={activeView === 'plain' ? 'text-primary-foreground' : 'text-green-500'} />}
              </button>
              <button
                onClick={() => setActiveView('astro')}
                className={`px-3 py-1 text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'astro'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Astrology Mind
                {readings.astro && <CheckCircle2 size={10} className={activeView === 'astro' ? 'text-primary-foreground' : 'text-green-500'} />}
              </button>
            </div>
            {isStreaming && (
              <span className="text-[10px] text-muted-foreground ml-1">
                Generating {streamingLabel}...
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hasStarted && (
            <div className="text-center py-12 space-y-4">
              <Sparkles size={36} className="mx-auto text-primary/50" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate two complete AI readings of your Solar Return — one in plain everyday language (for anyone), and one with full astrological detail (for astrology readers). Both will be included in your JSON export.
              </p>
              <button
                onClick={generateBoth}
                className="text-[11px] uppercase tracking-widest px-6 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles size={14} />
                Generate Both Readings
              </button>
            </div>
          )}

          {isCurrentlyStreaming && !displayText && (
            <div className="text-center py-12">
              <Loader2 size={28} className="animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Synthesizing {activeView === 'plain' ? 'Plain Language' : 'Astrology Mind'} reading...
              </p>
            </div>
          )}

          {displayText && (
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-muted-foreground">
              <ReactMarkdown>{displayText}</ReactMarkdown>
              {isCurrentlyStreaming && (
                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(readings.plain || readings.astro) && !isStreaming && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-border flex-wrap">
            <button
              onClick={generateBoth}
              className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Regenerate Both
            </button>
            {readings.plain && (
              <button
                onClick={() => downloadReading('plain')}
                className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <Download size={12} /> Plain Language .md
              </button>
            )}
            {readings.astro && (
              <button
                onClick={() => downloadReading('astro')}
                className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <Download size={12} /> Astrology Mind .md
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
