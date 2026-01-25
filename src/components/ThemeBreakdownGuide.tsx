/**
 * ThemeBreakdownGuide - Educational Teaching Component
 * 
 * Shows HOW themes were determined from ACTUAL CHART DATA:
 * - Past Life Theme (South Node, 12th House)
 * - Soul Growth Theme (North Node)
 * - Transformation Theme (Pluto, 8th House)
 * - Healing Theme (Chiron)
 * - Karmic Debt Theme (Saturn)
 * - Fated Theme (Vertex)
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { KarmicAnalysis, KarmicIndicator } from '@/lib/karmicAnalysis';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, ChevronUp, BookOpen, Calculator, History, 
  Sparkles, Flame, Heart, Scale, Star, ArrowRight
} from 'lucide-react';
import { useState } from 'react';

interface ThemeBreakdownGuideProps {
  chart1: NatalChart;
  chart2: NatalChart;
  karmicAnalysis: KarmicAnalysis;
}

// Planet and aspect symbols
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷', Vertex: 'Vx'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹'
};

// Weight reference for education
const WEIGHT_REFERENCE = {
  southNode: { conjunction: 15, opposition: 10, square: 8, trine: 6, sextile: 4 },
  northNode: { conjunction: 12, opposition: 8, square: 6, trine: 5, sextile: 3 },
  saturn: { conjunction: 12, opposition: 10, square: 10, trine: 5, sextile: 3 },
  pluto: { conjunction: 14, opposition: 12, square: 11, trine: 6, sextile: 4 },
  chiron: { conjunction: 10, opposition: 8, square: 7, trine: 4, sextile: 3 },
  twelfthHouse: 8,
  eighthHouse: 6,
  vertex: 10
};

/**
 * Formats an indicator into a readable string with symbols
 */
function formatIndicator(ind: KarmicIndicator, chart1Name: string, chart2Name: string): string {
  const p1Symbol = PLANET_SYMBOLS[ind.planet1] || ind.planet1;
  const p2Symbol = PLANET_SYMBOLS[ind.planet2] || ind.planet2;
  const aspectSymbol = ind.aspect ? ASPECT_SYMBOLS[ind.aspect] || ind.aspect : '';
  
  // Determine which chart owns which planet
  const owner1 = ind.planet1.includes('Node') || ind.planet1 === 'Saturn' || ind.planet1 === 'Pluto' || ind.planet1 === 'Chiron' || ind.planet1 === 'Vertex'
    ? chart1Name : chart2Name;
  const owner2 = chart1Name === owner1 ? chart2Name : chart1Name;
  
  return `${owner1}'s ${ind.planet1} (${p1Symbol}) ${aspectSymbol} ${ind.aspect || 'in'} ${owner2}'s ${ind.planet2} (${p2Symbol})`;
}

/**
 * Calculate theme totals from indicators
 */
function calculateThemeTotals(indicators: KarmicIndicator[]): Record<string, { count: number; points: number }> {
  const themes: Record<string, { count: number; points: number }> = {
    past_life: { count: 0, points: 0 },
    soul_growth: { count: 0, points: 0 },
    transformation: { count: 0, points: 0 },
    healing: { count: 0, points: 0 },
    karmic_debt: { count: 0, points: 0 },
    fated: { count: 0, points: 0 }
  };
  
  indicators.forEach(ind => {
    if (themes[ind.theme]) {
      themes[ind.theme].count++;
      themes[ind.theme].points += ind.weight;
    }
  });
  
  return themes;
}

