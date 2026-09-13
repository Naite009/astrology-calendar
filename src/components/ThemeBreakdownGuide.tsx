/**
 * ThemeBreakdownGuide - teaching component for the symbolic-contact section.
 *
 * Rewritten so it teaches WHAT WAS FOUND rather than an internal scoring scheme.
 * It no longer shows a total score, points per aspect, percentage shares or a
 * "past life probability", because those weights are arbitrary internal constants
 * rather than an astrological standard. Each group leads with a neutral technical
 * category, lists the exact contacts with orbs and whose planet is whose, and
 * keeps any spiritual reading clearly marked as optional.
 */

import { useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { KarmicAnalysis, KarmicIndicator } from '@/lib/karmicAnalysis';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { SYMBOLIC_LENS_NOTE } from '@/lib/relationship/symbolicFraming';
import {
  buildKarmicSummary,
  formatKarmicOrb,
  karmicContactLine,
} from '@/lib/relationship/karmicSummary';

interface ThemeBreakdownGuideProps {
  chart1: NatalChart;
  chart2: NatalChart;
  karmicAnalysis: KarmicAnalysis;
}

const GROUPS: { label: string; types: KarmicIndicator['type'][]; whatItIs: string }[] = [
  {
    label: 'Node contacts (North/South Node axis)',
    types: ['north_node', 'south_node'],
    whatItIs:
      'One person\u2019s nodal axis contacting the other\u2019s planet. The two nodes are always opposite each other, so a contact to one is a contact to the axis, counted once.',
  },
  {
    label: 'Saturn contacts',
    types: ['saturn'],
    whatItIs:
      'Saturn contacting a personal planet or angle. Read as seriousness, structure, responsibility, patience and commitment.',
  },
  {
    label: 'Pluto contacts',
    types: ['pluto'],
    whatItIs:
      'Pluto contacting a personal planet or angle. Read first as depth and investment, and only then as a growth edge if the aspect is tense.',
  },
  {
    label: 'Chiron contacts',
    types: ['chiron'],
    whatItIs:
      'Chiron contacting a personal planet or angle. Read as sensitivity and understanding. It never says a specific hurt happened.',
  },
  {
    label: 'House overlays (8th and 12th)',
    types: ['eighth_house', 'twelfth_house'],
    whatItIs:
      'One person\u2019s planet falling in the private (12th) or trust-and-depth (8th) part of the other\u2019s chart, using the same house engine as the rest of the app.',
  },
  {
    label: 'Vertex contacts',
    types: ['vertex'],
    whatItIs:
      'A tight conjunction to the Vertex. Some astrologers read it as a point of notable encounters; it stays secondary to the planets and angles.',
  },
];

export function ThemeBreakdownGuide({ chart1, chart2, karmicAnalysis }: ThemeBreakdownGuideProps) {
  const [open, setOpen] = useState(false);
  const summary = buildKarmicSummary(karmicAnalysis, null, chart1.name, chart2.name);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border bg-secondary/30">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-primary" />
          <h4 className="font-medium">How this section was put together</h4>
        </div>
        <p className="text-sm text-muted-foreground">{summary.bigPicture}</p>
        <p className="text-xs text-muted-foreground mt-2">{summary.countsNote}</p>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg border bg-card text-sm font-medium">
          <span>See every contact this section found</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          {GROUPS.map((group) => {
            const found = karmicAnalysis.indicators.filter((i) => group.types.includes(i.type));
            if (found.length === 0) return null;
            return (
              <div key={group.label} className="p-4 rounded-lg border bg-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{group.label}</span>
                  <Badge variant="secondary">
                    {found.length} {found.length === 1 ? 'contact' : 'contacts'} found
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{group.whatItIs}</p>
                <ul className="mt-3 space-y-2 border-t pt-3">
                  {found.map((ind, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">
                        {karmicContactLine(ind, chart1.name, chart2.name)}
                      </span>{' '}
                      <span className="text-muted-foreground">({formatKarmicOrb(ind.orb)})</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        {ind.interpretation}
                      </span>
                      {ind.signVsDegreeNote && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {ind.signVsDegreeNote}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="p-4 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-1">
            <p>
              Contacts are ordered by how tight they are and by how much weight the planets involved
              carry, so a wide South Node or Vertex contact never outranks a close contact to a
              personal planet. No score, points value or percentage is produced from them.
            </p>
            <p>{SYMBOLIC_LENS_NOTE}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ThemeBreakdownGuide;
