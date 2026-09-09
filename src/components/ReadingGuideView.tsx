/**
 * Chart Walkthrough — a live-reading dashboard, not a report.
 *
 * Layout follows the reader's eye: where to look first, then named blends with
 * their evidence, reasoning chain, spoken line and follow-up question, then the
 * secondary layers, ending with a synthesis that can be said out loud.
 */

import { useMemo, useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from './ChartSelector';
import { buildReadingGuide, type BlendCard, type ReadingGuide } from '@/lib/readingGuide/readingGuideEngine';
import { STAGE_LABELS, type AgeStage } from '@/lib/readingGuide/ageContext';
import { ordinalHouse } from '@/lib/interpretation/ordinals';
import { DoesNotMean } from '@/components/interpretation/DoesNotMean';
import {
  EVIDENCE_TIER_LABEL, EVIDENCE_TIER_NOTE, SIGNAL_DISCLAIMER,
  EXPLORE_DEEPER_LABEL, EXPLORE_DEEPER_NOTE,
} from '@/lib/interpretation/evidenceStandard';

import { formatDateMMDDYYYY } from '@/lib/localDate';
import { ChevronDown, ChevronUp, Compass, Eye, MessageCircle, HelpCircle, Link2, Home, Droplets } from 'lucide-react';

interface ReadingGuideViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

const STRENGTH_STYLE: Record<string, string> = {
  Strong: 'bg-primary/15 text-primary border-primary/40',
  Moderate: 'bg-secondary text-foreground border-border',
  'Single-placement': 'bg-muted text-muted-foreground border-border',
};

const Chip = ({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'accent' }) => (
  <span
    className={`inline-block rounded-sm border px-2 py-0.5 text-[11px] leading-relaxed ${
      tone === 'accent' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-secondary/60 text-muted-foreground'
    }`}
  >
    {children}
  </span>
);

const Section = ({
  title, icon, children, subtitle, defaultOpen = true,
}: {
  title: string; icon?: React.ReactNode; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border border-border rounded-sm bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between border-b border-border hover:bg-secondary/30 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium uppercase tracking-widest text-foreground">{title}</span>
          {subtitle && <span className="text-[11px] text-muted-foreground normal-case tracking-normal">{subtitle}</span>}
        </span>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </section>
  );
};

const BlendCardView = ({ card }: { card: BlendCard }) => {
  const [showChain, setShowChain] = useState(false);
  return (
    <article className="border border-border rounded-sm bg-background/40 p-4 space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">{card.name}</h4>
        <span className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-sm border border-border bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
            title={EVIDENCE_TIER_NOTE[card.tier]}
          >
            {EVIDENCE_TIER_LABEL[card.tier]}
          </span>
          <span
            className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STRENGTH_STYLE[card.strength]}`}
            title={SIGNAL_DISCLAIMER}
          >
            {card.strength} · {card.supportCount} factor{card.supportCount === 1 ? '' : 's'}
          </span>
        </span>
      </header>


      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">What created it</p>
        <div className="flex flex-wrap gap-1.5">
          {card.factors.map((f, i) => (
            <Chip key={i} tone={i === 0 ? 'accent' : 'default'}>
              <span className="text-foreground">{f.label}</span> — {f.meaning}
            </Chip>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowChain((v) => !v)}
        className="text-[11px] uppercase tracking-widest text-primary hover:underline"
      >
        {showChain ? 'Hide' : 'Show'} why this matters / how it was built
      </button>
      {showChain && (
        <div className="space-y-2 rounded-sm border border-dashed border-border p-3">
          <ol className="space-y-1">
            {card.chain.map((line, i) => (
              <li key={i} className={`text-xs ${i === card.chain.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {line}
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">{card.why}</p>
        </div>
      )}

      <div className="rounded-sm bg-secondary/40 p-3">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          <MessageCircle size={11} /> What to say
        </p>
        <p className="text-sm text-foreground leading-relaxed">{card.whatToSay}</p>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <HelpCircle size={12} className="mt-0.5 shrink-0" />
        <span><span className="uppercase tracking-widest text-[10px] mr-1">Ask them this:</span>{card.askThis}</span>
      </p>
    </article>
  );
};

