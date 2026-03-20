import { Compass, MapPin, ArrowRight, HelpCircle, Layers } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

const SIGN_SYMBOLS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇',
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Identity, body, self-definition',
  2: 'Money, resources, self-worth',
  3: 'Communication, learning, siblings',
  4: 'Home, family, roots, private life',
  5: 'Creativity, romance, children, pleasure',
  6: 'Work, routines, health, daily systems',
  7: 'Relationships, partnership, agreements',
  8: 'Shared resources, intimacy, transformation',
  9: 'Beliefs, travel, higher learning, meaning',
  10: 'Career, calling, status, reputation',
  11: 'Friends, networks, communities, future goals',
  12: 'Rest, retreat, healing, spirituality',
};

// What each SR planet BRINGS when it lands in a natal house
const PLANET_BRINGS: Record<string, string> = {
  Sun: 'your main focus and where you put the most effort',
  Moon: 'your emotional attention and daily mood',
  Mercury: 'conversations, decisions, and mental energy',
  Venus: 'pleasure, connection, and what you enjoy',
  Mars: 'drive, action, and where you push hardest',
  Jupiter: 'growth, luck, and expansion',
  Saturn: 'responsibility, pressure, and hard work',
  Uranus: 'surprises, changes, and restlessness',
  Neptune: 'dreams, imagination, and possible confusion',
  Pluto: 'deep change and intensity',
  Ascendant: 'how you approach the entire year',
};

// Concrete, daily-life examples for each house
const HOUSE_EXAMPLES: Record<number, string> = {
  1: 'decisions about your appearance, fitness, personal direction, and "who am I now?" moments',
  2: 'conversations about money, spending decisions, salary negotiations, and questions about what matters to you',
  3: 'emails, phone calls, texts, learning something new, trips around town, and interactions with siblings or neighbors',
  4: 'home renovations, family gatherings, moving decisions, cooking, and emotional processing in private',
  5: 'dates, creative projects, time with children, hobbies, and moments of pure fun or self-expression',
  6: 'doctor appointments, new workout routines, work projects, organizing your schedule, and health changes',
  7: 'relationship conversations, partnership decisions, contracts, and one-on-one dynamics with important people',
  8: 'bills, shared finances, insurance, therapy sessions, honest conversations about trust, and letting go of old baggage',
  9: 'travel plans, taking a class, reading books that change your mind, and rethinking what you believe',
  10: 'job interviews, promotions, public recognition, career pivots, and being seen by a wider audience',
  11: 'group events, friendships forming or shifting, volunteer work, and thinking about your long-term future',
  12: 'alone time, dreams, meditation, therapy, hospital visits, and quiet inner processing',
};

function getConcreteExamples(house: number): string {
  return HOUSE_EXAMPLES[house] || 'activity in this life area';
}

const ordinal = (n: number): string => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function getSynthesis(landsHouse: number, playsOutHouse: number): string {
  if (landsHouse === playsOutHouse) {
    return `Both techniques point to the same house — an unusually focused year. The life area of your ${ordinal(landsHouse)} house receives both the most planetary traffic AND the underlying motivational engine. This is a year where volume and direction are aligned.`;
  }
  const landsLabel = HOUSE_MEANINGS[landsHouse]?.split(',')[0]?.toLowerCase() || '';
  const playsLabel = HOUSE_MEANINGS[playsOutHouse]?.split(',')[0]?.toLowerCase() || '';
  return `Events and activity concentrate in your ${ordinal(landsHouse)} house (${landsLabel}), but the underlying motivation routes through your ${ordinal(playsOutHouse)} house (${playsLabel}). In practice, ${landsLabel} matters get the most attention, but they keep circling back to ${playsLabel} questions. The ${ordinal(landsHouse)} house is where life happens; the ${ordinal(playsOutHouse)} house is why it matters to you.`;
}

interface Props {
  analysis: SolarReturnAnalysis;
}

