/**
 * Dominant Planets Card — Shared visual component
 * Shows ranked table with score breakdown, Captain/Star Player/Billboard badges, and percentage bars
 * Used in Solar Return, Life Patterns, and Natal Portrait
 */

import { useState } from 'react';
import { DominantPlanetsReport, DominantPlanetEntry } from '@/lib/dominantPlanetsEngine';
import { SRDominantPlanetsReport, SRDominantPlanetEntry } from '@/lib/solarReturnT4Analysis';
import { getPlanetSymbol } from '@/components/PlanetSymbol';
import { Crown, Zap, Mountain, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UnifiedEntry = (DominantPlanetEntry | SRDominantPlanetEntry) & { meaning?: string };
type UnifiedReport = {
  entries: UnifiedEntry[];
  captain: string;
  starPlayer: string;
  billboard: string;
  captainScore: number;
  interpretation: string;
};

interface Props {
  report: DominantPlanetsReport | SRDominantPlanetsReport;
  context?: 'natal' | 'solar-return';
  compact?: boolean;
}

const ROLE_BADGES = [
  { key: 'captain', label: '👑 Captain', icon: Crown, description: 'Most dominant planet — highest total influence across all five factors' },
  { key: 'starPlayer', label: '⚡ Star Player', icon: Zap, description: 'Strongest by dignity — most comfortable and effective in its sign' },
  { key: 'billboard', label: '🏔️ Billboard', icon: Mountain, description: 'Most elevated — closest to the Midheaven, what the world sees first' },
] as const;

const FACTOR_LABELS: Record<string, { label: string; max: number; color: string }> = {
  sign: { label: 'Sign', max: 5, color: 'bg-primary' },
  house: { label: 'House', max: 5, color: 'bg-primary/80' },
  angle: { label: 'Angle', max: 6, color: 'bg-primary/70' },
  ruler: { label: 'Ruler', max: 9, color: 'bg-primary/60' },
  aspects: { label: 'Aspects', max: 10, color: 'bg-primary/50' },
};

const BreakdownBar = ({ factor, value }: { factor: string; value: number }) => {
  const info = FACTOR_LABELS[factor];
  if (!info) return null;
  const pct = Math.min((value / info.max) * 100, 100);
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-12 text-right text-muted-foreground">{info.label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${info.color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-muted-foreground">{value}</span>
    </div>
  );
};

const PlanetRow = ({ entry, report, showBreakdown }: { entry: UnifiedEntry; report: UnifiedReport; showBreakdown: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const roles: string[] = [];
  if (report.captain === entry.planet) roles.push('captain');
  if (report.starPlayer === entry.planet) roles.push('starPlayer');
  if (report.billboard === entry.planet) roles.push('billboard');

  return (
    <div className={`${entry.rank <= 3 ? 'bg-primary/5' : ''} px-3 py-2 rounded-sm`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-5 text-right">#{entry.rank}</span>
        <span className="text-sm font-medium text-foreground flex-shrink-0">
          {getPlanetSymbol(entry.planet)} {entry.planet}
        </span>
        
        {/* Role badges */}
        <div className="flex gap-1 flex-shrink-0">
          {roles.map(role => {
            const r = ROLE_BADGES.find(b => b.key === role)!;
            return (
              <TooltipProvider key={role}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0">{r.label}</Badge>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-xs">{r.description}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          {entry.tags.filter(t => !['Angular'].includes(t) || roles.length === 0).slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-[8px] px-1.5 py-0">{tag}</Badge>
          ))}
        </div>

        <div className="flex-1" />
        
        {/* Score and bar */}
        <span className="text-xs font-semibold text-foreground w-10 text-right">{entry.totalScore}</span>
        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden flex-shrink-0">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${entry.percentage}%` }} />
        </div>
        
        {showBreakdown && (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {expanded && showBreakdown && (
        <div className="mt-2 ml-7 space-y-1">
          {Object.entries(entry.breakdown).map(([k, v]) => (
            <BreakdownBar key={k} factor={k} value={v as number} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DominantPlanetsCard = ({ report, context = 'natal', compact = false }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const r = report as UnifiedReport;
  const displayEntries = showAll ? r.entries : r.entries.slice(0, compact ? 5 : 7);
  const remaining = r.entries.length - displayEntries.length;

  const captainEntry = r.entries.find(e => e.planet === r.captain);
  const meaning = (captainEntry as DominantPlanetEntry)?.meaning || '';

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">
          {context === 'solar-return' ? 'Dominant Planets This Year' : 'Your Dominant Planets'}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Who runs the chart? Five factors scored: sign dignity, house power, angle proximity, rulership, and aspect connectivity.
          {context === 'solar-return' ? ' These rankings reflect your Solar Return chart.' : ' These rankings reflect your natal chart.'}
        </p>
      </div>

      {/* Three role cards */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {ROLE_BADGES.map(role => {
          const planetName = r[role.key as keyof typeof r] as string;
          const entry = r.entries.find(e => e.planet === planetName);
          const Icon = role.icon;
          return (
            <div key={role.key} className="p-3 text-center">
              <Icon size={14} className="mx-auto text-primary mb-1" />
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{role.label}</p>
              <p className="text-sm font-serif font-medium text-foreground">
                {getPlanetSymbol(planetName)} {planetName}
              </p>
              {entry && <p className="text-[10px] text-muted-foreground">{entry.totalScore} pts</p>}
            </div>
          );
        })}
      </div>

      {/* Captain meaning */}
      {meaning && !compact && (
        <div className="px-5 py-3 bg-primary/5 border-b border-border">
          <p className="text-[11px] text-foreground/85 leading-relaxed italic">
            {meaning}
          </p>
        </div>
      )}

      {/* Ranked table */}
      <div className="p-3 space-y-1">
        {displayEntries.map(entry => (
          <PlanetRow key={entry.planet} entry={entry} report={r} showBreakdown={!compact} />
        ))}
        
        {remaining > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-center text-[10px] text-primary hover:text-primary/80 py-2"
          >
            Show {remaining} more planets
          </button>
        )}
      </div>

      {/* Interpretation */}
      {!compact && (
        <div className="px-5 py-3 border-t border-border">
          <div className="flex items-start gap-2">
            <Info size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">{r.interpretation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
