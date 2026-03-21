import { useState, useMemo } from 'react';
import { Brain, Zap, ArrowLeftRight, Info, ChevronDown } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import {
  computePsychProfile,
  computeBlendedProfile,
  BlendedDimension,
  DimensionScore,
  DimensionDriver,
} from '@/lib/solarReturnPsychProfile';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface Props {
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

type ViewMode = 'natal' | 'sr' | 'blended';

const MODE_LABELS: Record<ViewMode, { label: string; description: string }> = {
  natal: { label: 'Natal', description: 'Your baseline personality' },
  sr: { label: 'This Year', description: 'The energy of your Solar Return year' },
  blended: { label: 'Blended', description: 'How natal + SR energies interact' },
};

const BLEND_COLORS: Record<string, string> = {
  reinforced: 'bg-primary/10 border-primary/20 text-primary',
  tension: 'bg-destructive/10 border-destructive/20 text-destructive',
  shift: 'bg-accent/30 border-accent/40 text-accent-foreground',
};

const BLEND_LABELS: Record<string, string> = {
  reinforced: 'Amplified',
  tension: 'Tension',
  shift: 'Gentle Shift',
};

/**
 * Convert a score (-10 to +10) to a CSS left% value.
 * Score +10 (full left pole) → 0% (left edge of bar)
 * Score 0 (balanced) → 50% (center)
 * Score -10 (full right pole) → 100% (right edge of bar)
 */
function scoreToLeftPct(score: number): number {
  return 50 - (score / 10) * 50;
}

/** Display score as "LeftLabel 30" or "RightLabel 45" */
function formatScore(score: number, left: string, right: string): string {
  const pct = Math.round(Math.abs(score) * 10);
  if (pct <= 2) return 'Balanced';
  return score > 0 ? `${left} ${pct}` : `${right} ${pct}`;
}

/* ── Driver Breakdown Row ── */
function DriverRow({ driver, left, right, maxContrib, mode }: {
  driver: DimensionDriver;
  left: string;
  right: string;
  maxContrib: number;
  mode: ViewMode;
}) {
  const pushesLeft = driver.contribution > 0;
  const barPct = maxContrib > 0 ? (Math.abs(driver.contribution) / maxContrib) * 45 : 0;
  const sourceTag = mode === 'blended' && driver.source ? driver.source : null;

  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-28 text-right flex items-center justify-end gap-1">
        {sourceTag && (
          <span className={`text-[8px] px-1 py-px rounded ${
            sourceTag === 'Natal' ? 'bg-muted-foreground/20 text-muted-foreground' : 'bg-primary/20 text-primary'
          }`}>{sourceTag === 'Natal' ? 'N' : 'SR'}</span>
        )}
        <span className="text-[10px] text-muted-foreground font-medium">{driver.planet}</span>
      </div>
      <div className="flex-1 relative h-2 bg-muted/30 rounded-full">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/60" />
        {pushesLeft ? (
          <div
            className="absolute top-0 bottom-0 rounded-l-full bg-primary/50"
            style={{ right: '50%', width: `${barPct}%` }}
          />
        ) : (
          <div
            className="absolute top-0 bottom-0 rounded-r-full bg-destructive/40"
            style={{ left: '50%', width: `${barPct}%` }}
          />
        )}
      </div>
      <span className={`text-[9px] w-20 ${pushesLeft ? 'text-primary' : 'text-destructive'}`}>
        → {pushesLeft ? left : right}
      </span>
    </div>
  );
}

/* ── Reason tooltip under driver row ── */
function DriverReasonRow({ driver }: { driver: DimensionDriver }) {
  if (!driver.reason) return null;
  return (
    <div className="flex items-center gap-2 pb-0.5">
      <span className="w-28" />
      <span className="text-[8px] text-muted-foreground/70 italic">{driver.reason}</span>
    </div>
  );
}

