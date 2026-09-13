/**
 * The shared composite / Davison reading surface.
 *
 * Renders the fixed teaching structure: what this chart is → look here first →
 * core themes with signal strength → why → how it may show up → what this does
 * not mean → deeper technical view. Used by the Composite and Davison tabs and
 * by the composite card, so no screen keeps its own composite interpretation.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RelationshipChartWheel, type WheelAspectLine } from '@/components/RelationshipChartWheel';
import type { CompositeReading, CompositeReadingItem } from '@/lib/relationship/compositeReading';
import { compositeBodySymbol, majorCompositeAspects } from '@/lib/relationship/compositeEngine';
import { EXPLORE_DEEPER_LABEL } from '@/lib/interpretation/evidenceStandard';

const SIGNAL_STYLE: Record<string, string> = {
  Strong: 'bg-primary/15 text-primary border-primary/30',
  Moderate: 'bg-secondary text-secondary-foreground border-border',
  'Single placement': 'bg-muted text-muted-foreground border-border',
};

const ItemCard = ({ item }: { item: CompositeReadingItem }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h5 className="font-medium text-sm">{item.title}</h5>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={`text-[10px] ${SIGNAL_STYLE[item.signalLabel] ?? ''}`}>
            {item.signalLabel}
          </Badge>
          <Badge variant="outline" className="text-[10px] capitalize">
            {item.tier}
          </Badge>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{item.interpretation}</p>
      <p className="mt-2 text-sm">{item.howItShowsUp}</p>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Why am I saying this?
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exact factors</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {item.evidence.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">How that adds up</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {item.derivation.map((d, i) => (
                <li key={i}>• {d}</li>
              ))}
            </ul>
          </div>
          {item.doesNotMean.length > 0 && (
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-xs font-medium">What this does not mean</p>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                {item.doesNotMean.map((d, i) => (
                  <li key={i}>• {d}</li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const CompositeReadingView = ({
  reading,
  wheelSize = 350,
  extraHeader,
}: {
  reading: CompositeReading;
  wheelSize?: number;
  extraHeader?: React.ReactNode;
}) => {
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const { model } = reading;

  const wheelPlanets: Record<string, { longitude: number }> = {};
  for (const [body, pos] of Object.entries(model.positions)) {
    wheelPlanets[body] = { longitude: pos.longitude };
  }

  const aspectLines: WheelAspectLine[] = majorCompositeAspects(model.aspects)
    .slice(0, 12)
    .map((a) => ({
      from: model.positions[a.fromBody]?.longitude ?? 0,
      to: model.positions[a.toBody]?.longitude ?? 0,
      tone: a.tone,
    }));

  return (
    <div className="space-y-6">
      {/* Wheel */}
      <div className="flex justify-center">
        <RelationshipChartWheel
          planets={wheelPlanets}
          chartName={model.name}
          size={wheelSize}
          cuspLongitudes={model.angles.cuspLongitudes}
          aspectLines={aspectLines}
          caption={
            model.angles.housesAvailable
              ? 'Signs, planets, derived house cusps and major composite aspect lines.'
              : 'Sign and aspect wheel: signs, planets and major aspect lines. No house ring, because valid house cusps could not be derived for this chart.'
          }
        />
      </div>

      {extraHeader}

      {/* 1. What this chart is */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h4 className="flex items-center gap-2 font-medium">
          <Info size={16} className="text-primary" />
          {reading.whatThisChartIs.heading}
        </h4>
        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
          {reading.whatThisChartIs.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div className="rounded-md bg-muted/50 p-2 text-xs">
            <p className="font-medium">Synastry</p>
            <p className="text-muted-foreground">{reading.distinction.synastry}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2 text-xs">
            <p className="font-medium">Composite</p>
            <p className="text-muted-foreground">{reading.distinction.composite}</p>
          </div>
        </div>
      </section>

      {/* 2. Look here first */}
      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Look here first</h4>
          <p className="text-xs text-muted-foreground">
            The strongest {reading.lookHereFirst.length} factors in this chart, in order. {reading.signalDisclaimer}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {reading.lookHereFirst.map((item) => (
            <ItemCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      {/* 3. Core relationship themes */}
      {reading.themes.length > 0 && (
        <section className="space-y-3">
          <div>
            <h4 className="font-medium">Core relationship themes</h4>
            <p className="text-xs text-muted-foreground">
              Themes are only listed when more than one factor points the same way. Anything resting on a single
              placement is labelled as such rather than headlined.
            </p>
          </div>
          <div className="space-y-3">
            {reading.themes.map((item) => (
              <ItemCard key={item.key} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom line */}
      <section className="rounded-xl border border-border bg-secondary/30 p-4">
        <h4 className="font-medium text-sm">Reading it as a whole</h4>
        <p className="mt-1 text-sm">{reading.bottomLine}</p>
      </section>

      {/* Observations and caveats */}
      {reading.observations.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h4 className="font-medium text-sm">Worth noting</h4>
          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
            {reading.observations.map((o, i) => (
              <li key={i}>• {o}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Deeper technical view */}
      <Collapsible open={technicalOpen} onOpenChange={setTechnicalOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
          <span className="font-medium">Deeper technical view — {EXPLORE_DEEPER_LABEL}</span>
          {technicalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h5 className="text-sm font-medium">Positions</h5>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {Object.values(model.positions).map((pos) => (
                <div key={pos.body} className="flex items-center justify-between rounded bg-secondary/30 px-2 py-1 text-xs">
                  <span>
                    {compositeBodySymbol(pos.body)} {pos.body}
                  </span>
                  <span className="text-muted-foreground">
                    {pos.label}
                    {pos.house ? ` · house ${pos.house}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h5 className="text-sm font-medium">Major aspects, tightest first</h5>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {majorCompositeAspects(model.aspects).map((a, i) => (
                <li key={i}>
                  • {a.label}
                  {a.isOutOfSign ? ' — out of sign' : ''}
                </li>
              ))}
              {majorCompositeAspects(model.aspects).length === 0 && (
                <li>• No major composite aspect falls inside orb in this chart.</li>
              )}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h5 className="text-sm font-medium">Weighted element and modality balance</h5>
            <p className="mt-1 text-xs text-muted-foreground">{reading.balance.line}</p>
            <p className="mt-2 text-xs text-muted-foreground">{reading.balance.note}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h5 className="text-sm font-medium">Angles and houses</h5>
            <p className="mt-1 text-xs text-muted-foreground">{reading.housesNote}</p>
            <p className="mt-2 text-xs text-muted-foreground">{reading.methodNote}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
