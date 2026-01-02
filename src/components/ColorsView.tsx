import { useState, useMemo } from "react";
import { Copy, Check, Shuffle, Palette, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { getPlanetaryPositions } from "@/lib/astrology";
import {
  getCollectivePalette,
  getPersonalPalette,
  getColorName,
  SIGN_PALETTES,
  SIGN_ELEMENTS,
  TransitDetail,
} from "@/lib/colorPalettes";
import { NatalChart } from "@/hooks/useNatalChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ColorsViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  onOpenNatalForm?: () => void;
}

export const ColorsView = ({ userNatalChart, savedCharts, onOpenNatalForm }: ColorsViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [altPaletteIndex, setAltPaletteIndex] = useState(0);
  const [personalAltIndex, setPersonalAltIndex] = useState(0);
  const [moreNeutral, setMoreNeutral] = useState(false);
  const [moreBold, setMoreBold] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string>('user');

  const goToPrevDay = () => setSelectedDate((d) => subDays(d, 1));
  const goToNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Get planetary positions for selected date (with degrees for aspect calculation)
  const { positions, positionsWithDegrees } = useMemo(() => {
    const planets = getPlanetaryPositions(selectedDate);
    const simple = [
      { name: "Sun", sign: planets.sun.signName },
      { name: "Moon", sign: planets.moon.signName },
      { name: "Mercury", sign: planets.mercury.signName },
      { name: "Venus", sign: planets.venus.signName },
      { name: "Mars", sign: planets.mars.signName },
      { name: "Jupiter", sign: planets.jupiter.signName },
      { name: "Saturn", sign: planets.saturn.signName },
      { name: "Uranus", sign: planets.uranus.signName },
      { name: "Neptune", sign: planets.neptune.signName },
      { name: "Pluto", sign: planets.pluto.signName },
    ];
    const withDegrees = [
      { name: "Sun", sign: planets.sun.signName, degree: planets.sun.degree },
      { name: "Moon", sign: planets.moon.signName, degree: planets.moon.degree },
      { name: "Mercury", sign: planets.mercury.signName, degree: planets.mercury.degree },
      { name: "Venus", sign: planets.venus.signName, degree: planets.venus.degree },
      { name: "Mars", sign: planets.mars.signName, degree: planets.mars.degree },
      { name: "Jupiter", sign: planets.jupiter.signName, degree: planets.jupiter.degree },
      { name: "Saturn", sign: planets.saturn.signName, degree: planets.saturn.degree },
      { name: "Uranus", sign: planets.uranus.signName, degree: planets.uranus.degree },
      { name: "Neptune", sign: planets.neptune.signName, degree: planets.neptune.degree },
      { name: "Pluto", sign: planets.pluto.signName, degree: planets.pluto.degree },
    ];
    return { positions: simple, positionsWithDegrees: withDegrees };
  }, [selectedDate]);

  const moonSign = positions.find((p) => p.name === "Moon")?.sign || "Cancer";
  const mercurySign = positions.find((p) => p.name === "Mercury")?.sign || "Gemini";
  const marsSign = positions.find((p) => p.name === "Mars")?.sign || "Aries";
  const venusSign = positions.find((p) => p.name === "Venus")?.sign || "Libra";

  // Get the selected chart
  const selectedChart = useMemo(() => {
    if (selectedChartId === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartId) || userNatalChart;
  }, [selectedChartId, userNatalChart, savedCharts]);

  // Collective palette
  const collective = useMemo(
    () => getCollectivePalette(positions, moonSign),
    [positions, moonSign]
  );

  // Alternate palettes (shuffle based on different dominant signs)
  const altPalettes = useMemo(() => {
    const signs = Object.keys(SIGN_PALETTES);
    return [0, 1, 2].map((i) => {
      const idx = (altPaletteIndex + i) % signs.length;
      return SIGN_PALETTES[signs[idx]];
    });
  }, [altPaletteIndex]);

  // Personal palette (using selected chart)
  const personal = useMemo(() => {
    if (!selectedChart?.planets) return null;

    const natalPositions = Object.entries(selectedChart.planets)
      .filter(([_, v]) => v)
      .map(([name, v]) => ({ name, sign: v!.sign, degree: v!.degree, minutes: v!.minutes || 0 }));

    return getPersonalPalette(natalPositions, positionsWithDegrees, { moreNeutral, moreBold, altPalette: personalAltIndex });
  }, [selectedChart, positionsWithDegrees, moreNeutral, moreBold, personalAltIndex]);

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAllHex = (palette: string[]) => {
    navigator.clipboard.writeText(palette.join(", "));
    toast.success("All colors copied!");
  };

  const shuffleAltPalette = () => {
    setAltPaletteIndex((prev) => (prev + 1) % Object.keys(SIGN_PALETTES).length);
  };

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const dateStr = format(selectedDate, "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-xl font-light">Astro Colors</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Astrology-inspired color palettes for the day (collective) and for you (natal + transits).
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Style + symbolism tool. Not scientific or medical advice.
        </p>
      </div>

      {/* Collective Palette */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-light mb-1">
          Collective Colors {isToday ? "Today" : ""}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Based on sign emphasis + key planetary accents
        </p>

        <div className="space-y-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevDay}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal min-w-[200px]",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateStr}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextDay}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {!isToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-xs"
              >
                Today
              </Button>
            )}
          </div>

          {/* Dominant Signs */}
          <div className="flex flex-wrap gap-2">
            {collective.dominantSigns.map((sign) => (
              <span
                key={sign}
                className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {sign} ({SIGN_ELEMENTS[sign]})
              </span>
            ))}
          </div>

          {/* Swatches */}
          <div className="flex gap-2 flex-wrap">
            {collective.palette.map((hex, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(hex, i)}
                className="group relative w-14 h-14 rounded-lg shadow-sm border border-border transition-transform hover:scale-110"
                style={{ backgroundColor: hex }}
                title={`${hex} - ${getColorName(hex)}`}
              >
                {copiedIndex === i ? (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                ) : (
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center py-0.5 bg-black/30 text-white rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {hex}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Reasoning */}
          <p className="text-sm text-muted-foreground">{collective.reasoning}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => copyAllHex(collective.palette)}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy HEX
            </button>
            <button
              onClick={shuffleAltPalette}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Alt Palette
            </button>
          </div>

          {/* Alt Palette Preview */}
          {altPaletteIndex > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Alternative palette:</p>
              <div className="flex gap-1">
                {altPalettes[0].map((hex, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-md border border-border"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="breakdown">
              <AccordionTrigger className="text-sm">Breakdown</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Sign Emphasis</strong>
                    <p>
                      Today has {collective.dominantSigns.length} dominant sign
                      {collective.dominantSigns.length > 1 ? "s" : ""}:{" "}
                      {collective.dominantSigns.join(", ")}. This creates a{" "}
                      {SIGN_ELEMENTS[collective.dominantSigns[0]]}-forward energy.
                    </p>
                  </div>
                  <div>
                    <strong className="text-foreground">Planet Accents</strong>
                    <p>
                      ☿ Mercury in {mercurySign} adds intellectual/communication tones (blues/yellows).
                      ♂ Mars in {marsSign} adds decisive energy (reds/oranges).
                      ♀ Venus in {venusSign} adds beauty/harmony (greens/pinks).
                    </p>
                  </div>
                  <div>
                    <strong className="text-foreground">Moon Tone</strong>
                    <p>
                      The Moon is in {moonSign}, overlaying a subtle{" "}
                      {SIGN_ELEMENTS[moonSign]} quality to the palette.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Personal Palette */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-light mb-1">Your Colors Today</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Based on your natal chart + transits hitting it
        </p>

        {/* Chart Selector Dropdown */}
        {(userNatalChart || savedCharts.length > 0) && (
          <div className="mb-4">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Using chart:
            </label>
            <select
              value={selectedChartId}
              onChange={e => setSelectedChartId(e.target.value)}
              className="w-full md:w-auto border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none rounded-md"
            >
              {userNatalChart && <option value="user">Your Chart ({userNatalChart.name})</option>}
              {savedCharts.map(chart => (
                <option key={chart.id} value={chart.id}>{chart.name}</option>
              ))}
            </select>
          </div>
        )}

        {!selectedChart ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Add your natal chart to unlock personalized color palettes.
            </p>
            <button
              onClick={onOpenNatalForm}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Enter Natal Placements
            </button>
          </div>
        ) : personal ? (
          <div className="space-y-4">
            {/* Top Transits */}
            {personal.topTransits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {personal.topTransits.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Swatches */}
            <div className="flex gap-2 flex-wrap">
              {personal.palette.map((hex, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(hex, 100 + i)}
                  className="group relative w-14 h-14 rounded-lg shadow-sm border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: hex }}
                  title={`${hex} - ${getColorName(hex)}`}
                >
                  {copiedIndex === 100 + i ? (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                  ) : (
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center py-0.5 bg-black/30 text-white rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {hex}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Reasoning */}
            <p className="text-sm text-muted-foreground">{personal.reasoning}</p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => copyAllHex(personal.palette)}
                className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy HEX
              </button>
              <button
                onClick={() => setPersonalAltIndex((prev) => (prev + 1) % 3)}
                className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Alt Palette
              </button>
              <button
                onClick={() => {
                  setMoreNeutral(!moreNeutral);
                  setMoreBold(false);
                }}
                className={`px-3 py-2 text-xs border rounded-md transition-colors ${
                  moreNeutral
                    ? "bg-secondary border-primary text-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                More Neutral
              </button>
              <button
                onClick={() => {
                  setMoreBold(!moreBold);
                  setMoreNeutral(false);
                }}
                className={`px-3 py-2 text-xs border rounded-md transition-colors ${
                  moreBold
                    ? "bg-secondary border-primary text-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                More Bold
              </button>
            </div>

            {/* Transit Details - with full explanations */}
            {personal.transitDetails && personal.transitDetails.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="transits">
                  <AccordionTrigger className="text-sm">Active Aspects ({personal.transitDetails.length})</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {personal.transitDetails.map((detail, i) => {
                        const transitSymbol = 
                          detail.transitPlanet === 'Sun' ? '☉' :
                          detail.transitPlanet === 'Moon' ? '☽' :
                          detail.transitPlanet === 'Mercury' ? '☿' :
                          detail.transitPlanet === 'Venus' ? '♀' :
                          detail.transitPlanet === 'Mars' ? '♂' :
                          detail.transitPlanet === 'Jupiter' ? '♃' :
                          detail.transitPlanet === 'Saturn' ? '♄' :
                          detail.transitPlanet === 'Uranus' ? '♅' :
                          detail.transitPlanet === 'Neptune' ? '♆' :
                          detail.transitPlanet === 'Pluto' ? '♇' : '★';
                        
                        const natalSymbol = 
                          detail.natalPlanet === 'Sun' ? '☉' :
                          detail.natalPlanet === 'Moon' ? '☽' :
                          detail.natalPlanet === 'Mercury' ? '☿' :
                          detail.natalPlanet === 'Venus' ? '♀' :
                          detail.natalPlanet === 'Mars' ? '♂' :
                          detail.natalPlanet === 'Jupiter' ? '♃' :
                          detail.natalPlanet === 'Saturn' ? '♄' :
                          detail.natalPlanet === 'Ascendant' ? 'AC' :
                          detail.natalPlanet === 'Pallas' ? '⚴' :
                          detail.natalPlanet === 'Juno' ? '⚵' :
                          detail.natalPlanet === 'Ceres' ? '⚳' :
                          detail.natalPlanet === 'Vesta' ? '⚶' :
                          detail.natalPlanet === 'Chiron' ? '⚷' :
                          detail.natalPlanet === 'NorthNode' ? '☊' : '★';
                        
                        return (
                          <div key={i} className="p-3 rounded-md bg-secondary/50 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg">{transitSymbol}</span>
                              <span className="font-medium text-foreground">
                                {detail.transitPlanet} {detail.aspectSymbol} {detail.natalPlanet}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                {detail.aspectType} · {detail.orb}° orb
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-4">
                              <span>Transit: {transitSymbol} {detail.transitDegree}° {detail.transitSign}</span>
                              <span>Natal: {natalSymbol} {detail.natalDegree}° {detail.natalSign}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {detail.explanation}
                            </p>
                            <p className="text-xs text-primary italic">
                              {detail.colorInfluence}
                            </p>
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground italic pt-2">
                        Aspects are angular relationships between planets. Tighter orbs (closer to 0°) indicate stronger influences.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
};
