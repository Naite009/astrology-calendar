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

// Comprehensive house lord interpretations - deeply archetypal and experiential
const HOUSE_LORD_INTERPRETATIONS: Record<string, string> = {
  // 1st House Lord placements - Where does your sense of SELF get activated?
  '1-1': 'Your identity is self-referential—you are your own compass. Life feels most real when you\'re initiating something purely your own. You don\'t need external mirrors to know who you are.',
  '1-2': 'You discover who you are through what you build, earn, and value. Your sense of self is tied to resource-gathering—not greed, but the primal satisfaction of "I created this with my own hands."',
  '1-3': 'You find yourself through learning, speaking, and mental exploration. Your identity crystallizes in conversations, through writing, or in relationship with siblings and neighbors. You think, therefore you are.',
  '1-4': 'Your deepest self lives at home. You may only feel truly "yourself" in private, with family, or in spaces that hold your emotional history. The roots run deep—identity emerges from ancestry.',
  '1-5': 'You become YOU through creative self-expression, romance, or play. Children (literal or creative) reflect back who you really are. Joy and pleasure aren\'t extras—they\'re how you exist.',
  '1-6': 'Your identity is forged through work, service, and crisis. You discover who you are by what you fix, heal, or improve. The daily grind is where you become real.',
  '1-7': 'You cannot fully know yourself except through another\'s eyes. Partners are mirrors—the "other" reveals the self. Marriage or committed partnership is where you become fully formed.',
  '1-8': 'Your sense of self is forged in crisis, intimacy, and transformation. You discover who you are through what you\'ve survived. Death, sex, and merging with another\'s resources reveal your core.',
  '1-9': 'You find yourself through belief, philosophy, and far-reaching journeys. Foreign lands or foreign ideas show you who you really are. The quest is the identity.',
  '1-10': 'Your identity IS your career, mission, or public role. You feel most yourself when achieving, leading, or being recognized. The world stage is where you come alive.',
  '1-11': 'You discover who you are through groups, friends, and collective causes. Your identity emerges in community—you know yourself through your hopes and the people who share them.',
  '1-12': 'Your truest self is hidden, private, or spiritual. You may feel most "yourself" in solitude, meditation, or unconscious states. The visible persona is a veil over something deeper.',

  // 2nd House Lord placements - Where do your RESOURCES and VALUES flow?
  '2-1': 'Your body IS your resource. Self-worth and money come through personal initiative—you are the product. What you earn reflects who you are at the deepest level.',
  '2-2': 'Resources are self-generating and self-contained. Your money stays in your pocket; your values are internally consistent. Financial independence is non-negotiable.',
  '2-3': 'Money flows through communication, ideas, and short journeys. Siblings or neighbors affect finances. Your voice, writing, or local connections are economic assets.',
  '2-4': 'Wealth comes from or stays in the family. Real estate, inheritance, or home-based work are likely. Your emotional security and financial security are the same thing.',
  '2-5': 'You earn through creativity, speculation, or children. Romance can affect finances. Pleasure is not frivolous—it\'s how you attract abundance. Play IS productivity.',
  '2-6': 'Daily work generates resources. Health and finances are linked—you can\'t afford to be sick, or illness costs you. Service industries suit you economically.',
  '2-7': 'Partners bring or affect resources. Business partnerships, marriage finances, or consulting work shape your worth. What you value, you find through others.',
  '2-8': 'Your money is entangled with others\'. Inheritance, insurance, taxes, or a partner\'s income are central themes. Transformation comes through financial crisis or merger.',
  '2-9': 'Wealth comes from foreign sources, higher education, or publishing. Your values are philosophical. You may literally profit from beliefs, teaching, or distant lands.',
  '2-10': 'Career is the source of all resources. Public reputation directly affects income. Your worth is measured in achievement—and you\'re okay with that.',
  '2-11': 'Friends and groups affect finances. Income through networks, tech, or humanitarian causes. Your values align with future visions and collective movements.',
  '2-12': 'Money comes from hidden sources, institutions, or spiritual work. You may donate heavily or have secret wealth. Resources flow through hospitals, prisons, or meditation centers.',

  // 3rd House Lord placements - Where does your MIND and COMMUNICATION flow?
  '3-1': 'Your mind is your identity. You\'re known for how you think and speak. Curiosity isn\'t a trait—it\'s who you ARE. Siblings or neighbors shaped your self-image.',
  '3-2': 'Your mind is focused on resources. You think about money, values, and practical matters. Communication skills are literal earning power.',
  '3-3': 'Your mind is at home in learning. Ideas feed more ideas. Siblings and neighbors are central to your mental world. Writing, teaching, or local connection is your calling.',
  '3-4': 'Learning happens at home. Family shapes your thinking. You may work from home in communication fields, or your emotional security depends on mental stimulation.',
  '3-5': 'Communication is creative expression. You think playfully; your mind is drawn to romance, children, or speculation. Writing is art; teaching is performance.',
  '3-6': 'Your mind is focused on work and health. You think practically, analytically. Mental work dominates daily life. Nervous system health matters enormously.',
  '3-7': 'You think through partnership. Dialogue is essential—you need a sparring partner to clarify ideas. Marriage or contracts heavily involve communication.',
  '3-8': 'Your mind goes to the depths. You think about death, psychology, and hidden truths. Research, investigation, or taboo subjects attract your curiosity.',
  '3-9': 'Learning leads to wisdom. Your local curiosity expands into philosophy, religion, or foreign languages. The neighborhood becomes the world.',
  '3-10': 'Communication IS career. Your voice, writing, or teaching is your public contribution. Siblings or neighbors may affect reputation.',
  '3-11': 'Your mind is oriented toward the future and community. You think about social change, technology, or group dynamics. Friends are intellectual companions.',
  '3-12': 'Your mind needs solitude. Thinking happens in private; writing may be therapeutic. Communication with the unseen or the institutionalized is possible.',

  // 4th House Lord placements - Where does your EMOTIONAL FOUNDATION anchor?
  '4-1': 'Home is self. Your physical presence carries your ancestry. Family patterns are visible in your body and persona. Emotional security IS identity.',
  '4-2': 'Emotional security requires financial security. Family shapes values. Ancestral wealth or real estate matters. The home must be materially stable.',
  '4-3': 'Home is in the mind. You may live near siblings, or constantly move locally. Family communication patterns are foundational. Emotional life is intellectual.',
  '4-4': 'Deep roots, contained. Your foundation is solid and self-sufficient. Family traditions are preserved. Home life is a complete world unto itself.',
  '4-5': 'Home is a place of joy, creativity, and play. Children create emotional foundation. The family of origin may have been theatrical or artistic.',
  '4-6': 'Home life is work, or work is home. Family members may have health issues. Daily routines ARE emotional security. Service was modeled in childhood.',
  '4-7': 'Partners become family. Marriage creates home in a way the family of origin didn\'t. Emotional foundation is found through committed relationships.',
  '4-8': 'Family holds secrets, trauma, or intensity. Emotional foundation was forged in crisis. Inheritance—psychological or material—is central to your roots.',
  '4-9': 'Home may be far from birthplace. Philosophy or religion shaped the family atmosphere. Emotional security comes from belief systems and expansion.',
  '4-10': 'Family and career are inseparable. A parent may have been a public figure, or you run a family business. Your roots ARE your reputation.',
  '4-11': 'Friends feel like family. Groups provide emotional security. The family of origin may have been unconventional, or community replaces blood ties.',
  '4-12': 'Emotional foundation is hidden or spiritual. Family secrets, institutional care, or mystical roots. Home may be a retreat center, hospital, or somewhere unseen.',

  // 5th House Lord placements - Where does CREATIVE EXPRESSION and JOY flow?
  '5-1': 'Creativity IS identity. You express yourself through play, romance, or art. Children (literal or creative) define you. Joy is not optional—it\'s essential.',
  '5-2': 'Creativity generates resources. Romance affects finances. Children may cost or earn. Your values center on pleasure, art, or self-expression.',
  '5-3': 'Creativity flows through communication. Writing, teaching, or performing for local audiences. Children connect you to siblings or neighbors.',
  '5-4': 'Creative expression happens at home. Joy comes from family. Children may stay close. The inner child needs domestic safety to play.',
  '5-5': 'Pure creative power. Self-expression is contained and potent. Romance is romance; art is art. No need to mix life areas—joy is complete in itself.',
  '5-6': 'Creativity requires work. Joy comes through service or health practices. Children may need extra care. Play has a practical purpose.',
  '5-7': 'Romance leads to marriage. Creative projects need partners. Children connect you to significant others. Love affairs become commitments.',
  '5-8': 'Creativity touches the depths. Art explores death, sexuality, or psychology. Romance is intense and transformative. Joy comes through crisis navigation.',
  '5-9': 'Creativity expands into philosophy. Art serves belief. Romance may involve foreigners or teachers. Joy is found in the quest for meaning.',
  '5-10': 'Creative expression IS career. Art, performance, or work with children becomes your public role. Romance may affect reputation.',
  '5-11': 'Creativity serves the collective. Friends become lovers or creative collaborators. Children connect you to communities. Joy is shared.',
  '5-12': 'Creativity is private or spiritual. Art may be therapeutic, mystical, or hidden. Romance involves sacrifice or secrets. Joy requires solitude.',

  // 6th House Lord placements - Where does SERVICE and DAILY WORK flow?
  '6-1': 'Work IS identity. You are what you do. Health and self-image are inseparable. Service is not what you give—it\'s who you are.',
  '6-2': 'Daily work generates income. Health affects earning ability. Pets or employees are financial factors. Practical skills are economic assets.',
  '6-3': 'Work involves communication. Health requires mental stimulation. Daily routines include siblings or short trips. Service through teaching or writing.',
  '6-4': 'Work happens at home, or home requires constant maintenance. Family health is your responsibility. Domestic service dominates daily life.',
  '6-5': 'Work is creative. Daily routines include joy and play. Health requires pleasure. Children may need extra practical care.',
  '6-6': 'Pure service. Work stays in the work realm. Health routines are solid. Employees and pets are central. No need to mix life areas.',
  '6-7': 'Work involves partnerships. Health may be affected by relationships. Employees or coworkers become significant others. Service through consulting.',
  '6-8': 'Daily work touches crisis, death, or other people\'s resources. Health crises are transformative. Service in intense or taboo fields.',
  '6-9': 'Work involves teaching, travel, or foreign elements. Health philosophies matter. Daily routines include learning or belief practices.',
  '6-10': 'Daily work IS career. No separation between the grind and the glory. Health affects reputation. Service is your public contribution.',
  '6-11': 'Work serves community. Friends may be coworkers. Health is affected by groups or technology. Daily routines include future-focused activities.',
  '6-12': 'Work happens in hidden places—hospitals, prisons, ashrams. Health requires solitude or spiritual practice. Service to the suffering or unseen.',

  // 7th House Lord placements - Where do PARTNERSHIPS manifest?
  '7-1': 'Partners mirror the self. You become yourself through marriage or committed relationships. The "other" is a reflection of your own identity.',
  '7-2': 'Partners affect resources. Marriage is an economic partnership. Your values are shaped by significant others. Business partnerships matter financially.',
  '7-3': 'Partners are mental companions. Marriage involves constant communication. Contracts with siblings or neighbors. Relationships need intellectual stimulation.',
  '7-4': 'Partners become family. Marriage creates home. You may marry someone from your hometown or your partner becomes your emotional foundation.',
  '7-5': 'Partnership is romance. Marriage must remain playful. Creative collaborations are central. Children come through committed relationships.',
  '7-6': 'Partners require service. Marriage involves daily work or health considerations. You may marry an employee or someone you serve.',
  '7-7': 'Pure partnership. Relationships are their own realm. Marriage is marriage—no mixing with other life areas. The "other" is complete.',
  '7-8': 'Partnership involves deep transformation. Marriage touches death, sex, or joint resources. Contracts have hidden dimensions. Intensity in relationships.',
  '7-9': 'Partners come from far away—geographically or philosophically. Marriage involves belief systems. You may marry a teacher or foreigner.',
  '7-10': 'Partnership IS career. Marriage affects public standing. Business partnerships are central to reputation. You may marry a public figure.',
  '7-11': 'Partners come through groups or friends. Marriage serves collective goals. Your hopes and wishes involve significant others.',
  '7-12': 'Partnerships involve sacrifice or secrecy. Hidden relationships or spiritual unions. Marriage may require solitude or institutional settings.',

  // 8th House Lord placements - Where does TRANSFORMATION occur?
  '8-1': 'Transformation IS identity. You are reborn constantly. Crisis shapes the persona. Death, sex, or others\' resources define who you are.',
  '8-2': 'Transformation through resources. Financial crisis is psychological crisis. Inheritance or debt shapes values. Others\' money affects self-worth.',
  '8-3': 'Transformation through ideas. Deep research, occult studies, or taboo communication. Death of siblings or neighborhood creates change.',
  '8-4': 'Transformation happens at home. Family secrets or ancestral trauma. Crisis in the domestic realm. Death and real estate are linked.',
  '8-5': 'Transformation through creativity or romance. Intense love affairs. Children may face crisis. Art explores death and regeneration.',
  '8-6': 'Transformation through daily work or health. Illness as initiation. Service in crisis fields. Employees or pets trigger deep change.',
  '8-7': 'Transformation through partnership. Marriage is a death-rebirth experience. Contracts have deep psychological stakes. Partners bring crisis.',
  '8-8': 'Pure transformation. Crisis stays in its realm. Death is death; sex is sex. No need to spread the intensity. Mastery of the depths.',
  '8-9': 'Transformation through philosophy or travel. Death of beliefs. Crisis in foreign lands. Teaching or publishing about deep subjects.',
  '8-10': 'Transformation IS career. Public role involves death, psychology, or others\' resources. Crisis affects reputation. Power dynamics at work.',
  '8-11': 'Transformation through groups or friends. Crisis in collective settings. Others\' resources flow through networks. Technology or future visions trigger change.',
  '8-12': 'Transformation in hidden places. Deep spiritual initiation. Crisis in hospitals, prisons, or solitude. The unseen world triggers rebirth.',

  // 9th House Lord placements - Where does EXPANSION and MEANING flow?
  '9-1': 'Belief IS identity. Philosophy shapes the persona. You are your worldview. Foreign lands or higher education define who you are.',
  '9-2': 'Belief generates resources. Income through teaching, publishing, or foreign sources. Values are philosophical. Wisdom has economic worth.',
  '9-3': 'Philosophy flows through communication. Teaching, writing about beliefs. Local learning expands into higher education. Siblings involve foreign elements.',
  '9-4': 'Belief roots the home. Philosophy shapes family. You may emigrate or have foreign ancestry. Emotional security comes from worldview.',
  '9-5': 'Expansion through creativity. Philosophy is art. Foreign romance or children abroad. Joy comes from the quest for meaning.',
  '9-6': 'Belief shapes daily work. Health philosophies matter. Service abroad or in educational fields. Teaching as daily routine.',
  '9-7': 'Partners expand worldview. Marriage to foreigners or teachers. Belief systems attract significant others. Travel through partnership.',
  '9-8': 'Expansion through crisis. Philosophy addresses death and transformation. Foreign inheritance. Teaching about taboo subjects.',
  '9-9': 'Pure expansion. Philosophy stays philosophical. Travel is travel; teaching is teaching. No need to mix—the quest is complete.',
  '9-10': 'Belief IS career. Teaching, publishing, or international work as public role. Reputation involves philosophy or foreign elements.',
  '9-11': 'Expansion through groups. Friends share beliefs. Collective causes involve philosophy or foreign elements. Hopes are universal.',
  '9-12': 'Expansion in solitude. Spiritual retreat or foreign ashrams. Philosophy goes mystical. Belief transcends visible religion.',

  // 10th House Lord placements - Where does CAREER and PUBLIC ROLE manifest?
  '10-1': 'Career IS identity. The public role is the true self. Achievement defines the persona. You were born for visibility.',
  '10-2': 'Career generates resources. Reputation and income are inseparable. Public role shapes values. What you achieve, you own.',
  '10-3': 'Career involves communication. Writing, speaking, or teaching as public role. Reputation in local community. Siblings affect career.',
  '10-4': 'Career roots in family. Home-based business or family legacy profession. Reputation shaped by ancestry. The private is public.',
  '10-5': 'Career is creative. Performance, art, or work with children as public role. Reputation involves romance or joy.',
  '10-6': 'Career is daily service. Reputation for hard work and practical skills. Health fields as public contribution.',
  '10-7': 'Career through partnership. Business marriages or consulting. Reputation involves significant others. Public role is relational.',
  '10-8': 'Career involves transformation. Public role in crisis fields, psychology, or others\' resources. Reputation for depth.',
  '10-9': 'Career involves expansion. Teaching, publishing, or international work. Reputation for wisdom or foreign expertise.',
  '10-10': 'Pure career. Achievement stays in its realm. Public role is solid and self-contained. Reputation speaks for itself.',
  '10-11': 'Career serves community. Public role in groups, technology, or future causes. Reputation for innovation.',
  '10-12': 'Career in hidden places. Public role in institutions, hospitals, or spiritual settings. Reputation for sacrifice or mystery.',

  // 11th House Lord placements - Where do HOPES and COMMUNITY flow?
  '11-1': 'Community IS identity. Friends define the self. Hopes and wishes shape the persona. You are your networks.',
  '11-2': 'Community generates resources. Friends affect finances. Group values shape personal worth. Income through networks.',
  '11-3': 'Hopes flow through communication. Friends are mental companions. Groups involve siblings or neighbors. Future visions are written or spoken.',
  '11-4': 'Community roots at home. Friends become family. Hopes involve domestic security. Groups gather in private spaces.',
  '11-5': 'Community feeds creativity. Friends become lovers or collaborators. Hopes involve children or art. Groups gather for joy.',
  '11-6': 'Community involves service. Friends are coworkers. Hopes require daily effort. Groups form around health or practical causes.',
  '11-7': 'Community comes through partnership. Friends become spouses. Hopes involve significant others. Groups form around relationships.',
  '11-8': 'Community involves transformation. Friends bring crisis or shared resources. Hopes touch the depths. Groups form around intensity.',
  '11-9': 'Community expands beliefs. Friends are teachers or foreigners. Hopes are philosophical. Groups form around wisdom traditions.',
  '11-10': 'Community IS career. Friends affect reputation. Professional networks are central. Hopes involve achievement.',
  '11-11': 'Pure community. Friends stay friends; hopes stay hopes. Networks are solid and complete. The collective is its own realm.',
  '11-12': 'Community is hidden or spiritual. Secret groups or solitary hopes. Friends in institutions. The collective goes unseen.',

  // 12th House Lord placements - Where does TRANSCENDENCE and HIDDEN LIFE flow?
  '12-1': 'The hidden is visible. Spirituality shapes the persona. Solitude defines identity. You carry the unseen into the seen.',
  '12-2': 'The hidden affects resources. Money from secret sources. Values are spiritual. Finances may flow through institutions.',
  '12-3': 'The hidden flows through communication. Writing about spiritual matters. Secret communications. Siblings in institutions.',
  '12-4': 'The hidden roots at home. Family secrets or spiritual household. Solitude at home. Ancestors carry mystery.',
  '12-5': 'The hidden touches creativity. Secret romances or hidden children. Art is therapeutic. Joy requires privacy.',
  '12-6': 'The hidden is daily work. Service in hidden places—hospitals, prisons. Health issues may be invisible. Solitude as routine.',
  '12-7': 'The hidden touches partnership. Secret relationships or spiritual unions. Marriage involves sacrifice. Partners carry mystery.',
  '12-8': 'The hidden meets transformation. Deep spiritual initiation. Secret inheritances. Crisis in isolation.',
  '12-9': 'The hidden expands beliefs. Mystical philosophy. Solitary journeys. Spiritual teachers or foreign retreats.',
  '12-10': 'The hidden IS career. Public role in institutions, spirituality, or hidden service. Reputation for mystery.',
  '12-11': 'The hidden touches community. Secret groups or spiritual networks. Hopes are private. Friends in institutions.',
  '12-12': 'Pure transcendence. The hidden stays hidden. Solitude is complete. Spirituality needs no external expression.'
};

// Get the interpretation for a house lord placement
function getHouseLordInterpretation(rulingHouse: number, placedHouse: number): string {
  const key = `${rulingHouse}-${placedHouse}`;
  return HOUSE_LORD_INTERPRETATIONS[key] || 'This connection reveals a unique interplay between life areas that merits personal reflection.';
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
