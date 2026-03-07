import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ZODIAC_SIGNS_DATA, ELEMENT_COLORS, ZodiacSignData } from '@/lib/zodiacSignEncyclopedia';
import { buildSignTeaching, type ZodiacSign } from '@/lib/astrology/signTeacher';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getArchetypesForSign, PHASE_CHAPTER_TITLES } from '@/data/moonPhaseSignArchetypes';
import { getForrestMoonSign } from '@/data/moonForrestData';

const PHASE_EMOJIS: Record<string, string> = {
  'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓',
  'Waxing Gibbous': '🌔', 'Full Moon': '🌕', 'Waning Gibbous': '🌖',
  'Last Quarter': '🌗', 'Balsamic': '🌘',
};

function KalderaSignSection({ signName }: { signName: string }) {
  const [open, setOpen] = useState(false);
  const archetypes = getArchetypesForSign(signName);
  if (archetypes.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full pt-2 border-t border-border">
        <span>☽ Moon Phase Archetypes for {signName}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="text-[10px] text-muted-foreground mt-1 mb-2">
          Eight unique Moon archetypes — one for each phase when the Moon is in {signName}.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {archetypes.map(({ phase, archetype }) => (
            <div key={phase} className="p-2.5 rounded-lg border border-border bg-muted/30 hover:border-muted-foreground/30 transition-colors">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">{PHASE_EMOJIS[phase] || '🌙'}</span>
                <span className="text-xs font-semibold text-foreground">{archetype.name}</span>
                <span className="text-[10px] text-muted-foreground">· {PHASE_CHAPTER_TITLES[phase] || phase}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{archetype.essence}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 italic">— Raven Kaldera, Moon Phase Astrology</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ForrestMoonSignSection({ signName }: { signName: string }) {
  const data = getForrestMoonSign(signName);
  if (!data) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <h4 className="text-xs font-medium flex items-center gap-1.5">☽ Moon in {signName} <span className="text-muted-foreground font-normal">— Evolutionary Astrology</span></h4>
      <div className="p-3 rounded-lg bg-secondary/50 border border-secondary space-y-1.5 text-xs">
        <div><span className="text-muted-foreground">Evolutionary Goal:</span> <span className="text-foreground">{data.evolutionaryGoal}</span></div>
        <div><span className="text-muted-foreground">Mood:</span> <span className="text-foreground">{data.mood}</span></div>
        <div><span className="text-muted-foreground">Reigning Need:</span> <span className="text-foreground">{data.reigningNeed}</span></div>
        <div><span className="text-muted-foreground">Secret of Happiness:</span> <span className="text-foreground">{data.secretOfHappiness}</span></div>
        <div><span className="text-muted-foreground">Shadow:</span> <span className="text-foreground">{data.shadow}</span></div>
      </div>
      <p className="text-[10px] text-muted-foreground italic">— Steven Forrest, The Book of the Moon</p>
    </div>
  );
}

function SignTeachingSection({ signName }: { signName: string }) {
  const teaching = buildSignTeaching(signName as ZodiacSign);
  if (!teaching) return null;

  const { elementCard, modalityCard, comparison, closingLine, signProfile } = teaching;

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <h4 className="text-sm font-semibold flex items-center gap-2">🔬 How {signName} Works</h4>

      {/* Element teaching */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs font-semibold mb-1">{elementCard.icon} {elementCard.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{elementCard.body}</p>
      </div>

      {/* Modality teaching */}
      <div className="p-3 rounded-lg bg-accent/50 border border-accent">
        <p className="text-xs font-semibold mb-1">⚙ {modalityCard.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{modalityCard.body}</p>
      </div>

      {/* Element triad comparison */}
      <div>
        <p className="text-xs font-medium mb-2">The {teaching.info.element} Triad — Same Element, Different Jobs</p>
        <div className="grid grid-cols-1 gap-2">
          {comparison.map((c) => (
            <div
              key={c.sign}
              className={`p-3 rounded-lg border text-xs ${c.isCurrent ? 'bg-primary/10 border-primary/30 font-medium' : 'bg-muted/30 border-border'}`}
            >
              <span className="font-semibold">{c.glyph} {c.title}</span>
              <p className="text-muted-foreground mt-0.5">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">{closingLine}</p>
      </div>

      {/* Sign profile — core question, superpower, shadow */}
      {signProfile && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-secondary">
            <p className="text-[10px] font-medium text-muted-foreground mb-1">🎯 CORE QUESTION</p>
            <p className="text-xs italic leading-relaxed">{signProfile.coreQuestion}</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">⚡ DEEP SUPERPOWER</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{signProfile.superpower}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">🌑 DEEP SHADOW</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{signProfile.shadow}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SignDetailModal({ sign, open, onClose }: { sign: ZodiacSignData | null; open: boolean; onClose: () => void }) {
  if (!sign) return null;
  const ec = ELEMENT_COLORS[sign.element];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-3xl">{sign.symbol}</span>
            <span>{sign.name}</span>
            <span className="text-sm text-muted-foreground font-normal">({sign.animal})</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-5">
            {/* Quick badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ec.badge}`}>
                {sign.element}
              </span>
              <Badge variant="outline">{sign.modality}</Badge>
              <Badge variant="outline">{sign.polarity} · {sign.polarityLabels.join(' / ')}</Badge>
              <Badge variant="outline">{sign.planetSymbol} {sign.rulingPlanet}</Badge>
            </div>

            {/* Mantra */}
            <div className="text-center py-3">
              <p className="text-lg font-serif italic text-primary">"{sign.mantra}"</p>
            </div>

            {/* Mnemonic */}
            <div className={`p-4 rounded-lg border ${ec.border} ${ec.bg}`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">🧠 Memory Device</p>
              <p className="text-sm font-medium">{sign.mnemonic}</p>
            </div>

            {/* Affirmation & Shadow */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ AFFIRMATION</p>
                <p className="text-xs">{sign.affirmation}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ SHADOW MINDSET</p>
                <p className="text-xs">{sign.shadowMindset}</p>
              </div>
            </div>

            {/* Keywords — High Road & Low Road */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Keywords</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2">✦ HIGH ROAD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(sign.highRoadKeywords || []).map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{kw}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2">⚠ LOW ROAD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(sign.lowRoadKeywords || []).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-destructive/30">{kw}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Essence */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Essence</h4>
              {sign.essence.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>

            {/* Sign Teaching — element/modality/triad/profile */}
            <SignTeachingSection signName={sign.name} />

            {/* Body region */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium mb-1">🫀 Body Region</p>
              <p className="text-sm">{sign.bodyRegion}</p>
            </div>

            {/* Needs */}
            <div>
              <p className="text-xs font-medium mb-2">Core Needs</p>
              <div className="flex flex-wrap gap-1.5">
                {sign.needs.map((n, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{n}</Badge>
                ))}
              </div>
            </div>

            {/* Creative Expression */}
            <div>
              <p className="text-xs font-medium mb-1">🎨 Creative Expression</p>
              <p className="text-sm text-muted-foreground">{sign.creativeExpression}</p>
            </div>

            {/* Superpower & Areas to work on */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">⚡ SUPERPOWER</p>
                <p className="text-xs">{sign.superpower}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">🌱 AREAS TO GROW</p>
                <ul className="text-xs space-y-0.5">
                  {sign.areasToWorkOn.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function ZodiacSignExplorer() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSignData | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <span>✦</span> Zodiac Sign Encyclopedia
      </h3>
      <p className="text-xs text-muted-foreground">Click any sign to explore its full profile — essence, body, shadow, and memory device.</p>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {ZODIAC_SIGNS_DATA.map(sign => {
          const ec = ELEMENT_COLORS[sign.element];
          return (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign)}
              className={`p-3 rounded-lg border ${ec.border} ${ec.bg} hover:shadow-md transition-all text-center cursor-pointer group`}
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">{sign.symbol}</span>
              <span className="text-xs font-medium block mt-1">{sign.name}</span>
              <span className={`text-[10px] block ${ec.text}`}>{sign.element}</span>
              <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                {sign.keywords.slice(0, 2).map((kw, i) => (
                  <span key={i} className="text-[8px] text-muted-foreground">{kw}{i === 0 ? ' ·' : ''}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <SignDetailModal
        sign={selectedSign}
        open={!!selectedSign}
        onClose={() => setSelectedSign(null)}
      />
    </div>
  );
}
