import { useMemo, useState } from 'react';
import { X, Copy, Check, Trash2, Mail } from 'lucide-react';
import {
  buildCosmicWeatherEmail,
  loadRecipients,
  saveRecipient,
  deleteRecipient,
  type EmailRecipient,
} from '@/lib/emailReport';

import type { NatalChart } from '@/hooks/useNatalChart';

interface Props {
  date: Date;
  onClose: () => void;
  natalChart?: NatalChart | null;
}

export const EmailReportModal = ({ date, onClose, natalChart }: Props) => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>(() => loadRecipients());
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const selected = recipients.find(r => r.email === selectedEmail) || null;

  const { subject, body } = useMemo(() => {
    try {
      console.log('[EmailReportModal] building email for', date);
      return buildCosmicWeatherEmail({ date, recipientName: selected?.name });
    } catch (err) {
      console.error('[EmailReportModal] build failed', err);
      return { subject: 'Cosmic Weather', body: `Failed to build report: ${(err as Error).message}` };
    }
  }, [date, selected]);

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

  const mailtoHref = () => {
    const to = selected?.email ? encodeURIComponent(selected.email) : '';
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
          Pick a recipient (or add a new one), preview the email, then copy it or open
          your mail app to send.
        </p>

        {/* Recipients */}
        <div className="mb-5 rounded-sm border border-border p-4 bg-muted/30">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            Saved recipients
          </h3>
          {recipients.length === 0 && (
            <p className="text-sm text-muted-foreground mb-3">No saved recipients yet.</p>
          )}
          <div className="space-y-1 mb-3">
            {recipients.map(r => (
              <label
                key={r.email}
                className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer ${
                  selectedEmail === r.email ? 'bg-primary/10 border border-primary/40' : 'hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="recipient"
                  checked={selectedEmail === r.email}
                  onChange={() => setSelectedEmail(r.email)}
                />
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.email}</span>
                <button
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.preventDefault(); handleDelete(r.email); }}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              className="px-3 py-2 text-sm rounded-sm border border-border bg-background"
              placeholder="Name"
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
              className="px-3 py-2 text-sm rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAdd}
            >
              Save
            </button>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Subject</div>
          <div className="px-3 py-2 rounded-sm bg-muted/40 text-sm font-medium">{subject}</div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Body</div>
          <textarea
            readOnly
            value={body}
            className="w-full h-[360px] font-mono text-xs p-3 rounded-sm border border-border bg-muted/20 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy email'}
          </button>
          <a
            href={mailtoHref()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          >
            <Mail size={16} />
            {selected ? `Open mail to ${selected.name}` : 'Open in mail app'}
          </a>
        </div>
      </div>
    </div>
  );
};
