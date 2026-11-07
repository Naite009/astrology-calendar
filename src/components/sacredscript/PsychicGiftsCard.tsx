import type { PsychicIndicator } from '@/lib/sacredScriptHelpers';

export const PsychicGiftsCard = ({ indicators, chartName }: { indicators: PsychicIndicator[]; chartName?: string }) => {
  if (!indicators.length) return null;
  return <details className="space-y-2 border-y border-border py-3">
    <summary className="cursor-pointer text-sm font-medium">Optional spiritual reflection{chartName ? `: ${chartName}` : ''}</summary>
    <p className="text-sm text-muted-foreground mt-3">Spiritual / esoteric interpretation, not a chart fact. A chart cannot prove psychic ability, spirit contact or that a dream predicts an event.</p>
    <p className="text-sm">If a dream or hunch matters to you, write what you noticed and what you guessed separately. Check the facts before acting. You can value imagination without treating every impression as true.</p>
  </details>;
};
