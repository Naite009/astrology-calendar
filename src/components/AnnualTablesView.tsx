import { useMemo, useRef, useState } from "react";
import * as Astronomy from "astronomy-engine";
import { Download, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDownloadImage } from "@/hooks/useDownloadImage";
import { getNewMoonInterpretation, NewMoonInterpretation } from "@/lib/newMoonInterpretations";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AnnualTablesViewProps {
  year: number;
}

interface ExactLunarEvent {
  type: "New Moon" | "Full Moon" | "First Quarter" | "Last Quarter";
  time: Date;
  moonSign: string;
  moonDegree: string;
  moonMinutes: string;
  moonLongitude: number; // Add longitude for interpretation
  sunSign?: string;
  sunDegree?: string;
  sunMinutes?: string;
  name: string;
  isSupermoon: boolean;
  distance: number;
  supermoonSequence?: string;
  signEntryDate?: Date;
}

interface QuarterMoonEvent {
  type: "First Quarter" | "Last Quarter";
  time: Date;
  moonSign: string;
  moonDegree: string;
  moonMinutes: string;
  signEntryDate?: Date;
}

interface RetrogradePeriod {
  start: Date;
  end: Date;
  startSign: string;
  endSign: string;
}

// Traditional moon names by month
const MOON_NAMES: Record<number, string> = {
  0: "Wolf Moon",
  1: "Snow Moon",
  2: "Worm Moon",
  3: "Pink Moon",
  4: "Flower Moon",
  5: "Strawberry Moon",
  6: "Buck Moon",
  7: "Sturgeon Moon",
  8: "Harvest Moon",
  9: "Hunter's Moon",
  10: "Beaver Moon",
  11: "Cold Moon",
};

// Calendar month/year in America/New_York time — keeps Blue Moon detection
// consistent with how lunar events are bucketed by ET day elsewhere.
const getETMonthYear = (d: Date): { month: number; year: number } => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
  const year = Number(parts.find((p) => p.type === "year")?.value);
  return { month, year };
};

// Returns "Blue Moon" if this Full Moon is the second within its ET calendar month,
// otherwise the traditional monthly name.
const getFullMoonName = (fullMoonDate: Date): string => {
  try {
    const { month, year } = getETMonthYear(fullMoonDate);
    const searchBack = new Date(fullMoonDate.getTime() - 31 * 24 * 60 * 60 * 1000);
    const prev = Astronomy.SearchMoonPhase(180, searchBack, 32);
    if (prev && prev.date.getTime() < fullMoonDate.getTime() - 60 * 1000) {
      const prevMY = getETMonthYear(prev.date);
      if (prevMY.month === month && prevMY.year === year) {
        return "Blue Moon";
      }
    }
  } catch {
    // fall through
  }
  return MOON_NAMES[getETMonthYear(fullMoonDate).month] || "";
};

const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈" },
  { name: "Taurus", symbol: "♉" },
  { name: "Gemini", symbol: "♊" },
  { name: "Cancer", symbol: "♋" },
  { name: "Leo", symbol: "♌" },
  { name: "Virgo", symbol: "♍" },
  { name: "Libra", symbol: "♎" },
  { name: "Scorpio", symbol: "♏" },
  { name: "Sagittarius", symbol: "♐" },
  { name: "Capricorn", symbol: "♑" },
  { name: "Aquarius", symbol: "♒" },
  { name: "Pisces", symbol: "♓" },
];

const longitudeToZodiac = (longitude: number) => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degreeInSign = normalizedLon % 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degree) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex].name,
    symbol: ZODIAC_SIGNS[signIndex].symbol,
    degree,
    minutes,
  };
};

// Format time in EST/EDT with proper DST handling
const formatTimeEST = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
};

const getTimezoneAbbr = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(date);
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  return tzPart?.value || "EST";
};

// Find when Moon entered its current sign before the lunar event
const findMoonSignEntry = (eventTime: Date, targetSign: string): Date | undefined => {
  try {
    // Search backwards up to 3 days
    for (let hours = 0; hours < 72; hours++) {
      const checkTime = new Date(eventTime.getTime() - hours * 60 * 60 * 1000);
      const moonPos = Astronomy.GeoMoon(checkTime);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);

      if (zodiac.sign !== targetSign) {
        // Found when it was in previous sign, so entry is approximately 1 hour later
        return new Date(checkTime.getTime() + 60 * 60 * 1000);
      }
    }
  } catch (error) {
    console.error("Error finding moon sign entry:", error);
  }
  return undefined;
};

