import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { buildSignTeaching, buildAxisTeaching, getSignGlyph, type ZodiacSign } from '@/lib/astrology/signTeacher';

interface Props {
  selectedSign?: ZodiacSign | null;
}

const STATIC_MODULES = [
  { key: 'nodes', icon: '☊', title: 'Nodal Direction — North vs. South' },
  { key: 'houses', icon: '🏛', title: 'Eclipse Through the Houses' },
  { key: 'natal', icon: '🎯', title: 'Natal Planet Activations' },
  { key: 'cycles', icon: '🔄', title: 'Saros Cycles & Long-Range Patterns' },
];

function NodalDirectionContent() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">☊</span>
            <h4 className="font-semibold text-sm">North Node Eclipse — Growth & Initiation</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Pulls life <strong>forward</strong> into unfamiliar territory</li>
            <li>New identity forming — uncomfortable but necessary</li>
            <li>Energy <strong>increases</strong> around the eclipse themes</li>
            <li>Opportunities arrive that require courage to accept</li>
          </ul>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">☋</span>
            <h4 className="font-semibold text-sm">South Node Eclipse — Release & Audit</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Culmination — what you've built is <strong>reviewed</strong></li>
            <li>Patterns revealed that have run their course</li>
            <li>Energy <strong>drains</strong> from outdated systems</li>
            <li>Recognition rather than pursuit — receive, don't chase</li>
          </ul>
        </div>
      </div>
      <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center space-y-1">
        <p className="text-sm font-medium italic">
          North Node eclipses ask: <span className="text-primary">"Where must I grow?"</span>
        </p>
        <p className="text-sm font-medium italic">
          South Node eclipses ask: <span className="text-accent-foreground">"What has already run its course?"</span>
        </p>
      </div>
    </div>
  );
}

function SignTeachingContent({ sign }: { sign: ZodiacSign }) {
  const t = buildSignTeaching(sign);
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground italic">
        Why {sign} expresses {t.info.element} through the {t.info.modality} mode — and how it differs from the other {t.info.element} signs.
      </p>

      {/* Element */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
        <h4 className="font-semibold text-sm">{t.elementCard.icon} {t.elementCard.title}</h4>
        <p className="text-sm text-muted-foreground">{t.elementCard.body}</p>
      </div>

      {/* Modality */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
        <h4 className="font-semibold text-sm">🔄 {t.modalityCard.title}</h4>
        <p className="text-sm text-muted-foreground">{t.modalityCard.body}</p>
      </div>

      {/* Comparison triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {t.comparison.map(c => (
          <div
            key={c.sign}
            className={`rounded-lg p-4 space-y-2 ${
              c.isCurrent
                ? 'border border-primary/20 bg-primary/5'
                : 'border border-border/50 bg-card/50'
            }`}
          >
            <h4 className="font-semibold text-sm">
              {c.glyph} {c.title}
            </h4>
            <p className="text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
        <p className="text-sm font-medium italic">{t.closingLine}</p>
      </div>
    </div>
  );
}

function AxisTeachingContent({ sign }: { sign: ZodiacSign }) {
  const a = buildAxisTeaching(sign);
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground italic">
        Full Moons on this axis ask you to reconcile {a.left.title.split(': ')[1]} with {a.right.title.split(': ')[1]}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <h4 className="font-semibold text-sm">{a.leftGlyph} {a.left.title}</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {a.left.bullets.map(b => <li key={b}>{b}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-3">
          <h4 className="font-semibold text-sm">{a.rightGlyph} {a.right.title}</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            {a.right.bullets.map(b => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 px-5 py-4 space-y-2">
        <h4 className="font-semibold text-sm">🔗 The Integration Question</h4>
        <p className="text-sm text-muted-foreground">{a.integrationQuestion}</p>
      </div>

      <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
        <p className="text-sm font-medium italic">{a.closingLine}</p>
      </div>
    </div>
  );
}

export function EclipseInterpretationLayer({ selectedSign }: Props) {
  const [openModules, setOpenModules] = useState<string[]>([]);

  const sign = selectedSign || 'Virgo';

  const toggle = (key: string) => {
    setOpenModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const dynamicModules = [
    { key: 'sign-teaching', icon: getSignGlyph(sign), title: `${sign}: ${buildSignTeaching(sign).info.modality} ${buildSignTeaching(sign).info.element} (How It Works)` },
    { key: 'axis-teaching', icon: `${getSignGlyph(sign)}${getSignGlyph(buildSignTeaching(sign).info.opposite)}`, title: `${sign} ↔ ${buildSignTeaching(sign).info.opposite}: The Axis` },
  ];

  const allModules = [
    STATIC_MODULES[0], // nodes
    dynamicModules[0], // sign teaching
    dynamicModules[1], // axis teaching
    ...STATIC_MODULES.slice(1), // houses, natal, cycles
  ];

  const renderContent = (key: string) => {
    if (key === 'nodes') return <NodalDirectionContent />;
    if (key === 'sign-teaching') return <SignTeachingContent sign={sign} />;
    if (key === 'axis-teaching') return <AxisTeachingContent sign={sign} />;
    return <p className="italic text-muted-foreground">Content coming soon…</p>;
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="text-xl font-serif">
          🌒 How to Read Eclipses in Your Chart
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A deeper framework for interpreting eclipse cycles personally — expand each module to learn more.
          {selectedSign && (
            <span className="ml-1 font-medium text-foreground">Currently viewing: {getSignGlyph(sign)} {sign}</span>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {allModules.map(mod => (
          <Collapsible
            key={mod.key}
            open={openModules.includes(mod.key)}
            onOpenChange={() => toggle(mod.key)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="text-xl">{mod.icon}</span>
                <span className="font-medium text-sm">{mod.title}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  openModules.includes(mod.key) ? 'rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3">
              {renderContent(mod.key)}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
