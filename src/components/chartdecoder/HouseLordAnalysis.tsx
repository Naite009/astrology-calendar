import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { TRADITIONAL_RULERS } from '@/lib/chartDecoderLogic';

interface HouseLordAnalysisProps {
  chart: NatalChart;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const HOUSE_MEANINGS: Record<number, { title: string; keywords: string }> = {
  1: { title: 'Self', keywords: 'identity, appearance, first impressions' },
  2: { title: 'Resources', keywords: 'money, possessions, self-worth, talents' },
  3: { title: 'Communication', keywords: 'siblings, learning, short trips, ideas' },
  4: { title: 'Home', keywords: 'family, roots, emotional foundation, endings' },
  5: { title: 'Creativity', keywords: 'romance, children, play, self-expression' },
  6: { title: 'Service', keywords: 'work, health, routines, pets, improvement' },
  7: { title: 'Partnership', keywords: 'marriage, contracts, open enemies, others' },
  8: { title: 'Transformation', keywords: 'intimacy, death, shared resources, psychology' },
  9: { title: 'Expansion', keywords: 'travel, philosophy, higher education, beliefs' },
  10: { title: 'Career', keywords: 'reputation, public role, achievement, authority' },
  11: { title: 'Community', keywords: 'friends, groups, hopes, wishes, humanity' },
  12: { title: 'Transcendence', keywords: 'solitude, hidden enemies, spirituality, karma' }
};

// Get the interpretation for a house lord placement
function getHouseLordInterpretation(rulingHouse: number, placedHouse: number): string {
  // Key combinations with specific meanings
  const interpretations: Record<string, string> = {
    '1-1': 'Self-focused identity. You are your own project. What you see is what you get.',
    '1-7': 'Identity expressed through partnership. You find yourself through relationships.',
    '1-10': 'Identity tied to career and public role. Achievement defines you.',
    '2-5': 'Money through creativity, romance, or speculation. Your talents bring resources.',
    '2-8': 'Finances intertwined with others. Inheritance, joint resources, or transformation through money.',
    '2-11': 'Income through groups, networks, or future-oriented work. Friends help finances.',
    '3-9': 'Learning expands into higher education or travel. Writing about philosophy.',
    '4-10': 'Home and career intertwined. Family business or public role shaped by roots.',
    '5-7': 'Romance leads to partnership. Creative collaboration. Children through marriage.',
    '5-11': 'Creativity expressed through groups. Children connect you to community.',
    '6-12': 'Work in hidden places—hospitals, institutions. Health tied to spiritual practices.',
    '7-1': 'Partnership shapes identity. You become yourself through significant others.',
    '7-4': 'Partners become family. Marriage creates home. Relationships have deep roots.',
    '7-10': 'Marriage affects career. Public reputation through partnership.',
    '8-2': 'Transformation through resources. Others\' money affects your security.',
    '9-3': 'Philosophy expressed through communication. Teaching, writing about beliefs.',
    '10-1': 'Career is identity. Public role comes naturally. Born for achievement.',
    '10-4': 'Career from home or about family matters. Roots shape public role.',
    '10-7': 'Career through partnerships. Business marriages or consulting work.',
    '11-5': 'Community feeds creativity. Friends become lovers or creative collaborators.',
    '12-6': 'Hidden work in service. Sacrifice through daily routines. Spiritual health practices.'
  };

  const key = `${rulingHouse}-${placedHouse}`;
  if (interpretations[key]) {
    return interpretations[key];
  }

  // Generic interpretation
  const ruling = HOUSE_MEANINGS[rulingHouse];
  const placed = HOUSE_MEANINGS[placedHouse];
  
  if (rulingHouse === placedHouse) {
    return `${ruling.title} matters are self-contained. This area of life is a closed loop—what you put in, you get out.`;
  }
  
  return `Your ${ruling.title.toLowerCase()} themes unfold through ${placed.title.toLowerCase()} matters. ${ruling.keywords.split(',')[0]} connects to ${placed.keywords.split(',')[0]}.`;
}

// Calculate which house a planet is in
function calculatePlanetHouse(
  planetSign: string, 
  planetDegree: number, 
  houseCusps: NatalChart['houseCusps']
): number | null {
  if (!houseCusps) return null;
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const toAbsoluteDegree = (sign: string, degree: number): number => {
    const signIndex = signs.indexOf(sign);
    return signIndex === -1 ? 0 : signIndex * 30 + degree;
  };
  
  const planetAbsDeg = toAbsoluteDegree(planetSign, planetDegree);
  const cusps: number[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) cusps.push(toAbsoluteDegree(cusp.sign, cusp.degree + (cusp.minutes || 0) / 60));
    else return null;
  }
  
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];
    if (nextCusp < currentCusp) {
      if (planetAbsDeg >= currentCusp || planetAbsDeg < nextCusp) return i + 1;
    } else {
      if (planetAbsDeg >= currentCusp && planetAbsDeg < nextCusp) return i + 1;
    }
  }
  return 1;
}

