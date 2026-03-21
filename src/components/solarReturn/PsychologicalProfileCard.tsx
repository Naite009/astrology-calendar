import { useState, useMemo } from 'react';
import { Brain, Zap, ArrowLeftRight, Info } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import {
  computePsychProfile,
  computeBlendedProfile,
  PsychProfile,
  BlendedProfile,
  DimensionScore,
  BlendedDimension,
} from '@/lib/solarReturnPsychProfile';

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

/* ── Spectrum Bar ── */
function SpectrumBar({
  dim,
  natalPos,
  srPos,
  mode,
}: {
  dim: DimensionScore | BlendedDimension;
  natalPos?: number;
  srPos?: number;
  mode: ViewMode;
}) {
  const isBlended = mode === 'blended' && natalPos !== undefined && srPos !== undefined;
  const bd = dim as BlendedDimension;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-foreground w-28 text-right pr-3">{dim.left}</span>
        <div className="flex-1 relative h-3 bg-muted rounded-full overflow-visible">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
          
          {/* Natal marker (triangle) */}
          {isBlended && (
            <div
              className="absolute top-[-2px] w-0 h-0 z-20"
              style={{
                left: `${(natalPos ?? 0.5) * 100}%`,
                transform: 'translateX(-50%)',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '6px solid hsl(var(--muted-foreground))',
              }}
              title={`Natal: ${dim.left} ${((natalPos ?? 0.5) * 100 - 50).toFixed(0)}%`}
            />
          )}
          
          {/* SR marker (triangle pointing up) */}
          {isBlended && (
            <div
              className="absolute bottom-[-2px] w-0 h-0 z-20"
              style={{
                left: `${(srPos ?? 0.5) * 100}%`,
                transform: 'translateX(-50%)',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '6px solid hsl(var(--primary))',
              }}
              title={`SR: ${dim.left} ${((srPos ?? 0.5) * 100 - 50).toFixed(0)}%`}
            />
          )}
          
          {/* Main dot */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-30 ${
              mode === 'natal' ? 'bg-muted-foreground' :
              mode === 'sr' ? 'bg-primary' :
              bd.blendType === 'tension' ? 'bg-destructive' :
              bd.blendType === 'reinforced' ? 'bg-primary' :
              'bg-accent-foreground'
            }`}
            style={{ left: `${dim.position * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
          
          {/* Fill bar from center */}
          <div
            className={`absolute top-0 bottom-0 rounded-full opacity-30 ${
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
        <span className="text-[11px] font-medium text-foreground w-28 pl-3">{dim.right}</span>
      </div>
      
      {/* Blend annotation */}
      {isBlended && bd.blendType && (
        <div className="flex items-center gap-1.5 ml-[7.5rem] mt-0.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border ${BLEND_COLORS[bd.blendType]}`}>
            {BLEND_LABELS[bd.blendType]}
          </span>
          {bd.topDrivers.length > 0 && (
            <span className="text-[9px] text-muted-foreground">
              {bd.topDrivers.slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
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
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Info size={14} />
          </button>
        </div>

        {showInfo && (
          <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-sm">
            <p className="mb-1"><strong>How this works:</strong> Each planet in your chart contributes to these spectrums based on its sign and house placement. Heavier planets (Sun, Moon, Ascendant) have more influence.</p>
            <p className="mb-1"><strong>Natal:</strong> Your permanent baseline personality.</p>
            <p className="mb-1"><strong>This Year:</strong> The temporary psychological climate of your Solar Return year.</p>
            <p><strong>Blended:</strong> Your natal baseline (60%) modified by this year's energy (40%). Where they conflict, you'll feel tension — that's where growth happens. ▼ = natal position, ▲ = SR position.</p>
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

      {/* Spectrums */}
      <div className="px-5 py-4 divide-y divide-border/50">
        {currentDims.map((dim) => (
          <SpectrumBar
            key={dim.id}
            dim={dim}
            mode={mode}
            natalPos={mode === 'blended' ? (dim as BlendedDimension).natalPosition : undefined}
            srPos={mode === 'blended' ? (dim as BlendedDimension).srPosition : undefined}
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
