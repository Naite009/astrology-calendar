import { X } from 'lucide-react';
import { DayData } from '@/lib/astrology';
import { UserData } from '@/hooks/useUserData';

interface DayDetailProps {
  dayData: DayData;
  userData: UserData | null;
  onClose: () => void;
}

export const DayDetail = ({ dayData, onClose }: DayDetailProps) => {
  const { date, planets, moonPhase, mercuryRetro, personalTransits, majorIngresses } = dayData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-6 top-6 text-muted-foreground transition-colors hover:text-foreground"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl mb-6">
          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>

        {/* Planetary Positions Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Planetary Positions</h3>
          <div className="grid grid-cols-2 gap-3">
            <PlanetItem symbol="☽" name="Moon" position={planets.moon.fullDegree} />
            <PlanetItem symbol="☉" name="Sun" position={planets.sun.fullDegree} />
            <PlanetItem symbol="☿" name={`Mercury ${mercuryRetro ? '℞' : ''}`} position={planets.mercury.fullDegree} />
            <PlanetItem symbol="♀" name="Venus" position={planets.venus.fullDegree} />
            <PlanetItem symbol="♂" name="Mars" position={planets.mars.fullDegree} />
            <PlanetItem symbol="♃" name="Jupiter" position={planets.jupiter.fullDegree} />
            <PlanetItem symbol="♄" name="Saturn" position={planets.saturn.fullDegree} />
            <PlanetItem symbol="♅" name="Uranus" position={planets.uranus.fullDegree} />
            <PlanetItem symbol="♆" name="Neptune" position={planets.neptune.fullDegree} />
            <PlanetItem symbol="♇" name="Pluto" position={planets.pluto.fullDegree} />
          </div>
        </div>

        {/* Moon Phase Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Moon Phase</h3>
          <p className="text-sm text-foreground">
            {moonPhase.phaseIcon} {moonPhase.phaseName} ({(moonPhase.illumination * 100).toFixed(0)}% illuminated)
          </p>
        </div>

        {/* Personal Transits Section */}
        {personalTransits.hasTransits && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Personal Transits to Your Chart</h3>
            <ul className="space-y-2">
              {personalTransits.transits.map((transit, i) => (
                <li key={i} className="rounded-sm bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{transit.icon}</span>
                    <span className="font-medium text-foreground">{transit.type}</span>
                    {transit.orb && (
                      <span className="text-[11px] text-muted-foreground">(orb: {transit.orb}°)</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{transit.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Major Ingresses Section */}
        {majorIngresses.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">⚡ Major Planetary Ingresses</h3>
            <ul className="space-y-2">
              {majorIngresses.map((ingress, i) => (
                <li key={i} className="rounded-sm bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ingress.icon}</span>
                    <span className="font-medium text-foreground">{ingress.planet} in {ingress.sign}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ingress.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Daily Guidance Section */}
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Daily Guidance</h3>
          <p className="text-sm leading-relaxed text-foreground">
            {moonPhase.isBalsamic && "Balsamic Moon - Focus on rest, release, and spiritual preparation for new cycles."}
            {mercuryRetro && !moonPhase.isBalsamic && "Mercury Retrograde - Review, revise, reconnect. Avoid signing contracts or starting major projects."}
            {!mercuryRetro && !moonPhase.isBalsamic && moonPhase.phaseName.includes('Waxing') && "Excellent time for growth and new initiatives. Energy is building."}
            {!mercuryRetro && !moonPhase.isBalsamic && !moonPhase.phaseName.includes('Waxing') && "Moderate energy day. Focus on completion and reflection."}
          </p>
        </div>
      </div>
    </div>
  );
};

const PlanetItem = ({ symbol, name, position }: { symbol: string; name: string; position: string }) => (
  <div className="flex justify-between items-center rounded-sm bg-secondary px-3 py-2">
    <div className="flex items-center gap-2">
      <span className="text-lg">{symbol}</span>
      <span className="text-sm text-muted-foreground">{name}</span>
    </div>
    <span className="text-sm font-medium text-foreground">{position}</span>
  </div>
);
