import { useState } from 'react';
import { PowerPortrait, PowerSection, PowerLeak } from '@/lib/solarReturnPowerPortrait';
import {
  Flame, Zap, Battery, Compass, ChevronDown, ChevronUp,
  AlertTriangle, Shield, Sparkles,
} from 'lucide-react';

interface Props {
  portrait: PowerPortrait;
}

const SECTION_ICONS = {
  'Where Your Drive Comes From': Flame,
  'How You Sustain Effort': Zap,
  'Your Burnout Pattern': Battery,
  'What Brings You Back to Center': Compass,
};

const SectionCard = ({ section, defaultOpen }: { section: PowerSection; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen || false);
  const Icon = SECTION_ICONS[section.title as keyof typeof SECTION_ICONS] || Sparkles;

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{section.emoji}</span>
        <span className="text-sm font-medium text-foreground">{section.title}</span>
      </div>

      <p className="text-[12px] text-foreground leading-relaxed">{section.summary}</p>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {open ? 'Hide' : 'Show'} what drives this
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 border-t border-border pt-2">
          {section.sources.map((s, i) => (
            <div key={i} className="flex gap-2 text-[11px]">
              <div className="flex-shrink-0 w-20 text-right">
                <span className="font-medium text-foreground">{s.planet}</span>
                {s.sign && (
                  <span className="block text-[9px] text-muted-foreground">{s.sign}{s.house ? ` / H${s.house}` : ''}</span>
                )}
              </div>
              <div className="flex-1 text-muted-foreground">{s.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LeakCard = ({ leak }: { leak: PowerLeak }) => (
  <div className="p-3 bg-destructive/5 rounded-sm space-y-1">
    <div className="flex items-center gap-1.5">
      <AlertTriangle size={11} className="text-destructive" />
      <span className="text-[11px] font-medium text-destructive">{leak.pattern}</span>
    </div>
    <p className="text-[11px] text-muted-foreground">{leak.trigger}</p>
    <div className="flex items-center gap-1.5 mt-1">
      <Shield size={10} className="text-primary" />
      <p className="text-[11px] text-primary">{leak.antidote}</p>
    </div>
  </div>
);

export const PowerPortraitCard = ({ portrait }: Props) => {
  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Your Power Portrait</div>
        <p className="text-[11px] text-muted-foreground">
          Where your drive comes from, how you sustain it, what burns you out, and what brings you back.
          This is your energy operating manual for the year.
        </p>
      </div>

      {/* Mantra */}
      <div className="px-5 py-3 bg-primary/5 border-b border-border">
        <p className="text-[12px] font-serif italic text-primary text-center">
          "{portrait.oneLineMantra}"
        </p>
      </div>

      {/* Four sections */}
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 divide-border">
        <SectionCard section={portrait.driveEngine} defaultOpen />
        <SectionCard section={portrait.sustainStyle} />
        <SectionCard section={portrait.burnoutPattern} />
        <SectionCard section={portrait.realignmentTool} />
      </div>

      {/* Power Leaks */}
      {portrait.powerLeaks.length > 0 && (
        <div className="p-4 border-t border-border space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-destructive font-medium mb-2">
            Power Leaks This Year
          </div>
          <div className="space-y-2">
            {portrait.powerLeaks.map((leak, i) => (
              <LeakCard key={i} leak={leak} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