// Theme Section Component
const ThemeSection = ({ 
  theme, 
  title, 
  icon, 
  color,
  whatWeLookedFor,
  astrologyBehindIt,
  whyItMatters,
  indicators,
  totalScore,
  chart1Name,
  chart2Name,
  weightingInfo
}: {
  theme: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  whatWeLookedFor: string[];
  astrologyBehindIt: string;
  whyItMatters: string;
  indicators: KarmicIndicator[];
  totalScore: number;
  chart1Name: string;
  chart2Name: string;
  weightingInfo?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const themeIndicators = indicators.filter(ind => ind.theme === theme);
  const themePoints = themeIndicators.reduce((sum, ind) => sum + ind.weight, 0);
  const themePercentage = totalScore > 0 ? Math.round((themePoints / totalScore) * 100) : 0;
  
  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger className="w-full">
        <div className={`p-4 rounded-xl border ${color} hover:opacity-90 transition-opacity`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div className="text-left">
                <h3 className="font-serif text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">
                  {themePercentage}% of relationship • {themePoints} points from {themeIndicators.length} indicators
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg font-bold">{themePercentage}%</Badge>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-4 space-y-4 border-x border-b rounded-b-xl bg-card/50">
          {/* What we looked for */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Calculator size={14} />
              What we looked for in the charts:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 pl-6">
              {whatWeLookedFor.map((item, i) => (
                <li key={i} className="list-disc">{item}</li>
              ))}
            </ul>
          </div>

          {/* What we found */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <ArrowRight size={14} />
              What we found in YOUR charts:
            </h4>
            {themeIndicators.length > 0 ? (
              <div className="space-y-2">
                {themeIndicators.map((ind, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/30 border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{formatIndicator(ind, chart1Name, chart2Name)}</span>
                      <Badge variant="outline">+{ind.weight} points</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ind.interpretation}</p>
                  </div>
                ))}
                <p className="text-sm font-medium text-primary">
                  Total: {themePoints} points from {title.toLowerCase()}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 border text-sm text-muted-foreground">
                <p>No significant {title.toLowerCase()} contacts detected</p>
                <p className="text-xs mt-1">This is why this theme score is {themePercentage === 0 ? 'zero' : 'low'}</p>
              </div>
            )}
          </div>

          {/* The astrology behind it */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Star size={14} />
              The astrology behind it:
            </h4>
            <div className="text-sm text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/20">
              {astrologyBehindIt}
            </div>
          </div>

          {/* Why this matters */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <BookOpen size={14} />
              Why this matters:
            </h4>
            <p className="text-sm text-muted-foreground">{whyItMatters}</p>
          </div>

          {/* How we weighted it */}
          {weightingInfo && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Calculator size={14} />
                How we weighted it:
              </h4>
              <div className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30 font-mono whitespace-pre-line">
                {weightingInfo}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ThemeBreakdownGuide = ({ chart1, chart2, karmicAnalysis }: ThemeBreakdownGuideProps) => {
  const [expanded, setExpanded] = useState(false);
  const themeTotals = calculateThemeTotals(karmicAnalysis.indicators);
  
  // Calculate summary percentages
  const soulGrowthPercent = karmicAnalysis.totalKarmicScore > 0 
    ? Math.round((themeTotals.soul_growth.points / karmicAnalysis.totalKarmicScore) * 100)
    : 0;
  const pastLifePercent = karmicAnalysis.pastLifeProbability;
  
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif flex items-center justify-center gap-2">
          <BookOpen className="text-primary" size={24} />
          How We Determined These Themes (Teaching Guide)
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          This shows exactly what we looked for in {chart1.name} & {chart2.name}'s charts, 
          what we found, and how we calculated each theme score.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">{karmicAnalysis.totalKarmicScore}</div>
            <div className="text-xs text-muted-foreground">Total Karmic Score</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{soulGrowthPercent}%</div>
            <div className="text-xs text-muted-foreground">Soul Growth Focus</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pastLifePercent}%</div>
            <div className="text-xs text-muted-foreground">Past Life Theme</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{karmicAnalysis.indicators.length}</div>
            <div className="text-xs text-muted-foreground">Total Indicators</div>
          </div>
        </div>
      </div>

      {/* Theme Sections */}
      <div className="space-y-4">
        {/* Past Life Theme */}
        <ThemeSection
          theme="past_life"
          title="Past Life Theme"
          icon={<History className="text-blue-600" size={20} />}
          color="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
          whatWeLookedFor={[
            "South Node (☋) contacts between personal planets (Sun, Moon, Mercury, Venus, Mars)",
            "Planets in the 12th house overlay (the house of hidden/unconscious/past)"
          ]}
          astrologyBehindIt={`The South Node represents what we bring FROM past lives - it's our comfort zone, familiar patterns, what we've already mastered. When someone's planet touches your South Node, it feels INSTANTLY familiar because you've "done this before" across lifetimes. It's like meeting an old friend - you fall into patterns easily, sometimes too easily.

The 12th house is the realm of the unconscious, hidden things, spirituality, and past life memories. When someone's planets fall in your 12th house, you have a psychic/spiritual connection that often transcends words.`}
          whyItMatters={pastLifePercent < 30 
            ? `Low past life scores (like yours at ${pastLifePercent}%) mean this is primarily a NEW soul agreement focused on growth, not completion. You're not here to resolve old karma - you're creating something new.`
            : `Higher past life scores (${pastLifePercent}%) suggest you're completing old karma together. There may be patterns that feel familiar but need conscious attention.`
          }
          indicators={karmicAnalysis.indicators}
          totalScore={karmicAnalysis.totalKarmicScore}
          chart1Name={chart1.name}
          chart2Name={chart2.name}
          weightingInfo={`South Node conjunction = 15 points (strongest)
South Node opposition = 10 points
South Node square = 8 points
South Node trine = 6 points
South Node sextile = 4 points
12th House overlay = 8 points per planet`}
        />

        {/* Soul Growth Theme */}
        <ThemeSection
          theme="soul_growth"
          title="Soul Growth Theme"
          icon={<Sparkles className="text-purple-600" size={20} />}
          color="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
          whatWeLookedFor={[
            "North Node (☊) contacts between personal planets",
            "Quality of those contacts (conjunction = strongest, opposition/square = challenging growth, trine/sextile = easy growth)"
          ]}
          astrologyBehindIt={`The North Node represents your DESTINY - where your soul is headed in THIS lifetime. It's uncomfortable, unfamiliar, but it's your growth edge. When someone's planets conjunct your North Node, they literally EMBODY the qualities you're here to develop.

${themeTotals.soul_growth.count > 0 ? `In your case, the North Node contacts mean one person is a teacher/guide for the other's evolution, often without even trying.` : 'No major North Node contacts were detected in your synastry.'}`}
          whyItMatters={soulGrowthPercent >= 50
            ? `This relationship is ${soulGrowthPercent}% about FORWARD movement, not resolving the past. ${chart1.name} and ${chart2.name} are here to help each other evolve.`
            : `Soul growth is ${soulGrowthPercent}% of your connection - present but not the primary theme.`
          }
          indicators={karmicAnalysis.indicators}
          totalScore={karmicAnalysis.totalKarmicScore}
          chart1Name={chart1.name}
          chart2Name={chart2.name}
          weightingInfo={`North Node conjunction = 12 points (strongest)
North Node opposition = 8 points
North Node square = 6 points
North Node trine = 5 points
North Node sextile = 3 points

Calculation:
Soul Growth % = (Soul Growth points ÷ Total Score) × 100
Soul Growth % = (${themeTotals.soul_growth.points} ÷ ${karmicAnalysis.totalKarmicScore}) × 100 = ${soulGrowthPercent}%`}
        />

        {/* Transformation Theme */}
        <ThemeSection
          theme="transformation"
          title="Transformation Theme"
          icon={<Flame className="text-amber-600" size={20} />}
          color="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
          whatWeLookedFor={[
            "Pluto (♇) contacts to personal planets",
            "8th house overlays (the house of death/rebirth, shared resources, deep intimacy)"
          ]}
          astrologyBehindIt={`Pluto represents death, rebirth, power, and the unconscious. It TRANSFORMS whatever it touches - you cannot stay the same after a Pluto transit or contact. The transformation can be empowering (you step into your power) or destructive (power struggles, manipulation), depending on consciousness.

Square = friction, tension, challenge (90° angle between planets)
Opposition = polarity, push-pull, seeing your opposite (180° angle)
Conjunction = intense merging of energies (0° angle)`}
          whyItMatters="This relationship WILL change you. The question is whether you transform consciously (empowerment, healing, depth) or unconsciously (power struggles, obsession, control)."
          indicators={karmicAnalysis.indicators}
          totalScore={karmicAnalysis.totalKarmicScore}
          chart1Name={chart1.name}
          chart2Name={chart2.name}
          weightingInfo={`Pluto conjunction = 14 points (most intense)
Pluto opposition = 12 points
Pluto square = 11 points
Pluto trine = 6 points (easy transformation)
Pluto sextile = 4 points (opportunity)
8th House overlay = 6 points per planet`}
        />

        {/* Healing Theme */}
        <ThemeSection
          theme="healing"
          title="Healing Theme"
          icon={<Heart className="text-pink-600" size={20} />}
          color="bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800"
          whatWeLookedFor={[
            "Chiron (⚷) contacts to personal planets"
          ]}
          astrologyBehindIt={`Chiron is the "wounded healer" - it represents our deepest wound AND our greatest healing gift. When someone's planet touches your Chiron, they either:

1. Trigger the wound (can be retraumatizing if unconscious)
2. Help you heal it (if both people are aware and compassionate)

Chiron contacts are not inherently good or bad - they show potential for profound healing OR re-wounding.`}
          whyItMatters="Chiron contacts show where you can hurt each other OR heal each other. It depends entirely on awareness and compassion. These are places to tread gently."
          indicators={karmicAnalysis.indicators}
          totalScore={karmicAnalysis.totalKarmicScore}
          chart1Name={chart1.name}
          chart2Name={chart2.name}
          weightingInfo={`Chiron conjunction = 10 points
Chiron opposition = 8 points
Chiron square = 7 points
Chiron trine = 4 points
Chiron sextile = 3 points`}
        />

        {/* Karmic Debt Theme */}
        <ThemeSection
          theme="karmic_debt"
          title="Karmic Debt Theme"
          icon={<Scale className="text-slate-600" size={20} />}
          color="bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800"
          whatWeLookedFor={[
            "Saturn (♄) contacts to personal planets (especially hard aspects like conjunction, square, opposition)"
          ]}
          astrologyBehindIt={`Saturn represents karma, restriction, authority, lessons, maturity, and TIME. Saturn contacts show where you have "work to do" together - patterns to mature through, trust to build, or restrictions to overcome.

Hard Saturn aspects (conjunction, square, opposition) can feel cold, critical, or limiting. They show where one person may feel judged, restricted, or not good enough. BUT they also show where deep commitment and mature love can be built through conscious work.`}
          whyItMatters="Saturn doesn't give anything for free - you must EARN it. These contacts show your 'homework' in the relationship. They indicate where patience, maturity, and commitment are required."
          indicators={karmicAnalysis.indicators}
          totalScore={karmicAnalysis.totalKarmicScore}
          chart1Name={chart1.name}
          chart2Name={chart2.name}
          weightingInfo={`Saturn conjunction = 12 points
Saturn opposition = 10 points
Saturn square = 10 points
Saturn trine = 5 points
Saturn sextile = 3 points`}
        />

        {/* Fated Theme */}
        <ThemeSection
          theme="fated"
          title="Fated Meeting Theme"
          icon={<Star className="text-yellow-600" size={20} />}
          color="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
          whatWeLookedFor={[
            "Vertex (Vx) contacts (especially conjunctions)",
            "Multiple exact degree contacts"
          ]}
          astrologyBehindIt={`The Vertex is called the "point of fate" - it represents destined encounters. When someone's planet conjuncts your Vertex, the meeting feels fated, like it was "meant to be." Often these people appear at significant turning points in your life.

Important: Fated doesn't mean "meant to last forever" - it means "meant to meet for a reason." The relationship has a PURPOSE, even if temporary.`}
          whyItMatters="Vertex contacts indicate meetings that feel orchestrated by something larger than yourselves. These connections often appear at pivotal life moments and serve a specific purpose in your evolution."
          indicators={karmicAnalysis.indicators}
          totalScore={karmicAnalysis.totalKarmicScore}
          chart1Name={chart1.name}
          chart2Name={chart2.name}
          weightingInfo={`Vertex conjunction = 10 points
(Only conjunctions are counted for Vertex)`}
        />
      </div>

      {/* Summary Section */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <h3 className="font-serif text-xl mb-4">Summary: Your Relationship Breakdown</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(themeTotals).map(([theme, data]) => {
              const percentage = karmicAnalysis.totalKarmicScore > 0 
                ? Math.round((data.points / karmicAnalysis.totalKarmicScore) * 100)
                : 0;
              return (
                <div key={theme} className="p-3 rounded-lg bg-card border text-center">
                  <div className="text-lg font-bold">{data.points} pts</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {theme.replace('_', ' ')} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-lg bg-card border">
            <h4 className="font-medium mb-2">What this means:</h4>
            <p className="text-sm text-muted-foreground">
              Your relationship is <strong>{soulGrowthPercent}% about FORWARD GROWTH</strong> and {pastLifePercent}% about past karma. 
              {karmicAnalysis.karmicType === 'soul_family' && 
                ` This is a ${karmicAnalysis.karmicType.replace('_', ' ')} connection where ${chart1.name} and ${chart2.name} support each other's evolution.`}
              {themeTotals.transformation.count > 0 &&
                ` The Pluto contacts add intensity and transformation to the mix.`}
              {themeTotals.healing.count > 0 &&
                ` Chiron contacts indicate healing opportunities.`}
              {' '}The core purpose is <strong>{karmicAnalysis.soulPurpose.toLowerCase()}</strong>
            </p>
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-secondary/30 rounded-lg">
            <strong>The calculation:</strong><br/>
            Total Karmic Score = Sum of all indicator weights = {karmicAnalysis.totalKarmicScore} points from {karmicAnalysis.indicators.length} indicators<br/>
            Each theme % = (Theme points ÷ Total Score) × 100
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeBreakdownGuide;
