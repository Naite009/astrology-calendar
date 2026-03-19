import { useState, useRef, useCallback } from 'react';
import { X, Sparkles, Loader2, RotateCcw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  personName: string;
  buildFullJson: () => Record<string, any>;
}

export const AiReadingModal = ({ open, onClose, personName, buildFullJson }: Props) => {
  const [reading, setReading] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    setReading('');
    setIsStreaming(true);
    setHasStarted(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const fullJson = buildFullJson();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sr-ai-reading`;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ fullJson }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast.error('Rate limit exceeded — please wait a moment and try again.');
        } else if (resp.status === 402) {
          toast.error('AI credits needed — please add credits in Settings.');
        } else {
          toast.error(errData.error || 'Failed to generate reading');
        }
        setIsStreaming(false);
        return;
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
              setReading(accumulated);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('AI reading error:', err);
        toast.error('Failed to generate reading');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [buildFullJson]);

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  const downloadReading = () => {
    const blob = new Blob([reading], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SolarReturn_AI_Reading_${personName.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI Solar Return Reading — {personName}
          </h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hasStarted && (
            <div className="text-center py-12 space-y-4">
              <Sparkles size={36} className="mx-auto text-primary/50" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate a comprehensive AI-written reading that synthesizes your entire Solar Return — identity shift, emotional landscape, life domain scores, contradictions, activation windows, and more — into a personalized narrative.
              </p>
              <button
                onClick={generate}
                className="text-[11px] uppercase tracking-widest px-6 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles size={14} />
                Generate Full AI Reading
              </button>
            </div>
          )}

          {isStreaming && !reading && (
            <div className="text-center py-12">
              <Loader2 size={28} className="animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Synthesizing your complete Solar Return data...</p>
            </div>
          )}

          {reading && (
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-muted-foreground">
              <ReactMarkdown>{reading}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {reading && !isStreaming && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
            <button
              onClick={generate}
              className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Regenerate
            </button>
            <button
              onClick={downloadReading}
              className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Download size={12} /> Download as Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
