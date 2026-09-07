import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, AlertTriangle, ShieldCheck, CircleDashed, MinusCircle, Loader2, ChevronDown, ChevronUp, Clock, MapPin,
} from 'lucide-react';
import {
  verifyChartAgainstEphemerisAsync,
  formatPosition,
  formatDelta,
  describeLocalBirthTime,
  type BodyVerification,
  type ChartVerification,
  type VerifyPosition,
} from '@/lib/chartEphemerisVerify';
import {
  type BirthInput,
  type DstFold,
  type StoredPlaceMetadata,
  storedMetadataFromPlace,
} from '@/lib/birthDataNormalization';
import { placeFromCandidate, type PlaceCandidate } from '@/lib/geo/birthPlace';

interface ChartVerificationPanelProps {
  /** Birth date, time, place and any stored zone/coordinate metadata. */
  birth: BirthInput;
  planets?: Record<string, VerifyPosition | undefined>;
  houseCusps?: Record<string, VerifyPosition | undefined>;
  /** Copy a single calculated value into the form (only offered when inputs are trustworthy). */
  onApplyValue?: (body: string, position: VerifyPosition, opts?: { silent?: boolean }) => void;
  /** Copy a single calculated house cusp into the form. */
  onApplyCusp?: (house: string, position: VerifyPosition, opts?: { silent?: boolean }) => void;
  /** The place was resolved: persist zone id, coordinates and confidence on the record. */
  onPlaceResolved?: (meta: StoredPlaceMetadata) => void;
  /** User picked which reading of an ambiguous (fall-back) clock time applies. */
  onChooseFold?: (fold: DstFold) => void;
  /** User accepted the first valid clock time after a spring-forward gap. */
  onSuggestTime?: (time: string) => void;
}

const STATUS_STYLE: Record<string, { icon: React.ReactNode; text: string; row: string }> = {
  verified: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    text: 'Double verified',
    row: 'bg-emerald-500/5',
  },
  close: {
    icon: <ShieldCheck className="h-4 w-4 text-sky-600" />,
    text: 'Agrees within rounding',
    row: 'bg-sky-500/5',
  },
  mismatch: {
    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
    text: 'Does not match',
    row: 'bg-destructive/5',
  },
  missing: {
    icon: <CircleDashed className="h-4 w-4 text-amber-600" />,
    text: 'Not read from the file',
    row: '',
  },
  unavailable: {
    icon: <MinusCircle className="h-4 w-4 text-muted-foreground" />,
    text: 'Cannot be checked',
    row: '',
  },
};

const birthKey = (b: BirthInput): string =>
  JSON.stringify([
    b.birthDate, b.birthTime, b.birthLocation, b.timezoneId, b.latitude, b.longitude,
    b.placeName, b.placeConfidence, b.placeSource, b.dstFold, b.timezoneOffset, b.houseSystem, b.nodeVariant,
    b.sourceLatitude, b.sourceLongitude, b.sourceUniversalTime,
  ]);

const SOURCE_LABEL: Record<string, string> = {
  'source-coordinates': 'coordinates printed by the source',
  confirmed: 'confirmed by you',
  stored: 'saved on the chart',
  geocoder: 'place lookup',
  'offline-city': 'built-in city table',
  'offline-region': 'region only',
  manual: 'entered by hand',
};

const AuditRow: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="flex gap-2 py-0.5">
    <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
    <span className={`flex-1 break-words tabular-nums ${strong ? 'font-medium' : ''}`}>{value}</span>
  </div>
);