export const ReadingGuideView = ({ userNatalChart, savedCharts }: ReadingGuideViewProps) => {
  const allCharts = useMemo(
    () => [userNatalChart, ...savedCharts].filter((c): c is NatalChart => !!c),
    [userNatalChart, savedCharts]
  );
  const [selectedChartId, setSelectedChartId] = useState<string>(() => allCharts[0]?.id ?? '');
  const [stageOverride, setStageOverride] = useState<AgeStage | null>(null);

  const selectedChart = useMemo(
    () => allCharts.find((c) => c.id === selectedChartId) ?? allCharts[0] ?? null,
    [allCharts, selectedChartId]
  );

  const guide: ReadingGuide | null = useMemo(
    () => (selectedChart ? buildReadingGuide(selectedChart, { stageOverride }) : null),
    [selectedChart, stageOverride]
  );

  if (!allCharts.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Compass size={48} className="mx-auto mb-4 opacity-30" />
        <p>Add a natal chart first to use the Chart Walkthrough.</p>
      </div>
    );
  }
  if (!guide || !selectedChart) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {allCharts.length > 1 && (
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedChartId === userNatalChart?.id ? 'user' : selectedChartId}
          onSelect={(id) => setSelectedChartId(id === 'user' ? (userNatalChart?.id || '') : id)}
          label="Select Chart"
        />
      )}

      {/* Header + age context */}
      <div className="border border-border rounded-sm bg-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Compass size={24} className="text-primary mt-0.5" />
          <div>
            <h2 className="text-xl font-serif tracking-wide text-foreground">{guide.subject.name} — Chart Walkthrough</h2>
            <p className="text-xs text-muted-foreground">
              {guide.subject.birthDate ? formatDateMMDDYYYY(guide.subject.birthDate) : ''}
              {guide.subject.birthTime ? ` at ${guide.subject.birthTime}` : ''}
              {guide.subject.birthLocation ? ` • ${guide.subject.birthLocation}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Reading level{guide.age.years != null ? ` · age ${guide.age.years}` : ''}:
          </span>
          {(['child', 'teen', 'adult'] as AgeStage[]).map((s) => (
            <button
              key={s}
              onClick={() => setStageOverride(stageOverride === s ? null : s)}
              className={`rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-widest transition-colors ${
                guide.age.stage === s
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
          <span className="text-[10px] text-muted-foreground">
            {guide.age.source === 'override' ? 'manual override' : 'from birth date'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Uses the ten planets, Ascendant, the nodes and Chiron only. Every spoken line below is built from the
          placements shown on its card.
        </p>
      </div>

      {/* 1. Start here */}
      <Section title="Start here — what jumps out first" icon={<Eye size={14} className="text-primary" />} subtitle="ranked by importance">
        <div className="space-y-2">
          {guide.startHere.map((item, i) => (
            <div key={item.id} className="flex items-start gap-3 rounded-sm border border-border bg-background/40 p-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-[11px] font-medium text-primary">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p className="text-sm text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
              </div>
              <div className="ml-auto hidden sm:block w-20 shrink-0">
                <div className="h-1.5 w-full rounded-sm bg-secondary">
                  <div className="h-1.5 rounded-sm bg-primary" style={{ width: `${item.importance}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Blended characteristics */}
      <Section title="Blended characteristics" icon={<Link2 size={14} className="text-primary" />} subtitle="the heart of the reading">
        {guide.blends.map((card) => <BlendCardView key={card.id} card={card} />)}
      </Section>

      {/* 3. House concentrations */}
      {guide.houseClusters.length > 0 && (
        <Section title="House concentrations" icon={<Home size={14} className="text-primary" />}>
          {guide.houseClusters.map((c) => (
            <div key={c.house} className="rounded-sm border border-border bg-background/40 p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{ordinalHouse(c.house)}</span>
                {c.bodies.map((b) => <Chip key={b} tone="accent">{b}</Chip>)}
              </div>
              <p className="text-xs text-muted-foreground">Region of life: {c.arena}</p>
              <p className="text-sm text-foreground">{c.theme}</p>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Only the ten planets can create a concentration here. The Ascendant is a cusp rather than a placement, and the
            nodes and Chiron are shown separately so they cannot inflate a cluster.
          </p>
        </Section>
      )}

      {/* 4. Elements & modality, including lightly represented elements */}
      <Section title="Element and modality balance" icon={<Droplets size={14} className="text-primary" />}>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(guide.elements.counts).map(([el, n]) => (
            <Chip key={el} tone={guide.elements.dominant.includes(el) ? 'accent' : 'default'}>{el} {n}</Chip>
          ))}
          {Object.entries(guide.modalities.counts).map(([m, n]) => (
            <Chip key={m} tone={guide.modalities.dominant.includes(m) ? 'accent' : 'default'}>{m} {n}</Chip>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">{guide.modalities.note}</p>
        {guide.elements.lowReadings.map((r) => (
          <div key={r.element} className="rounded-sm border border-dashed border-border p-3 space-y-1.5">
            <p className="text-sm font-medium text-foreground">Low {r.element}: {r.headline}</p>
            <ul className="list-disc pl-5 space-y-1">
              {r.lines.map((l, i) => <li key={i} className="text-xs text-muted-foreground">{l}</li>)}
            </ul>
            <p className="text-[11px] text-muted-foreground">{r.note}</p>
          </div>
        ))}
      </Section>

      {/* 5. Personal planet groups */}
      {guide.personalGroups.length > 0 && (
        <Section title="Personal planets, grouped" subtitle="repeated themes rather than five separate readings">
          {guide.personalGroups.map((card) => <BlendCardView key={card.id} card={card} />)}
        </Section>
      )}

      {/* 6. Jupiter & Saturn */}
      {guide.growth.length > 0 && (
        <Section title="Jupiter and Saturn — growth and building">
          {guide.growth.map((card) => <BlendCardView key={card.id} card={card} />)}
        </Section>
      )}

      {/* 7. Outer planets */}
      <Section title="Uranus, Neptune, Pluto" subtitle="raised only when personally relevant" defaultOpen={false}>
        {guide.outerPlanets.elevated.map((card) => <BlendCardView key={card.id} card={card} />)}
        <p className="text-[11px] text-muted-foreground">{guide.outerPlanets.secondaryNote}</p>
      </Section>

      {/* 8. Nodes & Chiron */}
      {(guide.nodes || guide.chiron) && (
        <Section title="Nodes and Chiron" defaultOpen={false}>
          {guide.nodes && <BlendCardView card={guide.nodes} />}
          {guide.chiron && <BlendCardView card={guide.chiron} />}
          {!guide.chiron && (
            <p className="text-[11px] text-muted-foreground">
              Chiron is not tightly tied to a personal planet or angle here, so it stays background rather than a
              headline theme.
            </p>
          )}
        </Section>
      )}

      {/* 9. Top connections */}
      {guide.topConnections.length > 0 && (
        <Section title="Top connections" subtitle="tightest and most personal first">
          <div className="space-y-2">
            {guide.topConnections.map((c, i) => (
              <div key={i} className="flex items-start gap-3 rounded-sm border border-border bg-background/40 p-3">
                <span className="text-base text-primary">{c.symbol}</span>
                <div>
                  <p className="text-sm text-foreground">{c.a} {c.aspect} {c.b} <span className="text-muted-foreground">({c.orb}° orb)</span></p>
                  <p className="text-xs text-muted-foreground">What it adds: {c.adds}.</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            The North Node–South Node opposition is automatic geometry, so it is never listed here as a connection.
          </p>
        </Section>
      )}

      {/* 10. Story */}
      <Section title="The story of the chart" subtitle="say this at the end">
        <p className="text-sm leading-relaxed text-foreground">{guide.story}</p>
      </Section>
    </div>
  );
};
