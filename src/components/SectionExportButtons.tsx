/**
 * Reusable "share this section" buttons: download JSON data or a PDF snapshot.
 */

import { useState } from 'react';
import { Download, FileJson, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { downloadSectionJson, downloadSectionPdf, slugify } from '@/lib/sectionExport';

interface Props {
  /** Base file name, e.g. "Lauren Natal Portrait" */
  filename: string;
  /** Structured data written to the JSON file */
  jsonData: unknown;
  /** Element captured for the PDF */
  targetRef: React.RefObject<HTMLElement>;
  className?: string;
}

export const SectionExportButtons = ({ filename, jsonData, targetRef, className = '' }: Props) => {
  const [busy, setBusy] = useState(false);
  const base = slugify(filename);

  const handleJson = () => {
    try {
      downloadSectionJson(base, jsonData);
      toast.success('JSON downloaded');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handlePdf = async () => {
    setBusy(true);
    try {
      await downloadSectionPdf(targetRef.current, base);
      toast.success('PDF downloaded');
    } catch (e) {
      toast.error((e as Error).message || 'Could not build the PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        onClick={handlePdf}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
        {busy ? 'Building PDF…' : 'Download PDF'}
      </button>
      <button
        onClick={handleJson}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
      >
        <FileJson size={12} />
        Download JSON
      </button>
    </div>
  );
};
