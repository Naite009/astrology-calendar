import { useState, useMemo } from 'react';
import { Brain, Zap, ArrowLeftRight, Info, ChevronDown } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import {
  computePsychProfile,
  computeBlendedProfile,
  PsychProfile,
  BlendedProfile,
  DimensionScore,
  BlendedDimension,
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

/** Convert raw score (-10 to +10) to a display number 0-100 on either side */
function scoreToDisplay(score: number): { value: number; side: 'left' | 'right' | 'center' } {
  const pct = Math.round(Math.abs(score) * 10);
  if (pct <= 2) return { value: pct, side: 'center' };
  return { value: pct, side: score > 0 ? 'left' : 'right' };
}

/* ── Driver Breakdown Row ── */
function DriverRow({ driver, left, right, maxContrib }: {
  driver: DimensionDriver;
  left: string;
  right: string;
  maxContrib: number;
}) {
  const { value, side } = scoreToDisplay(driver.contribution / 5); // scale to match
  const barWidth = maxContrib > 0 ? (Math.abs(driver.contribution) / maxContrib) * 100 : 0;
  const pushesLeft = driver.contribution > 0;

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-[10px] text-muted-foreground w-16 text-right font-medium">{driver.planet}</span>
      <div className="flex-1 relative h-1.5 bg-muted/50 rounded-full">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div
          className={`absolute top-0 bottom-0 rounded-full ${pushesLeft ? 'bg-primary/40' : 'bg-destructive/30'}`}
          style={{
            left: pushesLeft ? undefined : '50%',
            right: pushesLeft ? '50%' : undefined,
            width: `${Math.min(barWidth, 50)}%`,
            ...(pushesLeft ? { marginRight: 0 } : {}),
          }}
        />
      </div>
      <span className="text-[9px] text-muted-foreground w-16">
        → {pushesLeft ? left : right}
      </span>
    </div>
  );
}