export function LandsVsPlaysOutCard({ analysis }: Props) {
  // "Where the Year Lands" = dominant natal house from overlay
  const overlays = analysis.houseOverlays || [];
  const houseCounts: Record<number, string[]> = {};

  const addToCount = (label: string, house: number | null) => {
    if (!house) return;
    if (!houseCounts[house]) houseCounts[house] = [];
    houseCounts[house].push(label);
  };

  if (analysis.srAscInNatalHouse) addToCount('SR Ascendant', analysis.srAscInNatalHouse.natalHouse);
  addToCount('SR Sun', analysis.sunNatalHouse?.house ?? null);
  addToCount('SR Moon', analysis.moonNatalHouse?.house ?? null);
  for (const ov of overlays) {
    if (!['Sun', 'Moon'].includes(ov.planet)) {
      addToCount(`SR ${ov.planet}`, ov.natalHouse);
    }
  }

  let landsHouse: number | null = null;
  let landsCount = 0;
  let landsPlanets: string[] = [];
  for (const [h, labels] of Object.entries(houseCounts)) {
    if (labels.length > landsCount) {
      landsCount = labels.length;
      landsHouse = Number(h);
      landsPlanets = labels;
    }
  }

  // "Where the Year Plays Out" = SR Asc ruler's natal house
  const playsOut = analysis.srAscRulerInNatal;
  const playsOutHouse = playsOut?.rulerNatalHouse ?? null;

  if (!landsHouse && !playsOutHouse) return null;

  // Extract planet icons from the landsPlanets list for the left card
  const extractPlanetFromLabel = (label: string): string | null => {
    const match = label.match(/^SR\s+(.+)$/);
    return match ? match[1] : null;
  };

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 px-5 py-3 border-b border-primary/10">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
          <Compass size={16} className="text-primary" />
          Year Focus: Where It Lands vs. Where It Plays Out
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Two different techniques, two different answers — both true simultaneously
        </p>
      </div>

      {/* Teaching explainer */}
      <div className="mx-5 mt-4 mb-2 bg-muted/30 border border-border rounded-sm p-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
          <HelpCircle size={10} />
          How This Works
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every year on your birthday, the planets are in new positions. We take those birthday-chart positions and <strong className="text-foreground">lay them on top of your birth chart</strong> to see which areas of <em>your</em> life they light up. If 4 planets land in your birth chart's 1st house (identity), that means identity-related events — how you look, how you feel about yourself, new beginnings — will dominate your year. The more planets that cluster in one house, the louder that life area gets.
        </p>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        {/* LEFT: Where the Year Lands */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/40 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Where the Year Lands</p>
                <p className="text-[10px] text-muted-foreground">Which life area gets the most traffic</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {landsHouse ? (
              <>
                <div className="bg-primary/5 border border-primary/10 rounded-sm p-3">
                  <p className="text-xl font-serif text-foreground">
                    Natal {ordinal(landsHouse)} House
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{HOUSE_MEANINGS[landsHouse]}</p>
                </div>

                {/* Planet list with what each one brings */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Layers size={10} className="text-primary" />
                    </span>
                    <span className="text-foreground font-medium">{landsCount} birthday-chart points</span>
                    <span className="text-muted-foreground">land here</span>
                  </div>
                  {landsPlanets.map((label, i) => {
                    const planet = extractPlanetFromLabel(label);
                    const symbol = planet ? PLANET_SYMBOLS[planet] : '';
                    const brings = planet ? PLANET_BRINGS[planet] : '';
                    return (
                      <div key={i} className="pl-7 space-y-0.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          {symbol && <span className="text-base leading-none">{symbol}</span>}
                          <span className="text-foreground font-medium">{label}</span>
                        </div>
                        {brings && (
                          <p className="text-[10px] text-muted-foreground leading-relaxed pl-6">
                            → Brings {brings}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="italic">"What area of life gets the most activity this year?"</span>
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    Your {ordinal(landsHouse)} house — {HOUSE_MEANINGS[landsHouse]?.toLowerCase()}. With {landsCount} birthday-chart planets landing here, this is the area of life where you'll notice the most action. Concretely, expect more {getConcreteExamples(landsHouse)} than in a typical year.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No dominant overlay house detected</p>
            )}
          </div>
        </div>

        {/* RIGHT: Where It Plays Out */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/40 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Compass size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Where It Plays Out</p>
                <p className="text-[10px] text-muted-foreground">What secretly motivates everything</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {playsOut && playsOutHouse ? (
              <>
                <div className="bg-primary/5 border border-primary/10 rounded-sm p-3">
                  <p className="text-xl font-serif text-foreground">
                    Natal {ordinal(playsOutHouse)} House
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{HOUSE_MEANINGS[playsOutHouse]}</p>
                </div>

                {/* Step-by-step with plain language */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Your birthday chart's rising sign =</span>
                        <span className="text-base leading-none">{SIGN_SYMBOLS[playsOut.srAscSign] || ''}</span>
                        <span className="text-foreground font-medium">{playsOut.srAscSign}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">This is the "lens" you see the year through</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{playsOut.srAscSign} is ruled by</span>
                        <span className="text-base leading-none">{PLANET_SYMBOLS[playsOut.rulerPlanet] || ''}</span>
                        <span className="text-foreground font-medium">{playsOut.rulerPlanet}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Every sign has a "boss" planet — this one steers your year</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">3</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">In your birth chart, {playsOut.rulerPlanet} sits in →</span>
                        {playsOut.rulerNatalSign && <span className="text-base leading-none">{SIGN_SYMBOLS[playsOut.rulerNatalSign]}</span>}
                        <span className="text-foreground font-medium">
                          {playsOut.rulerNatalSign || '—'}, {ordinal(playsOutHouse)} house
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">So the year's "engine" drives toward {HOUSE_MEANINGS[playsOutHouse]?.split(',')[0]?.toLowerCase() || 'this area'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="italic">"What's the hidden motivation behind everything this year?"</span>
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    Even when you're busy with other things, you'll keep circling back to {HOUSE_MEANINGS[playsOutHouse]?.toLowerCase() || 'this area'}. That's because your year's "steering wheel" ({playsOut.rulerPlanet}) lives in your birth chart's {ordinal(playsOutHouse)} house. It's the quiet "why" behind your decisions — the thing that actually matters to you underneath the surface.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">SR Ascendant ruler data unavailable</p>
            )}
          </div>
        </div>
      </div>

      {/* Synthesis */}
      {landsHouse && playsOutHouse && (
        <div className="border-t border-border mx-5 mb-5 pt-3">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ArrowRight size={10} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Putting It Together</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getSynthesis(landsHouse, playsOutHouse)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Method note */}
      <div className="border-t border-border px-5 py-2.5 bg-muted/10">
        <div className="flex items-start gap-1.5">
          <HelpCircle size={10} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>"Lands"</strong> = where the birthday-chart planets physically fall in your birth chart (which life areas get busy).{' '}
            <strong>"Plays Out"</strong> = we trace the birthday chart's rising sign to its ruling planet in your birth chart (what secretly motivates you). Both are true at the same time.
          </p>
        </div>
      </div>
    </div>
  );
}
