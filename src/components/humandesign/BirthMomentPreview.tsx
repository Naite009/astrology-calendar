import { useMemo } from 'react';
import { Clock, Globe, Calendar, AlertCircle } from 'lucide-react';
import { getTimezoneInfoForDate } from '@/lib/timezoneUtils';

interface BirthMomentPreviewProps {
  birthDate: string;
  birthTime: string;
  timezone: string;
}

export const BirthMomentPreview = ({
  birthDate,
  birthTime,
  timezone,
}: BirthMomentPreviewProps) => {
  const computedData = useMemo(() => {
    if (!birthDate || !birthTime || !timezone) return null;

    try {
      // Parse birth date and time components
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hours, minutes] = birthTime.split(':').map(Number);

      // Get timezone info for this date (DST-aware)
      const tzInfo = getTimezoneInfoForDate(timezone, birthDate);
      const offsetHours = tzInfo.offset;

      // Compute the UTC moment from the local birth time
      // Formula: UTC = local - offset (where offset is hours ahead of UTC)
      const localMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
      const utcMs = localMs - offsetHours * 60 * 60 * 1000;
      const utcDate = new Date(utcMs);

      // Format local birth moment
      const localDateStr = new Date(year, month - 1, day).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const localTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      // Format UTC moment
      const utcDateStr = utcDate.toISOString().slice(0, 10);
      const utcTimeStr = utcDate.toISOString().slice(11, 16);
      const utcFullStr = `${utcDateStr} ${utcTimeStr} UTC`;

      // Check if UTC date differs from local date (useful warning)
      const localDateKey = birthDate;
      const utcDateKey = utcDateStr;
      const dateDiffers = localDateKey !== utcDateKey;

      // Offset display
      const offsetSign = offsetHours >= 0 ? '+' : '';
      const offsetDisplay = `UTC${offsetSign}${offsetHours}`;

      return {
        localDateStr,
        localTimeStr,
        utcFullStr,
        utcTimeStr,
        utcDateStr,
        tzLabel: tzInfo.label,
        offsetDisplay,
        dateDiffers,
        isDST: tzInfo.label.includes('Daylight') || tzInfo.label.includes('Summer') || tzInfo.label.includes('DT'),
      };
    } catch (err) {
      console.error('[BirthMomentPreview] Error computing:', err);
      return null;
    }
  }, [birthDate, birthTime, timezone]);

  if (!computedData) return null;

  return (
    <div className="rounded border border-primary/30 bg-primary/5 p-4 space-y-3">
      <h4 className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
        <Clock size={12} />
        Birth Moment Preview
      </h4>

      <div className="grid grid-cols-1 gap-3 text-sm">
        {/* Local Birth Time */}
        <div className="flex items-start gap-3">
          <Calendar size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">
              {computedData.localDateStr}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {computedData.localTimeStr}
            </p>
            <p className="text-xs text-muted-foreground">
              {computedData.tzLabel}
            </p>
          </div>
        </div>

        {/* UTC Conversion */}
        <div className="flex items-start gap-3 pt-2 border-t border-border">
          <Globe size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Universal Time (UTC)
            </p>
            <p className="font-mono text-sm text-foreground">
              {computedData.utcFullStr}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Offset: {computedData.offsetDisplay}
            </p>
          </div>
        </div>

        {/* DST Notice */}
        {computedData.isDST && (
          <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 rounded px-2 py-1.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Daylight Saving Time was in effect (+1 hour from standard time)
            </span>
          </div>
        )}

        {/* Date Crossing Warning */}
        {computedData.dateDiffers && (
          <div className="flex items-start gap-2 text-xs text-accent-foreground bg-accent/50 rounded px-2 py-1.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Note: UTC date ({computedData.utcDateStr}) differs from local birth date due to timezone offset
            </span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Human Design calculations use this exact moment in UTC. The Design (unconscious) 
        layer is calculated 88° of solar arc earlier (~88 days before birth).
      </p>
    </div>
  );
};
