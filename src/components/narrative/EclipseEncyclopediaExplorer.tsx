import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

// ── Eclipse data for the Leo-Aquarius series (2026-2028) + preceding Pisces/Virgo ──
interface EclipseEvent {
  date: string;
  type: 'solar' | 'lunar';
  subtype: 'total' | 'annular' | 'partial' | 'penumbral';
  sign: string;
  degree: number;
  nodal: 'north' | 'south';
  series: string;
  sarosCycle?: number;
  description: string;
}

const ECLIPSE_EVENTS: EclipseEvent[] = [
  // Pisces-Virgo final eclipses
  { date: '2025-09-07', type: 'lunar', subtype: 'total', sign: 'Pisces', degree: 15, nodal: 'south', series: 'Pisces-Virgo', description: 'Final total lunar eclipse in Pisces — closing the Pisces-Virgo chapter that began in 2024.' },
  { date: '2025-09-21', type: 'solar', subtype: 'partial', sign: 'Virgo', degree: 29, nodal: 'north', series: 'Pisces-Virgo', description: 'Last solar eclipse in Virgo at a critical 29° anaretic degree — final harvest of Virgo themes.' },
  // Leo-Aquarius series (from Brennan's chart)
  { date: '2026-02-17', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 28, nodal: 'south', series: 'Leo-Aquarius', description: 'First solar eclipse opening the new Leo-Aquarius axis. Major new beginnings in community, innovation, and individuality.' },
  { date: '2026-08-12', type: 'solar', subtype: 'total', sign: 'Leo', degree: 20, nodal: 'north', series: 'Leo-Aquarius', description: 'Total solar eclipse in Leo — powerful creative and leadership reset. Heart-centered new chapters.' },
  { date: '2027-02-06', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 17, nodal: 'south', series: 'Leo-Aquarius', description: 'Deepening the Aquarius themes — humanitarian vision, detachment from ego, collective evolution.' },
  { date: '2027-08-02', type: 'solar', subtype: 'total', sign: 'Leo', degree: 9, nodal: 'north', series: 'Leo-Aquarius', description: 'Second total solar eclipse in Leo — the story of self-expression and courage reaches a crescendo.' },
  { date: '2027-08-17', type: 'lunar', subtype: 'penumbral', sign: 'Aquarius', degree: 24, nodal: 'south', series: 'Leo-Aquarius', description: 'Penumbral lunar eclipse in Aquarius — subtle emotional release around group dynamics and independence.' },
  { date: '2028-01-26', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 6, nodal: 'south', series: 'Leo-Aquarius', description: 'Final solar eclipse of the Leo-Aquarius series — completing the cycle of individuation vs. community.' },
];

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

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

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function EclipseEncyclopediaExplorer({ userNatalChart, savedCharts }: Props) {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

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

  const personalizedEclipses = useMemo(() => {
    if (!selectedChart || !selectedChart.houseCusps) return null;
    return ECLIPSE_EVENTS.map(e => {
      const house = getHouseForDegree(e.sign, e.degree, selectedChart);
      const oppositeSign = ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(e.sign) + 6) % 12];
      const oppositeHouse = getHouseForDegree(oppositeSign, e.degree, selectedChart);
      return { ...e, house, oppositeHouse };
    });
  }, [selectedChart]);

  return (
    <div className="space-y-8">
      {/* ── Education Section ── */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-background to-amber-950/10">
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
            {/* What Are Eclipses */}
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
                  Eclipses travel in pairs along an <strong>axis</strong> (two opposite signs), cycling through each axis for about 18 months before moving on. The current series shifts from <strong>Pisces-Virgo to Leo-Aquarius</strong> in early 2026.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Solar vs Lunar */}
            <AccordionItem value="solar-vs-lunar">
              <AccordionTrigger className="text-lg font-semibold">Solar vs. Lunar Eclipses</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/50 border-amber-500/20">
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
                  <Card className="bg-card/50 border-purple-500/20">
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

            {/* The Nodes */}
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

            {/* Types */}
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

            {/* How to Read */}
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

            {/* Saros Cycle */}
            <AccordionItem value="saros">
              <AccordionTrigger className="text-lg font-semibold">The Saros Cycle</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  Every eclipse belongs to a <strong>Saros family</strong> — a series that repeats every 18 years, 11 days. Each Saros series produces eclipses at nearly the same degree, creating a thread of connected events across your lifetime.
                </p>
                <p>
                  If you experienced a major life event during an eclipse, check what happened 18-19 years prior — you may find a thematic echo. This is the Saros cycle at work, weaving a longer story through your chart.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Timeline: Leo-Aquarius Series ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">♌ ♒</span> Eclipse Timeline: Leo-Aquarius Series (2026–2028)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on Chris Brennan's eclipse research. This series opens Feb 17, 2026 and completes Jan 26, 2028 — bringing major endings and new beginnings in the Leo-Aquarius axis of your chart.
          </p>
        </CardHeader>
        <CardContent>
          {/* Chart selector */}
          {allCharts.length > 0 && (
            <div className="mb-6">
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={selectedChart?.name || ''}
                onSelect={setSelectedChartId}
              />
            </div>
          )}

          <div className="space-y-3">
            {(personalizedEclipses || ECLIPSE_EVENTS).map((eclipse, idx) => {
              const e = eclipse as EclipseEvent & { house?: number | null; oppositeHouse?: number | null };
              const dateObj = new Date(e.date + 'T12:00:00');
              const formatted = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
              const isFuture = dateObj > new Date();
              const isPast = !isFuture;

              return (
                <Card key={idx} className={`border-l-4 ${e.type === 'solar' ? 'border-l-amber-500' : 'border-l-purple-400'} ${isPast ? 'opacity-60' : ''}`}>
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
                          {e.degree}° {getSignGlyph(e.sign)} {e.sign}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {e.nodal === 'north' ? '☊ North Node' : '☋ South Node'}
                        </Badge>
                        {isPast && <Badge className="text-xs bg-muted text-muted-foreground">Past</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{e.description}</p>
                      {e.house && (
                        <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm font-medium">
                            ✨ Falls in your <strong>{getOrdinalSuffix(e.house)} House</strong>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {HOUSE_LIFE_AREAS[e.house]}
                          </p>
                          {e.oppositeHouse && (
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
