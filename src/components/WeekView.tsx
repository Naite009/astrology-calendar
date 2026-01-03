import { Textarea } from "@/components/ui/textarea";
import {
  getPlanetaryPositions,
  getMoonPhase,
  isMercuryRetrograde,
  getEnergyRating,
  EnergyLevel,
} from "@/lib/astrology";
import { NatalChart } from "@/hooks/useNatalChart";
import { calculateTransitAspects, getTopTransitAspects, getPersonalizedJournalPrompt, getTransitPlanetSymbol, TransitAspect, HOUSE_MEANINGS } from "@/lib/transitAspects";

interface WeekViewProps {
  currentDate: Date;
  weekNotes: Record<string, string>;
  dayNotes: Record<string, string>;
  saveWeekNotes: (weekKey: string, notes: string) => void;
  saveDayNotes: (dateKey: string, notes: string) => void;
  activeChart?: NatalChart | null;
}

const ENERGY_COLORS: Record<EnergyLevel, string> = {
  rest: "bg-energy-rest",
  high: "bg-energy-high",
  caution: "bg-energy-caution",
  moderate: "bg-energy-moderate",
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Sign-specific energies for daily guidance
const SIGN_ENERGIES: Record<string, { action: string; focus: string; avoid: string }> = {
  Aries: { action: "initiate boldly", focus: "courage and independence", avoid: "impulsiveness" },
  Taurus: { action: "build steadily", focus: "sensuality and security", avoid: "stubbornness" },
  Gemini: { action: "communicate freely", focus: "learning and connections", avoid: "scattered energy" },
  Cancer: { action: "nurture deeply", focus: "emotions and home", avoid: "over-sensitivity" },
  Leo: { action: "create joyfully", focus: "self-expression and confidence", avoid: "ego battles" },
  Virgo: { action: "organize wisely", focus: "health and service", avoid: "perfectionism" },
  Libra: { action: "harmonize gracefully", focus: "relationships and beauty", avoid: "indecision" },
  Scorpio: { action: "transform powerfully", focus: "depth and intimacy", avoid: "manipulation" },
  Sagittarius: { action: "explore freely", focus: "philosophy and adventure", avoid: "over-extension" },
  Capricorn: { action: "structure deliberately", focus: "ambition and discipline", avoid: "rigidity" },
  Aquarius: { action: "innovate uniquely", focus: "community and ideals", avoid: "detachment" },
  Pisces: { action: "flow intuitively", focus: "spirituality and compassion", avoid: "escapism" },
};

const getDailyGuidance = (
  moonPhase: { isBalsamic: boolean; phaseName: string },
  mercuryRetro: boolean,
  moonSign: string
): string => {
  const signData = SIGN_ENERGIES[moonSign] || SIGN_ENERGIES.Aries;

  if (mercuryRetro) {
    return `Mercury Retrograde in ${moonSign} - Review and revise communications. Back up data. Reconnect with old contacts. Avoid new contracts. Practice patience with technology and travel.`;
  }

  if (moonPhase.isBalsamic) {
    return `Balsamic Moon in ${moonSign} - The final surrender before rebirth. This is sacred rest time. Release attachments. Meditate and dream. Trust the void. ${signData.focus} dissolves into the cosmic flow. Avoid starting anything new.`;
  }

  if (moonPhase.phaseName === "New Moon") {
    return `New Moon in ${moonSign} - Plant seeds of intention. Set powerful goals aligned with ${signData.focus}. ${signData.action} with fresh vision. Channel this initiating energy wisely. Avoid: ${signData.avoid}.`;
  }

  if (moonPhase.phaseName === "Waxing Crescent") {
    return `Waxing Crescent in ${moonSign} - Take first brave steps toward your New Moon intentions. Energy builds as you ${signData.action}. Focus on ${signData.focus}. Faith and momentum are growing.`;
  }

  if (moonPhase.phaseName === "First Quarter") {
    return `First Quarter Moon in ${moonSign} - Crisis of action. Push through resistance. Make decisive choices around ${signData.focus}. ${signData.action} despite challenges. This is your test of commitment.`;
  }

  if (moonPhase.phaseName === "Waxing Gibbous") {
    return `Waxing Gibbous in ${moonSign} - Refine and perfect. Adjust your approach to ${signData.focus}. Details matter now. ${signData.action} with increasing wisdom. The peak approaches - prepare well.`;
  }

  if (moonPhase.phaseName === "Full Moon") {
    return `Full Moon in ${moonSign} - Maximum illumination! Celebrate what you have manifested around ${signData.focus}. Release what no longer serves. Emotions peak. ${signData.action} with full awareness. Harvest your efforts.`;
  }

  if (moonPhase.phaseName === "Waning Gibbous") {
    return `Waning Gibbous in ${moonSign} - Share your wisdom. Give back what you have learned about ${signData.focus}. ${signData.action} with generosity. Gratitude amplifies your blessings. Teach and mentor.`;
  }

  if (moonPhase.phaseName === "Last Quarter") {
    return `Last Quarter Moon in ${moonSign} - Crisis of consciousness. Let go of what blocks your path around ${signData.focus}. ${signData.action} toward release. Forgive. Break old patterns. The light is waning - surrender gracefully.`;
  }

  if (moonPhase.phaseName === "Waning Crescent") {
    return `Waning Crescent in ${moonSign} - Preparation for renewal. Rest deeply. Reflect on ${signData.focus}. ${signData.action} mindfully as you wind down. Spiritual practices deepen. The dark moon approaches - trust the process.`;
  }

  return `Moon in ${moonSign} - ${signData.action} with awareness of ${signData.focus}. Avoid ${signData.avoid}.`;
};

export const WeekView = ({
  currentDate,
  weekNotes,
  dayNotes,
  saveWeekNotes,
  saveDayNotes,
  activeChart,
}: WeekViewProps) => {
  const weekStart = getWeekStart(currentDate);
  const weekDates = getWeekDates(weekStart);
  const weekKey = weekStart.toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Weekly Intentions Header */}
      <div className="mb-6 rounded-sm border border-border bg-secondary p-6">
        <h2 className="mb-4 font-serif text-2xl font-light text-foreground">
          Weekly Overview
        </h2>
        {activeChart && (
          <div className="mb-4 p-3 bg-primary/10 rounded-sm border border-primary/20">
            <div className="text-[11px] uppercase tracking-widest text-primary mb-1">
              Viewing Personal Transits for
            </div>
            <div className="font-medium text-foreground">{activeChart.name}</div>
          </div>
        )}
        <div>
          <h3 className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Intentions for This Week
          </h3>
          <Textarea
            placeholder="What are your intentions and goals for this week? What energy do you want to cultivate?"
            value={weekNotes[weekKey] || ""}
            onChange={(e) => saveWeekNotes(weekKey, e.target.value)}
            className="min-h-20 resize-y border-border bg-background font-sans text-sm focus:border-primary"
          />
        </div>
      </div>

      {/* Day Cards */}
      <div className="flex flex-col gap-6">
        {weekDates.map((date) => {
          const planets = getPlanetaryPositions(date);
          const moonPhase = getMoonPhase(date);
          const mercuryRetro = isMercuryRetrograde(date);
          const energy = getEnergyRating(moonPhase, mercuryRetro);
          const guidance = getDailyGuidance(moonPhase, mercuryRetro, planets.moon.signName);
          const dateKey = date.toISOString().split("T")[0];
          const isToday = date.toDateString() === new Date().toDateString();

          // Calculate personal transits if chart selected
          const transitAspects: TransitAspect[] = activeChart
            ? calculateTransitAspects(date, planets, activeChart)
            : [];
          const topTransits = getTopTransitAspects(transitAspects, 5);

          // Get personalized journal prompt if chart active
          const journalPrompt = activeChart && transitAspects.length > 0
            ? getPersonalizedJournalPrompt(transitAspects, planets.moon.signName, moonPhase.phaseName)
            : "How are you feeling today? What happened? What are you grateful for?";

          return (
            <div
              key={dateKey}
              className={`rounded-sm border border-border p-6 ${
                isToday ? "bg-secondary" : "bg-background"
              }`}
            >
              {/* Day Header */}
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {date.toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                  <div className="font-serif text-2xl font-light text-foreground">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-2xl">{moonPhase.phaseIcon}</span>
                    <span>
                      {planets.moon.sign} {planets.moon.degree}°
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${ENERGY_COLORS[energy.level]} ${
                      energy.level === "rest" || energy.level === "caution"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {energy.label}
                  </span>
                </div>
              </div>

              {/* Personal Transit Aspects */}
              {activeChart && topTransits.length > 0 && (
                <div className="mb-4 p-4 rounded-sm bg-primary/5 border border-primary/20">
                  <h4 className="mb-3 text-[11px] uppercase tracking-widest text-primary font-semibold">
                    Your Personal Transits
                  </h4>
                  <div className="space-y-3">
                    {topTransits.map((asp, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div 
                          className="flex items-center gap-1 text-sm font-medium shrink-0"
                          style={{ color: asp.color }}
                        >
                          <span>{getTransitPlanetSymbol(asp.transitPlanet)}</span>
                          <span>{asp.symbol}</span>
                          <span>{getTransitPlanetSymbol(asp.natalPlanet)}</span>
                          {asp.isExact && <span className="text-xs text-primary ml-1">EXACT!</span>}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span>Transit {asp.transitPlanet} {asp.aspect} natal {asp.natalPlanet} ({asp.orb}°)</span>
                            {asp.transitHouse && (
                              <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]" title={HOUSE_MEANINGS[asp.transitHouse]?.keywords}>
                                {asp.transitHouse}H
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-foreground mt-1">
                            {asp.interpretation}
                          </div>
                          {asp.houseOverlay && (
                            <div className="text-xs text-primary/70 mt-1 pl-2 border-l-2 border-primary/30">
                              {asp.houseOverlay}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Content */}
              <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
                <div className="rounded-sm bg-secondary p-4">
                  <h4 className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Daily Guidance
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground">{guidance}</p>
                  {mercuryRetro && (
                    <p className="mt-2 text-xs text-primary">
                      ☿℞ Mercury is retrograde - be patient with communications
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Notes & Reflections
                  </h4>
                  <Textarea
                    placeholder={journalPrompt}
                    value={dayNotes[dateKey] || ""}
                    onChange={(e) => saveDayNotes(dateKey, e.target.value)}
                    className="min-h-28 resize-y border-border bg-background font-sans text-sm focus:border-primary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
