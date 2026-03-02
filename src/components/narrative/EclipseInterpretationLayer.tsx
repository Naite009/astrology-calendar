import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const MODULES = [
  { key: 'nodes', icon: '☊', title: 'Nodal Direction — North vs. South' },
  { key: 'mechanics', icon: '⚙️', title: 'Eclipse Mechanics & Astronomy' },
  { key: 'types', icon: '🌑', title: 'Solar vs. Lunar Eclipse Psychology' },
  { key: 'houses', icon: '🏛', title: 'Eclipse Through the Houses' },
  { key: 'natal', icon: '🎯', title: 'Natal Planet Activations' },
  { key: 'cycles', icon: '🔄', title: 'Saros Cycles & Long-Range Patterns' },
];

function NodalDirectionContent() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* North Node */}
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

        {/* South Node */}
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

export function EclipseInterpretationLayer() {
  const [openModules, setOpenModules] = useState<string[]>([]);

  const toggle = (key: string) => {
    setOpenModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderContent = (key: string) => {
    if (key === 'nodes') return <NodalDirectionContent />;
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
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {MODULES.map(mod => (
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
