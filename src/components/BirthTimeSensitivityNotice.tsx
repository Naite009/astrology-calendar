import { useMemo } from 'react';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildCuspSensitivityRecord, type CuspSensitivityRecord } from '@/lib/chartSignificance/cuspSensitivityRecord';
import { HOUSE_SYSTEM_LABELS } from '@/lib/placidusHouses';

export function BirthTimeSensitivityNotice({ chart, record }: { chart?: NatalChart; record?: CuspSensitivityRecord }) {
  const value = useMemo(() => record ?? (chart ? buildCuspSensitivityRecord(chart) : null), [chart, record]);
  if (!value) return null;
  const relevant = value.bodies.filter(b => b.crossings.length || b.cuspDistanceDegrees < 1);
  return (
    <aside aria-label="Birth-time house check" className="border-l-2 border-primary px-4 py-3 space-y-2 text-sm text-foreground">
      <h3 className="font-medium">Birth-time house check</h3>
      <p className="text-muted-foreground">{value.notice}</p>
      {value.systemUsed && <p className="text-xs text-muted-foreground">Checked in {HOUSE_SYSTEM_LABELS[value.systemUsed]}{value.systemUsed !== value.requestedSystem ? ` (fallback from ${HOUSE_SYSTEM_LABELS[value.requestedSystem]})` : ''}. {value.coordinates?.source === 'source-coordinates' ? 'Coordinates from the imported chart.' : 'Coordinates from the saved or resolved birthplace.'}</p>}
      {relevant.map(b => (
        <div key={b.body} className="space-y-1">
          <p>{b.warning}</p>
          <p className="text-xs text-muted-foreground">{b.body} is {b.cuspDistanceDegrees.toFixed(3)}° from cusp {b.nearestCusp}.{b.angleContacts.map(c => ` Separate angle conjunction: ${c.angle}, ${c.orbDegrees.toFixed(3)}° orb.`).join('')}</p>
          {b.crossings.map(c => <p key={c.direction} className="text-xs text-muted-foreground">Calculated boundary: {value.timezoneId ? new Intl.DateTimeFormat('en-US', { timeZone: value.timezoneId, year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }).format(c.utc) : c.utc.toISOString()}. {c.boundaryKind === 'rising-sign' ? 'Rising-sign boundary' : `Cusp ${c.cusp}`}, checked residual {c.residualDegrees.toFixed(6)}°. Calculated seconds do not establish the precision of the birth record.</p>)}
        </div>
      ))}
      {value.status === 'checked' && !relevant.length && <p className="text-xs text-muted-foreground">No major-planet alternate house was found inside this interval.</p>}
    </aside>
  );
}