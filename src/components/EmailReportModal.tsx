import { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, Trash2, Mail, Loader2, RefreshCw, Download, Sparkles } from 'lucide-react';
import {
  generateCosmicWeatherEmail,
  loadRecipients,
  saveRecipient,
  deleteRecipient,
  type EmailRecipient,
} from '@/lib/cosmicWeatherEmail';
import { supabase } from '@/integrations/supabase/client';
import type { NatalChart } from '@/hooks/useNatalChart';

interface Props {
  date: Date;
  onClose: () => void;
  natalChart?: NatalChart | null;
  chartId?: string;
}

export const EmailReportModal = ({ date, onClose, natalChart, chartId }: Props) => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>(() => loadRecipients());
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [subject, setSubject] = useState('Cosmic Weather');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const lastResultRef = useRef<any>(null);

  const selected = recipients.find(r => r.email === selectedEmail) || null;

  // Pull the logged-in user's email so picking themselves auto-fills it.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user;
      if (u?.email) {
        const meta: any = u.user_metadata || {};
        setAuthUser({
          id: u.id,
          email: u.email,
          name: meta.display_name || meta.full_name || meta.name,
        });
      }
    });
  }, []);

  // Add the logged-in user as a default option if not already saved.
  const optionList: EmailRecipient[] = (() => {
    const list = [...recipients];
    if (authUser?.email && !list.some(r => r.email === authUser.email)) {
      list.unshift({ name: authUser.name || 'Me', email: authUser.email });
    }
    return list;
  })();

  const generate = async () => {
    if (!natalChart || !chartId) {
      setError('No chart loaded.');
      return;
    }
    setLoading(true);
    setError(null);
    setBody('');
    try {
      const res = await generateCosmicWeatherEmail(
        { date, natalChart, chartId, recipientName: selected?.name || authUser?.name },
        { onProgress: (s) => setStatus(s) },
      );
      setSubject(res.subject);
      setBody(res.body);
      lastResultRef.current = res;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const list = saveRecipient({ name: newName.trim(), email: newEmail.trim() });
    setRecipients(list);
    setSelectedEmail(newEmail.trim());
    setNewName('');
    setNewEmail('');
  };

  const handleDelete = (email: string) => {
    setRecipients(deleteRecipient(email));
    if (selectedEmail === email) setSelectedEmail('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadJson = () => {
    const payload = lastResultRef.current
      ? { ...lastResultRef.current }
      : { subject, body };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = (lastResultRef.current?.meta?.date) || date.toISOString().slice(0, 10);
    const nameSlug = (selected?.name || 'cosmic-weather').toLowerCase().replace(/\s+/g, '-');
    a.download = `${nameSlug}-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const mailtoHref = () => {
    const to = selected?.email
      ? encodeURIComponent(selected.email)
      : (authUser?.email ? encodeURIComponent(authUser.email) : '');
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `mailto:${to}?subject=${s}&body=${b}`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/80 p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-6 shadow-xl md:p-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="font-serif text-2xl text-foreground mb-1">Email this Cosmic Weather</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Pick who this is for, then click Generate. The sky positions at the top are pure ephemeris math, no AI involved.
        </p>

        {/* Recipient picker (dropdown) */}
        <div className="mb-5 rounded-sm border border-border p-4 bg-muted/30">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Recipient</h3>

          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
            <select
              className="flex-1 px-3 py-2 text-sm rounded-sm border border-border bg-background"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
            >
              <option value="">— choose a person —</option>
              {optionList.map(r => (
                <option key={r.email} value={r.email}>
                  {r.name} ({r.email}){authUser && r.email === authUser.email ? ' — you' : ''}
                </option>
              ))}
            </select>
            {selected && selected.email !== authUser?.email && (
              <button
                className="text-muted-foreground hover:text-destructive p-2"
                onClick={() => handleDelete(selected.email)}
                title="Remove this recipient"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              className="px-3 py-2 text-sm rounded-sm border border-border bg-background"
              placeholder="Add new: Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={80}
            />
            <input
              className="px-3 py-2 text-sm rounded-sm border border-border bg-background"
              placeholder="email@example.com"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              maxLength={200}
            />
            <button
              className="px-3 py-2 text-sm rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={handleAdd}
            >
              Save
            </button>
          </div>
        </div>

        {/* Generate button */}
        <div className="mb-5">
          <button
            onClick={generate}
            disabled={loading || !natalChart}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading
              ? (status ? `Generating (${status})…` : 'Generating…')
              : body ? 'Regenerate cosmic weather' : 'Generate cosmic weather'}
          </button>
        </div>

        {/* Subject */}
        {body && (
          <div className="mb-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Subject</div>
            <div className="px-3 py-2 rounded-sm bg-muted/40 text-sm font-medium">{subject}</div>
          </div>
        )}

        {/* Body */}
        <div className="mb-4">
          {body && (
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Body</div>
              <button
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            </div>
          )}
          {loading ? null : error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-sm border border-destructive/30 text-sm">
              {error}
            </div>
          ) : body ? (
            <iframe
              title="Cosmic Weather preview"
              srcDoc={body}
              className="w-full h-[600px] rounded-sm border border-border bg-background"
            />
          ) : (
            <div className="p-6 bg-muted/20 rounded-sm border border-dashed border-border text-sm text-muted-foreground text-center">
              Pick a recipient above, then click Generate.
            </div>
          )}
        </div>

        {/* Actions */}
        {body && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={loading || !body}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm disabled:opacity-50"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy email'}
            </button>
            <button
              onClick={handleDownloadJson}
              disabled={loading || !body}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm disabled:opacity-50"
              title="Download structured JSON for use in Replit or another renderer"
            >
              <Download size={16} />
              Download JSON
            </button>
            <a
              href={mailtoHref()}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-sm ${loading || !body ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Mail size={16} />
              {selected ? `Open mail to ${selected.name}` : (authUser ? `Open mail to ${authUser.name || 'you'}` : 'Open in mail app')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
