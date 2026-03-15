import { useMemo } from 'react';
import { Zap, Target, Crosshair } from 'lucide-react';
import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

// ─── helpers ────────────────────────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number } | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const ASPECT_DEFS = [
  { name: 'conjunct', angle: 0, glyph: '☌', priority: 1 },
  { name: 'opposite', angle: 180, glyph: '☍', priority: 2 },
  { name: 'square', angle: 90, glyph: '□', priority: 3 },
  { name: 'trine', angle: 120, glyph: '△', priority: 4 },
  { name: 'sextile', angle: 60, glyph: '⚹', priority: 5 },
] as const;

const ORB = 3;

const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'identity, purpose, vitality',
  Moon: 'emotions, home, daily life',
  Mercury: 'communication, learning, contracts',
  Venus: 'relationships, love, money, harmony',
  Mars: 'action, drive, conflict, energy',
  Jupiter: 'growth, expansion, opportunity',
  Saturn: 'responsibility, discipline, tests',
  Uranus: 'change, disruption, freedom',
  Neptune: 'spirituality, imagination, dissolution',
  Pluto: 'transformation, power, deep change',
  NorthNode: 'life direction, karmic growth',
  Chiron: 'healing, wounds, mentorship',
};

const ANGLE_MEANINGS: Record<string, { label: string; domain: string }> = {
  Ascendant: { label: 'Ascendant', domain: 'personal direction, identity, how the year begins' },
  Descendant: { label: 'Descendant', domain: 'relationships, partnerships, encounters' },
  Midheaven: { label: 'Midheaven', domain: 'career, reputation, public visibility' },
  IC: { label: 'IC', domain: 'home, family, emotional foundations' },
};

const ASPECT_RULES: Record<string, string> = {
  conjunct: 'becomes a dominant theme woven directly into',
  opposite: 'manifests through external events, encounters, or other people involving',
  square: 'creates tension, turning points, or required effort around',
  trine: 'brings supportive flow and natural opportunities involving',
  sextile: 'opens doors that can be activated through effort around',
};

interface Activation {
  angleName: string;
  angleDomain: string;
  natalPlanet: string;
  planetMeaning: string;
  aspectName: string;
  aspectGlyph: string;
  orb: number;
  priority: number;
  narrative: string;
}

interface Pattern {
  type: 'multi_angle' | 'angular_cluster';
  message: string;
}

