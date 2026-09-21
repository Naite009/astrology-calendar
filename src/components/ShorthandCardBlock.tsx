/**
 * Shorthand descriptor card — the shared eight-part display used anywhere a
 * natal surface synthesises two or three factors. Label first, evidence always.
 */
import React from 'react';
import type { ShorthandCard } from '@/lib/interpretation/shorthandDescriptor';

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</div>
    <div className="text-sm text-foreground/90">{children}</div>
  </div>
);

export const ShorthandCardBlock = ({ card, className = '' }: { card?: ShorthandCard | null; className?: string }) => {
  if (!card) return null;
  return (
    <div className={`rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-primary">{card.label}</span>
        {card.tension && (
          <span className="text-[11px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">
            a tension, not an agreement
          </span>
        )}
      </div>

      <Row title="Factors used">
        <ul className="list-disc pl-4 space-y-0.5">
          {card.factors.map((f) => (
            <li key={f.label}>
              <span className="font-medium">{f.label}</span> — {f.contributes}
            </li>
          ))}
        </ul>
      </Row>

      <Row title="The blend">{card.blend}</Row>
      <Row title="What to say out loud">
        <span className="italic">“{card.whatToSay}”</span>
      </Row>
      <Row title="How it may show up">
        <ul className="list-disc pl-4 space-y-0.5">
          {card.howItMayShowUp.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </Row>
      <Row title="Growth edge">{card.growthEdge}</Row>
      <Row title="Why am I saying this?">{card.why}</Row>
    </div>
  );
};

export default ShorthandCardBlock;
