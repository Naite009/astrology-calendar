import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EclipseInterpretationLayer, extractNatalPoints } from './EclipseInterpretationLayer';
import { buildAxisTeaching, type ZodiacSign } from '@/lib/astrology/signTeacher';
import { getProximityBadge } from '@/lib/astrology/eclipseAspects';
import { normalizeEclipseNodal } from '@/lib/astrology/eclipseNodalGuard';

// ── Verified eclipse data from Cafe Astrology / NASA ──
export interface EclipseEvent {
  date: string;
  type: 'solar' | 'lunar';
  subtype: 'total' | 'annular' | 'partial' | 'penumbral' | 'annular-total';
  sign: ZodiacSign;
  degree: number;
  minutes: number;
  nodal: 'north' | 'south';
  series: string;
  description: string;
}

const ECLIPSE_SERIES: Record<string, { label: string; glyphs: string; period: string; status: string; description: string; events: EclipseEvent[] }> = {
  'Aries-Libra': {
    label: 'Aries ↔ Libra',
    glyphs: '♈ ♎',
    period: '2023–2025',
    status: 'ending',
    description: 'Self vs. Other — identity, independence, relationships, and compromise. This series is winding down with its final eclipse in March 2025.',
    events: [
      { date: '2023-04-20', type: 'solar', subtype: 'annular-total', sign: 'Aries', degree: 29, minutes: 50, nodal: 'north', series: 'Aries-Libra', description: 'Hybrid solar eclipse at 29° Aries — powerful anaretic degree new beginning in self-identity.' },
      { date: '2023-10-14', type: 'solar', subtype: 'annular', sign: 'Libra', degree: 21, minutes: 8, nodal: 'south', series: 'Aries-Libra', description: 'Annular "ring of fire" eclipse in Libra — karmic release in relationships and partnerships.' },
      { date: '2024-03-25', type: 'lunar', subtype: 'penumbral', sign: 'Libra', degree: 5, minutes: 7, nodal: 'south', series: 'Aries-Libra', description: 'Penumbral lunar eclipse in Libra — subtle emotional processing around relationship dynamics.' },
      { date: '2024-04-08', type: 'solar', subtype: 'total', sign: 'Aries', degree: 19, minutes: 24, nodal: 'north', series: 'Aries-Libra', description: 'Total solar eclipse in Aries — major new beginning in self-expression and courage. Visible across North America.' },
      { date: '2024-10-02', type: 'solar', subtype: 'annular', sign: 'Libra', degree: 10, minutes: 4, nodal: 'south', series: 'Aries-Libra', description: 'Final solar eclipse in Libra — last call to release outdated relationship patterns.' },
      { date: '2025-03-29', type: 'solar', subtype: 'partial', sign: 'Aries', degree: 9, minutes: 0, nodal: 'north', series: 'Aries-Libra', description: 'Final partial solar eclipse in Aries — closing the Aries-Libra chapter. Last seeding of self-identity themes.' },
    ],
  },
  'Virgo-Pisces': {
    label: 'Virgo ↔ Pisces',
    glyphs: '♍ ♓',
    period: '2024–2027',
    status: 'active',
    description: 'Service vs. Surrender — health, routines, analysis, spirituality, intuition, and letting go. These LUNAR eclipses overlap with the Leo-Aquarius solar eclipses.',
    events: [
      { date: '2024-09-18', type: 'lunar', subtype: 'partial', sign: 'Pisces', degree: 25, minutes: 41, nodal: 'south', series: 'Virgo-Pisces', description: 'Partial lunar eclipse in Pisces — emotional release around spiritual boundaries and escapism.' },
      { date: '2025-03-14', type: 'lunar', subtype: 'total', sign: 'Virgo', degree: 23, minutes: 57, nodal: 'north', series: 'Virgo-Pisces', description: 'Total lunar eclipse in Virgo — powerful culmination around health, work, and daily practices.' },
      { date: '2025-09-07', type: 'lunar', subtype: 'total', sign: 'Pisces', degree: 15, minutes: 23, nodal: 'south', series: 'Virgo-Pisces', description: 'Total lunar eclipse in Pisces — deep emotional release, spiritual breakthroughs, dissolving old illusions.' },
      { date: '2025-09-21', type: 'solar', subtype: 'partial', sign: 'Virgo', degree: 29, minutes: 5, nodal: 'north', series: 'Virgo-Pisces', description: 'Partial solar eclipse at 29° Virgo — anaretic degree! Final harvest of Virgo themes before the nodes fully shift.' },
      { date: '2026-03-03', type: 'lunar', subtype: 'total', sign: 'Virgo', degree: 12, minutes: 54, nodal: 'south', series: 'Virgo-Pisces', description: 'Total lunar eclipse in Virgo — continuing to illuminate health, service, and discernment themes.' },
      { date: '2026-08-28', type: 'lunar', subtype: 'partial', sign: 'Pisces', degree: 4, minutes: 54, nodal: 'south', series: 'Virgo-Pisces', description: 'Partial lunar eclipse in Pisces — releasing spiritual bypassing, refining compassion and boundaries.' },
      { date: '2027-02-20', type: 'lunar', subtype: 'penumbral', sign: 'Virgo', degree: 2, minutes: 6, nodal: 'north', series: 'Virgo-Pisces', description: 'Final penumbral lunar eclipse in Virgo — gentle closing of the Virgo-Pisces cycle.' },
    ],
  },
  'Leo-Aquarius': {
    label: 'Leo ↔ Aquarius',
    glyphs: '♌ ♒',
    period: '2026–2028',
    status: 'upcoming',
    description: 'Self-Expression vs. Community — creativity, heart, leadership, individuality, group consciousness, and humanitarian vision. All SOLAR eclipses fall on this axis.',
    events: [
      { date: '2026-02-17', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 28, minutes: 50, nodal: 'south', series: 'Leo-Aquarius', description: 'First solar eclipse on the Leo-Aquarius axis — opening a new chapter around individuality vs. collective belonging.' },
      { date: '2026-08-12', type: 'solar', subtype: 'total', sign: 'Leo', degree: 20, minutes: 2, nodal: 'north', series: 'Leo-Aquarius', description: 'Total solar eclipse in Leo — powerful creative and leadership reset. Heart-centered new chapters.' },
      { date: '2027-02-06', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 17, minutes: 38, nodal: 'south', series: 'Leo-Aquarius', description: 'Deepening Aquarius themes — humanitarian vision, innovation, and releasing ego attachment.' },
      { date: '2027-08-02', type: 'solar', subtype: 'total', sign: 'Leo', degree: 9, minutes: 55, nodal: 'north', series: 'Leo-Aquarius', description: 'Second total solar eclipse in Leo — the story of self-expression and courage reaches its crescendo.' },
      { date: '2027-08-17', type: 'lunar', subtype: 'penumbral', sign: 'Aquarius', degree: 24, minutes: 12, nodal: 'south', series: 'Leo-Aquarius', description: 'Penumbral lunar eclipse in Aquarius — subtle emotional release around group dynamics and independence.' },
      { date: '2028-01-26', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 6, minutes: 11, nodal: 'south', series: 'Leo-Aquarius', description: 'Final solar eclipse of the Leo-Aquarius series — completing the cycle of individuation vs. community.' },
    ],
  },
  'Cancer-Capricorn': {
    label: 'Cancer ↔ Capricorn',
    glyphs: '♋ ♑',
    period: '2027–2029',
    status: 'next',
    description: 'Home vs. Career — emotional security, family, nurturing, ambition, public reputation, and authority. The next major axis to activate.',
    events: [
      { date: '2027-07-18', type: 'lunar', subtype: 'penumbral', sign: 'Capricorn', degree: 25, minutes: 49, nodal: 'south', series: 'Cancer-Capricorn', description: 'First eclipse of the Cancer-Capricorn series — subtle shifts around career authority and legacy.' },
      { date: '2028-01-12', type: 'lunar', subtype: 'partial', sign: 'Cancer', degree: 21, minutes: 28, nodal: 'north', series: 'Cancer-Capricorn', description: 'Partial lunar eclipse in Cancer — emotional revelations around home, family, and security needs.' },
      { date: '2028-07-06', type: 'lunar', subtype: 'partial', sign: 'Capricorn', degree: 15, minutes: 11, nodal: 'south', series: 'Cancer-Capricorn', description: 'Partial lunar eclipse in Capricorn — releasing outdated career or authority structures.' },
      { date: '2028-07-22', type: 'solar', subtype: 'total', sign: 'Cancer', degree: 29, minutes: 51, nodal: 'north', series: 'Cancer-Capricorn', description: 'Total solar eclipse at 29° Cancer — powerful anaretic degree new beginning in home and family.' },
      { date: '2028-12-31', type: 'lunar', subtype: 'total', sign: 'Cancer', degree: 10, minutes: 33, nodal: 'north', series: 'Cancer-Capricorn', description: 'Total lunar eclipse in Cancer — deep emotional culmination around nurturing and belonging.' },
      { date: '2029-06-26', type: 'lunar', subtype: 'total', sign: 'Capricorn', degree: 4, minutes: 50, nodal: 'south', series: 'Cancer-Capricorn', description: 'Total lunar eclipse in Capricorn — major karmic release around ambition and public role.' },
    ],
  },
};

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const TEACHING_TAGS: Record<string, string[]> = {
  '2026-03-03': ['System audit', 'Cause & effect', 'Mutable Earth refinement'],
};

