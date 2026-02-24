import { useMemo, useRef } from "react";
import { Download } from "lucide-react";
import { getMoonPhase } from "@/lib/astrology";
import { useDownloadImage } from "@/hooks/useDownloadImage";

interface MoonPhasesViewProps {
  year: number;
}

export const MoonPhasesView = ({ year }: MoonPhasesViewProps) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const containerRef = useRef<HTMLDivElement>(null);
  const { downloadAsImage } = useDownloadImage();

  const moonData = useMemo(() => {
    const data: { [key: string]: { emoji: string; name: string; isFull: boolean; isNew: boolean } } = {};
    
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const moonPhase = getMoonPhase(date);
        const key = `${month}-${day}`;
        data[key] = {
          emoji: moonPhase.phaseIcon,
          name: moonPhase.phaseName,
          isFull: moonPhase.phaseName === 'Full Moon',
          isNew: moonPhase.phaseName === 'New Moon'
        };
      }
    }
    
    return data;
  }, [year]);

  const getDaysInMonth = (monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  return (
    <div ref={containerRef} className="rounded bg-[#2C2C2C] p-6 md:p-10">
      <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
        <h2 className="text-center font-serif text-2xl font-light uppercase tracking-widest text-[#FDFBF7] md:text-3xl">
          {year} Moon Phases
        </h2>
        <button
          onClick={() => downloadAsImage(containerRef.current, `moon-phases-${year}`)}
          className="flex items-center gap-2 rounded-sm border border-[#D4A574]/50 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#D4A574] transition-colors hover:bg-[#D4A574]/10"
        >
          <Download size={14} />
          Download Image
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day headers */}
          <div className="mb-0.5 grid grid-cols-[60px_repeat(31,1fr)] gap-0.5">
            <div></div>
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className="text-center text-[9px] text-[#8B8B8B]">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Month rows */}
          {months.map((month, monthIndex) => (
            <div key={month} className="mb-0.5 grid grid-cols-[60px_repeat(31,1fr)] gap-0.5">
              <div className="flex items-center justify-center text-[10px] font-medium uppercase tracking-wider text-[#FDFBF7]">
                {month}
              </div>
              {Array.from({ length: 31 }, (_, day) => {
                const dayNum = day + 1;
                const daysInMonth = getDaysInMonth(monthIndex);
                
                if (dayNum > daysInMonth) {
                  return <div key={day} className="bg-transparent" />;
                }
                
                const key = `${monthIndex}-${dayNum}`;
                const data = moonData[key];
                
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-center rounded-sm p-1 text-sm md:p-2 md:text-base ${
                      data?.isFull
                        ? "bg-[#D4A574]/30"
                        : data?.isNew
                        ? "bg-[#2C2C2C]/80"
                        : "bg-white/5"
                    }`}
                    title={`${month} ${dayNum}: ${data?.name || ''}`}
                  >
                    <span className="text-[#D4A574]">{data?.emoji}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-[#8B8B8B]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌑</span>
          <span>New Moon</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌒</span>
          <span>Waxing Crescent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌓</span>
          <span>First Quarter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌔</span>
          <span>Waxing Gibbous</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌕</span>
          <span>Full Moon</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌖</span>
          <span>Waning Gibbous</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌗</span>
          <span>Last Quarter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌘</span>
          <span>Waning Crescent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌘</span>
          <span>Balsamic</span>
        </div>
      </div>
    </div>
  );
};