interface HouseLordData {
  house: number;
  sign: string;
  ruler: string;
  rulerSign: string;
  rulerHouse: number | null;
  interpretation: string;
}

export const HouseLordAnalysis: React.FC<HouseLordAnalysisProps> = ({ chart }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!chart.houseCusps) return null;

  // Build house lord data for all 12 houses
  const houseLords: HouseLordData[] = [];
  
  for (let h = 1; h <= 12; h++) {
    const cusp = chart.houseCusps[`house${h}` as keyof typeof chart.houseCusps];
    if (!cusp) continue;
    
    const sign = cusp.sign;
    const ruler = TRADITIONAL_RULERS[sign];
    
    if (!ruler) continue;
    
    // Find where the ruler is placed
    const rulerPosition = chart.planets[ruler as keyof typeof chart.planets];
    let rulerHouse: number | null = null;
    let rulerSign = '';
    
    if (rulerPosition) {
      rulerSign = rulerPosition.sign;
      rulerHouse = calculatePlanetHouse(
        rulerPosition.sign,
        rulerPosition.degree + (rulerPosition.minutes || 0) / 60,
        chart.houseCusps
      );
    }
    
    const interpretation = rulerHouse 
      ? getHouseLordInterpretation(h, rulerHouse)
      : 'Ruler placement unknown.';
    
    houseLords.push({
      house: h,
      sign,
      ruler,
      rulerSign,
      rulerHouse,
      interpretation
    });
  }

  // Find interesting connections (lords in each other's houses)
  const connections: Array<{ h1: number; h2: number; ruler1: string; ruler2: string }> = [];
  for (let i = 0; i < houseLords.length; i++) {
    for (let j = i + 1; j < houseLords.length; j++) {
      const hl1 = houseLords[i];
      const hl2 = houseLords[j];
      
      if (hl1.rulerHouse === hl2.house && hl2.rulerHouse === hl1.house) {
        connections.push({
          h1: hl1.house,
          h2: hl2.house,
          ruler1: hl1.ruler,
          ruler2: hl2.ruler
        });
      }
    }
  }

  const displayedHouses = expanded ? houseLords : houseLords.slice(0, 6);

  return (
    <Card className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Home className="text-sky-500" size={16} />
            House Lord Analysis
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30">
            How Life Areas Connect
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Each house is ruled by a planet. Where that planet is placed shows how that life area unfolds and what it connects to.
        </p>

        {/* Mutual Connections */}
        {connections.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">Linked Life Areas</span>
            </div>
            {connections.map((conn, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">H{conn.h1}</Badge>
                <span>{PLANET_SYMBOLS[conn.ruler1]}</span>
                <span>↔</span>
                <span>{PLANET_SYMBOLS[conn.ruler2]}</span>
                <Badge variant="outline" className="text-[10px]">H{conn.h2}</Badge>
                <span className="text-foreground ml-1">
                  {HOUSE_MEANINGS[conn.h1].title} & {HOUSE_MEANINGS[conn.h2].title} are intertwined
                </span>
              </div>
            ))}
          </div>
        )}

        {/* House Lord Grid */}
        <div className="space-y-2">
          {displayedHouses.map((hl) => (
            <div key={hl.house} className="p-2 bg-background/50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/30 min-w-[50px] justify-center"
                >
                  House {hl.house}
                </Badge>
                <span className="text-xs text-muted-foreground">{hl.sign}</span>
                <ArrowRight size={12} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  {PLANET_SYMBOLS[hl.ruler]} {hl.ruler}
                </span>
                {hl.rulerHouse && (
                  <>
                    <span className="text-xs text-muted-foreground">in</span>
                    <Badge variant="outline" className="text-[10px]">
                      H{hl.rulerHouse}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({hl.rulerSign})</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground pl-1">
                {hl.interpretation}
              </p>
            </div>
          ))}
        </div>

        {/* Expand/Collapse */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs"
        >
          {expanded ? (
            <>Show Less <ChevronUp size={14} className="ml-1" /></>
          ) : (
            <>Show All 12 Houses <ChevronDown size={14} className="ml-1" /></>
          )}
        </Button>

        {/* Key Insight */}
        <div className="bg-background/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground italic">
            💡 <span className="text-foreground font-medium">How to read this:</span> The ruler of House 7 (partnership) 
            in House 10 means your relationships deeply affect your career, or you meet partners through work.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
