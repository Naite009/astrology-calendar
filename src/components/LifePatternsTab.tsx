import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Crown, Eye, Baby, Briefcase, Calendar, AlertTriangle, Shield, Sparkles, Info, Zap, Mountain } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import {
  calculateDominantPlanets as calculateLegacyDominant,
  analyzePsychicAbilities,
  analyzeChildren,
  analyzeCareer,
  analyzeLuckyDays,
  analyzeSelfSabotage,
  analyzeGuardianAngel,
  DominantPlanetResult,
} from '@/lib/lifePatternAnalysis';
import { calculateNatalDominantPlanets } from '@/lib/dominantPlanetsEngine';
import { DominantPlanetsCard } from '@/components/DominantPlanetsCard';
import { getPlanetSymbol } from '@/components/PlanetSymbol';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { convertToChartPlanets } from '@/lib/chartConversion';
import { analyzeAllPlanetaryConditions, PlanetaryCondition } from '@/lib/planetaryCondition';
import { computeAspects, DEFAULT_ORBS } from '@/lib/chartDecoderLogic';

interface LifePatternsTabProps {
  chart: NatalChart;
}

// Collapsible section wrapper
const PatternSection = ({ 
  icon: Icon, 
  title, 
  subtitle,
  badgeText,
  badgeVariant = 'default',
  defaultOpen = false,
  children 
}: { 
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-serif">{title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badgeText && <Badge variant={badgeVariant} className="text-[10px]">{badgeText}</Badge>}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Planet score bar
const ScoreBar = ({ planet, score, maxScore, reasons }: DominantPlanetResult & { maxScore: number }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-1 cursor-help">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{getPlanetSymbol(planet)} {planet}</span>
            <span className="text-muted-foreground text-xs">{score} pts</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all" 
              style={{ width: `${Math.min((score / maxScore) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <ul className="text-xs space-y-0.5">
          {reasons.map((r, i) => <li key={i}>• {r}</li>)}
        </ul>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const LifePatternsTab = ({ chart }: LifePatternsTabProps) => {
  const dominant = useMemo(() => calculateDominantPlanets(chart), [chart]);
  const psychic = useMemo(() => analyzePsychicAbilities(chart), [chart]);
  const children = useMemo(() => analyzeChildren(chart), [chart]);
  const career = useMemo(() => analyzeCareer(chart), [chart]);
  const luckyDays = useMemo(() => analyzeLuckyDays(chart), [chart]);
  const sabotage = useMemo(() => analyzeSelfSabotage(chart), [chart]);
  const guardian = useMemo(() => analyzeGuardianAngel(chart), [chart]);

  // Calculate MVP and Most Elevated (planetary condition scores)
  const { mvpData, mvp, elevated } = useMemo(() => {
    try {
      const chartPlanets = convertToChartPlanets(chart);
      const aspects = computeAspects(chartPlanets, DEFAULT_ORBS);
      const conditions = analyzeAllPlanetaryConditions(chartPlanets, aspects, chart, true);
      
      // Most elevated = closest to MC (house 10)
      const MC_PROXIMITY: Record<number, number> = {
        10: 10, 9: 8, 11: 7, 8: 5, 12: 4, 7: 3, 1: 3, 6: 2, 2: 2, 5: 1, 3: 1, 4: 0
      };
      const elevatedPlanet = conditions.length > 0
        ? conditions.reduce((best, c) => {
            const bestProx = MC_PROXIMITY[best.house || 0] ?? 0;
            const cProx = MC_PROXIMITY[c.house || 0] ?? 0;
            return cProx > bestProx ? c : best;
          }, conditions[0])
        : null;
      
      return { mvpData: conditions, mvp: conditions[0] || null, elevated: elevatedPlanet };
    } catch {
      return { mvpData: [] as PlanetaryCondition[], mvp: null, elevated: null };
    }
  }, [chart]);

  const maxScore = dominant[0]?.score || 1;
  const topPlanet = dominant[0];

  // getDominantPlanetMeaning is in the engine but we need it here
  const meanings: Record<string, string> = {
    Sun: "Your life force radiates outward. You're meant to be seen, to lead, to express your authentic self without apology.",
    Moon: "Your emotional world runs the show. You process everything through feeling first, and your intuition is your most reliable compass.",
    Mercury: "Your mind never stops. You process the world through analysis, communication, and connection. Words are your currency.",
    Venus: "Beauty, harmony, and connection are your lifeblood. You have a natural gift for making things — and people — feel good.",
    Mars: "You run on drive, ambition, and raw energy. You're built to take action, compete, and pioneer.",
    Jupiter: "You're wired for expansion, meaning, and growth. Optimism carries you through what would break others.",
    Saturn: "Discipline, structure, and long-term thinking define you. You earn everything the hard way — and keep it.",
    Uranus: "You're the pattern-breaker. Convention doesn't hold you because you see systems that others don't.",
    Neptune: "You live between worlds. Your sensitivity, imagination, and spiritual depth are extraordinary.",
    Pluto: "Transformation is your birthright. You don't do surface-level anything. Your power lies in regeneration."
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl text-foreground">Life Pattern Analysis</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Deep patterns calculated from {chart.name}'s natal chart
        </p>
      </div>

      {/* 1. Your Key Planets — Unified section */}
      <PatternSection
        icon={Crown}
        title="Your Key Planets"
        subtitle="Three lenses on planetary power in your chart"
        badgeText={topPlanet ? `${getPlanetSymbol(topPlanet.planet)} ${topPlanet.planet}` : undefined}
        defaultOpen={true}
      >
        {/* Beginner intro */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every planet in your chart plays a role, but three stand out as especially important. 
            Think of them as three "awards" a planet can win — and sometimes the same planet wins more than one.
          </p>
        </div>

        {/* Three cards in a grid */}
        <div className="grid grid-cols-1 gap-3">
          
          {/* 1. Dominant Planet */}
          {topPlanet && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  👑 The Captain: {getPlanetSymbol(topPlanet.planet)} {topPlanet.planet}
                </p>
                <Badge variant="secondary" className="text-[10px] ml-auto">{topPlanet.score} pts</Badge>
              </div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                <strong>What this means:</strong> {getPlanetSymbol(topPlanet.planet)} {topPlanet.planet} shows up more than any other planet in your chart. 
                It rules your key signs, connects to the most other planets, and colors how you approach almost everything. 
                If your chart had a "flavor," this planet would be it.
              </p>
              <p className="text-xs text-foreground/80 italic leading-relaxed">
                {meanings[topPlanet.planet] || ''}
              </p>
              
              {/* Score breakdown */}
              <details className="group">
                <summary className="cursor-pointer text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
                  Why {topPlanet.planet} dominates
                  <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-2 space-y-2">
                  {dominant.slice(0, 5).map(d => (
                    <ScoreBar key={d.planet} {...d} maxScore={maxScore} />
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* 2. MVP */}
          {mvp && (
            <div className="p-4 rounded-lg bg-accent/30 border border-accent/50 space-y-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  ⚡ The Star Player: {getPlanetSymbol(mvp.planet)} {mvp.planet}
                </p>
                <Badge variant="outline" className="text-[10px] ml-auto">{mvp.qualityRating}</Badge>
              </div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                <strong>What this means:</strong> {getPlanetSymbol(mvp.planet)} {mvp.planet} is in the best shape to actually <em>deliver results</em>. 
                It's in a sign where it's comfortable, in a helpful part of the sky, and getting good support from other planets. 
                When you need something to <em>work</em>, lean on this planet's themes.
              </p>
              {mvp.strengthFactors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mvp.strengthFactors.slice(0, 4).map((f, i) => (
                    <span key={i} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">✓ {f}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Most Elevated */}
          {elevated && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-secondary space-y-2">
              <div className="flex items-center gap-2">
                <Mountain size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  🏔️ The Billboard: {getPlanetSymbol(elevated.planet)} {elevated.planet}
                </p>
                <Badge variant="outline" className="text-[10px] ml-auto">
                  House {elevated.house || '?'}
                </Badge>
              </div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                <strong>What this means:</strong> {getPlanetSymbol(elevated.planet)} {elevated.planet} sits at the very top of your chart, 
                near the Midheaven — the point the world sees first. This is your "billboard." 
                It shapes your reputation, how people perceive you professionally, and the energy strangers pick up on before they even know you.
              </p>
              {elevated.planet !== (mvp?.planet) && elevated.planet !== (topPlanet?.planet) && (
                <p className="text-xs text-muted-foreground italic">
                  Interesting: your billboard planet is different from both your captain and your star player. 
                  The world sees {getPlanetSymbol(elevated.planet)} {elevated.planet} energy first, even though internally you're more driven by {getPlanetSymbol(topPlanet?.planet || '')} {topPlanet?.planet}.
                </p>
              )}
            </div>
          )}
        </div>

        {/* How do they relate? */}
        {topPlanet && mvp && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border/40 space-y-2">
            <p className="text-xs font-medium text-foreground/90">🔗 How your key planets work together:</p>
            
            {/* All three same */}
            {topPlanet.planet === mvp.planet && mvp.planet === elevated?.planet ? (
              <p className="text-xs text-foreground/85 leading-relaxed">
                <strong>Triple crown!</strong> {getPlanetSymbol(topPlanet.planet)} {topPlanet.planet} is your captain, your star player, <em>and</em> your billboard. 
                This is rare and powerful — the energy that dominates your chart is also your most effective tool AND the first thing the world notices about you. 
                Trust this planet completely.
              </p>
            ) : topPlanet.planet === mvp.planet ? (
              <p className="text-xs text-foreground/85 leading-relaxed">
                <strong>Strong alignment:</strong> {getPlanetSymbol(topPlanet.planet)} {topPlanet.planet} is both your most influential AND most effective planet. 
                The energy that runs through your whole chart is also working at full strength.
                {elevated && elevated.planet !== topPlanet.planet && (
                  <> But the world's first impression of you comes through {getPlanetSymbol(elevated.planet)} {elevated.planet} — so publicly you may seem more "{elevated.planet}" than you feel inside.</>
                )}
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs text-foreground/85 leading-relaxed">
                  <strong>Complementary strengths:</strong> {getPlanetSymbol(topPlanet.planet)} {topPlanet.planet} colors everything (influence), 
                  while {getPlanetSymbol(mvp.planet)} {mvp.planet} gets things done (effectiveness).
                </p>
                {/* Condition of the dominant */}
                {(() => {
                  const domCond = mvpData.find(c => c.planet === topPlanet.planet);
                  if (!domCond) return null;
                  const isStrong = domCond.totalScore >= 5;
                  const isChallenged = domCond.totalScore < 0;
                  return (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isStrong 
                        ? `Your captain ${getPlanetSymbol(topPlanet.planet)} ${topPlanet.planet} is also well-resourced (${domCond.qualityRating}) — both planets are working for you.`
                        : isChallenged
                        ? `Your captain ${getPlanetSymbol(topPlanet.planet)} ${topPlanet.planet} is in a tough spot (${domCond.qualityRating}). It influences a lot but may need extra effort. Lean on ${getPlanetSymbol(mvp.planet)} ${mvp.planet} when you need reliability.`
                        : `Your captain ${getPlanetSymbol(topPlanet.planet)} ${topPlanet.planet} is in decent shape (${domCond.qualityRating}). It works, but ${getPlanetSymbol(mvp.planet)} ${mvp.planet} is your strongest tool.`
                      }
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </PatternSection>

      {/* 7. Guardian Angel (positive — show early) */}
      <PatternSection
        icon={Shield}
        title="Your Celestial Protection"
        subtitle="Where the universe conspires to help you"
        badgeText={guardian.protectionIndicators.length > 0 ? `${guardian.protectionIndicators.length} indicators` : undefined}
        badgeVariant="secondary"
      >
        {guardian.primaryProtection && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-primary mb-1">{guardian.primaryProtection.placement}</p>
            <p className="text-sm text-foreground/85 leading-relaxed">{guardian.primaryProtection.description}</p>
          </div>
        )}

        <div className="p-3 bg-secondary/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Info className="h-3 w-3" /> How your protection works:
          </p>
          <p className="text-sm text-foreground/80">{guardian.protectionStyle}</p>
        </div>

        {guardian.blessingZones.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Your blessing zones:</p>
            <div className="space-y-2">
              {guardian.blessingZones.map((zone, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <div><strong>{zone.area}:</strong> {zone.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {guardian.protectionIndicators.length > 1 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">All protection indicators:</p>
            <div className="space-y-2">
              {guardian.protectionIndicators.slice(1).map((ind, i) => (
                <div key={i} className="p-2.5 bg-secondary/30 rounded-lg">
                  <p className="text-xs font-medium text-foreground">{ind.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ind.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </PatternSection>

      {/* 4. Career Sweet Spot */}
      <PatternSection
        icon={Briefcase}
        title="Your Career Sweet Spot"
        subtitle="Where your chart says you'll thrive"
        badgeText={career.mcSign ? `MC in ${career.mcSign}` : undefined}
        badgeVariant="outline"
      >
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Top career paths:</p>
          <div className="space-y-3">
            {career.topPaths.map((path, i) => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  {path.field}
                </p>
                <p className="text-xs text-muted-foreground mt-1 ml-7">{path.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">🏢 Ideal Work Environment</p>
            <p className="text-sm text-foreground/80">{career.idealEnvironment}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">💰 Income Flow</p>
            <p className="text-sm text-foreground/80">{career.incomeStyle}</p>
          </div>
        </div>
      </PatternSection>

      {/* 5. Lucky Days + Top 10 Luckiest Dates */}
      <PatternSection
        icon={Calendar}
        title="Your Luckiest Days & Dates"
        subtitle="Weekly power day + top 10 transit-powered dates this year"
        badgeText={`#1: ${luckyDays.primaryDay}`}
        badgeVariant="default"
        defaultOpen
      >
        {/* Weekly power day */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Your Weekly Power Day</p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            <strong>{luckyDays.primaryDay}</strong> is ruled by <strong>{luckyDays.primaryPlanet}</strong>. {luckyDays.primaryReason}.
          </p>
        </div>

        {luckyDays.secondaryDays.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Also favorable weekly:</p>
            {luckyDays.secondaryDays.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-sm mb-1.5">
                <Badge variant="outline" className="text-[10px]">{d.day}</Badge>
                <span className="text-foreground/75">{d.reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top 10 Luckiest Dates */}
        {luckyDays.topDates.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 mt-2">
              🌟 Your Top 10 Luckiest Dates (Based on Real Transits to Your Chart)
            </p>
            <div className="space-y-2">
              {luckyDays.topDates.map((entry, i) => {
                const dateStr = entry.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                const maxScore = luckyDays.topDates[0]?.score || 1;
                const barWidth = Math.round((entry.score / maxScore) * 100);
                return (
                  <div key={i} className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">#{i + 1}</span>
                        <span className="text-sm font-medium">{dateStr}</span>
                      </div>
                      <span className="text-xs text-amber-500 font-medium">{entry.rating}</span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full h-1.5 bg-secondary rounded-full mb-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {entry.categories.map((cat, ci) => (
                        <Badge key={ci} variant="outline" className="text-[9px] px-1.5 py-0">
                          {cat === 'love' ? '💕' : cat === 'expansion' ? '🍀' : cat === 'vitality' ? '☀️' : cat === 'fortune' ? '🎯' : '✨'} {cat}
                        </Badge>
                      ))}
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {entry.reasons.map((r, ri) => <li key={ri}>• {r}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground italic mt-2">
          💡 These dates are calculated from real planetary transits making exact harmonious aspects to your natal chart. Schedule important moves, launches, and asks on these days.
        </p>
      </PatternSection>

      {/* 2. Psychic Abilities */}
      <PatternSection
        icon={Eye}
        title="Psychic Sensitivity Profile"
        subtitle="Your intuitive gifts and how to develop them"
        badgeText={psychic.level}
        badgeVariant={psychic.level === 'High' ? 'default' : 'secondary'}
      >
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary mb-1">Primary modality: {psychic.primaryModality}</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{psychic.developmentPath}</p>
        </div>

        {psychic.indicators.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Your intuitive indicators ({psychic.indicators.length}):
            </p>
            <div className="space-y-2">
              {psychic.indicators.map((ind, i) => (
                <div key={i} className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-medium text-foreground">{ind.name}</p>
                    {ind.modality && <Badge variant="outline" className="text-[10px]">{ind.modality}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{ind.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {psychic.indicators.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Your chart shows subtle intuitive capacity. While psychic ability isn't a dominant theme, you have quiet knowing and gut feelings that work best when not forced.
          </p>
        )}
      </PatternSection>

      {/* 3. Children & Creativity */}
      <PatternSection
        icon={Baby}
        title="Children & Creativity Signature"
        subtitle="Your 5th house reveals parenting style and creative gifts"
        badgeText={children.fifthHouseSign ? `5H in ${children.fifthHouseSign}` : undefined}
        badgeVariant="outline"
      >
        {children.fifthHouseSign && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">5th House Profile</p>
            <p className="text-sm text-foreground">
              <strong>{children.fifthHouseSign}</strong> on the cusp
              {children.fifthHousePlanets.length > 0 && (
                <> with <strong>{children.fifthHousePlanets.map(p => `${getPlanetSymbol(p)} ${p}`).join(', ')}</strong></>
              )}
              {children.fifthHouseRuler && (
                <> • Ruler: <strong>{getPlanetSymbol(children.fifthHouseRuler.planet)} {children.fifthHouseRuler.planet}</strong>
                {children.fifthHouseRuler.sign && <> in {children.fifthHouseRuler.sign}</>}
                {children.fifthHouseRuler.house && <> ({children.fifthHouseRuler.house}th house)</>}
                </>
              )}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Fertility Level: <Badge variant={children.fertilityLevel === 'High' ? 'default' : 'outline'} className="text-[10px] ml-1">{children.fertilityLevel}</Badge>
            </p>
            <p className="text-xs text-foreground/80">{children.fertilityDescription}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">🎨 Creative Expression</p>
            <p className="text-xs text-foreground/80">{children.creativeExpression}</p>
          </div>
        </div>

        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">👶 Your Parenting Style</p>
          <p className="text-sm text-foreground/80">{children.parentingStyle}</p>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          Note: Modern birth control makes traditional fertility indicators symbolic. These reflect creative and relational energy patterns.
        </p>
      </PatternSection>

      {/* 6. Self-Sabotage */}
      <PatternSection
        icon={AlertTriangle}
        title="Shadow Patterns to Watch"
        subtitle="Your unconscious sabotage patterns — and how to heal them"
        badgeText={sabotage.length > 0 ? `${sabotage.length} patterns` : 'None detected'}
        badgeVariant={sabotage.length > 0 ? 'destructive' : 'secondary'}
      >
        {sabotage.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No major self-sabotage indicators detected in your chart. This doesn't mean you're immune to shadow patterns — it means the classic astrological signatures aren't prominently activated.
          </p>
        ) : (
          <div className="space-y-4">
            {sabotage.map((pattern, i) => (
              <div key={i} className={`p-4 rounded-lg border ${
                pattern.severity === 'primary' 
                  ? 'bg-destructive/5 border-destructive/20' 
                  : 'bg-secondary/30 border-border'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-foreground">{pattern.name}</p>
                  <Badge variant={pattern.severity === 'primary' ? 'destructive' : 'outline'} className="text-[10px]">
                    {pattern.severity}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 mb-2">{pattern.pattern}</p>
                <div className="p-2 bg-background/50 rounded border border-border mb-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>Your trigger phrase:</strong> <em>"{pattern.trigger}"</em>
                  </p>
                </div>
                <div className="p-2 bg-primary/5 rounded">
                  <p className="text-xs text-foreground/75">
                    <strong className="text-primary">Healing path:</strong> {pattern.healingPath}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {sabotage.length > 0 && (
          <p className="text-xs text-muted-foreground italic">
            🌱 Remember: shadow patterns aren't punishments — they're invitations to grow. Awareness is the first step. These patterns lose power the moment you recognize them.
          </p>
        )}
      </PatternSection>
    </div>
  );
};

export default LifePatternsTab;
