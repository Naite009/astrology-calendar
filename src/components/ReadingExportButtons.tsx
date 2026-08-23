/**
 * One PDF + one JSON button pair for a reading section.
 */

import { FileDown, Braces } from "lucide-react";

interface Props {
  onPdf: () => void;
  onJson: () => void;
  label?: string;
  emphasis?: boolean;
  className?: string;
}

export const ReadingExportButtons = ({ onPdf, onJson, label, emphasis = false, className = "" }: Props) => (
  <div className={`flex flex-wrap items-center gap-2 ${className}`}>
    {label && (
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">{label}</span>
    )}
    <button
      onClick={onPdf}
      className={
        emphasis
          ? "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          : "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-sm border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
      }
    >
      <FileDown size={12} /> PDF
    </button>
    <button
      onClick={onJson}
      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-sm border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
    >
      <Braces size={12} /> JSON
    </button>
  </div>
);