/* ── Spectrum Bar (clickable/expandable) ── */
function SpectrumBar({
  dim,
  natalPos,
  srPos,
  natalScore,
  srScore,
  mode,
}: {
  dim: DimensionScore | BlendedDimension;
  natalPos?: number;
  srPos?: number;
  natalScore?: number;
  srScore?: number;
  mode: ViewMode;
}) {
  const [open, setOpen] = useState(false);
  const isBlended = mode === 'blended' && natalPos !== undefined && srPos !== undefined;
  const bd = dim as BlendedDimension;

  const display = scoreToDisplay(dim.score);
  const displayLabel = display.side === 'center' ? 'Balanced'
    : display.side === 'left' ? `${dim.left} ${display.value}`
    : `${dim.right} ${display.value}`;

  const maxContrib = dim.drivers.length > 0
    ? Math.max(...dim.drivers.map(d => Math.abs(d.contribution)))
    : 1;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full py-2.5 text-left hover:bg-muted/30 transition-colors rounded-sm px-1 -mx-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-foreground w-24 text-right pr-2 flex items-center justify-end gap-1">
              {isBlended && <span className="text-[8px] text-muted-foreground">0</span>}
              {dim.left}
              {!isBlended && <span className="text-[9px] text-muted-foreground ml-0.5">100</span>}
            </span>
            <div className="flex-1 relative h-3 bg-muted rounded-full overflow-visible">
              {/* Scale marks */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
              <div className="absolute left-1/4 top-1 bottom-1 w-px bg-border/30" />
              <div className="absolute left-3/4 top-1 bottom-1 w-px bg-border/30" />

              {/* Natal marker (labeled) */}
              {isBlended && (
                <div
                  className="absolute top-[-6px] z-20 flex flex-col items-center"
                  style={{ left: `${(natalPos ?? 0.5) * 100}%`, transform: 'translateX(-50%)' }}
                  title={`Natal: ${natalScore?.toFixed(1)}`}
                >
                  <span className="text-[7px] text-muted-foreground font-medium leading-none">N</span>
                  <div className="w-0 h-0" style={{
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderTop: '4px solid hsl(var(--muted-foreground))',
                  }} />
                </div>
              )}

              {/* SR marker (labeled) */}
              {isBlended && (
                <div
                  className="absolute bottom-[-6px] z-20 flex flex-col items-center"
                  style={{ left: `${(srPos ?? 0.5) * 100}%`, transform: 'translateX(-50%)' }}
                  title={`This Year: ${srScore?.toFixed(1)}`}
                >
                  <div className="w-0 h-0" style={{
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderBottom: '4px solid hsl(var(--primary))',
                  }} />
                  <span className="text-[7px] text-primary font-medium leading-none">SR</span>
                </div>
              )}

              {/* Main dot = current view's position (or blended) */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-30 border border-background ${
                  mode === 'natal' ? 'bg-muted-foreground' :
                  mode === 'sr' ? 'bg-primary' :
                  bd.blendType === 'tension' ? 'bg-destructive' :
                  bd.blendType === 'reinforced' ? 'bg-primary' :
                  'bg-accent-foreground'
                }`}
                style={{ left: `${dim.position * 100}%`, transform: 'translate(-50%, -50%)' }}
                title={isBlended ? `Blended: ${dim.score.toFixed(1)}` : undefined}
              />

              {/* Fill bar from center */}
              <div
                className={`absolute top-0 bottom-0 rounded-full opacity-25 ${
                  mode === 'natal' ? 'bg-muted-foreground' :
                  mode === 'sr' ? 'bg-primary' :
                  bd.blendType === 'tension' ? 'bg-destructive' :
                  'bg-primary'
                }`}
                style={{
                  left: dim.position > 0.5 ? '50%' : `${dim.position * 100}%`,
                  width: `${Math.abs(dim.position - 0.5) * 100}%`,
                }}
              />
            </div>
            <span className="text-[11px] font-medium text-foreground w-24 pl-2 flex items-center gap-1">
              {!isBlended && <span className="text-[9px] text-muted-foreground mr-0.5">100</span>}
              {dim.right}
              {isBlended && <span className="text-[8px] text-muted-foreground">0</span>}
            </span>
          </div>

          {/* Score label + expand hint */}
          <div className="flex items-center justify-between ml-24 mr-24 mt-0.5">
            <span className={`text-[10px] font-semibold ${
              display.side === 'center' ? 'text-muted-foreground' :
              display.side === 'left' ? 'text-foreground' : 'text-foreground'
            }`}>
              {displayLabel}
            </span>
            <div className="flex items-center gap-1">
              {isBlended && bd.blendType && (
                <span className={`text-[8px] px-1 py-0.5 rounded-sm border ${BLEND_COLORS[bd.blendType]}`}>
                  {BLEND_LABELS[bd.blendType]}
                </span>
              )}
              <ChevronDown size={10} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-1 mr-1 mb-2 mt-1 p-3 bg-muted/20 rounded-sm border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-2 italic">{dim.description}</p>

          {/* Blended legend */}
          {isBlended && (
            <div className="flex items-center gap-3 mb-2 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-0 h-0" style={{
                  borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
                  borderTop: '4px solid hsl(var(--muted-foreground))',
                }} /> <strong>N</strong> = Natal ({natalScore?.toFixed(1)})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-0 h-0" style={{
                  borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
                  borderBottom: '4px solid hsl(var(--primary))',
                }} /> <strong>SR</strong> = This Year ({srScore?.toFixed(1)})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary border border-background" />
                = Blended ({dim.score.toFixed(1)})
              </span>
            </div>
          )}

          {/* Score summary */}
          {isBlended && (
            <p className="text-[10px] text-muted-foreground mb-2">
              Natal pulls toward <strong>{(natalScore ?? 0) >= 0 ? dim.left : dim.right}</strong> ({Math.round(Math.abs(natalScore ?? 0) * 10)}).
              This year pulls toward <strong>{(srScore ?? 0) >= 0 ? dim.left : dim.right}</strong> ({Math.round(Math.abs(srScore ?? 0) * 10)}).
              Blended result: <strong>{displayLabel}</strong>.
            </p>
          )}

          {isBlended && bd.blendDescription && (
            <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">{bd.blendDescription}</p>
          )}

          {/* Planet breakdown */}
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
            Planet Contributions
          </p>
          <div className="space-y-0">
            {dim.drivers.slice(0, 8).map((d, i) => (
              <DriverRow key={`${d.planet}-${i}`} driver={d} left={dim.left} right={dim.right} maxContrib={maxContrib} />
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
          <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-sm">
            <p className="mb-1"><strong>Scores:</strong> Each spectrum runs 0 (center/balanced) to 100 (extreme). E.g. "Active 30" means you lean 30% toward Active from center.</p>
            <p className="mb-1"><strong>Click any bar</strong> to see which planets are pushing the score in each direction.</p>
            <p className="mb-1"><strong>Blended view markers:</strong> <strong>N▼</strong> = your natal baseline. <strong>SR▲</strong> = this year's energy. <strong>●</strong> = the blended result (60% natal + 40% SR).</p>
            <p><strong>The blended dot sits between N and SR</strong> — closer to natal because your baseline personality has more weight than a single year.</p>
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

      {/* Blended legend bar */}
      {mode === 'blended' && (
        <div className="px-5 py-2 bg-muted/20 border-b border-border flex items-center gap-4 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-0 h-0" style={{
              borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
              borderTop: '5px solid hsl(var(--muted-foreground))',
            }} /> <strong>N</strong> = Natal
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-0 h-0" style={{
              borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
              borderBottom: '5px solid hsl(var(--primary))',
            }} /> <strong>SR</strong> = This Year
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary border border-background" />
            <strong>●</strong> = Blended (60/40)
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
            natalPos={mode === 'blended' ? (dim as BlendedDimension).natalPosition : undefined}
            srPos={mode === 'blended' ? (dim as BlendedDimension).srPosition : undefined}
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
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {mode === 'natal' ? modNatal.description : mode === 'sr' ? modSR.description : modSR.description}
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
