import { X } from 'lucide-react';
import { DayData, formatTime } from '@/lib/astrology';
import { UserData } from '@/hooks/useUserData';

interface DayDetailProps {
  dayData: DayData;
  userData: UserData | null;
  onClose: () => void;
}

export const DayDetail = ({ dayData, userData, onClose }: DayDetailProps) => {
  const { date, moonData, mercuryStatus, personalTransits, vocData, energy } = dayData;
  const timezone = userData?.timezone || 'America/New_York';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl md:p-12"
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

        {/* Moon Position Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Moon Position</h3>
          <div className="space-y-2">
            <DetailItem label="Sign" value={`${moonData.name} ${moonData.sign}`} />
            <DetailItem label="Degree" value={`${moonData.degree}° ${moonData.sign}`} />
            <DetailItem label="Phase" value={`${moonData.phaseIcon} ${moonData.phaseName}`} />
            {moonData.fullMoon && (
              <DetailItem label="Full Moon" value={`${formatTime(moonData.fullMoon, timezone)} at ${moonData.fullMoonDegree}`} />
            )}
            {moonData.newMoon && (
              <DetailItem label="New Moon" value={`${formatTime(moonData.newMoon, timezone)} at ${moonData.newMoonDegree}`} />
            )}
            {moonData.nextChange && (
              <DetailItem label="Next Sign Change" value={formatTime(moonData.nextChange, timezone)} />
            )}
          </div>
        </div>

        {/* Void of Course Section */}
        {vocData && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Void of Course</h3>
            <div className="space-y-2">
              <DetailItem label="VOC Begins" value={formatTime(vocData, timezone)} />
              <DetailItem label="Ends" value={formatTime(moonData.nextChange, timezone)} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Avoid starting new projects. Good for reflection and completion.
            </p>
          </div>
        )}

        {/* Energy Rating Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Energy Rating</h3>
          <DetailItem label="Type" value={energy.label} />
          {moonData.isBalsamic && (
            <p className="mt-3 text-sm text-muted-foreground">
              Balsamic Moon - Time to rest, release, and prepare for new beginnings.
            </p>
          )}
          {mercuryStatus.isFavorable && !vocData && (
            <p className="mt-3 text-sm text-muted-foreground">
              Mercury favorable - Great for mental work, communication, and planning.
            </p>
          )}
        </div>

        {/* Personal Transits Section */}
        {personalTransits.hasTransits && (
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Personal Transits</h3>
            <ul className="space-y-2">
              {personalTransits.transits.map((transit, i) => (
                <li key={i} className="rounded-sm bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{transit.icon}</span>
                    <span className="font-medium text-foreground">{transit.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{transit.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Guidance Section */}
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Guidance for the Day</h3>
          <p className="text-sm leading-relaxed text-foreground">
            {moonData.isBalsamic && "Focus on rest and introspection. This is not a time for new beginnings but for closing chapters and preparing for renewal."}
            {vocData && !moonData.isBalsamic && "The Moon is void of course - avoid important decisions or starting new ventures. Use this time for routine tasks and reflection."}
            {mercuryStatus.isFavorable && !moonData.isBalsamic && !vocData && "Excellent day for mental work, communication, and planning. Your mind is sharp and clear."}
            {!moonData.isBalsamic && !vocData && !mercuryStatus.isFavorable && "A moderate energy day. Focus on maintaining balance and attending to ongoing matters."}
          </p>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);
