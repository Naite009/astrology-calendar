/**
 * Displays auto-tagged context (moon phase, eclipse proximity, active transits)
 * for a journal entry or the current date.
 */

import { useMemo } from 'react';
import { Moon, Zap, AlertTriangle, Eclipse } from 'lucide-react';
import { JournalContextTags, getJournalContextTags } from '@/lib/journalDataTracking';
import { SRActivationData } from '@/lib/solarReturnActivationWindows';

interface Props {
  date: Date;
  activationData: SRActivationData | null;
  compact?: boolean;
}

export const JournalContextBanner = ({ date, activationData, compact = false }: Props) => {
  const tags = useMemo(() => getJournalContextTags(date, activationData), [date, activationData]);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary text-foreground">
          {tags.moonPhase.emoji} {tags.moonPhase.phase}
        </span>
        {tags.eclipse.isNearEclipse && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-400">
            ◐ Eclipse {tags.eclipse.daysUntil !== undefined && tags.eclipse.daysUntil > 0 ? `in ${tags.eclipse.daysUntil}d` : `${Math.abs(tags.eclipse.daysUntil || 0)}d ago`}
          </span>
        )}
        {tags.transits.isActive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
            ⚡ {tags.transits.hits.length} transit{tags.transits.hits.length !== 1 ? 's' : ''} active
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-sm p-4 bg-card space-y-3">
      <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Current Cosmic Context</h4>

      {/* Moon Phase */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{tags.moonPhase.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{tags.moonPhase.phase}</p>
          <p className="text-xs text-muted-foreground">{tags.moonPhase.description}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {tags.moonPhase.illumination}% illuminated · {tags.moonPhase.angle}° elongation
          </p>
        </div>
      </div>

      {/* Eclipse */}
      {tags.eclipse.isNearEclipse && (
        <div className="flex items-start gap-3 border-t border-border/50 pt-3">
          <span className="text-lg mt-0.5">◐</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {tags.eclipse.eclipseType === 'solar' ? 'Solar' : 'Lunar'} Eclipse in {tags.eclipse.sign}
            </p>
            <p className="text-xs text-muted-foreground">{tags.eclipse.description}</p>
          </div>
        </div>
      )}

      {/* Active Transits */}
      {tags.transits.isActive && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-primary font-medium flex items-center gap-1">
            <Zap size={10} /> Active SR Transits
          </p>
          {tags.transits.hits.slice(0, 5).map((hit, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                hit.significance === 'high' ? 'bg-red-500' :
                hit.significance === 'medium' ? 'bg-amber-500' : 'bg-muted-foreground'
              }`} />
              <span className="text-foreground font-medium">
                {hit.transitPlanet} {hit.aspect} {hit.srTarget}
              </span>
              <span className="text-muted-foreground">
                {hit.daysFromNow === 0 ? 'exact today' :
                 hit.daysFromNow > 0 ? `in ${hit.daysFromNow}d` :
                 `${Math.abs(hit.daysFromNow)}d ago`}
              </span>
            </div>
          ))}
          {tags.transits.hits.length > 5 && (
            <p className="text-[10px] text-muted-foreground">+{tags.transits.hits.length - 5} more</p>
          )}
        </div>
      )}
    </div>
  );
};
