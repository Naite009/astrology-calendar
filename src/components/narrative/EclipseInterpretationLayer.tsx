import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Lock, Copy, Check, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { buildSignTeaching, buildAxisTeaching, getSignGlyph, type ZodiacSign } from '@/lib/astrology/signTeacher';
import { getEclipseAspectHits, type NatalPoint, type NatalPointKey } from '@/lib/astrology/eclipseAspects';
import { signDegreesToLongitude, getHouseForLongitude, HOUSE_MEANINGS } from '@/lib/houseCalculations';
import type { EclipseEvent } from './EclipseEncyclopediaExplorer';
import { nodalEducation } from './EclipseEncyclopediaExplorer';
import type { NatalChart } from '@/hooks/useNatalChart';

interface Props {
  selectedEclipse: EclipseEvent | null;
  userNatalChart?: NatalChart | null;
  onBackToTimeline?: () => void;
  currentList?: EclipseEvent[];
  onSelectEclipse?: (e: EclipseEvent) => void;
}

const STATIC_MODULES = [
  { key: 'nodes', icon: '☊', title: 'Nodal Direction — North vs. South' },
  { key: 'houses', icon: '🏛', title: 'Your Life Area Activated (Houses)' },
  { key: 'natal', icon: '🎯', title: 'Natal Planet Activations' },
  { key: 'takeaway', icon: '🧭', title: 'What To Do With This Eclipse' },
  { key: 'cycles', icon: '🔄', title: 'Saros Cycles & Long-Range Patterns' },
];

