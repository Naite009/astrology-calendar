import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlanetHouseInfo } from '@/lib/narrativeAnalysisEngine';
import { getElementTeaching } from '@/lib/elementTeachings';
import { ELEMENT_COLORS, SIGN_POLARITY, SIGN_AXES, SignAxis } from '@/lib/zodiacSignEncyclopedia';
import { ElementSelfAssessment } from '@/components/sacredscript/ElementSelfAssessment';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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

      {/* Sign Axes — The 6 Polarities */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>☯</span> The 6 Sign Axes — Oppositions as Partnerships
        </h3>
        <p className="text-xs text-muted-foreground">
          Every sign has an opposite — not an enemy, but a partner. These axes represent spectrums of consciousness you're learning to integrate. When two planets oppose each other across an axis, they activate this tension in your life. If the axis is intercepted (no house cusp falls in those signs), the lesson is delayed — it develops internally before it shows up externally.
        </p>

        <div className="space-y-2">
          {SIGN_AXES.map(axis => {
            // Find planets on each side of this axis
            const sign1Planets = planetHouses.filter(p => p.sign === axis.sign1).map(p => p.planet);
            const sign2Planets = planetHouses.filter(p => p.sign === axis.sign2).map(p => p.planet);
            const hasActivity = sign1Planets.length > 0 || sign2Planets.length > 0;
            
            // Check for actual house placements on the natural houses
            const house1Planets = planetHouses.filter(p => p.house === axis.houses[0]);
            const house2Planets = planetHouses.filter(p => p.house === axis.houses[1]);

            return (
              <Collapsible key={axis.sign1}>
                <CollapsibleTrigger className="w-full">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${hasActivity ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'} hover:bg-primary/10 transition-colors cursor-pointer`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{axis.sign1} ↔ {axis.sign2}</span>
                      <span className="text-xs text-muted-foreground">· {axis.spectrum}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasActivity && (
                        <Badge variant="secondary" className="text-[10px]">
                          {sign1Planets.length + sign2Planets.length} planet{sign1Planets.length + sign2Planets.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 border border-t-0 rounded-b-lg space-y-3">
                    <p className="text-xs font-medium text-primary">{axis.theme}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{axis.description}</p>

                    {/* Planets on this axis */}
                    {hasActivity && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-muted/40">
                          <p className="text-[10px] font-medium mb-1">{axis.sign1} side</p>
                          {sign1Planets.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {sign1Planets.map(p => (
                                <span key={p} className="text-[10px] bg-background rounded px-1.5 py-0.5">
                                  {PLANET_SYMBOLS[p] || ''} {p}
                                </span>
                              ))}
                            </div>
                          ) : <p className="text-[10px] text-muted-foreground italic">No planets</p>}
                        </div>
                        <div className="p-2 rounded bg-muted/40">
                          <p className="text-[10px] font-medium mb-1">{axis.sign2} side</p>
                          {sign2Planets.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {sign2Planets.map(p => (
                                <span key={p} className="text-[10px] bg-background rounded px-1.5 py-0.5">
                                  {PLANET_SYMBOLS[p] || ''} {p}
                                </span>
                              ))}
                            </div>
                          ) : <p className="text-[10px] text-muted-foreground italic">No planets</p>}
                        </div>
                      </div>
                    )}

                    {/* House context */}
                    <div className="p-2 rounded bg-muted/20 border border-dashed">
                      <p className="text-[10px] font-medium mb-1">🏠 Natural Houses: {axis.houses[0]} & {axis.houses[1]}</p>
                      <p className="text-[10px] text-muted-foreground">
                        In your chart, House {axis.houses[0]} has {house1Planets.length} planet{house1Planets.length !== 1 ? 's' : ''} and House {axis.houses[1]} has {house2Planets.length} planet{house2Planets.length !== 1 ? 's' : ''}.
                        {house1Planets.length > 0 && house2Planets.length === 0 && ` Energy concentrates in House ${axis.houses[0]} — the ${axis.sign1} side of this axis is emphasized.`}
                        {house2Planets.length > 0 && house1Planets.length === 0 && ` Energy concentrates in House ${axis.houses[1]} — the ${axis.sign2} side of this axis is emphasized.`}
                        {house1Planets.length > 0 && house2Planets.length > 0 && ' Both houses are active — you\'re working both sides of this spectrum.'}
                      </p>
                    </div>

                    {/* Opposition as aspect */}
                    <div className="p-2 rounded bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-medium text-primary mb-1">☍ As a Planetary Opposition</p>
                      <p className="text-[10px] text-muted-foreground">{axis.asAspect}</p>
                    </div>

                    {/* Interception */}
                    <div className="p-2 rounded bg-accent/30 border border-accent/50">
                      <p className="text-[10px] font-medium mb-1">🔒 If Intercepted</p>
                      <p className="text-[10px] text-muted-foreground">{axis.interceptedMeaning}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      {/* Polarity Balance — Yang vs Yin summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>⚖</span> Yang / Yin Balance
        </h3>
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium">Yang · Assertive (Fire + Air)</span>
            <span className="font-medium">Yin · Receptive (Earth + Water)</span>
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