export const ChartVerificationPanel: React.FC<ChartVerificationPanelProps> = ({
  birth,
  planets,
  houseCusps,
  onApplyValue,
  onApplyCusp,
  onPlaceResolved,
  onChooseFold,
  onSuggestTime,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [showCusps, setShowCusps] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [autoFilledCount, setAutoFilledCount] = useState(0);
  const [report, setReport] = useState<ChartVerification | null>(null);
  const [loading, setLoading] = useState(false);

  const key = birthKey(birth);
  const planetsRef = useRef(planets);
  planetsRef.current = planets;
  const cuspsRef = useRef(houseCusps);
  cuspsRef.current = houseCusps;

  // Resolve place + zone (possibly via the geocoder) and recompute, debounced
  // so typing a birthplace does not fire a request per keystroke.
  useEffect(() => {
    if (!birth.birthDate) {
      setReport(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      verifyChartAgainstEphemerisAsync(
        { ...birth, planets: planetsRef.current, houseCusps: cuspsRef.current },
        { signal: controller.signal },
      )
        .then(r => { if (!controller.signal.aborted) setReport(r); })
        .catch(() => { /* aborted or offline; keep the previous report */ })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Re-compare (no re-resolution) when the entered values change.
  const enteredKey = JSON.stringify([planets, houseCusps]);
  useEffect(() => {
    if (!report?.moment) return;
    import('@/lib/chartEphemerisVerify').then(({ verifyChartWithMoment }) => {
      setReport(prev => (prev ? verifyChartWithMoment(prev.moment, { planets: planetsRef.current, houseCusps: cuspsRef.current }) : prev));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredKey]);

  // Persist resolved place metadata once per canonical place, so the record
  // carries zone id + coordinates and every later calculation agrees. An
  // ambiguous place is never persisted: it is a question, not an answer.
  // When stored metadata was rejected as stale (wrong same-name town saved
  // by an older resolver), the fresh place replaces it.
  const persistedPlaceRef = useRef<string>('');
  useEffect(() => {
    const place = report?.moment.place;
    if (!place || !onPlaceResolved) return;
    if (place.source === 'stored' || place.ambiguous) return;
    const sig = `${place.canonicalName}|${place.latitude}|${place.longitude}|${place.timezone}`;
    if (persistedPlaceRef.current === sig) return;
    const alreadyStored =
      typeof birth.latitude === 'number' && typeof birth.longitude === 'number' &&
      Math.abs(birth.latitude - place.latitude) < 1e-6 && Math.abs(birth.longitude - place.longitude) < 1e-6 &&
      birth.timezoneId === place.timezone;
    persistedPlaceRef.current = sig;
    if (!alreadyStored) onPlaceResolved(storedMetadataFromPlace(place));
  }, [report, onPlaceResolved, birth.latitude, birth.longitude, birth.timezoneId]);

  /** The user picked one of several same-name towns: persist it and recompute. */
  const choosePlace = (candidate: PlaceCandidate) => {
    if (!onPlaceResolved) return;
    const place = placeFromCandidate(birth.birthLocation || candidate.label, candidate);
    persistedPlaceRef.current = `${place.canonicalName}|${place.latitude}|${place.longitude}|${place.timezone}`;
    onPlaceResolved(storedMetadataFromPlace(place));
  };

  // Auto-fill: anything the scan never read gets the calculated value, but
  // only when the zone and instant are trustworthy (and, for angles, the
  // place is precise). Entered values are never touched.
  const filledRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!onApplyValue || !report || !report.canApplyBodies) return;
    const toFill = report.results.filter(
      r => r.status === 'missing' && r.computed && !filledRef.current.has(r.body) && (!r.isAngle || report.canApplyAngles),
    );
    if (!toFill.length) return;
    toFill.forEach(r => {
      filledRef.current.add(r.body);
      onApplyValue(r.body, r.computed!, { silent: true });
    });
    setAutoFilledCount(filledRef.current.size);
  }, [report, onApplyValue]);

  const audit = report?.audit ?? null;
  const localLine = useMemo(() => (report ? describeLocalBirthTime(report.moment) : ''), [report]);

  if (!birth.birthDate) return null;

  if (!report) {
    return (
      <Card className="border-border">
        <CardContent className="py-4 text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Resolving the birthplace and time zone...
        </CardContent>
      </Card>
    );
  }

  const problems = report.results.filter(r => r.status === 'mismatch' || r.retrogradeMismatch);
  const checked = report.results.filter(r => r.status === 'verified' || r.status === 'close');
  const missing = report.results.filter(r => r.status === 'missing');
  const blocked = !!report.blockedReason && report.readiness !== 'legacy-offset';

  const rows: BodyVerification[] = showAll
    ? report.results
    : [...problems, ...checked.slice(0, 6)];

  const renderRow = (r: BodyVerification, apply?: (body: string, p: VerifyPosition) => void, canApply?: boolean) => {
    const style = STATUS_STYLE[r.status] || STATUS_STYLE.unavailable;
    const isProblem = r.status === 'mismatch' || r.retrogradeMismatch;
    return (
      <div key={r.body} className={`px-3 py-2 text-xs ${isProblem ? STATUS_STYLE.mismatch.row : style.row}`}>
        <div className="flex items-center gap-2">
          {isProblem ? STATUS_STYLE.mismatch.icon : style.icon}
          <span className="font-medium w-36 truncate">{r.label}</span>
          <span className="flex-1 tabular-nums">
            {r.entered ? formatPosition(r.entered) : <span className="text-muted-foreground">not read</span>}
          </span>
          <span className="flex-1 tabular-nums text-muted-foreground">
            {r.computed ? formatPosition(r.computed) : '—'}
          </span>
          {r.deltaArcmin !== null && (
            <span className="w-14 text-right text-muted-foreground">{formatDelta(r.deltaArcmin)}</span>
          )}
        </div>
        {(isProblem || r.status === 'missing') && (
          <div className="pl-6 pt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              {r.retrogradeMismatch && r.status !== 'mismatch'
                ? 'The entry is marked retrograde but the ephemeris has it direct at that moment.'
                : r.status === 'missing'
                  ? (canApply ? 'The calculated value is available if you want it.' : 'Calculated for reference only; confirm the birthplace and time first.')
                  : `The ephemeris puts it at ${formatPosition(r.computed)}.`}
            </span>
            {apply && canApply && r.computed && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px]"
                onClick={() => apply(r.body, r.computed!)}
              >
                Use calculated value
              </Button>
            )}
          </div>
        )}
        {r.motionNote && (
          <div className="pl-6 pt-0.5 text-[10px] text-muted-foreground">{r.motionNote}</div>
        )}
        {r.note && r.status !== 'verified' && (
          <div className="pl-6 pt-0.5 text-[10px] text-muted-foreground">{r.note}</div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-serif flex items-center gap-2">
          <ShieldCheck size={16} />
          Independent ephemeris check
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </CardTitle>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Nothing is overwritten. The chart is recalculated from the birth date, time and place as local civil time,
          converted with the birthplace's historical time zone rules, then compared to what the scan or your typing produced.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Where and when, at a glance: this is what makes zone mistakes obvious. */}
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] space-y-1">
          <div className="flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <span className="font-medium">{localLine || birth.birthDate}</span>
              {audit && report.readiness !== 'legacy-offset' && (
                <span className="text-muted-foreground"> local, {audit.timezoneId} {audit.offsetAtBirth}</span>
              )}
              {audit && (
                <span className="text-muted-foreground"> {'\u2192'} {audit.utcDateTime}</span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              {report.moment.place && !report.moment.place.ambiguous ? (
                <>
                  <span className="font-medium">{report.moment.place.canonicalName}</span>
                  <span className="text-muted-foreground">
                    {' '}({audit?.coordinates ?? `${report.moment.place.latitude.toFixed(4)}, ${report.moment.place.longitude.toFixed(4)}`});{' '}
                    {SOURCE_LABEL[report.moment.place.source] || report.moment.place.source.replace('-', ' ')}, {report.moment.place.confidence} confidence
                  </span>
                </>
              ) : report.moment.place?.ambiguous ? (
                <span className="text-destructive">Birthplace ambiguous: {report.moment.placeCandidates.length} places share this name</span>
              ) : (
                <span className="text-destructive">Birthplace not resolved</span>
              )}
            </div>
          </div>
          {report.moment.sourceUtcCheck && (
            <div className="flex items-start gap-2">
              <ShieldCheck className={`h-3.5 w-3.5 mt-0.5 ${report.moment.sourceUtcCheck.matches ? 'text-emerald-600' : 'text-destructive'}`} />
              <div className="flex-1">
                <span className="text-muted-foreground">Source printed Univ.Time {report.moment.sourceUtcCheck.printed}: </span>
                <span className={report.moment.sourceUtcCheck.matches ? 'text-emerald-700 font-medium' : 'text-destructive font-medium'}>
                  {report.moment.sourceUtcCheck.matches
                    ? 'matches the zone conversion'
                    : `differs from the computed ${report.moment.sourceUtcCheck.computed} UTC by ${report.moment.sourceUtcCheck.differenceMinutes} min`}
                </span>
              </div>
            </div>
          )}
        </div>

        {report.warnings.length > 0 && (
          <ul className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-muted-foreground space-y-1 list-disc pl-6">
            {report.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        )}

        {blocked && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px] space-y-2">
            <p>{report.blockedReason}</p>
            {report.readiness === 'needs-fold' && report.foldCandidates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {report.foldCandidates.map(c => (
                  <Button key={c.fold} size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => onChooseFold?.(c.fold)} disabled={!onChooseFold}>
                    {c.fold === 'earlier' ? 'First reading' : 'Second reading'}: {c.label}
                  </Button>
                ))}
              </div>
            )}
            {report.readiness === 'nonexistent-time' && report.suggestedTime && (
              <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => onSuggestTime?.(report.suggestedTime!)} disabled={!onSuggestTime}>
                Use {report.suggestedTime}, the first clock time that existed
              </Button>
            )}
            {report.readiness === 'ambiguous-place' && report.moment.placeCandidates.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-muted-foreground">
                  Which one is it? Nothing is calculated until you choose. Largest first; small towns are further down the list.
                </p>
                <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
                  {report.moment.placeCandidates.map((c, i) => (
                    <Button
                      key={`${c.latitude},${c.longitude},${i}`}
                      size="sm"
                      variant="outline"
                      className="h-auto min-h-7 justify-start px-2 py-1 text-left text-[11px] font-normal whitespace-normal"
                      onClick={() => choosePlace(c)}
                      disabled={!onPlaceResolved}
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className="ml-2 text-muted-foreground">
                        {c.latitude.toFixed(3)}, {c.longitude.toFixed(3)} · {c.timezone}
                        {typeof c.population === 'number' && c.population > 0 ? ` · pop. ${c.population.toLocaleString()}` : ''}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!blocked && (
          <>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
                {checked.length} {report.readiness === 'legacy-offset' ? 'reference only' : 'verified'}
              </Badge>
              {problems.length > 0 && (
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  {problems.length} flagged
                </Badge>
              )}
              {missing.length > 0 && (
                <Badge variant="outline" className="border-amber-500/40 text-amber-700">
                  {missing.length} {report.canApplyBodies ? 'filling in' : 'not read'}
                </Badge>
              )}
              {autoFilledCount > 0 && (
                <Badge variant="outline" className="border-sky-500/40 text-sky-700">
                  {autoFilledCount} added from the ephemeris
                </Badge>
              )}
              {report.anglesReason && (
                <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                  angles not calculated
                </Badge>
              )}
            </div>

            {autoFilledCount > 0 && (
              <p className="rounded-md border border-sky-500/30 bg-sky-500/5 px-3 py-2 text-[11px] text-muted-foreground">
                Anything the file did not contain was calculated and filled in, so the chart is complete. Values that were
                read from your file or typed by hand are never replaced.
              </p>
            )}

            {report.anglesReason && (
              <p className="rounded-md border border-border px-3 py-2 text-[11px] text-muted-foreground">{report.anglesReason}</p>
            )}

            <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
              {rows.map(r => renderRow(
                r,
                onApplyValue ? (b, p) => onApplyValue(b, p) : undefined,
                r.isAngle ? report.canApplyAngles : report.canApplyBodies,
              ))}
            </div>

            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show only what matters' : `Show all ${report.results.length} bodies`}
            </Button>

            {report.cuspResults.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground"
                  onClick={() => setShowCusps(v => !v)}
                >
                  <span>House cusps ({audit?.houseSystem})</span>
                  {showCusps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showCusps && (
                  <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                    {report.cuspResults.map(r => renderRow(
                      r,
                      onApplyCusp ? (b, p) => onApplyCusp(b, p) : undefined,
                      report.canApplyAngles,
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {audit && (
          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground"
              onClick={() => setShowAudit(v => !v)}
            >
              <span>Audit trail</span>
              {showAudit ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showAudit && (
              <div className="rounded-md border border-border px-3 py-2 text-[11px]">
                <AuditRow label="Local birth time" value={audit.localDateTime} strong />
                <AuditRow label="Time precision" value={audit.timePrecision === 'second' ? 'to the second' : audit.timePrecision === 'minute' ? 'to the minute (seconds :00)' : 'unknown (noon used)'} />
                <AuditRow label="Birthplace" value={audit.place} strong />
                <AuditRow label="Coordinates" value={audit.coordinates} />
                <AuditRow label="Coordinate source" value={`${audit.coordinateSource}, ${audit.coordinateConfidence} confidence`} />
                <AuditRow label="Time zone" value={audit.timezoneId} strong />
                <AuditRow label="Offset at birth" value={audit.offsetAtBirth} strong />
                <AuditRow label="Zone source" value={audit.zoneSource} />
                <AuditRow label="UTC instant" value={audit.utcDateTime} strong />
                {audit.sourceUniversalTime && <AuditRow label="Source Univ.Time" value={audit.sourceUniversalTime} />}
                <AuditRow label="Engine" value={audit.engine} />
                <AuditRow label="Zodiac" value={audit.zodiac} />
                <AuditRow label="House system" value={audit.houseSystem} />
                <AuditRow label="Node" value={audit.nodeVariant} />
                <AuditRow label="Lilith" value={audit.lilithVariant} />
                <AuditRow label="Chiron and asteroids" value={audit.slowBodies} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartVerificationPanel;