function NodalDirectionContent({ nodal, eclipse }: { nodal: 'north' | 'south'; eclipse?: EclipseEvent | null }) {
  const edu = nodalEducation[nodal];

  return (
    <div className="space-y-5">
      {/* Eclipse-specific nodal theme */}
      {eclipse?.nodalTheme && (
        <div className={`rounded-lg px-4 py-3 border ${nodal === 'north' ? 'border-primary/20 bg-primary/5' : 'border-accent/20 bg-accent/5'}`}>
          <p className="text-sm font-medium">{eclipse.nodalTheme}</p>
        </div>
      )}

      {/* Rich nodal education */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
        <h4 className="font-semibold text-sm">{edu.emoji} {edu.headline}</h4>
        <p className="text-sm text-muted-foreground">{edu.shortMeaning}</p>
        <p className="text-sm text-muted-foreground">{edu.deeperMeaning}</p>
      </div>

      {/* How it feels */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
        <h4 className="font-semibold text-sm">How This Typically Feels</h4>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
          {edu.howItFeels.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      {/* Releasing & Building themes from eclipse data */}
      {(eclipse?.releasingThemes?.length || eclipse?.buildingThemes?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eclipse.releasingThemes && eclipse.releasingThemes.length > 0 && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
              <h4 className="font-semibold text-sm">☋ Releasing</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
                {eclipse.releasingThemes.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {eclipse.buildingThemes && eclipse.buildingThemes.length > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h4 className="font-semibold text-sm">☊ Building Toward</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
                {eclipse.buildingThemes.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Guidance */}
      <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center space-y-1">
        <p className="text-sm font-medium italic text-muted-foreground">
          "{edu.guidance}"
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
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
        <h4 className="font-semibold text-sm">{t.elementCard.icon} {t.elementCard.title}</h4>
        <p className="text-sm text-muted-foreground">{t.elementCard.body}</p>
      </div>
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
        <h4 className="font-semibold text-sm">🔄 {t.modalityCard.title}</h4>
        <p className="text-sm text-muted-foreground">{t.modalityCard.body}</p>
      </div>
      {/* Sign profile extras */}
      {t.signProfile && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Core Question</p>
              <p className="text-sm text-muted-foreground italic">{t.signProfile.coreQuestion}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Superpower</p>
              <p className="text-sm text-muted-foreground">{t.signProfile.superpower}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Shadow</p>
              <p className="text-sm text-muted-foreground">{t.signProfile.shadow}</p>
            </div>
          </div>
        </div>
      )}
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

function extractNatalPoints(chart: NatalChart): NatalPoint[] {
  const points: NatalPoint[] = [];
  const PLANET_KEYS: { chartKey: string; pointKey: NatalPointKey }[] = [
    { chartKey: 'Sun', pointKey: 'Sun' },
    { chartKey: 'Moon', pointKey: 'Moon' },
    { chartKey: 'Mercury', pointKey: 'Mercury' },
    { chartKey: 'Venus', pointKey: 'Venus' },
    { chartKey: 'Mars', pointKey: 'Mars' },
    { chartKey: 'Jupiter', pointKey: 'Jupiter' },
    { chartKey: 'Saturn', pointKey: 'Saturn' },
    { chartKey: 'Uranus', pointKey: 'Uranus' },
    { chartKey: 'Neptune', pointKey: 'Neptune' },
    { chartKey: 'Pluto', pointKey: 'Pluto' },
    { chartKey: 'Chiron', pointKey: 'Chiron' },
    { chartKey: 'NorthNode', pointKey: 'NorthNode' },
    { chartKey: 'SouthNode', pointKey: 'SouthNode' },
    { chartKey: 'Ascendant', pointKey: 'ASC' },
  ];

  for (const { chartKey, pointKey } of PLANET_KEYS) {
    const p = chart.planets[chartKey as keyof typeof chart.planets];
    if (p?.sign && typeof p.degree === 'number') {
      points.push({ key: pointKey, sign: p.sign as ZodiacSign, degree: p.degree, minutes: p.minutes ?? 0 });
    }
  }

  const mc = chart.houseCusps?.house10;
  if (mc?.sign && typeof mc.degree === 'number') {
    points.push({ key: 'MC', sign: mc.sign as ZodiacSign, degree: mc.degree, minutes: mc.minutes ?? 0 });
  }

  return points;
}

export { extractNatalPoints };

function NatalAspectContent({ eclipse, chart }: { eclipse: EclipseEvent | null; chart: NatalChart | null }) {
  const hits = useMemo(() => {
    if (!eclipse || !chart) return [];
    const natalPoints = extractNatalPoints(chart);
    return getEclipseAspectHits(eclipse, natalPoints, 3);
  }, [eclipse, chart]);

  if (!chart || !chart.planets || Object.keys(chart.planets).length < 3) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-5">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Add a birth chart with birth time to see eclipse-to-natal activations.
        </p>
      </div>
    );
  }

  if (!eclipse) {
    return <p className="text-sm text-muted-foreground italic">Select an eclipse to see natal aspects.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground italic">
        Eclipses speak loudest when they contact your natal planets, angles, or nodes.
      </p>

      {hits.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            <strong>No tight hits within orb.</strong> The house and axis story matters most for this eclipse — look at which house it lands in and what life areas it activates.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {hits.map((hit, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Badge variant="outline" className="text-sm font-mono">{hit.glyph}</Badge>
                  <span className="text-sm font-semibold">{hit.point}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">{hit.aspect}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">orb {hit.orbLabel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{hit.interpretation}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground text-center italic">
            Aspect Audit: {hits.map(h => `${h.glyph} (${h.orbLabel})`).join(' · ')}
          </p>
        </>
      )}

      {/* Pre-written transit aspects from eclipse data */}
      {eclipse.aspects && eclipse.aspects.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transit Context</p>
          {eclipse.aspects.map((asp, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">{asp.planet} {asp.type} ({asp.sign})</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{asp.meaning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function HouseActivationContent({ eclipse, chart }: { eclipse: EclipseEvent | null; chart: NatalChart | null }) {
  const { hitHouse, oppHouse } = useMemo(() => {
    if (!eclipse || !chart?.houseCusps) return { hitHouse: null, oppHouse: null };
    const lon = signDegreesToLongitude(eclipse.sign, eclipse.degree, eclipse.minutes);
    const h = getHouseForLongitude(lon, chart);
    if (!h) return { hitHouse: null, oppHouse: null };
    const opp = h <= 6 ? h + 6 : h - 6;
    return { hitHouse: h, oppHouse: opp };
  }, [eclipse, chart]);

  if (!chart || !chart.houseCusps) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-5">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Birth time is required to calculate houses.
        </p>
      </div>
    );
  }

  if (!eclipse || !hitHouse || !oppHouse) {
    return <p className="text-sm text-muted-foreground italic">Select an eclipse to see house activation.</p>;
  }

  const hitInfo = HOUSE_MEANINGS[hitHouse];
  const oppInfo = HOUSE_MEANINGS[oppHouse];
  const isLunar = eclipse.type === 'lunar';
  const isNorth = eclipse.nodal === 'north';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground italic">
        Eclipses activate a house — and simultaneously stir its opposite.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">🏛 Activated House: {ordinal(hitHouse)}</h4>
          <p className="text-xs text-muted-foreground font-medium">{hitInfo.keywords}</p>
          <p className="text-sm text-muted-foreground">{hitInfo.lifeArea}</p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">↔ Opposite House Stirred: {ordinal(oppHouse)}</h4>
          <p className="text-xs text-muted-foreground font-medium">{oppInfo.keywords}</p>
          <p className="text-sm text-muted-foreground">{oppInfo.lifeArea}</p>
        </div>
      </div>
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
        <h4 className="font-semibold text-sm">🔮 What This Usually Looks Like</h4>
        <p className="text-sm text-muted-foreground">
          {isLunar
            ? `This lunar eclipse brings visibility and emotional culmination to your ${ordinal(hitHouse)}-house themes — ${hitInfo.lifeArea}.`
            : `This solar eclipse begins a new chapter in your ${ordinal(hitHouse)}-house themes — ${hitInfo.lifeArea}.`}
          {' '}At the same time, it rebalances the {hitHouse}–{oppHouse} axis, so the story also touches {oppInfo.lifeArea.toLowerCase()}.
        </p>
        <p className="text-sm text-muted-foreground">
          {isNorth
            ? 'North Node emphasis: lean into growth here — choose the unfamiliar but life-expanding option.'
            : 'South Node emphasis: simplify and release — let an outdated system or obligation complete.'}
        </p>
      </div>
      <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-center">
        <p className="text-sm font-medium italic">
          {isNorth
            ? `Ask: "What's the next level for me in my ${ordinal(hitHouse)} house?"`
            : `Ask: "What's done in my ${ordinal(hitHouse)} house — even if it's been 'normal'?"`}
        </p>
      </div>
    </div>
  );
}

const POINT_THEMES: Partial<Record<NatalPointKey, string>> = {
  Sun: 'identity, vitality, and life direction',
  Moon: 'emotional needs, habits, and inner security',
  Mercury: 'communication, thinking patterns, and daily decisions',
  Venus: 'values, relationships, and money choices',
  Mars: 'energy, boundaries, and conflict style',
  Jupiter: 'growth, beliefs, and opportunity areas',
  Saturn: 'responsibility, structure, and long-term commitments',
  Uranus: 'freedom, innovation, and sudden shifts',
  Neptune: 'intuition, ideals, and where clarity is needed',
  Pluto: 'power dynamics, transformation, and what must change',
  ASC: 'identity, self-image, and how others perceive you',
  MC: 'career, public role, and life direction',
  NorthNode: 'destiny direction and growth edge',
  SouthNode: 'past patterns and what to release',
  Chiron: 'healing journey and core vulnerability',
};

function generateTakeaway(eclipse: EclipseEvent, modality: string, hitHouse: number | null, topHit: { point: NatalPointKey } | null) {
  const isSolar = eclipse.type === 'solar';
  const isNorth = eclipse.nodal === 'north';

  const doItems: string[] = [];
  const watchItems: string[] = [];

  if (isSolar && isNorth) doItems.push('Start small but real — make the first move in the activated house themes.');
  if (isSolar && !isNorth) doItems.push('Clear space first — remove one obligation or system that blocks momentum.');
  if (!isSolar && isNorth) doItems.push("Name what you're ready to grow into, even if you don't feel \"ready.\"");
  if (!isSolar && !isNorth) doItems.push('Close a loop — finish, release, or step away from what\'s complete.');

  if (isNorth) doItems.push('Lean in — experiment, say yes to the stretch.');
  else doItems.push('Cut clutter — end loops, stop feeding drains.');

  if (modality === 'Cardinal') doItems.push('Initiate — decide, set a clear direction.');
  if (modality === 'Fixed') doItems.push('Stabilize — protect what matters, make it sustainable.');
  if (modality === 'Mutable') doItems.push('Adjust — audit your method, change what isn\'t working.');

  if (topHit) {
    const theme = POINT_THEMES[topHit.point] || topHit.point;
    doItems.push(`Because this eclipse aspects your ${topHit.point}, prioritize ${theme}.`);
  }

  if (isSolar) watchItems.push('New openings that arrive indirectly — through other people, timing shifts, or sudden invitations.');
  else watchItems.push('A truth surfacing that changes how you feel about a situation.');

  if (modality === 'Cardinal') watchItems.push('Pressure to decide quickly — pause before committing.');
  if (modality === 'Fixed') watchItems.push('Stubbornness or sunk-cost thinking — resistance to necessary change.');
  if (modality === 'Mutable') watchItems.push('Over-optimizing, constant tweaking, nervous overthinking.');

  if (isNorth) watchItems.push('Growth disguised as discomfort — the stretch is the signal.');
  else watchItems.push('Relief after letting go — the lightness confirms the release was right.');

  const journal = isNorth
    ? `What is calling me forward in ${hitHouse ? `my ${ordinal(hitHouse)} house` : 'this life area'} — and what would "brave participation" look like?`
    : `What has run its course in ${hitHouse ? `my ${ordinal(hitHouse)} house` : 'this life area'} — even if it's been normal for years?`;

  const caution = isSolar
    ? 'Avoid making irreversible commitments on eclipse day — observe first, then choose.'
    : "Avoid emotional ultimatums on eclipse day — let the storyline reveal itself over a few days.";

  return { doItems, watchItems, journal, caution };
}

function TakeawayContent({ eclipse, chart }: { eclipse: EclipseEvent | null; chart: NatalChart | null }) {
  const [copied, setCopied] = useState(false);

  const modality = eclipse ? buildSignTeaching(eclipse.sign).info.modality : 'Cardinal';

  const hitHouse = useMemo(() => {
    if (!eclipse || !chart?.houseCusps) return null;
    const lon = signDegreesToLongitude(eclipse.sign, eclipse.degree, eclipse.minutes);
    return getHouseForLongitude(lon, chart);
  }, [eclipse, chart]);

  const topHit = useMemo(() => {
    if (!eclipse || !chart) return null;
    const natalPoints = extractNatalPoints(chart);
    const hits = getEclipseAspectHits(eclipse, natalPoints, 1);
    return hits[0] ?? null;
  }, [eclipse, chart]);

  const takeaway = useMemo(() => {
    if (!eclipse) return null;
    return generateTakeaway(eclipse, modality, hitHouse, topHit);
  }, [eclipse, modality, hitHouse, topHit]);

  const handleCopy = useCallback(() => {
    if (!takeaway || !eclipse) return;
    const text = [
      `🧭 What To Do With This Eclipse (${eclipse.subtype} ${eclipse.type} at ${eclipse.degree}° ${eclipse.sign})`,
      '',
      '✅ DO:',
      ...takeaway.doItems.map(d => `• ${d}`),
      '',
      '👁 WATCH FOR:',
      ...takeaway.watchItems.map(w => `• ${w}`),
      '',
      ...(eclipse.reflectionQuestions?.length
        ? ['📝 REFLECTION QUESTIONS:', ...eclipse.reflectionQuestions.map(q => `• ${q}`), '']
        : [`📝 JOURNAL: ${takeaway.journal}`, '']),
      `⚠️ CAUTION: ${takeaway.caution}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [takeaway, eclipse]);

  if (!eclipse) {
    return <p className="text-sm text-muted-foreground italic">Select an eclipse to see guidance.</p>;
  }

  if (!takeaway) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground italic">
        Practical guidance based on eclipse type, nodal direction, sign modality{chart ? ', and your chart activations' : ''}.
      </p>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
        <h4 className="font-semibold text-sm">✅ Do</h4>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
          {takeaway.doItems.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
        <h4 className="font-semibold text-sm">👁 Watch For</h4>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
          {takeaway.watchItems.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      {/* Reflection Questions from eclipse data OR generated journal prompt */}
      {eclipse.reflectionQuestions && eclipse.reflectionQuestions.length > 0 ? (
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">📝 Reflection Questions</h4>
          <ul className="text-sm text-muted-foreground space-y-2 list-none">
            {eclipse.reflectionQuestions.map((q, i) => (
              <li key={i} className="italic border-l-2 border-primary/20 pl-3">{q}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">📝 Journal Prompt</h4>
          <p className="text-sm text-muted-foreground italic">{takeaway.journal}</p>
        </div>
      )}

      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
        <h4 className="font-semibold text-sm">⚠️ Caution</h4>
        <p className="text-sm text-muted-foreground">{takeaway.caution}</p>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy Takeaways'}
        </Button>
      </div>
    </div>
  );
}

/* ── Summary Strip ── */
function SelectedEclipseSummaryStrip({
  eclipse,
  chart,
  onBackToTimeline,
  currentList,
  onSelectEclipse,
}: {
  eclipse: EclipseEvent;
  chart: NatalChart | null;
  onBackToTimeline?: () => void;
  currentList?: EclipseEvent[];
  onSelectEclipse?: (e: EclipseEvent) => void;
}) {
  const natalPoints = useMemo(() => chart ? extractNatalPoints(chart) : null, [chart]);

  const { hitHouse, oppHouse } = useMemo(() => {
    if (!chart?.houseCusps) return { hitHouse: null, oppHouse: null };
    const lon = signDegreesToLongitude(eclipse.sign, eclipse.degree, eclipse.minutes);
    const h = getHouseForLongitude(lon, chart);
    if (!h) return { hitHouse: null, oppHouse: null };
    return { hitHouse: h, oppHouse: h <= 6 ? h + 6 : h - 6 };
  }, [eclipse, chart]);

  const topHit = useMemo(() => {
    if (!natalPoints) return null;
    const hits = getEclipseAspectHits(eclipse, natalPoints, 1);
    return hits[0] ?? null;
  }, [eclipse, natalPoints]);

  const { prev, next } = useMemo(() => {
    if (!currentList || !onSelectEclipse) return { prev: null, next: null };
    const idx = currentList.findIndex(x => x.date === eclipse.date);
    return {
      prev: idx > 0 ? currentList[idx - 1] : null,
      next: idx >= 0 && idx < currentList.length - 1 ? currentList[idx + 1] : null,
    };
  }, [currentList, eclipse.date, onSelectEclipse]);

  const subtypeLabel = eclipse.subtype.charAt(0).toUpperCase() + eclipse.subtype.slice(1);
  const typeLabel = eclipse.type === 'solar' ? 'Solar Eclipse' : 'Lunar Eclipse';
  const degreeStr = `${eclipse.degree}°${eclipse.minutes > 0 ? eclipse.minutes.toString().padStart(2, '0') + "'" : ''}`;

  return (
    <div className="sticky top-0 z-10 rounded-lg border border-border/60 bg-background/80 backdrop-blur-md px-4 py-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          {eclipse.title && (
            <p className="text-sm font-bold text-foreground truncate">{eclipse.title}</p>
          )}
          <p className="text-sm font-semibold truncate">
            {subtypeLabel} {typeLabel} • {degreeStr} {getSignGlyph(eclipse.sign)} {eclipse.sign} • {eclipse.nodal === 'north' ? '☊ North' : '☋ South'} Node
          </p>
          <p className="text-base font-bold text-foreground">
            {(() => {
              const [y, m, d] = eclipse.date.split('-').map(Number);
              return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            })()}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            {hitHouse && oppHouse && (
              <Badge variant="outline" className="text-[10px]">
                🏛 House {hitHouse} / {oppHouse} axis
              </Badge>
            )}
            {topHit && (
              <Badge variant="secondary" className="text-[10px]">
                🎯 {topHit.point} {topHit.aspect} ({topHit.orbLabel})
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {currentList && onSelectEclipse && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!prev}
                onClick={() => prev && onSelectEclipse(prev)}
                title="Previous eclipse"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!next}
                onClick={() => next && onSelectEclipse(next)}
                title="Next eclipse"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {onBackToTimeline && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onBackToTimeline}>
              <ArrowUp className="h-3 w-3" /> Timeline
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SarosCyclesContent({ eclipse }: { eclipse: EclipseEvent | null }) {
  if (!eclipse) return null;

  const [y, m, d] = eclipse.date.split('-').map(Number);
  const eclipseDate = new Date(y, m - 1, d);
  const formatDate = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const previousEcho = new Date(eclipseDate);
  previousEcho.setFullYear(previousEcho.getFullYear() - 18);
  previousEcho.setDate(previousEcho.getDate() - 11);

  const nextEcho = new Date(eclipseDate);
  nextEcho.setFullYear(nextEcho.getFullYear() + 18);
  nextEcho.setDate(nextEcho.getDate() + 11);

  const twoBack = new Date(previousEcho);
  twoBack.setFullYear(twoBack.getFullYear() - 18);
  twoBack.setDate(twoBack.getDate() - 11);

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      {eclipse.sarosNote && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="font-semibold text-foreground mb-1">🔄 Your Thematic Echo</p>
          <p className="text-muted-foreground">{eclipse.sarosNote}</p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-base">This Eclipse's Saros Family Timeline</h4>
        <p className="text-muted-foreground">
          Every eclipse belongs to a <strong>Saros family</strong> — a series of eclipses spaced ~18 years and 11 days apart that share similar astronomical geometry. Each one revisits related themes in your life.
        </p>
        <div className="grid gap-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground text-xs w-20">~36 yrs ago</span>
            <span className="font-medium text-foreground">{formatDate(twoBack)}</span>
            <span className="text-xs text-muted-foreground ml-auto">2 cycles back</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground text-xs w-20">~18 yrs ago</span>
            <span className="font-medium text-foreground">{formatDate(previousEcho)}</span>
            <span className="text-xs text-muted-foreground ml-auto">Previous echo</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-primary text-xs w-20 font-bold">Current</span>
            <span className="font-bold text-foreground">{formatDate(eclipseDate)}</span>
            <Badge variant="outline" className="ml-auto text-xs">{eclipse.sign}</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <span className="text-muted-foreground text-xs w-20">~18 yrs out</span>
            <span className="font-medium text-foreground">{formatDate(nextEcho)}</span>
            <span className="text-xs text-muted-foreground ml-auto">Next echo</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-base">What Is a Saros Cycle?</h4>
        <p className="text-muted-foreground">
          The Saros is an <strong>astronomical pattern</strong> — not an astrological invention. It's based on three lunar cycles syncing up almost perfectly every 6,585.3 days (~18 years, 11 days, 8 hours):
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><strong>Synodic month</strong> (new moon → new moon): 223 of these = 6,585.32 days</li>
          <li><strong>Draconic month</strong> (node → node): 242 of these = 6,585.36 days</li>
          <li><strong>Anomalistic month</strong> (perigee → perigee): 239 of these = 6,585.54 days</li>
        </ul>
        <p className="text-muted-foreground">
          Because these three cycles nearly coincide, eclipses <strong>repeat</strong> with very similar geometry — same type, similar degree, similar duration. That's why astrologers treat them as <em>thematic families</em>.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-base">How to Use This</h4>
        <div className="bg-accent/10 rounded-lg p-4 space-y-2 text-muted-foreground">
          <p>📓 <strong>Look back ~18 years</strong> from this eclipse date. What was happening in your life around {formatDate(previousEcho)}?</p>
          <p>🔍 The same life area was being activated. You won't see identical events — but you'll likely recognize <strong>similar themes, similar questions, similar turning points</strong>.</p>
          <p>🌱 This eclipse is the next chapter in that story. What did you learn last time? What still needs to shift?</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-base">Other Eclipse Cycles</h4>
        <div className="space-y-2 text-muted-foreground">
          <p>
            <strong>Metonic Cycle (19 years)</strong> — Eclipses return to nearly the same calendar date and zodiac degree. If this eclipse is on {formatDate(eclipseDate)}, look also at what happened around {(() => { const mt = new Date(eclipseDate); mt.setFullYear(mt.getFullYear() - 19); return formatDate(mt); })()}.
          </p>
          <p>
            <strong>Eclipse Seasons</strong> — Eclipses come in pairs (sometimes triplets) about 2 weeks apart. A solar and lunar eclipse always accompany each other, forming an "eclipse season" lasting ~35 days.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EclipseInterpretationLayer({ selectedEclipse, userNatalChart, onBackToTimeline, currentList, onSelectEclipse }: Props) {
  const [openModules, setOpenModules] = useState<string[]>([]);

  const sign: ZodiacSign = selectedEclipse?.sign ?? 'Virgo';
  const nodal = selectedEclipse?.nodal ?? 'north';

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
    STATIC_MODULES[0],
    dynamicModules[0],
    dynamicModules[1],
    ...STATIC_MODULES.slice(1),
  ];

  const renderContent = (key: string) => {
    if (key === 'nodes') return <NodalDirectionContent nodal={nodal} eclipse={selectedEclipse} />;
    if (key === 'sign-teaching') return <SignTeachingContent sign={sign} />;
    if (key === 'axis-teaching') return <AxisTeachingContent sign={sign} />;
    if (key === 'natal') return <NatalAspectContent eclipse={selectedEclipse} chart={userNatalChart ?? null} />;
    if (key === 'houses') return <HouseActivationContent eclipse={selectedEclipse} chart={userNatalChart ?? null} />;
    if (key === 'takeaway') return <TakeawayContent eclipse={selectedEclipse} chart={userNatalChart ?? null} />;
    if (key === 'cycles') return <SarosCyclesContent eclipse={selectedEclipse} />;
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
        {selectedEclipse && (
          <SelectedEclipseSummaryStrip
            eclipse={selectedEclipse}
            chart={userNatalChart ?? null}
            onBackToTimeline={onBackToTimeline}
            currentList={currentList}
            onSelectEclipse={onSelectEclipse}
          />
        )}

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
