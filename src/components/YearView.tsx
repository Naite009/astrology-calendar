import { getMoonPhase } from "@/lib/astrology";

interface YearViewProps {
  year: number;
}

export const YearView = ({ year }: YearViewProps) => {
  const months = [];

  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(year, m, 1);
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const startDay = monthDate.getDay();

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m, d);
      const moonPhase = getMoonPhase(date);
      
      let extraClasses = "";
      if (moonPhase.phaseName === "Full Moon") {
        extraClasses = "bg-primary text-primary-foreground rounded-full";
      } else if (moonPhase.phaseName === "New Moon") {
        extraClasses = "border border-primary rounded-full";
      }

      days.push(
        <div
          key={d}
          className={`aspect-square flex items-center justify-center text-muted-foreground ${extraClasses}`}
        >
          {d}
        </div>
      );
    }

    months.push(
      <div key={m} className="rounded-sm bg-secondary p-4">
        <div className="mb-3 text-center font-serif text-lg font-medium text-foreground">
          {monthDate.toLocaleString("default", { month: "long" })}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-[10px]">{days}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {months}
    </div>
  );
};
