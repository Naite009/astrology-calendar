import { Compass, MapPin, ArrowRight, HelpCircle } from 'lucide-react';
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

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="bg-primary/5 px-5 py-3 border-b border-primary/10">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
          <Compass size={16} className="text-primary" />
          Year Focus: Where It Lands vs. Where It Plays Out
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Two different techniques, two different answers — both true simultaneously
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* LEFT: Where the Year Lands */}
        <div className="p-4 md:border-r border-b md:border-b-0 border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Where the Year Lands</p>
              <p className="text-[10px] text-muted-foreground">Natal House Overlay technique</p>
            </div>
          </div>

          {landsHouse ? (
            <>
              <div className="bg-primary/5 border border-primary/10 rounded-sm p-2.5">
                <p className="text-lg font-serif text-foreground">
                  Natal {ordinal(landsHouse)} House
                </p>
                <p className="text-xs text-muted-foreground">{HOUSE_MEANINGS[landsHouse]}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {landsCount} SR points land here ({landsPlanets.join(', ')}). This house gets the most planetary traffic — it's where events, people, and circumstances show up most frequently.
              </p>
              <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                <strong className="text-foreground">Answers:</strong> "What area of life gets the most activity this year?"
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No dominant overlay house detected</p>
          )}
        </div>

        {/* RIGHT: Where It Plays Out */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
              <Compass size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Where It Plays Out</p>
              <p className="text-[10px] text-muted-foreground">SR Ascendant Ruler technique</p>
            </div>
          </div>

          {playsOut && playsOutHouse ? (
            <>
              <div className="bg-accent/10 border border-accent/20 rounded-sm p-2.5">
                <p className="text-lg font-serif text-foreground">
                  Natal {ordinal(playsOutHouse)} House
                </p>
                <p className="text-xs text-muted-foreground">{HOUSE_MEANINGS[playsOutHouse]}</p>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p className="flex items-center gap-1">
                  <span className="text-foreground font-medium">Step 1:</span> SR Ascendant = {SIGN_SYMBOLS[playsOut.srAscSign]} {playsOut.srAscSign}
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-foreground font-medium">Step 2:</span> Ruled by {PLANET_SYMBOLS[playsOut.rulerPlanet]} {playsOut.rulerPlanet}
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-foreground font-medium">Step 3:</span> Natal {playsOut.rulerPlanet} → {playsOut.rulerNatalSign ? `${SIGN_SYMBOLS[playsOut.rulerNatalSign]} ${playsOut.rulerNatalSign}` : '—'}, {ordinal(playsOutHouse)} house
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                <strong className="text-foreground">Answers:</strong> "Where does the year's engine actually drive you?"
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">SR Ascendant ruler data unavailable</p>
          )}
        </div>
      </div>

      {/* Synthesis */}
      {landsHouse && playsOutHouse && (
        <div className="border-t border-border px-5 py-3 bg-muted/20">
          <div className="flex items-start gap-2">
            <ArrowRight size={12} className="text-primary flex-shrink-0 mt-1" />
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
      <div className="border-t border-border px-5 py-2.5">
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
