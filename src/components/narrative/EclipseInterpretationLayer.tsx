import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const MODULES = [
  { key: 'mechanics', icon: '⚙️', title: 'Eclipse Mechanics & Astronomy' },
  { key: 'nodes', icon: '☊', title: 'Nodal Axis & Karmic Direction' },
  { key: 'types', icon: '🌑', title: 'Solar vs. Lunar Eclipse Psychology' },
  { key: 'houses', icon: '🏛', title: 'Eclipse Through the Houses' },
  { key: 'natal', icon: '🎯', title: 'Natal Planet Activations' },
  { key: 'cycles', icon: '🔄', title: 'Saros Cycles & Long-Range Patterns' },
];

export function EclipseInterpretationLayer() {
  const [openModules, setOpenModules] = useState<string[]>([]);

  const toggle = (key: string) => {
    setOpenModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
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
            <CollapsibleContent className="px-4 py-3 text-sm text-muted-foreground">
              <p className="italic">Content coming soon…</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
