import { Textarea } from "@/components/ui/textarea";
import {
  getPlanetaryPositions,
  getMoonPhase,
  isMercuryRetrograde,
  getEnergyRating,
  EnergyLevel,
} from "@/lib/astrology";

interface WeekViewProps {
  currentDate: Date;
  weekNotes: Record<string, string>;
  dayNotes: Record<string, string>;
  saveWeekNotes: (weekKey: string, notes: string) => void;
  saveDayNotes: (dateKey: string, notes: string) => void;
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

const getDailyGuidance = (
  moonPhase: { isBalsamic: boolean; phaseName: string },
  mercuryRetro: boolean,
  moonSign: string
): string => {
  if (moonPhase.isBalsamic) {
    return "Balsamic Moon - Time for rest, release, and spiritual preparation. Avoid starting new projects.";
  }
  if (mercuryRetro) {
    return "Mercury Retrograde - Review, revise, reconnect. Good for editing and reflection. Avoid contracts.";
  }
  if (moonPhase.phaseName === "New Moon") {
    return "New Moon - Perfect for setting intentions and planting seeds for new beginnings.";
  }
  if (moonPhase.phaseName === "Full Moon") {
    return "Full Moon - Peak energy for manifestation and completion. Emotions may run high.";
  }
  if (moonPhase.phaseName.includes("Waxing")) {
    return `Waxing Moon in ${moonSign} - Energy is building. Good for growth, expansion, and taking action.`;
  }
  return `Waning Moon in ${moonSign} - Time for release and letting go. Focus on completion.`;
};

export const WeekView = ({
  currentDate,
  weekNotes,
  dayNotes,
  saveWeekNotes,
  saveDayNotes,
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
                    placeholder="How are you feeling today? What happened? What are you grateful for?"
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
