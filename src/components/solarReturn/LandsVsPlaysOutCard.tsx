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

      {/* Two-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        {/* LEFT: Where the Year Lands */}
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Card header */}
          <div className="bg-muted/40 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Where the Year Lands</p>
                <p className="text-[10px] text-muted-foreground">Natal House Overlay technique</p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4 space-y-3">
            {landsHouse ? (
              <>
                {/* House highlight box */}
                <div className="bg-primary/5 border border-primary/10 rounded-sm p-3">
                  <p className="text-xl font-serif text-foreground">
                    Natal {ordinal(landsHouse)} House
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{HOUSE_MEANINGS[landsHouse]}</p>
                </div>

                {/* Step-style breakdown to mirror the right card */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Layers size={10} className="text-primary" />
                    </span>
                    <span className="text-foreground font-medium">{landsCount} SR points</span>
                    <span className="text-muted-foreground">land in this house</span>
                  </div>
                  {landsPlanets.map((label, i) => {
                    const planet = extractPlanetFromLabel(label);
                    const symbol = planet ? PLANET_SYMBOLS[planet] : '';
                    return (
                      <div key={i} className="flex items-center gap-2 text-[11px] pl-7">
                        {symbol && <span className="text-base leading-none">{symbol}</span>}
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Answer */}
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="italic">"What area of life gets the most activity this year?"</span>
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    Your {ordinal(landsHouse)} house — {HOUSE_MEANINGS[landsHouse]?.toLowerCase()}. With {landsCount} Solar Return points landing here, this is where life gets loud. Expect events, decisions, and energy to cluster around {HOUSE_MEANINGS[landsHouse]?.split(',')[0]?.toLowerCase()} themes throughout the year.
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
          {/* Card header */}
          <div className="bg-muted/40 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Compass size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Where It Plays Out</p>
                <p className="text-[10px] text-muted-foreground">SR Ascendant Ruler technique</p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4 space-y-3">
            {playsOut && playsOutHouse ? (
              <>
                {/* House highlight box — matching left */}
                <div className="bg-primary/5 border border-primary/10 rounded-sm p-3">
                  <p className="text-xl font-serif text-foreground">
                    Natal {ordinal(playsOutHouse)} House
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{HOUSE_MEANINGS[playsOutHouse]}</p>
                </div>

                {/* Step-by-step with consistent icon treatment */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                    <span className="text-muted-foreground">SR Ascendant =</span>
                    <span className="text-base leading-none">{SIGN_SYMBOLS[playsOut.srAscSign] || ''}</span>
                    <span className="text-foreground font-medium">{playsOut.srAscSign}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                    <span className="text-muted-foreground">Ruled by</span>
                    <span className="text-base leading-none">{PLANET_SYMBOLS[playsOut.rulerPlanet] || ''}</span>
                    <span className="text-foreground font-medium">{playsOut.rulerPlanet}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                    <span className="text-muted-foreground">Natal {playsOut.rulerPlanet} →</span>
                    {playsOut.rulerNatalSign && <span className="text-base leading-none">{SIGN_SYMBOLS[playsOut.rulerNatalSign]}</span>}
                    <span className="text-foreground font-medium">
                      {playsOut.rulerNatalSign || '—'}, {ordinal(playsOutHouse)} house
                    </span>
                  </div>
                </div>

                {/* Answer */}
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="italic">"Where does the year's engine actually drive you?"</span>
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    The SR Ascendant in {playsOut.srAscSign} is ruled by {playsOut.rulerPlanet}, which sits in your natal {ordinal(playsOutHouse)} house ({HOUSE_MEANINGS[playsOutHouse]?.toLowerCase()}). This means the year's underlying motivation — what quietly steers your choices — routes through {HOUSE_MEANINGS[playsOutHouse]?.split(',')[0]?.toLowerCase()} concerns, even when surface-level events point elsewhere.
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
              <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">How These Connect</p>
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
            <strong>"Lands"</strong> counts where SR planets physically fall in your natal houses (volume of activity).{' '}
            <strong>"Plays Out"</strong> traces the SR Ascendant ruler back to its natal position (underlying motivation). Neither replaces the other — together they tell a complete story.
          </p>
        </div>
      </div>
    </div>
  );
}
