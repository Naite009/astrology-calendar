import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlanetHouseInfo } from '@/lib/narrativeAnalysisEngine';
import { getElementTeaching } from '@/lib/elementTeachings';
import { ELEMENT_COLORS, SIGN_POLARITY } from '@/lib/zodiacSignEncyclopedia';
import { ElementSelfAssessment } from '@/components/sacredscript/ElementSelfAssessment';

interface Props {
  planetHouses: PlanetHouseInfo[];
}

const ELEMENT_ORDER: ('Fire' | 'Earth' | 'Air' | 'Water')[] = ['Fire', 'Earth', 'Air', 'Water'];

const ELEMENT_EMOJI: Record<string, string> = {
  Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊',
};

const getElement = (sign: string): string => {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  if (fire.includes(sign)) return 'Fire';
  if (earth.includes(sign)) return 'Earth';
  if (air.includes(sign)) return 'Air';
  return 'Water';
};

export function ElementDistributionCard({ planetHouses }: Props) {
  const { elementCounts, elementPlanets, yangPlanets, yinPlanets, weakElements } = useMemo(() => {
    const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const planets: Record<string, string[]> = { Fire: [], Earth: [], Air: [], Water: [] };
    const yang: string[] = [];
    const yin: string[] = [];

    for (const ph of planetHouses) {
      const el = getElement(ph.sign);
      counts[el]++;
      planets[el].push(ph.planet);
      if (SIGN_POLARITY[ph.sign] === 'Yang') yang.push(ph.planet);
      else yin.push(ph.planet);
    }

    const weak = ELEMENT_ORDER.filter(e => counts[e] <= 1);
    return { elementCounts: counts, elementPlanets: planets, yangPlanets: yang, yinPlanets: yin, weakElements: weak };
  }, [planetHouses]);

  const total = planetHouses.length;
  const yangPct = total > 0 ? Math.round((yangPlanets.length / total) * 100) : 50;

  return (
    <div className="space-y-6">
      {/* Element Distribution */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>⬡</span> Element Distribution
        </h3>
        <p className="text-xs text-muted-foreground italic">
          "Just because someone is missing an element does not mean they are out of balance." — Debra Silverman
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ELEMENT_ORDER.map(element => {
            const count = elementCounts[element];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const ec = ELEMENT_COLORS[element];
            const planetsInElement = elementPlanets[element];
            const teaching = getElementTeaching(element);

            return (
              <div key={element} className={`p-3 rounded-lg border ${ec.border} ${ec.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${ec.text}`}>
                    {ELEMENT_EMOJI[element]} {element}
                  </span>
                  <span className="text-xs text-muted-foreground">{count} / {total}</span>
                </div>
                <Progress value={pct} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1 mb-2">
                  {planetsInElement.map(p => (
                    <span key={p} className="text-xs bg-background/70 rounded px-1.5 py-0.5">
                      {PLANET_SYMBOLS[p] || ''} {p}
                    </span>
                  ))}
                  {count === 0 && <span className="text-xs text-muted-foreground italic">No planets</span>}
                </div>

                {/* Missing / low element interpretation */}
                {count === 0 && teaching && (
                  <div className="mt-2 p-2 rounded bg-background/50 border border-dashed border-current/10">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Missing {element} — how this shows up:</p>
                    <ul className="text-[10px] text-muted-foreground space-y-0.5">
                      {teaching.lackSymptoms.slice(0, 3).map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {count === 1 && teaching && (
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    Low {element} — only {planetsInElement[0]}. May need conscious development or may be already internalized.
                  </p>
                )}
                {count >= 4 && (
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    Dominant {element} ({count} planets) — this is a core operating mode. Watch for overdoing {element.toLowerCase()} tendencies.
                  </p>
                )}
                {count >= 2 && count <= 3 && (
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    {element === 'Fire' && 'Moderate Fire — enough spark to act on inspiration without burning out. Drive is present but not consuming.'}
                    {element === 'Earth' && 'Moderate Earth — grounded enough to build, practical enough to sustain. Structure is available when you need it.'}
                    {element === 'Air' && 'Moderate Air — mental agility is present. You can communicate and analyze without overthinking or detaching.'}
                    {element === 'Water' && 'Moderate Water — emotional depth is accessible. You can feel, empathize, and intuit without being overwhelmed.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Polarity Balance */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>☯</span> Polarity Balance
        </h3>
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium">Yang · Assertive</span>
            <span className="font-medium">Yin · Receptive</span>
          </div>
          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-amber-400/70 dark:bg-amber-500/50 rounded-l-full transition-all"
              style={{ width: `${yangPct}%` }}
            />
            <div 
              className="absolute inset-y-0 right-0 bg-indigo-400/70 dark:bg-indigo-500/50 rounded-r-full transition-all"
              style={{ width: `${100 - yangPct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground">
              {yangPct}% / {100 - yangPct}%
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex flex-wrap gap-1">
              {yangPlanets.map(p => (
                <span key={p} className="text-[10px] bg-amber-100 dark:bg-amber-900/30 rounded px-1.5 py-0.5">
                  {PLANET_SYMBOLS[p] || ''} {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {yinPlanets.map(p => (
                <span key={p} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 rounded px-1.5 py-0.5">
                  {PLANET_SYMBOLS[p] || ''} {p}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {yangPct > 65 && 'Yang-dominant: Action-oriented, externally focused. You initiate, lead, and express outwardly. Remember to pause and receive.'}
            {yangPct < 35 && 'Yin-dominant: Receptive, internally focused. You process deeply, observe, and nurture. Remember to push forward when needed.'}
            {yangPct >= 35 && yangPct <= 65 && 'Balanced polarity: You have access to both assertive and receptive modes. You can initiate and respond with equal comfort.'}
          </div>
        </div>
      </div>

      {/* Element Self-Assessment for weak/missing elements */}
      {weakElements.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            You have low or missing {weakElements.join(' & ')}. Use this self-assessment to discover if you've already internalized the element — or if it's genuinely undeveloped territory.
          </p>
          <ElementSelfAssessment 
            elements={weakElements} 
            title={`${weakElements.join(' & ')} Self-Assessment — Have You Already Mastered It?`}
          />
        </div>
      )}
    </div>
  );
}
