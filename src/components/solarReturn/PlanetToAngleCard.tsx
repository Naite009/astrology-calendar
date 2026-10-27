import { useMemo } from 'react';
import { Eye, Target, Crosshair } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { getEffectiveOrb } from '@/lib/aspectOrbs';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number } | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const ASPECT_DEFS = [
  { name: 'conjunct', angle: 0, glyph: '☌', priority: 1, key: 'conjunction' },
  { name: 'opposite', angle: 180, glyph: '☍', priority: 2, key: 'opposition' },
  { name: 'square', angle: 90, glyph: '□', priority: 3, key: 'square' },
  { name: 'trine', angle: 120, glyph: '△', priority: 4, key: 'trine' },
  { name: 'sextile', angle: 60, glyph: '⚹', priority: 5, key: 'sextile' },
] as const;

const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'your main priorities',
  Moon: 'what helps you feel settled',
  Mercury: 'conversations and decisions',
  Venus: 'the people and activities you enjoy',
  Mars: 'where you take action and set limits',
  Jupiter: 'plans you want to grow',
  Saturn: 'commitments you can maintain',
  Uranus: 'routines you may want to change',
  Neptune: 'agreements worth checking',
  Pluto: 'commitments you may reconsider',
  NorthNode: 'a secondary direction point',
  Chiron: 'a sensitive area you may handle with care',
};

const ANGLE_MEANINGS: Record<string, { label: string; domain: string }> = {
  Ascendant: { label: 'Ascendant', domain: 'how you introduce yourself and your plans' },
  Descendant: { label: 'Descendant', domain: 'close relationships and agreements' },
  Midheaven: { label: 'Midheaven (MC)', domain: 'work and public responsibilities' },
  IC: { label: 'IC', domain: 'home and private life' },
};

const ASPECT_RULES: Record<string, string> = {
  conjunct: 'is conjunct',
  opposite: 'is opposite',
  square: 'is square',
  trine: 'is trine',
  sextile: 'is sextile',
};

export interface PlanetToAngleActivation {
  srPlanet: string;
  planetMeaning: string;
  natalAngle: string;
  angleDomain: string;
  aspectName: string;
  aspectGlyph: string;
  orb: number;
  priority: number;
  narrative: string;
}

interface Props {
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export function PlanetToAngleCard({ natalChart, srChart }: Props) {
  const activations = usePlanetToAngleActivations(natalChart, srChart);

  if (activations.length === 0) return null;

  return (
    <div className="border border-primary/20 rounded-sm p-5 bg-card">
      <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-1 flex items-center gap-2">
        <Eye size={16} className="text-primary" />
        Visible Activations: SR Planets on Natal Angles
      </h3>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        SR Planets → Natal ASC / DSC / MC / IC (planet-specific orbs)
      </p>

      <div className="space-y-3">
        {activations.map((act, i) => (
          <div key={i} className="bg-muted/30 border border-border rounded-sm p-3">
            <div className="flex items-center gap-2 mb-1.5">
              {act.priority <= 2 ? (
                <Crosshair size={14} className="text-primary flex-shrink-0" />
              ) : (
                <Target size={14} className="text-primary flex-shrink-0" />
              )}
              <p className="text-xs font-medium text-foreground">
                SR {act.srPlanet} {act.aspectGlyph} Natal {act.natalAngle}
                <span className="text-muted-foreground font-normal ml-1.5">({act.orb}°)</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{act.narrative}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
              Audit: SR-{act.srPlanet} {act.aspectGlyph} natal-{act.natalAngle} {act.aspectName} ({act.orb}°)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function usePlanetToAngleActivations(natalChart: NatalChart, srChart: SolarReturnChart): PlanetToAngleActivation[] {
  return useMemo(() => {
    const acts: PlanetToAngleActivation[] = [];

    // Natal angles
    const natalAngles: { name: string; deg: number | null }[] = [];
    const natalAsc = natalChart.houseCusps?.house1;
    const natalMC = natalChart.houseCusps?.house10;
    if (natalAsc) {
      const d = toAbsDeg(natalAsc);
      natalAngles.push({ name: 'Ascendant', deg: d });
      if (d !== null) natalAngles.push({ name: 'Descendant', deg: (d + 180) % 360 });
    }
    if (natalMC) {
      const d = toAbsDeg(natalMC);
      natalAngles.push({ name: 'Midheaven', deg: d });
      if (d !== null) natalAngles.push({ name: 'IC', deg: (d + 180) % 360 });
    }

    // SR planets
    const srPlanets = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];

    for (const planetName of srPlanets) {
      const srPos = srChart.planets[planetName as keyof typeof srChart.planets];
      if (!srPos) continue;
      const srDeg = toAbsDeg(srPos);
      if (srDeg === null) continue;

      for (const angle of natalAngles) {
        if (angle.deg === null) continue;

        for (const asp of ASPECT_DEFS) {
          let diff = Math.abs(srDeg - angle.deg);
          if (diff > 180) diff = 360 - diff;
          const orb = Math.abs(diff - asp.angle);
          const effectiveOrb = getEffectiveOrb(planetName, angle.name, asp.key);
          if (orb <= effectiveOrb) {
            const angleInfo = ANGLE_MEANINGS[angle.name];
            const meaning = PLANET_MEANINGS[planetName] || '';
            const displayPlanet = planetName === 'NorthNode' ? 'North Node' : planetName;
            const rule = ASPECT_RULES[asp.name];

            const narrative = asp.name === 'conjunct'
              ? `Solar Return ${displayPlanet} is conjunct your natal ${angleInfo.label}. You may notice ${meaning} more in ${angleInfo.domain}.`
              : `Solar Return ${displayPlanet} ${rule} your natal ${angleInfo.label}. You may notice ${meaning} in ${angleInfo.domain}.`;

            acts.push({
              srPlanet: displayPlanet,
              planetMeaning: meaning,
              natalAngle: angle.name,
              angleDomain: angleInfo.domain,
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

    acts.sort((a, b) => a.priority - b.priority || a.orb - b.orb);
    return acts;
  }, [natalChart, srChart]);
}