/* ── Spectrum Bar (clickable/expandable) ── */
function SpectrumBar({
  dim,
  natalScore,
  srScore,
  mode,
}: {
  dim: DimensionScore | BlendedDimension;
  natalScore?: number;
  srScore?: number;
  mode: ViewMode;
}) {
  const [open, setOpen] = useState(false);
  const isBlended = mode === 'blended' && natalScore !== undefined && srScore !== undefined;
  const bd = dim as BlendedDimension;

  // CSS positions (left%)
  const dotLeft = scoreToLeftPct(dim.score);
  const natalLeft = isBlended ? scoreToLeftPct(natalScore!) : 50;
  const srLeft = isBlended ? scoreToLeftPct(srScore!) : 50;

  const displayLabel = formatScore(dim.score, dim.left, dim.right);

  const maxContrib = dim.drivers.length > 0
    ? Math.max(...dim.drivers.map(d => Math.abs(d.contribution)))
    : 1;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full py-3 text-left hover:bg-muted/30 transition-colors rounded-sm px-1 -mx-1">
          {/* Labels + bar */}
          <div className="flex items-center gap-0 mb-1">
            <div className="w-28 text-right pr-3 flex flex-col items-end">
              <span className="text-[11px] font-medium text-foreground">{dim.left}</span>
              <span className="text-[8px] text-muted-foreground">100</span>
            </div>

            <div className="flex-1 relative h-4 bg-muted rounded-full overflow-visible">
              {/* Scale marks */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
              <div className="absolute left-1/4 top-1 bottom-1 w-px bg-border/30" />
              <div className="absolute left-3/4 top-1 bottom-1 w-px bg-border/30" />
              {/* Center "0" label */}
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-3 text-[7px] text-muted-foreground">0</span>

              {/* Fill bar from center to dot */}
              <div
                className={`absolute top-0.5 bottom-0.5 rounded-full opacity-30 ${
                  mode === 'natal' ? 'bg-muted-foreground' :
                  mode === 'sr' ? 'bg-primary' :
                  bd.blendType === 'tension' ? 'bg-destructive' :
                  'bg-primary'
                }`}
                style={{
                  left: dotLeft < 50 ? `${dotLeft}%` : '50%',
                  width: `${Math.abs(dotLeft - 50)}%`,
                }}
              />

              {/* Natal marker (down-pointing triangle with "N" label) */}
              {isBlended && (
                <div
                  className="absolute -top-2 z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${natalLeft}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-[8px] font-bold text-muted-foreground leading-none mb-px">N</span>
                  <div className="w-0 h-0" style={{
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '5px solid hsl(var(--muted-foreground))',
                  }} />
                </div>
              )}

              {/* SR marker (up-pointing triangle with "SR" label) */}
              {isBlended && (
                <div
                  className="absolute -bottom-2 z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${srLeft}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-0 h-0" style={{
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '5px solid hsl(var(--primary))',
                  }} />
                  <span className="text-[8px] font-bold text-primary leading-none mt-px">SR</span>
                </div>
              )}

              {/* Main blended dot */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-30 border-2 border-background shadow-sm ${
                  mode === 'natal' ? 'bg-muted-foreground' :
                  mode === 'sr' ? 'bg-primary' :
                  bd.blendType === 'tension' ? 'bg-destructive' :
                  bd.blendType === 'reinforced' ? 'bg-primary' :
                  'bg-accent-foreground'
                }`}
                style={{ left: `${dotLeft}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>

            <div className="w-28 pl-3 flex flex-col items-start">
              <span className="text-[11px] font-medium text-foreground">{dim.right}</span>
              <span className="text-[8px] text-muted-foreground">100</span>
            </div>
          </div>

          {/* Score + badge */}
          <div className="flex items-center justify-between mt-2 ml-28 mr-28">
            <span className="text-[11px] font-semibold text-foreground">{displayLabel}</span>
            <div className="flex items-center gap-1.5">
              {isBlended && bd.blendType && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-sm border ${BLEND_COLORS[bd.blendType]}`}>
                  {BLEND_LABELS[bd.blendType]}
                </span>
              )}
              <ChevronDown size={10} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mx-1 mb-2 mt-1 p-3 bg-muted/20 rounded-sm border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-2 italic">{dim.description}</p>

          {/* Blended explanation */}
          {isBlended && (
            <div className="mb-3 space-y-1">
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span><strong className="text-muted-foreground">N</strong> (Natal) = {formatScore(natalScore!, dim.left, dim.right)}</span>
                <span><strong className="text-primary">SR</strong> (This Year) = {formatScore(srScore!, dim.left, dim.right)}</span>
                <span><strong>●</strong> Blended = {displayLabel}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The blended score is 60% your natal baseline + 40% this year's energy.
                {bd.blendType === 'tension' && ' These energies pull in opposite directions — expect inner friction.'}
                {bd.blendType === 'reinforced' && ' Both charts agree — this quality is amplified this year.'}
                {bd.blendType === 'shift' && ' This year gently nudges you from your baseline.'}
              </p>
              {bd.blendDescription && (
                <p className="text-[10px] text-muted-foreground leading-relaxed">{bd.blendDescription}</p>
              )}
            </div>
          )}

          {/* Planet breakdown */}
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
            What's Driving This Score
          </p>
          <p className="text-[9px] text-muted-foreground mb-2">
            Bars show each planet's push — <span className="text-primary">left = {dim.left}</span>, <span className="text-destructive">right = {dim.right}</span>
          </p>
          <div className="space-y-0">
            {dim.drivers.filter(d => Math.abs(d.contribution) > 0.1).slice(0, 10).map((d, i) => (
              <div key={`${d.planet}-${d.source || ''}-${i}`}>
                <DriverRow driver={d} left={dim.left} right={dim.right} maxContrib={maxContrib} mode={mode} />
                <DriverReasonRow driver={d} />
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Element/Modality Mini Bar ── */
function ElementBar({ label, natal, sr, mode }: { label: string; natal: number; sr: number; mode: ViewMode }) {
  const val = mode === 'natal' ? natal : mode === 'sr' ? sr : natal * 0.6 + sr * 0.4;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-14 text-right">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${val * 100}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-8">{Math.round(val * 100)}%</span>
    </div>
  );
}

export function PsychologicalProfileCard({ natalChart, srChart }: Props) {
  const [mode, setMode] = useState<ViewMode>('blended');
  const [showInfo, setShowInfo] = useState(false);

  const natalProfile = useMemo(() => computePsychProfile(natalChart), [natalChart]);
  const srProfile = useMemo(() => computePsychProfile(srChart), [srChart]);
  const blended = useMemo(() => computeBlendedProfile(natalChart, srChart), [natalChart, srChart]);

  const currentDims = mode === 'natal' ? natalProfile.dimensions :
                      mode === 'sr' ? srProfile.dimensions :
                      blended.dimensions;

  const elNatal = blended.elements.natal;
  const elSR = blended.elements.sr;
  const modNatal = blended.modality.natal;
  const modSR = blended.modality.sr;

  const tensions = mode === 'blended'
    ? (blended.dimensions as BlendedDimension[]).filter(d => d.blendType === 'tension')
    : [];

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 px-5 py-4 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">
                Psychological Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                {MODE_LABELS[mode].description}
              </p>
            </div>
          </div>
          <button onClick={() => setShowInfo(!showInfo)} className="text-muted-foreground hover:text-foreground">
            <Info size={14} />
          </button>
        </div>

        {showInfo && (
          <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-sm space-y-1">
            <p><strong>How to read:</strong> Each bar is a spectrum between two poles. The dot shows where you land — closer to one side means you lean that way. The number (0-100) shows how strong the lean is.</p>
            <p><strong>Click any bar</strong> to see which planets push the score left or right.</p>
            <p><strong>Blended view:</strong> <strong>N▼</strong> = your natal position. <strong>SR▲</strong> = this year. <strong>● dot</strong> = blended (60% natal + 40% SR) — it always sits between N and SR, closer to N.</p>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-border">
        {(['natal', 'sr', 'blended'] as ViewMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-[11px] uppercase tracking-widest font-medium transition-colors ${
              mode === m
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m === 'blended' && <ArrowLeftRight size={10} className="inline mr-1" />}
            {MODE_LABELS[m].label}
          </button>
        ))}
      </div>

      {/* Blended legend */}
      {mode === 'blended' && (
        <div className="px-5 py-2 bg-muted/20 border-b border-border flex items-center gap-4 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-0 h-0" style={{
              borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
              borderTop: '5px solid hsl(var(--muted-foreground))',
            }} /> <strong>N</strong> = Your natal baseline
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-0 h-0" style={{
              borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
              borderBottom: '5px solid hsl(var(--primary))',
            }} /> <strong>SR</strong> = This year's energy
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-primary border-2 border-background" />
            = Blended result
          </span>
        </div>
      )}

      {/* Spectrums */}
      <div className="px-5 py-3 divide-y divide-border/30">
        {currentDims.map((dim) => (
          <SpectrumBar
            key={dim.id}
            dim={dim}
            mode={mode}
            natalScore={mode === 'blended' ? (dim as BlendedDimension).natalScore : undefined}
            srScore={mode === 'blended' ? (dim as BlendedDimension).srScore : undefined}
          />
        ))}
      </div>

      {/* Tension Summary */}
      {mode === 'blended' && tensions.length > 0 && (
        <div className="px-5 py-3 border-t border-border bg-destructive/5">
          <p className="text-[10px] uppercase tracking-widest text-destructive font-medium mb-2 flex items-center gap-1">
            <Zap size={10} /> Growth Edges This Year
          </p>
          <div className="space-y-1.5">
            {tensions.map(t => (
              <p key={t.id} className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">{t.left} vs {t.right}:</span>{' '}
                {t.blendDescription}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Element & Modality */}
      <div className="px-5 py-4 border-t border-border grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Element Balance</p>
          <ElementBar label="Fire" natal={elNatal.fire} sr={elSR.fire} mode={mode} />
          <ElementBar label="Earth" natal={elNatal.earth} sr={elSR.earth} mode={mode} />
          <ElementBar label="Air" natal={elNatal.air} sr={elSR.air} mode={mode} />
          <ElementBar label="Water" natal={elNatal.water} sr={elSR.water} mode={mode} />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Dominant: <span className="font-medium text-foreground">
              {mode === 'natal' ? elNatal.dominant : mode === 'sr' ? elSR.dominant : elNatal.dominant + ' → ' + elSR.dominant}
            </span>
            {(mode === 'natal' ? elNatal.missing : mode === 'sr' ? elSR.missing : null) && (
              <span className="text-destructive"> · Missing: {mode === 'natal' ? elNatal.missing : elSR.missing}</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Modality Balance</p>
          <ElementBar label="Cardinal" natal={modNatal.cardinal} sr={modSR.cardinal} mode={mode} />
          <ElementBar label="Fixed" natal={modNatal.fixed} sr={modSR.fixed} mode={mode} />
          <ElementBar label="Mutable" natal={modNatal.mutable} sr={modSR.mutable} mode={mode} />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Dominant: <span className="font-medium text-foreground">
              {mode === 'natal' ? modNatal.dominant : mode === 'sr' ? modSR.dominant : modNatal.dominant + ' → ' + modSR.dominant}
            </span>
          </p>
        </div>
      </div>

      {/* Hemisphere */}
      <div className="px-5 py-3 border-t border-border">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Hemisphere Emphasis</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {mode === 'natal'
            ? natalProfile.hemispheres.description
            : mode === 'sr'
            ? srProfile.hemispheres.description
            : `Natal: ${natalProfile.hemispheres.description} This year: ${srProfile.hemispheres.description}`}
        </p>
      </div>
    </div>
  );
}