// Format time in EST/EDT with proper DST handling
const formatTimeESTFull = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
};

// New Moon Card Component with expandable interpretation
const NewMoonCard = ({ 
  event, 
  interpretation 
}: { 
  event: ExactLunarEvent; 
  interpretation: NewMoonInterpretation;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getSignSymbol = (sign: string): string => {
    const symbols: Record<string, string> = {
      Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
      Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
      Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
    };
    return symbols[sign] || '';
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header - always visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors text-left">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Date */}
              <div className="min-w-[120px]">
                <div className="font-medium text-foreground">
                  {event.time.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "America/New_York",
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeESTFull(event.time)} {getTimezoneAbbr(event.time)}
                </div>
              </div>
              
              {/* Name & Position */}
              <div className="min-w-[150px]">
                <div className="font-medium text-foreground">{event.name}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {event.moonDegree}°{event.moonMinutes}′ {getSignSymbol(event.moonSign)} {event.moonSign}
                </div>
              </div>
              
              {/* Quick Info - Ruler */}
              <div className="min-w-[130px] hidden sm:block">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Ruler</div>
                <div className="text-sm text-foreground">
                  {interpretation.rulerSymbol} {interpretation.ruler} in {interpretation.rulerSign}
                  {interpretation.rulerRetrograde && <span className="text-amber-500 ml-1">℞</span>}
                </div>
              </div>
              
              {/* Conjunctions */}
              {interpretation.conjunctions.length > 0 && (
                <div className="min-w-[100px] hidden md:block">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Conjunct</div>
                  <div className="text-sm text-foreground flex gap-1">
                    {interpretation.conjunctions.map((c, i) => (
                      <span key={i} className="text-primary">{c.symbol}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stellium Badge */}
              {interpretation.hasStellium && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs">
                  <Sparkles size={12} />
                  {interpretation.stelliumPlanets.length}-planet stellium
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground ml-4">
              <span className="text-xs">Planetary Weather</span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
        </CollapsibleTrigger>
        
        {/* Expandable Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            {/* Main Theme */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">The Story of This Moon</h4>
              <p className="text-sm text-foreground leading-relaxed">{interpretation.mainTheme}</p>
            </div>
            
            {/* Aspects Grid */}
            {interpretation.conjunctions.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Planets Conjunct This New Moon
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {interpretation.conjunctions.map((planet, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-secondary/30">
                      <span className="text-lg">{planet.symbol}</span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{planet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {planet.degree}° {planet.sign}
                          {planet.isRetrograde && <span className="text-amber-500 ml-1">℞</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other Aspects */}
            {interpretation.aspects.filter(a => a.aspectType !== 'conjunction').length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Aspects to This New Moon
                </h4>
                <div className="space-y-1">
                  {interpretation.aspects
                    .filter(a => a.aspectType !== 'conjunction')
                    .map((aspect, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`${aspect.aspectType === 'trine' || aspect.aspectType === 'sextile' ? 'text-green-500' : aspect.aspectType === 'square' || aspect.aspectType === 'opposition' ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {aspect.aspectSymbol}
                        </span>
                        <span className="text-foreground">{aspect.symbol} {aspect.planet}</span>
                        <span className="text-muted-foreground text-xs">({aspect.orb}° orb)</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="text-muted-foreground text-xs">{aspect.meaning}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* What to Set */}
            <div className="rounded-lg bg-primary/5 p-3 border border-primary/20">
              <h4 className="text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                What to Set Intentions For
              </h4>
              <p className="text-sm text-foreground">{interpretation.whatToSet}</p>
            </div>
            
            {/* Soul Level */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Soul Level</h4>
              <p className="text-sm text-muted-foreground italic">{interpretation.soulLevel}</p>
            </div>
            
            {/* Practical Advice */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Practical Guidance</h4>
              <p className="text-sm text-foreground">{interpretation.practicalAdvice}</p>
            </div>
            
            {/* How to Work With It */}
            {interpretation.howToWork && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Support & Challenges</h4>
                <p className="text-sm text-muted-foreground">{interpretation.howToWork}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const AnnualTablesView = ({ year }: AnnualTablesViewProps) => {
  const { downloadAsImage } = useDownloadImage();
  const fullMoonsRef = useRef<HTMLDivElement>(null);
  const newMoonsRef = useRef<HTMLDivElement>(null);
  const quarterMoonsRef = useRef<HTMLDivElement>(null);
  const retrogradesRef = useRef<HTMLDivElement>(null);

  // Calculate EXACT lunar events (not approximate days)
  const lunarEvents = useMemo(() => {
    const events: ExactLunarEvent[] = [];
    let searchStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    // Find all New Moons in the year
    while (searchStart < yearEnd) {
      try {
        const newMoon = Astronomy.SearchMoonPhase(0, searchStart, 40);
        if (newMoon && newMoon.date.getFullYear() === year) {
          const moonPos = Astronomy.GeoMoon(newMoon.date);
          const ecliptic = Astronomy.Ecliptic(moonPos);
          const moonZodiac = longitudeToZodiac(ecliptic.elon);
          const distance = moonPos.Length() * 149597870.7; // AU to km
          const isSupermoon = distance < 361000;

          const signEntryDate = findMoonSignEntry(newMoon.date, moonZodiac.sign);

          events.push({
            type: "New Moon",
            time: newMoon.date,
            moonSign: moonZodiac.sign,
            moonDegree: moonZodiac.degree.toString().padStart(2, "0"),
            moonMinutes: moonZodiac.minutes.toString().padStart(2, "0"),
            moonLongitude: ecliptic.elon,
            name: MOON_NAMES[newMoon.date.getMonth()] || "",
            isSupermoon,
            distance: Math.round(distance),
            signEntryDate,
          });

          searchStart = new Date(newMoon.date.getTime() + 20 * 24 * 60 * 60 * 1000);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Find all Full Moons in the year
    searchStart = new Date(year, 0, 1);
    const supermoonDistances: { date: Date; distance: number }[] = [];

    while (searchStart < yearEnd) {
      try {
        const fullMoon = Astronomy.SearchMoonPhase(180, searchStart, 40);
        if (fullMoon && fullMoon.date.getFullYear() === year) {
          const moonPos = Astronomy.GeoMoon(fullMoon.date);
          const ecliptic = Astronomy.Ecliptic(moonPos);
          const moonZodiac = longitudeToZodiac(ecliptic.elon);
          const distance = moonPos.Length() * 149597870.7;
          const isSupermoon = distance < 361000;

          // Get Sun position for opposition display
          const sunPos = Astronomy.GeoVector(Astronomy.Body.Sun, fullMoon.date, false);
          const sunEcliptic = Astronomy.Ecliptic(sunPos);
          const sunZodiac = longitudeToZodiac(sunEcliptic.elon);

          if (isSupermoon) {
            supermoonDistances.push({ date: fullMoon.date, distance });
          }

          const signEntryDate = findMoonSignEntry(fullMoon.date, moonZodiac.sign);

          events.push({
            type: "Full Moon",
            time: fullMoon.date,
            moonSign: moonZodiac.sign,
            moonDegree: moonZodiac.degree.toString().padStart(2, "0"),
            moonMinutes: moonZodiac.minutes.toString().padStart(2, "0"),
            moonLongitude: ecliptic.elon,
            sunSign: sunZodiac.sign,
            sunDegree: sunZodiac.degree.toString().padStart(2, "0"),
            sunMinutes: sunZodiac.minutes.toString().padStart(2, "0"),
            name: getFullMoonName(fullMoon.date),
            isSupermoon,
            distance: Math.round(distance),
            signEntryDate,
          });

          searchStart = new Date(fullMoon.date.getTime() + 20 * 24 * 60 * 60 * 1000);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Add supermoon sequence info
    const supermoons = events.filter((e) => e.isSupermoon && e.type === "Full Moon");
    supermoons.forEach((sm, idx) => {
      if (supermoons.length > 1) {
        sm.supermoonSequence = `${idx + 1} of ${supermoons.length} supermoons`;
      }
    });

    // Sort by date
    events.sort((a, b) => a.time.getTime() - b.time.getTime());

    return events;
  }, [year]);

  // Calculate Quarter Moon events
  const quarterMoons = useMemo(() => {
    const quarters: QuarterMoonEvent[] = [];
    let searchStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    // Find all First Quarter moons (phase 90)
    while (searchStart < yearEnd) {
      try {
        const firstQuarter = Astronomy.SearchMoonPhase(90, searchStart, 40);
        if (firstQuarter && firstQuarter.date.getFullYear() === year) {
          const moonPos = Astronomy.GeoMoon(firstQuarter.date);
          const ecliptic = Astronomy.Ecliptic(moonPos);
          const moonZodiac = longitudeToZodiac(ecliptic.elon);
          const signEntryDate = findMoonSignEntry(firstQuarter.date, moonZodiac.sign);

          quarters.push({
            type: "First Quarter",
            time: firstQuarter.date,
            moonSign: moonZodiac.sign,
            moonDegree: moonZodiac.degree.toString().padStart(2, "0"),
            moonMinutes: moonZodiac.minutes.toString().padStart(2, "0"),
            signEntryDate,
          });

          searchStart = new Date(firstQuarter.date.getTime() + 20 * 24 * 60 * 60 * 1000);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Find all Last Quarter moons (phase 270)
    searchStart = new Date(year, 0, 1);
    while (searchStart < yearEnd) {
      try {
        const lastQuarter = Astronomy.SearchMoonPhase(270, searchStart, 40);
        if (lastQuarter && lastQuarter.date.getFullYear() === year) {
          const moonPos = Astronomy.GeoMoon(lastQuarter.date);
          const ecliptic = Astronomy.Ecliptic(moonPos);
          const moonZodiac = longitudeToZodiac(ecliptic.elon);
          const signEntryDate = findMoonSignEntry(lastQuarter.date, moonZodiac.sign);

          quarters.push({
            type: "Last Quarter",
            time: lastQuarter.date,
            moonSign: moonZodiac.sign,
            moonDegree: moonZodiac.degree.toString().padStart(2, "0"),
            moonMinutes: moonZodiac.minutes.toString().padStart(2, "0"),
            signEntryDate,
          });

          searchStart = new Date(lastQuarter.date.getTime() + 20 * 24 * 60 * 60 * 1000);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Sort by date
    quarters.sort((a, b) => a.time.getTime() - b.time.getTime());

    return quarters;
  }, [year]);

  const firstQuarters = quarterMoons.filter((q) => q.type === "First Quarter");
  const lastQuarters = quarterMoons.filter((q) => q.type === "Last Quarter");

  // Calculate Mercury Retrograde periods
  const retrogradePeriods = useMemo(() => {
    const periods: RetrogradePeriod[] = [];
    let inRetro = false;
    let retroStart: Date | null = null;
    let startSign = "";

    const getMercurySign = (date: Date): string => {
      try {
        const mercury = Astronomy.GeoVector(Astronomy.Body.Mercury, date, false);
        const ecliptic = Astronomy.Ecliptic(mercury);
        return longitudeToZodiac(ecliptic.elon).sign;
      } catch {
        return "";
      }
    };

    const isRetrograde = (date: Date): boolean => {
      try {
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayMercury = Astronomy.GeoVector(Astronomy.Body.Mercury, date, false);
        const yesterdayMercury = Astronomy.GeoVector(Astronomy.Body.Mercury, yesterday, false);

        const todayEcliptic = Astronomy.Ecliptic(todayMercury);
        const yesterdayEcliptic = Astronomy.Ecliptic(yesterdayMercury);

        return todayEcliptic.elon < yesterdayEcliptic.elon;
      } catch {
        return false;
      }
    };

    // Check every day of the year
    for (let d = 0; d < 366; d++) {
      const date = new Date(year, 0, 1 + d);
      if (date.getFullYear() !== year) break;

      const isRetro = isRetrograde(date);

      if (isRetro && !inRetro) {
        retroStart = new Date(date);
        startSign = getMercurySign(date);
        inRetro = true;
      } else if (!isRetro && inRetro && retroStart) {
        periods.push({
          start: retroStart,
          end: new Date(date),
          startSign,
          endSign: getMercurySign(date),
        });
        inRetro = false;
      }
    }

    // Handle retrograde extending into next year
    if (inRetro && retroStart) {
      periods.push({
        start: retroStart,
        end: new Date(year, 11, 31),
        startSign,
        endSign: getMercurySign(new Date(year, 11, 31)),
      });
    }

    return periods;
  }, [year]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const fullMoons = lunarEvents.filter((e) => e.type === "Full Moon");
    const newMoons = lunarEvents.filter((e) => e.type === "New Moon");
    const supermoons = fullMoons.filter((e) => e.isSupermoon);
    const totalRetroDays = retrogradePeriods.reduce((acc, p) => {
      return acc + Math.ceil((p.end.getTime() - p.start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    return {
      fullMoons: fullMoons.length,
      newMoons: newMoons.length,
      supermoons: supermoons.length,
      retrogradePeriods: retrogradePeriods.length,
      totalRetroDays,
    };
  }, [lunarEvents, retrogradePeriods]);

  const fullMoons = lunarEvents.filter((e) => e.type === "Full Moon");
  const newMoons = lunarEvents.filter((e) => e.type === "New Moon");

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* Quick Reference Stats */}
      <section className="rounded-sm border border-border bg-background p-6">
        <h2 className="mb-6 border-b border-border pb-4 font-serif text-2xl font-light text-foreground">
          📊 {year} At a Glance
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div className="rounded-sm bg-secondary p-4 text-center">
            <div className="text-3xl font-light text-foreground">{stats.fullMoons}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Full Moons
            </div>
          </div>
          <div className="rounded-sm bg-secondary p-4 text-center">
            <div className="text-3xl font-light text-foreground">{stats.newMoons}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              New Moons
            </div>
          </div>
          <div className="rounded-sm bg-secondary p-4 text-center">
            <div className="text-3xl font-light text-foreground">{stats.supermoons}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Supermoons
            </div>
          </div>
          <div className="rounded-sm bg-secondary p-4 text-center">
            <div className="text-3xl font-light text-foreground">{stats.retrogradePeriods}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Mercury Rx
            </div>
          </div>
          <div className="rounded-sm bg-secondary p-4 text-center">
            <div className="text-3xl font-light text-foreground">{stats.totalRetroDays}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Retro Days
            </div>
          </div>
        </div>
      </section>

      {/* Full Moons Table */}
      <section ref={fullMoonsRef} className="rounded-sm border border-border bg-background p-6">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-2xl font-light text-foreground">
            🌕 Full Moons {year}
          </h2>
          <button
            onClick={() => downloadAsImage(fullMoonsRef.current, `full-moons-${year}`)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Download size={14} />
            Download Image
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Exact times shown in Eastern Time (EST/EDT). Full Moon = Sun opposite Moon.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Time</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Moon Position</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Sun Position</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Moon Entered Sign</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fullMoons.map((event, idx) => (
                <TableRow key={idx} className={event.isSupermoon ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">
                    {event.time.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "America/New_York",
                    })}
                  </TableCell>
                  <TableCell>
                    {formatTimeEST(event.time)} {getTimezoneAbbr(event.time)}
                  </TableCell>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {event.moonDegree}°{event.moonMinutes}′
                    </span>{" "}
                    {event.moonSign}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="font-mono">
                      {event.sunDegree}°{event.sunMinutes}′
                    </span>{" "}
                    {event.sunSign}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.signEntryDate
                      ? event.signEntryDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "America/New_York",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {event.isSupermoon && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        title="Supermoon: Full Moon occurring near perigee — within ~90% of the Moon's closest approach to Earth (under 361,000 km). It appears noticeably larger and up to ~30% brighter than an average full moon."
                      >
                        ⭐ Supermoon
                        {event.supermoonSequence && (
                          <span className="text-muted-foreground">
                            ({event.supermoonSequence})
                          </span>
                        )}
                      </span>
                    )}
                    {event.name === "Blue Moon" && (
                      <span
                        className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground"
                        title="Blue Moon (calendar definition): the second Full Moon to fall within the same calendar month. Because the lunar cycle is ~29.5 days, this happens roughly once every 2–3 years — hence 'once in a Blue Moon.'"
                      >
                        🔵 Blue Moon
                      </span>
                    )}
                    {event.isSupermoon && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {event.distance.toLocaleString()} km from Earth
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* New Moons Table */}
      <section ref={newMoonsRef} className="rounded-sm border border-border bg-background p-6">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-2xl font-light text-foreground">
            🌑 New Moons {year}
          </h2>
          <button
            onClick={() => downloadAsImage(newMoonsRef.current, `new-moons-${year}`)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Download size={14} />
            Download Image
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Exact times shown in Eastern Time (EST/EDT). New Moon = Sun conjunct Moon. Click any row for detailed planetary weather.
        </p>
        <div className="space-y-4">
          {newMoons.map((event, idx) => {
            const interp = getNewMoonInterpretation(event.time, event.moonLongitude);
            return (
              <NewMoonCard key={idx} event={event} interpretation={interp} />
            );
          })}
        </div>
      </section>

      {/* Quarter Moons Table */}
      <section ref={quarterMoonsRef} className="rounded-sm border border-border bg-background p-6">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-2xl font-light text-foreground">
            🌓 Quarter Moons {year}
          </h2>
          <button
            onClick={() => downloadAsImage(quarterMoonsRef.current, `quarter-moons-${year}`)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Download size={14} />
            Download Image
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          First Quarter (🌓) = waxing half moon, time for action. Last Quarter (🌗) = waning half moon, time for release.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Time</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Phase</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Position</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Moon Entered Sign</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest">Meaning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarterMoons.map((event, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {event.time.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "America/New_York",
                    })}
                  </TableCell>
                  <TableCell>
                    {formatTimeEST(event.time)} {getTimezoneAbbr(event.time)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {event.type === "First Quarter" ? "🌓" : "🌗"} {event.type}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {event.moonDegree}°{event.moonMinutes}′
                    </span>{" "}
                    {event.moonSign}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.signEntryDate
                      ? event.signEntryDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "America/New_York",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {event.type === "First Quarter"
                        ? "Take action, overcome obstacles, push forward"
                        : "Release, let go, forgive, clear space"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Mercury Retrograde */}
      <section ref={retrogradesRef} className="rounded-sm border border-border bg-background p-6">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-2xl font-light text-foreground">
            ☿ Mercury Retrograde {year}
          </h2>
          <button
            onClick={() => downloadAsImage(retrogradesRef.current, `mercury-retrograde-${year}`)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Download size={14} />
            Download Image
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Mercury appears to move backward during these periods. Review, revise, reconnect—avoid
          major contracts or purchases.
        </p>
        {retrogradePeriods.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {retrogradePeriods.map((period, idx) => {
              const days = Math.ceil(
                (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={idx}
                  className="rounded-sm border border-energy-caution/50 bg-energy-caution/10 p-4"
                >
                  <div className="mb-2 text-lg font-medium text-foreground">
                    {period.start.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {period.end.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Duration:</span> {days} days
                    </div>
                    <div>
                      <span className="font-medium">Starts in:</span> {period.startSign}
                    </div>
                    <div>
                      <span className="font-medium">Ends in:</span> {period.endSign}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No Mercury retrograde periods detected in {year}.
          </p>
        )}
      </section>

      {/* Legend */}
      <section className="rounded-sm border border-border bg-secondary/50 p-6">
        <h3 className="mb-4 font-serif text-lg font-light text-foreground">
          📖 How to Read These Tables
        </h3>
        <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <strong className="text-foreground">Moon Position:</strong> Exact zodiac position
            (degrees°minutes′) at the moment of the lunar phase. For example, 13°02′ Cancer means
            13 degrees and 2 minutes into Cancer.
          </div>
          <div>
            <strong className="text-foreground">Sun Position (Full Moons):</strong> The Sun's
            position opposite the Moon. Full Moons always have Sun and Moon in opposing signs.
          </div>
          <div>
            <strong className="text-foreground">Moon Entered Sign:</strong> When the Moon first
            entered its current zodiac sign before the exact lunar phase.
          </div>
          <div>
            <strong className="text-foreground">Supermoon:</strong> Full Moon occurring within
            90% of perigee (closest approach to Earth, under 361,000 km). Appears larger and
            brighter.
          </div>
        </div>
      </section>
    </div>
  );
};