function getSignGlyph(sign: string): string {
  const glyphs: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
  };
  return glyphs[sign] || '';
}

function getHouseForDegree(sign: string, degree: number, chart: NatalChart): number | null {
  if (!chart.houseCusps) return null;
  const signIdx = ZODIAC_ORDER.indexOf(sign);
  if (signIdx === -1) return null;
  const longitude = signIdx * 30 + degree;

  const cusps: { house: number; lng: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof chart.houseCusps;
    const c = chart.houseCusps[key];
    if (!c?.sign) return null;
    const cIdx = ZODIAC_ORDER.indexOf(c.sign);
    cusps.push({ house: i, lng: cIdx * 30 + (c.degree || 0) + ((c.minutes || 0) / 60) });
  }

  for (let i = 0; i < 12; i++) {
    const start = cusps[i].lng;
    const end = cusps[(i + 1) % 12].lng;
    const adjustedEnd = end <= start ? end + 360 : end;
    const adjustedLng = longitude < start ? longitude + 360 : longitude;
    if (adjustedLng >= start && adjustedLng < adjustedEnd) return cusps[i].house;
  }
  return 1;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const HOUSE_LIFE_AREAS: Record<number, string> = {
  1: 'Identity, body, self-image, how others see you',
  2: 'Money, possessions, self-worth, personal resources',
  3: 'Communication, siblings, local travel, learning',
  4: 'Home, family, roots, emotional foundations',
  5: 'Romance, creativity, children, joy, self-expression',
  6: 'Health, daily routines, work, service, pets',
  7: 'Partnerships, marriage, one-on-one relationships',
  8: 'Shared resources, transformation, intimacy, death/rebirth',
  9: 'Higher education, travel, philosophy, beliefs, publishing',
  10: 'Career, public reputation, legacy, authority',
  11: 'Friends, groups, hopes, wishes, community',
  12: 'Spirituality, solitude, hidden matters, the unconscious',
};

const LS_KEYS = {
  tab: 'eclipseExplorer.activeTab',
  eclipse: 'eclipseExplorer.selectedEclipseDate',
  chart: 'eclipseExplorer.selectedChartId',
};

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function EclipseEncyclopediaExplorer({ userNatalChart, savedCharts }: Props) {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(() => {
    try { return localStorage.getItem(LS_KEYS.chart); } catch { return null; }
  });
  const [activeSeriesTab, setActiveSeriesTab] = useState(() => {
    try { return localStorage.getItem(LS_KEYS.tab) || 'all'; } catch { return 'all'; }
  });
  const [selectedEclipse, setSelectedEclipse] = useState<EclipseEvent | null>(null);
  const teacherRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const allEclipsesSorted = useMemo(() => {
    const all: EclipseEvent[] = [];
    Object.values(ECLIPSE_SERIES).forEach(s => all.push(...s.events));
    return all.map(normalizeEclipseNodal).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const nextUpcomingEclipse = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return allEclipsesSorted.find(e => e.date >= now) ?? allEclipsesSorted[0] ?? null;
  }, [allEclipsesSorted]);

  // Restore selected eclipse from localStorage on mount
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem(LS_KEYS.eclipse);
      if (savedDate) {
        const found = allEclipsesSorted.find(e => e.date === savedDate);
        if (found) setSelectedEclipse(found);
      }
    } catch { /* ignore */ }
  }, [allEclipsesSorted]);

  // Persist state to localStorage
  useEffect(() => {
    try { localStorage.setItem(LS_KEYS.tab, activeSeriesTab); } catch { /* */ }
  }, [activeSeriesTab]);

  useEffect(() => {
    try {
      if (selectedEclipse?.date) localStorage.setItem(LS_KEYS.eclipse, selectedEclipse.date);
    } catch { /* */ }
  }, [selectedEclipse?.date]);

  useEffect(() => {
    try {
      if (selectedChartId) localStorage.setItem(LS_KEYS.chart, selectedChartId);
      else localStorage.removeItem(LS_KEYS.chart);
    } catch { /* */ }
  }, [selectedChartId]);

  const handleSelectEclipse = useCallback((e: EclipseEvent) => {
    setSelectedEclipse(e);
    requestAnimationFrame(() => teacherRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const scrollToTimeline = useCallback(() => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const activeEclipse = selectedEclipse || nextUpcomingEclipse;

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    savedCharts.forEach(c => {
      if (!userNatalChart || c.name !== userNatalChart.name) charts.push(c);
    });
    return charts;
  }, [userNatalChart, savedCharts]);

  const selectedChart = selectedChartId
    ? allCharts.find(c => c.name === selectedChartId) || allCharts[0] || null
    : allCharts[0] || null;

  const activeSeries = ECLIPSE_SERIES[activeSeriesTab];

  // Compute current list for prev/next navigation
  const currentList = useMemo(() => {
    if (activeSeriesTab === 'all') return allEclipsesSorted;
    return activeSeries?.events ?? allEclipsesSorted;
  }, [activeSeriesTab, activeSeries, allEclipsesSorted]);

  // Precompute proximity badges
  const natalPoints = useMemo(() => {
    if (!selectedChart) return null;
    return extractNatalPoints(selectedChart);
  }, [selectedChart]);

  const proximityByDate = useMemo(() => {
    if (!natalPoints) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const e of allEclipsesSorted) {
      const badge = getProximityBadge(e, natalPoints);
      if (badge) m.set(e.date, badge);
    }
    return m;
  }, [allEclipsesSorted, natalPoints]);

  const personalizedEvents = useMemo(() => {
    if (!selectedChart?.houseCusps || !activeSeries) return null;
    return activeSeries.events.map(e => {
      const house = getHouseForDegree(e.sign, e.degree, selectedChart);
      const oppositeSign = ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(e.sign) + 6) % 12];
      const oppositeHouse = getHouseForDegree(oppositeSign, e.degree, selectedChart);
      return { ...e, house, oppositeHouse };
    });
  }, [selectedChart, activeSeries]);

  const renderProximityBadge = (date: string) => {
    const prox = proximityByDate.get(date);
    if (!prox) return null;
    return <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">🧲 {prox}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* ── Education Section ── */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">🌑</span> Understanding Eclipses
          </CardTitle>
          <p className="text-muted-foreground">
            Eclipses are the most powerful lunation events in astrology — cosmic wildcards that accelerate fate, reveal hidden truths, and open portals to major life changes.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" defaultValue={['what', 'solar-vs-lunar', 'nodes']}>
            <AccordionItem value="what">
              <AccordionTrigger className="text-lg font-semibold">What Are Eclipses?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  Eclipses happen when New Moons or Full Moons align closely with the <strong>Lunar Nodes</strong> — the points where the Moon's orbit crosses the Sun's path (the ecliptic). This alignment creates a literal shadow event: the light of the Sun or Moon is temporarily blocked.
                </p>
                <p>
                  Astrologically, eclipses represent <strong>fate-accelerating events</strong>. They open and close chapters of your life, often bringing sudden revelations, endings, or beginnings that feel "meant to be." Unlike regular New and Full Moons, eclipse effects can unfold over <strong>6 months to a year</strong>.
                </p>
                <p>
                  Eclipses travel in pairs along an <strong>axis</strong> (two opposite signs), cycling through each axis for about 18 months before moving on.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="overlap">
              <AccordionTrigger className="text-lg font-semibold">Why Eclipse Series Overlap</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  One of the most confusing things about eclipses is that <strong>multiple series run simultaneously</strong>. As the nodes shift from one axis to the next, there's a transition period where eclipses from the old and new axes interleave.
                </p>
                <p>
                  Right now (2025–2027), this is exactly what's happening: the <strong>Virgo-Pisces lunar eclipses</strong> continue alongside the new <strong>Leo-Aquarius solar eclipses</strong>. The solar eclipses have moved to Leo-Aquarius, but the lunar eclipses are still completing the Virgo-Pisces story.
                </p>
                <p>
                  This means two different axes of your chart are being activated at the same time — a more complex but rich period of growth.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="solar-vs-lunar">
              <AccordionTrigger className="text-lg font-semibold">Solar vs. Lunar Eclipses</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/50 border-primary/20">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span className="text-2xl">🌑</span> Solar Eclipse
                      </div>
                      <p className="text-sm text-muted-foreground">Occurs at a <strong>New Moon</strong> near a Node</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                        <li><strong>Theme:</strong> New beginnings, fresh starts, doors opening</li>
                        <li><strong>Energy:</strong> External events catalyze change — fate knocks on your door</li>
                        <li><strong>Timing:</strong> Effects unfold over 6 months forward</li>
                        <li><strong>Advice:</strong> Don't manifest or do rituals — observe what the universe brings to you</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-accent/20">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span className="text-2xl">🌕</span> Lunar Eclipse
                      </div>
                      <p className="text-sm text-muted-foreground">Occurs at a <strong>Full Moon</strong> near a Node</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                        <li><strong>Theme:</strong> Culminations, revelations, emotional breakthroughs</li>
                        <li><strong>Energy:</strong> Internal shifts — what was hidden comes to light</li>
                        <li><strong>Timing:</strong> Effects can reach back 6 months to a prior solar eclipse</li>
                        <li><strong>Advice:</strong> Process emotions, let go of what's completed</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="nodes">
              <AccordionTrigger className="text-lg font-semibold">The Lunar Nodes & Eclipse Families</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  The <strong>North Node (☊)</strong> represents your soul's growth direction — where you're being pulled toward. The <strong>South Node (☋)</strong> represents past patterns, comfort zones, and what you're releasing.
                </p>
                <p>
                  Eclipses near the <strong>North Node</strong> tend to bring <em>new opportunities and growth experiences</em> — sometimes uncomfortable ones that push you forward. Eclipses near the <strong>South Node</strong> tend to bring <em>endings, releases, and karmic completions</em>.
                </p>
                <p>
                  The nodes move backwards through the zodiac, spending about <strong>18 months in each sign axis</strong>. This is why eclipse series last about 2 years in one pair of signs before shifting.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="types">
              <AccordionTrigger className="text-lg font-semibold">Types of Eclipses</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Total Solar', icon: '🌑', desc: 'The Moon fully covers the Sun. The most powerful type — complete reset. Visible along a narrow path on Earth.' },
                    { name: 'Annular Solar', icon: '💍', desc: '"Ring of fire" — the Moon is too far to fully cover the Sun. Strong but slightly less intense than total. Still a major new beginning.' },
                    { name: 'Partial Solar', icon: '🌘', desc: 'Only part of the Sun is obscured. A gentler nudge rather than a dramatic reset. Themes emerge more slowly.' },
                    { name: 'Total Lunar', icon: '🌕', desc: 'The "Blood Moon" — Earth\'s shadow turns the Moon red. Full emotional revelation. The most potent lunar eclipse.' },
                    { name: 'Partial Lunar', icon: '🌗', desc: 'Part of the Moon enters Earth\'s shadow. Moderate emotional insight and release.' },
                    { name: 'Penumbral Lunar', icon: '🌖', desc: 'Moon passes through Earth\'s faint outer shadow. Subtlest type — quiet inner shifts that may not be obvious immediately.' },
                  ].map(t => (
                    <div key={t.name} className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-to-read">
              <AccordionTrigger className="text-lg font-semibold">How Eclipses Affect Your Chart</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  To understand how an eclipse affects <em>you</em>, look at <strong>which house</strong> the eclipse falls in your natal chart. That house's life themes become activated for the next 6 months.
                </p>
                <ul className="space-y-2 list-disc pl-4 text-sm">
                  <li><strong>Conjunction to natal planet (±3°):</strong> The most personal hit — that planet's themes are supercharged.</li>
                  <li><strong>Conjunct your Ascendant/Descendant:</strong> Major identity or relationship shifts.</li>
                  <li><strong>Conjunct your MC/IC:</strong> Career or home/family turning points.</li>
                  <li><strong>Near your natal nodes:</strong> Deeply karmic — a "nodal return" eclipse can redirect your life path.</li>
                </ul>
                <p className="text-sm italic">
                  Traditional advice: <strong>Don't manifest during eclipses.</strong> Unlike regular New Moons, eclipses are about receiving what fate has in store, not projecting your will. Observe, accept, and adapt.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="saros">
              <AccordionTrigger className="text-lg font-semibold">Eclipse Cycles: Saros, Metonic & More</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-6">
                {/* Saros */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">🔄</span> The Saros Cycle — 18 years, 11 days
                  </h4>
                  <p>
                    The Saros cycle is an <strong>astronomical pattern</strong>, not an astrological invention. It's based on a remarkable coincidence of three lunar cycles syncing up almost perfectly:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>The Moon's orbit around Earth — <strong>29.5 days</strong> (synodic month)</li>
                    <li>The Moon's orbital wobble — <strong>27.2 days</strong> (anomalistic month)</li>
                    <li>The Moon crossing the ecliptic — <strong>27.2 days</strong> (draconic month)</li>
                  </ul>
                  <p>
                    Every <strong>18 years, 11 days, and 8 hours</strong>, these three cycles realign. When they do, the Sun, Earth, and Moon return to nearly identical positions — which means an eclipse that happened 18 years ago will <strong>repeat at roughly the same degree</strong>, with the same character (total, partial, annular).
                  </p>
                  <p>
                    That's the Saros. It's a <strong>family of eclipses</strong>, each one 18 years apart, sharing the same astronomical DNA.
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">📖 Example: March 3, 2026 Eclipse</p>
                    <p className="text-sm">
                      The March 2026 eclipse at 12° Virgo belongs to a Saros family that had an eclipse around <strong>March 2008</strong> — at a similar degree, similar type. Astrologers use this as a <em>"thematic echo"</em> — not that the same events repeat, but that <strong>similar themes surface for resolution or continuation</strong>.
                    </p>
                    <p className="text-sm italic">
                      Try it: Journal back to March 2008. What was happening in your health, daily routines, or work life? It often rhymes with what this eclipse is activating now.
                    </p>
                  </div>
                </div>

                {/* Metonic */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">📅</span> The Metonic Cycle — 19 years
                  </h4>
                  <p>
                    Every 19 years, an eclipse returns to almost the <strong>exact same calendar date and same zodiac degree</strong>. This is slightly different from the Saros — it's more <em>calendar-precise</em> rather than astronomically precise.
                  </p>
                  <p>
                    You may have heard of this cycle in Jewish or lunar calendar traditions. Astrologers use it the same way as the Saros: <strong>check what was happening 19 years ago</strong> for thematic echoes.
                  </p>
                </div>

                {/* Nodal */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">☊</span> The Nodal Cycle — 18.6 years
                  </h4>
                  <p>
                    This is the cycle astrologers use most. The <strong>Lunar Nodes</strong> — the intersection points of the Moon's orbit with the Sun's path — take <strong>18.6 years</strong> to travel all the way around the zodiac.
                  </p>
                  <p>
                    Every ~18–19 years, the Nodes return to the same signs, and the eclipse themes you lived through then <strong>echo again</strong>. This is why the Virgo-Pisces axis was also active in 2006–2007 — the Nodes were in the same signs, producing eclipses with similar themes.
                  </p>
                  <p className="text-sm italic">
                    The Nodal cycle, the Saros, and the Metonic all hover around 18–19 years. They're not identical cycles, but they overlap enough that looking back ~18 years from any eclipse tends to reveal meaningful connections.
                  </p>
                </div>

                {/* Semester */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">⏳</span> The Semester Cycle — 6 months
                  </h4>
                  <p>
                    This is the most <strong>practical cycle for everyday astrology</strong>. Eclipses always come in pairs or triplets, spaced roughly 6 months apart, along the same nodal axis.
                  </p>
                  <p>
                    That's why you get a Virgo eclipse in September and a Pisces eclipse in March — they're part of the <strong>same 6-month pulse</strong>. The same life themes activate, then 6 months later you get another hit on the same story from the opposite angle.
                  </p>
                  <p className="text-sm italic">
                    Think of each 6-month pair as one conversation: the first eclipse asks the question, the second eclipse reveals the answer.
                  </p>
                </div>

                {/* Inex */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">🌐</span> The Inex Cycle — 29 years
                  </h4>
                  <p>
                    Less talked about but astronomically significant. Every <strong>29 years</strong>, an eclipse of the same type (total, annular, etc.) occurs in the same general family. The Inex and Saros together form a larger <strong>600-year grid</strong> of eclipse families that astronomers use to map every eclipse in history.
                  </p>
                  <p className="text-sm">
                    For personal use, the 29-year cycle mirrors the Saturn Return — check what was happening around ages 29, 58, or 87 for deep structural echoes in your eclipse story.
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Quick Reference: Eclipse Cycles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Semester</span><span className="font-medium">6 months — same axis, opposite angle</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Saros</span><span className="font-medium">18 yrs 11 days — same degree & type</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Nodal</span><span className="font-medium">18.6 yrs — same signs activated</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Metonic</span><span className="font-medium">19 yrs — same calendar date</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Inex</span><span className="font-medium">29 yrs — same type family</span></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Interpretation Layer ── */}
      <div ref={teacherRef}>
        <EclipseInterpretationLayer
          selectedEclipse={activeEclipse}
          userNatalChart={selectedChart}
          onBackToTimeline={scrollToTimeline}
          currentList={currentList}
          onSelectEclipse={handleSelectEclipse}
        />
      </div>

      {/* ── Eclipse Timeline by Series ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">📅</span> Eclipse Timeline by Series
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Eclipse series overlap — multiple axes are active simultaneously. Select a series to see its eclipses and how they land in your chart.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {allCharts.length > 0 && (
            <div className="mb-4">
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={selectedChart?.name || ''}
                onSelect={setSelectedChartId}
              />
            </div>
          )}

          <div ref={timelineRef}>
            <Tabs value={activeSeriesTab} onValueChange={setActiveSeriesTab}>
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm py-2 flex flex-col gap-0.5">
                  <span>📅</span>
                  <span className="hidden sm:inline">All Eclipses</span>
                  <Badge variant="default" className="text-[10px] mt-0.5">Timeline</Badge>
                </TabsTrigger>
                {Object.entries(ECLIPSE_SERIES).map(([key, s]) => (
                  <TabsTrigger key={key} value={key} className="text-xs sm:text-sm py-2 flex flex-col gap-0.5">
                    <span>{s.glyphs}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                    <Badge variant={s.status === 'active' ? 'default' : s.status === 'upcoming' ? 'secondary' : 'outline'} className="text-[10px] mt-0.5">
                      {s.status === 'ending' ? 'Ending' : s.status === 'active' ? 'Active Now' : s.status === 'upcoming' ? 'Starting' : 'Next Up'}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <h3 className="font-semibold text-lg">📅 Complete Eclipse Timeline (2023–2029)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Every eclipse in chronological order across all series. Solar eclipses happen at New Moons, lunar eclipses at Full Moons.</p>
                </div>
                <div className="space-y-3">
                  {allEclipsesSorted.map((e, idx) => {
                    const dateObj = new Date(e.date + 'T12:00:00');
                    const formatted = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    const now = new Date();
                    const isPast = dateObj < now;
                    const isNext = !isPast && (idx === 0 || new Date(allEclipsesSorted[idx - 1].date + 'T12:00:00') < now);
                    const house = selectedChart?.houseCusps ? getHouseForDegree(e.sign, e.degree, selectedChart) : null;
                    const oppositeSign = ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(e.sign) + 6) % 12];
                    const oppositeHouse = selectedChart?.houseCusps ? getHouseForDegree(oppositeSign, e.degree, selectedChart) : null;

                    return (
                      <Card key={`all-${idx}`} onClick={() => handleSelectEclipse(e)} className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${e.type === 'solar' ? 'border-l-primary' : 'border-l-accent'} ${isPast ? 'opacity-50' : ''} ${isNext ? 'ring-2 ring-primary/30' : ''} ${selectedEclipse?.date === e.date ? 'ring-2 ring-accent' : ''}`}>
                        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <span className="text-2xl">{e.type === 'solar' ? '🌑' : '🌕'}</span>
                            <div>
                              <p className="font-semibold text-sm capitalize">{e.subtype} {e.type}</p>
                              <p className="text-xs text-muted-foreground">{formatted}</p>
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {e.degree}°{e.minutes > 0 ? e.minutes.toString().padStart(2, '0') + "'" : ''} {getSignGlyph(e.sign)} {e.sign}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {e.nodal === 'north' ? '☊ North Node' : '☋ South Node'}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{e.series}</Badge>
                              {isPast && <Badge className="text-xs bg-muted text-muted-foreground">Past</Badge>}
                              {isNext && <Badge className="text-xs bg-primary text-primary-foreground">Next</Badge>}
                              {renderProximityBadge(e.date)}
                            </div>
                            <p className="text-sm text-muted-foreground">{e.description}</p>
                            {TEACHING_TAGS[e.date] && (
                              <div className="flex items-center gap-2 flex-wrap mt-1">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Teaching Tags:</span>
                                {TEACHING_TAGS[e.date].map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent-foreground">{tag}</Badge>
                                ))}
                              </div>
                            )}
                            {(() => {
                              const axisData = buildAxisTeaching(e.sign);
                              return (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  {axisData.axisStirredLine(e.sign)}
                                </p>
                              );
                            })()}
                            {house && (
                              <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium">
                                  ✨ Falls in your <strong>{getOrdinalSuffix(house)} House</strong>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {HOUSE_LIFE_AREAS[house]}
                                </p>
                                {oppositeHouse && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Axis activation: also stirring <strong>{getOrdinalSuffix(oppositeHouse)} House</strong> themes ({HOUSE_LIFE_AREAS[oppositeHouse]?.split(',')[0]})
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {Object.entries(ECLIPSE_SERIES).map(([key, series]) => (
                <TabsContent key={key} value={key} className="mt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <h3 className="font-semibold text-lg">{series.glyphs} {series.label} ({series.period})</h3>
                    <p className="text-sm text-muted-foreground mt-1">{series.description}</p>
                  </div>

                  <div className="space-y-3">
                    {(key === activeSeriesTab ? (personalizedEvents || series.events) : series.events).map((eclipse, idx) => {
                      const e = eclipse as EclipseEvent & { house?: number | null; oppositeHouse?: number | null };
                      const dateObj = new Date(e.date + 'T12:00:00');
                      const formatted = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                      const now = new Date();
                      const isPast = dateObj < now;
                      const isNext = !isPast && (idx === 0 || new Date(series.events[idx - 1].date + 'T12:00:00') < now);

                      return (
                        <Card key={idx} onClick={() => handleSelectEclipse(e)} className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${e.type === 'solar' ? 'border-l-primary' : 'border-l-accent'} ${isPast ? 'opacity-50' : ''} ${isNext ? 'ring-2 ring-primary/30' : ''} ${selectedEclipse?.date === e.date ? 'ring-2 ring-accent' : ''}`}>
                          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <span className="text-2xl">{e.type === 'solar' ? '🌑' : '🌕'}</span>
                              <div>
                                <p className="font-semibold text-sm capitalize">{e.subtype} {e.type}</p>
                                <p className="text-xs text-muted-foreground">{formatted}</p>
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {e.degree}°{e.minutes > 0 ? e.minutes.toString().padStart(2, '0') + "'" : ''} {getSignGlyph(e.sign)} {e.sign}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {e.nodal === 'north' ? '☊ North Node' : '☋ South Node'}
                                </Badge>
                                {isPast && <Badge className="text-xs bg-muted text-muted-foreground">Past</Badge>}
                                {isNext && <Badge className="text-xs bg-primary text-primary-foreground">Next</Badge>}
                                {renderProximityBadge(e.date)}
                              </div>
                              <p className="text-sm text-muted-foreground">{e.description}</p>
                              {TEACHING_TAGS[e.date] && (
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Teaching Tags:</span>
                                  {TEACHING_TAGS[e.date].map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent-foreground">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                              {(() => {
                                const axisData = buildAxisTeaching(e.sign);
                                return (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {axisData.axisStirredLine(e.sign)}
                                  </p>
                                );
                              })()}
                              {'house' in e && e.house && (
                                <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                  <p className="text-sm font-medium">
                                    ✨ Falls in your <strong>{getOrdinalSuffix(e.house)} House</strong>
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {HOUSE_LIFE_AREAS[e.house]}
                                  </p>
                                  {'oppositeHouse' in e && e.oppositeHouse && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Axis activation: also stirring <strong>{getOrdinalSuffix(e.oppositeHouse)} House</strong> themes ({HOUSE_LIFE_AREAS[e.oppositeHouse]?.split(',')[0]})
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {!selectedChart?.houseCusps && allCharts.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground italic text-center">
              ℹ️ Enter birth data with a birth time to see which houses these eclipses activate in your chart.
            </p>
          )}
          {allCharts.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground italic text-center">
              ℹ️ Add a birth chart to see personalized eclipse house activations.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
