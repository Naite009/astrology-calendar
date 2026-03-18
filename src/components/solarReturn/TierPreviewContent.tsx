import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

type TierId = 't1' | 't2' | 't3' | 't4' | 't5';

interface Props {
  tier: TierId;
  analysis: SolarReturnAnalysis;
}

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const FormatBlock = ({ lines }: { lines: string[] }) => (
  <div className="mt-4 pt-3 border-t border-border">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Format</div>
    {lines.map((line, i) => (
      <div key={i} className="text-xs text-muted-foreground">{line}</div>
    ))}
  </div>
);

const Badge = ({ label, color }: { label: string; color: 'green' | 'amber' | 'rose' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {label}
    </span>
  );
};

export const TierPreviewContent = ({ tier, analysis }: Props) => {
  switch (tier) {
    case 't1':
      return (
        <div className="space-y-3">
          <div className="text-xs font-medium text-foreground mb-1">What's Included</div>
          <BulletList items={[
            'SR Ascendant — your year\'s opening tone',
            'SR Sun house — where life energy goes',
            'SR Moon sign — emotional weather all year',
            'Profection year — which life area is activated',
            'One dominant theme card (plain language)',
            '3 power words for the year',
          ]} />
          <FormatBlock lines={[
            '1–2 page PDF, cover + snapshot card',
            'No jargon, no house numbers',
          ]} />
          <Badge label="No AI narrative" color="green" />
          <div className="text-[11px] text-muted-foreground italic mt-1">
            Works as a free teaser / birthday gift preview
          </div>
        </div>
      );

    case 't2':
      return (
        <div className="space-y-3">
          <div className="text-xs font-medium text-foreground mb-1">Everything in Tier 1, plus</div>
          <BulletList items={[
            'Big Three activation (Sun, Moon, Rising in SR context)',
            'SR Moon deep dive — phase, angularity, VOC',
            'Profection + Time Lord explained in plain language',
            'SR vs Natal comparison table',
            'Top 3 SR-to-natal aspects (How it feels / What it means)',
            'Element + modality balance snapshot',
            'Saturn focus — where discipline is called',
            'North Node growth direction',
            'Monthly overview (12-month grid)',
          ]} />
          <FormatBlock lines={[
            '8–12 page PDF',
          ]} />
          <Badge label="AI summary narrative" color="amber" />
          <div className="text-[11px] text-muted-foreground italic mt-1">
            Clean, complete — not overwhelming
          </div>
        </div>
      );

    case 't3':
      return (
        <div className="space-y-3">
          <div className="text-xs font-medium text-foreground mb-1">Everything in Tier 2, plus</div>
          <BulletList items={[
            'Stelliums — power zone analysis',
            'All SR-to-natal aspects (full set)',
            'Planet-by-planet spotlight (Mercury–Pluto)',
            'Hemispheric emphasis + angular planets',
            'Vertex — fated encounters',
            'Moon sign shift narrative',
            'Metonic cycle echoes',
            'Lord of the Year full breakdown',
            'Key dates (Time Lord transits)',
            'Profection wheel visual',
          ]} />
          <FormatBlock lines={[
            '20–25 page PDF',
          ]} />
          <Badge label="AI full year-ahead narrative" color="amber" />
          <div className="text-[11px] text-muted-foreground italic mt-1">
            This is your current build (trimmed slightly)
          </div>
        </div>
      );

    case 't4':
      return (
        <div className="space-y-3">
          <div className="text-xs font-medium text-foreground mb-1">Everything in Tier 3, plus</div>
          <BulletList items={[
            'Planet dignity full report — domicile, exaltation, detriment, fall',
            'Mutual receptions in SR chart',
            'SR ruler technique (Asc ruler\'s natal house = where year plays out)',
            'Degree conduits — SR planets landing on natal degree positions',
            'SR internal aspects (aspects within SR chart only)',
            'Health astrology overlay — natal vulnerability + SR pressure points',
            'Eclipse sensitivity check — SR planets near eclipse degrees',
            'Retrograde analysis — all Rx planets + shadow periods',
            'Repeated themes synthesis card (cross-technique patterns)',
            'Quarterly focus breakdown (not just monthly)',
          ]} />
          <FormatBlock lines={[
            '25–35 page PDF',
          ]} />
          <Badge label="AI + structured synthesis prompt" color="rose" />
        </div>
      );

    case 't5':
      return (
        <div className="space-y-3">
          <div className="text-xs font-medium text-foreground mb-1">Everything in Tier 4, plus</div>
          <BulletList items={[
            'Saros cycle context — eclipse family history for natal eclipse',
            'Fixed star conjunctions in SR chart (Algol, Spica, Regulus, etc.)',
            'Arabic Parts / Lots — Part of Fortune, Spirit, Eros, Necessity in SR',
            'Firdaria (Persian time-lord system) — main + sub-lord for the year',
            'SR relocated vs natal location comparison (if different)',
            'Antiscia + contra-antiscia (mirror degree contacts)',
            'Solar arc directions in force during SR year',
            'Relationship + money year synthesis (Venus + 7H + 2H focus)',
            'Career + purpose synthesis (10H + MC + SR ruler of 10H)',
            'Spiritual + soul growth synthesis (12H + Neptune + nodes)',
            'A "what a master sees" summary — patterns across all techniques',
          ]} />
          <FormatBlock lines={[
            'Coming in next release',
          ]} />
          <Badge label="AI master narrative" color="rose" />
        </div>
      );
  }
};
