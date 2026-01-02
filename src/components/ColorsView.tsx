import { useState, useMemo } from "react";
import { Copy, Check, Shuffle, Palette } from "lucide-react";
import { getPlanetaryPositions } from "@/lib/astrology";
import {
  getCollectivePalette,
  getPersonalPalette,
  getColorName,
  SIGN_PALETTES,
  SIGN_ELEMENTS,
} from "@/lib/colorPalettes";
import { NatalChart } from "@/hooks/useNatalChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface ColorsViewProps {
  userNatalChart: NatalChart | null;
  onOpenNatalForm?: () => void;
}

export const ColorsView = ({ userNatalChart, onOpenNatalForm }: ColorsViewProps) => {
  const today = new Date();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [altPaletteIndex, setAltPaletteIndex] = useState(0);
  const [moreNeutral, setMoreNeutral] = useState(false);
  const [moreBold, setMoreBold] = useState(false);

  // Get today's planetary positions
  const positions = useMemo(() => {
    const planets = getPlanetaryPositions(today);
    return [
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
  }, []);

  const moonSign = positions.find((p) => p.name === "Moon")?.sign || "Cancer";

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

  // Personal palette (if natal chart exists)
  const personal = useMemo(() => {
    if (!userNatalChart?.planets) return null;

    const natalPositions = Object.entries(userNatalChart.planets)
      .filter(([_, v]) => v)
      .map(([name, v]) => ({ name, sign: v!.sign }));

    return getPersonalPalette(natalPositions, positions, { moreNeutral, moreBold });
  }, [userNatalChart, positions, moreNeutral, moreBold]);

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

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
        <h3 className="font-serif text-lg font-light mb-1">Collective Colors Today</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Based on sign emphasis + key planetary accents
        </p>

        <div className="space-y-4">
          {/* Date */}
          <div className="text-sm text-foreground">{dateStr}</div>

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
                      Mars and Venus add decisive/beauty tones respectively. Look for reds (Mars) and
                      greens/pinks (Venus) in the palette.
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

        {!userNatalChart ? (
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

            {/* Transit Details */}
            {personal.topTransits.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="transits">
                  <AccordionTrigger className="text-sm">Transit Details</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {personal.topTransits.map((t, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {t}
                        </li>
                      ))}
                    </ul>
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