interface Props {
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export function AngleActivationCard({ natalChart, srChart }: Props) {
  const { activations, patterns } = useMemo(() => {
    const acts: Activation[] = [];

    // Get SR angle positions
    const srAngles: { name: string; deg: number | null }[] = [];
    const srAsc = srChart.houseCusps?.house1;
    const srMC = srChart.houseCusps?.house10;
    const srDesc = srAsc ? toAbsDeg(srAsc) : null;
    const srIC = srMC ? toAbsDeg(srMC) : null;

    if (srAsc) srAngles.push({ name: 'Ascendant', deg: toAbsDeg(srAsc) });
    if (srDesc !== null) srAngles.push({ name: 'Descendant', deg: (srDesc + 180) % 360 });
    if (srMC) srAngles.push({ name: 'Midheaven', deg: toAbsDeg(srMC) });
    if (srIC !== null) srAngles.push({ name: 'IC', deg: (srIC + 180) % 360 });

    // Natal planets to check
    const natalPoints = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];

    for (const angle of srAngles) {
      if (angle.deg === null) continue;
      for (const planetName of natalPoints) {
        const natalPos = natalChart.planets[planetName as keyof typeof natalChart.planets];
        if (!natalPos) continue;
        const natalDeg = toAbsDeg(natalPos);
        if (natalDeg === null) continue;

        for (const asp of ASPECT_DEFS) {
          let diff = Math.abs(angle.deg - natalDeg);
          if (diff > 180) diff = 360 - diff;
          const orb = Math.abs(diff - asp.angle);
          if (orb <= ORB) {
            const angleInfo = ANGLE_MEANINGS[angle.name];
            const rule = ASPECT_RULES[asp.name];
            const meaning = PLANET_MEANINGS[planetName] || '';
            const displayPlanet = planetName === 'NorthNode' ? 'North Node' : planetName;

            const narrative = asp.name === 'conjunct'
              ? `Your natal ${displayPlanet} (${meaning}) becomes a defining force this year — directly fused with the SR ${angleInfo.label}. Themes of ${meaning} are inseparable from ${angleInfo.domain}.`
              : `The SR ${angleInfo.label} ${asp.name}s your natal ${displayPlanet} — ${rule} ${meaning}. This contact channels through ${angleInfo.domain}.`;

            acts.push({
              angleName: angle.name,
              angleDomain: angleInfo.domain,
              natalPlanet: displayPlanet,
              planetMeaning: meaning,
              aspectName: asp.name,
              aspectGlyph: asp.glyph,
              orb: Math.round(orb * 10) / 10,
              priority: asp.priority,
              narrative,
            });
          }
        }
      }
    }

    // Sort by priority then orb
    acts.sort((a, b) => a.priority - b.priority || a.orb - b.orb);

    // Pattern detection
    const pats: Pattern[] = [];

    // Check if multiple angles hit the same planet
    const planetAngleCounts: Record<string, string[]> = {};
    for (const a of acts) {
      if (!planetAngleCounts[a.natalPlanet]) planetAngleCounts[a.natalPlanet] = [];
      planetAngleCounts[a.natalPlanet].push(a.angleName);
    }
    for (const [planet, angles] of Object.entries(planetAngleCounts)) {
      if (angles.length >= 2) {
        pats.push({
          type: 'multi_angle',
          message: `${planet} is contacted by ${angles.join(' and ')} — this planet becomes an extremely dominant theme of the year.`,
        });
      }
    }

    // Angular cluster: 3+ different natal planets aspected
    const uniquePlanets = new Set(acts.map(a => a.natalPlanet));
    if (uniquePlanets.size >= 3) {
      pats.push({
        type: 'angular_cluster',
        message: `${uniquePlanets.size} natal planets are activated by SR angles — the year is likely to bring visible, externally noticeable developments.`,
      });
    }

    return { activations: acts, patterns: pats };
  }, [natalChart, srChart]);

  if (activations.length === 0) return null;

  return (
    <div className="border border-primary/20 rounded-sm p-5 bg-card">
      <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-1 flex items-center gap-2">
        <Zap size={16} className="text-primary" />
        Major Planetary Activations of the Year
      </h3>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        SR Angles → Natal Planet Contacts (within {ORB}° orb)
      </p>

      <div className="space-y-3 mb-4">
        {activations.map((act, i) => (
          <div key={i} className="bg-muted/30 border border-border rounded-sm p-3">
            <div className="flex items-center gap-2 mb-1.5">
              {act.priority <= 2 ? (
                <Crosshair size={14} className="text-primary flex-shrink-0" />
              ) : (
                <Target size={14} className="text-primary flex-shrink-0" />
              )}
              <p className="text-xs font-medium text-foreground">
                SR {act.angleName} {act.aspectGlyph} Natal {act.natalPlanet}
                <span className="text-muted-foreground font-normal ml-1.5">({act.orb}°)</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{act.narrative}</p>
            {/* Aspect audit line */}
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
              Audit: SR-{act.angleName} {act.aspectGlyph} natal-{act.natalPlanet} {act.aspectName} ({act.orb}°)
            </p>
          </div>
        ))}
      </div>

      {/* Pattern signals */}
      {patterns.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pattern Signals</p>
          {patterns.map((pat, i) => (
            <p key={i} className="text-xs text-foreground leading-relaxed">
              {pat.type === 'multi_angle' ? '🎯 ' : '⚡ '}
              {pat.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
